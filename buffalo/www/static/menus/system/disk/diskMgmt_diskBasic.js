function disk_createStatusGrid() {
	var check_disk_btn = new Ext.Button({
		id: 'check_disk_btn',
		name: 'check_disk_btn',
		text: S('disk_mngt_check_disk'),
		listeners: {
			click: function() {
				var selectedRecords = sm.getSelections();
				if (selectedRecords.length == 0) {
					var msg = 'disk_mngt_check_select_disks';
					var buttons = Ext.MessageBox.OK;
					var title = 'error_box_title';
					var icon = Ext.MessageBox.ERROR;
					msgBox_usingDictionary(title, msg, buttons, icon);
				}
				else {
					// only one can be selected at a time
					var diskName = selectedRecords[0].get('disk');
					disk_check(diskName);
				}
			}
		}
	});

	var format_disk_btn = new Ext.Button({
		id: 'format_disk_btn',
		name: 'format_disk_btn',
		text: S('disk_mngt_format_disk'),
		listeners: {
			click: function() {
				var selectedRecords = sm.getSelections();
				if (selectedRecords.length == 0) {
					var msg = 'disk_mngt_format_select_disks';
					var buttons = Ext.MessageBox.OK;
					var title = 'error_box_title';
					var icon = Ext.MessageBox.ERROR;
					msgBox_usingDictionary(title, msg, buttons, icon);
				}
				else {
					// only one can be selected at a time
					var diskName = selectedRecords[0].get('disk');
					var diskMode = selectedRecords[0].get('status');
					var over2tb = selectedRecords[0].get('over2tb');
					disk_format(diskName, diskMode, over2tb);
				}
			}
		}
	});

	var remove_assignment_btn = new Ext.Button({
		id: 'remove_assignment_btn',
		name: 'remove_assignment_btn',
		disabled: true,
		text: S('disk_mngt_remove_assignment'),
		listeners: {
			click: function() {
				var selectedRecords = sm.getSelections();
				if (selectedRecords.length == 0) {
					var msg = 'disk_mngt_remove_select_disks';
					var buttons = Ext.MessageBox.OK;
					var title = 'error_box_title';
					var icon = Ext.MessageBox.ERROR;
					msgBox_usingDictionary(title, msg, buttons, icon);
				}
				else {
					// only one can be selected at a time
					var diskName = selectedRecords[0].get('disk');
					disk_removalBtnHandler(diskName);
				}
			}
		}
	});

	var wakeup_disk_btn = new Ext.Button({
		id: 'wakeup_disk_btn',
		name: 'wakeup_disk_btn',
		disabled: true,
		text: S('disk_mngt_wakeup_disk'),
		listeners: {
			click: function() {
				var selectedRecords = sm.getSelections();
				if (selectedRecords.length == 0) {
					var msg = 'disk_mngt_remove_select_disks';
					var buttons = Ext.MessageBox.OK;
					var title = 'error_box_title';
					var icon = Ext.MessageBox.ERROR;
					msgBox_usingDictionary(title, msg, buttons, icon);
				}
				else {
					// only one can be selected at a time
					var diskName = selectedRecords[0].get('disk');
					execute_wakeup(diskName);
					wakeup_disk_btn.disable();
				}
			}
		}
	});

	var sm = new Ext.ux.RadioSelectionModel({
		singleSelect: true,
		width: 28,
		height: 15,
		listeners: {
			rowselect: function(sm, rowIndex, record) {
				var diskSelected = record.get('disk');
				var canFormat = record.get('canFormat');
				var canRemove = record.get('canRemove');
				var canWakeup = record.get('canWakeup');
				var regExp = /^usb.*/;
				var isUsb = diskSelected.search(regExp);

				// USB
				if (isUsb != -1) {
					if (canRemove == 1) {
						Ext.getCmp('remove_assignment_btn').enable();
					}
					else {
						Ext.getCmp('remove_assignment_btn').disable();
					}

					if (canFormat == 1) {
						check_disk_btn.enable();
						format_disk_btn.enable();
					}
					else if (canFormat == 2) {
						check_disk_btn.disable();
						format_disk_btn.enable();
					}
					else {
						check_disk_btn.disable();
						format_disk_btn.disable();
					}
				}
				// Internal Disk
				else {
					if (canFormat == 1) {
						check_disk_btn.enable();
						format_disk_btn.enable();
					}	
					else if (canFormat == 2) {
						check_disk_btn.disable();
						format_disk_btn.enable();
					}
					else {
						check_disk_btn.disable();
						format_disk_btn.disable();
					}

					if (add_raid && (canRemove == 1)) {
						Ext.getCmp('remove_assignment_btn').enable();
					}
					else {
						Ext.getCmp('remove_assignment_btn').disable();
					}

					if (canWakeup == 1) {
						Ext.getCmp('wakeup_disk_btn').enable();
					}
					else {
						Ext.getCmp('wakeup_disk_btn').disable();
					}
				}
			},
			rowdeselect: function(sm, rowIndex, record) {
				Ext.getCmp('remove_assignment_btn').disable();
			}
		}
	});

	var columns;

	if (add_iscsi) {
		columns = [sm, {
			id: "disk",
			header: S('disk_gridCol_disk'),
			dataIndex: "disk",
			direction: "ASC",
			renderer: disk_renderDiskName
		},
		{
			id: "status",
			header: S('disk_gridCol_status'),
			dataIndex: "status",
			width: 140,
			renderer: disk_renderStatus
		},
		{
			id: "encryp",
			header: S('disk_gridCol_encryp'),
			dataIndex: "encryp",
			width: 70,
			renderer: disk_renderEncryp
		},
		{
			id: "unitName",
			header: S('disk_gridCol_unitName'),
			dataIndex: "unitName",
			width: 125
		},
		{
			dataIndex: 'canFormat',
			hidden: true
		},
		{
			dataIndex: 'canRemove',
			hidden: true
		},
		{
			dataIndex: 'canWakeup',
			hidden: true
		}];
	}
	else {
		columns =[sm, {
			id: "disk",
			header: S('disk_gridCol_disk'),
			dataIndex: "disk",
			direction: "ASC",
			renderer: disk_renderDiskName
		},
		{
			id: "status",
			header: S('disk_gridCol_status'),
			dataIndex: "status",
			width: 140,
			renderer: disk_renderStatus
		},
		{
			id: "encryp",
			header: S('disk_gridCol_encryp'),
			dataIndex: "encryp",
			width: 70,
			renderer: disk_renderEncryp
		},
		{
			id: "unitName",
			header: S('disk_gridCol_unitName'),
			dataIndex: "unitName",
			width: 125
		},
		{
			id: "capacity",
			header: S('disk_gridCol_capacity'),
			dataIndex: 'capacity'
		},
		{
			id: "amountUsed",
			header: S('disk_gridCol_amountUsed'),
			dataIndex: 'amountUsed'
		},
		{
			id: "percentUsed",
			header: S('disk_gridCol_percentUsed'),
			dataIndex: 'percentUsed',
			width: 60
		},
		{
			id: "fileFormat",
			header: S('disk_gridCol_fileFormat'),
			dataIndex: 'fileFormat'
		},
		{
			id: "manufacturer",
			header: S('disk_gridCol_manufacturer'),
			dataIndex: 'manufacturer',
			renderer: disk_renderManufacturer
		},
		{
			id: "modelName",
			header: S('disk_gridCol_modelName'),
			dataIndex: 'modelName',
			renderer: disk_renderModelName
		},
		{
			dataIndex: 'canFormat',
			hidden: true
		},
		{
			dataIndex: 'canRemove',
			hidden: true
		},
		{
			dataIndex: 'canWakeup',
			hidden: true
		},
		{
			dataIndex: 'over2tb',
			hidden: true
		}];
	}
	var cm = new Ext.grid.ColumnModel(columns);

	cm.defaultSortable = true;
	cm.setRenderer(0, hideRadio);

	function hideRadio(value, p, record) {
		if (record.data.status == 'disconnect') {
			return '<div class="ux-radio"><input type="radio" name="radio" disabled /></div>';
		}
		return '<div class="ux-radio"><input type="radio" name="radio"/></div>';
	}

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_DISKS
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'disk'
		},
		{
			name: 'lvm'
		},
		{
			name: 'status'
		},
		{
			name: 'encryp'
		},
		{
			name: 'unitName'
		},
		{
			name: 'capacity'
		},
		{
			name: 'amountUsed'
		},
		{
			name: 'percentUsed'
		},
		{
			name: 'fileFormat'
		},
		{
			name: 'manufacturer'
		},
		{
			name: 'modelName'
		},
		{
			name: 'canFormat'
		},
		{
			name: 'canRemove'
		},
		{
			name: 'canWakeup'
		},
		{
			name: 'over2tb'
		}]
	});

	var diskView = new Ext.grid.GridView({
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_CHECK_DISK_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 300,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true,
		view: diskView
	});

	var buttons;
	if (add_iscsi) {
		buttons = [
			format_disk_btn,
			remove_assignment_btn,
			wakeup_disk_btn
		];
	}
	else {
		buttons = [
			check_disk_btn,
			format_disk_btn,
			remove_assignment_btn,
			wakeup_disk_btn
		];
	}

	var diskForm = new Ext.FormPanel({
		id: ID_DISK_EDITABLE_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [{
			buttonAlign: 'left',
			buttons: buttons
		},
		grid],
		title: S('disk_mngt_title'),
		animCollapse: false,
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true
	});

	if (!add_encrypt) {
		var encryptColumnIndex = cm.getIndexById('encryp');
		cm.setHidden(encryptColumnIndex, true);
	}

	return diskForm;
}

