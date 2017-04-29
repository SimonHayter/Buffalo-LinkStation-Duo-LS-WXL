#!/usr/bin/speedy
;#################################################
;# BufDiskBackupJobs.pm
;# usage :
;#	$class = new BufDiskBackupJobs;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;#################################################

package BufDiskBackupJobs;

use BufBackupInfo;
use BufTimerInfo;
use BufCommonBDU;
use BufDiskInfo;
use BufShareListInfo;
use BufBasicHostname;
use BufBackupDestLSListInfo;
use BufBackupLSSerchList;
use BufBackupCron;
use BufBackupLSSerchPass;
use BufShareInfo;
use BufBasicHostname;
use BufCommonDevLink;
use global_init_system;

use strict;
use JSON;
use Switch;


sub new {
	my $class = shift;
	my $self = bless {
		jobNo			=> undef,
		jobName 		=> undef,
		backupEnable	=> undef,
		backupStatus	=> undef,
		scheduleType	=> undef,
		weekday			=> undef,
		startTime		=> undef,
		operationMode	=> undef,
		keep_generation	=> undef,
		backupMirror	=> undef,
		backupLogfile	=> undef,
		backupEncrypt	=> undef,
		backupCompress	=> undef,
		backupForce		=> undef,
		completeBckp	=> undef,
		ignoreTrashbox	=> undef,
		password		=> undef,
		sourceList		=> [],
		targetList		=> [],
		allJobs 		=> {},
		allJobIds		=> {},
		allSchedules	=> {},
		allDays 		=> {},
		allTimes		=> {},
		allOpModes		=> {},
		allStatus		=> {},
		allForce		=> {}

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $curJob = shift;
	$self->load($curJob);

	return;
}

sub load {
	my $self = shift;
	my $curJob = shift;
	my $i;

	my $backup_info = BufBackupInfo->new();
	$backup_info->init($curJob);

	my $backup_pass = BufBackupLSSerchPass->new();
	$backup_pass->init;

	$self->{jobNo} = $curJob;
	$self->{jobName} = $backup_info->get_backup_name;
	$self->{backupEnable} = $backup_info->get_backup_enable;
	$self->{backupStatus} = $backup_info->get_backup_status;

	my $type = $backup_info->get_type;
	if ($type eq 'not_run') {
		$self->{scheduleType} = 'not_scheduled';
	}
	else {
		switch ($type) {
			case 'week' {
				my $week_type = $backup_info->get_week_type;
				if ($week_type) {
						$self->{scheduleType} = $week_type;
				}
				else {
					$self->{scheduleType} = 'week';
				}
			}
			case 'month' {
				$self->{scheduleType} = '1st';
			}
			else {
				# 'now', 'day'
				$self->{scheduleType} = $type;
			}
		}
	}

	$self->{weekday} = $backup_info->get_week;
	$self->{startTime} = $backup_info->get_start_time;

	if ($backup_info->get_overwrite eq 'on') {
		$self->{operationMode} = 'diff';
		$self->{completeBckp} = 'on';
	}
	elsif ($backup_info->get_overwrite eq 'on_del') {
		$self->{operationMode} = 'diff_del';
		$self->{completeBckp} = 'on';
	}
	else {
		$self->{operationMode} = $backup_info->get_overwrite;
		$self->{completeBckp} = 'off';
	}

	if ($backup_info->get_hardlink eq 'on') {
		$self->{operationMode}	= 'hardlink';
		$self->{keep_generation} = $backup_info->get_keep_generation;
	}

	if ($backup_info->get_mirror eq 'on') {
		$self->{backupMirror} 	= 'off';
	}
	else {
		$self->{backupMirror} 	= 'on';
	}

	$self->{backupLogfile}	= $backup_info->get_logfile();
	$self->{backupEncrypt}	= $backup_info->get_crypt();
	$self->{backupCompress}	= $backup_info->get_compress();
	$self->{backupForce}	= $backup_info->get_force();
	$self->{ignoreTrashbox}	= $backup_info->get_trashbox();
	@{$self->{sourceList}}	= $backup_info->get_source_folder;
	@{$self->{targetList}}	= $backup_info->get_target_folder;
	$self->{password}		= $backup_pass->get_pass;

	my $joblist = BufBackupInfo->new();
	my $backup_max = '8';

	for($i = 1; $i <= $backup_max; $i++) {
		$joblist->init($i);
		$self->{allJobIds}->{$i}	= $i;
		$self->{allJobs}->{$i}		= $joblist->get_backup_name;

		my $type = $joblist->get_type;
		switch ($type) {
			case 'week' {
				my $week_type = $joblist->get_week_type;
				if ($week_type) {
						$self->{allSchedules}->{$i} = $week_type;
				}
				else {
					$self->{allSchedules}->{$i} = 'week';
				}
			}
			case 'month' {
				$self->{allSchedules}->{$i} = '1st';
			}
			else {
				# 'not_scheduled', 'now', 'day'
				$self->{allSchedules}->{$i} = $type;
			}
		}

		$self->{allDays}->{$i}		= $joblist->get_week;
		$self->{allTimes}->{$i}		= $joblist->get_start_time;

		$self->{allOpModes}->{$i}	= $joblist->get_overwrite;
		if ($joblist->get_hardlink eq 'on') {
			$self->{allOpModes}->{$i}	= 'hardlink';
		}

		$self->{allStatus}->{$i}	= $joblist->get_backup_status;
		$self->{allForce}->{$i}	= $joblist->get_force;
	}

	return;
}

sub newsort {
	if (defined $a->[2] and defined $b->[2]){
		if ($a->[1] > $b->[1]) {
			return 1
		}
		return -1;
	}
	elsif (defined $b->[2] or defined $a->[2]) {
		if (defined $a->[2]) { return -1 }
		return 1;
	}
	elsif ($a->[1] gt $b->[1]) { return 1; }
	elsif ($b->[1] gt $a->[1]) { return -1; }

	return 0;
} 

sub getBackup_allList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $jsnHash;

	my @foo = map {$_->[0]} sort newsort map {[$_, $self->{allJobs}{$_} =~ /^(\d+)$/ ? ($self->{allJobs}{$_},1) : $self->{allJobs}{$_}]} keys %{$self->{allJobs}};
	
	foreach (@foo) {
		if ($self->{allJobs}->{$_}) {
			push(@dataArray, {
				'jobName'		=> $self->{allJobs}->{$_},
				'jobId'			=> $_,
				'scheduleType'	=> $self->{allSchedules}->{$_},
				'weekday'		=> $self->{allDays}->{$_},
				'startTime'		=> $self->{allTimes}->{$_},
				'operationMode'	=> $self->{allOpModes}->{$_},
				'status'		=> $self->{allStatus}->{$_},
				'force'			=> $self->{allForce}->{$_}
			});
		}
	}

	$jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getBackup_settings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dataHash = {
		'jobName'			=> $self->{jobName},
		'backupEnable'		=> $self->{backupEnable},
		'backupStatus'		=> $self->{backupStatus},
		'scheduleType'		=> $self->{scheduleType},
		'startTime'			=> $self->{startTime},
		'weekday'			=> $self->{weekday},
		'operationMode'		=> $self->{operationMode},
		'keep_generation'	=> $self->{keep_generation},
		'createTarget'		=> $self->{backupMirror},
		'createBackup'		=> $self->{backupLogfile},
		'useEncrypted'		=> $self->{backupEncrypt},
		'useCompressed'		=> $self->{backupCompress},
		'ignoreErrors'		=> $self->{backupForce},
		'ignoreTrashbox'	=> $self->{ignoreTrashbox},
		'completeBckp'		=> $self->{completeBckp}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getBackup_folders {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{sourceList}};
	my $i;

	my $sourceView;
	my $targetView;

	for ($i = 0; $i < $cnt; $i++) {
		my $mount_usbdisk = '/mnt/usbdisk';
		my $mount_localdisk = '/mnt';

		my @source_view;
		if ($self->{sourceList}->[$i] =~ m/@/) {
			@source_view = split /@/, $self->{sourceList}->[$i];
		}
		else {
			$source_view[1] = $self->{sourceList}->[$i];
		}

		my @target_view;
		if ($self->{targetList}->[$i] =~ m/@/) {
			@target_view = split /@/, $self->{targetList}->[$i];
		}
		else {
			$target_view[1] = $self->{targetList}->[$i];
		}

		if ($source_view[1] =~ m/^$mount_usbdisk/) {
			my @source_path = split /\//, $source_view[1];
			splice @source_path, 0, 2;
			$source_view[1] = join "/", @source_path;
		}
		elsif ($source_view[1] =~ m/^$mount_localdisk/) {
			my @source_path = split /\//, $source_view[1];
			splice @source_path, 0, 3;
			$source_view[1] = join "/", @source_path;
		}

		if ($target_view[1] =~ m/^$mount_usbdisk/) {
			my @target_path = split /\//, $target_view[1];
			splice @target_path, 0, 2;
			$target_view[1] = join "/", @target_path;
		}
		elsif ($target_view[1] =~ m/^$mount_localdisk/) {
			my @target_path = split /\//, $target_view[1];
			splice @target_path, 0, 3;
			$target_view[1] = join "/", @target_path;
		}

		if (($source_view[0]) && ($source_view[1])) {
			$sourceView = $source_view[0].'@'.$source_view[1];
		}
		else {
			$sourceView = $source_view[1];
		}

		if (($target_view[0]) && ($target_view[1])) {
			$targetView = $target_view[0].'@'.$target_view[1];
		}
		else {
			$targetView = $target_view[1];
		}

		push(@dataArray, {
			'sourceView' => $sourceView,
			'targetView' => $targetView,
			'sourceVal' => $self->{sourceList}->[$i],
			'targetVal' => $self->{targetList}->[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setBackup_settings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $json = new JSON;
	my $backup_info = BufBackupInfo->new;
	my $timer = BufTimerInfo->new;
	my $share = BufShareInfo->new();

	my $key = $self->{jobNo};
	my $backup_max = 8;
	my $maxflag = 0;
	my @current_source;
	my @current_target;
	my @hardlink_target_readonly;
	my $hardlink_target_temp;
	my $i;

	if (!$key) {
		# Get the key for new job
		# Get the first disabled job on the system
		for($i = 1; $i <= $backup_max; $i++) {
			if (!($self->{allJobs}->{$i})) {
				$key = $i;
				last;
			}
		}
		if (!$key) {
			push @errors, 'backup_err1';
			$maxflag = 1;
		}
	}

	if (!$maxflag) {
		$backup_info->init($key);
		$timer->init;

		my $jobName = $cgiRequest->param('jobName');
		utf8::decode($jobName);
		my $scheduleType = $cgiRequest->param('scheduleType');
		my $weekday = $cgiRequest->param('weekday');
		my $startTime = $cgiRequest->param('startTime');
		my $operationMode = $cgiRequest->param('operationMode');
		my $keep_generation	= $cgiRequest->param('keep_generation');

		my $backupMirror = $cgiRequest->param('createTarget');
		my $backupLogfile = $cgiRequest->param('createBackup');
		my $backupEncrypt = $cgiRequest->param('useEncrypted');
		my $backupCompress = $cgiRequest->param('useCompressed');
		my $backupForce = $cgiRequest->param('ignoreErrors');
		my $gridData = $json->utf8->decode($cgiRequest->param('backupFolders'));

		my $ignoreTrashbox = $cgiRequest->param('ignoreTrashbox');
		my $completeBckp = $cgiRequest->param('completeBckp');

		for my $element (@{$gridData}) {
			push @current_source, $element->[0];
			push @current_target, $element->[1];

			$hardlink_target_temp = $element->[1];

			$hardlink_target_temp =~ s#^.+@/mnt/(.+)?/(.+)$#$2#;
			$hardlink_target_temp =~ s#^.+@/mnt/(.+)$#$1#;
			push @hardlink_target_readonly, $hardlink_target_temp;
		}
		@errors = validate_data($self, $jobName);

		if ($scheduleType ne "not_scheduled") {
			if (!@current_source) { push @errors, 'backup_err2'; }
		}

		my $hostName = BufBasicHostname->new();
		$hostName->init;

		my $own_hostname = $hostName->get_name;
		for ($i = 0; $i < @current_source; $i++) {
			if (($current_source[$i] =~ m#@/#) && ($current_target[$i] =~ m#@/#) && ($current_target[$i] !~ m#^$own_hostname@#)) {
				push @errors, 'backup_err11';
				last;
			}

			if ($own_hostname."@".$current_source[$i] eq $current_target[$i]) {
				push @errors, 'backup_err13';
				last;
			}
		}

		if (@errors == 0) {
			$backup_info->set_backup_name($jobName);

			if ($scheduleType eq "not_scheduled") {
				$backup_info->set_backup_enable('invalid');
				$backup_info->set_backup_status('done');
				$backup_info->set_type('not_scheduled');
			}
			else {
				$backup_info->set_backup_enable('on');
				$backup_info->set_backup_status('ready');

				if (($operationMode eq 'diff') && ($completeBckp eq 'on')) {
					$backup_info->set_overwrite('on');
				}
				elsif (($operationMode eq 'diff_del') && ($completeBckp eq 'on')) {
					$backup_info->set_overwrite('on_del');
				}
				else {
					if ($operationMode eq 'hardlink') {
						$backup_info->set_overwrite('off');
				}
					else {
						$backup_info->set_overwrite($operationMode);
					}
				}

				if ($operationMode eq 'hardlink') {
					$backup_info->set_hardlink('on');
					$backup_info->set_keep_generation($keep_generation);

					for ($i = 0 ; $i < @hardlink_target_readonly; $i++) {
						utf8::encode($hardlink_target_readonly[$i]);
						$share->init($hardlink_target_readonly[$i]);
						$share->set_readonly('1');
						$share->save;
					}
					global_init_system->init_samba_restart();
				}
				else {
					$backup_info->set_hardlink('off');
				}

				if ($backupMirror eq 'on') { $backup_info->set_mirror('off'); }
				else { $backup_info->set_mirror('on'); }
				if ($backupLogfile eq 'on') { $backup_info->set_logfile('on'); }
				else { $backup_info->set_logfile('off'); }
				if ($backupEncrypt eq 'on') { $backup_info->set_crypt('on'); }
				else { $backup_info->set_crypt('off'); }
				if ($backupCompress eq 'on') { $backup_info->set_compress('on'); }
				else { $backup_info->set_compress('off'); }
				if ($backupForce eq 'on') { $backup_info->set_force('on'); }
				else { $backup_info->set_force('off'); }
				if ($ignoreTrashbox eq 'on') { $backup_info->set_trashbox('on'); }
				else { $backup_info->set_trashbox('off'); }

				$timer->set_status('backup');
				$timer->save;

				switch ($scheduleType) {
					case 'now' {
						$backup_info->set_type($scheduleType);
						$backup_info->set_week('');
						$backup_info->set_week_type('');
						$backup_info->set_month('');
						$backup_info->set_start_time('');
					}
					case 'day' {
						$backup_info->set_type($scheduleType);
						$backup_info->set_week('');
						$backup_info->set_week_type('');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case 'week' {
						$backup_info->set_type($scheduleType);
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '1' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('1');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '2' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('2');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '3' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('3');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '4' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('4');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '13' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('13');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '24' {
						$backup_info->set_type('week');
						$backup_info->set_week($weekday);
						$backup_info->set_week_type('24');
						$backup_info->set_month('');
						$backup_info->set_start_time($startTime);
					}
					case '1st' {
						$backup_info->set_type('month');
						$backup_info->set_week('');
						$backup_info->set_week_type('');
						$backup_info->set_month('1');
						$backup_info->set_start_time($startTime);
					}
				}
			}

			$backup_info->set_source_folder(@current_source);
			$backup_info->set_target_folder(@current_target);
			$backup_info->save;

			&backup_task_setup_check_timer_status;
			&backup_task_setup_set_cron_job;

			my $taskname = sprintf("backuptask%02d_failure_info", $key);
			system("/usr/local/bin/lcd_error_man.sh $taskname off");

			if ($scheduleType eq "now") {
				system("/usr/local/bin/rsbackup.pl now &");
			}
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub validate_data {
	my $self = shift;
	my $jobName = shift;

	my @errors = ();
	my $check = BufCommonDataCheck->new();

	my $old_name = $self->{jobName};
	my $i;
	my $backup_max = '8';

	$check->init($jobName);

	if ($jobName eq '') { push @errors, 'backup_err3'; }
#	if (!$check->check_max_length('20')) { push @errors, 'backup_err12'; }
	if (!$check->check_max_length('30')) { push @errors, 'backup_err12'; }
	if (!$check->check_workgroup) { push @errors, 'backup_err4'; }
	if (!$check->check_1st_space) { push @errors, 'backup_err5'; }
	if (!$check->check_1st_symbol2) { push @errors, 'backup_err6'; }

	if ($old_name) {
		if (lc $jobName ne lc $old_name) {
			for ($i = 1; $i <= $backup_max; $i++) {
				if (($jobName) && ($self->{allJobs}->{$i} eq $jobName)) {
					push @errors, 'backup_err7';
					last;
				}
			}
		}
	}
	else {
		for ($i = 1; $i <= $backup_max; $i++) {
			if (($jobName) && ($self->{allJobs}->{$i} eq $jobName)) {
				push @errors, 'backup_err7';
				last;
			}
		}
	}

	return @errors;
}

sub delBackup_list {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $json = new JSON;
	my $backup_info = BufBackupInfo->new();
	my $del_backup;

	my $delList = $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};
	my $i;

	for ($i = 0; $i < $cnt; $i++) { 
		$del_backup = $delList->[$i];
		$backup_info->init($del_backup);

		if (@errors == 0) {
			$backup_info->set_backup_name('');
			$backup_info->set_backup_enable('off');
			$backup_info->set_backup_status('');
			$backup_info->set_type('not_scheduled');
			$backup_info->set_week('Sun');
			$backup_info->set_start_time('00:00');
			$backup_info->set_overwrite('off');
			$backup_info->set_mirror('on');
			$backup_info->set_logfile('on');
			$backup_info->set_crypt('off');
			$backup_info->set_compress('off');
			$backup_info->set_force('off');
			$backup_info->set_source_folder('');
			$backup_info->set_target_folder('');
			$backup_info->save;

			&backup_task_setup_check_timer_status;
			&backup_task_setup_set_cron_job;

			my $taskname = sprintf("backuptask%02d_failure_info", $del_backup);
			system("/usr/local/bin/lcd_error_man.sh $taskname off");
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub get_backupSources {
	my $self = shift;
	my $mode_flag = shift;
	my @errors = ();
	my @dataArray = ();
	my $disk = BufDiskInfo->new;
	my $share_list = BufShareListInfo->new;
	my $usbshare_list = BufShareListInfo->new;
	my $bdu = BufCommonBDU->new;
	my $ts_target = BufBackupDestLSListInfo->new;
	my $search = BufBackupLSSerchList->new;
	my $devlink = BufCommonDevLink->new();

	my $hostName = BufBasicHostname->new();
	my $i;
	my $j;

	$disk->init;
	$share_list->init;
	$usbshare_list->init('usb');
	$search->init();
	$search->get_refresh_list();
	if (!$mode_flag) {
		$ts_target->init('refresh');
	}
	$hostName->init;
	$devlink->init();

	my @share = $share_list->get_name;
	my @drive = $share_list->get_drive;
	my @usbshare = $usbshare_list->get_name;
	my @share_bdu;
	my $usb_guid;
	my $own_hostname = $hostName->get_name;

	for ($i = 0; $i < @share; $i++) {
		if ($mode_flag ne 'hardlink') {
			push(@dataArray, {
				'opt' => $share[$i],
				'val' => '/mnt/'.$drive[$i].'/'.$share[$i]
			});
		}
		else {
			push(@dataArray, {
				'opt' => $share[$i],
				'val' => $own_hostname.'@/mnt/'.$drive[$i].'/'.$share[$i]
			});
		}

		if ($mode_flag ne 'hardlink') {
			$bdu->init('/mnt/'.$drive[$i].'/'.$share[$i]);
			@share_bdu = $bdu->get_bdu_list;

			for ($j = 0; $j < @share_bdu; $j++) {
				if (length($share[$i].'/'.$share_bdu[$j]) > 80) { next; }
				push(@dataArray, {
					'opt' => $share[$i].'/'.$share_bdu[$j],
					'val' => '/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]
				});
			}
		}
	}

	if ($mode_flag ne 'directcopy') {
		for ($i = 0; $i < @usbshare; $i++) {
=pod
			if ($usbshare[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
			elsif ($usbshare[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
			elsif ($usbshare[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
			elsif ($usbshare[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
			else { $usb_guid = ""; }
=cut

			if ($usbshare[$i] =~ m#([1-9]$)#) {
				$usb_guid = $devlink->get_connect_usb($+);
			}
			else {
				$usb_guid = "";
			}

			if ($usb_guid) {
				if ($mode_flag ne 'hardlink') {
					push(@dataArray, {
						'opt' => $usbshare[$i],
						'val' => '/mnt/'.$usbshare[$i]
					});
				}
				else {
					push(@dataArray, {
						'opt' => $usbshare[$i],
						'val' => $own_hostname.'@/mnt/'.$usbshare[$i]
					});
				}

				if ($mode_flag ne 'hardlink') {
					$bdu->init('/mnt/'.$usbshare[$i]);
					@share_bdu = $bdu->get_bdu_list;

					for ($j = 0; $j < @share_bdu; $j++) {
						if (length($usbshare[$i].'/'.$share_bdu[$j]) > 80) { next; }
						push(@dataArray, {
							'opt' => $usbshare[$i].'/'.$share_bdu[$j],
							'val' => '/mnt/'.$usbshare[$i].'/'.$share_bdu[$j]
						});
					}
				}
			}
		}
	}

	if (!$mode_flag) {
		my @host_name	= $ts_target->get_host_name;
		my @drive_name	= $ts_target->get_drive_name;
		my @share_name	= $ts_target->get_share_name;
		my @drive_space	= $ts_target->get_disk_space;

		for ($i = 0; $i < @host_name; $i++) {
			if ($host_name[$i] eq $own_hostname) {
				next;
			}

			if (!$drive_space[$i]) {
				push(@dataArray, {
					'opt' => "$host_name[$i]\@$share_name[$i]",
					'val' => "$host_name[$i]\@/mnt/$drive_name[$i]/$share_name[$i]"
				});
			}
			else {
				push(@dataArray, {
					'opt' => "$host_name[$i]\@$share_name[$i]",
					'val' => "$host_name[$i]\@/mnt/$drive_name[$i]/$share_name[$i]"
				});
			}
		}
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub get_backupTargets {
	my $self = shift;
	my $repli_flag = shift;
	my @errors = ();
	my @dataArray = ();
	my $hostname = BufBasicHostname->new;
	my $disk = BufDiskInfo->new;
	my $usbshare_list = BufShareListInfo->new;
	my $ts_target = BufBackupDestLSListInfo->new;
	my $search = BufBackupLSSerchList->new;
	my $devlink = BufCommonDevLink->new;

	$hostname->init;
	$disk->init;
	$search->init();
	$search->get_refresh_list();
	$usbshare_list->init('usb');
	if ($repli_flag) {
		$ts_target->init('replication');
	}
	else {
		$ts_target->init('refresh');
	}
	$devlink->init();

	my @usbshare_name = $usbshare_list->get_name;
	my @usbbackup = $usbshare_list->get_backup;
	my $host_name = $hostname->get_name;
	my $usb_guid;
	my $i;

	for ($i = 0; $i < @usbshare_name; $i++) {
		if ($usbbackup[$i]) {
=pod
			if ($usbshare_name[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
			elsif ($usbshare_name[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
			elsif ($usbshare_name[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
			elsif ($usbshare_name[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
			else { $usb_guid = ""; }
=cut

			if ($usbshare_name[$i] =~ m#([1-9]$)#) {
				$usb_guid = $devlink->get_connect_usb($+);
			}
			else {
				$usb_guid = "";
			}

			if ($usb_guid) {
				push(@dataArray, {
					'opt' => "$host_name\@$usbshare_name[$i]",
					'val' => "$host_name\@/mnt/$usbshare_name[$i]"
				});
			}
		}
	}

	my @host_name = $ts_target->get_host_name;
	my @drive_name = $ts_target->get_drive_name;
	my @share_name = $ts_target->get_share_name;
	my @drive_space	= $ts_target->get_disk_space;

	for ($i = 0; $i < @host_name; $i++) {
		if (!$drive_space[$i]) {
			push(@dataArray, {
				'opt' => "$host_name[$i]\@$share_name[$i]",
				'val' => "$host_name[$i]\@/mnt/$drive_name[$i]/$share_name[$i]"
			});
		}
		else {
			push(@dataArray, {
				'opt' => "$host_name[$i]\@$share_name[$i]",
				'val' => "$host_name[$i]\@/mnt/$drive_name[$i]/$share_name[$i]"
			});
		}
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub backup_task_setup_check_timer_status {
	my $backup_info = BufBackupInfo->new;
	my $timer = BufTimerInfo->new;
	$timer->init;

	my $backup_max= '8';
	my $flag_enable;
	my $i;

	if ($timer->get_status ne "sleep") {
		for ($i=1; $i<=$backup_max; $i++) {
			$backup_info->init($i);
			my $backup_enable = $backup_info->get_backup_enable;
			if ($backup_enable ne "off") {
				$flag_enable++;
			}
		}

		if ($flag_enable == 0) {
			$timer->set_status('off');
		}
		else {
			$timer->set_status('backup');
		}
		$timer->save;
	}

	return;
}

sub backup_task_setup_set_cron_job {
	my $cron = BufBackupCron->new;
	$cron->init;
	$cron->set_crontab_job;

	return;
}

sub get_BackupPassword {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dataHash = {
		'password' => $self->{password}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub set_BackupPassword {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $htmlinfo;

	my $backup_pass  = BufBackupLSSerchPass->new();
	$backup_pass->init;

	my $check = BufCommonDataCheck->new();

	$htmlinfo = $q->param('password');
	$check->init($htmlinfo);
	if (!$check->check_max_length('8')) { push @errors, 'backup_err8'; }
	if (!$check->check_password) { push @errors, 'backup_err9'; }
	if (!$check->check_1st_symbol) { push @errors, 'backup_err10'; }
	
	if (@errors == 0) {
		$backup_pass->set_pass($q->param('password'));
		$backup_pass->save;
	}
	
	push (@dataArray, '');

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
