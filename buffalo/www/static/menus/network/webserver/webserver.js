var webserver_jsonData;

function webserver_processAuth_trash() {
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
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function webserver_display_mode() {
	var webserver = new Ext.form.TextField({
		fieldLabel: S('net_webserver_webserver'),
		id: 'webserver',
		name: 'webserver',
		width: 250,
		readOnly: true
	});

	var port = new Ext.form.TextField({
		fieldLabel: S('net_webserver_port'),
		id: 'port',
		name: 'port',
		width: 50,
		readOnly: true
	});

	var target = new Ext.form.TextField({
		fieldLabel: S('net_webserver_target'),
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
		name: 'webserver',
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
			webserver_modify(webserverForm);
		}
	});

	var webserverForm = new Ext.FormPanel({
		title: S('net_webserver_title'),
		frame: false,
		id: ID_WEBSERVER_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [webserver, port, target],
		buttons: [btn_modify_settings],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return webserverForm;
}

function webserver_editMode() {
	var webserver_on = new Ext.form.Radio({
		boxLabel: S('enable'),
		name: 'webserver',
		id: 'webserver_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(webserver_on, checked) {
				if (checked) {
					webserver_off.setValue(false);
					this.checked = true;
					port.enable();
					target.enable();
				}
			}
		}
	});

	var webserver_off = new Ext.form.Radio({
		boxLabel: S('disable'),
		name: 'webserver',
		id: 'webserver_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(webserver_off, checked) {
				if (checked) {
					this.checked = true;
					webserver_on.setValue(false);
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
		fieldLabel: S('net_webserver_port'),
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
			bufaction: BUFACT_GET_WEBSERVER_LIST
		},
		root: 'data',
		fields: [{
			name: 'opt'
		}, {
			name: 'val'
		}]
	});

	var target = new Ext.form.ComboBox({
		id: 'webServerTarget',
		hiddenName: 'target',
		fieldLabel: S('net_webserver_target'),
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
		handler: function(f) {
			webserver_apply(webserverForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			webserver_cancel(webserverForm);
		}
	});

	var jReaderFields = [{
		name: 'webserver',
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
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var webserverForm = new Ext.FormPanel({
		title: S('net_webserver_title'),
		frame: false,
		id: ID_WEBSERVER_FORM,
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
				html: '<p class="label">' + S('net_webserver_webserver') + ':</p>'
			}, {
				layout: 'form',
				columnWidth: .15,
				items: [webserver_on]
			}, {
				layout: 'form',
				columnWidth: .20,
				items: [webserver_off]
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

	return webserverForm;
}

function webserver_apply(editForm) {
	var target = Ext.getCmp('webServerTarget').getValue();
	var target_real = Ext.getCmp('target_real').getValue();

	editForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_WEBSERVER_SETTINGS,
			target: target
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			editForm.destroy();
			webserverForm = webserver_display_mode();
			insertToCentralContainer(SYSTEM_RENDER_TO, webserverForm, webserverRenderBefore);
			webserver_load_form(webserverForm);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function webserver_cancel(editForm) {
	editForm.destroy();
	var editForm = webserver_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, editForm, webserverRenderBefore);
	editForm.form.setValues(webserver_jsonData);
	webserver_format_display();
}

function webserver_modify(displayForm) {
	displayForm.destroy();
	var editForm = webserver_editMode();
	insertToCentralContainer(SYSTEM_RENDER_TO, editForm, webserverRenderBefore);
	editForm.form.setValues(webserver_jsonData);
	webserver_format_edit_mode(webserver_format_edit_mode);
}

function webserver_format_edit_mode(webserver_jsonData){
	var webserverVal = webserver_jsonData.webserver;
	var webserver_on = Ext.getCmp('webserver_on');
	var webserver_off = Ext.getCmp('webserver_off');
	var webServerTarget = Ext.getCmp('webServerTarget');
	var port = Ext.getCmp('port');
	var applyBtn = Ext.getCmp('applyBtn');
	var store = webServerTarget.store;

	store.load({
		callback: function(r, opt, success) {
			var result = store.reader.jsonData.success;
			if (result) {
				applyBtn.enable();
/*
				webServerTarget.setValue(webserver_jsonData.target);
				if (webserverVal == 'on') {
					webserver_on.setValue(true);
					port.enable();
					webServerTarget.enable();
				}
				else {
					webserver_off.setValue(true);
					port.disable();
					webServerTarget.disable();
				}
*/
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function webserver_format_display(){
	var webserverField = Ext.getCmp('webserver');
	var webserver = webserver_jsonData.webserver;
	if (webserver == 'on') {
		webserverField.setValue(S('enabled'));
	}
	else {
		webserverField.setValue(S('disabled'));
	}
}

function webserver_load_form(webserverForm){
	webserverForm.form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_WEBSERVER_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			webserver_jsonData = resp.data[0];
			webserverForm.form.setValues(webserver_jsonData);
			webserver_format_display();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}
