#!/usr/bin/speedy
;################################################
;# BufIscsi.pm
;# 
;# usage :
;#	$class = BufIscsi->new();
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufIscsi;

use strict;
use JSON;

use CGI;
use BufiSCSIInfo;
use BufiSCSIDisksInfo;
use BufCommonDevLink;
use BufVolumeListInfo;
use BufClientInfo;
use BufCommonDataCheck;

sub new {
	my $class = shift;
	my $self  = bless {
		iscsi_service				=> undef,
		iscsi_IncomingUser_name 	=> undef,
		iscsi_IncomingUser_password => undef,
		iscsi_OutgoingUser_name 	=> undef,
		iscsi_OutgoingUser_password => undef,
		iscsi_authtype				=> undef,

		target_name					=> undef,
		target_tid					=> undef,
		real_path					=> undef,

		status						=> [],
		name						=> [],
		desc						=> [],
		diskArea					=> [],
		lvm_status					=> [],
		accessControl				=> [],
		size						=> [],
		remain						=> [],
		mutualAuth					=> [],
		ip							=> [],

		path						=> [],

		username					=> [],
		password					=> [],
		passwordMutual				=> [],
		restrictIps					=> [],
		restrictIpsList				=> [],
		advancedSettings			=> [],
		headerDigest				=> [],
		dataDigest					=> [],
		maxConn 					=> [],
		initialR2t					=> [],
		immediateData				=> [],
		maxRecvDataLength			=> [],
		maxXmitDataLength			=> [],
		maxBurstLength				=> [],
		firstBurstLength			=> [],
		maxOutstanding				=> [],
		wthreads					=> [],
		queuedComm					=> []

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $target_name	= shift;

	$self->load($target_name);

	return;
}

sub load {
	my $self = shift;
	my $target_name	= shift;

	if ($target_name) {
		$self->{target_name} = $target_name;
	}

	my $iscsi_info = BufiSCSIInfo->new();
	my $iscsi_disks_info = BufiSCSIDisksInfo->new();
	my $volume = BufVolumeListInfo->new();
	my $client = BufClientInfo->new();
	my $devlink = BufCommonDevLink->new();

	$iscsi_info->init();
	$iscsi_disks_info->init();
	$volume->init();
	$client->init();
	$devlink->init();

	my $i;
	my $j;
	my $k;

	my @pv_list = $volume->get_pv_dev;
	my @pv_size = $volume->get_pv_size;
	my @vg_list = $volume->get_pv_vg_name;
	my @pv_total_pe = $volume->get_pv_total_pe;
	my @pv_free_pe = $volume->get_pv_free_pe;

	my @lv_dev = $volume->get_lv_dev;
	my @lv_total_pe = $volume->get_lv_total_pe;

	my @client_volume = $client->get_volume;
	my @client_pc = $client->get_pc;
	my @client_ip = $client->get_ip;

	$self->{iscsi_service} = $iscsi_info->get_service;
	$self->{iscsi_authtype} = $iscsi_info->get_authtype;
	$self->{iscsi_IncomingUser_name} = $iscsi_info->get_in_user;
	$self->{iscsi_IncomingUser_password} = $iscsi_info->get_in_pass;
	$self->{iscsi_OutgoingUser_name} = $iscsi_info->get_out_user;
	$self->{iscsi_OutgoingUser_password} = $iscsi_info->get_out_pass;

	@{$self->{name}} = $iscsi_disks_info->get_target;
	@{$self->{desc}} = $iscsi_disks_info->get_comment;

	@{$self->{path}} = $iscsi_disks_info->get_path;
	for ($k = 1; $k < @{$self->{name}}; $k++) {
		if ($target_name) {
			if (${$self->{name}}[$k][0] eq $self->{target_name}) {
				$self->{target_tid} = $k;
				$self->{real_path} = ${$self->{path}}[$k][0];
				$self->{real_path} =~ s#/dev/(.+)?/.*#/dev/$1#;
			}
		}

		my $capacity;

		for ($j = 0; $j < @lv_dev; $j++) {
			if (${$self->{path}}[$k][0] eq $lv_dev[$j]) {
				$capacity = $lv_total_pe[$j];
				${$self->{lvm_status}}[$k][0] = 'on';
			}
		}

		for ($j = 0; $j < @pv_list; $j++) {
			if (${$self->{path}}[$k][0] =~ m#$vg_list[$j]#) {
				${$self->{remain}}[$k][0] = $pv_free_pe[$j];
			}
		}

		if (!$capacity) {
			${$self->{lvm_status}}[$k][0] = 'off';
			${$self->{remain}}[$k][0] = 0;

			if (!$capacity) {
				my $pv_path = ${$self->{path}}[$k][0];
				$pv_path =~ s#/(.+)/(.+)/.+#/$1/$2#;

				for ($j = 0; $j < @vg_list ; $j++) {
					if ($vg_list[$j] eq $pv_path) {
						$capacity = $pv_total_pe[$j];
					}
				}

				if (!$capacity) {
					for ($j = 0; $j < @pv_list; $j++) {
						if (${$self->{path}}[$k][0] eq $pv_list[$j]) {
							$capacity = sprintf("%d", $pv_size[$j] / 1024 / 1024);
						}
						my $path_md = ${$self->{path}}[$k][0];
						$path_md =~ s#/(.+)/(.+)/.+#/$1/$2#;
						if ($path_md eq $pv_list[$j]) {
							$capacity = sprintf("%d", $pv_size[$j] / 1024 / 1024);
						}
					}
				}
			}
		}

		${$self->{size}}[$k][0] = $capacity;
	}

	@{$self->{diskArea}} = $iscsi_disks_info->get_path;
	for ($i = 0; $i < @{$self->{diskArea}}; $i++) {
		${$self->{diskArea}}[$i][0] = $devlink->get_string_from_dev(${$self->{diskArea}}[$i][0]);
	}

	@{$self->{accessControl}} = $iscsi_disks_info->get_authtype;
	for ($i = 1; $i < @{$self->{accessControl}}; $i++) {
		if (${$self->{accessControl}}[$i][0] eq 'simplex') {
			${$self->{accessControl}}[$i][0] = 'on';
			${$self->{mutualAuth}}[$i][0] = 'off';
		}
		elsif (${$self->{accessControl}}[$i][0] eq 'duplex') {
			${$self->{accessControl}}[$i][0] = 'on';
			${$self->{mutualAuth}}[$i][0] = 'on';
		}
		else {
			${$self->{accessControl}}[$i][0] = 'off';
			${$self->{mutualAuth}}[$i][0] = 'off';
		}
	}

	for ($i = 1; $i < @{$self->{name}}; $i++) {
		if (!${$self->{desc}}[$i][0]) {
			${$self->{desc}}[$i][0] = "";
		}

		for ($k = 0; $k < @client_volume; $k++) {
			if (${$self->{name}}[$i][0] eq $client_volume[$k]) {
				if (!${$self->{ip}}[$i][0]) {
					${$self->{ip}}[$i][0] = $client_ip[$k];
				}
				else {
					${$self->{ip}}[$i][0] = ${$self->{ip}}[$i][0] + ', ' + $client_ip[$k];
				}
			}
		}
	}

	@{$self->{status}} = $iscsi_disks_info->get_available;
	# connect / wait / inactive
	for ($i = 1; $i < @{$self->{status}}; $i++) {
		if ($self->{iscsi_service} eq 'on') {
			if (${$self->{status}}[$i][0] eq 'on') {
				if (${$self->{ip}}[$i][0]) {
					${$self->{status}}[$i][0] = 'connect';
				}
				else {
					${$self->{status}}[$i][0] = 'wait';
				}
			}
			else {
				${$self->{status}}[$i][0] = 'inactive';
			}
		}
		else {
			${$self->{status}}[$i][0] = 'inactive';
		}

		if (!${$self->{ip}}[$i][0]) {
			${$self->{ip}}[$i][0] = '-';
		}
	}


	@{$self->{username}} = $iscsi_disks_info->get_in_user;
	@{$self->{password}} = $iscsi_disks_info->get_in_pass;
	@{$self->{passwordMutual}} = $iscsi_disks_info->get_out_pass;
	@{$self->{restrictIps}} = $iscsi_disks_info->get_ip_restrict;
	@{$self->{restrictIpsList}} = $iscsi_disks_info->get_allow;

	@{$self->{headerDigest}} = $iscsi_disks_info->get_HeaderDigest;
	@{$self->{dataDigest}} = $iscsi_disks_info->get_DataDigest;
	@{$self->{maxConn}} = $iscsi_disks_info->get_MaxConnections;
	@{$self->{initialR2t}} = $iscsi_disks_info->get_InitialR2T;
	@{$self->{immediateData}} = $iscsi_disks_info->get_ImmediateData;
	@{$self->{maxRecvDataLength}} = $iscsi_disks_info->get_MaxRecvDataSegmentLength;
	@{$self->{maxXmitDataLength}} = $iscsi_disks_info->get_MaxXmitDataSegmentLength;
	@{$self->{maxBurstLength}} = $iscsi_disks_info->get_MaxBurstLength;
	@{$self->{firstBurstLength}} = $iscsi_disks_info->get_FirstBurstLength;
	@{$self->{maxOutstanding}} = $iscsi_disks_info->get_MaxOutstandingR2T;
	@{$self->{wthreads}} = $iscsi_disks_info->get_Wthreads;
	@{$self->{queuedComm}} = $iscsi_disks_info->get_QueuedCommands;

	for ($i = 1; $i < @{$self->{name}}; $i++) {
		if (
			${$self->{headerDigest}}[$i][0] eq 'CRC32' ||
			${$self->{dataDigest}}[$i][0] eq 'CRC32' ||
			${$self->{maxConn}}[$i][0] != 1 ||
			${$self->{initialR2t}}[$i][0] eq 'No' ||
			${$self->{immediateData}}[$i][0] eq 'Yes' ||
			${$self->{maxRecvDataLength}}[$i][0] != 65536 ||
			${$self->{maxXmitDataLength}}[$i][0] != 65536 ||
			${$self->{maxBurstLength}}[$i][0] != 262144 ||
			${$self->{firstBurstLength}}[$i][0] != 65536 ||
			${$self->{maxOutstanding}}[$i][0] != 1 ||
			${$self->{wthreads}}[$i][0] != 2 ||
			${$self->{queuedComm}}[$i][0] != 2
		) {
			${$self->{advancedSettings}}[$i][0] = 'on';
		}
		else {
			${$self->{advancedSettings}}[$i][0] = 'off';
		}
	}

	shift @{$self->{status}};
	shift @{$self->{name}};
	shift @{$self->{desc}};
	shift @{$self->{diskArea}};
	shift @{$self->{lvm_status}};
	shift @{$self->{accessControl}};
	shift @{$self->{mutualAuth}};
	shift @{$self->{size}};
	shift @{$self->{remain}};
	shift @{$self->{ip}};

	shift @{$self->{username}};
	shift @{$self->{password}};
	shift @{$self->{passwordMutual}};
	shift @{$self->{restrictIps}};
	shift @{$self->{restrictIpsList}};

	shift @{$self->{advancedSettings}};
	shift @{$self->{headerDigest}};
	shift @{$self->{dataDigest}};
	shift @{$self->{maxConn}};
	shift @{$self->{initialR2t}};
	shift @{$self->{immediateData}};
	shift @{$self->{maxRecvDataLength}};
	shift @{$self->{maxXmitDataLength}};
	shift @{$self->{maxBurstLength}};
	shift @{$self->{firstBurstLength}};
	shift @{$self->{maxOutstanding}};
	shift @{$self->{wthreads}};
	shift @{$self->{queuedComm}};

	return;
}

sub getIscsiStatus {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'status' => $self->{iscsi_service}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setIscsiStatus {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $iscsi_info = BufiSCSIInfo->new();
	$iscsi_info->init();

	$iscsi_info->set_service($q->param('newStatus'));

	$iscsi_info->save();
	system('/etc/init.d/iscsi-target.sh restart 1> /dev/null 2> /dev/null &');

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getAccessSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $accessControl;
	my $mutualAuth;

	if ($self->{iscsi_authtype} eq 'simplex') {
		$accessControl = 'on';
		$mutualAuth = 'off';
	}
	elsif ($self->{iscsi_authtype} eq 'duplex') {
		$accessControl = 'on';
		$mutualAuth = 'on';
	}
	else {
		$accessControl = 'off';
		$mutualAuth = 'off';
	}

	push (@dataArray, {
		'accessControl' => $accessControl,
		'mutualAuth' => $mutualAuth,
		'username' => $self->{iscsi_IncomingUser_name}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setAccessSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $iscsi_info = BufiSCSIInfo->new();
	$iscsi_info->init();

	my $accessControl = $q->param('accessControl');
	my $mutualAuth = $q->param('mutualAuth');
	my $username = $q->param('username');
	my $password = $q->param('password');
	my $passwordMutual = $q->param('passwordMutual');

	my $check = BufCommonDataCheck->new();

	if ($accessControl eq "on") {
		# ???[?U??
		if (!$username) {
			push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_USERNAME_NOTEXT-->';
		}
		$check->init($username);
		if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_USERNAME_TEXT-->'; }
		
		# ?p?X???[?h
		if (length($password) < 12) {
			push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_LENGTH-->';
		}
		
		if ($password ne '****************') {
			$check->init($password);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_TEXT-->'; }
		}
		
		# ?p?X???[?h(???ݔF?ة
		if (($mutualAuth eq "on") && ($passwordMutual ne '****************')) {
			if (length($passwordMutual) < 12) {
				push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_DUPLEX_LENGTH-->';
			}
			if ($password ne '****************') {
				if ($password eq $passwordMutual) {
					push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_DUPLEX_DIFFERENT-->';
				}
			}
			else {
				if ($self->{iscsi_IncomingUser_password} eq $passwordMutual) {
					push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_DUPLEX_DIFFERENT-->';
				}
			}
			$check->init($passwordMutual);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_BASIC_ERROR_PASSWORD_DUPLEX_TEXT-->'; }
		}
	}

	if (@errors == 0) {
		if ($accessControl eq "on") {
			$iscsi_info->set_in_user($username);
			if ($password ne '****************') {
				$iscsi_info->set_in_pass($password);
			}
			if ($mutualAuth eq "on") {
				$iscsi_info->set_authtype('duplex');
				$iscsi_info->set_out_user($username);
				if ($passwordMutual ne '****************') {
					$iscsi_info->set_out_pass($passwordMutual);
				}
			}
			else {
				$iscsi_info->set_authtype('simplex');
			}
		}
		else {
			$iscsi_info->set_authtype($accessControl);
		}
		$iscsi_info->save;
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getIscsiVolumeList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $i;
	my $accessControlVal;

	for ($i = 0; $i < @{$self->{name}}; $i++) {
		${$self->{name}}[$i][0] =~ s/\r$//;
		${$self->{desc}}[$i][0] =~ s/\r$//;
		${$self->{ip}}[$i][0] =~ s/\r$//;
	}

	for ($i = 0; $i < @{$self->{name}}; $i++) {
		if (${$self->{name}}[$i][0]) {
			if (${$self->{accessControl}}[$i][0] eq 'on') {
				if (${$self->{mutualAuth}}[$i][0] eq 'on') {
					$accessControlVal = 'duplex';
				}
				else {
					$accessControlVal = 'simplex';
				}
			}
			else {
				$accessControlVal = 'off';
			}

			push (@dataArray, {
				'status' => ${$self->{status}}[$i][0],
				'name' => ${$self->{name}}[$i][0],
				'desc' => ${$self->{desc}}[$i][0],
				'diskArea' => ${$self->{diskArea}}[$i][0],
				'accessControl' => $accessControlVal,
				'size' => ${$self->{size}}[$i][0],
				'ip' => ${$self->{ip}}[$i][0]
			});
		}
	}

	my	$jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getIscsiVolumeSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $i = $self->{target_tid} - 1;

	push (@dataArray, {
		'status' => ${$self->{status}}[$i][0],
		'name' => ${$self->{name}}[$i][0],
		'desc' => ${$self->{desc}}[$i][0],
		'diskArea' => ${$self->{diskArea}}[$i][0],
		'real_path' => $self->{real_path},
		'lvm_status' => ${$self->{lvm_status}}[$i][0],
		'size' => ${$self->{size}}[$i][0],
		'remain' => ${$self->{remain}}[$i][0],

		'accessControl' => ${$self->{accessControl}}[$i][0],
		'mutualAuth' => ${$self->{mutualAuth}}[$i][0],
		'username' => ${$self->{username}}[$i][0],
		'password' => ${$self->{password}}[$i][0],
		'passwordMutual' => ${$self->{passwordMutual}}[$i][0],
		'restrictIps' => ${$self->{restrictIps}}[$i][0],
		'restrictIpsList' => ${$self->{restrictIpsList}}[$i][0],

		'advancedSettings' => ${$self->{advancedSettings}}[$i][0],
		'headerDigest' => ${$self->{headerDigest}}[$i][0],
		'dataDigest' => ${$self->{dataDigest}}[$i][0],
		'maxConn' => ${$self->{maxConn}}[$i][0],
		'initialR2t' => ${$self->{initialR2t}}[$i][0],
		'immediateData' => ${$self->{immediateData}}[$i][0],
		'maxRecvDataLength' => ${$self->{maxRecvDataLength}}[$i][0],
		'maxXmitDataLength' => ${$self->{maxXmitDataLength}}[$i][0],
		'maxBurstLength' => ${$self->{maxBurstLength}}[$i][0],
		'firstBurstLength' => ${$self->{firstBurstLength}}[$i][0],
		'maxOutstanding' => ${$self->{maxOutstanding}}[$i][0],
		'wthreads' => ${$self->{wthreads}}[$i][0],
		'queuedComm' => ${$self->{queuedComm}}[$i][0]
	});

	my	$jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub addIscsiVolume {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $disks  = BufiSCSIDisksInfo->new();
	my $check  = BufCommonDataCheck->new();

	$disks->init();
	my $error_create = 0;

	my $name = $q->param('name');
	my $desc = $q->param('desc');
	my $size = $q->param('size');
	my $diskArea = $q->param('diskArea');
	my $disk = $q->param('real_path');

	my $accessControl = $q->param('accessControl');
	my $mutualAuth = $q->param('mutualAuth');
	my $username = $q->param('username');
	my $password = $q->param('password');
	my $passwordMutual = $q->param('passwordMutual');
	my $restrictIps = $q->param('restrictIps');
	my $restrictIpsList = $q->param('restrictIpsList');

	my $advanced_fs = $q->param('advanced_fs-checkbox');

	my $headerDigest = 'None';
	my $dataDigest = 'None';
	my $maxConn = '1';
	my $initialR2t = 'Yes';
	my $immediateData = 'No';
	my $maxRecvDataLength = '65536';
	my $maxXmitDataLength = '65536';
	my $maxBurstLength = '262144';
	my $firstBurstLength = '65536';
	my $maxOutstanding = '1';
	my $wthreads = '2';
	my $queuedComm = '2';

	if ($advanced_fs eq 'on') {
		$headerDigest = $q->param('headerDigest');
		$dataDigest = $q->param('dataDigest');
		$maxConn = $q->param('maxConn');
		$initialR2t = $q->param('initialR2t');
		$immediateData = $q->param('immediateData');
		$maxRecvDataLength = $q->param('maxRecvDataLength');
		$maxXmitDataLength = $q->param('maxXmitDataLength');
		$maxBurstLength = $q->param('maxBurstLength');
		$firstBurstLength = $q->param('firstBurstLength');
		$maxOutstanding = $q->param('maxOutstanding');
		$wthreads = $q->param('wthreads');
		$queuedComm = $q->param('queuedComm');
	}

	# ?G???[????
	# ?{?????[????
	$check->init($name);
	if ($name eq "") {
		push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_NOTEXT-->';
	}
	else {
		if (!$check->check_still_volume) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_STILL-->'; }
	}
	
	if (!$check->check_max_length('12')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_LENGTH-->'; }
	if (!$check->check_danger_sharename) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_DANGER-->'; }
	if (!$check->check_share_iscsi)	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_TEXT-->'; }
	if (!$check->check_1st_num) 	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_1STNUM-->'; }
	if (!$check->check_1st_symbol2) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_1STNUM-->'; }
	
	# ?{?????[???̐־
	$check->init($desc);
#	if (!$check->check_max_length('50')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_LENGTH-->'; }
	if (!$check->check_max_length('75')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_LENGTH-->'; }
	if (!$check->check_comment) 	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_TEXT-->'; }
	if (!$check->check_1st_space)	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_1STNUM-->'; }
	
	# ?A?N?Z?X???(?{?????[???ʩ
	if ($accessControl eq "on") {
		# ???[?U??
		if (!$username) {
			push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_USERNAME_NOTEXT-->';
		}
		$check->init($username);
		if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_USERNAME_TEXT-->'; }
		
		# ?p?X???[?h
		if (length($password) < 12) {
			push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_LENGTH-->';
		}
		
		if ($password ne '****************') {
			$check->init($password);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_TEXT-->'; }
		}
		
		# ?p?X???[?h(???ݔF?ة
		if (($mutualAuth eq "on") && ($passwordMutual ne '****************')) {
			if (length($passwordMutual) < 12) {
				push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_LENGTH-->';
			}
			if ($password ne '****************') {
				if ($password eq $passwordMutual) {
					push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_DIFFERENT-->';
				}
			}
			$check->init($passwordMutual);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_TEXT-->'; }
		}
	}
	
	# ???P?A?h???X
	if ($restrictIps eq "on") {
		if ($restrictIpsList =~ m/[^0-9\.\,]/ ) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_IP_TEXT-->'; }
	}

	if (@errors == 0) {
		my $empty_id = $disks->get_empty_id;
		my $path_id = 100 + (($empty_id - 1) * 10);

		$disks->set_available($empty_id, '0', 'on');
		$disks->set_target($empty_id, '0', $name);

		my @disk_tmp;
		my $disk1;
		my $disk2;

		if ($disk =~ m/lvm_/) {
			@disk_tmp = split /lvm_/, $disk, 2;
			$disk1 = $disk_tmp[1];
			$disk2 = "lvm".$path_id."_".$name;
			
			$disks->set_path($empty_id, '0', $disk."/".$disk2);
		}
		else {
			$disks->set_path($empty_id, '0', $disk);
		}
		$disks->set_alias($empty_id, '0', $name);
		$disks->set_comment($empty_id, '0', $desc);
		
		# ?A?N?Z?X???(?{?????[???ʩ
		if ($q->param('accessControl') eq "on") {
			$disks->set_in_user($empty_id, '0', $q->param('username'));
			if ($q->param('password') ne '****************') {
				$disks->set_in_pass($empty_id, '0', $q->param('password'));
			}
			if ($q->param('mutualAuth') eq "on") {
				$disks->set_authtype($empty_id, '0', 'duplex');
				$disks->set_out_user($empty_id, '0', $q->param('username'));
				if ($q->param('passwordMutual') ne '****************') {
					$disks->set_out_pass($empty_id, '0', $q->param('passwordMutual'));
				}
			}
			else {
				$disks->set_authtype($empty_id, '0', 'simplex');
			}
		}
		else {
			$disks->set_authtype($empty_id, '0', $q->param('accessControl'));
		}
		
		# IP?A?h???X???@?\
		$disks->set_ip_restrict($empty_id, '0', $q->param('restrictIps'));
		
		if ($q->param('restrictIps') eq "on") {
			$disks->set_allow($empty_id, '0', $q->param('restrictIpsList'));
		}
		
		# ?ڍאݒ訃{?????[???ʩ
		$disks->set_HeaderDigest($empty_id, '0', $headerDigest);
		$disks->set_DataDigest($empty_id, '0', $dataDigest);
		$disks->set_MaxConnections($empty_id, '0', $maxConn);
		$disks->set_InitialR2T($empty_id, '0', $initialR2t);
		$disks->set_ImmediateData($empty_id, '0', $immediateData);
		$disks->set_MaxRecvDataSegmentLength($empty_id, '0', $maxRecvDataLength);
		$disks->set_MaxXmitDataSegmentLength($empty_id, '0', $maxXmitDataLength);
		$disks->set_MaxBurstLength($empty_id, '0', $maxBurstLength);
		$disks->set_FirstBurstLength($empty_id, '0', $firstBurstLength);
		$disks->set_MaxOutstandingR2T($empty_id, '0', $maxOutstanding);
		$disks->set_Wthreads($empty_id, '0', $wthreads);
		$disks->set_QueuedCommands($empty_id, '0', $queuedComm);
		
		# LVM?̏ꍇ?A?̈捬??
		if ($disk =~ m/lvm_/) {
			$error_create = readpipe("/usr/local/bin/lvm_control.sh LibLvmCreateNewLv $disk1 $disk2 $size 1>/dev/null 2>/dev/null");
			$error_create = $? >> 8;
		}

		if (!$error_create) {
			$disks->save($empty_id, '0');

			# ietd?ċN??
#			system ("/etc/init.d/iscsi-target.sh restart 1> /dev/null 2> /dev/null");
			system ("/usr/local/bin/iscsi_control.sh restart $empty_id 1> /dev/null 2> /dev/null");
		}
		else {
			push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SUBMIT_ADD-->';
		}
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setIscsiVolumeSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $disks  = BufiSCSIDisksInfo->new();
	my $check  = BufCommonDataCheck->new();

	$disks->init();

	my $error_rename = 0;
	my $error_resize = 0;

	my $key;
	my $path_id;
	my @disk_tmp;
	my $disk1;
	my $disk2;
	my $disk2_old;

	my $name = $q->param('name');
	my $desc = $q->param('desc');
	my $size = $q->param('size');
	my $size_free = $q->param('remain_raw');
	my $diskArea = $q->param('diskArea');
	my $disk = $q->param('real_path');

	my $enlargeSize = $q->param('enlargeSize');
	my $addedSize = $q->param('addedSize');
	my $size_total = $size + $addedSize;

	my $accessControl = $q->param('accessControl');
	my $mutualAuth = $q->param('mutualAuth');
	my $username = $q->param('username');
	my $password = $q->param('password');
	my $passwordMutual = $q->param('passwordMutual');
	my $restrictIps = $q->param('restrictIps');
	my $restrictIpsList = $q->param('restrictIpsList');

	my $advanced_fs = $q->param('advanced_fs-checkbox');

	my $headerDigest = 'None';
	my $dataDigest = 'None';
	my $maxConn = '1';
	my $initialR2t = 'Yes';
	my $immediateData = 'No';
	my $maxRecvDataLength = '65536';
	my $maxXmitDataLength = '65536';
	my $maxBurstLength = '262144';
	my $firstBurstLength = '65536';
	my $maxOutstanding = '1';
	my $wthreads = '2';
	my $queuedComm = '2';

	if ($advanced_fs eq 'on') {
		$headerDigest = $q->param('headerDigest');
		$dataDigest = $q->param('dataDigest');
		$maxConn = $q->param('maxConn');
		$initialR2t = $q->param('initialR2t');
		$immediateData = $q->param('immediateData');
		$maxRecvDataLength = $q->param('maxRecvDataLength');
		$maxXmitDataLength = $q->param('maxXmitDataLength');
		$maxBurstLength = $q->param('maxBurstLength');
		$firstBurstLength = $q->param('firstBurstLength');
		$maxOutstanding = $q->param('maxOutstanding');
		$wthreads = $q->param('wthreads');
		$queuedComm = $q->param('queuedComm');
	}

	# ?G???[????
	# ?{?????[????
	$check->init($name);
	if ($name eq "") {
		push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_NOTEXT-->';
	}
	elsif (lc $name ne lc $self->{target_name}) {
		if (!$check->check_still_volume) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_STILL-->'; }
	}
	
	if (!$check->check_max_length('12')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_LENGTH-->'; }
	if (!$check->check_danger_sharename) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_DANGER-->'; }
	if (!$check->check_share_iscsi)	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_TEXT-->'; }
	if (!$check->check_1st_num) 	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_1STNUM-->'; }
	if (!$check->check_1st_symbol2) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_NAME_1STNUM-->'; }
	
	# ?{?????[???̐־
	$check->init($desc);
#	if (!$check->check_max_length('50')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_LENGTH-->'; }
	if (!$check->check_max_length('75')) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_LENGTH-->'; }
	if (!$check->check_comment) 	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_TEXT-->'; }
	if (!$check->check_1st_space)	{ push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_COMMENT_1STNUM-->'; }
	
	# ?T?C?Y(?g???Ƀ`?F?b?N???ꂄ???鏪??)
	if ($enlargeSize eq 'on') {
		if (!$addedSize) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SIZE_EXTEND_NOTEXT-->'; }
		elsif ($addedSize > $size_free) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SIZE_EXTEND_OVER-->'; }
	}

	# ?A?N?Z?X???(?{?????[???ʩ
	if ($accessControl eq "on") {
		# ???[?U??
		if (!$username) {
			push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_USERNAME_NOTEXT-->';
		}
		$check->init($username);
		if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_USERNAME_TEXT-->'; }
		
		# ?p?X???[?h
		if (length($password) < 12) {
			push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_LENGTH-->';
		}
		
		if ($password ne '****************') {
			$check->init($password);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_TEXT-->'; }
		}
		
		# ?p?X???[?h(???ݔF?ة
		if (($mutualAuth eq "on") && ($passwordMutual ne '****************')) {
			if (length($passwordMutual) < 12) {
				push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_LENGTH-->';
			}
			if ($password ne '****************') {
				if ($password eq $passwordMutual) {
					push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_DIFFERENT-->';
				}
			}
			$check->init($passwordMutual);
			if (!$check->check_chap) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_PASSWORD_DUPLEX_TEXT-->'; }
		}
	}
	
	# ???P?A?h???X
	if ($restrictIps eq "on") {
		if ($restrictIpsList =~ m/[^0-9\.\,]/ ) { push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_IP_TEXT-->'; }
	}

	if (@errors == 0) {
		$key = $self->{target_tid};

		# ?ҏW?̏ꍇ
		$path_id = 100 + (($key - 1) * 10);
		
		$disks->set_available($key, '0', 'on');
		$disks->set_target($key, '0', $name);
		if ($disk =~ m/lvm_/) {
			@disk_tmp = split /lvm_/, $disk, 2;
			$disk1 = $disk_tmp[1];
			$disk2 = "lvm".$path_id."_".$name;
			$disk2_old = "lvm".$path_id."_".$self->{target_name};
		}
		else {
			$disk2 = $path_id."_".$name;
			$disk2_old = $path_id."_".$self->{target_name};
		}
		
		if ($disk =~ m/lvm_/) {
			$disks->set_path($key, '0', $disk."/".$disk2);
		}
		else {
			$disks->set_path($key, '0', $disk);
		}
		$disks->set_alias($key, '0', $name);
		$disks->set_comment($key, '0', $desc);
		
		# ?A?N?Z?X???(?{?????[???ʩ
		if ($accessControl eq "on") {
			$disks->set_in_user($key, '0', $username);
			if ($password ne '****************') {
				$disks->set_in_pass($key, '0', $password);
			}
			if ($mutualAuth eq "on") {
				$disks->set_authtype($key, '0', 'duplex');
				$disks->set_out_user($key, '0', $passwordMutual);
				if ($passwordMutual ne '****************') {
					$disks->set_out_pass($key, '0', $passwordMutual);
				}
			}
			else {
				$disks->set_authtype($key, '0', 'simplex');
			}
			$disks->set_allow($key, '0', $restrictIpsList);
		}
		else {
			$disks->set_authtype($key, '0', $accessControl);
		}
		
		# IP?A?h???X???@?\
		$disks->set_ip_restrict($key, '0', $restrictIps);
		
		if ($restrictIps eq "on") {
			if ($restrictIpsList) {
				$disks->set_allow($key, '0', $restrictIpsList);
			}
			else {
				$disks->set_allow($key, '0', 'ALL');
			}
		}
		
		# ?ڍאݒ訃{?????[???ʩ
		$disks->set_HeaderDigest($key, '0', $headerDigest);
		$disks->set_DataDigest($key, '0', $dataDigest);
		$disks->set_MaxConnections($key, '0', $maxConn);
		$disks->set_InitialR2T($key, '0', $initialR2t);
		$disks->set_ImmediateData($key, '0', $immediateData);
		$disks->set_MaxRecvDataSegmentLength($key, '0', $maxRecvDataLength);
		$disks->set_MaxXmitDataSegmentLength($key, '0', $maxXmitDataLength);
		$disks->set_MaxBurstLength($key, '0', $maxBurstLength);
		$disks->set_FirstBurstLength($key, '0', $firstBurstLength);
		$disks->set_MaxOutstandingR2T($key, '0', $maxOutstanding);
		$disks->set_Wthreads($key, '0', $wthreads);
		$disks->set_QueuedCommands($key, '0', $queuedComm);
		
		# ?{?????[??????X???鏪??
		if ($name ne $self->{target_name}) {
			$error_rename = readpipe ("/usr/local/bin/lvm_control.sh LibLvmRename $disk1 $disk2_old $disk2 1>/dev/null 2>/dev/null");
			$error_rename = $? >> 8;
		}
		
		# ?g?????鏪??
		if ($enlargeSize eq 'on') {
			$error_resize = readpipe ("/usr/local/bin/lvm_control.sh LibLvmResize $disk1 $disk2 $size_total 1>/dev/null 2>/dev/null");
			$error_resize = $? >> 8;
		}
		
		if (!$error_rename && !$error_resize) {
			# ?ۑ?
			$disks->save($key, '0');
			
			# ietd?ċN??
#			system ("/etc/init.d/iscsi-target.sh restart 1> /dev/null 2> /dev/null");
			system ("/usr/local/bin/iscsi_control.sh restart $key 1> /dev/null 2> /dev/null");
		}
		else {
			if ($error_rename) {
				push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SUBMIT_RENAME-->';
			}
			if ($error_resize) {
				push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SUBMIT_EXTEND-->';
			}
		}
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub delIscsiVolume {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	my $j;
	my $error = 0;

	my $iscsi_disks_info = BufiSCSIDisksInfo->new();
	$iscsi_disks_info->init();
	my @volumes	= $iscsi_disks_info->get_target;

	my $target = $q->param('delList');
	my @target = split(/, /, $target);
	my @target_num;

	for ($i = 0; $i < @target; $i++) {
		for ($j = 1; $j < @volumes; $j++) {
			if ($target[$i] eq $volumes[$j][0]) {
				push @target_num, $j;
				system("/usr/local/bin/iscsi_control.sh stop $j 1> /dev/null 2> /dev/null");
			}
		}
	}

	$error = $iscsi_disks_info->set_remove_volume(@target_num);
#	system('/etc/init.d/iscsi-target.sh restart 1> /dev/null 2> /dev/null &');
	system("/usr/local/bin/lvm_control.sh LibLvmShowDev_list 1>/dev/null 2>/dev/null");

	if ($error) {
		push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SUBMIT_DELETE_LVM-->';
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setIscsiVolumeActive {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $iscsi_disks_info = BufiSCSIDisksInfo->new();
	$iscsi_disks_info->init();

	my $name = $q->param('name');
	my $newValue = $q->param('newValue');
	my $tid;

	my @target = $iscsi_disks_info->get_target;
	my $i;

	for ($i = 1 ; $i < @target; $i++) {
		if ($target[$i][0] eq $name) {
			$tid = $i;
		}
	}
	if ($tid) {
		if ($newValue eq 'off') {
			$iscsi_disks_info->set_available($tid, '0', 'off');
			$iscsi_disks_info->save($tid, 0);

			system("/usr/local/bin/iscsi_control.sh stop $tid 1> /dev/null 2> /dev/null");
		}
		else {
			$iscsi_disks_info->set_available($tid, '0', 'on');
			$iscsi_disks_info->save($tid, 0);

			system("/usr/local/bin/iscsi_control.sh start $tid 1> /dev/null 2> /dev/null");
		}
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
