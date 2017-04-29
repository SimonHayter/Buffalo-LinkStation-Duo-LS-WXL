var volume_editMode_collapse_entering;
var volume_editMode_expand_entering;
var VOLUMES_DISK_LIST_FORMATTED;
var VOLUMES_DISK_LIST_RAW;

function disk_create_iscsivolumes_display() {
	volume_editMode_collapse_entering = true;
	Ext.QuickTips.init();

	var volume_add_btn = new Ext.Button({
		id: 'volume_add_btn',
		text: S('volumes_add'),
		iconCls: 'add',
		disabled: true,
		listeners: {
			click: function () {
				volumeForm_new = iscsivolumes_add();
			}
		}
	});

	var volume_delete_btn = new Ext.Button({
		id: 'volume_delete_btn',
		text: S('volumes_delete'),
		iconCls: 'delete',
		disabled: true,
		listeners: {
			click: function () {
				var selectedRecord = sm.getSelected();
				var volumeName = selectedRecord.get('name');
				iscsivolume_delete(volumeName);
			}
		}
	});

	var volume_refresh_btn = new Ext.Button({
		id: 'volume_refresh_btn',
		name: 'volume_refresh_btn',
		text: S('volumes_refresh'),
		iconCls: 'refresh',
		listeners: {
			click: function () {
				volumesForm.destroy();
				volumeForm_display = disk_create_iscsivolumes_display();
				addToCentralContainer(DISKS_RENDER_TO, volumeForm_display);
				update_header(false, 'header_6_1', '');
			}
		}
	});

	var volume_activate_btn = new Ext.Button({
		id: 'activate_volume_btn',
		name: 'activate_volume_btn',
		text: S('volumes_activate'),
		iconCls: 'activate',
		disabled: true,
		listeners: {
			click: function () {
				var selectedRecord = sm.getSelected();
				var volumeName = selectedRecord.get('name');
				iscsivolume_set_status(volumeName, 'on');
			}
		}
	});

	var volume_inactivate_btn = new Ext.Button({
		id: 'deactivate_volume_btn',
		name: 'deactivate_volume_btn',
		text: S('volumes_inactivate'),
		iconCls: 'deactivate',
		disabled: true,
		listeners: {
			click: function () {
				Ext.MessageBox.show({
					width: 600,
					title: S('warning_box_title'),
					msg: S('volume_set_inactive_warning'),
					buttons: Ext.Msg.OKCANCEL,
					icon: Ext.MessageBox.WARNING,
					fn: function (btn) {
						if (btn == 'ok') {
							var selectedRecord = sm.getSelected();
							var volumeName = selectedRecord.get('name');
							iscsivolume_set_status(volumeName, 'off');
						}
					}
				});
			}
		}
	});

	var sm = new Ext.grid.CheckboxSelectionModel({
		singleSelect: true,
		header: '',
		listeners: {
			rowselect: function (sm, rowIndex, rec) {
				if (IS_ISCSI_RUNNING) {
					if ((rec.get('status') == 'connect') || (rec.get('status') == 'wait')) {
						volume_activate_btn.disable();
						volume_delete_btn.enable();
						volume_inactivate_btn.enable();
					}
					else if (rec.get('status') == 'inactive') {
						volume_delete_btn.enable();
						volume_activate_btn.enable();
						volume_inactivate_btn.disable();
					}
				}
				else {
					volume_delete_btn.enable();
					volume_activate_btn.disable();
					volume_inactivate_btn.disable();
				}
			},
			rowdeselect: function (sm, rowIndex, rec) {
				volume_activate_btn.disable();
				volume_inactivate_btn.disable();
				volume_delete_btn.disable();
			}
		}
	});

	var cm = new Ext.grid.ColumnModel([
	sm, {
		id: "status",
		header: S('volumes_status'),
		dataIndex: "status",
		renderer: volume_renderStatus,
		width: 60
	},
	{
		id: "name",
		header: S('volumes_volumeName'),
		dataIndex: "name",
		renderer: volume_renderVolume,
		direction: "ASC",
		width: 155
	},
	{
		id: "diskArea",
		header: S('volumes_diskArea'),
		dataIndex: "diskArea",
		renderer: volume_renderDiskArea,
		width: 80
	},
	{
		id: "accessControl",
		header: S('volumes_accessControl'),
		dataIndex: "accessControl",
		renderer: volume_renderAcccessControl,
		width: 80
	},
	{
		id: "size",
		header: S('volumes_size'),
		dataIndex: "size",
		renderer: volume_renderSize,
		width: 80,
		sortable: true,
		sortType: function (value) {
			// native toLowerCase():
			switch (value.toLowerCase()) {
			case '34GB':
				return 1;
			case '5GB':
				return 2;
			default:
				return 3;
			}
		}
	},
	{
		id: "ip",
		header: S('volumes_clientIp'),
		dataIndex: "ip",
		width: 120
	},
	{
		id: "desc",
		hidden: true,
		dataIndex: "desc"
	}]);

	// by default columns are sortable
	cm.defaultSortable = true;

	var volumesStore = new Ext.data.JsonStore({
		root: 'data',
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_VOLUME_LIST
		},
		//		waitMsg: S('msg_loading_data'),
		fields: [{
			name: 'status'
		},
		{
			name: 'diskArea'
		},
		{
			name: 'name'
		},
		{
			name: 'desc'
		},
		{
			name: 'accessControl'
		},
		{
			name: 'size'
		},
		{
			name: 'ip'
		}],
		listeners: {
			add: function (volumesStore) {
				if (volumesStore.getCount() == VOLUME_MAX_AMOUNT) {
					volume_add_btn.disable();
				}
			},
			remove: function (volumesStore) {
				if (volumesStore.getCount() < VOLUME_MAX_AMOUNT) {
					volume_add_btn.enable();
				}
				else if (volumesStore.getCount() == 0) {
					volume_delete_btn.disable();
				}
			}
		}
	});

	var gridView = new Ext.grid.GridView({
		autoFill: true
	});

	var grid = new Ext.grid.GridPanel({
		id: ID_VOLUME_GRID,
		store: volumesStore,
		cm: cm,
		selModel: sm,
		width: GLOBAL_WIDTH_GRID,
		height: 600,
		enableHdMenu: false,
		enableColumnMove: false,
		stripeRows: true,
		frame: true,
		autoExpandColumn: "name",
		view: gridView,
		listeners: {
			headerclick: function (grid, columnIndex, e) {
				var sizeColumnIndx = grid.getColumnModel().getIndexById("size");
				if (columnIndex == sizeColumnIndx) {
					volumesStore.suspendEvents();
					Ext.override(Ext.data.Store, {
						sortData: function (f, direction) {
							direction = direction || 'ASC';
							var st = this.fields.get(f).sortType;
							var fn = function (r1, r2) {
								var v1 = st(r1.data[f], r1),
								v2 = st(r2.data[f], r2);
								v1 = parseInt(v1);
								v2 = parseInt(v2);
								return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
							};
							this.data.sort(direction, fn);
							if (this.snapshot && this.snapshot != this.data) {
								this.snapshot.sort(direction, fn);
							}
						}
					});
				}
				else {
					Ext.override(Ext.data.Store, {
						sortData: function (f, direction) {
							direction = direction || 'ASC';
							var st = this.fields.get(f).sortType;
							var fn = function (r1, r2) {
								var v1 = st(r1.data[f], r1),
								v2 = st(r2.data[f], r2);
								return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
							};
							this.data.sort(direction, fn);
							if (this.snapshot && this.snapshot != this.data) {
								this.snapshot.sort(direction, fn);
							}
						}
					});
				}
				volumesStore.resumeEvents();
			}
		}
	});

	Ext.MessageBox.wait(S('msg_loading_data'));
	volumesStore.load({
		callback: function () {
			var jsonResponse = volumesStore.reader.jsonData;

			if (jsonResponse && jsonResponse.success) {
				load_disk_area();
			}
			else {
				formFailureFunction()
			}
		}
	});

	// ....: Create DISK FORM and add ITEMS  :....
	var volumesForm = new Ext.FormPanel({
		id: ID_FORM_VOLUME,
		frame: false,
		bodyBorder: false,
		width: GLOBAL_WIDTH_FORM,
		labelAlign: 'left',
		labelWidth: 120,
		items: [{
			layout: 'form',
			buttonAlign: 'left',
			buttons: [
			volume_add_btn, volume_delete_btn, volume_refresh_btn, volume_activate_btn, volume_inactivate_btn]
		},
		grid]
	});

	return volumesForm;
}

