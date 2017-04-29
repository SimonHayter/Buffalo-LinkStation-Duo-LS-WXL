function jobs_addGrid(id) {
	// variables for backup folders grid used in Backup folders fieldset
	var sm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function () {
				remBtn.enable();
			},
			rowdeselect: function () {
				if (sm.getCount() == 0) {
					remBtn.disable();
				}
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
		sm, {
			header: S('disk_backup_sourceFolders'),
			dataIndex: 'sourceView',
			width: 280
		},
		{
			header: S('disk_backup_targetFolders'),
			dataIndex: 'targetView',
			width: 280
		},
		{
			dataIndex: 'sourceVal',
			hidden: true
		},
		{
			dataIndex: 'targetVal',
			hidden: true
		}
	]);

	var frontGridStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_BACKUP_FOLDERS + id
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function () {
			resetCookie();
		},
		fields: [{
			name: 'sourceView'
		},
		{
			name: 'targetView'
		},
		{
			name: 'sourceVal'
		},
		{
			name: 'targetVal'
		}]
	});

	// buttons for Backup folders fieldset
	var addBtn = new Ext.Button({
		name: 'AddBtn',
		text: S('btn_add'),
		iconCls: 'add',
		handler: function () {
			jobs_addMemberPopup();
		}
	});

	var remBtn = new Ext.Button({
		name: 'RemBtn',
		text: S('btn_remove'),
		iconCls: 'delete',
		disabled: true,
		handler: function () {
			removeGridMember(ID_JOBS_PREFIX_FRONT_GRID);
			if (sm.getCount() == 0) {
				remBtn.disable();
			}
		}
	});

	// grid for Backup folders fieldset
	var frontGrid = new Ext.grid.GridPanel({
		id: ID_JOBS_PREFIX_FRONT_GRID,
		title: S('disk_backup_gridTitle'),
		store: frontGridStore,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 300,
		frame: true,
		tbar: [
			addBtn,
			'-',
			remBtn
		],
		collapsed: true,
		animCollapse: true,
		enableColumnMove: false,
		stripeRows: true
	});

	return frontGrid;
}

function jobs_addMemberPopup() {
	var addMemberWin = Ext.getCmp(ID_JOBS_PREFIX_MEMBER_POPUP_WIN);

	if (addMemberWin == undefined) {
		var popupPanel = jobs_createPopupForm();
		addMemberWin = new Ext.Window({
			html: '<div id="' + DIV_MEMBER + 'style="width:450px" class="x-hidden"></div>',
			id: ID_JOBS_PREFIX_MEMBER_POPUP_WIN,
			modal: true,
			resizable: false,
			draggable: false,
			style: 'window',
			width: 600,
			title: S('disk_backup_srcDst_winTitle'),
			plain: true,
			items: [popupPanel],
			buttons: [{
				text: S('btn_add'),
				id: 'add_btn_popup',
				disabled: true,
				handler: function () {
					var error = jobs_submitPopupHandler(ID_JOBS_PREFIX_FRONT_GRID, ID_JOBS_PREFIX_SOURCE_COMBO, ID_JOBS_PREFIX_TARGET_COMBO);
					if (!error) {
						addMemberWin.close();
					}
				}
			},
			{
				id: 'close_btn_popup',
				text: S('btn_close'),
				handler: function () {
					addMemberWin.close();
				}
			}]
		});
		addMemberWin.show(addMemberWin);
	}
	else {
		addMemberWin.show(addMemberWin, function () {});
	}
}

