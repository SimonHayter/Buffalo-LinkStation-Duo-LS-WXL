function create_mediaserver_dlna_form_display_mode(mediaserver_dlna_jsonData) {
	var service = new Ext.form.TextField({
		id: 'service_dlna',
		name: 'service_dlna',
		fieldLabel:S('mediaserver_server_field_dlna'),
		width: 400,
		readOnly: true
	});


	var dlnaserver_dir = new Ext.form.TextField({
		id: 'dlnaserver_dir',
		name: 'folder',
		fieldLabel:S('mediaserver_dir_field'),
		width: 400,
		readOnly: true
	});

	var usblink = new Ext.form.TextField({
		id: 'usblink',
		name: 'usblink',
		fieldLabel:S('mediaserver_usblink_field'),
		width: 400,
		readOnly: true
	});

	var auto = new Ext.form.TextField({
		id: 'auto',
		name: 'auto',
		fieldLabel:S('mediaserver_auto_title'),
		width: 400,
		readOnly: true
	});

	var autodir = new Ext.form.TextField(
	{
		id: 'autodir',
		name: 'autodir',
		fieldLabel: S('mediaserver_inotify_field'),
		width: 400,
		readOnly: true
  });

	var freq_char = new Ext.form.TextField({
		id: 'freq_char',
		name: 'freq_char',
		fieldLabel: S('mediaserver_freq_field'),
		autoWidth: true,
		readOnly: true
	});

	var dtcp_ver = new Ext.form.TextField({
		id: 'dtcp_ver',
		name: 'dtcp_ver',
		fieldLabel: S('mediaserver_dtcp_stat_field'),
		width: 400,
		readOnly: true,
		hidden: true
	});

	var dtcp_disk = new Ext.form.TextField({
		id: 'dtcp_disk',
		name: 'dtcp_disk',
		fieldLabel:S('mediaserver_dtcp_disk'),
		width: 400,
		readOnly: true,
		hidden: true
	});

	var editBtn = new Ext.Button({
		id: 'editBtn',
		name: 'editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				mediaserver_dlna_editBtnHandler(mediaserver_dlnaForm);
			}
		}
	});

	var restartBtn = new Ext.Button({
		id: 'dlna_restartBtn',
		name: 'dlna_restartBtn',
		text: S('btn_restart_mediaserver_dlna'),
		disabled: true,
		listeners: {
			click: function() {
				mediaserver_restartBtnHandler(mediaserver_dlnaForm);
			}
		}
	});

	var updateBtn = new Ext.Button({
		id: 'updateBtn',
		name: 'updateBtn',
		text: S('btn_update_dtcp'),
		listeners: {
			click: function() {
				Ext.MessageBox.show({
					title: S('warning_box_title'),
					msg: S('mediaserver_dtcp_update_warning'),
					buttons: Ext.MessageBox.OKCANCEL,
					icon: Ext.MessageBox.WARNING,
					fn: function(btn) {
						mediaserver_updateBtnHandler(mediaserver_dlnaForm, btn);
					}
				});
			}
		},
		hidden: true
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'},
		{name: 'usblink'},
		{name: 'auto'},
		{name: 'autodir'},
		{name: 'freq'},
		{name: 'freq_char'},
		{name: 'dtcp_stat'},
		{name: 'dtcp_ver'},
		{name: 'dtcp_disk'},
		{name: 'inotify'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var items = new Array();

	var common_items = new Array();
	var dlna_items = new Array();
	var dtcp_items = new Array();

	var common_buttons = new Array();
	var buttons = new Array();
	var blank_array = new Array();

	common_items = [
		service,
		dlnaserver_dir
	];

	if (max_usbdisk_num != 0) {
		dlna_items = [
			usblink,
			auto,
			autodir,
			freq_char
		];
	}
	else {
		dlna_items = [
			auto,
			autodir,
			freq_char
		];
	}

	if (mediaserver_dlna_jsonData.dtcp_stat) {
		if (mediaserver_dlna_jsonData.dtcp_stat == 'ok') {
			dtcp_items = [
				dtcp_ver,
				dtcp_disk
			];
		}
		else {
			dtcp_items = [
				dtcp_ver
			];
		}
	}
	else {
		dtcp_items = [];
	}

	items = common_items.concat(dlna_items);
	items = items.concat(dtcp_items);

	common_buttons = [
		editBtn,
		restartBtn,
		updateBtn
	];

	buttons = common_buttons;

	var mediaserver_dlnaForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_DLNA_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('mediaserver_server_field_dlna'),
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

	return mediaserver_dlnaForm;
}

function create_mediaserver_dlna_form_edit_mode(mediaserver_dlna_jsonData) {
	var mediaserver_on = new Ext.form.Radio({
		id: 'mediaserver_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(mediaserver_on, checked) {
				if (checked) {
					mediaserver_off.setValue(false);
					this.checked = true;

					dlnaserver_dir.enable();
					usblink_on.enable();
					usblink_off.enable();
					auto_on.enable();
					auto_off.enable();

					if (auto_on.checked) {
						auto_off.setValue(false);
						autodir_on.enable();
						autodir_off.enable();
//						inotify.enable();
					}
					else {
						auto_on.setValue(false);
						autodir_on.disable();
						autodir_off.disable();
//						inotify.disable();
					}

					if(autodir_off.checked){
						autodir_on.setValue(false);
						rescan.enable();
						freq.enable();
					}else{
						autodir_off.setValue(false);
						rescan.disable();
						freq.disable();
					}

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						if (auto_on.checked && rescan.checked) {
							rebuild.enable();
						}
					}
				}
			}
		},
		inputValue: 'on'
	});

	var mediaserver_off = new Ext.form.Radio({
		id: 'mediaserver_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(mediaserver_off, checked) {
				if (checked) {
					mediaserver_on.setValue(false);
					this.checked = true;

					dlnaserver_dir.disable();
					usblink_on.disable();
					usblink_off.disable();
					auto_on.disable();
					auto_off.disable();
					autodir_on.disable();
					autodir_off.disable();
					rescan.disable();
					freq.disable();
//					inotify.disable();

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						rebuild.disable();
					}
				}
			}
		},
		inputValue: 'off'
	});

	var dlnaserver_dirProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});

	var dlnaserver_dirJReader = new Ext.data.JsonReader(
		{root: 'data'},
		[
			{name: 'val'},
			{name: 'opt'}
		]
	);

	var dlnaserver_dirStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_GET_MEDIASERVER_FOLDERS
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
		},
		proxy: dlnaserver_dirProxy,
		reader: dlnaserver_dirJReader
	});

	var dlnaserver_dir = new Ext.form.ComboBox({
		id: 'dlnaserver_dir_combo',
		hiddenName: 'folder',
		fieldLabel: S('mediaserver_dir_field'),
		store: dlnaserver_dirStore,
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

	var usblink_on = new Ext.form.Radio({
		id: 'usblink_on',
		hideLabel: true,
		name: 'usblink',
		boxLabel: S('enable'),
		inputValue: 'on'
	});

	var usblink_off = new Ext.form.Radio({
		id: 'usblink_off',
		hideLabel: true,
		name: 'usblink',
		boxLabel: S('disable'),
		inputValue: ''
	});

	var auto_on = new Ext.form.Radio({
		id: 'auto_on',
		listeners: {
			check: function(auto_on, checked) {
				if (checked) {
					auto_off.setValue(false);
					
					autodir_on.enable();
					autodir_off.enable();
					if(autodir_off.checked){
						freq.enable();
						rescan.enable();
					}
					
					this.checked = true;

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						if (rescan.checked) {
							rebuild.enable();
						}
					}
				}
			}
		},
		hideLabel: true,
		name: 'auto',
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: true
	});

	var auto_off = new Ext.form.Radio({
		id: 'auto_off',
		listeners: {
			check: function(auto_off, checked) {
				if (checked) {
					auto_on.setValue(false);
					this.checked = true;
					
					autodir_on.disable();
					autodir_off.disable();
					rescan.disable();
					freq.disable();
//					inotify.disable();

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						rebuild.disable();
					}
				}
			}
		},
		hideLabel: true,
		name: 'auto',
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: true
	});

	var autodir_on = new Ext.form.Radio(
		{
			id: 'autodir_on',
			listeners: {
			check: function(autodir_on, checked) {
				if (checked) {
					autodir_off.setValue(false);
					
					freq.disable();
					rescan.disable();

					this.checked = true;

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						if (rescan.checked) {
							rebuild.enable();
						}
					}
				}
			}
			},
		hideLabel: true,
		name: 'inotify',
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: true
		}
	);

		var autodir_off = new Ext.form.Radio(
		{
			id: 'autodir_off',
			listeners: {
			check: function(autodir_off, checked) {
				if (checked) {
					autodir_on.setValue(false);
					freq.enable();
					rescan.enable();

					this.checked = true;

					if (mediaserver_dlna_jsonData.dtcp_stat != 'ok') {
						if (rescan.checked) {
							rebuild.enable();
						}
					}
				}
			}
			},
		hideLabel: true,
		name: 'inotify',
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: true
		}
	);

	var freq = new Ext.form.NumberField({
		id: 'freq',
		name: 'freq',
		fieldLabel: S('mediaserver_freq_field'),
		width: 50,
		allowDecimals: false,
		maxLength: 4,
		minValue: 1,
		maxValue: 3000,
		disableKeyFilter: true
	});

	var rescan = new Ext.form.Checkbox({
		boxLabel: S('mediaserver_rescan_field'),
		listeners: {
			check: function(rescan, checked) {
				if (checked) {
					this.checked = true;
					rebuild.enable();
				}
				else {
					rebuild.disable();
				}
			}
		},
		id: 'rescan',
		name: 'rescan',
		inputValue: 'on',
		hideLabel: true
	});

	var rebuild = new Ext.form.Checkbox({
		boxLabel: S('mediaserver_rebuild_field'),
		id: 'rebuild',
		name: 'rebuild',
		inputValue: 'on',
		hideLabel: true,
		disabled: true
	});

	var inotify = new Ext.form.Checkbox({
		boxLabel: S('mediaserver_inotify_field'),
		listeners: {
			check: function(inotify, checked) {
				if (checked) {
					this.checked = true;
					freq.disable();
				}
				else {
					freq.enable();
				}
			}
		},
		id: 'inotify',
		name: 'inotify',
		inputValue: 'on',
		hideLabel: true,
		disabled: true
	});

	var mediaserver_dtcp_diskProxy = new Ext.data.HttpProxy({
		url: '/dynamic.pl',
		method: 'GET'
	});

	var mediaserver_dtcp_diskJReader = new Ext.data.JsonReader(
		{root: 'data'}, [
			{name: 'volName'}
		]
	);

	var mediaserver_dtcp_diskStore = new Ext.data.Store({
		baseParams: {
			bufaction: BUFACT_SHARE_GET_ALL_VOLUME
		},
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
		},
		proxy: mediaserver_dtcp_diskProxy,
		reader: mediaserver_dtcp_diskJReader
	});

	var mediaserver_dtcp_disk = new Ext.form.ComboBox({
		id: 'mediaserver_dtcp_disk_combo',
		hiddenName: 'dtcp_disk',
		fieldLabel: S('mediaserver_dtcp_disk'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: DISK_LIST
		}),
		editable: false,
		displayField: 'opt',
		valueField: 'val',
		allowBlank: false,
		emptyText: S('select_one'),
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 160,
		autoWidth: true,
		listeners: {
			select: function(combo, record, index) {
				if (mediaserver_dlna_jsonData.dtcp_disk != record.data.val) {
					Ext.MessageBox.show({
						title: S('warning_box_title'),
						msg: S('mediaserver_dtcp_disk_warning'),
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.WARNING
					});
				}
			}
		},
		value: ''
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				mediaserver_dlna_saveBtnHandler(mediaserver_dlnaForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				mediaserver_dlna_display_mode(mediaserver_dlnaForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'folder'},
		{name: 'usblink'},
		{name: 'auto'},
		{name: 'inotify'},
		{name: 'freq'},
		{name: 'freq_char'},
		{name: 'dtcp_stat'},
		{name: 'dtcp_disk'}
//		,{name: 'inotify'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	dlnaserver_dirStore.load({
		callback: function(r, o, s) {
			var result = dlnaserver_dirStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	DISK_LIST = new Array;
	mediaserver_dtcp_diskStore.load({
		callback: function(r, o, s) {
			var result = mediaserver_dtcp_diskStore.reader.jsonData.success;
			if (result) {
				var uniqueDiskNames = mediaserver_dtcp_diskStore.collect('volName', false, true);
				for (var i = 0; i < uniqueDiskNames.length; i++) {
					var re = /^usbdisk[1-4]$/;
					var matched = uniqueDiskNames[i].match(re);

					if (!matched) {
						DISK_LIST[i] = new Array();
						DISK_LIST[i][0] = uniqueDiskNames[i];
						DISK_LIST[i][1] = S(uniqueDiskNames[i]);
					}
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	var common_items = new Array();
	var dlna_items = new Array();
	var dtcp_items = new Array();
	var usb_items = new Array();
	var items = new Array();

	if (mediaserver_dlna_jsonData.dtcp_stat == 'ok') {
		dlna_items = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .632,
				html: '&nbsp'
			} ,{
				layout: 'form',
				items: [freq]
			}	,{
				cls: 'label',
				columnWidth: .632,
				html: '&nbsp'
			}, {
				layout: 'form',
				items: [rescan]
			}]
		};

		dtcp_items = mediaserver_dtcp_disk;
	}
	else {
		dlna_items = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .632,
				html: '&nbsp'
			}, {
				layout: 'form',
				items: [freq]
			}, {
				cls: 'label',
				columnWidth: .632,
				html: '&nbsp'
			}, {
				layout: 'form',
				items: [rescan]
			},{
				cls: 'label',
				columnWidth: .632,
				html: '&nbsp'
			}, {
				layout: 'form',
				items: [rebuild]				
			}]
		};

		dtcp_items = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders'
		};
	}

	if (max_usbdisk_num != 0) {
		usb_items = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('mediaserver_usblink_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [usblink_on]
			}, {
				layout:'form',
				columnWidth:.368,
				items: [usblink_off]
			}]
		};
	}
	else {
		usb_items = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders'
		};
	}

	common_items = [{
		autoWidth: true,
		layout: 'column',
		cls : 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('mediaserver_server_field_dlna') + ":"
		}, {
			layout: 'form',
			columnWidth: .368,
			items: [mediaserver_on]
		}, {
			layout:'form',
			columnWidth:.368,
			items: [mediaserver_off]
		}]
	},
		dlnaserver_dir,
		usb_items,
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('mediaserver_auto_title') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [auto_on]
			}, {
				layout:'form',
				columnWidth:.368,
				items: [auto_off]
			}, {
				cls: 'label',
				columnWidth: .264,
				html: S('mediaserver_inotify_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [autodir_on]
			}, {
				layout: 'form',
				columnWidth:.368,
				items: [autodir_off]
			}]
		},
		dlna_items,
		dtcp_items
	];

	items = common_items;

	var mediaserver_dlnaForm = new Ext.FormPanel({
		id: ID_MEDIASERVER_DLNA_FORM,
		cls: 'panel-custBorders',
		title: S('mediaserver_server_field_dlna'),
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

	return mediaserver_dlnaForm;
}

function mediaserver_dlna_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DLNA_SETTINGS
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

function mediaserver_dlna_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_mediaserver_dlna_form_edit_mode(mediaserver_dlna_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, 'mediaServer_clients_list');
	hform_display.form.setValues(mediaserver_dlna_jsonData);
	radioSelection_mediaserver_dlna(mediaserver_dlna_jsonData, 'edit');
	hform_display.expand(true);
}

