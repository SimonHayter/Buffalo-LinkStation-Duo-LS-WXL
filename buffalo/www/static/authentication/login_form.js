//	Ext.onReady(function(){
//	var stateEvent = Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

function request_login(){
/*
	var myMask = new Ext.LoadMask(Ext.get('login_container_inner'),
		{
			msg: '&nbsp;',
			msgCls: 'ux-ext-el-mask-msg'
		}
	);
	myMask.show();
*/

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getLang'
		},
		method: 'GET',
		success: function (result){
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
//				myMask.hide();
				var lang = getLanguage(response);
				importLang(lang);

				if (lang != 'en') {
					langDictionary_en.load();
				}

				var update = response.data[0].update;
				langDictionary.load({
					callback: function(){
						createLoginForm(lang, update);
						display_help('login', lang);
						load_extjs_customized_locale();
						var authForm = Ext.getCmp('authForm');
						authForm.form.clearInvalid();
					}
				});
			}
		}
	});
}

function importLang(lang){
	langDictionary = new Ext.data.JsonStore({
//		url: "../locale/" + lang + "/" + lang + ".json",
		url: "../locale/" + lang + ".json",
		root: 'labels',
		fields: ['id', 'value']
	});

	langDictionary_en = new Ext.data.JsonStore({
		url: "../locale/en.json",
		root: 'labels',
		fields: ['id', 'value']
	});
}

function createLoginForm(lang, update){
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'qtip';
	var newLoginWin;

	// The following controls are used to validate an existing login
	var user = new Ext.form.TextField({
//		allowBlank: false,
		fieldLabel: S('l_username'),
		id: 'user',
		name: 'user',
		readOnly: false,
		stateful: true,
		width: 200
//		,value: 'admin'  //for testing
	});

	var password = new Ext.form.TextField({
//		allowBlank: false,
		fieldLabel: S('l_pwd'),
		id: 'password',
		name: 'password',
		inputType: 'password',
		width: 200
//		,value:'password'  //for testing
	});

	var loginBtn = new Ext.Button({
		id: 'login',
		text: S('l_btn'),
		handler: function() {
			if (!user.getValue()){
				var msg = 'l_invalid_uName_pwd';
				var buttons = Ext.MessageBox.OK;
				var icon = Ext.MessageBox.ERROR;
				msgBox_usingDictionary(title, msg, buttons, icon);
			}
			else {
				login(authForm, lang);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
			{name: 'encryptPwd'},
			{name: 'sid'}
		]
	);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
			{name: 'id'},
			{name: 'msg'}
		]
	);

	var authForm = new Ext.FormPanel({
		cls: 'login_form',
		itemCls: 'login_form_font',
		buttons: [loginBtn],
		buttonAlign: 'center',
		errorReader: jErrReader,
		frame: false,
		hideTitle: true,
		id: 'authForm',
		items: [
//			{html: S('system_firmware_update_log_available')},
			{html: '<br>'},
			user,
			password
		],
		labelAlign: 'left',
		name: 'authForm',
		reader: jReader,
		trackResetOnLoad: true,
//		waitMsgTarget: true,
		keys: [{
			key: [10, 13],
			handler: function() {
				login(authForm, lang);
			}
		}]
	});

	Ext.get('login_loading').remove();

	if ((add_fwupdate) && (update == true)) {
		msgBox_usingDictionary_with_width('', 'system_firmware_update_log_available', Ext.Msg.OK, Ext.MessageBox.INFO, 450);
	}
	warnConfigBroken();

	authForm.render('login_container_form');
	user.focus();
}

function warnConfigBroken()
{
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getConfigBroken'
		},
		method: 'GET',
		success: function (result){
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var win, checkbox, warnText;
			var i;
			if(response.broken)
			{
				warnText = S("msg_warning_config") + "<br><ul>"
				for(i=0; i<response.initialized.length; i++)
				{
					warnText = warnText + "<li>" + S(response.initialized[i]) + "</li>";
				}
				warnText = warnText + "</ul>";
				checkbox = new Ext.form.Checkbox({
							boxLabel: S("dontShowAgain"),
							checked: false,
							listeners:{
								check: function(cb, checked)
								{
								}
							}
						});
				win = new Ext.Window({titile: "window",
							   draggable: false,
							   resizable: false,
							   title: S("warning_box_title"),
							   width: 320,
							   //height: 200,
							   layout: "fit",
							   modal: true,
							   closable: false,
							   layout: "anchor",
							   items:[{html:warnText},checkbox],
							   buttonAlign:"center",
							   buttons:[{text: "OK",
								     handler: function()
								     {
										if(checkbox.getValue())
										{
											clearConfigBroken();
										}
										win.close();
								     }
								   }]
							   });
				win.show();
			}
		}
	});
}

function clearConfigBroken()
{
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'clearConfigBroken'
		},
		method: 'GET',
		success: function (result){
		}
	});
}
