function create_eyefi_form_login() {
	var eyefiForm;
	var eyefi_buttons;

	var isHide = true;
	if (eyefimode == 'on') {
		isHide = false;
	}

	var eyefi = new Ext.form.TextField({
		id: 'eyefi',
		name: 'eyefi',
		fieldLabel: S('eyefi_label_title'),
		width: 400,
		readOnly: true,
		itemCls: 'display-label'
	});

	var Login = new Ext.form.TextField({
		id: 'Login',
		name: 'Login',
		//vtype: 'email',
		//vtypeText: S('emailNotif_invalidEmail'),
		validator: function(value) {
			if (/^(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:"(?:\\[^\r\n]|[^\\"])*")))\@(?:(?:(?:(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+)(?:\.(?:[a-zA-Z0-9_!#\$\%&'*+/=?\^`{}~|\-]+))*)|(?:\[(?:\\\S|[\x21-\x5a\x5e-\x7e])*\])))$/
.test(value)){
				return true;
			}
			else {
				return S('emailNotif_invalidEmail');
			}
		},
		//emptyText: S('emailNotif_newEmail'),
		validationDelay: 1000,
		fieldLabel: S('eyefi_email'),
		width: 300,
		allowBlank: isHide,
		hideMode: 'display',
		hidden: isHide,
		hideLabel: isHide
	});

	var Password = new Ext.form.TextField({
		id: 'Password',
		name: 'Password',
		fieldLabel: S('eyefi_pwd'),
		width: 300,
		inputType: 'password',
		hideMode: 'display',
		hidden : isHide,
		hideLabel: isHide
	});

	var loginBtn = new Ext.Button({
		id: 'loginBtn',
		name: 'loginBtn',
		text: S('eyefi_loginBtn'),
		listeners: {
			click: function () {
				eyefi_loginBtnHandler(eyefiForm);
			}
		},
		hideMode: 'display',
		hidden : isHide,
		hideLabel: isHide
	});

	var poweronBtn = new Ext.Button({
		id: 'poweronBtn',
		name: 'poweronBtn',
		text: S('btn_poweron'),
		listeners: {
			click: function () {
				eyefi_powerBtnHandler(eyefiForm);
			}
		},
		hideMode: 'display',
		hidden : !isHide,
		hideLabel: !isHide
	});

	var poweroffBtn = new Ext.Button({
		id: 'poweroffBtn',
		name: 'poweroffBtn',
		text: S('btn_poweroff'),
		listeners: {
			click: function () {
				eyefi_powerBtnHandler(eyefiForm);
			}
		},
		hideMode: 'display',
		hidden : isHide,
		hideLabel: isHide
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	}, [{
		name: 'Login'
	},
	{
		name: 'Password'
	}]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	if (isHide) {
		eyefi_buttons = [
			poweronBtn
		];
	}
	else {
		eyefi_buttons = [
			loginBtn,
			poweroffBtn
		];
	}

	eyefiForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_EYEFI_FORM,
		cls: 'panel-custBorders',
		title: S('eyefi_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: eyefi_buttons,
		titleCollapse: true,
		items: [
			eyefi,
			Login,
			Password
			]
/*		keys: [{
			key: [10, 13],
			handler: function () {
				eyefi_loginBtnHandler(); // fix double call > focus with Tab + enter
			}
		}]
*/
	});

	return eyefiForm;
}

function eyefi_powerBtnHandler(eyefiForm) {
	var LoginField = Ext.getCmp('Login');
	var PasswordField = Ext.getCmp('Password');
	LoginField.disable();
	PasswordField.disable();

	var power_state;
	if (eyefimode == 'on') {
		power_state = 'off';
	}
	else {
		power_state = 'on';
	}

	eyefiForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_EYEFI,
			eyefi_service: power_state
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			createWebserviceSettings();

			if (eyefimode == 'on') {
				eyefimode = 'off';
			}
			else {
				eyefimode = 'on';
			}
		}
	});
}

