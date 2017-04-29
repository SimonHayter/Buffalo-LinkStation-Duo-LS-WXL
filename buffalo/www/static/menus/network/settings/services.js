var hidden_eth2 = 0;

function create_nssForm_display() {
	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_SERVICES
		},
		fields: [{
			name: 'serviceName'
		}, {
			name: 'eth1'
		}, {
			name: 'eth2'
		}]
	});

	var sm = new Ext.grid.RowSelectionModel();

	var cm = new Ext.grid.ColumnModel([{
		id: 'serviceName',
		header: S('net_settings_nss_service'),
		dataIndex: 'serviceName',
		renderer: render_service
	}, {
		id: 'eth1',
		header: S('net_settings_eht_1'),
		dataIndex: 'eth1',
		renderer: render_eth
	}, {
		id: 'eth2',
		header: S('net_settings_eht_2'),
		dataIndex: 'eth2',
		renderer: render_eth
	}]);

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	var edit_ssl_settingsBtn = new Ext.Button({
		id: 'edit_ssl_settingsBtn',
		text: S('net_settings_service_ssl_btn_edit'),
		handler: function () {
			edit_ssl_settingsBtnHandler();
		}
	});

	var service_grid = new Ext.grid.GridPanel({
		id: SERVICES_GRID_EDIT,
		store: jsonStore,
		cm: cm,
		sm: sm,
		width: 635,
		height: 200,
		autoExpandColumn: 'serviceName',
		frame: true,
		stripeRows: true,
		view: gridView
	});

	var items = new Array();
	if (add_ssl) {
		items = [{
			layout: 'form',
			buttonAlign: 'left',
			buttons: [edit_ssl_settingsBtn]
		},
		service_grid];
	}
	else {
		items = [service_grid];
	}

	var netShareForm = new Ext.FormPanel({
		id: ID_NS_SETTINGS_FORM,
		animCollapse: false,
		title: S('net_settings_nss_formTitle'),
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		items: items,
		titleCollapse: true,
		listeners: {
			expand: function () {
				gridView.refresh();
			}
		}
	});

	jsonStore.load({
		callback: function (r, opt, success) {
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				services_jsonData = r;
				if ((services_jsonData[0].data.eth2 == 'trunk') || (services_jsonData[0].data.eth2 == 'disable')) {
					hidden_eth2 = 1;
				}
				else {
					hidden_eth2 = 0;
				}

				var eth2_index = cm.findColumnIndex('eth2')
				if ((!add_eth) || (hidden_eth2)) {
					cm.setHidden(eth2_index, true);
				}
				else {
					cm.setHidden(eth2_index, false);
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	return netShareForm;
}

function edit_ssl_settingsBtnHandler() {
	var usr_csv_cancel = new Ext.Button({
		id: 'usr_csv_cancel',
		text: S('btn_cancel'),
		handler: function () {
			ssl_cancelHandler(sslKeyForm);
		}
	});

	var ssl_key = new Ext.form.TextField({
		name: 'ssl_key',
		id: 'ssl_key',
		fieldLabel: S('net_settings_service_ssl_key'),
		width: 200,
		height: 23,
		inputType: 'file'
	});

	var ssl_key_import = new Ext.Button({
		id: 'ssl_key_import',
		text: 'Import',
		text: S('net_settings_service_ssl_import_btn'),
		handler: function () {
			if (ssl_key.getValue() == '') {
				msgBox_usingDictionary('file_msg_title', 'select_file', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				ssl_importHandler(sslKeyForm, 'ssl_key');
			}
		}
	});

	var ssl_certificate = new Ext.form.TextField({
		id: 'ssl_certificate',
		name: 'ssl_certificate',
		fieldLabel: S('net_settings_service_ssl_certificate'),
		width: 200,
		height: 23,
		inputType: 'file'
	});

	var ssl_certificate_import = new Ext.Button({
		id: 'ssl_certificate_import',
		text: S('net_settings_service_ssl_import_btn'),
		handler: function () {
			if (ssl_certificate.getValue() == '') {
				msgBox_usingDictionary('file_msg_title', 'select_file', Ext.Msg.OK, Ext.MessageBox.ERROR);
			}
			else {
				ssl_importHandler(sslKeyForm, 'ssl_crt');
			}
		}
	});

	Ext.getCmp(ID_NS_SETTINGS_FORM).destroy();

	var sslKeyForm = new Ext.FormPanel({
		id: ID_NS_SETTINGS_FORM,
		allowDomMove: false,
		animCollapse: false,
		title: S('net_settings_nss_formTitle'),
		autoHeight: true,
		cls: 'panel-custBorders',
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [usr_csv_cancel],
		items: [ssl_key, ssl_key_import, {
			cls: 'column-custBorders',
			html: '<br>'
		},
		ssl_certificate, ssl_certificate_import],
		titleCollapse: true,
		fileUpload: true,
		method: 'POST'
	});

	insertToCentralContainer(NETWORK_RENDER_TO, sslKeyForm, servicesRenderBefore);
}

function create_nssForm_edit(rowIndex) {
	var sameEthConfig = 0;

	var service = new Ext.form.TextField({
		id: 'serviceName',
		name: 'serviceName',
		hideLabel: true,

		fieldLabel: S('net_settings_nss_service'),
		width: 200,
		readOnly: true,

		itemCls: 'display-label'
	});

	var service2 = new Ext.form.TextField({
		id: 'serviceName2',
		name: 'serviceName2',

		fieldLabel: S('net_settings_nss_service'),
		width: 200,
		readOnly: true,

		itemCls: 'display-label'
	});

	var serv_eth_1_en = new Ext.form.Radio({
		id: 'serv_eth_1_en',
		hideLabel: true,
		name: 'eth1',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (serv_eth_1_en, checked) {
				var c;
				if (checked) {
					if (sameEthConfig == 0) {
						serv_eth_1_dis.setValue(false);
						this.checked = true;
					}
					else {
						serv_eth_1_dis.setValue(false);
						this.checked = true;
						serv_eth_2_en.setValue(true);
						serv_eth_1_dis.setValue(false);
					}
				}
			}
		}
	});

	var serv_eth_1_dis = new Ext.form.Radio({
		id: 'serv_eth_1_dis',
		name: 'eth1',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (serv_eth_1_dis, checked) {
				var c;
				if (checked) {
					if (sameEthConfig == 0) {
						serv_eth_1_en.setValue(false);
						this.checked = true;
					}
					else {
						serv_eth_1_en.setValue(false);
						this.checked = true;
						serv_eth_2_dis.setValue(true);
						serv_eth_2_en.setValue(false);
					}
				}
			}
		}
	});

	var serv_eth_2_en = new Ext.form.Radio({
		id: 'serv_eth_2_en',
		hideLabel: true,
		name: 'eth2',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (serv_eth_2_en, checked) {
				var c;
				if (checked) {
					if (sameEthConfig == 0) {
						serv_eth_2_dis.setValue(false);
						this.checked = true;
					}
					else {
						if (serv_eth_1_en.getValue()) {
							serv_eth_2_dis.setValue(false);
							this.checked = true;
						}
						else {
							serv_eth_2_dis.setValue(true);
							this.checked = false;
						}
					}
				}
			}
		}
	});

	var serv_eth_2_dis = new Ext.form.Radio({
		id: 'serv_eth_2_dis',
		name: 'eth2',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function (serv_eth_2_dis, checked) {
				var c;
				if (checked) {
					if (sameEthConfig == 0) {
						serv_eth_2_en.setValue(false);
						this.checked = true;
					}
					else {
						if (serv_eth_1_dis.getValue()) {
							serv_eth_2_en.setValue(false);
							this.checked = true;
						}
						else {
							serv_eth_2_en.setValue(true);
							this.checked = false;
						}
					}
				}
			}
		}
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				var serviceName = service.getValue();
				if ((serviceName == 'webui') || (serviceName == 'webui_ssl')) {
					Ext.MessageBox.show({
						title: S('warning_box_title'),
						msg: S('net_settings_service_warning'),
						buttons: Ext.MessageBox.OKCANCEL,
						icon: Ext.MessageBox.WARNING,
						fn: function(btn) {
							if (btn == 'ok') {
								nss_saveChanges(netShareForm, serviceName);
							}
							else {
								return;
							}
						}
					});
				}
				else {
					nss_saveChanges(netShareForm, serviceName);
				}
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				nss_cancelChanges(netShareForm);
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},[{
		name: 'id'
	},{
		name: 'msg'
	}]);

	var items = new Array();

	items = [service, service2, {
		autoWidth: true,
		layout: 'column',
		cls: 'column-custBorders',
		items: [{
			cls: 'label',
			columnWidth: .264,
			html: S('net_settings_service_eth1') + ":"
		}, {
			cls: 'label',
			columnWidth: .24,
			items: [serv_eth_1_en]
		}, {
			cls: 'label',
			columnWidth: .49,
			items: [serv_eth_1_dis]
		}]
	}]

	if ((add_eth) && (!hidden_eth2)){
		// if here, eth2 is enabled
		items[items.length] = {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('net_settings_service_eth2') + ":"
			}, {
				cls: 'label',
				columnWidth: .24,
				items: [serv_eth_2_en]
			}, {
				cls: 'label',
				columnWidth: .49,
				items: [serv_eth_2_dis]
			}]
		}
	}

	var jReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'serviceName'
	}, {
		name: 'eth1'
	}, {
		name: 'eth2'
	}]);

	// destroy the display form before creating the ssl edit form
	Ext.getCmp(ID_NS_SETTINGS_FORM).destroy();

	// ....: Create Network Sharing Services settings form and add itmes from above  :....
	var netShareForm = new Ext.FormPanel({
		id: ID_NS_SETTINGS_FORM,
		animCollapse: false,
		title: S('net_settings_nss_formTitle'),
		cls: 'panel-custBorders',
		errorReader: jErrReader,
		reader: jReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		items: items,
		buttons: [saveBtn, cancelBtn],
		titleCollapse: true
	});

	insertToCentralContainer(NETWORK_RENDER_TO, netShareForm, servicesRenderBefore);
	services_radiosettings_edit(services_jsonData[rowIndex]);
}

