function fwUpdate_create_form() {
	var notify = false;
	if (up_notify == 'on') {
		notify = true;
	}

	var checkBtn = new Ext.Button({
		id: 'checkBtn',
		text: S('system_firmware_update_btn_check'),
		
//		iconCls: 'refresh',
		handler: function (f) {
			ValidateSession();
			fwUpdate_check('manual');
		}
	});

	var changeLog = new Ext.form.TextArea({
		id: 'changeLog',
		name: 'changeLog',
		hideLabel: true,
		anchor: '100% -53',
		height: 300,
		readOnly: true,
		editable: false
	});

	var installBtn = new Ext.Button({
		id: 'installBtn',
		text: S('system_firmware_update_btn_install'),
		disabled: true,
		handler: function () {
			ValidateSession();
			fwUpdate_install(firmwareUpdateForm);
		}
	});

	var poweronBtn = new Ext.Button({
		id: 'poweronBtn',
		name: 'poweronBtn',
		text: S('system_firmware_update_notify_enable'),
		listeners: {
			click: function () {
				updatenotify_powerBtnHandler(firmwareUpdateForm);
			}
		},
		hideMode: 'display',
		hidden : notify,
		hideLabel: notify
	});

	var poweroffBtn = new Ext.Button({
		id: 'poweroffBtn',
		name: 'poweroffBtn',
		text: S('system_firmware_update_notify_disable'),
		listeners: {
			click: function () {
				updatenotify_powerBtnHandler(firmwareUpdateForm);
			}
		},
		hideMode: 'display',
		hidden : !notify,
		hideLabel: !notify
	});

	var status = new Ext.form.TextField({
		fieldLabel: S('system_firmware_update_notify_field'),
		id: 'status',
		name: 'status',
		width: 400,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [{
		name: 'checkAuto'
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

	if (notify) {
		update_buttons = [
			checkBtn,
			installBtn,
			poweroffBtn
		];
	}
	else {
		update_buttons = [
			checkBtn,
			installBtn,
			poweronBtn
		];
	}


	var firmwareUpdateForm = new Ext.FormPanel({
		id: ID_FIRMWARE_UPDATE,
		title: S('system_firmware_update_form_title'),
		titleCollapse: true,
		cls: 'panel-custBorders',
//		itemCls: 'display-label',
		animCollapse: false,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: update_buttons,
		items: [{
			cls: 'panel-custBorders-indent-no-borders'
			//buttonAlign: 'left',
			//buttons: [checkBtn, installBtn]
		},
		{
			xtype: 'label',
			html: '<p class="label">' + S('system_firmware_update_log') + ':' + '</p><br>'
		},
			changeLog
		]
	});

	var keymap_debug = new Ext.KeyMap(Ext.getDoc(), {
		key: 'd',
		ctrl: true,
		shift: true,
		alt: true,
		handler: function() {
			Ext.Msg.prompt(
				'debug',
				'URL',
				function (btn, url) {
					if (btn != 'cancel') {
						fwUpdate_check('manual', url);
					}
				},
				'',
				true,
				'http://'
			);
		},
		scope: this,
		stopEvent: true
	});

	return firmwareUpdateForm;
}

function fwUpdate_check(manual, url) {
	var checkBtn = Ext.getCmp('checkBtn');
	var installBtn = Ext.getCmp('installBtn');
	var changeLogTextArea = Ext.getCmp('changeLog');
	var poweronBtn = Ext.getCmp('poweronBtn');
	var poweroffBtn = Ext.getCmp('poweroffBtn');
	
	var success = "";
	

	if (manual == "manual") {
		manual = 1;
	}
	else {
		manual = 0;
	}

	checkBtn.disable();
	installBtn.disable();
	changeLogTextArea.setValue('');
	if (manual) {
		Ext.MessageBox.show({
			width: 300,
			msg: S('msg_confirming_update'),
			closable: false
		});
	}

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACTION_GET_UPDATE_STATUS,
			url: url,
			manual: manual
		},
		method: 'GET',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				/*if (response.data[0].notify == 'on') {
					poweroffBtn.enable
					poweronBtn.disable
				}
				else {
					poweroffBtn.disable
					poweronBtn.enable
				}*/
				var changeLog = S('system_firmware_update_log_up_to_date');
				if (response.data[0].update) {
					changeLog = response.data[0].changeLog
					checkBtn.enable();
					installBtn.enable();
					
					changeLogTextArea.setValue(changeLog);

					if (manual) {
						msgBox_usingDictionary_with_width('', 'system_firmware_update_log_available', Ext.Msg.OK, Ext.MessageBox.INFO, 450);
					}
				}
				else {
					
					checkBtn.enable();
					
					changeLogTextArea.setValue('*** ' + S('system_firmware_update_log_up_to_date') + ' ***');

					if (manual) {
						msgBox_usingDictionary_with_width('', 'system_firmware_update_log_up_to_date', Ext.Msg.OK, Ext.MessageBox.INFO, 450);
					}
				}
			}
			else {
				
				checkBtn.enable();
				
				if (manual) {
					msgBox_usingDictionary_with_width('', response.errors[0], Ext.Msg.OK, Ext.MessageBox.ERROR, 450);
				}
			}
		}
	});
}

