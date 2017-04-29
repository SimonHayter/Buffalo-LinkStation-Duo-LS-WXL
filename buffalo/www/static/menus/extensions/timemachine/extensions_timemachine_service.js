function create_timemachine_form_display_mode() {

	var time_machine_status = new Ext.form.TextField({
		id: 'time_machine_status',
		name: 'time_machine_status',
		fieldLabel:S('timemachine_form_title'),
		width: 400,
		readOnly: true
	});
	
	var timemachine_dir = new Ext.form.TextField({
		id: 'timemachine_dir',
		name: 'time_machine_dir',
		fieldLabel: S('timemachine_dir_field'),
		width: 400,
		autoWidth: true,
		readOnly: true
	});

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name:'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){ 
				timemachine_editBtnHandler(timemachineForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		},
		[
			{name: 'time_machine_status'},
			{name: 'time_machine_dir'}
		]
	);
	
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		},
		[
			{name: 'id'},
			{name: 'msg'}
		]
	);

	var timemachineForm = new Ext.FormPanel({
		id: ID_TIMEMACHINE_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('timemachine_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_editBtn],
		titleCollapse: true,
		items: [time_machine_status, timemachine_dir]
	});

	return timemachineForm;
}

function create_timemachine_form_edit_mode() {
	var timemachine_on = new Ext.form.Radio({
		id: 'timemachine_on',
		hideLabel: true,
		name: 'time_machine_status',
		boxLabel: S('enable'),
		listeners: {
			check: function(timemachine_on, checked) {
				 if (checked) {
					timemachine_off.setValue(false);
					this.checked = true;

					timemachine_dir.enable();
				}
			}
		},
		inputValue: 'on'
	});

	var timemachine_off = new Ext.form.Radio({
		id: 'timemachine_off',
		hideLabel: true,
		name: 'time_machine_status',
		boxLabel: S('disable'),
		listeners: {
			check: function(timemachine_off3, checked) {
				if (checked) {
					timemachine_on.setValue(false);
					this.checked = true;
					timemachine_dir.clearInvalid();
					timemachine_dir.disable();
				}
			}
		},
		inputValue: 'off'
	});
	
	var timemachine_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});
	
	var timemachine_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name:'val'},
			{name:'opt'}
		]
	);
	
	var timemachine_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_TIMEMACHINE_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		},
		proxy: timemachine_dirProxy,
		reader: timemachine_dirJReader
	});

	var timemachine_dir = new Ext.form.ComboBox({
		id: 'timemachine_dir_combo',
		hiddenName: 'time_machine_dir',
		fieldLabel: S('timemachine_dir_field'),
		store: timemachine_dirStore,
		editable: false,
		displayField: 'opt',
		emptyText: S('select_one'),
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		allowBlank: false,
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 160,
		autoWidth: true
	});

	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name: 'hn_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				timemachine_saveBtnHandler(timemachineForm);
			}
		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				timemachine_display_mode(timemachineForm);
		 	}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'time_machine_status'},
		{name: 'time_machine_dir'}
	]);
	
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	timemachine_dirStore.load({
		callback: function(r, o, s){
			var result = timemachine_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var timemachineForm = new Ext.FormPanel({
		id: ID_TIMEMACHINE_FORM,
		cls: 'panel-custBorders',
		title: S('timemachine_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('timemachine_form_title') + ":"
			},{
				layout: 'form',
				columnWidth: .368,
				items: [timemachine_on]
			},{
				layout:'form',
				columnWidth:.368,
				items:[timemachine_off]
			}]
		}, timemachine_dir]
	});

	return timemachineForm;
}

function timemachine_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_TIMEMACHINE
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			extensions_timemachine_processAuth();
/*
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction:BUFACT_GET_TIMEMACHINE
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success: function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					timemachine_jsonData = resp.data[0];
					timemachine_display_mode(hnForm);
				}
			})
*/
		}
	});
}

function timemachine_editBtnHandler(hform_edit){
	hform_edit.destroy();
	hform_display = create_timemachine_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_TIMEMACHINE_IMAGE_FORM);
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_TIMEMACHINE_FORM);
	hform_display.form.setValues(timemachine_jsonData);
	radioSelection_timemachine(timemachine_jsonData);
	hform_display.expand(true);
}

