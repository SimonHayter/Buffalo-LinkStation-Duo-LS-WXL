function create_flickr_service_form_display_mode(flickr_jsonData) {
	var service = new Ext.form.TextField({
		id: 'service',
		name: 'service',
		fieldLabel:S('flickr_sercive_field'),
		width: 400,
		readOnly: true
	});

	var status = new Ext.form.TextField({
		fieldLabel: S('flickr_status_field'),
		id: 'status',
		name: 'status',
		width: 400,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var flickr_editBtn = new Ext.Button({
		id: 'flickr_editBtn',
		name: 'flickr_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() { 
				detailSettings = true;
				flickr_editBtnHandler(flickrServiceForm);
			}
		}
	});

	var flickr_remountBtn = new Ext.Button({
		id: 'flickr_remountBtn',
		name: 'flickr_remountBtn',
		text: S('btn_flickr_remount'),
		disabled: true,
		listeners: {
			click: function() {
				flickr_remountBtnHandler(flickrServiceForm);
			}
		}
	});

	var flickr_initBtn = new Ext.Button({
		id: 'flickr_initBtn',
		name: 'flickr_initBtn',
		text: S('btn_flickr_auth_init'),
		disabled: true,
		listeners: {
			click: function() {
				flickr_initBtnHandler(flickrServiceForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'username'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var flickr_folderStr;
	if (flickr_jsonData.service == 'on') {
		flickr_folderStr = flickr_jsonData.path_win + '<br /><br />' + flickr_jsonData.path_mac;
//		flickr_folderStr = flickr_jsonData.path_win;
	}
	else {
		flickr_folderStr = '-';
	}

	var flickrServiceForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_FLICKR_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('flickr_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			flickr_editBtn,
			flickr_remountBtn,
			flickr_initBtn
		],
		titleCollapse: true,
		items: [
			service,
			status,
			{
				autoWidth: true,
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .272,
					html: S('flickr_folder_path_field') + ":"
				}, {
					cls: 'label',
					columnWidth: .728,
					html: flickr_folderStr
				}]
			}
		]
	});

	return flickrServiceForm;
}

function create_flickr_service_form_edit_mode(flickr_jsonData) {
	var isAuthed = flickr_jsonData.authed;

	var flickr_service_on = new Ext.form.Radio({
		id: 'flickr_service_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(flickr_service_on, checked) {
				if (checked) {
					radioSelection_flickr_service_on();
					flickr_service_off.setValue(false);
				}
			}
		},
		inputValue: 'on'
	});

	var flickr_service_off = new Ext.form.Radio({
		id: 'flickr_service_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(flickr_service_off, checked) {
				if (checked) {
					radioSelection_flickr_service_off();
					flickr_service_on.setValue(false);
				}
			}
		},
		inputValue: 'off'
	});

	var flickr_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});
	
	var flickr_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name:'val'},
			{name:'opt'}
		]
	);
	
	var flickr_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_TIMEMACHINE_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		},
		proxy: flickr_dirProxy,
		reader: flickr_dirJReader
	});

	var flickr_dir = new Ext.form.ComboBox({
		id: 'flickr_dir_combo',
		hiddenName: 'dir',
		fieldLabel: S('flickr_folder_path_field'),
		store: flickr_dirStore,
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

	var flickr_token = new Ext.form.TextField({
		id: 'flickr_token',
		name: 'flickr_token',
		fieldLabel: S('flickr_auth_token'),
		width: 100,
		maskRe: /[0-9 -]/,
		autoCreate: {
			tag: "input",
			type: "text",
			autocomplete: "off",
			maxlength: 11
		},
		allowBlank: isAuthed,
		hideMode: 'offsets',
		hidden: isAuthed,
		hideLabel: isAuthed
	});

	var flickr_saveFunc = function() {
		flickr_saveBtnHandler(flickrForm);
	}

	var flickr_saveBtn = new Ext.Button({
		id: 'flickr_saveBtn',
		name:'flickr_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				var flickr_service_on = Ext.getCmp('flickr_service_on');
				if (flickr_service_on.getValue()) {
					msgBox_usingDictionary_with_func('', 'flickr_service_warn', Ext.Msg.OK, Ext.MessageBox.WARNING, flickr_saveFunc);
				}
				else {
					flickr_saveFunc();
				}
			}
		}
	});

	var flickr_cancelBtn = new Ext.Button({
		id: 'flickr_cancelBtn',
		name: 'flickr_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				flickr_display_mode(flickrForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'dir'},
		{name: 'status'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	flickr_dirStore.load({
		callback: function(r, o, s){
			var result = flickr_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var flickrForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_FLICKR_FORM,
		cls: 'panel-custBorders',
		title: S('flickr_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			flickr_saveBtn,
			flickr_cancelBtn
		],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('flickr_sercive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [flickr_service_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [flickr_service_off]
			}]
		},
		flickr_dir,
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			hideMode: 'offsets',
			hidden: isAuthed,
			hideLabel: isAuthed,
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: '<br/ >'
			}, {
				cls: 'label',
				columnWidth: .736,
				html: S('flickr_auth_procedure') + '<br /><a href="' + S('flickr_auth_link_url') + '" target="_blank">' + S('flickr_auth_link_name') + '</a>'
			}]
		},
		flickr_token
		]
	});

	return flickrForm;
}