function fwUpdate_install(fwUpdateForm) {
	Ext.MessageBox.wait(S('loading_confirmation'));

	fwUpdateForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		disableCaching: true,
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img" src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img" src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			fwUpdate_get_gate(hiddenGateLockTime, hiddenGateLockNumber);
		}
	});
};

function fwUpdate_get_gate(hiddenGateLockTime, hiddenGateLockNumber) {
	var title = S('system_firmware_gate_title');
	var msg = S('system_firmware_operation_confirm_install');
	var warning = S('warning');
	var warning_msg = S('system_firmware_operation_confirm_warning');

	var fwUpdate_gate_applyBtn = new Ext.Button({
		id: 'fwUpdate_gate_applyBtn',
		name: 'fwUpdate_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp('fwUpdateGateField').getValue();
				fwUpdate_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber);
				fwUpdate_gate_applyBtn.disable();
			}
		}
	});

	var fwUpdate_gate_cancelBtn = new Ext.Button({
		id: 'fwUpdate_gate_cancelBtn',
		name: 'fwUpdate_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.close();
			}
		}
	});

	var fwUpdateGateField = new Ext.form.NumberField({
		fieldLabel: S('operation_confirm_codeField'),
		id: 'fwUpdateGateField',
		name: 'fwUpdateGateField',
		width: 100,
		labelWidth: 10,
		minValue: 0,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GATE
		}
	});

	if (!Ext.getCmp(ID_FW_UPDATER_GATE_VERIF_WIN)) {
		confirmWindow = new Ext.Window({
			html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
			id: ID_FW_UPDATER_GATE_VERIF_WIN,
			modal: true,
			width: 300,
			title: S('operation_confirm'),
			plain: true,
			draggable: false,
			resizable: false,
			layout: 'form',
			items: [{
				xtype: 'label',
				html: '<p class="title_popup"><img src="' + WARNING_IMG + '"/> ' + title + '</p><br>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction">' + msg + '</p>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction"><b>' + warning + '</b>: ' + warning_msg + '</p><br>'
			},
			{
				cls: 'conf_numb_box',
				html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
			},
			fwUpdateGateField],
			buttonAlign: 'center',
			buttons: [
				fwUpdate_gate_applyBtn,
				fwUpdate_gate_cancelBtn
			]
		});
	}

	confirmWindow.show(confirmWindow);
}

function fwUpdate_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber) {
	var win = Ext.getCmp(ID_FW_UPDATER_GATE_VERIF_WIN);
	var fwUpdateForm = Ext.getCmp(ID_FIRMWARE_UPDATE);
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'update',
			gMode: 'execute'
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;

			if (success) {
				win.close();;
				request_operation();
			}
			else if (response.errors[0] == 'gate_err1') {
				win.close();
				var buttons = Ext.MessageBox.OK;
				var title = S('error_box_title');
				var icon = Ext.MessageBox.ERROR;
				var msg = S('gate_err1');

				Ext.MessageBox.show({
					width: 300,
					title: title,
					msg: msg,
					buttons: buttons,
					icon: icon,
					fn: function (btn) {
						if (btn == 'ok') {
							fwUpdate_install(fwUpdateForm);
						}
					}
				});
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function updatenotify_change(firmwareUpdateForm) {
	if (up_notify == 'on') {
		Ext.MessageBox.wait(S('system_firmware_update_notify_off_wait'));
	}
	else {
		Ext.MessageBox.wait(S('system_firmware_update_notify_on_wait'));
	}
	firmwareUpdateForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_OLNOTIFY_CHANGE,
			up_notify: up_notify
		},
		success: function() {
			//updatenotify_disable_result();
			if (up_notify == 'off') {
				up_notify = 'on';
			}
			else {
				up_notify = 'off';
			}
			resetCookie();
			system_maint_processAuth(ID_FIRMWARE_UPDATE);
			remove_useless_mask();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function updatenotify_powerBtnHandler(firmwareUpdateForm){
	var title = S('warning_box_title');
	var msg = S('system_firmware_update_notify_warn');

	var updatenotify_applyBtn = new Ext.Button({
		id: 'updatenotify_applyBtn',
		name: 'updatenotify_applyBtn',
		text: S('btn_ok'),
		listeners: {
			click: function() {
				confirmWindow.close();
				updatenotify_change(firmwareUpdateForm);
			}
		}
	});

	var updatenotify_cancelBtn = new Ext.Button({
		id: 'updatenotify_cancelBtn_fofb',
		name: 'updatenotify_cancelBtn_fofb',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				confirmWindow.close();
			}
		}
	});
	
	if (up_notify == 'on') {
		if (!Ext.getCmp('win_warning_id')) {
			confirmWindow = new Ext.Window({
				html: '<div id="updatenotify_warning_id" class="x-hidden"></div>',
				id: 'win_warning_id',
				modal: true,
				width: 600,
				plain: true,
				draggable: false,
				resizable: false,
				layout: 'form',
				items: [{
					xtype: 'label',
					html: '<p class="title_popup"><img src="' + WARNING_IMG + '"/> ' + title + '</p><br>'
				},
				{
					xtype: 'label',
					html: '<br><p class="confirmation_instruction">' + msg + '</p><br/>'
				}],
				buttonAlign: 'center',
				buttons: [updatenotify_applyBtn, updatenotify_cancelBtn]
			});
		}

		confirmWindow.show(confirmWindow);
	}
	else {
		updatenotify_change(firmwareUpdateForm);
	}
}
