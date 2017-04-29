function create_mediaserver_itunes_form_display_mode(mediaserver_itunes_jsonData) {
	var service = new Ext.form.TextField({
		id: 'service_itunes',
		name: 'service_itunes',
		fieldLabel:S('mediaserver_server_field_itunes'),
		width: 400,
		readOnly: true
	});


	var itunesserver_dir = new Ext.form.TextField({
		id: 'itunesserver_dir',
		name: 'folder',
		fieldLabel:S('mediaserver_dir_field'),
		width: 400,
		readOnly: true
	});

	var editBtn = new Ext.Button({
		id: 'editBtn',
		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				mediaserver_itunes_editBtnHandler(mediaserver_iTunesForm);
			}
		}
	});

	var restartBtn = new Ext.Button({
		id: 'itunes_restartBtn',
		name: 'itunes_restartBtn',
		text: S('btn_restart_mediaserver_itunes'),
		disabled: true,
		listeners: {
			click: function() {
				mediaserver_itunes_restartBtnHandler(mediaserver_iTunesForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var items = new Array();
	var buttons = new Array();

	items = [
		service,
		itunesserver_dir
	];

	buttons = [
		editBtn,
		restartBtn
	];

	var mediaserver_iTunesForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_ITUNES_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('mediaserver_server_field_itunes'),
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

	return mediaserver_iTunesForm;
}

function create_mediaserver_itunes_form_edit_mode(mediaserver_itunes_jsonData) {
	var itunesserver_on = new Ext.form.Radio({
		id: 'itunesserver_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(itunesserver_on, checked) {
				if (checked) {
					itunesserver_off.setValue(false);
					this.checked = true;

					itunesserver_dir.enable();
				}
			}
		},
		inputValue: 'on'
	});

	var itunesserver_off = new Ext.form.Radio({
		id: 'itunesserver_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(itunesserver_off, checked) {
				if (checked) {
					itunesserver_on.setValue(false);
					this.checked = true;

					itunesserver_dir.disable();
				}
			}
		},
		inputValue: 'off'
	});

	var itunesserver_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});

	var itunesserver_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name: 'val'},
			{name: 'opt'}
		]
	);

	var itunesserver_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_MEDIASERVER_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
		},
		proxy: itunesserver_dirProxy,
		reader: itunesserver_dirJReader
	});

	var itunesserver_dir = new Ext.form.ComboBox({
		id: 'itunesserver_dir_combo',
		hiddenName: 'folder',
		fieldLabel: S('mediaserver_dir_field'),
		store: itunesserver_dirStore,
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

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				mediaserver_itunes_saveBtnHandler(mediaserver_iTunesForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				mediaserver_itunes_display_mode(mediaserver_iTunesForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	itunesserver_dirStore.load({
		callback: function(r, o, s) {
			var result = itunesserver_dirStore.reader.jsonData.success;
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
			html: S('mediaserver_server_field_itunes') + ":"
		}, {
			layout: 'form',
			columnWidth: .368,
			items: [itunesserver_on]
		}, {
			layout:'form',
			columnWidth:.368,
			items: [itunesserver_off]
		}]
	}, itunesserver_dir];

	var mediaserver_iTunesForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_ITUNES_FORM,
		cls: 'panel-custBorders',
		title: S('mediaserver_server_field_itunes'),
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

	return mediaserver_iTunesForm;
}

function mediaserver_itunes_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_ITUNES_SETTINGS
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

function mediaserver_itunes_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_mediaserver_itunes_form_edit_mode(mediaserver_itunes_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_MEDIASERVER_SQUEEZEBOX_FORM);
	hform_display.form.setValues(mediaserver_itunes_jsonData);
	hform_display.expand(true);
}

function mediaserver_itunes_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_mediaserver_itunes_form_display_mode(mediaserver_itunes_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_MEDIASERVER_SQUEEZEBOX_FORM);
	hform_edit.form.setValues(mediaserver_itunes_jsonData);
	mediaserver_itunes_format_display(mediaserver_itunes_jsonData);
	hform_edit.expand(true);
}

function mediaserver_itunes_format_display(mediaserver_itunes_jsonData) {
	var serviceVal = mediaserver_itunes_jsonData.service;
	var folderVal = mediaserver_itunes_jsonData.folder;

	var service = Ext.getCmp('service_itunes');
	var itunesserver_dir = Ext.getCmp('itunesserver_dir');
	var mediaserver_itunes_restartBtn = Ext.getCmp('itunes_restartBtn');

	if (serviceVal == 'on') {
		service.setValue(S('enabled'));
		mediaserver_itunes_restartBtn.enable();
	}
	else {
		service.setValue(S('disabled'));
	}

	itunesserver_dir.setValue(folderVal);
}

function mediaserver_itunes_restartBtnHandler(hform_edit) {
	hform_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_RESTART_ITUNES_SERVICE
		},
		waitMsg: S('restarting_server'),
		failure: function(form,action) {
			msgBox_usingDictionary('mediaserver_itunes_restart_title', 'mediaserver_itunes_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			msgBox_usingDictionary('mediaserver_itunes_restart_title', 'mediaserver_itunes_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}
