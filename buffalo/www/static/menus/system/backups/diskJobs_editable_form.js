var beforeSelected_mode;

function jobs_create_form(jobId) {
	var warn_usedby_usbdev = S('Warn_Usedby_USBDevServer');
	var isHide = true;
	if (deviceservermode == 'on') {
		isHide = false;
	}

	var scheduleOptions = [
		['not_scheduled', S('disk_backup_scheduleType_not_run')],
		['now', S('disk_backup_scheduleType_now')],
		['day', S('disk_backup_scheduleType_day')],
		['week', S('disk_backup_scheduleType_week')],
		['1', S('disk_backup_scheduleType_1')],
		['2', S('disk_backup_scheduleType_2')],
		['3', S('disk_backup_scheduleType_3')],
		['4', S('disk_backup_scheduleType_4')],
		['13', S('disk_backup_scheduleType_13')],
		['24', S('disk_backup_scheduleType_24')],
		['1st', S('disk_backup_scheduleType_1st')]
	];

	var weekdays = [
		['Sun', S('Sun')],
		['Mon', S('Mon')],
		['Tue', S('Tue')],
		['Wed', S('Wed')],
		['Thu', S('Thu')],
		['Fri', S('Fri')],
		['Sat', S('Sat')]
	];

	var operationModes;
	if (add_hardlink_backup) {
		operationModes = [
			['off', S('disk_backup_operationMode_off')],
			['diff', S('disk_backup_operationMode_diff')],
			['diff_del', S('disk_backup_operationMode_diff_del')],
			['hardlink', S('disk_backup_operationMode_hardlink')]
		];

		var hardlinkGen = [
			['-1', S('disk_backup_hardlinkGen_unlimited')],
			['1', '1'],
			['2', '2'],
			['3', '3'],
			['4', '4'],
			['5', '5'],
			['6', '6'],
			['7', '7'],
			['8', '8'],
			['9', '9'],
			['10', '10']
		];
	}
	else {
		operationModes = [
			['off', S('disk_backup_operationMode_off')],
			['diff', S('disk_backup_operationMode_diff')],
			['diff_del', S('disk_backup_operationMode_diff_del')]
		];
	}

	// comboBoxes for Backup job schedule, Date, Time and Operation Mode
	var scheduleOptStore = new Ext.data.SimpleStore({
		data: scheduleOptions,
		fields: ['val', 'opt']
	});

	var jobName = new Ext.form.TextField({
		id: ID_JOBS_PREFIX_BACKUP_JOB_NAME,
		fieldLabel: S('disk_backup_job_name'),
		name: 'jobName',
		width: 250,
		maxLength: 30,
		allowBlank: false
	});

	var jobScheduleType = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_JOB_SCHEDULE_COMBO,
		hiddenName: 'scheduleType',
		editable: false,
		fieldLabel: S('disk_backup_bck_job_schedule'),
		store: scheduleOptStore,
		displayField: 'opt',
		valueField: 'val',
		emptyText: S('disk_backup_selectSchedule'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 150,
		width: 150,
		listeners: {
			select: function () {
				scheduleTypecomboHandler();
			}
		}
	});

	var weekdaysStore = new Ext.data.SimpleStore({
		data: weekdays,
		fields: ['val', 'day']
	});

	var weekday = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO,
		hiddenName: 'weekday',
		editable: false,
		fieldLabel: S('disk_backup_bck_date'),
		store: weekdaysStore,
		displayField: 'day',
		valueField: 'val',
		emptyText: S('disk_backup_select_day'),
		mode: 'local',
		triggerAction: 'all',
		allowBlank: false,
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 110,
		width: 110,
		value: 'Sun'
	});

	var time = new Ext.form.TimeField({
		id: ID_JOBS_PREFIX_BACKUP_TIME_COMBO,
		hiddenName: 'startTime',
		hideLabel: true,
		listWidth: 110,
		width: 110,
		maxHeight: 100,
		format: 'H:i',
		forceSelection: true,
		editable: false,
		allowBlank: false,
		value: '00:00'
	});

	var backupOpModeStore = new Ext.data.SimpleStore({
		data: operationModes,
		fields: ['val', 'mode']
	});

	var backupOpMode = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_BACKUP_MODE_COMBO,
		hiddenName: 'operationMode',
		editable: false,
		fieldLabel: S('disk_backup_bck_operation_mode'),
		store: backupOpModeStore,
		displayField: 'mode',
		valueField: 'val',
		allowBlank: true,
		mode: 'local',
		triggerAction: 'all',
		allowBlank: false,
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 250,
		width: 250,
		value: 'off',
		// option for 'normal backup'
		listeners: {
			select: function () {
				operationModeComboHandler();
			}
		}
	});

	var backupHardlinkGenStore = new Ext.data.SimpleStore({
		data: hardlinkGen,
		fields: ['val', 'mode']
	});

	var backupHardlinkGen = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO,
		hiddenName: 'keep_generation',
		editable: false,
		fieldLabel: S('disk_backup_hardlinkGen'),
		store: backupHardlinkGenStore,
		displayField: 'mode',
		valueField: 'val',
		allowBlank: true,
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 100,
		width: 100,
		value: '-1'
	});

	var hardlinkItems = 0;
	if (add_hardlink_backup) {
		hardlinkItems = backupHardlinkGen;
	}

	// add the above items( comboBoxes ) to Job Properties fieldset
	var jobPropertiesFs = new Ext.form.FieldSet({
		name: 'jobPropertiesFs',
		title: S('disk_backup_job_Properties'),
		autoHeight: true,
		width: 640,
		labelWidth: 200,
		items: [jobName, jobScheduleType, {
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .54,
				items: [weekday]
			},
			{
				layout: 'form',
				columnWidth: .40,
				items: [time]
			}]
		},
		backupOpMode, hardlinkItems]
	});

	// checkBoxes for Backup Options
	var createTarget = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX,
		name: 'createTarget',
		boxLabel: S('disk_backup_bck_opt_folder'),
		hideLabel: true,
		disabled: true,
		width: 460
	});

	var createBackup = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX,
		name: 'createBackup',
		boxLabel: S('disk_backup_bck_opt_log'),
		hideLabel: true,
		width: 460,
		listeners: {
			check: function(nt, checked) {
				if (checked) {
					msgBox_usingDictionary('warning_box_title', 'disk_backup_warning_source_remote', Ext.Msg.OK, Ext.MessageBox.WARNING);
				}
			}
		}
	});

	var useEncrypted = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX,
		name: 'useEncrypted',
		boxLabel: S('disk_backup_bck_opt_encrypt'),
		hideLabel: true,
		width: 460
	});

	var useCompressed = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX,
		name: 'useCompressed',
		boxLabel: S('disk_backup_bck_opt_compress'),
		hideLabel: true,
		width: 460
	});

	var ignoreErrors = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX,
		name: 'ignoreErrors',
		boxLabel: S('disk_backup_bck_opt_ignore_error'),
		hideLabel: true,
		width: 460
	});

	var ignoreTrashbox = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX,
		name: 'ignoreTrashbox',
		boxLabel: S('disk_backup_bck_opt_trashbox'),
		hideLabel: true,
		width: 460
	});

	var completeBckp = new Ext.form.Checkbox({
		id: ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX,
		name: 'completeBckp',
		boxLabel: S('disk_backup_bck_opt_complete'),
		hideLabel: true,
		width: 460
	});

	var backupOptionsArray = [
		createTarget,
		createBackup,
		useEncrypted,
		useCompressed,
		ignoreErrors,
		ignoreTrashbox,
		completeBckp
	];

	// add the above items( checkBoxes ) to Backup Options fieldset
	var backupOptionsFs = new Ext.form.FieldSet({
		id: ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET,
		name: 'backupOptionsFs',
		title: S('disk_backup_bck_options'),
		autoHeight: true,
		width: 638,
		items: backupOptionsArray,
		collapsed: true,
		collapsible: true,
		titleCollapse: true,
		autoHeight: true
	});

	var infomationForm = new Ext.form.FieldSet({
		id: ID_JOBS_PREFIX_BACKUP_INFO_FIELDSET,
		name: 'infomationForm',
		title: S('information_box_title'),
		autoHeight: true,
		width: 638,
		items:[{
			autoWidth: true,
			layout: 'column',
			id: 'warn_usedby_usbdev',
			name: 'warn_usedby_usbdev',
			cls : 'column-custBorders',
			items: [{
				cls: 'warnings',
				columnWidth: 1.0,
				html: warn_usedby_usbdev
			}],
			hideMode: 'display',
			hidden: isHide,
			hideLabel: isHide
		}],
		hidden: isHide
	});

	var jobJsonReaderValues = [{
		name: 'jobName'
	},
	{
		name: 'backupEnable'
	},
	{
		name: 'backupStatus'
	},
	{
		name: 'scheduleType'
	},
	{
		name: 'startTime'
	},
	{
		name: 'weekday'
	},
	{
		name: 'operationMode'
	},
	{
		name: 'keep_generation'
	},
	{
		name: 'createTarget'
	},
	{
		name: 'createBackup'
	},
	{
		name: 'useEncrypted'
	},
	{
		name: 'useCompressed'
	},
	{
		name: 'ignoreErrors'
	},
	{
		name: 'ignoreTrashbox'
	},
	{
		name: 'completeBckp'
	}
	];

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	jobJsonReaderValues);

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

	var applyBtn = new Ext.Button({
		text: S('btn_apply'),
		scope: this,
		handler: function () {
			var frontGrid = Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID);
			var store = frontGrid.getStore();
			var records = store.getRange();
			var dataToParse = new Array(records.length);

			// for IE 'null' string save bug
			if (Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).getValue() == 'null') {
				Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).setValue('Sun');
			}

			for (var i = 0; i < records.length; i++) {
				dataToParse[i] = new Array(2);
				dataToParse[i][0] = records[i].data.sourceVal;
				dataToParse[i][1] = records[i].data.targetVal;
			}
			var jsonData = Ext.util.JSON.encode(dataToParse);

			var bufaction;
			if (jobId) {
				bufaction = BUFACT_SET_JOB + jobId;
			}
			else {
				bufaction = BUFACT_ADD_JOB;
			}

			var operationModecombo = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO)
			var operationMode = operationModecombo.getValue()
			if (operationMode == 'hardlink') {
				var hardlinkGenVal = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).getValue();
				if (!hardlinkGenVal) {
					hardlinkGenVal = -1;
				}
			}

			localJobForm.form.submit({
				url: '/dynamic.pl',
				params: {
					bufaction: bufaction,
					backupFolders: jsonData,
					keep_generation: hardlinkGenVal
				},
				failure: function (form, action) {
					formFailureFunction(action);
				},
				success: function () {
					resetCookie();
					system_jobs_processAuth();
				},
				waitMsg: S('msg_saving_data'),
				scope: this
			});
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function () {
/*
			var msg = '[Warning here]';
			Ext.MessageBox.show({
				title: S('warning'),
				msg: msg,
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.QUESTION,
				fn: function(btn) {
					if (btn == 'ok') {
						system_jobs_processAuth();
					}
				}
			});
*/
			system_jobs_processAuth();
		}
	});

	var grid = jobs_addGrid(jobId);

	var localJobForm = new Ext.FormPanel({
		hideTitle: true,
		id: 'jobs_form_id',
		width: 640,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 120,
		reader: jReader,
		errorReader: jErrReader,
		items: [
			infomationForm,
			jobPropertiesFs,
			backupOptionsFs,
			grid
		],
		buttons: [
			applyBtn,
			cancelBtn
		]
	});

	return localJobForm;
}

