function status_system_processAuth(){
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
				create_status_system();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function create_status_system(){
	var statusForm = status_system_display();
	updateCentralContainer(SYSTEM_RENDER_TO, statusForm);
	statusForm.load({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_GET_SYSTEM_STATUS},
		waitMsg: S('msg_loading_data'),
		failure:function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			var status_jsonData = resp.data[0];
			status_system_formatDisplay(status_jsonData);
		}
	});
}

function status_system_display() { 
	var hostName = new Ext.form.TextField({
		id: 'hostName',
		name:'hostName',
		fieldLabel:S('hostname_field'),
		width: 200,
		readOnly: true
	});

	var modelName = new Ext.form.TextField({
		id: 'modelName',
		name:'modelName',
		fieldLabel:S('status_system_modelName'),
		width: 200,
		readOnly: true
	});

	var version = new Ext.form.TextField({
		id: 'version',
		name:'version',
		fieldLabel:S('r_version'),
		width: 200,
		readOnly: true
	});

	var dateField = new Ext.form.TextField({
		id: 'dateField',
		name:'date',
		fieldLabel:S('dTime_form_title'),
		width: 200,
		readOnly: true
	});

	var timezone = new Ext.form.TextField({
		id: 'timezone',
		name:'timezone',
		fieldLabel:S('dTime_timeZone'),
		width: 200,
		readOnly: true
	});

	var workgroup = new Ext.form.TextField({
		id: 'workgroup',
		name:'workgroup',
		fieldLabel:S('workgroup'),
		width: 200,
		readOnly: true
	});

	var ntp = new Ext.form.TextField({
		id: 'ntp',
		name:'ntp',
		fieldLabel:S('status_system_ntp'),
		width: 200,
		readOnly: true
	});

	var emailAlert = new Ext.form.TextField({
		id: 'emailAlert',
		name:'emailAlert',
		fieldLabel:S('emailNotif_form_title'),
		width: 200,
		readOnly: true
	});

	var fanStatus = new Ext.form.TextField({
		id: 'fanStatus',
		name:'fanStatus',
		fieldLabel:S('status_system_fanStatus'),
		width: 200,
		readOnly: true
	});

	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'hostName'},
		{name: 'modelName'},
		{name: 'version'},
		{name: 'date'},
		{name: 'timeHour'},
		{name: 'timeMin'},
		{name: 'timeSec'},
		{name: 'timezone'},
		{name: 'workgroup'},
		{name: 'ntp'},
		{name: 'emailAlert'},
		{name: 'fanStatus'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var systemStatusForm = new Ext.FormPanel({
		id:ID_NAME_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders-noButtons',
		title: S('status_system_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: false,
		labelWidth: 160, 
		width: 640,
		items:[hostName, modelName,version, ntp, dateField, timezone, emailAlert, fanStatus],
		titleCollapse: true
	});

	return systemStatusForm;
}

function status_system_formatDisplay(data){
	var dateField = Ext.getCmp('dateField');
	var timezoneField = Ext.getCmp('timezone');
	var ntpField = Ext.getCmp('ntp');
	var emailAlertField = Ext.getCmp('emailAlert');
	var fanStatusField = Ext.getCmp('fanStatus');
	
	var date = dTime_defaultToCustomized(data.date);
	date += ' ' + data.time;
	
	var timezone = date_time_format_time_zone(data.timezone);
	var ntp;
	var emailAlert;
	var fanStatus;
	
	if(data.ntp == "on"){
		ntp = S('enabled');
	}else{
		ntp = S('disabled');
	}
	if(data.emailAlert == "on"){
		emailAlert = S('enabled');
	}else{
		emailAlert = S('disabled');
	}
	if(data.fanStatus == 1){
		fanStatus = S('arrayStatus_ok');
	}else{
		fanStatus = S('arrayStatus_error');
	}
	
	dateField.setValue(date);
	timezoneField.setValue(timezone);
	ntpField.setValue(ntp);
	emailAlertField.setValue(emailAlert);
	fanStatusField.setValue(fanStatus);
}
