var radio_sm_add;

// ここから--> gridの作成/表示
function disk_array_display() {
	Ext.QuickTips.init();

	var columns;
	if (add_iscsi) {
		columns = [{
			id: "arrayName",
			header: S('disk_gridCol_arrayName'),
			dataIndex: 'arrayName',
			renderer: arrayName_renderer
		},
		{
			id: "arrayMode",
			header: S('disk_gridCol_arrayMode'),
			width: 150,
			dataIndex: 'arrayMode',
			renderer: arrayMode_renderer
		},
		{
			id: "arrayStatus",
			header: S('disk_gridCol_arrayStatus'),
			dataIndex: 'arrayStatus',
			renderer: arrayStatus_renderer
		},
		{
			id: "sizeAllRaw",
			header: S('disk_gridCol_sizeAllRaw'),
			dataIndex: 'sizeAllRaw',
			renderer: sizeAllRaw_renderer
		},
		{
			id: "timeStatus",
			header: S('disk_gridCol_timeStatus'),
			dataIndex: 'timeStatus',
			renderer: timeStatus_renderer
		},
		{
			id: "rateStatus",
			header: S('disk_gridCol_rateStatus'),
			dataIndex: 'rateStatus',
			renderer: rateStatus_renderer
		}];
	}
	else {
		columns = [{
			id: "arrayName",
			header: S('disk_gridCol_arrayName'),
			dataIndex: 'arrayName',
			renderer: arrayName_renderer
		},
		{
			id: "arrayMode",
			header: S('disk_gridCol_arrayMode'),
			width: 150,
			dataIndex: 'arrayMode',
			renderer: arrayMode_renderer
		},
/*
		{ id: "diskTotal",
			header: S('disk_gridCol_diskTotal'),
			dataIndex: 'diskTotal'
		},
		{ id: "diskNormal",
			header: S('disk_gridCol_diskNormal'),
			dataIndex: 'diskNormal'
		},
		{ id: "diskError",
			header: S('disk_gridCol_diskError'),
			dataIndex: 'diskError'
		},
		{ id: "diskSpare",
			header: S('disk_gridCol_diskSpare'),
			dataIndex: 'diskSpare'
		},
*/
		{
			id: "arrayStatus",
			header: S('disk_gridCol_arrayStatus'),
			dataIndex: 'arrayStatus',
			renderer: arrayStatus_renderer
		},
		{
			id: "sizeAllRaw",
			header: S('disk_gridCol_sizeAllRaw'),
			dataIndex: 'sizeAllRaw',
			renderer: sizeAllRaw_renderer
		},
		{
			id: "sizeUsedRaw",
			header: S('disk_gridCol_sizeUsedRaw'),
			dataIndex: 'sizeUsedRaw',
			renderer: sizeUsedRaw_renderer
		},
		{
			id: "sizeUsedRate",
			header: S('disk_gridCol_sizeUsedRate'),
			dataIndex: 'sizeUsedRate',
			renderer: sizeUsedRate_renderer
		},
		{
			id: "arrayFormat",
			header: S('disk_gridCol_arrayFormat'),
			dataIndex: 'arrayFormat',
			renderer: arrayFormat_renderer
		},
		{
			id: "timeStatus",
			header: S('disk_gridCol_timeStatus'),
			dataIndex: 'timeStatus',
			renderer: timeStatus_renderer
		},
		{
			id: "rateStatus",
			header: S('disk_gridCol_rateStatus'),
			dataIndex: 'rateStatus',
			renderer: rateStatus_renderer
		}];
	}

	var cm = new Ext.grid.ColumnModel(columns);
	cm.defaultSortable = true;

	// jsonStore
	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ARRAY
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'arrayName'
		},
		{
			name: 'arrayMode'
		},
		{
			name: 'diskTotal'
		},
		{
			name: 'diskNormal'
		},
		{
			name: 'diskError'
		},
		{
			name: 'diskSpare'
		},
		{
			name: 'sizeUsedRaw'
		},
		{
			name: 'sizeUsedRate'
		},
		{
			name: 'sizeAllRaw'
		},
		{
			name: 'arrayFormat'
		},
		{
			name: 'arrayStatus'
		},
		{
			name: 'timeStatus'
		},
		{
			name: 'rateStatus'
		},
		{
			name: 'editMode'
		},
		{
			name: 'canEDP'
		},
		{
			name: 'arrayDiskNum'
		}]
	});

	var jsonStore2 = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ARRAY_MISC_INFO
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'raidfail_shutdown'
		},
		{
			name: 'raidfail_boot_iscsi'
		},
		{
			name: 'shutdown_disable'
		},
		{
			name: 'raid_sync_speed'
		}]
	});

	var shutdownRadio_En = new Ext.form.Radio({
		id: 'shutdownRadio_En',
		hideLabel: true,
		name: 'raidfail_shutdown',
		boxLabel: S('disk_mngt_array_maint_fail_en'),
		inputValue: 'on',
		listeners: {
			check: function (shutdownRadio_En, checked) {
				if (checked) {
					if (add_iscsi) {
						shutdownRadio_Dis.setValue(false);
						bootRadio_En.enable();
						bootRadio_Dis.enable();
					}
				}
			}
		}
	});

	var shutdownRadio_Dis = new Ext.form.Radio({
		id: 'shutdownRadio_Dis',
		hideLabel: true,
		name: 'raidfail_shutdown',
		boxLabel: S('disk_mngt_array_maint_fail_dis'),
		inputValue: 'off',
		listeners: {
			check: function (shutdownRadio_Dis, checked) {
				if (checked) {
					if (add_iscsi) {
						shutdownRadio_En.setValue(false);
						bootRadio_En.disable();
						bootRadio_Dis.disable();
					}
				}
			}
		}
	});

	var bootRadio_En = new Ext.form.Radio({
		id: 'bootRadio_En',
		hideLabel: true,
		name: 'raidfail_boot_iscsi',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (bootRadio_En, checked) {
				if (checked) {
					bootRadio_Dis.setValue(false);
				}
			}
		}
	});

	var bootRadio_Dis = new Ext.form.Radio({
		id: 'bootRadio_Dis',
		hideLabel: true,
		name: 'raidfail_boot_iscsi',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (bootRadio_Dis, checked) {
				if (checked) {
					bootRadio_En.setValue(false);
				}
			}
		}
	});

	var raid_sync_speed_Opt = [
		[S('disk_mngt_array_maint_sync_speed_high'), 'high'],
		[S('disk_mngt_array_maint_sync_speed_middle'), 'middle'],
		[S('disk_mngt_array_maint_sync_speed_low'), 'low']
	];

	var raid_sync_speed_ListStore = new Ext.data.SimpleStore({
		data: raid_sync_speed_Opt,
		fields: ['opt', 'val']
	});

	var raid_sync_speed = new Ext.form.ComboBox({
		id: 'raid_sync_speedCombo',
		hiddenName: 'raid_sync_speed',
		editable: false,
		store: raid_sync_speed_ListStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		width: 100,
		listWidth: 100,
		emptyText: S('data_loading')
	});

	var array_saveBtn = new Ext.Button({
		id: 'array_saveBtn',
		name: 'array_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				array_saveBtnHandler(arrayForm);
			}
		}
	});

	// grid
	var grid = new Ext.grid.GridPanel({
		id: ID_ARRAY_GRID_MAIN,
		store: jsonStore,
		cm: cm,
		width: 640,
		// 高さが指定されてないと、横スクロールバーが表示されない
		height: 150,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true
	});

	jsonStore.load({
		callback: function (r, o, s) {
			var result = jsonStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	jsonStore2.load({
		callback: function (r, o, s) {
			var result = jsonStore2.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
			else {
				if (jsonStore2.reader.jsonData.data[0].raidfail_shutdown == 'on') {
					shutdownRadio_En.setValue(true);
					shutdownRadio_Dis.setValue(false);
				}
				else {
					shutdownRadio_En.setValue(false);
					shutdownRadio_Dis.setValue(true);
				}

				if (jsonStore2.reader.jsonData.data[0].raidfail_boot_iscsi == 'on') {
					bootRadio_En.setValue(true);
					bootRadio_Dis.setValue(false);
				}
				else {
					bootRadio_En.setValue(false);
					bootRadio_Dis.setValue(true);
				}

				if (jsonStore2.reader.jsonData.data[0].shutdown_disable == 'ng') {
					shutdownRadio_En.disable();
					shutdownRadio_Dis.setValue(true);
				}

				raid_sync_speed.setValue(jsonStore2.reader.jsonData.data[0].raid_sync_speed);
			}
		}
	});

	var is_iscsi;
	if (add_iscsi) {
		is_iscsi = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .300,
				html: S('disk_mngt_array_maint_fail_boot') + ":"
			},
			{
				layout: 'form',
				columnWidth: .350,
				items: [bootRadio_En]
			},
			{
				layout: 'form',
				columnWidth: .350,
				items: [bootRadio_Dis]
			}]
		};
	}
	else {
		is_iscsi = {
			layout: 'column',
			cls: 'column-custBorders'
		};
	}

	// フォームの作成
	var arrayForm = new Ext.FormPanel({
		id: ID_FORM_RAID_ARRAY,
		title: S('disk_mngt_array_title'),
		itemsCls: 'panel-custBorders',
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [
		grid,
		{
			layout: 'form',
			cls: 'panel-custBorders',
			items: [{
				autoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .300,
					html: S('disk_mngt_array_maint_fail_label') + ":"
				},
				{
					layout: 'form',
					columnWidth: .350,
					items: [shutdownRadio_En]
				},
				{
					layout: 'form',
					columnWidth: .350,
					items: [shutdownRadio_Dis]
				}]
			},
			is_iscsi,
			{
				autoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .300,
					html: S('disk_mngt_array_maint_sync_speed_label') + ":"
				},
				{
					cls: 'label',
					columnWidth: .20,
					items: [raid_sync_speed]
				}]
			},
			array_saveBtn]
		}],
		animCollapse: false,
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true
	});

	return arrayForm;
}
// <--ここまで gridの作成/表示

