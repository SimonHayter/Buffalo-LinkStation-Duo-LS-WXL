String.prototype.repeat = function(n) {
	return Array(n+1).join(this);
}

function createPocketUFormDisplayMode() {
	var isHide = false;
	if (pocketUjsonData.pocketu_status == 'configured') {
		isHide = true;
	}
	
	var hideModeVal = 'display';

	var pocketu_vpn_connection = new Ext.form.TextField({
		id: 'pocketu_vpn_connection',
		name: 'pocketu_vpn_connection',
		fieldLabel:S('pocketu_vpn_connection'),
		width: 400,
		readOnly: true,
		hideMode : hideModeVal
	});

	var pocketu_service = new Ext.form.TextField({
		id: 'pocketu_service',
		name: 'pocketu_service',
		fieldLabel:S('pocketU_sercive_field'),
		width: 400,
		readOnly: true,
		hideMode : hideModeVal
	});

	var pocketu_id = new Ext.form.TextField({
		id: 'pocketu_id',
		name: 'pocketu_id',
		fieldLabel:S('pocketU_id_field'),
		width: 400,
		readOnly: true,
		hideMode : hideModeVal
	});

	var pocketu_status = new Ext.form.Hidden({
		id: 'pocketu_status',
		name: 'pocketu_status',
		readOnly: true
	});
	
	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name: 'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {
			click: function() {
				pocketUValidateSession();

				if (pocketUjsonData.pocketu_status != 'configured') {
					var transactionId = null;
					Ext.Msg.show({
						msg: S('pocketU_internet_connection_wait_msg'), 
						buttons: Ext.Msg.CANCEL,
						fn: function(btn,text){
							if(btn == 'cancel'){
								if(transactionId != null){
									Ext.Ajax.abort(transactionId);
								}
								else{
									Ext.Ajax.abort();
								}
								clearInterval(timer);
							}
						},
						icon: Ext.MessageBox.INFO,
						progress: true
					});

					var currentProgress = 0;

					// 200ミリ秒ごとに関数を呼ぶ
					var timer = setInterval(function() {
						currentProgress += 2;

						// 進捗状況の更新
						Ext.MessageBox.updateProgress(currentProgress/100, '');

						// 100%に達したらダイアログを非表示にしタイマー解除
						if (currentProgress >= 100) {
							currentProgress = 0;
						}
					}, 100);

					transactionId = Ext.Ajax.request({
						url: '/dynamic.pl',
						params: {
							bufaction: BUFACT_CHECK_POCKETU_INTERNET_CONNECTION
						},
						failure: function() {
							Ext.MessageBox.hide();
						},
						success: function(result) {
							Ext.MessageBox.hide();
							clearInterval(timer);

							rawData = result.responseText;
							response = Ext.decode(rawData);

							var success = response.success;
							if (success) {
								resetCookie(response);
								pocketUEditBtnHandler(pocketuForm);
							}
							else {
								var error = response.errors;
								if (error.length) {
									Ext.MessageBox.alert(S('error_box_title'),S(error[0]));
								}
								else {
									formFailureFunction();
								}
							}
							
						}
					});
				}
				else {
					pocketUEditBtnHandler(pocketuForm);
				}
			}
		}
	});

	var hn_subscriptionBtn = new Ext.Button({
		id: 'hn_subscriptionBtn',
		name: 'hn_subscriptionBtn',
		text: S('btn_pocketU_subscription'),
		disabled: true,
		listeners: {
			click: function() {
				pocketU_subscriptionBtnHandler(pocketuForm);
			}
		}
	});
	
	var hn_pocketU_setting_initialize = new Ext.Button({
		id: 'hn_pocketU_setting_initialize',
		name: 'hn_pocketU_setting_initialize',
		text: S('btn_pocketU_setting_initialize'),
		listeners: {
			click: function() {
				pocketUValidateSession();
				Ext.Msg.confirm(S('btn_pocketU_setting_initialize'),
				S('btn_pocketU_setting_initialize_msg'),
				function(btn,text){
					if (btn == 'yes') {
							pocketu_service = Ext.getCmp('pocketu_service');
							pocketu_service.setValue(S('disable'));
							
							pocketu_id = Ext.getCmp('pocketu_id');
							pocketu_id.setValue('');
							
						pocketU_saveBtnHandler(pocketuForm);
					}
				});
			}
		}
	});
	
	var hn_subscriptionBtn = new Ext.Button({
		id: 'hn_subscriptionBtn',
		name: 'hn_subscriptionBtn',
		text: S('btn_pocketU_protocol'),
		disabled: true,
		listeners: {
			click: function() {
				pocketU_subscriptionBtnHandler(pocketuForm);
			}
		}
	});
	
	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'pocketu_service'},
		{name: 'pocketu_id'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

//	var docomoHtml1 = S('pocketU_docomo_html1');
//	var docomoHtml2 = S('pocketU_docomo_html2');
	var docomoHtml3 = S('pocketU_docomo_html3');
	var docomoHtml4 = S('pocketU_docomo_html4');
	var docomoHtml5 = S('pocketU_docomo_html5');

	var connditionText;
	if (pocketUjsonData.pocketu_service == 'on') {
		connditionText = S('pocketU_connect');
	}
	else {
		connditionText = S('pocketU_disconnect');
	}

	var pocketuForm = new Ext.FormPanel({
		id: ID_POCKETU_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('pocketU_sercive_form_title'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [],
		titleCollapse: true,
		items: [
			pocketu_vpn_connection,
			pocketu_service,
			pocketu_id,
//			pocketu_password,
			hn_editBtn,
			{
				autoWidth: true,
				layout: 'column',
				id: 'docomo_text3',
				name: 'docomo_text3',
				cls : 'column-custBorders',
				items: [{
					cls: 'pocketu',
					columnWidth: 1.0,
					html: docomoHtml3
				}]
			},
			hn_pocketU_setting_initialize,
			{
				autoWidth: true,
				layout: 'column',
				id: 'docomo_text4',
				name: 'docomo_text4',
				cls : 'column-custBorders',
				items: [{
					cls: 'pocketu',
					columnWidth: 1.0,
					html: docomoHtml4
				}]
			},
			{
				autoWidth: true,
				layout: 'column',
				id: 'docomo_text5',
				name: 'docomo_text5',
				cls : 'column-custBorders',
				items: [{
					cls: 'pocketu',
					columnWidth: 1.0,
					html: docomoHtml5
				}],
				hidden : !isHide,
				hideLabel: !isHide
			},
			{
				autoWidth: true,
				layout: 'column',
				cls : 'column-custBorders',
				items: [{
					layout: 'form',
					items: [hn_subscriptionBtn]
				}, {
					cls: 'pocketu',
					html: S('pocketU_move_to_docomo')
				}],
				hidden : !isHide,
				hideLabel: !isHide
			}
		]
	});

	return pocketuForm;
}

function createPocketUFormEditMode() {
	var isHide = false;
	if (pocketUjsonData.pocketu_status == 'configured') {
		isHide = true;
	}
	var hideModeVal = 'offsets';

	var docomoHtml1 = S('pocketU_docomo_html1');
	var docomoHtml2 = S('pocketU_docomo_html2');
	var docomoHtml3 = S('pocketU_docomo_html3');
	var docomoHtml4 = S('pocketU_docomo_html4');
	var docomoHtml5 = S('pocketU_docomo_html5');

	var pocketU_on_label = S('enable');
	var pocketU_off_label = S('disable');
	if (pocketUjsonData.pocketu_status == 'configured') {
		pocketU_on_label = S('pocketU_begin_connect');
		pocketU_off_label = S('pocketU_end_connect');
	}

	var pocketU_on = new Ext.form.Radio({
		id: 'pocketU_on',
		hideLabel: true,
		name: 'pocketu_service',
		boxLabel: pocketU_on_label,
		listeners: {
			check: function(pocketU_on, checked) {
				if (checked) {
					radioSelection_pocketU_on();
					pocketU_off.setValue(false);
				}
			}
		},
		inputValue: 'on',
		hideMode : hideModeVal
	});

	var pocketU_off = new Ext.form.Radio({
		id: 'pocketU_off',
		hideLabel: true,
		name: 'pocketu_service',
		boxLabel: pocketU_off_label,
		listeners: {
			check: function(pocketU_off, checked) {
				if (checked) {
					radioSelection_pocketU_off();
					pocketU_on.setValue(false);
				}
			}
		},
		inputValue: 'off',
		hideMode : hideModeVal
	});
	
	var pocketu_id = new Ext.form.TextField({
		id: 'pocketu_id',
		name: 'pocketu_id',
		fieldLabel: S('pocketU_id_field'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_BUFF_POCKETU_ID,
			minlength: MIN_BUFF_POCKETU_ID
		},
		minLength: 3,
		allowBlank: false,
		hideMode : hideModeVal
	});

	var pocketu_password = new Ext.form.TextField({
		id: 'pocketu_password',
		name: 'pocketu_password',
		fieldLabel: S('pocketU_password_field'),
		width: 200,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off",
			maxlength: MAX_BUFF_POCKETU_PASSWORD,
			minlength: MIN_BUFF_POCKETU_PASSWORD
		},
		minLength: 3,
		allowBlank: false,
		hideMode : hideModeVal,
		inputType : 'password',
		hidden : isHide,
		hideLabel: isHide
	});

	var hn_subscriptionBtn = new Ext.Button({
		id: 'hn_subscriptionBtn',
		name:'hn_subscriptionBtn',
		text: S('btn_pocketU_subscription'),
		listeners: {
			click: function() {
				window.open(S('pocketU_subscription_address'), null);
			}
		}
	});

	var hn_subscriptionBtn2 = new Ext.Button({
		id: 'hn_subscriptionBtn2',
		name:'hn_subscriptionBtn2',
		text: S('btn_pocketU_protocol'),
		listeners: {
			click: function() {
				window.open(S('pocketU_subscription_address'), null);
			}
		}
	});

	var hn_modify_settings = new Ext.Button({
		id: 'hn_modify_settings',
		name:'hn_modify_settings',
		text: S('btn_save'),
		listeners: {
			click: function() {
				pocketUValidateSession();

				var pocketu_id = Ext.getCmp('pocketu_id');
				var pocketu_password = Ext.getCmp('pocketu_password');

				if (pocketu_id.getValue() == '') {
					Ext.MessageBox.alert(S('error_box_title'), S('pocketU_id_password_alert'));
					return;
				}
				pocketU_saveBtnHandler(pocketuForm);
			}
		}
	});

	var hn_pocketU_setting_initialize = new Ext.Button({
		id: 'hn_pocketU_setting_initialize',
		name: 'hn_pocketU_setting_initialize',
		text: S('btn_pocketU_setting_initialize'),
		listeners: {
			click: function() {
				pocketUValidateSession();
				Ext.Msg.confirm(S('btn_pocketU_setting_initialize'),
					S('btn_pocketU_setting_initialize_msg'),
					function(btn,text){
						if(btn == 'yes'){
							var pocketu_off = Ext.getCmp('pocketU_off');
							var pocketu_id = Ext.getCmp('pocketu_id');
							var pocketu_password = Ext.getCmp('pocketu_password');
							
							pocketu_off.setValue(true);
							pocketu_id.setRawValue('');
							pocketu_password.setRawValue('');
							
							pocketU_saveBtnHandler(pocketuForm);
						}
					});
			}
		}
	});

	hn_pocketU_edit_back = new Ext.Button({
		id: 'hn_pocketU_edit_back',
		name: 'hn_pocketU_edit_back',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				pocketUDisplayMode(pocketuForm);
			}
		}
	});

	var jReader = new Ext.data.JsonReader({
		root: 'data'
		}, [
		{name: 'pocketu_service'},
		{name: 'pocketu_id'},
		{name: 'poketu_passowrd'}
	]);

	var jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var pocketuForm = new Ext.FormPanel({
		id: ID_POCKETU_FORM,
		cls: 'panel-custBorders',
		itemCls: (pocketUjsonData.pocketu_status == 'configured') ? 'display-label' : '',
		title: S('pocketU_sercive_field'),
		reader: jReader,
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [],
		titleCollapse: true,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('pocketU_sercive_field') + ":"
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [pocketU_on]
			}, {
				layout: 'form',
				columnWidth: .368,
				items: [pocketU_off]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			id: 'docomo_text1',
			name: 'docomo_text1',
			cls : 'column-custBorders',
			items: [{
				cls: 'pocketu',
				columnWidth: 1.0,
				html: docomoHtml1
			}],
			hidden : isHide,
			hideLabel: isHide
		},{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				items: [hn_subscriptionBtn]
			}, {
				cls: 'pocketu',
				html: S('pocketU_move_to_docomo')
			}],
			hidden : isHide,
			hideLabel: isHide
		},
		{
			autoWidth: true,
			layout: 'column',
			id: 'docomo_text2',
			name: 'docomo_text2',
			cls : 'column-custBorders',
			items: [{
				cls: 'pocketu',
				columnWidth: 1.0,
				html: docomoHtml2
			}],
			hidden : isHide,
			hideLabel: isHide
		},
		pocketu_id, 
		pocketu_password,
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [ {
				layout: 'form',
				columnWidth: .1,
				items: [hn_modify_settings]
			}, {
				layout: 'form',
				columnWidth: .9,
				items: [hn_pocketU_edit_back]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			id: 'docomo_text3',
			name: 'docomo_text3',
			cls : 'column-custBorders',
			items: [{
				cls: 'pocketu',
				columnWidth: 1.0,
				html: docomoHtml3
			}]
		},
		hn_pocketU_setting_initialize,
		{
			autoWidth: true,
			layout: 'column',
			id: 'docomo_text4',
			name: 'docomo_text4',
			cls : 'column-custBorders',
			items: [{
				cls: 'pocketu',
				columnWidth: 1.0,
				html: docomoHtml4
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			id: 'docomo_text5',
			name: 'docomo_text5',
			cls : 'column-custBorders',
			items: [{
				cls: 'pocketu',
				columnWidth: 1.0,
				html: docomoHtml5
			}],
			hidden : !isHide,
			hideLabel: !isHide
		},
		{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				layout: 'form',
				items: [hn_subscriptionBtn2]
			}, {
				cls: 'pocketu',
				html: S('pocketU_move_to_docomo')
			}],
			hidden : !isHide,
			hideLabel: !isHide
		}
		]
	});

	return pocketuForm;
}

