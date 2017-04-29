// bufactions
var BUFACT_VALIDATE_SESSION = 'validateSession';
var BUFACT_GET_ALL_DISKS = 'getBackupAllList';
var BUFACT_GET_BAKCUP_SETTINGS = 'getBackupSettings';
var BUFACT_GET_BACKUP_FOLDERS = 'getBackupFolders';
var BUFACT_GET_BACKUP_SOURCES = 'getBackupSourceList';
var BUFACT_GET_BACKUP_TARGETS = 'getBackupTargetList';
var BUFACT_GET_BACKUP_HARDLINK_TARGETS = 'getBackupTargetListHardlink';

var BUFACT_ADD_JOB = 'addBackup';
var BUFACT_SET_JOB = 'setBackupSettings';
var BUFACT_DEL_JOB = 'delBackupList';
var BUFACT_GET_LOCAL_LIST = 'getDeviceLocalList';
var BUFACT_GET_OFF_SUB_LIST = 'getDeviceOffSubnetList';
var BUFACT_GET_ADD_DEV = 'addDevice';
var BUFACT_GET_DEL_DEV = 'delDeviceList';

var BUFACT_GET_BACKUP_PASSWORD = 'getBackupPassword';
var BUFACT_SET_BACKUP_PASSWORD = 'setBackupPassword';

var BUFACT_GET_REPLICATION_LIST = 'getReplicationList';
var BUFACT_GET_REPLICATION_SOURCES = 'getReplicationSourceList';
var BUFACT_GET_REPLICATION_TARGETS = 'getReplicationTargetList';
var BUFACT_ADD_REPLICATION = 'addReplication';
var BUFACT_SET_REPLICATION = 'setReplication';
var BUFACT_DEL_REPLICATION = 'delReplication';
var BUFACT_CHECK_REPLICATION = 'checkReplication';
var BUFACT_RESYNC_REPLICATION = 'resyncReplication';

// ID
var ID_JOBS_TOP_SEARCH_COMBO = 'jobs_frontSearch';
var ID_JOBS_EDITABLE_FORM = 'jobsFoldersForm';

var ID_JOBS_PASSWORD_FORM = 'jobsPasswordForm';

// PREFIX IDs
var ID_JOBS_PREFIX_FRONT_GRID = 'jobs_grid';
var ID_JOBS_PREFIX_SOURCE_COMBO = 'jobs_sourceCombo';
var ID_JOBS_PREFIX_TARGET_COMBO = 'jobs_targetCombo';
var ID_JOBS_PREFIX_BACKUP_JOB_NAME = 'jobName';
var ID_JOBS_PREFIX_JOB_SCHEDULE_COMBO = 'scheduleTypeId';
var ID_JOBS_PREFIX_BACKUP_TIME_COMBO = 'startTimeId';
var ID_JOBS_PREFIX_BACKUP_WEEKDAY_COMBO = 'weekdayId';
var ID_JOBS_PREFIX_BACKUP_MODE_COMBO = 'backupOpModeId';
var ID_JOBS_PREFIX_BACKUP_HARDLINKGEN_COMBO = 'backupHardlinkGenId';
var ID_JOBS_PREFIX_MEMBER_POPUP_WIN = 'jobs_popupWin';
var ID_JOBS_PREFIX_MEMBER_POPUP_FORM = 'jobs_popupForm';
var ID_JOBS_PREFIX_CREATE_BACKUP_CHECKBOX = 'createBackup';
var ID_JOBS_PREFIX_CREATE_TARGET_CHECKBOX = 'createTarget';
var ID_JOBS_PREFIX_ENCRYPTED_TF_CHECKBOX = 'useEncrypted';
var ID_JOBS_PREFIX_COMPRESSED_TF_CHECKBOX = 'useCompressed';
var ID_JOBS_PREFIX_IGNORE_TRASHBOX_CHECKBOX = 'ignoreTrashbox';
var ID_JOBS_PREFIX_COMPLETE_BCKP_CHECKBOX = 'completeBckp';
var ID_JOBS_PREFIX_IGNORE_ERRORS_CHECKBOX = 'ignoreErrors';
var ID_JOBS_PREFIX_BACKUP_OPT_FIELDSET = 'backupOptions';
var ID_JOBS_PREFIX_BACKUP_INFO_FIELDSET = 'backupinfo';
var ID_DISK_FOLD_DEV_LIST_WIN = 'devSettingsWin';
var ID_REPLICATION_SEARCH_COMBO = 'replication_search';
var ID_REPLICATION_GRID = 'replication_grid';
var ID_REPLICATION_FORM_EDIT = 'replication_form_edit';
var ID_REPLICATION_FORM = 'replication_form';
var ID_REPLICATION_SOURCE_COMBO = 'replication_sourceCombo';
var ID_REPLICATION_TARGET_COMBO = 'replication_targetCombo';

var DIV_DEV_LIST_WIN = 'disk_devListWin-div';

//	var DIV_MEMBER = 'addShare-div';
var JOBS_RENDER_TO = 'content_body';


// Other vars
var MAX_JOBS = 8;
var MAX_REPLICATION_JOBS = 64;

/*
var ID_TOP_NEW_USER_FORM = 'sharedFoldersForm'; //change it!
var ID_MEMBER_POPUP_WIN = 'popupWin';
var ID_NEW_FOLDER_WIN = 'newShareWin';
var ID_COPY_SETTINGS_COMBO = 'copySettingsFrom';
var ID_NEW_SHARE_NAME = 'newShareName';
var ID_NEW_SHARE_DESC ='newShareDesc';
var ID_NEW_SHARE_DEFAULT = 'default';
var ID_NEW_SHARE_CUSTOM = 'customSettings';
var ID_POPUP_PANEL = 'popupTabPanel';
var ID_POPUP_DOMAIN_GRID = 'popupDomainGrid';
var ID_POPUP_LOCAL_GRID = 'popupLocalGrid';
var ID_POPUP_DOMAIN_SEARCH = 'domainSearchField';
var ID_POPUP_REMOVE_FILTER_BTN = 'removeFilterButton';
var ID_FRONT_GRID = 'frontGrid';
var ID_EDITABLE_FORM = 'sharedFoldersForm';

// PREFIX IDs
var ID_PREFIX_GROUP_VIEW = 'frontView';
var ID_PREFIX_FORM = 'f';

// bufactions
var BUFACT_VALIDATE_SESSION = 'validateSession';
var BUFACT_GET_ALL_SHARE = 'getShareAllList';
var BUFACT_GET_SHARE_LIST = 'getShareList';
var BUFACT_GET_SHARE = 'getShareSettings';
var BUFACT_ADD_SHARE = 'addShare';
var BUFACT_EDIT_SHARE = 'setShareSettings';
var BUFACT_DEL_SHARE = 'delShareList';
var BUFACT_GET_AXS_RESTRICT = 'getShareAxsConfig';
var BUFACT_GET_LOCAL_LIST = 'getShareLocalList';
var BUFACT_GET_DOMAIN_LIST = 'getShareDomainList';

// Arrays
var DOMAIN_LIST = new Array ();

// DIVs (also modify shareSettings.html)
var DIV_PANEL = 'panel-div';
var DIV_NEW_SHARE_FORM = 'newShareForm-div';
var DIV_NEW_SHARE_WIN = 'newShareWin-div';
var DIV_MEMBER = 'addShare-div';
var DIV_TAB = 'tDiv';
var SHARED_FOLDER_RENDER_TO = 'content_body';
var SHARED_FOLDER_HEADER_RENDER_TO = 'content_header';

var DISK_LIST = [['disk1','disk2','disk3','disk4','array1','array2'];
*/
