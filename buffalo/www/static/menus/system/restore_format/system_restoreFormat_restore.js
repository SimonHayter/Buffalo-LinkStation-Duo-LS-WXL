function create_restore_display_mode() {
	var isHide = false;
	if (add_init_sw === '0') {
		isHide = true;
	}

	var rf_editBtn = new Ext.Button({
		id: 'rf_editBtn',
		name: 'rf_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				restoreForm_display.destroy();
				restoreForm_edit= create_restore_edit_mode();

				insertToCentralContainer(SYSTEM_RENDER_TO, restoreForm_edit, render_restore_form_before);
				restore_show_radio_selection(initsw_jsonData);
			}
		}
	});

	var rf_restoreBtn = new Ext.Button({
		id: 'rf_restoreBtn',
		name: 'rf_restoreBtn',
		text: S('btn_restore_linkstation'),
		listeners: {
			click: function() {
				rf_restoreHandler(restoreForm_display);
				rf_restoreBtn.disable();
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader_display = new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
	},
	[{
		name: 'initButtonOption'
	}

	]);

	var warning;
	if(add_iscsi){
		warning = S('systemRestore_warning_iscsi');
	}
	else{
		warning = S('systemRestore_warning');
	}

	var uponRestore = new Ext.form.TextField({
		id: 'uponRestore',
		name: 'uponRestore',
		fieldLabel: S('uponRestore'),
		width: 250,
		readOnly: true,
		hidden : isHide,
		hideLabel: isHide
	});

	var buttons;
	if (isHide) {
		buttons = [
			rf_restoreBtn
		];
	}
	else {
		buttons = [
			rf_editBtn,
			rf_restoreBtn
		];
	}

	var restoreForm_display = new Ext.FormPanel({
		id: ID_RESTORE_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders',
		title: S('restore_form_title'),
		reader: jReader_display,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: buttons,
		items: [{
			xtype: 'label',
			html: '<p class="label">' + warning + '</p><br>'
		},
		uponRestore],
		titleCollapse: true
	});

	return restoreForm_display;
}

function create_restore_edit_mode() {
	var rf_saveBtn = new Ext.Button({
		id: 'rf_saveBtn',
		name: 'rf_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				rf_saveBtnHandler(restoreForm_edit);
			}
		}
	});

	var rf_cancelBtn = new Ext.Button({
		id: 'rf_cancelBtn',
		name:'rf_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				rf_cancelBtnHandler(restoreForm_edit);
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader_display = new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
	},
	[{
		name: 'initButtonOption'
	}

	]);
	var initButtonOption_on = new Ext.form.Radio({
		id: 'initButtonOption_on',
		hideLabel: true,
		name: 'initButtonOption',
		boxLabel: S('restore_admin_pwd'),
		inputValue: 'on'
	});

	var initButtonOption_off = new Ext.form.Radio({
		id: 'initButtonOption_off',
		hideLabel: true,
		name: 'initButtonOption',
		boxLabel: S('keep_admin_pwd'),
		inputValue: 'off'
	});

	var uponRestore = S('uponRestore') + ': ';

	var restoreForm_edit = new Ext.FormPanel({
		id: ID_RESTORE_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		title: S('restore_form_title'),
		reader: jReader_display,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [rf_saveBtn, rf_cancelBtn],
		items: [{
			xtype: 'label',
			html: '<p class="label">' + uponRestore + '</p><br>'
		},
		initButtonOption_on, initButtonOption_off],
		titleCollapse: true
	});
	return restoreForm_edit;
}

function rf_saveBtnHandler(restoreForm_edit) {
	var restoreOpt = Ext.getCmp('initButtonOption_on');
	var restoreOptValue = restoreOpt.getValue();
	if (restoreOptValue == true) {
		restoreOptValue = 'on';
	}
	else {
		restoreOptValue = 'off';
	}
	
	restoreForm_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_INIT_SETTINGS,
			initButtonOption: restoreOptValue
		},
		waitMsg: S('msg_saving_data'),
		success: function(form, action) {
			resetCookie();
			initsw_jsonData = restoreForm_edit.form.getValues();
			restoreForm_edit.destroy();
			var restoreForm_display = create_restore_display_mode();
			insertToCentralContainer(SYSTEM_RENDER_TO, restoreForm_display, render_restore_form_before);
			restore_show_label_selection(initsw_jsonData);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
};
function rf_restoreHandler(restoreForm) {
	var restoreOpt = initsw_jsonData.initButtonOption;
	Ext.MessageBox.wait(S('loading_confirmation'));

	restoreForm.form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			restore_get_gate(hiddenGateLockTime, hiddenGateLockNumber);
		}
	});
};