function load_disk_area() {
	var diskArea_store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_LVM_LIST
		},
		root: 'data',
		fields: [{
			name: 'disk'
		},
		{
			name: 'size'
		},
		{
			name: 'remain'
		},
		{
			name: 'lvm_status'
		},
		{
			name: 'real_path'
		}]
	});

	diskArea_store.load({
		callback: function (r, opt, success) {
			VOLUMES_DISK_LIST_RAW = diskArea_store.reader.jsonData.data;
			var disk;
			var size;
			var lvm;
			var remain;
			var toDisplay;
			var canAddVolume = false;
			var j = 0;
			VOLUMES_DISK_LIST_FORMATTED = new Array();
			for (var i = 0; i < VOLUMES_DISK_LIST_RAW.length; i++) {
				disk = VOLUMES_DISK_LIST_RAW[i].disk;
				size = VOLUMES_DISK_LIST_RAW[i].size;
				lvm = VOLUMES_DISK_LIST_RAW[i].lvm_status;
				remain = VOLUMES_DISK_LIST_RAW[i].remain;

				var remainAsInt = parseInt(remain);
				// check if there is any space remaining in any of the drives
				if (remainAsInt != 0) {
					canAddVolume = true;
					if (lvm == "on") {
						lvm = S('volumes_lvmEnabled');
					} else {
						lvm = S('volumes_lvmDisabled');
					}

					toDisplay = S(disk) + ' / ' + size + S('gb') + ' ' + lvm;

					VOLUMES_DISK_LIST_FORMATTED[j] = new Array();
					VOLUMES_DISK_LIST_FORMATTED[j][0] = disk;
					VOLUMES_DISK_LIST_FORMATTED[j][1] = toDisplay;
					j++;
				}
			}
			// check number of volumes
			volume_store = Ext.getCmp(ID_VOLUME_GRID).getStore();
			volume_store_size = volume_store.getCount();
			if (canAddVolume && volume_store_size < VOLUME_MAX_AMOUNT) {
				// enable ADD button in main volume grid
				if (Ext.getCmp('volume_add_btn')) {
					var volume_add_btn = Ext.getCmp('volume_add_btn');
					volume_add_btn.enable();
				}
			}
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
		}
	});
}

function volume_renderVolume(value, cell, record) {

	var desc = record.data.desc;
	var status = record.data.status;
	var str;

	/*
	if(status == 'inactive'){
		str = String.format("<b><a href='#' onClick='disk_editVolume(\"{0}\");'>{0}</a></b>", value);
	}
	else {
		str = String.format("<span>{0}</span>", value);
	}*/
	var w;
	if (status == 'inactive') {
		str = String.format("<b><a href='#' ext:qtip='{0}' ext:qwidth='{2}' onClick='disk_editVolume(\"{1}\");'>{1}</a></b>", desc, value, w);
	} else {
		str = String.format("<span ext:qtip='{0}' ext:qwidth='{2}' >{1}</span>", desc, value, w);
	}
	return str;
}

function volume_renderDiskArea(value) {
	return S(value);
}

function volume_renderStatus(value) {
	if (value == 'inactive') {
		str = valueFormatted = S('volumes_status_inactive');
	}
	else if (value == 'wait') {
		str = S('volumes_status_active');
	}
	else if (value == 'connect') {
		var valueFormatted = S('volumes_status_connecting');
		str = "<font color='red'>" + valueFormatted + "</font>";
	}
	else {
		str = '';
	}

	return str;
}

