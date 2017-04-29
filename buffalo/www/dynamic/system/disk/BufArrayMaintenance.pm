#!/usr/bin/speedy
;################################################
;# BufArrayMaintenance.pm
;# usage :
;#	$class = new BufArrayMaintenance;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufArrayMaintenance;

use BufCommonFileInfo;
use BufDiskRaidScan;

use BufDiskInfo;
use BufDiskMDStatus;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		raidscan_status		=> undef,
		raidscan_disable	=> undef,
		raidscan			=> undef,
		schedule_type		=> undef,
		schedule_week		=> undef,
		schedule_no			=> undef,
		schedule_month		=> undef,
		schedule_start_time	=> undef,
		raidfail_shutdown	=> undef,
		raidfail_boot_iscsi	=> undef,
		shutdown_disable	=> undef,
		raid_sync_speed		=> undef

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
	my $file1 = BufCommonFileInfo->new();
	my $file2 = BufCommonFileInfo->new();
	my $raidscan = BufDiskRaidScan->new();
	
	my $disk = BufDiskInfo->new;
	my $mdstat = BufDiskMDStatus->new;
	
	use BUFFALO::Common::Model;
	my $gModel = BUFFALO::Common::Model->new();

	my $i;
	
	$file1->init('/etc/melco/raidscan');
	$file2->init('/etc/melco/info');
	$raidscan->init();
	
	$disk->init;
	$mdstat->init;
	
	$self->{raidscan} = $file1->get_info('raidscan');
	$self->{schedule_type} = $file1->get_info('schedule_type');
	$self->{schedule_week} = $file1->get_info('schedule_week');
	$self->{schedule_no} = $file1->get_info('schedule_no');
	$self->{schedule_month} = $file1->get_info('schedule_month');
	$self->{schedule_start_time} = $file1->get_info('schedule_start_time');
	$self->{raidfail_shutdown} = $file2->get_info('raidfail_shutdown');
	$self->{raidfail_boot_iscsi} = $file2->get_info('raidfail_keep_iscsi');
	$self->{raid_sync_speed} = $file2->get_info('raid_sync_speed');

	if (!$self->{raid_sync_speed}) {
		$self->{raid_sync_speed} = 'high';
	}

	if (
		($raidscan->get_status_md0() eq 'run') ||
		($raidscan->get_status_md1() eq 'run') ||
		($raidscan->get_status_md2() eq 'run') ||
		($raidscan->get_status_md3() eq 'run') ||
		($raidscan->get_status_md21() eq 'run') ||
		($raidscan->get_status_md22() eq 'run') ||
		($raidscan->get_status_md23() eq 'run') ||
		($raidscan->get_status_md24() eq 'run')
	) {
		$self->{raidscan_status} = 'run';
	}
	else {
		$self->{raidscan_status} = '';
	}

	# array1array2RAID5܂RAID1݂Ȃꍇ̓XL̐ݒ͕s
	if ((($disk->get_array1_mode() eq 'off') || ($disk->get_array1_mode() eq 'raid0')) && (($disk->get_array2_mode() eq 'off') || ($disk->get_array1_mode() eq 'raid0'))) {
		$self->{raidscan_disable} = 'ng';
	}
	# array1array2̂ǂ炩ɃG[ꍇ
	elsif ((($mdstat->get_status())[0] eq 'error') || (($mdstat->get_status())[1] eq 'error')) {
		$self->{raidscan_disable} = 'ng';
	}
	
	# array1array2̂ǂ炩RAID5̏ꍇ
	elsif (($disk->get_array1_mode() eq 'raid5') || ($disk->get_array2_mode() eq 'raid5')) {
		# \/C̏ꍇ
		if ((($mdstat->get_status())[0] =~ m/^re/) || (($mdstat->get_status())[1] =~ m/^re/)) {
			$self->{raidscan_disable} = 'ng';
		}
		# XL̏ꍇ
		elsif ((($mdstat->get_status())[0] eq 'scan') || (($mdstat->get_status())[1] eq 'scan')) {
			$self->{raidscan_disable} = 'ng';
		}
	}
	
	# array1array2̂ǂRAID1A܂RAID10̏ꍇ
	elsif (($disk->get_array1_mode() =~ m/raid1/) && ($disk->get_array2_mode() =~ m/raid1/)) {
		# \/C̏ꍇ
		if ((($mdstat->get_status())[0] =~ m/^re/) && (($mdstat->get_status())[1] =~ m/^re/)) {
			$self->{raidscan_disable} = 'ng';
		}
		# ǂ炩XL̏ꍇ
		elsif ((($mdstat->get_status())[0] eq 'scan') || (($mdstat->get_status())[1] eq 'scan')) {
			$self->{raidscan_disable} = 'ng';
		}
	}
	
	# array1array2̂ǂ炩RAID1A܂RAID10̏ꍇ
	elsif (($disk->get_array1_mode() =~ m/raid1/) || ($disk->get_array2_mode() =~ m/raid1/)) {
		# \/C̏ꍇ
		if ((($mdstat->get_status())[0] =~ m/^re/) || (($mdstat->get_status())[1] =~ m/^re/)) {
			$self->{raidscan_disable} = 'ng';
		}
		# XL̏ꍇ
		elsif ((($mdstat->get_status())[0] eq 'scan') || (($mdstat->get_status())[1] eq 'scan')) {
			$self->{raidscan_disable} = 'ng';
		}
	}
	
	# XyAfBXN݂ꍇ
	for ($i = 1; $i <= $gModel->is('MAX_DISK_NUM'); $i++) {
		if ($disk->get_disk($i) eq 'standby') {
			$self->{shutdown_disable} = 'ng';
		}
	}

	return;
}

