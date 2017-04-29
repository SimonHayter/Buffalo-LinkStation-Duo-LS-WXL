var confirmWindow;
var networkType;
var authServerType;

function shFolders_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			remove_useless_mask();

			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				shFolders_createMainForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function shFolders_createMainForm() {
	DISK_LIST = new Array;

	var newFolderBtn = new Ext.Button({
		id: 'newFolderBtn',
		name: 'newFolderBtn',
		iconCls: 'add',
		disabled: true,
		text: S('sh_btn_newFolder'),
		listeners: {
			click: function() {
				newFolderBtn.disable();
				shFolders_newFolderBtnHanlder('newFold');
			}
		}
	});

	var delBtn = new Ext.Button({
		id: 'delete_folder_btn',
		name: 'delBtn',
		iconCls: 'delete',
		disabled: true,
		text: S('btn_delete'),
		handler: function() {

			delBtn.disable();
			var emptyList = false;
			var selectedRecords;
			var ipList;
			var msg = '';
			var buttons;
			var title;
			var icon;

			selModel = grid.getSelectionModel();
			selectedRecords = selModel.getSelections();

			// convert data array into a json string
			var delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				delList[i] = selectedRecords[i].data.shareName;
			}

			var delList_jsonFormat = Ext.util.JSON.encode(delList);
			shFolders_deleteBtnHandler(delList_jsonFormat);

		}
	});

	var emptyRecycle = new Ext.Button({
		id: 'emptyRecycle',
		name: 'emptyRecycle',
		// iconCls: 'delete',
		text: S('shFold_emptyRecycleBtn'),
		handler: function() {
			emptyRecycle.disable();
			sm.selectAll();
			shFolders_emptyRecycleBtnHandler(shForm);

		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function(sm, rowIndex, rec) {
				delBtn.enable();
				var re = /^usbdisk[1-4]$/;
				var matched = rec.get('shareName').match(re);
				var re_info = /^info$/;
				var matched_info = rec.get('shareName').match(re_info);

				if (matched || matched_info) {
					sm.deselectRow(rowIndex);
				}
			},
			rowdeselect: function() {
				if (sm.getCount() == 0) {
					delBtn.disable();
				}
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
	sm, {
		id: "shareName",
		header: S('sh_gridCol_name'),
		dataIndex: "shareName",
		direction: "ASC",
		renderer: shFolders_renderTopic,
		width: 155

	},
	{
		header: S('sh_gridCol_volume'),
		dataIndex: 'volume',
		width: 80,
		renderer: shFolders_renderVolume
	},
	{
		header: S('sh_gridCol_attribute'),
		dataIndex: 'attribute',
		renderer: shFolders_renderAttribute,
		width: 80
	},
	{
		header: S('sh_recycle'),
		dataIndex: 'recycle',
		renderer: shFolders_renderRecycle,
		width: 70
	},
	{
		header: S('sh_gridCol_support'),
		dataIndex: 'support',
		width: 200,
		renderer: shFolders_support
	},
	{
		header: S('sh_gridCol_restrict'),
		dataIndex: 'axsRestrict',
		renderer: shFolders_renderAxsRestrict,
		width: 80
	}]);

	// by default columns are sortable
	cm.defaultSortable = true;

	cm.setRenderer(0, hideCheckbox_usb);
	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ALL_SHARE
		},
		fields: [{
			name: 'shareName'
		},
		{
			name: 'volume'
		},
		{
			name: 'attribute'
		},
		{
			name: 'recycle'
		},
		{
			name: 'support'
		},
		{
			name: 'axsRestrict'
		},
		{
			name: 'visible'
		}]
	});

	var jsonStore_volume = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_SHARE_GET_ALL_VOLUME
		},
		fields: [{
			name: 'volName'
		},
		{
			name: 'volDesc'
		},
		{
			name: 'volEncrypt'
		},
		{
			name: 'networkType'
		},
		{
			name: 'authServerType'
		}]
	});

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		},
		{
			name: 'value'
		}
		]
	});

	var searchbox = new Ext.form.ComboBox({
		id: ID_SH_FOLD_TOP_SEARCH_COMBO,
		hideLabel: true,
		allowBlank: true,
		editable: true,
		store: searchComboStore,
		selectOnFocus: true,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
		mode: 'local',
		hideTrigger: true,
		listWidth: 110,
		width: 110,
		listeners: {
			select: function(c, r, i) {
				var gridIndex = r.get('name');
				var sm = grid.getSelectionModel();
				sm.selectRow(gridIndex, false);
				grid.getView().focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var toolbar = new Ext.Toolbar({
		autoHeight: true,
		items: ['->', S('searchBox_find'), ' ', searchbox],
		frame: true
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_SH_FOLD_MAIN_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: GLOBAL_WIDTH_GRID,
		height: 400,
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: toolbar,
		stripeRows: true,
		frame: true,
		view: gridView,
		listeners: {
			sortchange: function() {
				update_combo_search(grid, searchbox, 'shareName');
			}
		}
	});

	Ext.MessageBox.wait(S('msg_loading_data'));
	jsonStore.load({
		callback: function(r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if(result){
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();

				gridView.refresh();
				update_combo_search(grid, searchbox, 'shareName');

			}
			else {
				formFailureFunction();
			}
		}
	});

	jsonStore_volume.load({
		callback: function(r, opt, success) {
			var result = jsonStore_volume.reader.jsonData.success;
			if(result){
				shFolders_limit(jsonStore);
				var uniqueDiskNames = jsonStore_volume.collect('volName', false, true);
				for (var i = 0; i < uniqueDiskNames.length; i++) {
					var re = /^usbdisk[1-4]$/;
					var matched = uniqueDiskNames[i].match(re);
					
					if (!matched) {
						DISK_LIST[i] = new Array();
						DISK_LIST[i][0] = uniqueDiskNames[i];
						DISK_LIST[i][1] = S(uniqueDiskNames[i]);
					}
				}
				
				if (r[0]) {
					networkType =r[0].get('networkType');
					authServerType =r[0].get('authServerType');
				}
				shFolders_limit(jsonStore);
			}
			else {
				formFailureFunction();
			}
		}
	});

	// ....: Create shForm FORM and add ITEMS  :....
	if (add_trashbox) {
		var shForm = new Ext.FormPanel({
			frame: false,
			bodyBorder: false,
			id: ID_SH_FOLD_EDITABLE_FORM,
			width: GLOBAL_WIDTH_FORM,
			labelAlign: 'left',
			labelWidth: 120,
			items: [{
				layout: 'form',
				buttonAlign: 'left',
				buttons: [newFolderBtn, delBtn, emptyRecycle]
			},
			grid]
		});
	}
	else {
		var shForm = new Ext.FormPanel({
			frame: false,
			bodyBorder: false,
			id: ID_SH_FOLD_EDITABLE_FORM,
			width: GLOBAL_WIDTH_FORM,
			labelAlign: 'left',
			labelWidth: 120,
			items: [{
				layout: 'form',
				buttonAlign: 'left',
				buttons: [newFolderBtn, delBtn]
			},
			grid]
		});
	}

	updateCentralContainer(SHARED_FOLDER_RENDER_TO, shForm);
}

function hideCheckbox_usb(value, p, record) {
	var re_usb = /^usbdisk[1-4]$/;
	var matched_usb = record.data.shareName.match(re_usb);
	var re_info = /^info$/;
	var matched_info = record.data.shareName.match(re_info);

	if (matched_usb || matched_info) {
		return '';
	}
	return '<div class="x-grid3-row-checker"> </div>';
}

function shFolders_renderVolume(value){
	return S(value);
}

function shFolders_renderAttribute(value) {
	return S('sh_field_' + value);
}

function shFolders_renderTopic(value) {
	return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='shFolders_editSharedFolder(\"{0}\");'>{0} </a></b>", value);
}

function shFolders_renderAxsRestrict(value, cell, record) {
	if (value == 'on') return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	else return String.format('<img src= ' + IMAGE_CROSS + ' />');
}

function shFolders_renderRecycle(value, cell, record) {
	if ((value == '1') || (value == 'on')) return String.format('<img src= ' + IMAGE_CHECK_MARK + '/>');
	else return String.format('<img src=' + IMAGE_CROSS + ' />');
}

function shFolders_support(value) {
	if (value) {
		var supportList = value.split(",");
		var parsedList = '';

		for (var i = 0; i < supportList.length - 1; i++) {
			parsedList += S('sh_field_folderSupport_' + supportList[i]);
			parsedList += ', ';
		}
		parsedList += S('sh_field_folderSupport_' + supportList[supportList.length - 1]);
		return parsedList;
	}
	else {
		return value;
	}
}

function shFolders_deleteBtnHandler(delList) {
	var shForm = Ext.getCmp(ID_SH_FOLD_EDITABLE_FORM);
	Ext.MessageBox.wait(S('loading_confirmation'));

	shForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		disableCaching: true,
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

			shFolders_get_gate(hiddenGateLockTime, hiddenGateLockNumber, delList);
		}
	});
};

