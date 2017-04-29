var eyefi_jsonData;
var eyefi_cards;

function extensions_eyefi_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result){
			// Get response from server  
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				display_eyefi_login();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function display_eyefi_login(){
	eyefiForm = create_eyefi_form_login();
	updateCentralContainer(SYSTEM_RENDER_TO, eyefiForm);

	eyefiForm.load({
		url: '/dynamic.pl', 
		params: {
			bufaction: BUFACT_GET_EYEFI
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			eyefi_jsonData = resp.data[0];
			eyefi_format_display(eyefi_jsonData);
		}
	});

}