function volume_renderAcccessControl(value, cell, record) {
	var accessControl = record.data.accessControl;
	var accessControl_formatted;

	if (accessControl) {
		if (accessControl == 'simplex') {
				accessControl_formatted = '<img class="grid_icon_simplex" src="_img/simplex.png" />' + S('volumes_size_' + accessControl);
		}
		else if (accessControl == 'duplex') {
				accessControl_formatted = '<img  class="grid_icon_duplex" src="_img/duplex.png" />' + S('volumes_size_' + accessControl);
		}
		else {
			accessControl_formatted = '-';
		}
	}

	return accessControl_formatted;
}

function volume_renderSize(value, cell, record) {
	var size = record.data.size;
	var size_formatted;

	if (size) {
		size_formatted = size + S('gb');
	}

	return size_formatted;
}

function disk_editVolume(volumeName) {
	form_display = Ext.getCmp(ID_FORM_VOLUME);
	form_display.destroy();
	update_header(true, 'header_6_1', volumeName);
	volumesForm_edit_mode = iscsivolumes_create_form(volumeName, true);
	updateCentralContainer(VOLUMES_RENDER_TO, volumesForm_edit_mode);
	iscsivolumes_loadForm(volumesForm_edit_mode, volumeName, false);
}

function iscsivolumes_add() {
	form_display = Ext.getCmp(ID_FORM_VOLUME);
	form_display.destroy();
	update_header(true, 'header_6_1', S('volume_newVolume'));
	volumesForm_add = iscsivolumes_create_form('', false);
	updateCentralContainer(VOLUMES_RENDER_TO, volumesForm_add);
}

