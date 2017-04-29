#!/usr/bin/speedy
;################################################
;# BufSystemStatus.pm
;# usage :
;#	$class = new BufSystemStatus;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufSystemStatus;

use BufBasicHostname;
use BUFFALO::Common::Model;
use BufBasicFirmware;
use BufBasicDate;
use BufBasicNTP;
use BufMaintenanceEmail;
use BufMaintenanceFAN;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		hostName => undef,
		modelName => undef,
		version => undef,
		date => undef,
		timezone => undef,
		ntp => undef,
		emailAlert => undef,
		fanStatus => undef,
		time => undef
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
	my $gModel = BUFFALO::Common::Model->new();
	my $firmware = BufBasicFirmware->new;
	my $date = BufBasicDate->new();
	my $ntp = BufBasicNTP->new();
	my $mail = BufMaintenanceEmail->new();
	my $fan = BufMaintenanceFAN->new();

	$hostName->init;
	$firmware->init;
	$date->init;
	$ntp->init;
	$mail->init();
	$fan->init();

	$self->{hostName} = $hostName->get_name;

	$self->{modelName} = $gModel->is('PRODUCT_NAME');
	$self->{modelName} =~ s#\(.+\)##;

	$self->{version} = $firmware->get_version;

	my $month = (($date->get_month) < 10 ? "0".$date->get_month : $date->get_month);
	my $day = (($date->get_day) < 10 ? "0".$date->get_day : $date->get_day);
	my $year = $date->get_year;

	# always return format m/d/Y.  Added by N. E. 08/24/2009
	$self->{date} = $month."/".$day."/".$year;

	$self->{timezone} = $date->get_timezone;

	$self->{ntp} = $ntp->get_status;

	$self->{emailAlert} = $mail->get_status;

	$self->{fanStatus} = $fan->get_status;
	#Added by N. E. 09/14/2009
	$self->{time} = $date->get_hour.":".$date->get_min.":".$date->get_sec;

	return;
}

sub getSystemStatus {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'hostName' => $self->{hostName},
		'modelName' => $self->{modelName},
		'version' => $self->{version},
		'date' => $self->{date},
		'timezone' => $self->{timezone},
		'ntp' => $self->{ntp},
		'emailAlert' => $self->{emailAlert},
		'fanStatus' => $self->{fanStatus},
		'time' => $self->{time}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
