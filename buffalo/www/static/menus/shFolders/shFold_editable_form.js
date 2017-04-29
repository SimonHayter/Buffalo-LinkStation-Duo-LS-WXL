var localUsersLoaded = false;
var localGroupsLoaded = false;
var domainUsersLoaded = false;
var domainGroupsLoaded = false;
var extUsersLoaded = false;

var shFolders_edit_jReaderFields = [{
	name: 'volume'
},
{
	name: 'win'
},
{
	name: 'apple'
},
{
	name: 'ftp'
},
{
	name: 'backup'
},
{
	name: 'sftp'
},
{
	name: 'attributes'
},
{
	name: 'recycle'
},
{
	name: 'offlineFiles'
},
{
	name: 'visible'
},
{
	name: 'hiddenFile'
},
{
	name: 'winbackup'
},
{
	name: 'teraSearch'
}];

var shFolders_display_jReaderFields = [{
	name: 'shareName'
},
{
	name: 'shareDesc'
},
{
	name: 'volume'
},
{
	name: 'win'
},
{
	name: 'apple'
},
{
	name: 'ftp'
},
{
	name: 'backup'
},
{
	name: 'sftp'
},
{
	name: 'attributes'
},
{
	name: 'recycle'
},
{
	name: 'backupPwd'
},
{
	name: 'webaxs_perm'
},
{
	name: 'pocketU_perm'
},
{
	name: 'offlineFiles'
},
{
	name: 'hiddenFile'
},
{
	name: 'winbackup'
},
{
	name: 'teraSearch'
},
{
	name: 'realtime'
},
{
	name: 'scheduled'
},
{
	name: 'manual'
}];

function shFolders_editSharedFolder(id) {
	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	shFolders_display_jReaderFields);

	var form = shFolders_createForm(id, 'editMode', jReader);
	var volumeCombo = Ext.getCmp('volume_field');
	update_header(true, 'sh_fold_header', id);

	var re = /^usbdisk[1-4]$/;
	var matched = id.match(re);

	var re_info = /^info$/;
	var matched_info = id.match(re_info);

	if (matched || matched_info) {
		var name = Ext.getCmp('shareName');
		var desc = Ext.getCmp('shareDesc');
		name.readOnly = true;
		name.itemCls = 'display-label';
		desc.readOnly = true;
		desc.itemCls = 'display-label';
	}

	updateCentralContainer(SHARED_FOLDER_RENDER_TO, form);

	shFolders_loadForm(form, id, false);
}

function shFolders_createFolder(id) {
	var settingsComboStore;
	var form;
	var store;
	var copySettingsFromList;
	var copySettingsFromPosition = 0; // This field wil be added in the fifth position of the form.

	var jReader = new Ext.data.JsonReader({
		root: 'data'
	},
	shFolders_edit_jReaderFields);

	form = shFolders_createForm(id, 'createMode', jReader);

	var shFold_header_new = S('sh_new_folder');
	update_header(true, 'sh_fold_header', shFold_header_new);
	updateCentralContainer(SHARED_FOLDER_RENDER_TO, form);

	store = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: BUFACT_GET_SHARE_LIST
		},
		root: 'data',
		fields: [{
			name: 'name'
		},
		{
			name: 'value'
		}]
	});

	copySettingsFromList = new Ext.form.ComboBox({
		name: 'settings',
		disabled: true,
		id: ID_SH_FOLD_COPY_SETTINGS_COMBO,
		value: '',
		fieldLabel: S('sh_field_copySettingsFrom'),
		emptyText: S('optional'),
		store: store,
		displayField: 'name',
		valueField: 'value',
		mode: 'local',
		triggerAction: 'all',
		selectOnFocus: true,
		listWidth: 110,
		width: 110,
		editable: false,
		listeners: {
			select: function(combo, record, index) {
				var selectedValue = combo.getValue();
				shFolders_loadForm(form, selectedValue, true);
			}
		}
	});

	store.load({
		callback: function(r, opt, success) {
			var result = store.reader.jsonData.success;
			if (result) {
				copySettingsFromList.enable();
				// remove the folder 'info' from this list
				var folderName = 'info';
				var infoFolderIndex = store.find('value', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}
				
				// remove the folder 'usbdisk[n]' from this list
				folderName = 'usbdisk1';
				infoFolderIndex = store.find('value', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}
				
				folderName = 'usbdisk2';
				infoFolderIndex = store.find('value', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}
				
				folderName = 'usbdisk3';
				infoFolderIndex = store.find('value', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}
				
				folderName = 'usbdisk4';
				infoFolderIndex = store.find('value', folderName);
				if (infoFolderIndex != -1) {
					store.remove(store.getAt(infoFolderIndex));
				}
			}
			else {
				formFailureFunction();
			}
		}
	});

	form.insert(copySettingsFromPosition, copySettingsFromList);
	form.render();
}

