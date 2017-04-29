function create_wafs_service_form_display_mode(wafs_jsonData) {
	var service = new Ext.form.TextField({
		id: 'wafs_service',
		name: 'service',
		fieldLabel:S('wafs_sercive_field'),
		width: 400,
		readOnly: true
	});

	var status = new Ext.form.TextField({
		fieldLabel: S('wafs_status_field'),
		id: 'wafs_status',
		name: 'status',
		width: 400,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var wafs_editBtn = new Ext.Button({
		id: 'wafs_editBtn',
		name: 'wafs_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() { 
				detailSettings = true;
				wafs_editBtnHandler(wafsServiceForm);
			}
		}
	});

	var wafs_remountBtn = new Ext.Button({
		id: 'wafs_remountBtn',
		name: 'wafs_remountBtn',
		text: S('btn_wafs_remount'),
		disabled: true,
		listeners: {
			click: function() {
				wafs_remountBtnHandler(wafsServiceForm);
			}
		}
	});

	var wafs_initBtn = new Ext.Button({
		id: 'wafs_initBtn',
		name: 'wafs_initBtn',
		text: S('btn_wafs_auth_init'),
		disabled: true,
		listeners: {
			click: function() {
				wafs_initBtnHandler(wafsServiceForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'username'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var wafs_folderStr;
	if (wafs_jsonData.ServiceName == 'WebAxs') {
		wafs_folderStr = wafs_jsonData.PathWin + '<br /><br />' + wafs_jsonData.PathMac;
	}
	else {
		wafs_folderStr = '-';
	}

	var wafsServiceForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_WAFS_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('wafs_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			wafs_editBtn,
			wafs_remountBtn
		],
		titleCollapse: true,
		items: [
			service,
			status,
			{
				autoWidth: true,
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .272,
					html: S('wafs_folder_path_field') + ":"
				}, {
					cls: 'label',
					columnWidth: .728,
					html: wafs_folderStr
				}]
			}
		]
	});

	return wafsServiceForm;
}

function create_wafs_service_form_edit_mode(wafs_jsonData) {
	//var isAuthed = wafs_jsonData.authed;

	var wafs_service_on = new Ext.form.Radio({
		id: 'wafs_service_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(wafs_service_on, checked) {
				if (checked) {
					radioSelection_wafs_service_on();
					wafs_service_off.setValue(false);
				}
			}
		},
		inputValue: 'on'
	});

	var wafs_service_off = new Ext.form.Radio({
		id: 'wafs_service_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(wafs_service_off, checked) {
				if (checked) {
					radioSelection_wafs_service_off();
					wafs_service_on.setValue(false);
				}
			}
		},
		inputValue: 'off'
	});

	var wafs_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});
	
	var wafs_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name:'val'},
			{name:'opt'}
		]
	);
	
	var wafs_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_TIMEMACHINE_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		},
		proxy: wafs_dirProxy,
		reader: wafs_dirJReader
	});

	var wafs_dir = new Ext.form.ComboBox({
		id: 'wafs_dir_combo',
		hiddenName: 'dir',
		fieldLabel: S('wafs_folder_path_field'),
		store: wafs_dirStore,
		editable: false,
		displayField: 'opt',
		emptyText: S('select_one'),
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		allowBlank: false,
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 160,
		autoWidth: true
	});

	var wafs_token = new Ext.form.TextField({
		id: 'wafs_token',
		name: 'wafs_token',
		fieldLabel: S('wafs_auth_token'),
		width: 230,
		//maskRe: /[0-9 -]/,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_BUFF_NAS_NAME
		},
		minLength: 3,
		allowBlank: false,
		hideMode: 'offsets'
		//hidden: isAuthed,
		//hideLabel: isAuthed
	});

	var wafs_user = new Ext.form.TextField({
		id: 'wafs_user',
		name: 'wafs_user',
		fieldLabel: S('wafs_user'),
		width: 230,
		//maskRe: /[0-9 -]/,
		autoCreate: {
			tag: "input",
			type: "text",
			autocomplete: "off"
		},
		allowBlank: false,
		hideMode: 'offsets'
		//hidden: isAuthed,
		//hideLabel: isAuthed
	});

	var wafs_pass = new Ext.form.TextField({
		id: 'wafs_pass',
		name: 'wafs_pass',
		fieldLabel: S('wafs_pass'),
		inputType: 'password',
		width: 230,
		//maskRe: /[0-9 -]/,
		autoCreate: {
			tag: "input",
			type: "text",
			autocomplete: "off"
		},
		allowBlank: false,
		hideMode: 'offsets'
		//hidden: isAuthed,
		//hideLabel: isAuthed
	});

	var wafs_saveFunc = function() {
		wafs_saveBtnHandler(wafsForm);
	}

	var wafs_saveBtn = new Ext.Button({
		id: 'wafs_saveBtn',
		name:'wafs_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				var wafs_service_on = Ext.getCmp('wafs_service_on');
				if (wafs_service_on.getValue()) {
					msgBox_usingDictionary_with_func('', 'wafs_service_warn', Ext.Msg.OK, Ext.MessageBox.WARNING, wafs_saveFunc);
				}
				else {
					wafs_saveFunc();
				}
			}
		}
	});

	var wafs_cancelBtn = new Ext.Button({
		id: 'wafs_cancelBtn',
		name: 'wafs_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				wafs_display_mode(wafsForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'status'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	wafs_dirStore.load({
		callback: function(r, o, s){
			var result = wafs_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	wafs_token.setValue(wafs_jsonData.buffaloNAS0);
	wafs_user.setValue(wafs_jsonData.UserKey0);
	wafs_dir.setValue(wafs_jsonData.MntPoint);

	var wafsForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_WAFS_FORM,
		cls: 'panel-custBorders',
		title: S('wafs_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			wafs_saveBtn,
			wafs_cancelBtn
		],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('wafs_sercive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [wafs_service_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [wafs_service_off]
			}]
		},
		wafs_dir,
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			hideMode: 'offsets',
			//hidden: isAuthed,
			//hideLabel: isAuthed,
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: '<br/ >'
			}, {
				cls: 'label',
				columnWidth: .736,
				html: S('wafs_auth_procedure')/* + '<br /><a href="' + S('wafs_auth_link_url') + '" target="_blank">' + S('wafs_auth_link_name') + '</a>'*/
			}]
		},
		wafs_token,
		wafs_user,
		wafs_pass
		]
	});

	return wafsForm;
}