function arrayName_renderer(arrayName, p, record) {
	if (arrayName != '') {
		var str;
		if (record.data.editMode != 'none') {
			str = String.format("<b><a href='#' onClick='disk_editArray(\"{0}\", \"{1}\", \"{2}\");'>{0}</a></b>", S(arrayName), arrayName, record.data.editMode);
		}
		else {
			str = String.format("<b>{0}</b>", S(arrayName));
		}

		return str;
	}
}

function arrayMode_renderer(value, p, record) {
	if (record.data.canEDP) {
		var edp_rmm;
		if (add_edp_plus) {
			edp_rmm = 'arrayMode_RMM';
		}
		else {
			edp_rmm = 'arrayMode_EDP';
		}

		return String.format("{0} <b><a href='#' onClick='disk_editArray(\"{2}\", \"{3}\", \"edp\", \"{4}\", \"{5}\");'>{1}</a></b>", S('arrayMode_' + value), S(edp_rmm), S(record.data.arrayName), record.data.arrayName, record.data.arrayMode, record.data.arrayDiskNum);
	}
	else {
		return String.format("{0}", S('arrayMode_' + value));
	}
}

function arrayFormat_renderer(value) {
	if (value != '') {
		return String.format("{0}", S('arrayFormat_' + value));
	}
}

