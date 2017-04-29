var group_jsonData;
var admin_name;
var admin_edit_flag = 0;

function usrGrp_group_processAuth() {
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

				groupForm_display = groups_form_display();

				// get grid
				var groupsGrid = Ext.getCmp('localGroupsGrid');

				// get selection model
				var sm = groupsGrid.getSelectionModel();

				// modify listener (if group => admin then gray out edit button
				sm.purgeListeners();
				sm.addListener('rowselect', rowSelectFn);
				sm.addListener('rowdeselect', rowDeselectFn);

				updateCentralContainer(USR_GRP_RENDER_TO, groupForm_display);
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function usrGrp_group_restrict_processAuth() {
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
				groupForm_display = groups_form_display();

				// get grid
				var groupsGrid = Ext.getCmp('localGroupsGrid');

				// get selection model
				var sm = groupsGrid.getSelectionModel();

				// modify listener (if group => admin then gray out edit button)
				sm.purgeListeners();
//				sm.addListener('rowselect',rowSelectFn_restrict);
				sm.addListener('rowselect', rowSelectFn);
				sm.addListener('rowdeselect', rowDeselectFn);

				updateCentralContainer(USR_GRP_RENDER_TO, groupForm_display);
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

/*
function rowSelectFn_restrict(sm, rowIndex, rec) {
	var selected = sm.getCount();
	Ext.getCmp('groups_delBtn').enable();
	var groupForm = Ext.getCmp('groupForm');
	var groups_editBtn = Ext.getCmp('groups_editBtn');
	group_loadDetails(groupForm, rec.get('groupName'));

	if (rec.get('groupName') == 'admin' || rec.get('groupName') == 'guest' || rec.get('groupName') == 'hdusers') {
		sm.deselectRow(rowIndex);
	}
	groups_editBtn.disable();
}
*/

function rowSelectFn(sm, rowIndex, rec) {
	var selected = sm.getCount();
	var groupForm = Ext.getCmp('groupForm');

	// get the status of the checkbox of the header.  If it has "x-grid3-hd-checker-on" in its parent's class, then the checkbox is selected.
	var grpHeader = Ext.get('grpHeader');
	var grpHeaderParent = grpHeader.parent();
	var selectAll = grpHeaderParent.hasClass('x-grid3-hd-checker-on');

	if (!selectAll) {
		// single selection
		group_loadDetails(groupForm, rec.get('groupName'));
	}

	Ext.getCmp('groups_delBtn').enable();
//	var groups_editBtn = Ext.getCmp('groups_editBtn');
//	groups_editBtn.disable();
	if (rec.get('groupName') == 'guest' || rec.get('groupName') == 'hdusers' || rec.get('groupName') == 'admin') {
		sm.deselectRow(rowIndex);
	}
}

function rowDeselectFn(sm, rowIndex, rec) {
	var groupName = rec.get('groupName');

	// get grid
	var groupsGrid = Ext.getCmp('localGroupsGrid');
	var cm = groupsGrid.getColumnModel();
	if (sm.getCount() == 0) {
		Ext.getCmp('groups_delBtn').disable();
	}

	if (groupName != 'guest' && groupName != 'admin' && groupName != 'hdusers') {
		cm.setColumnHeader(0, '<div id="grpHeader" class="x-grid3-hd-checker">\&\#160;</div>');
	}
}

function groups_form_display() {
	Ext.QuickTips.init();

	// turn on validation errors beside the field globally
//	Ext.form.Field.prototype.msgTarget = 'side';
	var bd = Ext.getBody();

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		baseParams: {
			bufaction: BUFACT_GET_ALL_GROUPS
		},
		fields: [{
			name: 'groupName'
		}, {
			name: 'totalMembers'
		}]
	});

	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				if (jsonStore.getCount() < MAX_GRP) {
					groups_addBtn.enable();
				}
				else {
					groups_addBtn.disable();
				}
				update_combo_search(grid, searchbox, 'groupName');
//				sm.selectFirstRow();
				group_loadDetails(groupForm, 'admin');
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
		name: 'groupName'
	}, {
		name: 'groupDesc'
	}, {
		name: 'groupId'
	}, {
		name: 'quota_soft'
	}, {
		name: 'quota_hard'
	}]);
	var groups_addBtn = new Ext.Button({
		id: 'groups_addBtn',
		name: 'groups_addBtn',
		disabled: true,
		iconCls: 'add',
		text: S('group_btn_createNewGroup'),
		handler: function () {
			groups_addBtnHandler(groupForm);
		}
	});
	var groups_delBtn = new Ext.Button({
		id: 'groups_delBtn',
		name: 'groups_delBtn',
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
			selectedRecords = selModel.getSelections(); // returns an array of selected records

			// convert data array into a json string
			var delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				delList[i] = selectedRecords[i].data.groupName;
			}

			var delList_jsonFormat = Ext.util.JSON.encode(delList);
			Ext.MessageBox.show({
				title: S('warning_box_title'),
				msg: S('group_del_warning'),
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.WARNING,
				fn: function (btn) {
					group_deleteBtnHandler(groupForm, delList_jsonFormat, btn);

				}
			});
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="grpHeader" class="x-grid3-hd-checker"> </div>'
	});

	sm.addListener('rowselect', rowSelectFn);
	sm.addListener('rowdeselect', rowDeselectFn);

	var cm = new Ext.grid.ColumnModel([
	sm,
	{
		id: 'groupName',
		header: S('group'),
		width: 100,
		sortable: true,
		dataIndex: 'groupName'
	}, {
		id: 'totalMembers',
		header: S('group_field_members'),
		width: 70,
		sortable: true,
		dataIndex: 'totalMembers'
	}]);

	// hide checkboxes for some rows
	cm.setRenderer(0, hideCheckbox_group);

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
		selectOnFocus: true,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
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
					var found = searchComboStore.find('name', val, 0, false, false);
					if (found == -1) {
						msgBox_usingDictionary('error_box_title', 'group_doesNotExist', Ext.Msg.OK, Ext.MessageBox.ERROR);
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
		id: 'localGroupsGrid',
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 376,
		frame: true,
//		autoHeight: 'on',
//		maxHeight : 50,
		height: 600,
		enableColumnMove: false,
		enableHdMenu: false,
		tbar: toolbar,
		stripeRows: true,
		listeners: {
			sortchange: function () {
				update_combo_search(grid, searchbox, 'groupName');
			},
			render: function (g) {
				g.getSelectionModel().selectRow(0);
			},
			delay: 10 // Allow rows to be rendered.
		},
		autoExpandColumn: 'groupName'
	});

	var nameField = new Ext.form.TextField({
		fieldLabel: S('group_field_groupname'),
		name: 'groupName',
		width: 200,
		readOnly: true
	});

	var groupId = new Ext.form.NumberField({
		fieldLabel: S('group_field_groupId'),
		name: 'groupId',
		width: 200,
		readOnly: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GROUP_ID
		}
	});

	var descField = new Ext.form.TextField({
		fieldLabel: S('group_field_desc'),
		id: 'groupDesc',
		name: 'groupDesc',
		width: 200,
		readOnly: true
	});

