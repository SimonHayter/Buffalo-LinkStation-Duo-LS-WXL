function disk_array_maintenance_display() {
	var maint_display = new Ext.form.TextField({
		id: 'raidscan',
		name: 'raidscan',
		fieldLabel: S('disk_mngt_array_maint_label'),
		width: 200,
		readOnly: true
	});

	var maint_schedule_display = new Ext.form.TextField({
		id: 'schedule',
		name: 'schedule',
		fieldLabel: S('disk_mngt_array_maint_schedule_label'),
		width: 200,
		readOnly: true
	});

	var maint_schedule_time_display = new Ext.form.TextField({
		id: 'schedule_start_time',
		name: 'schedule_start_time',
		fieldLabel: S('disk_mngt_array_maint_schedule_time'),
		width: 200,
		readOnly: true
	});

	var maint_editBtn = new Ext.Button({
		id: 'maint_editBtn',
		name: 'maint_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function () {
				maintForm_display.destroy();
				form_editMode = disk_array_maint_edit_mode();
				insertToCentralContainer(SYSTEM_RENDER_TO, form_editMode, render_raid_scan_before);
				form_editMode.disable();
				form_editMode.form.setValues(array_maint_jsonData);
				form_editMode.enable();
				maint_format_response_editMode(array_maint_jsonData);
			}
		}
	});

	var maint_abortBtn = new Ext.Button({
		id: 'maint_abortBtn',
		name: 'maint_abortBtn',
		text: S('disk_mngt_array_maint_abort'),
		listeners: {
			click: function () {
				maintForm_display.form.submit({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_ABORT_ARRAY_MAINT
					},
					waitMsg: S('msg_saving_data'),
					failure: function (form, action) {
						formFailureFunction(action);
					},
					success: function (form, action) {
						resetCookie();
						createSystemDisk();
					}
				});
			}
		},
		disabled: true
	});

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader_display = new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
	},
	[{
		name: 'raidscan_status'
	},
	{
		name: 'raidscan_disable'
	},
	{
		name: 'raidscan'
	},
	{
		name: 'schedule_type'
	},
	{
		name: 'schedule_no'
	},
	{
		name: 'schedule_week'
	},
	{
		name: 'schedule_month'
	},
	{
		name: 'schedule_start_time'
	}]);

	var maintForm_display = new Ext.FormPanel({
		id: ID_FORM_RAID_SCAN,
		title: S('disk_mngt_array_maint_title'),
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
		buttons: [maint_editBtn, maint_abortBtn],
		items: [
			maint_display,
			maint_schedule_display,
			maint_schedule_time_display
		],
		titleCollapse: true
	});

	return maintForm_display;
}

function maint_format_response_displayMode(data) {
	var maint_editBtn = Ext.getCmp('maint_editBtn');
	var maint_abortBtn = Ext.getCmp('maint_abortBtn');

	if (data.raidscan_status == 'run') {
		maint_editBtn.disable();
		maint_abortBtn.enable();
	}

	if (data.raidscan_disable == 'ng') {
		maint_editBtn.disable();
	}

	var maint_display_field = Ext.getCmp('raidscan');
	var maint_schedule_display_field = Ext.getCmp('schedule');
	var maint_schedule_time_display_field = Ext.getCmp('schedule_start_time');
	var maint_fail_display_field = Ext.getCmp('raidfail_shutdown');
	var raidfail_boot_iscsi_field = Ext.getCmp('raidfail_boot_iscsi');
	var raid_sync_speed_display_field = Ext.getCmp('raid_sync_speed_display');

	if (data.raidscan == 'off') {
		maint_display_field.setValue(S('disabled'));
	}
	else {
		maint_display_field.setValue(S('enabled'));
	}

	if (data.schedule_type == 'month') {
		maint_schedule_display_field.setValue(S('disk_mngt_array_maint_schedule_1st'));
	}
	else if (data.schedule_type == 'week') {
		if ((!data.schedule_no) || (!data.schedule_week)) {
			maint_schedule_display_field.setValue('-');
		}
		else {
			maint_schedule_display_field.setValue(S('disk_mngt_array_maint_schedule_' + data.schedule_no) + S(data.schedule_week));
		}
	}

	if (data.schedule_start_time) {
		maint_schedule_time_display_field.setValue(data.schedule_start_time + ' ' + S('hour'));
	}
	else {
		maint_schedule_time_display_field.setValue('-');
	}
}

