function create_upsForm_displayMode(serial, syncUpsMode, data) {
	var warn_usedby_usbdev = S('Warn_Usedby_USBDevServer');
	var isHide = true;
	if (deviceservermode == 'on') {
		isHide = false;
	}

	var upsStatus = new Ext.form.TextField({
		name: 'upsStatus',
		id: 'upsStatus',
		fieldLabel: S('system_ups_status'),
		width: 300,
		readOnly: true
	});

	var syncUps = new Ext.form.TextField({
		id: 'syncUps',
		name: 'syncUps',
		fieldLabel: S('system_ups_synchonization'),
		width: 400,
		readOnly: true
	});

	var connectType = new Ext.form.TextField({
		id: 'connectType',
		name: 'connectType',
		fieldLabel: S('system_ups_connType'),
		width: 300,
		readOnly: true
	});

	var net_ipAddr = new Ext.form.TextField({
		name: 'net_ipAddr',
		id: 'net_ipAddr',
		fieldLabel: S('system_ups_net_ipAddr'),
		width: 300,
		readOnly: true
	});

	var shutdown = new Ext.form.TextField({
		id: 'shutdown',
		name: 'shutdown',
		fieldLabel: S('system_ups_shutdown_legend'),
		width: 400,
		readOnly: true
	});

	var behavior = new Ext.form.TextField({
		name: 'behavior',
		id: 'behavior',
		fieldLabel: S('system_ups_behavior'),
		width: 400,
		readOnly: true
	});

	var recovery = new Ext.form.TextField({
		name: 'recovery',
		id: 'recovery',
		fieldLabel: S('system_ups_recovery'),
		width: 400,
		readOnly: true
	});

	var e_editBtn = new Ext.Button({
		id: 'e_editBtn',
		name: 'e_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				upsForm.destroy();
				upsForm_edit = create_upsForm_editMode(serial, data);
				insertToCentralContainer(SYSTEM_RENDER_TO, upsForm_edit, render_ups_form_before);
//				updateCentralContainer(SYSTEM_RENDER_TO, upsForm_edit, render_ups_form_before);	
				ups_fieldValuesHandler_editMode(upsForm_edit, ups_jsonData, serial)
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader = new Ext.data.JsonReader({
		root: 'data',
		successProperty: 'success'
	}, [{
		name: 'upsStatus'
	},
	{
		name: 'syncUps'
	},
	{
		name: 'net_ipAddr'
	},
	{
		name: 'time'
	},
	{
		name: 'shutdown'
	},
	{
		name: 'wait'
	},
	{
		name: 'behavior'
	},
	{
		name: 'connectType'
	},
	{
		name: 'recovery'
	}]);

	var items;

	if (syncUpsMode == 'off') {
		items = [
			syncUps
		];
	}
	else if (syncUpsMode == 'slave') {
		items = [
			upsStatus,
			syncUps,
			net_ipAddr
		];
	}
	// syncUpsMode == 'master'
	else if (serial) {
		items = [
			syncUps,
			connectType,
			shutdown,
			behavior
		];
	}
	else {
		items = [
			upsStatus,
			syncUps,
			connectType,
			shutdown,
			behavior
		];
	}

	if ((add_upsRecover) && (syncUpsMode != 'off')) {
		items[items.length] = recovery;
	}

	var warn_usedby_usbdev = {
		autoWidth: true,
		layout: 'column',
		id: 'warn_usedby_usbdev',
		name: 'warn_usedby_usbdev',
		cls : 'column-custBorders',
		items: [{
			cls: 'warnings',
			columnWidth: 1.0,
			html: warn_usedby_usbdev
		}],
		hideMode: 'display',
		hidden : isHide,
		hideLabel: isHide
	}

	items = items.concat(warn_usedby_usbdev);

	var upsForm = new Ext.FormPanel({
		id: ID_UPS_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		reader: jReader,
		title: S('system_ups_form_title'),
		labelWidth: 200,
		width: 640,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		errorReader: jErrReader,
		buttonAlign: 'left',
		buttons: [e_editBtn],
		items: items,
		titleCollapse: true
	});

	return upsForm;
}

function create_upsForm_editMode(serial, data) {
	var syncOn_master = new Ext.form.Radio({
		name: 'syncUps',
		id: 'syncOn_master',
		hideLabel: 'true',
		boxLabel: S('system_ups_on_master'),
		inputValue: 'master',
		listeners: {
			check: function (syncOn_master, checked) {
				if (checked) {
					syncOn_slave.setValue(false);
					syncOff.setValue(false);
					enable_fields(serial);
					net_ipAddr.disable();
					net_ipAddr.clearInvalid();
				}
			}
		}
	});

	var syncOn_slave = new Ext.form.Radio({
		name: 'syncUps',
		id: 'syncOn_slave',
		hideLabel: 'true',
		boxLabel: S('system_ups_on_slave'),
		inputValue: 'slave',
		listeners: {
			check: function (syncOn_slave, checked) {
				if (checked) {
					syncOn_master.setValue(false);
					syncOff.setValue(false);
					disable_fields(serial);
					net_ipAddr.enable();
					net_ipAddr.clearInvalid();

					if (add_upsRecover) {
						upsRecoveryEn.enable();
						upsRecoveryDis.enable();
					}
				}
			}
		}
	});

	var syncOff = new Ext.form.Radio({
		name: 'syncUps',
		id: 'syncOff',
		hideLabel: 'true',
		boxLabel: S('system_ups_off'),
		inputValue: 'off',
		listeners: {
			check: function (syncOff, checked) {
				if (checked) {
					syncOn_master.setValue(false);
					syncOn_slave.setValue(false);
					disable_fields(serial);
					net_ipAddr.disable();
					net_ipAddr.clearInvalid();
				}
			}
		}
	});

	var net_ipAddr = new Ext.form.TextField({
		id: 'net_ipAddr',
		name: 'net_ipAddr',
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: false
	});

	var connectOptions2 = [
		[data.connectType, S(data.connectType)]
	]

	var connectType_store2 = new Ext.data.SimpleStore({
		data: connectOptions2,
		fields: ['val', 'opt']
	});

//	var connectType = new Ext.form.TextField({
	var connectType = new Ext.form.ComboBox({
		id: 'connectType',
		name: 'connectType',
		fieldLabel: S('system_ups_connType'),
//		readOnly: true,
		width: 300,
		store: connectType_store2,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
//		itemCls: 'display-label'
		hidden: true
	});

	var connectOptions = [
		['ups_connectType3', S('ups_connectType3')],
		['ups_connectType3s', S('ups_connectType3s')],
		['ups_connectType4', S('ups_connectType4')]
	]

	var connectType_store = new Ext.data.SimpleStore({
		data: connectOptions,
		fields: ['val', 'opt']
	});

	var connectType_combo = new Ext.form.ComboBox({
		id: 'connectType_combo',
		hiddenName: 'connectType',
		fieldLabel: S('system_ups_connType'),
		store: connectType_store,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		value: 'ups_connectType3',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 300,
		width: 300,
		editable: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_UPS_TIME
		}
	});

	var ups_saveBtn = new Ext.Button({
		id: 'ups_saveBtn',
		name: 'ups_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				ups_saveBtnHandler(upsForm_edit, serial);
			}
		}
	});

	var ups_cancelBtn = new Ext.Button({
		id: 'ups_cancelBtn',
		name: 'ups_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				upsForm_edit.destroy();
				createUpsSettings(true);
			}
		}
	});

	var shutdownEn = new Ext.form.Radio({
		id: 'shutdownEn',
		name: 'shutdown',
		hideLabel: 'true',
		boxLabel: S('system_ups_shutdown_on'),
		inputValue: 'on',
		listeners: {
			check: function (shutdownEn, checked) {
				if (checked) {
					time_combo.enable();
					shutdownBatteryLow.setValue(false);
					if (add_iscsi) {
						shutdownOff.setValue(false);
						waitForClients.disable();
					}
				}
			}
		}
	});

	var shutdownBatteryLow = new Ext.form.Radio({
		name: 'shutdown',
		id: 'shutdownBatteryLow',
		hideLabel: 'true',
		boxLabel: S('system_ups_shutdown_battery_low'),
		inputValue: 'low',
		listeners: {
			check: function (shutdownBatteryLow, checked) {
				if (checked) {
					time_combo.disable();
					shutdownEn.setValue(false);
					if (add_iscsi) {
						shutdownOff.setValue(false);
						waitForClients.disable();
					}
				}
			}
		}
	});

	var shutdownOff = new Ext.form.Radio({
		name: 'shutdown',
		id: 'shutdownOff',
		hideLabel: 'true',
		boxLabel: S('system_ups_shutdown_off'),
		inputValue: 'off',
		listeners: {
			check: function (shutdownOff, checked) {
				if (checked) {
					time_combo.disable();
					shutdownEn.setValue(false);
					shutdownBatteryLow.setValue(false);
					waitForClients.enable();
				}
			}
		}
	});

	var waitForClients = new Ext.form.Checkbox({
		boxLabel: S('system_ups_shutdown_waitForClients'),
		id: 'waitForClients',
		name: 'wait',
		inputValue: 1,
		hideLabel: true
	});

	var upsRecoveryEn = new Ext.form.Radio({
		name: 'recovery',
		id: 'upsRecoveryEn',
		hideLabel: 'true',
		boxLabel: S('enable'),
		inputValue: 'on'
	});

	var upsRecoveryDis = new Ext.form.Radio({
		name: 'recovery',
		id: 'upsRecoveryDis',
		hideLabel: 'true',
		boxLabel: S('disable'),
		inputValue: 'off'
	});

	var timeOpt = new Array();
	for (var i = 1; i < 31; i++) {
		timeOpt[i - 1] = new Array();
		timeOpt[i - 1][0] = i;
		timeOpt[i - 1][1] = i;
	}

	var timeStore = new Ext.data.SimpleStore({
		data: timeOpt,
		fields: ['val', 'opt']
	});

	var time_combo = new Ext.form.ComboBox({
		id: 'time_combo',
		hiddenName: 'time',
		hideLabel: 'true',
		store: timeStore,
		minValue: 0,
		maxValue: 30,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		value: 1,
		selectOnFocus: true,
		forceSelection: true,
		width: 45,
		listWidth: 43,
		maxHeight: 100,
		baseChars: '0123456789',
		editable: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_UPS_TIME
		}
	});

	var alive = new Ext.form.Radio({
		name: 'behavior',
		id: 'alive',
		hideLabel: 'true',
		boxLabel: S('system_ups_behaivorAlive'),
		inputValue: 'off',
		listeners: {
			check: function (alive, checked) {
				if (checked) {
					if (add_upsRecover) {
						upsRecoveryEn.disable();
						upsRecoveryDis.disable();
					}
					powerOff.setValue(false);
				}
			}
		}
	});

	var powerOff = new Ext.form.Radio({
		name: 'behavior',
		id: 'powerOff',
		hideLabel: 'true',
		boxLabel: S('system_ups_behaivorOff'),
		inputValue: 'on',
		listeners: {
			check: function (powerOff, checked) {
				if (checked) {
					if (add_upsRecover) {
						upsRecoveryEn.enable();
						upsRecoveryDis.enable();
					}
					alive.setValue(false);
				}
			}
		}
	});

	var ups_ls_behavior = S('system_ups_ls_behavior');
	var shutdown_time_powerFail = S('system_ups_time_powerFail');
	var ups_UPS_behavior = S('system_ups_UPS_behavior');
	var ups_recovery = S('system_ups_recovery');
	var syncItems = new Array();
	var formItems = new Array();
	var recoveryOptions = new Array();
	var syncOpt = new Array();
	var netOpt = new Array();

	syncOpt = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .28,
			html: S('system_ups_synchonization') + ":"
		},
		{
			layout: 'form',
			items: [{
				cls: 'label',
				columnWidth: .24,
				items: [syncOn_master]
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [syncOn_slave]
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [syncOff]
			}]
		}
		]
	},
	{
		cls: 'column-custBorders',
		html: '<br>'
	}]

	netOpt = [{
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .28,
			html: S('system_ups_net_ipAddr') + ":"
		},
		{
			cls: 'label',
			columnWidth: .49,
			items: [net_ipAddr]
		}]
	},
	{
		cls: 'column-custBorders',
		html: '<br>'
	}]

	if (!serial) {
		// Serial UPS is * NOT * supported
		formItems = formItems.concat([{
			cls: 'column-custBorders',
			layout: 'form'
		}], syncOpt, netOpt);

		// USB UPS is connected
//		if (data.upsStatus != 'ups_status4') {
		if ((data.connectType != 'ups_connectType1') || (data.connectType != 'ups_connectType2')) {
			formItems[formItems.length] = connectType;
		}
	}
	else {
		// Serial UPS is connected
		formItems = formItems.concat(syncOpt, netOpt);
		formItems[formItems.length] = connectType_combo;
	}

	var shutdownItems;
	if (add_iscsi) {
		shutdownItems = [{
			html: '<p class="label">' + ups_ls_behavior + ':</p>',
			cls: 'column-custBorders'
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .3,
				align: 'right',
				items: [shutdownEn]
			},
			{
				layout: 'form',
				columnWidth: .10,
				items: [time_combo]
			},
			{
				columnWidth: .4,
				align: 'left',
				html: '<p class="label">' + shutdown_time_powerFail + '</p>'
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .98,
				items: [shutdownBatteryLow]
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .98,
				items: [shutdownOff]
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .05,
				items: [{
					cls: 'x-label',
					html: '&nbsp'
				}]
			},
			{
				layout: 'form',
				columnWidth: .95,
				items: [waitForClients]
			}]
		}];
	}
	else {
		shutdownItems = [{
			html: '<p class="label">' + ups_ls_behavior + ':</p>',
			cls: 'column-custBorders'
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .3,
				align: 'right',
				items: [shutdownEn]
			},
			{
				layout: 'form',
				columnWidth: .10,
				items: [time_combo]
			},
			{
				columnWidth: .4,
				align: 'left',
				html: '<p class="label">' + shutdown_time_powerFail + '</p>'
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .98,
				items: [shutdownBatteryLow]
			}]
		}];

	}

	var upsBehaivorItems = [{
		cls: 'column-custBorders'
	},
	{
		layout: 'form',
		cls: 'column-custBorders',
		html: '<p class="label">' + ups_UPS_behavior + ':</p>'
	},
	{
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: .02,
			html: '&nbsp'
		},
		{
			layout: 'form',
			columnWidth: .98,
			items: [alive]
		}]
	},
	{
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: .02,
			html: '&nbsp'
		},
		{
			layout: 'form',
			columnWidth: .98,
			items: [powerOff]
		}]
	}];

	if (add_upsRecover) {
		recoveryOptions = [{
			cls: 'column-custBorders'
		},
		{
			layout: 'form',
			cls: 'column-custBorders',
			html: '<p class="label">' + ups_recovery + ':</p>'
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .98,
				items: [upsRecoveryEn]
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				columnWidth: .02,
				html: '&nbsp'
			},
			{
				layout: 'form',
				columnWidth: .98,
				items: [upsRecoveryDis]
			}]
		}];
	}

	// Serial UPS is * NOT * supported, USB UPS is * NOT * connected
