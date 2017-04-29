#!/usr/bin/speedy -- -M1 -t3000

$ENV{PATH} = "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin";

use lib '/www/cgi-bin/module';
#use lib '/www/cgi-bin/module/mv';
use lib '/www/perlmodules';

use lib '/www/buffalo/www/dynamic/auth';
use lib '/www/buffalo/www/dynamic/root';
use lib '/www/buffalo/www/dynamic/common';
use lib '/www/buffalo/www/dynamic/shFolders';
use lib '/www/buffalo/www/dynamic/usrGrpMnt';
use lib '/www/buffalo/www/dynamic/network';
use lib '/www/buffalo/www/dynamic/system/settings';
use lib '/www/buffalo/www/dynamic/system/disk';
use lib '/www/buffalo/www/dynamic/system/backups';
use lib '/www/buffalo/www/dynamic/system/maint';
use lib '/www/buffalo/www/dynamic/system/restore';
use lib '/www/buffalo/www/dynamic/system/update';
use lib '/www/buffalo/www/dynamic/system/security';
use lib '/www/buffalo/www/dynamic/extensions';
use lib '/www/buffalo/www/dynamic/iscsi';
use lib '/www/buffalo/www/dynamic/status';

use CGI;
use CGI::Carp qw(fatalsToBrowser);

use strict;
use JSON;

# operationStatus
use BufOperationStatus;

# Shared Folders Tab
use BufShare;
use BufDFS;
use BufTeraSearch;
use BufDirectCopy;

# Users/Groups Tab
use BufUser;
use BufGroup;

# Network Tab
use BufEFS;
use BufIPAddress;
use BufNSS;
use BufDomain;
use BufNFS;
use BufServices;
use BufPortTrunking;

use BufWebServer;
use BufPHP;
use BufMySQLServer;

use BufSnmp;

# System Tab
# System Settings SubTab
use BufHost;
use BufManage;
use BufDateTime;
use BufLang;

# System Disk SubTab
use BufDiskProperties;
use BufArrayProperties;
use BufArrayMaintenance;
use BufVolumeProperties;
use BufDiskCheck;
use BufDiskFormat;

# System Backups SubTab
use BufDiskBackupJobs;
use BufDiskBackupDevList;
use BufDiskReplication;

# System Maintenance SubTab
use BufEmail;
use BufUPS;
use BufAlert;
use BufLED;
use BufLCD;
use BufReset;
use BufSettings;  # for export feature
use BufSleeptimer;
use BufHDDSpindown;
use BufSyslog;
use BufPing;

# System Restore/Format SubTab
use BufInit;

# Extensions WebAxs SubTab
use BufWebaxs;

# Extensions PocketU SubTab
use BufPocketU;

# Extensions MediaServer SubTab
use BufMediaserver;

# Extensions DeviceServer SubTab
use BufDeviceserver;

# Extensions PrintServer SubTab
use BufPrintserver;

# Extensions BitTorrent SubTab
use BufBittorrent;

# Extensions Security SubTab
use BufSecurity;

# Extensions Time Machine SubTab
use BufTimemachine;

# Extensions Tmnas SubTab
use BufTmnas;

# Extensions WebService SubTab
use BufFlickr;

# Extensions Eye-Fi Connect SubTab
use BufEyeFi;
use EyeFiCardHandler;

# Extensions Wafs SubTab
use BufWafs;

# iSCSI Tab
use BufIscsi;
use BufLvm;

# Basic -> Security SubTab
use BufAdmin;
use BufHddTool;

# Status Tab
use BufSystemStatus;
use BufNetworkStatus_new;
use BufConnHistory;

# Root Menu Info
use BufRoot;

# Common Modules
use BufHelp;
use BufGateCheck;
use BufNasFeature;
use BufImHere;

# Login/Logout Tab
use BufAuth;

use BufUpdate;
use BufConfBroken;

print "Content-type: text/html\n";
print "Pragma: no-cache\n";
print "Cache-Control: no-store, no-cache, must-revalidate\n";
print "Cache-Control: post-check=0, pre-check=0\n";
print "Expires: Thu, 01 Dec 1994 16:00:00 GMT\r\n\r\n";

# Get the help file path 
my $Auth = BufAuth->new();
$Auth->init;
my $language = $Auth->{language};

my $help_path;
my $help_path_en;

use BufCommonFileInfo;
my $nas_feature = BufCommonFileInfo->new();
$nas_feature->init('/etc/nas_feature');

if($nas_feature->get_info('PRODUCT_NAME') =~ m/^"LS-/i) {
	$help_path = '/www/buffalo/www/static/help_ls/'.$language.'/';
	$help_path_en = '/www/buffalo/www/static/help_ls/en/';
}
elsif($nas_feature->get_info('PRODUCT_NAME')  =~ /^"TS-.*I.*\(/i) {
	$help_path = '/www/buffalo/www/static/help_iscsi/'.$language.'/';
	$help_path_en = '/www/buffalo/www/static/help_iscsi/en/';
}
else{
	$help_path = '/www/buffalo/www/static/help_ts/'.$language.'/';
	$help_path_en = '/www/buffalo/www/static/help_ts/en/';
}

# function declarations
sub authenticate;
sub main;

# Method to be called to check the authentication (to see if the session still exists)
sub authenticate {
	my $cgiRequest = CGI->new();
	my $bufaction = $cgiRequest->param("bufaction");

	if ($bufaction =~ /^nn_getWebaxsSettings$/) {
		my $webaxs = BufWebaxs->new();
		$webaxs->init;
		print $webaxs->nn_getWebaxsSettings();

		exit;
	}

	my $Auth = BufAuth->new();
	$Auth->init;
	return $Auth->validate_Login();
}

# Get the bufaction from client
my $cgiRequest = CGI->new();
my $bufaction = $cgiRequest->param("bufaction");

# Will not authenticate to get the language at the beginning 
if($bufaction =~ /^getLang$/) {
	my $Auth = BufAuth->new();
	$Auth->init;
	print $Auth->get_lang();
}

# warn if configuration files were broken(added by aoki)
elsif($bufaction =~ /^getConfigBroken$/) {
	my $ConfBroken = BufConfBroken->new();
	$ConfBroken->init;	
	print $ConfBroken->get_broken();
}

elsif($bufaction =~ /^clearConfigBroken$/) {
	my $ConfBroken = BufConfBroken->new();
	$ConfBroken->init;
	print $ConfBroken->get_broken();
	$ConfBroken->clear();
}

elsif($bufaction =~ /^getHelplogin$/ ) {
		my $help = BufHelp->new();
		$help->init($help_path, 'login');
		print $help->get_Info();
}

elsif ($bufaction =~ /^getFeatures$/) {
	print BufNasFeature->get_all_value();
}