function services_radiosettings_edit(record) {
	var sameEthConfig = 0;

	var serviceName_field = Ext.getCmp('serviceName');
	var serviceName2_field = Ext.getCmp('serviceName2');
	var service = record.get('serviceName');
	serviceName_field.setValue(service);
	serviceName2_field.setValue(S('net_settings_' + service));
	serviceName_field.hide();

	var eth1_status = record.get('eth1');
	var eth2_status = record.get('eth2');
	serv_eth_1_en = Ext.getCmp('serv_eth_1_en');
	serv_eth_1_dis = Ext.getCmp('serv_eth_1_dis');
	serv_eth_2_en = Ext.getCmp('serv_eth_2_en');
	serv_eth_2_dis = Ext.getCmp('serv_eth_2_dis');

	if (sameEthConfig == 1 && service == 'http') {
		serv_eth_1_en.setValue(true);
		serv_eth_2_en.setValue(true);
		serv_eth_1_dis.disable();
		serv_eth_2_dis.disable();
	}
	else {
		if (eth1_status == 'on') {
			serv_eth_1_en.setValue(true);
		}
		else {
			serv_eth_1_dis.setValue(true);
		}

		if (eth2_status == 'on') {
			serv_eth_2_en.setValue(true);
		}
		else if (eth2_status == 'off') {
			serv_eth_2_dis.setValue(true);
		}
		else if (eth2_status == 'disabled') {
			serv_eth_2_en.disable();
			serv_eth_2_dis.disable();
		}
	}
}

