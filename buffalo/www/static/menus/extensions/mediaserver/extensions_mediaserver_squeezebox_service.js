var squeezebox_portVal;

function create_mediaserver_squeezebox_form_display_mode(mediaserver_squeezebox_jsonData) {
	var service = new Ext.form.TextField({
		id: 'service_squeezebox',
		name: 'service_squeezebox',
		fieldLabel:S('mediaserver_server_field_squeezebox'),
		width: 400,
		readOnly: true
	});

	var squeezeboxserver_dir = new Ext.form.TextField({
		id: 'squeezeboxserver_dir',
		name: 'folder',
		fieldLabel:S('mediaserver_dir_field'),
		width: 400,
		readOnly: true
	});

	var squeezebox_port = new Ext.form.TextField({
		id: 'squeezebox_port',
		name: 'squeezebox_port',
		fieldLabel: S('mediaserver_squeezebox_port_field'),
		autoWidth: true,
		readOnly: true
	});

	var editBtn = new Ext.Button({
		id: 'editBtn',
		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				mediaserver_squeezebox_editBtnHandler(squeezeboxserverForm);
			}
		}
	});

	var restartBtn = new Ext.Button({
		id: 'squeezebox_restartBtn',
		name: 'squeezebox_restartBtn',
		text: S('btn_restart_mediaserver_squeezebox'),
		disabled: true,
		listeners: {
			click: function() {
				mediaserver_squeezebox_restartBtnHandler(squeezeboxserverForm);
			}
		}
	});

	var squeezebox_webBtn = new Ext.Button({
		id: 'squeezebox_webBtn',
		name: 'squeezebox_webBtn',
		text: S('btn_squeezebox_open_webui'),
		disabled: true,
		listeners: {
			click: function() {
				squeezebox_webBtnHandler();
			}
		}
	});

	var squeezebox_initBtn = new Ext.Button({
		id: 'squeezebox_initBtn',
		name: 'squeezebox_initBtn',
		text: S('btn_squeezebox_init'),
		disabled: true,
		listeners: {
			click: function() {
				squeezebox_initBtnHandler(squeezeboxserverForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'},
		{name: 'squeezebox_port'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var items = new Array();
	var squeezebox_items = new Array();

	var buttons = new Array();
	var squeezebox_buttons = new Array();

	items = [
		service,
		squeezeboxserver_dir,
		squeezebox_port
	];

	buttons = [
		editBtn,
		restartBtn
	];

	squeezebox_buttons = [
		squeezebox_webBtn,
		squeezebox_initBtn
	];

	buttons = buttons.concat(squeezebox_buttons);

	var squeezeboxserverForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_SQUEEZEBOX_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('mediaserver_server_field_squeezebox'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: buttons,
		titleCollapse: true,
		items: items
	});

	return squeezeboxserverForm;
}

function create_mediaserver_squeezebox_form_edit_mode(mediaserver_squeezebox_jsonData) {
	var squeezeboxserver_on = new Ext.form.Radio({
		id: 'squeezeboxserver_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(squeezeboxserver_on, checked) {
				if (checked) {
					squeezeboxserver_off.setValue(false);
					this.checked = true;

					squeezeboxserver_dir.enable();
					squeezebox_port.enable();
				}
			}
		},
		inputValue: 'on'
	});

	var squeezeboxserver_off = new Ext.form.Radio({
		id: 'squeezeboxserver_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(squeezeboxserver_off, checked) {
				if (checked) {
					squeezeboxserver_on.setValue(false);
					this.checked = true;

					squeezeboxserver_dir.disable();
					squeezebox_port.disable();
				}
			}
		},
		inputValue: 'off'
	});

	var squeezeboxserver_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});

	var squeezeboxserver_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name: 'val'},
			{name: 'opt'}
		]
	);

	var squeezeboxserver_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_MEDIASERVER_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
		},
		proxy: squeezeboxserver_dirProxy,
		reader: squeezeboxserver_dirJReader
	});

	var squeezeboxserver_dir = new Ext.form.ComboBox({
		id: 'squeezeboxserver_dir_combo',
		hiddenName: 'folder',
		fieldLabel: S('mediaserver_dir_field'),
		store: squeezeboxserver_dirStore,
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
		autoWidth: true,
		value: ''
	});

	var squeezebox_port = new Ext.form.NumberField({
		id: 'squeezebox_port',
		name: 'squeezebox_port',
		fieldLabel: S('mediaserver_squeezebox_port_field'),
		width: 50,
		allowBlank: false,
		allowDecimals: false,
		maxLength: 5,
		minValue: 1,
		maxValue: 65535,
		disableKeyFilter: true
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				mediaserver_squeezebox_saveBtnHandler(mediaserver_squeezeboxForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				mediaserver_squeezebox_display_mode(mediaserver_squeezeboxForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'},
		{name: 'squeezebox_port'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	squeezeboxserver_dirStore.load({
		callback: function(r, o, s) {
			var result = squeezeboxserver_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var items = new Array();

	items = [{
		autoWidth: true,
		layout: 'column',
		cls : 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('mediaserver_server_field_squeezebox') + ":"
		}, {
			layout: 'form',
			columnWidth: .368,
			items: [squeezeboxserver_on]
		}, {
			layout:'form',
			columnWidth:.368,
			items: [squeezeboxserver_off]
		}]
	}, squeezeboxserver_dir, squeezebox_port];

	var mediaserver_squeezeboxForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_SQUEEZEBOX_FORM,
		cls: 'panel-custBorders',
		title: S('mediaserver_server_field_squeezebox'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			saveBtn,
			cancelBtn
		],
		titleCollapse: true,
		items: items
	});

	return mediaserver_squeezeboxForm;
}

function mediaserver_squeezebox_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_SQUEEZEBOX_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			createMediaserverSettings();
		}
	});
}