function displaySettingsOnLoad(form, action) {
	var resp = Ext.decode(action.response.responseText);
	var scheduleType = resp.data[0].scheduleType;

	onloadComboListeners(scheduleType);
}

function onloadComboListeners(scheduleType) {
	var frontGrid = Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID);
	var frontGridStore = frontGrid.getStore();

	switch (scheduleType) {
		case 'not_scheduled':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).collapse(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).collapse(true);
			break;

		case 'now':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			frontGridStore.load({
				callback: function (r, o, s) {
					var result = frontGridStore.reader.jsonData.success;
					if (!result) {
						formFailureFunction();
					}
				}
			});
			break;

		case 'day':
		case '1st':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			frontGridStore.load({
				callback: function (r, o, s) {
					var result = frontGridStore.reader.jsonData.success;
					if (!result) {
						formFailureFunction();
					}
				}
			});
			break;

		case 'week':
		case '1':
		case '2':
		case '3':
		case '4':
		case '13':
		case '24':
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			frontGridStore.load({
				callback: function (r, o, s) {
					var result = frontGridStore.reader.jsonData.success;
					if (!result) {
						formFailureFunction();
					}
				}
			});
			break;
	}

	var operationModecombo = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO)
	var operationMode = operationModecombo.getValue()

	if ((operationMode == 'off') || (operationMode == 'hardlink') || (scheduleType == 'not_scheduled')) {
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).disable();
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).disable();
	}
	else {
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).enable();
	}

	if (operationMode == 'hardlink') {
		Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).enable();
	}
	else {
		Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).disable();
	}

	beforeSelected_mode = operationMode;
}

