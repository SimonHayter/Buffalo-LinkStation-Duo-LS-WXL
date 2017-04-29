function create_shutdown_display_mode() {
	var sh_formatBtn = new Ext.Button({
		id: 'sh_formatBtn',
		name: 'sh_formatBtn',
		text: S('system_shutdown_button'),
		listeners: {
			click: function () {
				shutdownBtnHandler(sh_form_title);
			}
		}
	});

	var warning = S('system_shutdown_warning');

	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	}, [{
		name: 'id'
	}, {
		name: 'msg'
	}]);

	var sh_form_title = new Ext.FormPanel({
		id: ID_SHUTDOWN_FORM,
		animCollapse: false,
		cls: 'panel-custBorders',
		title: S('system_shutdown_form_title'),
		errorReader: jErrReader,
		autoHeight: true,
		collapsible: true,
		collapsed: true,
		labelWidth: 160,
		width: 640,
		buttonAlign: 'left',
		buttons: [sh_formatBtn],
		items: [{
			xtype: 'label',
			html: '<p class="label">' + warning + '</p><br>'
		}],
		titleCollapse: true
	});

	return sh_form_title;
}

function shutdownBtnHandler(sh_form_title) {
	msg = S('system_shutdown_warning_popup');
	emptyList = true;
	buttons = Ext.MessageBox.OKCANCEL;
	title = S('warning');
	icon = Ext.MessageBox.QUESTION;

	Ext.MessageBox.show({
		title: title,
		msg: msg,
		buttons: buttons,
		icon: icon,
		fn: function (btn) {
			if (emptyList && btn == 'ok') {
				sh_form_title.form.submit({
					url: '/dynamic.pl',
					params: {
						bufaction: BUFACT_REBOOT,
						action: ACTION_SHUTDOWN
					},
					//params: {bufaction: BUFACT_REBOOT }, 
					failure: function (form, action) {
						formFailureFunction(action);
					},
					success: function (form, action) {
						var title = S('system_shutdown_shutting_down');
						var titleFormatted = '<p class="title"><img src="' + WARNING_IMG + '" /> &nbsp ' + title + '</p><br>';
						var msg = S('system_shutdown_shutting_down_msg');
						var msgFormatted = '<p class="msg">' + msg + '</p>'
						updateHtmlToContainer(SYSTEM_RENDER_TO, titleFormatted);
						addHtmlToContainer(SYSTEM_RENDER_TO, msgFormatted);
						if (add_iscsi) {
							show_menus_submenus_disabled_iscsi();
						}
						else {
							show_menus_submenus_disabled();
						}
						highlight_sub_menu(selected_sub_menu);
						highlight_menu(selected_menu);
					}
				});
			}
		}
	});
};

function shutdown_check_iscsi() {
	if (add_iscsi && IS_ISCSI_RUNNING) {
		Ext.getCmp('sh_formatBtn').disable();
	}
}