function createProgressWin(text) {
	var progressBar = new Ext.ProgressBar({
		id: ID_DISK_PROGRESS_BAR,
		text: text,
		height: 50
	});

	var progressWin = new Ext.Window({
		html: '<div id="' + DIV_PROGRESS_BAR + '" class="x-hidden"></div>',
		id: ID_PROGRESS_WIN,
		closable: false,
		collapsible: false,
		draggable: false,
		resizable: false,
		autoDestroy: false,
		layout: "fit",
		width: 400,
		plain: true,
		modal: true,
		items: progressBar,
		listeners: {
			"hide": function() {
				if (progressBar.rendered && progressBar.isWaiting()) progressBar.reset();
			},
			"show": function() {
				if (progressBar.rendered && !progressBar.isWaiting()) {
					progressBar.wait({
						increment: 150
					});
				}
			}
		}
	});

	return progressWin;
}

function disk_renderDiskName(value) {
	return S(value);
}

function disk_renderManufacturer(manufacturer, record) {
	if (manufacturer) return manufacturer;
	var val = S('notAvailable');
	return val;
}

function disk_renderModelName(modelName, record) {
	if (modelName) return modelName;
	else {
		var val = S('notAvailable');
		return val;
	}
}

function disk_renderStatus(value) {
	if ((add_edp_plus) && (value == 'normal_edp')) {
		return S('normal_rmm');
	}
	else if (value) {
		return S(value);
	}
	else {
		return ('-');
	}
}

