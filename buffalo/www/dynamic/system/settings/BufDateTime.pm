#!/usr/bin/speedy
;################################################
;# BufDateTime.pm
;# usage :
;#	$class = new BufDateTime;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufDateTime;

use BufBasicDate;
use BufBasicNTP;
use BufCommonDataCheck;

use strict;
use JSON;


sub new {
	my $class = shift;
	my $self  = bless {
		dateMethod	=> undef,
		ip			=> undef,
		secIp		=> undef,
		syncFreq	=> undef,
		date		=> undef,
		time		=> undef,
		timeHour	=> undef,
		timeMin		=> undef,
		timeSec		=> undef,
		timeZone	=> undef,
		defaultNtp	=> undef

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
	my $date	= BufBasicDate->new();
	my $ntp 	= BufBasicNTP->new();
	my $info	= BufCommonFileInfo->new();
	$date->init;
	$ntp->init;
	$info->init('/etc/melco/info');

	my $month	= (($date->get_month) < 10 ? "0".$date->get_month : $date->get_month);
	my $day		= (($date->get_day) < 10 ? "0".$date->get_day : $date->get_day);
	my $year	= $date->get_year;
	my $hour	= (($date->get_hour) < 10 ? "0".$date->get_hour : $date->get_hour);
	my $min		= (($date->get_min) < 10 ? "0".$date->get_min : $date->get_min);
	my $sec		= (($date->get_sec) < 10 ? "0".$date->get_sec : $date->get_sec);

	$self->{dateMethod}	= $ntp->get_status;
	$self->{ip}			= $ntp->get_server;
	$self->{syncFreq}	= $ntp->get_refresh_interval;
	$self->{date}		= $month."/".$day."/".$year; # always return format m/d/Y.	Added by N. E. 08/24/2009
	$self->{time}		= $hour.":".$min.":".$sec;
	$self->{timeHour}	= $hour;
	$self->{timeMin}	= $min;
	$self->{timeSec}	= $sec;
	$self->{timeZone}	= $date->get_timezone;

	if (-f '/usr/local/bin/set_timezone.pl') {
		my $timezone_tmp = readpipe('/usr/local/bin/set_timezone.pl --get present 2>/dev/null');
		$timezone_tmp =~ s#^(\s)+##;
		my @timezone_tmp = split (/ /, $timezone_tmp, 2);
		$self->{timeZone} = $timezone_tmp[0];
	}
	else {
		if (($self->{timeZone} < 10) && ($self->{timeZone} > 0)) {
			$self->{timeZone} = '0'.$self->{timeZone};
		}
		if (($self->{timeZone} > -10) && ($self->{timeZone} < 0)) {
			$self->{timeZone} =~ s#-#-0#;
		}
		if ($self->{timeZone} eq '0') {
			$self->{timeZone} = '00';
		}
	}

	if ($self->{ip} eq 'ntp.jst.mfeed.ad.jp') {
		$self->{defaultNtp} = 'on';
	}
	else {
		$self->{defaultNtp} = 'off';
	}

	return;
}

sub getDT_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $dataHash = {
		'dateMethod'	=> $self->{dateMethod},
		'ip'			=> $self->{ip},
		'secIp'			=> $self->{secIp},
		'syncFreq'		=> $self->{syncFreq},
		'date'			=> $self->{date},
		'time'			=> $self->{time},
		'timeHour'		=> $self->{timeHour},
		'timeMin'		=> $self->{timeMin},
		'timeSec'		=> $self->{timeSec},
		'timeZone'		=> $self->{timeZone},
		'defaultNtp'	=> $self->{defaultNtp}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => @errors
	};

	return to_json($jsnHash);
}

sub setDT_settings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $b_date		= BufBasicDate->new();
	my $ntp 		= BufBasicNTP->new();

	my $dateMethod;
	my $ip;
	my $secIp;
	my $syncFreq;
	my $defaultNtp;

	my $date;
	my $timeHour;
	my $timeMin;
	my $timeSec;
	my $clock;
	my $timeZone;
	my @aDate;
	my @aTime;
	my @aMin;
	my $month;
	my $day;
	my $year;
	my $hour;
	my $min;
	my $sec;

	$dateMethod = $cgiRequest->param('dateMethod');

	if ($dateMethod eq 'on') {
		$ip 		 = $cgiRequest->param('ip');
		$secIp		 = $cgiRequest->param('secIp');
		$syncFreq	 = $cgiRequest->param('syncFreq');
		$timeZone	 = $cgiRequest->param('timeZone');
		$defaultNtp  = $cgiRequest->param('defaultNtp');
	}
	else {
		$date		 = $cgiRequest->param('date');
		$timeHour	 = $cgiRequest->param('timeHour');
		$timeMin	 = $cgiRequest->param('timeMin');
		$timeSec	 = $cgiRequest->param('timeSec');
		$timeZone	 = $cgiRequest->param('timeZone');

		@aDate = split('/',$date);
		if ($aDate[0] > 12) {
			$year  = $aDate[0];
			$month = $aDate[1];
			$day   = $aDate[2];
		}
		else {
			$month = $aDate[0];
			$day   = $aDate[1];
			$year  = $aDate[2];
		}
		$hour  = $timeHour;
		$min   = $timeMin;
		$sec   = $timeSec;
	}
	
	unless (-f '/usr/local/bin/set_timezone.pl') {
		$timeZone =~ s#GMT##;
		if ($timeZone =~ m#:00#) {
			$timeZone =~ s#:00##;
		}
		elsif ($timeZone =~ m#:30#) {
			$timeZone =~ s#:30##;
			$timeZone = $timeZone.'.5';
		}
		elsif ($timeZone =~ m#:45#) {
			$timeZone =~ s#:45##;
			$timeZone = $timeZone.'.75';
		}

		$timeZone =~ s#^0##;
		$timeZone =~ s#\+0##;
		$timeZone =~ s#\+##;
		$timeZone =~ s#-0#-#;

		if ($timeZone eq '00') {
			$timeZone = '0';
		}
	}

	my $check = BufCommonDataCheck->new();
	$check->init($ip);

	if (($dateMethod eq 'on') && ($defaultNtp ne 'on')) {
		#if (($ip eq "") || (!$check->check_max_length('50')) || (!$check->check_smtp_address)) {
		if (($ip eq "") || (!$check->check_max_length('50')) || (!$check->check_ntp_server_name)) {
			push @errors, 'dTime_ntp_err_1';
		}
	}

	if (@errors == 0) {
		$ntp->set_status($dateMethod);
		if ($dateMethod eq 'on') {
			$ntp->set_server($ip);
			$ntp->set_default($defaultNtp);
			$ntp->set_refresh_interval($syncFreq);
			unless ($timeZone =~ m#^\(#) {
				$b_date->set_timezone($timeZone);
			}
			$b_date->save('ntp');
		} 
		else {
			if ($year > 100) {
				$b_date->set_year($year);
				$b_date->set_month($month);
			}
			else {
				$b_date->set_year($month);
				$b_date->set_month($year);
			}
			$b_date->set_day($day);
			$b_date->set_hour($hour);
			$b_date->set_min($min);
			$b_date->set_sec($sec);
			unless ($timeZone =~ m#^\(#) {
				$b_date->set_timezone($timeZone);
			}
			$b_date->save;
		}

		if (!$ntp->save) {
			push @dataArray, 'dTime_ntp_setted_caution';
		}
		else {
			push @dataArray, 'dTime_ntp_setted_ok';
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
