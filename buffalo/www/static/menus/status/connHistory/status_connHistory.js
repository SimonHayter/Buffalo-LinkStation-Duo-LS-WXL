function status_connHistory_processAuth() {
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function(result) {
			// Get response from server	
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				status_connHistory_form = status_connHistory_display();
				updateCentralContainer(VOLUMES_RENDER_TO, status_connHistory_form);
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function status_connHistory_display() {
	Ext.QuickTips.init();

	var refresh = new Ext.Button({
		id: 'refresh',
		text: S('btn_refresh'),
		listeners: {
			click: function(){
				connHistory_loadData(jsonStore);
			}
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		header: ''
	});

	var cm = new Ext.grid.ColumnModel([
		{
			id: "date",
			header: S('status_connection_dateTime'),
			dataIndex: "date",
			direction: "ASC",
			width: 100
		},{
			id: "status",
			header: S('status_connection_status'),
			dataIndex: "status",
			renderer: connHistory_status_renderer,
			width: 80
		},{
			id: "volumeName",
			header: S('status_connection_volume'),
			dataIndex: "volumeName",
			width: 120
		},{
			id: "initiator",
			header: S('status_connection_initiator'),
			dataIndex: "initiator",
			width: 300
		}
	]);

	// by default columns are sortable
	cm.defaultSortable = true;

	var jsonStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_CONN_HISTORY
		},
		waitMsg: S('msg_loading_data'),
		sortInfo: { field: "date", direction: "DESC" },
		fields: [
			{name: 'date'},
			{name: 'status'},
			{name: 'volumeName'},
			{name: 'initiator'}
		]
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true,
		emptyText: '<p align=center>' + S('status_connection_empty') + "</p>"
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_STATUS_CONN_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 300,
		enableHdMenu: false,
		enableColumnMove : false,
		stripeRows: true,
		frame: true,
		autoExpandColumn: "volumeName",
		view: gridView
	});

	connHistory_loadData(jsonStore);

// ....: Create DISK FORM and add ITEMS  :....
	var connHistoryForm = new Ext.FormPanel({
		id: ID_STATUS_CONN_FORM,
		title: S('status_connection_title'),
//		itemsCls : 'panel-custBorders',
		width: GLOBAL_WIDTH_FORM,
		labelAlign: 'left',
		labelWidth: 120,
		items: [{
			buttonAlign:'left',
			buttons: [refresh]
		}, grid],
		animCollapse: false,
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		width: 640,
		collapsed: false
	});

	return connHistoryForm;
}

function connHistory_status_renderer(v){
	var value;
	var cssClass;
	if (v == 'on') {
		value = S('status_connection_connect');
		cssClass = 'grid_cell_text_red';
	}
	else {
		value = S('status_connection_disconnect');
		cssClass = 'grid_cell_text_blue';
	}

	return	String.format("<p class={0}>{1}</p>",cssClass, value);
}
function connHistory_loadData(jsonStore){
	Ext.MessageBox.wait(S('msg_loading_data'));
	jsonStore.load({
		callback: function(){
			var result = jsonStore.reader.jsonData.success;
			if (result) {
				
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();
			}
			else {
				formFailureFunction();
			}
		}
	});
}