//	if ((!serial) && (data.upsStatus == 'ups_status4')) {
	if ((!serial) && ((data.upsStatus == 'ups_status4') && (data.connectType != 'ups_connectType1') && (data.connectType != 'ups_connectType2'))) {
		formItems = formItems.concat(recoveryOptions);
	}
	else {
		formItems = formItems.concat(shutdownItems, upsBehaivorItems, recoveryOptions);
	}

	var jReader = new Ext.data.JsonReader({
		root: 'data',
		successProperty: 'success'
	}, [{
		name: 'syncUps'
	},
	{
		name: 'net_ipAddr'
	},
	{
		name: 'shutdown'
	},
	{
		name: 'wait'
	},
	{
		name: 'time'
	},
	{
		name: 'behavior'
	},
	{
		name: 'connectType'
	},
	{
		name: 'recovery'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var upsForm_edit = new Ext.FormPanel({
		id: ID_UPS_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		reader: jReader,
		title: S('system_ups_form_title'),
		labelWidth: 158,
		width: 640,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		collapseFirst: true,
		errorReader: jErrReader,
		buttonAlign: 'left',
		buttons: [ups_saveBtn, ups_cancelBtn],
		items: formItems,
		titleCollapse: true
	});

	return upsForm_edit;
}

function ups_saveBtnHandler(ups_form_edit, serial) {
	var time_combo_value = Ext.getCmp('time_combo').getValue();
	ups_form_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_UPS_SETTINGS,
			time: time_combo_value
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			if (product_name.match(/^TS-.*VH.*\(/i)) {
				Ext.Msg.confirm(
					(''),
					S('system_ups_cmos_apply_reboot_confirm'),
					function (btn, text) {
						if (btn == 'yes') {
							ups_form_edit.form.submit({
								url: '/dynamic.pl',
								params: {
									bufaction: BUFACT_REBOOT,
									action: ACTION_REBOOT
								},
								failure: function (form, action) {
									formFailureFunction(action);
								},
								success: function (form, action) {
									var title = S('rebooting');
									var titleFormatted = '<p class="title"><img src="' + WARNING_IMG + '" /> &nbsp ' + title + '</p><br>';
									var msg = S('reboot_after');
									var msgFormatted = '<p class="msg">' + msg + '</p>';
									updateHtmlToContainer(SYSTEM_RENDER_TO, titleFormatted);
									addHtmlToContainer(SYSTEM_RENDER_TO, msgFormatted);

									if (add_iscsi) {
										show_menus_submenus_disabled_iscsi();
									}
									else {
										show_menus_submenus_disabled();
									}

									highlight_sub_menu(selected_sub_menu);
									highlight_menu(selected_menu);
								}
							});
						}
					}
				);;
			}

			ups_form_edit.destroy();
			createUpsSettings(true);
		}
	});
}

