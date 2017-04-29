var user_jsonData;
var admin_flag;
var user_add_quota;
var orig_userName;

function usrGrp_user_processAuth(userName) {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				createUsrGrpForm(userName);
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function createUsrGrpForm(userName) {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DOMAIN_SETTINGS
		},
		method: 'POST',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();

				if (!userName) {
					userForm_display = users_form_display();

					var networkType = response.data[0].networkType;
					var authServerType = response.data[0].authServerType;
					if ((networkType == 'workgroup') && (authServerType == 'server')) {
						addConvertButton(userForm_display);
					}
					updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
				}
				else {
					display_user_only(userName);
				}
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function addConvertButton(userForm) {
	var users_convertBtn = new Ext.Button({
		id: 'users_convertBtn',
		name: 'users_convertBtn',
		text: S('usr_btn_convertUser'),
		disabled: true,
		handler: function () {
			var grid = Ext.getCmp('localUsersGrid');
			selModel = grid.getSelectionModel();

			// returns an array of selected records
			selectedRecords = selModel.getSelections();

			// convert data array into a json string
			var convList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				convList[i] = selectedRecords[i].data.userName;
			}
			var convList_jsonFormat = Ext.util.JSON.encode(convList);
			Ext.MessageBox.show({
				title: S('warning_box_title'),
				msg: S('usr_convert_warning'),
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.WARNING,
				fn: function (btn) {
					users_convertBtnHandler(userForm, convList_jsonFormat, btn);
				}
			});
		}
	});

	var buttons_section = Ext.getCmp('buttons_section');
	if (buttons_section) {
		buttons_section.addButton(users_convertBtn);
	}
}

