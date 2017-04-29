function create_frontPanel_display_mode() {
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	// -----------------   LCD -----------------  
	var lcd_alert_displayList = new Ext.form.TextField({
		id: 'lcd_alert_displayList',
		fieldLabel: S('system_frontPanel_lcd_items'),
		width: 400,
		readOnly: true
	});

	var lcd_alert_flipItems = new Ext.form.TextField({
		id: 'lcd_alert_flipItems',
		name: 'autochange',
		fieldLabel: S('system_frontPanel_lcd_flipItems'),
		width: 250,
		readOnly: true
	});

	var lcd_alert_brightness = new Ext.form.TextField({
		id: 'lcd_alert_brightness',
		name: 'backlight',
		fieldLabel: S('system_frontPanel_lcd_intensity'),
		width: 250,
		readOnly: true
	});

	var lcd_jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'autochange'
	},
	{
		name: 'backlight'
	}]);

	var lcd_display = new Ext.FormPanel({
		id: 'lcd_display',
		cls: 'panel-custBorders-indent',
		itemCls: 'display-label',
		labelWidth: 140,
		width: 640,
		autoHeight: true,
		errorReader: jErrReader,
		reader: lcd_jReader,
		buttonAlign: 'left',
		items: [
			lcd_alert_displayList,
			lcd_alert_flipItems,
			lcd_alert_brightness
		],
		hideTitle: true,
		hideBorders: true,
		frame: false
	});

	// -----------------   LED -----------------  
	var led_brightness = new Ext.form.TextField({
		id: 'led_brightness',
		name: 'led',
		fieldLabel: S('system_frontPanel_led_intensity'),
		width: 250,
		readOnly: true
	});
	var led_sync = new Ext.form.TextField({
		id: 'led_sync',
		name: 'ledSync',
		fieldLabel: S('system_frontPanel_led_sync'),
		width: 250,
		readOnly: true
	});

	var led_brightness_sleep = new Ext.form.TextField({
		id: 'led_brightness_sleep',
		name: 'ledSleep',
		fieldLabel: S('system_frontPanel_led_sleep_intensity'),
		width: 250,
		readOnly: true
	});

	var led_alert_led_sleep_time = new Ext.form.TextField({
		id: 'led_alert_led_sleep_time',
		name: 'ledSleepTime',
		fieldLabel: S('system_frontPanel_led_sleepTime'),
		width: 250,
		readOnly: true
	});

	var led_alert_led_wakeup_time = new Ext.form.TextField({
		id: 'led_alert_led_wakeup_time',
		name: 'ledWakeup',
		fieldLabel: S('system_frontPanel_led_wakeupTime'),
		width: 250,
		readOnly: true
	});

	var led_jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'led'
	},
	{
		name: 'ledSync'
	},
	{
		name: 'ledSleep'
	},
	{
		name: 'ledWakeup'
	},
	{
		name: 'ledSleepTime'
	}]);

	var led_display = new Ext.FormPanel({
		id: 'led_display',
		cls: 'panel-custBorders-indent',
		itemCls: 'display-label',
		labelWidth: 140,
		width: 640,
		autoHeight: true,
		errorReader: jErrReader,
		reader: led_jReader,
		buttonAlign: 'left',
		items: [
			led_brightness,
			led_sync,
			led_brightness_sleep,
			led_alert_led_sleep_time,
			led_alert_led_wakeup_time
		],
		hideTitle: true,
		hideBorders: true,
		frame: false
	});

	var frontPanel_editBtn = new Ext.Button({
		id: 'frontPanel_editBtn',
		name: 'frontPanel_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				frontPanel_display_form.destroy();
				frontPanel_edit_form = create_frontPanel_edit_mode();
				insertToCentralContainer(SYSTEM_RENDER_TO, frontPanel_edit_form, render_frontPanel_form_before);

				var lcd_edit_form = Ext.getCmp('lcd_form_edit');
				var led_edit_form = Ext.getCmp('led_form_edit');

				lcd_edit_form.form.setValues(lcd_jsonData);
				led_edit_form.form.setValues(led_jsonData);

				lcd_fieldValuesHandler_edit(lcd_jsonData);
				led_fieldValuesHandler_edit(led_jsonData);
			}
		}
	});

	var lcd_title = S('system_frontPanel_lcd_title');
	var led_title = S('system_frontPanel_led_title');

	var frontPanel_display_form = new Ext.Panel({
		id: ID_FRONT_PANEL_FORM,
		items: [{
			xtype: 'label',
			html: '<p class="title-indent">' + lcd_title + ":" + '</p><br>'
		},
		lcd_display, {
			xtype: 'label',
			html: '<p class="title-indent">' + led_title + ":" + '</p><br>'
		},
		led_display],
		cls: 'panel-custBorders',
		animCollapse: false,
		title: S('system_frontPanel_front_title'),
		labelWidth: 160,
		width: 640,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		collapseFirst: true,
		buttonAlign: 'left',
		titleCollapse: true,
		buttons: [frontPanel_editBtn]
	});

	return frontPanel_display_form;
}

