function create_emailNotifForm_display_mode() {
	var notification = new Ext.form.TextField({
		id: 'notification',
		name: 'notification',
		fieldLabel: S('emailNotif_method'),
		width: 250,
		readOnly: true
	});

	var smtpAddr = new Ext.form.TextField({
		id: 'smtpAddr',
		name: 'smtpAddr',
		fieldLabel: S('emailNotif_smptAddr'),
		width: 250,
		readOnly: true
	});

	var smtpPort = new Ext.form.TextField({
		id: 'smtpPort',
		name: 'smtpPort',
		fieldLabel: S('emailNotif_smptPort'),
		width: 250,
		readOnly: true
	});

	var pop3Addr = new Ext.form.TextField({
		id: 'pop3Addr',
		name: 'pop3Addr',
		fieldLabel: S('emailNotif_pop3Addr'),
		width: 250,
		readOnly: true
	});

	var pop3Port = new Ext.form.TextField({
		id: 'pop3Port',
		name: 'pop3Port',
		fieldLabel: S('emailNotif_pop3Port'),
		width: 250,
		readOnly: true
	});

	var authType = new Ext.form.TextField({
		id: 'authType',
		name: 'authType',
		fieldLabel: S('emailNotif_authType'),
		width: 250,
		readOnly: true
	});

	var user = new Ext.form.TextField({
		id: 'user',
		name: 'user',
		fieldLabel: S('emailNotif_username'),
		width: 250,
		readOnly: true
	});

	var ssl_tls = new Ext.form.TextField({
		id: 'ssl_tls',
		name: 'ssl_tls',
		fieldLabel: S('emailNotif_ssl_tls'),
		width: 250,
		readOnly: true
	});

	var subject= new Ext.form.TextField({
		id: 'subject',
		name: 'subject',
		fieldLabel: S('emailNotif_subject'),
		width: 250,
		readOnly: true
	});

	var recipients = new Ext.form.TextField({
		id: 'recipients',
		fieldLabel: S('emailNotif_recipients'),
		width: 250,
		readOnly: true
	});

	var report = new Ext.form.TextField({
		id: 'report',
		fieldLabel: S('emailNotif_report'),
		width: 450,
		readOnly: true
	});

	var hddStatSendTime = new Ext.form.TextField({
		id: 'hddStatSendTime',
		name: 'hddStatSendTime',
		fieldLabel: S('emailNotif_hddTime'),
		width: 250,
		readOnly: true
	});

	var e_editBtn = new Ext.Button({
		id: 'e_editBtn',
		name: 'e_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				emailNotifForm_display.destroy();
				emailNotifForm_edit = create_emailNotifForm_edit_mode();

				// need to change it for update form id
				insertToCentralContainer(SYSTEM_RENDER_TO, emailNotifForm_edit, render_email_form_before);

				emailNotifForm_edit.form.setValues(email_jsonData);
				var authType_combo = Ext.getCmp('authType_combo');
				var hddStatRptField = Ext.getCmp('hddStatRpt');
				var hddStatSendTimeField = Ext.getCmp('hddStatSendTime');
				var smtpPortField = Ext.getCmp('smtpPort');
				var pop3PortField = Ext.getCmp('pop3Port');
				var ssl_tls_combo = Ext.getCmp('ssl_tls_combo');

				if (email_jsonData.notification == 'on') {
					if ((hddStatRptField.getValue()) || (email_jsonData.quotaRpt == 'on')) {
						hddStatRptField.enable();
						hddStatRptField.setValue(email_jsonData.hddStatRpt);
					}
					else {
						hddStatSendTimeField.disable();
					}
				}
				else {
					Ext.getCmp('emailNotif_notif_off').setValue(true);
				}

				if (email_jsonData.authType == 'null') {
					authType_combo.setValue(null);
				}
				if (email_jsonData.ssl_tls == 'null') {
					ssl_tls_combo.setValue(null);
				}

				if (!email_jsonData.smtpPort) {
					smtpPortField.setValue('25');
				}
				if (!email_jsonData.pop3Port) {
					pop3PortField.setValue('110');
				}

				var passwd = Ext.getCmp('passwd');

				if ((email_jsonData.passwd == 1) || (email_jsonData.passwd == "\ \ \ \ \ \ \ \ ")) {
					passwd.setValue("\ \ \ \ \ \ \ \ ");
				}
				else {
					passwd.setValue('');
				}
				emailNotifForm_edit.expand(false);
			}
		}
	});

	var e_testMsgBtn = new Ext.Button({
		id: 'e_testMsgBtn',
		name:'e_testMsgBtn',
		text: S('emailNotif_testMsgBtn'),
		listeners: {
			click: function() {
				emailNotif_testMsgBtnHandler(emailNotifForm_display);
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var jReader_display =  new Ext.data.JsonReader({
		id: 'jReader_display',
		root: 'data'
		}, [
		{name: 'notification'},
		{name: 'hddStatRpt'},
		{name: 'systemAlert'},
		{name: 'fanTrouble'},
		{name: 'diskError'},
		{name: 'backupComp'},
		{name: 'hddStatSendTime'},
		{name: 'netErr'},
		{name: 'mirrRpt'},
		{name: 'quotaRpt'},
		{name: 'logRpt'},
		{name: 'smtpAddr'},
		{name: 'smtpPort'},
		{name: 'pop3Addr'},
		{name: 'pop3Port'},
		{name: 'authType'},
		{name: 'user'},
		{name: 'passwd'},
		{name: 'ssl_tls'},
		{name: 'sendMsg'},
		{name: 'subject'}
	]);

	var items;
	if (add_smpt_auth) {
		items = [
			notification,
			smtpAddr,
			smtpPort,
			authType,
			pop3Addr,
			pop3Port,
//			user,
			ssl_tls,
//			subject,
			recipients,
			report
//			,hddStatSendTime
		];
	}
	else {
		items = [
			notification,
			smtpAddr,
//			subject,
			recipients,
			report
//			,hddStatSendTime
		];
	}

	var emailNotifForm_display = new Ext.FormPanel({
		id: ID_EMAIL_FORM,
		animCollapse: false,
		title: S('emailNotif_form_title'),
		itemCls: 'display-label',
		cls : 'panel-custBorders',
		reader: jReader_display,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [e_editBtn, e_testMsgBtn],
		items: items,
		titleCollapse: true
	});

	return emailNotifForm_display;
}

function create_emailNotifForm_edit_mode() {
	// turn on validation errors beside the field globally
//	Ext.form.Field.prototype.msgTarget = 'side';
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'qtip';

	var authTypeOpt = [
//		[EMAIL_AUTH_NO, S('disabled')],
		[null, S('disabled')],
		[EMAIL_AUTH_PBS, S('emailNotif_PBS')],
		[EMAIL_AUTH_LOGIN, S('emailNotif_LOGIN')],
		[EMAIL_AUTH_CRAM, S('emailNotif_CRAM-MD5')]
	];

	var authTypeStore = new Ext.data.SimpleStore({
		data: authTypeOpt,
		fields: ['val', 'opt']
	});

	var authType_combo = new Ext.form.ComboBox({
		id: 'authType_combo',
		hiddenName: 'authType',
		editable: false,
		fieldLabel: S('emailNotif_authType'),
		store: authTypeStore,
		displayField: 'opt',
		valueField: 'val',
//		emptyText: S('dTime_selectFreq'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		selectOnFocus: true,
		width: 250,
		listWidth: 250,
		listeners: {
			select: function(authType_combo, record, index) {
				emailNotif_auth_select_handler(index);
			}
		}
	});

	var emailNotif_notif_on = new Ext.form.Radio({
		id: 'emailNotif_notif_on',
		hideLabel: true,
		name: 'notification',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function(emailNotif_notif_on, checked) {
				if (checked) {
					hddStatRpt.enable();
					systemAlert.enable();
					fanTrouble.enable();
					diskError.enable();
					backupComp.enable();
					emailGrid.enable();
					subject.enable();
					smtpAddr.enable();
					smtpPort.enable();
					authType_combo.enable();

					if (netErr) {
						netErr.enable();
					}
					if (mirrRpt) {
						mirrRpt.enable();
					}
					if (quotaRpt) {
						quotaRpt.enable();
					}
					if (logRpt) {
						logRpt.enable();
					}

					if ((hddStatRpt.getValue()) || (quotaRpt.getValue())){
						hddStatSendTime.enable();
					}

					// wake up the "select" listener of this combo
					var auth_value = authType_combo.getValue();
					var auth_value_regexp = new RegExp("^" + auth_value +"$", "i");
					var index = authType_combo.store.find('val', auth_value_regexp, 0, false);
					emailNotif_auth_select_handler(index);
					emailNotif_notif_off.setValue(false);
				}
			}
		}
	});

	var emailNotif_notif_off = new Ext.form.Radio({
		id: 'emailNotif_notif_off',
		hideLabel: true,
		name: 'notification',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function(emailNotif_notif_off, checked) {
				if (checked) {
					emailNotifForm_edit.form.clearInvalid();
					hddStatRpt.disable();
					systemAlert.disable();
					fanTrouble.disable();
					diskError.disable();
					backupComp.disable();
					hddStatSendTime.disable();
					emailGrid.disable();
					subject.disable();
					smtpAddr.disable();
					smtpPort.disable();
					authType_combo.disable();
					pop3Addr.disable();
					pop3Port.disable();
					ssl_tls.disable();
					user.disable();
					passwd.disable();

					if (netErr) {
						netErr.disable();
					}
					if (mirrRpt) {
						mirrRpt.disable();
					}
					if (quotaRpt) {
						quotaRpt.disable();
					}
					if (logRpt) {
						logRpt.disable();
						emailNotif_notif_on.setValue(false);
					}
				}
			}
		}
	});

	var smtpAddr = new Ext.form.TextField({
		id: 'smtpAddr',
		name: 'smtpAddr',
		fieldLabel: S('emailNotif_smptAddr'),
		width: 250,
		disabled: true,
		allowBlank: false
	});

	var smtpPort = new Ext.form.NumberField({
		id: 'smtpPort',
		name: 'smtpPort',
		fieldLabel: S('emailNotif_smptPort'),
		width: 100,
//		emptyText: '25',
		value: '25',
		listeners:{
			change : function(smtpPort, newValue, oldValue) {
				if (!newValue) {
					smtpPort.setValue('25');
				}
			}
		},
		baseChars: '0123456789',
		allowDecimals: false,
		allowNegative: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_SMTP_PORT_SIZE
		}
	});

	var pop3Addr = new Ext.form.TextField({
		id: 'pop3Addr',
		name: 'pop3Addr',
		fieldLabel: S('emailNotif_pop3Addr'),
		width: 250
	});

	var pop3Port = new Ext.form.NumberField({
		id: 'pop3Port',
		name: 'pop3Port',
		fieldLabel: S('emailNotif_pop3Port'),
		width: 100,
		value: '110',
		listeners: {
			change : function(pop3Port, newValue, oldValue) {
				if (!newValue) {
					pop3Port.setValue('110');
				}
			}
		},
		baseChars: '0123456789',
		allowDecimals: false,
		allowNegative: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_SMTP_PORT_SIZE
		}
	});

	var user = new Ext.form.TextField({
		id: 'user',
		name: 'user',
		fieldLabel: S('emailNotif_username'),
		maskRe : /\S/,
		width: 250
	});

	var passwd = new Ext.form.TextField({
		id: 'passwd',
		name: 'passwd',
		inputType: 'password',
		fieldLabel: S('emailNotif_passwd'),
		width: 250
	});

	var ssl_tlsOpt = [
		['SSL', S('emailNotif_SSL')],
		['TLS', S('emailNotif_TLS')],
		[null, S('disabled')]
	];

	var ssl_tlsStore = new Ext.data.SimpleStore({
		data: ssl_tlsOpt,
		fields: ['val','opt']
	});

	var ssl_tls = new Ext.form.ComboBox({
		id: 'ssl_tls_combo',
		hiddenName: 'ssl_tls',
		editable: false,
		fieldLabel: S('emailNotif_ssl_tls'),
		store: ssl_tlsStore,
		displayField: 'opt',
		valueField: 'val',
//		emptyText: S('dTime_selectFreq'),
		mode: 'local',
		triggerAction: 'all',
		forceSelection: true,
		allowBlank: false,
		selectOnFocus: true,
		width: 100,
		listWidth: 100,
		value: null
	});

	var smtpAddr = new Ext.form.TextField({
		fieldLabel: S('emailNotif_smptAddr'),
		name: 'smtpAddr',
		width: 250
	});

	var subject = new Ext.form.TextField({
		fieldLabel: S('emailNotif_subject'),
		name: 'subject',
		width: 250
	});

	var hddStatRpt = new Ext.form.Checkbox({
		id: 'hddStatRpt',
		name: 'hddStatRpt',
		hideLabel: true,
		width: 250,
		boxLabel: S('emailNotif_hddStatus'),
		listeners: {
			check: function(){
				if ((hddStatRpt.getValue() == true) || (quotaRpt.getValue() == true)) {
					hddStatSendTime.enable();
				}
				else {
					hddStatSendTime.disable();
				}
			}
		}
	});

	var systemAlert = new Ext.form.Checkbox({
		id: 'systemAlert',
		name: 'systemAlert',
		hideLabel: true,
		width: 250,
		boxLabel: S('emailNotif_systemAlert')
	});

	var fanTrouble = new Ext.form.Checkbox({
		name: 'fanTrouble',
		hideLabel: true,
		width: 250,
		boxLabel: S('emailNotif_fanTrouble')
	});

	var diskError = new Ext.form.Checkbox({
		name: 'diskError',
		hideLabel: true,
		boxLabel: S('emailNotif_diskError')
	});

	var backupComp = new Ext.form.Checkbox({
		name: 'backupComp',
		hideLabel: true,
		width: 250,
		boxLabel: S('emailNotif_backupComp')
	});