function timemachine_display_mode(hform_display){
	hform_display.destroy();
	hform_edit = create_timemachine_form_display_mode();

	if (!add_timemachine_native) {
		insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_TIMEMACHINE_IMAGE_FORM);
	}
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_TIMEMACHINE_FORM);
	hform_edit.form.setValues(timemachine_jsonData);
	timemachine_display_format(timemachine_jsonData);

	if (!add_timemachine_native) {
		timemachine_imageForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction:BUFACT_GET_TIMEMACHINE_IMAGE
			},
			waitMsg: S('msg_loading_data'),
			failure:function(form,action) {
				formFailureFunction(action);
			},
			success:function(form,action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				timemachine_image_jsonData = resp.data[0];
				radioSelection_timemachine_image(timemachine_image_jsonData);
			}
		});
	}

	hform_edit.expand(true);
}

function radioSelection_timemachine(data) {
	selectedMethod = data.time_machine_status;
	timemachineRadioEn = Ext.getCmp('timemachine_on');
	timemachineRadioDis = Ext.getCmp('timemachine_off');

	if (selectedMethod == 'on') {
		timemachineRadioEn.setValue(true);
	}
	else {
		timemachineRadioDis.setValue(true);
	}
}

function timemachine_display_format(data) {
	timemachine_dir = data.timemachine_dir;
	time_machine_status_val = data.time_machine_status;
	timemachine = Ext.getCmp('timemachine_dir');
	time_machine_status = Ext.getCmp('time_machine_status');

	if(time_machine_status_val == 'on'){
		time_machine_status.setValue(S('enabled'));
	}
	else{
		time_machine_status.setValue(S('disabled'));
		timemachine.setValue('-');
	}
	if (timemachine_dir == '') {
		timemachine.setValue('-');
	}
}

function create_timemachine_image_form() {
	var host = new Ext.form.TextField({
		id: 'host',
		name: 'host',
		fieldLabel: S('timemachine_image_host_field'),
		width: 150,
		maxLength: 63,
		minLength: 1,
		allowBlank: false,
		disabled: true
	});

	var mac = new Ext.form.TextField({
		id: 'mac',
		name: 'mac',
		fieldLabel: S('timemachine_image_mac_field'),
		width: 150,
		maxLength: 17,
		minLength: 17,
		allowBlank: false,
		maskRe: /[0-9:a-f]/i,
		disabled: true
	});

	var hn_imageBtn = new Ext.Button({
		id: 'hn_imageBtn',
		name: 'hn_imageBtn',
		text: S('btn_create'),
		listeners: {
			click: function(){
				timemachine_image_saveBtnHandler(timemachine_imageForm);
			}
		},
		disabled: true
	});

/*
	var jReader =	new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: ''}
	]);
*/

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var timemachine_imageForm = new Ext.FormPanel({
		id: ID_TIMEMACHINE_IMAGE_FORM,
		cls: 'panel-custBorders',
		title: S('timemachine_image_form_title'),
//		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_imageBtn],
		titleCollapse: true,
		items: [host, mac]
	});

	return timemachine_imageForm;
}

function timemachine_image_saveBtnHandler(hnForm){
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_CREATE_TIMEMACHINE_IMAGE
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_TIMEMACHINE_IMAGE
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success: function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					timemachine_image_jsonData = resp.data[0];
					hnForm.destroy();
					timemachine_imageForm = create_timemachine_image_form();
					addToCentralContainer(SYSTEM_RENDER_TO, timemachine_imageForm);
					radioSelection_timemachine_image(timemachine_image_jsonData);
				}
			})
		}
	});
}

function radioSelection_timemachine_image(data) {
	selectedMethod = data.lock;
	hostTxt = Ext.getCmp('host');
	macTxt = Ext.getCmp('mac');
	saveBtn = Ext.getCmp('hn_imageBtn');

	if (selectedMethod == '1') {
		hostTxt.disable();
		macTxt.disable();
		saveBtn.disable();
	}
	else if (selectedMethod == '2'){
		hostTxt.disable();
		macTxt.disable();
		saveBtn.disable();

		alert (S('timemachine_image_alert'));
	}
	else{
		hostTxt.enable();
		hostTxt.clearInvalid();
		macTxt.enable();
		saveBtn.enable();
	}
}
