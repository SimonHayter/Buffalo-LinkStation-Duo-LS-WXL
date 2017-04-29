function shFolders_addGrid_front(shareId, type){
  var permissionsList;
  var permStore;
  var sm;
  var cm;
  var addMember;
  var removeMember;
  var frontGrid;
  var gridFs;
  var view;
  var store;
  var items;
  var reader;
  
  // This will add a check box in every record
  sm = new Ext.grid.CheckboxSelectionModel({
	header: '<div id=type+"Header" class="x-grid3-hd-checker"> </div>',
	listeners: {
			rowselect: function(sm, rowIndex, rec) {
				var removeMemberBtn = Ext.getCmp('removeMember' + type);
				removeMemberBtn.enable();
			},
			rowdeselect: function() {
				var removeMemberBtn = Ext.getCmp('removeMember' + type);
				if(sm.getCount() == 0) removeMemberBtn.disable();
				cm.setColumnHeader(0, '<div id=type+"Header" class="x-grid3-hd-checker">\&\#160;</div>');
			}
		}
  });	
			  
	permissionsCombo = create_editor_combo(); 
  cm = new Ext.grid.ColumnModel([
	sm, {
	  header:S('sh_' + type), 
	  width: 200, 
	  dataIndex: 'name', 
	  direction: "ASC",
	   sortable: true
	},{
	  header: S('sh_gridCol_permissions'), 
	  width: 300, 
	  dataIndex: 'permissions',
	  renderer: shFolders_renderPermissions,
	  editor: permissionsCombo
	}/*,{
	  dataIndex: 'memberOf', 
	  hidden: true,
	  groupRenderer : shFolders_headerRenderer
	}*/
  ]);
 /* view =	new Ext.grid.GroupingView({
	id: ID_SH_FOLD_PREFIX_GROUP_VIEW,
	// groupTextTpl: '{group}',
	groupTextTpl: '{group} ({[values.rs.length]})',
	enableGroupingMenu : false,
	startCollapsed: false
  });
*/

	addMember = new Ext.Button({
		text: S('btn_add'),
		name: 'addMember',
		id: 'addMember' + type,
		handler: function() {
			shFolders_addMemberPopup(type);
		},
		iconCls: 'add'
	});
  
	removeMember = new Ext.Button({
		text: S('btn_remove'),
		id: 'removeMember' + type,
		name: 'removeMember',
		disabled: true,
		handler: function() {
			removeMember.disable();
			shFold_removeRecord(store, ID_SH_FOLD_FRONT_GRID + type, type);
		
			var editableGrid = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + type);
			var edtableGrid_sm = editableGrid.getSelectionModel();
			var selectedRows = edtableGrid_sm.getCount();
			if(selectedRows == 0) removeMember.disable();
			cm.setColumnHeader(0, '<div id=type+"Header" class="x-grid3-hd-checker">\&\#160;</div>');

			var frontGridStore = editableGrid.getStore();
			arrayOfRecords = frontGridStore.getRange();
			udpateCombo(arrayOfRecords, type);
		},
		iconCls: 'delete'
	});
  items = Ext.data.Record.create([
	{name: 'name'},
	{name: 'permissions'}
  ]);

  reader = new Ext.data.JsonReader(
	{ 
		//root: "data", 
		root:'data[0].records',
		id: 'name'
	}, 
	items);