function render_service(value, meta, record, rowIndex) {
	var val = S('net_settings_' + value);
	return String.format("<b><a href='#' onClick='create_nssForm_edit(\"{1}\");'>{0} </a></b>", val, rowIndex);
}

function render_eth(value) {
	if (value == 'on') return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	else return String.format('<img src= ' + IMAGE_CROSS + ' />');
}

function nss_cancelChanges(form) {
	form.destroy();
	netShareForm_display = create_nssForm_display();
	insertToCentralContainer(NETWORK_RENDER_TO, netShareForm_display, servicesRenderBefore);
	netShareForm_display.expand();
}

function nss_saveChanges(form, serviceName) {
	form.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_SERVICE + serviceName
		},
		waitMsg: S('msg_saving_data'),
		success: function () {
			if ((serviceName == 'webui') || (serviceName == 'webui_ssl')) {
				form.collapse();
				delCookies();
				Ext.get(document.body).mask(S('net_settings_service_notice'));
			}

			resetCookie();
			form.destroy();
			netShareForm_display = create_nssForm_display();
			insertToCentralContainer(NETWORK_RENDER_TO, netShareForm_display, servicesRenderBefore);
			netShareForm_display.expand();
		},
		failure: function (form, action) {
			formFailureFunction(action);
		}
	});
}

function ssl_cancelHandler(sslKeyForm) {
	sslKeyForm.destroy();
	netShareForm_display = create_nssForm_display();
	insertToCentralContainer(NETWORK_RENDER_TO, netShareForm_display, servicesRenderBefore);
	netShareForm_display.expand();
}

function ssl_importHandler(file_upload_form, purpose) {
	file_upload_form.form.submit({
		url: '/import.pl',
		params: {
			purpose: purpose
		},
		waitMsg: S('uploading'),
		failure: function (form, action) {
			if (action.response) {
				formFailureFunction(action);
			}
		},
		success: function (form, action) {
			var decodedResponse = Ext.decode(action.response.responseText);
			msgBox_usingDictionary('file_msg_title', decodedResponse.data[0], Ext.Msg.OK, Ext.MessageBox.INFO);
		}
	});
}