function pocketU_saveBtnHandler(hnForm) {
	var pocketU_on = Ext.getCmp('pocketU_on');
	var pocketu_id = Ext.getCmp('pocketu_id');
	var pocketu_password = Ext.getCmp('pocketu_password');

	var pocketu_serviceValue;
	var pocketu_idValue;
	var pocketu_passwordValue;

	if (pocketU_on) {
		pocketu_serviceValue = pocketU_on.checked ? 'on' : 'off';
	}
	else {
		pocketu_service = Ext.getCmp('pocketu_service');
		if (pocketu_service.getValue == S('enabled')) {
			pocketu_serviceValue = 'on';
		}
		else {
			pocketu_serviceValue = 'off';
		}
	}

	if (pocketu_id) {
		pocketu_idValue = pocketu_id.getValue();
	}
	else {
		pocketu_idValue = '';
	}

	if (pocketu_password) {
		pocketu_passwordValue = pocketu_password.getValue();
	}
	else {
		pocketu_passwordValue = '';
	}

	var waitMessage = pocketu_serviceValue == 'on' ? S('pocketU_wait_msg') : S('msg_saving_data');
	Ext.MessageBox.wait(waitMessage);

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_POCKETU,
			pocketu_id:pocketu_idValue,
			pocketu_password:pocketu_passwordValue,
			pocketu_service:pocketu_serviceValue
		},
		failure: function() {
			formFailureFunction();
		},
		success: function(result) {
			Ext.MessageBox.hide();
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				hnForm.load({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_GET_POCKETU
					},
					waitMsg: S('msg_loading_data'),
					failure: function(form, action) {
						formFailureFunction();
					},
					success: function(form, action) {
						resetCookie();
						resp = Ext.decode(action.response.responseText);
						pocketUjsonData = resp.data[0];
						
						pocketUDisplayMode(hnForm);
						//pocketUEditBtnHandler(form);
					}
				})
			}
			else {
				var error = response.errors;
				Ext.MessageBox.alert(S('error_box_title'),S(error[0]));
				if(error[0] == 'pocketU_error_id_password'){
					pocketu_id.setRawValue('');
					pocketu_password.setRawValue('');
				}
				if (error[0] == 'pocketU_machine_infomation_remove') {
					createPocketUSettings();
				}
			}
		}
	});
}

