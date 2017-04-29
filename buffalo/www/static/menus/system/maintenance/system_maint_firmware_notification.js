function create_firmware_notification_display_mode() {
	var checkAuto = new Ext.form.TextField({
		fieldLabel: S('system_firmware_notification_check_update'),
		name: 'checkAuto',
		id: 'checkAuto',
		width: 250,
		readOnly: true
	});

	var modifySettings = new Ext.Button({
		name: 'modifySettings',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				modifySettingsBtnHandler(firmwareUpdateForm);
			}
		}
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

	var firmwareUpdateForm = new Ext.FormPanel({
		id: ID_FIRMWARE_NOTIFICATION,
		reader: jReader,
		errorReader: jErrReader,
		animCollapse: false,
		title: S('system_firmware_notification_form_title'),
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [modifySettings],
		items: [checkAuto],
		titleCollapse: true,
		itemCls: 'display-label',
		cls: 'panel-custBorders'
	});

	return firmwareUpdateForm;
}

function modifySettingsBtnHandler(firmwareUpdateForm) {
	var displayForm = Ext.getCmp(ID_FIRMWARE_NOTIFICATION);
	displayForm.destroy();

	var edit_form = create_firmware_notification_edit_mode();
	insertToCentralContainer(SHARED_FOLDER_RENDER_TO, edit_form, fwNotificationRenderBefore);
	fw_notif_fieldValuesHandler_edit(fw_notif_jsonData)
	edit_form.expand(false);
}

function create_firmware_notification_edit_mode() {
	var check_enable = new Ext.form.Radio({
		id: 'checkAutoEn',
		name: 'checkAuto',
		hideLabel: true,
		boxLabel: S('enable'),
		inputValue: 'on'
	});

	var check_disable = new Ext.form.Radio({
		id: 'checkAutoDis',
		name: 'checkAuto',
		boxLabel: S('disable'),
		inputValue: 'off'
	});

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function (f) {
			fw_notif_saveBtnHandler(firmwareUpdateForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function () {
			var editForm = Ext.getCmp(ID_FIRMWARE_NOTIFICATION);
			editForm.destroy();
			var display_form = create_firmware_notification_display_mode();
			insertToCentralContainer(SHARED_FOLDER_RENDER_TO, display_form, fwNotificationRenderBefore);
			display_form.expand(false);
		}
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

	var firmwareUpdateForm = new Ext.FormPanel({
		id: ID_FIRMWARE_NOTIFICATION,
		reader: jReader,
		errorReader: jErrReader,
		animCollapse: false,
		title: S('system_firmware_notification_form_title'),
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [saveBtn, cancelBtn],
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('system_firmware_notification_check_update') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [check_enable]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [check_disable]
			}]
		}],
		titleCollapse: true,
		itemCls: 'display-label',
		cls: 'panel-custBorders'
	});

	return firmwareUpdateForm;
}

function fw_notif_saveBtnHandler(firmwareUpdateForm_edit) {
	firmwareUpdateForm_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACTION_SET_UPDATES
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			fw_notif_jsonData = firmwareUpdateForm_edit.form.getValues();
			firmwareUpdateForm_edit.destroy();
			firmwareUpdate_display = create_firmware_notification_display_mode();
			insertToCentralContainer(SYSTEM_RENDER_TO, firmwareUpdate_display, fwNotificationRenderBefore);
			firmwareUpdate_display.form.setValues(fw_notif_jsonData);
			firmwareUpdate_display.expand(false);
		}
	});
}

function fw_notif_fieldValuesHandler_edit(fw_notif_jsonData) {
	if (fw_notif_jsonData.checkAuto == 'on') {
		Ext.getCmp('checkAutoEn').setValue(true);
	}
	else {
		Ext.getCmp('checkAutoDis').setValue(true);
	}

}