/*
	var diskFull = new Ext.form.Checkbox({
		name: 'diskFull',
		hideLabel: true,
		boxLabel: S('emailNotif_diskFull')
	});
*/
	var netErr = new Ext.form.Checkbox({
		name: 'netErr',
		width: 250,
		hideLabel: true,
		boxLabel: S('emailNotif_netErr')
	});

	var mirrRpt = new Ext.form.Checkbox({
		name: 'mirrRpt',
		width: 250,
		hideLabel: true,
		boxLabel: S('emailNotif_mirrRpt')
	});
	
	var quotaRpt = new Ext.form.Checkbox({
		name: 'quotaRpt',
		width: 250,
		hideLabel: true,
		boxLabel: S('emailNotif_quotaRpt'),
		listeners: {
			check: function() {
				if ((hddStatRpt.getValue() == true) || (quotaRpt.getValue() == true)) {
					hddStatSendTime.enable();
				}
				else {
					hddStatSendTime.disable();
				}
			}
		}
	});

	var logRpt = new Ext.form.Checkbox({
		name: 'logRpt',
		width: 250,
		hideLabel: true,
		boxLabel: S('emailNotif_LogErr')
	});

	var timeOpt = new Array();

	for (var i = 0; i < 24;i++) {
		timeOpt[i] = new Array();
		timeOpt[i][0] = i;
		timeOpt[i][1] = i;
	}

	var timeStore = new Ext.data.SimpleStore({
		data: timeOpt,
		fields: ['val','opt']
	});

	var hddStatSendTime = new Ext.form.ComboBox({
		name: 'hddStatSendTime',
		id: 'hddStatSendTime',
		emptyText: S('emailNotif_hddSendingTime'),
		store: timeStore,
		minValue: 0,
		maxValue: 23,
		displayField: 'opt',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		value: 5,
		selectOnFocus: true,
		forceSelection: true,
		width:40,
		listWidth:45,
		hideLabel: true
	});

	var emailAddress = new Ext.form.TextField({
		id: 'emailAddress',
		vtype: 'email',
		hideLabel: false,
		emptyText: S('emailNotif_newEmail'),
		vtypeText: S('emailNotif_invalidEmail'),
		width: 150
	});

	var addBtn = new Ext.Button({
		id: 'addBtn',
		name: 'addBtn',
		text: S('btn_add'),
		iconCls: 'add',
		handler: function() {
			emailNotifForm_addBtnHandler('emailGrid', 'emailAddress');
		}
	});

	var delBtn = new Ext.Button({
		name: 'delBtn',
		id: 'delBtn',
		text: S('btn_remove'),
		iconCls: 'delete',
		disabled: true,
		handler: function(){
			var emptyList = false;
			var devGrid;
			var selModel;
			var selectedRecords;
			var ipList;
			var msg;
			var buttons;
			var title;
			var icon;

			// get data from grid2
			devGrid = Ext.getCmp('emailGrid');
			selModel = devGrid.getSelectionModel();

			// returns an array of selected records
			selectedRecords = selModel.getSelections();

			// convert data array into a json string
			emialList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				emialList[i] = selectedRecords[i].data.email;
			}
			msg = S('emailNotif_confirmRemoveErr');
			emptyList = true;
			buttons = Ext.MessageBox.OKCANCEL;
			title = S('warning');
			icon = Ext.MessageBox.QUESTION;

			Ext.MessageBox.show({
				title: title,
				msg: msg,
				buttons: buttons,
				icon: icon,
				fn: function(btn) {
					if (emptyList && btn == 'ok') {
						emailNotifForm_removeBtnHandler(emailGrid);
					}
				}
			});
		}
	});

	// email notification grid
	sm = new Ext.grid.CheckboxSelectionModel({
		header: '<div id="emailListHeader" class="x-grid3-hd-checker"> </div>',
		listeners: {
			rowselect: function() {
				delBtn.enable()
			},
			rowdeselect: function(sm) {
				if (sm.getCount() == 0) {
					delBtn.disable();
				}
				var cm = emailGrid.getColumnModel();
				cm.setColumnHeader(0, '<div id="emailListHeader" class="x-grid3-hd-checker">\&\#160;</div>');
			}
		}
	});

	cm = new Ext.grid.ColumnModel([
		sm, {
			header: S('emailNotif_recipients'),
			width: 245,
			dataIndex: 'email'
		}
	]);

	jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		autoLoad: false,
		baseParams: {
			bufaction: 'getEmailList'
		},
		waitMsg: S('msg_loading_data'),
		fields: [
			{
				name: 'email'
			}
		]
	});

	emailGrid = new Ext.grid.GridPanel({
		id: 'emailGrid',
		frame: true,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 300,
		height: 150,
		enableColumnMove: false,
		tbar: [
			emailAddress,
			addBtn,
			'-',
			delBtn
		]
	});

	jsonStore.load({
		callback: function(r, o, s) {
			var result = jsonStore.reader.jsonData.success;
			if (!result) {
				formFailureFunction();
			}
			else {
				if (jsonStore.getCount() >= MAX_EMAIL_LIMIT) {
					addBtn.disable();
					emailAddress.disable();
				}
			}
		}
	});

	var dt_saveBtn = new Ext.Button({
		id: 'dt_saveBtn',
		name: 'dt_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function(){ 
				emailNotifForm_saveBtnHandler(emailNotifForm_edit, emailGrid);
			}
		}
	});

	var dt_cancelBtn = new Ext.Button({
		id: 'dt_cancelBtn',
		name:'dt_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function(){ 
				emailNotifForm_cancelBtnHandler(emailNotifForm_edit);
			}
		}
	});

	var jReader_edit = new Ext.data.JsonReader({
		id: 'jReader_edit',
		root: 'data'
	}, [
		{name: 'notification'},
		{name: 'hddStatRpt'},
		{name: 'systemAlert'},
		{name: 'fanTrouble'},
		{name: 'diskError'},
		{name: 'backupComp'},
		{name: 'hddStatSendTime'},
		{name: 'netErr'},
		{name: 'mirrRpt'},
		{name: 'quotaRpt'},
		{name: 'logRpt'},
//		{name: 'diskFull'},
		{name: 'smtpAddr'},
		{name: 'smtpPort'},
		{name: 'pop3Addr'},
		{name: 'pop3Port'},
		{name: 'authType'},
		{name: 'user'},
		{name: 'passwd'},
		{name: 'ssl_tls'},
		{name: 'subject'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var items;
	var reportItems;

	if (add_fan) {
		reportItems = [{
			html: '<br>'
		},
			hddStatRpt,
			fanTrouble,
			diskError
		];
	}
	else {
		reportItems = [{
			html: '<br>'
		},
			hddStatRpt,
			diskError
		];
	}

	if (!add_iscsi){
		reportItems[reportItems.length] = backupComp;
		if (user_add_quota_soft || group_add_quota_soft){
			reportItems[reportItems.length] = quotaRpt;
		}
	}

	if (product_name.match(/^TS-/i)) {
		reportItems[reportItems.length] = systemAlert;
	}

/*
	if (add_trunking) {
		reportItems[reportItems.length] = netErr;
	}
	if (user_add_quota_soft || group_add_quota_soft) {
		reportItems[reportItems.length] = quotaRpt;
	}
	if (add_syslog) {
		reportItems[reportItems.length] = logRpt;
	}
	if (add_repli) {
		reportItems[reportItems.length] = mirrRpt;
	}
*/

	if (add_smpt_auth){
		items = [
			{
				layout: 'column',
				cls: 'column-custBorders',
				items: [
				{
					cls: 'label',
					columnWidth: .264,
					html: S('emailNotif_method') + ":"
				},{
					layout: 'form',
					columnWidth: .368,
					items: [emailNotif_notif_on]
				},{
					layout: 'form',
					columnWidth: .368,
					items: [emailNotif_notif_off]
				}]
			},
				smtpAddr,
				smtpPort,
				authType_combo,
				pop3Addr,
				pop3Port,
				ssl_tls,
				user,
				passwd,
				subject,
			{
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					layout: 'form',
					columnWidth: .264,
					items: [{
						cls: 'label',
						html: S('emailNotif_recipients') + ":"
					}]
				},{
					layout: 'form',
					columnWidth: .736,
					items: [emailGrid]
				}]
			}, {
				lautoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					layout:'form',
					columnWidth: .27,
					items: [{
						cls: 'label',
						html: '<br>' + S('emailNotif_report') + ":"
					}]
				}, {
					layout: 'form',
					columnWidth: .35,
					items: reportItems
				}, {
					layout: 'form',
					columnWidth: .10,
					items: [{
						html: '<br>'
					},
						hddStatSendTime]
				}, {
					columnWidth: .19,
					cls: 'label',
					html: '<br> '+ S('o_clock')
				}]
			}
		]
	}
	else {
		items = [
		{
			layout: 'column',
			cls: 'column-custBorders',
			items: [
			{
				cls: 'label',
				columnWidth: .264,
				html: S('emailNotif_method') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [emailNotif_notif_on]
			}, {
				layout:'form',
				columnWidth: .368,
				items: [emailNotif_notif_off]
			}]
		},
			smtpAddr,
			subject,
			{
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					layout: 'form',
					columnWidth: .264,
					items: [{
						cls: 'label',
						html: S('emailNotif_recipients') + ":"
					}]
				}, {
					layout:'form',
					columnWidth: .736,
					items: [emailGrid]
				}]
			}, {
				lautoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					layout: 'form',
					columnWidth: .264,
					items: [{
						cls: 'label',
						html: '<br>' + S('emailNotif_report') + ":"
					}]
				}, {
					layout: 'form',
					id: 'reportItems',
					columnWidth: .30,
					items: reportItems
				}, {
					layout: 'form',
					columnWidth: .08,
					items: [{
						html: '<br>'
					},
						hddStatSendTime
					]
				},{
					columnWidth: .20,
					cls: 'label',
					html: '<br>' + S('o_clock')
				}
			]}
		]
	}

	var emailNotifForm_edit = new Ext.FormPanel({
		id: ID_EMAIL_FORM,
		animCollapse: false,
		title: S('emailNotif_form_title'),
		reader: jReader_edit,
		cls: 'panel-custBorders',
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			dt_saveBtn,
			dt_cancelBtn
		],
		items: items,
		titleCollapse: true
	});

	return emailNotifForm_edit;
}