function create_frontPanel_edit_mode() {
	// COMMON
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	// ----------  LCD form creation STARTS  here ------------
	var host_ip = new Ext.form.Checkbox({
		id: 'host_ip',
		name: 'host_ip',
		hideLabel: true,
		ctCls: 'panel-custBorders-indent-item',
		boxLabel: S('system_frontPanel_lcd_items_ip')
	});

	var diskmode = new Ext.form.Checkbox({
		id: 'diskmode',
		name: 'diskmode',
		hideLabel: true,
		ctCls: 'panel-custBorders-indent-item',
		boxLabel: S('system_frontPanel_lcd_items_disk')
	});

	var time = new Ext.form.Checkbox({
		id: 'time',
		name: 'time',
		hideLabel: true,
		ctCls: 'panel-custBorders-indent-item',
		boxLabel: S('system_frontPanel_lcd_items_time')
	});

	var hdd = new Ext.form.Checkbox({
		id: 'hdd',
		name: 'hdd',
		hideLabel: true,
		ctCls: 'panel-custBorders-indent-item',
		boxLabel: S('system_frontPanel_lcd_items_hdd')
	});

	var flipItemsEn = new Ext.form.Radio({
		name: 'autochange',
		id: 'autochangeEn',
		hideLabel: 'true',
		boxLabel: S('enable') + '&nbsp;&nbsp;',
		inputValue: 'on'
	});

	var flipItemsDis = new Ext.form.Radio({
		name: 'autochange',
		id: 'autochangeDis',
		hideLabel: 'true',
		boxLabel: S('disable'),
		inputValue: 'off'
	});

	var lcd_intensity = new Array();
	for (var i = 1; i < 6; i++) {
		lcd_intensity[i - 1] = new Array();
		lcd_intensity[i - 1][0] = i;
		lcd_intensity[i - 1][1] = i;
	}
	lcd_intensity[0][1] = '1 ' + S('system_frontPanel_intensity_low');
	lcd_intensity[4][1] = '5 ' + S('system_frontPanel_intensity_high');

	var lcd_lightStore = new Ext.data.SimpleStore({
		data: lcd_intensity,
		fields: ['val', 'opt']
	});

	var lcd_light_combo = new Ext.form.ComboBox({
		id: 'lcd_light_combo',
		hiddenName: 'backlight',
		fieldLabel: S('system_frontPanel_lcd_intensity'),
		store: lcd_lightStore,
		minValue: 0,
		maxValue: 30,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		maxHeight: 100,
		editable: false
	});


	var legend_lcd_items = S('system_frontPanel_lcd_items');

	var lcd_jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'host_ip'
	},
	{
		name: 'hdd'
	},
	{
		name: 'diskmode'
	},
	{
		name: 'time'
	},
	{
		name: 'autochange'
	},
	{
		name: 'backlight'
	}]);

	var items;
	if (add_iscsi) {
		items = [{
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				layout: 'form',
				columnWidth: .25,
				html: '<p class="label">' + legend_lcd_items + ":" + '</p>'
			},
			{
				layout: 'form',
				columnWidth: .18,
				items: [host_ip]
			},
			{
				cls: 'label',
				columnWidth: .19,
				items: [diskmode]
			},
			{
				cls: 'label',
				columnWidth: .17,
				items: [time]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				cls: 'label',
				columnWidth: .27,
				html: S('system_frontPanel_lcd_flipItems') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [flipItemsEn]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [flipItemsDis]
			}]
		},
		lcd_light_combo];
	}
	else {
		items = [{
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				layout: 'form',
				columnWidth: .25,
				html: '<p class="label">' + legend_lcd_items + ":" + '</p>'
			},
			{
				layout: 'form',
				columnWidth: .18,
				items: [host_ip]
			},
			{
				cls: 'label',
				columnWidth: .19,
				items: [diskmode]
			},
			{
				cls: 'label',
				columnWidth: .17,
				items: [time]
			},
			{
				cls: 'label',
				columnWidth: .19,
				items: [hdd]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				cls: 'label',
				columnWidth: .27,
				html: S('system_frontPanel_lcd_flipItems') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [flipItemsEn]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [flipItemsDis]
			}]
		},
		lcd_light_combo];
	}

	var lcd_form_edit = new Ext.FormPanel({
		id: 'lcd_form_edit',
		cls: 'panel-custBorders-indent',
		labelWidth: 160,
		width: 640,
		autoHeight: true,
		errorReader: jErrReader,
		buttonAlign: 'left',
		items: items,
		hideTitle: true,
		hideBorders: true,
		frame: false
	});

	// ----------  LCD form creation ENDS  here ------------
	// -------------------------------	 LED form creation STARTS  here  -------------------------------
	var led_intensity = new Array();
	for (var i = 1; i < 6; i++) {
		led_intensity[i - 1] = new Array();
		led_intensity[i - 1][0] = i;
		led_intensity[i - 1][1] = i;
	}
	led_intensity[0][1] = '1 ' + S('system_frontPanel_intensity_low');
	led_intensity[4][1] = '5 ' + S('system_frontPanel_intensity_high');

	var led_lightStore = new Ext.data.SimpleStore({
		data: led_intensity,
		fields: ['val', 'opt']
	});

	var led_light_combo = new Ext.form.ComboBox({
		id: 'led_light_combo',
		hiddenName: 'led',
		fieldLabel: S('system_frontPanel_led_intensity'),
		store: led_lightStore,
		minValue: 0,
		maxValue: 30,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		maxHeight: 100,
		editable: false,
		listeners: {
			select: function (led_light_combo, record, index) {
				led_set_brightness(led_light_combo, record, index, led_sleep_combo, led_sleepStore);
			}
		}
	});

	var ledSyncEn = new Ext.form.Radio({
		id: 'ledSyncEn',
		name: 'ledSync',
		hideLabel: 'true',
		boxLabel: S('enable') + '&nbsp;&nbsp;',
		inputValue: 'on',
		listeners: {
			check: function (ledSyncEn, checked) {
				if (checked) {
					ledSyncDis.setValue(false);
					this.checked = true;
					led_sleep_combo.enable();
					led_sleep_time_combo.enable();
					led_wakeup_combo.enable();
				}
			}
		}
	});

	var ledSyncDis = new Ext.form.Radio({
		id: 'ledSyncDis',
		name: 'ledSync',
		hideLabel: 'true',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (ledSyncDis, checked) {
				if (checked) {
					ledSyncEn.setValue(false);
					this.checked = true;
					led_sleep_combo.disable();
					led_sleep_time_combo.disable();
					led_wakeup_combo.disable();
				}
			}
		}
	});

	var led_sleep = new Array();
	for (var i = 1; i < 5; i++) {
		led_sleep[i - 1] = new Array();
		led_sleep[i - 1][0] = i;
		led_sleep[i - 1][1] = i;
	}
	led_sleep[0][1] = '1 ' + S('system_frontPanel_intensity_low');
	led_sleep[3][1] = '4 ' + S('system_frontPanel_intensity_high');

	var led_sleepStore = new Ext.data.SimpleStore({
		data: led_sleep,
		fields: ['val', 'opt']
	});

	var led_sleep_combo = new Ext.form.ComboBox({
		id: 'led_sleep_combo',
		hiddenName: 'ledSleep',
		fieldLabel: S('system_frontPanel_led_sleep_intensity'),
		store: led_sleepStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		maxHeight: 100,
		editable: false,
		value: '1'
	});

	var led_sleep_time = new Array();
	for (var i = 0; i < 24; i++) {
		led_sleep_time[i] = new Array();
		led_sleep_time[i][0] = i;
		led_sleep_time[i][1] = i;
	}

	var led_sleep_time_store = new Ext.data.SimpleStore({
		data: led_sleep_time,
		fields: ['val', 'opt']
	});

	var led_sleep_time_combo = new Ext.form.ComboBox({
		id: 'led_sleep_time_combo',
		hiddenName: 'ledSleepTime',
		fieldLabel: S('system_frontPanel_led_sleepTime'),
		store: led_sleep_time_store,
		minValue: 0,
		maxValue: 30,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		value: '1',
		selectOnFocus: true,
		forceSelection: true,
		width: 45,
		listWidth: 43,
		maxHeight: 100,
		editable: false
	});

	var led_wakeup = new Array();
	for (var i = 0; i < 24; i++) {
		led_wakeup[i] = new Array();
		led_wakeup[i][0] = i;
		led_wakeup[i][1] = i;
	}

	var led_wakeupStore = new Ext.data.SimpleStore({
		data: led_wakeup,
		fields: ['val', 'opt']
	});

	var led_wakeup_combo = new Ext.form.ComboBox({
		id: 'led_wakeup_combo',
		hiddenName: 'ledWakeup',
		fieldLabel: S('system_frontPanel_led_wakeupTime'),
		store: led_wakeupStore,
		minValue: 0,
		maxValue: 30,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		value: '1',
		selectOnFocus: true,
		forceSelection: true,
		width: 45,
		listWidth: 43,
		maxHeight: 100,
		editable: false
	});

	var led_jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'led'
	},
	{
		name: 'ledSync'
	},
	{
		name: 'ledSleep'
	},
	{
		name: 'ledWakeup'
	},
	{
		name: 'ledSleepTime'
	}]);

	var led_form_edit = new Ext.FormPanel({
		id: 'led_form_edit',
		cls: 'panel-custBorders-indent',
		labelWidth: 160,
		width: 640,
		autoHeight: true,
		errorReader: jErrReader,
		reader: led_jReader,
		buttonAlign: 'left',
		items: [led_light_combo, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('system_frontPanel_led_sync') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [ledSyncEn]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [ledSyncDis]
			}]
		},
		led_sleep_combo, {
			lautoWidth: true,
			layout: 'column',
			cls: 'column-custBorders-indent',
			items: [{
				layout: 'form',
				columnWidth: .35,
				items: [led_sleep_time_combo, led_wakeup_combo]
			},
			{
				columnWidth: .65,
				cls: 'label',
				items: [{
					html: S('o_clock')
				},
				{
					html: '<br>' + S('o_clock')
				}]
			}]
		}],
		hideTitle: true,
		hideBorders: true,
		frame: false
	});
	// ---	LED form creation ENDS	here

	var frontPanel_saveBtn = new Ext.Button({
		id: 'frontPanel_saveBtn',
		name: 'frontPanel_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				frontPanel_saveBtnHandler(lcd_form_edit, led_form_edit);
			}
		}
	});

	var alert_cancelBtn = new Ext.Button({
		id: 'alert_cancelBtn',
		name: 'alert_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				frontPanel_cancelBtnHandler(lcd_form_edit, led_form_edit, frontPanel_edit_form);

			}
		}
	});

	var lcd_title = S('system_frontPanel_lcd_title');
	var led_title = S('system_frontPanel_led_title');

	var frontPanel_edit_form = new Ext.Panel({
		id: ID_FRONT_PANEL_FORM,
		items: [{
			xtype: 'label',
			html: '<p class="title-indent">' + lcd_title + ":" + '</p><br>'
		},
		lcd_form_edit, {
			xtype: 'label',
			html: '<p class="title-indent">' + led_title + ":" + '</p><br>'
		},
		led_form_edit],
		cls: 'panel-custBorders',
		animCollapse: false,
		title: S('system_frontPanel_front_title'),
		labelWidth: 160,
		width: 640,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		collapseFirst: true,
		errorReader: jErrReader,
		buttonAlign: 'left',
		titleCollapse: true,
		buttons: [frontPanel_saveBtn, alert_cancelBtn]
	});

	return frontPanel_edit_form;
}

