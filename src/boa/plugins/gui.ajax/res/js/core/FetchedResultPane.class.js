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
 * The Search Engine abstraction.
 */
Class.create("FetchedResultPane", FilesList, {

    _rootNode : null,
    _dataLoaded : false,

	/**
	 * Constructor
	 * @param $super klass Superclass reference
	 * @param mainElementName String
	 * @param appOptions Object
	 */
	initialize: function($super, mainElementName, appOptions)
	{

        var dataModel = new DataModel(true);
        var rNodeProvider = new RemoteNodeProvider();
        dataModel.setManifestNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(appOptions.nodeProviderProperties);
        this._rootNode = new ManifestNode("/", false, "Results", "folder.png", rNodeProvider);
        dataModel.setRootNode(this._rootNode);
        $super($(mainElementName), {
            dataModel:dataModel,
            columnsDef:[{attributeName:"APP_label", messageId:1, sortType:'String'},
                {attributeName:"filename", messageString:'Path', sortType:'String'},
                {attributeName:"is_file", messageString:'Type', sortType:'String', defaultVisibility:'hidden'}
            ],
            displayMode: 'detail',
            fixedDisplayMode: 'detail',
            defaultSortTypes:["String", "String", "String"],
            columnsTemplate:"search_results",
            selectable: true,
            draggable: false,
            replaceScroller:true,
            fit:'height',
            detailThumbSize:22
        });

        dataModel.observe("selection_changed", function(){
            if(!this._dataLoaded) return;
             var selectedNode = this._dataModel.getSelectedNodes()[0];
             if(selectedNode) app.goTo(selectedNode);
         }.bind(this));

        document.observe("app:repository_list_refreshed", function(){
            this._rootNode.clear();
            this._dataLoaded = false;
            if(this.htmlElement && this.htmlElement.visible()){
                this.showElement(true);
            }
        }.bind(this));

        this.hiddenColumns.push("is_file");
        this._sortableTable.sort(2, false);

        mainElementName.addClassName('class-FetchedResultPane');

        if(appOptions.reloadOnServerMessage){
            app.observe("server_message", function(event){
                var newValue = XPathSelectSingleNode(event, appOptions.reloadOnServerMessage);
                if(newValue && this._dataLoaded){
                    this._rootNode.clear();
                    this._dataLoaded = false;
                    if(this.htmlElement && this.htmlElement.visible()){
                        this._dataModel.requireContextChange(this._rootNode, true);
                        this._dataLoaded = true;
                    }
                }
            }.bind(this));
        }

    },


	/**
	 * Show/Hide the widget
	 * @param show Boolean
	 */
	showElement : function(show){
		if(!this.htmlElement) return;
		if(show && !this._dataLoaded) {
            // Load root node and trigger refresh event
            this._dataModel.requireContextChange(this._rootNode, true);
            this._dataLoaded = true;
        }
        if(show) this.htmlElement.show();
        else {
            this._dataModel.setSelectedNodes($A());
            this.htmlElement.hide();
        }
	},

    getActions : function(){

    }

});