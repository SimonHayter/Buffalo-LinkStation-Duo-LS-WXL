function iscsiVolumes_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			
			var success = response.success;
			if (success) {
				createVolumes();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createVolumes(){
	// call the volumes grid after the array grid is loaded
	var volumesForm = disk_create_iscsivolumes_display();
	updateCentralContainer(VOLUMES_RENDER_TO, volumesForm);
}