function shFolders_createForm(id, mode, jReader) {
	var shareName;
	var shareDesc;
	var volume;
	var ro;
	var rw;
	var win;
	var apple;
	var ftp;
	var enableRecyc;
	var backup;
	var sftp;
	var enableRecyc;
	var disableRecyc;
	var backupPwd;
	var disableAxs;
	var enableAxs;
	var folderSettings;
	var jReader;
	var jErrReader;

	shareName = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderName'),
		id: 'shareName',
		name: 'shareName',
		width: 250,
		allowBlank: true
	});

	shareDesc = new Ext.form.TextField({
		fieldLabel: S('sh_field_folderDesc'),
		name: 'shareDesc',
		id: 'shareDesc',
		width: 250,
		allowBlank: true
	});

	if (mode == 'editMode') {
		volume = new Ext.form.TextField({
			fieldLabel: S('sh_field_volume'),
			id: 'volume_field',
			name: 'volume',
			width: 110,
			readOnly: true,
			itemCls: 'display-label'
		});
	}
	else {
		var val;
		if (DISK_LIST[0]) {
			val = DISK_LIST[0][0];
		}

		volume = new Ext.form.ComboBox({
			id: 'volume_field',
			hiddenName: 'volume',
			fieldLabel: S('sh_field_volume'),
			store: new Ext.data.SimpleStore({
				fields: ['val', 'opt'],
				data: DISK_LIST
			}),
			displayField: 'opt',
			valueField: 'val',
			typeAhead: true,
			mode: 'local',
			triggerAction: 'all',
			value: val,
			emptyText: S('sh_field_volumeEmpty'),
			selectOnFocus: true,
			forceSelection: true,
			listWidth: 110,
			width: 110,
			editable: false,
			allowBlank: false
		});
	}

	backupPwd = new Ext.form.TextField({
		fieldLabel: S('sh_field_bckpPwd'),
		name: 'backupPwd',
		width: 250,
		inputType: 'password',
		disabled: true
	});

	ro = new Ext.form.Radio({
		boxLabel: S('sh_field_ro'),
		name: 'attributes',
		id: 'r',
		inputValue: 'ro',
		hideLabel: true
	});

	rw = new Ext.form.Radio({
		boxLabel: S('sh_field_rw'),
		name: 'attributes',
		id: 'rw',
		inputValue: 'rw',
		hideLabel: true,
		checked: true
	});

	enableRecyc = new Ext.form.Radio({
		boxLabel: S('sh_field_recycleEn'),
		name: 'recycle',
		id: 'recy_1',
		inputValue: '1',
		hideLabel: true,
		checked: true
	});

	disableRecyc = new Ext.form.Radio({
		boxLabel: S('sh_field_recycleDis'),
		name: 'recycle',
		id: 'recy_0',
		inputValue: '0',
		hideLabel: true
	});

	win = new Ext.form.Checkbox({
		boxLabel: S('sh_field_folderSupport_win'),
		name: 'win',
		inputValue: '1',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(win, checked) {
				if (!checked) {
					hiddenFile.disable();
					winbackup.disable();
				}
				else {
					winbackup.enable();
					if (!apple.getValue() && !ftp.getValue() && !sftp.getValue()) {
						hiddenFile.enable();
					}
				}
			}
		}
	});

	apple = new Ext.form.Checkbox({
		boxLabel: S('sh_field_folderSupport_apple'),
		name: 'apple',
		id: 'apple',
		inputValue: '1',
		hideLabel: true,
		checked: true,
		listeners: {
			check: function(apple, checked) {
				if (checked) {
					hiddenFile.disable();
				}
				else {
					if (win.getValue() && !ftp.getValue() && !sftp.getValue()) {
						hiddenFile.enable();
					}
				}
			}
		}
	});

	ftp = new Ext.form.Checkbox({
		id: 'ftp',
		boxLabel: S('sh_field_folderSupport_ftp'),
		name: 'ftp',
		inputValue: '1',
		hideLabel: true,
		listeners: {
			check: function(ftp, checked) {
				if (checked) {
					hiddenFile.disable();
				}
				else {
					if (win.getValue() && !apple.getValue() && !sftp.getValue()) {
						hiddenFile.enable();
					}
				}
			}
		}
	});

	backup = new Ext.form.Checkbox({
		id: 'backup',
		boxLabel: S('sh_field_folderSupport_bckp'),
		name: 'backup',
		inputValue: '1',
		hideLabel: true,
		listeners: {
			check: function(backup, checked) {
				if (checked) {
					backupPwd.enable();
				}
				else {
					backupPwd.disable();
				}
			}
		}
	});

	sftp = new Ext.form.Checkbox({
		id: 'sftp',
		boxLabel: S('sh_field_folderSupport_sftp'),
		name: 'sftp',
		inputValue: '1',
		hideLabel: true,
		listeners: {
			check: function(sftp, checked) {
				if (checked) {
					hiddenFile.disable();
				}
				else {
					if (win.getValue() && !apple.getValue() && !ftp.getValue()) {
						hiddenFile.enable();
					}
				}
			}
		}
	});

	// initially set to create a grid for local users
	localUsersGrid = shFolders_addGrid_front(id, 'local_users');
	localUsersLoaded = true;

	localGroupsGrid = shFolders_addGrid_front(id, 'local_groups');
	domainUsersGrid = shFolders_addGrid_front(id, 'domain_users');
	domainGroupsGrid = shFolders_addGrid_front(id, 'domain_groups');
	extUsersGrid = shFolders_addGrid_front(id, 'ext_users');

	// show only local users grid, hide the rest
	localGroupsGrid.hide();
	domainUsersGrid.hide();
	domainGroupsGrid.hide();
	extUsersGrid.hide();

	var grid_local_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'local_users');
	var grid_local_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'local_groups');
	var grid_domain_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'domain_users');
	var grid_domain_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'domain_groups');
	var grid_ext_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'ext_users');

	localUsersViewBtn = new Ext.Button({
		text: S('sh_local_users'),
		name: 'localUsersViewBtn',
		id: 'localUsersViewBtn',
		toggleGroup: 'view',
		pressed: true,
		enableToggle: true,
		allowDepress: false,
		handler: function() {
			show_local_users_grid(id);
			if (!localUsersLoaded) {
				loadGrid(ID_SH_FOLD_FRONT_GRID, id, 'local_users');
				localUsersLoaded = true;
			}
		},
		iconCls: 'view'
	});

	localGroupsViewBtn = new Ext.Button({
		text: S('sh_local_groups'),
		name: 'localGroupsViewBtn',
		id: 'localGroupsViewBtn',
		toggleGroup: 'view',
		enableToggle: true,
		allowDepress: false,
		handler: function() {
				grid_local_groups.show();

				if (grid_local_users) {
					grid_local_users.hide();
				}
				if (grid_domain_users) {
					grid_domain_users.hide();
				}
				if (grid_domain_groups) {
					grid_domain_groups.hide();
				}
				if (grid_ext_users) {
					grid_ext_users.hide();
				}

			if (!localGroupsLoaded) {
				loadGrid(ID_SH_FOLD_FRONT_GRID, id, 'local_groups');
				localGroupsLoaded = true;
			}
		},
		iconCls: 'view'
	});

	domainUsersViewBtn = new Ext.Button({
		text: S('sh_domain_users'),
		name: 'domainUsersViewBtn',
		id: 'domainUsersViewBtn',
		toggleGroup: 'view',
		enableToggle: true,
		allowDepress: false,
		hidden: true,
		handler: function() {
			grid_domain_users.show();

			if (grid_local_users) {
				grid_local_users.hide();
			}
			if (grid_local_groups) {
				grid_local_groups.hide();
			}
			if (grid_domain_groups) {
				grid_domain_groups.hide();
			}
			if (grid_ext_users) {
				grid_ext_users.hide();
			}

			if (!domainUsersLoaded) {
				loadGrid(ID_SH_FOLD_FRONT_GRID, id, 'domain_users');
				domainUsersLoaded = true;
			}
		},
		iconCls: 'view'
	});

	domainGroupsViewBtn = new Ext.Button({
		text: S('sh_domain_groups'),
		name: 'domainGroupsViewBtn',
		id: 'domainGroupsViewBtn',
		toggleGroup: 'view',
		enableToggle: true,
		allowDepress: false,
		hidden: true,
		handler: function() {
			grid_domain_groups.show();

			if (grid_local_users) {
				grid_local_users.hide();
			}
			if (grid_local_groups) {
				grid_local_groups.hide();
			}
			if (grid_domain_users) {
				grid_domain_users.hide();
			}
			if (grid_ext_users) {
				grid_ext_users.hide();
			}

			if (!domainGroupsLoaded) {
				loadGrid(ID_SH_FOLD_FRONT_GRID, id, 'domain_groups');
				domainGroupsLoaded = true;
			}
		},
		iconCls: 'view'
	});

	extUsersViewBtn = new Ext.Button({
		text: S('sh_ext_users'),
		name: 'extUsersViewBtn',
		id: 'extUsersViewBtn',
		toggleGroup: 'view',
		enableToggle: true,
		allowDepress: false,
		hidden: true,
		handler: function() {
			grid_ext_users.show();

			if (grid_local_users) {
				grid_local_users.hide();
			}
			if (grid_local_groups) {
				grid_local_groups.hide();
			}
			if (grid_domain_users) {
				grid_domain_users.hide();
			}
			if (grid_domain_groups) {
				grid_domain_groups.hide();
			}

			if (!extUsersLoaded) {
				loadGrid(ID_SH_FOLD_FRONT_GRID, id, 'ext_users');
				extUsersLoaded = true;
			}
		},
		iconCls: 'view'
	});

	var switchBtnBar = new Ext.Toolbar({
		width: 660,
		items: [
			localUsersViewBtn,
			localGroupsViewBtn,
			domainUsersViewBtn,
			domainGroupsViewBtn,
			extUsersViewBtn
		]
	});

	axsRestrictFS = new Ext.form.FieldSet({
		id: 'axsRestrictionsFS',
		title: S('sh_fieldset_restrict'),
		collapsed: true,
		checkboxToggle: true,
		checkboxName: 'axsRestrict',
		height: 500,
		width: GLOBAL_WIDTH_FIELDSET,
		items: [
			switchBtnBar,
			localUsersGrid,
			localGroupsGrid,
			domainUsersGrid,
			domainGroupsGrid,
			extUsersGrid
		]
	});

	visible_yes = new Ext.form.Radio({
		boxLabel: S('sh_field_visible_yes'),
		name: 'visible',
		id: 'visible_1',
		inputValue: '1',
		hideLabel: true,
		cls: 'x-tab-strip x-tab-strip-top'
	});

	visible_no = new Ext.form.Radio({
		boxLabel: S('sh_field_visible_no'),
		name: 'visible',
		id: 'visible_0',
		inputValue: '0',
		hideLabel: true
	});

	var hiddenFile = new Ext.form.Checkbox({
		boxLabel: S('sh_field_hiddenShare_label'),
		id: 'hiddenFile',
		name: 'hiddenFile',
		inputValue: '1',
		hideLabel: true,
		checked: false
	});

	var winbackup = new Ext.form.Checkbox({
		boxLabel: S('sh_field_winbackup_label'),
		id: 'winbackup',
		name: 'winbackup',
		inputValue: '1',
		hideLabel: true,
		checked: false
	});

	var teraSearch = new Ext.form.Checkbox({
		boxLabel: S('sh_field_teraSearch_boxLegend'),
		id: 'teraSearch',
		name: 'teraSearch',
		inputValue: '1',
		hideLabel: true,
		checked: false
	});

	var offlineOptions = [
		['disable', S('shFold_offlineFiles_disable')],
		['manual', S('shFold_offlineFiles_manualCache')],
		['documents', S('shFold_offlineFiles_autoCacheFiles')],
		['programs', S('shFold_offlineFiles_autoCachePrograms')]
	];

	var offlineFiles = new Ext.form.ComboBox({
		id: 'offlineFiles_combo',
		hiddenName: 'offlineFiles',
		fieldLabel: S('sh_field_offlineFile'),
		store: new Ext.data.SimpleStore({
			fields: ['val', 'opt'],
			data: offlineOptions
		}),
		displayField: 'opt',
		valueField: 'val',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		value: 'disable',
		selectOnFocus: true,
		forceSelection: true,
		editable: false,
		width: 250,
		listWidth: 250
	});

	jErrReader = new Ext.data.JsonReader({
		root: 'errors',
		successProperty: 'success'
	},
	[{
		name: 'id'
	},
	{
		name: 'msg'
	}]);

	var shFoldAttrLabel = S('sh_fieldset_folderAttr');
	var shRecycle = S('sh_recycle');
	var shFolderSupport = S('sh_fieldset_folderSupport');
	var sharedFoldersForm;
	var visibleLabel = S('sh_field_visible');

	var re = /^usbdisk[1-4]$/;
	var matched = id.match(re);

	var re_info = /^info$/;
	var matched_info = id.match(re_info);

	var items;
	var items2;

	var itemsSupport = [{
		layout: 'form',
		columnWidth: .24,
		items: [{
			html: '<p class="label">' + shFolderSupport + ':</p>'
		}]
	},
	{
		layout: 'form',
		columnWidth: .15,
		items: [win]
	},
	{
		layout: 'form',
		columnWidth: .15,
		items: [apple]
	},
	{
		layout: 'form',
		columnWidth: .15,
		items: [ftp]
	},
	{
		layout: 'form',
		columnWidth: .15,
		items: [backup]
	}];

	if (add_sftp) {
		itemsSupport[itemsSupport.length] = {
			layout: 'form',
			columnWidth: .15,
			items: [sftp]
		}
	}

	if (matched_info) {
		items = [shareName, shareDesc, {
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .24,
				items: [{
					html: '<p class="label">' + visibleLabel + ':</p>'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [visible_yes]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [visible_no]
			}]
		}];
	}
	else {
		items = [
			shareName, shareDesc, volume, {
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .24,
				items: [{
					html: '<p class="label">' + shFoldAttrLabel + ':</p>'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [ro]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [rw]
			}]
		},
		{
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .24,
				items: [{
					html: '<p class="label">' + shRecycle + ':</p>'
				}]
			},
			{
				layout: 'form',
				columnWidth: .15,
				items: [enableRecyc]
			},
			{
				layout: 'form',
				columnWidth: .20,
				items: [disableRecyc]
			}]
		},
		{
			layout: 'column',
			items: itemsSupport
		}];

		if ((add_hiddenShare) && (!matched) && (!matched_mc)) {
			items2 = [
				hiddenFile,
				winbackup
			];
		}
		else {
			items2 = [winbackup];
		}

		items[items.length] = {
			layout: 'column',
			items: [{
				layout: 'form',
				columnWidth: .24,
				items: [{
					html: '<p class="label">' + S('sh_field_hiddenShare') + ':</p>'
				}]
			},
			{
				layout: 'form',
				columnWidth: .50,
				items: items2
			}]
		}

		if (!matched) {
			items[items.length] = backupPwd;
		}

		if ((add_offlineFiles) && (!matched)) {
			items[items.length] = offlineFiles;
		}

		if ((add_teraSearch) && (!matched)) {
			items[items.length] = {
				layout: 'column',
				items: [{
					layout: 'form',
					columnWidth: .24,
					items: [{
						html: '<p class="label">' + S('sh_field_teraSearch') + ':</p>'
					}]
				},
				{
					layout: 'form',
					columnWidth: .50,
					items: [teraSearch]
				}]
			}
		}

		items[items.length] = {
			html: '<br>'
		};
		items[items.length] = axsRestrictFS;
	}

	sharedFoldersForm = new Ext.FormPanel({
		hideTitle: true,
		frame: false,
		id: ID_SH_FOLD_PREFIX_FORM,
		width: GLOBAL_WIDTH_FORM,
		autoHeight: true,
		labelAlign: 'left',
		labelWidth: 160,
		reader: jReader,
		errorReader: jErrReader,
		items: items
	});

	var applyBtn = new Ext.Button({
		text: S('btn_save'),
		handler: function(f) {
			if (mode == 'createMode') {
				shFolders_saveChanges(sharedFoldersForm, BUFACT_ADD_SHARE);
			}
			else {
				shFolders_saveChanges(sharedFoldersForm, BUFACT_EDIT_SHARE + id);
			}
		}
	});

	var cancelBtn = new Ext.Button({
		text: S('btn_cancel'),
		handler: function() {
			shFolders_cancel();
		}
	});

	// include buttons in the form
	sharedFoldersForm.add({
		buttonAlign: 'left',
		buttons: [applyBtn, cancelBtn]
	});

	return sharedFoldersForm;
}

