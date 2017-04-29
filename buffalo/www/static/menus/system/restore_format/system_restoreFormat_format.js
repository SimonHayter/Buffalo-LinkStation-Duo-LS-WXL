function create_format_display_mode(){
	var rf_formatBtn = new Ext.Button({
		id: 'rf_formatBtn',
		name:'rf_formatBtn',
		text: S('btn_format_linkstation'),
		listeners: {
			click: function() { 
				rf_formatHandler(formatForm);
				rf_formatBtn.disable();
			}
		}
	});

	var warning = S('systemFormat_warning');

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
		}, [
			{name: 'id'},
			{name: 'msg'}
		]
	);

	var jReader_display =  new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
		}, [
		{name: 'initButtonOption'}
	]);

	var formatForm = new Ext.FormPanel({
		id: ID_FORMAT_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',
		title: S('format_form_title'),
		reader: jReader_display,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [rf_formatBtn],
		items:[{
			xtype: 'label',
			html: '<p class="label">' + warning +'</p><br>'
		}],
		titleCollapse: true
	});

	return formatForm;
}

function rf_formatHandler(formatForm) {
	Ext.MessageBox.wait(S('loading_confirmation'));

	formatForm.form.load({
		url: '/dynamic.pl', 
		params: {
			bufaction: 'getGate'
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();	
			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			// refresh the number
			A = '<img class = "conf_img" src="'+ IMG_PATH +'/A.jpg'+'?' + new Date()+ '"/>';
			B = '<img class = "conf_img"  src="'+ IMG_PATH +'/B.jpg' +'?' + new Date()+ '"/>';
			C = '<img class = "conf_img" src="'+ IMG_PATH +'/C.jpg' +'?' + new Date()+ '"/>';
			D = '<img class = "conf_img"  src="'+ IMG_PATH +'/D.jpg' +'?' + new Date()+ '"/>';

			format_get_gate(hiddenGateLockTime, hiddenGateLockNumber);
		}
	});
};

function format_get_gate(hiddenGateLockTime, hiddenGateLockNumber){
	var title = S('format_gate_title');
	var msg = S('format_operation_confirm');
	var warning =S('warning');	
	var warning_msg =S('operation_cannotBeCancelled');

	var format_gate_applyBtn = new Ext.Button({
		id: 'format_gate_applyBtn',
		name: 'format_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function(){ 
				var gNumber = Ext.getCmp(ID_FORMAT_GATE_FIELD).getValue();
				format_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber);
				format_gate_applyBtn.disable();
			}
		}
	});

	var format_gate_cancelBtn = new Ext.Button({
		id: 'format_gate_cancelBtn',
		name: 'format_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				// close window
				var win = Ext.getCmp(ID_FORMAT_GATE_VERIF_WIN);
				win.hide();
				win.destroy();
				format_gate_cancelBtn.disable();
				Ext.getCmp('rf_formatBtn').enable();
			}
		}
	});

	var format_gateField = new Ext.form.NumberField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_FORMAT_GATE_FIELD,
		name: 'format_gateField',
		width: 100,
		labelWidth: 10,
		minValue: 0,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate : {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GATE
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_FORMAT_GATE_VERIF_WIN,
		modal: true,
		width: 300,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [
			{xtype: 'label', html: '<p class="title_popup"><img src="'+ WARNING_IMG +'"/> ' + title +'</p><br>'},
			{xtype: 'label', html: '<br><p class="confirmation_instruction">' + msg  +'</p><br>'},
			{xtype: 'label', html: '<br><p class="confirmation_instruction"><b>'+warning+'</b>: ' + warning_msg  +'</p>'},
			{cls: 'conf_numb_box', html: '<p id: "conf_numb">'+ A + B + C + D +'</p><br>'},
			format_gateField
		],
		buttonAlign: 'center',
		buttons: [
			format_gate_applyBtn,
			format_gate_cancelBtn]
	});

	confirmWindow.show();
}

function format_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber){
	Ext.MessageBox.wait(S('verifying_confirmation'));
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'init',
			gMode: 'format'
		},
		method: 'POST',
		success: function (result){
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			var win = Ext.getCmp(ID_FORMAT_GATE_VERIF_WIN);

			if (win){
				win.hide();
				win.destroy();
			}
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			if (success) {
				resetCookie();
				request_operation();

				var title = S('format_executing_title');
				var titleFormatted = '<p class="title"><img src="'+WARNING_IMG+'" /> &nbsp ' + title + '</p><br>';
				var msg = S('format_executing_msg');
				var msgFormatted = '<p class="msg">' + msg + '</p>'
				updateHtmlToContainer(SYSTEM_RENDER_TO, titleFormatted);
				addHtmlToContainer(SYSTEM_RENDER_TO, msgFormatted);
				// disable menus and submenus	
				if(add_iscsi){
					show_menus_submenus_disabled_iscsi();
				}else{
					show_menus_submenus_disabled();
				}
				highlight_sub_menu(selected_sub_menu);
				highlight_menu(selected_menu);	
			}
			else if (response.errors[0] == 'gate_err1') {
				// remove confirmation window
				//display error msg
				var buttons = Ext.MessageBox.OK;
				var title = S('error_box_title');
				var icon = Ext.MessageBox.ERROR;
				var msg =  S('gate_err1');

				Ext.MessageBox.show({
					width: 300,
					title: title,
					msg: msg,
					buttons: buttons,
					icon: icon,
					fn: function(btn){
						if (btn == 'ok') {
							// re-create the confirmation screen
							var form = Ext.getCmp(ID_FORMAT_FORM);
							rf_formatHandler(form);
						}
					}
				});
			}
			else if (response.errors.length > 0) {
				// even if there are more errors, just display the first one.
				var msg = response.errors[0];
				var buttons = Ext.MessageBox.OK;
				var title = 'error_box_title';
				var icon = Ext.MessageBox.ERROR;
				msgBox_usingDictionary(title, msg, buttons, icon);
			}
			else {
				failureFunction();
			}
		},
		failure: function(){
			failureFunction();
		}
	});
}