function users_form_display() {
	// turn on validation errors beside the field globally
//	Ext.form.Field.prototype.msgTarget = 'side';
	var bd = Ext.getBody();

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		baseParams: {
			bufaction: BUFACT_GET_ALL_USERS
		},
		fields: [{
			name: 'userName'
		}, {
			name: 'userDesc'
		}, {
			name: 'userMode'
		}]
	});

	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				if (jsonStore.getCount() < MAX_USR) {
					users_addBtn.enable();
				}
				else {
					users_addBtn.disable();
				}
				update_combo_search(grid, searchbox, 'userName');
				var adminUsrIndex = jsonStore.find('userMode', "1", 0, false);
				var adminUsrRecord = jsonStore.getAt(adminUsrIndex);
				var adminName = adminUsrRecord.get('userName');
				var userMode = adminUsrRecord.get('userMode');
				user_loadDetails(userForm, adminName, userMode, false);
			}
			else {
				formFailureFunction();
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	}, {
		name: 'msg'
	}]);

	var jReader = new Ext.data.JsonReader({
		root: 'data',
		successProperty: 'success'
	}, [{
		name: 'userName'
	}, {
		name: 'userDesc'
	}, {
		name: 'userMode'
	}, {
		name: 'userId'
	}, {
		name: 'primGroup'
	}, {
		name: 'file'
	}]);

	var users_addBtn = new Ext.Button({
		id: 'users_addBtn',
		name: 'users_addBtn',
		iconCls: 'add',
		disabled: true,
		text: S('usr_btn_createNewUser'),
		handler: function () {
			users_addBtnHandler(userForm);
		}
	});

	var users_delBtn = new Ext.Button({
		id: 'users_delBtn',
		name: 'users_delBtn',
		iconCls: 'delete',
		disabled: true,
		text: S('btn_delete'),
		handler: function () {
			var emptyList = false;
			var selectedRecords;
			var ipList;
			var msg = '';
			var buttons;
			var title;
			var icon;

			// get data from grid2
			selModel = grid.getSelectionModel();

			// returns an array of selected records
			selectedRecords = selModel.getSelections();

			// convert data array into a json string
			var delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				delList[i] = selectedRecords[i].data.userName;
			}
			var convertBtn = Ext.getCmp('users_convertBtn');
			users_delBtn.disable();
			if (convertBtn) {
				convertBtn.disable();
			}

			var delList_jsonFormat = Ext.util.JSON.encode(delList);

			Ext.MessageBox.show({
				title: S('warning_box_title'),
				msg: S('usr_del_warning'),
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.WARNING,
				fn: function (btn) {
					user_deleteBtnHandler(userForm, delList_jsonFormat, btn);
				}
			});
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="usrHeader" class="x-grid3-hd-checker"> </div>'
	});

	sm.addListener('rowselect', usrRowSelectFn);
	sm.addListener('rowdeselect', usrRowDeselectFn);

	var cm = new Ext.grid.ColumnModel([
	sm,
	{
		id: 'userName',
		header: S('user'),
		width: 180,
		sortable: true,
		dataIndex: 'userName'
	}]);

	cm.setRenderer(0, hideCheckbox_user);

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		}, {
			name: 'value'
		}]
	});

	var searchbox = new Ext.form.ComboBox({
		id: ID_USR_GRP_TOP_SEARCH_COMBO,
		hideLabel: true,
		allowBlank: true,
		editable: true,
		store: searchComboStore,
		selectOnFocus: false,
		displayField: 'value',
		valueField: 'name',
		typeAhead: false,
		mode: 'local',
		hideTrigger: true,
		listWidth: 110,
		width: 110,
		listeners: {
			select: function (c, r, i) {
				var gridIndex = r.get('name');
				sm.selectRow(gridIndex, false); // (index, keepSelected)
				grid.getView().focusRow(gridIndex);
				c.clearValue();
			},
			specialkey: function (searchbox, e) {
				if (e.getKey() == e.ENTER) {
					var val = searchbox.getValue();
					var found = searchComboStore.find('name', val, 0, false, false)
					if (found == -1) {
						msgBox_usingDictionary('error_box_title', 'usr_doesNotExist', Ext.Msg.OK, Ext.MessageBox.ERROR);
					}
				}
			}
		}
	});

	var toolbar = new Ext.Toolbar({
		autoHeight: true,
		items: ['->', S('searchBox_find'), ' ', searchbox]
	});

	var grid = new Ext.grid.GridPanel({
		id: 'localUsersGrid',
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 376,
		frame: true,
		height: 600,
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: toolbar,
		stripeRows: true,
		listeners: {
			sortchange: function () {
				update_combo_search(grid, searchbox, 'userName');
			},
			render: function (g) {
				g.getSelectionModel().selectRow(0);
			},
			delay: 10 // Allow rows to be rendered.
		},
		autoExpandColumn: 'userName'
	});

	var nameField = new Ext.form.TextField({
		fieldLabel: S('usr_field_username'),
		name: 'userName',
		width: 240,
		readOnly: true
	});

	var userId = new Ext.form.NumberField({
		fieldLabel: S('usr_field_userId'),
		name: 'userId',
		width: 240,
		allowBlank: false,
		readOnly: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_USER_ID
		}
	});

	var descField = new Ext.form.TextField({
		fieldLabel: S('usr_field_desc'),
		id: 'userDesc',
		name: 'userDesc',
		width: 240,
		readOnly: true
	});

	var primGroup = new Ext.form.TextField({
		fieldLabel: S('usr_field_primGroup'),
		id: 'primGroup',
		name: 'primGroup',
		width: 240,
		readOnly: true
	});

	var users_editBtn = new Ext.Button({
		id: 'users_editBtn',
		name: 'users_editBtn',
		style: 'padding:10px',
		iconCls: 'edit',
		disabled: true,
		text: S('usr_btn_editNewUser'),
		handler: function () {
			users_editBtnHandler();
		}
	});

	var users_disableBtn = new Ext.Button({
		id: 'users_disableBtn',
		name: 'users_disableBtn',
		hidden: true
	});

	var localUserFs = new Ext.form.FieldSet({
		name: 'localUserFs',
		labelWidth: 105,
		itemCls: 'details-label',
		cls: 'fieldset-painted',
		defaultType: 'textfield',
		height: 200,
		bodyStyle: Ext.isIE ? 'padding:0 0 5px 15px;' : 'padding:10px 15px;',
		border: true,
		style: {
			"margin-left": "10px",
			// when you add custom margin in IE 6...
			"margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0" // you have to adjust for it somewhere else
		},
		items: [nameField, userId, descField, primGroup],
		buttonAlign: 'left',
		buttons: [users_editBtn, users_disableBtn]
	});

	var title = S('usr_usrDetails');

	var csv_content = new Ext.form.TextArea({
		name: 'csv_content',
		id: 'csv_content',
		fieldLabel: S('user_csv_import_label'),
		width: 400,
		height: 150
	});