function ups_fieldValuesHandler_displayMode(form, data) {
	var upsStatus = data.upsStatus;
	var syncUps = data.syncUps;
	var connectType = data.connectType;
	var net_ipAddr = data.net_ipAddr;
	var shutdown = data.shutdown;
	var behavior = data.behavior;
	var data_time = data.time;
	var upsRecovery = data.recovery;

	var upsStatus_field = Ext.getCmp('upsStatus');
	var syncUps_field = Ext.getCmp('syncUps');
	var connectType_field = Ext.getCmp('connectType');
	var net_ipAddr_field = Ext.getCmp('net_ipAddr');
	var shutdown_field = Ext.getCmp('shutdown');
	var behavior_field = Ext.getCmp('behavior');
	var recovery_field = Ext.getCmp('recovery');
	var syncUps_value;
	var upsStatus_value = '';
	var shutdown_value = '';
	var behavior_value = '';
	var recovery_value = '';
	var connectType_value = '';

	upsStatus_value = S(upsStatus);
	connectType_value = S(connectType);

//	if (syncUps == 'off' || !syncUps || upsStatus == 'ups_status3') {
	if (syncUps == 'off' || !syncUps) {
		syncUps_value = S('system_ups_off');
		recovery_value = '-';
		behavior_value = '-';
		shutdown_value = '-';
	}
	else {
		if (syncUps == 'slave') {
			syncUps_value = S('system_ups_on_slave');
		}
		else {
			syncUps_value = S('system_ups_on_master');
		}

		if (shutdown == 'on') {
			if (data_time == 'off') {
				data_time = 1;
			}
			shutdown_value = S('system_ups_shutdown_on');
			shutdown_value += ' ' + data_time;
			shutdown_value += ' ' + S('system_ups_time_powerFail');
		}
		else if (shutdown == 'low') {
			shutdown_value = S('system_ups_shutdown_battery_low');
		}
		else if (shutdown == 'off' && add_iscsi) {
			shutdown_value = S('system_ups_shutdown_off');
		}

		if (behavior == 'on') {
			behavior_value = S('system_ups_behaivorOff');
		}
		else {
			behavior_value = S('system_ups_behaivorAlive');
		}

		if (add_upsRecover && syncUps != 'off' && upsStatus != 'ups_status3') {
			if (upsRecovery == 'on') {
				recovery_value = S('enabled');
			}
			else {
				recovery_value = S('disabled');
			}
		}
	}

/*
	if (serial) {
		connectType_value = S(connectType);

		if (upsStatus == 'ups_status4' && !connectType) {
			syncUps_value = S('disabled');
			recovery_value = '-';
			behavior_value = '-';
			shutdown_value = '-';
			connectType_value = '-';
		}
	}
*/

	connectType_field.setValue(connectType_value);
	net_ipAddr_field.setValue(net_ipAddr);
	syncUps_field.setValue(syncUps_value);
	shutdown_field.setValue(shutdown_value);
	behavior_field.setValue(behavior_value);

	if (recovery_field) {
		recovery_field.setValue(recovery_value);
	}

	if (upsStatus_field) {
		upsStatus_field.setValue(upsStatus_value);
	}
}

