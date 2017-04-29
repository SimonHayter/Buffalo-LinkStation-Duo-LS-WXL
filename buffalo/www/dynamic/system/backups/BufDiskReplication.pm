#!/usr/bin/speedy
;################################################
;# BufDiskReplication.pm
;# usage :
;#	$class = new BufDiskReplication;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufDiskReplication;

use BufCommonFileInfo;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self = bless {
		source_folder => [],
		target_folder => [],
		error => undef,
		resync => undef
	},	$class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load();

	return;
}

sub load {
	my $self = shift;
	my $info = BufCommonFileInfo->new();

	my $max_task = 64;
	my $i;
	my $temp;
	my @temp;
	my @source_list;
	my @target_list;

	$info->init('/etc/melco/replication');
	for ($i = 1; $i <= $max_task ; $i++) {
		$temp = $info->get_info("folder".$i);
		@temp = split /<>/, $temp;

		my $source_real = $temp[0];
		my $target_real = $temp[1];
		
		if ($temp[0] =~ m#/.+?/usbdisk#) {
			$temp[0] =~ s#/.+?/##;
		}
		else {
			$temp[0] =~ s#/.+?/.+?/##;
		}
		if ($temp[1] =~ m#.+?/.+?/usbdisk#) {
			$temp[1] =~ s#/.+?/##;
		}
		else {
			$temp[1] =~ s#/.+?/.+?/##;
		}
		
		if ($temp[0]) {
			push @{$self->{source_folder}}, $temp[0];
			push @{$self->{target_folder}}, $temp[1];
			push @{$self->{source_folder_real}}, $source_real;
			push @{$self->{target_folder_real}}, $target_real;
		}
	}

	if (-f '/home/replication_error_occurred') {
		$self->{error} = '1';
	}
	else {
		$self->{error} = '0';
	}

	if (-f '/var/lock/replication_resync') {
		$self->{resync} = '1';
	}
	else {
		$self->{resync} = '0';
	}

	return;
}

sub getReplicationList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $cnt = @{$self->{source_folder}};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {
			'source' => ${$self->{source_folder}}[$i],
			'target' => ${$self->{target_folder}}[$i],
			'source_real' => ${$self->{source_folder_real}}[$i],
			'target_real' => ${$self->{target_folder_real}}[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub checkReplication {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'error' => $self->{error},
		'resync' => $self->{resync}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub addReplication {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $max_task = 64;
	my $i;

	my $info = BufCommonFileInfo->new();
	my $json = new JSON;
	$info->init('/etc/melco/replication');

	my $source	= $cgiRequest->param('source');
	my $target	= $cgiRequest->param('target');

	for ($i = 1; $i <= $max_task ; $i++) {
		if (!$info->get_info("folder".$i)) {
			$info->set_info("folder".$i, $source.'<>'.$target);
			$info->save;

			system ('/etc/init.d/replication.sh restart 1>/dev/null 2>/dev/null &');
			$i = $max_task;
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub delReplication {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $max_task = 64;
	my $i;
	my $j;

	my $info = BufCommonFileInfo->new();
	my $json = new JSON;
	$info->init('/etc/melco/replication');

	my $del_target = $json->utf8(0)->decode($cgiRequest->param('target'));
	my $target_cnt = @{$del_target};

	system ('/etc/init.d/replication.sh stop 1>/dev/null 2>/dev/null');

	for ($i = 1; $i <= $max_task ; $i++) {
		for ($j = 0; $j < $target_cnt ; $j++) {
			if ($info->get_info("folder".$i) eq $del_target->[$j]) {
				$info->set_info("folder".$i, '');
				$info->save;

				system ("/usr/local/bin/replication_queue_clear.sh folder$i 1>/dev/null 2>/dev/null &");
			}
		}
	}

	system ('/etc/init.d/replication.sh restart 1>/dev/null 2>/dev/null');

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub resyncReplication {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	system ('/usr/local/bin/replication_resync_start.sh 1>/dev/null 2>/dev/null &');
	unlink ('/home/replication_error_occurred');
	sleep 3;

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
