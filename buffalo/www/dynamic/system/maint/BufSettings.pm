#!/usr/bin/speedy
;##############################
;# BufSettings.pm
;# useage :
;#  $class = new BufSettings;
;#  $class->init;
;# (C) 2007 BUFFALO INC. All rights reserved
;##############################

package BufSettings;

#import Libraries
use lib '/buffalo/www/dynamic/home';
use lib '/buffalo/www/dynamic/basic';
use lib '/buffalo/www/dynamic/network';
use lib '/buffalo/www/dynamic/disk';
use lib '/buffalo/www/dynamic/usrGrpMnt';
use lib '/buffalo/www/dynamic/shFolders';
use lib '/buffalo/www/dynamic/maint';
use lib '/buffalo/www/dynamic/system';


use strict;

use JSON;

sub new {
    my $class = shift;
    my $self = bless {
			mHomeSettings => undef,
      mBasicSettings => undef,
      mNetworkSettings => undef,
      mDiskSettings => undef,
      mSharedFolderSettings => undef,
      mUserGroupSettings => undef,
      mMaintenanceSettings => undef,
      mSystemSettings => undef,
      mAllSettings => undef
    }, $class;
    return $self;
}

sub init {
    my $self = shift;
    $self->load;
    return;
}

sub load {
    my $self = shift;
    #$self->{mHomeSettings} = loadHome();
    $self->{mBasicSettings} = loadBasic();
    $self->{mNetworkSettings} = loadNetwork();
    #$self->{mDiskSettings} = loadDisk();
    #$self->{mSharedFolderSettings} = loadShared();
    $self->{mUserGroupSettings} = loadUserGroup();
    $self->{mMaintenanceSettings} = loadMaintenance();
    $self->{mSystemSettings} = loadSystem();

    #$self->{mAllSettings} = $self->{mHomeSettings};
  	$self->{mAllSettings} = $self->{mBasicSettings};
	  $self->{mAllSettings} .= $self->{mNetworkSettings};
	  #$self->{mAllSettings} .= $self->{mDiskSettings};
	  $self->{mAllSettings} .= $self->{mSharedFolderSettings};
	  $self->{mAllSettings} .= $self->{mUserGroupSettings};
	  $self->{mAllSettings} .= $self->{mMaintenanceSettings};
	  $self->{mAllSettings} .= $self->{mSystemSettings};

    return;
}

