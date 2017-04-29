#!/usr/bin/speedy
;################################################
;# BufUpdate.pm
;# 
;# usage :
;#	$class = BufUpdate->new();
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufUpdate;

use strict;
use JSON;
use CGI;

use BufCommonFileInfo;


sub new {
	my $class = shift;
	my $self  = bless {
		filename => "/etc/melco/info",
		update => undef,
		notify => undef,
		error => undef,
		changeLog => undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $cgiRequest = shift;

	$self->load($cgiRequest);

	return;
}

sub load {
	my $self = shift;
	my $url = shift;
	my $manual = shift;

	if ($url) {
		readpipe ("/etc/init.d/update_notifications.sh change_url $url 1> /dev/null 2> /dev/null");
	}
	if ($manual) {
		readpipe ("/etc/init.d/update_notifications.sh start 1> /dev/null 2> /dev/null");
	}

	unless (-f '/tmp/fwinfo') {
		$self->{error} = 'timeout';
		return;
	}
	
	my $file = BufCommonFileInfo->new();
	$file->init($self->{filename});
	$self->{notify} = $file->get_info('ol_notify');

#	sleep 1;

	my $info = BufCommonFileInfo->new();
	$info->init('/tmp/fwinfo');

#	if (($info->get_info('step2')) && ($self->{notify} ne 'off')) {
	if ($info->get_info('step2')) {
		$self->{update} = JSON::true;
		$self->{changeLog} = readpipe('cat /tmp/fwinfo_note 2> /dev/null');
	}
	else {
		$self->{update} = JSON::false;
		$self->{changeLog} = '';
	}

	if ($info->get_info('ng_step1') eq 'timeout') {
		$self->{error} = 'timeout';
	}

	return;
}

sub startUpdate {
	my $self = shift;

	system ("/etc/init.d/update_notifications.sh start_update 1> /dev/null 2> /dev/null &");
	return;
}

sub getUpdateStatus {
	my $self = shift;
	my $cgiRequest = shift;

	my $url = $cgiRequest->param('url');
	my $manual = $cgiRequest->param('manual');

	if ($url) {
		$self->load($url);
	}
	elsif ($manual) {
		$self->load(undef, $manual);
	}

	my @errors = ();
	my @dataArray = ();

	if ($self->{error} eq 'timeout') {
		push @errors, 'system_firmware_update_log_err_timeout';
	}

	push (@dataArray, {
		'update' => $self->{update},
		'changeLog' => $self->{changeLog},
		'notify' => $self->{notify}
	});

	my $jsnHash = {
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getUpdateStatus_wo_JSON {
	my $self = shift;

	unless (-f '/tmp/upno_status') {
		if ($self->{notify} ne 'off') {
			return $self->{update};
		}
		else {
			return JSON::false;
		}
	}
	else {
		return JSON::false;
	}
}

sub changeUpdateNotify {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $error_start;
	
	my $file = BufCommonFileInfo->new();
	$file->init($self->{filename});

	unless (-f $self->{filename}) {
		push @errors, 'file_not_found';
	}

	if (@errors == 0) {
		if ($q->param('up_notify') eq 'off') {
			$file->set_info('ol_notify', 'on');
			$file->save();

			#fixed by Aoki(20121119)
			system ("/etc/init.d/update_notifications.sh start 1> /dev/null 2> /dev/null");
			#system ("/etc/init.d/update_notifications.sh start 1> /dev/null 2> /dev/null &");
			#sleep 5;
			#system ("/etc/init.d/update_notifications.sh notify_lcd 1> /dev/null 2> /dev/null &");
		}
		else {
			$file->set_info('ol_notify', 'off');
			$file->save();

			system ("/etc/init.d/update_notifications.sh stop 1> /dev/null 2> /dev/null");
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
