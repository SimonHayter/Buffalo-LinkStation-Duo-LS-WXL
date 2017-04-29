function php_display_mode(){
	var phpFile = new Ext.form.TextField({
		name: 'phpFile',
		id: 'phpFile',
		fieldLabel : S('net_webserver_php'),
		width: 400,
		height: 23,
		inputType:'file'
	});

	var phpFileImportBtn = new Ext.Button({
		id: 'phpFileImportBtn',
		text: S('net_webserver_php_import_btn'),
		handler: function(){
			if (phpFile.getValue() == '') {
				msgBox_usingDictionary('file_msg_title', 'select_file', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				php_importHandler(phpForm, 'php_ini');
			}
		}
	});

	var phpFileSection = new Ext.form.FieldSet({
		id: 'phpImportFile',
		title: S('net_webserver_php_section_import'),
		items: [phpFile],
		buttonAlign: 'left',
		buttons: [phpFileImportBtn],
		autoHeight: true,
		width: 675,
		labelWidth: 160
	});

	var php_content_title = new Ext.form.TextField({
		id: 'php_content_title',
		name: 'php_content_title',
		fieldLabel: S('net_webserver_php_direct_edit'),
		itemCls: 'display-label',
		readOnly: true
	});

	var php_content = new Ext.form.TextArea({
		id: 'php_content',
		name: 'php_content',
		width: 650,
		height: 600,
		hideLabel: true,
		allowBlank:false
	});

	var phpSaveBtn = new Ext.Button({
		id: 'phpSaveBtn',
		text: S('btn_save'),
		handler: function() {
			php_saveHandler(phpForm);
		}
	});

	var phpRestoreBtn = new Ext.Button({
		id: 'phpFileImportBtn',
		text: S('net_webserver_php_restore'),
		handler: function() {
			php_restoreHandler(phpForm);
		}
	});

	var phpManualEditSection = new Ext.form.FieldSet({
		id: 'phpManualEditSection',
		title: S('net_webserver_php_section_manual'),
		items: [php_content_title, php_content],
		buttonAlign: 'left',
		buttons: [phpSaveBtn, phpRestoreBtn],
		autoHeight: true,
		width: 675,
		labelWidth: 160
	});

	var php_jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'php_content'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var phpForm = new Ext.FormPanel({
		id: ID_PHP_FORM,
		reader: php_jReader,
		errorReader: jErrReader,
		allowDomMove : false,
		animCollapse: false,
		title: S('net_webserver_php_title'),
		autoHeight: true,
		cls : 'panel-custBorders-noButtons ',
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: GLOBAL_WIDTH_FORM,
		items: [phpFileSection, phpManualEditSection],
		titleCollapse: true,
		fileUpload: true,
		method: 'POST'
	});

	return phpForm;
}

function php_importHandler(file_upload_form, purpose){
	file_upload_form.form.submit({
		url: '/import.pl',
		params: {
			purpose: purpose
		},
		waitMsg: S('uploading'),
		failure: function(form, action) {
			if (action.response) {
				formFailureFunction(action);
			}
		},
		success: function(form, action) {
			var decodedResponse = Ext.decode(action.response.responseText);
			msgBox_usingDictionary('file_msg_title', decodedResponse.data[0], Ext.Msg.OK, Ext.MessageBox.INFO);
			php_load_form(file_upload_form);
		}
	});
}

function php_saveHandler(phpForm){
	phpForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_PHP_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			php_load_form(phpForm);
		}
	});
}

function php_restoreHandler(phpForm){
	phpForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_RESTORE_PHP_SETTINGS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			php_load_form(phpForm);
		}
	});
}

function php_load_form(phpForm){
	phpForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_PHP_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
		}
	});
}
