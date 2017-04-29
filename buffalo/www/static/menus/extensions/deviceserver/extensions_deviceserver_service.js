function create_deviceserver_form_display_mode() {
	var deviceserver = new Ext.form.TextField({
		id: 'deviceserver',
		name: 'deviceserver',
		fieldLabel:S('deviceserver_form_title'),
		width: 400,
		readOnly: true
	});

	var deviceserver_editBtn = new Ext.Button({
		id: 'deviceserver_editBtn',
		name:'deviceserver_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){
				deviceserver_editBtnHandler(deviceserverForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'deviceserver'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var deviceserverForm = new Ext.FormPanel({
		id: ID_DEVICESERVER_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('deviceserver_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [deviceserver_editBtn],
		titleCollapse: true,
		items: [
			deviceserver
		]
	});

	return deviceserverForm;
}

function create_deviceserver_form_edit_mode() {
	var deviceserver_on = new Ext.form.Radio({
		id: 'deviceserver_on',
		hideLabel: true,
		name: 'deviceserver',
		boxLabel: S('enable'),
		inputValue: 'on'
	});

	var deviceserver_off = new Ext.form.Radio({
		id: 'deviceserver_off',
		hideLabel: true,
		name: 'deviceserver',
		boxLabel: S('disable'),
		inputValue: 'off'
	});

	var deviceserver_saveBtn = new Ext.Button({
		id: 'deviceserver_saveBtn',
		name:'deviceserver_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				deviceserver_saveBtnHandler(deviceserverForm);
			}
		}
	});

	var deviceserver_cancelBtn = new Ext.Button({
		id: 'deviceserver_cancelBtn',
		name:'deviceserver_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				deviceserver_display_mode(deviceserverForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'deviceserver'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var deviceserverForm = new Ext.FormPanel({
		id: ID_DEVICESERVER_FORM,
		cls : 'panel-custBorders',
		title: S('deviceserver_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			deviceserver_saveBtn,
			deviceserver_cancelBtn
		],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('deviceserver_form_title') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [deviceserver_on]
			}, {
				layout:'form',
				columnWidth: .368,
				items: [deviceserver_off]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			hideMode: 'offsets',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: '<br/ >'
			}, {
				cls: 'label',
				columnWidth: .736,
				html: '<br/ >' + S('Warn_USBDevServer_spec')
			}]
		}]
	});

	return deviceserverForm;
}

function deviceserver_saveBtnHandler(deviceserverForm){
	deviceserverForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DEVICESERVER
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			deviceserver_jsonData = deviceserverForm.form.getValues();
			deviceserver_display_mode(deviceserverForm);
			deviceserver_format_display(deviceserver_jsonData);

			deviceservermode = deviceserver_jsonData.deviceserver;
		}
	});
}

function deviceserver_editBtnHandler(deviceserverForm_edit){
	deviceserverForm_edit.destroy();
	deviceserverForm_display = create_deviceserver_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, deviceserverForm_display, ID_DEVICESERVER_FORM);
	deviceserverForm_display.form.setValues(deviceserver_jsonData);
	radioSelection_deviceserver(deviceserver_jsonData);
	deviceserverForm_display.expand(true);
}

function deviceserver_display_mode(deviceserverForm_display){
	deviceserverForm_display.destroy();
	deviceserverForm_edit = create_deviceserver_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, deviceserverForm_edit, ID_DEVICESERVER_FORM);
	deviceserver_format_display(deviceserver_jsonData);
	deviceserverForm_edit.expand(true);
}

function radioSelection_deviceserver(data){
	selectedMethod = data.deviceserver;
	deviceserverRadioEn = Ext.getCmp('deviceserver_on');
	deviceserverRadioDis = Ext.getCmp('deviceserver_off');

	if (selectedMethod == 'on') {
		deviceserverRadioEn.setValue(true);
	}
	else {
		deviceserverRadioDis.setValue(true);
	}
}

function deviceserver_format_display(data) {
	var deviceserver = Ext.getCmp('deviceserver');

	if (data.deviceserver == 'off') {
		deviceserver.setValue(S('disabled'));
	}
	else {
		deviceserver.setValue(S('enabled'));
	}
}
