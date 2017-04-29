function create_langForm_form_display_mode(){
	var lang = new Ext.form.TextField({
		id: 'lang',
		name: 'lang',
		fieldLabel: S('lang_displayLang_field'),
		width: 200,
		readOnly: true
	});
	
	var winLang = new Ext.form.TextField({
		id: 'winLang',
		name: 'winLang',
		fieldLabel: S('lang_winLang_field'),
		width: 200,
		readOnly: true
	});

	var lang_editBtn = new Ext.Button({
		id: 'lang_editBtn',
		name:'lang_editBtn',
		text: S('btn_modify_settings'),
		disabled: true,
		listeners: {
			click: function(){
				lang_editBtnHandler(displayLanForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'lang'},
		{name: 'winLang'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var items = new Array();
	if(add_iscsi){
		items = [lang];
	}
	else{
		items = [lang, winLang];
	}
	
	var displayLanForm = new Ext.FormPanel({
		id: ID_LANG_FORM,
		animCollapse: false,
		title: S('lang_form_title'),
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [lang_editBtn],
		items: items,
		titleCollapse: true
	});

	return displayLanForm;
}

function create_langForm_form_edit_mode(){
	var LANG_LIST = [
		['english', S('lang_english')],
		['japanese', S('lang_japanese')],
		['german', S('lang_german')],
		['french', S('lang_french')],
		['italian', S('lang_italian')],
		['spanish', S('lang_spanish')],
		['simplified', S('lang_simplified')],
		['traditional', S('lang_traditional')],
		['korean', S('lang_korean')],
		['portuguese', S('lang_portuguese')],
		['dutch', S('lang_dutch')],
		['swedish', S('lang_swedish')],
		['thai', S('lang_thai')],
		['russian', S('lang_russian')],
		['arabic', S('lang_arabic')],
		['finnish', S('lang_finnish')],
		['turkish', S('lang_turkish')]
	];

	var langList = new Ext.data.SimpleStore({
		data: LANG_LIST,
		fields: ['val','opt']
	});

	var lang = new Ext.form.ComboBox({
		id: 'langCombo',
		hiddenName: 'lang',
		editable: false,
		fieldLabel: S('lang_displayLang_field'),
		store: langList,
		displayField: 'opt',
		valueField: 'val',
//		emptyText: S('dTime_selectFreq'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 219,
		width: 200
	});

	var WIN_LANG_LIST = [
		['CP932',	S('lang_win_list_0')],
		['CP437',	S('lang_win_list_1')],
		['CP936',	S('lang_win_list_2')],
		['CP949',	S('lang_win_list_3')],
		['CP950',	S('lang_win_list_4')],
		['CP1257',	S('lang_win_list_5')],
		['CP850',	S('lang_win_list_6')],
		['CP1250',	S('lang_win_list_7')],
		['CP1254',	S('lang_win_list_8')],
		['CP1251',	S('lang_win_list_9')],
		['CP1253',	S('lang_win_list_10')],
		['CP1255',	S('lang_win_list_11')],
		['CP1256',	S('lang_win_list_12')],
		['CP860',	S('lang_win_list_13')],
		['ISO8859_1',	S('lang_win_list_14')],
		['ISO8859_2',	S('lang_win_list_15')],
		['ISO8859_9',	S('lang_win_list_16')],
		['ISO8859_13',	S('lang_win_list_17')],
		['ISO8859_15',	S('lang_win_list_18')]
	];

	var winLangList = new Ext.data.SimpleStore({
		data: WIN_LANG_LIST,
		fields: ['val','opt']
	});

	var winLang = new Ext.form.ComboBox({
		id: 'winLangCombo',
		hiddenName: 'winLang',
		editable: false,
		fieldLabel: S('lang_winLang_field'),
		store: winLangList,
		displayField: 'opt',
		valueField: 'val',
//		emptyText: S('dTime_selectFreq'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		listWidth: 419,
		width: 400
	});

	var lang_saveBtn = new Ext.Button({
		id: 'lang_saveBtn',
		name: 'lang_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){
				lang_saveBtnHandler(displayLanForm);
			}
		}
	});

	var lang_cancelBtn = new Ext.Button({
		id: 'lang_cancelBtn',
		name:'lang_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){
				lang_display_mode(displayLanForm);
			}
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'lang'},
		{name: 'winLang'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	
	var items = new Array();
	if(add_iscsi){
		items = [lang];
	}
	else{
		items = [lang, winLang];
	}
	
	var displayLanForm = new Ext.FormPanel({
		id: ID_LANG_FORM,
		animCollapse: false,
		title: S('lang_form_title'),
		cls : 'panel-custBorders',
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [lang_saveBtn, lang_cancelBtn],
		items: items,
		titleCollapse: true
	});

	return displayLanForm;
}

function lang_saveBtnHandler(langForm){
	langForm.form.submit({
		url: '/dynamic.pl',
		params: {bufaction: BUFACT_SET_LANG},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			var newlang = Ext.getCmp('langCombo').getValue();
			lang_jsonData = langForm.form.getValues();
			lang_display_mode(langForm);
			//updates and reset the cookie
			updateCookieLang(newlang);
		}
	});
}

function lang_editBtnHandler(lang_edit){
	lang_edit.destroy();
	lang_display = create_langForm_form_edit_mode();
	addToCentralContainer(SYSTEM_RENDER_TO, lang_display);
	lang_display.form.setValues(lang_jsonData);
	lang_display.expand(false);
}

function lang_display_mode(lang_display){
	lang_display.destroy();
	lang_edit= create_langForm_form_display_mode();
	addToCentralContainer(SYSTEM_RENDER_TO, lang_edit);
	lang_edit.form.setValues(lang_jsonData);
	formatLanguage_display_mode();
	lang_edit.expand(false);
}

function formatLanguage_display_mode(){
	var languageField = Ext.getCmp('lang');
	var lang = languageField.getValue();
	languageField.setValue(S('lang_' + lang));

	Ext.getCmp('lang_editBtn').enable();
}