function eyefi_loginBtnHandler() {
	var eyefiForm = Ext.getCmp(ID_WEBSERVICE_EYEFI_FORM);
	var email = Ext.getCmp('Login');
	var emailVal = email.getValue();
	if (!emailVal) {
		var buttons = Ext.MessageBox.OK;
		var icon = Ext.MessageBox.ERROR;
		var title = S('error_box_title');
		var msg = S('emailNotif_invalidEmail');

		Ext.MessageBox.show({
			width: 300,
			title: title,
			msg: msg,
			buttons: buttons,
			icon: icon,
			fn: function (btn) {
				email.focus();
			}
		});
	}
	else {
		eyefi_request_login(eyefiForm);
	}
}

function eyefi_request_login(eyefiForm) {
	// First, make sure that login is correct: Send request and check the response
	eyefiForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_EYEFI_LOGIN
		},
		waitMsg: S('Logging In...'),
		failure: function (form, action) {
			formFailureFunction(action);
			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			response = Ext.decode(rawData);
			eyefi_login_expired(response);

		},
		success: function (form, action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			eyefi_jsonData = resp.data[0];
			eyefiForm.destroy();
			editForm = create_eyefi_cards_list();
			editForm.expand(true);

		}
	});

	// If unsuccessful
	// Give error message
}

//Status: 0>Enabled | 1>Disabled
//PhotoFolder: /folder | none | multiple
function create_eyefi_cards_list() {
	var grid;
	var sm = new Ext.grid.RowSelectionModel();
	var cm = new Ext.grid.ColumnModel([{
		id: "Name",
		header: S('eyefi_device'),
		dataIndex: "Name",
		direction: "ASC",
		width: 150,
		renderer: eyefi_renderCardName
	},
	{
		id: "Status",
		header: S('eyefi_status'),
		dataIndex: "Enabled",
		width: 150,
		renderer: eyefi_renderStatus
	},
	{
		header: S('eyefi_transferTo'),
		dataIndex: 'Destination',
		width: 250,
		renderer: eyefi_renderTransferTo
	},
	{
		dataIndex: 'auth_hash',
		hidden: true
	},
	{
		dataIndex: 'Notify',
		hidden: true
	},
	{
		dataIndex: 'partial_transfer',
		hidden: true
	}]);

	// by default columns are sortable
	cm.defaultSortable = true;
//	cm.setRenderer(0, hideCheckbox_all);

	var eyefi_jsonStore_cards = new Ext.data.JsonStore({
		root: 'data[0].Cards',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_EYEFI_GET_LIST,
			auth_token: eyefi_jsonData.User.AuthToken
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'Name'
		},
		{
			name: 'Enabled'
		},
		{
			name: 'Destination'
		},
		{
			name: 'Notify'
		},
		{
			name: 'auth_hash'
		},
		{
			name: 'partial_transfer'
		}]
	});

	var searchComboStore = new Ext.data.SimpleStore({
		fields: [{
			name: 'name'
		},
		{
			name: 'value'
		}]
	});

	var searchbox = new Ext.form.ComboBox({
		id: ID_EYEFI_TOP_SEARCH_COMBO,
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
			select: function (c, r, i) {
				var gridIndex = r.get('name');
				var sm = grid.getSelectionModel();
				sm.selectRow(gridIndex, false); // (index, keepSelected)
				var view = grid.getView();
				view.focusRow(gridIndex);
				c.clearValue();
			}
		}
	});

	var logoutBtn = new Ext.Button({
		id: 'logoutBtn',
		name: 'logoutBtn',
		text: '<b>' + S('eyefi_logoutBtn') + '</b>',
		listeners: {
			click: function () {
				eyefi_logoutBtn(eyefi_jsonData.User.AuthToken);
			}
		}
	});

	var username = eyefi_jsonData.User.FirstName + ' ' + eyefi_jsonData.User.LastName;
	var toolbar = new Ext.Toolbar({
		autoHeight: true,
		items: [S('searchBox_find'), ' ', searchbox, '->',
		{
			iconCls: 'refresh',
			text: S('paging_tbar_refreshText'),
			scope: this,
			handler: function () {
				Ext.MessageBox.wait(S('msg_loading_data'));
				grid.store.reload({
					callback: function (r) {
						eyefi_callback_handler(eyefi_jsonStore_cards, r)
					}
				});
			}
		}, '-', /*S('eyefi_welcomeUser'), username,*/ logoutBtn],
		frame: true
	});

