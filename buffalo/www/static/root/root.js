// .: PATHS :.
var shFolders_path = 'menus/shFolders';
var network_path = 'menus/network';
var system_path = 'menus/system';
var usrGrp_path = 'menus/usrGrpMnt';
var extensions_path = 'menus/extensions';
var volumes_path = 'menus/volumes';
var basic_path = 'menus/basic';
var status_path = 'menus/status';
var ext_locale_path = 'ext-ux';

var document_title;
var userPageMode;
var userLoginName;
var welcome;
var logout;
var SUBMENU_RENDER_TO = 'pageName';
var help_window;
var wait_img = 'ext/resources/images/default/grid/wait.gif';

// .: JS SCRIPT LOAD FLAGS :.
var shFolders_js_loaded = false;
var leftPanel_js_loaded = false;
var network_js_loaded = false;
var system_js_loaded = false;
var usrGrp_js_loaded = false;
var extjs_locale_loaded = false;
var extensions_js_loaded = false;
var iscsi_extensions_js_loaded = false;
var basic_js_loaded = false;
var status_js_loaded = false;

// .: LANGUAGE OBJECT :.
var langDictionary;
var langDictionary_en;

//.: FEATURES OBJECT :.
var featureList;

// .: OTHERS :.
var menuHeader;		//e.g. "Shared Folders"
var menuSubHeader;
var selected_menu = '';		// flag to keep track which menu is selected
var cmp_selected_menu = '';
var selected_sub_menu = '';		// flag to keep track which submenu is selected
var cmp_selected_sub_menu = '';
var add_imhere;

// menu indexes for left panel update
var MENU_INDEX_SHFOLD = 1;
var MENU_INDEX_USRGRP = 2;
var MENU_INDEX_NETWORK = 3;
var MENU_INDEX_SYSTEM = 4;
var MENU_INDEX_EXTENSIONS = 5;
var MENU_INDEX_ISCSI = 6;

var UPDATING_FIRMWARE = false;

// .: Variables for the supported features :.
var add_ad_nt;
var user_add_quota;
var user_add_quota_soft;
var group_add_quota;
var group_add_quota_soft;
var add_imhere;
var add_shutdown;
var add_nfs;
var add_upsRecover;
var add_upsSerial;
var add_upsUsb;
var add_lvm;
var add_dfs;
var add_raid;
var add_edp_plus;
var add_offlineFiles;
var add_hiddenShare;
var add_hotSwap;
var add_frontPanel;
var add_syslog;
var add_alertSound;
var add_trunking;
var add_repli;
var add_csv;
var add_sftp;
var add_mapping;
var add_ssl;
var add_sleepTimerDate;
var add_sleepTimer;
var add_secureBoot;
var add_directCopy;
var add_hddSpindown;
var add_smpt_auth;
var add_reboot;
var add_webAxs;
var add_pocketu;
var add_flickr;
var add_dlna;
var add_itunes;
var add_eth;
var add_teraSearch;
var series_name;
var add_bitTorrnet;
var add_encrypt;
var add_trashbox;
var add_deviceserver;
var add_printserver;
var add_timemachine;
var add_timemachine_native;
var add_dtcpip;
var add_fan;
var add_iscsi;
var add_webserver;
var add_mysqlserver;
var add_ntfs_write;
var add_wol;
var add_hardlink_backup;
var add_snmp;
var add_tmnas;
var add_eyefi;
var add_squeezebox;
var add_init_sw;
var add_fwupdate;
var add_mc;
var add_wafs;

var product_name;
var IS_ISCSI_RUNNING = false;
var workingmode;
var deviceservermode;
var eyefimode;
var max_usbdisk_num;

Ext.QuickTips.init();
Ext.form.Field.prototype.msgTarget = 'qtip';

function get_features() {
	add_ad_nt = has_feature("SUPPORT_AD_NT_DOMAIN");
	user_add_quota = has_feature('SUPPORT_USER_QUOTA');
	user_add_quota_soft = has_feature('SUPPORT_USER_QUOTA_SOFT');
	group_add_quota = has_feature('SUPPORT_GROUP_QUOTA');
	group_add_quota_soft = has_feature('SUPPORT_GROUP_QUOTA_SOFT');
	add_imhere = has_feature('SUPPORT_IMHERE');
	add_shutdown = has_feature("SUPPORT_SHUTDOWN_FROMWEB");
	add_nfs = has_feature("SUPPORT_NFS");
	add_upsRecover = has_feature("SUPPORT_UPS_RECOVER");
	add_upsSerial = has_feature("SUPPORT_UPS_SERIAL");
	add_upsUsb = has_feature("SUPPORT_UPS_USB");
	add_lvm = has_feature("SUPPORT_LVM");
	add_dfs = has_feature("SUPPORT_SAMBA_DFS");
	add_raid = has_feature("SUPPORT_RAID");
	add_edp_plus = has_feature("SUPPORT_EDP_PLUS");

	add_offlineFiles = has_feature("SUPPORT_OFFLINEFILE");
	add_hiddenShare = has_feature("SUPPORT_HIDDEN_SHARE");
	add_hotSwap = has_feature("SUPPORT_HOT_SWAP");
	add_frontPanel = has_feature("SUPPORT_LCD");
	add_syslog = has_feature("SUPPORT_SYSLOG_FORWARD");
	add_alertSound = has_feature("SUPPORT_ALERT");
	add_trunking = has_feature("SUPPORT_PORT_TRUNKING");
	add_repli = has_feature("SUPPORT_REPLICATION");
	add_csv = has_feature("SUPPORT_USER_GROUP_CSV");
	add_sftp = has_feature("SUPPORT_SFTP");
	add_mapping = has_feature("SUPPORT_SERVICE_MAPPING");
	add_ssl = has_feature("SUPPORT_SSLKEY_IMPORT");
	add_sleepTimerDate = has_feature("SUPPORT_SLEEPTIMER_DATE");
	add_sleepTimer = has_feature("SUPPORT_SLEEP_TIMER");
	add_secureBoot = has_feature("SUPPORT_SECURE_BOOT");
	add_directCopy = has_feature("SUPPORT_DIRECT_COPY");
	add_hddSpindown = has_feature("SUPPORT_HDD_SPINDOWN");
	add_smpt_auth = has_feature("SUPPORT_SMTP_AUTH");
	add_reboot = has_feature("SUPPORT_REBOOT_FROMWEB");
	add_webAxs = has_feature("SUPPORT_WEBAXS");
	add_bitTorrnet = has_feature("SUPPORT_BITTORRENT");
	add_dlna = has_feature("SUPPORT_DLNA_SERVER");
	add_itunes = has_feature("SUPPORT_ITUNES_SERVER");
	add_teraSearch = has_feature("SUPPORT_TERA_SEARCH");
	add_encrypt = has_feature("SUPPORT_DISK_ENCRYPT");
	add_trashbox = has_feature("SUPPORT_CLEANUP_ALL_TRASHBOX");
	add_deviceserver = has_feature("SUPPORT_SXUPTP");
	add_printserver = has_feature("SUPPORT_PRINTER_SERVER");
	add_timemachine = has_feature("SUPPORT_TIME_MACHINE");
	add_timemachine_native = has_feature("SUPPORT_TIME_MACHINE_NATIVE");
	add_dtcpip = has_feature("SUPPORT_DTCP_IP");
	add_fan = has_feature("SUPPORT_FAN");
	add_iscsi = has_feature("SUPPORT_ISCSI");
	add_webserver = has_feature("SUPPORT_APACHE");
	add_mysqlserver = has_feature("SUPPORT_MYSQL");
	add_pocketu = has_feature("SUPPORT_POCKETU");
	add_flickr = has_feature("SUPPORT_FLICKRFS");
	add_wafs = has_feature("SUPPORT_WAFS");
	add_eyefi = has_feature("SUPPORT_EYEFI");
	add_squeezebox = has_feature("SUPPORT_SQUEEZEBOX");
	add_init_sw = has_feature_value("SUPPORT_INIT_SW");
	add_fwupdate = has_feature("SUPPORT_OL_UPDATE");
	add_mc = has_feature("SUPPORT_MC");

	add_ntfs_write = has_feature("SUPPORT_NTFS_WRITE");
	add_wol = has_feature("SUPPORT_WOL");
	add_hardlink_backup = has_feature("SUPPORT_HARDLINK_BACKUP");
	add_snmp = has_feature("SUPPORT_SNMP");

	series_name = has_feature_value("SERIES_NAME");
	product_name = has_feature_value("PRODUCT_NAME");
	workingmode = has_feature_value("workingmode");
	antivirus = has_feature_value("SUPPORT_AV");
	deviceservermode = has_feature_value("deviceservermode");
	eyefimode = has_feature_value("eyefimode");
	up_notify = has_feature_value("up_notify");

	// for LS-AVL (nothing USB port)
	max_usbdisk_num = has_feature_value("MAX_USBDISK_NUM");
	if (max_usbdisk_num == 0) {
		add_directCopy = 0;
		add_printserver = 0;
	}

	var supported_eth = has_feature_value("DEVICE_NETWORK_NUM");
	if (supported_eth == 2) {
		add_eth = true;
	}
	else {
		add_eth = false;
	}
}

// .::::::::::::::::::: FUNCTIONS USED FOR LOADING REQUIRED JS FILES :::::::::::::::::::.
function load_extjs_customized_locale() {
	if (!extjs_locale_loaded) {
		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = ext_locale_path + "/ux-ext-lang.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
	}
	extjs_locale_loaded = true;
}

function loadSharedFoldersFiles() {
	if (!shFolders_js_loaded) {
		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = shFolders_path + "/shFold_vars.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = shFolders_path + "/shFold_popup_grid.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = shFolders_path + "/shFold_editable_grid.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = shFolders_path + "/shFold_editable_form.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = shFolders_path + "/shFold_main_form.js";

		var f6 = document.createElement("script");
		f6.type = 'text/javascript';
		f6.src = shFolders_path + "/shFold_directCopy.js";

		var f7 = document.createElement("script");
		f7.type = 'text/javascript';
		f7.src = shFolders_path + "/shFold_dfs.js";

		var f8 = document.createElement("script");
		f8.type = 'text/javascript';
		f8.src = shFolders_path + "/shFold_indexSearch.js";

		var f9 = document.createElement("script");
		f9.type = 'text/javascript';
		f9.src = shFolders_path + "/shFold_common.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
		document.getElementsByTagName("head")[0].appendChild(f6);
		document.getElementsByTagName("head")[0].appendChild(f7);
		document.getElementsByTagName("head")[0].appendChild(f8);
		document.getElementsByTagName("head")[0].appendChild(f9);
	}
	shFolders_js_loaded = true;
}

function loadUsrGrpFiles_usrOnly() {
	if (!usrGrp_js_loaded) {

		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = usrGrp_path + "/usrGrp_vars.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = usrGrp_path + "/usrGrp_user.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
	}
	usrGrp_js_loaded = true;
}

function loadUsrGrpFiles() {
	if (!usrGrp_js_loaded) {

		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = usrGrp_path + "/usrGrp_vars.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = usrGrp_path + "/usrGrp_user.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = usrGrp_path + "/usrGrp_group.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = usrGrp_path + "/usrGrp_external_users.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = usrGrp_path + "/usrGrp_domain_users.js";

		var f6 = document.createElement("script");
		f6.type = 'text/javascript';
		f6.src = usrGrp_path + "/usrGrp_domain_groups.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
		document.getElementsByTagName("head")[0].appendChild(f6);
	}
	usrGrp_js_loaded = true;
}

