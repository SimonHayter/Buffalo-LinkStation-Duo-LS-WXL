// GLOBAL VARIABLES
var jsonData;
var netType_idForm;
var firstVisit = true;

function netDomain_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				getDomainSettings();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function getDomainSettings() {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DOMAIN_SETTINGS
		},
		method: 'POST',
		success: function (result){
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				var MaskElems = Ext.DomQuery.select('.ext-el-mask');
				Ext.get(MaskElems).hide();

				jsonData = response.data[0];
				var form;
				if (response.data[0].networkType == 'workgroup') {
					form = wg_displayMode();
					updateCentralContainer(NETWORK_RENDER_TO, form);
					form.form.setValues(jsonData);
					wg_displayConditions(jsonData, 'workgroup');
					netType_idForm = ID_DOMAIN_WG_DISPLAY_FORM;
				}
				else if (add_ad_nt) {
					if (response.data[0].networkType == 'ad') {
						form = ad_displayMode();
						updateCentralContainer(NETWORK_RENDER_TO, form);
						form.form.setValues(jsonData);
						ad_displayConditions('ad');
						netType_idForm = ID_DOMAIN_AD_DISPLAY_FORM;
					}
					else {
						form = nt_displayMode();
						updateCentralContainer(NETWORK_RENDER_TO, form);
						form.form.setValues(jsonData);
						nt_displayConditions('domain');
						netType_idForm = ID_DOMAIN_NT_DISPLAY_FORM;
					}
				}
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function wg_showForm(appendToContainer) {
	form = wg_editMode();

	if (appendToContainer) {
		updateSkipFirstCentralContainer(NETWORK_RENDER_TO, form);
	}
	else {
		updateCentralContainer(NETWORK_RENDER_TO, form);
	}
	form.form.setValues(jsonData);

	var delegateLsRadio = Ext.getCmp(ID_DOMAIN_WG_DELEGATE_LS_RADIO);
	var delegateSMBRadio = Ext.getCmp(ID_DOMAIN_WG_DELEGATE_SMB_RADIO);
	var shSettingsGrp = Ext.getCmp(ID_DOMAIN_WG_SH_SETTINGS);

	if (jsonData.authServerType == 'local') {
		delegateLsRadio.setValue(true);
		delegateSMBRadio.setValue(false);
	}
	else {
		delegateLsRadio.setValue(false);
		delegateSMBRadio.setValue(true);
	}
}

// ******************* NETWORK TYPE SELECTION FORM *******************
function networkType_form() {
	var wg = new Ext.form.Radio({
		id: ID_NET_TYPE_WG,
		hideLabel: true,
		name: 'networkType',
		boxLabel: S('net_domain_wg'),
		inputValue: 'workgroup',
		listeners: {
			check: function(wg, checked) {
				if (checked) {
					nt.setValue(false);
					ad.setValue(false);
					wg_showForm(true);
				}
			}
		}
	});

	var nt = new Ext.form.Radio({
		id: ID_NET_TYPE_NT,
		hideLabel: true,
		name: 'networkType',
		boxLabel: S('net_domain_nt'),
		inputValue: 'domain',
		listeners: {
			check: function(nt, checked) {
				if (checked) {
					if (!firstVisit) {
						msgBox_usingDictionary('warning_box_title', 'net_domain_nt_msg', Ext.Msg.OK, Ext.MessageBox.WARNING);
						firstVisit = false;
					}
					wg.setValue(false);
					ad.setValue(false);

					form = nt_editMode();
					updateSkipFirstCentralContainer(NETWORK_RENDER_TO, form);

					form.form.setValues(jsonData);
				}
			}
		}
	});

	var ad = new Ext.form.Radio({
		id: ID_NET_TYPE_AD,
		hideLabel: true,
		name: 'networkType',
		boxLabel: S('net_domain_ad'),
		inputValue: 'ad',
		listeners: {
			check: function(ad, checked){
				if (checked) {
					if (!firstVisit) {
						msgBox_usingDictionary('warning_box_title', 'net_domain_nt_msg', Ext.Msg.OK, Ext.MessageBox.WARNING);
						firstVisit = false;
					}

					nt.setValue(false);
					wg.setValue(false);

					form = ad_editMode();
					updateSkipFirstCentralContainer(NETWORK_RENDER_TO, form);
					form.form.setValues(jsonData);
				}
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'networkType'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var netTypeForm = new Ext.FormPanel({
		name: ID_NET_TYPE_FORM,
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 160, 
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
//		border: true,
//		tCls: 'panel-custBorders',
		items: [
			{
//				id: ID_DOMAIN_WG_SMB_SETTINGS,
				autoWidth:true,
				layout: 'column',
				cls: 'column-bottomBorder',
				items: [
					{
						cls: 'label',
						columnWidth: .3,
						html: S('net_domain_auth_method')
					},{
						layout: 'form',
						columnWidth: .22,
						items: [wg]
					},{
						layout: 'form',
						columnWidth: .22,
						items: [nt]
					},{
						layout: 'form',
						columnWidth: .23,
						items: [ad]
					}
				]
			}, {
				html: '<br>'
			}
		]
	});

	return netTypeForm;
}

// ******************* workgroup DISPLAY mode *******************
function wg_displayMode() {
	var networkType = new Ext.form.TextField({
		id: ID_AUTH_TYPE_FIELD,
		name: 'networkType',
		fieldLabel: S('net_domain_auth_method'),
		width: 250,
		readOnly: true
	});

	var wgName = new Ext.form.TextField({
		name: 'wgName',
		fieldLabel: S('net_domain_wg_name'),
		width: 250,
		readOnly: true
	});

	var wgAuth = new Ext.form.TextField({
		id: ID_DOMAIN_WG_AUTH_FIELD,
		fieldLabel: S('net_domain_wg_auth'),
		width: 250,
		readOnly: true
	});

	var authServName = new Ext.form.TextField({
		id: ID_DOMAIN_WG_AUTH_SERV_NAME,
		name: 'authServerName',
		fieldLabel: S('net_domain_auth_serv_name'),
		width: 250,
		readOnly: true
	});

	var authUsrReg = new Ext.form.TextField({
		id: ID_DOMAIN_USR_REG_FIELD,
		name: 'autoUserReg', 
		fieldLabel: S('net_domain_auth_usr_reg'),
		width: 250,
		readOnly: true
	});

	var winDomCont = new Ext.form.TextField({
		id: ID_DOMAIN_WIN_CONT_FIELD,
		fieldLabel: S('net_domain_win_domain_cont'),
		width: 250,
		readOnly: true
	});

	var wg_editBtn = new Ext.Button({
		id: 'wg_editBtn',
//		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){
				if (add_ad_nt) {
					var netTypeForm = networkType_form();
					updateCentralContainer(NETWORK_RENDER_TO, netTypeForm);

					if (jsonData.networkType == 'workgroup') {
						Ext.getCmp(ID_NET_TYPE_WG).setValue(true)
					}
					else if (jsonData.networkType == 'ad') {
						Ext.getCmp(ID_NET_TYPE_AD).setValue(true);
					}
					else {
						Ext.getCmp(ID_NET_TYPE_NT).setValue(true);
					}
				}
				else if (jsonData.networkType == 'workgroup') {
					wg_showForm(false);
				}
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'wgName'},
		{name: 'winsIP'},
		{name: 'authServerType'},
		{name: 'windowsServer'},
		{name: 'autoUserReg'},
		{name: 'authShare'},
		{name: 'authServerName'},
		{name: 'authShareName'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var wgDisplayForm = new Ext.FormPanel({
		name: ID_DOMAIN_WG_DISPLAY_FORM,
		itemCls: 'display-label',
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 200,
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [
			networkType,
			wgName,
			wgAuth,
			authServName,
			winDomCont,
			authUsrReg
		],
		buttons: [wg_editBtn]
	});

	return wgDisplayForm;
}

// *********** workgroup EDIT mode *******************

function wg_editMode() {
	var wgName = new Ext.form.TextField({
		name: 'wgName',
		fieldLabel: S('net_domain_wg_name'),
		width: 200
	});

	var wins = new Ext.form.TextField({
		name: 'winsIP',
		fieldLabel: S('net_domain_wins_ip'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var wgDelegateLS = new Ext.form.Radio({
		id: ID_DOMAIN_WG_DELEGATE_LS_RADIO,
		hideLabel: true,
		name: 'authServerType',
		boxLabel: S('net_domain_wg_delegate_ls'),
		inputValue: 'local',
		listeners: {
			check: function(wgDelegateLS, checked){
				if (checked) {
					wgDelegateSMB.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var wgDelegateSMB = new Ext.form.Radio({
		id: ID_DOMAIN_WG_DELEGATE_SMB_RADIO,
		name: 'authServerType',
		hideLabel: true,
		boxLabel: S('net_domain_wg_delegate_smb'),
		inputValue: 'server',
		listeners: {
			check: function(wgDelegateSMB, checked) {
				var smbSettingsGrp = Ext.getCmp(ID_DOMAIN_WG_SMB_SETTINGS);
				var shSettingsGrp = Ext.getCmp(ID_DOMAIN_WG_SH_SETTINGS);
				var authServNameField = Ext.getCmp(ID_DOMAIN_WG_AUTH_SERV_NAME);

				if (checked) {
					if (!firstVisit) {
						msgBox_usingDictionary('warning_box_title', 'net_domain_smb_msg', Ext.Msg.OK, Ext.MessageBox.WARNING);
						firstVisit = false;
					}

					wgDelegateLS.setValue(false);
					this.checked = true;	
					smbSettingsGrp.show();
					shSettingsGrp.show(); 
					authServNameField.enable();
				}
				else {
					smbSettingsGrp.hide();
					shSettingsGrp.hide();
					authServNameField.disable()
				}
			}
		}
	});

	var authServerName = new Ext.form.TextField({
		id: ID_DOMAIN_WG_AUTH_SERV_NAME,
		name: 'authServerName',
		fieldLabel: S('net_domain_auth_serv_name'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var windowsServer = new Ext.form.Checkbox({
		name: 'windowsServer',
		hideLabel: true,
		boxLabel: S('net_domain_wg_win_as_domain_cont'),
		listeners: {
			check: function(windowsServer, checked) {
				if (checked) {
					if (!firstVisit) {
						msgBox_usingDictionary('warning_box_title', 'net_domain_winDomCont_msg', Ext.Msg.OK, Ext.MessageBox.WARNING);
						firstVisit = false;
					}
				}
			}
		}
	});

	var autoUserReg = new Ext.form.Checkbox({
		name: 'autoUserReg',
		hideLabel: true,
		boxLabel: S('net_domain_wg_auto_reg'),
		listeners: {
			check: function(wgDelegateSMB, checked) {
				var shSettingsGrp = Ext.getCmp(ID_DOMAIN_WG_SH_SETTINGS);
				var shName = Ext.getCmp(ID_DOMAIN_WG_SHARE_NAME);

				if (checked) {
					shSettingsGrp.show();
					shName.show();
				}
				else {
					shSettingsGrp.hide();
					shName.show();
				}
			}
		}
	});

	var authShare = new Ext.form.Checkbox({
		name: 'authShare',
		hideLabel: true,
		boxLabel: S('net_domain_wg_auth_shFold'),
		listeners: {
			check: function(wgDelegateSMB, checked) {
				var shName = Ext.getCmp(ID_DOMAIN_WG_SHARE_NAME);

				if (checked) {
					shName.enable();
					var store = Ext.getCmp('shareList').store;
				}
				else {
					shName.disable();
				}
			}
		}
	});

	var shName = new Ext.form.TextField({
		name:'authShareName',
		id: ID_DOMAIN_WG_SHARE_NAME,
		hideLabel: true,
		width: 200
	});

	var wg_saveBtn = new Ext.Button({
		id: 'wg_saveBtn',
//		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				wg_saveBtnHandler(wgEditForm, jsonData);
			}
		}
	});

	var wg_cancelBtn = new Ext.Button({
		id: 'wg_cancelBtn',
//		name:'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				cancelBtnHandler();
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'wgName'},
		{name: 'winsIP'},
		{name: 'authServerType'},
		{name: 'windowsServer'},
		{name: 'autoUserReg'},
		{name: 'authShare'},
		{name: 'authServerName'},
		{name: 'authShareName'},
		{name: 'userCount'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
	root: 'errors',
	successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var wgAuthFs = new Ext.form.FieldSet({
		name: 'authFs',
		title: S('net_domain_wg_auth_legend'),
		header: false,
		autoHeight: true,
		collapsible: true,
		titleCollapse: true,
//		width: 500,
		items: [
			wgDelegateLS,
			wgDelegateSMB,
			{
				id: ID_DOMAIN_WG_SMB_SETTINGS,
				autoWidth: true,
				layout: 'column',
				items: [{
					cls: 'label',
					columnWidth: .05,
					html: '&nbsp'
				}, {
					layout: 'form',
					columnWidth: .9,
					items :[
						authServerName,
						windowsServer,
						autoUserReg
					]
				}]
			}, {
				id: ID_DOMAIN_WG_SH_SETTINGS,
				autoWidth: true,
				layout: 'column',
				items: [
				{
					cls: 'label',
					columnWidth: .05,
					html: '&nbsp'
				}, {
					cls: 'label',
					columnWidth: .05,
					html: '&nbsp'
				}, {
					layout: 'form',
					columnWidth:.5,
					items: [authShare]
				},{
					layout: 'form',
					columnWidth:.4,
					items: [shName]
				}
			]
		}]
	});

	var wgEditForm = new Ext.FormPanel({
		id: ID_DOMAIN_WG_EDIT_FORM,
		name: 'wgEditForm',
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth:250,
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [
			wgName,
			wins,
			wgAuthFs
		],
		buttons: [
			wg_saveBtn,
			wg_cancelBtn
		]
	});

	return wgEditForm;
}

// *********** nt DISPLAY mode *******************
function nt_displayMode() {
	var networkType = new Ext.form.TextField({
		id: ID_AUTH_TYPE_FIELD,
		name: 'networkType',
		fieldLabel: S('net_domain_auth_method'),
		width: 200,
		readOnly: true
	});

	var domName = new Ext.form.TextField({
		name: 'adBios',
		fieldLabel: S('net_domain_nt_domain'),
		width: 200,
		readOnly: true
	});

	var domCont = new Ext.form.TextField({
		name: 'adDomCont',
		fieldLabel: S('net_domain_nt_domain_cont'),
		width: 200,
		readOnly: true
	});

	var wins = new Ext.form.TextField({
		name: 'winsIP',
		fieldLabel: S('net_domain_wins_ip'),
		width: 200,
		readOnly: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var nt_editBtn = new Ext.Button({
		id: 'editBtn',
		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){ 
				var netTypeForm = networkType_form();
				updateCentralContainer(NETWORK_RENDER_TO, netTypeForm);

				if (jsonData.networkType == 'workgroup') {
					Ext.getCmp(ID_NET_TYPE_WG).setValue(true);
				}
				else if (jsonData.networkType == 'ad') {
					Ext.getCmp(ID_NET_TYPE_AD).setValue(true);
				}
				else {
					Ext.getCmp(ID_NET_TYPE_NT).setValue(true);
				}
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'adBios'},
		{name: 'adDomCont'},
		{name: 'winsIP'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var ntDisplayForm = new Ext.FormPanel({
		name: ID_DOMAIN_NT_DISPLAY_FORM,
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 160,
		itemCls: 'display-label',
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [
			networkType,
			domName,
			domCont,
			wins
		],
		buttons: [nt_editBtn] 
	});

	return ntDisplayForm;
}

// *********** nt EDIT mode *******************
function nt_editMode(){
	var domName = new Ext.form.TextField({
		name: 'adBios',
		fieldLabel: S('net_domain_nt_domain'),
		width: 200
	});

	var domCont = new Ext.form.TextField({
		name: 'adDomCont',
		fieldLabel: S('net_domain_nt_domain_cont'),
		width: 200
	});

	var adminName = new Ext.form.TextField({
		id: 'adAdminUser',
		name: 'adAdminUser',
		fieldLabel: S('net_domain_ad_admin_name'),
		width: 200
	});

	var adminPwd = new Ext.form.TextField({
		name: 'adAdminPwd',
		fieldLabel: S('net_domain_ad_admin_pwd'),
		width: 200,
		inputType: 'password'
	});

	var wins = new Ext.form.TextField({
		name: 'winsIP',
		fieldLabel: S('net_domain_wins_ip'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var nt_saveBtn = new Ext.Button({
		id: 'nt_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){ 
				nt_saveBtnHandler(ntEditForm);
			}
		},
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var nt_cancelBtn = new Ext.Button({
		id: 'nt_cancelBtn',
//		name:'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				cancelBtnHandler();
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'adBios'},
		{name: 'adDomCont'},
		{name: 'winsIP'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var ntEditForm = new Ext.FormPanel({
		name: ID_DOMAIN_NT_EDIT_FORM,
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [domName, domCont, adminName, adminPwd, wins],
		buttons: [nt_saveBtn, nt_cancelBtn] 
	});

	return ntEditForm;
}

// *********** ad DISPLAY mode ******************* 
function ad_displayMode(){
	var networkType = new Ext.form.TextField({
		id: ID_AUTH_TYPE_FIELD,
		name: 'networkType',
		fieldLabel: S('net_domain_auth_method'),
		width: 200,
		readOnly: true
	});

	var adBios = new Ext.form.TextField({
		name: 'adBios',
		fieldLabel: S('net_domain_ad_netBios'),
		width: 200,
		readOnly: true
	});

	var adDns = new Ext.form.TextField({
		name: 'adDns',
		fieldLabel: S('net_domain_ad_dns'),
		width: 200,
		readOnly: true
	});

	var adDomCont = new Ext.form.TextField({
		name: 'adDomCont',
		fieldLabel: S('net_domain_ad_domain_cont'),
		width: 200,
		readOnly: true
	});

	var adminName = new Ext.form.TextField({
		name: 'adAdminUser',
		fieldLabel: S('net_domain_ad_admin_name'),
		width: 200,
		readOnly: true
	});

	var wins = new Ext.form.TextField({
		name: 'winsIP',
		fieldLabel: S('net_domain_wins_ip'),
		width: 200,
		readOnly: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var ad_editBtn = new Ext.Button({
		id: 'nt_editBtn',
//		name: 'neditBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				var netTypeForm = networkType_form();
				updateCentralContainer(NETWORK_RENDER_TO, netTypeForm);

				if (jsonData.networkType == 'workgroup') {
					Ext.getCmp(ID_NET_TYPE_WG).setValue(true);
				}
				else if (jsonData.networkType == 'ad') {
					Ext.getCmp(ID_NET_TYPE_AD).setValue(true);
				}
				else {
					Ext.getCmp(ID_NET_TYPE_NT).setValue(true);
				}
			}
		},
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'adBios'},
		{name: 'adDns'},
		{name: 'adAdminUser'},
		{name: 'adDomCont'},
		{name: 'winsIP'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var adDisplayForm = new Ext.FormPanel({
		name: ID_DOMAIN_AD_DISPLAY_FORM,
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 160, 
		itemCls: 'display-label',
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [
			networkType,
			adBios,
			adDns,
			adDomCont,
			wins
		],
		buttons: [ad_editBtn]
	});

	return adDisplayForm;
}

// *********** ad EDIT mode *******************
function ad_editMode(){
	var adBios = new Ext.form.TextField({
		id: 'adBios',
		name: 'adBios',
		fieldLabel: S('net_domain_ad_netBios'),
		width: 200
	});

	var adDns = new Ext.form.TextField({
		id: 'adDns',
		name: 'adDns',
		fieldLabel: S('net_domain_ad_dns'),
		width: 200
	});

	var adDomCont = new Ext.form.TextField({
		id:'adDomCont',
		name: 'adDomCont',
		fieldLabel: S('net_domain_ad_domain_cont'),
		width: 200
	});

	var adminName = new Ext.form.TextField({
		id: 'adAdminUser',
		name: 'adAdminUser',
		fieldLabel: S('net_domain_ad_admin_name'),
		width: 200
	});

	var adminPwd = new Ext.form.TextField({
		name: 'adAdminPwd',
		fieldLabel: S('net_domain_ad_admin_pwd'),
		width: 200,
		inputType: 'password'
	});

	var wins = new Ext.form.TextField({
		id: 'winsIP',
		name: 'winsIP',
		fieldLabel: S('net_domain_wins_ip'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var ad_saveBtn = new Ext.Button({
		id: 'ad_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				ad_saveBtnHandler(adEditForm);
			}
		}
	});

	var ad_cancelBtn = new Ext.Button({
		id: 'ad_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				cancelBtnHandler();
			}
		} 
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'networkType'},
		{name: 'adBios'},
		{name: 'adDns'},
		{name: 'adAdminUser'},
		{name: 'adDomCont'},
		{name: 'winsIP'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

// ....: Create WG/AD settings FORM and add FIELDSETS  :....
	var adEditForm = new Ext.FormPanel({
		name: ID_DOMAIN_AD_EDIT_FORM,
		autoHeight: true,
		hideTitle: true,
		width: 640,
		labelWidth: 160, 
		reader: jReader,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: [
			adBios,
			adDns,
			adDomCont,
			adminName,
			adminPwd,
			wins
		],
		buttons: [
			ad_saveBtn,
			ad_cancelBtn
		]
	});

	return adEditForm;
}

function wg_displayConditions(data, netType){
	var wgAuthField = Ext.getCmp(ID_DOMAIN_WG_AUTH_FIELD);
	var domContField = Ext.getCmp(ID_DOMAIN_WIN_CONT_FIELD);
	var usrRegield = Ext.getCmp(ID_DOMAIN_USR_REG_FIELD);
	var authTypeField = Ext.getCmp(ID_AUTH_TYPE_FIELD);
	var authServerName = Ext.getCmp(ID_DOMAIN_WG_AUTH_SERV_NAME);

	var value_winServ;
	var value_delegate;
	var value_serverName;

	if (data.authServerType == 'local') {
		value_delegate = S('net_domain_wg_delegate_ls');
		authServerName.setValue('');
	}
	else {
		value_delegate = S('net_domain_wg_delegate_smb');
		var value_reg;
		if (data.autoUserReg) {
			value_reg = S('enabled');
		}
		else {
			value_reg = S('disabled');
		}

		if (data.windowsServer) {
			value_winServ = S('enabled');
		}
		else {
			value_winServ = S('disabled');
		}
	}

	usrRegield.setValue(value_reg);
	domContField.setValue(value_winServ);
	wgAuthField.setValue(value_delegate);

	var val =S(netType);
	authTypeField.setValue(val);
}

function nt_displayConditions(netType) {
	var authType = Ext.getCmp(ID_AUTH_TYPE_FIELD);
	var val = S(netType);
	authType.setValue(val);
}

function ad_displayConditions(netType) {
	var authType = Ext.getCmp(ID_AUTH_TYPE_FIELD);
	var val = S(netType);
	authType.setValue(val);
}

function wg_saveBtnHandler(form, data) {
	var type = 'workgroup';
	var authExternal = Ext.getCmp(ID_DOMAIN_WG_DELEGATE_SMB_RADIO).getValue();

	if ((authExternal) && (data.userCount > 2)) {
		Ext.MessageBox.show({
			width: 500,
			title: S('warning'),
			msg: S('net_domain_extauth_confirm_msg'),
			buttons: Ext.MessageBox.YESNOCANCEL,
			icon: Ext.MessageBox.WARNING,
			fn: function(btn){
				if (btn == 'no') {
					send_wg_data(type, form, 'off');
				}
				else if (btn == 'yes') {
					send_wg_data(type, form, 'on');
				}
				else {
					return false;
				}
			}
		});
	}
	else {
		send_wg_data(type, form, '');
	}
};

function send_wg_data(type, form, convertUsers) {
	form.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DOMAIN_SETTINGS,
			networkType: type,
			convertUsers: convertUsers
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			getLeftPanelInfo_topOnly(3);
			netDomain_processAuth();
		}
	});
}

function nt_saveBtnHandler(form) {
	var type = 'domain';
	var titleRef = 'error_box_title';
	var msgRefErr_ad = 'domain_err60';

	form.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DOMAIN_SETTINGS,
			networkType: type
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			if (!action.result) {
				msgBox_usingDictionary(titleRef, msgRefErr_ad, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				formFailureFunction(action);
			}
		},
		success: function(form, action) {
			if (!action.result) {
				msgBox_usingDictionary(titleRef, msgRefErr_ad, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				resetCookie();
				getLeftPanelInfo_topOnly(3);
				netDomain_processAuth();
			}
		}
	})
};

function ad_saveBtnHandler(form) {
	var type = 'ad';
	var titleRef = 'error_box_title';
	var msgRefErr_ad = 'domain_err50';

	form.form.submit({
		url: '/dynamic.pl',
		timeout: 500,
		params: {
			bufaction: BUFACT_SET_DOMAIN_SETTINGS,
			networkType: type
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			if (!action.result) {
				msgBox_usingDictionary(titleRef, msgRefErr_ad, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				formFailureFunction(action);
			}
		},
		success: function(form, action) {
			resetCookie();
			if (!action.result.success) {
				msgBox_usingDictionary(titleRef, msgRefErr_ad, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				resetCookie();
				getLeftPanelInfo_topOnly(3);
				netDomain_processAuth();
			}
		}
	})
};

function cancelBtnHandler() {
	if (netType_idForm == ID_DOMAIN_WG_DISPLAY_FORM) {
		form = wg_displayMode();
		updateCentralContainer(NETWORK_RENDER_TO, form);
		form.form.setValues(jsonData);
		wg_displayConditions(jsonData, 'workgroup');
	}
	else if (netType_idForm == ID_DOMAIN_AD_DISPLAY_FORM) {
		form = ad_displayMode();
		updateCentralContainer(NETWORK_RENDER_TO, form);
		form.form.setValues(jsonData);
		ad_displayConditions('ad');
	}
	else {
		form = nt_displayMode();
		updateCentralContainer(NETWORK_RENDER_TO, form);
		form.form.setValues(jsonData);
		nt_displayConditions('domain');
	}
};
