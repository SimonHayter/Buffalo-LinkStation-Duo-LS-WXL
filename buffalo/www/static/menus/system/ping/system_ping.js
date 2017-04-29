function pingTest_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			
			var success = response.success;
			if (success) {
				createPingForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createPingForm(){
	var pingForm = create_ping_display_mode();
	updateCentralContainer(PING_RENDER_TO, pingForm);
}

function create_ping_display_mode(){
	var ipAddr = new Ext.form.TextField({
		id: 'ipAddr',
		name: 'ipAddr',
		fieldLabel: S('ping_test_target_ip'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: false
	});

	var result = new Ext.form.TextArea({
		id: 'result',
		name: 'result',
		fieldLabel: S('ping_test_result'),
		width: 400,
		height: 200,
		readOnly: true
	});

	var pingBtn = new Ext.Button({
		id: 'pingBtn',
		name:'pingBtn',
		text: S('ping_test_ping_btn'),
		listeners: {click: function(){ pingBtnHandler(ping_form_title);}} 
	}); 

	var clearBtn = new Ext.Button({
		id: 'clearBtn',
		name:'clearBtn',
		text: S('ping_test_clear_btn'),
		disabled: true,
		listeners: {
			click: function(){ 
				ipAddr.reset();
				result.reset();
				clearBtn.disable();
			}
		}
	});

	var warning = S('system_reboot_warning');

	var jErrReader = new Ext.data.JsonReader( {
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
		}, [
			{name: 'id'},
			{name: 'msg'}
		]
	);

	var ping_form_title = new Ext.FormPanel({
		id: ID_PING_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',
		title: S('ping_test_title'),
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: false,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [clearBtn],
		items: [{
			autoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					layout: 'form',
					columnWidth: .6,
					items: [ipAddr]	
				}, {
//					layout: 'form',
					columnWidth: .001,
					html:'&nbsp'
				}, {
					layout: 'form',
					columnWidth: .3,
					items: [pingBtn]
				}]
			},
			result
		],
		titleCollapse: true
	});

	return ping_form_title;
}

function pingBtnHandler(ping_form_title) {
	var result = Ext.getCmp('result');
	var ipAddr = Ext.getCmp('ipAddr').getValue();
	var clearBtn = Ext.getCmp('clearBtn');
	ping_form_title.form.submit({
		url: '/dynamic.pl', 
		waitMsg: S('ping_test_pinging') + ' ' + ipAddr + "...",
		params: {
			bufaction: BUFACT_GET_PING_RESULTS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();

			if (action.response.responseText) {
				resp = Ext.decode(action.response.responseText);
				pingResult = resp.data[0].result;
				result.setValue(pingResult);
			}
			else {
				result.setValue(S('ping_test_request_timeout'));
			}

			clearBtn.enable();
		}
	});
}
