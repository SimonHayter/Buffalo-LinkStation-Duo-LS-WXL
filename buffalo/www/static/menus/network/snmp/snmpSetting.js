var snmp_jsonData;

Ext.apply(Ext.form.VTypes, {
	IPAddress:	function(v) {
		return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
	},
	IPAddressMask: /[\d\.]/i
});

Ext.apply(Ext.form.VTypes, {
	SnmpName: function(val, field) {
		return (val.match(/[\'\"\\]/) == null);
	}
});

function snmp_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				snmp_createMainForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function snmp_createMainForm() {
	var snmpForm = snmp_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, snmpForm);

	snmpForm.form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_SNMP_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			snmp_jsonData = resp.data[0];
			snmpForm.form.setValues(snmp_jsonData);
			snmp_format_display();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function snmp_display_mode() {
	var snmp = new Ext.form.TextField({
		fieldLabel: S('net_snmp'),
		id: 'snmp',
		name: 'snmp',
		width: 250,
		readOnly: true
	});

	var community_name = new Ext.form.TextField({
		fieldLabel: S('net_snmp_community_name'),
		id: 'community_name',
		name: 'community_name',
		width: 400,
		readOnly: true
	});

	var trap_notify = new Ext.form.TextField({
		fieldLabel: S('net_snmp_trap_notify'),
		id: 'trap_notify',
		name: 'trap_notify',
		readOnly: true
	});

	var trap_notify_community_name_1 = new Ext.form.TextField({
		fieldLabel: S('net_snmp_trap_notify_community_name_1'),
		id: 'trap_notify_community_name_1',
		name: 'trap_notify_community_name_1',
		readOnly: true
	});
		
	var trap_notify_ip_1 = new Ext.form.TextField({
		fieldLabel: S('net_snmp_trap_notify_ip_1'),
		id: 'trap_notify_ip_1',
		name: 'trap_notify_ip_1',
		width: 400,
		readOnly: true
	});

	var jReader = new Ext.data.JsonReader({
			root: 'data'
		}, [
			{name: 'snmp'},
			{name: 'community_name'},
			{name: 'trap_notify'},
			{name: 'trap_notify_community_name_1'},
			{name: 'trap_notify_ip_1'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	}, {
		name: 'msg'
	}]);

	var snmpModifySettingBtn = new Ext.Button({
		text: S('btn_modify_settings'),
		id: 'snmpModifySettingBtn',
		disabled: true,
		handler: function(f) {
			snmp_modify(snmpForm);
		}
	});

	var snmpForm = new Ext.FormPanel({
		title: S('net_snmp_title'),
		frame: false,
		id: ID_SNMP_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [
			snmp,
			community_name,
			trap_notify,
			trap_notify_community_name_1,
			trap_notify_ip_1
			],
		buttons: [
			snmpModifySettingBtn
			],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return snmpForm;
}

function snmp_editMode() {
	var snmp_on = new Ext.form.Radio({
		boxLabel: S('enable'),
		name: 'snmp',
		id: 'snmp_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(snmp_on, checked) {
				if (checked) {
					snmp_off.setValue(false);
					this.checked = true;
					
					community_name.enable();
					trap_notify_on.enable();
					trap_notify_off.enable();
					
					community_name.isValid(false);
					trap_notify_community_name_1.isValid(false);
					trap_notify_ip_1.isValid(false);
					
					if (trap_notify_on.getValue()) {
						trap_notify_community_name_1.enable();
						trap_notify_ip_1.enable();
					}
				}
			}
		}
	});

	var snmp_off= new Ext.form.Radio({
		boxLabel: S('disable'),
		name: 'snmp',
		id: 'snmp_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(snmp_off, checked) {
				if (checked) {
					this.checked = true;
					snmp_on.setValue(false);
					
					community_name.clearInvalid();
					trap_notify_community_name_1.clearInvalid();
					trap_notify_ip_1.clearInvalid();
					
					community_name.disable();
					trap_notify_community_name_1.disable();
					trap_notify_on.disable();
					trap_notify_off.disable();
					trap_notify_ip_1.disable();
				}
			}
		}
	});

	var community_name = new Ext.form.TextField({
		fieldLabel: S('net_snmp_community_name'),
		id: 'community_name',
		name: 'community_name',
		width: 400,
		vtype: 'SnmpName',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxLength: MAX_BUFF_SNMP_NAME
		},
		minLength: 1,
		disableKeyFilter: false,
		allowBlank: false
	});

	var trap_notify_on = new Ext.form.Radio({
		boxLabel: S('enable'),
		name: 'trap_notify',
		id: 'trap_notify_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(trap_notify_on, checked) {
				if (checked) {
					trap_notify_off.setValue(false);
					this.checked = true;
					
					trap_notify_community_name_1.isValid(false);
					trap_notify_ip_1.isValid(false);
					
					trap_notify_community_name_1.enable();
					trap_notify_ip_1.enable();
				}
			}
		}
	});

	var trap_notify_off= new Ext.form.Radio({
		boxLabel: S('disable'),
		name: 'trap_notify',
		id: 'trap_notify_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(trap_notify_off, checked) {
				if (checked) {
					this.checked = true;
					trap_notify_on.setValue(false);
					trap_notify_community_name_1.clearInvalid();
					trap_notify_ip_1.clearInvalid();
					
					trap_notify_community_name_1.disable();
					trap_notify_ip_1.disable();
				}
			}
		}
	});

	var trap_notify_community_name_1 = new Ext.form.TextField({
		fieldLabel: S('net_snmp_trap_notify_community_name_1'),
		id: 'trap_notify_community_name_1',
		name: 'trap_notify_community_name_1',
		vtype: 'SnmpName',
		width: 400,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxLength: MAX_BUFF_SNMP_NAME
		},
		minLength: 1,
		disableKeyFilter: false,
		allowBlank: false
	});

	var trap_notify_ip_1 = new Ext.form.TextField({
		fieldLabel: S('net_snmp_trap_notify_ip_1'),
		id: 'trap_notify_ip_1',
		name: 'trap_notify_ip_1',
		width: 200,
		vtype: 'IPAddress',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxLength: MAX_FIELD_LENGTH_IP
		},
		minLength: 7,
		disableKeyFilter: false,
		allowBlank: false
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		id: 'applyBtn',
		handler: function(f) {
			snmp_apply(snmpForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			snmp_cancel(snmpForm);
		}
	});

	var jReaderFields = [{
		name: 'snmp',
		name: 'community_name',
		name: 'trap_notify',
		name: 'trap_notify_community_name_1',
		name: 'trap_notify_ip_1'
	}];

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	jReaderFields);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{
			name: 'id'
		}, {
			name: 'msg'
		}
	]);

	var snmpForm = new Ext.FormPanel({
		title: S('net_snmp_title'),
		frame: false,
		id: ID_SNMP_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .25,
				html: '<p class="label">' + S('net_snmp') + ':</p>'
			}, {
				layout: 'form',
				columnWidth: .15,
				items: [snmp_on]
			}, {
				layout: 'form',
				columnWidth: .20,
				items: [snmp_off]
			}]
		},
		community_name,
		{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .25,
				html: '<p class="label">' + S('net_snmp_trap_notify') + ':</p>'
			}, {
				layout: 'form',
				columnWidth: .15,
				items: [trap_notify_on]
			}, {
				layout: 'form',
				columnWidth: .20,
				items: [trap_notify_off]
			}]
		},
		trap_notify_community_name_1,
		trap_notify_ip_1
		],
		buttons: [applyBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return snmpForm;
}