// <<< -------------------------- DISK CHECK	-------------------------- >>>	
function disk_check(diskName) {
	var nextBackupTime;
	var timeUnit; // h (hour) or m (minutes)

	var title = S('disk_mngt_check_forErrors_1');
	title += ' ';
	title += '<b>' + diskName + '</b>';
	title += ' ';
	title += S('disk_mngt_check_forErrors_2');

//	var url = document.domain;

	var note = '<b><i>' + S('disk_mngt_check_disk_note_1') + '</i></b>';
	note += S('disk_mngt_check_disk_note_2');
	note += S('disk_mngt_check_disk_note_3');
	note += S('disk_mngt_check_disk_note_4');
	note += S('disk_mngt_check_disk_note_5');
//	note += '<a href="http://'+ url +':' + PORT +'/static/root.html" onLoad="system_jobs_processAuth();" target="_blank">View Scheduled Backups</a>';

	var delMacFiles = new Ext.form.Checkbox({
		id: ID_CHECK_DISK_WIN_DEL_MAC_FILES_CHKBOX,
		name: 'delMacFiles',
		boxLabel: S('disk_mngt_check_disk_delMacOs'),
		hideLabel: true
	});

	var chk_check_btn = new Ext.Button({
		id: 'chk_check_btn',
		name: 'chk_check_btn',
		text: S('btn_check'),
		listeners: {
			click: function() {
				var delMac;
				if (delMacFiles.getValue()) {
					delMac = 'on';
				}
				else {
					delMac = 'off';
				}
				chk_check_btn.disable();
				execute_check(diskName, delMac);
			}
		}
	});

	var chk_cancel_btn = new Ext.Button({
		id: 'chk_cancel_btn',
		name: 'chk_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function() { // close window
				var win = Ext.getCmp(ID_CHECK_DISK_WIN);
				win.hide();
				win.destroy();
				var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
				var jsonStore = shareGrid.getStore();
				chk_cancel_btn.disable();
				selModel = shareGrid.getSelectionModel();
//				selModel.clearSelections();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_CHECK_WIN + '" class="x-hidden"></div>',
		id: ID_CHECK_DISK_WIN,
		modal: true,
		width: 600,
		height: 250,
		title: S('disk_mngt_check_disk'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="label">' + title + '</p><br>'
		},
		delMacFiles, {
			xtype: 'label',
			html: '<br><p class="label">' + note + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [chk_check_btn, chk_cancel_btn]
	});

	confirmWindow.show();
}

function execute_check(diskName, delMac) { // remove confirmation window
	var win = Ext.getCmp(ID_CHECK_DISK_WIN);
	win.hide();
	win.destroy(); // start progress bar
	var msg = S('disk_mngt_checking');
	msg += ' ' + diskName;
//	var progressWin = createProgressWin(msg);
//	progressWin.show();
	Ext.MessageBox.wait(msg);

	// here, an ajax request was used because a form was not created in the popup window, therefore, the form.load() method cannot be used.
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkDisk',
			target: diskName,
			delMac: delMac
		},
		method: 'POST',
		success: function(result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;

			if (success) {
				resetCookie();
				request_operation();
//				is_checked(diskName);
//				Ext.MessageBox.updateProgress(1);
//				Ext.MessageBox.hide();
			}
			else {
				formFailureFunction();
			}
		},
		failure: function() {
			request_operation();
//			Ext.MessageBox.updateProgress(1);
//			Ext.MessageBox.hide();
		}
	});
}