function maint_format_response_editMode(data) {
	var raidscanRadio_En = Ext.getCmp('raidscanRadio_En');
	var raidscanRadio_Dis = Ext.getCmp('raidscanRadio_Dis');

	var raidscanTypeRadio_week = Ext.getCmp('raidscanTypeRadio_week');
	var raidscanSchedule_noList = Ext.getCmp('raidscanSchedule_noList');
	var raidscanSchedule_weekList = Ext.getCmp('raidscanSchedule_weekList');
	var raidscanTypeRadio_month = Ext.getCmp('raidscanTypeRadio_month');

	var raidscanNow = Ext.getCmp('raidscanNow');
	var raidscanStarttime = Ext.getCmp('raidscanStarttime');

	if (data.raidscan == 'on') {
		raidscanRadio_En.setValue(true);
		raidscanTypeRadio_week.enable();
		raidscanTypeRadio_month.enable();
		raidscanNow.enable();
		raidscanStarttime.enable();
		if (data.schedule_type == 'month') {
			raidscanTypeRadio_week.setValue(false);
			raidscanTypeRadio_month.setValue(true);
			raidscanSchedule_noList.disable();
			raidscanSchedule_weekList.disable();
		}
		else {
			raidscanTypeRadio_week.setValue(true);
			raidscanTypeRadio_month.setValue(false);
			raidscanSchedule_noList.enable();
			raidscanSchedule_weekList.enable();
		}
	}
	else {
		raidscanRadio_Dis.setValue(true);
		raidscanTypeRadio_week.disable();
		raidscanSchedule_noList.disable();
		raidscanSchedule_noList.setValue('every');
		raidscanSchedule_weekList.disable();
		raidscanTypeRadio_month.disable();
		raidscanNow.disable();
		raidscanStarttime.disable();
	}
}

