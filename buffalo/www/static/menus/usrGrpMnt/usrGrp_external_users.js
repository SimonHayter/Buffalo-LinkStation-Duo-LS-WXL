var external_user_jsonData;
var user_add_quota;

function external_users_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				userForm_display = external_users_form_display();
				updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function external_users_form_display() {
	// turn on validation errors beside the field globally
//	Ext.form.Field.prototype.msgTarget = 'side';
	var bd = Ext.getBody();

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		baseParams: {
			bufaction: BUFACT_GET_ALL_EXTERNAL_USERS
		},
		fields: [{
			name: 'userName'
		}, {
			name: 'userDesc'
		}]
	});

	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				update_combo_search(grid, searchbox, 'userName');

				sm.selectFirstRow(); // to load the details of the first record
				sm.clearSelections(); // to remove the selection of the first record after loading its details
				if (!jsonStore.reader.jsonData.data[0]) {
					var MaskElems = Ext.DomQuery.select('.ext-el-mask');
					Ext.get(MaskElems[0].id).hide();
				}
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
		name: 'userId'
	}, {
		name: 'primGroup'
	}, {
		name: 'file'
	}, ]);

	var users_addBtn = new Ext.Button({
		id: 'users_addBtn',
		name: 'users_addBtn',
		iconCls: 'add',
		text: S('usr_btn_createNewUser'),
		handler: function () {
			external_users_addBtnHandler(userForm);
		}
	});

	var external_users_delBtn = new Ext.Button({
		id: 'external_users_delBtn',
		name: 'external_users_delBtn',
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
//			usersGrid = Ext.getCmp('externalUsersGrid');
			selModel = grid.getSelectionModel();
			selectedRecords = selModel.getSelections(); // returns an array of selected records

			// convert data array into a json string
			var delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				delList[i] = selectedRecords[i].data.userName;
			}

			var delList_jsonFormat = Ext.util.JSON.encode(delList);
			Ext.MessageBox.show({
				title: S('warning_box_title'),
				msg: S('usr_del_warning'),
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.WARNING,
				fn: function (btn) {
					external_user_deleteBtnHandler(externalUserForm, delList_jsonFormat, btn);
				}
			});
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="extUsrHeader" class="x-grid3-hd-checker"> </div>',
//		singleSelect: true,
		listeners: {
			rowselect: function (sm, rowIndex, rec) {
				// get the status of the checkbox of the header.  If it has "x-grid3-hd-checker-on" in its parent's class, then the checkbox is selected.
				var extUsrHeader = Ext.get('extUsrHeader');
				var extUsrHeaderParent = extUsrHeader.parent();
				var selectAll = extUsrHeaderParent.hasClass('x-grid3-hd-checker-on');

				if (!selectAll) {
					// single selection
					external_user_loadDetails(externalUserForm, rec.get('userName'), false);
				}
				external_users_delBtn.enable();

				var userName = rec.get('userName');
				users_editBtn.disable();

				var convertBtn = Ext.getCmp('users_convertBtn');
				if (convertBtn) {
					convertBtn.enable();
				}
			},
			rowdeselect: function (sm, rowIndex, rec) {
				if (sm.getCount() == 0) {
					external_users_delBtn.disable();
					var convertBtn = Ext.getCmp('users_convertBtn');
					if (convertBtn) {
						convertBtn.disable();
					}
				}
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
	sm,
	{
		id: 'userName',
		header: S('user'),
		width: 180,
		sortable: true,
		dataIndex: 'userName'
	}]);

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		}, // option
		{
			name: 'value'
		} // value
		]
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
		id: 'externalUsersGrid',
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
		id: 'userName',
		name: 'userName',
		width: 250,
		readOnly: true
	});

	var userId = new Ext.form.NumberField({
		fieldLabel: S('usr_field_userId'),
		name: 'userId',
		width: 250,
		allowBlank: true,
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
		width: 250,
		readOnly: true
	});

	var primGroup = new Ext.form.TextField({
		fieldLabel: S('usr_field_primGroup'),
		id: 'primGroup',
		name: 'primGroup',
		width: 250,
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
			external_users_editBtnHandler();
		}
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
		buttons: [users_editBtn]

	});
	var title = S('usr_usrDetails');
	var usr_csv_export = new Ext.Button({
		id: 'usr_csv_export',
		text: S('usr_btn_csv_export'),
		handler: function () {
			var theForm = externalUserForm.getForm();
			externalUserForm.form.submit({
				url: '/dynamic.pl',
				method: 'GET',
				params: {
					bufaction: 'downloadTest',
					reference: 'users'
				},
				waitMsg: S('msg_deleting_data'),
				failure: function (form, action) {},
//				failure:function(form,action) {formFailureFunction(action);},
				success: function (form, action) {
					resetCookie();
				}
			});
		}
	});

	var items = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: 0.50,
			items: [{
				layout: 'column',
				buttonAlign: 'left',
				buttons: [ /*users_addBtn,*/
				external_users_delBtn]
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

	var externalUserForm = new Ext.FormPanel({
		id: ID_EXTERNAL_USERS_FORM,
		itemCls: 'details-label',
		frame: false,
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		bodyStyle: 'padding:5px',
		width: 778,
//		layout: 'column', // Specifies that the items will now be arranged in columns
		items: items
	});

	return externalUserForm;
}

function external_users_addBtnHandler(userForm) {
	userForm.destroy();
	userForm_edit = external_users_createUserForm(false);

	var user_saveBtn = new Ext.Button({
		id: 'user_saveBtn',
		text: S('btn_save'),
		handler: function () {
			external_users_saveBtnHandler(userForm_edit, BUFACT_ADD_USER_SETTINGS);
		}
	});

	var user_cancelBtn = new Ext.Button({
		id: 'user_cancelBtn',
		text: S('btn_cancel'),
		handler: function () {
			userForm_edit.destroy();
			userForm_display = external_users_form_display();
			update_header(false, 'external_users_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
		}
	});
	userForm_edit.addButton(user_saveBtn);
	userForm_edit.addButton(user_cancelBtn);
	var newUsr = S("user_headerChild_newUsr");
	update_header(true, 'external_users_header', newUsr);
	updateCentralContainer(USR_GRP_RENDER_TO, userForm_edit);
}

function external_user_deleteBtnHandler(userForm, delList_jsonFormat, btn) {
	var usersGrid = Ext.getCmp('externalUsersGrid');
	var jsonStore = usersGrid.getStore();
	selModel = usersGrid.getSelectionModel();

	if (btn == 'ok') {
		userForm.form.submit({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_DEL_EXTERNAL_USERS,
				delList: delList_jsonFormat
			},
			waitMsg: S('msg_deleting_data'),
			failure: function (form, action) {
				formFailureFunction(action.failureType);
			},
			success: function (form, action) {
				resetCookie();
				var searchbox = Ext.getCmp(ID_USR_GRP_TOP_SEARCH_COMBO);
				var delBtn = Ext.getCmp('external_users_delBtn');

				selectedRecords = selModel.getSelections();

				// remove the records selected from grid 
				for (var i = 0; i < selectedRecords.length; i++)
				jsonStore.remove(selectedRecords[i]);

				delBtn.disable();
				update_combo_search(usersGrid, searchbox, 'userName');
				userForm.form.reset();
				getLeftPanelInfo(MENU_INDEX_USRGRP);
			}
		});
	}
	else {
		selModel.clearSelections();
	}
}

function external_users_editBtnHandler() {
	var userForm_edit = external_users_createUserForm(true);

	var user_saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function () {
			var nameFieldValue = Ext.getCmp('userName').getValue();
			var bufaction = BUFACT_SET_USER_SETTINGS + nameFieldValue;
			external_users_saveBtnHandler(userForm_edit, bufaction);
		}
	});

	var user_cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function () {
			userForm_edit.destroy();
			userForm_display = external_users_form_display();
			update_header(false, 'external_users_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
		}
	});
	userForm_edit.addButton(user_saveBtn);
	userForm_edit.addButton(user_cancelBtn);
	update_header(true, 'external_users_header', external_user_jsonData.userName);

	updateCentralContainer(USR_GRP_RENDER_TO, userForm_edit);
	userForm_edit.form.setValues(external_user_jsonData);

	// get the list of groups that this user belong to & update combo
	var memberOf = external_user_jsonData.memberOf;
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

