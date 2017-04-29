var jobs_password_jsonData;
var add_replication;

function system_jobs_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result){
			remove_useless_mask();

			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				create_backup_main();
			}
			else {
				failureFunction(response);
			}
		}
	});
}

function create_backup_main() { 
	var devListLink = S('disk_backup_devListLink');
	updateHtmlToContainer(JOBS_RENDER_TO, '<a href="#" onClick="createDeviceList();">' + devListLink + '</a><br>');

	var jobsPasswordForm = create_jobs_password_form_display_mode();
	addToCentralContainer(JOBS_RENDER_TO, jobsPasswordForm);

	var jobsForm = jobs_createStatusGrid();
	addToCentralContainer(JOBS_RENDER_TO, jobsForm);

	if (add_repli) {
		var replication_display = replication_mainForm();
		addToCentralContainer(JOBS_RENDER_TO, replication_display);
		replication_loadGrid();
	}

	jobsPasswordForm.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_BACKUP_PASSWORD
		},
		waitMsg: S('msg_loading_data'),
		failure: function(form,action) {
			formFailureFunction(action);
		},
		success: function(form,action) {
			resetCookie();
			resp = Ext.decode(action.response.responseText);
			jobs_password_jsonData = resp.data[0];
		}
	});
}