function wafs_saveBtnHandler(wafsForm) {
	wafsForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_WAFS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			wafsForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_WAFS
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					wafs_jsonData = resp.data[0];
					wafs_display_mode(wafsForm);
				}
			})
		}
	});
}

function wafs_editBtnHandler(wafsForm_display) {
	ValidateSession();
	wafsForm_display.destroy();

	wafsForm_edit = create_wafs_service_form_edit_mode(wafs_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, wafsForm_edit, ID_WEBSERVICE_WAFS_FORM);

	wafsForm_edit.form.setValues(wafs_jsonData);
	radioSelection_wafs_service(wafs_jsonData);
	wafsForm_edit.expand(true);
}

function wafs_display_mode(wafsForm_display) {
	wafsForm_display.destroy();

	wafsForm_display = create_wafs_service_form_display_mode(wafs_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, wafsForm_display, ID_WEBSERVICE_WAFS_FORM);

	wafsForm_display.form.setValues(wafs_jsonData);
	format_display_wafs_service(wafs_jsonData);
	wafsForm_display.expand(true);
}

function wafs_remountBtnHandler(wafsForm) {
	wafsForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_REMOUNT_WAFS
		},
		waitMsg: S('msg_remounting_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			wafsForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_WAFS
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					wafs_jsonData = resp.data[0];
					wafs_display_mode(wafsForm);
				}
			})
		}
	});
}

function wafs_initBtnHandler(wafsForm) {
	wafsForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_INIT_WAFS
		},
		waitMsg: S('msg_initializing_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			wafsForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_WAFS
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					wafs_jsonData = resp.data[0];
					wafs_display_mode(wafsForm);
				}
			})
		}
	});
}

function radioSelection_wafs_service(data) {
	var selectedMethod = data.ServiceName;
	if (selectedMethod == 'WebAxs') {
		var wafs_service_on = Ext.getCmp('wafs_service_on');
		wafs_service_on.setValue(true);
	}
	else {
		var wafs_service_off = Ext.getCmp('wafs_service_off');
		wafs_service_off.setValue(true);
	}
}

function radioSelection_wafs_service_on(checked) {
	var wafs_service_on = Ext.getCmp('wafs_service_on');
	var wafs_dir_combo = Ext.getCmp('wafs_dir_combo');
	var wafs_token = Ext.getCmp('wafs_token');
	var wafs_user = Ext.getCmp('wafs_user');
	var wafs_pass = Ext.getCmp('wafs_pass');

	wafs_service_on.checked = true;

	wafs_dir_combo.enable();
	wafs_dir_combo.clearInvalid();

	wafs_token.enable();
	wafs_token.clearInvalid();
	wafs_user.enable();
	wafs_user.clearInvalid();
	wafs_pass.enable();
	wafs_pass.clearInvalid();

}

function radioSelection_wafs_service_off(checked) {
	var wafs_service_off = Ext.getCmp('wafs_service_off');
	var wafs_dir_combo = Ext.getCmp('wafs_dir_combo');
	var wafs_token = Ext.getCmp('wafs_token');
	var wafs_user = Ext.getCmp('wafs_user');
	var wafs_pass = Ext.getCmp('wafs_pass');

	wafs_service_off.checked = true;

	wafs_dir_combo.disable();
	wafs_dir_combo.clearInvalid();

	wafs_token.disable();
	wafs_token.clearInvalid();
	wafs_user.disable();
	wafs_user.clearInvalid();
	wafs_pass.disable();
	wafs_pass.clearInvalid();
}

function format_display_wafs_service(wafs_jsonData){
	var serviceVal = wafs_jsonData.ServiceName;
	var usernameVal = wafs_jsonData.UserKey0;
	var urlVal = wafs_jsonData.buffaloNAS0;

	var service = Ext.getCmp('wafs_service');
	var remountBtn = Ext.getCmp('wafs_remountBtn');
	var initBtn = Ext.getCmp('wafs_initBtn');
	var status = Ext.getCmp('wafs_status');
	var user = Ext.getCmp('wafs_user');

	if (serviceVal == 'WebAxs') {
		status.setValue(S('header_5_1') + ' : ' + urlVal + ' ' + S('wafs_status_ok'));
	}
	else {
		status.setValue(S('wafs_status_ng'));
	}

	if (serviceVal != 'WebAxs') {
		service.setValue(S('disabled'));
	}
	else {
		service.setValue(S('enabled'));
		remountBtn.enable();
	}
}
