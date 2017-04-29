function create_tmnas_service_form_display_mode() {
	var service = new Ext.form.TextField({
		id: 'service',
		name: 'service',
		fieldLabel:S('tmnas_sercive_field'),
		width: 400,
		readOnly: true
	});

	var tmnas_editBtn = new Ext.Button({
		id: 'tmnas_editBtn',
		name: 'tmnas_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() { 
				detailSettings = true;
				tmnas_editBtnHandler(tmnasServiceForm);
			}
		}
	});

	var tmnas_webBtn = new Ext.Button({
		id: 'tmnas_webBtn',
		name: 'tmnas_webBtn',
		text: S('btn_tmnas_open_webui'),
		disabled: true,
		listeners: {
			click: function() {
				tmnas_webBtnHandler(tmnasServiceForm);
			}
		}
	});

	var tmnas_initBtn = new Ext.Button({
		id: 'tmnas_initBtn',
		name: 'tmnas_initBtn',
		text: S('btn_tmnas_init'),
		listeners: {
			click: function() {
				tmnas_initBtnHandler(tmnasServiceForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'dir_win'},
		{name: 'dir_mac'},
		{name: 'port'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var tmnas_folderStr;
	if (tmnas_jsonData.service == 'on') {
		tmnas_folderStr = tmnas_jsonData.dir_win + '<br /><br />' + tmnas_jsonData.dir_mac;
	}
	else {
		tmnas_folderStr = '-';
	}

	var tmnasServiceForm = new Ext.FormPanel({
		id: ID_TMNAS_SERVICE_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('tmnas_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			tmnas_editBtn,
			tmnas_webBtn,
			tmnas_initBtn
		],
		titleCollapse: true,
		items: [
			service,
			{
				autoWidth: true,
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .272,
					html: S('tmnas_folder_path_field') + ":"
				},{
					cls: 'label',
					columnWidth: .728,
					html: tmnas_folderStr
				}]
			}
		]
	});

	return tmnasServiceForm;
}

function create_tmnas_service_form_edit_mode() {
	var tmnas_service_on = new Ext.form.Radio({
		id: 'tmnas_service_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(tmnas_service_on, checked) {
				if (checked) {
					radioSelection_tmnas_service_on();
					tmnas_service_off.setValue(false);
				}
			}
		},
		inputValue: 'on'
	});

	var tmnas_service_off = new Ext.form.Radio({
		id: 'tmnas_service_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(tmnas_service_off, checked) {
				if (checked) {
					radioSelection_tmnas_service_off();
					tmnas_service_on.setValue(false);
				}
			}
		},
		inputValue: 'off'
	});

	var tmnas_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});
	
	var tmnas_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name:'val'},
			{name:'opt'}
		]
	);
	
	var tmnas_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_TIMEMACHINE_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		},
		proxy: tmnas_dirProxy,
		reader: tmnas_dirJReader
	});

	var tmnas_dir = new Ext.form.ComboBox({
		id: 'tmnas_dir_combo',
		hiddenName: 'dir',
		fieldLabel: S('tmnas_folder_path_field'),
		store: tmnas_dirStore,
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

	var tmnas_saveBtn = new Ext.Button({
		id: 'tmnas_saveBtn',
		name:'tmnas_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				tmnas_saveBtnHandler(tmnasForm);
			}
		}
	});

	var tmnas_cancelBtn = new Ext.Button({
		id: 'tmnas_cancelBtn',
		name: 'tmnas_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				tmnas_display_mode(tmnasForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'dir_win'},
		{name: 'dir_mac'},
		{name: 'port'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	tmnas_dirStore.load({
		callback: function(r, o, s){
			var result = tmnas_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var tmnasForm = new Ext.FormPanel({
		id: ID_TMNAS_SERVICE_FORM,
		cls: 'panel-custBorders',
		title: S('tmnas_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [tmnas_saveBtn, tmnas_cancelBtn],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('tmnas_sercive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [tmnas_service_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [tmnas_service_off]
			}]
		},
		tmnas_dir,
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: '<br/ >'
			},{
				cls: 'label',
				columnWidth: .736,
				html: "<font color='red'>" + S('tmnas_folder_warning') + '</font>'
			}]
		}
		]
	});

	return tmnasForm;
}

function tmnas_saveBtnHandler(tmnasForm) {
	tmnasForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_TMNAS_SERVICE
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			tmnasForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_TMNAS_SERVICE
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					tmnas_jsonData = resp.data[0];
					tmnas_display_mode(tmnasForm);
				}
			})
		}
	});
}

function tmnas_editBtnHandler(tnmasForm_display) {
	ValidateSession();
	tnmasForm_display.destroy();

	tnmasForm_edit = create_tmnas_service_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, tnmasForm_edit, ID_TMNAS_SERVICE_FORM);

	tnmasForm_edit.form.setValues(tmnas_jsonData);
	radioSelection_tmnas_service(tmnas_jsonData);
	tnmasForm_edit.expand(true);
}

