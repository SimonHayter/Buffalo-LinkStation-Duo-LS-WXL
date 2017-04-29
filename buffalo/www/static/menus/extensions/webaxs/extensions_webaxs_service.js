function create_webaxs_form_display_mode(isDetail) {
	var hideModeVal = 'offsets';

	var service = new Ext.form.TextField({
		id: 'service',
		name: 'service',
		fieldLabel:S('webaxs_sercive_field'),
		width: 400,
		readOnly: true,
		hideMode : hideModeVal
	});

	var ssl = new Ext.form.TextField({
		id: 'ssl',
		name: 'ssl',
		fieldLabel:S('webaxs_ssl_field'),
		width: 400,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var server = new Ext.form.TextField({
		id: 'server',
		fieldLabel:S('webaxs_server_field'),
		width: 400,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var name = new Ext.form.TextField({
		id: 'name',
		name: 'name',
		fieldLabel: S('webaxs_serverName_field'),
		autoWidth: true,
		readOnly: true,
		hideMode : hideModeVal
	});

	var key = new Ext.form.TextField({
		id: 'key',
		name: 'key',
		fieldLabel: S('webaxs_serverKey_field'),
		autoWidth: true,
		readOnly: true,
		hideMode : hideModeVal
	});

	var ddns = new Ext.form.TextField({
		id: 'ddns',
		name: 'ddns',
		fieldLabel: S('webaxs_dns_field'),
		autoWidth: true,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var upnp = new Ext.form.TextField({
		id: 'upnp',
		name: 'upnp',
		fieldLabel:S('webaxs_upnp_field'),
		width: 400,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var port = new Ext.form.TextField({
		id: 'port',
		name: 'port',
		fieldLabel: S('webaxs_port_field'),
		autoWidth: true,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var inner_port = new Ext.form.TextField({
		id: 'inner_port',
		name: 'inner_port',
		fieldLabel: S('webaxs_inner_port_field'),
		autoWidth: true,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var session_exclusive = new Ext.form.TextField({
		id: 'session_exclusive',
		name: 'session_exclusive',
		fieldLabel: S('webaxs_session_exclusive_field'),
		autoWidth: true,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var session_expire_min = new Ext.form.TextField({
		id: 'session_expire_min',
		name: 'session_expire_min',
		fieldLabel: S('webaxs_session_expire_min_field'),
		autoWidth: true,
		readOnly: true,
		hideLabel : !isDetail,
		hidden : !isDetail,
		hideMode : hideModeVal
	});

	var detail_settings = new Ext.form.Hidden({
		id: 'detail_settings',
		name: 'detail_settings',
		readOnly: true
	});	

	var hn_easy_editBtn = new Ext.Button({
		id: 'hn_easy_editBtn',
		name: 'hn_easy_editBtn',
		text: S('btn_webaxs_easy_modify_settings'),
		listeners: {
			click: function() {
				detailSettings = false;
				webaxs_editBtnHandler(webaxsForm,false);
			}
		}
	});

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_webaxs_detail_modify_settings'),
		listeners: {
			click: function() { 
				detailSettings = true;
				webaxs_editBtnHandler(webaxsForm, true);
			}
		}
	});

	var hn_webBtn = new Ext.Button({
		id: 'hn_webBtn',
		name: 'hn_webBtn',
		text: S('btn_webaxs_display'),
		disabled: true,
		listeners: {
			click: function() {
				webaxs_webBtnHandler(webaxsForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'ssl'},
		{name: 'server'},
		{name: 'name'},
		{name: 'key'},
		{name: 'ddns'},
		{name: 'upnp'},
		{name: 'port'},
		{name: 'inner_port'},
		{name: 'session_exclusive'},
		{name: 'session_expire_min'},
		{name: 'detail_settings'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var webaxs_urlStr = "-";
	if (webaxs_jsonData.service == 'on') {
		if (webaxs_jsonData.server == 'on') {
			webaxs_urlStr = "http://buffalonas.com/" + webaxs_jsonData.name + "/";
		}
		else {
			var httpStr = "http";
			if (webaxs_jsonData.sslVal == 'on') {
				httpStr += 's';
			}

			webaxs_urlStr = httpStr + "://" + webaxs_jsonData.ddns + ":" + webaxs_jsonData.port +  "/";
		}
		webaxs_urlStr = "<a href='" + webaxs_urlStr + "' target='_blank'>" + webaxs_urlStr + "</a>";
	}

	var webaxsForm = new Ext.FormPanel({
		id: ID_WEBAXS_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('webaxs_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [
			hn_easy_editBtn,
			hn_editBtn,
			hn_webBtn
		],
		titleCollapse: true,
		items: [
			service,
			ssl,
			server,
			name,
			key,
			ddns,
			upnp,
			port,
			inner_port,
			session_exclusive,
			session_expire_min,
			detail_settings,
			{
				autoWidth: true,
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .272,
					html: S('webaxs_url_field') + ":"
				},{
					cls: 'label',
					columnWidth: .728,
					html: webaxs_urlStr
				}]
			}
		]
	});

	return webaxsForm;
}

function create_webaxs_form_edit_mode(isDetail) {
	var hideModeVal = 'offsets';

	var webaxs_on = new Ext.form.Radio({
		id: 'webaxs_on',
		hideLabel: true,
		name: 'service',
		boxLabel: S('enable'),
		listeners: {
			check: function(webaxs_on, checked) {
				if (checked) {
					radioSelection_webaxs_on();
					webaxs_off.setValue(false);
				}
			}
		},
		inputValue: 'on',
		hideMode : hideModeVal
	});

	var webaxs_off = new Ext.form.Radio({
		id: 'webaxs_off',
		hideLabel: true,
		name: 'service',
		boxLabel: S('disable'),
		listeners: {
			check: function(webaxs_off, checked) {
				if (checked) {
					radioSelection_webaxs_off();
					webaxs_on.setValue(false);
				}
			}
		},
		inputValue: 'off',
		hideMode : hideModeVal
	});

	var ssl_on = new Ext.form.Radio({
		id: 'ssl_on',
		name: 'ssl',
		hideLabel: true,
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: true,
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var ssl_off = new Ext.form.Radio({
		id: 'ssl_off',
		name: 'ssl',
		hideLabel: true,
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: true,
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var server_on = new Ext.form.Radio({
		id: 'server_on',
		name: 'server',
		hideLabel: true,
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: true,
		listeners: {
			check: function(server_on, checked) {
				if (checked) {
					server_off.setValue(false);
					this.checked = true;

					name.enable();
					key.enable();
					ddns.clearInvalid();
					ddns.disable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var server_off = new Ext.form.Radio({
		id: 'server_off',
		name: 'server',
		hideLabel: true,
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: true,
		listeners: { 
			check: function(server_off, checked) {
				if (checked) {
					server_on.setValue(false);
					this.checked = true;
					name.disable();
					key.disable();
					name.clearInvalid();
					key.clearInvalid();
					ddns.enable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var name = new Ext.form.TextField({
		id: 'name',
		name: 'name',
		fieldLabel: S('webaxs_serverName_field'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_BUFF_NAS_NAME
		},
		minLength: 3,
		allowBlank: false,
		hideMode : hideModeVal
	});

	var key = new Ext.form.TextField({
		id: 'key',
		name: 'key',
		fieldLabel: S('webaxs_serverKey_field'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_BUFF_NAS_KEY
		},
		minLength: 3,
		allowBlank: false,
		hideMode : hideModeVal,
		hideLabel : !isDetail,
		hidden : !isDetail
	});

	var ddns = new Ext.form.TextField({
		id: 'ddns',
		name: 'ddns',
		fieldLabel: S('webaxs_dns_field'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_DNS_HOSTNAME
		},
		minLength : 1,
		allowBlank: false,
		hideMode : hideModeVal,
		hideLabel : !isDetail,
		hidden : !isDetail
	});

	var upnp_on = new Ext.form.Radio({
		id: 'upnp_on',
		name: 'upnp',
		hideLabel: true,
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: true,
		listeners: {
			check: function(upnp_on, checked) {
				if (checked) {
					upnp_off.setValue(false);
					this.checked = true;
					port.clearInvalid();
					port.disable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var upnp_off = new Ext.form.Radio({
		id: 'upnp_off',
		name: 'upnp',
		hideLabel: true,
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: true,
		listeners: {
			check: function(upnp_off, checked) {
				if (checked) {
					upnp_on.setValue(false);
					this.checked = true;
					port.clearInvalid();
					port.enable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var port = new Ext.form.NumberField({
		id: 'port',
		name: 'port',
		fieldLabel: S('webaxs_port_field'),
		width: 50,
		allowDecimals: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "5",
			autocomplete: "off",
			maxlength: MAX_EXTERNAL_PORT
		},
		minValue: 10,
		maxValue: 65535,
		disableKeyFilter: true,
		allowBlank: false,
		hideMode : hideModeVal,
		hideLabel : !isDetail,
		hidden : !isDetail
	});

	var inner_port = new Ext.form.NumberField({
		id: 'inner_port',
		name: 'inner_port',
		fieldLabel: S('webaxs_inner_port_field'),
		width: 50,
		allowDecimals: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "5",
			autocomplete: "off",
			maxlength: MAX_EXTERNAL_PORT
		},
		minValue: 0,
		maxValue: 65535,
		disableKeyFilter: true,
		allowBlank: false,
		hideMode : hideModeVal,
		hideLabel : !isDetail,
		hidden : !isDetail
	});

	var session_exclusive_on = new Ext.form.Radio({
		id: 'session_exclusive_on',
		name: 'session_exclusive',
		hideLabel: true,
		boxLabel: S('enable'),
		inputValue: 'on',
		disabled: false,
		listeners: {
			check: function(session_exclusive, checked) {
				if (checked) {
					session_exclusive_off.setValue(false);
					this.checked = true;

					if(session_expire_infinite.getValue()){
						Ext.Msg.alert(S('warning_box_title'),S('webaxs_err12'));
					}
					session_expire_infinite.setValue(false);
					session_expire_infinite.disable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var session_exclusive_off = new Ext.form.Radio({
		id: 'session_exclusive_off',
		name: 'session_exclusive',
		hideLabel: true,
		boxLabel: S('disable'),
		inputValue: 'off',
		disabled: false,
		listeners: {
			check: function(session_exclusive, checked) {
				if (checked) {
					session_exclusive_on.setValue(false);
					this.checked = true;

					session_expire_infinite.enable();
				}
			}
		},
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var session_expire_min = new Ext.form.NumberField({
		id: 'session_expire_min',
		name: 'session_expire_min',
		hideLabel: true,
		width: 50,
		allowDecimals: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "5",
			autocomplete: "off",
			maxlength: MAX_EXTERNAL_PORT
		},
		minValue: 1,
		maxValue: 120,
		disableKeyFilter: true,
		allowBlank: false,
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var session_expire_infinite = new Ext.form.Checkbox({
		boxLabel: S('webaxs_session_expire_infinite_field'),
		id: 'session_expire_infinite',
		name: 'session_expire_min',
		listeners: {
			check: function(session_expire_infinite, checked) {
				if (checked) {
					session_expire_min.setRawValue('');
					session_expire_min.disable();
					session_expire_min.clearInvalid();
				}
				else {
					session_expire_min.enable();
				}
			}
		},
		inputValue: '0',
		hideLabel: true,
		disabled: false,
		hideMode : hideModeVal,
		hidden : !isDetail
	});

	var detail_settings = new Ext.form.Hidden({
		id: 'detail_settings',
		name: 'detail_settings',
		readOnly: true
	});

	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name:'hn_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				webaxs_saveBtnHandler(webaxsForm);
			}
		}
	});

	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name: 'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				webaxs_jsonData = cloneJSON(webaxs_backup_jsonData); // roll back
				webaxs_display_mode(webaxsForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'service'},
		{name: 'ssl'},
		{name: 'server'},
		{name: 'name'},
		{name: 'key'},
		{name: 'ddns'},
		{name: 'upnp'},
		{name: 'port'},
		{name: 'inner_port'},
		{name: 'session_exclusive'},
		{name: 'session_expire_min'},
		{name: 'detail_settings'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var webaxsForm = new Ext.FormPanel({
		id: ID_WEBAXS_FORM,
		cls: 'panel-custBorders',
		title: S('webaxs_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_sercive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [webaxs_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [webaxs_off]
			}]
		}, {
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_ssl_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [ssl_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [ssl_off]
			}],
			hideLabel : true,
			hidden : !isDetail
		}, {
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_server_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [server_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [server_off]
			}],
			hideLabel : !isDetail,
			hidden : !isDetail
		},
		name, 
		key, 
		ddns, {
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_upnp_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [upnp_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [upnp_off]
			}],
			hideLabel : !isDetail,
			hidden : !isDetail
		}, 
		port,
		inner_port,
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_session_exclusive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [session_exclusive_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [session_exclusive_off]
			}],
			hideLabel : !isDetail,
			hidden : !isDetail
		},
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('webaxs_session_expire_min_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .120,
				items: [session_expire_min]
			}, {
				layout: 'form',
				columnWidth: .616,
				items: [session_expire_infinite]
			}],
			hideLabel : !isDetail,
			hidden : !isDetail
		},
		detail_settings
		]
	});

	return webaxsForm;
}

function webaxs_saveBtnHandler(hnForm) {
	hnForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_WEBAXS
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			hnForm.load({
				url: '/dynamic.pl',
				params: {
					bufaction: BUFACT_GET_WEBAXS
				},
				waitMsg: S('msg_loading_data'),
				failure: function(form, action) {
					formFailureFunction(action);
				},
				success: function(form, action) {
					resetCookie();
					resp = Ext.decode(action.response.responseText);
					webaxs_jsonData = resp.data[0];

					webaxs_backup_jsonData = cloneJSON(webaxs_jsonData); // commit
					webaxs_display_mode(hnForm);
				}
			})
		}
	});
}

function webaxs_editBtnHandler(hform_edit, isDetail) {
	ValidateSession();
	hform_edit.destroy();

	webaxs_backup_jsonData = cloneJSON(webaxs_jsonData); // backup
	hform_display = create_webaxs_form_edit_mode(isDetail); // display priority is button value
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_WEBAXS_FORM);
	var detail_settingsVal = isDetail ? 'on' : 'off';
	webaxs_jsonData.detail_settings = detail_settingsVal;

	if (!isDetail) {
		webaxs_jsonData.ssl = 'off';
		webaxs_jsonData.server = 'on';
		webaxs_jsonData.ddns = '';
		webaxs_jsonData.upnp = 'on';
		webaxs_jsonData.port = '';
		webaxs_jsonData.inner_port = '9000';
		webaxs_jsonData.session_exclusive = 'off';
		webaxs_jsonData.session_expire_min = '30';

		var cancelwebBtn = Ext.getCmp('hn_cancelBtn');
		var savewebBtn = Ext.getCmp('hn_saveBtn');
		cancelwebBtn.disable();
		savewebBtn.disable();

		Ext.Ajax.request({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_GET_NETWORK_STATUS
			},
			success : function(result){
				var status_network_jsonData = Ext.decode(result.responseText).data[0];
				webaxs_jsonData.key = status_network_jsonData.mac_1.replace(/:/g, '');

				hform_display.form.setValues(webaxs_jsonData);
				radioSelection_webaxs(webaxs_jsonData);
				hform_display.expand(true);

				var cancelwebBtn = Ext.getCmp('hn_cancelBtn');
				cancelwebBtn.enable();
				savewebBtn.enable();

			},
			failture : function(result){
				formFailureFunction();
			}
		});
	}
	else {
		hform_display.form.setValues(webaxs_jsonData);
		radioSelection_webaxs(webaxs_jsonData);
		hform_display.expand(true);
	}
}

function webaxs_display_mode(hform_display) {
	hform_display.destroy();
	var isDetail = webaxs_jsonData.detail_settings == 'on' ? true : false;
	hform_edit = create_webaxs_form_display_mode(isDetail);  // display priority is json value
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_WEBAXS_FORM);
	hform_edit.form.setValues(webaxs_jsonData);
	format_display_webaxs(webaxs_jsonData);
	hform_edit.expand(true);
}

function webaxs_webBtnHandler() {
	var port = Ext.getCmp('port').getValue();
	var inner_port = Ext.getCmp('inner_port');

	if (webaxs_jsonData.ssl == 'on') {
		window.open('https://' + window.location.host + ':' + inner_port.getValue() + '/');
	}
	else {
		window.open('http://' + window.location.host + ':' + inner_port.getValue() + '/');
	}
}

function radioSelection_webaxs(data) {
	var selectedMethod = data.service;
	if (selectedMethod == 'on') {
		var webaxs_on = Ext.getCmp('webaxs_on');
		webaxs_on.setValue(true);
		radioSelection_useBuffaloNas(data);
		radioSelection_upnp(data);
		radioSelection_ssl(data);
		radioSelection_session_exclusive(data);
		radioSelection_webaxs_on();
	}
	else {
		var webaxs_off = Ext.getCmp('webaxs_off');
		webaxs_off.setValue(true);
		radioSelection_ssl(data);
		radioSelection_session_exclusive(data);
		radioSelection_webaxs_off();
	}
}

function radioSelection_webaxs_on(checked) {
	var webaxs_on = Ext.getCmp('webaxs_on');
	var webaxs_off = Ext.getCmp('webaxs_off');
	var ssl_on = Ext.getCmp('ssl_on');
	var ssl_off = Ext.getCmp('ssl_off');
	var server_on = Ext.getCmp('server_on');
	var server_off = Ext.getCmp('server_off');
	var name = Ext.getCmp('name');
	var key = Ext.getCmp('key');
	var ddns = Ext.getCmp('ddns');
	var upnp_on = Ext.getCmp('upnp_on');
	var upnp_off = Ext.getCmp('upnp_off');
	var port = Ext.getCmp('port');
	var inner_port = Ext.getCmp('inner_port');
	var session_exclusive_on  = Ext.getCmp('session_exclusive_on');
	var session_exclusive_off  = Ext.getCmp('session_exclusive_off');
	var session_expire_min	= Ext.getCmp('session_expire_min');
	var session_expire_infinite  = Ext.getCmp('session_expire_infinite');

	webaxs_on.checked = true;

	ssl_on.enable();
	ssl_off.enable();
	server_on.enable();
	server_off.enable();

	if (server_on.getValue()) {
		name.enable();
		key.enable();
		ddns.disable();
	}
	else {
		name.disable();
		key.disable();
		ddns.enable();
	}

	upnp_on.enable();
	upnp_off.enable();
	if (upnp_on.getValue()) {
		port.disable();
		port.clearInvalid();
	}
	else {
		port.enable();
	}

	inner_port.enable();
	session_exclusive_on.enable();
	session_exclusive_off.enable();

	// probably session_expire_min.getValue() is '' when session_expire_infinite was checked.
	if(session_expire_min.getValue() == '0' || session_expire_min.getValue() == undefined|| session_expire_min.getValue() == ''){
		session_expire_infinite.setValue(true);
		session_expire_min.setRawValue('');
		session_expire_infinite.enable();
	}
	else {
		session_expire_infinite.setValue(false);
		session_expire_min.enable();
		session_expire_min.enable();
		session_expire_infinite.enable();
	}
}

function radioSelection_webaxs_off(checked) {
	var webaxs_on = Ext.getCmp('webaxs_on');
	var webaxs_off = Ext.getCmp('webaxs_off');
	var ssl_on = Ext.getCmp('ssl_on');
	var ssl_off = Ext.getCmp('ssl_off');
	var server_on = Ext.getCmp('server_on');
	var server_off = Ext.getCmp('server_off');
	var name = Ext.getCmp('name');
	var key = Ext.getCmp('key');
	var ddns = Ext.getCmp('ddns');
	var upnp_on = Ext.getCmp('upnp_on');
	var upnp_off = Ext.getCmp('upnp_off');
	var port = Ext.getCmp('port');
	var inner_port = Ext.getCmp('inner_port');
	var session_exclusive_on  = Ext.getCmp('session_exclusive_on');
	var session_exclusive_off  = Ext.getCmp('session_exclusive_off');
	var session_expire_min	= Ext.getCmp('session_expire_min');
	var session_expire_infinite  = Ext.getCmp('session_expire_infinite');

	webaxs_off.checked = true;

	name.clearInvalid();
	key.clearInvalid();
	ddns.clearInvalid();
	port.clearInvalid();

	ssl_on.disable();
	ssl_off.disable();
	server_on.disable();
	server_off.disable();

	name.disable();
	key.disable();
	ddns.disable();
	upnp_on.disable();
	upnp_off.disable();
	upnp_on.setValue(true);

	port.disable();
	inner_port.disable();
	session_exclusive_on.disable();
	session_exclusive_off.disable();

	// probably session_expire_min.getValue() is '' when session_expire_infinite was checked.
	if(session_expire_min.getValue() == '0' || session_expire_min.getValue() == undefined|| session_expire_min.getValue() == ''){
		session_expire_infinite.setValue(true);
		session_expire_min.setRawValue('');
	}
	else {
		session_expire_infinite.setValue(false);
	}

	session_expire_min.disable();
	session_expire_infinite.disable();
}

function radioSelection_useBuffaloNas(data) {
	var selectedMethod = data.server;
	var serverRadioEn = Ext.getCmp('server_on');
	var serverRadioDis = Ext.getCmp('server_off');
	var servicewebBtn = Ext.getCmp('hn_webBtn');
	var name = Ext.getCmp('name');
	var key = Ext.getCmp('key');

	if (selectedMethod == 'on') {
		serverRadioEn.setValue(true);
		name.clearInvalid();
		key.clearInvalid();
	}
	else {
		serverRadioDis.setValue(true);
	}
}

function radioSelection_upnp(data){
	var selectedMethod = data.upnp;
	var upnpRadioEn = Ext.getCmp('upnp_on');
	var upnpRadioDis = Ext.getCmp('upnp_off');
	var servicewebBtn = Ext.getCmp('hn_webBtn');

	if (selectedMethod == 'on') {
		upnpRadioEn.setValue(true);
	}
	else {
		upnpRadioDis.setValue(true);
	}
}

function radioSelection_ssl(data){
	var selectedMethod = data.ssl;
	var sslRadioEn = Ext.getCmp('ssl_on');
	var sslRadioDis = Ext.getCmp('ssl_off');

	if (selectedMethod == 'on') {
		sslRadioEn.setValue(true);
	}
	else {
		sslRadioDis.setValue(true);
	}
}

function radioSelection_session_exclusive(data) {
	var selectedMethod = data.session_exclusive;
	var session_exclusiveRadioEn = Ext.getCmp('session_exclusive_on');
	var session_exclusiveRadioDis = Ext.getCmp('session_exclusive_off');

	if (selectedMethod == 'on') {
		session_exclusiveRadioEn.setValue(true);
	}
	else {
		session_exclusiveRadioDis.setValue(true);
	}
}

function format_display_webaxs(data){
	var selectedMethod = data.service;
	var sslVal = data.ssl;
	var upnpVal = data.upnp;
	var serverVal = data.server;
	var service = Ext.getCmp('service');
	var ssl = Ext.getCmp('ssl');
	var server = Ext.getCmp('server');
	var upnp = Ext.getCmp('upnp');
	var ddns = Ext.getCmp('ddns');
	var name = Ext.getCmp('name');
	var key = Ext.getCmp('key');
	var port = Ext.getCmp('port');

	var inner_port = Ext.getCmp('inner_port');
	var session_exclusiveVal  = data.session_exclusive;
	var session_exclusive = Ext.getCmp('session_exclusive');
	var session_expire_min	= Ext.getCmp('session_expire_min');

	var servicewebBtn = Ext.getCmp('hn_webBtn');

	if (selectedMethod != 'on') {
		service.setValue(S('disabled'));
		ssl.setValue('-');
		name.setValue('-');
		key.setValue('-');
		ddns.setValue('-');
		upnp.setValue('-');
		port.setValue('-');
		server.setValue('-');
		inner_port.setValue('-');
		session_exclusive.setValue('-');
		session_expire_min.setValue('-');
	}
	else {
		service.setValue(S('enabled'));
		servicewebBtn.enable();

		if (sslVal == 'on') {
			ssl.setValue(S('enabled'));
		}
		else {
			ssl.setValue(S('disabled'));
		}

		if (serverVal == 'on') {
			server.setValue(S('enabled'));
			ddns.setValue('-');
			name.setValue(data.name);
			key.setValue(data.key);
		}
		else {
			server.setValue(S('disabled'));
			key.setValue('-');
			name.setValue('-');
			ddns.setValue(data.ddns);
		}

		if (upnpVal == 'on') {
			upnp.setValue(S('enabled'));
			port.setValue(data.port);
		}
		else {
			upnp.setValue(S('disabled'));
			port.setValue(data.port);
		}

		inner_port.setValue(data.inner_port);

		if (session_exclusiveVal == 'on') {
			session_exclusive.setValue(S('enabled'));
		}
		else {
			session_exclusive.setValue(S('disabled'));
		}

		var session_expire_minVal = data.session_expire_min;
		if (session_expire_minVal == 0) {
			session_expire_min.setValue(S('webaxs_session_expire_infinite_field'));
		}
		else{
			session_expire_min.setValue(session_expire_minVal);
		}
	}
}

function create_webaxs_folder_form_display_mode() {
	var cm = new Ext.grid.ColumnModel([
		{
			id: "shareName",
			header: S('sh_gridCol_name'),
			dataIndex: "shareName",
			direction: "ASC",
			renderer: webaxsFolders_renderTopic,
			width: 150
		}, {
			header: S('sh_gridCol_volume'),
			dataIndex: 'volume',
			width: 80,
			renderer: webaxs_renderVolume
		}, {
			header: S('sh_gridCol_attribute'),
			dataIndex: 'attribute',
			renderer: shFolders_renderAttribute,
			width: 80
		}, {
			header: S('sh_gridCol_restrict'),
			dataIndex: 'axsRestrict',
			renderer: shFolders_renderAxsRestrict,
			width: 80
		}, {
			header: S('webaxs_folder_field'),
			dataIndex: 'webaxs_perm',
			renderer: webaxsFolders_renderService,
			width: 215
		}
	]);

	// by default columns are sortable
	cm.defaultSortable = true;
//	cm.setRenderer(0, hideCheckbox_all);

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_ALL_SHARE
		},
		waitMsg: S('msg_loading_data'),
		fields: [
			{name: 'shareName'},
			{name: 'volume'},
			{name: 'attribute'},
			{name: 'recycle'},
			{name: 'support'},
			{name: 'axsRestrict'},
			{name: 'webaxs_perm'}
		]
	});

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [
			{name: 'name'},
			{name: 'value'}
		]
	});

	var searchbox = new Ext.form.ComboBox({
		id: ID_SH_FOLD_TOP_SEARCH_COMBO,
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
			select: function(c, r, i) {
				var gridIndex = r.get('name');
				var sm = grid.getSelectionModel();
				sm.selectRow(gridIndex, false); // (index, keepSelected)
				grid.getView().focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var toolbar  =	new Ext.Toolbar({
		autoHeight: true,
		items: [
			'->',
			S('searchBox_find'),
			' ',
			searchbox
		],
		frame: true
	});

	var grid = new Ext.grid.GridPanel({
		id: 'grid',
		store: jsonStore,
		cm: cm,
		width: 640,
		height: 200,
		enableHdMenu: false,
		tbar: toolbar,
		stripeRows: true,
		frame: true,
		listeners: {
			sortchange: function() {
				update_combo_search(grid, searchbox, 'shareName');
			}
		}
	});

	jsonStore.load({
		callback: function(r) {
			// remove the 'info' folder
			var infoIndex = jsonStore.find('shareName', 'info', 0, false);
			if (infoIndex != -1) {
				var infoFolder = jsonStore.getAt(infoIndex);
				jsonStore.remove(infoFolder);
			}

			var result = jsonStore.reader.jsonData.success;
			if (result) {
				update_combo_search(grid, searchbox, 'shareName');
			}
			else {
				formFailureFunction();
			}
		}
	});

	//	....: Create shForm FORM and add ITEMS	:....
	var shForm = new Ext.FormPanel({
		frame: false,
		bodyBorder: false,
		id: ID_SH_FOLD_EDITABLE_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [
			{layout: 'form'},
			grid
		]
	});

//	updateCentralContainer(SHARED_FOLDER_RENDER_TO, shForm);

	return shForm;
}

function webaxsFolders_renderTopic(value, cell, record) {
	var axsRestrict = record.get('axsRestrict');
	var webaxs_perm = record.get('webaxs_perm');
	return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='webaxs_editSharedFolder(\"{0}\", \"{1}\", \"{2}\");'>{0}</a></b>", value, axsRestrict, webaxs_perm);
}

function webaxs_editSharedFolder(id, axs, webaxs_perm) {
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	shFolders_display_jReaderFields
	);

	var form = webaxs_createForm(id, 'editMode', jReader, axs, webaxs_perm);

//	update_header(true, 'sh_fold_header', id);
	update_header(true, 'webaxs_folder_field', id);

	// ....: Render form to html container :....
	updateCentralContainer(SHARED_FOLDER_RENDER_TO, form);
	webaxs_loadForm(form,id);
}

function webaxs_createForm(id, mode, jReader, axs, webaxs_perm) {
	var shareName;
	var shareDesc;
	var volume;
	var jReader;
	var jErrReader;

	shareName = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderName'),
		id: 'shareName',
		name: 'shareName',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	shareDesc = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderDesc'),
		id: 'shareDesc',
		name: 'shareDesc',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var WEBAXS_FOLDER_PERMISSON_LIST1 = [
		['off', S('webaxs_folder_off')],
		['anony', S('webaxs_folder_anony')],
		['all', S('webaxs_folder_all')]
	];

	var WEBAXS_FOLDER_PERMISSON_LIST2 = [
		['off', S('webaxs_folder_off')],
		['anony', S('webaxs_folder_anony')],
		['all', S('webaxs_folder_all')],
		['below', S('webaxs_folder_below')]
	];

	var webaxs_permStore;
	if (axs != 'on' && webaxs_perm != 'below') {
		webaxs_permStore = new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: WEBAXS_FOLDER_PERMISSON_LIST1
		})
	}
	else {
		webaxs_permStore = new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: WEBAXS_FOLDER_PERMISSON_LIST2
		})
	}

	// ....: Create form ITEMS :....
	var webaxs_perm = new Ext.form.ComboBox({
		id: 'webaxs_perm_combo',
		name: 'webaxs_perm',
		hiddenName:'webaxs_perm',
		fieldLabel: S('webaxs_folder_field'),
		store: webaxs_permStore,
		displayField: 'opt',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 200,
		width: 200,
		editable: false
	});

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
	}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var sharedFoldersForm = new Ext.FormPanel({
		hideTitle: true,
		frame: false,
		id: ID_SH_FOLD_PREFIX_FORM,
		width: 600,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: [
			shareName,
			shareDesc,
			webaxs_perm
		]
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_1', id);
				webaxs_folder_saveBtnHandler(sharedFoldersForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'webaxs_folcer_edit_cancel_button',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_1', id);
				createWebaxsSettings();
			}
		}
	});

	// include buttons in the form
	sharedFoldersForm.add({
		buttonAlign: 'left',
		buttons: [applyBtn, cancelBtn]
	});

	return sharedFoldersForm;
}

function webaxs_folder_saveBtnHandler(sharedFoldersForm){
	sharedFoldersForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_WEBAXS_FOLDER
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			createWebaxsSettings();
		}
	});
}

function webaxs_loadForm(form,shareName){
	// ....: Load current settings :.... 
	form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_SHARE + shareName
		},
		waitMsg: S('msg_loading_data'),
		failure:function(f,action) {
			formFailureFunction(action);
		},
		success: function(f,action) {
			resetCookie();
			var decodedResponse= Ext.decode(action.response.responseText);
			var data = decodedResponse.data[0];
		}
	});
}

function webaxs_renderVolume(value) {
	return S(value);
}

function webaxsFolders_renderService(value){
	if (value == 'off') {
		return	S('webaxs_folder_off');
	}
	else if (value == 'anony') {
		return	S('webaxs_folder_anony');
	}
	else if (value == 'all') {
		return	S('webaxs_folder_all');
	}
	else if (value == 'below') {
		return	S('webaxs_folder_below');
	}
}