function mediaserver_dlna_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_mediaserver_dlna_form_display_mode(mediaserver_dlna_jsonData);
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, 'mediaServer_clients_list');
	hform_edit.form.setValues(mediaserver_dlna_jsonData);
	mediaserver_dlna_format_display(mediaserver_dlna_jsonData);
	hform_edit.expand(true);
}

function mediaserver_dlna_format_display(mediaserver_dlna_jsonData) {
	var serviceVal = mediaserver_dlna_jsonData.service;
	var folderVal = mediaserver_dlna_jsonData.folder;
	var usblinkVal = mediaserver_dlna_jsonData.usblink;
	var autoVal = mediaserver_dlna_jsonData.auto;
	var freqVal = mediaserver_dlna_jsonData.freq;
	var dtcp_statVal = mediaserver_dlna_jsonData.dtcp_stat;
	var dtcp_verVal = mediaserver_dlna_jsonData.dtcp_ver;
	var dtcp_diskVal = mediaserver_dlna_jsonData.dtcp_disk;

	var inotify = mediaserver_dlna_jsonData.inotify;

	var service = Ext.getCmp('service_dlna');
	var dlnaserver_dir = Ext.getCmp('dlnaserver_dir');
	var usblink = Ext.getCmp('usblink');
	var auto = Ext.getCmp('auto');
	var autodir = Ext.getCmp('autodir');
	var freq = Ext.getCmp('freq_char');
	var mediaserver_dlna_restartBtn = Ext.getCmp('dlna_restartBtn');
	
	
	
	if (serviceVal == 'on') {
		service.setValue(S('enabled'));
		mediaserver_dlna_restartBtn.enable();
	}
	else {
		service.setValue(S('disabled'));
	}

	dlnaserver_dir.setValue(folderVal);

	if (usblinkVal == 'on') {
		usblink.setValue(S('enabled'));
	}
	else {
		usblink.setValue(S('disabled'));
	}
	if (autoVal == 'on') {
		auto.setValue(S('enabled'));
	}
	else {
		auto.setValue(S('disabled'));
	}

	
	if(inotify == 'on'){
		autodir.setValue(S('enabled'));
	}else{
		autodir.setValue(S('disabled'))
	}

	if (freqVal == '') {
		freq.setValue('-');
	}else {
		freq.setValue(freqVal);
	}

	cmp_dtcp_ver = Ext.getCmp('dtcp_ver');
	cmp_dtcp_disk = Ext.getCmp('dtcp_disk');
	cmp_updateBtn = Ext.getCmp('updateBtn');

	if (dtcp_statVal) {
		if (dtcp_verVal) {
			cmp_dtcp_ver.setValue(S('r_enabled') + '(' + dtcp_verVal + ')');
		}
		else {
			cmp_dtcp_ver.setValue(S('r_disabled'));
		}

		cmp_dtcp_ver.show();

		cmp_dtcp_disk.setValue(S(dtcp_diskVal));
		cmp_dtcp_disk.show();

		cmp_updateBtn.setVisible(true);
	}
	else {
		cmp_updateBtn.setVisible(false);
	}
}

