var bittorrent_jsonData;

function extensions_bittorrent_processAuth() {
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
				createBittorrentSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createBittorrentSettings() {
	bittorrentForm = create_bittorrent_form_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, bittorrentForm);

	bittorrentForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_BITTORRENT
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			bittorrent_jsonData = resp.data[0];
			bittorrent_format_display(bittorrent_jsonData);
		}
	});
}
