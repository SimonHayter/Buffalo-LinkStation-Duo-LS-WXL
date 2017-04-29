var localTabUsed = false;
var domainTabUsed = false;
var smbTabUsed = false;

function shFolders_createGrid(frontGridId, type) {
	var store;
	var sm;
	var reader;
	var cm;
	var items;
	var frontGrid;
	var addMember;
	var removeMember;
	var gridFs;
	var view;
	var listUserForm;
	var popupLocalGrid;
	var pagingBar;
	var bufaction;

	if (type == 'local_users' || type == 'local_groups') {
		bufaction = BUFACT_SHARE_GET_LOCAL_LIST;
	}
	else if (type == 'domain_users' || type == 'domain_groups') {
		bufaction = BUFACT_SHARE_GET_DOMAIN_LIST;
	}
	else {
		bufaction = BUFACT_SHARE_GET_SMB_LIST;
	}

/*
	items = Ext.data.Record.create([
		{name: 'name'},
		{name: 'permissions'}
	]);

	reader = new Ext.data.JsonReader(
	{ 
		totalProperty: 'data[0].totalCount',
		root: 'data[0].records',
		id: 'name'
	}, 
	items);
*/

	localStore = new Ext.data.JsonStore({
	url: '/dynamic.pl',
		baseParams: {
			bufaction: bufaction,
			type: type
		}, // use getDomainList later
//		remoteSort: true,
		totalProperty: 'data[0].totalCount',
		root: 'data[0].records',
		id: 'name',
//		reader: reader,
		fields: [
			{name: 'name'},
			{name: 'permissions'}
		],
//		root: 'data[0].records',
		listeners: {
			loadexception : function(){
				formFailureFunction();
			}
		}
	});

/*
	pagingBar = new Ext.PagingToolbar({
		pageSize: 25,
		store: localStore,
		displayInfo: true,
		displayMsg: '{0} - {1} of {2}'
	});
*/

	localSm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function(localSm, rowIndex, rec) {
				Ext.getCmp('btn_add').enable();
			},
			rowdeselect: function() {
				totalCount = localSm.getCount();
				if (totalCount == 0) {
					Ext.getCmp('btn_add').disable();
				}
			}
		}
	});

	permissionsCombo = create_editor_combo();

	localCm = new Ext.grid.ColumnModel([
		localSm, {
			header: S('sh_' + type),
			width: 450,
			dataIndex: 'name',
			sortable: true
		}, {
			header: S('sh_gridCol_permissions'),
			width: 200,
			dataIndex: 'permissions',
			renderer: shFolders_renderPermissions,
			editor: permissionsCombo,
			hidden: true
		}
	]);

	var searchStore = new Ext.data.SimpleStore({
		fields: ['name', 'value'],
		data: LOCAL_LIST
	});

	//.:: create a combo box ::.
	var localSearchField = new Ext.form.ComboBox({
		id: ID_SH_FOLD_POPUP_LOCAL_SEARCH,
		store: searchStore,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
		mode: 'local',
		hideTrigger: true,
		allowBlank: true,
		editable: true,
		forceSelection: true,
		listWidth: 150,
		maxHeight: 100,
		width: 150,
		listeners: { 
			select: function(c, r, i) {
				var store = popupLocalGrid.getStore();
				var recordIndex;

				//value from combo in the format: "name - Local User" / "name - Local Group"
				var selectedUsrName_dirty = r.get('value');
				var selectedUsrName = r.get('name');

				// Extract the name of the user or group
				store.each(
					function(rec) {
						if (rec.get('name') == selectedUsrName) {
							recordIndex = store.indexOf(rec);
							return false;
						}
					}
				);

				var sm = popupLocalGrid.getSelectionModel();
				sm.selectRow(recordIndex, true); // (index, keepSelected)
				gridView.focusRow(recordIndex);
				c.clearValue();
			}
		}
	});

	var toolbar = new Ext.Toolbar({
		autoHeight: true,
		items: [
			'->',
			S('searchBox_find'),
			' ',
			localSearchField
		],
		frame: false,
		border: false
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	popupLocalGrid = new Ext.grid.EditorGridPanel({
		id: 'popupGrid',
		store: localStore,
		cm: localCm,
		selModel: localSm,
		clicksToEdit: 1,
		collapsible: false,
		animCollapse: false,
		hideCollapseTool: true,
		width: 500,
		height: 500,
		autoScroll: true,
		frame: false,
		border: false,
		enableColumnResize: false,
		enableColumnMove : false,
		enableHdMenu: false,
		stripeRows: true,
		tbar: toolbar,
//		bbar: pagingBar,
		loadMask: {msg:S("msg_loading_data")},
		view: gridView
	});

	return popupLocalGrid;
};

function create_popup_window(frontGridId, type){
	var windowTitle =  S('sh_' + type);
	grid = shFolders_createGrid(frontGridId, type);

	addMemberWin = new Ext.Window({
		html: '<div id="' + DIV_MEMBER + '" class="x-hidden"></div>',
		id: ID_SH_FOLD_MEMBER_POPUP_WIN,
		modal: true,
		width: 530,
		title: windowTitle,
		plain: true,
		draggable: false,
		resizable: false,
		items: [grid],
		buttons: [{
			text: S('btn_add'),
			disabled: true,
			id: 'btn_add',
			handler: function() {
				this.disable();
				var sm = grid.getSelectionModel();
				if (sm.getCount() >= 30) {
					Ext.Msg.show({
						title: '',
						msg: S('shFold_add_records_warning'),
						buttons: Ext.Msg.OK,
						fn: function(btn){
							if (btn == 'ok') {
								shFolders_submitPopupHandler(addMemberWin, frontGridId, type);
								Ext.Msg.show({
									title:'',
									msg: S('shFold_add_records_done'),
									buttons: Ext.Msg.OK,
									icon: Ext.MessageBox.INFO
								});	
							}
						},
						icon: Ext.MessageBox.INFO
					});	
				}
				else {
					shFolders_submitPopupHandler(addMemberWin, frontGridId, type);
				}
			}
		},
		{
			text: S('btn_close'),
			handler: function() {
				addMemberWin.close();
				addMemberBtn = Ext.getCmp('addMember' + type);
				addMemberBtn.enable();
			}
		}],
		listeners:{
			close: function(){
				var addMemberBtn = Ext.getCmp('addMember' + type);
					addMemberBtn.enable();
				}
		}
	});

	addMemberWin.show();
	var storeFront = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + type).getStore();
	loadUsers_popup(grid.getStore(), type);
}

function loadUsers_popup(storePopup, type) {
	storePopup.load({
		callback: function(r, opt, success) {
			var result = storePopup.reader.jsonData.success;
			if (result) {
				LOCAL_LIST = new Array;
				for (var i = 0; i < r.length; i++) {
					name = r[i].get('name');
					LOCAL_LIST[i] = new Array(2);
					LOCAL_LIST[i][0] = name;
					LOCAL_LIST[i][1] = name;
				}
				storePopup.sort('name', 'ASC');
			
				var searchCombo = Ext.getCmp(ID_SH_FOLD_POPUP_LOCAL_SEARCH);
				var storeCombo = searchCombo.store;
				storeCombo.loadData(LOCAL_LIST);
			}
			else {
				formFailureFunction();
			}
		}
	});
}
