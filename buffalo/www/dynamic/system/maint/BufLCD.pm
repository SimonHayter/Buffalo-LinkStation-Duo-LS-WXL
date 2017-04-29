#!/usr/bin/speedy
;################################################
;# BufLCD.pm
;# usage:
;#	  $class = new BufLCD;
;#	  $class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufLCD;

use BufMaintenanceLCDLED;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		host_ip		=> undef,
		hdd			=> undef,
		diskmode	=> undef,
		time		=> undef,
		
		autochange	=> undef,
		backlight	=> undef
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
	my $lcdled	= BufMaintenanceLCDLED->new();
	$lcdled->init();
	
	$self->{host_ip}	= $lcdled->get_hostip;
	$self->{hdd}		= $lcdled->get_hddused;
	$self->{diskmode}	= $lcdled->get_diskmode;
	$self->{time}		= $lcdled->get_time;

	$self->{autochange}	= $lcdled->get_auto;
	$self->{backlight}	= $lcdled->get_backlight;
	
	return;
}

sub getLCDSettings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $dataHash = {
		'host_ip'		=> $self->{host_ip},
		'hdd'			=> $self->{hdd},
		'diskmode'		=> $self->{diskmode},
		'time'			=> $self->{time},

		'autochange'	=> $self->{autochange},
		'backlight'		=> $self->{backlight}
	};

	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	
	return to_json($jsnHash);
}

sub setLCDSettings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $lcdled		= BufMaintenanceLCDLED->new;
	$lcdled->init();
	
	my $host_ip		= $cgiRequest->param('host_ip');
	my $hdd			= $cgiRequest->param('hdd');
	my $diskmode	= $cgiRequest->param('diskmode');
	my $time		= $cgiRequest->param('time');
	
	my $autochange	= $cgiRequest->param('autochange');
	my $backlight	= $cgiRequest->param('backlight');
	
	if (@errors == 0) {
		$lcdled->set_hostip($host_ip);
		$lcdled->set_hddused($hdd);
		$lcdled->set_diskmode($diskmode);
		$lcdled->set_time($time);
		
		$lcdled->set_auto($autochange);
#		if ($autochange eq 'on') {
			$lcdled->set_backlight($backlight);
#		}
		
		$lcdled->save;
		system ('/usr/local/bin/change_notify.sh 1> /dev/null 2> /dev/null &');
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
