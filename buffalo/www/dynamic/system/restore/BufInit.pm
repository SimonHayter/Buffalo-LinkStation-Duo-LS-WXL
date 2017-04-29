#!/usr/bin/speedy
;##############################
;# BufInit.pm
;# useage :
;#	$class = new BufInit;
;#	$class->init;
;# (C) 2007 BUFFALO INC. All rights reserved
;# Author: 
;# Date:   
;# Modified By: Deva Kodali
;# Last Modified: 04/02/08, modified as part of cleaning the code, 05/30/08
;##########################################################

package BufInit;

use BufMaintenanceInitSW;
use strict;
use JSON;


sub new {
	my $class	= shift;
	my $self	= bless {
		init	=>	undef,
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->load;
	
	return;
}

sub load {
	my $self	= shift;
	my $sw	= BufMaintenanceInitSW->new();
	$sw->init();
	
	$self->{init} = $sw->get_status;
	
	return;
}

sub getInit_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	
	my $dataHash = {
		'initButtonOption' => $self->{init}
	};
	
	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

sub set_initSettings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $sw			= BufMaintenanceInitSW->new;
	$sw->init();
	
	my $initType  = $cgiRequest->param('initButtonOption');
	
	$sw->set_status($initType);
	$sw->save;
	
	my $jsnHash = { 'success'=> JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

sub restore_LS {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	
	my $initType  = $cgiRequest->param('initButtonOption');
	
	system("/usr/local/bin/initweb.sh 1> /dev/null 2> /dev/null &");
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub start_zerofill {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_DISK_ZEROFILL;
	}

	system("/usr/local/bin/zerofill.sh 1> /dev/null 2> /dev/null &");
	system("mkdir /var/tmp/diskdelete");
	system("echo 'Task=5' > /var/tmp/diskdelete/progress");
	
ERROR_DISK_ZEROFILL:
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub get_InitStatus {
	my $self	= shift;
	my @errors	= ();
	my @dataArray	= ();
	my $dataHash;
	
	if (-f '/var/tmp/diskdelete/progress') {
		$dataHash = {
			'status' => '0'
		}
	}
	else {
		$dataHash = {
			'status' => '1'
		}
	}
	
	@dataArray = ($dataHash);
	return to_json( { 'success'=> JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