function radioSelection_mediaserver_dlna(data, edit_flag) {
	var selectedMethod = data.service;
	var usblink = data.usblink;
	var auto = data.auto;
	var freqVal = mediaserver_dlna_jsonData.freq;
	var inotify = data.inotify;

	var mediaserverRadioEn = Ext.getCmp('mediaserver_on');
	var mediaserverRadioDis = Ext.getCmp('mediaserver_off');
	var usblink_on = Ext.getCmp('usblink_on');
	var usblink_off = Ext.getCmp('usblink_off');
	var mediaserverrefreshRadioEn = Ext.getCmp('auto_on');
	var mediaserverrefreshRadioDis = Ext.getCmp('auto_off');
	var freq = Ext.getCmp('freq');

	var autodir_on = Ext.getCmp('autodir_on');
	var autodir_off = Ext.getCmp('autodir_off');
	
	if (auto == 'on') {
		mediaserverrefreshRadioEn.setValue(true);
	}
	else {
		mediaserverrefreshRadioDis.setValue(true);
	}

	if (usblink == 'on') {
		usblink_on.setValue(true);
	}
	else {
		usblink_off.setValue(true);
	}

	if(inotify == 'on'){
		autodir_on.setValue(true);
	}
	else{
		autodir_off.setValue(true);
	}


	if (freqVal == '') {
		freq.setRawValue('');
		freq.clearInvalid();
	}


	if (selectedMethod == 'on') {
		mediaserverRadioEn.setValue(true);
	}
	else {
		mediaserverRadioDis.setValue(true);
	}
}

