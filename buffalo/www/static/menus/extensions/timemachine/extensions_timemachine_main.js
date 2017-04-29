var timemachine_jsonData;
var timemachine_image_jsonData;

function extensions_timemachine_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {bufaction: BUFACT_VALIDATE_SESSION},
		method: 'GET',
		success: function (result){
			//Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success){
				resetCookie(response);
				createTimemachineSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
} 


function createTimemachineSettings(){
	//--------------- create & display forms -----------------------------
	timemachineForm = create_timemachine_form_display_mode();
	timemachine_imageForm = create_timemachine_image_form();

	updateCentralContainer(SYSTEM_RENDER_TO, timemachineForm);

	if (!add_timemachine_native) {
		addToCentralContainer(SYSTEM_RENDER_TO, timemachine_imageForm);
	}

	// ----------------- load forms ---------------------------------------
	timemachineForm.load({
		url: '/dynamic.pl',
		params: {bufaction: BUFACT_GET_TIMEMACHINE},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {formFailureFunction(action);},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			timemachine_jsonData = resp.data[0];
			timemachine_display_format(timemachine_jsonData);
	 	}
	});

	if (!add_timemachine_native) {
		timemachine_imageForm.load({
			url: '/dynamic.pl', 
			params: {bufaction: BUFACT_GET_TIMEMACHINE_IMAGE},
			waitMsg: S('msg_loading_data'),
			failure:function(form,action) {formFailureFunction(action);},
			success:function(form,action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				timemachine_image_jsonData = resp.data[0];
				radioSelection_timemachine_image(timemachine_image_jsonData);
			}
		});
	}
}