/*
	var members = new Ext.form.TextArea({
		fieldLabel: S('grp_groupMembers'),
		id: 'members',
		name: 'members',
		width: 200,
//		maxLenght: 20,
//		value: memberListSub,
		disabled: true
	});
*/

	var csv_input = new Ext.form.TextArea({
		fieldLabel: S('csv_input'),
		id: 'members',
		name: 'members',
		width: 200
	});

	var groups_editBtn = new Ext.Button({
		id: 'groups_editBtn',
		name: 'groups_editBtn',
		style: 'padding:10px',
		iconCls: 'edit',
		disabled: true,
		text: S('group_btn_editNewGroup'),
		handler: function () {
			groups_editBtnHandler();
		}
	});
	var localGroupFs = new Ext.form.FieldSet({
		name: 'localGroupFs',
		labelWidth: 105,
		cls: 'fieldset-painted',
		itemCls: 'details-label',
//		defaults: {width: 140},	// Default config options for child items
		defaultType: 'textfield',
		height: 200,
		bodyStyle: Ext.isIE ? 'padding:0 0 5px 15px;' : 'padding:10px 15px;',
		border: true,
		style: {
			"margin-left": "10px",
			// when you add custom margin in IE 6...
			"margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0" // you have to adjust for it somewhere else
		},
		items: [nameField, groupId, descField /*, members*/ ],
		buttonAlign: 'left',
		buttons: [groups_editBtn]

	});

	var title = S('group_grpDetails');

