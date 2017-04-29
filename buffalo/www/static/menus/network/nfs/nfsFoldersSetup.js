var confirmWindow ;

function nfs_folders_createMainForm() { 

    // initalize volume.  The values will be obtained from the front grid. Global.
    DISK_LIST = new Array;
    var shareStatus = new Ext.Button({
        id: 'shareStatus',
        name: 'shareStatus',
        disabled: true,      
        text: S('net_settings_nfs_btn_enable'),
        listeners: {click: function(){ 
			shareStatus_btnHandler('on'); 
		}}
    }); 
     
    var sm = new Ext.grid.CheckboxSelectionModel(); 
    var cm = new Ext.grid.ColumnModel([
   
        { id: "shareName", 
          header: S('net_settings_nfs_folder_shareName') , 
          dataIndex: "shareName", 
          direction: "ASC",
		  renderer: nfs_shareName,
		  sortable: true
        },{
          header: S('net_settings_nfs_folder_nfs'),
          id: 'shareStatus',
		  dataIndex: 'shareStatus', 
         renderer: nfs_rendershareStatus,
			sortable: true
       },{ 
		  id: 'path',
          header: S('net_settings_nfs_folder_path'), 
        dataIndex: 'path',
		  sortable: true
        }
    ]);
    
	var gridView = new Ext.grid.GridView({
		autoFill: true
	});
    
	
    var jsonStore = new Ext.data.JsonStore({
      root: 'data',
      baseParams:{bufaction: BUFACT_GET_NFS_SHFOLD_SETTINGS},
      url: '/dynamic.pl',
      fields: [{name: 'shareName'}, 
               {name: 'shareStatus'}, 
               {name: 'shareDesc'}, 
               {name: 'path'}
			  ]
    });
    
    var searchComboStore = new Ext.data.SimpleStore({
      fields: [{name: 'name'}, //option
               {name: 'value'}//value
              ]
    });
    
    var searchbox = new Ext.form.ComboBox({
      id: ID_NFS_TOP_SEARCH_COMBO,
      hideLabel: true,
      allowBlank:true,
      editable: true,
      store: searchComboStore,
      selectOnFocus: true,
      displayField:'value',
      valueField: 'name',
      typeAhead: true,
      mode: 'local',
      hideTrigger: true,
      listWidth:110,
      width:110,
      listeners: { 
        select: function(c, r, i) {
          var gridIndex = r.get('name');
          var sm = grid.getSelectionModel();
          sm.selectRow(gridIndex, false); // (index, keepSelected)
          grid.getView().focusRow(gridIndex);
          c.clearValue();
        }
      }	
    });
    
    var toolbar  =  new Ext.Toolbar({
      autoHeight: true,
	   autoWidth: true,
      items: [new Ext.Toolbar.Spacer(),S('searchBox_find'),' ',searchbox],
      frame: true
    });
    var grid = new Ext.grid.GridPanel({
        id: ID_NFS_FOLDER_MAIN_GRID,     
        store: jsonStore,
        cm: cm,
        selModel: sm,
         width:638,
       // autoHeight: true,
        height: 90,
		view: gridView,
        enableHdMenu: false,
        enableColumnMove : false,
      //  tbar: toolbar,
        stripeRows: true,
        frame: true,
		autoExpandColumn :'path'
	});      
    
    jsonStore.load({
     callback: function(r, opt, success){
			var result = jsonStore.reader.jsonData.success;
			if(result){
				nfs_folders_jsonData = r;
			}
			else{				
				formFailureFunction();
			}
		}

    });  
	    var nfsFoldersForm = new Ext.FormPanel({
         id: ID_NFS_FOLDER_SETTINGS_FORM,
		 animCollapse: false,
       //  itemCls: 'display-label',
       //  cls : 'panel-custBorders',
         //ctCls: 'toggle-button-left',
         collapsible: true,
         autoHeight: true,
         width: 640,
         labelWidth: 160, 
         title: S('net_settings_nfs_folderTitle'),
         buttonAlign: 'left',
	     items: [ grid ],
      //   collapsedFirst: true,
			listeners:{
				expand: function(){
					gridView.refresh();
				}
			},
         collapsed : true,
		titleCollapse: true
    });
	
	return nfsFoldersForm;
}
  
  
function nfs_shareName(value, meta, record, rowIndex){

  //return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='nfs_editSharedFolder(\"{1}\");'>{0} </a></b>", value, rowIndex);
  return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='nfs_editSharedFolder(\"{0}\");'>{0} </a></b>", value);
}     