sub getArrayMaintenance {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'raidscan_status'		=> $self->{raidscan_status},
		'raidscan_disable'		=> $self->{raidscan_disable},
		'raidscan'				=> $self->{raidscan},
		'schedule_type'			=> $self->{schedule_type},
		'schedule_no'			=> $self->{schedule_no},
		'schedule_week'			=> $self->{schedule_week},
		'schedule_month'		=> $self->{schedule_month},
		'schedule_start_time'	=> $self->{schedule_start_time}
	});
	
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => @errors
	});
}

sub setArrayMaintenance {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $raidscan = BufDiskRaidScan->new();
	my $file = BufCommonFileInfo->new();
	$raidscan->init();
	$file->init('/etc/melco/info');
	
	$self->{raidscan}				= $cgiRequest->param('raidscan');
	$self->{schedule_type}			= $cgiRequest->param('schedule_type');
	$self->{schedule_week}			= $cgiRequest->param('schedule_week');
	$self->{schedule_no}			= $cgiRequest->param('schedule_no');
	$self->{schedule_start_time}	= $cgiRequest->param('schedule_start_time');
	
	$raidscan->set_raidscan($self->{raidscan});
	if ($self->{raidscan} eq 'on') {
		$raidscan->set_status_md0('ready');
		$raidscan->set_status_md1('ready');
		$raidscan->set_status_md2('ready');
		$raidscan->set_status_md3('ready');
		$raidscan->set_status_md21('ready');
		$raidscan->set_status_md22('ready');
		$raidscan->set_status_md23('ready');
		$raidscan->set_status_md24('ready');
		
		$raidscan->set_schedule_type($self->{schedule_type});
		if ($self->{schedule_type} eq 'week') {
			$raidscan->set_schedule_no($self->{schedule_no});
			$raidscan->set_schedule_week($self->{schedule_week});
			$raidscan->set_schedule_start_time($self->{schedule_start_time});
		}
		if ($self->{schedule_type} eq 'month') {
			$raidscan->set_schedule_month('1');
			$raidscan->set_schedule_start_time($self->{schedule_start_time});
		}
	}
	$raidscan->save();
	
	if ($cgiRequest->param('raidscan_now') eq 'now') {
		$raidscan->set_run_scan();
	}
	
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub abortArrayMaintenance {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $raidscan = BufDiskRaidScan->new();
	$raidscan->init();

	$raidscan->set_stop_scan();
	$raidscan->set_status_md0('done');
	$raidscan->set_status_md1('done');
	$raidscan->set_status_md2('done');
	$raidscan->set_status_md3('done');
	$raidscan->set_status_md21('done');
	$raidscan->set_status_md22('done');
	$raidscan->set_status_md23('done');
	$raidscan->set_status_md24('done');
	$raidscan->save();
	
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getArrayMiscInfo {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'raidfail_shutdown'		=> $self->{raidfail_shutdown},
		'raidfail_boot_iscsi'	=> $self->{raidfail_boot_iscsi},
		'shutdown_disable'		=> $self->{shutdown_disable},
		'raid_sync_speed'		=> $self->{raid_sync_speed}
	});
	
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => @errors
	});
}

sub setArrayMiscInfo {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $file = BufCommonFileInfo->new();
	$file->init('/etc/melco/info');
	
	$self->{raidfail_shutdown}		= $cgiRequest->param('raidfail_shutdown');
	$self->{raidfail_boot_iscsi}	= $cgiRequest->param('raidfail_boot_iscsi');
	$self->{raid_sync_speed}		= $cgiRequest->param('raid_sync_speed');
	
	$file->set_info('raidfail_shutdown', $self->{raidfail_shutdown});
	$file->set_info('raidfail_keep_iscsi', $self->{raidfail_boot_iscsi});
	$file->set_info('raid_sync_speed', $self->{raid_sync_speed});
	$file->save;
	
	system("/usr/local/bin/hdd_raid_syncspeed.sh set $self->{raid_sync_speed} 1> /dev/null 2> /dev/null &");
	
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