/*
	var usr_csv_import = new Ext.Button({
		id: 'usr_csv_import',
		text: S('usr_btn_csv_import'),
		handler: function () {}
	});

	var usr_csv_export = new Ext.Button({
		id: 'usr_csv_export',
		text: S('usr_btn_csv_export'),
		handler: function () {}
	});
*/

	var items = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: 0.50,
			items: [{
				layout: 'column',
				buttonAlign: 'left',
				buttons: [groups_addBtn, groups_delBtn]
			},
			grid]
		}, {
			columnWidth: 0.50,
			items: [{
				bodyStyle: 'padding:10px',
				html: '<h3>' + title + '<h3>'
			},
			localGroupFs]
		}]
	}]

/*
	if (add_csv){
		items.push({
				html: '<br><br>'
			}
		);
	}
*/

	var groupForm = new Ext.FormPanel({
		id: ID_GROUP_FORM,
//		itemCls: 'details-label',
		frame: false,
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		bodyStyle: 'padding:5px',
		width: 778,
		items: items
	});

	return groupForm;
}

function groups_addBtnHandler(groupForm) {
	groupForm.destroy();
	groupForm_edit = groups_createUserForm(false);
	var newGrp = S('group_headerChild_newGrp');
	update_header(true, 'group_header', newGrp);
	updateCentralContainer(USR_GRP_RENDER_TO, groupForm_edit);
	var groupId = Ext.getCmp('groupId');
	groupId.minValue = GROUP_ID_MIN;
}

function group_deleteBtnHandler(groupForm, delList_jsonFormat, btn) {
	var groupsGrid = Ext.getCmp('localGroupsGrid');
	var delBtn = Ext.getCmp('groups_delBtn');
	var jsonStore = groupsGrid.getStore();
	selModel = groupsGrid.getSelectionModel();
	selectedRecords = selModel.getSelections();

	if (btn == 'ok') {
		groupForm.form.submit({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_DEL_GROUPS,
				delList: delList_jsonFormat
			},
			waitMsg: S('msg_deleting_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();

				// remove the records selected from grid
				for (var i = 0; i < selectedRecords.length; i++)
				jsonStore.remove(selectedRecords[i]);

				var groups_addBtn = Ext.getCmp('groups_addBtn');
				if (jsonStore.getCount() < MAX_GRP) {
					groups_addBtn.enable();
				}
				else {
					groups_addBtn.disable();
				}

//				selModel.selectFirstRow();
				group_loadDetails(groupForm, 'admin');
				delBtn.disable();

				// remove selection of the Header checkbox
				var cm = Ext.getCmp('localGroupsGrid').getColumnModel();
				cm.setColumnHeader(0, '<div id="grpHeader" class="x-grid3-hd-checker">\&\#160;</div>');
				var searchbox = Ext.getCmp(ID_USR_GRP_TOP_SEARCH_COMBO);

				// update combo
				update_combo_search(groupsGrid, searchbox, 'groupName');
				getLeftPanelInfo(MENU_INDEX_USRGRP);
			}
		});
	}
	else {
		selModel.clearSelections();
	}
}

