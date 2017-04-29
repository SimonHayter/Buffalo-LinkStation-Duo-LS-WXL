var indexSearch_jsonData;

function indexSearch_processAuth() {
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
				indexSearch_createMainForm();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function indexSearch_createMainForm() {
	var indexSearchForm = indexSearch_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, indexSearchForm);

	indexSearchForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_TERASEARCH_GET
		},
		waitMsg: S('msg_loading_data'),
		success: function(form, action) {
			resetCookie();

			resp = Ext.decode(action.response.responseText);
			indexSearch_jsonData = resp.data[0];
			indexSearch_format_display(indexSearch_jsonData);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});

}

function indexSearch_display_mode() {
	var indexSearch = new Ext.form.TextField({
		fieldLabel: S('sh_indexSearch_service'),
		id: 'indexSearch',
		name: 'v',
		width: 250,
		readOnly: true
	});

	var indexTime = new Ext.form.TextField({
		fieldLabel: S('sh_indexSearch_indexTime'),
		id: 'indexTime',
		name: 'v',
		width: 250,
		readOnly: true
	});

	var jReaderFields = [{
		name: 'indexSearch'
	},
	{
		name: 'indexTime'
	}];
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	jReaderFields);

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
			indexSearch_modify(indexSearchForm);
		}
	});

	var btn_updateIndex = new Ext.Button({
		id: 'btn_updateIndex',
		text: S('sh_indexSearch_updateIndex'),
		enabled: true,
		handler: function(f) {
			indexSearch_updateIndex(indexSearchForm);
		}
	});
	var indexSearchForm = new Ext.FormPanel({
		title: S('sh_indexSearch_title'),
		frame: false,
		id: ID_TERASEARCH_FORM,

		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [indexSearch, indexTime],
		buttons: [btn_modify_settings, btn_updateIndex],
		buttonAlign: 'left',
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});
	return indexSearchForm;
}

function indexSearch_editMode() {

	var service_on = new Ext.form.Radio({
		boxLabel: S('sh_indexSearch_service_enable'),
		name: 'indexSearch',
		id: 'service_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(service_on, checked) {
				if (checked) {
					service_off.setValue(false);
					this.checked = true;
					indexSearchCombo.enable();
				}
			}
		}
	});

	var service_off = new Ext.form.Radio({
		boxLabel: S('sh_indexSearch_service_disable'),
		name: 'indexSearch',
		id: 'service_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(service_off, checked) {
				if (checked) {
					this.checked = true;
					service_on.setValue(false);
					indexSearchCombo.disable();
				}
			}
		}
	});

	var indexSearchTime = new Array();
	for (var i = 0; i < 24; i++) {
		indexSearchTime[i] = new Array();
		indexSearchTime[i][0] = i;
		indexSearchTime[i][1] = i;
	}

	var authTypeStore = new Ext.data.SimpleStore({
		data: indexSearchTime,
		fields: ['value', 'name']
	});

	var indexSearchCombo = new Ext.form.ComboBox({
		name: 'indexTime',
		fieldLabel: S('sh_indexSearch_indexTime'),
		store: authTypeStore,
		displayField: 'name',
		valueField: 'value',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		//forceSelection:true,
		listWidth: 50,
		width: 50,
		editable: false,
		value: '0'
	});
	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		enabled: true,
		handler: function(f) {
			indexSearch_apply(indexSearchForm);
		}
	});
	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			indexSearch_cancel(indexSearchForm);
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'indexSearch'
	},
	{
		name: 'indexTime'
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
	var indexSearchForm = new Ext.FormPanel({
		title: S('sh_indexSearch_title'),
		frame: false,
		id: ID_TERASEARCH_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .24,
				html: '<p class="label">' + S('sh_indexSearch_service') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [service_on]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [service_off]
			}]
		},
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				//	cls : 'column-custBorders',
				layout: 'form',
				items: [indexSearchCombo]
			},
			{
				//cls : 'column-custBorders',
				layout: 'form',
				html: '<p class="label">&nbsp;' + S('o_clock') + '</p>'
			}]
		}],
		buttons: [applyBtn, cancelBtn],
		buttonAlign: 'left',
		cls: 'panel-custBorders',
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		animCollapse: false
	});

	return indexSearchForm;
}

function indexSearch_updateIndex(indexSearchForm) {
	indexSearchForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_TERASEARCH_UPDATE
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			msgBox_usingDictionary('sh_indexSearch_updateIndex_title', 'sh_indexSearch_updateIndex_msg', Ext.Msg.OK, Ext.MessageBox.INFO);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function indexSearch_apply(indexSearchForm) {

	indexSearchForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_TERASEARCH_SET
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			indexSearch_jsonData = indexSearchForm.form.getValues();

			indexSearchForm.destroy();
			var display = indexSearch_display_mode();
			updateCentralContainer(SYSTEM_RENDER_TO, display);
			indexSearch_format_display(indexSearch_jsonData);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});

}

function indexSearch_cancel(indexSearchForm) {
	indexSearchForm.destroy();
	var indexSearchFormDisplay = indexSearch_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, indexSearchFormDisplay);
	indexSearch_format_display(indexSearch_jsonData);
}
function indexSearch_modify(displayForm) {
	displayForm.destroy();
	var editForm = indexSearch_editMode();
	updateCentralContainer(SYSTEM_RENDER_TO, editForm);
	editForm.form.setValues(indexSearch_jsonData);
}

function indexSearch_format_display(data) {
	var indexSearch_field = Ext.getCmp('indexSearch');
	var indexSearch_value;
	var indexTime_field = Ext.getCmp('indexTime');
	var indexTime_value;

	var btn_updateIndex = Ext.getCmp('btn_updateIndex');

	if (data.indexSearch == 'on') {
		indexSearch_value = S('enabled');
		btn_updateIndex.enable();
		indexTime_value = data.indexTime + ' ' + S('o_clock');
	}
	else {
		indexSearch_value = S('disabled');
		btn_updateIndex.disable();
		indexTime_value = '-';
	}
	indexSearch_field.setValue(indexSearch_value);
	indexTime_field.setValue(indexTime_value);
}
