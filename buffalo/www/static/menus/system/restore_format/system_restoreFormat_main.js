var initsw_jsonData;
var render_restore_form_before;

function system_restFormat_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			//Get response from server	
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				createSystemRestoreFormat();
			}
			//else winAjaxFailureFunction(response);
			else failureFunction(response);
		}
	});
}

function createSystemRestoreFormat() {
	restoreForm = create_restore_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, restoreForm);
	

	render_restore_form_before = ID_FORMAT_FORM;
	restoreForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_INIT_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			initsw_jsonData = resp.data[0];
			restore_show_label_selection(initsw_jsonData);
		}
	});

	formatForm = create_format_display_mode();
	addToCentralContainer(SYSTEM_RENDER_TO, formatForm);
}
