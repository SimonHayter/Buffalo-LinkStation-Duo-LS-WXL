var email_jsonData;
var emailListStore;
var lcd_jsonData;
var led_jsonData;

var render_email_form_before;
var render_alert_form_before;
var render_frontPanel_form_before;
var render_syslog_before;

var alertSound_jsonData;
var syslog_jsonData;

function system_maint_processAuth(formToExpand) {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);

				// decide position of email notification
				if (add_syslog) {
					render_email_form_before = ID_SYSLOG_FORM;
				}
				else if (add_alertSound) {
					render_email_form_before = ID_ALERT_SOUND_FORM;
				}
				else if (add_frontPanel) {
					render_email_form_before = ID_FRONT_PANEL_FORM;
				}
				else {
					if (add_reboot) {
						render_email_form_before = ID_REBOOT_FORM;
					}
					else {
						render_email_form_before = ID_FIRMWARE_NOTIFICATION;
					}
				}

				// decide position of syslog form
				if (add_syslog && add_alertSound) {
					render_syslog_before = ID_ALERT_SOUND_FORM;
				}
				else if (add_syslog && !add_alertSound && add_frontPanel) {
					render_syslog_before = ID_FRONT_PANEL_FORM;
				}
				else {
					if (add_reboot) {
						render_syslog_before = ID_REBOOT_FORM;
					}
					else {
						render_syslog_before = ID_FIRMWARE_NOTIFICATION;
					}
				}

				// decide position of front panel form
				if (add_alertSound && add_frontPanel) {
					render_alert_form_before = ID_FRONT_PANEL_FORM;
					if (add_reboot) {
						render_frontPanel_form_before = ID_REBOOT_FORM;
					}
					else{
						render_frontPanel_form_before = ID_FIRMWARE_NOTIFICATION;
					}
				}
				else if (add_alertSound && !add_frontPanel) {
					if (add_reboot) {
						render_alert_form_before = ID_REBOOT_FORM;
					}
					else {
						render_alert_form_before = ID_FIRMWARE_NOTIFICATION;
					}
				}
				else if (!add_alertSound && add_frontPanel) {
					if (add_reboot) {
						render_alert_form_before = ID_REBOOT_FORM;
					}
					else {
						render_alert_form_before = ID_FIRMWARE_NOTIFICATION;
					}
				}

				fwNotificationRenderBefore = ID_FIRMWARE_UPDATE;
				fwUpdateRenderBefore ='' // last form rendered
				createSystemMaintenance(formToExpand);

				Ext.getCmp(formToExpand).expand(false); // expand form without animating
			}
			else  {
				formFailureFunction();
			}
		}
	});
}

function createSystemMaintenance(formToExpand) {
	//--------------- create & display forms ----------------------------------------
	// << Email Notification >>
	emailNotif_form = create_emailNotifForm_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, emailNotif_form);

	emailNotif_form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_EMAIL_SETTINGS
		},
		waitMsg: S('msg_loading_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			email_jsonData = resp.data[0];
			emailNotif_fieldValuesHandler(emailNotif_form, email_jsonData);
			emailNotif_form.expand(false);
			if (formToExpand != ID_FIRMWARE_UPDATE) {
				emailNotif_form.expand(false);
			}
			if (formToExpand == ID_SHUTDOWN_FORM) {
				emailNotif_form.collapse();
			}
		}
	});

	// << Syslog >>
	if (add_syslog) {
		syslog_form = create_syslog_display_mode();
		addToCentralContainer(SYSTEM_RENDER_TO, syslog_form);

		syslog_form.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACTION_GET_SYSLOG
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				syslog_jsonData = resp.data[0];
				syslogTrasfer_formatDisplay(syslog_jsonData);
			}
		});
	}

	// << Alert Sound >>
	if (add_alertSound) {
		alertSound_form = create_alertSound_display_mode();
		addToCentralContainer(SYSTEM_RENDER_TO, alertSound_form);

		alertSound_form.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACTION_GET_ALERT_SOUND
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				alertSound_jsonData = resp.data[0];
				alertSound_fieldValuesHandler(alertSound_form, alertSound_jsonData);
			}
		});
	}

	// << Front Panel >>
	if (add_frontPanel) {
		var front_panel_display = create_frontPanel_display_mode();
		addToCentralContainer(SYSTEM_RENDER_TO, front_panel_display);

		lcdDisplayForm = Ext.getCmp('lcd_display');
		ledDisplayForm = Ext.getCmp('led_display');

		lcdDisplayForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACTION_GET_LCD
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				lcd_jsonData = resp.data[0];
				lcd_fieldValuesHandler_display(lcd_jsonData);
			}
		});
		ledDisplayForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACTION_GET_LED
			},
			waitMsg: S('msg_loading_data'),
			failure: function (form, action) {
				formFailureFunction(action);
			},
			success: function (form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				led_jsonData = resp.data[0];
				led_fieldValuesHandler_display(led_jsonData);
			}
		});
	}

	// if TS = iscsi, see reboot and shutdown under power management.
	if (!add_iscsi) {
		// << Reboot >>
		if (add_reboot) {
			reboot_form = create_reboot_display_mode();
			addToCentralContainer(SYSTEM_RENDER_TO, reboot_form);
		}
		// << Shutdown >>
		if (add_shutdown) {
			shutdown_form = create_shutdown_display_mode();
			addToCentralContainer(SYSTEM_RENDER_TO, shutdown_form);
		}
	}

	if (add_fwupdate) {
/*		var firmware_notification = create_firmware_notification_display_mode();
		addToCentralContainer(SYSTEM_RENDER_TO, firmware_notification);

		firmware_notification.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACTION_GET_UPDATES
			},
			waitMsg: S('msg_loading_data'),
			failure: function(form,action) {
				formFailureFunction(action);
			},
			success: function(form,action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				fw_notif_jsonData = resp.data[0];
			}
		});
*/
		var firmware_update = fwUpdate_create_form();
		addToCentralContainer(SYSTEM_RENDER_TO, firmware_update);

		fwUpdate_check();
	}
}
