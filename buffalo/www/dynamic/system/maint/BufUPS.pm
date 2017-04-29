#!/usr/bin/speedy
;#################################################
;# BufUPS.pm
;# usage:
;#	  $class = new BufUPS;
;#	  $class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;#################################################

package BufUPS;

use BufMaintenanceUPS;
use BufUsbStatus;
use BufCommonDataCheck;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $user = shift;
	my $self = bless {
		upsStatus	 =>  undef,
		syncUps 	 =>  undef,
		netMode 	 =>  undef,
		net_ipAddr 	 =>  undef,

		shutdown	 =>  undef,
		time		 =>  undef,
		behavior	 =>  undef,
		connectType	 =>  undef,

		ups_apc 	 =>  undef,
		ups_omron	 =>  undef,
		usb_apc 	 =>  undef,
		usb_omron	 =>  undef,
		recovery	 =>  undef,

		wait		 =>  undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load();

	return;
}

sub load {
	unless (-f '/proc/bus/usb/devices') {
		return;
	}

	my $self  = shift;
	my $ups   = BufMaintenanceUPS->new();
	my $usb   = BufUsbStatus->new();
	$ups->init();
	$usb->init();

	$self->{upsStatus}	= $ups->get_ups_status;
	$self->{netMode}	= $ups->get_netups_type;

	if ($ups->get_ups_link eq 'on') {
		if ($ups->get_use_netups eq 'on') {
			if ($self->{netMode} eq 'slave') {
				$self->{syncUps} = 'slave';
			}
			else {
				$self->{syncUps} = 'master';
			}
		}
		else {
			$self->{syncUps} = 'master';
		}
	}
	else {
		$self->{syncUps} = 'off';
	}

	$self->{net_ipAddr}	= $ups->get_master_ip_address;

	if ($ups->get_ups_terashutdown eq 'low') {
		$self->{shutdown} = 'low';
	}
	elsif ($ups->get_ups_terashutdown eq 'off') {
		$self->{shutdown} = 'off';
	}
	else {
		$self->{shutdown} = 'on';
		$self->{time} = $ups->get_ups_terashutdown / 60;
	}

	$self->{wait} = $ups->get_ups_wait_until_disconnect;
	
	$self->{behavior} = $ups->get_ups_upsshutdown;
	$self->{upsConnect} = $ups->get_ups_connect;
	$self->{recovery} = $ups->get_ups_recover;

	my @usb_vendor;
	my @usb_class;
	my $i;

	@usb_vendor = $usb->get_vid;
	@usb_class	= $usb->get_class;
	for ($i = 0; $i < @usb_class ; ++$i) {
		# 051d ; APC
		if (($usb_class[$i] eq "ups") && ($usb_vendor[$i] eq "051d")) {
			$self->{ups_apc} = "1";
		}
		# 0590 ; OMRON
		if (($usb_class[$i] eq "ups") && ($usb_vendor[$i] eq "0590")) {
			$self->{ups_omron} = "1";
		}
	}

	if ($self->{syncUps} eq 'slave') {
		if ($self->{upsStatus} eq "0") {
			$self->{upsStatus} = 'ups_status1';
		}
		elsif ($self->{upsStatus} eq "1") {
			$self->{upsStatus} = 'ups_status2';
		}
		else {
			$self->{upsStatus} = 'ups_status4';
		}

		if ($self->{ups_apc}) {
			$self->{usb_apc} = "usb_apc";
		}
		elsif ($self->{ups_omron}) {
			$self->{usb_omron} = "usb_omron";
		}

	}
	elsif ($self->{ups_apc}) {
		$self->{usb_apc} = "usb_apc";
#		if ($self->{syncUps} eq "on") {
		if ($self->{syncUps} ne "off") {
			if ($self->{upsStatus} eq "0"){
				if ($self->{upsConnect} eq "usb_apc"){
					$self->{upsStatus} = 'ups_status1';
				}
				else {
					$self->{upsStatus} = 'ups_status3';
				}
			}
			elsif ($self->{upsStatus} eq "1"){
				if ($self->{upsConnect} eq "usb_apc"){
					$self->{upsStatus} = 'ups_status2';
				}
			}
			else{
				$self->{upsStatus} = 'ups_status3';
			}
		}
		else {
			$self->{upsStatus} = 'ups_status3';
		}
	}
	elsif ($self->{ups_omron}) {
		$self->{usb_omron} = "usb_omron";
#		if ($self->{syncUps} eq "on") {
		if ($self->{syncUps} ne "off") {
			if ($self->{upsStatus} eq "0") {
				if ($self->{upsConnect} eq "usb_omron") {
					$self->{upsStatus} = 'ups_status1';
				}
				else {
					$self->{upsStatus} = 'ups_status3';
				}
			}
			elsif ($self->{upsStatus} eq "1") {
				if ($self->{upsConnect} eq "usb_omron") {
					$self->{upsStatus} = 'ups_status2';
				}
			}
			else {
				$self->{upsStatus} = 'ups_status3';
			}
		}
		else {
			$self->{upsStatus} = 'ups_status3';
		}
	}
	else {
		$self->{upsStatus} = 'ups_status4';
	}

	if ($self->{usb_apc})  {
		$self->{connectType} = 'ups_connectType1';
	}
	elsif ($self->{usb_omron})	{
		$self->{connectType} = 'ups_connectType2';
	}
	elsif ($ups->get_ups_connect eq 'ups_apc') {
		$self->{connectType} = 'ups_connectType3';
	}
	elsif ($ups->get_ups_connect eq 'ups_apc_simple') {
		$self->{connectType} = 'ups_connectType3s';
	}
	elsif ($ups->get_ups_connect eq 'ups_omron') {
		$self->{connectType} = 'ups_connectType4';
	}
	else {
		$self->{connectType} = '';
	}

	return;
}

