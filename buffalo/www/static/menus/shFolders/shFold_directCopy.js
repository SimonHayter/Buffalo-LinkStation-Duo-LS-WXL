var directCopy_jsonData;

function directCopy_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			//Get response from server	
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				directCopy_createMainForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function directCopy_createMainForm() {
	var directCopyForm = directCopy_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, directCopyForm);

	directCopyForm.form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_DIRECT_GET_COPY
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			directCopy_jsonData = resp.data[0];
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function directCopy_display_mode() {
	var warn_usedby_usbdev = S('Warn_Usedby_USBDevServer');
	var isHide = true;
	if (deviceservermode == 'on') {
		isHide = false;
	}

	var shareName = new Ext.form.TextField({
		fieldLabel: S('directCopy_target'),
		id: 'shareName',
		name: 'shareName',
		width: 250,
		readOnly: true
	});

	var jReaderFields = [{
		name: 'shareName'
	}];

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, jReaderFields);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var btn_modify_settings = new Ext.Button({
		text: S('btn_modify_settings'),
		enabled: true,
		handler: function(f) {
			directCopy_modify(directCopyForm);
		}
	});

	var directCopyForm = new Ext.FormPanel({
		title: S('directCopy_title'),
		frame: false,
		id: ID_DIRECT_COPY,

		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items:[
			shareName,
			{
			autoWidth: true,
			layout: 'column',
			id: 'warn_usedby_usbdev',
			name: 'warn_usedby_usbdev',
			cls : 'column-custBorders',
			items: [{
				cls: 'warnings',
				columnWidth: 1.0,
				html: warn_usedby_usbdev
			}],
			hideMode: 'display',
			hidden : isHide,
			hideLabel: isHide
		}],
		buttons: [btn_modify_settings],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return directCopyForm;
}

function directCopy_editMode() {
	var store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_DIRECT_LIST
		},
		root: 'data',
		fields: [{
			name: 'opt'
		}, {
			name: 'val'
		}]
	});

	var directCopy = new Ext.form.ComboBox({
		id: 'directCopyCombo',
		hiddenName: 'shareName',
		fieldLabel: S('directCopy_target'),
		store: store,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		width: 250,
		listWidth: 250,
		editable: false,
		disabled: true,
		emptyText: S('select_one'),
		allowBlank: false
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		enabled: true,
		disabled: true,
		handler: function(f) {
			directCopy_apply(directCopyForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			directCopy_cancel(directCopyForm);
		}
	});

	store.load({
		callback: function(r, opt, success) {
			var result = store.reader.jsonData.success;
			if (result) {
				applyBtn.enable();
				directCopy.enable();
			}
			else {
				formFailureFunction();
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
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

	var directCopyForm = new Ext.FormPanel({
		title: S('directCopy_title'),
		frame: false,
		id: ID_DIRECT_COPY,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [directCopy],
		buttons: [applyBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return directCopyForm;
}

function directCopy_apply(editForm) {
	editForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_DIRECT_SET_COPY,
			shareName: Ext.getCmp('directCopyCombo').getValue()
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			editForm.destroy();
			directCopy_createMainForm();
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function directCopy_cancel(editForm) {
	editForm.destroy();
	var editForm = directCopy_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(directCopy_jsonData);
}

function directCopy_modify(displayForm) {
	displayForm.destroy();
	var editForm = directCopy_editMode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(directCopy_jsonData);
}
