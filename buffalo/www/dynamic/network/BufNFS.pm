#!/usr/bin/speedy
;#############################################
;# BufNFS.pm
;# usage :
;#	$class = new BufNFS;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#############################################

package BufNFS;

use BufNFSClientList;
use BufCommonFileInfo;
use BufShareInfo;
use BufShareListInfo;
use BufCommonDataCheck;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		nfsStatus	=> undef,
		ipAddr		=> undef,
		subMsk		=> undef,
		nfsMode		=> undef,
		
		shareName	=> [],
		shareDesc	=> [],
		shareStatus => [],
		path		=> [],
		
		clientName	=> [],
		clientIp	=> []

	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->load();
	
	return;
}

sub load {
	my $self = shift;
	my $i;
	
	# 初期化
	my $info = BufCommonFileInfo->new;
	$info->init('/etc/melco/nfs_info');
	
	my $nfs_client = BufNFSClientList->new();
	$nfs_client->init();
	
	my $sharelist = BufShareListInfo->new();
	my $share = BufShareInfo->new();
	$sharelist->init();
	
	$self->{nfsStatus} = $info->get_info("nfs_service");
	if (!$self->{nfsStatus}) {
		$self->{nfsStatus} = 'off';
	}
	$self->{ipAddr} = $info->get_info("nfs_networkaddress");
	$self->{subMsk} = $info->get_info("nfs_subnetmask");
	
	$self->{nfsMode} = $info->get_info("nfs_mode");
	if (!$self->{nfsMode}) {
		$self->{nfsMode} = 'user';
	}

	my @clientName = $nfs_client->get_name;
	my @clientIp = $nfs_client->get_ip;
	
	for ($i=0;$i<@clientName;$i++) {
		# clientName
		$self->{clientName}->[$i] = $clientName[$i];
		
		# clientIp
		$self->{clientIp}->[$i] = $clientIp[$i];
	}
	
	my @shareName = $sharelist->get_name();
	my @shareDesc = $sharelist->get_comment();
	
	for ($i=0;$i<@shareName;$i++) {
		$share->init($shareName[$i]);
		
		# shareName
		$self->{shareName}->[$i] = $shareName[$i];
		
		# shareDesc
		$self->{shareDesc}->[$i] = $shareDesc[$i];
		
		# shareStatus
		if ($share->get_nfsd eq '1') {
			$self->{shareStatus}->[$i] = 'on';
		}
		else {
			$self->{shareStatus}->[$i] = 'off';
		}
		
		# path
		$self->{path}->[$i] = "/mnt/".$share->get_drive."/".$self->{shareName}->[$i];
	}
	
	return;
}

sub getNfsServiceSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'nfsStatus' => $self->{nfsStatus},
		'ipAddr'	=> $self->{ipAddr},
		'subMsk'	=> $self->{subMsk},
		'nfsMode' => $self->{nfsMode}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setNfsServiceSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $jsnHash;
	
	my $nfsStatus	= $cgiRequest->param('nfsStatus');
	my $ipAddr		= $cgiRequest->param('ipAddr');
	my $subMsk		= $cgiRequest->param('subMsk');
	my $nfsMode		= $cgiRequest->param('nfsMode');

	my $info = BufCommonFileInfo->new;
	my $check = BufCommonDataCheck->new();
	
	### 入力値判定 ###
	if ($nfsStatus eq 'on') {
		# ネットワークアドレス
		$check->init($ipAddr);
		if (!$check->check_nfs_network) { push @errors, 'net_settings_nfs_err1'; }
			
		#サブネットマスク
		if ($subMsk) {
			$check->init($subMsk);
			if (!$check->check_nfs_network) { push @errors, 'net_settings_nfs_err2'; }
		}
	}

	if (@errors == 0) {
		$info->init('/etc/melco/nfs_info');
		
		$info->set_info("nfs_service", $nfsStatus);
		if ($nfsStatus eq 'on') {
			$info->set_info("nfs_networkaddress", $ipAddr);
			$info->set_info("nfs_subnetmask", $subMsk);
			$info->set_info("nfs_mode", $nfsMode);
		}
		$info->save();
		system ("/etc/init.d/nfs.sh restart 1> /dev/null 2> /dev/null");
	}
	
	$jsnHash = { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub getNfsFoldersSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{shareName}};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {
			'shareName'		=> $self->{shareName}->[$i],
			'shareDesc'		=> $self->{shareDesc}->[$i],
			'shareStatus'	=> $self->{shareStatus}->[$i],
			'path'			=> $self->{path}->[$i]
		});
	}
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setNfsFoldersSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $jsnHash;
	
	my $shareName = $cgiRequest->param('shareName');
	my $shareStatus = $cgiRequest->param('shareStatus');
	
	my $share = BufShareInfo->new();
	$share->init($shareName);
	
	if ($shareStatus eq 'on') {
		$share->set_nfsd('1');
	}
	else {
		$share->set_nfsd('0');
	}
	$share->save;
	
#	system ("/usr/local/bin/exportfs_update.sh 1> /dev/null 2> /dev/null");
	system ("/etc/init.d/nfs.sh restart 1> /dev/null 2> /dev/null");
	
	if (!@errors) {
		$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	}
	return to_json($jsnHash);
}


sub getNfsClients {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{clientName}};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {
			'clientName' => $self->{clientName}->[$i],
			'clientIp'	 => $self->{clientIp}->[$i]
		});
	}
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub addNfsClient {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $jsnHash;
	
	my $clientName = $cgiRequest->param('clientName');
	my $clientIp = $cgiRequest->param('clientIp');
	
	my $nfs_client = BufNFSClientList->new();
	$nfs_client->init();

	my $check = BufCommonDataCheck->new();
	
	### 入力値判定 ###
	# ホスト名
	$check->init($clientName);
	if ((!$check->check_external_hostname_ip) || ($clientName eq "")) {
		push @errors, 'net_settings_nfs_err3';
	}
	
	# IPアドレス
	$check->init($clientIp);
	if (!$check->check_nfs_network) {
		push @errors, 'ip_err1';
	}

	if (@errors == 0) {
		$nfs_client->set_add_client($clientName, $clientIp);
		system ("/etc/init.d/sethostname.sh 1> /dev/null 2> /dev/null");
	}
	$jsnHash = { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

sub delNfsClient {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors= ();
	my @dataArray = ();
	my $json = new JSON;
	my $i;
	
	my $nfs_client = BufNFSClientList->new();
	$nfs_client->init();
	
	my $delList = $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};
	
	for ($i = 0; $i < $cnt; $i++) {
		$nfs_client->set_remove_client($delList->[$i]);
	}
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

1;