function groups_editBtnHandler() {
	var groupForm_edit = groups_createUserForm(true);
	var groupName = Ext.getCmp('groupName');

	update_header(true, 'group_header', group_jsonData.groupName);
	updateCentralContainer(USR_GRP_RENDER_TO, groupForm_edit);
	groupForm_edit.form.setValues(group_jsonData);

	var groupId = Ext.getCmp('groupId');
	if (group_jsonData.groupName == 'admin') {
		admin_edit_flag = 1;
		groupId.minValue = 0;
		groups_disable_admin_fields();
	}
	else {
		admin_edit_flag = 0;
		groupId.minValue = GROUP_ID_MIN;
	}

/*
	// get the list of groups that this group belong to & update combo
	var memberOf = group_jsonData.memberOf;
	for (var i = 0; i < memberOf.length; i++) {
		var member = memberOf[i];
		alert('member: ' + member);
		primaryGroupOpt[i] = new Array();
		primaryGroupOpt[i][0] = member;
		primaryGroupOpt[i][1] = member;}
	}
*/
}

function groups_enable_admin_fields() {
	var groupId = Ext.getCmp('groupId');
	var groupName = Ext.getCmp('groupName');
	var groupDesc = Ext.getCmp('groupDesc');

	groupName.enable();
	groupId.enable();
	groupDesc.enable();

}

function groups_disable_admin_fields() {
	var groupId = Ext.getCmp('groupId');
	var groupName = Ext.getCmp('groupName');
	var groupDesc = Ext.getCmp('groupDesc');

	groupName.disable();
	groupId.disable();
	groupDesc.disable();
}

function groups_saveBtnHandler(groupForm, bufaction, members) {
	var groupName = Ext.getCmp('groupName').getValue();

	if (groupName == 'admin') {
		groups_enable_admin_fields();
	}
	groupForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			members: members
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
//			if (groupName == 'admin') {
			if (admin_edit_flag) {
				groups_disable_admin_fields();
			}
		},
		success: function (form, action) {
			resetCookie();
			if (groupName == 'admin') groups_disable_admin_fields();
			var decodedResponse = Ext.decode(action.response.responseText);
			group_jsonData = decodedResponse.data;
			groupForm.destroy();
			groupForm_display = groups_form_display();
			update_header(false, 'group_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, groupForm_display);
			getLeftPanelInfo(MENU_INDEX_USRGRP);
		}
	});
}