function shFolders_get_gate(hiddenGateLockTime, hiddenGateLockNumber, delList) {
	var title = S('sh_gate_title');
	var msg = S('sh_operation_confirm_del');
	var warning = S('warning');
	var warning_msg = S('operation_cannotBeCancelled');

	var shFolders_gate_applyBtn = new Ext.Button({
		id: 'shFolders_gate_applyBtn',
		name: 'shFolders_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				var gNumber = Ext.getCmp(ID_SH_FOLD_GATE_FIELD).getValue();
				shFold_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, delList);
				shFolders_gate_applyBtn.disable();
				shFolders_gate_cancelBtn.disable();
			}
		}
	});

	var shFolders_gate_cancelBtn = new Ext.Button({
		id: 'shFolders_gate_cancelBtn',
		name: 'shFolders_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				confirmWindow.close();
				shFolders_gate_cancelBtn.disable();
				Ext.getCmp('delete_folder_btn').enable();
				var shareGrid = Ext.getCmp(ID_SH_FOLD_MAIN_GRID);
				var selModel = shareGrid.getSelectionModel();
				selModel.clearSelections();
			}
		}
	});

	var shFolders_gateField = new Ext.form.NumberField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_SH_FOLD_GATE_FIELD,
		name: 'shFolders_gateField',
		width: 100,
		labelWidth: 10,
		minValue: 0,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GATE
		}
	});

	if (!Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN)) {
		confirmWindow = new Ext.Window({
			html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
			id: ID_SH_FOLD_GATE_VERIF_WIN,
			modal: true,
			width: 300,
			title: S('operation_confirm'),
			plain: true,
			draggable: false,
			resizable: false,
			layout: 'form',
			items: [{
				xtype: 'label',
				html: '<p class="title_popup"><img src="' + WARNING_IMG + '"/> ' + title + '</p><br>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction">' + msg + '</p>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction"><b>' + warning + '</b>: ' + warning_msg + '</p><br>'
			},
			{
				cls: 'conf_numb_box',
				html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
			},
			shFolders_gateField],
			buttonAlign: 'center',
			buttons: [
				shFolders_gate_applyBtn,
				shFolders_gate_cancelBtn
			]
		});
	}

	confirmWindow.show(confirmWindow);
}