/*
	var usr_csv_browseBtn = new Ext.Button({
		id: 'usr_csv_browseBtn',
		text: S('usr_btn_browse'),
		handler: function(){
		}
	});
*/

	var csv_import = new Ext.Button({
		id: 'csv_import',
		text: S('user_csv_import_button'),
		handler: function () {
			fileUpdateFormHandler(userForm, csv_content);
		}
	});

/*
	var usr_csv_export = new Ext.Button({
		id: 'usr_csv_export',
		text: S('usr_btn_csv_export'),
		handler: function(){
	 		var theForm = userForm.getForm();
			userForm.form.submit({
				url: '/dynamic.pl',
				method: 'GET',
				params: {
					bufaction: 'downloadTest',
					reference:'users'
				},
				waitMsg: S('msg_deleting_data'),
				failure: function(form,action){
				},
				success: function(form,action){
					resetCookie();
				}
			});
		}
	});
*/

	var items = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: 0.50,
			items: [{
				id: 'buttons_section',
				layout: 'column',
				buttonAlign: 'left',
				buttons: [users_addBtn, users_delBtn]
			},
			grid]
		}, {
			columnWidth: 0.50,
			items: [{
				bodyStyle: 'padding:10px',
				html: '<h3>' + title + '<h3>'
			},
			localUserFs]
		}]
	}];

	if (add_csv) {
		items.push({
			html: '<br><br>'
		}, csv_content, csv_import, {
			html: '<br>'
		} /*, usr_csv_export*/ );
	}

	var userForm = new Ext.FormPanel({
		allowDomMove: false,
		id: ID_USER_FORM,
//		itemCls: 'details-label',
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		bodyStyle: 'padding:5px',
		width: 778,
//		layout: 'column',	// Specifies that the items will now be arranged in columns
		items: items
//		fileUpload: true
	});

	cm.setDataIndex(0, 'usr_header_box');
//	userForm.form.fileUpload = true;
	return userForm;
}

function usrRowSelectFn(sm, rowIndex, rec) {
	// enable the delete button
	Ext.getCmp('users_delBtn').enable();

	// get disable button for guest account
	var users_disableBtn = Ext.getCmp('users_disableBtn');

	// get the form object
	var userForm = Ext.getCmp(ID_USER_FORM);

	// get the edit button object
	// In IE, 'users_editBtn = Ext.getCmp('users_editBtn');' is happen error.
	users_editBtn2 = Ext.getCmp('users_editBtn');

	// get the status of the checkbox of the header.
	// If it has "x-grid3-hd-checker-on" in its parent's class, then the checkbox is selected.
	var usrHeader = Ext.get('usrHeader');
	var usrHeaderParent = usrHeader.parent();
	var selectAll = usrHeaderParent.hasClass('x-grid3-hd-checker-on');

	var userName = rec.get('userName');
	var userMode = rec.get('userMode');

	orig_userName = userName;

	if (!selectAll) {
		// single selection
		user_loadDetails(userForm, userName, userMode, false);
	}

	var adminGuest = false;
	if (userMode == "2") {
		users_editBtn2.hide();
		users_disableBtn.show();
		users_disableBtn.setText(S('disable'));
		users_disableBtn.addListener('click', function () {
			set_guest_state('inactivate');
		});
	}
	else if (userMode == "3") {
		users_editBtn2.hide();
		users_disableBtn.show();
		users_disableBtn.setText(S('enable'));
		users_disableBtn.addListener('click', function () {
			set_guest_state('activate');
		});
	}
	else {
		users_editBtn2.show();
		users_disableBtn.hide();
	}

	if (userMode != "0") {
		sm.deselectRow(rowIndex);
		adminGuest = true;
	}
	var convertBtn = Ext.getCmp('users_convertBtn');
	if (convertBtn && !adminGuest) {
		convertBtn.enable();
	}
}