/*
	var gridView = new Ext.grid.GridView({
		autoFill: true
	});
*/

	grid = new Ext.grid.GridPanel({
		id: 'eyefiGrid',
		store: eyefi_jsonStore_cards,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 200,
		enableHdMenu: false,
		tbar: toolbar,
		stripeRows: true,
		frame: true,
		autoExpandColumn: 'Name',
//		view: gridView,
		title: S('eyefi_grid_title')
	});

	Ext.MessageBox.wait(S('msg_loading_data'));

	eyefi_jsonStore_cards.load({
		callback: function (r) {
			eyefi_callback_handler(eyefi_jsonStore_cards, r)
		}
	});

	//	....: Create shForm FORM and add ITEMS	:....
	var shForm = new Ext.FormPanel({
		frame: false,
		bodyBorder: false,
		id: ID_WEBSERVICE_EYEFI_FORM,
		width: 640,
		labelAlign: 'left',
		labelWidth: 120,
		items: [{
			layout: 'form'
		},
		grid]
	});

	updateCentralContainer(SHARED_FOLDER_RENDER_TO, shForm);

	return shForm;
}

function eyefi_callback_handler(eyefi_jsonStore_cards, r) {
	var result = eyefi_jsonStore_cards.reader.jsonData.success;
	var grid = Ext.getCmp('eyefiGrid');
	var searchbox = Ext.getCmp(ID_EYEFI_TOP_SEARCH_COMBO);

	if (result == "true") {
		update_combo_search(grid, searchbox, 'Name');
		eyefi_cards = r;
		Ext.MessageBox.updateProgress(1);
		Ext.MessageBox.hide();
	}
	else {
		evaluate_respose(eyefi_jsonStore_cards.reader.jsonData);
		eyefi_login_expired(eyefi_jsonStore_cards.reader.jsonData);
	}
}

function eyefi_renderCardName(value, cell, record, rowIndex) {
	return String.format("<b><a href='#' onClick='create_eyefiForm_edit(\"{1}\");'>{0} </a></b>", value, rowIndex);
}

function eyefi_renderStatus(value, cell, record) {
	var parsedValue;
	if (value == "true") {
		parsedValue = S('eyefi_status_enabled');
	}
	else {
		parsedValue = S('eyefi_status_disabled');
	}

	return parsedValue;
}

function eyefi_renderTransferTo(value, cell, record) {
	var parsedValue = value;

	if (value == '') {
		parsedValue = S('eyefi_transfer_none');
	}
	else if (value == 'multiple') {
		parsedValue = S('eyefi_transfer_multiple');
	}

	return parsedValue;
}