function iscsivolumes_create_form(volumeName, editMode) {
	var jErrReader = new Ext.data.JsonReader({
		id: 'jErrReader',
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var jReader_edit = new Ext.data.JsonReader({
		id: 'jReader_edit',
		root: 'data'
	},
	[{
		name: 'name'
	},
	{
		name: 'desc'
	},
	{
		name: 'disk'
	},
	{
		name: 'size'
	},
	{
		name: 'diskArea'
	},
	{
		name: 'diskAreaSize'
	},
	{
		name: 'remain'
	},
	{
		name: 'accessControl'
	},
	{
		name: 'mutualAuth'
	},
	{
		name: 'username'
	},
	{
		name: 'password'
	},
	{
		name: 'passwordMutual'
	},
	{
		name: 'restrictIps'
	},
	{
		name: 'restrictIpsList'
	},
	{
		name: 'advancedSettings'
	},
	{
		name: 'headerDigest'
	},
	{
		name: 'dataDigest'
	},
	{
		name: 'maxConn'
	},
	{
		name: 'initialR2t'
	},
	{
		name: 'immediateData'
	},
	{
		name: 'maxRecvDataLength'
	},
	{
		name: 'maxXmitDataLength'
	},
	{
		name: 'maxBurstLength'
	},
	{
		name: 'firstBurstLength'
	},
	{
		name: 'maxOutstanding'
	},
	{
		name: 'wthreads'
	},
	{
		name: 'queuedComm'
	}]);

	var volume_name = new Ext.form.TextField({
		id: 'volume_name',
		name: 'name',
		fieldLabel: S('volumes_volumeName'),
		width: 200,
		allowBlank: false,
		maxLength: 12
	});

	var volume_desc = new Ext.form.TextField({
		id: 'volume_desc',
		name: 'desc',
		fieldLabel: S('volumes_volumeDescription'),
		width: 200,
		maxLength: 75
	});

	var diskAreaField = new Ext.form.TextField({
		id: 'diskAreaField',
		name: 'diskArea',
		itemCls: 'display-label',
		fieldLabel: S('volumes_diskArea'),
		width: 300,
		readOnly: true
	});

	var volume_size = new Ext.form.NumberField({
		id: 'volume_size',
		name: 'size',
		fieldLabel: S('volumes_volumeSize'),
		disabled: true,
		width: 50,
		allowBlank: false,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_SIZE_VAL,
		minValue: VOLUME_MIN_SIZE_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_SIZE_VAL
	});

	var remainSpace = new Ext.form.TextField({
		id: 'remainSpace',
		name: 'remain',
		hideLabel: true,
		width: 300,
		itemCls: 'display-label',
		readOnly: true
	});

	var enlargeSize = new Ext.form.Checkbox({
		id: 'enlargeSize',
		name: 'enlargeSize',
		disabled: true,
		width: 100,
		labelSeparator: '',
		boxLabel: S('disk_mngt_lvm_enlargeSize'),
		listeners: {
			check: function (enlargeSize, checked) {
				if (checked) {
					Ext.MessageBox.show({
						width: 600,
						title: S('warning_box_title'),
						msg: S('volume_enlarge_size_warning'),
						buttons: Ext.Msg.OKCANCEL,
						icon: Ext.MessageBox.WARNING,
						fn: function (btn) {
							if (btn == 'ok') {
								volume_newSize.enable();
							}
							else {
								enlargeSize.setValue(false);
							}
						}
					});
				}
				else {
					volume_newSize.clearInvalid();
					volume_newSize.disable();
				}
			}
		}
	});

	var volume_newSize = new Ext.form.NumberField({
		id: 'volume_newSize',
		name: 'addedSize',
		disabled: true,
		//		fieldLabel: S('common_plus_sign'),
		hideLabel: true,
		labelSeparator: '',
		width: 50,
		allowBlank: false
		//		,autoCreate : {tag: "input", type: "text", size: "20", autocomplete: "off", maxlength: MAX_FIELD_LENGTH_IP}
	});

	var items;
	if (editMode) {
		volume_size.addClass('display-label');
		//		volume_size.readOnly = true;
		items = [
		volume_name, volume_desc, diskAreaField, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .38,
				items: [volume_size]
			},
			{
				layout: 'form',
				columnWidth: .01,
				items: [{
					cls: 'x-label',
					html: '&nbsp'
				}]
			},
			{
				layout: 'form',
				columnWidth: .03,
				items: [{
					cls: 'label',
					html: S('gb')
				}]
			}]
		},
		enlargeSize, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .3,
				items: [{
					cls: 'x-label',
					html: '&nbsp'
				}]
			},
			{
				layout: 'form',
				columnWidth: .03,
				items: [{
					cls: 'label',
					html: S('common_plus_sign')
				}]
			},
			{
				layout: 'form',
				columnWidth: .08,
				items: [volume_newSize]
			},
			/*{
					layout :'form',
					columnWidth :.15,
					items: [{
							cls: 'label',
							html: suffix
						}]
				},*/
			{
				layout: 'form',
				labelWidth: 80,
				columnWidth: .2,
				items: [remainSpace]
			}]
		}];
	}
	else {
		var diskAreaListComboStore = new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: VOLUMES_DISK_LIST_FORMATTED
		});

		diskAreaField = new Ext.form.ComboBox({
			id: 'diskAreaField',
			hiddenName: 'diskArea',
			fieldLabel: S('volumes_diskArea'),
			store: diskAreaListComboStore,
			//			tpl: resultTpl,
			displayField: 'opt',
			valueField: 'val',
			mode: 'local',
			triggerAction: 'all',
			selectOnFocus: true,
			forceSelection: true,
			listWidth: 300,
			width: 300,
			editable: false,
			disabled: true,
			listeners: {
				select: function (combo, record, index) {
					for (var i = 0; i < VOLUMES_DISK_LIST_RAW.length; i++) {
						if (record.get('val') == VOLUMES_DISK_LIST_RAW[i].disk) {
							iscsivolumes_set_size_and_remain_space(VOLUMES_DISK_LIST_RAW[i], false, true);
							break;
						}
					}
				}
			}
		});

		items = [
		volume_name, volume_desc, diskAreaField, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .38,
				items: [volume_size]
			},
			{
				layout: 'form',
				labelWidth: 80,
				columnWidth: .2,
				items: [remainSpace]
			}]
		}]
	}

	var general_fs = new Ext.form.FieldSet({
		id: 'general_fs',
		name: 'general_fs',
		title: S('volumes_general'),
		autoHeight: true,
		labelWidth: 200,
		items: items
	});

	//--------------------------------- ACCESS CONTROL FUNCTION ---------------------------
	var accessControl_on = new Ext.form.Radio({
		id: 'accessControl_on',
		hideLabel: true,
		name: 'accessControl',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (accessControl_on, checked) {
				if (checked) {
					accessControl_off.setValue(false);
					this.checked = true;

					mutualAuth.enable();
					username.enable();
					password.enable();
					if (mutualAuth.getValue()) {
						passwordMutual.enable();
					}
				}
			}
		}
	});

	var accessControl_off = new Ext.form.Radio({
		id: 'accessControl_off',
		hideLabel: true,
		name: 'accessControl',
		boxLabel: S('disable'),
		inputValue: 'off',
		checked: true,
		listeners: {
			check: function (accessControl_off, checked) {
				if (checked) {
					accessControl_on.setValue(false);
					this.checked = true;

					mutualAuth.disable();
					username.disable();
					password.disable();
					passwordMutual.disable();
				}
			}
		}
	});

	var mutualAuth = new Ext.form.Checkbox({
		id: 'mutualAuth',
		name: 'mutualAuth',
		boxLabel: S('volumes_accessControlFn_mutualAuth'),
		listeners: {
			check: function (mutualAuth, checked) {
				if (checked) {
					passwordMutual.enable();
				}
				else {
					passwordMutual.disable();
				}
			}
		}
	});

	var username = new Ext.form.TextField({
		id: 'username',
		name: 'username',
		fieldLabel: S('volumes_username'),
		width: 200,
		allowBlank: false,
		maxLength: 20
	});

	var password = new Ext.form.TextField({
		id: 'password',
		name: 'password',
		fieldLabel: S('volumes_password'),
		width: 200,
		inputType: 'password',
		minLength: 12,
		maxLength: 16
	});

	var passwordMutual = new Ext.form.TextField({
		id: 'passwordMutual',
		name: 'passwordMutual',
		fieldLabel: S('volumes_passwordMutual'),
		width: 200,
		inputType: 'password',
		minLength: 12,
		maxLength: 16
	});

	var restrictIps_on = new Ext.form.Radio({
		id: 'restrictIps_on',
		hideLabel: true,
		name: 'restrictIps',
		boxLabel: S('enable'),
		inputValue: 'on',
		listeners: {
			check: function (restrictIps_on, checked) {
				if (checked) {
					restrictIpsList.enable();
					restrictIps_off.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var restrictIps_off = new Ext.form.Radio({
		id: 'restrictIps_off',
		hideLabel: true,
		name: 'restrictIps',
		boxLabel: S('disable'),
		inputValue: 'off',
		checked: true,
		listeners: {
			check: function (restrictIps_off, checked) {
				if (checked) {
					restrictIpsList.disable();
					restrictIps_on.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var restrictIpsList = new Ext.form.TextField({
		id: 'restrictIpsList',
		name: 'restrictIpsList',
		fieldLabel: S('volumes_ipRestrictList'),
		width: 200
	});

	var accessControl_fs = new Ext.form.FieldSet({
		id: 'accessControl_fs',
		name: 'accessControl_fs',
		title: S('volumes_accessControlFn'),
		autoHeight: true,
		labelWidth: 200,
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label-fieldset',
					html: S('volumes_accessControlFn') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [accessControl_on]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [accessControl_off]
			},
			{
				//					layout:'form',
				columnWidth: .35,
				items: [mutualAuth]
			}]
		},
		username, password, passwordMutual, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label',
					html: S('volumes_ipRestrict') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [restrictIps_on]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [restrictIps_off]
			}]
		},
		restrictIpsList]
	});

	//--------------------------------- ADVANCED section ----------------------------------
	var headerDigest_off = new Ext.form.Radio({
		id: 'headerDigest_off',
		hideLabel: true,
		name: 'headerDigest',
		boxLabel: S('volumes_digestNone'),
		inputValue: 'None',
		listeners: {
			check: function (headerDigest_off, checked) {}
		}
	});

	var headerDigest_on = new Ext.form.Radio({
		id: 'headerDigest_on',
		hideLabel: true,
		name: 'headerDigest',
		boxLabel: S('volumes_digestCrc'),
		inputValue: 'CRC32',
		listeners: {
			check: function (headerDigest_on, checked) {}
		}
	});

	var dataDigest_off = new Ext.form.Radio({
		id: 'dataDigest_off',
		hideLabel: true,
		name: 'dataDigest',
		boxLabel: S('volumes_digestNone'),
		inputValue: 'None',
		listeners: {
			check: function (dataDigest_off, checked) {}
		}
	});

	var dataDigest_on = new Ext.form.Radio({
		id: 'dataDigest_on',
		hideLabel: true,
		name: 'dataDigest',
		boxLabel: S('volumes_digestCrc'),
		inputValue: 'CRC32',
		listeners: {
			check: function (dataDigest_on, checked) {}
		}
	});

	var maxConn = new Ext.form.NumberField({
		id: 'maxConn',
		name: 'maxConn',
		fieldLabel: S('volumes_maxConn'),
		width: 40,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_CONN_VAL,
		minValue: VOLUME_MIN_CONN_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_CONN_VAL
	});

	var initialR2t_yes = new Ext.form.Radio({
		id: 'initialR2t_yes',
		hideLabel: true,
		name: 'initialR2t',
		boxLabel: 'Yes',
		inputValue: 'Yes',
		listeners: {
			check: function (initialR2t_yes, checked) {}
		}
	});

	var initialR2t_no = new Ext.form.Radio({
		id: 'initialR2t_no',
		hideLabel: true,
		name: 'initialR2t',
		boxLabel: 'No',
		inputValue: 'No',
		listeners: {
			check: function (initialR2t_no, checked) {}
		}
	});

	var immediateData_yes = new Ext.form.Radio({
		id: 'immediateData_yes',
		hideLabel: true,
		name: 'immediateData',
		boxLabel: 'Yes',
		inputValue: 'Yes',
		listeners: {
			check: function (immediateData_yes, checked) {}
		}
	});

	var immediateData_no = new Ext.form.Radio({
		id: 'immediateData_no',
		hideLabel: true,
		name: 'immediateData',
		boxLabel: 'No',
		inputValue: 'No',
		listeners: {
			check: function (immediateData_no, checked) {
				if (checked) {}
			}
		}
	});

	var maxRecvDataLength = new Ext.form.NumberField({
		id: 'maxRecvDataLength',
		name: 'maxRecvDataLength',
		fieldLabel: S('volumes_maxRecvDataLength'),
		width: 80,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_RECV_DATA_VAL,
		minValue: VOLUME_MIN_RECV_DATA_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_RECV_DATA_VAL
	});

	var maxXmitDataLength = new Ext.form.NumberField({
		id: 'maxXmitDataLength',
		name: 'maxXmitDataLength',
		fieldLabel: S('volumes_maxXmitDataLength'),
		width: 80,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_XMIT_DATA_VAL,
		minValue: VOLUME_MIN_XMIT_DATA_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_XMIT_DATA_VAL
	});

	var maxBurstLength = new Ext.form.NumberField({
		id: 'maxBurstLength',
		name: 'maxBurstLength',
		fieldLabel: S('volumes_maxBurstLength'),
		width: 80,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_BURST_VAL,
		minValue: VOLUME_MIN_BURST_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_BURST_VAL
	});

	var firstBurstLength = new Ext.form.NumberField({
		id: 'firstBurstLength',
		name: 'firstBurstLength',
		fieldLabel: S('volumes_firstBurstLength'),
		width: 80,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_FIRST_BURST_VAL,
		minValue: VOLUME_MIN_FIRST_BURST_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_FIRST_BURST_VAL
	});

	var maxOutstanding = new Ext.form.NumberField({
		id: 'maxOutstanding',
		name: 'maxOutstanding',
		fieldLabel: S('volumes_maxOutstanding'),
		width: 60,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_OUTSTANDING_VAL,
		minValue: VOLUME_MIN_OUTSTANDING_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_OUTSTANDING_VAL
	});

	var wthreads = new Ext.form.NumberField({
		id: 'wthreads',
		name: 'wthreads',
		fieldLabel: S('volumes_wthreads'),
		width: 40,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_WTHREADS_VAL,
		minValue: VOLUME_MIN_WTHREADS_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_WTHREADS_VAL
	});

	var queuedComm = new Ext.form.NumberField({
		id: 'queuedComm',
		name: 'queuedComm',
		fieldLabel: S('volumes_queuedComm'),
		width: 40,
		allowDecimals: false,
		allowNegative: false,
		maxValue: VOLUME_MAX_QUEUED_VAL,
		minValue: VOLUME_MIN_QUEUED_VAL,
		autoCreate: {
			tag: "input",
			type: "text",
			size: "20",
			autocomplete: "off"
			/*
			, maxlength: 4
*/
		},
		maxLengthText: S('numberField_maxText') + ' ' + VOLUME_MAX_QUEUED_VAL
	});

	var volume_defaultsBtn = new Ext.Button({
		id: 'volume_defaultsBtn',
		text: S('volumes_restoreDefaults'),
		listeners: {
			click: function () {
				//				volume_advanceSettings_restoreWarning(advanced_fs, false);
				volume_advanceSettings_restoreWarning(advanced_fs, true);
			}
		}
	});

	var advanced_fs = new Ext.form.FieldSet({
		id: 'advanced_fs',
		//		name: 'advanced',
		checkboxToggle: true,
		collapsed: true,
		// fieldset initially collapsed
		title: S('volumes_advanced'),
		autoHeight: true,
		labelWidth: 200,
		listeners: {
			beforecollapse: function () {
				var isVisible = Ext.MessageBox.isVisible();
				if (!volume_editMode_collapse_entering) {
					if (!Ext.getCmp('advanced_fs').checkbox.dom.checked) {
						volume_advanceSettings_restoreWarning(advanced_fs, true);
						return false;
					}
				}
				else {
					volume_editMode_collapse_entering = false;
				}
			},
			beforeexpand: function () {
				if (!volume_editMode_expand_entering) {
					if (Ext.getCmp('advanced_fs').checkbox.dom.checked) {
						volume_advanceSettings_expand(advanced_fs);
					}
				}
				else {
					volume_editMode_expand_entering = false;
				}

			}
		},
		items: [{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label-fieldset',
					html: S('volumes_headerDigest') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [headerDigest_off]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [headerDigest_on]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label-fieldset',
					html: S('volumes_dataDigest') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [dataDigest_off]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [dataDigest_on]
			}]
		},
		maxConn, {
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label-fieldset',
					html: S('volumes_initialR2T') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [initialR2t_yes]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [initialR2t_no]
			}]
		},
		{
			autoWidth: true,
			layout: 'column',
			cls: 'column-custBorders',
			items: [{
				layout: 'form',
				columnWidth: .305,
				items: [{
					cls: 'label-fieldset',
					html: S('volumes_immediateData') + ':'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [immediateData_yes]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [immediateData_no]
			}]
		},
		maxRecvDataLength, maxXmitDataLength, maxBurstLength, firstBurstLength, maxOutstanding, wthreads, queuedComm, volume_defaultsBtn]
	});

	var bufaction;
	if (editMode) {
		bufaction = BUFACT_SET_VOLUME + volumeName
	}
	else {
		bufaction = BUFACT_ADD_VOLUME
	}

	//-------------------------------------------------------------------------------------	
	var volume_saveBtn = new Ext.Button({
		id: 'volume_saveBtn',
		text: S('btn_save'),
		listeners: {
			click: function () {
				var usernameField = Ext.getCmp('username');
				var usernameVal = usernameField.getValue();
				if (usernameVal.length > 16) {
					Ext.MessageBox.show({
						width: 300,
						msg: S('volume_username_long_warning'),
						buttons: Ext.Msg.OKCANCEL,
						icon: Ext.MessageBox.INFO,
						fn: function (btn) {
							if (btn == 'ok') {
								volume_saveBtn_handler(volume_form, bufaction, editMode);
							}
							else {
								return;
							}
						}
					});
				}
				else {
					volume_saveBtn_handler(volume_form, bufaction, editMode);
				}
			}
		}
	});

	var volume_cancelBtn = new Ext.Button({
		id: 'volume_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				volume_form.destroy();
				volumeForm_display = disk_create_iscsivolumes_display();
				addToCentralContainer(DISKS_RENDER_TO, volumeForm_display);
				update_header(false, 'header_6_1', '');
			}
		}
	});

	var volume_form = new Ext.FormPanel({
		id: ID_FORM_VOLUME,
		hideTitle: true,
		frame: false,
		animCollapse: false,
		reader: jReader_edit,
		//		itemCls: 'display-label',
		/*
		cls: 'panel-custBorders',
		errorReader: jErrReader,
		collapsible: true,
		collapsed: false,
*/
		labelWidth: 210,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		buttonAlign: 'left',
		buttons: [
		volume_saveBtn, volume_cancelBtn],
		items: [
		general_fs, accessControl_fs, advanced_fs]
	});

	if (!editMode) {
		// -------------- set values for combo box ------------------------
		diskAreaField.enable();
		setDiskArea(VOLUMES_DISK_LIST_FORMATTED[0], false);
		for (var i = 0; i < VOLUMES_DISK_LIST_RAW.length; i++) {
			if (VOLUMES_DISK_LIST_RAW[i].disk == VOLUMES_DISK_LIST_FORMATTED[0][0]) {
				iscsivolumes_set_size_and_remain_space(VOLUMES_DISK_LIST_RAW[i], false, false);
				break;
			}
		}
	}

	return volume_form;
}

