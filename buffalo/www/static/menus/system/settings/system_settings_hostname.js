function create_hostname_form_display_mode() {
	var hostName = new Ext.form.TextField({
		id: 'hostName',
		name: 'hostName',
		fieldLabel: S('hostname_field'),
		width: 200,
		readOnly: true
	});

	var hostDesc = new Ext.form.TextField({
		id: 'hostDesc',
		name: 'hostDesc',
		fieldLabel: S('hostDesc_field'),
		width: 200,
		readOnly: true
	});

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_modify_settings'),
		disabled: true,
		listeners: {
			click: function () {
				hostname_editBtnHandler(hostnameForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'hostName'
	},
	{
		name: 'hostDesc'
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

	var items;
	if (add_iscsi) {
		items = [hostName];
	}
	else {
		items = [hostName, hostDesc];
	}

	var hostnameForm = new Ext.FormPanel({
		id: ID_NAME_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		title: S('hostname_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_editBtn],
		items: items,
		titleCollapse: true
	});

	return hostnameForm;
}

function create_hostname_form_edit_mode() {
	var hostName = new Ext.form.TextField({
		id: 'hostName',
		name: 'hostName',
		fieldLabel: S('hostname_field'),
		width: 200
	});

	var hostDesc = new Ext.form.TextField({
		id: 'hostDesc',
		name: 'hostDesc',
		fieldLabel: S('hostDesc_field'),
		width: 200
	});

	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name: 'hn_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				hostname_saveBtnHandler(hostnameForm);
			}
		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				hostname_display_mode(hostnameForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'hostName'
	},
	{
		name: 'hostDesc'
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

	var items;
	if (add_iscsi) {
		items = [hostName];
	} else {
		items = [hostName, hostDesc];
	}

	var hostnameForm = new Ext.FormPanel({
		id: ID_NAME_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		title: S('hostname_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn],
		items: items,
		titleCollapse: true
	});

	return hostnameForm;
}

function hostname_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_HOSTNAME
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			hName_jsonData = hnForm.form.getValues();
			hostname_display_mode(hnForm);
			getLeftPanelInfo_topOnly(2);
		}
	});
}

function hostname_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_hostname_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, hName_renderBefore);
	hform_display.form.setValues(hName_jsonData);
	hform_display.expand(true);
}

function hostname_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_hostname_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, hName_renderBefore);
	hform_edit.form.setValues(hName_jsonData);
	hostname_check_iscsi();
	hform_edit.expand(true);
}

function hostname_check_iscsi() {
	if (add_iscsi && IS_ISCSI_RUNNING) {
		Ext.getCmp('hn_editBtn').disable();
	}
	else {
		Ext.getCmp('hn_editBtn').enable();
	}
}
