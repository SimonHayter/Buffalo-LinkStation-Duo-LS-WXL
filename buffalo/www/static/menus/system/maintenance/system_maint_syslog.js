function create_syslog_display_mode(){
	var syslogTransfer = new Ext.form.TextField({
		id: 'syslogService',
		name: 'syslogService',
		fieldLabel: S('maint_syslog'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var syslogTransfer_ip = new Ext.form.TextField({
		id: 'syslogIp',
		name: 'syslogIp',
		fieldLabel: S('maint_syslog_serverIp'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var syslogTransfer_info = new Ext.form.TextField({
		id: 'syslogInfo',
		name: 'syslogInfo',
		fieldLabel: S('maint_syslog_logInfo'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var syslog_editBtn = new Ext.Button({
		id: 'syslog_editBtn',
		name: 'syslog_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function(){
				syslogTransfer_editBtnHandler(syslogForm);
			}
		}
	});

	var syslogLink = new Ext.form.TextField({
		id: 'syslogLink',
		name: 'syslogLink',
		fieldLabel: S('maint_syslog_link'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label'
	});

	var syslogTarget = new Ext.form.TextField({
		id: 'syslogTarget',
		name: 'syslogTarget',
		fieldLabel: S('maint_syslog_target'),
		width: 400,
		readOnly: true,
		itemCls: 'display-label'
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'syslogService'},
		{name: 'syslogIp'},
		{name: 'syslogInfo'},
		{name: 'syslogTarget'},
		{name: 'syslogLink'},
		{name: 'syslogSystem'},
		{name: 'syslogSmb'},
		{name: 'syslogIscsi'},
		{name: 'syslogFtp'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var systemLogLink = '<p class="label"><a href="log/linkstation.log" target="_blank">' +  S('maint_syslog_systemLog') + '</a></p>';
	var smbLogLink = '<p class="label"> <a href="log/file.smb" target="_blank">' + S('maint_syslog_smbLog') + '</a></p>';
	var ftpLogLink = '<p class="label"> <a href="log/xferlog" target="_blank">' +  S('maint_syslog_ftpLog') + '</a></p>';

	var logViewRow = {
		layout: 'column',
		cls : 'column-custBorders',
		items: [{
			layout: 'form',
			columnWidth: .27,
			html: '<p class="label">' + S('maint_syslog_logView') + ':</p>'
		},
		{
			layout: 'form',
			columnWidth: .20,
			columnHeight: 20,
			items: [{
				html: systemLogLink + smbLogLink + ftpLogLink
			}]
		}]
	};

	var items;
	
	if(add_iscsi){
		items = [
			syslogTransfer,
			syslogTransfer_ip,
			syslogTransfer_info
		];
	}
	else{
		items = [
			syslogTransfer,
			syslogTransfer_ip,
			syslogTransfer_info,
			syslogLink,
			syslogTarget,
			logViewRow
		];
	}
	
	var syslogForm = new Ext.FormPanel({
		id: ID_SYSLOG_FORM,
		cls : 'panel-custBorders',
		title: S('maint_syslog_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [syslog_editBtn],
		titleCollapse: true,
		animCollapse: false,
		collapsed: true,
		items: items
	});

	return syslogForm;
}

function syslogTransfer_edit_mode(syslogForm){
	var syslogService_on = new Ext.form.Radio({
		boxLabel: S('maint_syslog_enable'),
		name: 'syslogService',
		id: 'syslogService_on',
		inputValue: 'on',
		hideLabel: true,
		listeners: {
			check: function(syslogService_on, checked) {
				if (checked) {
					syslogService_off.setValue(false);
					this.checked = true;
					syslogTransfer_ip.enable();
					systemLog.enable();
					smbLog.enable();
					if(syslogIscsi){
						syslogIscsi.enable();
					}
				}
			}
		}
	});

	var syslogService_off= new Ext.form.Radio({
		boxLabel: S('maint_syslog_disable'),
		name: 'syslogService',
		id: 'syslogService_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(syslogService_off, checked) {
				if (checked) {
					this.checked = true;
					syslogService_on.setValue(false);
					syslogTransfer_ip.clearInvalid();
					syslogTransfer_ip.disable();
					systemLog.disable();
					smbLog.disable();
					applyBtn.enable();
					if(syslogIscsi){
						syslogIscsi.disable();
					}
				}
			}
		}
	});

	var syslogTransfer_ip = new Ext.form.TextField({
		id: 'syslogTransfer_ip',
		name: 'syslogIp',
		fieldLabel: S('maint_syslog_serverIp'),
		width: 200,
		allowBlank: false
	});

	var systemLog = new Ext.form.Checkbox({
		boxLabel: S('maint_syslog_systemLog'),
		width: 200,
		name: 'syslogSystem',
		inputValue: '1',
//		autoWidth: true,
		hideLabel: true,
		listeners: {
			check: function(systemLog, checked) {
				if (checked) {
					applyBtn.enable();
				}
			}
		}
	});

	var smbLog = new Ext.form.Checkbox({
		boxLabel: S('maint_syslog_smbLog'),
		name: 'syslogSmb',
		width: 200,
//		autoWidth: true,
		inputValue: '1',
		hideLabel: true,
		listeners: {
			check: function(smbLog, checked) {
				if (checked) {
					applyBtn.enable();
				}
			}
		}
	});
	var syslogIscsi = new Ext.form.Checkbox({
		boxLabel: S('maint_syslog_iscsiLog'),
		name: 'syslogIscsi',
		width: 200,
//		autoWidth: true,
		inputValue: '1',
		hideLabel: true,
		listeners: {
			check: function(syslogIscsi, checked) {
				if (checked) {
					applyBtn.enable();
				}
			}
		}
	});

	var syslogLink_on = new Ext.form.Radio({
		boxLabel: S('logLink_enabled'),
		name: 'syslogLink',
		id: 'syslogLink_on',
		inputValue: 'on',
		hideLabel: true,
		listeners:{
			check: function(syslogLink_on, checked) {
				if (checked) {
					syslogLink_off.setValue(false);
					this.checked = true;
					syslogShareOptions.enable();
				}
			}
		}
	});

	var syslogLink_off= new Ext.form.Radio({
		boxLabel: S('logLink_disabled'),
		name: 'syslogLink',
		id: 'syslogLink_off',
		inputValue: 'off',
		hideLabel: true,
		checked: true,
		listeners:{
			check: function(syslogLink_off, checked) {
				if (checked) {
					this.checked = true;
					syslogLink_on.setValue(false);
					syslogShareOptions.disable();
				}
			}
		}
	});

	var store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACTION_GET_SYSLOG_LINK_TARGET
		},
		root: 'data',
		fields: [{
			name: 'opt'
		},
		{
			name: 'val'
		}]
	});

	var syslogShareOptions = new Ext.form.ComboBox({
		id: 'syslogTargetCombo',
		name: 'syslogTarget',
		hiddenName: 'syslogTarget',
		disabled: true,
		value: '',
		fieldLabel: S('maint_syslog_target'),
		store: store,
		displayField: 'opt',
		valueField: 'val',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		listWidth: 400,
		width: 400,
		editable: false
	});

	store.load({
		callback: function(r, opt, success) {
			var result = store.reader.jsonData.success;
			if (result) {
				if (syslogLink_on.getValue()) {
					syslogShareOptions.enable();
					var folderName = 'info';
					var infoFolderIndex = store.find('value', folderName);
					if (infoFolderIndex != -1) {
						store.remove(store.getAt(infoFolderIndex));
					}
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		enabled: true,
		handler: function(f){
			syslogTransfer_apply(syslogForm);
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function(){
			syslogTransfer_cancel(syslogForm);
		}
	});

	var jReader =  new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'syslogService'},
		{name: 'syslogIp'},
		{name: 'syslogSystem'},
		{name: 'syslogSmb'},
		{name: 'syslogIscsi'},
		{name: 'syslogFtp'},
		{name: 'syslogTarget'},
		{name: 'syslogLink'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);
	
	var items;
	
	if(add_iscsi){
		
		items = [{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .27,
				html: '<p class="label">' + S('maint_syslog') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [syslogService_on]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [syslogService_off]
			}]
		},
			syslogTransfer_ip,
		{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .27,
				html: '<p class="label">' + S('maint_syslog_logInfo') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .40,
				columnHeight:20,
				items: [
					systemLog,
					syslogIscsi
				]
			}]
		}];
	
	}
	else{
		items = [{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .27,
				html: '<p class="label">' + S('maint_syslog') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [syslogService_on]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [syslogService_off]
			}]
		},
			syslogTransfer_ip,
		{
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .27,
				html: '<p class="label">' + S('maint_syslog_logInfo') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .40,
				columnHeight:20,
				items: [
					systemLog,
					smbLog
				]
			}]
		},{
			layout: 'column',
			cls : 'column-custBorders', 
			items: [{
				layout: 'form',
				columnWidth: .27,
				html: '<p class="label">' + S('maint_syslog_link') + ':</p>'
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [syslogLink_on]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [syslogLink_off]
		}]
		}, syslogShareOptions];
	}

	var syslogForm = new Ext.FormPanel({
		id: ID_SYSLOG_FORM,
		cls : 'panel-custBorders',
		title: S('maint_syslog_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		width: 640,
		labelWidth: 160,
		buttonAlign: 'left',
		buttons: [
			applyBtn,
			cancelBtn
		],
		titleCollapse: true,
		animCollapse: false,
		collapsed: false,
		items: items
	});

	return syslogForm;
}

function syslogTransfer_apply(syslogEditForm){
	var target = Ext.getCmp('syslogTargetCombo').getValue();
	syslogEditForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACTION_SET_SYSLOG,
			syslogTarget: target
		}, 
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			syslog_jsonData = syslogEditForm.form.getValues();
			syslog_jsonData.syslogTarget = Ext.getCmp('syslogTargetCombo').getRawValue();
			syslogEditForm.destroy();
			var display = create_syslog_display_mode();
			insertToCentralContainer(SYSTEM_RENDER_TO, display, render_syslog_before); 
			display.form.setValues(syslog_jsonData);
			syslogTrasfer_formatDisplay(syslog_jsonData);
			display.expand(false); //expand without animating
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

function syslogTransfer_cancel(displayForm){
	displayForm.destroy();
	var display = create_syslog_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, display, render_syslog_before);
	display.form.setValues(syslog_jsonData);
	syslogTrasfer_formatDisplay(syslog_jsonData);
	display.expand(false); //expand without animating
}

function syslogTransfer_editBtnHandler(displayForm){
	displayForm.destroy();
	var editForm = syslogTransfer_edit_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, editForm, render_syslog_before);
	editForm.form.setValues(syslog_jsonData);

	var syslog_target_combo = Ext.getCmp('syslogTargetCombo');
	if (syslog_jsonData.syslogLink == 'on') {
		syslog_target_combo.enable();
	}
}

