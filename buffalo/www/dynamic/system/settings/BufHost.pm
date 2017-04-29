#!/usr/bin/speedy
;################################################
;# BufHost.pm
;# usage :
;#	$class = new BufHost;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufHost;

use BufBasicHostname;
use BufBasicHostcomment;
use BufCommonDataCheck;
use BufCommonFileInfo;
use strict;
use JSON;
use global_init_system;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

sub new {
	my $class = shift;
	my $self  = bless {
		hostName	=> undef,
		hostComment => undef,
		iscsiStatus => undef,
		workingmode => undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load;

	return;
}

sub load {
	my $self = shift;
	my $hostName = BufBasicHostname->new();
	my $hostComment = BufBasicHostcomment->new();
	my $info = BufCommonFileInfo->new();
	my $info2 = BufCommonFileInfo->new();

	$hostName->init;
	$hostComment->init;
	$info->init('/etc/melco/iscsi_info');
	$info2->init('/etc/melco/info');

	$self->{hostName} = $hostName->get_name;
	$self->{hostComment} = $hostComment->get_comment;
	if ($gModel->is('SUPPORT_ISCSI')) {
		$self->{iscsiStatus} = $info->get_info('iscsi_service');
		$self->{workingmode} = $info2->get_info('workingmode');
	}

	return;
}

# This method will be called when populating the HostName Setup tab
sub getHostName_settings {
	my $self		= shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'hostName' => $self->{hostName},
		'hostDesc' => $self->{hostComment},
		'iscsiStatus' => $self->{iscsiStatus}
	};

	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };

	return to_json($jsnHash);
}

# This method will be called when setting the Host Name
sub setHostName_settings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $hostname	= BufBasicHostname->new();
	my $hostcomment = BufBasicHostcomment->new();
	my $check		= BufCommonDataCheck->new();
#	require 'dynamic/common/global_init_system.pl';

	my $name;
	my $comment;
	
	$hostname->init();
	$hostcomment->init();

	$name 			= $cgiRequest->param('hostName');
	$comment  	= $cgiRequest->param('hostDesc');

	$check->init($name);
	if ($name eq "") { push @errors, "hostname_err1"; }
	if (!$check->check_max_length('15')) { 
		if ($self->{workingmode} ne 'iSCSI') {
			push @errors, "hostname_err2";
		}
		else {
			push @errors, "hostname_err2_iscsi";
		}
	}

	if ($self->{workingmode} ne 'iSCSI') {
		if (!$check->check_hostname) { push @errors, "hostname_err3"; }
	}
	else {
		if (!$check->check_hostname_iscsi) { push @errors, "hostname_err3"; }
	}

	if (!$check->check_1st_symbol2) { push @errors, "hostname_err4"; }

	if ($self->{workingmode} ne 'iSCSI') {
		$check->init($comment);
		if ($comment eq "") { push @errors, "hostDesc_err1"; }
#		if (!$check->check_max_length('50')) { push @errors, "hostDesc_err2"; }
		if (!$check->check_max_length('75')) { push @errors, "hostDesc_err2"; }
		if (!$check->check_1st_space) { push @errors, "hostDesc_err3"; }
		if (!$check->check_comment) { push @errors, "hostDesc_err4"; }
	}

	if (@errors == 0) {
#		$hostname->set_name(uc $name);
		$hostname->set_name($name);
		$hostcomment->set_comment($comment);
		$hostname->save;
		readpipe('/usr/local/bin/change_notify.sh network');
		readpipe('/usr/local/bin/time_set.sh');
		$hostcomment->save;
		global_init_system->init_hostname();
		global_init_system->init_syslog();
		global_init_system->init_filesystem();
	}

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