/*
  store = new Ext.ux.data.PagingStore({ 
			 storeId: 'store' + type,
		   reader: reader,
		   // url: '/dynamic.pl',
			//baseParams: {bufaction:BUFACT_GET_AXS_RESTRICT + shareId, type: type},
			lastOptions: { params: { start: 0, limit: 25} } 
	});
	*/
   /*  var pagingBar = new Ext.PagingToolbar({
			id: 'pageToolbar' + type,
		pageSize: 25,
		store: store,
		displayInfo: true,
		  displayMsg: '{0} - {1} of {2}'
		});
*/

	store = new Ext.data.JsonStore({
		storeId: 'store' + type,
		url: '/dynamic.pl',
		baseParams: {bufaction:BUFACT_GET_AXS_RESTRICT + shareId, type: type},
		root:'data',
	   fields: [
			{name: 'name'},
			{name: 'permissions'}  
		],
		//reader: reader,
		listeners:{
		 loadexception : function(){
			formFailureFunction();
			}
		},
		id: 'name'
	});
  
  var searchStore = new Ext.data.SimpleStore({
	fields: ['name', 'value'],
	data: new Array()
  });

	var searchBox = new Ext.form.ComboBox({
	  id: 'searchBox' + type,
	  store: searchStore,
	  displayField:'value',
	  valueField:'name',
	  typeAhead: true,
	  mode: 'local',
	  hideTrigger: true,
	  allowBlank:true,
	  editable: true,
	  forceSelection:true,
	  listWidth:150,
	  maxHeight:100,
	  width:150,
	  listeners: { 
		select: function(c, r, i) {
		  var store = frontGrid.getStore();
		  var recordIndex;
		
		 //value from combo in the format: "name - Local User" / "name - Local Group"
		  var selectedUsrName_dirty = r.get('value');
		  var selectedUsrName = r.get('name');
		
		  // Extract the name of the user or group
		  
		  store.each(
			function(rec){
			  if(rec.get('name') == selectedUsrName){
				recordIndex = store.indexOf(rec);
				return false;
			  }
			}
		  );

		  var sm = frontGrid.getSelectionModel();
		  sm.selectRow(recordIndex, true); // (index, keepSelected)
		   gridView.focusRow(recordIndex);
			c.clearValue();
	   } 
	  }
  });

	var toolbar  =	new Ext.Toolbar({
	  autoHeight: true,
	  items: [addMember, removeMember, '->',S('searchBox_find'), ' ', searchBox],
	  frame: false,
	  border: false
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true,
		forceFit: true
	});

  frontGrid = new Ext.grid.EditorGridPanel({
	  id: ID_SH_FOLD_FRONT_GRID + type,
	  store: store,
	  cm: cm,
   //	view: view,
	  selModel: sm,
	  clicksToEdit: 1,
	  width: 660,
	 // autoHeight:true,
	  height: 425,
	  autoScroll: true,
	  frame: true,
	  enableColumnResize: true,
	  enableColumnMove : false,
	  stripeRows: true,
	   tbar:toolbar,
	//	 bbar: pagingBar,
	   loadMask: {msg:S("msg_loading_data")},
		enableHdMenu: false,
		view: gridView
  });  
  return frontGrid;
}
function shFold_removeRecord(store, id, type) {
	var grid;
	var selModel;
	var selectedRecords;
	var msg;

	grid = Ext.getCmp(id); // get front Grid object
	selModel = grid.getSelectionModel(); // get selection model object
	selectedRecords = selModel.getSelections(); // get selected records in front grid
	if (selectedRecords.length == 0) {
		msg = S('qTip_select_first');
		msgBox('', msg, Ext.MessageBox.OK, Ext.MessageBox.ERROR);
}

	for (i = 0; i < selectedRecords.length; i++) {
		name = selectedRecords[i].get('name');
		record = store.getById(name);
		
		if(record){
			//frontStore.remove(record);
			indexOf = store.indexOf(record);
			store.data.removeAt(indexOf);
		}
	//	store.remove(selectedRecords[i]); // remove records of front grid
	}
	  store.sort('name', 'ASC');
}

function loadGrid(gridId, shareName, type){
	var frontGrid = Ext.getCmp(gridId + type);
  var store = frontGrid.getStore();
	var l_users = Ext.getCmp('localUsersViewBtn');
	var l_groups = Ext.getCmp('localGroupsViewBtn');
	var d_users = Ext.getCmp('domainUsersViewBtn');
	var d_groups = Ext.getCmp('domainGroupsViewBtn');
	var e_users = Ext.getCmp('extUsersViewBtn');

	if (l_users){
		l_users.disable();
	}
	if (l_groups){
		l_groups.disable();
	}
	if (d_groups){
		d_users.disable();
	}
	if (d_groups){
		d_groups.disable();
	}
	if (e_users){
		e_users.disable();
	}
	store.baseParams = {bufaction:BUFACT_GET_AXS_RESTRICT + shareName, type: type};
	store.load({
		callback: function(r, opt, success){
			var result = store.reader.jsonData.success;
			if(result){
				if (l_users){
					l_users.enable();
				}
				if (l_groups){
					l_groups.enable();
				}
				if (d_users){
					d_users.enable();
				}
				if (d_groups){
					d_groups.enable();
				}
				if (e_users){
					e_users.enable();
				}
				
				udpateCombo(r, type);
/*
				var comboData = new Array();
				for(var i = 0; i<r.length; i++){
					name = r[i].get('name');
					comboData[i] =	new Array(2);
					comboData[i][0] = name;
					comboData[i][1] = name;
				}

				var searchCombo = Ext.getCmp('searchBox' + type);
				var storeCombo = searchCombo.store;
				storeCombo.loadData(comboData);
*/
				store.sort('name', 'ASC');
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function udpateCombo(arrayOfRecords, type){
	var comboData = new Array();
	for (var i = 0; i<arrayOfRecords.length; i++){
		name = arrayOfRecords[i].get('name');
		comboData[i] =	new Array(2);
		comboData[i][0] = name;
		comboData[i][1] = name;
	}

	var searchCombo = Ext.getCmp('searchBox' + type);
	var storeCombo = searchCombo.store;
	storeCombo.loadData(comboData);
}
