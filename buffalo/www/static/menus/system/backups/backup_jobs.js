function jobs_createStatusGrid() {
	var newJobBtn = new Ext.Button({
		id: 'new_job_btn',
		name: 'new_job_btn',
		text: S('disk_backup_new_job'),
		listeners: {
			click: function() {
				jobs_new();
			}
		}
	});

	var delBtn = new Ext.Button({
		id: 'delete_job_btn',
		name: 'delBtn',
		disabled: true,
		text: S('disk_backup_del_job'),
		handler: function() {
			var emptyList = true;
			var selectedRecords;
			var ipList;
			var msg ='';
			var buttons;
			var title;
			var icon;

			// get data from grid2
			shareGrid = Ext.getCmp('grid');
			selModel  = shareGrid.getSelectionModel();

			// returns an array of selected records
			selectedRecords = selModel.getSelections();

			// convert data array into a json string
			delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++){
				delList [i] = selectedRecords[i].data.jobId; 
			}

			msg = S('disk_backup_ui_1');
			emptyList = false;
			buttons = Ext.MessageBox.OKCANCEL;
			title = S('warning_box_title');
			icon = Ext.MessageBox.QUESTION;

			Ext.MessageBox.show({
				title: title,
				msg: msg,
				buttons: buttons,
				icon: icon,
				fn: function(btn){
					if (!emptyList && btn == 'ok') { 
						jobs_deleteBtnHandler(delList);
					}
				}
			});
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="dj_header" class="x-grid3-hd-checker"> </div>',
		listeners: {
			rowselect: function() {
				delBtn.enable();
			},
			rowdeselect: function() {
				if (sm.getCount() == 0) {
					delBtn.disable();
				}
				cm.setColumnHeader(0, '<div id="dj_header" class="x-grid3-hd-checker">\&\#160;</div>');
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
		sm,
		{
			id: "jobName",
			header: S('disk_backup_gridCol_name'),
			dataIndex: "jobName",
			direction: "ASC",
			renderer: jobs_renderTopic,
			width: 120,
			sortable: true
		},{
			id: "jobId",
			hidden: true,
			dataIndex: "jobId",
			width: 50,
			sortable: true
		},{ 
			header: S('disk_backup_gridCol_scheduled'),
			dataIndex: 'scheduleType',
			width: 100,
			renderer: jobs_renderScheduleType,
			sortable: true
		},{
			header: S('disk_backup_gridCol_day'),
			dataIndex: 'weekday',
			width: 50,
			renderer: jobs_renderDay,
			sortable: true
		},{
			header: S('disk_backup_gridCol_time'),
			dataIndex: 'startTime',
			width: 50,
			renderer: jobs_renderTime,
			sortable: true
		},{
			header: S('disk_backup_gridCol_op_mode'),
			dataIndex: 'operationMode',
			width: 180,
			renderer: jobs_renderOperationMode,
			sortable: true
		},{
			header: S('disk_backup_gridCol_staus'),
			dataIndex: 'status',
			renderer: jobs_renderStatus,
			width: 80,
			sortable: true
		}
	]);

	// by default columns are sortable
	cm.defaultSortable = true;
	
	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams:{
			bufaction: BUFACT_GET_ALL_DISKS
		},
		waitMsg: S('msg_loading_data'),
		fields: [
			{name: 'jobName'},
			{name: 'jobId'},
			{name: 'scheduleType'},
			{name: 'weekday'},
			{name: 'startTime'},
			{name: 'operationMode'},
			{name: 'status'},
			{name: 'force'}
		]
	});

	var grid = new Ext.grid.GridPanel({
		id: 'grid',
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 250,
		enableHdMenu: false,
		enableColumnMove : false,
		frame: true
	});

	jsonStore.load({
		callback: function(r,o,s){
			var result = jsonStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
			else {
				if (jsonStore.getCount() >= MAX_JOBS) {
					newJobBtn.disable();
				}
				else {
					newJobBtn.enable();
				}
			}
		}
	});

// ....: Create JOBS FORM and add ITEMS  :....
	var jobsForm = new Ext.FormPanel({
		id: ID_JOBS_EDITABLE_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		title: S('disk_backup_jobs_title'),
		items: [
			{
				buttonAlign:'left',
				buttons: [newJobBtn, delBtn]
			},
			grid
		],
		animCollapse: false,
		collapsible: true,
		titleCollapse: true
	});

	return jobsForm;
}

function jobs_renderTopic(jobName, p, record){
	return String.format('<b><a  href="#" onClick="jobs_edit(\'{0}\', \'{1}\');">{0} </a>', jobName, record.data.jobId);
}

function jobs_renderOperationMode(operationMode, p, record){
	if (operationMode) {
		return	S('disk_backup_operationMode_'+ operationMode);
	}
	return operationMode;
}

function jobs_renderScheduleType(scheduleType, p, record){
	if (scheduleType == 'not_scheduled') {
		return S('disk_backup_scheduleType_not_run');
	}
	else {
		return S('disk_backup_scheduleType_' + scheduleType );
	}
}