/*
function is_checked(diskName) {
	var progressWin = Ext.getCmp(ID_PROGRESS_WIN);
	var progressBar = Ext.getCmp(ID_DISK_PROGRESS_BAR);

	// here, an ajax request was used because a form was not created in the popup window, therefore, the form.load() method cannot be used.
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_CHECK_STATUS
		},
		method: 'POST',
		success: function (result) {

			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();

				if (response.data[0].status == 1) {
					progressWin.hide();
					progressWin.destroy();
					var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
					var jsonStore = shareGrid.getStore();
					selModel = shareGrid.getSelectionModel();
//					selModel.clearSelections();

					var msg = '<b>' + diskName + '</b> ' + S('disk_mngt_successful_check');
					var title = S('disk_mngt_check_disk');
					var buttons = Ext.MessageBox.OK;
					var icon = Ext.MessageBox.INFO;
					msgBox(title, msg, buttons, icon);
				}
				else {
					progressBar.reset();
					progressBar.wait({
						duration: 10000,
						interval: 50,
						increment: 150,
						fn: function () {
							is_checked(diskName);
							progressWin.show();
						}
					});
				}
			}
			else {
				formFailureFunction();
			}
		}
	});
}
*/

/*
function execute_removal(diskName) {
	// start progress bar
	var msg = S('disk_mngt_removing');
	msg += ' ' + diskName;
	var progressWin = createProgressWin(msg);
	progressWin.show();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'delAssign',
			target: diskName
		},
		method: 'POST',
//		timeout: ??,
		success: function(result) {
			progressWin.hide();

			// Get response from server
			progressWin.destroy();
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			if (success) {
				resetCookie();
				if (diskName.match(/^usb/)) {
					var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
					var jsonStore = shareGrid.getStore();
					selModel = shareGrid.getSelectionModel();
					selectedRecords = selModel.getSelections();

					// remove the records selected from grid 
					for (var i = 0; i < selectedRecords.length; i++) {
						jsonStore.remove(selectedRecords[i]);
					}
					var msg = '<b>' + diskName + '</b> ' + S('disk_mngt_successful_removed');
					var title = S('disk_mngt_remove_assignment');
					var buttons = Ext.MessageBox.OK;
					var icon = Ext.MessageBox.INFO;
					msgBox(title, msg, buttons, icon);
					selModel.selectFirstRow();
				}
				else {
					createSystemDisk();
				}
			}
			else {
				formFailureFunction();
			}
		}
	});
}
*/