function groups_createUserForm(edit) {
	var nameField = new Ext.form.TextField({
		id: 'groupName',
		fieldLabel: S('group_field_groupname'),
		name: 'groupName',
		width: 200,
		allowBlank: false
	});

	var groupId = new Ext.form.NumberField({
		id: 'groupId',
		fieldLabel: S('group_field_groupId'),
		name: 'groupId',
		width: 200,
		baseChars: '0123456789',
		maskRe: /[0-9]/,

		maxValue: GROUP_ID_MAX,
		minText: S('grp_id_validId') + GROUP_ID_MIN + '-' + GROUP_ID_MAX,
		maxText: S('grp_id_validId') + GROUP_ID_MIN + '-' + GROUP_ID_MAX,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_GROUP_ID
		}
	});

	var descField = new Ext.form.TextField({
		fieldLabel: S('group_field_desc'),
		id: 'groupDesc',
		name: 'groupDesc',
		width: 200
	});

	var quota = new Ext.form.Checkbox({
		fieldLabel: S('group_field_quota'),
		boxLabel: S('group_field_quota_enable'),
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
		fieldLabel: S('group_field_quota_size_soft'),
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
		fieldLabel: S('group_field_quota_size_hard'),
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

	// ------ elements to create the left side grid (Users Grid) ---
	var sm_left = new Ext.grid.RowSelectionModel({});
	var cm_left = new Ext.grid.ColumnModel([{
		id: 'userName',
		header: S('name'),
		width: 90,
		dataIndex: 'userName'
	}, {
		id: 'userDesc',
		header: S('usr_field_desc'),
		width: 130,
		dataIndex: 'userDesc'
	}]);

	var store_left = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		}, // option
		{
			name: 'value'
		} // value
		]
	});

	var searchbox_left = new Ext.form.ComboBox({
		id: ID_SEARCH_COMBO_LEFT,
		hideLabel: true,
		allowBlank: true,
		editable: true,
		store: store_left,
		selectOnFocus: true,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
		mode: 'local',
		hideTrigger: true,
		listWidth: 80,
		width: 80,
		listeners: {
			select: function (c, r, i) {
				var gridIndex = r.get('name');
				sm_left.selectRow(gridIndex, false); // (index, keepSelected)
				grid_left.getView().focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var toolbar_left = new Ext.Toolbar({
		autoHeight: true,
		items: ['->', S('searchBox_find'), ' ', searchbox_left]
	});

	var jsonStore_left = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
//			bufaction: BUFACT_GET_ALL_USERS
			bufaction: BUFACT_GET_BOTH_ALL_USERS
		},
		fields: [{
			name: 'userName'
		}, {
			name: 'userDesc'
		}]
	});

	var grid_left = new Ext.grid.GridPanel({
		id: 'grid_left',
		store: jsonStore_left,
		cm: cm_left,
		selModel: sm_left,
		frame: true,
		title: S('usr_users'),
		width: 260,
		height: 200,
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: toolbar_left,
		stripeRows: true
	});

	// ------- elements to create left side gird END here ---------------
	// ------ elements to create the right side grid (Group members Grid) ---
	var sm_right = new Ext.grid.RowSelectionModel({});
	var cm_right = new Ext.grid.ColumnModel([{
		id: 'userName',
		header: S('grp_gridMembers_member'),
		width: 110,
		dataIndex: 'userName',
		sortType: customizedSort
	}]);

	var store_right = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		}, // option
		{
			name: 'value'
		} // value
		]
	});

	var searchbox_right = new Ext.form.ComboBox({
		id: ID_SEARCH_COMBO_RIGHT,
		hideLabel: true,
		allowBlank: true,
		editable: true,
		store: store_right,
		selectOnFocus: true,
		displayField: 'value',
		valueField: 'name',
		typeAhead: true,
		mode: 'local',
		hideTrigger: true,
		listWidth: 80,
		width: 80,
		listeners: {
			select: function (c, r, i) {
				var gridIndex = r.get('name');
				sm_right.selectRow(gridIndex, false); // (index, keepSelected)
				grid_right.getView().focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var toolbar_right = new Ext.Toolbar({
		autoHeight: true,
		items: ['->', S('searchBox_find'), ' ', searchbox_right]
	});

	var jsonStore_right = new Ext.data.JsonStore({
//		root: 'members',
		fields: [{
			name: 'userName'
		}]
	});

	var grid_right = new Ext.grid.GridPanel({
		id: 'grid_right',
		store: jsonStore_right,
		cm: cm_right,
		selModel: sm_right,
		frame: true,
		title: S('grp_groupMembers'),
		width: 150,
		height: 200,
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: toolbar_right,
		stripeRows: true
	});

	// ------- elements to create right side grid END here ---------------
	jsonStore_left.load({
		callback: function (r, opt, success) {

			var result = jsonStore_left.reader.jsonData.success;
			if (result) {
				// remove 'guest' from list
				if (nameField.getValue() == 'admin') {
					var guest_record_index = jsonStore_left.find('userName', 'guest');
					var guest_record = jsonStore_left.getAt(guest_record_index);
					jsonStore_left.remove(guest_record);

					quota.disable();
				}

				if (group_jsonData.members && edit) {
					jsonStore_right.loadData(group_jsonData.members);
					group_removeGroupMembers(grid_left, grid_right);
				}

				// update left search box
				update_combo_search(grid_left, searchbox_left, 'userName');

				// update right search box
				update_combo_search(grid_right, searchbox_right, 'userName');

			}
			else {
				formFailureFunction();
			}
		}
	});

	var group_saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function () {
			var bufaction;
			var members = new Array();
			var members_jsonFormat;

			if (edit) {
				bufaction = BUFACT_SET_GROUP_SETTINGS + nameField.getValue();
			}
			else {
				bufaction = BUFACT_ADD_GROUP_SETTINGS;
			}

			store = grid_right.getStore();
			var i;

			for (i = 0; i < store.getCount(); i++) {
//				if (store.getAt(i).get('userName') != 'admin') {
					members[i] = store.getAt(i).get('userName');
//				}
			}
			members_jsonFormat = Ext.util.JSON.encode(members);
			group_name = nameField.getValue();

			groups_saveBtnHandler(groupForm, bufaction, members_jsonFormat);
		}
	});

	var group_cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function () {
			groupForm.destroy();
			groupForm_display = groups_form_display();
			update_header(false, 'group_header', '');
			updateCentralContainer(USR_GRP_RENDER_TO, groupForm_display);
		}
	});

	var group_addMemberBtn = new Ext.Button({
		id: 'group_addBtn',
		text: S('btn_add') + ' >>',
		handler: function () {
			group_addMemberBtnHandler(grid_left, grid_right);
			// update left search box
			update_combo_search(grid_left, searchbox_left, 'userName');

			// update right search box
			update_combo_search(grid_right, searchbox_right, 'userName');
		}
	});

	var group_removeMemberBtn = new Ext.Button({
		id: 'group_removeMemberBtn',
		text: '<< ' + S('btn_remove'),
		handler: function () {
			group_removeMemberBtnHandler(grid_left, grid_right);

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
		name: 'groupName'
	}, {
		name: 'groupDesc'
	}, {
		name: 'memberOf'
	}]);

	var items;

	if (group_add_quota) {
		if (group_add_quota_soft) {
			items = [nameField, groupId, descField, quota, quota_soft, quota_hard];
		}
		else {
			items = [nameField, groupId, descField, quota, quota_hard];
		}

		items[items.length] = {
			layout: 'column',
			width: 600,
			items: [{
				columnWidth: 0.45,
				items: [{
					html: '<br><br>'
				},
				grid_left]
			}, {
				columnWidth: 0.2,
				items: [{
					html: '<br><br><br><br><br><br>'
				}, {
					buttonAlign: 'center',
					buttons: [group_addMemberBtn]
				}, {
					buttonAlign: 'center',
					buttons: [group_removeMemberBtn]
				}]
			}, {
				columnWidth: 0.3,
				items: [{
					html: '<br><br>'
				},
				grid_right]
			}]
		};

	}
	else {
		items = [nameField, groupId, descField,
		{
			layout: 'column',
			width: 600,
			items: [{
				columnWidth: 0.45,
				items: [{
					html: '<br><br>'
				},
				grid_left]
			}, {
				columnWidth: 0.2,
				items: [{
					html: '<br><br><br><br><br><br>'
				}, {
					buttonAlign: 'center',
					buttons: [group_addMemberBtn]
				}, {
					buttonAlign: 'center',
					buttons: [group_removeMemberBtn]
				}]
			}, {
				columnWidth: 0.3,
				items: [{
					html: '<br><br>'
				},
				grid_right]
			}]

		}];
	}

	var membersTitle = S('group_field_members');
	var groupForm = new Ext.FormPanel({
		id: ID_GROUP_FORM,
		reader: jReader,
		errorReader: jErrReader,
		labelAlign: 'left',
		header: false,
		width: GLOBAL_WIDTH_FORM,
		items: items,
		buttonAlign: 'left',
		buttons: [group_saveBtn, group_cancelBtn]
	});

	return groupForm;
}

