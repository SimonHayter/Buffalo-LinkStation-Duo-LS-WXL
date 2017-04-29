#!/usr/bin/speedy
;################################################
;# BufGateCheck.pm
;# usage :
;#	$class = new BufGateCheck;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufGateCheck;

use BufGateCreateNumber;
use strict;
use JSON;

use BufDiskFormat;
use BufDiskProperties;
use BufDiskCheck;
use BufInit;
use BufShareListInfo;
use BufShareOfflinefileInfo;

use BufArrayProperties;
use BufModulesInfo;

use BufIscsi;

use lib "/www/buffalo/www/dynamic/extensions/webaxs";
use WebAxsConfig;
use BufPocketU;

use BufUpdate;

my $modules = BufModulesInfo->new();
$modules->init();

sub new {
	my $class = shift;
	my $self  = bless {
	}, $class;

	return $self;
}

sub init {
	my $self = shift;

	return;
}

sub get_gate {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $gate = BufGateCreateNumber->new();
	$gate->init('create');

	my $gateNumber = $gate->set_random_image();
	$gate->save();
	 
	my $gateLockTime = $gate->get_lock_time();
	my $gateLockNumber = $gate->get_lock_number_long();

	my $dataHash = {
#		'gateNumber'			=> $gateNumber,
		'hiddenGateLockTime'	=> $gateLockTime,
		'hiddenGateLockNumber'	=> $gateLockNumber
	};

	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };

	return to_json($jsnHash);
}