function arrayStatus_renderer(value) {
	if (value != '') {
		return String.format("{0}", S('arrayStatus_' + value));
	}
}

function sizeUsedRaw_renderer(value) {
	if ((value != '') && (value != null)) {
		return String.format("{0}", value + ' ' + S('kb'));
	}
}

function sizeUsedRate_renderer(value) {
	if ((value != '') && (value != null)) {
		return String.format("{0}", value + ' ' + S('percent'));
	}
}

function sizeAllRaw_renderer(value) {
	if ((value != '') && (value != null)) {
		return String.format("{0}", value + ' ' + S('kb'));
	}
}

function timeStatus_renderer(value) {
	if ((value != '') && (value != null)) {
		return String.format("{0}", value + ' ' + S('minute'));
	}
}

function rateStatus_renderer(value) {
	if ((value != '') && (value != null)) {
		return String.format("{0}", value + ' ' + S('percent'));
	}
}

// アレイ名クリックイベント
function disk_editArray(arrayNameDisplay, arrayNameValue, editMode, arrayMode, arrayDiskNum) {
	form_display = Ext.getCmp(ID_FORM_RAID_ARRAY);
	form_display.destroy();

	arrayForm_mode = disk_array_change(arrayNameDisplay, arrayNameValue, editMode, arrayMode, arrayDiskNum);
	insertToCentralContainer(DISKS_RENDER_TO, arrayForm_mode, render_raid_array_before);
}