sub get_upsSettings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $dataHash = {
		'upsStatus'		=> $self->{upsStatus},
		'syncUps'		=> $self->{syncUps},
		'net_ipAddr'	=> $self->{net_ipAddr},

		'shutdown'		=> $self->{shutdown},
		'time'			=> $self->{time},
		'behavior'		=> $self->{behavior},
		'connectType'	=> $self->{connectType},
		'recovery'		=> $self->{recovery},

		'wait'			=> $self->{wait}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => @errors
	};

	return to_json($jsnHash);
}

sub set_upsSettings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $ups			= BufMaintenanceUPS->new();
	my $check = BufCommonDataCheck->new();
	$ups->init();

	my $syncUps		= $cgiRequest->param('syncUps');
	my $use_netups;
	my $netMode;

	if ($syncUps eq 'master') {
		$syncUps	= 'on';
		$use_netups	= 'on';
		$netMode	= 'master';
	}
	elsif ($syncUps eq 'slave') {
		$syncUps	= 'on';
		$use_netups	= 'on';
		$netMode	= 'slave';
	}
	else {
		$syncUps	= 'off';
		$use_netups	= 'off';
		$netMode	= '';
	}

	my $net_ipAddr = $cgiRequest->param('net_ipAddr');
	if ($net_ipAddr) {
		$check->init($net_ipAddr);
		if (!$check->check_ip()) {
			push @errors, 'system_ups_net_ipAddr_err';
		}
	}

	my $connectType = $cgiRequest->param('connectType');
	my $shutdown	= $cgiRequest->param('shutdown');
	my $time		= $cgiRequest->param('time') * 60;
	my $behavior	= $cgiRequest->param('behavior');
	my $recovery	= $cgiRequest->param('recovery');
	my $wait		= $cgiRequest->param('wait');

	if (@errors == 0) {
		$ups->set_ups_link($syncUps);

#		if ($syncUps eq 'on') {
		if ($syncUps ne 'off') {
			if ($self->{ups_apc}) {
				$ups->set_ups_connect('usb_apc');
			}
			if ($self->{ups_omron}) {
				$ups->set_ups_connect('usb_omron');
			}

			if ($connectType eq 'ups_connectType3') {
				$ups->set_ups_connect('ups_apc');
			}
			if ($connectType eq 'ups_connectType3s') {
				$ups->set_ups_connect('ups_apc_simple');
			}
			if ($connectType eq 'ups_connectType4') {
				$ups->set_ups_connect('ups_omron');
			}

			if ($shutdown eq 'on') {
				$ups->set_ups_terashutdown($time);
				$ups->set_ups_alart_only('off');
				$ups->set_ups_wait_until_disconnect('off');
			}
			if ($shutdown eq 'low') {
				$ups->set_ups_terashutdown('low');
				$ups->set_ups_alart_only('off');
				$ups->set_ups_wait_until_disconnect('off');
			}
			if ($shutdown eq 'off') {
				$ups->set_ups_terashutdown('off');
				$ups->set_ups_alart_only('on');

				if ($wait) {
					$ups->set_ups_wait_until_disconnect('on');
				}
				else {
					$ups->set_ups_wait_until_disconnect('off');
				}
			}

			$ups->set_ups_upsshutdown($behavior);
			$ups->set_ups_recover($recovery);

			$ups->set_use_netups($use_netups);
			$ups->set_netups_type($netMode);
			$ups->set_master_ip_address($net_ipAddr);
		}
		$ups->save;
		system('/etc/init.d/ups.sh restart 1> /dev/null 2> /dev/null');
	}

	sleep 20;

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