function show_local_users_grid(id){
	var grid_local_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'local_users');
	var grid_local_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'local_groups');
	var grid_domain_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'domain_users');
	var grid_domain_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'domain_groups');
	var grid_ext_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + 'ext_users');
	
	grid_local_users.show();
	
	if (grid_local_groups) {
		grid_local_groups.hide();
	}
	if (grid_domain_users) {
		grid_domain_users.hide();
	}
	if (grid_domain_groups) {
		grid_domain_groups.hide();
	}
	if (grid_ext_users) {
		grid_ext_users.hide();
	}
}

function shFolders_saveChanges(form, bufaction) {
	// -----------------------	GET LOCAL USERS AND CONVERT THEM TO JSON FORMAT
	// get Front grid object
	frontGrid_local_users = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + "local_users");
	// get the elements of the grid
	store_local_users = frontGrid_local_users.getStore();
	//store_local_users = Ext.getCmp('store' + 'local_users');

	// get members of each group
	records_local_users = store_local_users.getRange();
	// Create temporal arrays to parse data as JSON object
	dataToParse_local_users = new Array(records_local_users.length);
	for (var i = 0; i < records_local_users.length; i++) {
		dataToParse_local_users[i] = new Array(3);
		dataToParse_local_users[i][0] = records_local_users[i].data.name;
		dataToParse_local_users[i][1] = records_local_users[i].data.permissions;
	}
	var jsonData_local_users = Ext.util.JSON.encode(dataToParse_local_users);

	// -----------------------	GET LOCAL GROUPS AND CONVERT THEM TO JSON FORMAT
	// get Front grid object
	frontGrid_local_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + "local_groups");
	// get the elements of the grid
	store_local_groups = frontGrid_local_groups.getStore();
	// get members of each group

	records_local_groups = store_local_groups.getRange();
	//------- // records_local_groups = store_local_groups.allData.items;

	// Create temporal arrays to parse data as JSON object
	dataToParse_local_groups = new Array(records_local_groups.length);
	for (var i = 0; i < records_local_groups.length; i++) {
		dataToParse_local_groups[i] = new Array(3);
		dataToParse_local_groups[i][0] = records_local_groups[i].data.name;
		dataToParse_local_groups[i][1] = records_local_groups[i].data.permissions;
	}
	var jsonData_local_groups = Ext.util.JSON.encode(dataToParse_local_groups);

	// -----------------------	GET DOMAIN USERS AND CONVERT THEM TO JSON FORMAT
	// get Front grid object
	frontGrid_domain_users= Ext.getCmp(ID_SH_FOLD_FRONT_GRID + "domain_users");
	// get the elements of the grid
	store_domain_users = frontGrid_domain_users.getStore();
	// get members of each group
	records_domain_users = store_domain_users.getRange();

	// Create temporal arrays to parse data as JSON object
	dataToParse_domain_users = new Array(records_domain_users.length);
	for (var i = 0; i < records_domain_users.length; i++) {
		dataToParse_domain_users[i] = new Array(3);
		dataToParse_domain_users[i][0] = records_domain_users[i].data.name;
		dataToParse_domain_users[i][1] = records_domain_users[i].data.permissions;
	}
	var jsonData_domain_users = Ext.util.JSON.encode(dataToParse_domain_users);

	// -----------------------	GET DOMAIN GROUPS AND CONVERT THEM TO JSON FORMAT
	// get Front grid object
	frontGrid_domain_groups = Ext.getCmp(ID_SH_FOLD_FRONT_GRID + "domain_groups");
	// get the elements of the grid
	store_domain_groups = frontGrid_domain_groups.getStore();
	records_domain_groups = store_domain_groups.getRange();
	// get members of each group
	//------- //  records_domain_groups= store_domain_groups.allData.items;
	// Create temporal arrays to parse data as JSON object
	dataToParse_domain_groups= new Array(records_domain_groups.length);
	for (var i = 0; i < records_domain_groups.length; i++) {
		dataToParse_domain_groups[i] = new Array(3);
		dataToParse_domain_groups[i][0] = records_domain_groups[i].data.name;
		dataToParse_domain_groups[i][1] = records_domain_groups[i].data.permissions;
	}
	var jsonData_domain_groups = Ext.util.JSON.encode(dataToParse_domain_groups);
	
	// -----------------------	GET EXTERNAL USERS AND CONVERT THEM TO JSON FORMAT
	// get Front grid object
	frontGrid_ext_users= Ext.getCmp(ID_SH_FOLD_FRONT_GRID + "ext_users");
	// get the elements of the grid
	store_ext_users = frontGrid_ext_users.getStore();
	records_ext_users = store_ext_users.getRange();
	// get members of each group
	//------- //  records_ext_users = store_ext_users.allData.items;
	// Create temporal arrays to parse data as JSON object
	dataToParse_ext_users = new Array(records_ext_users.length);
	for (var i = 0; i < records_ext_users.length; i++) {
		dataToParse_ext_users[i] = new Array(3);
		dataToParse_ext_users[i][0] = records_ext_users[i].data.name;
		dataToParse_ext_users[i][1] = records_ext_users[i].data.permissions;
	}
	var jsonData_ext_users = Ext.util.JSON.encode(dataToParse_ext_users);

	form.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: bufaction,
			axsConfig_local_users: jsonData_local_users,
			axsConfig_local_groups: jsonData_local_groups,
			axsConfig_domain_users: jsonData_domain_users,
			axsConfig_domain_groups: jsonData_domain_groups,
			axsConfig_ext_users: jsonData_ext_users
		},
		waitMsg: S('msg_saving_data'),
		success: function() {
			resetCookie();
			shFolders_processAuth();
			update_header(false, 'sh_fold_header', '');
			getLeftPanelInfo(MENU_INDEX_SHFOLD);
		},
		failure: function(form, action) {
			formFailureFunction(action);
		}
	});
}

