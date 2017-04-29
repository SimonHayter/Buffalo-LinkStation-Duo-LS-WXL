function status_network_processAuth(){
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
				create_network_system();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function create_network_system(){
	var networkForm = status_network_display();
	updateCentralContainer(SYSTEM_RENDER_TO, networkForm);	
	networkForm.load({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_GET_NETWORK_STATUS},
		waitMsg: S('msg_loading_data'),
		failure:function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			var status_network_jsonData = resp.data[0];
			status_network_formatDisplay(status_network_jsonData);
		}
	});
}
function status_network_display() { 
//---------------------- ETH 1
	var mac_1 = new Ext.form.TextField({
		id: 'mac_1',
		name:'mac_1',
		fieldLabel:S('status_network_mac'),
		width: 200,
		readOnly: true
	});
	
	var ipAddr_1 = new Ext.form.TextField({
		id: 'ipAddr_1',
		name:'ipAddr_1',
		fieldLabel:S('status_network_ip'),
		width: 200,
		readOnly: true
	}); 	
	var subMsk_1 = new Ext.form.TextField({
		id: 'subMsk_1',
		name:'subMsk_1',
		fieldLabel:S('net_settings_subnet'),
		width: 200,
		readOnly: true
	}); 
	
	var ethFrameSize_1 = new Ext.form.TextField({
		id: 'ethFrameSize_1',
		name:'ethFrameSize_1',
		fieldLabel:S('net_settings_ethFrameSize_title'),
		width: 200,
		readOnly: true
	}); 	
	   
	var linkSpeed_1 = new Ext.form.TextField({
		id: 'linkSpeed_1',
		name:'linkSpeed_1',
		fieldLabel:S('status_network_linkSpeed'),
		width: 200,
		readOnly: true
	}); 
	 
	var packReceived_1 = new Ext.form.TextField({
		id: 'packReceived_1',
		name:'packReceived_1',
		fieldLabel:S('status_network_packReceived'),
		width: 200,
		readOnly: true
	}); 
	
	var packReceivedErr_1 = new Ext.form.TextField({
		id: 'packReceivedErr_1',
		name:'packReceivedErr_1',
		fieldLabel:S('status_network_packReceivedErr'),
		width: 200,
		readOnly: true
	}); 
	var packTransmitted_1 = new Ext.form.TextField({
		id: 'packTransmitted_1',
		name:'packTransmitted_1',
		fieldLabel:S('status_network_packTransmitted'),
		width: 200,
		readOnly: true
	}); 
	
	var packTransmittedErr_1 = new Ext.form.TextField({
		id: 'packTransmittedErr_1',
		name:'packTransmittedErr_1',
		fieldLabel:S('status_network_packTransmittedErr'),
		width: 200,
		readOnly: true
	}); 
	
 	var fieldset_eth_1 = new Ext.form.FieldSet({
		id: 'fieldset_eth_1',
		title: S('net_settings_eht_1'),
		autoHeight:true,
		labelWidth: 200, 
		items: [
			mac_1,
			ipAddr_1, 
			subMsk_1, 
			ethFrameSize_1,
//			linkSpeed_1,
			packReceived_1,
			packReceivedErr_1,
			packTransmitted_1,
			packTransmittedErr_1
		]
	});
//---------------------- ETH 2	

	var mac_2 = new Ext.form.TextField({
		id: 'mac_2',
		name:'mac_2',
		fieldLabel:S('status_network_mac'),
		width: 200,
		readOnly: true
	});
	
	var ipAddr_2 = new Ext.form.TextField({
		id: 'ipAddr_2',
		name:'ipAddr_2',
		fieldLabel:S('status_network_ip'),
		width: 200,
		readOnly: true
	});  
	var subMsk_2 = new Ext.form.TextField({
		id: 'subMsk_2',
		name:'subMsk_2',
		fieldLabel:S('net_settings_subnet'),
		width: 200,
		readOnly: true
	});
	
	var ethFrameSize_2 = new Ext.form.TextField({
		id: 'ethFrameSize_2',
		name:'ethFrameSize_2',
		fieldLabel:S('net_settings_ethFrameSize_title'),
		width: 200,
		readOnly: true
	}); 	
	   
	var linkSpeed_2 = new Ext.form.TextField({
		id: 'linkSpeed_2',
		name:'linkSpeed_2',
		fieldLabel:S('status_network_linkSpeed'),
		width: 200,
		readOnly: true
	}); 
	 
	var packReceived_2 = new Ext.form.TextField({
		id: 'packReceived_2',
		name:'packReceived_2',
		fieldLabel:S('status_network_packReceived'),
		width: 200,
		readOnly: true
	}); 
	
	var packReceivedErr_2 = new Ext.form.TextField({
		id: 'packReceivedErr_2',
		name:'packReceivedErr_2',
		fieldLabel:S('status_network_packReceivedErr'),
		width: 200,
		readOnly: true
	}); 
	var packTransmitted_2 = new Ext.form.TextField({
		id: 'packTransmitted_2',
		name:'packTransmitted_2',
		fieldLabel:S('status_network_packTransmitted'),
		width: 200,
		readOnly: true
	}); 
	
	var packTransmittedErr_2 = new Ext.form.TextField({
		id: 'packTransmittedErr_2',
		name:'packTransmittedErr_2',
		fieldLabel:S('status_network_packTransmittedErr'),
		width: 200,
		readOnly: true
	}); 

	 var fieldset_eth_2 = new Ext.form.FieldSet({
		id: 'fieldset_eth_2',
		title: S('net_settings_eht_2'),
		autoHeight:true,
		labelWidth: 200, 
		items: [
			mac_2,
			ipAddr_2, 
			subMsk_2, 
			ethFrameSize_2,
//			linkSpeed_2,
			packReceived_2,
			packReceivedErr_2,
			packTransmitted_2,
			packTransmittedErr_2
		]
	});
//----------------------------------
	
	var primDns = new Ext.form.TextField({
		id: 'primDns',
		name:'primDns',
		fieldLabel:S('net_settings_dns'),
		width: 200,
		readOnly: true
	});  

	var secDns = new Ext.form.TextField({
		id: 'secDns',
		name:'secDns',
		fieldLabel:S('net_settings_secDns'),
		width: 200,
		readOnly: true
	});  
	var gtwy = new Ext.form.TextField({
		id: 'gtwy',
		name:'gtwy',
		fieldLabel:S('net_settings_gtwy'),
		width: 200,
		readOnly: true
	}); 
	
	var portTrunk = new Ext.form.TextField({
		id: 'portTrunk',
		name:'portTrunk',
		fieldLabel:S('net_settings_portGroup'),
		width: 200,
		readOnly: true
	}); 

	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'mac_1'},
		{name: 'ipAddr_1'},
		{name: 'subMsk_1'},
		{name: 'ethFrameSize_1'},
		{name: 'linkSpeed_1'},
		{name: 'packReceived_1'},
		{name: 'packReceivedErr_1'},
		{name: 'packTransmitted_1'},
		{name: 'packTransmittedErr_1'},

		{name: 'mac_2'},
		{name: 'ipAddr_2'},
		{name: 'subMsk_2'},
		{name: 'ethFrameSize_2'},
		{name: 'linkSpeed_2'},
		{name: 'packReceived_2'},
		{name: 'packReceivedErr_2'},
		{name: 'packTransmitted_2'},
		{name: 'packTransmittedErr_2'},
		
		{name: 'primDns'},
		{name: 'secDns'},
		{name: 'gtwy'},
		{name: 'portTrunk'}

	]);
	
	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var systemNetworkForm = new Ext.FormPanel({
		id:ID_NAME_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders-noButtons',		
		title: S('status_network_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: false,
		labelWidth: 160, 
		width: 640,
		items:[
			fieldset_eth_1,
			fieldset_eth_2,
			primDns,
			secDns,
			gtwy,
			portTrunk
		],
		titleCollapse: true
	});
		 
   
	return systemNetworkForm;
}


