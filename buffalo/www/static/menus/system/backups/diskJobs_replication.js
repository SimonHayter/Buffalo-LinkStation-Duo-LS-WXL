var replication_json;
var replication2_json;
var isResync = false;

var error;
var resync;

function replication_mainForm() {
	var replication_add = new Ext.Button({
		id: 'replication_add',
		name: 'replication_add',
		disabled: true,
		text: S('btn_add'),
		listeners: {
			click: function() {
				replication_add_form();
			}
		}
	});

	var replication_remove = new Ext.Button({
		id: 'replication_remove',
		name: 'replication_remove',
		disabled: true,
		text: S('btn_delete'),
		listeners: {
			click: function() {
				selModel = grid.getSelectionModel();

				// returns an array of selected records
				selectedRecords = selModel.getSelections();

				//convert data array into a json string
				var delList = new Array();
				for (var i = 0; i < selectedRecords.length; i++) {
					var repli_source = selectedRecords[i].data.source_real;
					var repli_target = selectedRecords[i].data.target_real;
					delList[i] = repli_source + '<>' + repli_target;
				}

				var delList_jsonFormat = Ext.util.JSON.encode(delList);

				replication_removeHandler(replicationForm, delList_jsonFormat);
				cm.setColumnHeader(0, '<div id="replicationHeader" class="x-grid3-hd-checker">\&\#160;</div>');
			}
		}
	});

	var replication_resync = new Ext.Button({
		id: 'replication_resync',
		name: 'replication_resync',
		disabled: true,
		text: S('btn_resync'),
		listeners: {
			click: function() {
				replication_show_resync_warning(replicationForm);
			}
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="replicationHeader" class="x-grid3-hd-checker"> </div>',
		width: 20,	
		listeners: {
			rowselect: function(sm, rowIndex, rec) {
				if (resync != 1) {
					replication_remove.enable();
				}
			},
			rowdeselect: function() {
				if (sm.getCount() == 0) {
					replication_remove.disable();
				}
				cm.setColumnHeader(0, '<div id="replicationHeader" class="x-grid3-hd-checker">\&\#160;</div>');
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
		sm,
		{
			id: "source",
			header: S('disk_backup_replication_source'),
			dataIndex: 'source',
			direction: "ASC",
			renderer: replication_renderTopic,
			width: 275
		},
		{
			header: S('disk_backup_replication_targets'),
			dataIndex: 'target',
			width: 300
		}
	]);

	cm.defaultSortable = true;

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		baseParams: {
			bufaction: BUFACT_GET_REPLICATION_LIST
		},
		url: '/dynamic.pl',
		fields: [{
			name: 'source'
		},
		{
			name: 'target'
		},
		{
			name: 'source_real'
		},
		{
			name: 'target_real'
		}]
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_REPLICATION_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 635,
		height: 240,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true,
		view: gridView,
		loadMask: {
			msg:S("msg_loading_data")
		}
	});

	var replicationForm = new Ext.FormPanel({
		id: ID_REPLICATION_FORM,
		animCollapse: false,
		collapsible: true,
		autoHeight: true,
		width: 640,
		labelWidth: 160,
		title: S('disk_backup_replication'),
		buttonAlign: 'left',
		items: [{
			layout: 'form',
			buttonAlign: 'left',
			buttons: [replication_add, replication_remove, replication_resync]
		},
		grid, {
			html: '<div id="replicationProgressBarDiv" class="x-hidden"></div>'
		}],
		collapsedFirst: true,
		collapsed: true,
		titleCollapse: true,

		listeners: {
			expand: function () {
				gridView.refresh();
			}
		}

	});

	return replicationForm;
}

function replication_renderTopic(value, meta, record) {
	var src = record.get('source_real');
	var dest = record.get('target_real');

	return String.format("<img src='_img/folder.gif' /> {2}", src, dest, value );
}

function replication_edit_form(src, dest){
	replication_add_form(true, src, dest);
}

function replication_add_form(editMode, src, dest) {
	var replicationSourceStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_REPLICATION_SOURCES
		},
		root: 'data',
		fields: [{
			name: 'val'
		},
		{
			name: 'opt'
		}],
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		}
	});

	var source = new Ext.form.ComboBox({
		id: ID_REPLICATION_SOURCE_COMBO,
		name: 'source',
		hiddenName: 'source',
		store: replicationSourceStore,
		displayField: 'opt',
		valueField: 'val',
		fieldLabel: S('disk_backup_replication_source'),
		value: S('data_loading'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 200,
		width: 200,
		editable: false,
		disabled: true
	});

	var replicationTargetStore = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_REPLICATION_TARGETS
		},
		root: 'data',
		fields: [{
			name: 'val'
		},
		{
			name: 'opt'
		}],
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function() {
			resetCookie();
		}
	});

	var target = new Ext.form.ComboBox({
		id: ID_REPLICATION_TARGET_COMBO,
		name: 'target',
		hiddenName: 'target',
		store: replicationTargetStore,
		displayField: 'opt',
		valueField: 'val',
		fieldLabel: S('disk_backup_replication_targets'),
		value: S('data_loading'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		typeAhead: true,
		listWidth: 200,
		width: 200,
		editable: false,
		disabled: true
	});

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

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	{
		name: 'source'
	},
	{
		name: 'target'
	});

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		disabled: true,
		handler: function(f) {
			var regExp = new RegExp(".*@/mnt/usb.*" , "i");
			var targetVal = target.getValue();
			var isUsb = targetVal.search(regExp);
			if (source.getValue == '' || targetVal == '') {
				msgBox_usingDictionary('', qTip_required_values, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else{
				replication_show_usb_warning(editMode, replicationForm_edit, '', isUsb);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			 Ext.Ajax.abort(replicationSourceStore.proxy.activeRequest);
			 Ext.Ajax.abort(replicationTargetStore.proxy.activeRequest);
			 replication_cancelHandler(replicationForm_edit);
		}
	});

	var replicationForm_edit = new Ext.FormPanel({
		frame: false,
		id: ID_REPLICATION_FORM_EDIT,
		width: 640,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		animCollapse: false,
		cls: 'panel-custBorders',
		collapsible: true,
		collapsedFirst: true,
		titleCollapse: true,
		reader: jReader,
		title: S('disk_backup_replication'),
		errorReader: jErrReader,
		buttons: [saveBtn, cancelBtn],
		buttonAlign: 'left',
		items: [source, target]
	});

	var mainreplicationForm = Ext.getCmp(ID_REPLICATION_FORM);
	mainreplicationForm.destroy();
	insertToCentralContainer(NETWORK_RENDER_TO, replicationForm_edit, '');

	replicationSourceStore.load({
		callback: function() {
			// source combobox will exist unless the user clicked on Cancel before the list is loaded
			if (Ext.getCmp(ID_REPLICATION_SOURCE_COMBO)) {
				var result = replicationSourceStore.reader.jsonData.success;
				if (result) {
					if (!editMode) {
						src = '';
					}
					source.setValue(src);
					source.enable();
					if (!target.disabled) {
						saveBtn.enable();
					}
				}
				else {
					formFailureFunction();
				}
			}
		}
	});

	replicationTargetStore.load({
		callback: function() {
			// source combobox will exist unless the user clicked on Cancel before the list is loaded
			if (Ext.getCmp(ID_REPLICATION_TARGET_COMBO)) {
				var result = replicationTargetStore.reader.jsonData.success;
				if (result) {
					if (!editMode) {
						dest = '';
					}
					target.setValue(dest);
					target.enable();
					if (!source.disabled) {
						saveBtn.enable();
					}
				}
				else {
					formFailureFunction();
				}
			}
		}
	});
}

