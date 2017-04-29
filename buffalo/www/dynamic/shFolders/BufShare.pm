#!/usr/bin/speedy
;################################################
;# BufShare.pm
;# usage :
;#	$class = new BufShare;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################


package BufShare;
use lib '/www/buffalo/www/dynamic/extensions/webaxs';

use BUFFALO::Common::Model;
our $gModel = BUFFALO::Common::Model->new();

use BufShareInfo;
use BufShareListInfo;
use BufDiskDf;
use BufDiskInfo;
use BufUsbStorageListInfo;
use BufDiskFormatType;
use BufUserListInfo;
use BufGroupListInfo;
use BUFFALO::Daemon::Samba;
use BufDomainUserListInfo;
use BufDomainGroupListInfo;
use BufCommonDataCheck;
use BufGateCreateNumber;
use strict;
use JSON;
use WebAxsConfig;
use BufPocketU;
use BufCommonFileShareInfo;
use BufShareOfflinefileInfo;
use BufUserAutoAddListInfo;
use BufCommonFileInfo;
use BufAuthInfo;
use BufModulesInfo;

use global_init_system;

my $modules = BufModulesInfo->new();
$modules->init();

sub new {
	my $class = shift;
	my $self  = bless {
		shareName		=> undef,
		shareDesc		=> undef,
		volume			=> undef,
		attributes		=> undef,
		recycle 		=> undef,
		backupPwd		=> undef,
		os_win			=> undef,
		os_mac			=> undef,
		ftp 			=> undef,
		backup			=> undef,
		sftp			=> undef,
		terasearch		=> undef,
		hiddenfile		=> undef,
		winbackup		=> undef,
		offlineFiles	=> undef,
		axsRestrictions => undef,
		list_group_rw	=> [],
		list_group_r	=> [],
		list_user_rw	=> [],
		list_user_r		=> [],
		allShares		=> [],
		numVolumes		=> undef,
		webaxs_perm		=> undef,
		pocketU_perm	=> undef,
		realtime		=> undef,
		scheduled		=> undef,
		manual			=> undef,
		visible 		=> undef,
		networkType		=> undef,
		authServerType	=> undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $curShare = shift;
	$self->load($curShare);

	return;
}

sub init_only_sharenumber {
	my $self = shift;
	$self->load_only_sharenumber();

	return;
}

sub load {
	my $self = shift;
	my $curShare = shift;
	my $share = BufShareInfo->new();
	my $webaxs = WebAxsConfig->new();
	my $offlinefile = BufShareOfflinefileInfo->new();
	my $samba = BUFFALO::Daemon::Samba->new();
	my $auth = BufAuthInfo->new();
	$share->init($curShare);
	$offlinefile->init($curShare);
	$auth->init();

	my $pocketu = BufPocketU->new;
	$pocketu->init;

	# Initialize the class member variables
	$self->{shareName}		 = $share->get_name;
	$self->{shareDesc}		 = $share->get_comment;
	$self->{volume}			 = $share->get_drive;
	$self->{attributes} 	 = ($share->get_readonly eq '0' ? 'rw' : 'r');

	if ($share->get_trashbox =~ /o/) {
		$self->{recycle} = ($share->get_trashbox eq 'off' ? '0' : '1');
	}
	else {
		$self->{recycle} = $share->get_trashbox;
	}

	$self->{backupPwd} = $share->get_backup_pass;
	$self->{os_win} = $share->get_os_windows;
	$self->{os_mac} = $share->get_os_mac;
	$self->{ftp} = $share->get_os_ftp;
	$self->{backup} = $share->get_backup_open;
	$self->{sftp} = $share->get_sftp;
	$self->{terasearch} = ($share->get_terasearch eq '1' ? '1' : '0');
	$self->{winbackup} = ($share->get_winbackup eq 'on' ? '1' : '0');

	if ($curShare ne 'info') {
		$self->{hiddenfile}	= ($share->get_visible eq 'off' ? '1' : '0');
	}
	else {
		$self->{visible}	= ($share->get_info_visible eq 'off' ? '0' : '1');
	}

	$self->{offlineFiles}	= $offlinefile->get_policy;

	if (!$self->{offlineFiles}) {
		$self->{offlineFiles} = "disable";
	}

	$self->{axsRestrictions} = 'off';

	if (!$webaxs->isShare("enabled", $self->{shareName})) {
		$self->{webaxs_perm} = 'off';
	}
	elsif ($webaxs->isShare("anonymous", $self->{shareName}, "ui")) {
		$self->{webaxs_perm} = 'anony';
	}
	elsif ($webaxs->isShare("anylogin", $self->{shareName}, "ui")) {
		$self->{webaxs_perm} = 'all';
	}
	else {
		$self->{webaxs_perm} = 'below';
	}

	$self->{pocketU_perm}= $pocketu->getPocketUFolderSettings($self->{shareName});

	$self->{realtime}	= $share->get_realtime;
	$self->{scheduled}	= $share->get_scheduled;
	$self->{manual}		= $share->get_manual;

	if ((($share->get_user_rw)[0] ne "all") && (($share->get_user_r)[0] ne "all") &&
		(($share->get_group_rw)[0] ne "all") && (($share->get_group_r)[0] ne "all")) {
		$self->{axsRestrictions} = 'on';
	}

	@{$self->{list_group_rw}} = $share->get_group_rw;
	@{$self->{list_group_r}}  = $share->get_group_r;
	@{$self->{list_user_rw}}  = $share->get_user_rw;
	@{$self->{list_user_r}}   = $share->get_user_r;
	@{$self->{list_group_rw}} = sort { lc($a) cmp lc($b) } @{$self->{list_group_rw}};
	@{$self->{list_group_r}}  = sort { lc($a) cmp lc($b) } @{$self->{list_group_r}};
	@{$self->{list_user_rw}}  = sort { lc($a) cmp lc($b) } @{$self->{list_user_rw}};
	@{$self->{list_user_r}}   = sort { lc($a) cmp lc($b) } @{$self->{list_user_r}};

	$self->getShare_allList();

	$self->{networkType}	= $samba->get_status;
	$self->{authServerType}	= $auth->get_type();

	return;
}

sub load_only_sharenumber {
	my $self = shift;

	my $diskList = BufShareListInfo->new();
	$diskList->init();

	my @name = $diskList->get_name;
	@{$self->{allShares}} = @name;
}

sub getShare_allList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $diskList = BufShareListInfo->new();
	my $usbdiskList = BufShareListInfo->new();
	my $disk = BufDiskInfo->new();
	my $usbdisk = BufUsbStorageListInfo->new();
	my $diskformat = BufDiskFormatType->new;
	my $webaxs = WebAxsConfig->new();
	my $pocketu = BufPocketU->new;
	my $usb_guid;

	$diskList->init();
	$usbdiskList->init('usb');
	$disk->init();
	$usbdisk->init;
	$diskformat->init;
	$pocketu->init;

	my @name = $diskList->get_name;
	my @volume = $diskList->get_drive;
	my @os_win = $diskList->get_os;
	my @os_mac = $diskList->get_os_mac;
	my @ftp = $diskList->get_ftp;
	my @backup = $diskList->get_backup;
	my @attribute = $diskList->get_readonly;
	my @recycle = $diskList->get_trashbox;
	my @sftp  = $diskList->get_sftp;
	my @user_r = $diskList->get_user_r;
	my @user_rw = $diskList->get_user_rw;
	my @group_r = $diskList->get_group_r;
	my @group_rw = $diskList->get_group_rw;

	my @usb_name = $usbdiskList->get_name;
	my @usb_volume = $usbdiskList->get_drive;
	my @usb_os_win = $usbdiskList->get_os;
	my @usb_os_mac = $usbdiskList->get_os_mac;
	my @usb_ftp = $usbdiskList->get_ftp;
	my @usb_backup = $usbdiskList->get_backup;
	my @usb_attribute = $usbdiskList->get_readonly;
	my @usb_recycle = $usbdiskList->get_trashbox;
	my @usb_sftp = $usbdiskList->get_sftp;
	my @usb_user_r = $usbdiskList->get_user_r;
	my @usb_user_rw = $usbdiskList->get_user_rw;
	my @usb_group_r = $usbdiskList->get_group_r;
	my @usb_group_rw = $usbdiskList->get_group_rw;

	my @support;
	my @restrictions;
	my @webaxs_perm;
	my @pocketU_perm;

	my @realtime;
	my @scheduled;
	my @manual;

	my $i;
	my @drives;

	unshift @name,	 "info";
	unshift @volume, "";
	unshift @os_win, "";
	unshift @os_mac, "";
	unshift @ftp, "";
	unshift @backup, "";
	unshift @attribute, "";
	unshift @recycle, "";
	unshift @sftp, "";
	unshift @user_r, "all";
	unshift @user_rw, "all";
	unshift @group_r, "all";
	unshift @group_rw, "all";

	for ($i = 0; $i <@usb_name; $i++) {
		if ($usb_name[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1;}
		elsif ($usb_name[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
		elsif ($usb_name[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
		elsif ($usb_name[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }

		if ($usb_guid) {
			my $device = $usbdisk->get_mntpoint_from_guid($usb_guid);
			#my $format_type = $diskformat->get_device_format_type($device."_1");
			my $format_type = $diskformat->get_mount_format_type($device);
			if (!$format_type) {
				#$format_type = $diskformat->get_device_format_type($device."_2");
				$format_type = $diskformat->get_mount_format_type($device);
			}
			if (!$format_type) {
				#$format_type = $diskformat->get_device_format_type($device."_5");
				$format_type = $diskformat->get_mount_format_type($device);
			}
			#$format_type = 'vfat';

			if ($format_type) {
				push @name,	$usb_name[$i];
				push @volume, $usb_volume[$i];
				push @os_win, $usb_os_win[$i];
				push @os_mac, $usb_os_mac[$i];
				push @ftp, $usb_ftp[$i];
				push @backup, $usb_backup[$i];
				push @attribute, $usb_attribute[$i];
				push @recycle, $usb_recycle[$i];
				push @sftp, $usb_sftp[$i];
				push @user_r, $usb_user_r[$i];
				push @user_rw, $usb_user_rw[$i];
				push @group_r, $usb_group_r[$i];
				push @group_rw, $usb_group_rw[$i];
			}
		}
	}

	for ($i = 0; $i < @name; $i++) {
		@os_win[$i] = (@os_win[$i] eq '1' ? 'win' : '');
		@os_mac[$i] = (@os_mac[$i] eq '1' ? 'apple' : '');
		@ftp[$i] = (@ftp[$i] eq '1' ? 'ftp' : '');
		@backup[$i] = (@backup[$i] eq '1' ? 'bckp' : '');
		@sftp[$i] = (@sftp[$i] eq '1' ? 'sftp' : '');
		my $sup;

		if (@os_win[$i]) { $sup = @os_win[$i]; }

		if (($sup) && (@os_mac[$i])) { $sup = $sup .','. @os_mac[$i]; }
		else { $sup = $sup . @os_mac[$i]; }

		if (($sup) && (@ftp[$i]))	 { $sup = $sup .','. @ftp[$i]; }
		else { $sup = $sup . @ftp[$i]; }

		if (($sup) && (@backup[$i])) { $sup = $sup .','. @backup[$i]; }
		else { $sup = $sup . @backup[$i]; }

		if (($sup) && (@sftp[$i])) { $sup = $sup .','. @sftp[$i]; }
		else { $sup = $sup . @sftp[$i]; }

		push (@support, $sup);
	}

	for ($i = 0; $i < @name; $i++) {
		if (!$webaxs->isShare("enabled", $name[$i])) {
			push (@webaxs_perm, 'off');
		}
		elsif ($webaxs->isShare("anonymous", $name[$i], "ui")) {
			push (@webaxs_perm, 'anony');
		}
		elsif ($webaxs->isShare("anylogin", $name[$i], "ui")) {
			push (@webaxs_perm, 'all');
		}
		else {
			push (@webaxs_perm, 'below');
		}
	}

	for ($i = 0; $i < @name; $i++) {
		my $value = $pocketu->getPocketUFolderSettings($name[$i]);
		push (@pocketU_perm, $value);
	}

	for ($i = 0; $i < @name; $i++) {
		if ((@user_r[$i] ne "all") && (@user_rw[$i] ne "all") && (@group_r[$i] ne "all") && (@group_rw[$i] ne "all")) {
			push (@restrictions,'on');
		}
		else {
			push (@restrictions,'off');
		}
	}

	my $share = BufShareInfo->new();
	for (my $i = 0; $i < @name; $i++) {
		$attribute[$i] = ($attribute[$i] eq '0' ? 'rw' : 'ro');
	
		if ($share->get_trashbox =~ /o/) {
			$recycle[$i] = ($recycle[$i] eq 'off' ? '0' : '1');
		}
	}

	for ($i = 0; $i < @name; $i++) {
		$share->init($name[$i]);

		push @realtime, $share->get_realtime;
		push @scheduled, $share->get_scheduled;
		push @manual, $share->get_manual;
	}

	for ($i = 0; $i < @volume; $i++) {
		if ((@volume[$i] eq "Disk 1") || (@volume[$i] eq "disk1")) { @drives[0] = 1; }
		if ((@user_rw[$i] eq "USB Disk 1") || (@volume[$i] eq "usbdisk1")) { @drives[1] = 1; }
		if ((@user_rw[$i] eq "USB Disk 2") || (@volume[$i] eq "usbdisk2")) { @drives[2] = 1; }
	}

	@{$self->{allShares}} = @name;
	$self->{numVolumes} = @drives;

	for ($i = 0; $i < @name; $i++) {
		push(@dataArray, {
			'shareName' => @name[$i],
			'volume' => @volume[$i],
			'attribute' => @attribute[$i],
			'recycle' => @recycle[$i],
			'support' => @support[$i],
			'axsRestrict' => @restrictions[$i],
			'webaxs_perm'=> @webaxs_perm[$i],
			'pocketU_perm'=> @pocketU_perm[$i],

			'realtime'=> @realtime[$i],
			'scheduled'=> @scheduled[$i],
			'manual'=> @manual[$i]
		});
	}

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getShare_list {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{allShares}};

	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, {
			'name' => $self->{allShares}->[$i],
			'value' => $self->{allShares}->[$i]
		});
	}

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getShare_settings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dataHash = {
		'shareName' => $self->{shareName},
		'shareDesc' => $self->{shareDesc},
		'volume' => $self->{volume},
		'attributes' => $self->{attributes},
		'recycle' => $self->{recycle},
		'backupPwd' => $self->{backupPwd},
		'axsRestrict' => $self->{axsRestrictions},
		'win' => $self->{os_win},
		'apple' => $self->{os_mac},
		'ftp' => $self->{ftp},
		'backup' => $self->{backup},
		'sftp' => $self->{sftp},
		'webaxs_perm' => $self->{webaxs_perm},
		'pocketU_perm' => $self->{pocketU_perm},
		'visible' => $self->{visible},
		'teraSearch' => $self->{terasearch},
		'hiddenFile' => $self->{hiddenfile},
		'offlineFiles' => $self->{offlineFiles},
		'winbackup' => $self->{winbackup},

		'realtime' => $self->{realtime},
		'scheduled' => $self->{scheduled},
		'manual' => $self->{manual}
	};

	@dataArray = ($dataHash);

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getShare_axsConfig {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $type = $cgiRequest->param('type');

	my $cnt;
	my $i;

	$cnt = @{$self->{list_group_rw}};
	for ($i = 0; $i < $cnt; $i++) {
		if ($self->{list_group_rw}->[$i] eq "all") {
			next;
		}

		if ($self->{list_group_rw}->[$i] =~ m/\+(.*)$/) {
			if ($type eq 'domain_groups') {
				push (@dataArray, {
					'name' => $1,
					'permissions' => 'rw'
				});
			}
		}
		else {
			if ($type eq 'local_groups') {
				push (@dataArray, {
					'name' => $self->{list_group_rw}->[$i],
					'permissions' => 'rw'}
				);
			}
		}
	}

	$cnt = @{$self->{list_group_r}};
	for ($i = 0; $i < $cnt; $i++) {
		if ($self->{list_group_r}->[$i] eq "all") {
			next;
		}

		if ($self->{list_group_r}->[$i] =~ m/\+(.*)$/) {
			if ($type eq 'domain_groups') {
				push (@dataArray, {
					'name' => $1,
					'permissions' => 'ro'
				});
			}
		}
		else {
			if ($type eq 'local_groups') {
				push (@dataArray, {
					'name' => $self->{list_group_r}->[$i],
					'permissions' => 'ro'
				});
			}
		}
	}

	$cnt = @{$self->{list_user_rw}};
	for ($i = 0; $i < $cnt; $i++) {
		if ($self->{list_user_rw}->[$i] eq "all") {
			next;
		}

		if ($self->{list_user_rw}->[$i] =~ m/\+(.*)$/) {
			if ($type eq 'domain_users') {
				push (@dataArray, {
					'name' => $1,
					'permissions' => 'rw'
				});
			}
		}
		elsif (isExtUser($self->{list_user_rw}->[$i])) {
			if ($type eq 'ext_users') {
				push (@dataArray, {
					'name' => $self->{list_user_rw}->[$i],
					'permissions' => 'rw'
				});
			}
		}
		else {
			if ($type eq 'local_users') {
				push (@dataArray, {
					'name' => $self->{list_user_rw}->[$i],
					'permissions' => 'rw'
				});
			}
		}
	}

	$cnt = @{$self->{list_user_r}};
	for ($i = 0; $i < $cnt; $i++) {
		if ($self->{list_user_r}->[$i] eq "all") {
			next;
		}

		if ($self->{list_user_r}->[$i] =~ m/\+(.*)$/) {
			if ($type eq 'domain_users') {
				push (@dataArray, {
					'name' => $1,
					'permissions' => 'ro'
				});
			}
		}
		elsif (isExtUser($self->{list_user_r}->[$i])) {
			if ($type eq 'ext_users') {
				push (@dataArray, {
					'name' => $self->{list_user_r}->[$i],
					'permissions' => 'ro'
				});
			}
		}
		else {
			if ($type eq 'local_users') {
				push (@dataArray, {
					'name' => $self->{list_user_r}->[$i],
					'permissions' => 'ro'
				});
			}
		}
	}

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub isExtUser {
	my $user = shift;
	my $i;
	my $flag = 0;

	my $userauto = BufUserAutoAddListInfo->new();
	my @userautolist;

	$userauto->init();
	@userautolist	= $userauto->get_list_name();

	for ($i = 0; $i < @userautolist; $i++) {
		if ($user eq $userautolist[$i]) {
			$flag = 1;
		}
	}

	return $flag;
}

sub getShare_localList {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my @recordsArray = ();
	my $user_list = BufUserListInfo->new();
	my $group_list = BufGroupListInfo->new();
	my $type = $cgiRequest->param('type');
	my $totalCount;
	my $cnt;
	my $permissions;

	my @userlist;
	my @grouplist;
	my $i;
	my $j;

	if ($type eq 'local_users') {
		$user_list->init();
		@userlist = $user_list->get_name;
		$totalCount = @userlist;

		for ($i = 0; $i < @userlist; $i++) {
			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userlist[$i] eq $self->{list_user_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userlist[$i] eq $self->{list_user_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@recordsArray, {
				'name' => @userlist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'local_groups') {
		$group_list->init();
		@grouplist = $group_list->get_name;
		$totalCount = @grouplist;

		for ($i = 0; $i < @grouplist; $i++) {
			$cnt = @{$self->{list_group_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($grouplist[$i] eq $self->{list_group_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_group_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($grouplist[$i] eq $self->{list_group_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@recordsArray, {
				'name' => @grouplist[$i],
				'permissions' => $permissions
			});
		}
	}

	push (@dataArray, {
		'totalCount' => $totalCount,
		'records' => \@recordsArray
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getShare_domainList {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my @recordsArray = ();
	my $samba = BUFFALO::Daemon::Samba->new;
	my $domainuser = BufDomainUserListInfo->new;
	my $domaingroup = BufDomainGroupListInfo->new;
	my $type = $cgiRequest->param('type');
	my $totalCount;
	my $cnt;
	my $permissions;

	my @userlist;
	my @grouplist;

	my $i;
	my $j;

	if ($type eq 'domain_users') {
		if (($samba->get_status eq 'domain') || ($samba->get_status eq 'ad')) {
			$domainuser->init("refresh", "Domain User");
			@userlist = $domainuser->get_name;
		}
		$totalCount = @userlist;

		for ($i = 0; $i < @userlist; $i++) {
			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_user_rw}->[$j] =~ m/\+(.*)$/) {
					if ($userlist[$i] eq $1) {
						$permissions = 'rw';
					}
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_user_r}->[$j] =~ m/\+(.*)$/) {
					if ($userlist[$i] eq $1) {
						$permissions = 'ro';
					}
				}
			}

			push(@recordsArray, {
				'name' => @userlist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'domain_groups') {
		if (($samba->get_status eq 'domain') || ($samba->get_status eq 'ad')) {
			$domaingroup->init("refresh", "Domain Group");
			@grouplist = $domaingroup->get_name;
		}
		$totalCount = @grouplist;

		for ($i = 0; $i < @grouplist; $i++) {
			$cnt = @{$self->{list_group_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_group_rw}->[$j] =~ m/\+(.*)$/) {
					if ($grouplist[$i] eq $1) {
						$permissions = 'rw';
					}
				}
			}

			$cnt = @{$self->{list_group_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_group_r}->[$j] =~ m/\+(.*)$/) {
					if ($grouplist[$i] eq $1) {
						$permissions = 'ro';
					}
				}
			}

			push(@recordsArray, {
				'name' => @grouplist[$i],
				'permissions' => $permissions
			});
		}
	}

	push (@dataArray, {
		'totalCount' => $totalCount,
		'records' => \@recordsArray
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getShare_externalList {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my @recordsArray = ();
	my $userauto = BufUserAutoAddListInfo->new();
	my @grouplist;
	my $jsnHash;
	my $type = $cgiRequest->param('type');
	my $totalCount;
	my $cnt;
	my $permissions;

	my @userautolist;
	my $i;
	my $j;

	if ($type eq 'ext_users') {
		$userauto->init();
		@userautolist = $userauto->get_list_name();
		$totalCount = @userautolist;

		for ($i = 0; $i < @userautolist; $i++) {
			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userautolist[$i] eq $self->{list_user_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userautolist[$i] eq $self->{list_user_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@recordsArray, {
				'name' => @userautolist[$i],
				'permissions' => $permissions
			});
		}
	}

	push (@dataArray, {
		'totalCount' => $totalCount,
		'records' => \@recordsArray
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub searchUserGroup {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $user_list = BufUserListInfo->new();
	my $group_list = BufGroupListInfo->new();
	my $samba = BUFFALO::Daemon::Samba->new;
	my $domainuser = BufDomainUserListInfo->new;
	my $domaingroup = BufDomainGroupListInfo->new;
	my $userauto = BufUserAutoAddListInfo->new();
	my $type = $cgiRequest->param('type');
	my $start = $cgiRequest->param('start');
	my $limit = $cgiRequest->param('limit');
	my $key	= $cgiRequest->param('key');
	my $hit_cnt = -1;
	my $cnt;
	my $permissions;
	my $end = $start + $limit - 1;

	my @userlist;
	my @grouplist;
	my @userautolist;

	my $i;
	my $j;

	if ($type eq 'local_users') {
		$user_list->init();
		@userlist = $user_list->get_name;

		for ($i = 0; $i <= @userlist; $i++) {
			if (!$userlist[$i] =~ m/$key/) {
				next;
			}
			$hit_cnt++;
			if (($hit_cnt < $start) || ($hit_cnt >= $end)) {
				next;
			}

			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userlist[$i] eq $self->{list_user_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userlist[$i] eq $self->{list_user_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@dataArray, {
				'name' => @userlist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'local_groups') {
		$group_list->init();
		@grouplist = $group_list->get_name;

		for ($i = 0; $i <= @grouplist; $i++) {
			if (!$grouplist[$i] =~ m/$key/) {
				next;
			}
			$hit_cnt++;
			if (($hit_cnt < $start) || ($hit_cnt >= $end)) {
				next;
			}

			$cnt = @{$self->{list_group_rw}};
			$permissions = undef;

			for ($j = 0; $j < $cnt; $j++) {
				if ($grouplist[$i] eq $self->{list_group_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_group_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($grouplist[$i] eq $self->{list_group_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@dataArray, {
				'name' => @grouplist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'domain_users') {
		if (($samba->get_status eq 'domain') || ($samba->get_status eq 'ad')) {
			$domainuser->init("refresh", "Domain User");
			@userlist = $domainuser->get_name;
		}

		for ($i = 0; $i <= @userlist; $i++) {
			if (!$userlist[$i] =~ m/$key/) {
				next;
			}
			$hit_cnt++;
			if (($hit_cnt < $start) || ($hit_cnt >= $end)) {
				next;
			}

			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_user_rw}->[$j] =~ m/\+(.*)$/) {
					if ($userlist[$i] eq $1) {
						$permissions = 'rw';
					}
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_user_r}->[$j] =~ m/\+(.*)$/) {
					if ($userlist[$i] eq $1) {
						$permissions = 'ro';
					}
				}
			}

			push(@dataArray, {
				'name' => @userlist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'domain_groups') {
		if (($samba->get_status eq 'domain') || ($samba->get_status eq 'ad')) {
			$domaingroup->init("refresh", "Domain Group");
			@grouplist = $domaingroup->get_name;
		}

		for ($i = 0; $i <= @grouplist; $i++) {
			if (!$grouplist[$i] =~ m/$key/) {
				next;
			}
			$hit_cnt++;
			if (($hit_cnt < $start) || ($hit_cnt >= $end)) {
				next;
			}

			$cnt = @{$self->{list_group_rw}};
			#$permissions = undef;
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_group_rw}->[$j] =~ m/\+(.*)$/) {
					if ($grouplist[$i] eq $1) {
						$permissions = 'rw';
					}
				}
			}

			$cnt = @{$self->{list_group_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($self->{list_group_r}->[$j] =~ m/\+(.*)$/) {
					if ($grouplist[$i] eq $1) {
						$permissions = 'ro';
					}
				}
			}

			push(@dataArray, {
				'name' => @grouplist[$i],
				'permissions' => $permissions
			});
		}
	}

	if ($type eq 'ext_users') {
		$userauto->init();
		@userautolist = $userauto->get_list_name();

		for ($i = 0; $i <= @userautolist; $i++) {
			if (!$userautolist[$i] =~ m/$key/) {
				next;
			}
			$hit_cnt++;
			if (($hit_cnt < $start) || ($hit_cnt >= $end)) {
				next;
			}

			$cnt = @{$self->{list_user_rw}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userautolist[$i] eq $self->{list_user_rw}->[$j]) {
					$permissions = 'rw';
				}
			}

			$cnt = @{$self->{list_user_r}};
			$permissions = 'ro';

			for ($j = 0; $j < $cnt; $j++) {
				if ($userautolist[$i] eq $self->{list_user_r}->[$j]) {
					$permissions = 'ro';
				}
			}

			push(@dataArray, {
				'name' => @userautolist[$i],
				'permissions' => $permissions
			});
		}
	}

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setShare_settings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $json = new JSON;
	my $samba = BUFFALO::Daemon::Samba->new;
	my $share_list = BufShareListInfo->new();
	my $share = BufShareInfo->new();
	my $offlinefile = BufShareOfflinefileInfo->new();

	my $old_name;
	my $shareName;
	my $shareDesc;
	my $drive;
	my $attributes;
	my $recycle;
	my $backupPwd;
	my $axsRestrictions;
	my $os_win;
	my $os_mac;
	my $ftp;
	my $sftp;
	my $backup_status;
	my $list_info_local_users;
	my $list_info_local_groups;
	my $list_info_domain_users;
	my $list_info_domain_groups;
	my $list_info_ext_users;
	my @user_read;
	my @user_write;
	my @group_read;
	my @group_write;
	my $user_read	= "all";
	my $user_write	= "all";
	my $group_read	= "all";
	my $group_write = "all";
	my $quota_status = 0;
	my $quota_size	 = 0;
	my $quota_warn	 = 0;
	my $nfs;
	my $teraSearch;
	my $hiddenFile;
	my $winbackup;
	my $offlineFiles;
	my $olf_enable;

	my $visible;
	my $audit;

	my @usbdisk  = (
		"usbdisk1",
		"usbdisk2",
		"usbdisk3",
		"usbdisk4"
	);
	my $flag_usb;
	my $info;

	my $domain_name;
	my $element;
	my @list;

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	my $pocketu = BufPocketU->new;
	$pocketu->init;

	$shareName = $cgiRequest->param('shareName');
	$shareDesc = $cgiRequest->param('shareDesc');
	$old_name = $self->{shareName};
	$drive = $cgiRequest->param('volume');
	$attributes = ($cgiRequest->param('attributes') eq 'rw' ? '0' : '1');
	$recycle = $cgiRequest->param('recycle');
	$backupPwd = $cgiRequest->param('backupPwd');
	$axsRestrictions = $cgiRequest->param('axsRestrict');
	$os_win = ($cgiRequest->param('win') eq '1' ? '1' : '0');
	$os_mac = ($cgiRequest->param('apple') eq '1' ? '1' : '0');
	$ftp = ($cgiRequest->param('ftp') eq '1' ? '1' : '0');
	$sftp = ($cgiRequest->param('sftp') eq '1' ? '1' : '0');
	$backup_status = ($cgiRequest->param('backup') eq '1' ? '1' : '0');
	$list_info_local_users = $json->utf8->decode($cgiRequest->param('axsConfig_local_users'));
	$list_info_local_groups = $json->utf8->decode($cgiRequest->param('axsConfig_local_groups'));
	$list_info_domain_users = $json->utf8(0)->decode($cgiRequest->param('axsConfig_domain_users'));
	$list_info_domain_groups = $json->utf8(0)->decode($cgiRequest->param('axsConfig_domain_groups'));
	$list_info_ext_users = $json->utf8->decode($cgiRequest->param('axsConfig_ext_users'));

	$teraSearch = ($cgiRequest->param('teraSearch') eq '1' ? '1' : '0');
	$hiddenFile = ($cgiRequest->param('hiddenFile') eq '1' ? 'off' : 'on');
	$winbackup = ($cgiRequest->param('winbackup') eq '1' ? 'on' : 'off');

	$offlineFiles = ($cgiRequest->param('offlineFiles'));
	if ($offlineFiles ne 'disable') {
		$olf_enable = 'on';
	}
	else {
		$olf_enable = 'off';
	}

	$visible = ($cgiRequest->param('visible') eq '1' ? 'on' : 'off');
	if ($cgiRequest->param('visible') ne '0') {
		$visible = "on";
	}

	if (!$audit) {
		$audit = "off";
	}
	if (!$nfs) {
		$nfs = "off";
	}

	foreach $info (@usbdisk) {
		if (($old_name eq $info) && ($shareName =~ m/^usbdisk[1-4]/)) {
			$flag_usb = 1;
			last;
		}
		else {
			$flag_usb = 0;
		}
	}

	@errors = validate_data($self, $cgiRequest, $flag_usb);

	if (@errors == 0) {
		if (($samba->get_status eq 'domain') || ($samba->get_status eq 'ad')) {
			$domain_name = $samba->get_domain;
		}
		else {
			$domain_name = '';
		}

		if ($axsRestrictions eq 'on') {
			for $element (@{$list_info_local_users}) {
				if ($element->[1] eq 'ro') {
					push @user_read, $element->[0];
				}
				if ($element->[1] eq 'rw') {
					push @user_write, $element->[0];
				}
			}

			for $element (@{$list_info_ext_users}) {
				if ($element->[1] eq 'ro') {
					push @user_read, $element->[0];
				}
				if ($element->[1] eq 'rw') {
					push @user_write, $element->[0];
				}
			}

			for $element (@{$list_info_local_groups}) {
				if ($element->[1] eq 'ro') {
					push @group_read, $element->[0];
				}
				if ($element->[1] eq 'rw') {
					push @group_write, $element->[0];
				}
			}

			for $element (@{$list_info_domain_users}) {
				if ($element->[1] eq 'ro') {
					push @user_read, $domain_name.'+'."\"".$element->[0]."\"";
				}
				if ($element->[1] eq 'rw') {
					push @user_write, $domain_name.'+'."\"".$element->[0]."\"";
				}
			}

			for $element (@{$list_info_domain_groups}){
				if ($element->[1] eq 'ro') {
					push @group_read, $domain_name.'+'."\"".$element->[0]."\"";
				}
				if ($element->[1] eq 'rw') {
					push @group_write, $domain_name.'+'."\"".$element->[0]."\"";
				}
			}

			$user_read = join(",", @user_read);
			$user_write = join(",", @user_write);
			$group_read = join(",", @group_read);
			$group_write = join(",", @group_write);
		}
		else {
			# Webアクセス3.0
			my $webaxsShareConfig = $webaxs->getShareInfo($shareName);
			if ($webaxsShareConfig eq 'below') {
				$webaxs->modifyShareFor3('off', $shareName);
			}
		
			# ポケットU
			my $pocketUShareConfig = $pocketu->getShareInfo($shareName);
			if ($pocketUShareConfig eq 'below') {
				$pocketu->modifyShare('off', $shareName);
			}
		}

		if (!$old_name) {
			if (!$flag_usb) {
				$share_list->init();
			}
			else {
				$share_list->init('usb');
			}

			$share_list->set_add_share($shareName, $drive, $shareDesc, $user_write, $group_write, $user_read, $group_read,
				$os_win, $os_mac, $ftp, $backup_status, $backupPwd, $attributes, $recycle,$quota_status, $quota_size, $quota_warn, $sftp);

			$share_list->init('hidden');
			$share_list->set_add_share($shareName, $hiddenFile, '', '', '', '', '', '');

			$share_list->init('vfs');
			if ($recycle) {
				$recycle = 'on';
			}
			else {
				$recycle = 'off';
			}

			$share_list->set_add_share($shareName, $recycle, $audit, $nfs, $teraSearch, $winbackup, '', '');
			$offlinefile->set_add_olf($shareName, $olf_enable, $offlineFiles);

			$modules->exec_trigger('share_add');

			# Webアクセス3.0
			$webaxs->createShare('off',$shareName);

			# ポケットU
			$pocketu->createShare('off',$shareName);
		}
		else {
			$share->init($old_name);
			$share->set_name($shareName);
			$share->set_comment($shareDesc);

			if (!@user_write) {
				if ($axsRestrictions eq "on") {
					@list = ();
				}
				else {
					@list = ("all");
				}
				$share->set_user_rw(@list);
			}
			else {
				if ($axsRestrictions eq "on") {
					@list = @user_write;
				}
				else {
					@list = ("all");
				}
				$share->set_user_rw(@list);
			}

			if (!@group_write) {
				if ($axsRestrictions eq "on") {
					@list = ();
				}
				else {
					@list = ("all");
				}
				$share->set_group_rw(@list);
			}
			else {
				if ($axsRestrictions eq "on") {
					@list = @group_write;
				}
				else {
					@list = ("all");
				}
				$share->set_group_rw(@list);
			}

			if (!@user_read) {
				if ($axsRestrictions eq "on") {
					@list = ();
				}
				else {
					@list = ("all");
				}
				$share->set_user_r(@list);
			}
			else {
				if ($axsRestrictions eq "on") {
					@list = @user_read;
				}
				else {
					@list = ("all");
				}
				$share->set_user_r(@list);
			}

			if (!@group_read) {
				if ($axsRestrictions eq "on") {
					@list = ();
				}
				else {
					@list = ("all");
				}
				$share->set_group_r(@list);
			}
			else {
				if ($axsRestrictions eq "on") {
					@list = @group_read;
				}
				else {
					@list = ("all");
				}
				$share->set_group_r(@list);
			}

			$share->set_os_windows($os_win);
			$share->set_os_mac($os_mac);
			$share->set_os_ftp($ftp);
			$share->set_backup_open($backup_status);
			$share->set_backup_pass($backupPwd);
			$share->set_readonly($attributes);
			$share->set_trashbox($recycle);
			$share->set_quota_status($quota_status);
			$share->set_quota_size($quota_size);
			$share->set_quota_warn($quota_warn);
			$share->set_sftp($sftp);
			$share->set_terasearch($teraSearch);
			$share->set_winbackup($winbackup);

			if ($old_name ne 'info') {
				$share->set_visible($hiddenFile);
			}
			else {
				$share->set_info_visible($visible);
				$share->save_visible;
			}
			$share->set_audit($audit);
			$share->save;

			$offlinefile->init($old_name);
			$offlinefile->set_name($shareName);
			$offlinefile->set_enable($olf_enable);
			$offlinefile->set_policy($offlineFiles);
			$offlinefile->save;

			$modules->exec_trigger('share_edit');

			$webaxs->changeShareName($old_name,$shareName);
			$pocketu->changeShareName($old_name,$shareName);
			if ($pocketu->getPocketUFolderSettings eq 'unavailable') {
				$pocketu->modifyShare('off', $shareName);
			}
		}
	
		global_init_system->init_filesystem();

		push (@dataArray, 'msg_commitedChanges');
	}

	# Webアクセス3.0
	$webaxs->restartWebAxs();

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub validate_data {
	my $self = shift;
	my $cgiRequest = shift;
	my $flag_usb = shift;
	my @errors = ();
	my $json = new JSON;
	my $check = BufCommonDataCheck->new();

	my $shareName = $cgiRequest->param('shareName');
	my $shareDesc = $cgiRequest->param('shareDesc');
	my $backupPwd = $cgiRequest->param('backupPwd');
	my $axsRestrictions = $cgiRequest->param('axsRestrict');
	my $list_info_local_users = $json->utf8->decode($cgiRequest->param('axsConfig_local_users'));
	my $list_info_local_groups = $json->utf8->decode($cgiRequest->param('axsConfig_local_groups'));
	my $list_info_domain_users = $json->utf8(0)->decode($cgiRequest->param('axsConfig_domain_users'));
	my $list_info_domain_groups = $json->utf8(0)->decode($cgiRequest->param('axsConfig_domain_groups'));
	my $list_info_ext_users = $json->utf8->decode($cgiRequest->param('axsConfig_ext_users'));
	my $old_name = $self->{shareName};

	my $cnt_local_users;
	my $cnt_local_groups;
	my $cnt_domain_users;
	my $cnt_domain_groups;
	my $cnt_ext_users;

	if (!$flag_usb) {
		$check->init($shareName);
		if ($shareName eq '') { push @errors, "sh_err1"; }
#		if (!$check->check_max_length('12')) { push @errors, "sh_err2"; }
		if (!$check->check_max_length('27')) { push @errors, "sh_err2"; }
		if (!$check->check_danger_sharename) { push @errors, "sh_err3"; }
		if (!$check->check_share) { push @errors, "sh_err4"; }
		if (!$check->check_1st_symbol2) { push @errors, "sh_err5"; }

		if ($shareName) {
			if (lc $shareName ne lc $old_name) {
				if (!$check->check_still_share) { push @errors, "sh_err6"; }
			}
		}
		else {
			if (!$check->check_still_share) { push @errors, "sh_err6"; }
		}
		if ($shareName) {
			if (!$check->check_still_authtest) { push @errors, "sh_err7"; }
		}
	}

	# info の編集時はエラー処理無効化
	if ($old_name eq 'info') {
		@errors = ( );
	}

	$check->init($shareDesc);
#	if (!$check->check_max_length('50')) { push @errors, "sh_err8"; }
	if (!$check->check_max_length('75')) { push @errors, "sh_err8"; }
	if (!$check->check_comment)	  { push @errors, "sh_err9"; }
	if (!$check->check_1st_space) { push @errors, "sh_err10"; }

	$check->init($backupPwd);
	if (!$check->check_max_length('8')) { push @errors, "sh_err11"; }
	if (!$check->check_password)   { push @errors, "sh_err12"; }
	if (!$check->check_1st_symbol) { push @errors, "sh_err13"; }

	if ($axsRestrictions eq 'on') {
		$cnt_local_users = @{$list_info_local_users};
		$cnt_local_groups = @{$list_info_local_groups};
		$cnt_domain_users = @{$list_info_domain_users};
		$cnt_domain_groups = @{$list_info_domain_groups};
		$cnt_ext_users = @{$list_info_ext_users};
	
		if ($cnt_local_users == 0 && $cnt_local_groups == 0 && $cnt_domain_users == 0 && $cnt_domain_groups == 0  && $cnt_ext_users == 0) {
			push @errors, "sh_err14";
		}
	}

	return @errors;
}

sub getShareAllVolumeList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $diskinfo = BufDiskInfo->new();
	my $df = BufDiskDf->new();
	my $file = BufCommonFileInfo->new();

	$diskinfo->init();
	$df->init();
	$file->init('/var/tmp/encryptinfo');

	my @disk_list = $diskinfo->get_active_disk;
	my @usbdisk = (
		"usbdisk1",
		"usbdisk2",
		"usbdisk3",
		"usbdisk4"
	);
	my $array_mode;
	my $i;

	my $can_not_select;

	for ($i = 0; $i < @disk_list; $i++) {
		my $encrypt = 0;
	
		if ($disk_list[$i] eq 'array1') {
			$array_mode = $diskinfo->get_array1_mode();
		}
		if ($disk_list[$i] eq 'array2') {
			$array_mode = $diskinfo->get_array2_mode();
		}

		foreach $can_not_select (@usbdisk) {
			if ($disk_list[$i] eq $can_not_select) {
				goto PASS;
			}
		}

		if ($file->get_info($disk_list[$i].'_encrypted') eq 'yes') {
			$encrypt = 1;
		}

#		if ($df->get_status(convert_devicename($disk_list[$i], $array_mode, $encrypt)) eq 'unmount') {
		if ($df->get_status_mntpoint("/mnt/".$disk_list[$i]) eq 'unmount') {
			next;
		}

		push(@dataArray, {
			'volName' => $disk_list[$i],
			'networkType' => $self->{networkType},
			'authServerType' => $self->{authServerType}
		});

		PASS:
	}

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub convert_devicename {
	my $name = shift;
	my $mode = shift;
	my $encrypt = shift;

	if ($encrypt) {
		if (($name eq 'array1') && ($mode ne 'raid10')) { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD1_REAL'); }
		elsif (($name eq 'array1') && ($mode eq 'raid10')) { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD3_REAL'); }
		elsif (($name eq 'array2') && ($mode ne 'raid10')) { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD2_REAL'); }
		elsif (($name eq 'array2') && ($mode eq 'raid10')) { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD3_REAL'); }
		elsif ($name eq 'disk1') { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD1_LINK'); }
		elsif ($name eq 'disk2') { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD2_LINK'); }
		elsif ($name eq 'disk3') { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD3_LINK'); }
		elsif ($name eq 'disk4') { $name = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD4_LINK'); }
	}
	else {
		if (($name eq 'array1') && ($mode ne 'raid10')) { $name = "/dev/".$gModel->is('DEVICE_MD1_REAL'); }
		elsif (($name eq 'array1') && ($mode eq 'raid10')) { $name = "/dev/".$gModel->is('DEVICE_MD3_REAL'); }
		elsif (($name eq 'array2') && ($mode ne 'raid10')) { $name = "/dev/".$gModel->is('DEVICE_MD2_REAL'); }
		elsif (($name eq 'array2') && ($mode eq 'raid10')) { $name = "/dev/".$gModel->is('DEVICE_MD3_REAL'); }
		elsif ($name eq 'disk1') { $name = "/dev/".$gModel->is('DEVICE_HDD1_LINK'); }
		elsif ($name eq 'disk2') { $name = "/dev/".$gModel->is('DEVICE_HDD2_LINK'); }
		elsif ($name eq 'disk3') { $name = "/dev/".$gModel->is('DEVICE_HDD3_LINK'); }
		elsif ($name eq 'disk4') { $name = "/dev/".$gModel->is('DEVICE_HDD4_LINK'); }
	}

	#if ($name eq 'usbdisk1') { $name = "/dev/".$gModel->is('DEVICE_USB1_LINK'); }
	#elsif ($name eq 'usbdisk2') { $name = "/dev/".$gModel->is('DEVICE_USB2_LINK'); }
	#elsif ($name eq 'usbdisk3') { $name = "/dev/".$gModel->is('DEVICE_USB3_LINK'); }
	#elsif ($name eq 'usbdisk4') { $name = "/dev/".$gModel->is('DEVICE_USB4_LINK'); }
	if ($name eq 'usbdisk1') { $name = $gModel->is('MOUNT_USB1'); }
	elsif ($name eq 'usbdisk2') { $name = $gModel->is('MOUNT_USB2'); }
	elsif ($name eq 'usbdisk3') { $name = $gModel->is('MOUNT_USB3'); }
	elsif ($name eq 'usbdisk4') { $name = $gModel->is('MOUNT_USB4'); }

	return $name;
}

1;