function set_guest_state(mode) {
	var displayForm = Ext.getCmp(ID_USER_FORM);
	var warningMsg;
	if (mode == 'activate') {
		warningMsg = S('usr_enable_guest_warning');
	}
	else {
		warningMsg = S('usr_disable_guest_warning');
	}

	Ext.MessageBox.show({
		title: S('warning_box_title'),
		msg: warningMsg,
		buttons: Ext.MessageBox.OKCANCEL,
		icon: Ext.MessageBox.WARNING,
		fn: function (btn) {
			if (btn == 'ok') {
				displayForm.form.submit({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_SET_USER_ACTIVATE,
						mode: mode
					},
					waitMsg: S('msg_saving_data'),
					failure: function (form, action) {
						formFailureFunction(action);
					},
					success: function (form, action) {
						resetCookie();
						usrGrp_user_processAuth();

//						var grid = Ext.getCmp('localUsersGrid');
//						var store = grid.getStore();
//						var sm = grid.getSelectionModel();
//						var rowIndex = store.find('userName', 'guest', 0, false, false);
//						sm.selectRow(rowIndex);
					}
				});
			}
		}
	});
}

function usrRowDeselectFn(sm, rowIndex, rec) {
	if (sm.getCount() == 0) {
		// enable the delete button
		Ext.getCmp('users_delBtn').disable();
		var convertBtn = Ext.getCmp('users_convertBtn');
		if (convertBtn) {
			convertBtn.disable();
		}
	}

	var userMode = rec.get('userMode');
	var cm = Ext.getCmp('localUsersGrid').getColumnModel();

	if (userMode == '0') {
		// put checkbox only for users other than admin and guest
		cm.setColumnHeader(0, '<div id="usrHeader" class="x-grid3-hd-checker">\&\#160;</div>');
	}
}

function users_convertBtnHandler(userForm, convList_jsonFormat, btn) {
	if (btn == 'ok') {
		userForm.form.submit({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_CONVERT_USER,
				convList: convList_jsonFormat
			},
			waitMsg: S('msg_converting_users'),
			failure: function (form, action) {
				var decodedResponse = Ext.decode(action.response.responseText);
//				user_jsonData = decodedResponse.errors;
			},
			success: function (form, action) {
				resetCookie();
				var usersGrid = Ext.getCmp('localUsersGrid');
				var searchbox = Ext.getCmp(ID_USR_GRP_TOP_SEARCH_COMBO);
				var convertBtn = Ext.getCmp('users_convertBtn');

				var jsonStore = usersGrid.getStore();
				selModel = usersGrid.getSelectionModel();
				selectedRecords = selModel.getSelections();

				// remove the records selected from grid
				for (var i = 0; i < selectedRecords.length; i++) {
					jsonStore.remove(selectedRecords[i]);
				}
				convertBtn.disable();
				update_combo_search(usersGrid, searchbox, 'userName');

				var adminUsrIndex = jsonStore.find('userMode', "1", 0, false);
				var adminUsrRecord = jsonStore.getAt(adminUsrIndex);
				var adminName = adminUsrRecord.get('userName');
				var userMode = adminUsrRecord.get('userMode');

				user_loadDetails(userForm, adminName, userMode, false);
				getLeftPanelInfo(MENU_INDEX_USRGRP);
			}
		});
	}
}