// アレイ作成/編集/削除フォームの表示
function disk_array_change(arrayNameDisplay, arrayNameValue, mode, arrayMode, arrayDiskNum) {
	var creatableModeStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ARRAY_CREATABLE_MODE
		},
		root: 'data',
		fields: [{
			name: 'mode'
		}],
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function () {
			resetCookie();
		}
	});

	var creatableMode = new Ext.form.ComboBox({
		listeners: {
			collapse: function () {
				if (creatableMode.getValue() == 'raid0') {
					if (sm.getCount() == has_feature_value('MAX_DISK_NUM')) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
				else if (creatableMode.getValue() == 'raid1') {
					if (sm.getCount() == 2) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
				else if (creatableMode.getValue() == 'raid5') {
					if (sm.getCount() >= 3) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
				else if ((creatableMode.getValue() == 'raid10') || (creatableMode.getValue() == 'raid6')) {
					if (sm.getCount() >= 4) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
			}
		},
		name: 'creatableMode',
		hiddenName: 'creatableMode',
		store: creatableModeStore,
		emptyText: S('disk_label_create_array_mode'),
		displayField: 'mode',
		valueField: 'mode',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 100,
		width: 100,
		disabled: true,
		editable: false
	});

	creatableModeStore.load({
		callback: function (r, o, s) {
			var result = creatableModeStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var array_create = new Ext.Button({
		id: 'array_create',
		name: 'array_create',
		disabled: true,
		text: S('disk_btn_array_create'),
		listeners: {
			click: function () {
				selectedRecords = sm.getSelections();
				diskList = new Array();
				for (var i = 0; i < selectedRecords.length; i++) {
					diskList[i] = selectedRecords[i].data.diskName;
				}
				var arrayMode = creatableMode.getValue();
				array_create_(arrayNameValue, arrayMode, diskList);
			}
		}
	});
	if (mode == 'create') {
		creatableMode.enable();
	}

	var array_rebuild = new Ext.Button({
		id: 'array_rebuild',
		name: 'array_rebuild',
		disabled: true,
		text: S('disk_btn_array_rebuild'),
		listeners: {
			click: function () {
				array_rebuild_(arrayNameValue);
			}
		}
	});

	var array_delete = new Ext.Button({
		id: 'array_delete',
		name: 'array_delete',
		disabled: true,
		text: S('disk_btn_array_delete'),
		listeners: {
			click: function () {
				array_delete_(arrayNameValue);
			}
		}
	});

	if ((mode == 'rebuild') || (mode == 'edit')) {
		array_delete.enable();
	}

	var array_edp_normal_raid1_btn;
	if (add_edp_plus) {
		array_edp_normal_raid1_btn = S('disk_btn_array_normal->raid1_rmm');
	}
	else {
		array_edp_normal_raid1_btn = S('disk_btn_array_normal->raid1');
	}

	var array_edp_normal_raid1 = new Ext.Button({
		id: 'array_edp_normal_raid1',
		name: 'array_edp_normal_raid1',
		disabled: true,
		text: array_edp_normal_raid1_btn,
		listeners: {
			click: function () {
				array_edp_button_listener(arrayNameValue, 'raid1');
			}
		}
	});

	var array_edp_raid1_raid1 = new Ext.Button({
		id: 'array_edp_raid1_raid1',
		name: 'array_edp_raid1_raid1',
		disabled: true,
		text: S('disk_btn_array_raid1->raid1'),
		listeners: {
			click: function () {
				array_edp_button_listener(arrayNameValue, 'expansion');
			}
		}
	});

	var array_edp_raid5_raid5 = new Ext.Button({
		id: 'array_edp_raid5_raid5',
		name: 'array_edp_raid5_raid5',
		disabled: true,
		text: S('disk_btn_array_raid5->raid5'),
		listeners: {
			click: function () {
				array_edp_button_listener(arrayNameValue, 'expansion');
			}
		}
	});

	var array_edp_raid1_raid5 = new Ext.Button({
		id: 'array_edp_raid1_raid5',
		name: 'array_edp_raid1_raid5',
		disabled: true,
		text: S('disk_btn_array_raid1->raid5'),
		listeners: {
			click: function () {
				array_edp_button_listener(arrayNameValue, 'raid5');
			}
		}
	});

	var array_cancel = new Ext.Button({
		id: 'array_cancel',
		name: 'array_cancel',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				array_edit_cancelHandler(arrayForm);
			}
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function () {
				if (creatableMode.getValue() == 'raid0') {
					if (sm.getCount() == has_feature_value('MAX_DISK_NUM')) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
				else if (creatableMode.getValue() == 'raid1') {
					if (sm.getCount() == 2) {
						array_create.enable();
					}
					else {
						array_create.disable();
					}
				}
				else if (creatableMode.getValue() == 'raid5') {
					if (sm.getCount() >= 3) {
						array_create.enable();
					}
				}
				else if ((creatableMode.getValue() == 'raid10') || (creatableMode.getValue() == 'raid6')) {
					if (sm.getCount() >= 4) {
						array_create.enable();
					}
				}
			},
			rowdeselect: function () {
				if (creatableMode.getValue() == 'raid0') {
					if (sm.getCount() != has_feature_value('MAX_DISK_NUM')) {
						array_create.disable();
					}
					else {
						array_create.enable();
					}
				}
				else if (creatableMode.getValue() == 'raid1') {
					if (sm.getCount() != 2) {
						array_create.disable();
					}
					else {
						array_create.enable();
					}
				}
				else if (creatableMode.getValue() == 'raid5') {
					if (sm.getCount() < 3) {
						array_create.disable();
					}
				}
				else if ((creatableMode.getValue() == 'raid10') || (creatableMode.getValue() == 'raid6')) {
					if (sm.getCount() < 4) {
						array_create.disable();
					}
				}
			}
		}
	});

	radio_sm_add = new Ext.ux.RadioSelectionModel({
		id: 'radio_sm_add',
		name: 'radio_sm_add',
		singleSelect: true,
		width: 28,
		height: 15,
		listeners: {
			rowselect: function (radio_sm_add, rowIndex, record) {
				if (record.get('diskMode') == 'normal') {
					if (arrayMode == 'off') {
						if (record.get('diskName') != basediskCombo.getValue()) {
							if (basediskCombo.getValue()) {
								Ext.getCmp('array_edp_normal_raid1').enable();
							}
						}
						else {
							Ext.getCmp('array_edp_normal_raid1').disable();
						}
					}
					else if (arrayMode == 'raid1') {
						Ext.getCmp('array_edp_raid1_raid1').enable();
						Ext.getCmp('array_edp_raid1_raid5').enable();
					}
					else if (arrayMode == 'raid5') {
						Ext.getCmp('array_edp_raid5_raid5').enable();
					}
				}
				else {
					if (arrayMode == 'off') {
						Ext.getCmp('array_edp_normal_raid1').disable();
					}
					else if (arrayMode == 'raid1') {
						Ext.getCmp('array_edp_raid1_raid1').disable();
						Ext.getCmp('array_edp_raid1_raid5').disable();
					}
					else if (arrayMode == 'raid5') {
						Ext.getCmp('array_edp_raid5_raid5').disable();
					}
				}
			},
			rowdeselect: function (radio_sm_add, rowIndex, record) {
				if (arrayMode == 'off') {
					Ext.getCmp('array_edp_normal_raid1').disable();
				}
				else if (arrayMode == 'raid1') {
					Ext.getCmp('array_edp_raid1_raid1').disable();
					Ext.getCmp('array_edp_raid1_raid5').disable();
				}
				else if (arrayMode == 'raid5') {
					Ext.getCmp('array_edp_raid5_raid5').disable();
				}
			}
		}
	});

	var basediskStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ARRAY_EDP_BASE_DISK
		},
		root: 'data',
		fields: [{
			name: 'basedisk'
		}],
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function () {
			resetCookie();
		}
	});

	var isHide = true;
	if (arrayMode == 'off') {
		isHide = false;
	}

	var basediskCombo = new Ext.form.ComboBox({
		listeners: {
			select: function (c, r, index) {
				var i;
				for (i = 0; i < jsonStore.getCount(); i++) {
					if (jsonStore.data.items[i].data.diskName == r.data.basedisk) {
						radio_sm_add.lock(i);

						radio_sm_add_count = radio_sm_add.getCount();
						if (radio_sm_add_count) {
							radio_sm_add_selected = radio_sm_add.getSelections();
							if (radio_sm_add_selected[0].data.diskName == r.data.basedisk) {
								Ext.getCmp('array_edp_normal_raid1').disable();
							}
							else if (!radio_sm_add.isLocked()) {
								Ext.getCmp('array_edp_normal_raid1').enable();
							}
						}
					}
					else {
						radio_sm_add.unlock(i);
					}
				}

			}
		},
		id: 'basediskCombo',
		name: 'basedisk',
		hiddenName: 'basedisk',
		store: basediskStore,
		fieldLabel: S('disk_label_array_basedisk'),
		emptyText: S('disk_label_array_basedisk_combobox'),
		displayField: 'basedisk',
		valueField: 'basedisk',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 100,
		width: 100,
		disabled: true,
		editable: false,
		hidden: isHide,
		hideLabel: isHide
	});

	basediskStore.load({
		callback: function (r, o, s) {
			var result = basediskStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
		}
	});

	var selectionModel;
	selectionModel = sm;

	if (mode == 'create') { // 作成
		var cm = new Ext.grid.ColumnModel([
		sm,
		{
			id: "diskName",
			header: S('disk_gridCol_diskName'),
			dataIndex: 'diskName',
			renderer: diskName_renderer
		},
		{
			id: "diskMode",
			header: S('disk_gridCol_diskMode'),
			dataIndex: 'diskMode',
			renderer: diskMode_renderer
		},
		{
			id: "diskModel",
			header: S('disk_gridCol_diskModel'),
			dataIndex: 'diskModel',
			width: 200
		},
		{
			id: "diskSize",
			header: S('disk_gridCol_diskSize'),
			dataIndex: 'diskSize',
			renderer: diskSize_renderer
		}]);
	}
	else if (mode == 'rebuild') { // リビルド
		var cm = new Ext.grid.ColumnModel([{
			id: "diskName",
			header: S('disk_gridCol_diskName'),
			dataIndex: 'diskName',
			renderer: diskName_renderer
		},
		{
			id: "diskMode",
			header: S('disk_gridCol_diskMode'),
			dataIndex: 'diskMode',
			renderer: diskMode_renderer
		},
		{
			id: "diskModel",
			header: S('disk_gridCol_diskModel'),
			dataIndex: 'diskModel',
			width: 200
		},
		{
			id: "diskSize",
			header: S('disk_gridCol_diskSize'),
			dataIndex: 'diskSize',
			renderer: diskSize_renderer
		}]);
	}
	else if (mode == 'edp') { // EDP
		var diskSpareSetHeader = '';
		var diskMode_ModelHidden = false;
		var diskSpareSetWidth = 115;

		if (add_hotSwap) {
			diskSpareSetHeader = S('disk_gridCol_diskSpare');
		}
/*
		if (mode == 'edp') {
			diskSpareSetHeader = S('arrayMode_EDP');
			diskMode_ModelHidden = true;
			diskSpareSetWidth = 440;
		}
*/
		var cm = new Ext.grid.ColumnModel([
		radio_sm_add,
		{
			id: "diskName",
			header: S('disk_gridCol_diskName'),
			dataIndex: 'diskName',
			renderer: diskName_renderer
		},
		{
			id: "diskMode",
			header: S('disk_gridCol_diskMode'),
			dataIndex: 'diskMode',
			renderer: diskMode_renderer,
			hidden: diskMode_ModelHidden
		},
		{
			id: "diskModel",
			header: S('disk_gridCol_diskModel'),
			dataIndex: 'diskModel',
			width: 200,
			hidden: diskMode_ModelHidden
		},
		{
			id: "diskSize",
			header: S('disk_gridCol_diskSize'),
			dataIndex: 'diskSize',
			renderer: diskSize_renderer,
			width: 75
		},
		{
			id: "diskSpareSet",
			header: diskSpareSetHeader,
			renderer: diskSpare_renderer,
			width: diskSpareSetWidth
		}]);

		selectionModel = radio_sm_add;
		cm.setRenderer(0, hideRadio);
	}
	else { // 削除、スペア
		var diskSpareSetHeader = '';
		var diskMode_ModelHidden = false;
		var diskSpareSetWidth = 115;

		if (add_hotSwap) {
			diskSpareSetHeader = S('disk_gridCol_diskSpare');
		}

		var cm = new Ext.grid.ColumnModel([{
			id: "diskName",
			header: S('disk_gridCol_diskName'),
			dataIndex: 'diskName',
			renderer: diskName_renderer
		},
		{
			id: "diskMode",
			header: S('disk_gridCol_diskMode'),
			dataIndex: 'diskMode',
			renderer: diskMode_renderer,
			hidden: diskMode_ModelHidden
		},
		{
			id: "diskModel",
			header: S('disk_gridCol_diskModel'),
			dataIndex: 'diskModel',
			width: 200,
			hidden: diskMode_ModelHidden
		},
		{
			id: "diskSize",
			header: S('disk_gridCol_diskSize'),
			dataIndex: 'diskSize',
			renderer: diskSize_renderer,
			width: 75
		},
		{
			id: "diskSpareSet",
			header: diskSpareSetHeader,
			renderer: diskSpare_renderer,
			width: diskSpareSetWidth
		}]);
	}

	function hideRadio(value, p, record) {
		if ((record.data.diskMode != 'normal') || (!record.data.diskSize)) {
			return '<div class="ux-radio"><input type="radio" name="radio" disabled /></div>';
		}
		return '<div class="ux-radio"><input type="radio" name="radio"/></div>';
	}

	if (mode == 'edp') {
		basediskCombo.enable();
	}

	function diskName_renderer(value) {
		if (value != '') {
			return String.format("{0}", S(value[0]));
		}
	}

	function diskMode_renderer(value) {
		if (value != '') {
			return String.format("{0}", S(value[0]));
		}
	}

	function diskSize_renderer(value) {
		if (value != '') {
			return String.format("{0} " + S('gb'), value);
		}
		return;
	}

	function diskSpare_renderer(diskSpareSet, p, record) {
		if (add_hotSwap) {
			if (diskSpareSet == 'normal') {
				return String.format("<b><a href='#' onClick='volume_erase(\"{1}\")'>{0}</a></b>", S('disk_gridCol_toSpare'), record.data.diskName);
			}
			else if (diskSpareSet == 'standby') {
				return String.format("<b><a href='#' onClick='volume_erase(\"{1}\")'>{0}</a></b>", S('disk_gridCol_toNormal'), record.data.diskName);
			}
			else {
				return;
			}
		}
/*
		else if (record.data.diskBaseEDP == '1') {
			var string;
			var add_disk;

			if (record.data.diskName == 'disk1') {
				string = 'disk_gridCol_EDP_disk1->2';
				add_disk = 'disk2';
			}
			else {
				string = 'disk_gridCol_EDP_disk2->1';
				add_disk = 'disk1';
			}

			return String.format("<b><a href='#' onClick='volume_edp(\"{1}\", \"{2}\", \"{3}\")'>{0}</a></b>", S(string), arrayNameValue, record.data.diskName, add_disk);
		}
*/
		else {
			return;
		}
	}

	cm.defaultSortable = true;

	// jsonStore
	if (mode == 'create') { // 作成
		var jsonStore = new Ext.data.JsonStore({
			root: 'data',
			url: '/dynamic.pl',
			baseParams: {
				bufaction: BUFACT_GET_ARRAY_EDIT_INFO + arrayNameValue
			},
			waitMsg: S('msg_loading_data'),
			fields: [{
				name: 'diskName'
			},
			{
				name: 'diskMode'
			},
			{
				name: 'diskModel'
			},
			{
				name: 'diskSize'
			}]
		});
	}
	else if (mode == 'rebuild') { // リビルド
		var jsonStore = new Ext.data.JsonStore({
			root: 'data',
			url: '/dynamic.pl',
			baseParams: {
				bufaction: BUFACT_GET_ARRAY_REBUILD_INFO + arrayNameValue
			},
			waitMsg: S('msg_loading_data'),
			fields: [{
				name: 'diskName'
			},
			{
				name: 'diskMode'
			},
			{
				name: 'diskModel'
			},
			{
				name: 'diskSize'
			},
			{
				name: 'diskRebuild'
			}]
		});
	}
	else if (mode == 'edp') { // EDP(RMM)
		var jsonStore = new Ext.data.JsonStore({
			root: 'data',
			url: '/dynamic.pl',
			baseParams: {
				bufaction: BUFACT_GET_ARRAY_EDIT_INFO + arrayNameValue + '_rmm'
			},
			waitMsg: S('msg_loading_data'),
			fields: [{
				name: 'diskName'
			},
			{
				name: 'diskMode'
			},
			{
				name: 'diskModel'
			},
			{
				name: 'diskSize'
			},
			{
				name: 'diskSpareSet'
			},
			{
				name: 'diskBaseEDP'
			}]
		});
	}
	else { // それ以外
		var jsonStore = new Ext.data.JsonStore({
			root: 'data',
			url: '/dynamic.pl',
			baseParams: {
				bufaction: BUFACT_GET_ARRAY_EDIT_INFO + arrayNameValue
			},
			waitMsg: S('msg_loading_data'),
			fields: [{
				name: 'diskName'
			},
			{
				name: 'diskMode'
			},
			{
				name: 'diskModel'
			},
			{
				name: 'diskSize'
			},
			{
				name: 'diskSpareSet'
			},
			{
				name: 'diskBaseEDP'
			}]
		});
	}

	// grid
	var grid = new Ext.grid.GridPanel({
		id: ID_ARRAY_GRID_EDIT,
		store: jsonStore,
		sm: selectionModel,
		cm: cm,
		width: 640,
		// 高さが指定されてないと、横スクロールバーが表示されない
		height: 225,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true
	});

	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				if (mode == 'rebuild') {
					var diskRebuild_index = jsonStore.find('diskRebuild', 1);
					if (diskRebuild_index != -1) {
						array_rebuild.enable();
					}
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	var button_array;

	if (arrayMode == 'off') {
		button_array = [
			array_edp_normal_raid1, array_cancel
		];
	}
	else if (arrayMode == 'raid1') {
		if (arrayDiskNum == 2) {
			button_array = [
				array_edp_raid1_raid1, array_edp_raid1_raid5, array_cancel
			];
		}
		else {
			button_array = [
				array_edp_raid1_raid1, array_cancel
			];
		}
	}
	else if (arrayMode == 'raid5') {
		button_array = [
			array_edp_raid5_raid5, array_cancel
		];
	}

	// フォームの作成
	if (mode == 'create') { // 作成
		var arrayForm = new Ext.FormPanel({
			id: ID_FORM_RAID_ARRAY,
			title: S('disk_mngt_array_title') + ' (' + arrayNameDisplay + ')',
			itemsCls: 'panel-custBorders',
			width: 640,
			labelAlign: 'left',
			labelWidth: 120,
			items: [{
				layout: 'form',
				buttonAlign: 'left',
				buttons: [creatableMode, array_create, array_cancel]
			},
			grid],
			animCollapse: false,
			collapsible: true,
			collapseFirst: true,
			titleCollapse: true
		});
	}
	else if (mode == 'rebuild') { // リビルド
		var arrayForm = new Ext.FormPanel({
			id: ID_FORM_RAID_ARRAY,
			title: S('disk_mngt_array_title') + ' (' + arrayNameDisplay + ')',
			itemsCls: 'panel-custBorders',
			width: 640,
			labelAlign: 'left',
			labelWidth: 120,
			items: [{
				layout: 'form',
				buttonAlign: 'left',
				buttons: [array_rebuild, array_delete, array_cancel]
			},
			grid],
			animCollapse: false,
			collapsible: true,
			collapseFirst: true,
			titleCollapse: true
		});
	}
	else if (mode == 'edp') { // EDP
		var arrayForm = new Ext.FormPanel({
			id: ID_FORM_RAID_ARRAY,
			title: S('disk_mngt_array_title') + ' (' + arrayNameDisplay + ')',
			width: 640,
			labelAlign: 'left',
			labelWidth: 200,
			items: [{
				layout: 'form',
				cls: 'panel-custBorders',
				items: [basediskCombo],
				buttonAlign: 'left',
				buttons: button_array
			},
			grid],
			animCollapse: false,
			collapsible: true,
			collapseFirst: true,
			titleCollapse: true
		});
	}
	else { // 削除、スペア
		var arrayForm = new Ext.FormPanel({
			id: ID_FORM_RAID_ARRAY,
			title: S('disk_mngt_array_title') + ' (' + arrayNameDisplay + ')',
			itemsCls: 'panel-custBorders',
			width: 640,
			labelAlign: 'left',
			labelWidth: 120,
			items: [{
				layout: 'form',
				buttonAlign: 'left',
				buttons: [array_delete, array_cancel]
			},
			grid],
			animCollapse: false,
			collapsible: true,
			collapseFirst: true,
			titleCollapse: true
		});
	}

	return arrayForm;
}

function array_edp_button_listener(arrayNameValue, nextMode) {
	var baseDisk = Ext.getCmp('basediskCombo');
	var baseDiskValue = baseDisk.getValue();

	selectedRecords = radio_sm_add.getSelections();
	for (var i = 0; i < selectedRecords.length; i++) {
		addDiskValue = selectedRecords[i].data.diskName;
	}

	volume_edp(arrayNameValue, baseDiskValue, addDiskValue, nextMode)
}

// キャンセルボタン押下
function array_edit_cancelHandler(editForm) {
	editForm.destroy();
	displayGridForm = disk_array_display();
	insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, render_raid_array_before);
	displayGridForm.expand(false);
}

function array_delete_(arrayName) {
	var warning_title = S('warning') + '<br>';
	var warning_msg = S('disk_mngt_array_change_note_1');

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_array_change_note_2') + ' <b>' + arrayName + '</b>' + S('question_mark');

	var delete_btn = new Ext.Button({
		id: 'delete_btn',
		name: 'delete_btn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				confirmWindow.close();
				volume_deleteBtnHandler(arrayName);
			}
		}
	});

	var delete_cancel_btn = new Ext.Button({
		id: 'delete_cancel_btn',
		name: 'delete_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_ARRAY_OPARATION_WIN + '" class="x-hidden"></div>',
		id: ID_ARRAY_OPERATION_DISK_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_array_change'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [delete_btn, delete_cancel_btn]
	});

	confirmWindow.show();
}