#TO GET THE HOSTNAME AT LOGIN PAGE (BEFORE AUTHENTICATION)
#IMPORTANT!!
elsif($bufaction =~ /^getHostNameSettings$/) { 
	my $HN = BufHost->new();
	$HN->init;
	print $HN->getHostName_settings();
}

# Check Authentication before allowing any navigation
elsif ($bufaction !~ /^verifyLogin$/ && authenticate()) { 
	main();
}
else {
	# Fallas in this loop if not already authenticated 
	if($bufaction =~ /^verifyLogin$/) {
		# BufAction sent by login.js to verify the user credentials
		# Depending on the result the js file will take care of redirecting to root.html
		my $Auth = BufAuth->new();
		$Auth->init;
		print $Auth->verify_Login($cgiRequest);
	}
	else {
		# Goes here if it is the very first time or if the cookie expired
		# and it gets redirected to login.html again
		my @dataArray;
		my @errors;
		#push(@errors, {'redirect' => 'login.html'});
		print to_json ({'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>\@errors});
	}
}

# Goes to Main only after authentication
sub main {
	# Get the bufaction from client
	my $cgiRequest = CGI->new();
	my $bufaction = $cgiRequest->param("bufaction");

	# This bufaction is used by the processAuth() function in all of the js files.
	if($bufaction =~ /^validateSession$/) {
		my $self = shift;
		my $Auth = BufAuth->new();
		$Auth->init;
		print $Auth->get_lang();
	}

#---------------------------------------------------------
#GET INFO FOR LEFT PANEL 

	elsif($bufaction =~ /^getRootSettings(.*)$/) {
		my $i = $1;
		my $Info = BufRoot->new();
		$Info->init();
		print $Info->get_Info($i);
	}

#--------------[fTESTING DATA FOR DISK/NAS OPERATION STARTS HERE]-------------------------------------------

elsif($bufaction =~ /^getOperationStatus$/) {
=pod
		my $i = $1;
		my @dataArray;
		my @dataArrayTest;
		my @errors; 	
		#disk check
			push(@dataArray, {'operation' => 'opDiskErase',
							# 'task' => 'erase_1_4',
							# 'progress' => '0.13GB / 492.01GB (0.03%)',
							# 'elapsedTime' => '624.5'
		# });
		#push(@dataArray, {'operation' => 'opDiskFormat',
		#push(@dataArray, {'operation' => 'opDiskCheck',
		#push(@dataArray, {'operation' => 'opNasFormat',
		#push(@dataArray, {'operation' => 'opNasRestore',
							'task' => '',
							'progress' => '',
							'elapsedTime' => ''
		});
		#operation completed
		# push(@dataArray, {'operation' => '',
							# 'task' => '',
							# 'progress' => '',	
							# 'elapsedTime' => ''
		# });
		
		#print to_json ({'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors});
		print to_json ({'success'=>JSON::true, 'data'=>\@dataArrayTest, 'errors'=>\@errors});
=cut

		my $opStatus = BufOperationStatus->new();
		$opStatus->init;
		print $opStatus->getOperationStatus();
	}
#--------------[fTESTING DATA FOR DISK/NAS OPERATION END HERE]	-------------------------------------------

#USED FOR GATE CHECKING (CONFIRMATION)

	elsif($bufaction =~ /^getGate$/) {
		my $gate = BufGateCheck->new();
		$gate->init();
		print $gate->get_gate();
	}

	elsif($bufaction =~ /^checkGate$/) {
		my $gate = BufGateCheck->new();
		$gate->init();
		print $gate->check_gate($cgiRequest);
	} 

#---------------------------------------------------------
#GET HELP INFORMATION TO DISPLAY IN HELP SCREEN 

	elsif($bufaction =~ /^getHelp(.*)$/) {
		my $i = $1;
		my $help = BufHelp->new();
		if (($i eq 'dtcp_ip') && ($language ne 'en') && ($language ne 'ja')) {
			$help->init($help_path_en, $i);
		}
		else {
			$help->init($help_path, $i);
		}
		print $help->get_Info();
	}

#---------------------------------------------------------
#GET NAS_FEATURE

	elsif ($bufaction =~ /^getFeatures$/) {
		print BufNasFeature->get_all_value();
	}

#---------------------------------------------------------
#SHARE FOLDERS TAB

	elsif($bufaction =~ /^getShareAllList$/) {
		my $share = BufShare->new();
		$share->init;
		print $share->getShare_allList();
	}

	elsif($bufaction =~ /^getShareList$/) {
		my $share = BufShare->new();
		$share->init;
		print $share->getShare_list();
	}

	elsif($bufaction =~ /^getShareSettings(.*)$/) {
		my $i = $1;
		my $share = BufShare->new();
		$share->init($i);
		print $share->getShare_settings();
	}

	elsif($bufaction =~ /^getShareAxsConfig(.*)$/) {
		my $i = $1;
		my $share = BufShare->new();
		$share->init($i);
		print $share->getShare_axsConfig($cgiRequest);
	}

	elsif($bufaction =~ /^getShareLocalList$/) {
		my $share = BufShare->new();
		$share->init();
		print $share->getShare_localList($cgiRequest);
	}

	elsif($bufaction =~ /^getShareDomainList$/) {
		my $share = BufShare->new();
		$share->init();
		print $share->getShare_domainList($cgiRequest);
	}

	elsif($bufaction =~ /^getShareExternalList$/) {
		my $share = BufShare->new();
		$share->init();
		print $share->getShare_externalList($cgiRequest);
	}

	elsif($bufaction =~ /^setShareSettings(.*)$/) {
		my $i = $1;
		my $share = BufShare->new();
		$share->init($i);
		print $share->setShare_settings($cgiRequest);
	}

	elsif($bufaction =~ /^addShare$/) {
		my $share = BufShare->new();
		$share->init();
		print $share->setShare_settings($cgiRequest);
	}

	elsif ($bufaction =~ /^getShareAllVolumeList$/) {
		my $share = BufShare->new();
		$share->init;
		print $share->getShareAllVolumeList();
	}

	elsif($bufaction =~ /^searchUserGroup(.*)$/) {
		my $share = BufShare->new();
		$share->init($1);
		print $share->searchUserGroup($cgiRequest);
	}

	# DFS
	elsif ($bufaction =~ /^getDfsServices$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->getDfsServices();
	}

	elsif ($bufaction =~ /^getDfsRoot$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->getDfsRoot();
	}

	elsif ($bufaction =~ /^getDfsLinksList$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->getDfsLinksList();
	}

	elsif ($bufaction =~ /^setDfsServices$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->setDfsServices($cgiRequest);
	}

	elsif ($bufaction =~ /^setDfsRoot$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->setDfsRoot($cgiRequest);
	}

	elsif ($bufaction =~ /^setDfsLink(.*)$/) {
		my $i = $1;
		my $dfs = BufDFS->new();
		$dfs->init($i);
		print $dfs->setDfsLink($cgiRequest);
	}

	elsif ($bufaction =~ /^addDfsLink$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->addDfsLink($cgiRequest);
	}

	elsif ($bufaction =~ /^delDfsLinkList$/) {
		my $dfs = BufDFS->new();
		$dfs->init;
		print $dfs->delDfsLinkList($cgiRequest);
	}

	# TeraSearch
	elsif ($bufaction =~ /^getTeraSearch$/) {
		my $tera = BufTeraSearch->new();
		$tera->init;
		print $tera->getTeraSearch();
	}

	elsif ($bufaction =~ /^setTeraSearch$/) {
		my $tera = BufTeraSearch->new();
		$tera->init;
		print $tera->setTeraSearch($cgiRequest);
	}

	elsif ($bufaction =~ /^updateTeraSearch$/) {
		my $tera = BufTeraSearch->new();
		$tera->init;
		print $tera->updateTeraSearch();
	}

	# DirectCopy
	elsif ($bufaction =~ /^getDirectCopy$/) {
		my $d_copy = BufDirectCopy->new();
		$d_copy->init;
		print $d_copy->getDirectCopy();
	}

	elsif ($bufaction =~ /^setDirectCopy$/) {
		my $d_copy = BufDirectCopy->new();
		$d_copy->init;
		print $d_copy->setDirectCopy($cgiRequest);
	}

#---------------------------------------------------------
#USER/GROUP MANAGEMENT TAB

	#USER MANAGEMENT SUB TAB
	elsif($bufaction =~ /^getUserAllList$/) {
		my $User = BufUser->new();
		$User->init;
		print $User->getUser_allList();
	}

	elsif($bufaction =~ /^getExternalUserAllList$/) {
		my $User = BufUser->new();
		$User->init;
		print $User->getExternalUser_allList();
	}

	elsif($bufaction =~ /^getBothUserAllList$/) {
		my $User = BufUser->new();
		$User->init;
		print $User->getBothUser_allList();
	}

	elsif($bufaction =~ /^getUserSettings(.*)$/) {
		my $i = $1;
		my $User = BufUser->new();
		$User->init($i);
		print $User->getUser_settings();
	}

	elsif($bufaction =~ /^setUserSettings(.*)$/) {
		my $i = $1;
		my $User = BufUser->new();
		$User->init($i);
		print $User->setUser_settings($cgiRequest, 'edit');
	}

	elsif($bufaction =~ /^addUser$/) {
		my $User = BufUser->new();
		print $User->setUser_settings($cgiRequest);
	}

	elsif($bufaction =~ /^delUserList$/) {
		my $User = BufUser->new();
		$User->init();
		print $User->delUser_list($cgiRequest);
	}

	elsif($bufaction =~ /^delExternalUserList$/) {
		my $User = BufUser->new();
		$User->init();
		print $User->delExternalUser_list($cgiRequest);
	}

	elsif($bufaction =~ /^convLocalToExternalUserList$/) {
		my $User = BufUser->new();
		$User->init();
		print $User->convLocalToExternalUserList($cgiRequest);
	}

	elsif($bufaction =~ /^uploadUserCsvImport$/) {
		my $User = BufUser->new();
		$User->init();
		print $User->uploadUserCsvImport($cgiRequest);
	}

	elsif($bufaction =~ /^setUserActivate$/) {
		my $User = BufUser->new();
		print $User->setUserActivate($cgiRequest);
	}

#---------------------------------------------------------

	#GROUP MANAGEMENT SUB TAB
	elsif($bufaction =~ /^getGroupAllList$/) {
		my $Group = BufGroup->new();
		$Group->init;
		print $Group->getGroup_allList();
	}

	elsif($bufaction =~ /^getGroupSettings(.*)$/) {
		my $i = $1;
		my $Group = BufGroup->new();
		$Group->init($i);
		print $Group->getGroup_settings();
	}

	elsif($bufaction =~ /^setGroupSettings(.*)$/) {
		my $i = $1;
		my $Group = BufGroup->new();
		$Group->init($i);
		print $Group->setGroup_settings($cgiRequest, 'edit');
	}

	elsif($bufaction =~ /^addGroup$/) {
		my $Group = BufGroup->new();
		print $Group->setGroup_settings($cgiRequest);
	}

	elsif($bufaction =~ /^delGroupList$/) {
		my $Group = BufGroup->new();
		$Group->init();
		print $Group->delGroup_list($cgiRequest);
	}
		
#---------------------------------------------------------
#NETWORK TAB

	#NETWORK SETTINGS SUB TAB 
	elsif($bufaction =~ /^getIPSettings$/) {
		my $IP = BufIPAddress->new();
		$IP->init;
		print $IP->getIP_settings();
	}

	elsif($bufaction =~ /^setIPsettings$/) {
		my $IP = BufIPAddress->new();
		$IP->init;
		$IP->setIP_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getNSSSettings$/) {
		my $NS = BufNSS->new();
		$NS->init;
		print $NS->getNSS_settings();
	}

	elsif($bufaction =~ /^setNSSSettings$/) {
		my $NS = BufNSS->new();
		$NS->init;
		print $NS->setNSS_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getEFSSettings$/) {
		my $EF = BufEFS->new();
		$EF->init;
		print $EF->getEFS_settings();
	}

	elsif($bufaction =~ /^setEFSSettings$/) {
		my $EF = BufEFS->new();
		$EF->init;
		print $EF->setEFS_settings($cgiRequest);
	}

	#NETWORK DOMAIN PROPERTIES SUB TAB 
	elsif($bufaction =~ /^getDomainSettings$/) {
		my $WGAD = BufDomain->new();
		$WGAD->init;
		print $WGAD->getDomain_settings();
	}

	elsif($bufaction =~ /^setDomainSettings$/) {
		my $WGAD = BufDomain->new();
		$WGAD->init;
		print $WGAD->setDomain_settings($cgiRequest);
	}

	# NFS
	elsif($bufaction =~ /^getNfsServiceSettings$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->getNfsServiceSettings();
	}

	elsif($bufaction =~ /^setNfsServiceSettings$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->setNfsServiceSettings($cgiRequest);
	}

	elsif($bufaction =~ /^getNfsFoldersSettings$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->getNfsFoldersSettings();
	}

	elsif($bufaction =~ /^setNfsFoldersSettings$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->setNfsFoldersSettings($cgiRequest);
	}

	elsif($bufaction =~ /^getNfsClients$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->getNfsClients();
	}

	elsif($bufaction =~ /^addNfsClient$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->addNfsClient($cgiRequest);
	}

	elsif($bufaction =~ /^delNfsClient$/) {
		my $nfs = BufNFS->new();
		$nfs->init();
		print $nfs->delNfsClient($cgiRequest);
	}

	# Services
	elsif($bufaction =~ /^getServicesList$/) {
		my $services = BufServices->new();
		$services->init();
		print $services->getServicesList();
	}

	elsif($bufaction =~ /^setServicesSettings(.*)$/) {
		my $services = BufServices->new();
		$services->init();
		print $services->setServicesSettings($cgiRequest);
	}

	# PortTrunking
	elsif($bufaction =~ /^getPortTrunkingSettings$/) {
		my $port = BufPortTrunking->new();
		$port->init();
		print $port->getPortTrunkingSettings();
	}

	elsif($bufaction =~ /^setPortTrunkingSettings$/) {
		my $port = BufPortTrunking->new();
		$port->init();
		print $port->setPortTrunkingSettings($cgiRequest);
	}

	# Web Server
	elsif ($bufaction =~ /^getWebserverSettings$/) {
		my $web_server = BufWebServer->new();
		$web_server->init();
		print $web_server->getWebserverSettings();
	}

	elsif ($bufaction =~ /^setWebserverSettings$/) {
		my $web_server = BufWebServer->new();
		$web_server->init();
		print $web_server->setWebserverSettings($cgiRequest);
	}

	elsif ($bufaction =~ /^getPhpSettings$/) {
		my $php_server = BufPHP->new();
		$php_server->init();
		print $php_server->getPhpSettings();
	}

	elsif ($bufaction =~ /^setPhpSettings$/) {
		my $php_server = BufPHP->new();
		$php_server->init();
		print $php_server->setPhpSettings($cgiRequest);
	}

	elsif ($bufaction =~ /^restorePhpSettings$/) {
		my $php_server = BufPHP->new();
		$php_server->init();
		print $php_server->restorePhpSettings();
	}

	# MySQL Server
	elsif ($bufaction =~ /^getMysqlserverSettings$/) {
		my $mysql_server = BufMySQLServer->new();
		$mysql_server->init();
		print $mysql_server->getMysqlserverSettings();
	}

	elsif ($bufaction =~ /^setMysqlserverSettings$/) {
		my $mysql_server = BufMySQLServer->new();
		$mysql_server->init();
		print $mysql_server->setMysqlserverSettings($cgiRequest);
	}


	# SNMP
	elsif ($bufaction =~ /^getSnmpSetting$/) {
		my $snmp = BufSnmp->new();
		$snmp->init();
		print $snmp->getSnmpSettings();
	}

	elsif ($bufaction =~ /^setSnmpSetting$/) {
		my $snmp = BufSnmp->new();
		$snmp->init();
		print $snmp->setSnmpSettings($cgiRequest);
	}



#--------------------------------------------------------------
#SYSTEM

	#SYSTEM SETTINGS SUB TAB
	elsif($bufaction =~ /^getHostNameSettings$/) { 
		my $HN = BufHost->new();
		$HN->init;
		print $HN->getHostName_settings();
	}

	elsif($bufaction =~ /^setHostNameSettings$/) {
		my $HN = BufHost->new();
		$HN->init;
		print $HN->setHostName_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getDTSettings$/) { 
		my $DT = BufDateTime->new();
		$DT->init;
		print $DT->getDT_settings();
	}

	elsif($bufaction =~ /^setDTSettings$/) {
		my $DT = BufDateTime->new();
		$DT->init;
		print $DT->setDT_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getLangSettings$/) { 
		my $lang = BufLang->new();
		$lang->init;
		print $lang->getLang_settings();
	}

	elsif($bufaction =~ /^setLangSettings$/) {
		my $lang = BufLang->new();
		$lang->init;
		print $lang->setLang_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getManagSettings$/) {
		my $manage = BufManage->new();
		$manage->init;
		print $manage->getManagSettings();
	}

	elsif($bufaction =~ /^setManagSettings$/) {
		my $manage = BufManage->new();
		$manage->init;
		print $manage->setManagSettings($cgiRequest);
	}

#---------------------------------------------------------

	elsif($bufaction =~ /^getAdminSettings$/) {
		my $admin = BufAdmin->new();
		$admin->init;
		print $admin->getAdminSettings();
	}

	elsif($bufaction =~ /^setAdminSettings$/) {
		my $admin = BufAdmin->new();
		$admin->init;
		print $admin->setAdminSettings($cgiRequest);
	}

	elsif($bufaction =~ /^getAccessSettings$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->getAccessSettings();
	}

	elsif($bufaction =~ /^setAccessSettings$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->setAccessSettings($cgiRequest);
	}

	elsif($bufaction =~ /^getHddToolSettings$/) {
		my $hddtool = BufHddTool->new();
		$hddtool->init;
		print $hddtool->getHddToolSettings();
	}

	elsif($bufaction =~ /^setHddToolSettings$/) {
		my $hddtool = BufHddTool->new();
		$hddtool->init;
		print $hddtool->setHddToolSettings($cgiRequest);
	}

#---------------------------------------------------------

	elsif($bufaction =~ /^getSystemStatus$/) {
		my $sys_status = BufSystemStatus->new();
		$sys_status->init;
		print $sys_status->getSystemStatus();
	}

	elsif($bufaction =~ /^getNetworkStatus$/) {
		my $net_status = BufNetworkStatus_new->new();
		$net_status->init;
		print $net_status->getNetworkStatus();
	}

	elsif($bufaction =~ /^getConnHistory$/) {
		my $conn = BufConnHistory->new();
		$conn->init;
		print $conn->getConnHistory();
	}

#---------------------------------------------------------

	#SYSTEM DISK SUB TAB
=pod
# ここから -->	デバッグ用 getDiskAllListを横取り
	elsif($bufaction =~ /^getDiskAllList$/) {
#	elsif($bufaction =~ /^getArraySettings(.*)$/) {
		my $i = $1;
#for_debug
$i = 'array2';
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArraySettings($i);
	}
# <-- ここまで	デバッグ用 getDiskAllListを横取り
=cut

	elsif($bufaction =~ /^getDiskAllList$/) {
		my $Disks = BufDiskProperties->new();
		$Disks->init;
		print $Disks->get_dynamicVal();
	}


	elsif($bufaction =~ "^checkDisk") {
		my $Disk = BufDiskCheck->new();
		$Disk->init;
		print $Disk->perform_diskCheck($cgiRequest);
	}

	elsif($bufaction =~ "^getDiskCheckStatus") {
		my $Disk = BufDiskCheck->new();
		$Disk->init;
		print $Disk->get_DiskCheckStatus($cgiRequest);
	}

	elsif($bufaction =~ "^formatDisk") {
		my $Disk = BufDiskFormat->new();
		$Disk->init;
		print $Disk->perform_diskFormat($cgiRequest);
	}

	elsif($bufaction =~ "^getDiskFormatStatus") {
		my $Disk = BufDiskFormat->new();
		$Disk->init;
		print $Disk->get_DiskFormatStatus($cgiRequest);
	}

#	elsif($bufaction =~ /^delAssign(.*)$/) {
#		my $i = $1;
#		$DP->init($i);
#		print $DP->del_diskAssignment($i);
#	}

#	elsif($bufaction =~ /^delAssign$/) {
#		my $DP = BufDiskProperties->new();
#		$DP->init();
#		print $DP->del_diskAssignment($cgiRequest);
#	}

	elsif($bufaction =~ /^wakeupDisk$/) {
		my $DP = BufDiskProperties->new();
		$DP->init();
		print $DP->wakeupDisk($cgiRequest);
	}

	# LVM
	elsif($bufaction =~ /^getVolumesList$/) {
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->getVolumeList();
	}

	elsif($bufaction =~ /^getVolumeSettings(.*)$/) {
		my $i = $1;
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->getVolumeSettings($i);
	}

	elsif($bufaction =~ /^getDiskAreaList$/) {
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->getDiskAreaList();
	}

	elsif($bufaction =~ /^setLvm$/) {
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->setLvm($cgiRequest);
	}

	elsif($bufaction =~ /^addVolume$/) {
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->addVolume($cgiRequest);
	}

	elsif($bufaction =~ /^delVolume$/) {
		my $lvm = BufVolumeProperties->new();
		$lvm->init();
		print $lvm->delVolume($cgiRequest);
	}

	elsif($bufaction =~ /^setVolumeSettings(.*)$/) {
		my $i = $1;
		my $lvm = BufVolumeProperties->new();
		$lvm->init($i);
		print $lvm->setVolumeSettings($cgiRequest);
	}

	# RAID
	elsif($bufaction =~ /^getArrayList$/) {
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayList();
	}

	elsif($bufaction =~ /^getArraySettings(.*)$/) {
		my $i = $1;
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArraySettings($i);
	}

	elsif($bufaction =~ /^getArrayEditInfo(.*)$/) {
		my $i = $1;
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayEditInfo($i);
	}

	elsif($bufaction =~ /^getArrayRebuildInfo(.*)$/) {
		my $i = $1;
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayRebuildInfo($i);
	}

	elsif($bufaction =~ /^getArrayCreateInfo(.*)$/) {
		my $i = $1;
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayCreateInfo($i);
	}

	elsif($bufaction =~ /^getArrayCreatableMode$/) {
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayCreatableMode();
	}

	elsif($bufaction =~ /^getArrayEdpBaseDisk$/) {
		my $array = BufArrayProperties->new();
		$array->init();
		print $array->getArrayEdpBaseDisk();
	}

	elsif($bufaction =~ /^getArrayMaintenance$/) {
		my $array = BufArrayMaintenance->new();
		$array->init();
		print $array->getArrayMaintenance();
	}

	elsif($bufaction =~ /^setArrayMaintenance$/) {
		my $array = BufArrayMaintenance->new();
		$array->init();
		print $array->setArrayMaintenance($cgiRequest);
	}

	elsif($bufaction =~ /^abortArrayMaintenance$/) {
		my $array = BufArrayMaintenance->new();
		$array->init();
		print $array->abortArrayMaintenance($cgiRequest);
	}

	elsif($bufaction =~ /^getArrayMiscInfo$/) {
		my $array = BufArrayMaintenance->new();
		$array->init();
		print $array->getArrayMiscInfo();
	}

	elsif($bufaction =~ /^setArrayMiscInfo$/) {
		my $array = BufArrayMaintenance->new();
		$array->init();
		print $array->setArrayMiscInfo($cgiRequest);
	}

#---------------------------------------------------------

	#SYSTEM BACKUP SUB TAB
	elsif($bufaction =~ /^getBackupAllList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init;
		print $Jobs->getBackup_allList();
	}

	elsif($bufaction =~ /^getBackupSettings(.*)$/) {
		my $i = $1;
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init($i);
		print $Jobs->getBackup_settings();
	}

	elsif($bufaction =~ /^getBackupFolders(.*)$/) {
		my $i = $1;
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init($i);
		print $Jobs->getBackup_folders();
	}

	elsif($bufaction =~ /^getBackupSourceList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupSources();
	}

	elsif($bufaction =~ /^getBackupTargetList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupTargets();
	}

	elsif($bufaction =~ /^getBackupTargetListHardlink$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupSources('hardlink');
	}

	elsif($bufaction =~ /^getReplicationSourceList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupSources('replication');
	}

	elsif($bufaction =~ /^getReplicationTargetList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupTargets('replication');
	}

	elsif($bufaction =~ /^getDirectCopyTargetList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		print $Jobs->get_backupSources('directcopy');
	}

	elsif($bufaction =~ /^setBackupSettings(.*)$/) {
		my $i = $1;
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init($i);
		print $Jobs->setBackup_settings($cgiRequest);
	}

	elsif($bufaction =~ /^addBackup$/) {
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init();
		print $Jobs->setBackup_settings($cgiRequest);
	}

	elsif($bufaction =~ /^delBackupList$/) {
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init();
		print $Jobs->delBackup_list($cgiRequest);
	}

	elsif($bufaction =~ /^getDeviceLocalList$/) {
		my $DevList = BufDiskBackupDevList->new();
		$DevList->init;
		print $DevList->get_localLinkStations();
	}

	elsif($bufaction =~ /^getDeviceOffSubnetList$/) {
		my $DevList = BufDiskBackupDevList->new();
		$DevList->init('skip');
		print $DevList->get_offSubnetLinkStations();
	}

	elsif($bufaction =~ /^addDevice$/) {
		my $DevList = BufDiskBackupDevList->new();
		$DevList->init('skip');
		print $DevList->add_offSubnetLS($cgiRequest);
	}

	elsif($bufaction =~ /^delDeviceList$/) {
		my $DevList = BufDiskBackupDevList->new();
		$DevList->init('skip');
		print $DevList->del_offSubnetLS($cgiRequest);
	}

	elsif($bufaction =~ /^getBackupPassword$/) {
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init();
		print $Jobs->get_BackupPassword();
	}

	elsif($bufaction =~ /^setBackupPassword/) {
		my $Jobs = BufDiskBackupJobs->new();
		$Jobs->init();
		print $Jobs->set_BackupPassword($cgiRequest);
	}

	# Replication
	elsif ($bufaction =~ /^getReplicationList/) {
		my $repli = BufDiskReplication->new();
		$repli->init();
		print $repli->getReplicationList();
	}
	elsif ($bufaction =~ /^addReplication/) {
		my $repli = BufDiskReplication->new();
		$repli->init();
		print $repli->addReplication($cgiRequest);
	}
	elsif ($bufaction =~ /^delReplication/) {
		my $repli = BufDiskReplication->new();
		$repli->init();
		print $repli->delReplication($cgiRequest);
	}
	elsif ($bufaction =~ /^checkReplication/) {
		my $repli = BufDiskReplication->new();
		$repli->init();
		print $repli->checkReplication();
	}
	elsif ($bufaction =~ /^resyncReplication/) {
		my $repli = BufDiskReplication->new();
		$repli->init();
		print $repli->resyncReplication();
	}

#---------------------------------------------------------

	# SYSTEM MAINTENANCE SUB TAB
	elsif($bufaction =~ /^getEmailSettings$/) {
		my $EN = BufEmail->new();
		$EN->init;
		print $EN->get_mailSettings();
	}
		
	elsif($bufaction =~ /^getEmailList$/) {
		my $EN = BufEmail->new();
		$EN->init;
		print $EN->get_emailList();
	}

	elsif($bufaction =~ /^setEmailSettings$/) {
		my $EN = BufEmail->new();
		$EN->init;
		print $EN->set_mailSettings($cgiRequest);
	}

	elsif($bufaction =~ /^setEmailTestMsg$/) {
		my $EN = BufEmail->new();
		$EN->init;
		print $EN->set_EmailTestMsg();
	}

	elsif($bufaction =~ /^getUPSSettings$/) {
		my $UPS = BufUPS->new();
		$UPS->init;
		print $UPS->get_upsSettings();
	}

	elsif($bufaction =~ /^setUPSSettings$/) {
		my $UPS = BufUPS->new();
		$UPS->init;
		print $UPS->set_upsSettings($cgiRequest);
	}

	elsif($bufaction =~ /^getAlertSettings$/) {
		my $AS = BufAlert->new();
		$AS->init;
		print $AS->getAlert_settings();
	}

	elsif($bufaction =~ /^setAlertSettings$/) {
		my $AS = BufAlert->new();
		$AS->init;
		print $AS->setAlert_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getLEDSettings$/) {
		my $Led = BufLED->new();
		$Led->init;
		print $Led->getLED_settings();
	}

	elsif($bufaction =~ /^setLEDSettings$/) {
		my $Led = BufLED->new();
		$Led->init;
		print $Led->setLED_settings($cgiRequest);
	}

	elsif($bufaction =~ /^getLCDSettings$/) {
		my $Lcd = BufLCD->new();
		$Lcd->init;
		print $Lcd->getLCDSettings();
	}

	elsif($bufaction =~ /^setLCDSettings$/) {
		my $Lcd = BufLCD->new();
		$Lcd->init;
		print $Lcd->setLCDSettings($cgiRequest);
	}

	elsif($bufaction =~ /^shutRestartLS$/) {
		my $Reset = BufReset->new();
		$Reset->init;
		print $Reset->reset_LinkStation($cgiRequest);
	}

	elsif($bufaction =~ /^getAllSettings$/) {
		#my $Reset = BufReset->new();
		#$Reset->init;
		#print $Reset->reset_LinkStation($cgiRequest);
	}

	elsif($bufaction =~ /^getPingResults$/) {
		my $ping = BufPing->new();
		$ping->init;
		print $ping->getPingResults($cgiRequest);
	}

#---------------------------------------------------------

	elsif($bufaction =~ /^getHDDSpindownSettings$/) { 
		my $hddspindown = BufHDDSpindown->new();
		$hddspindown->init;
		print $hddspindown->getHDDSpindownSettings();
}

	elsif($bufaction =~ /^setHDDSpindownSettings$/) { 
		my $hddspindown = BufHDDSpindown->new();
		$hddspindown->init;
		print $hddspindown->setHDDSpindownSettings($cgiRequest);
}

#---------------------------------------------------------	

	elsif($bufaction =~ /^getSyslogSettings$/) { 
		my $syslog = BufSyslog->new();
		$syslog->init;
		print $syslog->getSyslogSettings();
}

	elsif($bufaction =~ /^setSyslogSettings$/) { 
		my $syslog = BufSyslog->new();
		$syslog->init;
		print $syslog->setSyslogSettings($cgiRequest);
}

#---------------------------------------------------------	

	#SYSTEM RESTORE/FORMAT SUB TAB 
	elsif($bufaction =~ /^getInitSettings$/) {
		my $Init = BufInit->new();
		$Init->init;
		print $Init->getInit_settings();
	}

	elsif($bufaction =~ /^setInitSettings$/) {
		 my $Init = BufInit->new();
		 $Init->init;
		 print $Init->set_initSettings($cgiRequest);
	}

	elsif($bufaction =~ /^restoreLS$/) {
		my $Init = BufInit->new();
		$Init->init;
		print $Init->restore_LS($cgiRequest);
	}

	elsif($bufaction =~ /^formatDiskList$/) {
		my $Init = BufInit->new();
		$Init->init;
		print $Init->formatDisk_list();
	}

	elsif($bufaction =~ /^getInitStatus$/) {
		my $Init = BufInit->new();
		$Init->init;
		print $Init->get_InitStatus();
	}

	#if($bufaction =~ "^redirect") {
	#	my $errorHash = {
	#  	'redirect' => 'login.html'
	#  };

	#  my @errors = ($errorHash);
	#  my @dataArray;

	#  my $jsnHash = { 'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>\@errors };
	#  print to_json($jsnHash);
	#}

	#if($bufaction =~ "^downloadSettings") {
	#	my $set = BufSettings->new();
	#  $set->init;
	#  print $set->download();
	#}

#--------------------------------------------------------------
#EXTENSIONS

	#EXTENSIONS WEBAXS SUB TAB

	elsif($bufaction =~ /^getWebaxsSettings$/) { 
		my $webaxs = BufWebaxs->new();
		$webaxs->init;
		print $webaxs->getWebaxsSettings();
}

	elsif($bufaction =~ /^setWebaxsSettings$/) { 
		my $webaxs = BufWebaxs->new();
		$webaxs->init;
		print $webaxs->setWebaxsSettings($cgiRequest);
}

	elsif($bufaction =~ /^setWebaxsFolderSettings$/) { 
		my $webaxs = BufWebaxs->new();
		$webaxs->init;
		print $webaxs->setWebaxsFolderSettings($cgiRequest);
}

#--------------------------------------------------------------
	#EXTENSIONS POCKETU SUB TAB

	elsif($bufaction =~ /^getPocketUSettings$/) { 
		my $pocketU = BufPocketU->new();
		$pocketU->init;
		print $pocketU->getPocketUSettings();
}

	elsif($bufaction =~ /^setPocketUSettings$/) { 
		my $pocketU = BufPocketU->new();
		$pocketU->init;
		print $pocketU->setPocketUSettings($cgiRequest);
}

	elsif($bufaction =~ /^setPocketUFolderSettings$/) { 
		my $pocketU = BufPocketU->new();
		$pocketU->init;
		print $pocketU->setPocketUFolderSettings($cgiRequest);
}

	elsif($bufaction =~ /^checkPocketUInternetConnection$/) { 
		my $pocketU = BufPocketU->new();
		$pocketU->init;
		print $pocketU->checkPocketUInternetConnection($cgiRequest);
}

#--------------------------------------------------------------
	#EXTENSIONS MEDIASERVER SUB TAB

	elsif($bufaction =~ /^getMediaserverFolders$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->getMediaserverFolders();
}

	elsif($bufaction =~ /^getMediaserverDlnaSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->getMediaserverDlnaSettings();
}

	elsif($bufaction =~ /^setMediaserverDlnaSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->setMediaserverDlnaSettings($cgiRequest);
}

	elsif($bufaction =~ /^restartMediaserverDlnaService$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->restartMediaserverDlnaService();
}

	elsif($bufaction =~ /^getMediaserverItunesSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->getMediaserverItunesSettings();
}

	elsif($bufaction =~ /^setMediaserverItunesSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->setMediaserverItunesSettings($cgiRequest);
}

	elsif($bufaction =~ /^restartMediaserverItunesService$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->restartMediaserverItunesService();
}

	elsif($bufaction =~ /^getMediaserverSqueezeboxSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->getMediaserverSqueezeboxSettings();
}

	elsif($bufaction =~ /^setMediaserverSqueezeboxSettings$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->setMediaserverSqueezeboxSettings($cgiRequest);
}

	elsif($bufaction =~ /^restartMediaserverSqueezeboxService$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->restartMediaserverSqueezeboxService();
}

	elsif($bufaction =~ /^getMediaserverDlnaClients$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->getMediaserverDlnaClients();
}

	elsif($bufaction =~ /^setMediaserverDlnaClients$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->setMediaserverDlnaClients($cgiRequest);
}

	elsif($bufaction =~ /^updateMediaserverModule$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->updateMediaserverModule();
}

	elsif($bufaction =~ /^initSqueezeboxService$/) { 
		my $mediaserver = BufMediaserver->new();
		$mediaserver->init;
		print $mediaserver->initSqueezeboxService();
}

#--------------------------------------------------------------
	#EXTENSIONS DEVICESERVER SUB TAB

	elsif($bufaction =~ /^getDeviceserverSettings$/) { 
		my $deviceserver = BufDeviceserver->new();
		$deviceserver->init;
		print $deviceserver->getDeviceserverSettings();
}

	elsif($bufaction =~ /^setDeviceserverSettings$/) { 
		my $deviceserver = BufDeviceserver->new();
		$deviceserver->init;
		print $deviceserver->setDeviceserverSettings($cgiRequest);
}

#--------------------------------------------------------------
	#EXTENSIONS PRINTSERVER SUB TAB

	elsif($bufaction =~ /^getPrintserverSettings$/) { 
		my $printserver = BufPrintserver->new();
		$printserver->init;
		print $printserver->getPrintserverSettings();
}

	elsif($bufaction =~ /^setPrintserverSettings$/) { 
		my $printserver = BufPrintserver->new();
		$printserver->init;
		print $printserver->setPrintserverSettings($cgiRequest);
}

	elsif($bufaction =~ /^delPrintserverJob$/) { 
		my $printserver = BufPrintserver->new();
		$printserver->init;
		print $printserver->delPrintserverJob();
}

#--------------------------------------------------------------
	#EXTENSIONS BITTORRENT SUB TAB

	elsif($bufaction =~ /^getBittorrentSettings$/) { 
		my $bittorrent = BufBittorrent->new();
		$bittorrent->init;
		print $bittorrent->getBittorrentSettings();
}

	elsif($bufaction =~ /^setBittorrentSettings$/) { 
		my $bittorrent = BufBittorrent->new();
		$bittorrent->init;
		print $bittorrent->setBittorrentSettings($cgiRequest);
}

	elsif($bufaction =~ /^getBittorrentFolders$/) { 
		my $bittorrent = BufBittorrent->new();
		$bittorrent->init;
		print $bittorrent->getBittorrentFolders();
}

	elsif($bufaction =~ /^initBittorrentSettings$/) { 
		my $bittorrent = BufBittorrent->new();
		$bittorrent->init;
		print $bittorrent->initBittorrentSettings();
}

#--------------------------------------------------------------
	#EXTENSIONS SLEEPTIMER SUB TAB

	elsif($bufaction =~ /^getSleeptimerSettings$/) { 
		my $sleeptimer = BufSleeptimer->new();
		$sleeptimer->init;
		print $sleeptimer->getSleeptimerSettings();
}

	elsif($bufaction =~ /^setSleeptimerSettings$/) { 
		my $sleeptimer = BufSleeptimer->new();
		$sleeptimer->init;
		print $sleeptimer->setSleeptimerSettings($cgiRequest);
}

#--------------------------------------------------------------
	#EXTENSIONS SECURITY SUB TAB

	elsif($bufaction =~ /^getSecuritySettings$/) { 
		my $security = BufSecurity->new();
		$security->init;
		print $security->getSecuritySettings();
}

	elsif($bufaction =~ /^setSecuritySettings$/) { 
		my $security = BufSecurity->new();
		$security->init;
		print $security->setSecuritySettings($cgiRequest);
	}

#--------------------------------------------------------------
	#EXTENSIONS TIME MACHINE SUB TAB

	elsif($bufaction =~ /^getTimemachineSettings$/) { 
		my $timemachine = BufTimemachine->new();
		$timemachine->init;
		print $timemachine->getTimemachineSettings();
}

	elsif($bufaction =~ /^setTimemachineSettings$/) { 
		my $timemachine = BufTimemachine->new();
		$timemachine->init;
		print $timemachine->setTimemachineSettings($cgiRequest);
}

	elsif($bufaction =~ /^getTimemachineFolders$/) { 
		my $timemachine = BufTimemachine->new();
		$timemachine->init;
		print $timemachine->getTimemachineFolders();
}

	elsif($bufaction =~ /^getTimemachineImage$/) { 
		my $timemachine = BufTimemachine->new();
		$timemachine->init;
		print $timemachine->getTimemachineImage();
}

	elsif($bufaction =~ /^createTimemachineImage$/) {
		my $timemachine = BufTimemachine->new();
		$timemachine->init;
		print $timemachine->createTimemachineImage($cgiRequest);
}

#--------------------------------------------------------------
	#EXTENSIONS TMNAS SUB TAB

	elsif($bufaction =~ /^getTmnasServiceSettings$/) { 
		my $tmnas = BufTmnas->new();
		$tmnas->init;
		print $tmnas->getTmnasServiceSettings();
}

	elsif($bufaction =~ /^setTmnasServiceSettings$/) { 
		my $tmnas = BufTmnas->new();
		$tmnas->init;
		print $tmnas->setTmnasServiceSettings($cgiRequest);
}

	elsif($bufaction =~ /^setTmnasFolderSettings$/) { 
		my $tmnas = BufTmnas->new();
		$tmnas->init;
		print $tmnas->setTmnasFolderSettings($cgiRequest);
}

	elsif($bufaction =~ /^initTmnasServiceSettings$/) { 
		my $tmnas = BufTmnas->new();
		$tmnas->init;
		print $tmnas->initTmnasServiceSettings();
}

#--------------------------------------------------------------
	#EXTENSIONS WEBSERVICE SUB TAB

	elsif($bufaction =~ /^getFlickrSettings$/) { 
		my $flickr = BufFlickr->new();
		$flickr->init;
		print $flickr->getFlickrSettings();
}

	elsif($bufaction =~ /^setFlickrSettings$/) { 
		my $flickr = BufFlickr->new();
		$flickr->init;
		print $flickr->setFlickrSettings($cgiRequest);
}

	elsif($bufaction =~ /^remountFlickrSettings$/) { 
		my $flickr = BufFlickr->new();
		$flickr->init;
		print $flickr->remountFlickrSettings();
}

	elsif($bufaction =~ /^initFlickrSettings$/) { 
		my $flickr = BufFlickr->new();
		$flickr->init;
		print $flickr->initFlickrSettings();
}

#--------------------------------------------------------------
	#EXTENSIONS EYE-FI CONNECT SUB TAB

	elsif($bufaction =~ /^getEyefiSettings$/) { 
		my $eyefi = BufEyeFi->new();
		$eyefi->init;
		print $eyefi->getEyefiSettings();
}

	elsif($bufaction =~ /^setEyefiSettings$/) { 
		my $eyefi = BufEyeFi->new();
		$eyefi->init;
		print $eyefi->setEyefiSettings($cgiRequest);
}

	elsif($bufaction =~ /^getEyeFiAuthLogin$/) { 
		my $eyefiAccessor = EyeFiCardHandler->new();
		print $eyefiAccessor->getAuthLoginHL($cgiRequest);
	}

	elsif($bufaction =~ /^getEyeFiAuthLogout$/) { 
		my $eyefiAccessor = EyeFiCardHandler->new();
		print $eyefiAccessor->getAuthLogoutHL($cgiRequest);
	}

	elsif($bufaction =~ /^getEyeFiCardsPropertiesList$/) { 
		my $eyefiAccessor = EyeFiCardHandler->new();
		print $eyefiAccessor->getCardsPropertiesList($cgiRequest);
	}

	elsif($bufaction =~ /^setEyeFiCardProperties$/){ 
		my $eyefiAccessor = EyeFiCardHandler->new();
		print $eyefiAccessor->setCardProperties($cgiRequest);
	}

	elsif($bufaction =~ /^getEyeFiDestinationFolders$/){ 
		my $eyefiAccessor = EyeFiCardHandler->new();
		print $eyefiAccessor->getDestinationFolders($cgiRequest);
	}

#--------------------------------------------------------------
	#EXTENSIONS WAFS SUB TAB

	elsif($bufaction =~ /^getWafsSettings$/) { 
		my $wafs = BufWafs->new();
		$wafs->init;
		print $wafs->getWafsSettings();
}

	elsif($bufaction =~ /^setWafsSettings$/) { 
		my $wafs = BufWafs->new();
		$wafs->init;
		print $wafs->setWafsSettings($cgiRequest);
}

	elsif($bufaction =~ /^remountWafsSettings$/) { 
		my $wafs = BufWafs->new();
		$wafs->init;
		print $wafs->remountWafsSettings();
}



#---------------------------------------------------------
	# locateDevice(I'm here!)

	elsif ($bufaction =~ /^locateDevice$/) {
		my $imhere = BufImHere->new();
		$imhere->init();
		print $imhere->exec_imhere();
	}

#--------------------------------------------------------------
	# iSCSI

	elsif ($bufaction =~ /^getIscsiStatus$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->getIscsiStatus();
}

	elsif ($bufaction =~ /^setIscsiStatus$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->setIscsiStatus($cgiRequest);
}

	elsif ($bufaction =~ /^getLvmList$/) {
		my $lvm = BufLvm->new();
		$lvm->init;
		print $lvm->getLvmList();
}

	elsif ($bufaction =~ /^setLvmSettings$/) {
		my $lvm = BufLvm->new();
		$lvm->init;
		print $lvm->setLvmSettings($cgiRequest);
}

	elsif ($bufaction =~ /^getIscsiVolumeList$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->getIscsiVolumeList();
}

	elsif ($bufaction =~ /^setIscsiVolumeActive$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->setIscsiVolumeActive($cgiRequest);
}

	elsif ($bufaction =~ /^addIscsiVolume$/) {
		my $iscsi = BufIscsi->new();
		$iscsi->init;
		print $iscsi->addIscsiVolume($cgiRequest);
}

	elsif ($bufaction =~ /^getIscsiVolumeSettings(.*)$/) {
		my $i = $1;
		my $iscsi = BufIscsi->new();
		$iscsi->init($i);
		print $iscsi->getIscsiVolumeSettings();
	}

	elsif ($bufaction =~ /^setIscsiVolumeSettings(.*)$/) {
		my $i = $1;
		my $iscsi = BufIscsi->new();
		$iscsi->init($i);
		print $iscsi->setIscsiVolumeSettings($cgiRequest);
}

#---------------------------------------------------------

	elsif ($bufaction =~ /^uploadFile$/) {
	 my @errors;
	 my @dataArray;

	 my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	 print to_json($jsnHash);
}

#---------------------------------------------------------


	elsif ($bufaction =~ /^getUpdateStatus$/) {
		my $update = BufUpdate->new();
		$update->init();
		print $update->getUpdateStatus($cgiRequest);
	}

	elsif ($bufaction =~ /^changeUpdateNotify$/) {
		my $update = BufUpdate->new();
		$update->init();
		print $update->changeUpdateNotify($cgiRequest);
	}
	

#---------------------------------------------------------

	return;

}


#else {print $bufaction;}