function fileUpdateFormHandler(userForm, csv_content) {
	if (Ext.getCmp('csv_content').getValue() == '') {
//		msgBox_usingDictionary('error_box_title', 'select_file', Ext.Msg.OK, Ext.MessageBox.ERROR);
		msgBox_usingDictionary('error_box_title', 'enter_users', Ext.Msg.OK, Ext.MessageBox.ERROR);
		return;
	}
	userForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_UPLOAD_USER_CSV_IMPORT,
			csv_content: csv_content
		},
		waitMsg: S('uploading'),
		failure: function (form, action) {
/*
			if (action.response){
				var decodedResponse= Ext.decode(action.response.responseText);
				var msgKey = decodedResponse.errors[0];
				msgBox_usingDictionary('error_box_title', msgKey, Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			*/
			formFailureFunction(action);
		},
		success: function (form, action) {
//			msgBox_usingDictionary('', 'file_uploaded', Ext.Msg.OK, Ext.MessageBox.INFO);
			request_operation();
		}
	});
}

function users_addBtnHandler(userForm) {
	userForm.destroy();
	userForm_edit = users_createUserForm(false);

	var p = Ext.getCmp('pwd');
	var cp = Ext.getCmp('confPwd');

	var user_saveBtn = new Ext.Button({
		id: 'user_saveBtn',
		text: S('btn_save'),
		handler: function () {
			if (p.getValue() == cp.getValue()) {
				users_saveBtnHandler(userForm_edit, BUFACT_ADD_USER_SETTINGS);
			}
			else {
				msgBox_usingDictionary('error_box_title', 'password_mismatch', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
		}
	});

	var user_cancelBtn = new Ext.Button({
		id: 'user_cancelBtn',
		text: S('btn_cancel'),
		handler: function () {
			userForm_edit.destroy();
/*
			userForm_display = users_form_display();
			update_header(false, 'user_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
*/
			update_header(false, 'user_header', '');
			createUsrGrpForm();
		}
	});

	userForm_edit.addButton(user_saveBtn);
	userForm_edit.addButton(user_cancelBtn);
	var newUsr = S('user_headerChild_newUsr');
	update_header(true, 'user_header', newUsr);
	updateCentralContainer(USR_GRP_RENDER_TO, userForm_edit);
}

function user_deleteBtnHandler(userForm, delList_jsonFormat, btn) {
	var usersGrid = Ext.getCmp('localUsersGrid');
	var searchbox = Ext.getCmp(ID_USR_GRP_TOP_SEARCH_COMBO);
	var delBtn = Ext.getCmp('users_delBtn');

	var jsonStore = usersGrid.getStore();
	var selModel = usersGrid.getSelectionModel();
	var selectedRecords = selModel.getSelections();

	if (btn == 'ok') {
		userForm.form.submit({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_DEL_USERS,
				delList: delList_jsonFormat
			},
			waitMsg: S('msg_deleting_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();

				// remove the records selected from grid
				for (var i = 0; i < selectedRecords.length; i++) {
					jsonStore.remove(selectedRecords[i]);
				}
				var users_addBtn = Ext.getCmp('users_addBtn');
				if (jsonStore.getCount() < MAX_USR) {
					users_addBtn.enable();
				}
				else {
					users_addBtn.disable();
				}
				delBtn.disable();
				// remove selection of the Header checkbox
				var cm = Ext.getCmp('localUsersGrid').getColumnModel();
				cm.setColumnHeader(0, '<div id="usrHeader" class="x-grid3-hd-checker">\&\#160;</div>');

				update_combo_search(usersGrid, searchbox, 'userName');
				var adminUsrIndex = jsonStore.find('userMode', "1", 0, false);
				var adminUsrRecord = jsonStore.getAt(adminUsrIndex);
				var adminName = adminUsrRecord.get('userName');
				var userMode = adminUsrRecord.get('userMode');

				user_loadDetails(userForm, adminName, userMode, false);
				getLeftPanelInfo(MENU_INDEX_USRGRP);
			}
		});
	}
	else {
		selModel.clearSelections();
	}
}

function users_editBtnHandler() {
	var userForm_edit = users_createUserForm(true);

	var user_saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function () {
			var nameFieldValue = Ext.getCmp('userName').getValue();
			var bufaction = BUFACT_SET_USER_SETTINGS + nameFieldValue;
			var p = Ext.getCmp('pwd');
			var cp = Ext.getCmp('confPwd');

			if (p.getValue() == cp.getValue()) {
				users_saveBtnHandler(userForm_edit, bufaction);
			}
			else {
				msgBox_usingDictionary('error_box_title', 'password_mismatch', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
		}
	});

	var user_cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function () {
			userForm_edit.destroy();
/*
			userForm_display = users_form_display();
			update_header(false, 'user_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
*/
			update_header(false, 'user_header', '');
			createUsrGrpForm();
		}
	});

	userForm_edit.addButton(user_saveBtn);
	userForm_edit.addButton(user_cancelBtn);
	update_header(true, 'user_header', user_jsonData.userName);

	if (user_jsonData.userMode == '1') {
		var userId = Ext.getCmp('userId');
		userId.minValue = 0;
		format_as_label(0, 1, 1, 0, 0, 1, 0, 0);
		userForm_edit.remove('quota');
		userForm_edit.remove('quota_soft');
		userForm_edit.remove('quota_hard');
	}

	updateCentralContainer(USR_GRP_RENDER_TO, userForm_edit);
	userForm_edit.form.setValues(user_jsonData);

	// get the list of groups that this user belong to & update combo
	var memberOf = user_jsonData.memberOf;
	var primGroupOpt = [];

	for (var i = 0; i < memberOf.length; i++) {
		var member = memberOf[i];
		primGroupOpt[i] = new Array();
		primGroupOpt[i][0] = member;
		primGroupOpt[i][1] = member;
	}
	primGroup = Ext.getCmp('primGroup_combo');
	primGroupStore = primGroup.store;
	primGroupStore.loadData(primGroupOpt);
}