function customizedSort(value) {
	switch (value.toLowerCase()) {
	case 'first':
		return 1;
	case 'second':
		return 2;
	default:
		return 3;
	}
}

function group_loadDetails(groupForm, groupname) {
	groupForm.form.load({
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		params: {
			bufaction: BUFACT_GET_GROUP_SETTINGS + groupname
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
//			Ext.getCmp("groupForm").getForm().load(rec);
			var decodedResponse = Ext.decode(action.response.responseText);
			group_jsonData = decodedResponse.data[0]; // Only one record was returned
			var groups_editBtn = Ext.getCmp('groups_editBtn');

			admin_name = group_jsonData.adminName;

			if (groupname == 'guest' || groupname == 'hdusers') {
				if (groups_editBtn) {
					groups_editBtn.disable();
				}
			}
			else if (groupname == 'admin' && userPageMode != '0') {
				// if here, the 'admin' group is selected and the login user is not admin
				if (groups_editBtn) {
					groups_editBtn.disable();
				}
			}
			else if (groups_editBtn) {
				groups_editBtn.enable();
			}

			group_format_fields();
		}
	});
}

function hideCheckbox_group(value, p, record) {
	var groupName = record.data.groupName;

	if (groupName == 'admin' || groupName == 'guest' || groupName == 'hdusers') {
		return '';
	}
	return '<div class="x-grid3-row-checker"> </div>';
}