function external_users_saveBtnHandler(userForm, bufaction) {
	var username = Ext.getCmp('userName').getValue();

	userForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			var decodedResponse = Ext.decode(action.response.responseText);
			external_user_jsonData = decodedResponse.data;
			userForm.destroy();
			userForm_display = external_users_form_display();
			update_header(false, 'external_users_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
			getLeftPanelInfo(MENU_INDEX_USRGRP);
		}
	});
}

function external_users_createUserForm(edit) {
	var nameField = new Ext.form.TextField({
		fieldLabel: S('usr_field_username'),
		id: 'externalUserName',
		name: 'userName',
		width: 300,
		allowBlank: false,
		itemCls: 'display-label'
	});

	var userId = new Ext.form.NumberField({
		fieldLabel: S('usr_field_userId'),
		id: 'userId',
		name: 'userId',
//		allowBlank: false,
		width: 100,
		baseChars: '0123456789',
		maskRe: /[0-9]/,
		minValue: GROUP_ID_MIN,
		maxValue: GROUP_ID_MAX,
		validateOnBlur: true,
		minText: S('usr_id_validId') + GROUP_ID_MIN + "-" + GROUP_ID_MAX,
		maxText: S('usr_id_validId') + GROUP_ID_MIN + "-" + GROUP_ID_MAX,
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
//		maskRe : /[0-9]/,
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
//		maskRe : /[0-9]/,
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
			items = [nameField, userId, descField, primGroup, quota, quota_soft, quota_hard];
		}
		else {
			items = [nameField, userId, descField, primGroup, quota, quota_hard];
		}
	}
	else {
		items = [nameField, userId, descField, primGroup];
	}

	var externalUserForm = new Ext.FormPanel({
		id: ID_EXTERNAL_USERS_FORM,
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		width: GLOBAL_WIDTH_FORM,
		items: items,
		buttonAlign: 'left'
//		buttons: [user_saveBtn, user_cancelBtn]
	});

	return externalUserForm;
}

function external_user_loadDetails(userForm, username, userOnly) {
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
			external_user_jsonData = decodedResponse.data[0]; // Only one record was returned
			if (!userOnly) {
				var grid = Ext.getCmp('externalUsersGrid');
				var sm = grid.getSelectionModel();
				var users_editBtn = Ext.getCmp('users_editBtn');
				users_editBtn.enable();
				user_format_fields();
			}
		}
	});
}
