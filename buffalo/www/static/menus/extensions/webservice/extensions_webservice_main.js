var flickr_jsonData;
var eyefi_jsonData;
var wafs_jsonData;
var render_flickr_form_before;
var render_eyefi_form_before;
var render_wafs_form_before;

function extensions_webservice_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
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
				createWebserviceSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createWebserviceSettings(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_FLICKR
		},
		method: 'GET',
		success: function (result) {
			var MaskElems = Ext.DomQuery.select('.ext-el-mask');
			Ext.get(MaskElems).hide();

			resetCookie();
			resp = Ext.decode(result.responseText);
			flickr_jsonData = resp.data[0];

			if (add_flickr) {
				render_flickr_form_before = ID_WEBSERVICE_FLICKR_FORM;
				flickrServiceForm = create_flickr_service_form_display_mode(flickr_jsonData);
				updateCentralContainer(SYSTEM_RENDER_TO, flickrServiceForm);

				format_display_flickr_service(flickr_jsonData);
			}

			if (add_eyefi) {
				render_eyefi_form_before = ID_WEBSERVICE_EYEFI_FORM;
				eyefiForm = create_eyefi_form_login();
				if (render_flickr_form_before != undefined) {
					addToCentralContainer(SYSTEM_RENDER_TO, eyefiForm);
				}
				else {
					updateCentralContainer(SYSTEM_RENDER_TO, eyefiForm);
				}

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
			if (add_wafs) {
				Ext.Ajax.request({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_GET_WAFS
					},
					method: 'GET',
					success: function (result) {
						resp = Ext.decode(result.responseText);
						wafs_jsonData = resp.data[0];

						render_wafs_form_before = ID_WEBSERVICE_WAFS_FORM;
						wafsServiceForm = create_wafs_service_form_display_mode(wafs_jsonData);
						if (add_flickr || add_eyefi) {
							addToCentralContainer(SYSTEM_RENDER_TO, wafsServiceForm);
						}
						else {
							updateCentralContainer(SYSTEM_RENDER_TO, wafsServiceForm);
						}
						format_display_wafs_service(wafs_jsonData);
					},
					failure: function(result) {
						formFailureFunction();
					}
				});
			}
		},
		failure: function(result) {
			formFailureFunction();
		}
	});
}
