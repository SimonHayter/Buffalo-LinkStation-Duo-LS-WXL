function populate_left_panel(menuIndex) {
	remove_useless_mask();
	if (add_iscsi) {
		getLeftPanelInfo(MENU_INDEX_ISCSI);
		display_left_panel_powerMgmt_section();
	}
	else {
		getLeftPanelInfo(menuIndex);
		if (product_name.match(/^LS-XL|^LS-YL/i)) {
			display_left_panel_shutdown_section()
		}
	}

	if (add_imhere) {
		display_left_panel_locate_section();
	}
}

function getLeftPanelInfo(menu) {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getRootSettings' + menu
		},
		method: 'GET',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			if (response.data.length > 0) {
				populateSystemInfoPanel(response.data[0], 'generalInfo', 'system_information_inner');
				if (add_iscsi) {
					populateMenuInfoPanel(response.data[1], 'specificInfo', 'menu_information_inner');
				}
				else {
					if (menu < 4) {
						populateMenuInfoPanel(response.data[1], 'specificInfo', 'menu_information_inner');
					}
				}
				var store = new Ext.data.JsonStore({
					root: 'generalInfo',
					fields: ['name', 'value'],
					data: response.data[0]
				});

				var hostname_index = store.find('name', 'r_hostname');
				var hostname = store.getAt(hostname_index).get('value');
				var product_name_formatted = product_name.replace(/\(.*\)/, '');
				document_title = series_name + ' - ' + product_name_formatted + '(' + hostname + ')';
				document.title = document_title;
			}
		}
	});
}

function get_left_panel_while_operation_in_progress() {
	if (add_iscsi) {
		display_left_panel_iscsi_section();
		Ext.getCmp('btn_on').disable();
		Ext.getCmp('btn_off').disable();
		getLeftPanelInfo_topOnly(MENU_INDEX_ISCSI);
		display_left_panel_powerMgmt_section();
		Ext.getCmp('powerMgmtBtn').disable();
	}
	else {
		getLeftPanelInfo_topOnly(1);
	}

	if (add_imhere) {
		display_left_panel_locate_section();
	}
	document.title = document_title;
}

function enable_left_panel_btns() {
	Ext.getCmp('btn_on').enable();
	Ext.getCmp('btn_off').enable();
	Ext.getCmp('powerMgmtBtn').enable();
}

function getLeftPanelInfo_topOnly(menu) {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getRootSettings' + menu
		},
		method: 'GET',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			if (response.data.length > 0) {
				populateSystemInfoPanel(response.data[0], 'generalInfo', 'system_information_inner');
			}
		}
	});
}

function populateSystemInfoPanel(data, keyWord, container) {
	var template = new Ext.XTemplate(
		'<dl>',
			'<tpl for="' + keyWord + '">',
				'<tpl if="values.name == \'system_warning\'">',
					'<dt id="warning_css">{[S(values.name)]}:</dt>',
					'<dd>{value}</dd>',
				'</tpl>',
				'<tpl if="values.name != \'system_warning\'">',
					'<dt>{[S(values.name)]}:</dt>',
					'<tpl if="(values.value)">',
						'<dd>{value}</dd>',
					'</tpl>',
					'<tpl if="(!values.value)">',
						'<dd>{[S("r_null")]}</dd>',
					'</tpl>',
				'</tpl>',
			'</tpl>',
		'</dl>'
	);

	template.overwrite(container, data);
}

function populateMenuInfoPanel(data, keyWord, container) {
	var template;
	if (add_iscsi) {
		template = new Ext.XTemplate(
			'<dl>',
				'<tpl for="' + keyWord + '">',
					'<tpl if="(!values.name)">',
						'<dt>{[S("r_no_clients")]}</dt>',
					'</tpl>',
					'<tpl if="(values.name)">',
						'<dt>{[S(values.name)]}:',
							'<dd> {value}</dd>',
						'</dt>',
					'</tpl>',
				'</tpl>',
			'</dl>'
		);
	}
	else {
		template = new Ext.XTemplate(
			'<dl>',
				'<tpl for="' + keyWord + '">',
					'<tpl if="((values.name == \'net_settings_eht_1: DHCP\') || (values.name == \'net_settings_eht_2: DHCP\'))">',
					'<dt>{[S(values.name)]}:',
						'<dd>{[S(values.value)]}</dd>',
					'</dt>',
					'</tpl>',
					'<tpl if="((values.name != \'net_settings_eht_1: DHCP\') && (values.name != \'net_settings_eht_2: DHCP\'))">',
						'<dt>{[S(values.name)]}:',
							'<dd> {value}</dd>',
						'</dt>',
					'</tpl>',
				'</tpl>',
			'</dl>'
		);
	}

	template.overwrite(container, data);
}