// Description: Displays a popup window to show the user/groups that can be added to the grid of the active tab
function shFolders_addMemberPopup(type) {
	var popupPanel;
	var addMemberWin;
	var frontGridId;
	var addMemberBtn;

	frontGridId = ID_SH_FOLD_FRONT_GRID;
	addMemberWin = Ext.getCmp(ID_SH_FOLD_MEMBER_POPUP_WIN + type);
	addMemberBtn = Ext.getCmp('addMember' + type);
	addMemberBtn.disable();

	if (addMemberWin == undefined) {
		create_popup_window(frontGridId, type);
	}
	else {
		addMemberWin.show();
	}
}

function shFolders_cancel() {
	shFolders_processAuth();
	update_header(false, 'sh_fold_header', '');
}

function shFolders_populateRadioAndAxsRestrictions(data) {
	var attributes;
	var recycle;
	var axsRestrict;
	var frontGrid;

	// Select Shared Folder Attribute radio button: Read Only | Read & Write
	attributes = data.attributes;
	Ext.getCmp(attributes).setValue(true);

	// Select Recycle bin radio button: 1 | 0
	recycle = data.recycle;
	Ext.getCmp('recy_' + recycle).setValue(true);

	// Select Access Restrictions radio button: On | Off 
	axsRestrict = data.axsRestrict;

	if (axsRestrict == 'on') {
		Ext.getCmp('axsRestrictionsFS').expand();
	}
}