function disk_array_maint_edit_mode() {
	var raidscanRadio_En = new Ext.form.Radio({
		id: 'raidscanRadio_En',
		hideLabel: true,
		name: 'raidscan',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (raidscanRadio_En, checked) {
				if (checked) {
					raidscanRadio_Dis.setValue(false);
					raidscanTypeRadio_week.enable();
					if (raidscanTypeRadio_week.checked) {
						raidscanSchedule_noList.enable();
						raidscanSchedule_weekList.enable();
					}
					if ((!raidscanTypeRadio_week.checked) && (!raidscanTypeRadio_month.checked)) {
						raidscanTypeRadio_week.setValue(true);
						raidscanSchedule_noList.enable();
						raidscanSchedule_weekList.enable();
					}
					raidscanTypeRadio_month.enable();
					raidscanNow.enable();
					raidscanStarttime.enable();
				}
			}
		}
	});

	var raidscanRadio_Dis = new Ext.form.Radio({
		id: 'raidscanRadio_Dis',
		hideLabel: true,
		name: 'raidscan',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (raidscanRadio_Dis, checked) {
				if (checked) {
					raidscanRadio_En.setValue(false);
					raidscanTypeRadio_week.disable();
					raidscanSchedule_noList.disable();
					raidscanSchedule_weekList.disable();
					raidscanTypeRadio_month.disable();
					raidscanNow.disable();
					raidscanStarttime.disable();
				}
			}
		}
	});

	var raidscanSchedule_noOpt = [
		['every', S('disk_mngt_array_maint_schedule_every')],
		['1', S('disk_mngt_array_maint_schedule_1')],
		['2', S('disk_mngt_array_maint_schedule_2')],
		['3', S('disk_mngt_array_maint_schedule_3')],
		['4', S('disk_mngt_array_maint_schedule_4')],
		['13', S('disk_mngt_array_maint_schedule_13')],
		['24', S('disk_mngt_array_maint_schedule_24')]
	];

	var raidscanSchedule_noListStore = new Ext.data.SimpleStore({
		data: raidscanSchedule_noOpt,
		fields: ['val', 'opt']
	});

	var raidscanSchedule_weekOpt = [
		['Sun', S('Sun')],
		['Mon', S('Mon')],
		['Tue', S('Tue')],
		['Wed', S('Wed')],
		['Thu', S('Thu')],
		['Fri', S('Fri')],
		['Sat', S('Sat')]
	];

	var raidscanSchedule_weekListStore = new Ext.data.SimpleStore({
		data: raidscanSchedule_weekOpt,
		fields: ['val', 'opt']
	});

	var raidscanSchedule_noList = new Ext.form.ComboBox({
		id: 'raidscanSchedule_noList',
		hiddenName: 'schedule_no',
		editable: false,
		store: raidscanSchedule_noListStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		width: 100,
		listWidth: 100,
		value: 'every'
	});

	var raidscanSchedule_weekList = new Ext.form.ComboBox({
		id: 'raidscanSchedule_weekList',
		hiddenName: 'schedule_week',
		editable: false,
		store: raidscanSchedule_weekListStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		width: 100,
		listWidth: 100,
		value: 'Sun'
	});

	var raidscanTypeRadio_week = new Ext.form.Radio({
		id: 'raidscanTypeRadio_week',
		hideLabel: true,
		name: 'schedule_type',
		inputValue: 'week',
		listeners: {
			check: function (raidscanTypeRadio_week, checked) {
				if (checked) {
					raidscanTypeRadio_month.setValue(false);
					raidscanSchedule_noList.enable();
					raidscanSchedule_weekList.enable();
				}
			}
		}
	});

	var raidscanTypeRadio_month = new Ext.form.Radio({
		id: 'raidscanTypeRadio_month',
		hideLabel: true,
		name: 'schedule_type',
		boxLabel: S('disk_mngt_array_maint_schedule_1st'),
		inputValue: 'month',
		listeners: {
			check: function (raidscanTypeRadio_month, checked) {
				if (checked) {
					raidscanTypeRadio_week.setValue(false);
					raidscanSchedule_noList.disable();
					raidscanSchedule_weekList.disable();
				}
			}
		}
	});

	var raidscanNow = new Ext.form.Checkbox({
		boxLabel: S('disk_mngt_array_maint_schedule_now'),
		id: 'raidscanNow',
		name: 'raidscan_now',
		inputValue: 'now',
		hideLabel: true
	});

	var raidscanStartime_Opt = [
		['0'],
		['1'],
		['2'],
		['3'],
		['4'],
		['5'],
		['6'],
		['7'],
		['8'],
		['9'],
		['10'],
		['11'],
		['12'],
		['13'],
		['14'],
		['15'],
		['16'],
		['17'],
		['18'],
		['19'],
		['20'],
		['21'],
		['22'],
		['23']
	];

	var raidscanStartime_ListStore = new Ext.data.SimpleStore({
		data: raidscanStartime_Opt,
		fields: ['val']
	});

	var raidscanStarttime = new Ext.form.ComboBox({
		id: 'raidscanStarttime',
		hiddenName: 'schedule_start_time',
		editable: false,
		store: raidscanStartime_ListStore,
		displayField: 'val',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		width: 100,
		listWidth: 100,
		value: '0'
	});

	var maint_saveBtn = new Ext.Button({
		id: 'maint_saveBtn',
		name: 'maint_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				maint_saveBtnHandler(maintForm_edit);
			}
		}
	});

	var maint_cancelBtn = new Ext.Button({
		id: 'maint_cancelBtn',
		name: 'maint_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				maint_cancelBtnHandler(maintForm_edit);
			}
		}
	});

	var jReader_edit = new Ext.data.JsonReader({
		id: 'jReader_edit',
		root: 'data'
	},
	[{
		name: 'raidscan'
	},
	{
		name: 'schedule_type'
	},
	{
		name: 'schedule_no'
	},
	{
		name: 'schedule_week'
	},
	{
		name: 'schedule_month'
	},
	{
		name: 'schedule_start_time'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var items = new Array();
	items = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('disk_mngt_array_maint_label') + ":"
		},
		{
			layout: 'form',
			columnWidth: .368,
			items: [raidscanRadio_En]
		},
		{
			layout: 'form',
			columnWidth: .368,
			items: [raidscanRadio_Dis]
		}]
	},
	{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('disk_mngt_array_maint_schedule_label') + ":"
		},
		{
			cls: 'label',
			columnWidth: .050,
			items: [raidscanTypeRadio_week]
		},
		{
			cls: 'label',
			columnWidth: .200,
			items: [raidscanSchedule_noList]
		},
		{
			cls: 'label',
			columnWidth: .200,
			items: [raidscanSchedule_weekList]
		},
		{
			cls: 'label',
			columnWidth: .250,
			items: [raidscanTypeRadio_month]
		}]
	},
	{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: '&nbsp;'
		},
		{
			layout: 'form',
			columnWidth: .60,
			items: [raidscanNow]
		}]
	},
	{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('disk_mngt_array_maint_schedule_time') + ":"
		},
		{
			cls: 'label',
			columnWidth: .20,
			items: [raidscanStarttime]
		},
		{
			cls: 'label',
			columnWidth: .20,
			html: S('o_clock')
		}]
	}];

	var maintForm_edit = new Ext.FormPanel({
		id: ID_FORM_RAID_SCAN,
		title: S('disk_mngt_array_maint_title'),
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
		buttons: [maint_saveBtn, maint_cancelBtn],
		items: items,
		titleCollapse: true
	});

	return maintForm_edit;
}

function maint_saveBtnHandler(maintForm_edit) {
	var schedule_type_send_value;

	if (Ext.getCmp('raidscanTypeRadio_week').checked) {
		schedule_type_send_value = 'week';
	}
	else {
		schedule_type_send_value = 'month';
	}

	maintForm_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_ARRAY_MAINT,
			schedule_type: schedule_type_send_value,
			schedule_no: Ext.getCmp('raidscanSchedule_noList').getValue(),
			schedule_week: Ext.getCmp('raidscanSchedule_weekList').getValue(),
			schedule_start_time: Ext.getCmp('raidscanStarttime').getValue()
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			createSystemDisk();
		}
	});
}

function maint_cancelBtnHandler(maintForm_edit) {
	maintForm_edit.destroy();
	maintForm_display = disk_array_maintenance_display();

	insertToCentralContainer(SYSTEM_RENDER_TO, maintForm_display, render_raid_scan_before);
	maintForm_display.form.setValues(array_maint_jsonData);
	maint_format_response_displayMode(array_maint_jsonData);
	maintForm_display.expand(false);
}