function jobs_renderStatus(status, p, record){
	if ((record.data.scheduleType != 'not_scheduled') && (record.data.scheduleType != 'now')) {
		if (((status == 'err') && (record.data.force == 'on')) || (status == 'done')) {
			return (S('disk_backup_status_' + status) + ' / ' + S('disk_backup_status_ready'));
		}
		else {
			return S('disk_backup_status_' + status);
		}
	}
	else {
		return S('disk_backup_status_' + status);
	}
}

function jobs_renderDay(weekday, p, record){
	if (weekday) {
		return S(weekday);
	}
	else {
		return EMPTY;
	}
}

function jobs_renderTime(time, p, record){
	if (time) {
		return time;
	}
	else {
		return EMPTY_TIME;
	}
}

function jobs_deleteBtnHandler(data) {
	var jobsForm = Ext.getCmp(ID_JOBS_EDITABLE_FORM);
	var jsonData = Ext.util.JSON.encode(data);

	jobsForm.form.submit({
		url: '/dynamic.pl',
		params: {bufaction: BUFACT_DEL_JOB, delList: jsonData}, 
		waitMsg: S('msg_deleting_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success:function(form,action) {
			resetCookie();
			var shareGrid = Ext.getCmp('grid');
			var delBtn = Ext.getCmp('delete_job_btn');
			var jsonStore = shareGrid.getStore();
			selModel = shareGrid.getSelectionModel();
			selectedRecords = selModel.getSelections();

			// remove the records selected from grid 
			for (var i = 0; i < selectedRecords.length; i++){
				jsonStore.remove(selectedRecords[i]);
			}
			delBtn.disable();
			var newJobBtn = Ext.getCmp('new_job_btn');

			if (jsonStore.getCount() >= MAX_JOBS) {
				newJobBtn.disable();
			}
			else{
				newJobBtn.enable();
			}
			var cm = shareGrid.getColumnModel();
			cm.setColumnHeader(0, '<div id="dj_header" class="x-grid3-hd-checker">\&\#160;</div>');
		}
	});
};

function jobs_edit(jobName, jobId){
	var editForm = jobs_create_form(jobId);
	updateCentralContainer(JOBS_RENDER_TO, editForm);

	// ....: Load current settings :....
	editForm.load({
		url:'/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_BAKCUP_SETTINGS + jobId
		},
		waitMsg: S('msg_loading_data'),
		failure: function(f, action) {
			formFailureFunction(action);
		},
		success: function(f, action) {
			resetCookie();
			var editableGrid = Ext.getCmp(ID_JOBS_PREFIX_FRONT_GRID);
			var editableGridStore = editableGrid.getStore();
			editableGridStore.load( {
				callback: function(r,o,s) {
					var result = editableGridStore.reader.jsonData.success;
					if (!result) {
						formFailureFunction();
					}
					else {
						displaySettingsOnLoad (editForm, action);
					}
				}
			});
		}
	});
}

function jobs_new() {
	// job id is null for new backup job
	var newForm = jobs_create_form('');
	updateCentralContainer(JOBS_RENDER_TO, newForm);
	var combo = Ext.getCmp(ID_JOBS_PREFIX_JOB_SCHEDULE_COMBO);

	onloadComboListeners('not_scheduled');
};

function create_jobs_password_form_display_mode() {
	var password = new Ext.form.TextField({
		id: 'password',
		name:'password',
		inputType: 'password',
		fieldLabel: S('disk_backup_password_field'),
		autoWidth:true,
		readOnly: true
	});

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				jobs_password_editBtnHandler(jobsPasswordForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
			root: 'data'
		}, [{
			name: 'password'
		}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var jobsPasswordForm = new Ext.FormPanel({
		id: ID_JOBS_PASSWORD_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('disk_backup_password_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_editBtn],
		items: [password],
		animCollapse: false,
		collapsible: true,
		titleCollapse: true,
		collapsed : true
	});

	return jobsPasswordForm;
}

function create_jobs_password_form_edit_mode() {
	var password = new Ext.form.TextField({
		id: 'password',
		name: 'password',
		inputType : 'password',
		maxLength : 8,
		fieldLabel: S('disk_backup_password_field'),
		width : 100
	});

	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name: 'hn_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				jobs_password_saveBtnHandler(jobsPasswordForm);
			}
		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				jobs_password_edit_display_mode(jobsPasswordForm);
			}
		} 
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
	}, [
		{name: 'password'}
	]);
	
	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);
	
	var jobsPasswordForm = new Ext.FormPanel({
		id: ID_JOBS_PASSWORD_FORM,
		cls: 'panel-custBorders',
		title: S('disk_backup_password_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn],
		items: [password],
		titleCollapse: true
	});

	return jobsPasswordForm;
}

function jobs_password_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_BACKUP_PASSWORD
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_BACKUP_PASSWORD
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success: function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					jobs_password_jsonData = resp.data[0];
					jobs_password_edit_display_mode(hnForm);
				}
			})
		}
	});
}

function jobs_password_editBtnHandler(hform_edit) {
	hform_edit.destroy();
	hform_display = create_jobs_password_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_JOBS_EDITABLE_FORM);
	hform_display.form.setValues(jobs_password_jsonData);
	hform_display.expand(false);
}

function jobs_password_edit_display_mode(hform_display) {
	hform_display.destroy();
	hform_edit = create_jobs_password_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_JOBS_EDITABLE_FORM);
	hform_edit.form.setValues(jobs_password_jsonData);
	hform_edit.expand(false);
}