function shFold_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, delList) {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'share',
			gMode: 'delete',
			delList: delList
		},
		method: 'POST',
		success: function(result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;

			if (success) {
				resetCookie();
				var msg = 'sh_success_delete';
				var buttons = Ext.MessageBox.OK;
				var title = 'sh_success_header';
				var icon = Ext.MessageBox.INFO;
				msgBox_usingDictionary(title, msg, buttons, icon);

				// close gate window
				Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN).close();

				// IF verification number is correct, then delete row from grid
				var shareGrid = Ext.getCmp(ID_SH_FOLD_MAIN_GRID);
				var searchbox = Ext.getCmp(ID_SH_FOLD_TOP_SEARCH_COMBO);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
				selectedRecords = selModel.getSelections();

				// remove the records selected from grid 
				for (var i = 0; i < selectedRecords.length; i++)
				jsonStore.remove(selectedRecords[i]);

				shFolders_limit(jsonStore);
				
				update_combo_search(shareGrid, searchbox, 'shareName');
				getLeftPanelInfo(MENU_INDEX_SHFOLD);

				Ext.getCmp('delete_folder_btn').disable();
			}
			else if (response.errors[0] == 'gate_err1') {
				Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN).close();
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
						if (btn == 'ok') {
							shFolders_deleteBtnHandler(delList);
						}
					}
				});
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function shFolders_emptyRecycleBtnHandler(shForm){
	Ext.MessageBox.wait(S('loading_confirmation'));

	shForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		disableCaching: true,
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();

			var rawData = action.response.responseText;
			var response = Ext.decode(rawData);

			if (response.success) {
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();

				var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
				var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

				// refresh the numb
				A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
				B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
				C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
				D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

				shFolders_emptyRecycle_get_gate(hiddenGateLockTime, hiddenGateLockNumber);
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function shFolders_emptyRecycle_get_gate(hiddenGateLockTime, hiddenGateLockNumber) {
	var title = S('shFold_emptyRecycle_gate_title');
	var msg = S('shFold_emptyRecycle_confirmMsg');
	var warning = S('warning');
	var warning_msg = S('shFold_emptyRecycle_warningMsg');

	var shFolders_gate_applyBtn = new Ext.Button({
		id: 'shFolders_gate_applyBtn',
		name: 'shFolders_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				shFolders_gate_applyBtn.disable();
				shFolders_gate_cancelBtn.disable();
				var gNumber = Ext.getCmp(ID_SH_FOLD_GATE_FIELD).getValue();
				shFold_emptyRecycle_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber);
			}
		}
	});

	var shFolders_gate_cancelBtn = new Ext.Button({
		id: 'shFolders_gate_cancelBtn',
		name: 'shFolders_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				var shareGrid = Ext.getCmp(ID_SH_FOLD_MAIN_GRID);
				var selModel = shareGrid.getSelectionModel();
				selModel.clearSelections();
				confirmWindow.close();
				Ext.getCmp('emptyRecycle').enable();
			}
		}
	});

	var shFolders_gateField = new Ext.form.NumberField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_SH_FOLD_GATE_FIELD,
		name: 'shFolders_gateField',
		width: 100,
		labelWidth: 10,
		minValue: 0,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GATE
		}
	});

	if (!Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN)) {
		confirmWindow = new Ext.Window({
			html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
			id: ID_SH_FOLD_GATE_VERIF_WIN,
			modal: true,
			width: 300,
			title: S('operation_confirm'),
			plain: true,
			draggable: false,
			resizable: false,
			layout: 'form',
			items: [{
				xtype: 'label',
				html: '<p class="title_popup"><img src="' + WARNING_IMG + '"/> ' + title + '</p><br>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction">' + msg + '</p>'
			},
			{
				xtype: 'label',
				html: '<br><p class="confirmation_instruction"><b>' + warning + '</b>: ' + warning_msg + '</p><br>'
			},
			{
				cls: 'conf_numb_box',
				html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
			},
			shFolders_gateField],
			buttonAlign: 'center',
			buttons: [shFolders_gate_applyBtn, shFolders_gate_cancelBtn] // end buttons
		});
	}

	confirmWindow.show(confirmWindow);
}