function mediaserver_restartBtnHandler(hform_edit) {
	hform_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_RESTART_DLNA_SERVICE
		},
		waitMsg: S('restarting_server'),
		failure: function(form,action) {
			msgBox_usingDictionary('mediaserver_dlna_restart_title', 'mediaserver_dlna_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			msgBox_usingDictionary('mediaserver_dlna_restart_title', 'mediaserver_dlna_restart_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}

function mediaserver_updateBtnHandler(mediaserver_dlnaForm, btn) {
	if (btn == 'ok') {
		mediaserver_updateLoop_downloading();
	}
}

function mediaserver_updateLoop_downloading() {
	mediaserver_dlnaForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_UPDATE_DLNA_MODULE
		},
		waitMsg: S('opDownloading'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			mediaserver_update_jsonData = resp.data[0];

			if (mediaserver_update_jsonData.result == 'success') {
				Ext.MessageBox.show({
					msg: S('opCompleted'),
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.INFO,
					fn: function() {
						resetCookie();
						getLeftPanelInfo_topOnly(0);
						createMediaserverSettings();
					}
				});
			}
			else if (mediaserver_update_jsonData.result == 'reboot') {
				mediaserver_updateLoop_rebooting();
			}
			else if (mediaserver_update_jsonData.result == 'download') {
				mediaserver_updateLoop_downloading();
			}
			else {
				Ext.MessageBox.show({
					title: S('error_box_title'),
					msg: S('mediaserver_dtcp_warn_msg'),
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
		}
	});
}

function mediaserver_updateLoop_rebooting() {
	mediaserver_dlnaForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_UPDATE_DLNA_MODULE
		},
		waitMsg: S('opRebooting'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			mediaserver_update_jsonData = resp.data[0];

			if (mediaserver_update_jsonData.result == 'success') {
				Ext.MessageBox.show({
					msg: S('opCompleted'),
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.INFO,
					fn: function() {
						resetCookie();
						getLeftPanelInfo_topOnly(0);
						createMediaserverSettings();
					}
				});
			}
			else if (mediaserver_update_jsonData.result == 'reboot') {
				mediaserver_updateLoop_rebooting();
			}
			else if (mediaserver_update_jsonData.result == 'download') {
				mediaserver_updateLoop_downloading();
			}
			else {
				Ext.MessageBox.show({
					title: S('error_box_title'),
					msg: S('mediaserver_dtcp_warn_msg'),
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
		}
	});
}

function mediaserver_dtcp_diskRenderer(value) {
	return S(value);
}