function frontPanel_saveBtnHandler(lcd_form_edit, led_form_edit) {
	var led_params;
	var ledSyncEn_field = Ext.getCmp('ledSyncEn');
	var ledSyncDis_field = Ext.getCmp('ledSyncDis');
	var ledSleep_val;
	var ledSleepTime_val;
	var ledWakeup_val;
	var selected_radio = ledSyncEn_field.getGroupValue();
	if (selected_radio != 'off') {
		ledSleep_val = Ext.getCmp('led_sleep_combo').getValue();
		ledSleepTime_val = Ext.getCmp('led_sleep_time_combo').getValue();
		ledWakeup_val = Ext.getCmp('led_wakeup_combo').getValue();
		led_params = {
			bufaction: BUFACTION_SET_LED,
			ledSleep: ledSleep_val,
			ledSleepTime: ledSleepTime_val,
			ledWakeup: ledWakeup_val
		};
	}
	else {
		led_params = {
			bufaction: BUFACTION_SET_LED
		};
	}

	lcd_form_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACTION_SET_LCD
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			led_form_edit.form.submit({
				url: '/dynamic.pl',
				params: led_params,
				waitMsg: S('msg_saving_data'),
				failure: function (form, action) {
					formFailureFunction(action);
				},
				success: function (form, action) {
					lcd_jsonData = lcd_form_edit.form.getValues();
					led_jsonData = led_form_edit.form.getValues();
					if (ledSyncEn_field.getValue()) {
						if (!led_jsonData.ledSleep) {
							led_jsonData.ledSleep = ledSleep_val;
						}
						if (!led_jsonData.ledSleepTime) {
							led_jsonData.ledSleepTime = ledSleepTime_val;
						}
						if (!led_jsonData.ledWakeup) {
							led_jsonData.ledWakeup = ledWakeup_val;
						}
					}
					frontPanel_edit_form.destroy();

					frontPanel_display = create_frontPanel_display_mode();
					insertToCentralContainer(SYSTEM_RENDER_TO, frontPanel_display, render_frontPanel_form_before);

					var led_display_form = Ext.getCmp('led_display');
					var lcd_display_form = Ext.getCmp('lcd_display');

					lcd_display_form.form.getValues(lcd_jsonData);
					led_display_form.form.setValues(led_jsonData);

					lcd_fieldValuesHandler_display(lcd_jsonData);

					led_fieldValuesHandler_display(led_jsonData);
					frontPanel_display.expand(false);
				}
			});
		}
	});
}