function mediaserver_squeezebox_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_mediaserver_squeezebox_form_edit_mode(mediaserver_squeezebox_jsonData);
	addToCentralContainer(SYSTEM_RENDER_TO, hform_display, 'mediaServer_clients_list');
	hform_display.form.setValues(mediaserver_squeezebox_jsonData);
	radioSelection_mediaserver_squeezebox(mediaserver_squeezebox_jsonData, 'edit');
	hform_display.expand(true);
}

function mediaserver_squeezebox_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_mediaserver_squeezebox_form_display_mode(mediaserver_squeezebox_jsonData);
	addToCentralContainer(SYSTEM_RENDER_TO, hform_edit, 'mediaServer_clients_list');
	hform_edit.form.setValues(mediaserver_squeezebox_jsonData);
	mediaserver_squeezebox_format_display(mediaserver_squeezebox_jsonData);
	hform_edit.expand(true);
}

function mediaserver_squeezebox_format_display(mediaserver_squeezebox_jsonData) {
	var serviceVal = mediaserver_squeezebox_jsonData.service;
	var folderVal = mediaserver_squeezebox_jsonData.folder;
	squeezebox_portVal = mediaserver_squeezebox_jsonData.squeezebox_port;

	var service = Ext.getCmp('service_squeezebox');
	var squeezeboxserver_dir = Ext.getCmp('squeezeboxserver_dir');
	var squeezebox_port = Ext.getCmp('squeezebox_port');

	var mediaserver_squeezebox_restartBtn = Ext.getCmp('squeezebox_restartBtn');
	var squeezeboxWebBtn = Ext.getCmp('squeezebox_webBtn');
	var squeezeboxInitBtn = Ext.getCmp('squeezebox_initBtn');


	if (serviceVal == 'on') {
		service.setValue(S('enabled'));
		mediaserver_squeezebox_restartBtn.enable();
		squeezeboxWebBtn.enable();
		squeezeboxInitBtn.enable();
	}
	else {
		service.setValue(S('disabled'));
	}

	squeezeboxserver_dir.setValue(folderVal);

	if (squeezebox_portVal == '') {
		squeezebox_port.setValue('-');
	}
	else {
		squeezebox_port.setValue(squeezebox_portVal);
	}
}

function radioSelection_mediaserver_squeezebox(data, edit_flag) {
	var selectedMethod = data.service;

	var mediaserver_squeezebox_RadioEn = Ext.getCmp('squeezeboxserver_on');
	var mediaserver_squeezebox_RadioDis = Ext.getCmp('squeezeboxserver_off');

	if (selectedMethod == 'on') {
		mediaserver_squeezebox_RadioEn.setValue(true);
	}
	else {
		mediaserver_squeezebox_RadioDis.setValue(true);
	}
}

function mediaserver_squeezebox_restartBtnHandler(hform_edit) {
	hform_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_RESTART_SQUEEZEBOX_SERVICE
		},
		waitMsg: S('restarting_server'),
		failure: function(form,action) {
			msgBox_usingDictionary('mediaserver_squeezebox_restart_title', 'mediaserver_squeezebox_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			msgBox_usingDictionary('mediaserver_squeezebox_restart_title', 'mediaserver_squeezebox_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}

function squeezebox_webBtnHandler() {
	window.open('http://' + window.location.host + ':' + squeezebox_portVal + '/');
}

function squeezebox_initBtnHandler(mediaserver_squeezeboxForm) {
	mediaserver_squeezeboxForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_INIT_SQUEEZEBOX_SERVICE
		},
		waitMsg: S('msg_initializing_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			mediaserver_squeezeboxForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_SQUEEZEBOX_SETTINGS
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					mediaserver_squeezebox_jsonData = resp.data[0];
					mediaserver_squeezebox_display_mode(mediaserver_squeezeboxForm);
				}
			});
		}
	});
}