function loadNetworkFiles() {
	if (!network_js_loaded) {

		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = network_path + "/net_vars.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = network_path + "/settings/network_settings_main.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = network_path + "/settings/ipSettings.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = network_path + "/settings/services.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = network_path + "/settings/ethSettings.js";

		var f6 = document.createElement("script");
		f6.type = 'text/javascript';
		f6.src = network_path + "/domain/domain.js";

		var f7 = document.createElement("script");
		f7.type = 'text/javascript';
		f7.src = network_path + "/nfs/nfsService.js";

		var f8 = document.createElement("script");
		f8.type = 'text/javascript';
		f8.src = network_path + "/nfs/nfsFoldersSetup.js";

		var f9 = document.createElement("script");
		f9.type = 'text/javascript';
		f9.src = network_path + "/nfs/nfsClient.js";

		var f10 = document.createElement("script");
		f10.type = 'text/javascript';
		f10.src = network_path + "/settings/portGroup.js";

		var f11 = document.createElement("script");
		f11.type = 'text/javascript';
		f11.src = network_path + "/nfs/network_nfs_main.js";

		var f12 = document.createElement("script");
		f12.type = 'text/javascript';
		f12.src = network_path + "/webserver/webserver.js";

		var f13 = document.createElement("script");
		f13.type = 'text/javascript';
		f13.src = network_path + "/webserver/phpSettings.js";

		var f14 = document.createElement("script");
		f14.type = 'text/javascript';
		f14.src = network_path + "/webserver/webserver_main.js";

		var f15 = document.createElement("script");
		f15.type = 'text/javascript';
		f15.src = network_path + "/mysqlserver/mysqlserver.js";

		var f16 = document.createElement("script");
		f16.type = 'text/javascript';
		f16.src = network_path + "/snmp/snmpSetting.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
		document.getElementsByTagName("head")[0].appendChild(f6);
		document.getElementsByTagName("head")[0].appendChild(f7);
		document.getElementsByTagName("head")[0].appendChild(f8);
		document.getElementsByTagName("head")[0].appendChild(f9);
		document.getElementsByTagName("head")[0].appendChild(f10);
		document.getElementsByTagName("head")[0].appendChild(f11);
		document.getElementsByTagName("head")[0].appendChild(f12);
		document.getElementsByTagName("head")[0].appendChild(f13);
		document.getElementsByTagName("head")[0].appendChild(f14);
		document.getElementsByTagName("head")[0].appendChild(f15);
		document.getElementsByTagName("head")[0].appendChild(f16);
	}
	network_js_loaded = true;
}

function loadIscsiVolumesFiles() {
	var f1 = document.createElement("script");
	f1.type = 'text/javascript';
	f1.src = volumes_path + "/volumes/volumes.js";

	var f2 = document.createElement("script");
	f2.type = 'text/javascript';
	f2.src = volumes_path + "/volumes/volumes_vars.js";

	var f3 = document.createElement("script");
	f3.type = 'text/javascript';
	f3.src = volumes_path + "/volumes/volumes_main.js";

	var f4 = document.createElement("script");
	f4.type = 'text/javascript';
	f4.src = volumes_path + "/lvm/volumes_lvm.js";

	var f5 = document.createElement("script");
	f5.type = 'text/javascript';
	f5.src = volumes_path + "/lvm/volumes_lvm_vars.js";

	document.getElementsByTagName("head")[0].appendChild(f1);
	document.getElementsByTagName("head")[0].appendChild(f2);
	document.getElementsByTagName("head")[0].appendChild(f3);
	document.getElementsByTagName("head")[0].appendChild(f4);
	document.getElementsByTagName("head")[0].appendChild(f5);
}

function loadExtensionsFiles() {
	if (!iscsi_extensions_js_loaded) {

		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = extensions_path + "/webaxs/extentions_webaxs_vars.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
	}
	iscsi_extensions_js_loaded = true;
}

function loadSystemFiles() {
	if (!system_js_loaded) {
		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = system_path + "/settings/system_settings_vars.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = system_path + "/settings/system_settings_dateTime.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = system_path + "/settings/system_settings_hostname.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = system_path + "/settings/system_settings_lang.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = system_path + "/settings/system_settings_main.js";

		var f6 = document.createElement("script");
		f6.type = 'text/javascript';
		f6.src = system_path + "/backups/diskJobs_vars.js";

		var f7 = document.createElement("script");
		f7.type = 'text/javascript';
		f7.src = system_path + "/backups/diskJobs_editable_form.js";

		var f8 = document.createElement("script");
		f8.type = 'text/javascript';
		f8.src = system_path + "/backups/diskJobs_editable_grid.js";

		var f9 = document.createElement("script");
		f9.type = 'text/javascript';
		f9.src = system_path + "/backups/diskJobs_deviceList.js";

		var f10 = document.createElement("script");
		f10.type = 'text/javascript';
		f10.src = system_path + "/backups/backup_main_form.js";

		var f11 = document.createElement("script");
		f11.type = 'text/javascript';
		f11.src = system_path + "/disk/diskMgmt_vars.js";

		var f12 = document.createElement("script");
		f12.type = 'text/javascript';
		f12.src = system_path + "/disk/diskMgmt_main.js";

		var f13 = document.createElement("script");
		f13.type = 'text/javascript';
		f13.src = system_path + "/maintenance/system_maint_vars.js";

		var f14 = document.createElement("script");
		f14.type = 'text/javascript';
		f14.src = system_path + "/maintenance/system_maint_emailNotification.js";

		var f15 = document.createElement("script");
		f15.type = 'text/javascript';
		f15.src = system_path + "/powerManagement/powerManagement_upsSettings.js";

		var f301 = document.createElement("script");
		f301.type = 'text/javascript';
		f301.src = system_path + "/maintenance/system_maint_syslog.js";

		var f16 = document.createElement("script");
		f16.type = 'text/javascript';
		f16.src = system_path + "/maintenance/system_maint_restart.js";

		var f17 = document.createElement("script");
		f17.type = 'text/javascript';
		f17.src = system_path + "/maintenance/system_maint_main.js";

		var f18 = document.createElement("script");
		f18.type = 'text/javascript';
		f18.src = system_path + "/restore_format/system_restoreFormat_vars.js";

		var f19 = document.createElement("script");
		f19.type = 'text/javascript';
		f19.src = system_path + "/restore_format/system_restoreFormat_restore.js";

		var f20 = document.createElement("script");
		f20.type = 'text/javascript';
		f20.src = system_path + "/restore_format/system_restoreFormat_format.js";

		var f21 = document.createElement("script");
		f21.type = 'text/javascript';
		f21.src = system_path + "/restore_format/system_restoreFormat_main.js";

		var f22 = document.createElement("script");
		f22.type = 'text/javascript';
		f22.src = extensions_path + "/webaxs/extensions_webaxs_main.js";

		var f23 = document.createElement("script");
		f23.type = 'text/javascript';
		f23.src = extensions_path + "/webaxs/extensions_webaxs_vars.js";

		var f24 = document.createElement("script");
		f24.type = 'text/javascript';
		f24.src = extensions_path + "/webaxs/extensions_webaxs_service.js";

		var f25 = document.createElement("script");
		f25.type = 'text/javascript';
		f25.src = extensions_path + "/mediaserver/extensions_mediaserver_main.js";

		var f26 = document.createElement("script");
		f26.type = 'text/javascript';
		f26.src = extensions_path + "/mediaserver/extensions_mediaserver_vars.js";

		var f27 = document.createElement("script");
		f27.type = 'text/javascript';
		f27.src = extensions_path + "/mediaserver/extensions_mediaserver_dlna_service.js";

		var f28 = document.createElement("script");
		f28.type = 'text/javascript';
		f28.src = extensions_path + "/mediaserver/extensions_mediaserver_dlna_client.js";

		var f29 = document.createElement("script");
		f29.type = 'text/javascript';
		f29.src = extensions_path + "/mediaserver/extensions_mediaserver_itunes_service.js";

		var f30 = document.createElement("script");
		f30.type = 'text/javascript';
		f30.src = extensions_path + "/mediaserver/extensions_mediaserver_squeezebox_service.js";

		var f100 = document.createElement("script");
		f100.type = 'text/javascript';
		f100.src = extensions_path + "/security/extensions_security_main.js";

		var f101 = document.createElement("script");
		f101.type = 'text/javascript';
		f101.src = extensions_path + "/security/extensions_security_vars.js";

		var f102 = document.createElement("script");
		f102.type = 'text/javascript';
		f102.src = extensions_path + "/security/extensions_security_security.js";

		var f103 = document.createElement("script");
		f103.type = 'text/javascript';
		f103.src = extensions_path + "/printserver/extensions_printserver_main.js";

		var f104 = document.createElement("script");
		f104.type = 'text/javascript';
		f104.src = extensions_path + "/printserver/extensions_printserver_vars.js";

		var f105 = document.createElement("script");
		f105.type = 'text/javascript';
		f105.src = extensions_path + "/printserver/extensions_printserver_service.js";

		var f106 = document.createElement("script");
		f106.type = 'text/javascript';
		f106.src = extensions_path + "/bittorrent/extensions_bittorrent_main.js";

		var f107 = document.createElement("script");
		f107.type = 'text/javascript';
		f107.src = extensions_path + "/bittorrent/extensions_bittorrent_vars.js";

		var f108 = document.createElement("script");
		f108.type = 'text/javascript';
		f108.src = extensions_path + "/bittorrent/extensions_bittorrent_service.js";

		var f109 = document.createElement("script");
		f109.type = 'text/javascript';
		f109.src = system_path + "/powerManagement/powerManagement_main.js";

		var f110 = document.createElement("script");
		f110.type = 'text/javascript';
		f110.src = system_path + "/powerManagement/powerManagement_vars.js";

		var f111 = document.createElement("script");
		f111.type = 'text/javascript';
		f111.src = system_path + "/powerManagement/powerManagement_sleeptimer.js";

		var f112 = document.createElement("script");
		f112.type = 'text/javascript';
		f112.src = extensions_path + "/timemachine/extensions_timemachine_main.js";

		var f113 = document.createElement("script");
		f113.type = 'text/javascript';
		f113.src = extensions_path + "/timemachine/extensions_timemachine_vars.js";

		var f114 = document.createElement("script");
		f114.type = 'text/javascript';
		f114.src = extensions_path + "/timemachine/extensions_timemachine_service.js";

		var f115 = document.createElement("script");
		f115.type = 'text/javascript';
		f115.src = extensions_path + "/eyefi/extensions_eyefi_main.js";

		var f116 = document.createElement("script");
		f116.type = 'text/javascript';
		f116.src = extensions_path + "/eyefi/extensions_eyefi_management.js";

		var f117 = document.createElement("script");
		f117.type = 'text/javascript';
		f117.src = extensions_path + "/eyefi/extensions_eyefi_vars.js";	
		
		var f200 = document.createElement("script");
		f200.type = 'text/javascript';
		f200.src = system_path + "/maintenance/system_maint_shutdown.js";

		var f201 = document.createElement("script");
		f201.type = 'text/javascript';
		f201.src = system_path + "/maintenance/system_maint_alertSound.js";

		var f202 = document.createElement("script");
		f202.type = 'text/javascript';
		f202.src = system_path + "/maintenance/system_maint_frontPanel.js";

		var f203 = document.createElement("script");
		f203.type = 'text/javascript';
		f203.src = system_path + "/disk/diskMgmt_diskBasic.js";
/*
		var f204 = document.createElement("script");
		f204.type = 'text/javascript';
		f204.src = system_path + "/disk/diskMgmt_volumes.js";
*/
		var f205 = document.createElement("script");
		f205.type = 'text/javascript';
		f205.src = system_path + "/backups/backup_jobs.js";

		var f206 = document.createElement("script");
		f206.type = 'text/javascript';
		f206.src = system_path + "/backups/diskJobs_replication.js";

		var f207 = document.createElement("script");
		f207.type = 'text/javascript';
		f207.src = system_path + "/disk/diskMgmt_array.js";

		var f208 = document.createElement("script");
		f208.type = 'text/javascript';
		f208.src = system_path + "/disk/diskMgmt_arrayMaint.js";

		var f300 = document.createElement("script");
		f300.type = 'text/javascript';
		f300.src = system_path + "/powerManagement/powerManagement_hdd.js";

		// ***** NOTE ******  f301 is in used before f16 !important

		var f302 = document.createElement("script");
		f302.type = 'text/javascript';
		f302.src = system_path + "/settings/system_settings_management.js";

		var f303 = document.createElement("script");
		f303.type = 'text/javascript';
		f303.src = system_path + "/ping/system_ping.js";

		var f304 = document.createElement("script");
		f304.type = 'text/javascript';
		f304.src = system_path + "/ping/system_ping_vars.js";

		var f305 = document.createElement("script");
		f305.type = 'text/javascript';
		f305.src = extensions_path + "/pocketu/extensions_pocketu_vars.js";

		var f306 = document.createElement("script");
		f306.type = 'text/javascript';
		f306.src = extensions_path + "/pocketu/extensions_pocketu_main.js";

		var f307 = document.createElement("script");
		f307.type = 'text/javascript';
		f307.src = extensions_path + "/pocketu/extensions_pocketu_service.js";

		var f308 = document.createElement("script");
		f308.type = 'text/javascript';
		f308.src = extensions_path + "/tmnas/extensions_tmnas_vars.js";

		var f309 = document.createElement("script");
		f309.type = 'text/javascript';
		f309.src = extensions_path + "/tmnas/extensions_tmnas_main.js";

		var f310 = document.createElement("script");
		f310.type = 'text/javascript';
		f310.src = extensions_path + "/tmnas/extensions_tmnas_service.js";

		var f311 = document.createElement("script");
		f311.type = 'text/javascript';
		f311.src = extensions_path + "/webservice/extensions_webservice_vars.js";

		var f312 = document.createElement("script");
		f312.type = 'text/javascript';
		f312.src = extensions_path + "/webservice/extensions_webservice_main.js";

		var f313 = document.createElement("script");
		f313.type = 'text/javascript';
		f313.src = extensions_path + "/webservice/extensions_webservice_flickr.js";

		var f314 = document.createElement("script");
		f314.type = 'text/javascript';
		f314.src = extensions_path + "/deviceserver/extensions_deviceserver_main.js";

		var f315 = document.createElement("script");
		f315.type = 'text/javascript';
		f315.src = extensions_path + "/deviceserver/extensions_deviceserver_vars.js";

		var f316 = document.createElement("script");
		f316.type = 'text/javascript';
		f316.src = extensions_path + "/deviceserver/extensions_deviceserver_service.js";

		var f317 = document.createElement("script");
		f317.type = 'text/javascript';
		f317.src = extensions_path + "/webservice/extensions_webservice_wafs.js";

		var f322 = document.createElement("script");
		f322.type = 'text/javascript';
		f322.src = system_path + "/maintenance/system_maint_firmware_update.js";

		var f323 = document.createElement("script");
		f323.type = 'text/javascript';
		f323.src = system_path + "/maintenance/system_maint_firmware_notification.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
		document.getElementsByTagName("head")[0].appendChild(f6);
		document.getElementsByTagName("head")[0].appendChild(f7);
		document.getElementsByTagName("head")[0].appendChild(f8);
		document.getElementsByTagName("head")[0].appendChild(f9);
		document.getElementsByTagName("head")[0].appendChild(f10);
		document.getElementsByTagName("head")[0].appendChild(f11);
		document.getElementsByTagName("head")[0].appendChild(f12);
		document.getElementsByTagName("head")[0].appendChild(f13);
		document.getElementsByTagName("head")[0].appendChild(f14);
		document.getElementsByTagName("head")[0].appendChild(f15);

		document.getElementsByTagName("head")[0].appendChild(f301); // f301 needs to be here, do not move!
		document.getElementsByTagName("head")[0].appendChild(f16);
		document.getElementsByTagName("head")[0].appendChild(f17);
		document.getElementsByTagName("head")[0].appendChild(f18);
		document.getElementsByTagName("head")[0].appendChild(f19);
		document.getElementsByTagName("head")[0].appendChild(f20);
		document.getElementsByTagName("head")[0].appendChild(f21);
		document.getElementsByTagName("head")[0].appendChild(f22);
		document.getElementsByTagName("head")[0].appendChild(f23);
		document.getElementsByTagName("head")[0].appendChild(f24);
		document.getElementsByTagName("head")[0].appendChild(f25);
		document.getElementsByTagName("head")[0].appendChild(f26);
		document.getElementsByTagName("head")[0].appendChild(f27);
		document.getElementsByTagName("head")[0].appendChild(f28);
		document.getElementsByTagName("head")[0].appendChild(f29);
		document.getElementsByTagName("head")[0].appendChild(f30);

		document.getElementsByTagName("head")[0].appendChild(f100);
		document.getElementsByTagName("head")[0].appendChild(f101);
		document.getElementsByTagName("head")[0].appendChild(f102);
		document.getElementsByTagName("head")[0].appendChild(f103);
		document.getElementsByTagName("head")[0].appendChild(f104);
		document.getElementsByTagName("head")[0].appendChild(f105);
		document.getElementsByTagName("head")[0].appendChild(f106);
		document.getElementsByTagName("head")[0].appendChild(f107);
		document.getElementsByTagName("head")[0].appendChild(f108);
		document.getElementsByTagName("head")[0].appendChild(f109);
		document.getElementsByTagName("head")[0].appendChild(f110);
		document.getElementsByTagName("head")[0].appendChild(f111);
		document.getElementsByTagName("head")[0].appendChild(f112);
		document.getElementsByTagName("head")[0].appendChild(f113);
		document.getElementsByTagName("head")[0].appendChild(f114);
		document.getElementsByTagName("head")[0].appendChild(f115);
		document.getElementsByTagName("head")[0].appendChild(f116);
		document.getElementsByTagName("head")[0].appendChild(f117);

		document.getElementsByTagName("head")[0].appendChild(f200);
		document.getElementsByTagName("head")[0].appendChild(f201);
		document.getElementsByTagName("head")[0].appendChild(f202);
		document.getElementsByTagName("head")[0].appendChild(f203);
//		document.getElementsByTagName("head")[0].appendChild(f204);
		document.getElementsByTagName("head")[0].appendChild(f205);
		document.getElementsByTagName("head")[0].appendChild(f206);
		document.getElementsByTagName("head")[0].appendChild(f207);
		document.getElementsByTagName("head")[0].appendChild(f208);

		document.getElementsByTagName("head")[0].appendChild(f300);
		document.getElementsByTagName("head")[0].appendChild(f302);
		document.getElementsByTagName("head")[0].appendChild(f303);
		document.getElementsByTagName("head")[0].appendChild(f304);

		document.getElementsByTagName("head")[0].appendChild(f305);
		document.getElementsByTagName("head")[0].appendChild(f306);
		document.getElementsByTagName("head")[0].appendChild(f307);

		document.getElementsByTagName("head")[0].appendChild(f308);
		document.getElementsByTagName("head")[0].appendChild(f309);
		document.getElementsByTagName("head")[0].appendChild(f310);

		document.getElementsByTagName("head")[0].appendChild(f311);
		document.getElementsByTagName("head")[0].appendChild(f312);
		document.getElementsByTagName("head")[0].appendChild(f313);

		document.getElementsByTagName("head")[0].appendChild(f314);
		document.getElementsByTagName("head")[0].appendChild(f315);
		document.getElementsByTagName("head")[0].appendChild(f316);
		document.getElementsByTagName("head")[0].appendChild(f317);

		document.getElementsByTagName("head")[0].appendChild(f322);
		document.getElementsByTagName("head")[0].appendChild(f323);
	}

	system_js_loaded = true;
}