function snmp_apply(editForm) {
	editForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_SNMP_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			editForm.destroy();
			snmp_createMainForm();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function snmp_cancel(editForm) {
	editForm.destroy();
	var editForm = snmp_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(snmp_jsonData);
	snmp_format_display();
}

function snmp_modify(displayForm) {
	displayForm.destroy();
	var editForm = snmp_editMode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(snmp_jsonData);
}

function snmp_format_display(){
	var snmpField = Ext.getCmp('snmp');
	var community_nameField = Ext.getCmp('community_name');
	var trap_notifyField = Ext.getCmp('trap_notify');
	var trap_notify_community_name_1Field = Ext.getCmp('trap_notify_community_name_1');
	var trap_notify_ip_1Field = Ext.getCmp('trap_notify_ip_1');
	var snmpModifySettingBtn = Ext.getCmp('snmpModifySettingBtn');

	if (snmpField.value == 'on') {
		snmpField.setValue(S('enabled'));
		
		if (trap_notifyField.value == 'on') {
			trap_notifyField.setValue(S('enabled'));
		}
		else {
			trap_notifyField.setValue(S('disabled'));
			trap_notify_community_name_1Field.setValue('-');
			trap_notify_ip_1Field.setValue('-');
		}
	}
	else {
		snmpField.setValue(S('disabled'));
		community_nameField.setValue('-');
		trap_notifyField.setValue('-');
		trap_notify_community_name_1Field.setValue('-');
		trap_notify_ip_1Field.setValue('-');
	}

	snmpModifySettingBtn.enable();
}
