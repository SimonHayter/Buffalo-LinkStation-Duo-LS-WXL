function create_admin_settings_display_mode() { 
	var username = new Ext.form.TextField({
		name:'username',
		fieldLabel:S('usr_field_username'),
		width: 200,
		readOnly: true
	});

	var password = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd'),
		name: 'password',
		inputType: 'password',
		width: 300,
		value: '****************',
		readOnly: true
	});

	var adminSettings_editBtn = new Ext.Button({
		id: 'adminSettings_editBtn',
		name:'adminSettings_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){ 
				adminSettings_editBtnHandler(adminSettingsForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'username'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var adminSettingsForm = new Ext.FormPanel({
		id: ID_ADMIN_SETTINGS_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders',
		title: S('admin_settings_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [adminSettings_editBtn],
		items: [username, password],
		titleCollapse: true
	});

	return adminSettingsForm;
}

function create_admin_settings_form_edit_mode() {
	var username = new Ext.form.TextField({
		name:'username',
		fieldLabel:S('usr_field_username'),
		width: 300,
		allowBlank: false,
		maxLength: 20,
		listeners: {
			change: function(nameField, value){
				if (admin_jsonData.userName != value) {
					password.setValue('');
					password.clearInvalid();
					confPwd.setValue('');
					confPwd.clearInvalid();
				}
			}
		}
	});

	var password = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd'),
		name: 'password',
		inputType: 'password',
		width: 300,
		value: '****************',
		allowBlank: false,
		maxLength: 20
	});

	var confPwd = new Ext.form.TextField({
		fieldLabel: S('usr_field_confPwd'),
		name: 'confPwd',
		inputType: 'password',
		width: 300,
		value: '****************',
		allowBlank: false,
		maxLength: 20
	});

	var adminSettings_saveBtn = new Ext.Button({
		id: 'adminSettings_saveBtn',
		name:'adminSettings_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				if (password.getValue() == confPwd.getValue()) {
					adminSettings_saveBtnHandler(adminSettingsForm);
				}
				else {
					msgBox_usingDictionary('error_box_title', 'password_mismatch', Ext.Msg.OK, Ext.MessageBox.ERROR);
				}
			}
		}
	});

	var adminSettings_cancelBtn = new Ext.Button({
		id: 'adminSettings_cancelBtn',
		name: 'adminSettings_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				adminSettings_display_mode(adminSettingsForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'username'},
		{name: 'password'} 
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var adminSettingsForm = new Ext.FormPanel({
		id:ID_NAME_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',
		title: S('admin_settings_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [adminSettings_saveBtn, adminSettings_cancelBtn],
		items:[username, password, confPwd],
		titleCollapse: true
	});

	return adminSettingsForm;
}

function adminSettings_saveBtnHandler(adminSettingsForm){
	adminSettingsForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_ADMIN_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			admin_jsonData = adminSettingsForm.form.getValues();
			adminSettings_display_mode(adminSettingsForm);
			display_accountInfo(admin_jsonData.username);
		}
	});
}

function adminSettings_editBtnHandler(adminSettings_edit){
	adminSettings_edit.destroy();
	adminSettings_display = create_admin_settings_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, adminSettings_display, ID_ACCESS_CONTROL_FORM);
	adminSettings_display.expand(true); 
	adminSettings_display.form.setValues(admin_jsonData);
}

function adminSettings_display_mode(adminSettings_edit){
	adminSettings_edit.destroy();
	adminSettings_display= create_admin_settings_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, adminSettings_display, ID_ACCESS_CONTROL_FORM);
	adminSettings_display.expand(true);
	adminSettings_display.form.setValues(admin_jsonData);
}
