function lvm_processAuth() {
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
				lvm_list = lvm_display();
				updateCentralContainer(VOLUMES_RENDER_TO, lvm_list);
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function lvm_display() {
	Ext.QuickTips.init();

	var lvm_enable = new Ext.Button({
		id: 'lvm_enable',
		text: S('lvm_enable'),
		iconCls: 'enable',
		disabled: true,
		listeners: {
			click: function(){
				var selectedRecord = sm.getSelected();
				var diskName = selectedRecord.get('disk')
				lvm_handler(diskName, 'enable');
			}
		}
	});

	var lvm_disable = new Ext.Button({
		id: 'lvm_disable',
		text: S('lvm_disable'),
		disabled: true,
		iconCls: 'disable',
		listeners: {
			click: function(){
				var selectedRecord = sm.getSelected();
				var diskName = selectedRecord.get('disk')
				lvm_handler(diskName, 'disable');
			}
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
	  header: '',
	  singleSelect: true,
	  listeners: {
		 rowselect:function(sm, rowIndex, rec){
			var lvm_status = rec.get('lvm_status');
			if (lvm_status == 'on') {
				lvm_enable.disable();
				lvm_disable.enable();
			}
			else {
				lvm_enable.enable();
				lvm_disable.disable();
			}
		 },
		 rowdeselect: function(sm, rowIndex, rec){
			if(sm.getCount() == 0){
				lvm_enable.disable();
				lvm_disable.disable();
			}
		 }
	   }
	  });

	var cm = new Ext.grid.ColumnModel([
		sm,
		{ id: "disk", 
		  header: S('disk_mngt_lvm_diskArea'),
		  dataIndex: "disk", 
		  direction: "ASC",
		  renderer: lvm_disk_renderer
		},{ id: "lvm_status",
		  header: S('disk_gridCol_status'),
		  dataIndex: "lvm_status",
		  renderer: lvm_status_renderer
		}
	]);

	// by default columns are sortable
	cm.defaultSortable = true;

	var jsonStore = new Ext.data.JsonStore({
	  root: 'data',
	  url: '/dynamic.pl',
	  baseParams:{bufaction: BUFACT_GET_LVM_SETTINGS},
	  waitMsg: S('msg_loading_data'),
	  fields: [{name: 'disk'},
			   {name: 'lvm_status'}
			  ],
	  listeners:{
		add: function(jsonStore){
			if(jsonStore.getCount() == 10){
				volume_add_btn.disable();
			}
			check_volume_btn.enable();
			//erase_volume_btn.enable();
			format_volume_btn.enable();
		},
		load: function(jsonStore){
		},		
		remove : function(jsonStore){
		}
	  }
	});

 	var gridView = new Ext.grid.GridView(
	{	autoFill: true}
	);

	var grid = new Ext.grid.GridPanel({
		id: ID_VOLUME_GRID,
		store: jsonStore,
		cm: cm,
		selModel: sm,
		width: 640,
		height: 125,
		//autoHeight: 'true',
		//maxHeight :170,
		enableHdMenu: false,
		enableColumnMove : false,
		stripeRows: true,
		frame: true,
		autoExpandColumn :	"disk",
		view: gridView
	});

	jsonStore.load({
		callback: function(){
			var result = jsonStore.reader.jsonData.success;
			if(result){
			}
			else{
			}
		  
		}
	  });

 // ....: Create DISK FORM and add ITEMS  :....
	var lvmForm = new Ext.FormPanel({
		id: ID_LVM_FORM,
		title: S('disk_mngt_volume_title'),
		//itemsCls : 'panel-custBorders',
		width: GLOBAL_WIDTH_FORM,
		labelAlign: 'left',
		labelWidth: 120,
		items: [
		{
		  buttonAlign:'left',
		  buttons: [lvm_enable, lvm_disable]
		},grid],
		//title: S('disk_mngt_title'),
		animCollapse: false,
		collapsible: true,
		collapseFirst: true,
		titleCollapse: true,
		width: 640,
		collapsed: false //added
	});

	return lvmForm;
}

function lvm_status_renderer(v){
	if(v == 'on'){
		return S('enabled');
	}
	else{
		return S('disabled');
	}
}

function lvm_disk_renderer(v){
	return S(v);
}

function lvm_handler(disk, newStatus) {
	Ext.MessageBox.wait(S('loading_confirmation'));

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function(form, action) {
			formFailureFunction(action);
		},
		success: function(result) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber; // refresh the number
			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';
			lvm_get_gate(hiddenGateLockTime, hiddenGateLockNumber, disk, newStatus);
		}
	});
};

function lvm_get_gate(hiddenGateLockTime, hiddenGateLockNumber, disk, newStatus) {
	var title;
	var msg;
	if (newStatus == 'enable') { //enabling LVM
		title = S('disk_mngt_lvm_gate_title_enable');
		msg = S('disk_mngt_lvm_gate_warning_enable_1') + '<br><br>' + S('disk_mngt_lvm_gate_warning_enable_2');
	}
	else { //disabling LVM
		title = S('disk_mngt_lvm_gate_title_disable');
		msg = S('disk_mngt_lvm_gate_warning_disable_1') + '<br><br>' + S('disk_mngt_lvm_gate_warning_disable_2');
	}

	var lvm_gate_applyBtn = new Ext.Button({
		id: 'lvm_gate_applyBtn',
		name: 'lvm_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function() {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				lvm_gate_applyBtn.disable();
				lvm_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, disk, newStatus);
			}
		}
	});

	var lvm_gate_cancelBtn = new Ext.Button({
		id: 'lvm_gate_cancelBtn',
		name: 'lvm_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function() {
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var disk_gateField = new Ext.form.TextField({
		fieldLabel: S('operation_confirm_codeField'),
		id: ID_DISK_FOLD_GATE_FIELD,
		name: 'disk_gateField',
		width: 100,
		grow: false,
		labelStyle: 'text-align:right;',
		autoCreate: {
			tag: "input",
			type: "text",
			size: "100",
			autocomplete: "off",
			maxlength: MAX_CONFIRM_CODE_LENGTH
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + DIV_GATE_WIN + '" class="x-hidden"></div>',
		id: ID_DISK_FOLD_GATE_VERIF_WIN,
		modal: true,
		width: 330,
		title: S('operation_confirm'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/> ' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + msg + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [lvm_gate_applyBtn, lvm_gate_cancelBtn] // end buttons
	}); //end window
	confirmWindow.show();
}

function lvm_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, disk, newStatus) {
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'lvm',
			gMode: newStatus,
			disk: disk
		},
		method: 'POST',
		success: function(result) { //Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			if (success) {
				resetCookie();
				lvm_set(disk, newStatus)
			}
			else {
				if (response.errors[0] == 'gate_err1') { // remove confirmation window
					//display error msg
					var buttons = Ext.MessageBox.OK;
					var title = S('error_box_title');
					var icon = Ext.MessageBox.ERROR;
					var msg = S('gate_err1');
					Ext.MessageBox.show({
						width: 300,
						title: title,
						msg: msg,
						buttons: buttons,
						icon: icon,
						fn: function(btn) {
							if (btn == 'ok') { //re-create 
								lvm_handler(disk, newStatus);
							}
						}
					});
				}
			}
		},
		failure: function() {}
	});
}

function lvm_set(disk, newStatus) {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_LVM,
			status: newStatus,
			disk: disk
		},
		method: 'POST',
		success: function(result) { // Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			if (success) {
				resetCookie();
				lvm_processAuth();
			}
			else {
				formFailureFunction();
			}
		},
		failure: function() {
			resetCookie();
		}
	});
}
