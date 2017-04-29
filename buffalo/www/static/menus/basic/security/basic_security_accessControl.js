function create_access_control_display_mode() { 
	var accessControl = new Ext.form.TextField({
		name:'accessControl',
		id:'accessControl',
		fieldLabel:S('volumes_accessControlFn'),
		width: 200,
		readOnly: true
	});

	var mutualAuth = new Ext.form.TextField({
		id:'mutualAuth',
		name:'mutualAuth',
		fieldLabel:S('volumes_accessControlFn_mutualAuth'),
		width: 200,
		readOnly: true
	});

	var username = new Ext.form.TextField({
		id:'username',
		name:'username',
		fieldLabel:S('usr_field_username'),
		width: 200,
		readOnly: true
	});

	var password = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd'),
		id: 'password',
		name: 'password',
		inputType: 'password',
		width: 300,
		value: '****************',
		readOnly: true
	});

	var passwordMutual = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd_mutual'),
		id: 'passwordMutual',
		name: 'passwordMutual',
		inputType: 'password',
		width: 300,
		value: '****************',
		readOnly: true
	});

	var accessControl_editBtn = new Ext.Button({
		id:'accessControl_editBtn',
		name:'accessControl_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){ 
		 		accessControl_editBtnHandler(accessControlForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'accessControl'},
		{name: 'username'},
		{name: 'mutualAuth'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var accessControlForm = new Ext.FormPanel({
		id:ID_ACCESS_CONTROL_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders',
		title: S('access_control_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [accessControl_editBtn],
		items: [accessControl, mutualAuth, username, password, passwordMutual],
		titleCollapse: true
	});

	return accessControlForm;
}

function create_access_control_form_edit_mode() {
	var accessControl_on = new Ext.form.Radio({
		id: 'accessControl_on',
		hideLabel: true,
		name: 'accessControl',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function(accessControl_on, checked) {
				if (checked) {
					accessControl_off.setValue(false);
					this.checked = true;

					mutualAuth.enable();
					username.enable();
					password.enable();
					if (mutualAuth.getValue()) {
						passwordMutual.enable();
					}
				}
			}
		}
	});

	var accessControl_off = new Ext.form.Radio({
		id: 'accessControl_off',
		hideLabel: true,
		name: 'accessControl',
		boxLabel: S('disable'),
			inputValue: 'off',
			checked: true,
		listeners: {
			check: function(accessControl_off, checked) {
				if (checked) {
					accessControl_on.setValue(false);
					this.checked = true;
				
					mutualAuth.disable();
					username.disable();
					password.disable();
					passwordMutual.disable();
				}
			}
		}
	});

	var mutualAuth = new Ext.form.Checkbox({
	  id: 'mutualAuth',
	  name: 'mutualAuth',
	  boxLabel: S('volumes_accessControlFn_mutualAuth'),
	  listeners: { 
		check: function(mutualAuth, checked){
			if(checked){
				passwordMutual.enable();
			}
			else{
				passwordMutual.disable();
			}
		}
	}
	});

	var username = new Ext.form.TextField({
		id: 'username',
		name: 'username',
		fieldLabel:S('usr_field_username'),
		width: 300,
		maxLength: 20
	});

	var password = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd'),
		name: 'password',
		inputType: 'password',
		width: 300,
		allowBlank: false,
		minLength: 12,
		maxLength: 16
	});

	var passwordMutual = new Ext.form.TextField({
		fieldLabel: S('usr_field_pwd_mutual'),
		name: 'passwordMutual',
		inputType: 'password',
		width: 300,
		allowBlank: false,
		minLength: 12,
		maxLength: 16
	});

	var accessControl_saveBtn = new Ext.Button({
		id: 'accessControl_saveBtn',
		name:'accessControl_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				var usernameField = Ext.getCmp('username');
				var usernameVal = usernameField.getValue();
				if (usernameVal.length > 16) {
					Ext.MessageBox.show({
						width: 300,
						msg: S('volume_username_long_warning'),
						buttons: Ext.Msg.OKCANCEL,
						icon: Ext.MessageBox.INFO,
						fn: function(btn) {
							if (btn == 'ok') {
								accessControl_saveBtnHandler(accessControlForm);
							}
							else {
								return;
							}
						}
					});
				}
				else {
					accessControl_saveBtnHandler(accessControlForm);
				}
			}
		}
	});

	var accessControl_cancelBtn = new Ext.Button({
		id: 'accessControl_cancelBtn',
		name:'accessControl_cancelBtn',
		text: S('btn_cancel'),
		listeners: {click: function(){ 
		  accessControl_display_mode(accessControlForm);
		  }} 
	});
	
	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'accessControl'},
		{name: 'mutualAuth'},
		{name: 'username'},
		{name: 'password'},
		{name: 'passwordMutual'} 
	]);
	
	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var accessControlForm = new Ext.FormPanel({
		id:ID_ACCESS_CONTROL_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',		  
		title: S('access_control_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [accessControl_saveBtn, accessControl_cancelBtn],
		items:[{
				autoWidth:true,
				layout: 'column',
				cls : 'column-custBorders',
				items:[{
					cls: 'label',
					columnWidth: .264,
					items:[{
						cls: 'label',
						html:S('volumes_accessControlFn') + ':'
						}]
					},{
					  layout:'form', 
					  columnWidth:.15,
					  items:[accessControl_on]
					},
					{
					  layout:'form', 
					  columnWidth:.15,
					  items:[ accessControl_off]
					},
					{
					//	layout:'form', 
					  columnWidth:.35,
					  items:[mutualAuth]
					}
				]
			},username, password, passwordMutual],
		titleCollapse: true
	});

	return accessControlForm;
}