function syslogTrasfer_formatDisplay(data) {
	var service_value;
	var info_value = '';
	var ip_value = '';
	var link_value = '';

	var syslog_service_field = Ext.getCmp('syslogService');
	var syslogInfo_field = Ext.getCmp('syslogInfo');
	var syslogIp_field = Ext.getCmp('syslogIp');
	var syslogLink_field = Ext.getCmp('syslogLink');
	var syslogTarget_field = Ext.getCmp('syslogTarget');

	if (data.syslogService == 'on') {
		service_value = S('enabled');
		if (data.syslogSystem == '1') {
			info_value = S('maint_syslog_systemLog') + ", ";
		}
		if (data.syslogSmb == '1') {
			info_value += S('maint_syslog_smbLog');
		}
		if (data.syslogIscsi == '1') {
			info_value += S('maint_syslog_iscsiLog');
		}
		else {
			info_value = info_value.substring(0, info_value.length - 2);
		}
	}
	else {
		service_value = S('disabled');
		info_value = '-';
		ip_value = '-';
		link_value = '-';
		syslogIp_field.setValue(ip_value);
	}

	syslog_service_field.setValue(service_value);
	syslogInfo_field.setValue(info_value);
		
	if(!add_iscsi){
		if (data.syslogLink == 'on') {
			link_value = S('enabled');
		}
		else {
			link_value = S('disabled');
			target_value = '-';
			syslogTarget_field.setValue(target_value);
		}
		syslogLink_field.setValue(link_value);
	}
}