function shFolders_populateVisible(data) {
	var visible;

	if (data.visible) {
		visible = data.visible;
	}

	if (visible == 1) {
		Ext.getCmp('visible_1').setValue(true);
	}
	else {
		Ext.getCmp('visible_0').setValue(true);
	}
}

function shFolders_loadForm(form, shareName, createMode) {
	// ....: Load current settings :.... 
	form.load({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_SHARE + shareName
		},
		waitMsg: S('msg_loading_data'),
		failure: function(f, action) {
			formFailureFunction(action);
		},
		draggable: false,
		success: function(f, action) {
			resetCookie();

			var decodedResponse = Ext.decode(action.response.responseText);
			var data = decodedResponse.data[0]; // Only one record was returned	

			if (shareName != 'info') {
				loadGrid(ID_SH_FOLD_FRONT_GRID , shareName, 'local_groups');
				if ((networkType == 'domain') ||  (networkType == 'ad')) {
					Ext.getCmp('domainUsersViewBtn').show();
					Ext.getCmp('domainGroupsViewBtn').show();
					loadGrid(ID_SH_FOLD_FRONT_GRID , shareName, 'domain_users');
					loadGrid(ID_SH_FOLD_FRONT_GRID , shareName, 'domain_groups');
				}

				if ((networkType == 'workgroup') && (authServerType == 'server')) {
					Ext.getCmp('extUsersViewBtn').show();
					loadGrid(ID_SH_FOLD_FRONT_GRID , shareName, 'ext_users');
				}
			
				shFolders_populateRadioAndAxsRestrictions(data);
				var vol = data.volume;
				if (createMode) {
					Ext.getCmp('volume_field').setValue(vol);
				}
				else {
					Ext.getCmp('volume_field').setValue(S(vol));
				}
			}
			else {
				shFolders_populateVisible(data);
			}
			show_local_users_grid(shareName);
			loadGrid(ID_SH_FOLD_FRONT_GRID , shareName, 'local_users');
			Ext.getCmp('localUsersViewBtn').toggle(true);

			localUsersLoaded = true;
			localGroupsLoaded = true;
			domainUsersLoaded = true;
			domainGroupsLoaded = true;
			extUsersLoaded = true;
		}
	});
}
