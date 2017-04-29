#!/usr/bin/speedy
;##############################
;# BufEyeFi.pm
;# 
;# usage :
;#	$class = BufEyeFi->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufEyeFi;

use strict;
use JSON;
use BUFFALO::Common::FileInfo;
use CGI;

sub new {
	my $class = shift;
	my $self  = bless {
		eyefi =>  undef,
		filename => "/etc/eyefi/eyefi.conf"
	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load;

	return;
}

sub load {
	my $self   = shift;
#	$self->_load_status();

#	$self->{eyefi} = $self->get_status();
	my $file = BufCommonFileInfo->new();
	$file->init($self->{filename});

	$self->{eyefi} = $file->get_info('eyefi_service');
	if ($self->{eyefi} eq '') {
		$self->{eyefi} = 'off';
	}

	return;
}

sub getEyefiSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'eyefi_service' => $self->{eyefi}
	});
	
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setEyefiSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	$self->_load_status();
	$self->set_status($q->param('eyefi_service'));

	if ($q->param('eyefi_service') eq 'on') {
		system ("/etc/init.d/eyefid.sh real_stop 1>/dev/null 2>/dev/null");
		system ("/etc/init.d/eyefid.sh force_start 1>/dev/null 2>/dev/null &");
		$self->{eyefi} = 'on';
	}
	else {
		system ("/etc/init.d/eyefid.sh real_stop 1>/dev/null 2>/dev/null &");
		$self->{eyefi} = 'off';
	}

	$self->save();

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		 'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub delEyefiJob {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	$self->_load_status();
	$self->set_remove_queue();

	push (@dataArray, '');
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub get_status {
	my $self = shift;

	return $self->{eyefi};
}

sub set_status {
	my $self = shift;
	$self->{eyefi} = shift;

	return;
}

sub _load_status {
	my $self = shift;
	my $info = BUFFALO::Common::FileInfo->new('/etc/eyefi/eyefi.conf');

	if ($info->get_info('eyefi_service') eq 'on') {
		$self->{eyefi} = 'on';
	}
	else {
		$self->{eyefi} = 'off';
	}

	return;
}

sub save {
	my $self = shift;
	$self->_save_status;

	return;
}

sub _save_status {
	my $self = shift;
	my $info = BUFFALO::Common::FileInfo->new('/etc/eyefi/eyefi.conf');
	
	if ($self->{eyefi} eq 'on') {
		$info->set_info('eyefi_service',  'on');
	}
	else {
		$info->set_info('eyefi_service',  'off');
	}
	$info->save();

	return;
}

1;