function users_saveBtnHandler(userForm, bufaction) {
	var username = Ext.getCmp('userName').getValue();

	var quota_soft_field = Ext.getCmp('quota_soft');
	var quota_hard_field = Ext.getCmp('quota_hard');

	var quota_soft;
	var quota_hard;

	if (quota_soft_field) {
		quota_soft = quota_soft_field.getValue();
	}
	if (quota_hard_field) {
		quota_hard = quota_hard_field.getValue();
	}

	userForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			quota_soft: quota_soft,
			quota_hard: quota_hard
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			var decodedResponse = Ext.decode(action.response.responseText);
			user_jsonData = decodedResponse.data;
			userForm.destroy();
/*
			userForm_display = users_form_display();
			update_header(false, 'user_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
*/
			getLeftPanelInfo(MENU_INDEX_USRGRP);
			update_header(false, 'user_header', '');
			createUsrGrpForm();
		}
	});
}

function format_as_label(un, id, desc, pwd, confpwd, pg, quota, qsize) {
	if (un) {
		var userName = Ext.getCmp('userName');
		userName.readOnly = true;
		userName.itemCls = 'display-label';
	}

	if (id) {
		var userId = Ext.getCmp('userId');
		userId.readOnly = true;
		userId.itemCls = 'display-label';
	}

	if (desc) {
		var userDesc = Ext.getCmp('userDesc');
		userDesc.readOnly = true;
		userDesc.itemCls = 'display-label';
	}

	if (pwd) {
		var pass = Ext.getCmp('pwd');
		pass.readOnly = true;
		pass.itemCls = 'display-label';
	}

	if (confpwd) {
		var cpwd = Ext.getCmp('confPwd');
		cpwd.readOnly = true;
		cpwd.itemCls = 'display-label';
	}

	if (pg) {
		var pG = Ext.getCmp('primGroup_combo');
		pG.itemCls = 'display-label';
		pG.triggerAction = 'none';
		pG.hideTrigger = true;
		pG.editable = true;
		pG.readOnly = true;
		pG.on({
			beforequery: function () {
				return false;
			}
		});
	}

	if (quota) {
		var q = Ext.getCmp('quota');
		if (q) {
			q.itemCls = 'display-label-checkbox';
			q.disable();
		}
	}

	if (qsize) {
		var quotaSize = Ext.getCmp('quota_hard');
		if (quotaSize) {
			quotaSize.enable();
			quotaSize.readOnly = true;
			quotaSize.itemCls = 'display-label';
			quotaSize.disable();
		}
		var quotaSize_soft = Ext.getCmp('quota_soft');
		if (quotaSize_soft) {
			quotaSize_soft.enable();
			quotaSize_soft.readOnly = true;
			quotaSize_soft.itemCls = 'display-label';
			quotaSize_soft.disable();
		}
	}
}