function execute_wakeup(diskName) { //start progress bar
	var msg = S('disk_mngt_wakeuping');
	msg += ' ' + diskName;
//	var progressWin = createProgressWin(msg);
//	progressWin.show();

	Ext.MessageBox.wait(msg);
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'wakeupDisk',
			target: diskName
		},
		method: 'POST',
		success: function(result) {
//			progressWin.hide();
//			progressWin.destroy();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			if (success) {
				resetCookie();
/*
				var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
				selectedRecords = selModel.getSelections();

				// remove the records selected from grid 
				for (var i = 0; i < selectedRecords.length; i++) {
					jsonStore.remove(selectedRecords[i]);
				}
				var msg = '<b>' + diskName + '</b> ' + S('disk_mngt_successful_removed');
				var title = S('disk_mngt_remove_assignment');
				var buttons = Ext.MessageBox.OK;
				var icon = Ext.MessageBox.INFO;
				msgBox(title, msg, buttons, icon);
				selModel.selectFirstRow();
*/
				createSystemDisk();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

// <<< -------------------------- DISK FORMAT  -------------------------- >>>
function disk_format(diskName, diskMode, over2tb) {
	var nextBackupTime;
	var timeUnit; // h (hour) or m (minutes)

	var title = S('disk_mngt_format_title');
	title += ' ';
	title += '<b>' + diskName + '</b>';
	title += ':';

//	var url = document.domain;

	var note = '<b><i>' + S('disk_mngt_check_disk_note_1') + '</i></b>';
	note += S('disk_mngt_check_disk_note_2f');
	note += S('disk_mngt_check_disk_note_3');
	note += S('disk_mngt_check_disk_note_4');
	note += S('disk_mngt_check_disk_note_5f');
//	note += '<a href="http://'+ url +':' + PORT +'/static/root.html" onLoad="system_jobs_processAuth();" target="_blank">View Scheduled Backups</a>';

	var xfs_ref = S('disk_mngt_format_xfs');
	var ext3_ref = S('disk_mngt_format_ext3');
	var fat32_ref = S('disk_mngt_format_fat32');
	var DISK_FORMAT_LIST_LOCAL = [['xfs', xfs_ref]];
	var DISK_FORMAT_LIST_USB;
	if(over2tb == 1)
	{
		//vfat is not allowed
		DISK_FORMAT_LIST_USB = [
			['ext3', ext3_ref],
			['xfs', xfs_ref]
		];
	}
	else
	{
		DISK_FORMAT_LIST_USB = [
			['ext3', ext3_ref],
			['xfs', xfs_ref],
			['vfat', fat32_ref]
		];
	}
	var formatOptions;
	var isUsb = 0;
	if (diskName.match(/usb/)) {
		formatOptions = DISK_FORMAT_LIST_USB;
		isUsb = 1;
	}
	else {
		formatOptions = DISK_FORMAT_LIST_LOCAL;
	}

	var diskFormatList = new Ext.form.ComboBox({
		id: 'diskFormatList_combo',
		hiddenName: 'volume',
		fieldLabel: S('disk_mngt_format_fileSystem'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: formatOptions
		}),
		displayField: 'opt',
		valueField: 'val',
		listeners: {
			select: function() {
				var gpt = Ext.getCmp(ID_FORMAT_DISK_GPT_CHKBOX);
				var format = diskFormatList.getValue();
				if (format == 'vfat') {
					gpt.disable();
					gpt.setValue(false);
				} else {
					if (isUsb == 1 && over2tb == 0) {
						gpt.enable();
					}
				}
			}
		},
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 110,
		width: 110,
		value: formatOptions[0][0],
		editable: false
	});

	var encrypt = new Ext.form.Checkbox({
		id: ID_FORMAT_DISK_ENCRYPT_CHKBOX,
		name: 'delMacFiles',
		boxLabel: S('disk_mngt_format_encrypt'),
		hideLabel: true
	});

	var gpt = new Ext.form.Checkbox({
		id: ID_FORMAT_DISK_GPT_CHKBOX,
		name: 'gpt',
		boxLabel: S('disk_mngt_format_gpt'),
		hideLabel: true
	});

	var format_btn = new Ext.Button({
		id: 'format_btn',
		name: 'format_btn',
		text: S('btn_format'),
		listeners: {
			click: function() {
				confirmWindow.close();
				var encrypValue = encrypt.getValue();
				if (encrypValue) {
					encrypValue = 'on';
				}
				else {
					encrypValue = 'off';
				}
				var gptValue = gpt.getValue();
				if (gptValue) {
					gptValue = 'on';
				}
				else {
					gptValue = 'off';
				}
				format_btn.disable();
				disk_formatBtnHandler(diskName, diskFormatList.getValue(), encrypValue, gptValue);
			}
		}
	});

	var format_cancel_btn = new Ext.Button({
		id: 'chk_cancel_btn',
		name: 'chk_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function() { // close window
				var win = Ext.getCmp(ID_FORMAT_DISK_WIN);
				win.hide();
				win.destroy();
				var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
//				selModel.clearSelections();
				format_cancel_btn.disable();
			}
		}
	});

	var items;
	if (add_encrypt) {
		if (add_mc) {
			items = [{
				xtype: 'label',
				html: '<p class="label">' + title + '</p><br>'
			},
			diskFormatList, encrypt, gpt, mc, {
				xtype: 'label',
				html: '<br><p class="label">' + note + '</p>'
			}];
		}
		else {
			items = [{
				xtype: 'label',
				html: '<p class="label">' + title + '</p><br>'
			},
			diskFormatList, encrypt, gpt, {
				xtype: 'label',
				html: '<br><p class="label">' + note + '</p>'
			}];
		}
	}
	else {
		if (add_mc) {
			items = [{
				xtype: 'label',
				html: '<p class="label">' + title + '</p><br>'
			},
			diskFormatList, gpt, mc, {
				xtype: 'label',
				html: '<br><p class="label">' + note + '</p>'
			}];
		}
		else {
			items = [{
				xtype: 'label',
				html: '<p class="label">' + title + '</p><br>'
			},
			diskFormatList, gpt, {
				xtype: 'label',
				html: '<br><p class="label">' + note + '</p>'
			}];
		}
	}

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_FORMAT_WIN + '" class="x-hidden"></div>',
		id: ID_FORMAT_DISK_WIN,
		modal: true,
		width: 600,
		height: 250,
		title: S('disk_mngt_format_disk'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: items,
		buttonAlign: 'left',
		buttons: [format_btn, format_cancel_btn]
	});

	if (!isUsb) {
		gpt.setValue(true);
		gpt.disable();
	}
	if (isUsb) {
		encrypt.setValue(false);
		encrypt.disable();
		if(over2tb == 1)
		{
			gpt.setValue(true);
			gpt.disable();
		}
	}
	if (diskMode.match(/^standby/)) {
		encrypt.disable();
	}

	confirmWindow.show();
}