function group_removeGroupMembers(grid_left, grid_right) {
	var store_left = grid_left.getStore();
	var store_right = grid_right.getStore();
	var sm_left = grid_left.getSelectionModel();

	var username;
	var recordToRemove;
	var recordIndex;
	for (var i = 0; i < store_right.getCount(); i++) {
		username = store_right.getAt(i).get('userName');
		username = username.replace(/\$/g, "\\$");
		username = username.replace(/\*/g, "\\*");
		username = username.replace(/\^/g, "\\^");

		var re = new RegExp('^' + username + '$');
		recordIndex = store_left.find('userName', re);
		// remove the old members from the list if they do not appear in the Local users list
		if (recordIndex == -1) {
			var oldMember = store_right.getAt(i);
			store_right.remove(oldMember);
			i = i - 1;
		}
		else {
			recordToRemove = store_left.getAt(recordIndex);
			store_left.remove(recordToRemove);
		}
	}
}

function group_addMemberBtnHandler(grid_left, grid_right) {
	var store_right = grid_right.getStore();
	var store_left = grid_left.getStore();
	var sm_left = grid_left.getSelectionModel();

	var searchbox_left = Ext.getCmp(ID_SEARCH_COMBO_LEFT);
	var searchbox_right = Ext.getCmp(ID_SEARCH_COMBO_RIGHT);

	if (!sm_left.hasSelection()) {
		msgBox_usingDictionary('error_box_title', 'grp_selectUsr_warning', Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
	else {
		var selected = sm_left.getSelections();
		var i;

		for (i = 0; i < selected.length; i++) {
			store_right.addSorted(selected[i]);
			store_left.remove(selected[i]);
		}

		// update left search box
		update_combo_search(grid_left, searchbox_left, 'userName');

		// update right search box
		update_combo_search(grid_right, searchbox_right, 'userName');
	}
}

function group_removeMemberBtnHandler(grid_left, grid_right) {
	var store_right = grid_right.getStore();
	var store_left = grid_left.getStore();
	var sm_left = grid_left.getSelectionModel();
	var sm_right = grid_right.getSelectionModel();

	var searchbox_left = Ext.getCmp(ID_SEARCH_COMBO_LEFT);
	var searchbox_right = Ext.getCmp(ID_SEARCH_COMBO_RIGHT);

	if (!sm_right.hasSelection()) {
		msgBox_usingDictionary('error_box_title', 'grp_selectMembers_warning', Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
	else {
		var selected = sm_right.getSelections();
//		store_left.addSorted(selected);
		var i;
		var groupName = Ext.getCmp('groupName').getValue();
		for (i = 0; i < selected.length; i++) {
			if (groupName == 'admin' && selected[i].data.userName == admin_name) {
				msgBox_usingDictionary('error_box_title', 'grp_cannotRemoveAdmin', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				store_right.remove(selected[i]);
				store_left.addSorted(selected[i]);
			}
		}

		// update left search box
		update_combo_search(grid_left, searchbox_left, 'userName');

		// update right search box
		update_combo_search(grid_right, searchbox_right, 'userName');
	}
}

function group_format_fields() {
	var descField = Ext.getCmp('groupDesc');
	var desc = descField.getValue();
	if (desc.length >= 26) {
		var newDesc = desc.substring(0, 25);
		newDesc += '...';
		descField.setValue(newDesc);
	}
}
