#!/usr/bin/speedy
;#################################################
;# BufDiskBackupDevList.pm
;# usage :
;#	$class = new BufDiskBackupDevList;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;#################################################

package BufDiskBackupDevList;

use BufBackupLSSerchList;
use BufCommonDataCheck;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		allNames		=>	[],
		allIPs			=>	[],
		allBackups		=>	[],
		allSleeps		=>	[],
		allManualIPs	=>	[]
	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $skip = shift;
	$self->load($skip);

	return;
}

sub load {
	my $self = shift;
	my $skip = shift;
	my $list = BufBackupLSSerchList->new();

	$list->init();

	if (!$skip) {
		unlink '/etc/melco/ls_list';
		system ('touch /etc/melco/ls_list');
		$list->get_refresh_list();

		@{$self->{allNames}} = $list->get_serch_name;
		@{$self->{allIPs}} = $list->get_serch_ip;
		my @backup = $list->get_serch_backup_support;
		my @sleep = $list->get_serch_sleep_status;
		my $cnt = @{$self->{allNames}};

		for (my $i = 0; $i < $cnt; $i++) {
			if ($backup[$i]) {
				${$self->{allBackups}}[$i] = "Supported";
			}
			else {
				${$self->{allBackups}}[$i] = "-";
			}

			if ($sleep[$i]) {
				$${$self->{allSleeps}}[$i] = "Apply";
			}
			else {
				${$self->{allSleeps}}[$i]= "Not Configured";
			}
		}
	}

	@{$self->{allManualIPs}} = $list->get_manual_ip;

	return;
}

sub get_localLinkStations {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{allNames}};
	
	for (my $i = 0; $i < $cnt; $i++) {
		push(@dataArray, {
			'name' => ${$self->{allNames}}[$i],
			'ipAddr' => ${$self->{allIPs}}[$i],
			'backup' => ${$self->{allBackups}}[$i],
			'diskSleep' => ${$self->{allSleeps}}[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub get_offSubnetLinkStations {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{allManualIPs}};

	for (my $i = 0; $i < $cnt; $i++) {
		 push(@dataArray, {
			'ipAddr' => ${$self->{allManualIPs}}[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub add_offSubnetLS {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $check = BufCommonDataCheck->new();
	my $cnt = @{$self->{allManualIPs}};
	my $i;
	
	my $add_ip = $cgiRequest->param('ipAddr');

	$check->init($add_ip);
	if (!$check->check_ip) {
		push @errors, 'ip_err1';
	}
	for ($i = 0; $i < $cnt; $i++) {
		if ($add_ip eq ${$self->{allManualIPs}}[$i]) {
			push @errors, 'ip_err8';
			last;
		}
	}

	if (@errors == 0) {
		my $serch_list	= BufBackupLSSerchList->new();
		$serch_list->init();
		$serch_list->set_add_ip($add_ip);
		$serch_list->save;
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub del_offSubnetLS {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $serch_list = BufBackupLSSerchList->new();

	$serch_list->init();

	my $del_ip = $cgiRequest->param('ipList');
	my $json = new JSON;
	my $ip = $json->utf8->decode($del_ip);

	for (my $i = 0; $i < @{$ip}; $i++) {
		$serch_list->set_remove_ip(${$ip}[$i]);
		$serch_list->save;
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
