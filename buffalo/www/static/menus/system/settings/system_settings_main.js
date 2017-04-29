var hName_jsonData;
var dTime_jsonData;
var lang_jsonData;
var management_jsonData;
var dTime_firstTime = true;
var hName_renderBefore;

function system_settings_processAuth(){
	Ext.QuickTips.init();

	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result){
			rawData = result.responseText;
			response = Ext.decode(rawData);
		
			var success = response.success;
			if (success){
				resetCookie(response);
				createSystemSettings();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function createSystemSettings(){
	hostnameForm = create_hostname_form_display_mode();
	dateTimeForm = create_dateTimeForm_display_mode();
	langForm = create_langForm_form_display_mode();

	updateCentralContainer(SYSTEM_RENDER_TO, hostnameForm);	

	if (add_iscsi) {
		hName_renderBefore = ID_MANAGEMENT_FORM;
		hostname_check_iscsi();

		var managmentForm = create_management_form_display_mode();
		addToCentralContainer(SYSTEM_RENDER_TO, managmentForm);

		managmentForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_GET_MANAGEMENT
			},
			waitMsg: S('msg_loading_data'),
			failure: function(form,action) {
				formFailureFunction(action);
			},
			success: function(form,action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				management_jsonData = resp.data[0];
			}
		});
	}
	else {
		hName_renderBefore = ID_DATE_FORM;
	}

	addToCentralContainer(SYSTEM_RENDER_TO, dateTimeForm);
	addToCentralContainer(SYSTEM_RENDER_TO, langForm);

	hostnameForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_HOSTNAME
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			hName_jsonData = resp.data[0];
			hostname_check_iscsi();
		}
	});

	dateTimeForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DT
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			dTime_jsonData = resp.data[0];
			dateTime_format_response_displayMode(dTime_jsonData);
		}
	});

	langForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_LANG
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			lang_jsonData = resp.data[0];
			formatLanguage_display_mode();
		}
	});
}