function loadBasicFiles() {
	if (!basic_js_loaded) {
		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = basic_path + "/security/basic_security_adminSettings.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = basic_path + "/security/basic_security_main.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = basic_path + "/security/basic_security_vars.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = basic_path + "/security/basic_security_accessControl.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = basic_path + "/security/basic_hdd_tool.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
	}
	basic_js_loaded = true;
}
function loadStatusFiles() {
	if (!status_js_loaded) {
		var f1 = document.createElement("script");
		f1.type = 'text/javascript';
		f1.src = status_path + "/system/status_system.js";

		var f2 = document.createElement("script");
		f2.type = 'text/javascript';
		f2.src = status_path + "/network/status_network.js";

		var f3 = document.createElement("script");
		f3.type = 'text/javascript';
		f3.src = status_path + "/connHistory/status_connHistory.js";

		var f4 = document.createElement("script");
		f4.type = 'text/javascript';
		f4.src = status_path + "/statistics/status_statistics.js";

		var f5 = document.createElement("script");
		f5.type = 'text/javascript';
		f5.src = status_path + "/status_vars.js";

		document.getElementsByTagName("head")[0].appendChild(f1);
		document.getElementsByTagName("head")[0].appendChild(f2);
		document.getElementsByTagName("head")[0].appendChild(f3);
//		document.getElementsByTagName("head")[0].appendChild(f4);
		document.getElementsByTagName("head")[0].appendChild(f5);
	}
	status_js_loaded = true;
}