function volume_advanceSettings_restoreWarning(advanced_fs, collapse) {
	Ext.MessageBox.show({
		width: 300,
		title: S('warning_box_title'),
		msg: S('volume_defaultSettingsWarning_collapse'),
		buttons: Ext.Msg.OKCANCEL,
		icon: Ext.MessageBox.QUESTION,
		fn: function (btn) {
			if (btn == 'ok') {
				Ext.getCmp('advanced_fs').checkbox.dom.checked = true;
				volume_restoreDefaultSettings(advanced_fs);
				if (collapse) {
					advanced_fs.collapse(false);
				}
			}
			else {
				Ext.getCmp('advanced_fs').checkbox.dom.checked = true;
			}
		}
	});
}

function volume_advanceSettings_expand(advanced_fs) {
	volume_restoreDefaultSettings(advanced_fs);
	Ext.MessageBox.show({
		width: 500,
		title: S('warning_box_title'),
		msg: S('volume_defaultSettingsWarning_expand'),
		buttons: Ext.Msg.OK,
		icon: Ext.MessageBox.WARNING,
		fn: function (btn) {
			if (btn == 'ok') {
				Ext.getCmp('advanced_fs').checkbox.dom.checked = true;
			}
			else {
				Ext.getCmp('advanced_fs').checkbox.dom.checked = true;
			}
		}
	});
}

