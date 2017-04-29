var dfsServiceRenderBefore;
var dfsLinksRenderBefore;

var dfsService_jsonData;
var dfsRoot_jsonData;
var dfsLinks_records;

// mode = 0 -> Display, 1 -> Edit
var dfsLinks_mode = 0;

// 0 -> disabled, 1 -> Enabled, single link, 2 -> Enabled, multiple link
var dfsService_mode = 0;

function dfs_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				create_dfs_settings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function create_dfs_settings() {
	dfsServiceRenderBefore = ID_DFS_LINKS_FORM;
	dfsLinksRenderBefore;

	var dfsServiceForm = create_dfs_service_display_mode();
	updateCentralContainer(SHARED_FOLDER_RENDER_TO, dfsServiceForm);

	dfsServiceForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_DFS_GET_SERVICES
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();
			var resp = Ext.decode(action.response.responseText);
			dfsService_jsonData = resp.data[0];
			dfs_service_displayValues(dfsService_jsonData);
		
			
			if (dfsServiceForm){
				// create the second form only if the form of the first form still exist.  If does not exist, the user clicked on another menu.
				var dfsLinksForm = create_dfs_links_display_mode();
				addToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsLinksForm);
				dfsLinksForm.load({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_DFS_GET_ROOT
					},
					waitMsg: S('msg_loading_data'),
					success: function(form, action) {
						resetCookie();
						var resp = Ext.decode(action.response.responseText);
						dfsRoot_jsonData = resp.data[0];

						// set the values of dfs link depending on the dfs service mode
						dfs_service_bless_links();
					},
					failure: function(form, action) {
						formFailureFunction(action);
					}
				});
			}
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});

}

