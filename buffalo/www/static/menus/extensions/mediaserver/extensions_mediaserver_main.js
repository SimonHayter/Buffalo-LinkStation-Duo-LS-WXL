var mediaserver_dlna_jsonData;
var mediaserver_itunes_jsonData;
var mediaserver_squeezebox_jsonData;

function extensions_mediaserver_processAuth() {
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
				createMediaserverSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createMediaserverSettings() {
	Ext.MessageBox.wait(S('msg_loading_data'));
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DLNA_SETTINGS
		},
		method: 'POST',
		success: function(result) {
			var success = response.success;
			if (success) {
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();

				if(add_dlna) {
					rawData = result.responseText;
					resp = Ext.decode(rawData);
					mediaserver_dlna_jsonData = resp.data[0];

					mediaserver_dlnaForm = create_mediaserver_dlna_form_display_mode(mediaserver_dlna_jsonData);
					updateCentralContainer(SYSTEM_RENDER_TO, mediaserver_dlnaForm);
					mediaserver_dlna_format_display(mediaserver_dlna_jsonData);

					var clientList = S('mediaserver_client_link');
					addHtmlToContainer(SYSTEM_RENDER_TO, '<a href="#" id="mediaServer_clients_list" onClick="createMediaserverClientsList();">' + clientList + '</a><br />');

					if (mediaserver_dlna_jsonData.dtcp_stat == 'fail') {
						create_popup_window_dtcp();

						var dtcpHelp = S('mediaserver_dtcp_help_link');
						addHtmlToContainer(SYSTEM_RENDER_TO, '<a href="#" onClick=\'getHelp("dtcp_ip");\'>' + dtcpHelp + '</a><br />');
					}
				}

				if (add_itunes) {
					mediaserver_itunesForm = create_mediaserver_itunes_form_display_mode(mediaserver_itunes_jsonData);
					if(add_dlna) {
						addToCentralContainer(SYSTEM_RENDER_TO, mediaserver_itunesForm);
					}
					else {
						updateCentralContainer(SYSTEM_RENDER_TO, mediaserver_itunesForm);
					}

					mediaserver_itunesForm.load({
						url: '/dynamic.pl',
						params: {
							bufaction: BUFACT_GET_ITUNES_SETTINGS
						},
						waitMsg: S('msg_loading_data'),
						failure: function(form,action) {
							formFailureFunction(action);
						},
						success: function(form,action) {
							resetCookie();
							resp = Ext.decode(action.response.responseText);
							mediaserver_itunes_jsonData = resp.data[0];
							mediaserver_itunes_format_display(mediaserver_itunes_jsonData);
						}
					});
				}

				if (add_squeezebox) {
					mediaserver_squeezeboxForm = create_mediaserver_squeezebox_form_display_mode(mediaserver_squeezebox_jsonData);
					if(add_dlna || add_itunes) {
						addToCentralContainer(SYSTEM_RENDER_TO, mediaserver_squeezeboxForm);
					}
					else {
						updateCentralContainer(SYSTEM_RENDER_TO, mediaserver_squeezeboxForm);
					}

					mediaserver_squeezeboxForm.load({
						url: '/dynamic.pl',
						params: {
							bufaction: BUFACT_GET_SQUEEZEBOX_SETTINGS
						},
						waitMsg: S('msg_loading_data'),
						failure: function(form,action) {
							formFailureFunction(action);
						},
						success: function(form,action) {
							resetCookie();
							resp = Ext.decode(action.response.responseText);
							mediaserver_squeezebox_jsonData = resp.data[0];
							mediaserver_squeezebox_format_display(mediaserver_squeezebox_jsonData);
						}
					});
				}
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function create_popup_window_dtcp() {
	var windowTitle = S('warning_box_title');
	var msg = S('mediaserver_dtcp_warn_msg');

	var dtcpWarningWin = new Ext.Window({
		html: '<div id="' + DIV_MEMBER + '" class="x-hidden"></div>',
		id: ID_SH_FOLD_MEMBER_POPUP_WIN,
		modal: true,
		width: 530,
		title: windowTitle,
		plain: true,
		draggable: false,
		resizable: false,
		items: {
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + msg + '</p><br>'
		},
		handler: function () {
			Ext.Msg.show({
				title: '',
				msg: S('shFold_add_records_warning'),
				buttons: Ext.Msg.OK,
				fn: function (btn) {
					if (btn == 'ok') {
						shFolders_submitPopupHandler(addMemberWin, frontGridId, type);
						Ext.Msg.show({
							title: '',
							msg: S('shFold_add_records_done'),
							buttons: Ext.Msg.OK,
							icon: Ext.MessageBox.INFO
						});
					}
				},
				icon: Ext.MessageBox.INFO
			});
		},
		buttons: [{
			text: S('btn_close'),
			handler: function () {
				dtcpWarningWin.close();
				remove_useless_mask();
			}
		}]
	});

	dtcpWarningWin.show();
}