function volume_restoreDefaultSettings_msg() {
	Ext.MessageBox.show({
		width: 300,
		msg: S('volume_defaultSettingsWarning_applied'),
		buttons: Ext.Msg.OK,
		icon: Ext.MessageBox.INFO
	});
}

function volume_restoreDefaultSettings(advanced_fs) {
	var radioData = {
		headerDigest: 'off',
		dataDigest_off: 'off',
		initialR2t: 'Yes',
		immediateData: 'No'
	}
	format_advanceSettings_radioBtns(radioData);

	Ext.getCmp('maxConn').setValue('1');
	Ext.getCmp('maxRecvDataLength').setValue('65536');
	Ext.getCmp('maxXmitDataLength').setValue('65536');
	Ext.getCmp('maxBurstLength').setValue('262144');
	Ext.getCmp('firstBurstLength').setValue('65536');
	Ext.getCmp('maxOutstanding').setValue('1');
	Ext.getCmp('wthreads').setValue('2');
	Ext.getCmp('queuedComm').setValue('2');
}

function iscsivolumes_loadForm(form, volumeName, createMode) {
	// ....: Load current settings :.... 
	form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_VOLUME + volumeName
		},
		waitMsg: S('msg_loading_data'),
		failure: function (f, action) {
			formFailureFunction(action);
		},
		draggable: false,
		success: function (f, action) {
			resetCookie();
			var decodedResponse = Ext.decode(action.response.responseText);
			var data = decodedResponse.data[0];
			if (data.advancedSettings == 'on') {
				volume_editMode_expand_entering = false;
				Ext.getCmp('advanced_fs').expand(false);
			}

			format_general(data);
			format_accessControl_radioBtns(data);
			format_advanceSettings_radioBtns(data);
			set_disk_space_addMode(data.diskArea);
		}
	});
}