function usersOnly_saveBtnHandler(userForm, bufaction) {
	userForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			not_admin: 1,
			orig_userName: orig_userName
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			msgBox_usingDictionary('', 'msg_commitedChanges', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}

function users_createUserForm(edit) {
	p = '********************';

	var nameField = new Ext.form.TextField({
		fieldLabel: S('usr_field_username'),
		id: 'userName',
		name: 'userName',
		width: 300,
		listeners: {
			change: function (nameField, value) {
				if (user_jsonData.userName != value) {
					pwd.setValue('');
					pwd.clearInvalid();
					confPwd.setValue('');
					confPwd.clearInvalid();
				}
			}
		},
		allowBlank: false
	});

	var userId = new Ext.form.NumberField({
		fieldLabel: S('usr_field_userId'),
		id: 'userId',
		name: 'userId',
//		allowBlank: false,
		width: 100,
		baseChars: '0123456789',
		maskRe: /[0-9]/,
		minValue: USER_ID_MIN,
		maxValue: USER_ID_MAX,
		validateOnBlur: true,
		minText: S('usr_id_validId') + USER_ID_MIN + "-" + USER_ID_MAX,
		maxText: S('usr_id_validId') + USER_ID_MIN + "-" + USER_ID_MAX,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_USER_ID
		}
	});

	var descField = new Ext.form.TextField({
		fieldLabel: S('usr_field_desc'),
		id: 'userDesc',
		name: 'userDesc',
		width: 300
	});

	var pwd = new Ext.form.TextField({
		id: 'pwd',
		fieldLabel: S('usr_field_pwd'),
		name: 'pwd',
		inputType: 'password',
		width: 300,
		allowBlank: false
	});

	var confPwd = new Ext.form.TextField({
		id: 'confPwd',
		fieldLabel: S('usr_field_confPwd'),
		name: 'confPwd',
		inputType: 'password',
		width: 300,
		allowBlank: false
	});

	if (edit) {
		pwd.setValue(p);
		confPwd.setValue(p);
	}

	var primGroupOpt = [
		['hdusers', 'hdusers']
	];

	var primGroupStore = new Ext.data.SimpleStore({
		data: primGroupOpt,
		fields: ['val', 'opt']
	});

	var primGroup = new Ext.form.ComboBox({
		id: 'primGroup_combo',
		hiddenName: 'primGroup',
		editable: false,
		fieldLabel: S('usr_field_primGroup'),
		store: primGroupStore,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 200,
		width: 200,
		value: 'hdusers'
	});

	var quota = new Ext.form.Checkbox({
		fieldLabel: S('usr_field_quota'),
		boxLabel: S('usr_field_quota_enable'),
		id: 'quota',
		name: 'quota',
		listeners: {
			check: function (quota, checked) {
				if (checked) {
					this.checked = true;
					quota_soft.enable();
					quota_hard.enable();
				}
				else {
					quota_soft.disable();
					quota_hard.disable();
					quota_hard.clearInvalid();
				}
			}
		},
		value: 'on'
	});

	var quota_soft = new Ext.form.NumberField({
		fieldLabel: S('usr_field_quota_size_soft'),
		id: 'quota_soft',
		name: 'quota_soft',
		width: 80,
//		maxLength: 4,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_QUOTA_LENGTH
		},
		allowBlank: true,
		allowDecimals: false,
		allowNegative: false,
//		maskRe: /[0-9]/,
		baseChars: '0123456789',
		disabled: true
	});

	var quota_hard = new Ext.form.NumberField({
		fieldLabel: S('usr_field_quota_size_hard'),
		id: 'quota_hard',
		name: 'quota_hard',
		width: 80,
//		maxLength: 4,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_QUOTA_LENGTH
		},
		allowBlank: false,
		allowDecimals: false,
		allowNegative: false,
//		maskRe: /[0-9]/,
		baseChars: '0123456789',
		disabled: true
	});

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	}, {
		name: 'msg'
	}]);

	var jReader = new Ext.data.JsonReader({
		root: 'data',
		successProperty: 'success'
	}, [{
		name: 'userName'
	}, {
		name: 'userDesc'
	}, {
		name: 'userId'
	}, {
		name: 'primGroup'
	}, {
		name: 'quota'
	}, {
		name: 'quota_soft'
	}, {
		name: 'quota_hard'
	}]);

	var items;
	if (user_add_quota) {
		if (user_add_quota_soft) {
			items = [nameField, userId, descField, pwd, confPwd, primGroup, quota, quota_soft, quota_hard];
		}
		else {
			items = [nameField, userId, descField, pwd, confPwd, primGroup, quota, quota_hard];
		}
	}
	else {
		items = [nameField, userId, descField, pwd, confPwd, primGroup];
	}

	var userForm = new Ext.FormPanel({
		allowDomMove: false,
		id: ID_USER_FORM,
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		width: GLOBAL_WIDTH_FORM,
		items: items,
		buttonAlign: 'left'
//		buttons: [user_saveBtn, user_cancelBtn]
	});

	return userForm;
}

