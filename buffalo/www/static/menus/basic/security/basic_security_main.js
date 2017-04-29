var admin_jsonData;
var accessControl_jsonData;
var hddTool_jsonData;

function security_processAuth(){
	Ext.QuickTips.init();

	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_VALIDATE_SESSION},
		method: 'GET',
		success: function (result){
			//Get response from server	
			rawData = result.responseText;
			response = Ext.decode(rawData);
		
			var success = response.success;
			if (success){
				resetCookie(response);
				create_security_iscsi_display();
			}
			else {
				//winAjaxFailureFunction(response);
				failureFunction(response);
			}
		}
	});
}

function create_security_iscsi_display(){
	adminSettingsForm = create_admin_settings_display_mode();
	updateCentralContainer(ADMIN_SETTINGS_RENDER_TO, adminSettingsForm);
	
	accessControlForm = create_access_control_display_mode();
	addToCentralContainer(ADMIN_SETTINGS_RENDER_TO, accessControlForm);
		
	accessControl_check_iscsi();
	
	hddToolForm = create_hdd_tool_display_mode();
	addToCentralContainer(ADMIN_SETTINGS_RENDER_TO, hddToolForm);
	
	adminSettingsForm.load({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_GET_ADMIN_SETTINGS},
		waitMsg: S('msg_loading_data'),
		failure:function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			admin_jsonData = resp.data[0];
		}
	});	
	accessControlForm.load({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_GET_ACCESS_CONTROL},
		waitMsg: S('msg_loading_data'),
		failure:function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			accessControl_jsonData = resp.data[0];
			accessControl_format_display(accessControl_jsonData);
		}
	});
	hddToolForm.load({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_GET_HDD_TOOL_SETTINGS},
		waitMsg: S('msg_loading_data'),
		failure:function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			hddTool_jsonData = resp.data[0];
			hddTool_format_display();
		}
	});
}