function format_general(data) {
	setRemainSpace(data);
	setDiskArea(data, true);
	setSize(data);

	real_pathVal = data.real_path;

}

function setRemainSpace(data) {
	var remainSpace = Ext.getCmp('remainSpace');
	remainSpaceVal = data.remain;
	var suffix = S('common_gb') + " / " + S('volumes_remain') + ' ' + remainSpaceVal + S('gb');
	remainSpace.setValue(suffix);
}

function setDiskArea(data, isEditMode) {
	var diskAreaField = Ext.getCmp('diskAreaField');
	var lvmStatus = '';
	var size = Ext.getCmp('volume_size');

	if (data.lvm_status == 'on') {
		lvmStatus = S('volumes_lvmEnabled');
	}
	else {
		lvmStatus = S('volumes_lvmDisabled');
	}

	if (isEditMode) {
		size.setValue(data.size + S('gb'));
	}
	var diskAreaVal = S(data.disk) + " / " + data.size + S('gb') + ' ' + lvmStatus;

	diskAreaField.setValue(data.disk);
}

function setSize(data) {
	var enlargeSize = Ext.getCmp('enlargeSize');
	if (data.lvm_status == 'on') {
		var remainAsInt = parseInt(data.remain);
		if (remainAsInt != 0) {
			enlargeSize.enable();
		}
	}
}

function set_disk_space_addMode(diskArea) {
	var diskAreaField = Ext.getCmp('diskAreaField');
	var vFormatted = S(diskArea);
	diskAreaField.setValue(vFormatted);
}

function iscsivolumes_set_size_and_remain_space(data, isEditMode, fromCombo) {
	if (data.lvm_status == 'on') {
		setDiskArea(data, isEditMode)
		setRemainSpace(data);
		iscsivolumes_setSize_lvm_on(data, fromCombo);
	}
	else {
		setDiskArea(data, isEditMode);
		setRemainSpace(data);
		iscsivolumes_setSize_lvm_off(data);
	}
}

function iscsivolumes_setSize_lvm_on(data, fromCombo) {
	var volume_size = Ext.getCmp('volume_size');
	volume_size.enable();
	if (fromCombo) {
		volume_size.reset();
	}
	volume_size.maxValue = data.remain;
}

function iscsivolumes_setSize_lvm_off(data) {
	var volume_size = Ext.getCmp('volume_size');
	volume_size.disable();
	var remain = data.remain;
	volume_size.setValue(remain);
}

function format_accessControl_radioBtns(data) {
	var accessControl_on = Ext.getCmp('accessControl_on');
	var accessControl_off = Ext.getCmp('accessControl_off');
	var restrictIps_on = Ext.getCmp('restrictIps_on');
	var restrictIps_off = Ext.getCmp('restrictIps_off');

	if (data.accessControl == 'on') {
		accessControl_on.setValue(true);
	}
	else {
		accessControl_off.setValue(true);
	}

	if (data.restrictIps == 'on') {
		restrictIps_on.setValue(true);
	}
	else {
		restrictIps_off.setValue(true);
	}
}

function format_advanceSettings_radioBtns(data) {
	var headerDigest_on = Ext.getCmp('headerDigest_on');
	var headerDigest_off = Ext.getCmp('headerDigest_off');
	var dataDigest_on = Ext.getCmp('dataDigest_on');
	var dataDigest_off = Ext.getCmp('dataDigest_off');
	var initialR2t_yes = Ext.getCmp('initialR2t_yes');
	var initialR2t_no = Ext.getCmp('initialR2t_no');
	var immediateData_yes = Ext.getCmp('immediateData_yes');
	var immediateData_no = Ext.getCmp('immediateData_no');

	if (data.headerDigest == 'CRC32') {
		headerDigest_on.setValue(true);
	}
	else {
		headerDigest_off.setValue(true);
	}

	if (data.dataDigest == 'CRC32') {
		dataDigest_on.setValue(true);
	}
	else {
		dataDigest_off.setValue(true);
	}

	if (data.initialR2t == 'Yes') {
		initialR2t_yes.setValue(true);
	}
	else {
		initialR2t_no.setValue(true);
	}

	if (data.immediateData == 'Yes') {
		immediateData_yes.setValue(true);
	}
	else {
		immediateData_no.setValue(true);
	}
}

function volume_saveBtn_handler(volumeForm_edit, bufaction, editMode) {
	var diskAreaField = Ext.getCmp('diskAreaField');
	var diskVal = diskAreaField.getValue();
	var real_path;

	var sizeField = Ext.getCmp('volume_size');
	var sizeVal = sizeField.getValue();

	if (!editMode) {
		for (var i = 0; VOLUMES_DISK_LIST_RAW.length; i++) {
			if (VOLUMES_DISK_LIST_RAW[i].disk == diskVal) {
				real_path = VOLUMES_DISK_LIST_RAW[i].real_path;
				break;
			}
		}
	}
	else {
		real_path = real_pathVal;
	}

	volumeForm_edit.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			real_path: real_path,
			size: sizeVal,
			remain_raw: remainSpaceVal
		},
		waitMsg: S('msg_saving_data'),
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			volumeForm_edit.destroy();
			volumeForm_display = disk_create_iscsivolumes_display();
			addToCentralContainer(DISKS_RENDER_TO, volumeForm_display);
			update_header(false, 'header_6_1', '');
		}
	});
}