function shFold_emptyRecycle_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber) {
	var shForm = Ext.getCmp(ID_SH_FOLD_EDITABLE_FORM);
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'share',
			gMode: 'emptyRecycle'
		},
		method: 'POST',
		success: function(result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;

			if (success) {
				resetCookie();
				var msg = 'sh_success_emptyRecycle';
				var buttons = Ext.MessageBox.OK;
				var title = 'sh_success_header';
				var icon = Ext.MessageBox.INFO;
				msgBox_usingDictionary(title, msg, buttons, icon);

				// close gate window
				Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN).close();

				// IF verification number is correct, then delete row from grid
				var shareGrid = Ext.getCmp(ID_SH_FOLD_MAIN_GRID);
				var searchbox = Ext.getCmp(ID_SH_FOLD_TOP_SEARCH_COMBO);
				var jsonStore = shareGrid.getStore();
				selModel = shareGrid.getSelectionModel();
				selModel.clearSelections();
			}
			else if (response.errors[0] == 'gate_err1') {
				Ext.getCmp(ID_SH_FOLD_GATE_VERIF_WIN).close();

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
						if (btn == 'ok') {
							shFolders_emptyRecycleBtnHandler(shForm);
						}
					}
				});
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function shFolders_newFolderBtnHanlder(id) {
	shFolders_createFolder(id);
	if ((networkType == 'domain') ||  (networkType == 'ad')) {
		Ext.getCmp('domainUsersViewBtn').show();
		Ext.getCmp('domainGroupsViewBtn').show();
	}
	if ((networkType == 'workgroup') && (authServerType == 'server')) {
		Ext.getCmp('extUsersViewBtn').show();
	}
};

function shFolders_limit(jsonStore){
	var newFolderBtn = Ext.getCmp('newFolderBtn');
	if (jsonStore.getCount() < MAX_SHARE) {
		newFolderBtn.enable();
	}
	else {
		newFolderBtn.disable();
	}
}