function replication_loadGrid(){
	var grid = Ext.getCmp(ID_REPLICATION_GRID);
	var jsonStore = grid.getStore();
	var replication_add =  Ext.getCmp('replication_add');
	var replication_resync = Ext.getCmp('replication_resync');

	jsonStore.load({
		callback: function(r, opt, s) {
			var successJsonStore = jsonStore.reader.jsonData.success;
			replication_json = jsonStore.reader.jsonData;
			if (successJsonStore) {
				if (jsonStore.getCount() < MAX_REPLICATION_JOBS) {
					replication_add.enable();
				}
				if (jsonStore.getCount() > 0) {
					replication_resync.enable();
				}

				replication_checkSynchronization();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function replication_checkSynchronization(){
	var grid = Ext.getCmp(ID_REPLICATION_GRID);
	var jsonStore = grid.getStore();
	var replication_add =  Ext.getCmp('replication_add');
	var replication_resync = Ext.getCmp('replication_resync');
	var replication_remove = Ext.getCmp('replication_remove');

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_CHECK_REPLICATION
		},
		method: 'GET',
		success: function(result) {
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var successAjax = response.success;
			if (successAjax) {
				replication2_json = response.data;
				error = replication2_json[0].error;
				resync = replication2_json[0].resync;

				if (resync == 1) {
					replication_add.disable();
					replication_remove.disable();
					replication_resync.disable();
					grid.disable();

					var progressBar = new Ext.ProgressBar({
						text: S('disk_backup_replication_resync'),
						width: 500,
						id: 'replication_progressBar',
						cls: 'custom',
						renderTo: 'replicationProgressBarDiv'
					});

					progressBar.wait({
						interval: 150,
						duration: 15000,
						increment: 100,
						scope: this,
						fn: function(){
							replication_checkSynchronization();
							isResync = true
						}
					});
				}
				else if (error == 1) {
					msgBox_usingDictionary('', 'disk_backup_replication_error', Ext.Msg.OK, Ext.MessageBox.ERROR);
				}
				else if (resync == 0 && error == 0) {
					if (isResync) {
						Ext.MessageBox.updateProgress(1);
						Ext.MessageBox.hide();
						msgBox_usingDictionary('', 'disk_backup_replication_resync_done', Ext.Msg.OK, Ext.MessageBox.INFO);

						replication_add.enable();
						replication_resync.enable();
						grid.enable();
						isResync = false;
					}
				}
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function replication_cancelHandler(editForm) {
	editForm.destroy();
	displayGridForm = replication_mainForm();
	insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, '');

	displayGridForm.expand(false);
	replication_loadGrid();	
}

function replication_saveHandler(editMode, editForm, source) {
	var sourceCombo = Ext.getCmp(ID_REPLICATION_SOURCE_COMBO);
	var targetCombo = Ext.getCmp(ID_REPLICATION_TARGET_COMBO);

	if (editMode) {
		bufaction = BUFACT_SET_REPLICATION;
	}
	else {
		bufaction = BUFACT_ADD_REPLICATION;
	}

	editForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			source: sourceCombo.getValue(),
			target: targetCombo.getValue()
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			editForm.destroy();
			displayGridForm = replication_mainForm();
			insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, '');
			displayGridForm.expand(false);
			replication_loadGrid();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function replication_removeHandler(replicationForm, del_target) {
	replicationForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_DEL_REPLICATION,
			target: del_target
		},
		waitMsg: S('msg_deleting_data'),
		success: function() {
			resetCookie();
			replicationForm.destroy();
			displayGridForm = replication_mainForm();
			insertToCentralContainer(NETWORK_RENDER_TO, displayGridForm, '');
			displayGridForm.expand(false);
			replication_loadGrid();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function replication_resyncHandler(replicationForm) {
	Ext.MessageBox.wait(S('disk_backup_replication_resync'));
	replicationForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_RESYNC_REPLICATION
		},
		success: function() {
			resetCookie();
			replication_checkSynchronization();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function replication_show_usb_warning(editMode, replicationForm_edit, source, isUsb){
	var title = S('warning_box_title');
	var msg = S('disk_backup_replication_warning');
	
	if (isUsb != -1) {
		// if here, it is USB, display warning
		msg += '<br><br>' + S('disk_backup_replication_usb_warning');
	}		
	var replication_applyBtn = new Ext.Button({
		id: 'replication_applyBtn',
		name: 'replication_applyBtn',
		text: S('btn_ok'),
		listeners: {
			click: function() {
				confirmWindow.close();
				replication_saveHandler(editMode, replicationForm_edit, source);
			}
		}
	});

	var replication_cancelBtn = new Ext.Button({
		id: 'replication_cancelBtn',
		name: 'replication_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				confirmWindow.close();
			}
		}
	});

	if (!Ext.getCmp('win_warning_id')) {
		confirmWindow = new Ext.Window({
			html: '<div id="replication_warning_id" class="x-hidden"></div>',
			id: 'win_warning_id',
			modal: true,
			width: 600,
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
				html: '<br><p class="confirmation_instruction">' + msg + '</p><br/>'
			}],
			buttonAlign: 'center',
			buttons: [replication_applyBtn, replication_cancelBtn]
		});
	}

	confirmWindow.show(confirmWindow);
}

function replication_show_resync_warning(replicationForm){
	var title = S('warning_box_title');
	var msg = S('disk_backup_replication_resync_warning');

	var replication_applyBtn = new Ext.Button({
		id: 'replication_applyBtn',
		name: 'replication_applyBtn',
		text: S('btn_ok'),
		listeners: {
			click: function() {
				confirmWindow.close();
				replication_resyncHandler(replicationForm);
			}
		}
	});

	var replication_cancelBtn = new Ext.Button({
		id: 'replication_cancelBtn',
		name: 'replication_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				confirmWindow.close();
			}
		}
	});

	if (!Ext.getCmp('win_warning_id')) {
		confirmWindow = new Ext.Window({
			html: '<div id="replication_warning_id" class="x-hidden"></div>',
			id: 'win_warning_id',
			modal: true,
			width: 600,
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
				html: '<br><p class="confirmation_instruction">' + msg + '</p><br/>'
			}],
			buttonAlign: 'center',
			buttons: [replication_applyBtn, replication_cancelBtn]
		});
	}

	confirmWindow.show(confirmWindow);
}