function tmnas_display_mode(tnmasForm_display) {
	tnmasForm_display.destroy();
	tnmasForm_display = create_tmnas_service_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, tnmasForm_display, ID_TMNAS_SERVICE_FORM);
	tnmasForm_display.form.setValues(tmnas_jsonData);
	format_display_tmnas_service(tmnas_jsonData);
	tnmasForm_display.expand(true);
}

function tmnas_webBtnHandler() {
	window.open('http://' + window.location.host + ':' + tmnas_jsonData.port + '/');
}

function tmnas_initBtnHandler(tmnasForm) {
	tmnasForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_INIT_TMNAS_SETTINGS
		},
		waitMsg: S('msg_initializing_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			tmnasForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_TMNAS_SERVICE
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					tmnas_jsonData = resp.data[0];
					tmnas_display_mode(tmnasForm);
				}
			})
		}
	});
}

function radioSelection_tmnas_service(data) {
	var selectedMethod = data.service;
	if (selectedMethod == 'on') {
		var tmnas_service_on = Ext.getCmp('tmnas_service_on');
		tmnas_service_on.setValue(true);
	}
	else {
		var tmnas_service_off = Ext.getCmp('tmnas_service_off');
		tmnas_service_off.setValue(true);
	}
}

function radioSelection_tmnas_service_on(checked) {
	var tmnas_service_on = Ext.getCmp('tmnas_service_on');
	var tmnas_dir_combo = Ext.getCmp('tmnas_dir_combo');

	tmnas_service_on.checked = true;
	tmnas_dir_combo.enable();
	tmnas_dir_combo.clearInvalid();
}

function radioSelection_tmnas_service_off(checked) {
	var tmnas_service_off = Ext.getCmp('tmnas_service_off');
	var tmnas_dir_combo = Ext.getCmp('tmnas_dir_combo');

	tmnas_service_off.checked = true;
	tmnas_dir_combo.disable();
	tmnas_dir_combo.clearInvalid();
}

function format_display_tmnas_service(tmnas_jsonData){
	var serviceVal = tmnas_jsonData.service;

	var tmnas_folderStr;
	tmnas_folderStr = tmnas_jsonData.dir_win + '<br /><br />' + tmnas_jsonData.dir_mac;

	var service = Ext.getCmp('service');
	var servicewebBtn = Ext.getCmp('tmnas_webBtn');

	if (serviceVal != 'on') {
		service.setValue(S('disabled'));
	}
	else {
		service.setValue(S('enabled'));
		servicewebBtn.enable();
	}
}