function frontPanel_cancelBtnHandler(lcd_form_edit, led_form_edit, frontPanel_edit_form) {
	frontPanel_edit_form.destroy();

	var frontPanel_displayForm = create_frontPanel_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, frontPanel_displayForm, render_frontPanel_form_before);

	var led_display_form = Ext.getCmp('led_display');
	var lcd_display_form = Ext.getCmp('lcd_display');

	lcd_display_form.form.getValues(lcd_jsonData);
	led_display_form.form.setValues(led_jsonData);

	lcd_fieldValuesHandler_display(lcd_jsonData);
	led_fieldValuesHandler_display(led_jsonData);

	frontPanel_displayForm.expand(false);
}

function lcd_fieldValuesHandler_display(lcd_jsonData) {
	var flpItems_field = Ext.getCmp('lcd_alert_flipItems');
	var backlight_field = Ext.getCmp('lcd_alert_brightness');

	lcd_alert_list_display(lcd_jsonData);
	if (lcd_jsonData.autochange == 'on') {
		flpItems_field.setValue(S('enabled'));
	}
	else {
		flpItems_field.setValue(S('disabled'));
	}

	backlight_field.setValue(lcd_jsonData.backlight);
}

function lcd_fieldValuesHandler_edit(lcd_jsonData) {
	var autochangeEn_field = Ext.getCmp('autochangeEn');
	var autochangeDis_field = Ext.getCmp('autochangeDis');

	if (lcd_jsonData.autochange == 'on') {
		autochangeEn_field.setValue(true);
	}
	else {
		autochangeDis_field.setValue(true);
	}
}