function ups_fieldValuesHandler_editMode(form, data, serial) {
	var upsStatus = data.upsStatus;
	var connectType = data.connectType;
	var syncUps = data.syncUps;
	var net_ipAddr = data.net_ipAddr;
	var shutdown = data.shutdown;
	var behavior = data.behavior;
	var data_time = data.time;
	var upsRecovery = data.recovery;
	var wait = data.wait;

	var shutdownOff = Ext.getCmp('shutdownOff');
	var waitForClients = Ext.getCmp('waitForClients');

	var syncUps_field = Ext.getCmp('syncUps');
	var net_ipAddr_field = Ext.getCmp('net_ipAddr');
	var connectType_field = Ext.getCmp('connectType');
	var connectType_field_combo = Ext.getCmp('connectType_combo');
	var shutdownEn = Ext.getCmp('shutdownEn');
	var shutdownBatteryLow = Ext.getCmp('shutdownBatteryLow');
	var behavior_alive = Ext.getCmp('alive');
	var behavior_off = Ext.getCmp('powerOff');
	var time_field = Ext.getCmp('time_combo');
	var recovery_field_en = Ext.getCmp('upsRecoveryEn');
	var recovery_field_dis = Ext.getCmp('upsRecoveryDis');
	var syncOn_master = Ext.getCmp('syncOn_master');
	var syncOn_slave = Ext.getCmp('syncOn_slave');
	var syncOff = Ext.getCmp('syncOff');

	var upsStatus_value = '';
	var connectType_value;

	if (add_upsSerial && serial) {
		// if here, Serial UPS is connected
		connectType_field_combo.show();
		connectType_field_combo.setValue(connectType);
	}
	else {
		connectType_field.show();
		connectType_value = S(connectType);
		connectType_field.setValue(connectType_value);
	}

	if (!connectType) {
		connectType_field_combo.setValue('ups_connectType3');
	}

	if ((shutdown == 'on') || serial) {
		shutdownEn.setValue(true);
		time_field.enable();
	}
	else if (shutdown == 'low') {
		shutdownBatteryLow.setValue(true);
		time_field.disable();
	}
	else if (!shutdown) {
		shutdownEn.setValue(true);
		time_field.disable();
	}

	if (shutdown == 'off' && add_iscsi) {
		shutdownOff.setValue(true);
	}

	if (wait == 'on') {
		waitForClients.setValue(true);
	}

	if (behavior == 'on') {
		behavior_off.setValue(true);
	}
	else {
		behavior_alive.setValue(true);
	}

	if (shutdown == 'off' || !data_time) {
		time_field.setValue('1');
	}
	else {
		time_field.setValue(data_time);
	}

	if (add_upsRecover) {
		if (behavior == 'off') { // on -> turn off, off -> alive
			recovery_field_en.disable();
			recovery_field_dis.disable();
			recovery_field_dis.setValue(true);
		}
		else {
			recovery_field_en.enable();
			recovery_field_dis.enable();

			if (upsRecovery == 'on') {
				recovery_field_en.setValue(true);
			}
			else {
				recovery_field_dis.setValue(true);
			}
		}
	}

//	if ((syncUps != 'master' && syncUps != 'slave') || upsStatus == 'ups_status3' || (upsStatus == 'ups_status4' && !connectType)) {
	if (syncUps != 'master' && syncUps != 'slave') {
		syncOff.setValue(true);
	}
	else if (syncUps == 'slave') {
		syncOn_slave.setValue(true);
	}
	else {
		syncOn_master.setValue(true);
	}

	if ((!add_upsSerial) && (upsStatus == 'ups_status4')) {
		syncOn_master.disable();
	}

	net_ipAddr_field.setValue(net_ipAddr);
}

