var render_raid_array_before;
var render_raid_scan_before;

function system_disk_processAuth(){
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
				resetCookie(response);
				// Render at the end of the page
				render_raid_scan_before = '';
				// render before raid scan
				render_raid_array_before = ID_FORM_RAID_SCAN;
				createSystemDisk();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createSystemDisk(){
	var diskForm = disk_createStatusGrid();
	updateCentralContainer(DISKS_RENDER_TO, diskForm);
	var diskGrid = Ext.getCmp(ID_CHECK_DISK_GRID);
	var disk_json_store = diskGrid.getStore();
	var sm = diskGrid.getSelectionModel();

	// get the disks list
	disk_json_store.load({
		callback: function(r) {
			if (!add_raid) {
				var MaskElems = Ext.DomQuery.select('.ext-el-mask');
				Ext.get(MaskElems).hide();
			}

			var result = disk_json_store.reader.jsonData.success;
			if (result) {
				sm.selectFirstRow(); // of disk grid
				if (add_iscsi && (workingmode == 'iSCSI')) {
					var re = new RegExp("(^disk*|^array*)");
					disk_json_store.filter('disk', re);
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	// call the array grid after the disk grid is loaded
	if (add_raid) {
		var arrayForm = disk_array_display();
		addToCentralContainer(DISKS_RENDER_TO, arrayForm);

		var arrayMaintForm = disk_array_maintenance_display();
		addToCentralContainer(DISKS_RENDER_TO, arrayMaintForm);

		arrayMaintForm.load({
			url: '/dynamic.pl',
			params: {
				bufaction: BUFACT_GET_ARRAY_MAINT
			},
			waitMsg: S('msg_loading_data'),
			failure: function(form, action) {
				formFailureFunction(action);
			},
			success: function(form, action) {
				resetCookie();
				resp = Ext.decode(action.response.responseText);
				array_maint_jsonData = resp.data[0];
				maint_format_response_displayMode(array_maint_jsonData);
			}
		});
	}
}