function restore_get_gate(hiddenGateLockTime, hiddenGateLockNumber) {
	var title = S('restore_gate_title');
	var msg = S('restore_operation_confirm');

	var restore_gate_applyBtn = new Ext.Button({
		id: 'restore_gate_applyBtn',
		name: 'restore_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				var gNumber = restore_gateField.getValue();
				restore_gate_applyBtn.disable();
				restore_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber);
			}
		}
	});

	var restore_gate_cancelBtn = new Ext.Button({
		id: 'restore_gate_cancelBtn',
		name: 'restore_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				restore_gate_cancelBtn.disable();
				Ext.getCmp('rf_restoreBtn').enable();
				var win = Ext.getCmp(ID_RESTORE_GATE_VERIF_WIN);
				win.hide();
				win.destroy();

				remove_useless_mask();
			}
		}
	});

	var restore_gateField = new Ext.form.NumberField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_RESTORE_GATE_FIELD,
		name: 'restore_gateField',
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

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_RESTORE_GATE_VERIF_WIN,
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
			html: '<br><p class="confirmation_instruction">' + msg + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		restore_gateField],
		buttonAlign: 'center',
		buttons: [
			restore_gate_applyBtn,
			restore_gate_cancelBtn
		]
	});

	confirmWindow.show();
}

function restore_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber) {
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'init',
			gMode: 'restore'
		},
		method: 'POST',
		success: function(result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			var win = Ext.getCmp(ID_RESTORE_GATE_VERIF_WIN);
			if (win) {
				win.hide();
				win.destroy();
			}
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			if (success) {
				resetCookie();
				
				var title = S('restoreLs_committing_changes');
				var titleFormatted = '<p class="title"><img src="' + WARNING_IMG + '" /> &nbsp ' + title + '</p><br>';
				var msg = S('restoreLs_after');
				var msgFormatted = '<p class="msg">' + msg + '</p>'
				updateHtmlToContainer(NETWORK_RENDER_TO, titleFormatted);
				addHtmlToContainer(NETWORK_RENDER_TO, msgFormatted);

				if (add_iscsi) {
					show_menus_submenus_disabled_iscsi();
				}
				else {
					show_menus_submenus_disabled();
				}
				highlight_sub_menu(selected_sub_menu);
				highlight_menu(selected_menu);	
			}
			else if (response.errors[0] == 'gate_err1') {
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
					fn: function(btn) {
						if (btn == 'ok') {
							var form = Ext.getCmp(ID_RESTORE_FORM);
							rf_restoreHandler(form);
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

function restore_show_radio_selection(data){
	selectedMethod = data.initButtonOption;
	initswRadioEn = Ext.getCmp('initButtonOption_on');
	initswRadioDis = Ext.getCmp('initButtonOption_off');

	if (selectedMethod == 'on') {
		initswRadioEn.setValue(true);
	}
	else {
		initswRadioDis.setValue(true);
	}
}

function restore_show_label_selection(data){
	var selectedMethod = data.initButtonOption;
	var uponRestore = Ext.getCmp('uponRestore');

	if (selectedMethod == 'on') {
		uponRestore.setValue(S('restore_admin_pwd'));
	}
	else {
		uponRestore.setValue(S('keep_admin_pwd'));
	}
}

function rf_cancelBtnHandler(restoreForm_edit){
	restoreForm_edit.destroy();
	var restoreForm_display = create_restore_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, restoreForm_display, render_restore_form_before);
	restore_show_label_selection(initsw_jsonData);
	restoreForm_display.expand(false);
}
