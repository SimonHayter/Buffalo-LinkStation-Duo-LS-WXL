var subnet_list = [
	'255.255.255.252',	'255.255.255.248',	'255.255.255.240',	'255.255.255.224',	'255.255.255.192',
	'255.255.255.128',	'255.255.255.0',	'255.255.254.0',	'255.255.252.0',	'255.255.248.0',
	'255.255.240.0',	'255.255.224.0',	'255.255.192.0',	'255.255.128.0',	'255.255.0.0',
	'255.254.0.0',		'255.252.0.0',		'255.248.0.0',		'255.240.0.0',		'255.224.0.0',
	'255.192.0.0',		'255.128.0.0',		'255.0.0.0',		'254.0.0.0',		'252.0.0.0',
	'248.0.0.0',		'240.0.0.0',		'224.0.0.0',		'192.0.0.0',		'128.0.0.0'
];

function nfs_form_display_mode() {
	var nfsStatus = new Ext.form.TextField({
		id: 'nfsStatus',
		name: 'nfsStatus',
		fieldLabel: S('net_settings_nfs'),
		width: 200,
		readOnly: true
	});

	var nfsIp = new Ext.form.TextField({
		id: 'nfsIp',
		name: 'ipAddr',
		fieldLabel: S('net_settings_nfs_service_network'),
		width: 200,
		readOnly: true
	});

	var nfsSubMsk = new Ext.form.TextField({
		name: 'subMsk',
		fieldLabel: S('net_settings_nfs_service_subnet'),
		width: 200,
		readOnly: true
	});

	var nfsMode = new Ext.form.TextField({
		id: 'nfsMode',
		name: 'nfsMode',
		fieldLabel: S('net_settings_nfs_service_mode'),
		width: 200,
		readOnly: true
	});

	var editBtn = new Ext.Button({
		id: 'editBtn',
		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				nfs_editBtnHandler(nfsForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'nfsStatus'
	},
	{
		name: 'ipAddr'
	},
	{
		name: 'subMsk'
	},
	{
		name: 'nfsMode'
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

	var nfsForm = new Ext.FormPanel({
		id: ID_NFS_IP_SETTINGS_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls: 'panel-custBorders',
//		ctCls: 'toggle-button-left',
		collapsible: true,
		autoHeight: true,
		width: 640,
		labelWidth: 160,
		title: S('net_settings_nfs_serviceTitle'),
		reader: jReader,
		buttonAlign: 'left',
		errorReader: jErrReader,
		items: [
			nfsStatus,
			nfsIp,
			nfsSubMsk,
			nfsMode
		],
		buttons: [editBtn],
		collapseFirst: true,
		collapsed: false,
		titleCollapse: true
	});

	return nfsForm;
}

function nfs_form_edit_mode() {
	// ....: Create form ITEMS :....
	var nfsEnabled = new Ext.form.Radio({
		id: 'nfsEnabled',
		hideLabel: true,
		name: 'nfsStatus',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (nfsEnabled, checked) {
				var form = Ext.getCmp(ID_NFS_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					for (var i = 1; i < form.items.length; i++) {
						c = form.getComponent(i);
						c.enable();
					}
					nfsMode_user.enable();
					nfsMode_kernel.enable();

					nfsDisabled.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var nfsDisabled = new Ext.form.Radio({
		id: 'nfsDisabled',
		name: 'nfsStatus',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (nfsDisabled, checked) {
				var form = Ext.getCmp(ID_NFS_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					for (var i = 1; i < form.items.length - 1; i++) {
						c = form.getComponent(i);
						c.disable();
						c.readOnly = false;
					}
					nfsMode_user.disable();
					nfsMode_kernel.disable();

					nfsEnabled.setValue(false);
					this.checked = true;
					nfsIp.clearInvalid();
					nfsSubMsk.clearInvalid();
				}
			}
		}
	});

	var nfsIp = new Ext.form.TextField({
		id: 'nfsIp',
		name: 'ipAddr',
		fieldLabel: S('net_settings_nfs_service_network'),
		width: 200,
		maxLength: 15,
		minLength: 7,
		disabled: true,
		allowBlank: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var nfsSubMsk = new Ext.form.TextField({
		id: 'nfsSubMsk',
		name: 'subMsk',
		fieldLabel: S('net_settings_nfs_service_subnet'),
		width: 200,
		maxLength: 15,
		minLength: 7,
		disabled: true,
		allowBlank: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var nfsMode_user = new Ext.form.Radio({
		id: 'nfsMode_user',
		hideLabel: true,
		name: 'nfsMode',
		boxLabel: S('net_settings_nfs_service_mode_user'),
		inputValue: 'user',
		listeners: {
			check: function (nfsEnabled, checked) {
				var form = Ext.getCmp(ID_NFS_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					nfsMode_kernel.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var nfsMode_kernel = new Ext.form.Radio({
		id: 'nfsMode_kernel',
		name: 'nfsMode',
		boxLabel: S('net_settings_nfs_service_mode_kernel'),
		inputValue: 'kernel',
		listeners: {
			check: function (nfsDisabled, checked) {
				var form = Ext.getCmp(ID_NFS_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					nfsMode_user.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				nfs_saveBtnHandler(nfsForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				nfs_cancelBtnHandler(nfsForm);
				set_nfs_status_display(nfs_setup_jsonData);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'nfsStatus'
	},
	{
		name: 'ipAddr'
	},
	{
		name: 'subMsk'
	},
	{
		name: 'nfsMode'
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

	// ....: Create IP settings FORM and add FIELDSETS :....
	var nfsForm = new Ext.FormPanel({
		id: ID_NFS_IP_SETTINGS_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		collapsible: true,
		autoHeight: true,
		width: 640,
		labelWidth: 160,
		title: S('net_settings_nfs_serviceTitle'),
		reader: jReader,
		buttonAlign: 'left',
		errorReader: jErrReader,
		items: [{
			id: 'nfsStatusEdit',
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('net_settings_nfs') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [nfsEnabled]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [nfsDisabled]
			}]
		},
		nfsIp,
		nfsSubMsk,
		{
			id: 'nfsModeEdit',
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('net_settings_nfs_service_mode') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [nfsMode_user]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [nfsMode_kernel]
			}]
		}],
		buttons: [saveBtn, cancelBtn],
		collapseFirst: true,
		titleCollapse: true
	});

	return nfsForm;
}

function nfs_saveBtnHandler(nfs_edit) {
	nfs_setup_jsonData = nfs_edit.form.getValues();

	nfs_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_NFS_SERVICE_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		success: function () {
			resetCookie();
			nfs_edit.destroy();
			nfs_display = nfs_form_display_mode();
			insertToCentralContainer(NETWORK_RENDER_TO, nfs_display, nfsServiceRenderBefore);
			nfs_display.form.setValues(nfs_setup_jsonData);
			set_nfs_status_display(nfs_setup_jsonData);
			nfs_display.expand(true);
		},
		failure: function (form, action) {
			formFailureFunction(action);
		}
	});
}

function nfs_editBtnHandler(nfs_edit) {
	nfs_edit.destroy();
	nfs_display = nfs_form_edit_mode();
	insertToCentralContainer(NETWORK_RENDER_TO, nfs_display, nfsServiceRenderBefore);
	nfs_display.form.setValues(nfs_setup_jsonData);
	nfs_radioSelection(nfs_setup_jsonData);
	nfs_display.expand(true);
}

function nfs_cancelBtnHandler(nfs_display) {
	nfs_display.destroy();
	nfs_edit = nfs_form_display_mode();
	insertToCentralContainer(NETWORK_RENDER_TO, nfs_edit, nfsServiceRenderBefore);
	nfs_edit.form.setValues(nfs_setup_jsonData);
	set_nfs_status_display(nfs_setup_jsonData);
	nfs_edit.expand(true);
}

function nfs_radioSelection(data) {
	selectedMethod_status = data.nfsStatus;
	selectedMethod_mode = data.nfsMode;

	nfsRadioEn = Ext.getCmp('nfsEnabled');
	nfsRadioDis = Ext.getCmp('nfsDisabled');
	nfsModeUser = Ext.getCmp('nfsMode_user');
	nfsModeKernel = Ext.getCmp('nfsMode_kernel');

	if (selectedMethod_status == 'off') {
		nfsRadioDis.setValue(true);
	}
	else {
		nfsRadioEn.setValue(true);
	}

	if (selectedMethod_mode != 'kernel') {
		nfsModeUser.setValue(true);
		nfsModeKernel.setValue(false);
	}
	else {
		nfsModeUser.setValue(false);
		nfsModeKernel.setValue(true);
	}
}

function set_nfs_status_display(data) {
	var selectedMethod_status = data.nfsStatus;
	var nfsStatus_ = Ext.getCmp('nfsStatus');

	var selectedMethod_mode = data.nfsMode;
	var nfsMode_ = Ext.getCmp('nfsMode');

	var valueStatus = '';
	var valueMode = '';

	if (selectedMethod_status == 'off') {
		valueStatus = S('disabled');
	}
	else  {
		valueStatus = S('enabled');
	}

	if (selectedMethod_mode == 'kernel') {
		valueMode = S('net_settings_nfs_service_mode_kernel');
	}
	else  {
		valueMode = S('net_settings_nfs_service_mode_user');
	}

	nfsStatus_.setValue(valueStatus);
	nfsMode_.setValue(valueMode);
}
