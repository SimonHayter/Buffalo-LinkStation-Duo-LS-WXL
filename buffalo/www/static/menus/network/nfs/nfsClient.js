 var confirmWindow ;
 
function nfsClient_createMainForm() {
	// initalize volume.  The values will be obtained from the front grid. Global.
	DISK_LIST = new Array;
	var newClientBtn = new Ext.Button({
		id: 'newClientBtn',
		name: 'newClientBtn',
		iconCls: 'add',
		disabled: true,
		text: S('net_settings_nfs_client_newClient'),
		listeners: {click: function(){ nfsClient_addBtnHandler('newFold'); }}
	}); 
	 
	var delClientBtn = new Ext.Button({
		id: 'delClientBtn',
		name:'delClientBtn',
		iconCls: 'delete',
		disabled: true,
		text: S('net_settings_nfs_client_delClient'),
		handler: function(){
 
		  
		  var emptyList = false;
		  var selectedRecords;
		  var ipList;
		  var msg ='';
		  var buttons;
		  var title;
		  var icon;
		  
		  //get data from grid2
		//	usersGrid = Ext.getCmp('usersGrid');
		  selModel = grid.getSelectionModel();
		  selectedRecords = selModel.getSelections(); // returns an array of selected records
		  
		  //convert data array into a json string
		  var delList = new Array(); 
		  for(var i=0; i<selectedRecords.length; i++){
			delList [i] = selectedRecords[i].data.clientName; 
		  }
		  
		  var delList_jsonFormat = Ext.util.JSON.encode(delList);
		   Ext.MessageBox.show({
			title: S('warning_box_title'),
			msg: S('net_settings_nfs_client_del_warning'),
			buttons: Ext.MessageBox.OKCANCEL,
			icon: Ext.MessageBox.WARNING,
			fn: function( btn ){nfsClient_deleteBtnHandler(nfsClientForm, delList_jsonFormat, btn);}
		  });

		}
	 });
 
	var sm = new Ext.grid.CheckboxSelectionModel({
	
	listeners: {
	  rowselect: function(sm, rowIndex, rec) {
		  delClientBtn.enable();
		},
	  rowdeselect: function(){
		if(sm.getCount() == 0) delClientBtn.disable();
	  }
	  }
	}); 
	var cm = new Ext.grid.ColumnModel([
		sm,
		{ id: "clientName", 
		  header: S('net_settings_nfs_client_grid_name'), 
		  dataIndex: "clientName", 
		  direction: "ASC",
			sortable: true
		  
		},{ 
		  id: 'clientIp',
		  header: S('net_settings_nfs_client_grid_ip'), 
		  dataIndex: 'clientIp',
			sortable: true
		}
	]);
	
	var gridView = new Ext.grid.GridView({
		autoFill: true
	});
	
 //   cm.setRenderer(0, hideCheckbox_usb); 
	var jsonStore = new Ext.data.JsonStore({
	  root: 'data',
	  url: '/dynamic.pl',
	  baseParams:{bufaction: BUFACT_GET_NFS_CLIENTS},
	  fields: [{name: 'clientName'},
			   {name: 'clientIp'}]
	});
	
	var searchComboStore = new Ext.data.SimpleStore({
	  fields: [{name: 'name'}, //option
			   {name: 'value'} //value
			  ]
	});
	
	var searchbox = new Ext.form.ComboBox({
	 // id: ID_SH_FOLD_TOP_SEARCH_COMBO,
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
	
	var toolbar  = new Ext.Toolbar({
	  autoHeight: true,
	  items: ['->',S('searchBox_find'),' ',searchbox],
	  frame: true
	});
	
	var grid = new Ext.grid.GridPanel({
		id: ID_NFS_CLIENT_MAIN_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 635,
	   // autoHeight: true,
		height: 150,
		view: gridView,
		enableHdMenu: false,
		enableColumnMove : false,
		//tbar: toolbar,
		stripeRows: true,
		frame: true,
		autoExpandColumn: 'clientName'
	});
	
	jsonStore.load({
	 callback: function(r, opt, success){
			var result = jsonStore.reader.jsonData.success;
			if(result){
				newClientBtn.enable();
				// update_combo_search(grid, searchbox, 'clientName');
			}
			else{				
				formFailureFunction();
			}
		}
	});	
 // ....: Create nfsClientForm FORM and add ITEMS  :....
	var nfsClientForm = new Ext.FormPanel({
		frame: false,
		bodyBorder: false,
		id: ID_NFS_CLIENT_SETTINGS_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [
		  { layout: 'form',
			buttonAlign:'left',
			buttons:[newClientBtn, delClientBtn]
		  },
		  grid
		],
		listeners:{
				expand: function(){
					gridView.refresh();
				}
			},
		title: S('net_settings_nfs_clientTitle'),
		collapsed : true,
		titleCollapse: true,
		collapsible: true,
		animCollapse: false
	});  
 return nfsClientForm;
}

function nfsClient_deleteBtnHandler(nfsForm, delList_jsonFormat, btn){
 if( btn == 'ok' ) {   

  nfsForm.form.submit({
	url: '/dynamic.pl', 
	params: {bufaction: ID_NFS_CLIENT_DEL, delList: delList_jsonFormat},
	waitMsg: S('msg_deleting_data'),
	failure:function(form,action){
	},
	//failure:function(form,action) {formFailureFunction(action);},
	success:function(form,action) {
		  resetCookie();
		  var nfsClient = Ext.getCmp(ID_NFS_CLIENT_MAIN_GRID);
		//	var searchbox = Ext.getCmp(ID_USR_GRP_TOP_SEARCH_COMBO);
		  
		  var jsonStore = nfsClient.getStore();
		  selModel = nfsClient.getSelectionModel();
		  selectedRecords = selModel.getSelections();
			 
		  // remove the records selected from grid 
		  for(var i=0; i<selectedRecords.length; i++)
			jsonStore.remove(selectedRecords[i]);
		  
			Ext.getCmp('delClientBtn').disable();
		 // update_combo_search(nfsClient, searchbox, 'userName');
	}
  });
 }
}

function nfsClient_addBtnHandler(id) {

var clientName = new Ext.form.TextField({
	fieldLabel: S('net_settings_nfs_client_name'),
	id: 'clientName',
	name: 'clientName',
	width: 250,
	maxLength: 15,
	allowBlank: false
  });
  
  var clientIp = new Ext.form.TextField({
	fieldLabel: S('net_settings_nfs_client_ip'),
	name: 'clientIp',
	id: 'clientIp',
	width: 250,
	maxLength: 15,
	minLength: 7,
	allowBlank: false
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
	},	[{name: 'clientName'},
		{name: 'clientIp'}]
  );

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function(f){
			nfsClient_saveHandler(nfsClient_editForm);
		}
	  }); 
 
   var cancelBtn = new Ext.Button({
	  text: S('btn_cancel'),
	  handler: function(){
		nfsClient_cancelHandler(nfsClient_editForm);
	  }
	});  

	var mainNfsFoldersForm = Ext.getCmp(ID_NFS_CLIENT_SETTINGS_FORM);
	mainNfsFoldersForm.destroy();

	var nfsClient_editForm = new Ext.FormPanel({
	  hideTitle: true,
	  frame: false,
	  id: ID_NFS_CLIENT_SETTINGS_FORM,
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
	  title: S('net_settings_nfs_clientTitle'),
	  errorReader: jErrReader,	
	  buttons: [saveBtn,cancelBtn],
	  buttonAlign: 'left',
	  items: [{
	  				cls : 'column-custBorders',
					layout:'form',
					html:'<b class="title">' + S('net_settings_nfs_client_newTitle') + '</b><b class="subtitle">'+ S('net_settings_nfs_client_newSubtitle') + '</b><br><br>'
				  },clientName, clientIp]
  });

	insertToCentralContainer(NETWORK_RENDER_TO, nfsClient_editForm, nfsClientRenderBefore);
};

function nfsClient_saveHandler(editForm){
	editForm.form.submit({
		url:'/dynamic.pl',
		params:{
			bufaction: ID_NFS_CLIENT_ADD
		}, 
		waitMsg: S('msg_saving_data'),
		success: function(){
			resetCookie();
 			editForm.destroy();
			var mainClientForm  = nfsClient_createMainForm();
			insertToCentralContainer(NETWORK_RENDER_TO, mainClientForm, nfsClientRenderBefore);
		 mainClientForm.expand(false);
		},
		failure: function(form, action){ formFailureFunction(action); }
  });
}

function nfsClient_cancelHandler(editForm){
	editForm.destroy();
	var mainClientForm = nfsClient_createMainForm();
	insertToCentralContainer(NETWORK_RENDER_TO, mainClientForm, nfsClientRenderBefore);
	 mainClientForm.expand(false);
}