function lcd_alert_list_display(lcd_jsonData) {
	var lcd_alert_list_field = Ext.getCmp('lcd_alert_displayList');
	var list = '';

	if (lcd_jsonData.host_ip == 'on') {
		list += S('system_frontPanel_lcd_items_ip') + ', ';
	}
	if (lcd_jsonData.diskmode == 'on') {
		list += S('system_frontPanel_lcd_items_disk') + ', ';
	}
	if (lcd_jsonData.time == 'on') {
		list += S('system_frontPanel_lcd_items_time') + ', ';
	}
	if (lcd_jsonData.hdd == 'on') {
		list += S('system_frontPanel_lcd_items_hdd') + ', ';
	}

	list = list.substring(0, list.length - 2);
	lcd_alert_list_field.setValue(list);
}

function led_fieldValuesHandler_display(led_jsonData) {
	var led_field = Ext.getCmp('led_sync');
	var led_sleep_field = Ext.getCmp('led_brightness_sleep');
	var led_sleep_time_field = Ext.getCmp('led_alert_led_sleep_time');
	var led_wakeup_field = Ext.getCmp('led_alert_led_wakeup_time');

	if (led_jsonData.led != '1' && led_jsonData.ledSync == 'on') {
		led_field.setValue(S('enabled'));
		if (led_jsonData.ledSleep != null) {
			led_sleep_field.setValue(led_jsonData.ledSleep);
		}
		else {
			led_sleep_field.setValue('-');
		}

		if (led_jsonData.ledSleepTime != null) {
			led_sleep_time_field.setValue(led_jsonData.ledSleepTime + ' ' + S('o_clock'));
		}
		else {
			led_sleep_time_field.setValue('-');
		}

		if (led_jsonData.ledWakeup != null) {
			led_wakeup_field.setValue(led_jsonData.ledWakeup + ' ' + S('o_clock'));
		}
		else {
			led_wakeup_field.setValue('-');
		}
	}
	else {
		led_field.setValue(S('disabled'));
		led_sleep_field.setValue('-');
		led_sleep_time_field.setValue('-');
		led_wakeup_field.setValue('-');
	}
}

