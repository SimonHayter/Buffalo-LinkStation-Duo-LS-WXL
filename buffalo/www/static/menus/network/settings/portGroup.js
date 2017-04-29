function create_portGroup_display() {
	var portGroupOpt = new Ext.form.TextField({
		id: 'portGroupOpt',
		name: 'portTrunkMode',
		fieldLabel: S('net_settings_portGroup'),
		width: 400,
		readOnly: true
	});

	var portGroup_editBtn = new Ext.Button({
		id: 'portGroup_editBtn',
		name: 'portGroup_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				// destroy display form
				portGroupForm_display.destroy();

				portGroup_edit = create_portGroup_edit();
				insertToCentralContainer(NETWORK_RENDER_TO, portGroup_edit, portGroupRenderBefore);
				var portGroup_combo = Ext.getCmp('portGroup_combo');
				portGroup_combo.setValue(portGroup_jsonData.portTrunkMode);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'portTrunkMode'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var portGroupForm_display = new Ext.FormPanel({
		id: ID_PORT_GROUP_FORM,
		animCollapse: false,
		title: S('net_settings_portGroup_title'),
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		items: [portGroupOpt],
		buttons: [portGroup_editBtn],
		titleCollapse: true
	});

	return portGroupForm_display;
}

function create_portGroup_edit() {
	var ehtFrameSizeList = [
		['off', S('net_settings_portGroup_off')],
		['0', S('net_settings_portGroup_rr')],
		['1', S('net_settings_portGroup_bck')],
		['2', S('net_settings_portGroup_xor')],
		['3', S('net_settings_portGroup_broadcast')],
		['4', S('net_settings_portGroup_dynamic')],
		['5', S('net_settings_portGroup_tlb')] 
//		,['6',S('net_settings_portGroup_alb')]
	];

	// ....: Create form ITEMS :....
	var portGroup_combo = new Ext.form.ComboBox({
		id: 'portGroup_combo',
		hiddenName: 'portTrunkMode',
		fieldLabel: S('net_settings_portGroup'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: ehtFrameSizeList
		}),
		displayField: 'opt',
		emptyText: 'Select One',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		minListWidth: 400,
		width: 400,
		editable: false
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				Ext.MessageBox.show({
					title: S('warning_box_title'),
					msg: S('net_settings_portGroup_warning'),
					buttons: Ext.MessageBox.OKCANCEL,
					icon: Ext.MessageBox.WARNING,
					fn: function(btn) {
						if (btn == 'ok') {
							portGroup_saveBtnHandler(portGroup_edit);
						}
						else {
							return;
						}
					}
				});
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				portGroup_edit.destroy();
				portGroupForm_display = create_portGroup_display();
				insertToCentralContainer(NETWORK_RENDER_TO, portGroupForm_display, portGroupRenderBefore);
				portGroup_setDisplayValues(portGroup_jsonData);
				portGroupForm_display.expand();
				portGroup_check_iscsi();
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'portTrunkMode'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	// ....: Create Network Sharing Services settings form and add itmes from above  :....
	var portGroup_edit = new Ext.FormPanel({
		id: ID_PORT_GROUP_FORM,
		animCollapse: false,
		title: S('net_settings_portGroup_title'),
		cls: 'panel-custBorders',
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		items: [portGroup_combo],
		buttons: [saveBtn, cancelBtn],
		titleCollapse: true
	});

	return portGroup_edit;
}

function portGroup_saveBtnHandler(portGroup_edit) {
	portGroup_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_PORT_GROUP
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			createNetSettings();
			if (!add_iscsi) {
				getLeftPanelInfo(MENU_INDEX_ISCSI);
			}
			else {
				getLeftPanelInfo(MENU_INDEX_NETWORK);
			}
		}
	});
}

function portGroup_setDisplayValues(portGroup_jsonData) {
	var portGroupOpt = portGroup_jsonData.portTrunkMode;
	var portGroup = Ext.getCmp('portGroupOpt');

	var portGroupValue;
	if (portGroupOpt == 'off') portGroupValue = S('net_settings_portGroup_off');
	if (portGroupOpt == '0') portGroupValue = S('net_settings_portGroup_rr');
	else if (portGroupOpt == '1') portGroupValue = S('net_settings_portGroup_bck');
	else if (portGroupOpt == '2') portGroupValue = S('net_settings_portGroup_xor');
	else if (portGroupOpt == '3') portGroupValue = S('net_settings_portGroup_broadcast');
	else if (portGroupOpt == '4') portGroupValue = S('net_settings_portGroup_dynamic');
	else if (portGroupOpt == '5') portGroupValue = S('net_settings_portGroup_tlb');
	else if (portGroupOpt == '6') portGroupValue = S('net_settings_portGroup_alb');

	portGroup.setValue(portGroupValue);
}

function portGroup_check_iscsi() {
	if (add_iscsi && IS_ISCSI_RUNNING) {
		Ext.getCmp('portGroup_editBtn').disable();
	}
}
