function createMediaserverClientsList() {
	var refreshBtn = new Ext.Button({
		name: 'RefreshBtn',
		iconCls: 'refresh',
		text: S('mediaserver_client_reload'),
		handler: function() {
			topGrid = Ext.getCmp('grid1');
			jsonStore1 = topGrid.getStore();
//			Ext.MessageBox.wait('', S('msg_loading_data'));
			jsonStore1.removeAll();
			jsonStore1.reload();
//			Ext.MessageBox.hide();
		}
	});

	var SetBtn = new Ext.Button({
		text: S('btn_apply'),
		iconCls: 'edit',
		handler: function() {
//			var emptyList = false;
			var devGrid;
//			var selModel;
			var selectedRecords;
			var selectedRecords2;
//			var ipList;
//			var msg;
//			var buttons;
//			var title;
//			var icon;
			var i;

			// get data from grid1
			devGrid = Ext.getCmp('grid1');
			selectedRecords = devGrid.getStore();
			selectedRecords2 = selectedRecords.getRange();

			// convert data array into a json string
			macList = new Array();
			allowList = new Array();
			for (i = 0; i < selectedRecords2.length; i++){
				macList[i] = selectedRecords2[i].data.mac;
				allowList[i] = selectedRecords2[i].data.allow;
			}

			refreshBtn.disable();
			SetBtn.disable();
			closeBtn.disable();

			mediaserver_client_setBtnHandler(macList, allowList, clientWindow);
		}
	});

	var c_allow = S('mediaserver_client_combo_allow');
	var c_deny = S('mediaserver_client_combo_deny');
	var allowdenyList = [
		['1', c_allow],
		['0', c_deny]
	];

	allowdenyStore = new Ext.data.SimpleStore({
		data: allowdenyList,
		fields: ['val', 'opt']
	});

	allowdenyCombo = new Ext.form.ComboBox({
		id: 'allowdeny_Combo',
		hiddenName: 'allow',
		name: 'allow',
		typeAhead: true,
		triggerAction: 'all',
		mode: 'local',
		store: allowdenyStore,
		displayField: 'opt',
		valueField: 'val',
		lazyRender: true,
		listClass: 'x-combo-list-small',
		editable: false
	});

	var cm1 = new Ext.grid.ColumnModel([
		{
			header: S('mediaserver_client_mac'),
			width: 110,
			dataIndex: 'mac',
			sortable: true
		},
		{
			header: S('mediaserver_client_ip'),
			width: 100,
			dataIndex: 'ip',
			sortable: true
		},
		{
			header: S('mediaserver_client_name'),
			width: 140,
			dataIndex: 'name',
			sortable: true
		},
		{
			header: S('mediaserver_client_allow'),
			width: 60,
			dataIndex: 'allow',
			editor: allowdenyCombo,
			renderer: renderer_allow,
			sortable: false
		}
	]);

	var jsonStore1 = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_DLNA_CLIENTS
		},
		waitMsg: S('msg_loading_data'),
		fields: [
			{name: 'allow'},
			{name: 'mac'},
			{name: 'ip'},
			{name: 'name'}
		]
	});
 
	var grid1 = new Ext.grid.EditorGridPanel({
		id: 'grid1',
		title: S('mediaserver_client_list'),
		store: jsonStore1,
		cm: cm1,
		clicksToEdit: 1,
		width: 430,
		height: 150,
		loadMask: {
			msg: S("msg_loading_data")
		},
		enableHdMenu: false,
		tbar: [refreshBtn]
	});

	var closeBtn = new Ext.Button({
		name: 'closeBtn',
		text: S('btn_close'),
		handler: function(){
			clientWindow.hide();
			clientWindow.destroy();
		}
	});

	var clientWindow = new Ext.Window({
		html: '<div id="' + DIV_DEV_LIST_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_DEV_LIST_WIN,
		modal: true,
		width: 450,
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		defaultType: 'form',
		items: [grid1],
		buttonAlign: 'left',
		buttons: [SetBtn, closeBtn],
		listeners: {
			beforeshow: function() {
				jsonStore1.load({
					callback: function(r, o, s) {
						var result = jsonStore1.reader.jsonData.success;
						if (!result) {
							formFailureFunction();
						}
					}
				});
			}
		}
	});

	clientWindow.show();
}

function renderer_allow(value) {
	if (value == '1') {
		return S('mediaserver_client_allow');
	}
	return S('mediaserver_client_combo_deny');
}

function mediaserver_client_setBtnHandler(macList, allowList, clientWindow) {
	jsonData_mac = Ext.util.JSON.encode(macList);
	jsonData_allow = Ext.util.JSON.encode(allowList);

	Ext.MessageBox.wait('', S('msg_saving_data'));
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DLNA_CLIENTS,
			mac: jsonData_mac,
			allow: jsonData_allow
		},
		failure: function(form,action) {
			Ext.MessageBox.hide();
			formFailureFunction(action);
		},
		success: function (result){
			Ext.MessageBox.hide();
			clientWindow.hide();
			clientWindow.destroy();

			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			
			var success = response.success;
			if (success) {
				resetCookie();
				createMediaserverClientsList();
			}
			else {
				createMediaserverClientsList();
			}
		}
	});
}