function jobs_createPopupForm() {
	var bufaction_src;
	var bufaction_dst;

	var backupmodeCombo;
	backupmodeCombo = Ext.getCmp(ID_JOBS_PREFIX_BACKUP_MODE_COMBO);

	bufaction_src = BUFACT_GET_BACKUP_SOURCES;
	if (backupmodeCombo.value == 'hardlink') {
		bufaction_dst = BUFACT_GET_BACKUP_HARDLINK_TARGETS;
	}
	else {
		bufaction_dst = BUFACT_GET_BACKUP_TARGETS;
	}

	var backupSourceStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: bufaction_src
		},
		root: 'data',
		fields: [{
			name: 'val'
		},
		{
			name: 'opt'
		}],
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function () {
			resetCookie();
		}
	});

	var backupSources = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_SOURCE_COMBO,
		name: 'backupSources',
		hideLabel: true,
		store: backupSourceStore,
		displayField: 'opt',
		valueField: 'val',
		emptyText: S('data_loading'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 280,
		width: 280,
		disabled: true,
		editable: false
	});

	var backupTargetStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: bufaction_dst
		},
		root: 'data',
		fields: [{
			name: 'val'
		},
		{
			name: 'opt'
		}],
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function () {
			resetCookie();
		}
	});

	var backupTargets = new Ext.form.ComboBox({
		id: ID_JOBS_PREFIX_TARGET_COMBO,
		name: 'backupTargets',
		hideLabel: true,
		store: backupTargetStore,
		displayField: 'opt',
		valueField: 'val',
		emptyText: S('data_loading'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 280,
		width: 280,
		disabled: true,
		editable: false
	});

	backupSourceStore.load({
		callback: function () {
			var win = Ext.getCmp(ID_JOBS_PREFIX_MEMBER_POPUP_WIN);
			if (win) {
				var result = backupSourceStore.reader.jsonData.success;
				if (result) {
					var or_source = {
						emptyText: S('disk_backup_sourceFolders')
					};
					Ext.apply(backupSources, or_source);
					backupSources.setValue(null);
					backupSources.enable();
				}
				else {
					formFailureFunction();
				}
			}
		}
	});

	backupTargetStore.load({
		callback: function () {
			var win = Ext.getCmp(ID_JOBS_PREFIX_MEMBER_POPUP_WIN);
			if (win) {
				var result = backupTargetStore.reader.jsonData.success;
				if (result) {
					var or_target = {
						emptyText: S('disk_backup_targetFolders')
					};
					Ext.apply(backupTargets, or_target);
					backupTargets.setValue(null);
					backupTargets.enable();
					Ext.getCmp('add_btn_popup').enable();
				}
				else {
					formFailureFunction();
				}
			}
		}
	});

	var addForm = new Ext.FormPanel({
		hideTitle: true,
		frame: true,
		id: ID_JOBS_PREFIX_MEMBER_POPUP_FORM,
		autoWidth: true,
		autoHeight: true,
		items: [{
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .50,
				items: [backupSources]
			},
			{
				layout: 'form',
				columnWidth: .50,
				items: [backupTargets]
			}]
		}]
	});

	return addForm;
}

function jobs_submitPopupHandler(frontGridId, sourceComboId, targetComboId) {
	var found = false;

	var sourceCombo = Ext.getCmp(sourceComboId);
	var targetCombo = Ext.getCmp(targetComboId);

	var source = sourceCombo.getValue();
	var target = targetCombo.getValue();

	if (source == '' || target == '') {
		msgBox_usingDictionary('error_box_title', 'disk_backup_ui_4', Ext.MessageBox.OK, Ext.MessageBox.ERROR);
		return true;
	}

	// .: update front grid :.
	var frontGrid = Ext.getCmp(frontGridId); //  get front Grid object
	var jsonStore = frontGrid.getStore(); //  get front json store object

	// check if the record already exist in the grid
	recordsToCheck = jsonStore.query('sourceView', source);

	for (var i = 0; i < recordsToCheck.length; i++) {
		record = recordsToCheck.get(i);
		gridTarget = record.get('targetView');

		if (gridTarget == target) {
			found = true;
			break;
		}
	}

	if (!found) {
		var recordTemplate = Ext.data.Record.create([{
			name: 'sourceView'
		},
		{
			name: 'targetView'
		},
		{
			name: 'sourceVal'
		},
		{
			name: 'targetVal'
		}]);

		var sourceDisplayed_val = sourceCombo.getRawValue();
		var targetDisplayed_val = targetCombo.getRawValue();

		var newRecord = new recordTemplate({
			sourceVal: source,
			targetVal: target,
			sourceView: sourceDisplayed_val,
			targetView: targetDisplayed_val
		});

		jsonStore.add(newRecord);
	}
	else {
		msgBox_usingDictionary('Error', 'disk_backup_ui_3', Ext.MessageBox.OK, Ext.MessageBox.ERROR);
	}

	return found;
}
