function create_sleeptimer_form_display_mode() {
	var interval1 = new Ext.form.TextField({
		id: 'interval1',
		name: 'interval1',
		fieldLabel: S('sleeptimer_interval_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var days = new Ext.form.TextField({
		id: 'days',
		name: 'days',
		fieldLabel: S('sleeptimer_days_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_sleep_1 = new Ext.form.TextField({
		id: 'date_sleep_1',
		name: 'date_sleep_1',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_awake_1 = new Ext.form.TextField({
		id: 'date_awake_1',
		name: 'date_awake_1',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});


	var wakeup1 = new Ext.form.TextField({
		id: 'wakeup1',
		name: 'wakeup1',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var sleep1 = new Ext.form.TextField({
		id: 'sleep1',
		name: 'sleep1',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var items_1;
	if (add_sleepTimerDate) {
		items_1 = [interval1, days, date_sleep_1, wakeup1, date_awake_1, sleep1]
	}
	else {
		items_1 = [interval1, days, wakeup1, sleep1];
	}

	var timer1 = new Ext.form.FieldSet({
		id: 'timer1',
		title: S('sleeptimer_field1_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		titleCollapse: true,
		items: items_1
	});

	// <-- timer 1

	// --> timer 2
	var interval2 = new Ext.form.TextField({
		id: 'interval2',
		name: 'interval2',
		fieldLabel: S('sleeptimer_interval_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var days2 = new Ext.form.TextField({
		id: 'days2',
		name: 'days2',
		fieldLabel: S('sleeptimer_days_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_sleep_2 = new Ext.form.TextField({
		id: 'date_sleep_2',
		name: 'date_sleep_2',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_awake_2 = new Ext.form.TextField({
		id: 'date_awake_2',
		name: 'date_awake_2',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var wakeup2 = new Ext.form.TextField({
		id: 'wakeup2',
		name: 'wakeup2',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var sleep2 = new Ext.form.TextField({
		id: 'sleep2',
		name: 'sleep2',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var items_2;
	if (add_sleepTimerDate) {
		items_2 = [interval2, days2, date_sleep_2, wakeup2, date_awake_2, sleep2];
	}
	else {
		items_2 = [interval2, days2, wakeup2, sleep2];
	}

	var timer2 = new Ext.form.FieldSet({
		id: 'timer2',
		title: S('sleeptimer_field2_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		titleCollapse: true,
		items: items_2
	});

	// <-- timer 2

	// --> timer 3
	var interval3 = new Ext.form.TextField({
		id: 'interval3',
		name: 'interval3',
		fieldLabel: S('sleeptimer_interval_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var days3 = new Ext.form.TextField({
		id: 'days3',
		name: 'days3',
		fieldLabel: S('sleeptimer_days_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_sleep_3 = new Ext.form.TextField({
		id: 'date_sleep_3',
		name: 'date_sleep_3',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var date_awake_3 = new Ext.form.TextField({
		id: 'date_awake_3',
		name: 'date_awake_3',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 500,
		readOnly: true,
		itemCls: 'display-label'
	});

	var wakeup3 = new Ext.form.TextField({
		id: 'wakeup3',
		name: 'wakeup3',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var sleep3 = new Ext.form.TextField({
		id: 'sleep3',
		name: 'sleep3',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var items_3;
	if (add_sleepTimerDate) {
		items_3 = [interval3, days3, date_sleep_3, wakeup3, date_awake_3, sleep3];
	}
	else {
		items_3 = [interval3, days3, wakeup3, sleep3];
	}
	var timer3 = new Ext.form.FieldSet({
		id: 'timer3',
		title: S('sleeptimer_field3_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		titleCollapse: true,
		items: items_3
	});

	// <-- timer 3
	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				sleeptimer_editBtnHandler(sleeptimerForm);
			}

		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [{
		name: 'interval1'
	},
	{
		name: 'wakeup1'
	},
	{
		name: 'wakeup_h1'
	},
	{
		name: 'wakeup_m1'
	},
	{
		name: 'sleep1'
	},
	{
		name: 'sleep_h1'
	},
	{
		name: 'sleep_m1'
	},

	{
		name: 'interval2'
	},
	{
		name: 'wakeup2'
	},
	{
		name: 'wakeup_h2'
	},
	{
		name: 'wakeup_m2'
	},
	{
		name: 'sleep2'
	},
	{
		name: 'sleep_h2'
	},
	{
		name: 'sleep_m2'
	},

	{
		name: 'interval3'
	},
	{
		name: 'wakeup3'
	},
	{
		name: 'wakeup_h3'
	},
	{
		name: 'wakeup_m3'
	},
	{
		name: 'sleep3'
	},
	{
		name: 'sleep_h3'
	},
	{
		name: 'sleep_m3'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var sleeptimerForm = new Ext.FormPanel({
		id: ID_SLEEPTIMER_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('sleeptimer_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_editBtn],
		titleCollapse: true,
		collapsed: true,
		items: [timer1, timer2, timer3]
	});

	return sleeptimerForm;
}

function create_sleeptimer_form_edit_mode() {
	var SLEEPTIMER_INTERVAL_LIST = [
		['disable', S('sleeptimer_interval_disable')],
		['day', S('sleeptimer_interval_day')],
		['week', S('sleeptimer_interval_week')]
	];

	// --- Create list of options for "Begin sleep at" field
	var sleepTime = new Array();
	var i_str;
	var n = 0;
	var i;
	var j;

	for (i = 0; i < 28; i++) {
		if (i < 10) {
			i_str = '0' + i;
		}
		else {
			i_str = i;
		}

		for (j = 0; j < 46; j = j + 15) {
			sleepTime[n] = new Array();
			if (j == 0) {
				sleepTime[n][0] = i_str + ':00'; // e.g. 02:00
			}
			else {
				sleepTime[n][0] = i_str + ':' + j; // e.g. 02:15
			}
			sleepTime[n][1] = sleepTime[n][0];
			n++;
		}
	}
	// -- list creation ends here
	// --- Create list of options for "wake up at" field
	var wakeupTime = new Array();
	i_str = '';
	n = 0;
	i = 0;
	j = 0;

	for (i = 0; i < 24; i++) {
		if (i < 10) {
			i_str = '0' + i;
		}
		else {
			i_str = i;
		}

		for (j = 0; j < 60; j = j + 15) {
			wakeupTime[n] = new Array();
			if (j == 0) {
				wakeupTime[n][0] = i_str + ':00'; // e.g. 02:00
			}
			else {
				wakeupTime[n][0] = i_str + ':' + j; // e.g. 02:15
			}
			wakeupTime[n][1] = wakeupTime[n][0];
			n++;
		}
	}
	// -- list creation ends here
	// --> timer 1
	var interval1 = new Ext.form.ComboBox({
		id: 'interval1_combo',
		hiddenName: 'interval1',
		fieldLabel: S('sleeptimer_interval_field'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: SLEEPTIMER_INTERVAL_LIST
		}),

		listeners: {
			select: function (interval1_combo) {
				var selectedValue = interval1_combo.getValue();
				if (selectedValue == 'week') {
					sun1.enable();
					mon1.enable();
					tue1.enable();
					wed1.enable();
					thu1.enable();
					fri1.enable();
					sat1.enable();
				}
				else { // 'disable' or 'day'
					sun1.disable();
					mon1.disable();
					tue1.disable();
					wed1.disable();
					thu1.disable();
					fri1.disable();
					sat1.disable();
				}
				if (selectedValue != 'disable') {
					wakeup1.enable();
					sleep1.enable();
					date_sleep_1.enable();
					date_awake_1.enable();
				}
				else {
					wakeup1.disable();
					sleep1.disable();
					date_sleep_1.disable();
					date_awake_1.disable();
				}
			}
		},

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

	var sun1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sun'),
		id: 'sun1',
		name: 'sun1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var mon1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_mon'),
		id: 'mon1',
		name: 'mon1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var tue1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_tue'),
		id: 'tue1',
		name: 'tue1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var wed1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_wed'),
		id: 'wed1',
		name: 'wed1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var thu1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_thu'),
		id: 'thu1',
		name: 'thu1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var fri1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_fri'),
		id: 'fri1',
		name: 'fri1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var sat1 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sat'),
		id: 'sat1',
		name: 'sat1',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var timeStore_wakeup_1 = new Ext.data.SimpleStore({
		data: wakeupTime,
		fields: ['val', 'opt']
	});

	var wakeup1 = new Ext.form.ComboBox({
		name: 'wakeup1',
		id: 'wakeup1_time',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		store: timeStore_wakeup_1,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		editable: false,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var timeStore_1 = new Ext.data.SimpleStore({
		data: sleepTime,
		fields: ['val', 'opt']
	});

	var sleep1 = new Ext.form.ComboBox({
		name: 'sleep1',
		id: 'sleep1_time',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		store: timeStore_1,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		editable: false,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var date_sleep_1 = new Ext.form.DateField({
		id: 'date_sleep_1',
		name: 'date_sleep_1',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});

	var date_awake_1 = new Ext.form.DateField({
		id: 'date_awake_1',
		name: 'date_awake_1',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});

	var items_1;
	if (add_sleepTimerDate) {
		items_1 = [interval1, sun1, mon1, tue1, wed1, thu1, fri1, sat1, date_awake_1, wakeup1, date_sleep_1, sleep1];
	}
	else {
		items_1 = [interval1, sun1, mon1, tue1, wed1, thu1, fri1, sat1, wakeup1, sleep1];
	}

	var timer1 = new Ext.form.FieldSet({
		id: 'timer1',
		title: S('sleeptimer_field1_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		titleCollapse: true,
		items: items_1
	});

	// <-- timer 1

	// --> timer 2
	var interval2 = new Ext.form.ComboBox({
		id: 'interval2_combo',
		hiddenName: 'interval2',
		fieldLabel: S('sleeptimer_interval_field'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: SLEEPTIMER_INTERVAL_LIST
		}),

		listeners: {
			select: function (interval2_combo) {
				var selectedValue = interval2_combo.getValue();
				if (selectedValue == 'week') {
					sun2.enable();
					mon2.enable();
					tue2.enable();
					wed2.enable();
					thu2.enable();
					fri2.enable();
					sat2.enable();
				}
				else { // 'disable' or 'day'
					sun2.disable();
					mon2.disable();
					tue2.disable();
					wed2.disable();
					thu2.disable();
					fri2.disable();
					sat2.disable();
				}
				if (selectedValue != 'disable') {
					wakeup2.enable();
					sleep2.enable();
					date_sleep_2.enable();
					date_awake_2.enable();
				}
				else {
					wakeup2.disable();
					sleep2.disable();
					date_sleep_2.disable();
					date_awake_2.disable();
				}
			}
		},

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

	var sun2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sun'),
		id: 'sun2',
		name: 'sun2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var mon2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_mon'),
		id: 'mon2',
		name: 'mon2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var tue2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_tue'),
		id: 'tue2',
		name: 'tue2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var wed2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_wed'),
		id: 'wed2',
		name: 'wed2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var thu2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_thu'),
		id: 'thu2',
		name: 'thu2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var fri2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_fri'),
		id: 'fri2',
		name: 'fri2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var sat2 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sat'),
		id: 'sat2',
		name: 'sat2',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var timeStore_wakeup_2 = new Ext.data.SimpleStore({
		data: wakeupTime,
		fields: ['val', 'opt']
	});

	var wakeup2 = new Ext.form.ComboBox({
		name: 'wakeup2',
		id: 'wakeup2_time',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		store: timeStore_wakeup_2,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		editable: false,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var timeStore_2 = new Ext.data.SimpleStore({
		data: sleepTime,
		fields: ['val', 'opt']
	});

	var sleep2 = new Ext.form.ComboBox({
		name: 'sleep2',
		id: 'sleep2_time',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		store: timeStore_2,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var date_sleep_2 = new Ext.form.DateField({
		id: 'date_sleep_2',
		name: 'date_sleep_2',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});
	var date_awake_2 = new Ext.form.DateField({
		id: 'date_awake_2',
		name: 'date_awake_2',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});

	var items_2;
	if (add_sleepTimerDate) {
		items_2 = [interval2, sun2, mon2, tue2, wed2, thu2, fri2, sat2, date_awake_2, wakeup2, date_sleep_2, sleep2];
	}
	else {
		items_2 = [interval2, sun2, mon2, tue2, wed2, thu2, fri2, sat2, wakeup2, sleep2];
	}
	var timer2 = new Ext.form.FieldSet({
		id: 'timer2',
		title: S('sleeptimer_field2_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		collapsed: true,
		titleCollapse: true,
		items: items_2
	});

	// <-- timer 2

	// --> timer 3
	var interval3 = new Ext.form.ComboBox({
		id: 'interval3_combo',
		hiddenName: 'interval3',
		fieldLabel: S('sleeptimer_interval_field'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: SLEEPTIMER_INTERVAL_LIST
		}),

		listeners: {
			select: function (interval3_combo) {
				var selectedValue = interval3_combo.getValue();
				if (selectedValue == 'week') {
					sun3.enable();
					mon3.enable();
					tue3.enable();
					wed3.enable();
					thu3.enable();
					fri3.enable();
					sat3.enable();
				}
				else { // 'disable' or 'day'
					sun3.disable();
					mon3.disable();
					tue3.disable();
					wed3.disable();
					thu3.disable();
					fri3.disable();
					sat3.disable();

				}
				if (selectedValue != 'disable') {
					wakeup3.enable();
					sleep3.enable();
					date_sleep_3.enable();
					date_awake_3.enable();
				}
				else {
					wakeup3.disable();
					sleep3.disable();
					date_sleep_3.disable();
					date_awake_3.disable();
				}
			}
		},

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

	var sun3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sun'),
		id: 'sun3',
		name: 'sun3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var mon3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_mon'),
		id: 'mon3',
		name: 'mon3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var tue3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_tue'),
		id: 'tue3',
		name: 'tue3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var wed3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_wed'),
		id: 'wed3',
		name: 'wed3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var thu3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_thu'),
		id: 'thu3',
		name: 'thu3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var fri3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_fri'),
		id: 'fri3',
		name: 'fri3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var sat3 = new Ext.form.Checkbox({
		boxLabel: S('sleeptimer_interval_sat'),
		id: 'sat3',
		name: 'sat3',
		inputValue: 1,
		hideLabel: true,
		disabled: true
	});

	var timeStore_wakeup_3 = new Ext.data.SimpleStore({
		data: wakeupTime,
		fields: ['val', 'opt']
	});

	var wakeup3 = new Ext.form.ComboBox({
		name: 'wakeup3',
		id: 'wakeup3_time',
		fieldLabel: S('sleeptimer_wakeup_time_field'),
		store: timeStore_wakeup_3,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		editable: false,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var timeStore_3 = new Ext.data.SimpleStore({
		data: sleepTime,
		fields: ['val', 'opt']
	});

	var sleep3 = new Ext.form.ComboBox({
		name: 'sleep3',
		id: 'sleep3_time',
		fieldLabel: S('sleeptimer_sleep_time_field'),
		store: timeStore_3,
		displayField: 'opt',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		width: 110,
		maxHeight: 100,
		listWidth: 110,
		value: '00:00'
	});

	var date_sleep_3 = new Ext.form.DateField({
		id: 'date_sleep_3',
		name: 'date_sleep_3',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_sleep_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});

	var date_awake_3 = new Ext.form.DateField({
		id: 'date_awake_3',
		name: 'date_awake_3',
		allowBlank: false,
		emptyText: S('date_format'),
		fieldAlign: 'left',
		fieldLabel: S('sleeptimer_wakeup_date_field'),
		width: 110,
		maxValue: '12/31/2020'
	});

	var items_3;
	if (add_sleepTimerDate) {
		items_3 = [interval3, sun3, mon3, tue3, wed3, thu3, fri3, sat3, date_awake_3, wakeup3, date_sleep_3, sleep3];
	}
	else {
		items_3 = [interval3, sun3, mon3, tue3, wed3, thu3, fri3, sat3, wakeup3, sleep3];
	}

	var timer3 = new Ext.form.FieldSet({
		id: 'timer3',
		title: S('sleeptimer_field3_title'),
		autoHeight: true,
		width: 600,
		collapsible: true,
		collapsed: true,
		titleCollapse: true,
		items: items_3
	});

	// <-- timer 3

	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name: 'hn_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				sleeptimer_saveBtnHandler(sleeptimerForm);
			}

		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				sleeptimer_display_mode(sleeptimerForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [{
		name: 'interval1'
	},
	{
		name: 'sun1'
	},
	{
		name: 'mon1'
	},
	{
		name: 'tue1'
	},
	{
		name: 'wed1'
	},
	{
		name: 'thu1'
	},
	{
		name: 'fri1'
	},
	{
		name: 'sat1'
	},
	{
		name: 'wakeup1'
	},
	{
		name: 'wakeup_h1'
	},
	{
		name: 'wakeup_m1'
	},
	{
		name: 'sleep1'
	},
	{
		name: 'sleep_h1'
	},
	{
		name: 'sleep_m1'
	},
	{
		name: 'date_sleep_1'
	},
	{
		name: 'date_awake_1'
	},

	{
		name: 'interval2'
	},
	{
		name: 'sun2'
	},
	{
		name: 'mon2'
	},
	{
		name: 'tue2'
	},
	{
		name: 'wed2'
	},
	{
		name: 'thu2'
	},
	{
		name: 'fri2'
	},
	{
		name: 'sat2'
	},
	{
		name: 'wakeup2'
	},
	{
		name: 'wakeup_h2'
	},
	{
		name: 'wakeup_m2'
	},
	{
		name: 'sleep2'
	},
	{
		name: 'sleep_h2'
	},
	{
		name: 'sleep_m2'
	},
	{
		name: 'date_sleep_2'
	},
	{
		name: 'date_awake_2'
	},

	{
		name: 'interval3'
	},
	{
		name: 'sun3'
	},
	{
		name: 'mon3'
	},
	{
		name: 'tue3'
	},
	{
		name: 'wed3'
	},
	{
		name: 'thu3'
	},
	{
		name: 'fri3'
	},
	{
		name: 'sat3'
	},
	{
		name: 'wakeup3'
	},
	{
		name: 'wakeup_h3'
	},
	{
		name: 'wakeup_m3'
	},
	{
		name: 'sleep3'
	},
	{
		name: 'sleep_h3'
	},
	{
		name: 'sleep_m3'
	},
	{
		name: 'date_sleep_3'
	},
	{
		name: 'date_awake_3'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var sleeptimerForm = new Ext.FormPanel({
		id: ID_SLEEPTIMER_FORM,
		cls: 'panel-custBorders',
		title: S('sleeptimer_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn],
		titleCollapse: true,
		items: [timer1, timer2, timer3]
	});

	return sleeptimerForm;
}

function sleeptimer_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_SLEEPTIMER
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_SLEEPTIMER
				},
				waitMsg: S('msg_loading_data'),
				failure: function (form, action) {
					formFailureFunction(action);
				},
				success: function (form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					sleeptimer_jsonData = resp.data[0];
					sleeptimer_display_mode(hnForm);
				}
			})
		}
	});
}

function sleeptimer_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_sleeptimer_form_edit_mode();
//	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, sleeptimer_renderBefore);
	updateCentralContainer(SYSTEM_RENDER_TO, hform_display);
	hform_display.form.setValues(sleeptimer_jsonData);
	radioSelection_sleeptimer(sleeptimer_jsonData);
	hform_display.expand(false);
}

function sleeptimer_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_sleeptimer_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, sleeptimer_renderBefore);
	hform_edit.form.setValues(sleeptimer_jsonData);
	sleeptimer_formatData_display(sleeptimer_jsonData);
//	radioSelection_sleeptimer(sleeptimer_jsonData);
	hform_edit.expand(false);
}

function sleeptimer_formatData_display(sleeptimer_jsonData) {
	// timer 1
	var interval_field = Ext.getCmp('interval1');
	var days_field = Ext.getCmp('days');
	var interval_1 = sleeptimer_jsonData.interval1;
	var intervalValue;

	if (interval_1 == 'day') {
		intervalValue = S('sleeptimer_interval_day');
	}
	else if (interval_1 == 'week') {
		var value_1 = '';

		if (sleeptimer_jsonData.sun1) value_1 += S('Sun') + ', ';
		if (sleeptimer_jsonData.mon1) value_1 += S('Mon') + ', ';
		if (sleeptimer_jsonData.tue1) value_1 += S('Tue') + ', ';
		if (sleeptimer_jsonData.wed1) value_1 += S('Wed') + ', ';
		if (sleeptimer_jsonData.thu1) value_1 += S('Thu') + ', ';
		if (sleeptimer_jsonData.fri1) value_1 += S('Fri') + ', ';
		if (sleeptimer_jsonData.sat1) value_1 += S('Sat') + ', ';

		value_1 = value_1.substring(0, value_1.length - 2);
		days_field.setValue(value_1);
		intervalValue = S('sleeptimer_interval_week');
	}
	else {
		intervalValue = S('disabled');
		var sleep_field_1 = Ext.getCmp('sleep1');
		var wakeup_field_1 = Ext.getCmp('wakeup1');
		var date_awake_field_1 = Ext.getCmp('date_awake_1');
		var date_sleep_field_1 = Ext.getCmp('date_sleep_1');

		date_awake_field_1.setValue('');
		date_sleep_field_1.setValue('');
		sleep_field_1.setValue('');
		wakeup_field_1.setValue('');

	}
	interval_field.setValue(intervalValue);

	// timer 2
	var interval_field_2 = Ext.getCmp('interval2');
	var days_field_2 = Ext.getCmp('days2');
	var interval_2 = sleeptimer_jsonData.interval2;
	var intervalValue_2;

	if (interval_2 == 'day') {
		intervalValue_2 = S('sleeptimer_interval_day');
	}
	else if (interval_2 == 'week') {
		var value_2 = '';

		if (sleeptimer_jsonData.sun2) value_2 += S('Sun') + ', ';
		if (sleeptimer_jsonData.mon2) value_2 += S('Mon') + ', ';
		if (sleeptimer_jsonData.tue2) value_2 += S('Tue') + ', ';
		if (sleeptimer_jsonData.wed2) value_2 += S('Wed') + ', ';
		if (sleeptimer_jsonData.thu2) value_2 += S('Thu') + ', ';
		if (sleeptimer_jsonData.fri2) value_2 += S('Fri') + ', ';
		if (sleeptimer_jsonData.sat2) value_2 += S('Sat') + ', ';

		value_2 = value_2.substring(0, value_2.length - 2);
		days_field_2.setValue(value_2);
		intervalValue_2 = S('sleeptimer_interval_week');
	}
	else {
		intervalValue_2 = S('disabled');
		var sleep_field_2 = Ext.getCmp('sleep2');
		var wakeup_field_2 = Ext.getCmp('wakeup2');
		var date_awake_field_2 = Ext.getCmp('date_awake_2');
		var date_sleep_field_2 = Ext.getCmp('date_sleep_2');

		date_awake_field_2.setValue('');
		date_sleep_field_2.setValue('');
		sleep_field_2.setValue('');
		wakeup_field_2.setValue('');

	}
	interval_field_2.setValue(intervalValue_2);

	// timer 3
	var interval_field_3 = Ext.getCmp('interval3');
	var days_field_3 = Ext.getCmp('days3');
	var interval_3 = sleeptimer_jsonData.interval3;
	var intervalValue_3;

	if (interval_3 == 'day') {
		intervalValue_3 = S('sleeptimer_interval_day');
	}
	else if (interval_3 == 'week') {
		var value_3 = '';

		if (sleeptimer_jsonData.sun3) value_3 += S('Sun') + ', ';
		if (sleeptimer_jsonData.mon3) value_3 += S('Mon') + ', ';
		if (sleeptimer_jsonData.tue3) value_3 += S('Tue') + ', ';
		if (sleeptimer_jsonData.wed3) value_3 += S('Wed') + ', ';
		if (sleeptimer_jsonData.thu3) value_3 += S('Thu') + ', ';
		if (sleeptimer_jsonData.fri3) value_3 += S('Fri') + ', ';
		if (sleeptimer_jsonData.sat3) value_3 += S('Sat') + ', ';

		value_3 = value_3.substring(0, value_3.length - 2);
		days_field_3.setValue(value_3);
		intervalValue_3 = S('sleeptimer_interval_week');
	}
	else {
		intervalValue_3 = S('disabled');
		var sleep_field_3 = Ext.getCmp('sleep3');
		var wakeup_field_3 = Ext.getCmp('wakeup3');
		var date_awake_field_3 = Ext.getCmp('date_awake_3');
		var date_sleep_field_3 = Ext.getCmp('date_sleep_3');

		date_awake_field_3.setValue('');
		date_sleep_field_3.setValue('');
		sleep_field_3.setValue('');
		wakeup_field_3.setValue('');

	}
	interval_field_3.setValue(intervalValue_3);
}

function radioSelection_sleeptimer(data) {
	// -> timer 1
	var interval1_combo = Ext.getCmp('interval1_combo');
	var interval2_combo = Ext.getCmp('interval2_combo');
	var interval3_combo = Ext.getCmp('interval3_combo');
	selectedValue1 = data.interval1;

	sun1Chk = Ext.getCmp('sun1');
	mon1Chk = Ext.getCmp('mon1');
	tue1Chk = Ext.getCmp('tue1');
	wed1Chk = Ext.getCmp('wed1');
	thu1Chk = Ext.getCmp('thu1');
	fri1Chk = Ext.getCmp('fri1');
	sat1Chk = Ext.getCmp('sat1');
	wakeup1Txt = Ext.getCmp('wakeup1_time');
	sleep1Text = Ext.getCmp('sleep1_time');
	date_sleep_1 = Ext.getCmp('date_sleep_1');
	date_awake_1 = Ext.getCmp('date_awake_1');


	if (selectedValue1 == 'week') {
		sun1Chk.enable();
		mon1Chk.enable();
		tue1Chk.enable();
		wed1Chk.enable();
		thu1Chk.enable();
		fri1Chk.enable();
		sat1Chk.enable();
	}
	else { // 'disable' or 'day'
		sun1Chk.disable();
		mon1Chk.disable();
		tue1Chk.disable();
		wed1Chk.disable();
		thu1Chk.disable();
		fri1Chk.disable();
		sat1Chk.disable();
	}

	if (selectedValue1 != 'week' && selectedValue1 != 'day') {
		//'disable'
		interval1_combo.setValue('disable');
		wakeup1Txt.disable();
		sleep1Text.disable();
		date_sleep_1.disable();
		date_awake_1.disable();

	}
	else {
		//'week' or 'day'
		wakeup1Txt.enable();
		sleep1Text.enable();
		date_sleep_1.enable();
		date_awake_1.enable();
	}
	// <- timer 1

	// -> timer 2
	selectedValue2 = data.interval2;

	sun2Chk = Ext.getCmp('sun2');
	mon2Chk = Ext.getCmp('mon2');
	tue2Chk = Ext.getCmp('tue2');
	wed2Chk = Ext.getCmp('wed2');
	thu2Chk = Ext.getCmp('thu2');
	fri2Chk = Ext.getCmp('fri2');
	sat2Chk = Ext.getCmp('sat2');
	wakeup2Txt = Ext.getCmp('wakeup2_time');
	sleep2Text = Ext.getCmp('sleep2_time');
	date_sleep_2 = Ext.getCmp('date_sleep_2');
	date_awake_2 = Ext.getCmp('date_awake_2');

	if (selectedValue2 == 'week') {
		sun2Chk.enable();
		mon2Chk.enable();
		tue2Chk.enable();
		wed2Chk.enable();
		thu2Chk.enable();
		fri2Chk.enable();
		sat2Chk.enable();

	}
	else { // 'disable' or 'day'
		sun2Chk.disable();
		mon2Chk.disable();
		tue2Chk.disable();
		wed2Chk.disable();
		thu2Chk.disable();
		fri2Chk.disable();
		sat2Chk.disable();
	}

	if (selectedValue2 != 'week' && selectedValue2 != 'day') {
		//'disable'
		interval2_combo.setValue('disable');
		wakeup2Txt.disable();
		sleep2Text.disable();
		date_sleep_2.disable();
		date_awake_2.disable();

	}
	else {
		//'week' or 'day'
		wakeup2Txt.enable();
		sleep2Text.enable();
		date_sleep_2.enable();
		date_awake_2.enable();
	}
	// <- timer 2

	// -> timer 3
	selectedValue3 = data.interval3;
	if (selectedValue3 == '') {
		selectedValue3 = 'disable'
	}
	sun3Chk = Ext.getCmp('sun3');
	mon3Chk = Ext.getCmp('mon3');
	tue3Chk = Ext.getCmp('tue3');
	wed3Chk = Ext.getCmp('wed3');
	thu3Chk = Ext.getCmp('thu3');
	fri3Chk = Ext.getCmp('fri3');
	sat3Chk = Ext.getCmp('sat3');
	wakeup3Txt = Ext.getCmp('wakeup3_time');
	sleep3Text = Ext.getCmp('sleep3_time');
	date_sleep_3 = Ext.getCmp('date_sleep_3');
	date_awake_3 = Ext.getCmp('date_awake_3');

	if (selectedValue3 == 'week') {
		sun3Chk.enable();
		mon3Chk.enable();
		tue3Chk.enable();
		wed3Chk.enable();
		thu3Chk.enable();
		fri3Chk.enable();
		sat3Chk.enable();
	}
	else { // 'disable' or 'day'
		sun3Chk.disable();
		mon3Chk.disable();
		tue3Chk.disable();
		wed3Chk.disable();
		thu3Chk.disable();
		fri3Chk.disable();
		sat3Chk.disable();
	}
	if (selectedValue3 != 'week' && selectedValue3 != 'day') {
		//'disable'
		interval3_combo.setValue('disable');
		wakeup3Txt.disable();
		sleep3Text.disable();
		date_sleep_3.disable();
		date_awake_3.disable();

	}
	else {
		//'week' or 'day'
		wakeup3Txt.enable();
		sleep3Text.enable();
		date_sleep_2.enable();
		date_awake_2.enable();
	}
	// <- timer 3
}