function volume_deleteBtnHandler(arrayName) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			volume_delete_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName);
		}
	});
}

function volume_delete_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName) {
	var title = S('disk_mngt_array_change');
	var instruction = S('disk_mngt_array_change_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				volume_delete_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function volume_delete_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'array',
			gMode: 'delete',
			target: arrayName
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			if (success) {
				resetCookie();

				var msg = S('disk_mngt_array_deleting');
				msg += ' ' + arrayName;
				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								volume_deleteBtnHandler(arrayName);
							}
						}
					});
				}
			}
		}
	});
}

function array_rebuild_(arrayName) {
	var warning_title = S('warning') + '<br>';
	var warning_msg = S('disk_mngt_array_rebuild_note_1');

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_array_rebuild_note_2') + ' <b>' + arrayName + '</b>' + S('question_mark');

	var delete_btn = new Ext.Button({
		id: 'delete_btn',
		name: 'delete_btn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				confirmWindow.close();
				array_rebuildBtnHandler(arrayName);
			}
		}
	});

	var delete_cancel_btn = new Ext.Button({
		id: 'delete_cancel_btn',
		name: 'delete_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();

			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_ARRAY_OPARATION_WIN + '" class="x-hidden"></div>',
		id: ID_ARRAY_OPERATION_DISK_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_array_change'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [delete_btn, delete_cancel_btn]
	});

	confirmWindow.show();
}