function flickr_saveBtnHandler(flickrForm) {
	flickrForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_FLICKR
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			flickrForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_FLICKR
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					flickr_jsonData = resp.data[0];
					flickr_display_mode(flickrForm);
				}
			})
		}
	});
}

function flickr_editBtnHandler(flickrForm_display) {
	ValidateSession();
	flickrForm_display.destroy();

	flickrForm_edit = create_flickr_service_form_edit_mode(flickr_jsonData);
	if(add_eyefi)
	{
		insertToCentralContainer(SYSTEM_RENDER_TO, flickrForm_edit, ID_WEBSERVICE_EYEFI_FORM);
	}
	else
	{
		insertToCentralContainer(SYSTEM_RENDER_TO, flickrForm_edit, ID_WEBSERVICE_WAFS_FORM);
	}
	flickrForm_edit.form.setValues(flickr_jsonData);
	radioSelection_flickr_service(flickr_jsonData);
	flickrForm_edit.expand(true);
}

function flickr_display_mode(flickrForm_display) {
	flickrForm_display.destroy();
	flickrForm_display = create_flickr_service_form_display_mode(flickr_jsonData);
	if(add_eyefi)
	{
		insertToCentralContainer(SYSTEM_RENDER_TO, flickrForm_display, ID_WEBSERVICE_EYEFI_FORM);
	}
	else
	{

		insertToCentralContainer(SYSTEM_RENDER_TO, flickrForm_display, ID_WEBSERVICE_WAFS_FORM);
	}
	flickrForm_display.form.setValues(flickr_jsonData);
	format_display_flickr_service(flickr_jsonData);
	flickrForm_display.expand(true);
}

function flickr_remountBtnHandler(flickrForm) {
	flickrForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_REMOUNT_FLICKR
		},
		waitMsg: S('msg_remounting_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			flickrForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_FLICKR
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					flickr_jsonData = resp.data[0];
					flickr_display_mode(flickrForm);
				}
			})
		}
	});
}

function flickr_initBtnHandler(flickrForm) {
	flickrForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_INIT_FLICKR
		},
		waitMsg: S('msg_initializing_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			flickrForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_FLICKR
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					flickr_jsonData = resp.data[0];
					flickr_display_mode(flickrForm);
				}
			})
		}
	});
}

function radioSelection_flickr_service(data) {
	var selectedMethod = data.service;
	if (selectedMethod == 'on') {
		var flickr_service_on = Ext.getCmp('flickr_service_on');
		flickr_service_on.setValue(true);
	}
	else {
		var flickr_service_off = Ext.getCmp('flickr_service_off');
		flickr_service_off.setValue(true);
	}
}

function radioSelection_flickr_service_on(checked) {
	var flickr_service_on = Ext.getCmp('flickr_service_on');
	var flickr_dir_combo = Ext.getCmp('flickr_dir_combo');
	var flickr_token = Ext.getCmp('flickr_token');

	flickr_service_on.checked = true;

	flickr_dir_combo.enable();
	flickr_dir_combo.clearInvalid();

	flickr_token.enable();
	flickr_token.clearInvalid();
}

function radioSelection_flickr_service_off(checked) {
	var flickr_service_off = Ext.getCmp('flickr_service_off');
	var flickr_dir_combo = Ext.getCmp('flickr_dir_combo');
	var flickr_token = Ext.getCmp('flickr_token');

	flickr_service_off.checked = true;

	flickr_dir_combo.disable();
	flickr_dir_combo.clearInvalid();

	flickr_token.disable();
	flickr_token.clearInvalid();
}

function format_display_flickr_service(flickr_jsonData){
	var serviceVal = flickr_jsonData.service;
	var authedVal = flickr_jsonData.authed;
	var usernameVal = flickr_jsonData.username;

	var service = Ext.getCmp('service');
	var remountBtn = Ext.getCmp('flickr_remountBtn');
	var initBtn = Ext.getCmp('flickr_initBtn');
	var status = Ext.getCmp('status');

	if ((serviceVal == 'on') && (authedVal)) {
		status.setValue('Flickr ID: ' + usernameVal + ' ' + S('flickr_status_ok'));
	}
	else {
		status.setValue(S('flickr_status_ng'));
	}

	if (authedVal) {
		initBtn.enable();
	}

	if (serviceVal != 'on') {
		service.setValue(S('disabled'));
	}
	else {
		service.setValue(S('enabled'));
		remountBtn.enable();
	}
}