function pocketUEditBtnHandler(hform_display) {
	pocketUValidateSession();
	hform_display.destroy();

	hform_edit = createPocketUFormEditMode();//display priority is button value
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_edit, ID_POCKETU_FORM);
	hform_edit.form.setValues(pocketUjsonData);
	radioSelection_pocketu(pocketUjsonData);
	hform_edit.expand(true);
}

function pocketUDisplayMode(hform_edit) {
	pocketUValidateSession();
	hform_edit.destroy();
	hform_display = createPocketUFormDisplayMode();  // display priority is json value
	insertToCentralContainer(SYSTEM_RENDER_TO, hform_display, ID_POCKETU_FORM);
	hform_display.form.setValues(pocketUjsonData);
	formatDisplayPocketU(pocketUjsonData);
	hform_display.expand(true);
}

function pocketU_subscriptionBtnHandler() {
	window.open(S('pocketU_subscription_address'));
}

function radioSelection_pocketu(data) {
	var selectedMethod = data.pocketu_service;
		
	if (pocketUjsonData.pocketu_vpn_connection == 'on') {
		var pocketU_on = Ext.getCmp('pocketU_on');
		pocketU_on.setValue(true);
		radioSelection_pocketU_on();
	}
	else {
		var pocketU_off = Ext.getCmp('pocketU_off');
		pocketU_off.setValue(true);
		radioSelection_pocketU_off();
	}

	if (pocketUjsonData.pocketu_status != 'configured') {
		var initBtn = Ext.getCmp('hn_pocketU_setting_initialize');
		initBtn.disable();
	}
}