//function nfs_editSharedFolder(rowIndex){
function nfs_editSharedFolder(value){
  	 var nfsGrid = Ext.getCmp(ID_NFS_FOLDER_MAIN_GRID);
	 var sm = nfsGrid.getSelectionModel();
	 var record = sm. getSelected();
    
  var nfsShareName = new Ext.form.TextField({
    fieldLabel: S('net_settings_nfs_folder_shareName'),
    id: 'nfsShareName',
    name:'shareName',
    width: 250,
	itemCls:'display-label',
	readOnly: true
  });
  
  var nfsShareDesc = new Ext.form.TextField({
    fieldLabel: S('net_settings_nfs_folder_desc'),
    name:'shareDesc',
    id: 'nfsShareDesc',
    width: 250,
    itemCls:'display-label',
	 readOnly: true
	
//	disabled: true
  });
  
   var nfsPath = new Ext.form.TextField({
    fieldLabel: S('net_settings_nfs_folder_path'),
    name:'path',
    id: 'nfsPath',
    width: 250,
    itemCls:'display-label',
	 readOnly: true
  });

  var enableNfs = new Ext.form.Radio({
    boxLabel: S('net_settings_nfs_btn_enable'),
    name: 'shareStatus',
    id: 'enableNfs',
    inputValue: 'on',
    hideLabel: true
  });
      
  var disableNfs = new Ext.form.Radio({
    boxLabel: S('net_settings_nfs_btn_disable'),
    name: 'shareStatus',
    id: 'disableNfs',
    inputValue: 'off',
    hideLabel: true
  });
      
  var jErrReader = new Ext.data.JsonReader( {
    root: 'errors',
    successProperty: 'success'
    }, [
    {name: 'id'},
    {name: 'msg'}
	]);
	
	var jReader =  new Ext.data.JsonReader({
    root: 'data'
    },  {name: 'shareName'},
		{name: 'shareStatus'},
		{name: 'shareDesc'},
		{name: 'path'}
  ); 
	var saveBtn = new Ext.Button({
	    text: S('btn_save'),
	    handler: function(f){
			nfs_saveHandler(nfs_editForm);
		}
	  }); 
                                      
 
   var cancelBtn = new Ext.Button({
      text: S('btn_cancel'),
      handler: function(){
		nfs_cancelHandler(nfs_editForm);
      }
    });  

	
	// important to be here!! Deletes the display form, same id is needed for display and edit form
	var mainNfsFoldersForm = Ext.getCmp(ID_NFS_FOLDER_SETTINGS_FORM);
	mainNfsFoldersForm.destroy();
	// ----------------------------------
	var nfs_editForm = new Ext.FormPanel({
      hideTitle: true,
      frame: false,
      id: ID_NFS_FOLDER_SETTINGS_FORM,
      width: 640,
      autoHeight: true,
      labelAlign: 'left',
      labelWidth: 160,
	  animCollapse: false,
      //itemCls: 'display-label',
      cls : 'panel-custBorders',
      collapsible: true,
	  collapsedFirst: true,
	  titleCollapse: true,
      reader : jReader,
	  title: S('net_settings_nfs_folderTitle'),
      errorReader: jErrReader,  
	  buttons: [saveBtn,cancelBtn],
	  buttonAlign: 'left',
      items: [//{id: 'shared_folders_label',
               // html: '<a onClick="shFolders_processAuth();">Shared Folders</a> : <b>'+ id +'</b>'}, {html: '&nbsp'}, 
                nfsShareName, nfsShareDesc, nfsPath,
                {layout: 'column',
				 cls : 'column-custBorders',
                 items:[{
                    layout:'form',
                     columnWidth: .27,
                    items:[{html:'<p class="label">' + S('net_settings_nfs_folder_nfs') + ':</p>'}]
                  },{
                    layout:'form',
                    columnWidth: .15,
                    items:[enableNfs]
                  },{
                    layout:'form',
                    columnWidth: .20,
                    items:[disableNfs]
                 }]}
			]
  });

	insertToCentralContainer(NETWORK_RENDER_TO, nfs_editForm, nfsFoldersRenderBefore);

//	nfs_editForm.form.loadRecord(nfs_folders_jsonData[latestIndex]);
//	nfs_radio_edit(nfs_folders_jsonData[latestIndex]);
	nfs_editForm.form.loadRecord(record);
	nfs_radio_edit(record);

}
function nfs_rendershareStatus(value, cell, record){
  if(value == 'on') return String.format('<img src='+ IMAGE_CHECK_MARK +' />'); 
  else return String.format('<img src= '+ IMAGE_CROSS +' />'); 
}

function nfs_cancelHandler(editForm){
	editForm.destroy();
	displayGridForm = nfs_folders_createMainForm();
	insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, nfsFoldersRenderBefore);
	displayGridForm.expand(false);
}

function nfs_saveHandler(editForm){
	editForm.form.submit({
	    url:'/dynamic.pl',
	    params:{
	      bufaction: BUFACT_SET_NFS_SHFOLD_SETTINGS
	    }, 
	   waitMsg: S('msg_saving_data'),
	    success: function(){
	      resetCookie();
		  editForm.destroy();
	      displayGridForm = nfs_folders_createMainForm();
	      insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, nfsFoldersRenderBefore);
		  displayGridForm.expand(false);
	     },
	    failure: function(form, action){ formFailureFunction(action); }
  });
  
}

function nfs_radio_edit(nfs_folders_jsonData){
	var nfs_service_status = nfs_folders_jsonData.get('shareStatus');
	if(nfs_service_status == 'on'){
		Ext.getCmp('enableNfs').setValue(true);
	}
	else{
		Ext.getCmp('disableNfs').setValue(true);
	}
}