function array_rebuildBtnHandler(arrayName) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			array_rebuild_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName);
		}
	});
}

function array_rebuild_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName) {
	var title = S('disk_mngt_array_change');
	var instruction = S('disk_mngt_array_change_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				array_rebuild_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();

			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function array_rebuild_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	var msg2 = S('msg_saving_data');
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'array',
			gMode: 'rebuild',
			target: arrayName
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var success = response.success;
			if (success) {
				resetCookie();

				var msg = S('disk_mngt_array_rebuilding');
				msg += ' ' + arrayName;

				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								array_rebuildBtnHandler(arrayName);
							}
						}
					});
				}
			}
		}
	});
}

function volume_erase(diskName) {
	var warning_title = S('warning') + '<br>';
	var warning_msg = S('disk_mngt_array_change_note_1');

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_array_change_note_2') + ' <b>' + diskName + '</b>' + S('question_mark');

	var erase_btn = new Ext.Button({
		id: 'erase_btn',
		name: 'erase_btn',
		text: S('btn_erase'),
		listeners: {
			click: function () {
				confirmWindow.close();
				volume_eraseBtnHandler(diskName);
			}
		}
	});

	var erase_cancel_btn = new Ext.Button({
		id: 'erase_cancel_btn',
		name: 'erase_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_ARRAY_OPARATION_WIN + '" class="x-hidden"></div>',
		id: ID_ARRAY_OPERATION_DISK_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_array_change'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [erase_btn, erase_cancel_btn]
	});

	confirmWindow.show();
}