function accessControl_saveBtnHandler(accessControlForm) {
	accessControlForm.form.submit({
		url: '/dynamic.pl', 
		params: {
			bufaction: BUFACT_SET_ACCESS_CONTROL
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			accessControl_display_mode(accessControlForm);
//			getLeftPanelInfo_topOnly(2);
		}
	});
}

function accessControl_editBtnHandler(accessControl_edit) {
	accessControl_edit.destroy();
	accessControl_display = create_access_control_form_edit_mode();
	insertToCentralContainer(ADMIN_SETTINGS_RENDER_TO, accessControl_display, ID_HDD_TOOL_FORM);
	accessControl_display.form.setValues(accessControl_jsonData);
	accessControl_display.expand(false); 
}

function accessControl_display_mode(accessControl_display) {
	accessControl_jsonData = accessControl_display.form.getValues();
	accessControl_display.destroy();
	accessControl_edit= create_access_control_display_mode();
	insertToCentralContainer(ADMIN_SETTINGS_RENDER_TO, accessControl_edit, ID_HDD_TOOL_FORM);
	accessControl_edit.form.setValues(accessControl_jsonData);
	accessControl_format_display(accessControl_jsonData);
	accessControl_check_iscsi();
	accessControl_edit.expand(false);
}

function accessControl_format_display(accessControl_jsonData) {
	var accessControl = Ext.getCmp('accessControl');
	var mutualAuth = Ext.getCmp('mutualAuth');
	var username = Ext.getCmp('username');
	var password = Ext.getCmp('password');
	var passwordMutual = Ext.getCmp('passwordMutual');

	if (accessControl_jsonData.accessControl == 'off') {
		accessControl.setValue(S('disabled'));
		mutualAuth.setValue('-');
		username.setValue('-');
		password.setValue();
		passwordMutual.setValue();
	}
	else {
		accessControl.setValue(S('enabled'));
		password.setValue('****************');

		if (accessControl_jsonData.mutualAuth == 'on') {
			mutualAuth.setValue(S('enabled'));
			passwordMutual.setValue('****************');
		}
		else {
			mutualAuth.setValue(S('disabled'));
			passwordMutual.setValue();
		}
	}
}

function accessControl_check_iscsi() {
	if (add_iscsi && IS_ISCSI_RUNNING) {
		Ext.getCmp('accessControl_editBtn').disable();
	}
}