// <<< -------------------------- VOLUME DELETE  -------------------------- >>>
function iscsivolume_delete(volumeName) {
	// Build the message: Format "X" (where "X" is the name of the disk)
	var warning_title = S('warning') + '<br>';
	var warning_msg = S('disk_mngt_delete_volume_note_1');

	warning_msg += '<br><br>';
	warning_msg += S('disk_mngt_delete_volume_note_2') + ' <b>' + volumeName + '</b>' + S('question_mark');

	var delete_btn = new Ext.Button({
		id: 'delete_btn',
		name: 'delete_btn',
		text: S('btn_delete'),
		listeners: {
			click: function () {
				confirmWindow.close();
				iscsivolume_deleteBtnHandler(volumeName);
			}
		}
	});

	var delete_cancel_btn = new Ext.Button({
		id: 'delete_cancel_btn',
		name: 'delete_cancel_btn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				// close window
				//				var win = Ext.getCmp(ID_CHECK_DISK_WIN);
				confirmWindow.hide();
				confirmWindow.destroy();
			}
		}
	});

	var confirmWindow = new Ext.Window({
		html: '<div id="' + VOLUMES_DELETE_WIN + '" class="x-hidden"></div>',
		id: ID_VOLUME_DELETE_WIN,
		modal: true,
		width: 450,
		title: S('disk_mngt_delete_volume'),
		plain: true,
		draggable: false,
		resizable: false,
		layout: 'form',
		items: [{
			xtype: 'label',
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/>' + warning_title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="popup_win_label">' + warning_msg + '</p>'
		}],
		buttonAlign: 'left',
		buttons: [
		delete_btn, delete_cancel_btn]
	});

	confirmWindow.show();
}

function iscsivolume_deleteBtnHandler(volumeName) {
	var volumesForm = Ext.getCmp(ID_FORM_VOLUME);
	Ext.MessageBox.wait(S('loading_confirmation'));

	volumesForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getGate'
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();
			var rawData = action.response.responseText;

			// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
			var response = Ext.decode(rawData);
			var hiddenGateLockTime = response.data[0].hiddenGateLockTime;
			var hiddenGateLockNumber = response.data[0].hiddenGateLockNumber;

			// refresh the number
			A = '<img class = "conf_img" src="' + IMG_PATH + '/A.jpg' + '?' + new Date() + '"/>';
			B = '<img class = "conf_img"  src="' + IMG_PATH + '/B.jpg' + '?' + new Date() + '"/>';
			C = '<img class = "conf_img" src="' + IMG_PATH + '/C.jpg' + '?' + new Date() + '"/>';
			D = '<img class = "conf_img"  src="' + IMG_PATH + '/D.jpg' + '?' + new Date() + '"/>';

			iscsivolume_delete_get_gate(hiddenGateLockTime, hiddenGateLockNumber, volumeName);
		}
	});
}

function iscsivolume_delete_get_gate(hiddenGateLockTime, hiddenGateLockNumber, volumeName) {
	var title = S('disk_mngt_delete_volume');
	var instruction = S('disk_mngt_delete_volume_operation_confirm');

	var disk_gate_applyBtn = new Ext.Button({
		id: 'disk_gate_applyBtn',
		name: 'disk_gate_applyBtn',
		text: S('btn_apply'),
		listeners: {
			click: function () {
				var gNumber = Ext.getCmp(ID_DISK_FOLD_GATE_FIELD).getValue();
				disk_gate_applyBtn.disable();
				iscsivolume_delete_check_gate(gNumber, hiddenGateLockTime, hiddenGateLockNumber, volumeName);
			}
		}
	});

	var disk_gate_cancelBtn = new Ext.Button({
		id: 'disk_gate_cancelBtn',
		name: 'disk_gate_cancelBtn',
		text: S('btn_cancel'),
		listeners: {
			click: function () {
				// close window
				//				var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
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
			html: '<p class="title_popup"><img src="' + DISK_WARNING_IMG + '"/>' + title + '</p><br>'
		},
		{
			xtype: 'label',
			html: '<br><p class="confirmation_instruction">' + instruction + '</p><br>'
		},
		{
			cls: 'conf_numb_box',
			html: '<p id: "conf_numb">' + A + B + C + D + '</p><br>'
		},
		disk_gateField],
		buttonAlign: 'center',
		buttons: [
		disk_gate_applyBtn, disk_gate_cancelBtn]
	});

	confirmWindow.show();
}

function iscsivolume_delete_check_gate(gateNumber, hiddenGateLockTime, hiddenGateLockNumber, volumeName) {
	// remove confirmation window
	var win = Ext.getCmp(ID_DISK_FOLD_GATE_VERIF_WIN);
	win.hide();
	win.destroy();

	Ext.MessageBox.wait(S('verifying_confirmation'));
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'checkGate',
			gateNumber: gateNumber,
			hiddenGateLockTime: hiddenGateLockTime,
			hiddenGateLockNumber: hiddenGateLockNumber,
			gPage: 'volume',
			gMode: 'delete',
			delList: volumeName
		},
		method: 'POST',
		success: function (result) {
			// Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie();
				Ext.MessageBox.updateProgress(1);
				Ext.MessageBox.hide();
				var msg = S('disk_mngt_deleting');
				msg += ' ' + volumeName;
				//				var progressWin = createProgressWin(msg);
				Ext.MessageBox.wait(msg);
				request_operation();
			}
			else {
				if (response.errors[0] == 'gate_err1') {
					// display error msg
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
						fn: function (btn) {
							if (btn == 'ok') {
								// re-create
								iscsivolume_deleteBtnHandler(volumeName);
							}
						}
					});
				}
			}
		}
	});
}

function iscsivolume_set_status(volumeName, newValue) {
	var volumesForm = Ext.getCmp(ID_FORM_VOLUME);
	Ext.MessageBox.wait(S('msg_loading_data'));
	volumesForm.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_SET_VOLUME_STATUS,
			name: volumeName,
			newValue: newValue
		},
		failure: function (form, action) {
			formFailureFunction(action);
		},
		success: function (form, action) {
			resetCookie();
			Ext.MessageBox.hide();
			volumesForm.destroy();
			volumeForm_display = disk_create_iscsivolumes_display();
			addToCentralContainer(DISKS_RENDER_TO, volumeForm_display);
			update_header(false, 'header_6_1', '');
		}
	});
}