function create_eyefiForm_edit(rowIndex) {
	var cardName = new Ext.form.TextField({
		id: 'Name',
		name: 'Name',
		fieldLabel: S('eyefi_device'),
		itemCls: 'display-label',
		width: 400,
		readOnly: true
	});

	var eyefi_enable = new Ext.form.Radio({
		id: 'eyefi_enable',
		hideLabel: true,
		name: 'Enabled',
		boxLabel: S('enable'),
		inputValue: 'true',
		listeners: {
			check: function (eyefi_enable, checked) {
				var c;
				if (checked) {
					this.checked = true;
					eyefi_disable.setValue(false);
					sharesCombo.enable();
					if (sharesCombo.getValue()) {
						saveBtn.enable();
					}
					else {
						saveBtn.disable();
					}
				}
			}
		}
	});

	var eyefi_disable = new Ext.form.Radio({
		id: 'eyefi_disable',
		hideLabel: true,
		name: 'Enabled',
		boxLabel: S('disable'),
		inputValue: 'false',
		listeners: {
			check: function (eyefi_disable, checked) {
				var c;
				if (checked) {
					this.checked = true;
					eyefi_enable.setValue(false);
					sharesCombo.clearInvalid();
					sharesCombo.disable();
					saveBtn.enable();
				}
			}
		}
	});

	var saveBtn = new Ext.Button({
		id: 'saveBtn',
		name: 'saveBtn',
		disabled: true,
		text: S('btn_save'),
		listeners: {
			click: function () {
				eyefi_saveBtn_handler(rowIndex);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'cancelBtn',
		name: 'cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				eyefiEditForm.destroy();
				eyefiListForm = create_eyefi_cards_list();
				eyefiListForm.expand(true);
			}
		}
	});

	var store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: 'getEyeFiDestinationFolders'
		},
		root: 'data',
		fields: [{
			name: 'val'
		}]
	});

	var sharesCombo = new Ext.form.ComboBox({
		id: ID_EYEFI_DESTINATION,
		hiddenName: 'Destination',
		fieldLabel: S('eyefi_destination'),
		editable: false,
		store: store,
		displayField: 'val',
		valueField: 'val',
		emptyText: S('eyefi_destination_empty_text'),
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		forceSelection: true,
		listWidth: 210,
		width: 210,
		value: '',
		listeners: {
			select: function (c, r, i) {
				saveBtn.setDisabled(false);
			}
		}
	});

	store.load({
		callback: function () {
			var result = store.reader.jsonData.success;
			if (result) {
				// remove the folder 'info' from this list
				var folderName = 'info';

				var infoFolderIndex = store.find('val', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}

				eyefi_populate_settings(eyefi_cards[rowIndex]);
			}
			else {
				evaluate_respose(store.reader.jsonData);
				eyefi_login_expired(store.reader.jsonData);
			}
		}
	});

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader = new Ext.data.JsonReader({
		root: 'data',
		successProperty: 'success'
	}, [{
		name: 'Name'
	},
	{
		name: 'Enabled'
	},
	{
		name: 'Destination'
	},
	{
		name: 'Notify'
	},
	{
		name: 'auth_hash'
	},
	{
		name: 'partial_transfer'
	}]);

	// destroy the form with the list of cards
	Ext.getCmp(ID_WEBSERVICE_EYEFI_FORM).destroy();

	// ....: Create Eye-Fi settings form and add itmes from above  :....
	var eyefiEditForm = new Ext.FormPanel({
		id: ID_WEBSERVICE_EYEFI_FORM,
		animCollapse: false,
		title: S('eyefi_grid_title'),
		cls: 'panel-custBorders',
		errorReader: jErrReader,
		reader: jReader,
		autoHeight: true,
		collapsible: true,
		collapsed: false,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		items: [cardName,
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .27,
				html: S('eyefi_service') + ":"
			},
			{
				layout: 'form',
				columnWidth: .24,
				items: [eyefi_enable]
			},
			{
				layout: 'form',
				columnWidth: .49,
				items: [eyefi_disable]
			}]
		},
		sharesCombo],
		buttons: [saveBtn, cancelBtn],
		titleCollapse: true
	});

	updateCentralContainer(SHARED_FOLDER_RENDER_TO, eyefiEditForm);
}

function eyefi_populate_settings(record) {
	var cardNameVal = record.get('Name');
	var cardName = Ext.getCmp('Name');
	cardName.setValue(cardNameVal);

	var serviceStatus = record.get('Enabled');
	var eyefi_enable = Ext.getCmp('eyefi_enable');
	var eyefi_disable = Ext.getCmp('eyefi_disable');

	var saveBtn = Ext.getCmp('saveBtn');

	if (serviceStatus == "true") {
		eyefi_enable.setValue(true);
		saveBtn.enable();
	}
	else {
		eyefi_disable.setValue(true);
	}

	var share = record.get('Destination');
	var shareField = Ext.getCmp(ID_EYEFI_DESTINATION);
	shareField.setValue(share);
}

function eyefi_saveBtn_handler(rowIndex) {
	var record = eyefi_cards[rowIndex];
	var partialTransfer = record.get('Name');
	var auth_hash = record.get('auth_hash');
	var auth_token = eyefi_jsonData.User.AuthToken;
	var serviceDisabled = Ext.getCmp('eyefi_disable').getValue();

	if (partialTransfer == 1 && !serviceDisabled) {
		eyefi_show_transfer_warning(auth_hash, auth_token);
	}
	else {
		eyefi_save_settings(auth_hash, auth_token, false)
	}
}