function volume_eraseBtnHandler(volumeName) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			volume_erase_get_gate(hiddenGateLockTime, hiddenGateLockNumber, volumeName);
		}
	});
}

function volume_erase_get_gate(hiddenGateLockTime, hiddenGateLockNumber, volumeName) {
	var title = S('disk_mngt_array_change');
	var instruction = S('disk_mngt_array_change_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				volume_erase_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, volumeName);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function volume_erase_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, volumeName) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	var msg2 = S('msg_saving_data');
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'array',
			gMode: 'spare',
			target: volumeName
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			var success = response.success;
			if (success) {
				resetCookie();

				var msg = S('disk_mngt_erasing');
				msg += ' ' + volumeName;

				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								volume_eraseBtnHandler(volumeName);
							}
						}
					});
				}
			}
		}
	});
}

function array_create_(arrayName, arrayMode, diskList) {
	var warning_title = S('warning') + '<br>';
	var warning_msg = S('disk_mngt_array_change_note_1');

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_array_change_note_2') + ' <b>' + diskList + '</b>' + S('question_mark');

	var delete_btn = new Ext.Button({
		id: 'delete_btn',
		name: 'delete_btn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				confirmWindow.close();
				array_createBtnHandler(arrayName, arrayMode, diskList);
			}
		}
	});

	var delete_cancel_btn = new Ext.Button({
		id: 'delete_cancel_btn',
		name: 'delete_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_ARRAY_OPARATION_WIN + '" class="x-hidden"></div>',
		id: ID_ARRAY_OPERATION_DISK_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_array_change'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [delete_btn, delete_cancel_btn]
	})

	confirmWindow.show();
}