function radioSelection_pocketU_on(checked) {
	var pocketU_on = Ext.getCmp('pocketU_on');
	var pocketU_off = Ext.getCmp('pocketU_off');
	var pocketu_id = Ext.getCmp('pocketu_id');
	var pocketu_password = Ext.getCmp('pocketu_password');

	pocketU_on.checked = true;

	pocketu_id.enable();
	pocketu_password.enable();

	var hn_modify_settings = Ext.getCmp('hn_modify_settings');
	hn_modify_settings.enable();
}

function radioSelection_pocketU_off(checked) {
	var pocketU_on = Ext.getCmp('pocketU_on');
	var pocketU_off = Ext.getCmp('pocketU_off');
	var pocketu_id = Ext.getCmp('pocketu_id');
	var pocketu_password = Ext.getCmp('pocketu_password');

	pocketU_off.checked = true;

	pocketu_id.clearInvalid();
	pocketu_password.clearInvalid();

	
	if (pocketUjsonData.pocketu_status != 'configured') {
		pocketu_id.disable();
	}
	pocketu_password.disable();
	
	if (pocketUjsonData.pocketu_id == '') {
		var hn_modify_settings = Ext.getCmp('hn_modify_settings');
		hn_modify_settings.disable();
	}
}

function formatDisplayPocketU(data){
	var selectedMethod = data.pocketu_service;
	var id = data.pocketu_id;
	var password = data.pocketu_password;
	
	var pocketu_service = Ext.getCmp('pocketu_service');
	var pocketu_id = Ext.getCmp('pocketu_id');

	var servicewebBtn = Ext.getCmp('hn_editBtn');
	var subscriptionBtn = Ext.getCmp('hn_subscriptionBtn');
	subscriptionBtn.enable();

	var vpn_connection = Ext.getCmp('pocketu_vpn_connection');

	if(id){
		pocketu_id.setValue(id);
	}
	else {
		pocketu_id.setValue('-');
	}

	if (pocketUjsonData.pocketu_status == 'configured') {
		pocketu_service.setValue(S('pocketU_regist_ok'));
	}
	else{
		pocketu_service.setValue(S('disable'));
	}

	if (data.pocketu_vpn_connection == 'on') {
		vpn_connection.setValue(S('pocketU_vpn_connect'));
	}
	else {
		vpn_connection.setValue(S('pocketU_vpn_disconnect'));
	}

	if (pocketUjsonData.pocketu_status != 'configured') {
		var initBtn = Ext.getCmp('hn_pocketU_setting_initialize');
		initBtn.disable();
	}
}