function user_loadDetails(userForm, username, userMode, userOnly) {
	orig_userName = username;

	userForm.form.load({
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		params: {
			bufaction: BUFACT_GET_USER_SETTINGS + username
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
//			Ext.getCmp("userForm").getForm().load(rec);
			var decodedResponse = Ext.decode(action.response.responseText);
			user_jsonData = decodedResponse.data[0]; // Only one record was returned
			if (!userOnly) {
				var grid = Ext.getCmp('localUsersGrid');
				var sm = grid.getSelectionModel();
				var users_editBtn = Ext.getCmp('users_editBtn');

				if (userMode == '3') {
					users_editBtn.disable();
				}
				else if (userMode == '1' && userPageMode != '0') {
					users_editBtn.disable();
				}
				else {
					users_editBtn.enable();
				}
				user_format_fields();
			}
			else {
				Ext.getCmp('userId').clearInvalid();
			}
		}
	});
}

function hideCheckbox_user(value, p, record) {
	var userMode = record.data.userMode;

//	if (record.data.userName == 'admin' || record.data.userName == 'guest') {
	if (userMode != 0) {
		return '';
	}

	return '<div class="x-grid3-row-checker"> </div>';
}

function display_user_only(userName) {
	var userForm = users_createUserForm(true);
	var p = Ext.getCmp('pwd');
	var cp = Ext.getCmp('confPwd');
	var user_saveBtn = new Ext.Button({
		id: 'user_saveBtn',
		text: S('btn_save'),
		handler: function () {
			var bufaction;
			bufaction = BUFACT_SET_USER_SETTINGS + userName;

			if (p.getValue() == cp.getValue()) {
				usersOnly_saveBtnHandler(userForm, bufaction);
			}
			else {
				msgBox_usingDictionary('error_box_title', 'password_mismatch', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
		}
	});

	userForm.addButton(user_saveBtn);

	if (userName == 'guest') {
		format_as_label(1, 1, 1, 1, 1, 1, 1, 1);
		user_saveBtn_cmp = Ext.getCmp('user_saveBtn');
		user_saveBtn_cmp.disable();
	}
	else {
		format_as_label(1, 1, 1, 0, 0, 1, 1, 1);
	}

	update_header(true, 'user_header', userName);
	updateCentralContainer(USR_GRP_RENDER_TO, userForm);
	user_loadDetails(userForm, userName, '', true);
}

function user_format_fields() {
	var descField = Ext.getCmp('userDesc');
	var desc = descField.getValue();
	if (desc.length >= 26) {
		var newDesc = desc.substring(0, 25);
		newDesc += '...';
		descField.setValue(newDesc);
	}
}
