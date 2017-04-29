function create_bittorrent_form_display_mode() {
	var bittorrent = new Ext.form.TextField({
		id: 'bittorrent',
		name: 'bittorrent',
		fieldLabel:S('bittorrent_form_title'),
		width: 400,
		readOnly: true
	});

	var bittorrent_dir = new Ext.form.TextField({
		id: 'bittorrent_dir',
		name: 'bittorrent_dir',
		fieldLabel:S('bittorrent_dir_field'),
		width: 400,
		autoWidth: true,
		readOnly: true
	});

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){
				bittorrent_editBtnHandler(bittorrentForm);
			}
		}
	});

	var hn_webBtn = new Ext.Button({
		id: 'hn_webBtn',
		name:'hn_webBtn',
		text: S('btn_web_display'),
		disabled: true,
		listeners: {
			click: function(){
				bittorrent_webBtnHandler(bittorrentForm);
			}
		}
	});

	var hn_initBtn = new Ext.Button({
		id: 'hn_initBtn',
		name:'hn_initBtn',
		text: S('btn_bittorrent_init'),
		disabled: true,
		listeners: {
			click: function(){
				bittorrent_initBtnHandler(bittorrentForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'bittorrent_status'},
		{name: 'bittorrent_dir'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var bittorrentForm = new Ext.FormPanel({
		id: ID_BITTORRENT_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('bittorrent_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			hn_editBtn,
			hn_webBtn,
			hn_initBtn
		],
		titleCollapse: true,
		items:[bittorrent, bittorrent_dir]
	});

	return bittorrentForm;
}

function create_bittorrent_form_edit_mode() {
	var bittorrent_on = new Ext.form.Radio({
		id: 'bittorrent_on',
		hideLabel: true,
		name: 'bittorrent',
		boxLabel: S('enable'),
		listeners: {
			check: function(bittorrent_on, checked) {
				if (checked) {
					bittorrent_off.setValue(false);
					this.checked = true;

					bittorrent_dir.enable();
				}
			}
		},
		inputValue: 'on'
	});

	var bittorrent_off = new Ext.form.Radio({
		id: 'bittorrent_off',
		hideLabel: true,
		name: 'bittorrent',
		boxLabel: S('disable'),
		listeners: {
			check: function(bittorrent_off, checked) {
				if (checked) {
					bittorrent_on.setValue(false);
					this.checked = true;
					bittorrent_dir.clearInvalid();
					bittorrent_dir.disable();
				}
			}
		},
		inputValue: 'off'
	});

	var bittorrent_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});

	var bittorrent_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[{name:'val'},
		{name:'opt'}]
	);

	var bittorrent_dirStore = new Ext.data.Store({
		baseParams: {bufaction: BUFACT_GET_BITTORRENT_FOLDERS},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		},
		proxy: bittorrent_dirProxy,
		reader: bittorrent_dirJReader
	});

	var bittorrent_dir = new Ext.form.ComboBox({
		id: 'bittorrent_dir_combo',
		hiddenName: 'bittorrent_dir',
		fieldLabel: S('bittorrent_dir_field'),
		store: bittorrent_dirStore,
		editable: false,
		displayField: 'opt',
		allowBlank: false,
		emptyText: S('select_one'),
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
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
			click: function() {
				bittorrent_saveBtnHandler(bittorrentForm);
			}
		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				bittorrent_display_mode(bittorrentForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'bittorrent_status'},
		{name: 'bittorrent_dir'}
	]);
	
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	bittorrent_dirStore.load({
		callback: function(r, o, s) {
			var result = bittorrent_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var bittorrentForm = new Ext.FormPanel({
		id: ID_BITTORRENT_FORM,
		cls : 'panel-custBorders',
		title: S('bittorrent_form_title'),
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
					html: S('bittorrent_form_title') + ":"
				},{
					layout: 'form',
					columnWidth: .368,
					items: [bittorrent_on]
				},{
					layout:'form',
					columnWidth:.368,
					items:[bittorrent_off]
				}]
			},
			bittorrent_dir
		]
	});

	return bittorrentForm;
}

function bittorrent_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_BITTORRENT
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
					bufaction: BUFACT_GET_BITTORRENT
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success:function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					bittorrent_jsonData = resp.data[0];
					bittorrent_display_mode(hnForm);
				}
			})
		}
	});
}

function bittorrent_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_bittorrent_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_BITTORRENT_FORM);
	hform_display.form.setValues(bittorrent_jsonData);
	radioSelection_bittorrent(bittorrent_jsonData);
	hform_display.expand(true);
}

function bittorrent_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_bittorrent_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_BITTORRENT_FORM);
	bittorrent_format_display(bittorrent_jsonData);
	hform_edit.expand(true);
}

function bittorrent_webBtnHandler() {
	window.open('http://' + window.location.host + ':9090/gui/');
}

function bittorrent_initBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_INIT_BITTORRENT
		},
		waitMsg: S('msg_initializing_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_BITTORRENT
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success:function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					bittorrent_jsonData = resp.data[0];
					bittorrent_display_mode(hnForm);
				}
			})
		}
	});
}

function radioSelection_bittorrent(data){
	selectedMethod = data.bittorrent_status;
	bittorrentRadioEn = Ext.getCmp('bittorrent_on');
	bittorrentRadioDis = Ext.getCmp('bittorrent_off');

	if (selectedMethod == 'on') {
		bittorrentRadioEn.setValue(true);
	}
	else {
		bittorrentRadioDis.setValue(true);
	}
}

function bittorrent_format_display(data){
	selectedMethod = data.bittorrent_status;
	bittorrentDirVal = data.bittorrent_dir;
	bittorrent = Ext.getCmp('bittorrent');
	bittorrentDir = Ext.getCmp('bittorrent_dir');
	bittorrentwebBtn = Ext.getCmp('hn_webBtn');
	bittorrentinitBtn = Ext.getCmp('hn_initBtn');

	if (selectedMethod == 'on') {
		bittorrent.setValue(S('enabled'));
		bittorrentDir.setValue(bittorrentDirVal);
		bittorrentwebBtn.enable();
	}
	else {
		bittorrent.setValue(S('disabled'));
		bittorrentDir.setValue('-');
	}
	bittorrentinitBtn.enable();
}