function createPocketUFolderFormDisplayMode() {
	var cm = new Ext.grid.ColumnModel([
		{
			id: "shareName",
			header: S('sh_gridCol_name'),
			dataIndex: "shareName",
			direction: "ASC",
			renderer: pocketuFolders_renderTopic,
			width: 150
		}, {
			header: S('sh_gridCol_volume'),
			dataIndex: 'volume',
			width: 100,
			renderer: pocketU_renderVolume
		}, {
			header: S('pocketU_folder_field'),
			dataIndex: 'pocketU_perm',
			renderer: pocketuFolders_renderService,
			width: 350
		}
	]);

	cm.defaultSortable = true;

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
			{name: 'pocketU_perm'}
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
		frame: true
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

	return shForm;
}

function pocketuFolders_renderTopic(value, cell, record) {
	var pocketU_perm = record.get('pocketU_perm');
	if (pocketU_perm == 'unavailable') {
		return String.format("<img src='_img/folder.gif' /> {0}", value);
	}

	return String.format("<img src='_img/folder.gif' /> <b><a href='#' onClick='pocketU_editSharedFolder(\"{0}\", \"{1}\");'>{0}</a></b>", value, pocketU_perm);
}

function pocketU_editSharedFolder(id, pocketU_perm) {
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	shFolders_display_jReaderFields
	);

	var form = pocketU_createForm(id, 'editMode', jReader, pocketU_perm);