function disk_formatBtnHandler(diskName, fileSystem, encrypt, gpt) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);

	Ext.MessageBox.wait(S('loading_confirmation'));
	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			// refresh the number
			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';
			disk_format_get_gate(hiddenGateLockTime, hiddenGateLockNumber, diskName, fileSystem, encrypt, gpt);
		}
	});
};

function disk_format_get_gate(hiddenGateLockTime, hiddenGateLockNumber, diskName, fileSystem, encrypt, gpt) {
	var title = S('disk_mngt_format_disk');
	var msg = S('disk_operation_confirm_format_1');
	var msg_2 = S('disk_operation_confirm_format_2');
	var warning = S('warning');
	var warning_msg = S('disk_operation_confirm_format_3');
	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				disk_gate_applyBtn.disable();
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_format_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, diskName, fileSystem, encrypt, gpt);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() { // close window
//				var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
				confirmWindow.hide();
				confirmWindow.destroy();
				var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
//				selModel.clearSelections();
				disk_gate_cancelBtn.disable();
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
			html: '<br><p class="confirmation_instruction">' + msg + '</p>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + msg_2 + '</p>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction"><b>' + warning + '</b>: ' + warning_msg + '</p>'
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

function disk_format_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, diskName, fileSystem, encrypt, gpt) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

