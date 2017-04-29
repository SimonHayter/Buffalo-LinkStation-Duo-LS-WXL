var dTime_confirmWindow;

function create_dateTimeForm_display_mode() {
	var timeSource_display = new Ext.form.TextField({
		id: 'dateMethod',
		name: 'dateMethod',
		fieldLabel: S('dTime_tSource'),
		width: 200,
		readOnly: true
	});

	var date_display = new Ext.form.TextField({
		id: 'dateField',
		name: 'date',
		fieldLabel: S('dTime_date'),
		width: 200,
		readOnly: true
	});

	var time_display = new Ext.form.TextField({
		id: 'time',
		name: 'time',
		fieldLabel: S('dTime_time'),
		width: 200,
		readOnly: true
	});

	var ip_display = new Ext.form.TextField({
		id: 'ip',
		name: 'ip',
		fieldLabel: S('dTime_primaryIp'),
		width: 200,
		readOnly: true
	});

	var secIp_display = new Ext.form.TextField({
		id: 'secIp',
		name: 'secIp',
		fieldLabel: S('dTime_secIp'),
		width: 200,
		readOnly: true
	});

	var syncFreq_display = new Ext.form.TextField({
		id: 'syncFreq',
		name: 'syncFreq',
		fieldLabel: S('dTime_syncFreq'),
		width: 200,
		readOnly: true
	});

	var timeZone_display = new Ext.form.TextField({
		id: 'timeZone',
		name: 'timeZone',
		fieldLabel: S('dTime_timeZone'),
		width: 400,
		readOnly: true
	});
	
	var dt_editBtn = new Ext.Button({
		id: 'dt_editBtn',
		name: 'dt_editBtn',
		text: S('btn_modify_settings'),
		disabled: true,
		listeners: {
			click: function(){
				dTimeForm_display.destroy();
				form_editMode = create_dateTimeForm_edit_mode();
				insertToCentralContainer(SYSTEM_RENDER_TO, form_editMode, ID_LANG_FORM);
				form_editMode.disable(); // important, do not remove
				form_editMode.form.setValues(dTime_jsonData);
				form_editMode.enable();
				dateTime_format_response_editMode(dTime_jsonData);
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var jReader_display = new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
		}, [
		{name: 'dateMethod'},
		{name: 'ip'},
		{name: 'secIp'},
		{name: 'syncFreq'},
		{name: 'date'},
		{name: 'time'},
		{name: 'timeHour'},
		{name: 'timeMin'},
		{name: 'timeSec'},
		{name: 'clockType'},
		{name: 'timeZone'},
		{name: 'defaultNtp'}
	]);

	var dTimeForm_display = new Ext.FormPanel({
		id: 'dTimeForm',
		title: S('dTime_form_title'),
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		reader: jReader_display,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		animCollapse: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [dt_editBtn],
		items: [
			timeSource_display,
			date_display,
			time_display,
			timeZone_display,
			ip_display,
			syncFreq_display
		],
		titleCollapse: true
	});

	return dTimeForm_display;
}

function dateTime_format_response_displayMode(data) {
	var dtSource_field = Ext.getCmp('dateMethod');
	var dateField = Ext.getCmp('dateField');
	var ntpIp_field = Ext.getCmp('ip');
	var syncFreq_field = Ext.getCmp('syncFreq');
	var time_field = Ext.getCmp('time');
	var lang = getLangFromCookie();

	if ((data.dateMethod == 'off') || (data.dateMethod == null)) {
		// if here, the ntp is disabled
		if (lang == 'en') {
			var dtSource_value = S('man');
		}
		else {
			var dtSource_value = S('disabled');
		}

		dtSource_field.setValue(dtSource_value);
		ntpIp_field.setValue('-');
		syncFreq_field.setValue('-');
	}
	else {
		// if here, the ntp is enabled
		if (lang == 'en') {
			var dtSource_value = S('auto');
		}
		else {
			var dtSource_value = S('enabled');
		}

		dtSource_field.setValue(dtSource_value);
		var syncFreq_value = S('dTime_syncFreq_'+ data.syncFreq);
		syncFreq_field.setValue(syncFreq_value);
		if (data.defaultNtp == 'on') {
			ntpIp_field.setValue('ntp.jst.mfeed.ad.jp');
		}
	}

	var timeZone_value = date_time_format_time_zone(data.timeZone);
	var timeZone_field = Ext.getCmp('timeZone');
	timeZone_field.setValue(timeZone_value);

	time_field.setValue(data.timeHour + ':' + data.timeMin + ':' + data.timeSec);
	var newDate = dTime_defaultToCustomized(data.date);
	dateField.setValue(newDate);

	Ext.getCmp('dt_editBtn').enable();
}

function dateTime_format_response_editMode(data) {
	if (data.dateMethod == 'on') {
		var timeSourceRadio_auto = Ext.getCmp('timeSourceRadio_auto');
		timeSourceRadio_auto.setValue(true);
	}
	else {
		var timeSourceRadio_man = Ext.getCmp('timeSourceRadio_man');
		timeSourceRadio_man.setValue(true);
	}
	if (data.defaultNtp == 'on') {
		Ext.getCmp('ip').disable();
	}

	var timeZone_value = date_time_format_time_zone(data.timeZone);
	var tz_field = Ext.getCmp('timeZone_combo');
	tz_field.setValue(timeZone_value);

	var newDate = dTime_defaultToCustomized(data.date);
	var dateField = Ext.getCmp('dateField');
	dateField.setValue(newDate);

	dTime_firstTime = false;
}

function create_dateTimeForm_edit_mode() {
	var lang = getLangFromCookie();
	if (lang == 'en') {
		var enabled_text = S('auto');
		var disabled_text = S('man');
	}
	else {
		var enabled_text = S('enabled');
		var disabled_text = S('disabled');
	}

	var timeSourceRadio_auto = new Ext.form.Radio({
		id: 'timeSourceRadio_auto',
		hideLabel: true,
		name: 'dateMethod',
		boxLabel: enabled_text,
		inputValue: 'on',
		listeners: {
			check: function(timeSourceRadio_auto, checked) {
				if (checked) {
					timeSourceRadio_man.setValue(false);
					this.checked = true;

					// disable these fields
					date_edit.disable();
					dt_localTime.disable();
					timeHour.disable();
					timeMin.disable();
					timeSec.disable();

					// enable these fields
					if (defaultNtp.getValue()) {
						ip.disable();
					}
					else{
						ip.enable();
					}
					syncFreqList.enable();
					defaultNtp.enable();
				}
			}
		}
	});

	var timeSourceRadio_man = new Ext.form.Radio({
		id: 'timeSourceRadio_man',
		hideLabel: true,
		name: 'dateMethod',
		boxLabel: disabled_text,
		inputValue: 'off',
		listeners: {
			check: function(timeSourceRadio_man, checked) {
				if (checked) {
					timeSourceRadio_auto.setValue(false);
					this.checked = true;
					ip.clearInvalid();
					syncFreqList.clearInvalid();

					// enable these fields
					date_edit.enable();
					timeHour.enable();
					timeMin.enable();
					timeSec.enable();
					dt_localTime.enable();

					// disable these fields
					ip.disable();
					syncFreqList.disable();
					defaultNtp.disable();
				}
			}
		}
	});

	var date_edit = new Ext.form.DateField({
		id: 'dateField',
		name: 'date',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('dTime_date'),
		width: 100,
		maxValue: '12/31/2020'
	});

	var ip = new Ext.form.TextField({
		id: 'ip',
		name: 'ip',
		fieldLabel: S('dTime_primaryIp'),
		width: 200,
		allowBlank: false
	});

	var secIp = new Ext.form.TextField({
		id: 'secIp',
		name: 'secIp',
		fieldLabel: S('dTime_secIp'),
		width: 200
	});

	var syncFreqOpt = [
		['1d', S('dTime_syncFreq_1d')],
		['1w', S('dTime_syncFreq_1w')],
		['3h', S('dTime_syncFreq_3h')]
	];

	var syncFreqListStore = new Ext.data.SimpleStore({
		data: syncFreqOpt,
		fields: ['val', 'opt']
	});

	var syncFreqList = new Ext.form.ComboBox({
		hiddenName: 'syncFreq',
		editable: false,
		fieldLabel: S('dTime_syncFreq'),
		store: syncFreqListStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 150,
		autoWidth: true,
		value: '1d'
	});

	var TIME_ZONES = [
		['GMT-12',	S('timezone_region_GMT-12')],
		['Midway',	S('timezone_region_Midway')],
		['Hawaii',	S('timezone_region_Hawaii')],
		['Alaska',	S('timezone_region_Alaska')],
		['PST8PDT',	S('timezone_region_PST8PDT')],
		['Tijuana',	S('timezone_region_Tijuana')],
		['Arizona',	S('timezone_region_Arizona')],
		['Chihuahua',	S('timezone_region_Chihuahua')],
		['MST7MDT',	S('timezone_region_MST7MDT')],
		['Central',	S('timezone_region_Central')],
		['CST6CDT',	S('timezone_region_CST6CDT')],
		['Monterrey',	S('timezone_region_Monterrey')],
		['Saskatchewan',	S('timezone_region_Saskatchewan')],
		['Bogota',	S('timezone_region_Bogota')],
		['EST5EDT',	S('timezone_region_EST5EDT')],
		['Indiana',	S('timezone_region_Indiana')],
		['Caracas',	S('timezone_region_Caracas')],
		['Asuncion',	S('timezone_region_Asuncion')],
		['Atlantic',	S('timezone_region_Atlantic')],
		['San_Juan',	S('timezone_region_San_Juan')],
		['Manaus',	S('timezone_region_Manaus')],
		['Santiago',	S('timezone_region_Santiago')],
		['Newfoundland',	S('timezone_region_Newfoundland')],
		['Sao_Paulo',	S('timezone_region_Sao_Paulo')],
		['Buenos_Aires',	S('timezone_region_Buenos_Aires')],
		['Cayenne',	S('timezone_region_Cayenne')],
		['Godthab',	S('timezone_region_Godthab')],
		['Montevideo',	S('timezone_region_Montevideo')],
		['South_Georgia',	S('timezone_region_South_Georgia')],
		['Azores',	S('timezone_region_Azores')],
		['Cape_Verde',	S('timezone_region_Cape_Verde')],
		['Casablanca',	S('timezone_region_Casablanca')],
		['UTC',	S('timezone_region_UTC')],
		['Dublin',	S('timezone_region_Dublin')],
		['Monrovia',	S('timezone_region_Monrovia')],
		['Amsterdam',	S('timezone_region_Amsterdam')],
		['Budapest',	S('timezone_region_Budapest')],
		['Brussels',	S('timezone_region_Brussels')],
		['Sarajevo',	S('timezone_region_Sarajevo')],
		['Lagos',	S('timezone_region_Lagos')],
		['Amman',	S('timezone_region_Amman')],
		['Athens',	S('timezone_region_Athens')],
		['Beirut',	S('timezone_region_Beirut')],
		['Cairo',	S('timezone_region_Cairo')],
		['Harare',	S('timezone_region_Harare')],
		['Helsinki',	S('timezone_region_Helsinki')],
		['Jerusalem',	S('timezone_region_Jerusalem')],
		['Minsk',	S('timezone_region_Minsk')],
		['Windhoek',	S('timezone_region_Windhoek')],
		['Baghdad',	S('timezone_region_Baghdad')],
		['Kuwait',	S('timezone_region_Kuwait')],
		['Moscow',	S('timezone_region_Moscow')],
		['Nairobi',	S('timezone_region_Nairobi')],
		['Tehran',	S('timezone_region_Tehran')],
		['Muscat',	S('timezone_region_Muscat')],
		['Baku',	S('timezone_region_Baku')],
		['Mauritius',	S('timezone_region_Mauritius')],
		['Tbilisi',	S('timezone_region_Tbilisi')],
		['Yerevan',	S('timezone_region_Yerevan')],
		['Kabul',	S('timezone_region_Kabul')],
		['Yekaterinburg',	S('timezone_region_Yekaterinburg')],
		['Karachi',	S('timezone_region_Karachi')],
		['Tashkent',	S('timezone_region_Tashkent')],
		['Calcutta',	S('timezone_region_Calcutta')],
		['Jayapura',	S('timezone_region_Jayapura')],
		['Katmandu',	S('timezone_region_Katmandu')],
		['Dacca',	S('timezone_region_Dacca')],
		['Novosibirsk',	S('timezone_region_Novosibirsk')],
		['Rangoon',	S('timezone_region_Rangoon')],
		['Bangkok',	S('timezone_region_Bangkok')],
		['Krasnoyarsk',	S('timezone_region_Krasnoyarsk')],
		['Chongqing',	S('timezone_region_Chongqing')],
		['Irkutsk',	S('timezone_region_Irkutsk')],
		['Kuala_Lumpur',	S('timezone_region_Kuala_Lumpur')],
		['Perth',	S('timezone_region_Perth')],
		['Taipei',	S('timezone_region_Taipei')],
		['Ulan_Bator',	S('timezone_region_Ulan_Bator')],
		['Tokyo',	S('timezone_region_Tokyo')],
		['Seoul',	S('timezone_region_Seoul')],
		['Yakutsk',	S('timezone_region_Yakutsk')],
		['Adelaide',	S('timezone_region_Adelaide')],
		['Darwin',	S('timezone_region_Darwin')],
		['Brisbane',	S('timezone_region_Brisbane')],
		['Canberra',	S('timezone_region_Canberra')],
		['Guam',	S('timezone_region_Guam')],
		['Hobart',	S('timezone_region_Hobart')],
		['Vladivostok',	S('timezone_region_Vladivostok')],
		['Magadan',	S('timezone_region_Magadan')],
		['Auckland',	S('timezone_region_Auckland')],
		['Fiji',	S('timezone_region_Fiji')],
		['Kamchatka',	S('timezone_region_Kamchatka')],
		['Tongatapu',	S('timezone_region_Tongatapu')]
	];

	var timeZoneStore = new Ext.data.SimpleStore({
		data: TIME_ZONES,
		fields: ['val', 'opt']
	});

	var timeZone = new Ext.form.ComboBox({
		id: 'timeZone_combo',
		hiddenName: 'timeZone',
		editable: false,
		fieldLabel: S('dTime_timeZone'),
		store: timeZoneStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 400,
		width: 400
	});

	var hourOpt = new Array(24);

	for (var i = 0; i < 10; i++) {
		hourOpt[i] = new Array();
		hourOpt[i][0] = '0' + i;
		hourOpt[i][1] = '0' + i;
	}
	for (var i = 10; i < 24; i++) {
		hourOpt[i] = new Array();
		hourOpt[i][0] = i;
		hourOpt[i][1] = i;
	}

	var hourStore = new Ext.data.SimpleStore({
		data: hourOpt,
		fields: ['val', 'opt']
	});

	var timeHour = new Ext.form.ComboBox({
		name: 'timeHour',
		id: 'timeHourCombo',
		store: hourStore,
		minValue: 0,
		maxValue: 24,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		value: 0,
		selectOnFocus: true,
		forceSelection: true,
		width: 50,
		listWidth: 50,
		hideLabel: true,
		editable: false
	});
	
	var minSecOpt = new Array(59);

	for (var i = 0; i < 10; i++) {
		minSecOpt[i] = new Array();
		minSecOpt[i][0] = '0' + i;
		minSecOpt[i][1] = '0' + i;
	}
	for (var i = 10; i < 60; i++) {
		minSecOpt[i] = new Array();
		minSecOpt[i][0] = i;
		minSecOpt[i][1] = i;
	}

	var minStore = new Ext.data.SimpleStore({
		data: minSecOpt,
		fields: ['val', 'opt']
	});

	var timeMin = new Ext.form.ComboBox({
		name: 'timeMin',
		id: 'timeMinCombo',
		store: minStore,
		minValue: 0,
		maxValue: 59,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		value: 0,
		selectOnFocus: true,
		forceSelection: true,
		width: 50,
		listWidth: 50,
		hideLabel: true,
		editable: false
	});

	var secStore = new Ext.data.SimpleStore({
		data: minSecOpt,
		fields: ['val', 'opt']
	});

	var timeSec = new Ext.form.ComboBox({
		name: 'timeSec',
		id: 'timeSecCombo',
		store: secStore,
		minValue: 0,
		maxValue: 59,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		value: 0,
		selectOnFocus: true,
		forceSelection: true,
		width: 50,
		listWidth: 50,
		hideLabel: true,
		editable: false
	});

	var dt_localTime = new Ext.Button({
		id: 'dt_localTime',
		name: 'dt_localTime',
		text: S('dTime_localTime'),
		listeners: {
			click: function(){
				dateTime_use_local_time();
			}
		}
	});

	var dt_saveBtn = new Ext.Button({
		id: 'dt_saveBtn',
		name:'dt_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){ 
				dateTime_saveBtnHandler(dTimeForm_edit);
			}
		}
	});

	var dt_cancelBtn = new Ext.Button({
		id: 'dt_cancelBtn',
		name: 'dt_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){ 
				dateTime_cancelBtnHandler(dTimeForm_edit);
			}
		}
	});

	var jReader_edit = new Ext.data.JsonReader({
		id: 'jReader_edit',
		root: 'data'
		}, [
		{name: 'dateMethod'},
		{name: 'ip'},
		{name: 'secIp'},
		{name: 'syncFreq'},
		{name: 'date'},
		{name: 'timeHour'},
		{name: 'timeMin'},
		{name: 'timeSec'},
		{name: 'clockType'},
		{name: 'timeZone'},
		{name: 'defaultNtp'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var defaultNtp = new Ext.form.Checkbox({
		boxLabel: S('dTime_ntp_default') + "<br> (ntp.jst.mfeed.ad.jp)",
		id: 'defaultNtp',
		name: 'defaultNtp',
		inputValue: 'on',
		hideLabel: true,
		listeners:{
			check: function(defaultNtp, checked ) {
				if (checked) {
					if (!dTime_firstTime) {
						dateTime_ntp_default_warning_win();
						ip.clearInvalid();
						ip.disable();
					}
				}
				else {
					ip.enable();
				}
			}
		}
	});

	var dTimeForm_edit = new Ext.FormPanel({
		id: 'dTimeForm',
		title: S('dTime_form_title'),
		cls: 'panel-custBorders',
		reader: jReader_edit,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		animCollapse: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [dt_saveBtn, dt_cancelBtn],
		items:[{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('dTime_tSource') + ":"
			},{
				layout: 'form',
				columnWidth: .368,
				items: [timeSourceRadio_auto]
			},{
				layout:'form',
				columnWidth:.368,
				items:[timeSourceRadio_man]
			}]
		},
		ip, {
			autoWidth:true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: '&nbsp;'
			},{
				layout: 'form',
				columnWidth: .60,
				items: [defaultNtp]
			}]
		},
		syncFreqList, date_edit, {
			autoWidth:true,
			layout: 'column',
			cls : 'column-custBorders',
			items:[{
				cls: 'label',
				columnWidth: .264,
				html: S('dTime_time')
			}, {
				layout: 'form',
				columnWidth: .09,
				items: [timeHour]
			}, {
				cls: 'label',
				columnWidth: .02,
				html: ":"
			}, {
				layout: 'form',
				columnWidth: .09,
				items: [timeMin]
			}, {
				cls: 'label',
				columnWidth: .02,
				html: ":"
			}, {
				layout: 'form',
				columnWidth: .09,
				items: [timeSec]
			}, {
				layout: 'form',
				columnWidth: .3,
				items: [dt_localTime]
			}]
		},
		timeZone
		],
		titleCollapse: true
	});

	return dTimeForm_edit;
}

