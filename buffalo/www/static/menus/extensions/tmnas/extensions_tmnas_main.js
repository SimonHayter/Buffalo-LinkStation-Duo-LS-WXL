var tmnas_jsonData;

function extensions_tmnas_processAuth(){
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
				createTmnasSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createTmnasSettings(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_TMNAS_SERVICE
		},
		method: 'GET',
		success: function (result){
			resetCookie();
			resp = Ext.decode(result.responseText);
			tmnas_jsonData = resp.data[0];

			tmnasFolderForm = create_tmnas_folder_form_display_mode(tmnas_jsonData);
			tmnasServiceForm = create_tmnas_service_form_display_mode();

			updateCentralContainer(SYSTEM_RENDER_TO, tmnasFolderForm);
			addToCentralContainer(SYSTEM_RENDER_TO, tmnasServiceForm);

			format_display_tmnas_service(tmnas_jsonData);
		},
		failure: function(result) {
			formFailureFunction();
		}
	});
}
