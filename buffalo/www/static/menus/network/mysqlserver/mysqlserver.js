var mysqlserver_jsonData;

function mysqlserver_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				mysqlserver_createMainForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function mysqlserver_createMainForm() {
	var mysqlserverForm = mysqlserver_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, mysqlserverForm);

	mysqlserverForm.form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_MYSQLSERVER_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			mysqlserver_jsonData = resp.data[0];
			mysqlserverForm.form.setValues(mysqlserver_jsonData);
			mysqlserver_format_display();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function mysqlserver_display_mode() {
	var mysqlserver = new Ext.form.TextField({
		fieldLabel: S('net_mysqlserver'),
		id: 'mysqlserver',
		name: 'mysqlserver',
		width: 250,
		readOnly: true
	});

	var port = new Ext.form.TextField({
		fieldLabel: S('net_mysqlserver_port'),
		id: 'port',
		name: 'port',
		width: 50,
		readOnly: true
	});

	var target = new Ext.form.TextField({
		fieldLabel: S('net_mysqlserver_data_folder'),
		id: 'target',
		name: 'target',
		width: 250,
		readOnly: true
	});

	var target_real = new Ext.form.TextField({
		id: 'target_real',
		name: 'target_real'
	});

	var jReaderFields = [{
		name: 'mysqlserver',
		name: 'port',
		name: 'target',
		name: 'target_real'
	}];

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	jReaderFields);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	}, {
		name: 'msg'
	}]);

	var btn_modify_settings = new Ext.Button({
		text: S('btn_modify_settings'),
		enabled: true,
		handler: function(f) {
			mysqlserver_modify(mysqlserverForm);
		}
	});

	var openAdminBtn = new Ext.Button({
		text: S('net_mysqlserver_phpadmin_btn'),
		id: 'openAdminBtn',
		disabled: true,
		handler: function(f) {
			mysqlserver_openAdmin(mysqlserverForm);
		}
	});

	var mysqlserverForm = new Ext.FormPanel({
		title: S('net_mysqlserver_title'),
		frame: false,
		id: ID_MYSQLSERVER_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [mysqlserver, port, target],
		buttons: [btn_modify_settings, openAdminBtn],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return mysqlserverForm;
}

function mysqlserver_editMode() {
	var mysqlserver_on = new Ext.form.Radio({
		boxLabel: S('enable'),
		name: 'mysqlserver',
		id: 'mysqlserver_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(mysqlserver_on, checked) {
				if (checked) {
					mysqlserver_off.setValue(false);
					this.checked = true;
					port.enable();
					target.enable();
				}
			}
		}
	});

	var mysqlserver_off= new Ext.form.Radio({
		boxLabel: S('disable'),
		name: 'mysqlserver',
		id: 'mysqlserver_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(mysqlserver_off, checked) {
				if (checked) {
					this.checked = true;
					mysqlserver_on.setValue(false);
					port.disable();
					port.clearInvalid();
					target.disable();
					target.clearInvalid();
				}
			}
		}
	});

	var port = new Ext.form.NumberField({
		id: 'port',
		name: 'port',
		fieldLabel: S('net_mysqlserver_port'),
		width: 50,
		allowDecimals: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "5",
			autocomplete: "off",
			maxlength: MAX_EXTERNAL_PORT
		},
		minValue: 1,
		maxValue: 65535,
		disableKeyFilter: true,
		allowBlank: false
	});

	var store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_MYSQLSERVER_LIST
		},
		root: 'data',
		fields: [{
			name: 'opt'
		}, {
			name: 'val'
		}]
	});

	var target = new Ext.form.ComboBox({
		id: 'mysqlserverTarget',
		hiddenName: 'target',
		fieldLabel: S('net_mysqlserver_data_folder'),
		store: store,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		listWidth: 200,
		width: 200,
		editable: false,
		disabled: true,
		emptyText: S('select_one'),
		allowBlank: false
	});

	var target_real = new Ext.form.TextField({
		id: 'target_real',
		name: 'target_real',
		labelSeparator: '',
		hidden: true
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		id: 'applyBtn',
		disabled: true,
		handler: function(f) {
			mysqlserver_apply(mysqlserverForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			mysqlserver_cancel(mysqlserverForm);
		}
	});

	var jReaderFields = [{
		name: 'mysqlserver',
		name: 'port',
		name: 'target',
		name: 'target_real',

		name: 'webserver',
		name: 'webserver_port'
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

	var mysqlserverForm = new Ext.FormPanel({
		title: S('net_mysqlserver_title'),
		frame: false,
		id: ID_MYSQLSERVER_FORM,
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
				html: '<p class="label">' + S('net_mysqlserver') + ':</p>'
			}, {
				layout: 'form',
				columnWidth: .15,
				items: [mysqlserver_on]
			}, {
				layout: 'form',
				columnWidth: .20,
				items: [mysqlserver_off]
			}]
		},
		port,
		target,
		target_real
		],
		buttons: [applyBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return mysqlserverForm;
}

function mysqlserver_apply(editForm) {
	var target = Ext.getCmp('mysqlserverTarget').getValue();
	var target_real = Ext.getCmp('target_real').getValue();

	editForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_MYSQLSERVER_SETTINGS,
			target: target
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			editForm.destroy();
			mysqlserver_createMainForm();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function mysqlserver_openAdmin(editForm) {
	var port = mysqlserver_jsonData.webserver_port;
	window.open('http://' + window.location.host + ':' + port + '/phpMyAdmin/');
}

function mysqlserver_cancel(editForm) {
	editForm.destroy();
	var editForm = mysqlserver_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(mysqlserver_jsonData);
	mysqlserver_format_display();
}

function mysqlserver_modify(displayForm) {
	displayForm.destroy();
	var editForm = mysqlserver_editMode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(mysqlserver_jsonData);
	mysqlserver_format_edit_mode(mysqlserver_jsonData);
}

function mysqlserver_format_edit_mode(mysqlserver_jsonData){
	var mysqlserverField = mysqlserver_jsonData.mysqlserver;
	var mysqlserver_on = Ext.getCmp('mysqlserver_on');
	var mysqlserver_off = Ext.getCmp('mysqlserver_off');
	var mysqlserverTarget = Ext.getCmp('mysqlserverTarget');
	var port = Ext.getCmp('port');
	var applyBtn = Ext.getCmp('applyBtn');
	var store = mysqlserverTarget.store;

	store.load({
		callback: function(r, opt, success) {
			var result = store.reader.jsonData.success;
			if (result) {
				applyBtn.enable();
/*
				mysqlserverTarget.setValue(mysqlserver_jsonData.target);
				if (mysqlserverField == 'on') {
					mysqlserver_on.setValue(true);
					port.enable();
					mysqlserverTarget.enable();
				}
				else {
					mysqlserver_off.setValue(true);
					port.disable();
					mysqlserverTarget.disable();
				}
*/
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function mysqlserver_format_display(){
	var mysqlserverField = Ext.getCmp('mysqlserver');
	var openAdminBtn = Ext.getCmp('openAdminBtn');

	var mysqlserverVal = mysqlserver_jsonData.mysqlserver;
	var webserverVal = mysqlserver_jsonData.webserver;

	if (mysqlserverVal == 'on') {
		mysqlserverField.setValue(S('enabled'));
	}
	else {
		mysqlserverField.setValue(S('disabled'));
	}

	if ((mysqlserverVal == 'on') && (webserverVal == 'on')) {
		openAdminBtn.enable();
	}
}