function create_tmnas_folder_form_display_mode(tmnas_jsonData) {
	var cm = new Ext.grid.ColumnModel([
		{
			id: "shareName",
			header: S('sh_gridCol_name'),
			dataIndex: "shareName",
			direction: "ASC",
			renderer: tmnasFolders_renderTopic,
			width: 150
		}, {
			header: S('sh_gridCol_volume'),
			dataIndex: 'volume',
			width: 80,
			renderer: tmnasFolders_renderVolume
		}, {
			header: S('tmnas_folder_scan_realtime'),
			dataIndex: 'realtime',
			renderer: tmnasFolders_renderScan,
			width: 120
		}, {
			header: S('tmnas_folder_scan_scheduled'),
			dataIndex: 'scheduled',
			renderer: tmnasFolders_renderScan,
			width: 120
		}, {
			header: S('tmnas_folder_scan_manual'),
			dataIndex: 'manual',
			renderer: tmnasFolders_renderScan,
			width: 120
		}
	]);

	cm.defaultSortable = true;

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ALL_SHARE
		},
		waitMsg: S('msg_loading_data'),
		fields: [
			{name: 'shareName'},
			{name: 'volume'},
			{name: 'realtime'},
			{name: 'scheduled'},
			{name: 'manual'}
		]
	});

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [
			{name: 'name'},
			{name: 'value'}
		]
	});

	var searchbox = new Ext.form.ComboBox({
		id: ID_SH_FOLD_TOP_SEARCH_COMBO,
		hideLabel: true,
		allowBlank: true,
		editable: true,
		store: searchComboStore,
		selectOnFocus: true,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
		mode: 'local',
		hideTrigger: true,
		listWidth: 110,
		width: 110,
		listeners: {
			select: function(c, r, i) {
				var gridIndex = r.get('name');
				var sm = grid.getSelectionModel();
				sm.selectRow(gridIndex, false);
				grid.getView().focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var toolbar  =	new Ext.Toolbar({
		autoHeight: true,
		items: [
			'->',
			S('searchBox_find'),
			' ',
			searchbox
		],
		frame: true
	});

	var grid = new Ext.grid.GridPanel({
		id: 'grid',
		store: jsonStore,
		cm: cm,
		width: 640,
		height: 200,
		enableHdMenu: false,
		tbar: toolbar,
		stripeRows: true,
		frame: true,
		listeners: {
			sortchange: function() {
				update_combo_search(grid, searchbox, 'shareName');
			}
		}
	});

	jsonStore.load({
		callback: function(r) {
			// remove the 'info' folder
			var infoIndex = jsonStore.find('shareName', 'info', 0, false);
			if (infoIndex != -1) {
				var infoFolder = jsonStore.getAt(infoIndex);
				jsonStore.remove(infoFolder);
			}

			// remove the quarantine folder
			var dirIndex = jsonStore.find('shareName', tmnas_jsonData.dir, 0, false);
			if (dirIndex != -1) {
				var dirFolder = jsonStore.getAt(dirIndex);
				jsonStore.remove(dirFolder);
			}

			var result = jsonStore.reader.jsonData.success;
			if (result) {
				update_combo_search(grid, searchbox, 'shareName');
			}
			else {
				formFailureFunction();
			}
		}
	});

	var shForm = new Ext.FormPanel({
		frame: false,
		bodyBorder: false,
		id: ID_SH_FOLD_EDITABLE_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [
			{layout: 'form'},
			grid
		]
	});

	return shForm;
}

function tmnasFolders_renderTopic(value, cell, record) {
	var realtime = record.get('realtime');
	var scheduled = record.get('scheduled');
	var manual = record.get('manual');

	return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='tmnas_editSharedFolder(\"{0}\", \"{1}\", \"{2}\", \"{3}\");'>{0}</a></b>", value, realtime, scheduled, manual);
}

function tmnasFolders_renderVolume(value) {
	return S(value);
}

function tmnasFolders_renderScan(value, cell, record) {
	if (value == 1) {
		return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	}
	else {
		return String.format('<img src= ' + IMAGE_CROSS + ' />');
	}
}

function tmnas_editSharedFolder(id, realtime, scheduled, manual) {
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	shFolders_display_jReaderFields
	);

	var form = tmnas_folder_createForm(id, 'editMode', jReader, realtime, scheduled, manual);

	update_header(true, 'header_5_9', id);

	updateCentralContainer(SHARED_FOLDER_RENDER_TO, form);
	tmnas_folder_loadForm(form, id);
}

function tmnas_folder_createForm(id, mode, jReader, realtime, scheduled, manual) {
	var shareName = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderName'),
		id: 'shareName',
		name: 'shareName',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var shareDesc = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderDesc'),
		id: 'shareDesc',
		name: 'shareDesc',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var TMNAS_FOLDER_PERMISSON_LIST = [
		['0', S('tmnas_folder_scan_disable')],
		['1', S('tmnas_folder_scan_enable')]
	];

	var tmnas_permStore = new Ext.data.SimpleStore({
		fields: ['val', 'opt'],
		data: TMNAS_FOLDER_PERMISSON_LIST
	})

	var realtime = new Ext.form.ComboBox({
		id: 'realtime_combo',
		name: 'realtime',
		hiddenName:'realtime',
		fieldLabel: S('tmnas_folder_scan_realtime'),
		store: tmnas_permStore,
		displayField: 'opt',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 200,
		width: 200,
		editable: false
	});

	var scheduled = new Ext.form.ComboBox({
		id: 'scheduled_combo',
		name: 'scheduled',
		hiddenName:'scheduled',
		fieldLabel: S('tmnas_folder_scan_scheduled'),
		store: tmnas_permStore,
		displayField: 'opt',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 200,
		width: 200,
		editable: false
	});

	var manual = new Ext.form.ComboBox({
		id: 'manual_combo',
		name: 'manual',
		hiddenName:'manual',
		fieldLabel: S('tmnas_folder_scan_manual'),
		store: tmnas_permStore,
		displayField: 'opt',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 200,
		width: 200,
		editable: false
	});

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var tmnasFoldersForm = new Ext.FormPanel({
		hideTitle: true,
		frame: false,
		id: ID_SH_FOLD_PREFIX_FORM,
		width: 600,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [
			shareName,
			shareDesc,
			realtime,
			scheduled,
			manual
		]
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_9', id);
				tmnas_folder_saveBtnHandler(tmnasFoldersForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'tmnas_folcer_edit_cancel_button',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_9', id);
				createTmnasSettings();
			}
		}
	});

	tmnasFoldersForm.add({
		buttonAlign: 'left',
		buttons: [
			applyBtn,
			cancelBtn
		]
	});

	return tmnasFoldersForm;
}

function tmnas_folder_loadForm(form, shareName){
	form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_SHARE + shareName
		},
		waitMsg: S('msg_loading_data'),
		failure:function(f, action) {
			formFailureFunction(action);
		},
		success: function(f, action) {
			resetCookie();
			var decodedResponse= Ext.decode(action.response.responseText);
			var data = decodedResponse.data[0];
		}
	});
}

function tmnas_folder_saveBtnHandler(tmnasFoldersForm){
	tmnasFoldersForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_TMNAS_FOLDER
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			createTmnasSettings();
		}
	});
}