function display_left_panel_locate_section() {
	var leftPanelMenuHeader = S('r_locate');
	updateHeaderContainer("locate_header", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	if (!Ext.getCmp('locateBtn')) {
		new Ext.Button({
			id: 'locateBtn',
			ctCls: 'r_locate_btn',
			iconCls: 'r_locate_btn_img',
			renderTo: 'locate_inner',
			text: S('r_locate_btn'),
			listeners: {
				click: function () {
					locate_device();
				}
			}
		});
	}
}

function locate_device() {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'locateDevice'
		},
		method: 'POST'
	});
}

function display_left_panel_powerMgmt_section() {
	var leftPanelMenuHeader = S('r_powerMgmt');
	updateHeaderContainer("powerMgmt_header", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");

	if (!Ext.getCmp('powerMgmtBtn')) {
		new Ext.Button({
			id: 'powerMgmtBtn',
			ctCls: 'r_locate_btn',
			iconCls: 'plug',
			renderTo: 'powerMgmt_inner',
			text: S('r_powerMgmt_btn'),
			listeners: {
				click: function () {
					go_to_powerMgmt();
				}
			}
		});
	}
}

function display_left_panel_shutdown_section() {
	var leftPanelMenuHeader = S('system_shutdown_form_title');
	updateHeaderContainer("powerMgmt_header", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");

	if (!Ext.getCmp('shutdownBtn')) {
		new Ext.Button({
			id: 'shutdownBtn',
			ctCls: 'r_locate_btn',
			iconCls: 'plug',
			renderTo: 'powerMgmt_inner',
			text: S('system_shutdown_button'),
			listeners: {
				click: function () {
					go_to_shutdown();
				}
			}
		});
	}
}

function go_to_powerMgmt() {
	maintenance_afterLoadFn(false, 'btn_maintenance', 'btn_maint_powerManagment', 'header_8_2', system_powerManagement_processAuth, 'restart');
}

function go_to_shutdown() {
	show_shutdown();
}

function display_left_panel_iscsi_section() {
	add_iscsi_left_panel();
	var leftPanelMenuHeader = S('r_iscsiTitle');
	get_iscsi_status();

	if ((!Ext.getCmp('btn_on')) && (!Ext.getCmp('btn_off'))) {
		var btn_on = new Ext.Button({
			id: 'btn_on',
			ctCls: 'r_iscsi_btn',
			iconCls: 'r_iscsi_btn_img_started',
			allowDepress: false,
			text: S('r_iscsi_btn_started'),
			listeners: {
				click: function () {
					var currentText = btn_on.getText();
					btn_on.setText('<b>' + currentText + '</b>');
					btn_off.setText(S('r_iscsi_btn_stopped'));
					change_iscsi_status('on');
				},
				toggle: function () {
					var currentText = btn_on.getText();
					btn_on.setText('<b>' + currentText + '</b>');
				}
			},
			enableToggle: true,
			toggleGroup: 'iscsiService'
		});

		var btn_off = new Ext.Button({
			id: 'btn_off',
			ctCls: 'r_iscsi_btn',
			iconCls: 'r_iscsi_btn_img_stopped',
			allowDepress: false,
			text: S('r_iscsi_btn_stopped'),
			listeners: {
				click: function () {
					var currentText = btn_off.getText();
					btn_off.setText('<b>' + currentText + '</b>');
					btn_on.setText(S('r_iscsi_btn_started'));
					change_iscsi_status('off');
				},
				toggle: function () {
					var currentText = btn_off.getText();
					btn_off.setText('<b>' + currentText + '</b>');
				}
			},
			enableToggle: true,
			toggleGroup: 'iscsiService'
		});

		updateHeaderContainer("iscsi_header", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
		new Ext.Panel({
			renderTo: 'iscsi_inner',
			buttonAlign: 'center',
			width: 190,
			buttons: [btn_on, btn_off]
		});
	}
}

function add_iscsi_left_panel() {
	var iscsiDiv = Ext.get('iscsi');
	var iscsi_header = Ext.get('iscsi_header');
	var iscsi_inner = Ext.get('iscsi_inner');
	if (!iscsi_header) {
		iscsiDiv.createChild('<div id="iscsi_header"></div>');
	}
	if (!iscsi_inner) {
		iscsiDiv.createChild('<div id="iscsi_inner"></div>');
	}
}

function change_iscsi_status(newStatus) {
	Ext.MessageBox.wait(S('Please Wait...'));
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'setIscsiStatus',
			newStatus: newStatus
		},
		method: 'POST',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				if (newStatus == 'on') {
					IS_ISCSI_RUNNING = true;
				}
				else {
					IS_ISCSI_RUNNING = false;
				}
				refresh();
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

function get_iscsi_status() {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getIscsiStatus'
		},
		method: 'POST',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				var status = response.data[0].status;
				if (status == 'on') {
					IS_ISCSI_RUNNING = true;
					Ext.getCmp('btn_on').toggle(true);
					Ext.getCmp('btn_on').disable();
					Ext.getCmp('btn_on').removeClass('x-item-disabled');
				}
				else {
					IS_ISCSI_RUNNING = false;
					Ext.getCmp('btn_off').toggle(true);
					Ext.getCmp('btn_off').disable();
					Ext.getCmp('btn_off').removeClass('x-item-disabled');
				}
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}