function enable_fields(serial) {
	var syncOn_slave = Ext.getCmp('syncOn_slave');
	var connectType_combo = Ext.getCmp('connectType_combo');
	var connectType = Ext.getCmp('connectType');
	var shutdownEn = Ext.getCmp('shutdownEn');
	var shutdownBatteryLow = Ext.getCmp('shutdownBatteryLow');
	var shutdownOff = Ext.getCmp('shutdownOff');
	var waitForClients = Ext.getCmp('waitForClients');
	var time_field = Ext.getCmp('time_combo');
	var alive = Ext.getCmp('alive');
	var powerOff = Ext.getCmp('powerOff');
	var upsRecoveryEn = Ext.getCmp('upsRecoveryEn');
	var upsRecoveryDis = Ext.getCmp('upsRecoveryDis');

	connectType.enable();
	shutdownEn.enable();

	if (serial) {
		connectType_combo.enable();
		shutdownBatteryLow.disable();
	}
	else {
		shutdownBatteryLow.enable();
	}

	if (add_iscsi) {
		shutdownOff.enable();
		if (shutdownOff.getValue()) {
			waitForClients.enable();
		}
		else {
			waitForClients.disable();
		}
	}

	if (shutdownEn.getValue()) {
		time_field.setDisabled(false);
	}

	alive.enable();
	powerOff.enable();

	if (add_upsRecover && (powerOff.getValue() || syncOn_slave.getValue())) {
		upsRecoveryEn.enable();
		upsRecoveryDis.enable();
	}
	else {
		upsRecoveryEn.disable();
		upsRecoveryDis.disable();
	}
}

function disable_fields(serial) {
	var connectType_combo = Ext.getCmp('connectType_combo');
	var connectType = Ext.getCmp('connectType');
	var shutdownEn = Ext.getCmp('shutdownEn');
	var shutdownBatteryLow = Ext.getCmp('shutdownBatteryLow');
	var shutdownOff = Ext.getCmp('shutdownOff');
	var waitForClients = Ext.getCmp('waitForClients');
	var time_field = Ext.getCmp('time_combo');
	var alive = Ext.getCmp('alive');
	var powerOff = Ext.getCmp('powerOff');
	var upsRecoveryEn = Ext.getCmp('upsRecoveryEn');
	var upsRecoveryDis = Ext.getCmp('upsRecoveryDis');

	if (serial) {
		connectType_combo.setDisabled(true);
	}

	connectType.disable();
	shutdownEn.disable();
	shutdownBatteryLow.disable();

	if (add_iscsi) {
		shutdownOff.disable();
		waitForClients.disable()
	}

	time_field.setDisabled(true);
	alive.disable();
	powerOff.disable();

	if (add_upsRecover) {
		upsRecoveryEn.disable();
		upsRecoveryDis.disable();
	}
}