// ::::::::::::::::::: FUNCTIONS TO CREATE SUB-MENUS :::::::::::::::::::
// ...: Create Shared Folders Submenus :....
function showSubmenu_sharedFolders() {
	populate_left_panel(MENU_INDEX_SHFOLD);
	submenubar = Ext.get('section_sub_menu');
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	submenubar.removeClass('section_sub_menu_disabled');
	submenubar.removeClass('section_sub_menu_ext');
	submenubar.addClass('section_sub_menu');

	var subheader_1 = S('header_1_1');
	var subheader_2 = S('header_1_2');
	var subheader_3 = S('header_1_3');
	var subheader_4 = S('header_1_4');

	submenubar.createChild('<li id="btn_shareSetup"><a href="#" id="header_1_1"onClick="onClick_shareSetup(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');

	if (add_dfs) {
		submenubar.createChild('<li id="btn_dfs"><a href="#" id="header_1_2" onClick="onClick_dfs(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	}
	if (add_directCopy) {
		submenubar.createChild('<li id="btn_directCopy"><a href="#" id="header_1_3" onClick="onClick_directCopy(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
	}
	if (add_teraSearch) {
		submenubar.createChild('<li id="btn_indexSearch"><a href="#" id="header_1_4" onClick="onClick_indexSearch(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');
	}
	submenubar.setDisplayed('block');
	// first submenu is highlighted by default
	highlight_sub_menu('btn_shareSetup');
	shFolders_processAuth();
	display_help('shFolders');
}

// >>> onClick events for Shared Folders Submenus <<<
function onClick_shareSetup(subheader) {
	populate_left_panel(MENU_INDEX_SHFOLD);
	shFolders_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_shareSetup');
	display_help('shFolders');
}

function onClick_dfs(subheader) {
	populate_left_panel(MENU_INDEX_SHFOLD);
	dfs_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_dfs');
	display_help('dfs');
}

function onClick_directCopy(subheader) {
	populate_left_panel(MENU_INDEX_SHFOLD);
	directCopy_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_directCopy');
	display_help('directCopy');
}

function onClick_indexSearch(subheader) {
	populate_left_panel(MENU_INDEX_SHFOLD);
	indexSearch_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_indexSearch');
	display_help('indexSearch');
}

function showSubmenu_usrGroups() {
	submenubar = Ext.get('section_sub_menu');
	submenubar.removeClass('section_sub_menu_ext');

	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_DOMAIN_SETTINGS
		},
		method: 'POST',
		success: function (result) {
			// Get response from server
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				lang = getLangFromCookie();
				resetCookie();
				submenubar = Ext.get('section_sub_menu');

				if (submenubar) {
					while (submenubar.first()) {
						element = submenubar.first();
						element.remove();
					}
				}

				var subheader_1 = S('header_2_1');
				var subheader_2 = S('header_2_2');

				submenubar.createChild('<li id="btn_users"><a href="#" id="header_2_1" onClick="onClick_user(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
				submenubar.createChild('<li id="btn_groups"><a href="#" id="header_2_2"  onClick="onClick_group(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');

				var networkType = response.data[0].networkType;
				var authServerType = response.data[0].authServerType;

				if (networkType == 'workgroup' && authServerType == 'server') {
					var subheader_3 = S('header_2_3');
					submenubar.createChild('<li id="btn_external"><a href="#" id="header_2_3" onClick="onClick_external_users(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
				}

				if ((networkType == 'ad') || (networkType == 'domain')) {
					var domainName = response.data[0].adBios;
					var subheader_4 = S('header_2_4');
					var subheader_5 = S('header_2_5');
					submenubar.createChild('<li id="btn_domain_users"><a href="#" id="header_2_4" onClick="onClick_domain_users(\'' + subheader_4 + '\', \'' + domainName + '\');">' + subheader_4 + '</a></li>');
					submenubar.createChild('<li id="btn_domain_groups"><a href="#" id="subheader_5" onClick="onClick_domain_groups(\'' + subheader_5 + '\', \'' + domainName + '\');">' + subheader_5 + '</a></li>');
				}

				submenubar.setDisplayed('block');

				// first submenu is highlighted by default
				highlight_sub_menu('btn_users');
				display_help('user');
				populate_left_panel(MENU_INDEX_USRGRP);
				usrGrp_user_processAuth();
			}
			else {
				winAjaxFailureFunction(response);
			}
		}
	});
}

// >>> onClick events for Users/Groups Submenus <<<
function onClick_user(subheader) {
	populate_left_panel(MENU_INDEX_USRGRP);
	usrGrp_user_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
//	user_group_submenu_selection(0);
	highlight_sub_menu('btn_users');
	display_help('user');
}

function onClick_group(subheader) {
	populate_left_panel(MENU_INDEX_USRGRP);
	usrGrp_group_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_groups');
	display_help('group');
}

function onClick_external_users(subheader) {
	populate_left_panel(MENU_INDEX_USRGRP);
	external_users_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_external');
	display_help('external');
}

function onClick_domain_users(subheader, domainName) {
	populate_left_panel(MENU_INDEX_USRGRP);
	domain_users_processAuth(domainName);
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_domain_users');
	display_help('domain_users');
}
function onClick_domain_groups(subheader, domainName) {
	populate_left_panel(MENU_INDEX_USRGRP);
	domain_groups_processAuth(domainName);
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_domain_groups');
	display_help('domain_groups');
}

// ...: Create Users/Groups [restrict mode] Submenus :....
function showSubmenu_restrict_usrGroups() {
	populate_left_panel();

	submenubar = Ext.get('section_sub_menu');
	submenubar.removeClass('section_sub_menu_ext');

	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}

	var subheader_1 = S('header_2_1');
	var subheader_2 = S('header_2_2');

	submenubar.createChild('<li class="" id="btn_users"><a href="#" id="header_2_1" onClick="onClick_users_restrict(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	submenubar.createChild('<li class="" id="btn_groups"><a href="#" id="header_2_2"	onClick="onClick_groups_restrict(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	submenubar.setDisplayed('block');
	highlight_sub_menu('btn_users');
	display_help('user');
}

// >>> onClick events for Users/Groups [restrict mode] Submenus <<<
function onClick_users_restrict(subheader) {
	populate_left_panel(MENU_INDEX_USRGRP);
	usrGrp_user_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_users');
	display_help('user');
}

function onClick_groups_restrict(subheader) {
	populate_left_panel(MENU_INDEX_USRGRP);
	usrGrp_group_restrict_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_groups');
	display_help('group');
}

// ...: Create Users/Groups [User only] Submenus :....
function showSubmenu_usrOnly(userName) {
	submenubar = Ext.get('section_sub_menu');
	submenubar.removeClass('section_sub_menu_ext');

	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	var subheader_1 = S('header_2_1');
	submenubar.createChild('<li id="btn_users"><a href="#" id="header_2_1" onClick="onClick_user_only(\'' + subheader_1 + '\', \'' + userName + '\')">' + subheader_1 + '</a></li>');
	submenubar.setDisplayed('block');
	highlight_sub_menu('btn_users');
// populate_left_panel();
	display_help('user');
}

// >>> onClick events forUsers/Groups [User only] Submenus <<<
function onClick_user_only(subheader, userName) {
	updateHeaderContainer('pageName', '<h3' + subheader + '/h3>');
	highlight_sub_menu('btn_users');
	display_help('user');
}

// :... Users/Groups submenus END here ...:
// ...: Create Network Submenus :....
function showSubmenu_network() {
	populate_left_panel(MENU_INDEX_NETWORK);

	submenubar = Ext.get('section_sub_menu');
	submenubar.removeClass('section_sub_menu_ext');

	var wg_aTag_id;
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	var subheader_1 = S('header_3_1');
	var subheader_2;
	if (add_ad_nt) {
		subheader_2 = S('header_3_2_1');
		wg_aTag_id = 'header_3_2_1';
	}
	else {
		subheader_2 = S('header_3_2_2');
		wg_aTag_id = 'header_3_2_2';
	}

	subheader_3 = S('header_3_3');

	submenubar.createChild('<li class="" id="btn_settings"><a id="header_3_1" href="#" onClick="onClick_network_settings(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	submenubar.createChild('<li class="" id="btn_domain"><a href="#" id="' + wg_aTag_id + '" onClick="onClick_network_domain(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	if (add_nfs) {
		submenubar.createChild('<li class="" id="btn_nfs"><a href="#" id="header_3_3" onClick="onClick_nfs(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
	}
	if (add_webserver) {
		subheader_4 = S('header_3_4');
		submenubar.createChild('<li class="" id="btn_webserver"><a href="#" id="header_3_4" onClick="onClick_webserver(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');
	}
	if (add_mysqlserver) {
		subheader_5 = S('header_3_5');
		submenubar.createChild('<li class="" id="btn_mysqlserver"><a href="#" id="header_3_5" onClick="onClick_mysqlserver(\'' + subheader_5 + '\');">' + subheader_5 + '</a></li>');
	}
	
	if (add_snmp) {
		subheader_6 = S('header_3_6');
		submenubar.createChild('<li class="" id="btn_snmp"><a href="#" id="header_3_6" onClick="onClick_snmp(\'' + subheader_6 + '\');">' + subheader_6 + '</a></li>');
	}

	submenubar.setDisplayed('block');
	highlight_sub_menu('btn_settings');
	display_help('networkSettings');
}
// >>> onClick events for Network Submenus <<<
function onClick_network_settings(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	netSettings_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_settings');
	display_help('networkSettings');
}

function onClick_network_domain(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	netDomain_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_domain');
	display_help('networkDomain');
}

function onClick_nfs(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	nfs_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_nfs');
	display_help('nfs');
}

function onClick_webserver(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	webserver_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_webserver');
	display_help('webserver');
}

function onClick_mysqlserver(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	mysqlserver_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_mysqlserver');
	display_help('mysqlserver');
}

function onClick_snmp(subheader) {
	populate_left_panel(MENU_INDEX_NETWORK);
	snmp_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_snmp');
	display_help('snmp');
}

// :... Network submenus END here ...:
// ...: Create System Submenus :....
function showSubmenu_system(showSubmenu) {
	populate_left_panel(MENU_INDEX_NETWORK);

	submenubar = Ext.get('section_sub_menu');
	submenubar.removeClass('section_sub_menu_ext');

	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	var subheader_1 = S('header_4_1');
	var subheader_2 = S('header_4_2');
	var subheader_3 = S('header_4_3');
	var subheader_4 = S('header_4_4');
	var subheader_5 = S('header_4_5');
	var subheader_6 = S('header_4_6');

	submenubar.createChild('<li class="" id="btn_sys_settings"><a href="#" id="header_4_1" onClick="onClick_system_settings(\'' + subheader_1 + '\');" >' + subheader_1 + '</a></li>');
	submenubar.createChild('<li class="" id="btn_disks"><a href="#" id="header_4_2" onClick="onClick_system_disks(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	submenubar.createChild('<li class="" id="btn_jobs"><a href="#" id="header_4_3" onClick="onClick_system_jobs(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
	submenubar.createChild('<li class="" id="btn_maint"><a href="#" id="header_4_4" onClick="onClick_system_maint(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');

	// for french ' problem
//	submenubar.createChild('<li class="" id="btn_power"><a href="#" id="header_4_5" onClick="onClick_system_powerManagement(\''+ subheader_5 +'\');">'+ subheader_5 +'</a></li>');
	submenubar.createChild('<li class="" id="btn_power"><a href="#" id="header_4_5" onClick="onClick_system_powerManagement(\'subheader_5\');">' + subheader_5 + '</a></li>');

	submenubar.createChild('<li class="" id="btn_restErase"><a href="#" id="header_4_6" onClick="onClick_system_restFormat(\'' + subheader_6 + '\');">' + subheader_6 + '</a></li>');

	submenubar.setDisplayed('block');
	highlight_sub_menu(showSubmenu);
}

// >>> onClick events for System Submenus <<<
function onClick_system_settings(subheader) {
	populate_left_panel(MENU_INDEX_SYSTEM);
	system_settings_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_sys_settings');
	display_help('systemSettings');
}

function onClick_system_disks(subheader) {
	populate_left_panel(MENU_INDEX_SYSTEM);
	system_disk_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_disks');
	display_help('systemDisk');
}

function onClick_system_jobs(subheader) {
	populate_left_panel(MENU_INDEX_SYSTEM);
	system_jobs_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_jobs');
	display_help('systemBackup');
}

function onClick_system_maint(subheader) {
	populate_left_panel(MENU_INDEX_SYSTEM);
	system_maint_processAuth(ID_EMAIL_FORM);
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_maint');
	display_help('systemMaint');
}

function onClick_system_restFormat(subheader) {
	populate_left_panel(MENU_INDEX_SYSTEM);
	system_restFormat_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_restErase');
	display_help('systemRestore');
}

// :... System submenus END here ...:
// ...: Create Extensions Submenus :....
function showSubmenu_extensions() {
	populate_left_panel();

	submenubar = Ext.get('section_sub_menu');
	submenubar.addClass('section_sub_menu_ext');

	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	var subheader_1 = S('header_5_1');
	var subheader_2 = S('header_5_2');
	var subheader_3 = S('header_5_3');
	var subheader_4 = S('header_5_4');
//	var subheader_5 = S('header_5_5');
	var subheader_6 = S('header_5_6');
	var subheader_7 = S('header_5_7');
	var subheader_8 = S('header_5_8');
	var subheader_9 = S('header_5_9');
	var subheader_10 = S('header_5_10');
	var subheader_11 = S('header_5_11');
	var subheader_12 = S('header_5_12');

	if (add_webAxs) {
		submenubar.createChild('<li id="btn_webaxs"><a href="#" id="header_5_1" onClick="onClick_extensions_webaxs(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	}

	lang = getLangFromCookie();
	if (add_pocketu && lang == 'ja') {
		submenubar.createChild('<li id="btn_pocketu"><a href="#" id="header_5_8" onClick="onClick_extensions_pocketu(\'' + subheader_8 + '\');">' + subheader_8 + '</a></li>');
	}

	if (add_dlna || add_itunes || add_squeezebox) {
		submenubar.createChild('<li id="btn_mediaserver"><a href="#" id="header_5_2" onClick="onClick_extensions_mediaserver(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	}

	if (add_deviceserver) {
		submenubar.createChild('<li id="btn_deviceserver"><a href="#" id="header_5_11" onClick="onClick_extensions_deviceserver(\'subheader_11\');">' + subheader_11 + '</a></li>');
	}

	if (add_printserver) {
		// for french ' problem
//		submenubar.createChild('<li id="btn_printserver"><a href="#" id="header_5_3" onClick="onClick_extensions_printserver(\''+ subheader_3 +'\');">'+ subheader_3 +'</a></li>');
		submenubar.createChild('<li id="btn_printserver"><a href="#" id="header_5_3" onClick="onClick_extensions_printserver(\'subheader_3\');">' + subheader_3 + '</a></li>');
	}

	if (add_bitTorrnet) {
		submenubar.createChild('<li id="btn_bittorrent"><a href="#" id="header_5_4" onClick="onClick_extensions_bittorrent(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');
	}

	if (add_secureBoot) {
		submenubar.createChild('<li id="btn_secuirity"><a href="#" id="header_5_6" onClick="onClick_extensions_secuirity(\'' + subheader_6 + '\');">' + subheader_6 + '</a></li>');
	}

	if (add_timemachine) {
		submenubar.createChild('<li id="btn_timeMachine"><a href="#" id="header_5_7" onClick="onClick_extensions_timemachine(\'' + subheader_7 + '\');">' + subheader_7 + '</a></li>');
	}

	if (antivirus == 'splx') {
		submenubar.createChild('<li id="btn_tmnas"><a href="#" id="header_5_9" onClick="onClick_extensions_tmnas(\'' + subheader_9 + '\');">' + subheader_9 + '</a></li>');
	}

	if ((add_flickr) || (add_eyefi) || (add_wafs)) {
		submenubar.createChild('<li id="btn_webservice"><a href="#" id="header_5_10" onClick="onClick_extensions_webservice(\'' + subheader_10 + '\');">' + subheader_10 + '</a></li>');
	}
/*
	if (add_eyefi) {
		submenubar.createChild('<li id="btn_eyefi"><a href="#" id="header_5_12" onClick="onClick_extensions_eyefi(\'' + subheader_12 + '\');">' + subheader_12 + '</a></li>');
	}
*/
	submenubar.setDisplayed('block');
	highlight_sub_menu('btn_webaxs');
}

// >>> onClick events for Extensions Submenus <<<
function onClick_extensions_webaxs(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_webaxs_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_webaxs');
	display_help('webaxs');
}

function onClick_extensions_pocketu(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_pocketU_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_pocketu');
	display_help('pocketu');
}

function onClick_extensions_mediaserver(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_mediaserver_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_mediaserver');
	display_help('mediaserver');
}

function onClick_extensions_deviceserver(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_deviceserver_processAuth();
	updateHeaderContainer('pageName', '<h3>' + S('header_5_11') + '</h3>');
	highlight_sub_menu('btn_deviceserver');
	display_help('deviceserver');
}

function onClick_extensions_printserver(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_printserver_processAuth();
//	updateHeaderContainer('pageName', '<h3>'+ subheader +'</h3>');
	updateHeaderContainer('pageName', '<h3>' + S('header_5_3') + '</h3>');
	highlight_sub_menu('btn_printserver');
	display_help('printserver');
}

function onClick_extensions_bittorrent(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_bittorrent_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_bittorrent');
	display_help('bittorrent');
}

function onClick_extensions_secuirity(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_security_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_secuirity');
	display_help('security');
}

function onClick_extensions_timemachine(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_timemachine_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_timeMachine');
	display_help('timemachine');
}

function onClick_extensions_tmnas(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_tmnas_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_tmnas');
	display_help('tmnas');
}

function onClick_extensions_webservice(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_webservice_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_webservice');
	display_help('webservice');
}

function onClick_system_powerManagement(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	system_powerManagement_processAuth();
//	updateHeaderContainer('pageName', '<h3>'+ subheader + '</h3>');
	updateHeaderContainer('pageName', '<h3>' + S('header_4_5') + '</h3>');
	highlight_sub_menu('btn_power');
	display_help('sleeptimer');
}

function onClick_extensions_eyefi(subheader) {
	populate_left_panel(MENU_INDEX_EXTENSIONS);
	extensions_eyefi_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_eyefi');
	display_help('eye-fi');
}

// :... Extensions submenus END here ...:

// ::::::::::::::::::: FUNCTIONS FOR TOP MENUS :::::::::::::::::::
function shFold_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_1');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	hideHtmlElement('section_sub_menu');
	showSubmenu_sharedFolders();
	var HeaderContainerTitle = S('header_1_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(false);
	}
	highlight_menu('btn_shared_folders');

}

function usrGrp_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_2');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_usrGroups();

	var HeaderContainerTitle = S('header_2_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_user_groups');
}

function usrGrp_restrict_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_2');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	loadUsrGrpFiles();
	showSubmenu_restrict_usrGroups();
	usrGrp_user_processAuth();
	var HeaderContainerTitle = S('header_2_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_user_groups');
}

function network_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_3');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");

	netSettings_processAuth();
	var HeaderContainerTitle = S('header_3_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_network');
	showSubmenu_network();
//	display_help('networkSettings');
}

function system_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_4');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_system("btn_sys_settings");

	system_settings_processAuth();
	var HeaderContainerTitle = S('header_4_1');
	display_help('systemSettings');

	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_system');
}

function show_firmware_update(){
	getLeftPanelInfo(MENU_INDEX_SYSTEM);
	var leftPanelMenuHeader = S('header_4');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_system("btn_maint"); 
	
	system_maint_processAuth(ID_FIRMWARE_UPDATE);
	
	var HeaderContainerTitle = S('header_4_4');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if(Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_system');
}

function show_shutdown(){
	getLeftPanelInfo(MENU_INDEX_SYSTEM);
	var leftPanelMenuHeader = S('header_4');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_system("btn_maint"); 
	
	system_maint_processAuth(ID_SHUTDOWN_FORM);
	
	var HeaderContainerTitle = S('header_4_4');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if(Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_system');
}

function extensions_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_5');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_extensions();
	extensions_webaxs_processAuth();
	var HeaderContainerTitle = S('header_5_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_extensions');
	display_help('webaxs');
}

function usrOnly_afterLoadFn() {
	remove_useless_mask();
	showSubmenu_usrOnly(userLoginName)
/*
	var HeaderContainerTitle = S('header_2_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
*/
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_user_groups');
//	display_help('user');
}

function highlight_menu(menu_id) {
	// remove selection of the menu that is currently selected
	var current_menu = Ext.get(selected_menu);
	if (current_menu) current_menu.removeClass('section_menu_selected');

	// select the new menu
	var new_menu = Ext.get(menu_id);
	new_menu.addClass('section_menu_selected');
	selected_menu = menu_id;
}

function highlight_sub_menu(sub_menu_id) {
	// remove selection of the menu that is currently selected
	var current_sub_menu = Ext.get(selected_sub_menu);
	if (current_sub_menu) current_sub_menu.removeClass('section_sub_menu_selected');

	// select the new menu
	var new_sub_menu = Ext.get(sub_menu_id);
	new_sub_menu.addClass('section_sub_menu_selected');
	selected_sub_menu = sub_menu_id;
}

//	------------------------====  iscsi menus ===--------------------------------------
function iscsiVolume_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_10');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_iscsiVolumes();
//	iscsiVolumes_processAuth();
	var HeaderContainerTitle = S('header_6_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_iscsi_volume');
	display_help('volumes');
}

function basic_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_10');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_basic();
//	system_settings_processAuth();
	var HeaderContainerTitle = S('header_7_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_basic');
	display_help('settings');
}

function maintenance_afterLoadFn(autoLoad, menuHeader, submenu, pageHeader, pageFn, expandRebootForm) {
	remove_useless_mask();
//	var leftPanelMenuHeader = S('header_10');
	var leftPanelMenuHeader = S('header_10');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_maintenance(autoLoad, submenu, pageFn, expandRebootForm);
//	pageFn(expandRebootForm);
//	var HeaderContainerTitle = S('header_8_1');
	var HeaderContainerTitle = S(pageHeader);
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}

	highlight_menu(menuHeader);
	display_help('maintenance');
}
function status_afterLoadFn() {
	remove_useless_mask();
	var leftPanelMenuHeader = S('header_10');
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
	showSubmenu_status();
//	iscsiVolumes_processAuth();
	var HeaderContainerTitle = S('header_9_1');
	updateHeaderContainer("pageName", "<h3>" + HeaderContainerTitle + "</h3>");
	if (Ext.isIE6) {
		adjust_left_sidebar(true);
	}
	highlight_menu('btn_status');
	display_help('systemStatus');
}