function emailNotif_auth_select_handler(index) {
	var pop3Addr = Ext.getCmp('pop3Addr');
	var pop3Port = Ext.getCmp('pop3Port');
	var ssl_tls = Ext.getCmp('ssl_tls_combo');
	var user = Ext.getCmp('user');
	var passwd = Ext.getCmp('passwd');

	if (index == 0) {
		// the authentication is disabled, disable pop3 address & port, username & pwd
		pop3Addr.disable();
		pop3Port.disable();
		ssl_tls.disable();
		user.disable();
		passwd.disable();
	}
	else if (index == 1) {
		// pbs is selected, disable ssl/tls, enable username, pwd, pop3 add & port
		ssl_tls.disable();
		user.enable();
		passwd.enable();
		pop3Addr.enable();
		pop3Port.enable();
	}
	else {
		// login or Cram are selected, disable ssl/tls, enable u/pwd
		pop3Addr.disable();
		pop3Port.disable();
		ssl_tls.enable();
		user.enable();
		passwd.enable();
	}
}

function emailNotifForm_saveBtnHandler(emailNotifForm_edit, emailGrid){
	var store;
	var records;
	var dataToParse;
	var emailList;
	var ssl_tls_combo;
	var ssl_tls_value;

	store = emailGrid.getStore();
	ssl_tls_combo = Ext.getCmp('ssl_tls_combo')
	ssl_tls_value = ssl_tls_combo.getValue();

	// get members of each group
	records = store.getRange();

	// Create temporal arrays to parse data as JSON object
	dataToParse = new Array(records.length);

	for (var i = 0; i < records.length; i++){
//		dataToParse[i] = new Array(1);
		dataToParse[i] = records[i].data.email;
	}
	emailList= Ext.util.JSON.encode(dataToParse);

	emailNotifForm_edit.form.submit({
		url: '/dynamic.pl', 
		params: {
			bufaction: BUFACT_SET_EMAIL_SETTINGS,
			emailList: emailList,
			ssl_tls: ssl_tls_value
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			emailNotifForm_edit.destroy();
			emailNotifForm_display = create_emailNotifForm_display_mode();
			insertToCentralContainer(SYSTEM_RENDER_TO, emailNotifForm_display, render_email_form_before);
			
			emailNotifForm_display.load({
				url: '/dynamic.pl',
				params: {bufaction:BUFACT_GET_EMAIL_SETTINGS},
				waitMsg: S('msg_loading_data'),
				failure: function(form,action) {
					formFailureFunction(action);
				},
				success: function(form,action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					email_jsonData = resp.data[0];
					emailNotif_fieldValuesHandler(emailNotifForm_display, email_jsonData);
					emailNotifForm_display.expand(false);
				}
			});
		}
	});
}