//	var msg2 = S('msg_saving_data');
//	var progressWin2 = createProgressWin(msg2);
//	progressWin2.show();
	Ext.MessageBox.wait(S('verifying_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'disk',
			gMode: 'format',
			disk: diskName,
			fileSystem: fileSystem,
			encrypt: encrypt,
			gpt: gpt
		},
		method: 'POST',
		success: function(result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			if (success) {
				resetCookie();

				// remove confirmation window
//				progressWin2.hide();
//				progressWin2.destroy();

				request_operation();
/*
				var msg = S('disk_mngt_formatting');
				msg += ' ' +diskName;
				var progressWin = createProgressWin(msg);

				// start progress bar
				progressWin.show();
				is_disk_formatted(diskName);
*/
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					// remove confirmation window
					// display error msg
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
						fn: function(btn) {
							if (btn == 'ok') { // re-create
								disk_formatBtnHandler(diskName, fileSystem, encrypt, gpt);
							}
						}
					});
				}
			}
		},
		failure: function() {
			request_operation();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
		}
	});
}

/*
function is_disk_formatted(diskName) {
	var progressWin = Ext.getCmp(ID_PROGRESS_WIN);
	var progressBar = Ext.getCmp(ID_DISK_PROGRESS_BAR);

	// here, an ajax request was used because a form was not created in the popup window, therefore, the form.load() method cannot be used.
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_FORMAT_STATUS
		},
		method: 'POST',
		success: function (result) {
			//Get response from server	
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();

				if (response.data[0].status == 1) {
					progressWin.hide();
					progressWin.destroy();

					var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
					var jsonStore = shareGrid.getStore();
					selModel = shareGrid.getSelectionModel();
//					selModel.clearSelections();

					var msg = '<b>' + diskName + '</b> ' + S('disk_mngt_successful_format');
					var title = S('disk_mngt_format_disk');
					var buttons = Ext.MessageBox.OK;
					var icon = Ext.MessageBox.INFO;
					msgBox(title, msg, buttons, icon);
				}
				else {
					progressBar.reset();
					progressBar.wait({
						duration: 10000,
						interval: 50,
						increment: 150,
						fn: function () {
							is_disk_formatted();
							progressWin.show();
						}
					});
				}
			}
			else {
				formFailureFunction();
			}
		},
		failure: function () {
			formFailureFunction();
		}
	});
}
*/

function disk_renderLvm(value, cell, record) {
	if (value == 'on') {
		return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	} else {
		return String.format('<img src= ' + IMAGE_CROSS + ' />');
	}
}

function disk_renderEncryp(value, cell, record) {
	if (value == 'on') {
		return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	} else {
		return String.format('<img src= ' + IMAGE_CROSS + ' />');
	}
}

// <<< -------------------------- DISK REMOVAL	-------------------------- >>>
function disk_removalBtnHandler(diskName) {
	var diskForm = Ext.getCmp(ID_DISK_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	diskForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber; // refresh the number
			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';
			disk_removal_get_gate(hiddenGateLockTime, hiddenGateLockNumber, diskName);
		}
	});
};

function disk_removal_get_gate(hiddenGateLockTime, hiddenGateLockNumber, diskName){
	var title = S('disk_mngt_remove_assignment');
	var msg='';
	var warning='';
	var warning_msg='';

	if (diskName.match(/usb/)) {
		msg = S('disk_operation_confirm_removing_usb_1');
	}
	else {
		warning = S('warning') + ': ';
		msg = S('disk_operation_confirm_removing_1');
		warning_msg = S('disk_operation_confirm_removing_2');
	}

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				disk_remove_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, diskName);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() { // close window
//				var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);

				confirmWindow.hide();
				confirmWindow.destroy();
				var shareGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
//				selModel.clearSelections();
				disk_gate_cancelBtn.disable();
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
			html: '<br><p class="confirmation_instruction">' + msg + '</p>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction"><b>' + warning + '</b>' + warning_msg + '</p>'
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

function disk_remove_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, diskName) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	var msg2 = S('disk_mngt_removing');
//	var progressWin2 = createProgressWin(msg2);
//	progressWin2.show();
	Ext.MessageBox.wait(msg2);

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'disk',
			gMode: 'remove',
			target: diskName
		},
		method: 'POST',
		success: function(result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			if (success) {
				resetCookie();

				// remove confirmation window
//				progressWin2.hide();
//				progressWin2.destroy();
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();	
				request_operation();
			}
			else {
//				progressWin2.hide();
//				progressWin2.destroy();
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();	
				if (response.errors[0] == 'gate_err1') {
					// remove confirmation window
					// display error msg
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
						fn: function(btn) {
							if (btn == 'ok') { // re-create
								disk_removalBtnHandler(diskName);
							}
						}
					});
				}
			}
		},
		failure: function() {
			request_operation();
		}
	});
}
