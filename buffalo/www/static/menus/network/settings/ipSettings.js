function ip_form_display_mode() {
	var eth_1 = new Ext.form.TextField({
		id: 'eth_1',
		name: 'eth_1',
		fieldLabel: S('net_settings_eht_1'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label-bold'
	});

	var dhcpStatus_1 = new Ext.form.TextField({
		id: 'dhcpStatus_1',
		name: 'dhcpStatus_1',
		fieldLabel: S('net_settings_dhcp'),
		width: 200,
		readOnly: true
	});

	var ipAddr_1 = new Ext.form.TextField({
		id: 'ipAddr_1',
		name: 'ipAddr_1',
		fieldLabel: S('net_settings_ip'),
		width: 200,
		readOnly: true
	});

	var subMsk_1 = new Ext.form.TextField({
		name: 'subMsk_1',
		fieldLabel: S('net_settings_subnet'),
		width: 200,
		readOnly: true
	});

	var eth_2 = new Ext.form.TextField({
		id: 'eth_2',
		name: 'eth_2',
		fieldLabel: S('net_settings_eht_2'),
		width: 200,
		readOnly: true,
		itemCls: 'display-label-bold'
	});

	var dhcpStatus_2 = new Ext.form.TextField({
		id: 'dhcpStatus_2',
		name: 'dhcpStatus_2',
		fieldLabel: S('net_settings_dhcp'),
		width: 200,
		readOnly: true
	});

	var ipAddr_2 = new Ext.form.TextField({
		id: 'ipAddr_2',
		name: 'ipAddr_2',
		fieldLabel: S('net_settings_ip'),
		width: 200,
		readOnly: true
	});

	var subMsk_2 = new Ext.form.TextField({
		id: 'subMsk_2',
		name: 'subMsk_2',
		fieldLabel: S('net_settings_subnet'),
		width: 200,
		readOnly: true
	});

	var gtwy = new Ext.form.TextField({
		name: 'gtwy',
		fieldLabel: S('net_settings_gtwy'),
		width: 200,
		readOnly: true
	});

	var primDns = new Ext.form.TextField({
		name: 'primDns',
		fieldLabel: S('net_settings_dns'),
		width: 200,
		readOnly: true
	});

	var secDns = new Ext.form.TextField({
		name: 'secDns',
		fieldLabel: S('net_settings_secDns'),
		width: 200,
		readOnly: true
	});

	var wol = new Ext.form.TextField({
		id: 'wol',
		name: 'wol',
		fieldLabel: S('net_settings_wol'),
		width: 200,
		readOnly: true
	});

	var ip_settings_editBtn = new Ext.Button({
		id: 'ip_settings_editBtn',
		name: 'ip_settings_editBtn',
		disabled: true,
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				ip_editBtnHandler(ipForm);
			}
		}
	});

	var noteSpace = new Ext.form.TextField({
		id: 'noteSpace',
		hideLabel: true,
		labelSeparator: '',
		width: 500,
		readOnly: true,
		itemCls: 'display-label-bold-left'
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'eth_1'
	},
	{
		name: 'eth_2'
	},
	{
		name: 'dhcpStatus_1'
	},
	{
		name: 'dhcpStatus_2'
	},
	{
		name: 'ipAddr_1'
	},
	{
		name: 'ipAddr_2'
	},
	{
		name: 'subMsk_1'
	},
	{
		name: 'subMsk_2'
	},
	{
		name: 'gtwy'
	},
	{
		name: 'primDns'
	},
	{
		name: 'secDns'
	},
	{
		name: 'wol'
	},
	{
		name: 'portTrunk'
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

	var items;
	if (add_eth) {
		// two internet ports
		if (add_wol) {
			items = [eth_1, dhcpStatus_1, ipAddr_1, subMsk_1, eth_2, dhcpStatus_2, ipAddr_2, subMsk_2, noteSpace, gtwy, primDns, secDns, wol];
		}
		else {
			items = [eth_1, dhcpStatus_1, ipAddr_1, subMsk_1, eth_2, dhcpStatus_2, ipAddr_2, subMsk_2, noteSpace, gtwy, primDns, secDns];
		}
	}
	else {
		// single ethernet port
		if (add_wol) {
			items = [dhcpStatus_1, ipAddr_1, subMsk_1, gtwy, primDns, secDns, wol];
		}
		else {
			items = [dhcpStatus_1, ipAddr_1, subMsk_1, gtwy, primDns, secDns];
		}
	}

	// ....: Create IP settings FORM and add FIELDSETS :....
	var ipForm = new Ext.FormPanel({
		id: ID_IP_SETTINGS_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls: 'panel-custBorders',
		//ctCls: 'toggle-button-left',
		collapsible: true,
		autoHeight: true,
		width: 640,
		labelWidth: 160,
		title: S('net_settings_ip_formTitle'),
		reader: jReader,
		buttonAlign: 'left',
		errorReader: jErrReader,
		items: items,
		buttons: [ip_settings_editBtn],
		collapseFirst: true,
		titleCollapse: true
	});

	return ipForm;
}

function ip_form_edit_mode() {
	// ....: Create form ITEMS :....
	var dhcpEnabled_1 = new Ext.form.Radio({
		id: 'dhcpEnabled_1',
		hideLabel: true,
		name: 'dhcpStatus_1',
		boxLabel: S('enable'),
		inputValue: 'dhcp',
		listeners: {
			check: function(dhcpEnabled_1, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					ipAddr_1.clearInvalid();
					subMsk_1.clearInvalid();
					gtwy.clearInvalid();
					secDns.clearInvalid();
					ipAddr_1.disable();
					subMsk_1.disable();
					dhcpDisabled_1.setValue(false);
					primDns.disable();
					secDns.disable();
					gtwy.disable();
					this.checked = true;
				}
			}
		}
	});
	
	var dhcpDisabled_1 = new Ext.form.Radio({
		id: 'dhcpDisabled_1',
		name: 'dhcpStatus_1',
		boxLabel: S('disable'),
		inputValue: 'static',
		listeners: {
			check: function(dhcpDisabled_1, checked) {
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;
				
				if (checked) {
					dhcpEnabled_1.setValue(false);
					this.checked = true;
					ipAddr_1.enable();
					subMsk_1.enable();
					primDns.enable();
					secDns.enable();
					gtwy.enable();
				}
			}
		}
	});

	var ipAddr_1 = new Ext.form.TextField({
		id: 'ipAddr_1',
		name: 'ipAddr_1',
		fieldLabel: S('net_settings_ip'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: false
	});

	var subMsk_1 = new Ext.form.TextField({
		name: 'subMsk_1',
		fieldLabel: S('net_settings_subnet'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: false
	});

	var eth_1_fieldset = new Ext.form.FieldSet({
		id: 'eth_1_fieldset',
		title: S('net_settings_eht_1'),
		collapsed: false,
		//	checkboxToggle:true,
		//checkboxName:'eth_1',
		autoHeight: true,
		width: 610,
		labelWidth: 150,
/*
		listeners: {
			 collapse : function(){
				if(eth_2_fieldset.collapsed){
					saveBtn.disable();
				}
			 },
			 expand : function(){
				saveBtn.enable();
			 }
		},
*/
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('net_settings_dhcp') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [dhcpEnabled_1]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [dhcpDisabled_1]
			}]
		},
		ipAddr_1, subMsk_1]
	});

	var dhcpEnabled_2 = new Ext.form.Radio({
		id: 'dhcpEnabled_2',
		hideLabel: true,
		name: 'dhcpStatus_2',
		boxLabel: S('enable'),
		inputValue: 'dhcp',
		listeners: {
			check: function(dhcpEnabled_2, checked) {

				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;
				if (checked) {
					ipAddr_2.disable();
					subMsk_2.disable();
					dhcpDisabled_2.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var dhcpDisabled_2 = new Ext.form.Radio({
		id: 'dhcpDisabled_2',
		name: 'dhcpStatus_2',
		boxLabel: S('disable'),
		inputValue: 'static',
		listeners: {
			check: function(dhcpDisabled_2, checked) {
				//	alert('disabling dhcp');
				var form = Ext.getCmp(ID_IP_SETTINGS_FORM);
				var c;

				if (checked) {
					ipAddr_2.enable();
					subMsk_2.enable();
					dhcpEnabled_2.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var ipAddr_2 = new Ext.form.TextField({
		id: 'ipAddr_2',
		name: 'ipAddr_2',
		fieldLabel: S('net_settings_ip'),
		width: 200,
		disabled: true,
		allowBlank: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var subMsk_2 = new Ext.form.TextField({
		id: 'subMsk_2',
		name: 'subMsk_2',
		fieldLabel: S('net_settings_subnet'),
		width: 200,
		disabled: true,
		allowBlank: false,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var eth_2_fieldset = new Ext.form.FieldSet({
		id: 'eth_2_fieldset',
		disabled: true,
		title: S('net_settings_eht_2'),
		checkboxToggle: true,
		collapsed: true,
		checkboxName: 'eth_2',
		autoHeight: true,
		width: 610,
		//collapsible: true,
		titleCollapse: true,
		labelWidth: 150,
		listeners: {
			expand: function(){
				if(!dhcpEnabled_2.getValue() && !dhcpDisabled_2.getValue()){
					dhcpEnabled_2.setValue(true);
				}
			}
		},
		items: [{
			width: '600',
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('net_settings_dhcp') + ":"
			},
			{
				cls: 'label',
				columnWidth: .24,
				items: [dhcpEnabled_2]
			},
			{
				cls: 'label',
				columnWidth: .49,
				items: [dhcpDisabled_2]
			}]
		},
		ipAddr_2, subMsk_2]
	});

	var noteSpace = new Ext.form.TextField({
		id: 'noteSpace',
		hideLabel: true,
		labelSeparator: '',
		width: 500,
		readOnly: true,
		itemCls: 'display-label-bold-left'
	});

	var gtwy = new Ext.form.TextField({
		name: 'gtwy',
		fieldLabel: S('net_settings_gtwy'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: true
	});

	var primDns = new Ext.form.TextField({
		name: 'primDns',
		fieldLabel: S('net_settings_dns'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		},
		allowBlank: true
	});

	var secDns = new Ext.form.TextField({
		name: 'secDns',
		fieldLabel: S('net_settings_secDns'),
		width: 200,
		disabled: true,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_FIELD_LENGTH_IP
		}
	});

	var wolEnabled = new Ext.form.Radio({
		id: 'wolEnabled',
		hideLabel: true,
		name: 'wol',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function(wolEnabled, checked) {
				if (checked) {
					wolDisabled.setValue(false);
					this.checked = true;
				}
			}
		}
	});
	
	var wolDisabled = new Ext.form.Radio({
		id: 'wolDisabled',
		name: 'wol',
		boxLabel: S('disable'),
		inputValue: 'off',
		listeners: {
			check: function(wolDisabled, checked) {

				if (checked) {
					wolEnabled.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function() {
				ip_saveBtnHandler(ipForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				ip_display_mode(ipForm);
				set_eth_status_display(ip_jsonData);
				Ext.getCmp('ip_settings_editBtn').enable();
				ip_check_iscsi();
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	[{
		name: 'dhcpStatus_1'
	},
	{
		name: 'dhcpStatus_2'
	},
	{
		name: 'ipAddr'
	},
	{
		name: 'subMsk'
	},
	{
		name: 'gtwy'
	},
	{
		name: 'primDns'
	},
	{
		name: 'secDns'
	},
	{
		name: 'wol'
	},
	{
		name: 'portTrunk'
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

	var items;

	if (add_eth) {
		if (add_wol) {
			items = [eth_1_fieldset, eth_2_fieldset, noteSpace, gtwy, primDns, secDns,
				{
					autoWidth: true,
					layout: 'column',
					cls: 'column-custBorders',
					items: [{
						cls: 'label',
						columnWidth: .264,
						html: S('net_settings_wol') + ":"
					},
					{
						cls: 'label',
						columnWidth: .24,
						items: [wolEnabled]
					},
					{
						cls: 'label',
						columnWidth: .49,
						items: [wolDisabled]
					}]
				}
			]
		}
		else {
			items = [eth_1_fieldset, eth_2_fieldset, noteSpace, gtwy, primDns, secDns]
		}
	}
	else {
		if (add_wol) {
			items = [{
				autoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .264,
					html: S('net_settings_dhcp') + ":"
				},
				{
					cls: 'label',
					columnWidth: .24,
					items: [dhcpEnabled_1]
				},
				{
					cls: 'label',
					columnWidth: .49,
					items: [dhcpDisabled_1]
				}]
			},
			ipAddr_1, subMsk_1, gtwy, primDns, secDns,
				{
					autoWidth: true,
					layout: 'column',
					cls: 'column-custBorders',
					items: [{
						cls: 'label',
						columnWidth: .264,
						html: S('net_settings_wol') + ":"
					},
					{
						cls: 'label',
						columnWidth: .24,
						items: [wolEnabled]
					},
					{
						cls: 'label',
						columnWidth: .49,
						items: [wolDisabled]
					}]
				}

]
		}
		else {
			items = [{
				autoWidth: true,
				layout: 'column',
				cls: 'column-custBorders',
				items: [{
					cls: 'label',
					columnWidth: .264,
					html: S('net_settings_dhcp') + ":"
				},
				{
					cls: 'label',
					columnWidth: .24,
					items: [dhcpEnabled_1]
				},
				{
					cls: 'label',
					columnWidth: .49,
					items: [dhcpDisabled_1]
				}]
			},
			ipAddr_1, subMsk_1, gtwy, primDns, secDns]
		}
	}

	// ....: Create IP settings FORM and add FIELDSETS :....
	var ipForm = new Ext.FormPanel({
		id: ID_IP_SETTINGS_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		collapsible: true,
		autoHeight: true,
		width: 640,
		labelWidth: 160,
		title: S('net_settings_ip_formTitle'),
		reader: jReader,
		buttonAlign: 'left',
		errorReader: jErrReader,
		items: items,
		buttons: [saveBtn, cancelBtn],
		titleCollapse: true,
		timeout: 90000
	});

	return ipForm;
}

function ip_saveBtnHandler(ipForm) {
	var formValues = ipForm.form.getValues();
	formValues.bufaction = BUFACT_SET_IP_SETTINGS

	var submit_ajax = new Ext.data.Connection({
		listeners: {
		requestcomplete: function(conn, response, options){
			if (!response.responseText || Ext.decode(response.responseText).success) {
				ip_display_address(response, options);
			}
			else if(!Ext.decode(response.responseText).success){
				winAjaxFailureFunction_rawData(response);
			}
		},
		requestexception: function(conn, response, options){
				ip_display_address(response, options);
			}
		},
		timeout: 90000
	});

	Ext.MessageBox.wait(S('msg_saving_data'));
	submit_ajax.request({
		url: '/dynamic.pl',
		params: formValues,
		method: 'POST'
	});
}

function ip_display_address(response, options){
	var dhcpRadioEn = Ext.getCmp('dhcpEnabled_1');
	var dhcpRadioEn_2 = Ext.getCmp('dhcpEnabled_2');
	var eth_2_fieldset = Ext.getCmp('eth_2_fieldset');
	var eth_2_fieldset_state;
	
	if (add_eth) {
		eth_2_fieldset_state = eth_2_fieldset.checkbox.dom.checked;
	}
	var msg;
	var buttons;
	var container = Ext.get(NETWORK_RENDER_TO); // gets the center container 
	var title = S('net_settings_ip_committing_changes');
	var titleFormatted = '<p class="title">' + title + '</p><br>';
	var msg_dynamic_1 = '<b>' + S('net_settings_eht_1') + ':</b>' + '<br>' + S('net_settings_ip_dynamic_msg');
	var msg_static_1 = '<b>' + S('net_settings_eht_1') + ':</b>' + '<br>' + S('net_settings_ip_static_msg');

	if (dhcpRadioEn.getValue()) {
		// DHCP enabled
		msg = msg_dynamic_1;
		buttons = Ext.Msg.OK
	}
	else {
		// DHCP disabled
		var ipAddr = Ext.getCmp('ipAddr_1').getValue();
		msg = msg_static_1 + ' <a href="http://' + ipAddr + '">http://' + ipAddr + '/</a>';
	}
	var msgFormatted = '<p class="msg">' + msg + '</p>';

	var msgFormatted_2 = '';
	if (add_eth) {
		var msg_dynamic_2 = '<br><b>' + S('net_settings_eht_2') + ':</b>' + '<br>' + S('net_settings_ip_dynamic_msg');
		var msg_static_2 = '<br><b>' + S('net_settings_eht_2') + ':</b>' + '<br>' + S('net_settings_ip_static_msg');

		if (ip_jsonData.eth2 == 'on') {
			msgFormatted_2 = '';
		}
		else if (eth_2_fieldset_state) {
			if (dhcpRadioEn_2.getValue()) {
				// DHCP enabled
				msg = msg_dynamic_2;
				buttons = Ext.Msg.OK
			}
			else {
				// DHCP disabled
				var ipAddr_2 = Ext.getCmp('ipAddr_2').getValue();
				msg = msg_static_2 + ' <a href="http://' + ipAddr_2 + '">http://' + ipAddr_2 + '/</a>';
			}
			msgFormatted_2 = '<p class="msg">' + msg + '</p>';
		}
	}
	Ext.MessageBox.updateProgress(1);
	Ext.MessageBox.hide();
	if (container != undefined) {
		while (container.first()) {
			element = container.first();
			element.remove();
		}
	}
	addHtmlToContainer(NETWORK_RENDER_TO, titleFormatted);
	addHtmlToContainer(NETWORK_RENDER_TO, msgFormatted);
	if (add_eth) {
		addHtmlToContainer(NETWORK_RENDER_TO, msgFormatted_2);
	}
	
	if (add_iscsi) {
		show_menus_submenus_disabled_iscsi();
	}
	else {
		show_menus_submenus_disabled();
	}

	highlight_sub_menu(selected_sub_menu);
	highlight_menu(selected_menu);
}

function ip_editBtnHandler(ip_edit) {
	ip_edit.destroy();
	ip_display = ip_form_edit_mode();
	insertToCentralContainer(NETWORK_RENDER_TO, ip_display, ipRenderBefore);
	ip_display.form.setValues(ip_jsonData);
	radioSelection_dhcp(ip_jsonData);
	radioSelection_wol(ip_jsonData);
	var eth_2 = ip_jsonData.eth_2;
	var eth_2_fieldset = Ext.getCmp('eth_2_fieldset');

	if (add_eth) {
		if (eth_2 == 'trunk') {
			var noteSpace = Ext.getCmp('noteSpace');
			noteSpace.setValue(S('net_settings_ip_portTrunkNote_edit'));
			eth_2_fieldset.hide(); // for IE draw problem
			//eth_2_fieldset.checkboxToggle = false;
			var chkbox = Ext.getCmp('eth_2_fieldset').checkbox.dom.disabled = true;
			//chkbox.setDisabled(true);
		}
		else if (eth_2 == 'on'){
			eth_2_fieldset.expand(false); // expand without animating
			eth_2_fieldset.checkboxToggle = true;
			eth_2_fieldset.enable();
			radioSelection_dhcp_2(ip_jsonData);
		}
		else{
			eth_2_fieldset.enable();
		}
	}
	ip_display.expand(true);
}

function ip_display_mode(ip_display) {
	ip_display.destroy();
	ip_edit = ip_form_display_mode();
	insertToCentralContainer(NETWORK_RENDER_TO, ip_edit, ipRenderBefore);
	ip_edit.form.setValues(ip_jsonData);
	ip_edit.expand(true);
}

function radioSelection_dhcp(data) {
	selectedMethod = data.dhcpStatus_1;
	dhcpRadioEn = Ext.getCmp('dhcpEnabled_1');
	dhcpRadioDis = Ext.getCmp('dhcpDisabled_1');

	if (selectedMethod == 'dhcp') {
		dhcpRadioEn.setValue(true);
	}
	else {
		dhcpRadioDis.setValue(true);
	}
}

function radioSelection_dhcp_2(data) {
	selectedMethod = data.dhcpStatus_2;
	dhcpRadioEn = Ext.getCmp('dhcpEnabled_2');
	dhcpRadioDis = Ext.getCmp('dhcpDisabled_2');

	if (selectedMethod == 'dhcp') {
		dhcpRadioEn.setValue(true);
	}
	else {
		dhcpRadioDis.setValue(true);
	}
}

function radioSelection_wol(data) {
	selectedMethod = data.wol;
	wolRadioEn = Ext.getCmp('wolEnabled');
	wolRadioDis = Ext.getCmp('wolDisabled');

	if (selectedMethod == 'on') {
		wolRadioEn.setValue(true);
	}
	else {
		wolRadioDis.setValue(true);
	}
}

function set_eth_status_display(data) {
	if (add_eth) {
		var value_eth_1;
		var value_eth_2;
		if (data.eth_1 == 'on') {
			//eth1 ON
			value_eth_1 = S('enabled');
			set_dhcp_status_display(data, 1);
		}
		else {
			//eth1 OFF (NULL)
			value_eth_1 = S('disabled');
		}
		var eth_1_status = Ext.getCmp('eth_1');
		eth_1_status.setValue(value_eth_1);
		if (data.eth_2 == 'on') {
			//eth2 ON
			value_eth_2 = S('enabled');
			set_dhcp_status_display(data, 2);
		}
		else if (data.eth_2 == 'trunk') {
			value_eth_2 = S('net_settings_ip_portTrunkNote');
			Ext.getCmp('dhcpStatus_2').setValue('-');
			Ext.getCmp('dhcpStatus_2').disable();
			Ext.getCmp('ipAddr_2').setValue('-');
			Ext.getCmp('subMsk_2').setValue('-');
		}
		else {
			// eth2 OFF
			value_eth_2 = S('disabled');
			Ext.getCmp('dhcpStatus_2').setValue('-');
			Ext.getCmp('ipAddr_2').setValue('-');
			Ext.getCmp('subMsk_2').setValue('-');
		}
		var eth_2_status = Ext.getCmp('eth_2');
		if (eth_2_status) eth_2_status.setValue(value_eth_2);
	}
	else {
		if (data.eth_1 == 'on') {
			// eth1 ON
			value_eth_1 = S('enabled');
			set_dhcp_status_display(data, 1);
		}
		else {
			// eth1 OFF
			value_eth_1 = S('disabled');
		}
		var eth_1_status = Ext.getCmp('eth_1');
		eth_1_status.setValue(value_eth_1);

		set_dhcp_status_display(data, 1);
	}

	if (add_wol) {
		var value_wol;
		if (data.wol == 'on') {
			value_wol = S('enabled');
		}
		else {
			value_wol = S('disabled');
		}

		var wol_view;
		wol_view = Ext.getCmp('wol');
		wol_view.setValue(value_wol);
	}
}

function set_dhcp_status_display(data, eth) {
	var selectedMethod;
	var dhcp;

	if (eth == 1) {
		selectedMethod = data.dhcpStatus_1;
		dhcp = Ext.getCmp('dhcpStatus_1');
	}
	else {
		selectedMethod = data.dhcpStatus_2;
		dhcp = Ext.getCmp('dhcpStatus_2');
	}

	var value;
	if (selectedMethod == 'static') {
		value = S('disabled');
	}
	else {
		value = S('enabled');
	}
	dhcp.setValue(value);
}

function ip_check_iscsi(){
	if (add_iscsi && IS_ISCSI_RUNNING){
		Ext.getCmp('ip_settings_editBtn').disable();
	}
}