function eyefi_show_transfer_warning(auth_hash, auth_token) {
	var title = S('eyefi_multipleDest_title');
	var msg = S('eyefi_transfer_warning');

	var eyefi_wholeTransferBtn = new Ext.Button({
		id: 'eyefi_wholeTransferBtn',
		name: 'eyefi_wholeTransferBtn',
		text: S('eyefi_wholeTransferBtn'),
		listeners: {
			click: function () {
				confirmWindow.close();
				eyefi_save_settings(auth_hash, auth_token, false);
			}
		}
	});

	var eyefi_partialTransferBtn = new Ext.Button({
		id: 'eyefi_partialTransferBtn',
		name: 'eyefi_partialTransferBtn',
		text: S('eyefi_partialTransferBtn'),
		listeners: {
			click: function () {
				confirmWindow.close();
				eyefi_save_settings(auth_hash, auth_token, true);
			}
		}
	});

	var eyefi_cancelBtn = new Ext.Button({
		id: 'eyefi_cancelBtn',
		name: 'eyefi_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				confirmWindow.close();
			}
		}
	});

	if (!Ext.getCmp(ID_EYEFI_TRANSFER_WIN)) {
		confirmWindow = new Ext.Window({
			html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
			id: ID_EYEFI_TRANSFER_WIN,
			modal: true,
			width: 600,
			title: S('warning_box_title'),
			plain: true,
			draggable: false,
			resizable: false,
			layout: 'form',
			items: [{
				xtype: 'label',
				html: '<p class="title_popup"><img src="' + WARNING_IMG + '"/> ' + title + '</p><br>'
			},
			{
				xtype: 'label',
				html: '<p class="confirmation_instruction">' + msg + '</p><br/>'
			}],
			buttonAlign: 'center',
			buttons: [eyefi_partialTransferBtn, eyefi_wholeTransferBtn, eyefi_cancelBtn]
		});
	}

	confirmWindow.show(confirmWindow);
}

function eyefi_save_settings(auth_hash, auth_token, partial_transfer) {
	var eyefiForm = Ext.getCmp(ID_WEBSERVICE_EYEFI_FORM);

	eyefiForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_EYEFI_SET_CARD_PROPERTY,
			auth_hash: auth_hash,
			partial_transfer: partial_transfer,
			auth_token: auth_token
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			response = Ext.decode(rawData);
			eyefi_login_expired(response);
		},
		success: function (form, action) {
			eyefiForm.destroy();
			eyefiListForm = create_eyefi_cards_list();
			eyefiListForm.expand(true);
		}
	});
}

function eyefi_logoutBtn(auth_token) {
	var eyefiForm = Ext.getCmp(ID_WEBSERVICE_EYEFI_FORM);
	eyefiForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_EYEFI_LOGOUT,
			auth_token: eyefi_jsonData.User.AuthToken
		},
		waitMsg: S('msg_logginout'),
		failure: function (form, action) {
			formFailureFunction(action);
			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			response = Ext.decode(rawData);
			eyefi_login_expired(response);
		},
		success: function (form, action) {
			eyefiForm.destroy();
//			eyefiFormLogin = create_eyefi_form_login();
//			updateCentralContainer(SYSTEM_RENDER_TO, eyefiFormLogin);
			createWebserviceSettings();
		}
	});
}

function eyefi_login_expired(response) {
	if (response) {
		for (var i = 0; i < response.errors.length; i++) {
			if (response.errors[i] == "EFC_BAD_auth_hash") {
				var eyefiForm = Ext.getCmp(ID_WEBSERVICE_EYEFI_FORM);
				eyefiForm.destroy();
				eyefiFormLogin = create_eyefi_form_login();
				updateCentralContainer(SYSTEM_RENDER_TO, eyefiFormLogin);
			}
		}
	}
}

function eyefi_display_mode(psForm_display){
	eyefiForm.destroy();
//	eyefiForm_edit = create_deviceserver_form_display_mode();
//	insertToCentralContainer(SYSTEM_RENDER_TO, psForm_edit, ID_DEVICESERVER_FORM);
	deviceserver_format_display(deviceserver_jsonData);
//	eyefiForm_edit.expand(true);
}

function eyefi_format_display(data) {
	var eyefi = Ext.getCmp('eyefi');
	var LoginField = Ext.getCmp('Login');
	LoginField.clearInvalid();

	if (data.eyefi_service == 'on') {
		eyefi.setValue(S('enabled'));
	}
	else {
		eyefi.setValue(S('disabled'));
	}
}
