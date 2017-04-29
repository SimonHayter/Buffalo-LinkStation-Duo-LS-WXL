var ip_jsonData;
var nss_jsonData;
var eth_jsonData;
var portGroup_jsonData;
var services_jsonData;

var ipRenderBefore;
var servicesRenderBefore;
var ethFrameBefore;
var portGroupRenderBefore;

function netSettings_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
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
				createNetSettings();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function createNetSettings() {
	// create forms
	var ipForm = ip_form_display_mode();
	var ethFrameForm = null;


	updateCentralContainer(NETWORK_RENDER_TO, ipForm);
	if(!product_name.match(/^LS-YL|^LS-WXBL/i))
	{
		ethFrameForm = create_ethFrame_display();
		addToCentralContainer(NETWORK_RENDER_TO, ethFrameForm);
		ipRenderBefore = ID_ETH_SETTINGS_FORM;
	}
	else
	{
		ipRenderBefore = ID_NS_SETTINGS_FORM;
	}

	if (!add_iscsi) {
		ethFrameBefore = ID_NS_SETTINGS_FORM;
		var netShareForm = create_nssForm_display();
		addToCentralContainer(NETWORK_RENDER_TO, netShareForm);
	}
	else {
		ethFrameBefore = ID_PORT_GROUP_FORM;
		ip_check_iscsi();
		ethFrame_check_iscsi();

	}

	if (add_eth) {
		servicesRenderBefore = ID_PORT_GROUP_FORM;
		var portGroupForm = create_portGroup_display();
		addToCentralContainer(NETWORK_RENDER_TO, portGroupForm);
		//....: LOAD PORT GROUP FORM :....
		portGroupForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_GET_PORT_GROUP
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				portGroup_jsonData = resp.data[0];
				portGroup_setDisplayValues(portGroup_jsonData);
			}
		});
		portGroup_check_iscsi();
	}

	//....: LOAD IP FORM :....
	ipForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_IP_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			ip_jsonData = resp.data[0];
			set_eth_status_display(ip_jsonData);
			Ext.getCmp('ip_settings_editBtn').enable();
			ip_check_iscsi();
		}
	});

/*
	//....: LOAD NETWORK SHARING SERVICES FORM :....
	netShareForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_NSSS_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			nss_jsonData = resp.data[0];
		}
	});
*/

	if(ethFrameForm)
	{
		//....: LOAD NETWORK SHARING SERVICES FORM :....
		ethFrameForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_GET_EFS_SETTINGS
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				eth_jsonData = resp.data[0];
				set_ethFrame_status_display(eth_jsonData);
			}
		});
	}
}