// ------------------------==== iscsi submenus starts here ===--------------------------------------
// ...: Create submenu iscsiVolumes :....
function showSubmenu_iscsiVolumes() {
	populate_left_panel();
	submenubar = Ext.get('section_sub_menu');
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	submenubar.removeClass('section_sub_menu_disabled');
	submenubar.addClass('section_sub_menu');

	var subheader_1 = S('header_6_1');
	var subheader_2 = S('header_6_2');

	submenubar.createChild('<li id="btn_volumes_volSetup"><a href="#" id="header_6_1"onClick="onClick_volSetup(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	submenubar.createChild('<li id="btn_volumes_lvmSetup"><a href="#" id="header_6_2"onClick="onClick_lvmSetup(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');

	submenubar.setDisplayed('block');
	// first submenu is highlighted by default
	highlight_sub_menu('btn_volumes_volSetup');
	iscsiVolumes_processAuth(); // commented out for now...
	display_help('volumes');
}

// >>> onClick events for "iSCSI Volumes" Submenus <<<
function onClick_volSetup(subheader) {
	populate_left_panel();
	iscsiVolumes_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_volumes_volSetup');
	display_help('volumes');
}

function onClick_lvmSetup(subheader) {
	populate_left_panel();
	lvm_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_volumes_lvmSetup');
	display_help('lvm');
}

// ...: Create submenu iSCSI basic :....
function showSubmenu_basic() {
	populate_left_panel();
	submenubar = Ext.get('section_sub_menu');
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	submenubar.removeClass('section_sub_menu_disabled');
	submenubar.addClass('section_sub_menu');

	var subheader_1 = S('header_7_1');
	var subheader_2 = S('header_7_2');
	var subheader_3 = S('header_7_3');
	var subheader_4 = S('header_7_4');

	submenubar.createChild('<li id="btn_basic_settings"><a href="#" id="header_7_1"onClick="onClick_basic_settings(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	submenubar.createChild('<li id="btn_basic_network"><a href="#" id="header_7_2"onClick="onClick_basic_network(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	submenubar.createChild('<li id="btn_basic_security"><a href="#" id="header_7_3"onClick="onClick_basic_security(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
	submenubar.createChild('<li id="btn_basic_storage"><a href="#" id="header_7_4"onClick="onClick_basic_storage(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');

	submenubar.setDisplayed('block');
	// first submenu is highlighted by default
	highlight_sub_menu('btn_basic_settings');
	system_settings_processAuth();
}

// >>> onClick events for iSCSI "basic" Submenus <<<
function onClick_basic_settings(subheader) {
	populate_left_panel();
	system_settings_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_basic_settings');
	display_help('settings');
}

function onClick_basic_network(subheader) {
	populate_left_panel();
	netSettings_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_basic_network');
	display_help('network');
}

function onClick_basic_security(subheader) {
	populate_left_panel();
	security_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_basic_security');
	display_help('security');
}

function onClick_basic_storage(subheader) {
	populate_left_panel();
	system_disk_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_basic_storage');
	display_help('storage');
}

// ...: Create submenu iSCSI Maintenance :....
function showSubmenu_maintenance(autoLoad, submenu, pageFn, expandRebootForm) {
	populate_left_panel();
	submenubar = Ext.get('section_sub_menu');
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	submenubar.removeClass('section_sub_menu_disabled');
	submenubar.addClass('section_sub_menu');

	var subheader_1 = S('header_8_1');
	var subheader_2 = S('header_8_2');
	var subheader_3 = S('header_8_3');
	var subheader_4 = S('header_8_4');

	submenubar.createChild('<li id="btn_maint_maint"><a href="#" id="header_8_1"onClick="onClick_maint_maint(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	// for french ' problem
//	submenubar.createChild('<li id="btn_maint_powerManagment"><a href="#" id="header_8_2"onClick="onClick_maint_powerManagement(\'' + subheader_2+ '\');">'+ subheader_2 +'</a></li>');
	submenubar.createChild('<li id="btn_maint_powerManagment"><a href="#" id="header_8_2" onClick="onClick_maint_powerManagement(\'subheader_2\');">' + subheader_2 + '</a></li>');
	submenubar.createChild('<li id="btn_maint_restore"><a href="#" id="header_8_3"onClick="onClick_maint_restore(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
	submenubar.createChild('<li id="btn_maint_ping"><a href="#" id="header_8_4"onClick="onClick_maint_pingTest(\'' + subheader_4 + '\');">' + subheader_4 + '</a></li>');

	submenubar.setDisplayed('block');

	highlight_sub_menu(submenu);
	if (autoLoad) {
		system_maint_processAuth(ID_EMAIL_FORM);
	}
	else {
		pageFn(expandRebootForm);
	}

	display_help('maintenance');
}

// >>> onClick events for iSCSI "Maintenance" Submenus <<<
function onClick_maint_maint(subheader) {
	populate_left_panel();
	system_maint_processAuth(ID_EMAIL_FORM);
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_maint_maint');
	display_help('maintenance');
}

function onClick_maint_powerManagement(subheader) {
	populate_left_panel();
	system_powerManagement_processAuth();
//	updateHeaderContainer('pageName', '<h3>'+ subheader +'</h3>');
	updateHeaderContainer('pageName', '<h3>' + S('header_8_2') + '</h3>');
	highlight_sub_menu('btn_maint_powerManagment');
	display_help('powerManagement');
}

function onClick_maint_restore(subheader) {
	populate_left_panel();
	system_restFormat_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_maint_restore');
	display_help('restoreErase');
}

function onClick_maint_pingTest(subheader) {
	populate_left_panel();
	pingTest_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_maint_ping');
	display_help('pingTest');
}

// ...: Create submenu iSCSI Status :....
function showSubmenu_status() {
	populate_left_panel();
	submenubar = Ext.get('section_sub_menu');
	if (submenubar) {
		while (submenubar.first()) {
			element = submenubar.first();
			element.remove();
		}
	}
	submenubar.removeClass('section_sub_menu_disabled');
	submenubar.addClass('section_sub_menu');

	var subheader_1 = S('header_9_1');
	var subheader_2 = S('header_9_2');
	var subheader_3 = S('header_9_3');
	var subheader_4 = S('header_9_4');

	submenubar.createChild('<li id="btn_status_system"><a href="#" id="header_9_1"onClick="onClick_status_system(\'' + subheader_1 + '\');">' + subheader_1 + '</a></li>');
	submenubar.createChild('<li id="btn_status_network"><a href="#" id="header_9_2"onClick="onClick_status_network(\'' + subheader_2 + '\');">' + subheader_2 + '</a></li>');
	submenubar.createChild('<li id="btn_connHistory"><a href="#" id="header_9_3"onClick="onClick_status_connHistory(\'' + subheader_3 + '\');">' + subheader_3 + '</a></li>');
//	submenubar.createChild('<li id="btn_statistics"><a href="#" id="header_9_4"onClick="onClick_status_statistics(\'' + subheader_4+ '\');">'+ subheader_4 +'</a></li>');

	submenubar.setDisplayed('block');
	// first submenu is highlighted by default
	highlight_sub_menu('btn_status_system');
	status_system_processAuth(); // commented out for now...
	display_help('systemStatus');
}

// >>> onClick events for iSCSI "Status" Submenus <<<
function onClick_status_system(subheader) {
	populate_left_panel();
	status_system_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_status_system');
	display_help('systemStatus');
}

function onClick_status_network(subheader) {
	populate_left_panel();
	status_network_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_status_network');
	display_help('networkStatus');
}

function onClick_status_connHistory(subheader) {
	populate_left_panel();
	status_connHistory_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_connHistory');
	display_help('connectionHistory');
}

function onClick_status_statistics(subheader) {
	populate_left_panel();
	status_statistics_processAuth();
	updateHeaderContainer('pageName', '<h3>' + subheader + '</h3>');
	highlight_sub_menu('btn_statistics');
}

// ------------------------==== iscsi submenus end here ===--------------------------------------

// ::::::::::::::::::: FUNCTIONS TO DISABLE MENUS :::::::::::::::::::
/*
function disable_menus(menus_dom_id){
	var container = Ext.get('btn_shared_folders'); // gets the center container 
	if (container != undefined) {
		var a = container.first();
		alert(a.insertHtml( 'onClick = "return false"'));
		while (!last) {
			alert(current);
			if (current == container.last()) {
				alert('last');
				last = true;
			}
			else {
			 current = container.next('li');
			}
		}
	}
}
*/

// ::::::::::::::::::: FUNCTIONS FOR INTERFACE MODE  :::::::::::::::::::
function show_menus_submenus_disabled() {
	var header_1 = S('sh_fold_header');
	var header_2 = S('header_2');
	var header_3 = S('header_3');
	var header_4 = S('header_4');
	var header_5 = S('header_5');

	var menu = Ext.get('section_menu');

	if (menu) {
		while (menu.first()) {
			element = menu.first();
			element.remove();
		}
	}

	var sharedFoldersMenu = '<li id="btn_shared_folders">' + '<a id="btn_shared_folders_link">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
	var usrGrpMenu = '<li id="btn_user_groups">' + '<a id="btn_user_groups_link">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
	var networkMenu = '<li id="btn_network">' + '<a  id="btn_network_link">' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
	var systemMenu = '<li id="btn_system">' + '<a id="btn_system_link">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';
	var extensionsMenu = '<li id="btn_extensions">' + '<a id="btn_extensions_link">' + '<span>' + header_5 + '</span>' + '</a>' + '</li>';

//	menu.removeClass('section_menu');
	menu.createChild(sharedFoldersMenu);
	menu.createChild(usrGrpMenu);
	menu.createChild(networkMenu);
	menu.createChild(systemMenu);
	menu.createChild(extensionsMenu);

	menu.removeClass('section_menu');
	menu.addClass('section_menu_disabled');

	userLoginName = getNameFromCookie();
	userPageMode = getPageModeFromCookie();
	display_accountInfo(userLoginName);
	show_sub_menus_disabled();
}

function show_menus_submenus_disabled_iscsi() {
	var header_1 = S('header_6');
	var header_2 = S('header_7');
	var header_3 = S('header_8');
	var header_4 = S('header_9');

	var menu = Ext.get('section_menu');

	if (menu) {
		while (menu.first()) {
			element = menu.first();
			element.remove();
		}
	}

	var iscsiVolume = '<li id="btn_iscsi_volume">' + '<a id="btn_iscsi_volume_link">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
	var basic = '<li id="btn_basic">' + '<a id="btn_basic_link">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
	var maintenance = '<li id="btn_maintenance">' + '<a id="btn_maintenance_link" >' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
	var status = '<li id="btn_status">' + '<a id="btn_status_link">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';

	menu.createChild(iscsiVolume);
	menu.createChild(basic);
	menu.createChild(maintenance);
	menu.createChild(status);

	menu.removeClass('section_menu');
	menu.addClass('section_menu_disabled');

	userLoginName = getNameFromCookie();
	userPageMode = getPageModeFromCookie();
	display_accountInfo(userLoginName);
	show_sub_menus_disabled();
}

function show_sub_menus_disabled() {
	submenubar = Ext.get('section_sub_menu');
	var subSection = Ext.get('section_menu_disabled');

	var newElements = new Array();
	var i = 0;
	if (submenubar) {
		while (submenubar.first()) {
			li = submenubar.first();
			var submenu_li_id = li.id;
			var a = li.first();
			var submenu_li_a_id = a.id;

			newElements[i] = '<li id="' + submenu_li_id + '">' + '<a id="' + submenu_li_a_id + '">' + '<span>' + S(submenu_li_a_id) + '</span>' + '</a>' + '</li>'
			i++;
			li.remove();
		}
		for (var i = 0; i < newElements.length; i++) {
			submenubar.createChild(newElements[i]);
		}
	}

	submenubar.removeClass('section_sub_menu');
//	submenubar.addClass('section_sub_menu_disabled');

	if (Ext.isIE7) {
		submenubar.addClass('section_sub_menu_disabled_ie7');
	}
	else {
		submenubar.addClass('section_sub_menu_disabled');
	}

}

function show_0() {
	var headerContainerTitle;
	var menuIndex;
	var menuSelected;
	var menu_information_innerHeader;
	var help_selected;

	if (add_iscsi) {
		var header_1 = S('header_6');
		var header_2 = S('header_7');
		var header_3 = S('header_8');
		var header_4 = S('header_9');

		var menu = Ext.get('section_menu');
		var iscsiVolume = '<li id="btn_iscsi_volume">' + '<a id="btn_iscsi_volume_link" href="#" ' + 'onClick="iscsiVolume_afterLoadFn();">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
		var basic = '<li id="btn_basic">' + '<a id="btn_basic_link" href="#" ' + 'onClick="basic_afterLoadFn();">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
		var maintenance = '<li id="btn_maintenance">' + '<a id="btn_maintenance_link" href="#" ' + 'onClick="maintenance_afterLoadFn(true, \'btn_maintenance\', \'btn_maint_maint\', \'header_8_1\', system_maint_processAuth);">' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
		var status = '<li id="btn_status">' + '<a id="btn_status_link" href="#" ' + 'onClick="status_afterLoadFn();">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';
		menu.createChild(iscsiVolume);
		menu.createChild(basic);
		menu.createChild(maintenance);
		menu.createChild(status);

		headerContainerTitle = S('header_6_1');
		menu_information_innerHeader = S('header_10');
		iscsiVolume_afterLoadFn();
//		menuIndex = MENU_INDEX_ISCSI;
		menuSelected = 'btn_iscsi_volume';
		help_selected = 'volumes';
		display_left_panel_iscsi_section();
		enable_left_panel_btns();
	}
	else {
		var header_1 = S('sh_fold_header');
		var header_2 = S('header_2');
		var header_3 = S('header_3');
		var header_4 = S('header_4');
		var header_5 = S('header_5');

		var menu = Ext.get('section_menu');
		var sharedFoldersMenu = '<li id="btn_shared_folders">' + '<a id="btn_shared_folders_link" href="#" ' + 'onClick="shFold_afterLoadFn();">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
		var usrGrpMenu = '<li id="btn_user_groups">' + '<a href="#" ' + 'onClick="usrGrp_afterLoadFn();">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
		var networkMenu = '<li id="btn_network">' + '<a href="#" ' + 'onClick="network_afterLoadFn();">' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
		var systemMenu = '<li id="btn_system">' + '<a href="#" ' + 'onClick="system_afterLoadFn();">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';
		var extensionsMenu = '<li id="btn_extensions">' + '<a href="#" ' + 'onClick="extensions_afterLoadFn();">' + '<span>' + header_5 + '</span>' + '</a>' + '</li>';

		menu.createChild(sharedFoldersMenu);
		menu.createChild(usrGrpMenu);
		menu.createChild(networkMenu);
		menu.createChild(systemMenu);
		menu.createChild(extensionsMenu);
		hide_show_left_bottom_section(true);		//hide left bottom section
		headerContainerTitle = S('header_1_1');
		menu_information_innerHeader = headerContainerTitle;
		shFold_afterLoadFn();
		menuIndex = MENU_INDEX_SHFOLD;
		menuSelected = 'btn_shared_folders';
		help_selected = 'shFolders';
	}
//	display_left_headers_systemInfo();

	// read from cookie
	userLoginName = getNameFromCookie();
	userPageMode = getPageModeFromCookie();
	display_accountInfo(userLoginName);

	menu.removeClass('section_menu_disabled');
	menu.addClass('section_menu');

	display_left_headers_systemInfo();
	updateHeaderContainer("pageName", "<h3>" + headerContainerTitle + "</h3>");

/*
	if (add_imhere) {
		display_left_panel_locate_section();
	}
	if (add_iscsi) {
		display_left_panel_powerMgmt_section();
//		getLeftPanelInfo(MENU_INDEX_ISCSI);
	}

	else {
//		getLeftPanelInfo(MENU_INDEX_SHFOLD);
	}
*/
	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + menu_information_innerHeader + "</span></h3>");

	highlight_menu(menuSelected);
//	onClick_shareSetup(headerContainerTitle);
	display_help(help_selected);
}

function show_1() {
	if (add_iscsi) {
		var header_1 = S('header_6');
		var header_2 = S('header_7');
		var header_2 = S('header_8');
		var header_2 = S('header_9');
		var menuIndex;
		var menuSelected;
		var menu_information_innerHeader;

		var menu = Ext.get('section_menu');
		var iscsiVolume = '<li id="btn_iscsi_volume">' + '<a id="btn_iscsi_volume_link" href="#" ' + 'onClick="iscsiVolume_afterLoadFn();">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
		var basic = '<li id="btn_basic">' + '<a id="btn_basic_link" href="#" ' + 'onClick="basic_afterLoadFn();">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
		var maintenance = '<li id="btn_maintenance">' + '<a id="btn_maintenance_link" href="#" ' + 'onClick="maintenance_afterLoadFn(true, \'btn_maintenance\', \'btn_maint_maint\', \'header_8_1\', system_maint_processAuth);">' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
		var status = '<li id="btn_status">' + '<a id="btn_status_link" href="#" ' + 'onClick="status_afterLoadFn();">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';
		menu.createChild(iscsiVolume);
		menu.createChild(basic);
		menu.createChild(maintenance);
		menu.createChild(status);

		headerContainerTitle = S('header_6_1');
		menu_information_innerHeader = S('header_10');
		iscsiVolume_afterLoadFn();
//		menuIndex = MENU_INDEX_ISCSI;
		menuSelected = 'btn_iscsi_volume';
	}
	else {
		var header_1 = S('header_1');
		var header_2 = S('header_2');
		var header_3 = S('header_3');
		var header_4 = S('header_4');
		var header_5 = S('header_5');

		var menu = Ext.get('section_menu');
		var sharedFoldersMenu = '<li id="btn_shared_folders">' + '<a href="#" ' + 'onClick="shFold_afterLoadFn();">' + '<span>' + header_1 + '</span>' + '</a>' + '</li>';
		var usrGrpMenu = '<li id="btn_user_groups">' + '<a href="#" ' + 'onClick="usrGrp_restrict_afterLoadFn();">' + '<span>' + header_2 + '</span>' + '</a>' + '</li>';
		var networkMenu = '<li id="btn_network">' + '<a href="#" ' + 'onClick="network_afterLoadFn();">' + '<span>' + header_3 + '</span>' + '</a>' + '</li>';
		var systemMenu = '<li id="btn_system">' + '<a href="#" ' + 'onClick="system_afterLoadFn();">' + '<span>' + header_4 + '</span>' + '</a>' + '</li>';
		var extensionsMenu = '<li id="btn_extensions">' + '<a href="#" ' + 'onClick="extensions_afterLoadFn();">' + '<span>' + header_5 + '</span>' + '</a>' + '</li>';
		menu.createChild(sharedFoldersMenu);
		menu.createChild(usrGrpMenu);
		menu.createChild(networkMenu);
		menu.createChild(systemMenu);
		menu.createChild(extensionsMenu);
		hide_show_left_bottom_section(true);		// hide left bottom section
		headerContainerTitle = S('header_1_1');
		menu_information_innerHeader = headerContainerTitle;
		shFold_afterLoadFn();
		menuIndex = MENU_INDEX_SHFOLD;
		menuSelected = 'btn_shared_folders';
		help_selected = 'shFolders';
	}
	userLoginName = getNameFromCookie();
	userPageMode = getPageModeFromCookie();
	display_accountInfo(userLoginName);

	menu.removeClass('section_menu_disabled');
	menu.addClass('section_menu');

	updateHeaderContainer("pageName", "<h3>" + headerContainerTitle + "</h3>");
//	getLeftPanelInfo();

/*
	if (add_imhere) {
		display_left_panel_locate_section();
	} 
	if (add_iscsi) {
		display_left_panel_powerMgmt_section();
	}
*/

	updateHeaderContainer("menu_information_innerHeader", "<h3><span>" + menu_information_innerHeader + "</span></h3>");
	highlight_menu(menuSelected);
//	onClick_shareSetup(headerContainerTitle);
	display_help(help_selected);
}

function show_2() {
//	display_left_headers_systemInfo();

	var HeaderContainerTitle = S('header_2');
	var subHeader = S('header_2_1');
//	updateHeaderContainer("pageName", "<h3>"+ HeaderContainerTitle +"</h3>");

	hideHtmlElement('menu_information');
	var menu = Ext.get('section_menu');

	var usrMenu = '<li id="btn_user_groups">' + '<a href="#"' + '<span>' + HeaderContainerTitle + '</span>' + '</a>' + '</li>';
	userLoginName = getNameFromCookie();
	userPageMode = getPageModeFromCookie();
	display_accountInfo(userLoginName);
	menu.createChild(usrMenu);
//	loadLang(usrOnly_afterLoadFn);
	usrOnly_afterLoadFn();

	menu.removeClass('section_menu_disabled');
	menu.addClass('section_menu');
	display_help('user');

	usrGrp_user_processAuth(userLoginName);
	getLeftPanelInfo_topOnly(1);

}

// ::::::::::::::::::: MISCELLANEOUS FUNCTIONS :::::::::::::::::::
function remove_menus() {
	var container = Ext.get('section_menu');
	while (container.first()) {
		element = container.first();
		element.remove();
	}
}

function hide_show_left_bottom_section(action) {
	var container = Ext.get('menu_information');
	if (action) container.setDisplayed('block');
	else container.setDisplayed('none');
}

function S(id) {
	var value = '';
	var option = '';

	if (!id) {
		return value;
	}
	if (id instanceof Array) {
		id = id[0];
	}

	// split :
	try {
		if (id.match(/:/)) {
			var splitted = id.split(':');
			id = splitted[0];
			option = splitted[1];
		}
	}
	catch(e) {}

	// to match the complete string in the dictionary
	var regexp = new RegExp("^" + id + "$", "i");

	// debug enable  -> 1 (if 'langDictionary'.find =! -1 -> JS error happen. for dictionaly file confirm)
	// debug disable -> 0 (if 'langDictionary'.find =! -1 -> JS error 'NOT' happen.)
	var debug = 0;

	if ((langDictionary.find("id", regexp) != -1) || (debug)) {
		value = langDictionary.getAt(langDictionary.find("id", regexp)).data.value;
	}
	else if (langDictionary.find("id", regexp) == -1) {
		if ((langDictionary_en.find("id", regexp) != -1) || (debug)) {
			if (debug) {
				value = '*' + langDictionary_en.getAt(langDictionary_en.find("id", regexp)).data.value + '*';
			}
			else {
				value = langDictionary_en.getAt(langDictionary_en.find("id", regexp)).data.value;
			}
		}
	}

	// Replaces DEVICE_TYPE with "Linkstation" or "TeraStation"
	value = value.replace(/DEVICE_TYPE/g, series_name);

	if (option) {
		return value + option;
	}
	else {
		return value;
	}
}

function display_left_headers_systemInfo() {
	var systemTitle_div = Ext.get('system_information_header');
	var systemTitle = S('r_systemTitle');
	systemTitle_div.update('<h3><span>' + systemTitle + '</span></h3>');
}

function display_accountInfo(username) {
	var div = Ext.get('acct_login');

	var welcome = S('welcome');
	welcome = "<span>" + welcome + ", " + username + " </span>";

	var logout = S('logout');
	logout = "<a href='..' onClick='delCookies();'>" + logout + "</a>";
	div.update(welcome + logout);
}

function display_help(menu, loginOnlyLang) {
	var div = Ext.get('help');
	if (div) {
		while (div.first()) {
			var element = div.first();
			element.remove();
		}
	}

	var help = S('help');
	var manual = S('manual');
	var product;
	var help_src;
	var help_login_id;

	if (product_name.match(/^TS-/i)) {
		if (product_name.match(/^TS-.*I.*\(/i)) {
			product = 'tsixl';
		}
		else {
			product = 'tsxl';
		}
	}
	else {
		product_url = product_name.toLowerCase();
		product_url = product_url.replace(/\(.+\)/, "");
		product_url = product_url.replace(/-/g, "");
		product = product_url;
	}

	var lang;
	var help_file_name = '';

	if (loginOnlyLang) {
		lang = loginOnlyLang;
		help_file_name = 'login';
	}
	else if (!lang) {
		lang = getLangFromCookie();
	}

	if (lang == 'en') {
		if (add_iscsi) {
			if (selected_sub_menu == 'btn_volumes_volSetup') {
				help_file_name = 'volumes';
			}
			else if (selected_sub_menu == 'btn_volumes_lvmSetup') {
				help_file_name = 'lvm';
			}
			else if (selected_sub_menu == 'btn_basic_settings') {
				help_file_name = 'settings';
			}
			else if (selected_sub_menu == 'btn_basic_network') {
				help_file_name = 'network';
			}
			else if (selected_sub_menu == 'btn_basic_security') {
				help_file_name = 'security';
			}
			else if (selected_sub_menu == 'btn_basic_storage') {
				help_file_name = 'storage';
			}
			else if (selected_sub_menu == 'btn_maint_maint') {
				help_file_name = 'maintenance';
			}
			else if (selected_sub_menu == 'btn_maint_powerManagment') {
				help_file_name = 'powerManagement';
			}
			else if (selected_sub_menu == 'btn_maint_restore') {
				help_file_name = 'restoreErase';
			}
			else if (selected_sub_menu == 'btn_maint_ping') {
				help_file_name = 'pingTest';
			}
			else if (selected_sub_menu == 'btn_status_system') {
				help_file_name = 'systemStatus';
			}
			else if (selected_sub_menu == 'btn_status_network') {
				help_file_name = 'networkStatus';
			}
			else if (selected_sub_menu == 'btn_connHistory') {
				help_file_name = 'connectionHistory';
			}
		}
		else {
			if (selected_sub_menu == 'btn_shareSetup') {
				help_file_name = 'shFolders';
			}
			else if (selected_sub_menu == 'btn_dfs') {
				help_file_name = 'DFS';
			}
			else if (selected_sub_menu == 'btn_directCopy') {
				help_file_name = 'DirectCopy';
			}
			else if (selected_sub_menu == 'btn_indexSearch') {
				help_file_name = 'TeraSearch';
			}
			else if (selected_sub_menu == 'btn_users') {
				help_file_name = 'users';
			}
			else if (selected_sub_menu == 'btn_groups') {
				help_file_name = 'groups';
			}
			else if (selected_sub_menu == 'btn_external') {
				help_file_name = 'ExtUsers';
			}
			else if (selected_sub_menu == 'btn_domain_users') {
				help_file_name = 'users';
			}
			else if (selected_sub_menu == 'btn_domain_groups') {
				help_file_name = 'groups';
			}
			else if (selected_sub_menu == 'btn_settings') {
				help_file_name = 'netSettings';
			}
			else if (selected_sub_menu == 'btn_domain') {
				help_file_name = 'netDomain';
			}
			else if (selected_sub_menu == 'btn_nfs') {
				help_file_name = 'netNFS';
			}
			else if (selected_sub_menu == 'btn_webserver') {
				help_file_name = 'netWebserver';
			}
			else if (selected_sub_menu == 'btn_mysqlserver') {
				help_file_name = 'netMysqlserver';
			}
			else if (selected_sub_menu == 'btn_snmp') {
				help_file_name = 'netSnmp';
			}
			else if (selected_sub_menu == 'btn_sys_settings') {
				help_file_name = 'sysSettings';
			}
			else if (selected_sub_menu == 'btn_disks') {
				help_file_name = 'sysStorage';
			}
			else if (selected_sub_menu == 'btn_jobs') {
				help_file_name = 'sysBackup';
			}
			else if (selected_sub_menu == 'btn_maint') {
				help_file_name = 'sysMaint';
			}
			else if (selected_sub_menu == 'btn_restErase') {
				help_file_name = 'sysRestErase';
			}
			else if (selected_sub_menu == 'btn_webaxs') {
				help_file_name = 'extWebAxs';
			}
			else if (selected_sub_menu == 'btn_mediaserver') {
				help_file_name = 'extMediaServ';
			}
			else if (selected_sub_menu == 'btn_deviceserver') {
				help_file_name = 'extDeviceServ';
			}
			else if (selected_sub_menu == 'btn_printserver') {
				help_file_name = 'extPrintServ';
			}
			else if (selected_sub_menu == 'btn_bittorrent') {
				help_file_name = 'extBitTorrent';
			}
			else if (selected_sub_menu == 'btn_secuirity') {
				help_file_name = 'extSecurity';
			}
			else if (selected_sub_menu == 'btn_timeMachine') {
				help_file_name = 'extTimeMachine';
			}
			else if (selected_sub_menu == 'btn_power') {
				help_file_name = 'sysSleep';
			}
			else if (selected_sub_menu == 'btn_tmnas') {
				help_file_name = 'extVirusScan';
			}
			else if (selected_sub_menu == 'btn_webservice') {
				help_file_name = 'extWebService';
			}
		}
		if (help_file_name) {
			help_src = "<a href='#' onClick='getHelp(\"" + help_file_name + "\");'>" + help + "</a>";
			help_login_id = 'external';
		}
		else {
			help_src = '';
		}
	}
	else {
		help_src = '';
		help_login_id = 'external_jp';
	}

	if ((menu == 'user') || (menu == 'group') || (menu == 'shFolders')) {
		var faq = S('faq_usergroup');
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_accessrestrictions.html' id='external' target='_blank'>" + faq + "</a><a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='external' target='_blank'>" + manual + "</a>");
	}
	else if (menu == 'systemBackup') {
		var faq = S('faq_backup');
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_backup.html' id='external' target='_blank'>" + faq + "</a><a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='external' target='_blank'>" + manual + "</a>");
	}
	else if (menu == 'networkDomain') {
		var faq = S('faq_domain');
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_domain.html' id='external' target='_blank'>" + faq + "</a><a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='external' target='_blank'>" + manual + "</a>");
	}
	else if (menu == 'webaxs') {
		var faq = S('faq_webaxs');
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_webaccess.html' id='external' target='_blank'>" + faq + "</a><a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='external' target='_blank'>" + manual + "</a>");
	}
	else if (menu != 'login') {
		var faq = S('faq_other');
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + ".html' id='external' target='_blank'>" + faq + "</a><a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='external' target='_blank'>" + manual + "</a>");
	}
	else {
		div.createChild(help_src + "<a href='http://buffalo.jp/support_s/guide/path/" + product + "/" + lang + "/" + product + "_m.html' id='" + help_login_id + "' target='_blank'>" + manual + "</a>");
	}
}

function setHeaders(header, subHeader) {
	menuHeader = header;
	if (subHeader) {
		menuSubHeader = subHeader;
	}
}

function hideHtmlElement(id) {
	htmlElement = Ext.get(id);
	htmlElement.setDisplayed('none');
}

function importLang(lang) {
	langDictionary = new Ext.data.JsonStore({
		url: "../../locale/" + lang + ".json",
		root: 'labels',
		fields: ['id', 'value']
	});

	langDictionary_en = new Ext.data.JsonStore({
		url: "../../locale/en.json",
		root: 'labels',
		fields: ['id', 'value']
	});
}

function loadLang(afterLoadFn) {
	var lang = getLangFromCookie();
	if (!lang) {
		formFailureFunction();
	}
	else {
//		loadLeftPanel();
		importLang(lang);
		if (afterLoadFn) {
			if (lang != 'en') {
				langDictionary_en.load();
			}

			langDictionary.load({
				callback: function () {
					afterLoadFn();
				}
			});
		}
		else {
			if (lang != 'en') {
				langDictionary_en.load();
			}

			langDictionary.load();
		}
	}
}

function adjust_left_sidebar(submenu) {
	var left_sidebar = Ext.get('page_content');
	if (submenu) {
		left_sidebar.setTop('22');
		left_sidebar.repaint();
	}
	else {
		left_sidebar.setTop('0');
		left_sidebar.repaint();
	}
}

function create_features_obj() {
	featureList = new Ext.data.JsonStore({
		url: '/dynamic.pl',
		baseParams: {
			bufaction: 'getFeatures'
		},
		root: 'data',
		fields: ['id', 'value']
	});
}

function display_left_panel_firmware_update(now) {
	if (now) {
		var leftPanelMenuHeader = S('opFirmwareUpdate');
		leftPanelMenuHeader_url = leftPanelMenuHeader ;
		updateHeaderContainer("firmware_update_header", "<h3><span>" + leftPanelMenuHeader + "</span></h3>");
		var msg = {
			value: S('opFirmwareUpdateMsg')
		};
		var template = new Ext.XTemplate(
			'<dl>',
				'<dt>',
					'{value}',
				'</dt>',
			'</dl>'
		);
		template.overwrite('firmware_update_inner', msg);
	}
	else {
		Ext.Ajax.request({
			url: '/dynamic.pl',
			params: {
			bufaction: 'getUpdateStatus'
			},
			method: 'POST',
			success: function (result) {
				var rawData = result.responseText;
				var response = Ext.decode(rawData);
				var success = response.success;
				var data = response.data;
				if (success) {
					if (data[0].update) {
						var leftPanelMenuHeader = S('r_firmware_update');
						leftPanelMenuHeader_url = leftPanelMenuHeader ;
						updateHeaderContainer("firmware_update_header", "<h3><span><a href='#' onClick='show_firmware_update();'>" + leftPanelMenuHeader + "</a></span></h3>");

						var msg = {
							value: S('system_firmware_update_log_available')
						};

						var	template = new Ext.XTemplate(
							'<dl>',
								'<dt>',
									'{value}',
								'</dt>',
							'</dl>'
						);
						template.overwrite('firmware_update_inner', msg);
					}
				}
			}
		});
	}
}

function locate_device() {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'locateDevice'
		},
		method: 'POST',
		success: function (result) {}
	});
}