function dateTime_saveBtnHandler(dTimeForm_edit) {
	dateField = Ext.getCmp('dateField');
	if (!dateField.disabled && dateField.isValid()) {
		dateVal = dateField.getRawValue();
		var newValue = dTime_customizedToDefault(dateVal);
		dateField.format = 'm/d/Y'; //the default format
		dateField.setValue(newValue);
	}

	dTimeForm_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_DT
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			var msg = resp.data[0];
			var buttons = Ext.MessageBox.OK;
			var icon = Ext.MessageBox.INFO;
			msgBox_usingDictionary_logout('', msg, buttons, icon);

		}
	});
}

function dateTime_cancelBtnHandler(dTimeForm_edit) {
	dTimeForm_edit.destroy();
	dTimeForm_display = create_dateTimeForm_display_mode();
	dTime_firstTime = true;
	insertToCentralContainer(SYSTEM_RENDER_TO, dTimeForm_display, ID_LANG_FORM);
	dTimeForm_display.form.setValues(dTime_jsonData);
	dateTime_format_response_displayMode(dTime_jsonData);
	dTimeForm_display.expand(true);
}

function dateTime_ntp_default_warning_win() {
	var ntpDefaultBox = Ext.getCmp('defaultNtp');

	var dTime_okBtn = new Ext.Button({
		id: 'okBtn',
		name: 'okBtn',
		text: S('btn_ok'),
		listeners: {
			click: function(){
				dTime_confirmWindow.close();
			}
		}
	});

	var dTime_cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				dTime_confirmWindow.close();
				ntpDefaultBox.setValue(false);
			}
		}
	});

	var boxTitle = S('warning_box_title');

	var msg = S('dTime_ntp_default_warning_1');
	msg += "<br /><br /> " + S('dTime_ntp_default_warning_2');
	msg += "<br /><br /> " + S('dTime_ntp_default_warning_3');
	msg += "<br /><br /> " + S('dTime_ntp_default_warning_4');

	var msgHeader = S('disclaimer');

	if (!Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN)) {
		dTime_confirmWindow = new Ext.Window({
			html: '<div id="' + DIV_WARNING_WIN + '" class="x-hidden"></div>',
			id: ID_SH_FOLD_GATE_VERIF_WIN,
			modal: true,
			width: 300,
			title: boxTitle,
			plain: true,
			draggable: false,
			resizable: false,
			closable: false,
			layout: 'form',
			items: [{
				xtype: 'label',
				html: '<p class="title_popup"><img src="'+ WARNING_IMG + '"/> ' + msgHeader + '</p><br>'
			}, {
				xtype: 'label',
				html: '<br><p class="confirmation_instruction">' + msg	+ '</p><br>'
			}],
			buttonAlign: 'center',
			buttons: [dTime_okBtn, dTime_cancelBtn]
		});
	}

	dTime_confirmWindow.show(confirmWindow);
}

function dateTime_use_local_time() {
	var now = new Date();
	var dateField = Ext.getCmp('dateField');
	var timeHour = Ext.getCmp('timeHourCombo');
	var timeMin = Ext.getCmp('timeMinCombo');
	var timeSec = Ext.getCmp('timeSecCombo');
	var timeZoneField = Ext.getCmp('timeZone_combo');
	var gmtOffset = now.getGMTOffset(true);

	if (dateField) {
		dateField.setValue(now);
	}
	var h = checkTime(now.getHours());
	var m = checkTime(now.getMinutes());
	var s = checkTime(now.getSeconds());
	timeHour.setValue(h);
	timeMin.setValue(m);
	timeSec.setValue(s);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}
