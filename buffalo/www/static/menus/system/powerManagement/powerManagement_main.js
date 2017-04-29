var ups_jsonData;

var sleeptimer_jsonData;
var hddSpindown_jsonData;
var render_ups_form_before;
var sleeptimer_renderBefore;
var hddRenderBefore;

function system_powerManagement_processAuth(formToFocus) {
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
				createUpsSettings(false, formToFocus);
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createUpsSettings(update, formToFocus) {
	// since the UPS form depends on the reponse to either hide or show some elements, an ajax request will be done instead of the form load.
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_UPS_SETTINGS
		},
		method: 'POST',
		success: function (result) {
			var MaskElems = Ext.DomQuery.select('.ext-el-mask');
			Ext.get(MaskElems).hide();

			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				var ups_form;
				ups_jsonData = response.data[0];
				var syncUpsMode = ups_jsonData.syncUps;
				var connectType = ups_jsonData.connectType;
				var upsStatus = ups_jsonData.upsStatus;
				var ups_form;

//				if (add_upsSerial && (upsStatus != 'ups_status1') && (upsStatus != 'ups_status2') && (upsStatus != 'ups_status3')){
				if ((add_upsSerial && ((connectType == 'ups_connectType3') || (connectType == 'ups_connectType3s') || (connectType == 'ups_connectType4') || (connectType == '')))) {
					serial = true;
				}
				else {
					serial = false;
				}

				if (max_usbdisk_num != 0) {
					ups_form = create_upsForm_displayMode(serial, syncUpsMode, ups_jsonData);
	
					if (update) {
						insertToCentralContainer(SYSTEM_RENDER_TO, ups_form, render_ups_form_before);
					}
					else {
						updateCentralContainer(SYSTEM_RENDER_TO, ups_form);
					}
					ups_fieldValuesHandler_displayMode(ups_form, ups_jsonData);
}

				if (add_sleepTimer && !update) {
					render_ups_form_before = ID_SLEEPTIMER_FORM;
					sleeptimerForm = create_sleeptimer_form_display_mode();

					if (max_usbdisk_num != 0) {
						addToCentralContainer(SYSTEM_RENDER_TO, sleeptimerForm);
					}
					else {
						updateCentralContainer(SYSTEM_RENDER_TO, sleeptimerForm);
					}

					sleeptimerForm.load({
						url: '/dynamic.pl',
						params: {
							bufaction: BUFACT_GET_SLEEPTIMER
						},
						waitMsg: S('msg_loading_data'),
						failure: function (form, action) {
							formFailureFunction(action);
						},
						success: function (form, action) {
							resetCookie();
							resp = Ext.decode(action.response.responseText);
							sleeptimer_jsonData = resp.data[0];
							sleeptimer_formatData_display(sleeptimer_jsonData);
						}
					});
				}

				if (add_hddSpindown && !update) {
					sleeptimer_renderBefore = ID_HDDSPINDOWN_FORM
					hddSpindown = create_hddSpindown_form_display_mode();
					addToCentralContainer(SYSTEM_RENDER_TO, hddSpindown);
					hddSpindown.load({
						url: '/dynamic.pl',
						params: {
							bufaction: BUFACT_GET_HDD
						},
						waitMsg: S('msg_loading_data'),
						failure: function (form, action) {
							formFailureFunction(action);
						},
						success: function (form, action) {
							resetCookie();
							resp = Ext.decode(action.response.responseText);
							hddSpindown_jsonData = resp.data[0];
							hddSpindown.form.setValues(hddSpindown_jsonData);
							hddSpindown_display(hddSpindown_jsonData);
						}
					});
				}
				if (add_iscsi && !update) {
					render_ups_form_before = ID_REBOOT_FORM;
					// reboot
					if (add_reboot) {
						reboot_form = create_reboot_display_mode();
						addToCentralContainer(SYSTEM_RENDER_TO, reboot_form);
					}
					// shutdown
					if (add_shutdown) {
						shutdown_form = create_shutdown_display_mode();
						addToCentralContainer(SYSTEM_RENDER_TO, shutdown_form);
					}

				}

				if (max_usbdisk_num != 0) {
					if (formToFocus == 'restart') {
						reboot_form.expand(false);
					}
					else {
						ups_form.expand(false);
					}
				}
				else {
					sleeptimerForm.expand(true);
				}
			}
			else {
				failureFunction(response);
			}
		}
	});
}