function has_feature(feature) {
	// to match the complete string in the dictionary
	var feature_regExp = new RegExp("^" + feature + "$");
	var value_regExp = new RegExp(".*");

	var rec_index = featureList.find('id', feature_regExp);
	if (rec_index != -1) {
		var record = featureList.getAt(rec_index);
		var val = record.get('value');
		if (val == '1' || val == 'on') {
			return true;
		}
	}
	return false;
}

function has_feature_value(feature) {
	var val = '';

	// to match the complete string in the dictionary
	var feature_regExp = new RegExp("^" + feature + "$");
	var value_regExp = new RegExp(".*");

	var rec_index = featureList.find('id', feature_regExp);
	if (rec_index != -1) {
		var record = featureList.getAt(rec_index);
		val = record.get('value');
	}
	return val;
}

function request_operation() {
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: 'getOperationStatus'
		},
		method: 'POST',
		success: function (result) {
			Ext.MessageBox.updateProgress(1);
			Ext.MessageBox.hide();

			var rawData = result.responseText;
			var response = Ext.decode(rawData);
			var success = response.success;
			var op_refresh_field = Ext.getCmp('op_refresh');

			if (op_refresh_field) {
				op_refresh_field.enable();
			}

			var data = response.data;
			if (success) {
				resetCookie();
				display_operation(data);
			}
			else {
//				sessionExpiredNotif();
				winAjaxFailureFunction_with_width(response, 600);
			}
		}
	});

	var keymap = new Ext.KeyMap(Ext.getDoc(), {
		key: 'b',
		ctrl: true,
		shift: true,
		alt: true,
		handler: function() {
			try {
				Ext.destroy(Ext.get('downloadIframe'));
			} 
			catch (e) {
			}

			Ext.DomHelper.append(document.body, {
				id: 'downloadIframe',
				tag: 'iframe',
				width: 0,
				height: 0,
				frameBorder: 0,
				css: 'display: none; visibility: hidden; height: 0px;',
				src: '/export.pl' + '?' + 'target=log'
			});
		},
		scope: this,
		stopEvent: true
	});

	var keymap2 = new Ext.KeyMap(Ext.getDoc(), {
		key: 'r',
		ctrl: true,
		shift: true,
		alt: true,
		handler: function() {
			try {
				Ext.destroy(Ext.get('downloadIframe'));
			} 
			catch (e) {
			}

			Ext.DomHelper.append(document.body, {
				id: 'downloadIframe',
				tag: 'iframe',
				width: 0,
				height: 0,
				frameBorder: 0,
				css: 'display: none; visibility: hidden; height: 0px;',
				src: '/export.pl' + '?' + 'target=rsrc'
			});
		},
		scope: this,
		stopEvent: true
	});
}