//	update_header(true, 'sh_fold_header', id);
	update_header(true, 'pocketU_folder_field', id);

	// ....: Render form to html container :....
	updateCentralContainer(SHARED_FOLDER_RENDER_TO, form);
	pocketU_loadForm(form,id);
}

function pocketU_createForm(id, mode, jReader, pocketU_perm) {
	var volume;
	var jReader;
	var jErrReader;

	var shareName = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderName'),
		id: 'shareName',
		name: 'shareName',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var shareDesc = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderDesc'),
		id: 'shareDesc',
		name: 'shareDesc',
		width: 250,
		allowBlank: true,
		readOnly: true,
		itemCls: 'display-label'
	});

	var POCKETU_FOLDER_PERMISSON_LIST = [
		['off', S('pocketU_folder_off')],
		['anony', S('pocketU_folder_anony')]
	];
	
	var pocketU_permStore = new Ext.data.SimpleStore({
		fields: ['val', 'opt'],
		data: POCKETU_FOLDER_PERMISSON_LIST
	})

	// ....: Create form ITEMS :....
	var pocketU_perm = new Ext.form.ComboBox({
		id: 'pocketU_perm_combo',
		name: 'pocketU_perm',
		hiddenName:'pocketU_perm',
		fieldLabel: S('pocketU_folder_field'),
		store: pocketU_permStore,
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
			pocketU_perm
		]
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_8', id);
				pocketU_folder_saveBtnHandler(sharedFoldersForm);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		id: 'pocketU_folder_edit_cancel_button',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				update_header(false, 'header_5_8', id);
				createPocketUSettings();
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

function pocketU_folder_saveBtnHandler(sharedFoldersForm){
	sharedFoldersForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_POCKETU_FOLDER
		},
		waitMsg: S('msg_saving_data'),
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(form, action) {
			resetCookie();
			createPocketUSettings();
		}
	});
}

function pocketU_loadForm(form,shareName){
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

function pocketU_renderVolume(value) {
	return S(value);
}

function pocketuFolders_renderService(value){
	if( value == 'off') {
		return S('pocketU_folder_off');
	}
	else if (value == 'anony') {
		return S('pocketU_folder_anony');
	}
	else if (value == 'unavailable') {
		return S('pocketU_folder_unavailable');
	}
}
