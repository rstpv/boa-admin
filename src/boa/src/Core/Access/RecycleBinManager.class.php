<?php
// This file is part of BoA - https://github.com/boa-project
//
// BoA is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// BoA is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with BoA.  If not, see <http://www.gnu.org/licenses/>.
//
// The latest code can be found at <https://github.com/boa-project/>.
 
/**
 * This is a one-line short description of the file/class.
 *
 * You can have a rather longer description of the file/class as well,
 * if you like, and it can span multiple lines.
 *
 * @package    [PACKAGE]
 * @category   [CATEGORY]
 * @copyright  2017 BoA Project
 * @license    https://www.gnu.org/licenses/agpl-3.0.html GNU Affero GPL v3 or later
 */
namespace BoA\Core\Access;

defined('BOA_EXEC') or die( 'Access not allowed');
/**
 * Recycle bin actions manager. Utilitaries to check whether the current dir is the recycle bin,
 * and to filter the actions accordingly : transform an item deletion into a move into the recycle folder, etc.
 * @package BoA
 * @subpackage Core
 */
class RecycleBinManager
{
	private static $rbmRecycle;
	private static $rbmRelativeRecycle;    
	
	public static function recycleEnabled(){
		return (isSet(self::$rbmRecycle) && self::$rbmRecycle != null && is_string(self::$rbmRecycle));
	}
	
    /**
     * Initialize manager
     * @static
     * @param $repositoryWrapperURL
     * @param $recyclePath
     * @return void
     */
	public static function init($repositoryWrapperURL, $recyclePath)
	{
		self::$rbmRecycle = $repositoryWrapperURL.$recyclePath;
		self::$rbmRelativeRecycle = $recyclePath;
	}
	/**
     * Get the recycle bin path (repository URL included)
     * @static
     * @return string
     */
	public static function getRecyclePath(){
		return self::$rbmRecycle ;
	}
	/**
     * Get the recycle bin path (from the root of the repository)
     * @static
     * @return string
     */
	public static function getRelativeRecycle(){
		return self::$rbmRelativeRecycle;
	}
	/**
     * Is the current path the recycle?
     * @static
     * @param string $currentLocation PATH from the root of repo
     * @return bool
     */
	public static function currentLocationIsRecycle($currentLocation){
		return ($currentLocation == self::$rbmRelativeRecycle);
	}
	/**
     * Transform delete/restore actions into move actino
     * @static
     * @param string $action
     * @param UserSelection $selection
     * @param string $currentLocation
     * @param array $httpVars
     * @return array
     */
	public static function filterActions($action, $selection, $currentLocation, $httpVars = array()){
		if(!self::recycleEnabled()) return array();
		$newArgs = array();

		// FILTER ACTION FOR DELETE
		if($action == "delete" && !self::currentLocationIsRecycle($currentLocation) && !isSet($httpVars["force_deletion"]))
		{
			$newArgs["action"] = "move";
			$newArgs["dest"] = self::$rbmRelativeRecycle;
		}
		// FILTER ACTION FOR RESTORE
		if($action == "restore" && self::currentLocationIsRecycle($currentLocation))
		{
			$originalRep = self::getFileOrigin($selection->getUniqueFile());
			if($originalRep != "")
			{
				$newArgs["action"] = "move";
				$newArgs["dest"] = $originalRep; // CHECK UTF8 HANDLING HERE
			}
		}
		return $newArgs;
		
	}
	/**
     * Get the file for caching recylce metadata
     * @static
     * @return string
     */
	public static function getCacheFileName()
	{
		return ".recycle_cache.ser";
	}
	/**
     * Update metadata
     * @static
     * @param string $originalFilePath
     * @return void
     */
	public static function fileToRecycle($originalFilePath)
	{
		$cache = self::loadCache();
		$cache[basename($originalFilePath)] = str_replace("\\", "/", dirname($originalFilePath));
		self::saveCache($cache);
	}

    /**
     * Update metadata
     * @static
     * @param $filePath
     * @return void
     */
	public static function deleteFromRecycle($filePath)
	{
		$cache = self::loadCache();
		if(array_key_exists(basename($filePath), $cache))
		{
			unset($cache[basename($filePath)]);
		}
		self::saveCache($cache);		
	}
	/**
     * Use metadata for getting original location
     * @static
     * @param $filePath
     * @return string
     */
	public static function getFileOrigin($filePath)
	{
		$cache = self::loadCache();
		if(is_array($cache) && array_key_exists(basename($filePath), $cache))
		{
			return $cache[basename($filePath)];
		}
		return "";
	}
	/**
     * Load the metadata cache
     * @static
     * @return array|mixed|null
     */
	public static function loadCache(){
		$result = array();
		if(!self::recycleEnabled()) return null;
		$cachePath = self::getRecyclePath()."/".self::getCacheFileName();
		$fp = @fopen($cachePath, "r");
		if($fp){
			$s = "";
			while(!feof($fp)){
				$s .= fread($fp, 4096);
			}
			fclose($fp);
			$result = unserialize($s);
		}		
		return $result;
	}
	/**
     * Save the metadata cache
     * @static
     * @param $value
     * @return null
     */
	public static function saveCache($value){
		if(!self::recycleEnabled()) return null;
		$cachePath = self::getRecyclePath()."/".self::getCacheFileName();
		$fp = fopen($cachePath, "w");
		if($fp){
			fwrite($fp, serialize($value));
			fflush($fp);
			fclose($fp);
		}
	}
	
}
?>