function create_dfs_service_display_mode() {
	var dfs_function = new Ext.form.TextField({
		fieldLabel: S('dfs_service'),
		id: 'dfs_function',
		name: 'dfsService',
		width: 250,
		readOnly: true
	});

	var dfs_link = new Ext.form.TextField({
		fieldLabel: S('dfs_multipleDfsLinks'),
		id: 'dfs_link',
		name: 'multipleLinks',
		width: 250,
		readOnly: true
	});

	var dfs_root = new Ext.form.TextField({
		fieldLabel: S('dfs_root'),
		id: 'dfs_root',
		name: 'dfsRoot',
		width: 250,
		readOnly: true
	});
	
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'dfsService'
	},
	{
		name: 'multipleLinks'
	},
	{
		name: 'dfsRoot'
	}]);

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

	var btn_modify_settings = new Ext.Button({
		text: S('btn_modify_settings'),
		enabled: true,
		handler: function(f) {
			create_dfs_service_edit_mode(dfsForm);
			dfs_service_editValues(dfsService_jsonData);
		}
	});

	var dfsForm = new Ext.FormPanel({
		title: S('dfs_service_title'),
		frame: false,
		id: ID_DFS_SERVICE,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [dfs_function, dfs_link, dfs_root],
		buttons: [btn_modify_settings],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return dfsForm;
}

function create_dfs_service_edit_mode() {
	var dfs_enabled = new Ext.form.Radio({
		id: 'dfs_enabled',
		hideLabel: true,
		name: 'dfsService',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function(dfs_enabled, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					dfs_disabled.setValue(false);
					this.checked = true;

					// show image
					var imageObj = Ext.get('imageColumn');
					imageObj.setOpacity(1);

					// enable configuration for single/multiple links
					multipleLinks_yes.enable();
					multipleLinks_no.enable();
					
					dfs_root.enable();
				}
			}
		}
	});

	var dfs_disabled = new Ext.form.Radio({
		id: 'dfs_disabled',
		name: 'dfsService',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function(dfs_disabled, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;

				if (checked) {
					dfs_enabled.setValue(false);
					dfs_disabled.checked = true;
					
					// remove image
					var imageObj = Ext.get('imageColumn');
					imageObj.setOpacity(.2);
					multipleLinks_yes.disable();
					multipleLinks_no.disable();
					dfs_root.disable();
				}
			}
		}
	});

	var multipleLinks_yes = new Ext.form.Radio({
		id: 'multipleLinks_yes',
		hideLabel: true,
		name: 'multipleLinks',
		boxLabel: S('dfs_multipleDfsLinks_yes'),
		inputValue: 'on',
		listeners: {
			check: function(multipleLinks_yes, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					multipleLinks_no.setValue(false);
					this.checked = true;
					var imageObj = Ext.get('imgShareDfsRootLink');
					var img = '<img id="dfsImage" width="350px" height="190px" src="' + IMAGE_DFS_MULTIPLE_LINKS + ' "\>';
					imageObj.update(img);
					imageObj.repaint();
				}
			}
		}
	});

	var multipleLinks_no = new Ext.form.Radio({
		id: 'multipleLinks_no',
		name: 'multipleLinks',
		boxLabel: S('dfs_multipleDfsLinks_no'),
		inputValue: 'off',
		listeners: {
			check: function(multipleLinks_no, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;

				if (checked) {
					multipleLinks_yes.setValue(false);
					this.checked = true;
					var imageObj = Ext.get('imgShareDfsRootLink');
					var img = '<img id="dfsImage" width="350px" height="190px" src="' + IMAGE_DFS_ONE_LINK + ' "\>';
					imageObj.update(img);
					imageObj.repaint();
				}
			}
		}
	});

	var dfs_root = new Ext.form.TextField({
		fieldLabel: S('dfs_root'),
		id: 'dfs_root',
		name: 'dfsRoot',
		width: 250
	});

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function(f) {
			dfs_service_saveHandler(dfsForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			dfs_service_cancelHandler(dfsForm);
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'dfsService'
	},
	{
		name: 'multipleLinks'
	},
	{
		name: 'dfsRoot'
	}]);

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

	var displayForm = Ext.getCmp(ID_DFS_SERVICE);
	displayForm.destroy();

	var dfsForm = new Ext.FormPanel({
		title: S('dfs_service_title'),
		frame: false,
		id: ID_DFS_SERVICE,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('dfs_service') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [dfs_enabled]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [dfs_disabled]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('dfs_multipleDfsLinks') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [multipleLinks_yes]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [multipleLinks_no]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			id: 'imageColumn',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: "&nbsp;"
			},
			{
				cls: 'label',
				items: [{
					width: 350,
					height: 190,
					cls: 'column-custBorders',
					id: 'imgShareDfsRootLink'
				}]
			}]
		}, dfs_root],
		buttons: [saveBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	insertToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsForm, dfsServiceRenderBefore);
}

function dfs_service_displayValues(data) {
	var dfsServiceField = Ext.getCmp('dfs_function');
	var dfsLinkField = Ext.getCmp('dfs_link');
	var dfsRootField = Ext.getCmp('dfs_root');

	var dfsServiceValue;
	var dfsLinkValue;
	var dfsRootValue;

	if (data.dfsService == 'on') {
		dfsServiceValue = S('enabled');
		dfsRootValue = data.dfsRoot;
		if (data.multipleLinks == 'on') {
			dfsLinkValue = S('dfs_multipleDfsLinks_yes');
			dfsService_mode = 2;
		}
		else {
			dfsLinkValue = S('dfs_multipleDfsLinks_no');
			dfsService_mode = 1;
		}
	}
	else {
		dfsServiceValue = S('disabled');
		dfsLinkValue = '-';
		dfsRootValue = '-';
		dfsService_mode = 0;
	}

	dfsServiceField.setValue(dfsServiceValue);
	dfsLinkField.setValue(dfsLinkValue);
	dfsRootField.setValue(dfsRootValue);
}