function array_createBtnHandler(arrayName, arrayMode, diskList) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			array_create_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName, arrayMode, diskList);
		}
	});
}

function array_create_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayName, arrayMode, diskList) {
	var title = S('disk_mngt_array_change');
	var instruction = S('disk_mngt_array_change_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				array_create_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName, arrayMode, diskList);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();

			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function array_create_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayName, arrayMode, diskList) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	var msg2 = S('msg_saving_data');
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'array',
			gMode: 'create',
			array: arrayName,
			mode: arrayMode,
			disk: diskList
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var success = response.success;
			if (success) {
				resetCookie();

				var msg = S('disk_mngt_array_creating');
				msg += ' ' + arrayName;

				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								array_createBtnHandler(arrayName, arrayMode, diskList);
							}
						}
					});
				}
			}
		}
	});
}

// -> EDP ここから
function volume_edp(arrayValue, baseDiskValue, addDiskValue, nextMode) {
	var warning_title = S('warning') + '<br>';
	var warning_msg;
	var edp_rmm_btn_text;

	if (add_edp_plus) {
		warning_msg = S('disk_mngt_array_rmm_note_1');
		edp_rmm_btn_text = S('btn_rmm')
	}
	else {
		warning_msg = S('disk_mngt_array_edp_note_1');
		edp_rmm_btn_text = S('btn_edp')
	}

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_array_change_note_2') + ' <b>' + addDiskValue + '</b>' + S('question_mark');

	var edp_btn = new Ext.Button({
		id: 'edp_btn',
		name: 'edp_btn',
		text: edp_rmm_btn_text,
		listeners: {
			click: function () {
				confirmWindow.close();
				volume_edpBtnHandler(arrayValue, baseDiskValue, addDiskValue, nextMode);
			}
		}
	});

	var edp_cancel_btn = new Ext.Button({
		id: 'edp_cancel_btn',
		name: 'edp_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_ARRAY_OPARATION_WIN + '" class="x-hidden"></div>',
		id: ID_ARRAY_OPERATION_DISK_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_array_change'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [edp_btn, edp_cancel_btn]
	});

	confirmWindow.show();
}

function volume_edpBtnHandler(arrayValue, baseDiskValue, addDiskValue, nextMode) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img" src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img" src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			volume_edp_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayValue, baseDiskValue, addDiskValue, nextMode);
		}
	});
}

function volume_edp_get_gate(hiddenGateLockTime, hiddenGateLockNumber, arrayValue, baseDiskValue, addDiskValue, nextMode) {
	var title = S('disk_mngt_array_change');
	var instruction = S('disk_mngt_array_change_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gateNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				volume_edp_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayValue, baseDiskValue, addDiskValue, nextMode);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function volume_edp_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, arrayValue, baseDiskValue, addDiskValue, nextMode) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	var msg2 = S('msg_saving_data');
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'array',
			gMode: 'edp',
			targetArray: arrayValue,
			baseDisk: baseDiskValue,
			addDisk: addDiskValue,
			nextMode: nextMode
		},
		method: 'POST',
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			var success = response.success;
			if (success) {
				resetCookie();

				var msg;
				if (add_edp_plus) {
					msg = S('disk_mngt_array_rmm_setting');
				}
				else {
					msg = S('disk_mngt_array_edp_setting');
				}

				msg += ' ' + arrayValue;

				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								volume_edpBtnHandler(arrayValue, baseDiskValue, addDiskValue, nextMode);
							}
						}
					});
				}
			}
		}
	});
}
// <- EDP ここまで

function array_saveBtnHandler(arrayForm) {
	arrayForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_ARRAY_MISC_INFO
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