sub check_gate {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $jsnHash;
	my $gate = BufGateCreateNumber->new();
	$gate->init('check');

	my $gateNumber		 = $cgiRequest->param('gateNumber');
	my $gateLockTime	 = $cgiRequest->param('hiddenGateLockTime');
	my $gateLockNumber	 = $cgiRequest->param('hiddenGateLockNumber');

	if (($gate->get_check_number($gateNumber)) && ($gate->get_check_time()) && ($gate->get_lockfile_time() eq $gateLockTime) && ($gate->get_check_long_number($gateLockNumber))) {
		$gate->save_delete_lock_file();
		my $result = _gate_check_execute($cgiRequest);
	}
	else {
		push @errors, "gate_err1"; # &nbsp;&nbsp;Unauthorized access is detected.<br>&nbsp;&nbsp;Try again.'
		goto RETURN;
	}

	if ($gate->get_lockfile_time() ne $gateLockTime) {
		push @errors, "gate_err2";
	}
	elsif (!$gate->get_check_time()) {
		push @errors, "gate_err3"; 
	}
	elsif (!$gate->get_check_number($gateNumber)) {
		push @errors, "gate_err4";
		goto RETURN;
	}

	if (($gate->init('check')) && (!$gateNumber)) {
		if ($gate->get_check_time()) {
			 push @errors, "gate_err5";
		}
		else {
		}
	}

RETURN:
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub _gate_check_execute {
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $gPage = $cgiRequest->param('gPage');
	my $gMode = $cgiRequest->param('gMode');
	my $gType = $cgiRequest->param('gType');
	my $result;

	if ($gPage eq 'disk') {
		if (($gMode eq 'format') || ($gMode eq 'delete')) {
			my $format = BufDiskFormat->new();
			$format->init();

			$result = $format->perform_diskFormat($cgiRequest);
		}
		elsif ($gMode eq 'check') {
			my $check = BufDiskCheck->new();
			$check->init();

			$result = $check->perform_diskCheck($cgiRequest);
		}
		elsif ($gMode eq 'remove') {
			my $DP = BufDiskProperties->new();
			$DP->init();
			$result =$DP->del_diskAssignment($cgiRequest);
		}
	}

	if ($gPage eq 'share') {
		if ($gMode eq 'delete') { 
			$result = &delShare_list($cgiRequest);
		}
		if ($gMode eq 'emptyRecycle') { 
			$result = &emptyRecycle($cgiRequest);
		}
	}

	if ($gPage eq 'init') {
		if ($gMode eq 'restore') { 
			my $init = BufInit->new();
			$init->init();

			$result = $init->restore_LS($cgiRequest);
		}
		elsif ($gMode eq 'format') { 
			my $init = BufInit->new();
			$init->init();

			$result = $init->start_zerofill();
		}
	}

	if ($gPage eq 'array') {
		if ($gMode eq 'spare') { 
			my $array = BufArrayProperties->new();
			$array->init();

			$result = $array->changeSpare($cgiRequest);
		}
		elsif ($gMode eq 'delete') { 
			my $array = BufArrayProperties->new();
			$array->init();

			$result = $array->deleteArray($cgiRequest);
		}
		elsif ($gMode eq 'rebuild') { 
			my $array = BufArrayProperties->new();
			$array->init();

			$result = $array->rebuildArray($cgiRequest);
		}
		elsif ($gMode eq 'create') { 
			my $array = BufArrayProperties->new();
			$array->init();

			$result = $array->createArray($cgiRequest);
		}
		elsif ($gMode eq 'edp') { 
			my $array = BufArrayProperties->new();
			$array->init();

			$result = $array->edpArray($cgiRequest);
		}
	}

	if ($gPage eq 'volume') {
		if ($gMode eq 'delete') {
			my $iscsi = BufIscsi->new();
			$iscsi->init();

			$result = $iscsi->delIscsiVolume($cgiRequest);
		}
	}

	if ($gPage eq 'update') {
		my $update = BufUpdate->new();
		$update->init();

		$result = $update->startUpdate();
	}

	return $result;
}

sub delShare_list {
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $share_list	= BufShareListInfo->new();
	my $offlinefile = BufShareOfflinefileInfo->new();
	my $del_share;
	my $result;
	my $i;

	$share_list->init();
	$offlinefile->init();

	my $webaxs = WebAxsConfig->new();
	my $pocketu = BufPocketU->new;

	my $delList	= $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};

	for ($i = 0; $i < $cnt; $i++) {
		$del_share = $delList->[$i];

		my @usbdisk  = ("usbdisk1", "usbdisk2", "usbdisk3", "usbdisk4");
		foreach my $info (@usbdisk) {
=pod
			if ($del_share eq $info) {
				push (@errors, $del_share.' '.'sh_err15');
				last;
			}
=cut
		}

		if (@errors == 0) {
			$share_list->set_remove_share($del_share);
			$offlinefile->set_remove_olf($del_share);

			# Webアクセス3.0 フォルダー設定が存在すれば削除
			$webaxs->deleteShare($del_share);
			$pocketu->deleteShare($del_share);

			# renameした共有フォルダの実体を削除
			system ("/usr/local/bin/share_delete.sh 1>/dev/null 2>/dev/null &");
		}
	}

	# 各種サービス再起動
	system ("/usr/local/bin/service_control.sh share restart 1> /dev/null 2> /dev/null &");

	$modules->exec_trigger('share_del');

	if (@errors == 0) {
		$result = 1;
	}
	else {
		$result = 0;
	}
	push (@dataArray, $result);

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub emptyRecycle {
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;

	if (-f '/var/lock/sweep_trash') {
		# do nothing
	}
	else {
		system ("touch /var/lock/sweep_trash");
		system ("/usr/local/bin/sweep_trash.sh 1>/dev/null 2>/dev/null &");
	}

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

=pod
sub restore_LS {
	my $self		 = shift;
	my $cgiRequest	= shift;
	my @errors 	 = ();
	my @dataArray	 = ();	  

	my $initType  = $cgiRequest->param('initButtonOption');

	system("/usr/local/bin/initweb.sh 1> /dev/null 2> /dev/null &");

	push (@dataArray, "Restoring Defaults<>After factory default settings are restored, LinkStation will reboot automatically.<BR>&nbsp;Since the IP Address may have changed, use the NAS Navigator to launch a new browser configuration window.");
	&maintenance_initsw("Restoring Defaults<>After factory default settings are restored, LinkStation will reboot automatically.<BR>&nbsp;Since the IP Address may have changed, use the NAS Navigator to launch a new browser configuration window.");

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub formatDisk_list {
	my $self		 = shift;
	my @errors 	 = ();
	my @dataArray	 = ();

	system("/usr/local/bin/zerofill.sh 1> /dev/null 2> /dev/null &");

	push (@dataArray, "Execute full formatting.<>The LinkStation will be initialized and restart automatically after completing the full formatting.");  
	&maintenance_initsw("Execute full formatting.<>The LinkStation will be initialized and restart automatically after completing the full formatting.");

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}
=cut

1;