sub Dump {
	my $self = shift;
  my @errors;

  my $Dump = {
  	'settingsArea' => $self->{mAllSettings}
  };
	my @dataArray = ($Dump);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub loadHome {
  my $HMSettings;
  my $HM = BufHome->new();
  $HM->init;
  my $json = from_json($HM->get_HM());
  my $jsonData = $json->{'data'}[0];

  $HMSettings = "Home\n";
  $HMSettings .= "LinkStation Name: $jsonData->{'name'}\n";
  $HMSettings .= "Model Name: $jsonData->{'model'}\n";
  $HMSettings .= "IP Address: $jsonData->{'ip'}\n";
  $HMSettings .= "Current Date/Time: $jsonData->{'dt'}\n";
  $HMSettings .= "HDD Space Used: $jsonData->{'hdd'}\n";

  return $HMSettings;
}

sub loadBasic {
	my $basicSettings = "\nBasic\n";
  my $HN = BufHost->new();
  $HN->init;
  my $HNjson = from_json($HN->get_Host());
  my $HNjsonData = $HNjson->{'data'}[0];

  $basicSettings .= "Hostname: $HNjsonData->{'hName'}\n";
  $basicSettings .= "Description: $HNjsonData->{'hDesc'}\n";

  my $DT = BufDateTime->new();
  $DT->init;
  my $DTjson = from_json($DT->get_DateTime());
  my $DTjsonData = $DTjson->{'data'}[0];
  my $dateMethod = $DTjsonData->{'dateMethod'};

  if($dateMethod eq "manDate") {
  	$basicSettings .= "Date Method: Manual\n";
    $basicSettings .= "Date: $DTjsonData->{'dt'}\n";
    $basicSettings .= "Time: $DTjsonData->{'time'}\n";
    $basicSettings .= "Time Zone: $DTjsonData->{'tz'}\n";
  } else {
  	$basicSettings .= "Date Method: Automatic\n";
    $basicSettings .= "NTP IP: $DTjsonData->{'ip'}\n";
    $basicSettings .= "NTP Sec. IP: $DTjsonData->{'secIp'}\n";
    $basicSettings .= "Sync. Frequency: $DTjsonData->{'syncFreq'}\n";
    $basicSettings .= "NTP Time Zone: $DTjsonData->{'tzNtp'}\n";
  }

  my $lang = BufLang->new();
  $lang->init;
  my $langjson = from_json($lang->get_language());
  my $langjsonData = $langjson->{'data'}[0];

  $basicSettings .= "Language: $langjsonData->{'lang'}\n";
  $basicSettings .= "Windows Client Language: $langjsonData->{'winLang'}\n";

  return $basicSettings;
}

sub loadNetwork {
  my $networkSettings = "\nNetwork\n";
  my $nIP = BufIPAddress->new();
  $nIP->init;
  my $nIPjson = from_json($nIP->get_IPsettings());
  my $nIPjsonData = $nIPjson->{'data'}[0];

  $networkSettings .= "IP Address Settings\n";
	my $dhcpMethod = $nIPjsonData->{'dhcp'};
  if($dhcpMethod eq 'static') {
		$networkSettings .= "DHCP: Disabled\n";
    $networkSettings .= "IP Address: $nIPjsonData->{'ip'}\n";
    $networkSettings .= "Subnet Mask: $nIPjsonData->{'subMsk'}\n";
    $networkSettings .= "Gateway: $nIPjsonData->{'gtwy'}\n";
    $networkSettings .= "Primary DNS Server: $nIPjsonData->{'primDns'}\n";
    $networkSettings .= "Secondary DNS Server: $nIPjsonData->{'secDns'}\n";
  } else {
		$networkSettings .= "DHCP: Enabled\n";
  }

  my $nWG = BufWGAD->new();
  $nWG->init;
  my $nWGjson = from_json($nWG->get_WGAD());
  my $nWGjsonData = $nWGjson->{'data'}[0];
	my $WGAD = $nWGjsonData->{'authMethod'};
  $networkSettings .= "Workgroup\Active Directory Settings\n";

  if($WGAD eq 'wg') {
		$networkSettings .= "Authentication Method: Workgroup\n";
    $networkSettings .= "Workgroup Name: $nWGjsonData->{'wgName'}\n";
    $networkSettings .= "WINS Server IP Address: $nWGjsonData->{'wgWins'}\n";
    $networkSettings .= "Workgroup Authentication\n";
    if($nWGjsonData->{'wgAuthServerType'} eq 'server') {
	    $networkSettings .= "Delegate Authority to: External SMB Server\n";
      $networkSettings .= "Use Windows Domain Controller as Auth. Server: $nWGjsonData->{'wgWinServer'}\n";
			$networkSettings .= "Automatic User Registration: $nWGjsonData->{'wgUserReg'}\n";
			$networkSettings .= "Authentication Shared Folder: $nWGjsonData->{'wgAuthShare'}\n";
			$networkSettings .= "Authentication Server Name or IP Address: $nWGjsonData->{'wgAuthServName'}\n";
      $networkSettings .= "Authentication Shared Folder Name: $nWGjsonData->{'wgAuthShareName'}\n";

    } else {
    	$networkSettings .= "Delegate Authority to: LinkStation\n";
    }
  } else {
    $networkSettings .= "Authentication Method: Active Directory\n";
    $networkSettings .= "Active Directory Domain Name (NetBIOS): $nWGjsonData->{'adBios'}\n";
		$networkSettings .= "Active Directory Domain Name (DNS\Realm): $nWGjsonData->{'adDns'}\n";
    $networkSettings .= "Domain Controller: $nWGjsonData->{'adDomCont'}\n";
    $networkSettings .= "WINS Server IP Address: $nWGjsonData->{'adWins'}\n";
  }

  my $nNSS = BufNSS->new();
  $nNSS->init;
  my $nNSSjson = from_json($nNSS->get_NS());
  my $nNSSjsonData = $nNSSjson->{'data'}[0];
	my $nNSSAT = $nNSSjsonData->{'applTlk'};
	my $nNSSFTP = $nNSSjsonData->{'ftp'};

  $networkSettings .= "AppleTalk: ";
  $networkSettings .= ($nNSSAT eq 'applTlkEn' ? 'Enabled' : 'Disabled');
  $networkSettings .= "\nFTP: ";
  $networkSettings .= ($nNSSFTP eq 'ftpEn' ? 'Enabled' : 'Disabled');
  $networkSettings .= "\n";

  my $nEF = BufEFS->new();
  $nEF->init;
  my $nEFjson = from_json($nEF->get_EFsize());
  my $nEFjsonData = $nEFjson->{'data'}[0];
	my $nEFS = $nEFjsonData->{'ethFrameSize'};

  $networkSettings .= "Ethernet Frame Size: $nEFS\n";

	return $networkSettings;
}

sub loadDisk {
	my $diskSettings = "\nDisk\n";
  my $disk;
  my $backupJobs_Max = '8';
  my $num_BackupJobs =0;
  my $list = BufBackupInfo->new();

  my $DP = BufHome->new();
  $DP->init;

  my $count = $DP->get_numDrives();
  my @names = $DP->get_driveNames();

  for (my $i=0; $i<$count; $i++)
  {
    if($names[$i] =~ "^Disk") {
	    my $int = substr($names[$i], 5, 1);
      my $dProp = BufDiskProperties->new();
  		$dProp->init($names[$i]);
      my $dPropjson = from_json($dProp->get_diskProperties());
	    my $dPropjsonData = $dPropjson->{'data'}[0];
      $diskSettings .= "$names[$i] Properties\n";
      $diskSettings .= "Unit Name: $dPropjsonData->{'unitName'}\n";
      $diskSettings .= "Total Capacity: $dPropjsonData->{'totalCap'}\n";
      $diskSettings .= "Amount Used: $dPropjsonData->{'amtUsed'}\n";
      $diskSettings .= "Percent Used: $dPropjsonData->{'pctUsed'}\n";
      $diskSettings .= "File Format: $dPropjsonData->{'fileFormat'}\n";

    } elsif ($names[$i] =~ "^USB") {
    	my $int = substr($names[$i], 9, 1);
     	my $usbProp = BufDiskProperties->new();
      $usbProp->init($names[$i]);
      my $usbPropjson = from_json($usbProp->get_diskProperties());
	    my $usbPropjsonData = $usbPropjson->{'data'}[0];
      $diskSettings .= "$names[$i] Properties\n";
	    $diskSettings .= "Manufacturer: $usbPropjsonData->{'manufacturer'}\n";
	    $diskSettings .= "Model Name: $usbPropjsonData->{'modelName'}\n";
	    $diskSettings .= "Unit Name: $usbPropjsonData->{'unitName'}\n";
	    $diskSettings .= "Total Capacity: $usbPropjsonData->{'totalCap'}\n";
	    $diskSettings .= "Amount Used: $usbPropjsonData->{'amtUsed'}\n";
	    $diskSettings .= "Percent Used: $usbPropjsonData->{'pctUsed'}\n";
	    $diskSettings .= "File Format: $usbPropjsonData->{'fileFormat'}\n";

    } else {
    return "This Disk is neither Local nor USB"}
  }

  #This gets the number of backup Jobs
  for(my $int=1;$int<$backupJobs_Max+1;$int++) {
  	$list->init($int);
    if($list->get_backup_enable ne "off") {
			$diskSettings .= "\nDisk Backup Job #$int\n";
      my $DB = BufDiskBackupJobs->new();
      $DB->init($int);
      my $DBjson = from_json($DB->get_job());
	    my $DBjsonData = $DBjson->{'data'}[0];

	    my $schedType;
	    my $backupMode;
	    my $bMirror;
	    my $bLogfile;
	    my $bEncrypt;
	    my $bCompress;
	    my $bForce;

	    if($DBjsonData->{'backupOpMode'} eq "off") {
	      $backupMode = "Normal Backup";
	    } elsif($DBjsonData->{'backupOpMode'} eq "on") {
	      $backupMode = "Overwrite Backup (Complete/Differential";
	    } elsif($DBjsonData->{'backupOpMode'} eq "on_del") {
	      $backupMode = "Overwrite Backup (Complete/Differential";
	    } elsif($DBjsonData->{'backupOpMode'} eq "diff") {
	      $backupMode = "Overwrite Backup (Append Backup)";
	    } else {
	      $backupMode = "Overwrite Backup (Differential Backup)";
	    }

      if($DBjsonData->{'createTarget'} eq "on") {
        $bMirror = "Enabled";
      } else {
        $bMirror = "Disabled";
      }
      if($DBjsonData->{'createBackup'} eq "on") {
        $bLogfile = "Enabled";
      } else {
        $bLogfile = "Disabled";
      }
      if($DBjsonData->{'useEncrypted'} eq "on") {
        $bEncrypt = "Enabled";
      } else {
        $bEncrypt = "Disabled";
      }
      if($DBjsonData->{'useCompressed'} eq "on") {
        $bCompress = "Enabled";
      } else {
        $bCompress = "Disabled";
      }
      if($DBjsonData->{'ignoreErrors'} eq "on") {
        $bForce = "Enabled";
      } else {
        $bForce = "Disabled";
      }

      if($DBjsonData->{'scheduleType'} eq "not_run") {
        $diskSettings .= "Schedule Type: Not Scheduled\n\n";
      } elsif($DBjsonData->{'scheduleType'} eq "now") {

        $diskSettings .= "Schedule Type: Immediate\n";
        $diskSettings .= "Backup Mode: $backupMode\n";
        if($backupMode ne "Normal Backup") {
          $diskSettings .= "Create Target: $bMirror\n";
        }
        $diskSettings .= "Create Backup Logfile: $bLogfile\n";
        $diskSettings .= "Use Encrypted Transfer Method: $bEncrypt\n";
        $diskSettings .= "Use Compressed Transfer Method: $bCompress\n";


  	    } elsif($DBjsonData->{'scheduleType'} eq "week") {
	        $diskSettings .= "Schedule Type: Weekly\n";
	        $diskSettings .= "Weekday: $DBjsonData->{'weekday'}\n";
	        $diskSettings .= "Start Time: $DBjsonData->{'startTime'}\n";
	        $diskSettings .= "Backup Mode: $backupMode\n";

	        if($backupMode ne "Normal Backup") {
	          $diskSettings .= "Create Target: $bMirror\n";
	        }
	        $diskSettings .= "Create Backup Logfile: $bLogfile\n";
	        $diskSettings .= "Use Encrypted Transfer Method: $bEncrypt\n";
	        $diskSettings .= "Use Compressed Transfer Method: $bCompress\n";


        } else {
          $diskSettings .= "Schedule Type: Daily\n";
          $diskSettings .= "Start Time: $DBjsonData->{'startTime'}\n";
          $diskSettings .= "Backup Mode: $backupMode\n";
          if($backupMode ne "Normal Backup") {
            $diskSettings .= "Create Target: $bMirror\n";
          }
          $diskSettings .= "Create Backup Logfile: $bLogfile\n";
          $diskSettings .= "Use Encrypted Transfer Method: $bEncrypt\n";
          $diskSettings .= "Use Compressed Transfer Method: $bCompress\n";
        }

        my $DBFolderCount = @{$DB->{sourceList}};

        for(my $int=0;$int<$DBFolderCount;$int++) {
          my $DBFolderjson = from_json($DB->get_backupFolders());
		    	my $DBFolderjsonData = $DBFolderjson->{'data'}[$int];

				 	$diskSettings .= "Source View: $DBFolderjsonData->{'sourceView'}\n";
        	$diskSettings .= "Target View: $DBFolderjsonData->{'targetView'}\n";
        }
      }
    }

  #Device List
	my $LSS = BufDiskBackupDevList->new();
  $LSS->init;
  my $LSSjson = from_json($LSS->get_localLinkStations());

  $diskSettings .= "Local Linkstations\n";

  for (my $i=0; $i<@{$LSS->{allNames}}; $i++) {
  	my $LSSjsonData = $LSSjson->{'data'}[$i];
    $diskSettings .= "Name: $LSSjsonData->{'name'}\n";
    $diskSettings .= "IP Address: $LSSjsonData->{'ip'}\n";
    $diskSettings .= "Backup Support: $LSSjsonData->{'backup'}\n";
    $diskSettings .= "Disk Sleep: $LSSjsonData->{'diskSleep'}\n";
  }

  $diskSettings .= "Off Subnet LinkStations\nDevice IP\n";

  for (my $i=0; $i<@{$LSS->{allManualIPs}}; $i++) {
  	$diskSettings .= "${$LSS->{allManualIPs}}[$i]\n";
  }

	return $diskSettings;
}

sub loadShared {
	my $sharedFolderSettings = "\nShared Folders\n";
  my $newShare;

  my $share = BufShare->new();
  $share->init;
 	my @shareArray;# = $share->{allShares};
  my $shareCnt = @{$share->{allShares}};

  for (my $i=0; $i<$shareCnt; $i++) {
        push(@shareArray, $share->{allShares}->[$i]);
  }

   for (my $i=0; $i<$shareCnt; $i++) {
		$newShare = BufShare->new();
		$newShare->init($shareArray[$i]);
    my $newjson = from_json($newShare->get_share());
    my $newjsonData = $newjson->{'data'}[0];


    my $attributes;
	  my $recycle;
	  my $accessRestrictions;
	  my $winSupport;
	  my $macSupport;
	  my $ftpSupport;
	  my $backupSupport;

    $sharedFolderSettings .= "Share Name: $newjsonData->{'shareName'}\n";
		$sharedFolderSettings .= "Share Description: $newjsonData->{'shareDesc'}\n";
    $sharedFolderSettings .= "Volume: $newjsonData->{'volume'}\n";

    if($newjsonData->{'attributes'} eq "ro") {
    	$attributes = "Read Only";
    } else {
    	$attributes = "Read/Write";
    }

    if($newjsonData->{'recycle'} eq "1") {
    	$recycle = "Enabled";
    } else {
    	$recycle = "Disabled";
    }

    if($newjsonData->{'axsRestrictions'} eq "1") {
    	$accessRestrictions = "Enabled";
    } else {
    	$accessRestrictions = "Disabled";
    }
    if($newjsonData->{'win'} eq "1") {
    	$winSupport = "Enabled";
    } else {
    	$winSupport = "Disabled";
    }
    if($newjsonData->{'mac'} eq "1") {
    	$macSupport = "Enabled";
    } else {
    	$macSupport = "Disabled";
    }
    if($newjsonData->{'ftp'} eq "1") {
    	$ftpSupport = "Enabled";
    } else {
    	$ftpSupport = "Disabled";
    }
    if($newjsonData->{'backup'} eq "1") {
    	$backupSupport = "Enabled";
    } else {
    	$backupSupport = "Disabled";
    }

    $sharedFolderSettings .= "Attributes: $attributes\n";
    $sharedFolderSettings .= "Recycle: $recycle\n";
    $sharedFolderSettings .= "Access Restrictions: $accessRestrictions\n";
    $sharedFolderSettings .= "Windows Folder Support: $winSupport\n";
    $sharedFolderSettings .= "Apple Folder Support: $macSupport\n";
    $sharedFolderSettings .= "FTP Folder Support: $ftpSupport\n";
    $sharedFolderSettings .= "Disk Backup Folder Support: $backupSupport\n\n";

  }

  return $sharedFolderSettings;
}

sub loadUserGroup {
	my $userGroupSettings = "\nUsers\\Groups\n";
  my $newUser;
  my $newGroup;

	$userGroupSettings .= "Users\n";
  my $user = BufUser->new();
  $user->init;
 	my @userArray;
  my $userCnt = @{$user->{allUsers}};

  for (my $i=0; $i<$userCnt; $i++) {
        push(@userArray, $user->{allUsers}->[$i]);
  }

   for (my $i=0; $i<$userCnt; $i++) {
		$newUser = BufUser->new();
		$newUser->init($userArray[$i]);
    my $newUserjson = from_json($newUser->get_user());
    my $newUserjsonData = $newUserjson->{'data'}[0];
    
   	$userGroupSettings .= "User Name: $newUserjsonData->{'userName'}\n";
  	$userGroupSettings .= "Description: $newUserjsonData->{'description'}\n";
  }

	$userGroupSettings .= "Groups\n";
  my $group = BufGroup->new();
  $group->init;
  my @groupArray;
  my $groupCnt = @{$group->{allGroups}};

  for (my $i=0; $i<$groupCnt; $i++) {
        push(@groupArray, $group->{allGroups}->[$i]);
  }

   for (my $i=0; $i<$groupCnt; $i++) {
		$newGroup = BufGroup->new();
		$newGroup->init($groupArray[$i]);
    my $newGroupjson = from_json($newGroup->get_group());
    my $newGroupjsonData = $newGroupjson->{'data'}[0];

    $userGroupSettings .= "Group Name: $newGroupjsonData->{'groupName'}\n";
	  $userGroupSettings .= "Group Description: $newGroupjsonData->{'groupDesc'}\n";
  }

  return $userGroupSettings;
}

sub loadMaintenance {
	my $maintSettings = "\nMaintenance\n";

  #Email Notification
  my $mail = BufEmail->new();
  $mail->init;
  my $mailjson = from_json($mail->get_mailSettings());
  my $mailjsonData = $mailjson->{'data'}[0];

  $maintSettings .= "Email Notification\n";
  my $notification = $mailjsonData->{'notification'};
  if($notification eq 'on') {
	  $maintSettings .= "Notification: Enable\n";
		$maintSettings .= "Transfer Method\n";
    my $hddStatRep = $mailjsonData->{'hddStatRpt'};
  	$maintSettings .= "HDD Status Report: $hddStatRep\n";
    $maintSettings .= "Fan Trouble: $mailjsonData->{'fanTrouble'}\n";
  	$maintSettings .= "Disk Error: $mailjsonData->{'diskError'}\n";
  	$maintSettings .= "Backup Complete: $mailjsonData->{'backupComp'}\n";
    if($hddStatRep eq 'on') {
  		$maintSettings .= "HDD Status Sending Time: $mailjsonData->{'hddStatSendTime'}\n";
    }
  	$maintSettings .= "SMTP Server Address: $mailjsonData->{'smtpAddr'}\n";
    $maintSettings .= "Send Test Message: $mailjsonData->{'sendMsg'}\n";
	  $maintSettings .= "Subject: $mailjsonData->{'subject'}\n";
    my $em1 = $mailjsonData->{'emailAddr1'};
		my $em2 = $mailjsonData->{'emailAddr2'};
    my $em3 = $mailjsonData->{'emailAddr3'};
    if($em1) {
    	$maintSettings .= "Email Address 1: $em1\n";
    }
    if($em2) {
	    $maintSettings .= "Email Address 2: $em2\n";
    }
		if($em3) {
	 	  $maintSettings .= "Email Address 3: $em3\n";
    }
  } else {
  	$maintSettings .= "Notification: Disable\n";
  }

  my $UPS = BufUPS->new();
  $UPS->init;
  my $UPSjson = from_json($UPS->get_upsSettings());
  my $UPSjsonData = $UPSjson->{'data'}[0];

  $maintSettings .= "UPS Settings\n";

  $maintSettings .= "UPS Port (APC Style): $UPSjsonData->{'upsStatus'}\n";
	my $upsLink = $UPSjsonData->{'upsLink'};
  if($upsLink eq 'on') {
	  $maintSettings .= "Synchronize with UPS: Enabled\n";
    $maintSettings .= "UPS Connection Type: $UPSjsonData->{'connectType'}\n";
    my $upsShutdown = $UPSjsonData->{'upsShutdown'};
    if($upsShutdown eq 'time') {
    	my $upsTime = $UPSjsonData->{'time'};
    	$maintSettings .= "Shutdown after $upsTime seconds of Power Failure";
    } else {
			$maintSettings .= "Shutdown when UPS reports \"Battery Low\" Status";
    }
    my $upsBehavior = $UPSjsonData->{'behavior'};
    if($upsBehavior eq 'off') {
    	$maintSettings .= "UPS Behavior: Turn off UPS after shutdown";
    } else {
    	$maintSettings .= "UPS Behavior: Keep UPS Alive after shutdown";
    }
    $maintSettings .= "Behavior: $upsBehavior\n";
  } else {
		$maintSettings .= "Synchronize with UPS: Disabled\n";
  }

  my $Alert = BufAlert->new();
  $Alert->init;
  my $Alertjson = from_json($Alert->get_AlertSettings());
  my $AlertjsonData = $Alertjson->{'data'}[0];

  $maintSettings .= "Alert Sound Conditions\n";

  $maintSettings .= "Exceeding Temperature: $AlertjsonData->{'tempErrBox'}\n";
  $maintSettings .= "Disk Error Occurred: $AlertjsonData->{'diskErrBox'}\n";
  $maintSettings .= "Fan Error Occurred: $AlertjsonData->{'fanErrBox'}\n";
  $maintSettings .= "UPS Power Error Occurred: $AlertjsonData->{'upsErrBox'}\n";

	my $LED = BufLED->new();
  $LED->init;
  my $LEDjson = from_json($LED->get_LED());
  my $LEDjsonData = $LEDjson->{'data'}[0];

  $maintSettings .= "LED Settings\n";

	$maintSettings .= "LED Brightness: $LEDjsonData->{'led'}\n";
  my $LEDSync = $LEDjsonData->{'ledSync'};
  if($LEDSync eq 'ledSyncEn') {
	  $maintSettings .= "LED Synchronization: Use\n";
  } else {
  	$maintSettings .= "LED Synchronization: Don't Use\n";
  }
  $maintSettings .= "LED Sleep Mode: $LEDjsonData->{'ledSleep'}\n";
  $maintSettings .= "LED Wake Up Time: $LEDjsonData->{'ledWakeup'}\n";
  $maintSettings .= "LED Sleep Time: $LEDjsonData->{'ledSleepTime'}\n";

  return $maintSettings;
}

sub loadSystem {
	my $systemSettings = "\nSystem\n";

  my $Basic = BufBasic->new();
  $Basic->init;
  my $Basicjson = from_json($Basic->get_Settings());
  my $BasicjsonData = $Basicjson->{'data'}[0];
  $systemSettings .= "Basic\n";

  $systemSettings .= "LinkStation Name: $BasicjsonData->{'lName'}\n";
  $systemSettings .= "LinkStation Description: $BasicjsonData->{'lDesc'}\n";
  $systemSettings .= "Firmware Version: $BasicjsonData->{'fVersion'}\n";
  $systemSettings .= "Current Date/Time: $BasicjsonData->{'dateTime'}\n";
  $systemSettings .= "Time Zone: $BasicjsonData->{'timeZone'}\n";
  $systemSettings .= "Fan Status: $BasicjsonData->{'fanStatus'}\n";

  my $Network = BufNetwork->new();
  $Network->init;
  my $Networkjson = from_json($Network->get_Settings());
  my $NetworkjsonData = $Networkjson->{'data'}[0];

  $systemSettings .= "Network Settings\n";

  $systemSettings .= "MAC Address: $NetworkjsonData->{'mAddress'}\n";
  $systemSettings .= "IP Address: $NetworkjsonData->{'ipAddress'}\n";
  $systemSettings .= "Subnet: $NetworkjsonData->{'subNet'}\n";
  $systemSettings .= "Primary DNS Server: $NetworkjsonData->{'primDns'}\n";
  $systemSettings .= "Secondary DNS Server: $NetworkjsonData->{'secDns'}\n";
  $systemSettings .= "Default Gateway: $NetworkjsonData->{'defGate'}\n";
  $systemSettings .= "WINS Server IP Address: $NetworkjsonData->{'winsIP'}\n";
  $systemSettings .= "Ethernet Frame Size: $NetworkjsonData->{'eFrameSize'}\n";
  $systemSettings .= "Link Speed: $NetworkjsonData->{'linkSpeed'}\n";
  $systemSettings .= "Package Received: $NetworkjsonData->{'packageReceived'}\n";
  $systemSettings .= "Package Received w/ Errors: $NetworkjsonData->{'packageReceivedWithErrors'}\n";
  $systemSettings .= "Package Transmitted: $NetworkjsonData->{'packageTransmitted'}\n";
  $systemSettings .= "Package Transmitted w/ Errors: $NetworkjsonData->{'packageTransmittedWithErrors'}\n";
  $systemSettings .= "Windows Network Workgroup Name: $NetworkjsonData->{'windowsNetworkWGName'}\n";
  $systemSettings .= "Appleshare Network Zone Settings: $NetworkjsonData->{'appleShareNetworkZoneSettings'}\n";
	$systemSettings .= "Services\n";
  $systemSettings .= "FTP: $NetworkjsonData->{'ftpServ'}\n";
  $systemSettings .= "NTP: $NetworkjsonData->{'ntpServ'}\n";
  $systemSettings .= "NFS: Disabled\n";
  $systemSettings .= "AppleTalk: $NetworkjsonData->{'appTalkServ'}\n";
  $systemSettings .= "Email Notification: $NetworkjsonData->{'emailNotifServ'}\n";

 # my $USB = BufUSBProperties->new();
#  $USB->init;
#  $systemSettings .= $USB->get_USBDetailSettings();
#
  return $systemSettings;
}

1;
