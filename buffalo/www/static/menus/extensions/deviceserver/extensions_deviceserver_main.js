var deviceserver_jsonData;

function extensions_deviceserver_processAuth(){
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
				createDeviceserverSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
} 

function createDeviceserverSettings(){
	deviceserverForm = create_deviceserver_form_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, deviceserverForm);

	deviceserverForm.load({
		url: '/dynamic.pl', 
		params: {
			bufaction: BUFACT_GET_DEVICESERVER
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			deviceserver_jsonData = resp.data[0];
			deviceserver_format_display(deviceserver_jsonData);
		}
	});
}