function display_operation(responseData) {
	pageMode = getPageModeFromCookie();
	display_left_headers_systemInfo();

	var submenubar = Ext.get('section_sub_menu');
	submenubar.setDisplayed('none');
	remove_menus();

	if (responseData[0] && responseData[0].operation && responseData[0].progress) {
		// hide left bottom section
		hide_show_left_bottom_section(false);
		if (add_iscsi) {
			show_menus_submenus_disabled_iscsi();
		}
		else {
			show_menus_submenus_disabled();
		}
		populate_left_panel();
		get_left_panel_while_operation_in_progress();
		var operation = responseData[0].operation;
		var task = responseData[0].task;
		var progress = responseData[0].progress;
		var elapsedTime = responseData[0].elapsedTime;

		var pageTitle;
		var pageMsg;
		var detailsTitle = "<p class='op_details_title'>" + S('opDetails') + "</p>";
		var detailsTask;
		var detailsProgress;
		var detailsElapsedTime;

		if (operation == 'opDiskFormat') {
			pageTitle = S('opDiskFormat');
			pageMsg = S('diskDiskFormatMsg');
		}
		else if (operation == 'opDiskCheck') {
			pageTitle = S('opDiskCheck');
			pageMsg = S('diskDiskCheckMsg');
		}
		else if (operation == 'opDiskErase') {
			pageTitle = S('opDiskErase');
			pageMsg = S('diskDiskEraseMsg');
			detailsTask = S(task);
		}
		else if (operation == 'opNasFormat') {
			pageTitle = S('opNasFormat');
			pageMsg = S('diskNasFormatMsg');
		}
		else if (operation == 'opNasRestore') {
			pageTitle = S('opNasRestore');
			pageMsg = S('diskNasRestoreMsg');
		}
		else if (operation == 'opArrayChange') {
			pageTitle = S('opArrayChange');
			pageMsg = S('diskArrayChangeMsg');
		}
		else if (operation == 'opUserCsvImport') {
			pageTitle = S('opUserCsvImport');
			pageMsg = S('userCsvImportMsg');
		}
		else if (operation == 'opFirmwareUpdate') {
			pageTitle = S('opFirmwareUpdate');
			pageMsg = S('opFirmwareUpdateMsg');
			UPDATING_FIRMWARE = true;
			display_left_panel_firmware_update(UPDATING_FIRMWARE);
			if (progress) {
				progress = S(progress);
			}
		}
		if (operation != 'opFirmwareUpdate') {
			UPDATING_FIRMWARE = false;
		}

		pageTitle = " <h3><img src='" + WARNING_IMG + "'/>" + pageTitle + "</h3>";
		pageMsg = "<p class='msg'>" + pageMsg + "</p>";

		updateHeaderContainer("pageName", pageTitle);
		updateHeaderContainer("content_body", pageMsg);

		if (task || progress || elapsedTime) {
			detailsTitle = "<p class='op_details_title'>" + detailsTitle + "</p>";
			addHtmlToContainer("content_body", detailsTitle);
		}
		if (task) {
			var detailsTaskTitle = "<b>" + S('opTaskTitle') + ": </b>";
			detailsTask = "<p class='op_details_item'>" + detailsTaskTitle + detailsTask + "</p>";
			addHtmlToContainer("content_body", detailsTask);
		}

		if (progress) {
			var detailsProgressTitle;
			var val_progress;
			if (progress == ' ') {
				val_progress = S('opProgressWorking');
			}
			else {
				val_progress = progress;
			}

			if (progress == ' ') {
				progress = S('opWorking');
			}

			detailsProgressTitle = "<b>" + S('opProgressTitle') + ": </b>";
			detailsProgress = "<p class='op_details_item'>" + detailsProgressTitle + progress + "</p>";
			addHtmlToContainer("content_body", detailsProgress);
		}
		if (elapsedTime) {
			var minutes = S('minutes');
			var detailsElapsedTime = "<b>" + S('opElapsedTitle') + ": </b>";
			detailsElapse = "<p class='op_details_item'>" + detailsElapsedTime + elapsedTime + " " + minutes + "</p>";
			addHtmlToContainer("content_body", detailsElapse);
		}

		addHtmlToContainer('content_body', '<br><br>');
		addHtmlToContainer('content_body', '<div id="getStatusProgressBarDiv" class="x-hidden"></div>');
		addHtmlToContainer('content_body', '<img  src=' + wait_img + ' />');

		var progressBar = new Ext.ProgressBar({
			width: 500,
			id: 'getStatus_progressBar',
			cls: 'custom',
			renderTo: 'getStatusProgressBarDiv'
		});

		progressBar.wait({
			interval: 100,
			duration: 10000,
			increment: 100,
			scope: this,
			fn: function () {
				request_operation();
			}
		});
	}
	else if (responseData[0] && responseData[0].operation && !responseData[0].progress) {
		if (responseData[0].operation == 'opUserCsvImport') {
			msgBox_usingDictionary('opCompletedTitle', 'opCompletedUserImport', Ext.Msg.OK, Ext.MessageBox.INFO);
		}
		else {
			msgBox_usingDictionary('opCompletedTitle', 'opCompleted', Ext.Msg.OK, Ext.MessageBox.INFO);
		}

		selectPageMode();
	}
	else {
//		remove_menus();
		selectPageMode();
	}
}

function selectPageMode() {
	remove_useless_mask();

	if (pageMode == 0) {
		show_0();
		if (add_fwupdate) {
			display_left_panel_firmware_update(UPDATING_FIRMWARE);
		}
	}
	else if (pageMode == 1) {
		show_1();
		if (add_fwupdate) {
			display_left_panel_firmware_update(UPDATING_FIRMWARE);
		}
	}
	else if (pageMode == 2) {
		show_2();
	}
	else {
		failureFunction();
	}
}

function select_logo() {
	var logo_element = Ext.get('dev_logo');
	var cssClass;

	var re_info = /^Tera/;
	var terastation = series_name.match(re_info);

	if (series_name) {
		if (terastation) {
			// if here, the device is a terastation
			if (add_iscsi) {
				cssClass = "dev_logo_ts_iscsi";
			}
			else {
				cssClass = "dev_logo_ts";
			}
		}
		else {
			// if here, the device is a Linkstation
			cssClass = "dev_logo_ls";
		}

		logo_element.addClass(cssClass);
	}
}
