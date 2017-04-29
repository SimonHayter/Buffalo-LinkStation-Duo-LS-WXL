function createDeviceList() {
	var refreshBtn = new Ext.Button({
		name: 'RefreshBtn',
		iconCls: 'refresh',
		text: S('btn_refresh'),
		handler: function () {
			topGrid = Ext.getCmp('grid1');
			jsonStore1 = topGrid.getStore();
			jsonStore1.reload();
		}
	});

	var cm1 = new Ext.grid.ColumnModel([{
		header: S('disk_backup_devList_gridCol_name'),
		width: 180,
		dataIndex: 'name',
		sortable: true
	}, {
		header: S('disk_backup_devList_gridCol_ip'),
		width: 150,
		dataIndex: 'ipAddr',
		sortable: true
	}]);

	var jsonStore1 = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_LOCAL_LIST
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'name'
		},
		{
			name: 'ipAddr'
		}]
	});

	var grid1 = new Ext.grid.GridPanel({
		id: 'grid1',
		title: S('disk_backup_devList_localgrid_title'),
		store: jsonStore1,
		cm: cm1,
		width: 430,
		height: 150,
		loadMask: {
			msg: S("msg_loading_data")
		},
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: [refreshBtn]
	});

	var ipAddr = new Ext.form.TextField({
		id: 'ipAddr',
		hideLabel: false,
		emptyText: S('disk_backup_devList_new_ip'),
		name: 'ipAddr',
		width: 100
	});

	var addBtn = new Ext.Button({
		text: S('btn_add'),
		iconCls: 'add',
		handler: function () {
			devList_addBtnHandler(ipAddr, addBtn);
		}
	});

	var delBtn = new Ext.Button({
		text: S('btn_delete'),
		iconCls: 'delete',
		disabled: true,
		handler: function () {
			var emptyList = false;
			var devGrid;
			var selModel;
			var selectedRecords;
			var ipList;
			var msg;
			var buttons;
			var title;
			var icon;

			// get data from grid2
			devGrid = Ext.getCmp('grid2');
			selModel = devGrid.getSelectionModel();
			selectedRecords = selModel.getSelections(); // returns an array of selected records

			// convert data array into a json string
			ipList = new Array();
			for (var i = 0; i < selectedRecords.length; i++) {
				ipList[i] = selectedRecords[i].data.ipAddr;
			}

			msg = S('disk_backup_devList_deleteip_warning');
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
						devList_deleteBtnHandler(ipList, sm, delBtn);
					}
				}
			});
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		listeners: {
			rowselect: function () {
				delBtn.enable();
			},
			rowdeselect: function () {
				if (sm.getCount() == 0) {
					delBtn.disable();
				}
			}
		}
	});

	var cm2 = new Ext.grid.ColumnModel([
		sm, {
			header: S('disk_backup_devList_gridCol_ip'),
			width: 390,
			dataIndex: 'ipAddr',
			sortable: true
		}
	]);

	var jsonStore2 = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_OFF_SUB_LIST
		},
		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'ipAddr'
		}]
	});

	var grid2 = new Ext.grid.GridPanel({
		id: 'grid2',
		title: S('disk_backup_devList_offsubnetgrid_title'),
		store: jsonStore2,
		cm: cm2,
		selModel: sm,
		width: 430,
		height: 150,
		loadMask: {
			msg: S("msg_loading_data")
		},
		enableHdMenu: false,
		enableColumnMove: false,
		tbar: [ipAddr, addBtn, '-', delBtn]
	});

	var closeBtn = new Ext.Button({
		name: 'closeBtn',
		text: S('btn_close'),
		handler: function () {
			popupWindow.hide();
			popupWindow.destroy();
		}
	});

	var popupWindow = new Ext.Window({
		html: '<div id="' + DIV_DEV_LIST_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_DEV_LIST_WIN,
		modal: true,
		width: 450,
		title: S('disk_backup_devList_winTitle'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [grid1, grid2],
		buttonAlign: 'left',
		buttons: [closeBtn],
		listeners: {
			beforeshow: function() {
				jsonStore1.load({
					callback: function (r, o, s) {
						var result = jsonStore1.reader.jsonData.success;
						if (!result) {
							formFailureFunction();
						}
					}
				});

				jsonStore2.load({
					callback: function (r, o, s) {
						var result = jsonStore2.reader.jsonData.success;
						if (!result) {
							formFailureFunction();
						}
					}
				});
			}
		}
	});

	popupWindow.show();
}

function devList_addBtnHandler(ipField, addBtn) {
	var ipValue = ipField.getValue();
	addBtn.disable();

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_ADD_DEV,
			ipAddr: ipValue
		},
		method: 'POST',
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (result) {
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				addBtn.enable();

				var devGrid = Ext.getCmp('grid2');
				var jsonStore = devGrid.getStore();

				var myRec = Ext.data.Record.create([{
					name: 'ipAddr'
				}]);

				var myNewRec = new myRec({
					ipAddr: ipValue
				});
				ipField.setValue('');
				jsonStore.add(myNewRec);
			}
			else {
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S(response.errors[0]);

					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function (btn) {
							if (btn == 'ok') {
								addBtn.enable();
							}
						}
					});

			}
		}
	});
}

function devList_deleteBtnHandler(ipList, sm, delBtn) {
	delBtn.disable();

	jsonData = Ext.util.JSON.encode(ipList);
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DEL_DEV,
			ipList: jsonData
		},
		method: 'POST',
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				var devGrid = Ext.getCmp('grid2');
				var jsonStore = devGrid.getStore();
				selModel = devGrid.getSelectionModel();
				selectedRecords = selModel.getSelections();

				// remove the records selected from grid 
				for (var i = 0; i < selectedRecords.length; i++)
				jsonStore.remove(selectedRecords[i]);

				if (sm.getCount() == 0) {
					delBtn.disable();
				}
			}
		}
	});
}

function jobs_renderBckpSupport(value, cell, record) {
	if (value == 'Supported') {
		return String.format('<img src=' + IMAGE_CHECK_MARK + ' />');
	}
	else {
		return String.format('<img src=' + IMAGE_CROSS + ' />');
	}
}

function jobs_renderDiskSleep(value, cell, record) {
	if (value == 'Apply') {
		return String.format('<img src=' + IMAGE_CHECK_MARK + '/>');
	}
	else {
		return String.format('<img src=' + IMAGE_CROSS + ' />');
	}
}