function dfs_service_editValues(data) {
	var dfsEn_field = Ext.getCmp('dfs_enabled');
	var dfsDis_field = Ext.getCmp('dfs_disabled');

	var multipleLinks_yes_field = Ext.getCmp('multipleLinks_yes');
	var multipleLinks_no_field = Ext.getCmp('multipleLinks_no');

	var dfs_form = Ext.getCmp(ID_DFS_SERVICE);
	
	if (data.dfsService == 'on') {
		dfsEn_field.setValue(true);
	}
	else {
		dfsDis_field.setValue(true);
	}
	if (data.multipleLinks == 'on') {
		multipleLinks_yes_field.setValue(true);
	}
	else {
		multipleLinks_no_field.setValue(true);
	}

	dfs_form.form.setValues(data);
}

function dfs_service_bless_links() {
	var newLink_btn = Ext.getCmp('addLinkBtn');
	var delLink_btn = Ext.getCmp('delLinkBtn');
	var linksGrid = Ext.getCmp(ID_DFS_LINKS_GRID);

	if (dfsService_mode == 0) {
		if (dfsLinks_mode == 0) {
			// if here, dfs link form is in DISPLAY  mode. Disable its elements
			newLink_btn.disable();
			delLink_btn.disable();
			linksGrid.disable();
		}
		else {
			// if here, dfs link form is in EDIT mode. Return to DISPLAY mode
			var linksEditForm = Ext.getCmp(ID_DFS_LINKS_FORM);
			dfs_links_cancelHandler(linksEditForm);
		}
	}
	else if (dfsService_mode == 1) {
		if (dfsLinks_mode == 0) {
			if ((linksGrid.getStore().find('linkId', 'link1')) == -1) {
				newLink_btn.enable();
			}
			else {
				newLink_btn.disable();
			}

			delLink_btn.disable();
			linksGrid.enable();
			var gridCm = linksGrid.getColumnModel();
			var linkName_idx = gridCm.getIndexById('linkName');
			var hostname_idx = gridCm.getIndexById('hostname');
			var hostnameWithLink_idx = gridCm.getIndexById('hostnameWithLink');
			gridCm.setHidden(linkName_idx, true);

			// hide the DFS Link Name column
			// hide the DFS Link Name column
			// hide the hostname (with hyperlink) column
			gridCm.setHidden(hostname_idx, true);
			gridCm.setHidden(hostnameWithLink_idx, false);
			linksGrid.autoExpandColumn = 'hostnameWithLink';

			// show only the first DFS Link
			//show only the first record
			var gridStore = linksGrid.getStore();
			gridStore.filter('linkId', 'link1', false);

			var gridView = linksGrid.getView();
			gridView.refresh();
		}
		else {
			// if here, dfs link form is in EDIT mode. Return to DISPLAY mode
			var linksEditForm = Ext.getCmp(ID_DFS_LINKS_FORM);
			dfs_links_cancelHandler(linksEditForm);
		}

	}
	else if (dfsService_mode == 2) {
		if (dfsLinks_mode == 0) {
			// modifySettings_btn.enable();
			linksGrid.enable();
			var linksCount = linksGrid.getStore().getCount();
			if (linksCount == 8) {
				newLink_btn.disable();
			}
			else {
				newLink_btn.enable();
			}

			var gridCm = linksGrid.getColumnModel();
			var linkName_idx = gridCm.getIndexById('linkName');
			var hostname_idx = gridCm.getIndexById('hostname');
			var hostnameWithLink_idx = gridCm.getIndexById('hostnameWithLink');

			// show the DFS Link Name column
			// show the hostname (without hyperlink) column
			// hide the hostname (with hyperlink) column
			gridCm.setHidden(linkName_idx, false);
			gridCm.setHidden(hostname_idx, false);
			gridCm.setHidden(hostnameWithLink_idx, true);
			linksGrid.autoExpandColumn = 'linkName';

			// show all the DFS links
			var gridStore = linksGrid.getStore();
			gridStore.clearFilter(true);

			var gridView = linksGrid.getView();
			gridView.refresh();
		}
		else {
			// if here, dfs link form is in EDIT mode. Return to DISPLAY mode
			var linksEditForm = Ext.getCmp(ID_DFS_LINKS_FORM);
			dfs_links_cancelHandler(linksEditForm);
		}
	}
}

