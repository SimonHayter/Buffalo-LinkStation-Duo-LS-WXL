#!/usr/bin/speedy
;################################################
;# BufLED.pm
;# usage:
;#	  $class = new BufLED;
;#	  $class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufLED;

use BufMaintenanceLCDLED;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		led				=> undef,
		ledSync			=> undef,
		ledSleep		=> undef,
		ledSleepTime	=> undef,
		ledWakeup		=> undef
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
	
	$self->{led}			= $lcdled->get_luminance;
	$self->{ledSync}		= $lcdled->get_time_sleep;
	$self->{ledSleep}		= $lcdled->get_luminance_sleep;
	$self->{ledSleepTime}	= $lcdled->get_sleep;
	$self->{ledWakeup}		= $lcdled->get_wakeup;
	
	return;
}

sub getLED_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $dataHash = {
		'led'			=> $self->{led},
		'ledSync'		=> $self->{ledSync},
		'ledSleep'		=> $self->{ledSleep} ,
		'ledSleepTime'	=> $self->{ledSleepTime},
		'ledWakeup'		=> $self->{ledWakeup}
	};

	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	
	return to_json($jsnHash);
}

sub setLED_settings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $lcdled		= BufMaintenanceLCDLED->new;
	$lcdled->init();
	
	my $led				= $cgiRequest->param('led');
	my $ledSync			= $cgiRequest->param('ledSync');
	my $ledSleep		= $cgiRequest->param('ledSleep');
	my $ledSleepTime	= $cgiRequest->param('ledSleepTime');
	my $ledWakeup		= $cgiRequest->param('ledWakeup');
	
	if ($ledSync eq 'on') {
		if ($ledSleepTime == $ledWakeup) {
			push @errors, 'led_err1';
		}
	}
	
	if (@errors == 0) {
		$lcdled->set_luminance($led);
		$lcdled->set_time_sleep($ledSync);
		
		if ($ledSync eq 'on') {
			$lcdled->set_luminance_sleep($ledSleep);
			$lcdled->set_sleep($ledSleepTime);
			$lcdled->set_wakeup($ledWakeup);
		}
		
		$lcdled->save;
		system ('/usr/local/bin/change_notify.sh lcd_led_brightness 1> /dev/null 2> /dev/null &');
		
		if ($ledSync eq 'on') {
			system ('/usr/local/bin/change_notify.sh led_brightness_change_as_time 1> /dev/null 2> /dev/null &');
		}
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