function emailNotif_fieldValuesHandler(emailNotifForm_display, data) {
	emailNotifForm_display.form.setValues(data);
	var emailNotif = Ext.getCmp('notification');
	var ssl_tls = Ext.getCmp('ssl_tls');
	var authType = Ext.getCmp('authType');
	var pop3Addr = Ext.getCmp('pop3Addr');
	var pop3Port = Ext.getCmp('pop3Port');
	var testMsg = Ext.getCmp('e_testMsgBtn');
	var reportTimeField = Ext.getCmp('hddStatSendTime');

	var notifValue;
	if (email_jsonData.notification == 'off') {
		notifValue = S('disabled');
		testMsg.disable();
	}
	else {
		notifValue = S('enabled');
		testMsg.enable();
	}

	emailNotif.setValue(notifValue);

	if (add_smpt_auth) {
		var methValue;
		var sslValue;
		var pop3AddrValue;
		var pop3PortValue;

		if ((email_jsonData.authType == 'no') || (!email_jsonData.authType)) {
			methValue = S('disabled');
			sslValue = '-';
			pop3AddrValue = '-';
			pop3PortValue = '-';
		}
		else {
			methValue = S('emailNotif_' + email_jsonData.authType);
			pop3AddrValue = email_jsonData.pop3Addr;
			pop3PortValue = email_jsonData.pop3Port;
			
			if (email_jsonData.authType != 'PBS') {
				sslValue = S('emailNotif_' + email_jsonData.ssl_tls);
				if (!email_jsonData.ssl_tls) {
					sslValue = S('disabled');
				}
			}
			else {
				sslValue = '-';
			}
		}

		authType.setValue(methValue);
		ssl_tls.setValue(sslValue);
		pop3Addr.setValue(pop3AddrValue);
		pop3Port.setValue(pop3PortValue);
	}

	emailListStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_EMAIL_SETTINGS_LIST
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'email'
		}]
	});

	// get list of email addresses & populate field
	emailListStore.load({
		callback: function(r){
			var result = emailListStore.reader.jsonData;
			if (result && result.success) {
				var emailList = '';
				for (var i = 0; i < r.length - 1; i++) {
					emailList += r[i].get('email') + ', ';
				}
				if (r.length > 0) {
					emailList += r[r.length-1].get('email');
					Ext.getCmp('recipients').setValue(emailList);
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	// populate field with the events to report
	var events = new Array();
	var i = 0;

	if (email_jsonData.hddStatRpt == 'on') {
		events[i] = S('emailNotif_hddStatus');

/*
		var reportTime = email_jsonData.hddStatSendTime;
		reportTime += ' ' + S('o_clock');
		reportTimeField.setValue(reportTime);
*/

	}

	if (email_jsonData.systemAlert == 'on') {
		if (product_name.match(/^TS-/i)) {
			events[++i] = S('emailNotif_systemAlert');
		}
	}

	if (add_fan) {
		if (email_jsonData.fanTrouble == 'on') {
			events[++i] = S('emailNotif_fanTrouble');
		}
	}

	if (email_jsonData.diskError == 'on') {
		events[++i] = S('emailNotif_diskError');
	}

	if (email_jsonData.backupComp == 'on') {
		events[++i] = S('emailNotif_backupComp');
	}

	if (email_jsonData.quotaRpt == 'on') {
		events[++i] = S('emailNotif_quotaRpt');
	}

/*
	if (email_jsonData.diskFull== 'on') {
		events[++i] = S('emailNotif_diskFull');
	}
*/

	var eventList = '';

	// only display two events then dots(...) indicating that there are more
	var total_items = events.length;
	var defined_events = 0;
	for (var i = 0; i < total_items; i++) {
		if (i > 0 && eventList) {
			eventList += ', ';
		}
		if (events[i]) {
			eventList += events[i];
			defined_events++;
		}
		if (defined_events == 2) {
			break;
		}
	}
	if (events[2] || events[3]) {
		eventList += ', ...';
	}

	Ext.getCmp('report').setValue(eventList);
}

function emailNotifForm_cancelBtnHandler(emailNotifForm_edit) {
	emailNotifForm_edit.destroy();
	var emailNotifForm_display = create_emailNotifForm_display_mode();
	insertToCentralContainer(SYSTEM_RENDER_TO, emailNotifForm_display, render_email_form_before);
	emailNotif_fieldValuesHandler(emailNotifForm_display, email_jsonData);
	emailNotifForm_display.expand(false);
}

function emailNotifForm_removeBtnHandler(emailGrid) {
	var jsonStore;
	var selModel;
	var selectedRecords;

	jsonStore = emailGrid.getStore();
	selModel = emailGrid.getSelectionModel();
	selectedRecords = selModel.getSelections();
	var delBtn = Ext.getCmp('delBtn');

	// remove the records selected from grid
	for (var i = 0; i < selectedRecords.length; i++) {
		jsonStore.remove(selectedRecords[i]);
		delBtn.disable();
	}
	var addBtn = Ext.getCmp('addBtn');
	var emailAddress = Ext.getCmp('emailAddress');
	if (jsonStore.getCount() >= MAX_EMAIL_LIMIT) {
		addBtn.disable();
		emailAddress.disable();
	}
	else {
		addBtn.enable();
		emailAddress.enable();
	}

	var cm = emailGrid.getColumnModel();
	cm.setColumnHeader(0, '<div id="emailListHeader" class="x-grid3-hd-checker">\&\#160;</div>');
}

function emailNotifForm_addBtnHandler(gridId, newEmailFieldId) {
	var devGrid;
	var emailAddField;
	var jsonStore;
	var myRec;
	var myNewRec;

	devGrid = Ext.getCmp(gridId);
	emailAddField = Ext.getCmp(newEmailFieldId);
	jsonStore = devGrid.getStore();

	// create a new record and add to grid
	myRec = Ext.data.Record.create([
		{
			name: 'email'
		}
	]);

	// check if the address already exist in the list:
	var value = emailAddField.getValue();
	var regexp = new RegExp("^" + value +"$", "i");
	var found = jsonStore.find('email', regexp, 0, false);
	if (found != -1) {
		msgBox_usingDictionary('error_box_title', 'emailNotif_emailExists', Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
	else if (emailAddField.isValid(false) && value != '') {
		myNewRec = new myRec({
			email: emailAddField.getValue()
		});
		emailAddField.setValue('');
		jsonStore.add(myNewRec);
		if (jsonStore.getCount() >= MAX_EMAIL_LIMIT) {
			Ext.getCmp('addBtn').disable();
			Ext.getCmp('emailAddress').disable();
		}
	}
	else {
		msgBox_usingDictionary('error_box_title', 'emailNotif_emailFormatErr', Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
}

function emailNotif_testMsgBtnHandler(emailNotifForm_display) {
	emailNotifForm_display.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_EMAIL_TEST_MSG
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			msgBox_usingDictionary('emailNotif_testMsg_win_title', 'emailNotif_testMsgSent', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}