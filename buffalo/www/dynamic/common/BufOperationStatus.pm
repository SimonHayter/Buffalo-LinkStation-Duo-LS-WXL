#!/usr/bin/speedy

;#############################################
;# BufOperationStatus.pm
;#
;# usage :
;#	$class = new BufOperationStatus;
;#	$class->init;
;#
;# (C) 2008 BUFFALO INC. All rights reserved.
;#############################################

package BufOperationStatus;

use strict;
use JSON;

use BufCommonFileInfo;
use BufDiskDeleteInfo;


sub new {
	my $class = shift;
	my $self = bless {
		operation => undef,
		task => undef,
		progress => undef,
		elapsedTime => undef,
		error => undef
	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $status;
	my $file = BufCommonFileInfo->new;
	my $delete = BufDiskDeleteInfo->new;

	# lockファイル 取りこぼし防止
	sleep 3;

	# ファームウェア アップデート
	if (-f '/tmp/upno_status') {
		$self->{operation} = 'opFirmwareUpdate';

		$file->init('/tmp/upno_status');
		my $status = $file->get_info('status');

		if ($status =~ m#^error_#) {
			$self->{error} = $status;
			unlink('/tmp/upno_status');
		}
		else {
			$self->{progress} = $status;
		}
	}


TOP:
	# zerofill
	if (-f '/var/tmp/diskdelete/progress') {
		$self->{operation} = 'opDiskErase';

#		my $task = $delete->get_task;
		$file->init('/var/tmp/diskdelete/progress');
		my $task = $file->get_info('Task');
		$task =~ s/\// \/ /;
		
		if ($task == 1) {
			$self->{task} = 'erase_1_4';
		}
		elsif ($task == 2) {
			$self->{task} = 'erase_2_4';
		}
		elsif ($task == 3) {
			$self->{task} = 'erase_3_4';
		}
		elsif ($task == 4) {
			$self->{task} = 'erase_4_4';
		}
		else {
			$self->{progress} = ' ';
			goto END;
		}

		$delete->init;
		
		my $target_size = $delete->get_target_size;
		my $finished = $delete->get_finished;
		my $progress = $delete->get_progress;
		my $task_speed = $delete->get_task_speed;
		my $rest_time = $delete->get_rest_time;

		$self->{progress} = $finished.' GB / '.$target_size.' GB ('.$progress.' %)';
		$self->{elapsedTime} = $rest_time;
END:
	}

	# RAID作成/削除/再構築
	elsif (-f '/var/lock/mkraid_status') {
		$self->{operation} = 'opArrayChange';
		$status = readpipe("cat /var/lock/mkraid_status");
		chomp $status;

		if ($status eq 'success') {
			$self->{progress} = undef;
			
			unlink '/etc/melco/diskinfo.bak';
			system ("rm -f /var/lock/mkraid_ready");
			system ("rm -f /var/lock/mkraid_status");

			sleep 10;
			goto TOP;
		}
		elsif ($status eq 'fail') {
			system("cp /etc/melco/diskinfo.bak /etc/melco/diskinfo");
			unlink '/etc/melco/diskinfo.bak';
			
			system ("rm -f /var/lock/mkraid");
			system ("rm -f /var/lock/mkraid_ready");
			system ("rm -f /var/lock/mkraid_status");
			
			$self->{error} = 'disk_mngt_array_err1';
		}
		else {
			$self->{progress} = $status.' %';
		}
	}

	# remove / spare
	elsif (-f '/var/lock/mkraid') {
		$self->{operation} = 'opArrayChange';
		$self->{progress} = ' ';
	}

	# format / diskcheck
	elsif ((-f '/var/lock/disk') || (-f '/var/lock/disk.log')) {
		$self->{operation} = 'opDiskFormat';
		
		if(open(FH_DISK, "< /var/lock/disk")) {
			my $cmd = (split(/\s+/, <FH_DISK>, ))[0];
			close(FH_DISK);

			$self->{operation} = 'opDiskFormat' if ($cmd eq 'hdd_format');
			$self->{operation} = 'opDiskCheck' if ($cmd eq 'hdd_check_normal');
		}
		
		if (-f '/var/lock/disk.log') {
			$status = readpipe("cat /var/lock/disk.log");
			chomp $status;

			if ($status eq 'success') {
				$self->{progress} = undef;
			}
			elsif ($status eq 'fail') {
				$self->{error} = 'disk_mngt_format_err1';
			}
			elsif ($status eq 'fail_usb') {
				$self->{error} = 'disk_mngt_format_err2';
			}
			
			unlink '/var/lock/disk';
			unlink '/var/lock/disk.log';
		}
		else {
				$self->{progress} = ' ';
		}
	}

	# CSV import
	elsif (-f '/var/lock/csv_user') {
		$self->{operation} = 'opUserCsvImport';

		if (-f '/var/lock/csv_user_done') {
			$self->{progress} = undef;

			unlink '/var/lock/csv_user';
			unlink '/var/lock/csv_user_done';
		}
		else {
			$self->{progress} = ' ';
		}
	}

=pod
# test code
	my $i = readpipe('cat /tmp/test');
	if (!$i) {
		$i = 0;
	}
	else {
		$i++;
	}
	system ("echo $i > /tmp/test");
	$self->{operation} = 'opDiskFormat';
	if ($i == 5) {
		$self->{progress} = undef;
		unlink '/tmp/test';
	}
	else {
		$self->{progress} = $i;
	}
=cut

	return;
}

sub getOperationStatus {
	my $self = shift;
	my @dataArray;
	my @errors;
	my $jsnHash;

	push(@dataArray, {
		'operation' => $self->{operation},
		'task' => $self->{task},
		'progress' => $self->{progress},
		'elapsedTime' => $self->{elapsedTime}
	});
	push @errors, $self->{error};

	if (!$self->{error}) {
		$jsnHash = {
			'success' => JSON::true,
			'data' => \@dataArray,
			'errors' => \@errors
		};
	}
	else {
		$jsnHash = {
			'success' => JSON::false,
			'data' => \@dataArray,
			'errors' => \@errors
		};
	}

	return to_json($jsnHash);
}

1;