function operationModeComboHandler() {
	var combo = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO);
	var mode = combo.getValue();

	if ((mode == 'off') || (mode == 'hardlink')) {
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).disable();
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).disable();
	}
	else {
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).enable();
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
	}

	if (mode == 'hardlink') {
		Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).enable();
		if (!Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).value) {
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).setValue('-1');
		}

		msgBox_usingDictionary('warning_box_title', 'disk_backup_warning_hardlink', Ext.Msg.OK, Ext.MessageBox.WARNING);
	}
	else {
		Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).disable();
	}

	if ((beforeSelected_mode != 'hardlink') && (mode == 'hardlink')) {
		removeGridMember(ID_JOBS_PREFIX_FRONT_GRID, 'all');
	}
	else if ((beforeSelected_mode == 'hardlink') && (mode != 'hardlink')) {
		removeGridMember(ID_JOBS_PREFIX_FRONT_GRID, 'all');
	}

	beforeSelected_mode = mode;
}

function scheduleTypecomboHandler() {
	var scheduleTypecombo = Ext.getCmp(ID_JOBS_PREFIX_JOB_SCHEDULE_COMBO);
	var scheduleType = scheduleTypecombo.getValue();

	var operationModecombo = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO)
	var operationMode = operationModecombo.getValue()

	Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).enable();
	Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).enable();
	Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).enable();
	Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).enable();
	Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).enable();
	Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).enable();
	Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).enable();
	Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
	Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();

	switch (scheduleType) {
		case 'not_scheduled':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).collapse(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).collapse(true);
			break;

		case 'now':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).enable();
			operationModeComboHandler();
			Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).disable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			break;

		case 'day':
		case '1st':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).disable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).clearInvalid();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).enable();
			operationModeComboHandler();
			Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			break;

		case 'week':
		case '1':
		case '2':
		case '3':
		case '4':
		case '13':
		case '24':
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_TIME_COMBO).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO).enable();
			operationModeComboHandler();
			Ext.getCmp(ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
			Ext.getCmp(ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET).expand(true);
			Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID).expand(true);
			break;
	}

	if ((operationMode == 'off') || (operationMode == 'hardlink') || (scheduleType == 'not_scheduled')) {
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).disable();
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).disable();
	}
	else {
		Ext.getCmp(ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX).enable();
		Ext.getCmp(ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX).enable();
	}
}
