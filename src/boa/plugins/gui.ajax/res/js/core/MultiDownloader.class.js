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

/**
 * Where ZIP is not enabled, this class will create a simple pane for Ajax/HTML multiple downloads
 */
 Class.create("MultiDownloader", {
	
	 /**
	  * Constructor
	  * @param list_target HTMLElement
	  * @param downloadUrl String
	  */
	initialize : function( list_target, downloadUrl ){

		this.list_target = list_target;
		this.count = 0;
		this.id = 0;
		this.downloadUrl = downloadUrl;

	},
	
	/**
	 * Sets the dl url base
	 * @param downloadUrl String
	 */
	setDownloadUrl : function(downloadUrl){
		this.downloadUrl = downloadUrl;
	},
	
	/**
	 * Add a new row to the list of files
	 */
	addListRow : function( fileName, label )
	{

		this.count ++;
		// Row div
		var new_row = new Element( 'div' );

		var new_row_button = new Element('a');
		new_row_button.href= this.downloadUrl + fileName;		
		new_row_button.insert('<img src="'+resourcesFolder+'/images/actions/16/download_manager.png" height="16" width="16" align="absmiddle" border="0"> '+(label?label:getBaseName(fileName)));

		new_row_button.multidownloader = this;
		
		// Delete function
		new_row_button.onclick= function()
		{
			// Remove this row from the list
			this.parentNode.parentNode.removeChild( this.parentNode );
			this.multidownloader.count --;
			if(this.multidownloader.count == 0 && this.multidownloader.triggerEnd)
			{
				this.multidownloader.triggerEnd();
			}
			gaTrackEvent("Data", "Download", fileName);
		};
		
		new_row.insert(new_row_button);
		
		// Add it to the list
		$(this.list_target).insert( new_row );
		
	},
	
	/**
	 * Clear list
	 */
	emptyList : function()
	{
		
	},
	
	/**
	 * Add a "loading" image on top of the component
	 */
	setOnLoad: function()	{
		if(this.loading) return;
		addLightboxMarkupToElement(this.list_target);
		var img = new Element('img', {
			src : resourcesFolder+'/images/loadingImage.gif'
		});
		var overlay = $(this.list_target).down("#element_overlay");
		overlay.insert(img);
		img.setStyle({marginTop : Math.max(0, (overlay.getHeight() - img.getHeight())/2) });
		this.loading = true;
	},
	/**
	 * Remove the loading image
	 */
	removeOnLoad: function(){
		removeLightboxFromElement(this.list_target);
		this.loading = false;
	}	

});