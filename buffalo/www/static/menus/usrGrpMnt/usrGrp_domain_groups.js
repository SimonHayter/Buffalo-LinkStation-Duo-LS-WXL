function domain_groups_processAuth(domainName) {
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
				userForm_display = domain_groups_form_display(domainName);
				updateCentralContainer(USR_GRP_RENDER_TO, userForm_display);
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function domain_groups_form_display(domainName) {
	// turn on validation errors beside the field globally
	// Ext.form.Field.prototype.msgTarget = 'side';
	var bd = Ext.getBody();

	var jsonStore = new Ext.data.JsonStore({
		root: 'data[0].records',
		url: '/dynamic.pl',
		waitMsg: S('msg_loading_data'),
		baseParams: {
			bufaction: BUFACT_SHARE_GET_DOMAIN_LIST,
			type: 'domain_groups'
		},
		fields: [{
			name: 'name'
		}]
	});

	Ext.MessageBox.wait(S('msg_loading_data'));
	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();
				update_combo_search(grid, searchbox, 'name');

				sm.selectFirstRow();

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
	},
	{
		name: 'msg'
	}]);

	var sm = new Ext.grid.RowSelectionModel({
		singleSelect: true,
		listeners: {
			rowselect: function (sm, rowIndex, rec) {
				var name = rec.get('name');
				var desc = domainName + ' ' + S('domain_group_desc');
				nameField.setValue(name);
				descField.setValue(desc);
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([{
		id: 'groupName',
		header: S('group'),
		width: 180,
		sortable: true,
		dataIndex: 'name',
		renderer: domain_groups_renderer // unusual way to display the name due the special structure returned by the json store
	}]);

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		},
		{
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
					var found = searchComboStore.find('name', val, 0, false, false);
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
		id: 'domainGroupsGrid',
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
			sortchange: function() {
				update_combo_search(grid, searchbox, 'name');
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
		id: 'groupName',
		name: 'groupName',
		width: 250,
		readOnly: true
	});

	var descField = new Ext.form.TextField({
		fieldLabel: S('group_field_desc'),
		id: 'userDesc',
		name: 'userDesc',
		width: 250,
		readOnly: true
	});

	var domainGroupFs = new Ext.form.FieldSet({
		name: 'domainGroupFs',
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
		items: [nameField, descField]
	});

	var title = S('group_grpDetails');

	var items;
	items = [{
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			columnWidth: 0.50,
			items: [{
				bodyStyle: 'padding:18.5px',
				html: ''
			},
			grid]
		},
		{
			columnWidth: 0.50,
			items: [{
				bodyStyle: 'padding:10px',
				html: '<h3>' + title + '<h3>'
			},
			domainGroupFs]
		}]
	}]

	var externalUserForm = new Ext.FormPanel({
		id: ID_EXTERNAL_USERS_FORM,
		itemCls: 'details-label',
		frame: false,
//		reader: jReader,
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

function domain_groups_renderer(v, meta, record) {
	return record.get('name');
}
