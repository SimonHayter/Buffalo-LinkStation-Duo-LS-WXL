function create_management_form_display_mode() { 
	var place = new Ext.form.TextField({
		id: 'place',
		name: 'place',
		fieldLabel: S('management_place_field'),
		width: 400,
		readOnly: true
	});

	var manager = new Ext.form.TextField({
		id: 'manager',
		name: 'manager',
		fieldLabel: S('management_manager_field'),
		width: 400,
		readOnly: true
	});

	var management_editBtn = new Ext.Button({
		id: 'management_editBtn',
		name: 'management_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){ 
				management_editBtnHandler(placeForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'place'},
		{name: 'manager'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var placeForm = new Ext.FormPanel({
		id: ID_MANAGEMENT_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		title: S('management_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [management_editBtn],
		items: [place, manager],
		titleCollapse: true
	});

	return placeForm;
}

function create_management_form_edit_mode() { 
	var place = new Ext.form.TextField({
		id: 'place',
		name: 'place',
		fieldLabel: S('management_place_field'),
		width: 400,
		maxLength: 75
	});

	var manager = new Ext.form.TextField({
		id: 'manager',
		name: 'manager',
		fieldLabel: S('management_manager_field'),
		width: 400,
		maxLength: 75
	});

	var management_saveBtn = new Ext.Button({
		id: 'management_saveBtn',
		name:'management_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){ 
				management_form_edit_mode(placeForm);
			}
		}
	});

	var management_cancelBtn = new Ext.Button({
		id: 'management_cancelBtn',
		name: 'management_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				management_display_mode(placeForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'place'},
		{name: 'manager'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var placeForm = new Ext.FormPanel({
		id: ID_MANAGEMENT_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',
		title: S('management_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [management_saveBtn, management_cancelBtn],
		items: [place, manager],
		titleCollapse: true
	});

	return placeForm;
}

function management_form_edit_mode(managementForm){
	managementForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction:BUFACT_SET_MANAGEMENT
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			management_jsonData = managementForm.form.getValues();
			management_display_mode(managementForm);
			getLeftPanelInfo_topOnly(2);
		}
	});
}

function management_editBtnHandler(management_edit){
	management_edit.destroy();
	management_display = create_management_form_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, management_display, ID_DATE_FORM);
	management_display.form.setValues(management_jsonData);
	management_display.expand(false);
}

function management_display_mode(management_display){
	management_display.destroy();
	management_edit= create_management_form_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, management_edit, ID_DATE_FORM);
	management_edit.form.setValues(management_jsonData);
	management_edit.expand(false);
}