function led_fieldValuesHandler_edit(led_jsonData) {
	var ledSyncEn_field = Ext.getCmp('ledSyncEn');
	var ledSyncDis_field = Ext.getCmp('ledSyncDis');
	var led_sleep_combo = Ext.getCmp('led_sleep_combo');
	var led_sleep_time_combo = Ext.getCmp('led_sleep_time_combo');
	var led_wakeup_combo = Ext.getCmp('led_wakeup_combo');
	var led_light_combo = Ext.getCmp('led_light_combo');
	var led_sleepStore = led_sleep_combo.store;
	led_brightness = led_jsonData.led;
	led_brightness_as_index = parseInt(led_brightness) - 1;

	led_set_brightness(led_light_combo, '', led_brightness_as_index, led_sleep_combo, led_sleepStore)

	if (led_brightness == '1') {
		ledSyncEn_field.disable();
	}

	if (led_brightness != '1' && led_jsonData.ledSync == 'on') {
		ledSyncEn_field.setValue(true);
		led_sleep_combo.enable();
		led_sleep_time_combo.enable();
		led_wakeup_combo.enable();
	}
	else {
		ledSyncDis_field.setValue(true);
		led_sleep_combo.disable();
		led_sleep_time_combo.disable();
		led_wakeup_combo.disable();
	}

}

function led_set_brightness(led_light_combo, record, index, led_sleep_combo, led_sleepStore) {
	var ledSyncDis = Ext.getCmp('ledSyncDis');
	var ledSyncEn = Ext.getCmp('ledSyncEn');
	var led_sleep_time_combo = Ext.getCmp('led_sleep_time_combo');
	var led_wakeup_combo = Ext.getCmp('led_wakeup_combo');

	if (index == 0) {
		ledSyncEn.disable();
		ledSyncDis.disable();
		led_sleep_combo.disable();
		led_sleep_time_combo.disable();
		led_wakeup_combo.disable();
	}
	else {
		ledSyncEn.enable();
		ledSyncDis.enable();

		if (ledSyncEn.getValue()) {
			ledSyncDis.enable();
			led_sleep_combo.enable();
			led_sleep_time_combo.enable();
			led_wakeup_combo.enable();
		}
		var new_led_intensity = new Array();
		for (var i = 1; i <= index; i++) {
			new_led_intensity[i - 1] = new Array();
			new_led_intensity[i - 1][0] = i;
			new_led_intensity[i - 1][1] = i;
		}

		if (new_led_intensity.length == 1) {
			new_led_intensity[0][1] = '1 ' + S('system_frontPanel_intensity_low');
		} else if (new_led_intensity.length > 0) {
			new_led_intensity[0][1] = '1 ' + S('system_frontPanel_intensity_low');
		}

		if (new_led_intensity.length == 4) {
			new_led_intensity[3][1] = index + S('system_frontPanel_intensity_high');
		}
		led_sleepStore.loadData(new_led_intensity);

		if (index + 1 <= led_sleep_combo.getValue()) {
			// e.g. led=3 and sleep led=4, sets sleep led value to 2
			led_sleep_combo.setValue(index);
		}
	}
}