function status_network_formatDisplay(data){
	var ethFrameSize_1 = Ext.getCmp('ethFrameSize_1');
	var ethFrameSize_2 = Ext.getCmp('ethFrameSize_2');
	var portTrunk = Ext.getCmp('portTrunk');
	var portTrunk_val;
	var ethFrameSize_1_val = S('net_settings_eth_' + data.ethFrameSize_1);
	var ethFrameSize_2_val = S('net_settings_eth_' + data.ethFrameSize_2);
	
	ethFrameSize_1.setValue(ethFrameSize_1_val);
	ethFrameSize_2.setValue(ethFrameSize_2_val);
	
	if(data.portTrunk == 'off'){
		portTrunk_val = S('net_settings_portGroup_off');
	}
	else if(data.portTrunk == '0'){
		portTrunk_val = S('net_settings_portGroup_rr');
	}
	else if(data.portTrunk == '1'){
		portTrunk_val = S('net_settings_portGroup_bck');
	}
	else if(data.portTrunk == '2'){
		portTrunk_val = S('net_settings_portGroup_xor');
	}
	else if(data.portTrunk == '3'){
		portTrunk_val = S('net_settings_portGroup_broadcast');
	}
	else if(data.portTrunk == '4'){
		portTrunk_val = S('net_settings_portGroup_dynamic');
	}
	else if(data.portTrunk == '5'){
		portTrunk_val = S('net_settings_portGroup_tlb');
	}
	/*else if(data.portTrunk == '6'){
		portTrunk_val = S('net_settings_portGroup_alb');
	}*/
	
	portTrunk.setValue(portTrunk_val);
	
}