function dfs_service_saveHandler(dfsServiceEditForm) {
	dfsServiceEditForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_DFS_SET_SERVICES
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			dfsService_jsonData = dfsServiceEditForm.form.getValues();
			dfsServiceEditForm.destroy();
			var dfsServiceDisplay = create_dfs_service_display_mode();
			insertToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsServiceDisplay, dfsServiceRenderBefore);
			dfsServiceDisplay.form.setValues(dfsService_jsonData);
			dfs_service_displayValues(dfsService_jsonData);

			// The dfs links form depends on the state of the service.
			// enable / disable elements in the DFS Links Form depending on dfsLinks_mode
			dfs_service_bless_links();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function dfs_service_cancelHandler(dfsRootForm_edit) {
	// destroy
	dfsRootForm_edit.destroy();

	// create dfs service display form
	var dfsServiceDisplay = create_dfs_service_display_mode();
	insertToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsServiceDisplay, dfsServiceRenderBefore);
	dfsServiceDisplay.form.setValues(dfsService_jsonData);
	dfs_service_displayValues(dfsService_jsonData);
	dfs_service_bless_links();
}

function create_dfs_links_display_mode() {
	var sm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function() {
				if (sm.getCount() > 0) delLinkBtn.enable();
			},
			rowdeselect: function() {
				if (sm.getCount() == 0) delLinkBtn.disable();
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
	sm, {
		id: "linkName",
		header: S('dfs_linkName'),
		dataIndex: "linkName",
		direction: "ASC",
		renderer: render_linkName
	},
	{
		id: 'hostname',
		header: S('dfs_hostname'),
		dataIndex: 'hostname',
		sortable: false
	},
	// there is no json record received for this column.
	// See renderer to understand how this value is obtained
	{
		id: 'hostnameWithLink',
		header: S('dfs_hostname'),
		dataIndex: 'hostnameWithLink',
		sortable: false,
		renderer: render_hostnameRootOnly
	},
	{
		id: 'shareName',
		header: S('dfs_share'),
		dataIndex: 'shareName',
		sortable: false
	},
	{
		id: 'linkId',
		hidden: true,
		dataIndex: 'linkId',
		sortable: false
	}]);

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_DFS_GET_LINK_LIST
		},
		fields: [{
			name: 'linkName'
		},
		{
			name: 'hostname'
		},
		{
			name: 'shareName'
		},
		{
			name: 'linkId'
		}]
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_DFS_LINKS_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 700,
		view: gridView,
		height: 150,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true,
		autoExpandColumn: 'linkName'
	});

	var addLinkBtn = new Ext.Button({
		id: 'addLinkBtn',
		name: 'addLinkBtn',
		iconCls: 'add',
		disabled: true,
		text: S('dfs_links_add'),
		listeners: {
			click: function() {
				create_dfs_links_add();
			}
		}
	});

	jsonStore.load({
		callback: function(r, o, success) {
			var result = jsonStore.reader.jsonData.success;
			if(result){
				dfsLinks_records = r;
				var rec = jsonStore.getCount();
				var rec_link1;
				if ((jsonStore.find('linkId', 'link1')) != -1) {
					rec_link1 = 1;
				}
				else {
					rec_link1 = 0;
				}

				if (dfsService_mode == 1) {
					// show only the first record
					jsonStore.filter('linkId', 'link1', false);
					if (!rec_link1){
						addLinkBtn.enable();
					}
					else {
						addLinkBtn.disable();
					}
				}
				else if (dfsService_mode == 2){
					jsonStore.clearFilter(true);
					if (rec < 8){
						addLinkBtn.enable();
					}
					else {
						addLinkBtn.disable();
					}
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	var delLinkBtn = new Ext.Button({
		id: 'delLinkBtn',
		name: 'delLinkBtn',
		iconCls: 'delete',
		disabled: true,
		text: S('dfs_links_delete'),
		handler: function() {
			var emptyList = false;
			var selectedRecords;
			var msg = '';
			var buttons;
			var title;
			var icon;

			// returns an array of selected records
			selectedRecords = sm.getSelections();

			var delList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				delList[i] = selectedRecords[i].data.linkId;
			}

			var delList_jsonFormat = Ext.util.JSON.encode(delList);
			Ext.MessageBox.show({
				title: S('warning_box_title'),
				msg: S('dfs_deleteMsg'),
				buttons: Ext.MessageBox.OKCANCEL,
				icon: Ext.MessageBox.WARNING,
				fn: function(btn) {
					dfs_links_deleteBtnHandler(dfsForm, delList_jsonFormat, btn);
				}
			});
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'dfsRoot'
	}]);

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

	var dfsForm = new Ext.FormPanel({
		title: S('dfs_links_title'),
		frame: false,
		id: ID_DFS_LINKS_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [

			{
				layout: 'form',
				cls: 'column-custBorders',
				buttonAlign: 'left',
				buttons: [addLinkBtn, delLinkBtn]
			},
			grid]
		}],
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return dfsForm;
}

function dfs_links_deleteBtnHandler(dfsForm, delList_jsonFormat, btn) {
	var dfsLinksGrid = Ext.getCmp(ID_DFS_LINKS_GRID);
	var jsonStore = dfsLinksGrid.getStore();
	var selModel = dfsLinksGrid.getSelectionModel();
	cm = dfsLinksGrid.getColumnModel();
	selectedRecords = selModel.getSelections();
	
	if (btn == 'ok') {
		dfsForm.form.submit({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_DFS_DEL_LINK,
				delList: delList_jsonFormat
			},
			waitMsg: S('dfs_deleting'),
			failure:function(form,action) {formFailureFunction(action);},
			success: function(form, action) {
				resetCookie();

				// remove the records selected from grid
				for (var i = 0; i < selectedRecords.length; i++){
					jsonStore.remove(selectedRecords[i]);
				}
				Ext.getCmp('delLinkBtn').disable();
				var rec = dfsLinksGrid.getStore().getCount();
				if(rec == 0) {
					cm.setColumnHeader(0, '<div id="usrHeader" class="x-grid3-hd-checker">\&\#160;</div>');
				}

				if (dfsService_jsonData.multipleLinks == 'off'){
					if ((dfsLinksGrid.getStore().find('linkId', 'link1')) == -1) {
						Ext.getCmp('addLinkBtn').enable();
					}
				}
				else if (dfsService_jsonData.multipleLinks == 'on'){
					if (rec < 8) {
						Ext.getCmp('addLinkBtn').enable();
					}
				}
			}
		});
	}
	else {
		var selModel = dfsLinksGrid.getSelectionModel();
		selModel.clearSelections();
	}
}

function render_hostnameRootOnly(value, meta, record, rowIndex) {
	var hn = record.get('hostname');
	return String.format("<b><a href='#' onClick='create_dfs_links_edit_mode(false, {1});'>{0} </a></b>", hn, rowIndex);
}

function render_linkName(value, meta, record, rowIndex) {
	return String.format("<b><a href='#' onClick='create_dfs_links_edit_mode(true, {1});'>{0} </a></b>", value, rowIndex);
}

function create_dfs_links_edit_mode(multipleLinks, rowIndex) {
	var dfs_linkName = new Ext.form.TextField({
		fieldLabel: S('dfs_linkName'),
		id: 'dfs_linkName',
		name: 'linkName',
		width: 250,
		allowBlank: false
	});

	var dfs_hostname = new Ext.form.TextField({
		fieldLabel: S('dfs_hostname'),
		id: 'dfs_hostname',
		name: 'hostname',
		width: 250,
		allowBlank: false
	});

	var dfs_share = new Ext.form.TextField({
		fieldLabel: S('dfs_share'),
		id: 'dfs_share',
		name: 'shareName',
		width: 250,
		allowBlank: false
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'linkName'
	},
	{
		name: 'hostname'
	},
	{
		name: 'shareName'
	}]);

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

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function(f) {
			var dfsLinkValue = dfsLinks_records[rowIndex].get('linkId');
			dfs_links_saveHandler(dfsForm, dfsLinkValue, 'edit');
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			dfs_links_cancelHandler(dfsForm);
		}
	});

	var items;

	if (multipleLinks) {
		items = [dfs_linkName, dfs_hostname, dfs_share];
	}
	else {
		items = [dfs_hostname, dfs_share];
	}

	// important to be here!
	var oldForm = Ext.getCmp(ID_DFS_LINKS_FORM);
	oldForm.destroy();

	var dfsForm = new Ext.FormPanel({
		title: S('dfs_links_title'),
		frame: false,
		id: ID_DFS_LINKS_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: items,
		buttons: [saveBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	addToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsForm);
	dfsForm.form.loadRecord(dfsLinks_records[rowIndex]);
	dfsLinks_mode = 1;
}

function create_dfs_links_add() {
	var dfs_linkName = new Ext.form.TextField({
		fieldLabel: S('dfs_linkName'),
		id: 'dfs_linkName',
		name: 'linkName',
		width: 250,
		allowBlank: false
	});

	var dfs_hostname = new Ext.form.TextField({
		fieldLabel: S('dfs_hostname'),
		id: 'dfs_hostname',
		name: 'hostname',
		width: 250,
		allowBlank: false
	});

	var dfs_share = new Ext.form.TextField({
		fieldLabel: S('dfs_share'),
		id: 'dfs_share',
		name: 'shareName',
		width: 250,
		allowBlank: false
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'linkName'
	},
	{
		name: 'hostname'
	},
	{
		name: 'shareName'
	}]);

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

	var saveBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function(f) {
			var dfsLinkValue = dfs_linkName.getValue();
			dfs_links_saveHandler(dfsForm, dfsLinkValue, 'add');
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			dfs_links_cancelHandler(dfsForm);
		}
	});

	// important to be here!
	var oldForm = Ext.getCmp(ID_DFS_LINKS_FORM);
	oldForm.destroy();

	var items;

	if (dfsService_mode != 1) {
		items = [dfs_linkName, dfs_hostname, dfs_share];
	}
	else {
		items = [dfs_hostname, dfs_share];
	}

	var dfsForm = new Ext.FormPanel({
		title: S('dfs_links_title'),
		frame: false,
		id: ID_DFS_LINKS_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: items,
		buttons: [saveBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	addToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsForm);
	dfsLinks_mode = 1;
}

function dfs_links_saveHandler(dfsLinkEditForm, dfsLinkValue, mode) {
	var params;
	if (mode == 'add') {
		params = {
			bufaction: BUFACT_DFS_ADD_LINK
		}
	}
	else {
		if (dfsService_mode == 1) {
			params = {
				bufaction: BUFACT_DFS_SET_LINK + dfsLinkValue,
				// make the root name to be the first DFS Link name in the list
				linkName: dfsRoot_jsonData.dfsRoot
			}
		}
		else {
			params = {
				bufaction: BUFACT_DFS_SET_LINK + dfsLinkValue
			}
		}
	}

	dfsLinkEditForm.form.submit({
		url: '/dynamic.pl',
		params: params,
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			dfsLinkEditForm.destroy();
			var dfsLinksDisplay = create_dfs_links_display_mode();
			insertToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsLinksDisplay, dfsLinksRenderBefore);

			// this will set the value of the dfs root which is on top of the grid of dfs links.
			// The grid of links will load itself on create_dfs_links_display_mode(), so no need to set values
			dfsLinksDisplay.form.setValues(dfsRoot_jsonData);
			dfsLinks_mode = 0;
			dfs_service_bless_links();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function dfs_links_cancelHandler(dfsLinksEditForm) {
	dfsLinksEditForm.destroy();
	var dfsLinksDisplay = create_dfs_links_display_mode();
	insertToCentralContainer(SHARED_FOLDER_RENDER_TO, dfsLinksDisplay, dfsLinksRenderBefore);
	dfsLinks_mode = 0;
	dfs_service_bless_links();
}
