var webaxs_jsonData;
var webaxs_backup_jsonData = {
	"service" : "off",
	"server" : "",
	"name" : "",
	"key" : "",
	"ddns" : "",
	"upnp" : "",
	"port" : "",
	"inner_port" : "",
	"session_exclusive" : "",
	"session_expire_min" : "",
	"detail_settings" : "off"
};

function extensions_webaxs_processAuth(){
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
				createWebaxsSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createWebaxsSettings(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_WEBAXS
		},
		method: 'GET',
		success: function (result){
			var MaskElems = Ext.DomQuery.select('.ext-el-mask');
			Ext.get(MaskElems).hide();

			resetCookie();
			resp = Ext.decode(result.responseText);
			webaxs_jsonData = resp.data[0];
			webaxs_backup_jsonData = cloneJSON(webaxs_jsonData);
			
			var detail_settingsVal = webaxs_jsonData.detail_settings == 'on' ? true : false;
			
			webaxsFolderForm = create_webaxs_folder_form_display_mode();
			webaxsForm = create_webaxs_form_display_mode(detail_settingsVal);

			updateCentralContainer(SYSTEM_RENDER_TO, webaxsFolderForm);
			addToCentralContainer(SYSTEM_RENDER_TO, webaxsForm);
			
			format_display_webaxs(webaxs_jsonData);
		},
		failure: function(result) {
			formFailureFunction();
		}
	});
}

function cloneJSON(o) {
	if (o == webaxs_jsonData) {
		webaxs_backup_jsonData.service = o.service;
		webaxs_backup_jsonData.server = o.server;
		webaxs_backup_jsonData.ssl = o.ssl;
		webaxs_backup_jsonData.name = o.name;
		webaxs_backup_jsonData.key = o.key;
		webaxs_backup_jsonData.ddns = o.ddns;
		webaxs_backup_jsonData.upnp = o.upnp;
		webaxs_backup_jsonData.port = o.port;
		webaxs_backup_jsonData.inner_port = o.inner_port;
		webaxs_backup_jsonData.session_exclusive = o.session_exclusive;
		webaxs_backup_jsonData.session_expire_min = o.session_expire_min;
		webaxs_backup_jsonData.detail_settings = o.detail_settings;

		return webaxs_backup_jsonData;
	}
	else {
		webaxs_jsonData.service = o.service;
		webaxs_jsonData.server = o.server;
		webaxs_jsonData.ssl = o.ssl;
		webaxs_jsonData.name = o.name;
		webaxs_jsonData.key = o.key;
		webaxs_jsonData.ddns = o.ddns;
		webaxs_jsonData.upnp = o.upnp;
		webaxs_jsonData.port = o.port;
		webaxs_jsonData.inner_port = o.inner_port;
		webaxs_jsonData.session_exclusive = o.session_exclusive;
		webaxs_jsonData.session_expire_min = o.session_expire_min;
		webaxs_jsonData.detail_settings = o.detail_settings;

		return webaxs_jsonData;
	}
}

function ValidateSession(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: "validateSession"
		},
		method: 'GET',
		success: function (result){
			rawData = result.responseText;
			response = Ext.decode(rawData);
			
			var success = response.success;
			if (success) {
				resetCookie(response);
			}
			else {
				formFailureFunction();
			}
		}
	})
}

