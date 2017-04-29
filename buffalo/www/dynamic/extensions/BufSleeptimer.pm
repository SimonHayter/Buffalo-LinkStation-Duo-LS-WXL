#!/usr/bin/speedy
;##############################
;# BufSleeptimer.pm
;# 
;# usage :
;#	$class = BufSleeptimer->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufSleeptimer;

use strict;
use JSON;

use CGI;
use BUFFALO::Power::Sleep;

sub new {
	my $class = shift;
	my $self  = bless {
		interval1 =>  undef,
		sun1	  =>  undef,
		mon1	  =>  undef,
		tue1	  =>  undef,
		wed1	  =>  undef,
		thu1	  =>  undef,
		fri1	  =>  undef,
		sat1	  =>  undef,
		wakeup1   =>  undef,
		wakeup_h1 =>  undef,
		wakeup_m1 =>  undef,
		sleep1	  =>  undef,
		sleep_h1  =>  undef,
		sleep_m1  =>  undef,
		
		interval2 =>  undef,
		sun2	  =>  undef,
		mon2	  =>  undef,
		tue2	  =>  undef,
		wed2	  =>  undef,
		thu2	  =>  undef,
		fri2	  =>  undef,
		sat2	  =>  undef,
		wakeup2   =>  undef,
		wakeup_h2 =>  undef,
		wakeup_m2 =>  undef,
		sleep2	  =>  undef,
		sleep_h2  =>  undef,
		sleep_m2  =>  undef,
		
		interval3 =>  undef,
		sun3	  =>  undef,
		mon3	  =>  undef,
		tue3	  =>  undef,
		wed3	  =>  undef,
		thu3	  =>  undef,
		fri3	  =>  undef,
		sat3	  =>  undef,
		wakeup3   =>  undef,
		wakeup_h3 =>  undef,
		wakeup_m3 =>  undef,
		sleep3	  =>  undef,
		sleep_h3  =>  undef,
		sleep_m3  =>  undef
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
	my $sleep = BUFFALO::Power::Sleep->new();
	
	$self->{interval1} = $sleep->get_mode('1');
	$self->{sun1}	   = $sleep->get_week('1', 'sun');
	$self->{mon1}	   = $sleep->get_week('1', 'mon');
	$self->{tue1}	   = $sleep->get_week('1', 'tue');
	$self->{wed1}	   = $sleep->get_week('1', 'wed');
	$self->{thu1}	   = $sleep->get_week('1', 'thu');
	$self->{fri1}	   = $sleep->get_week('1', 'fri');
	$self->{sat1}	   = $sleep->get_week('1', 'sat');
	$self->{wakeup1}   = $sleep->get_uptime('1', '');
	$self->{wakeup_h1} = (split (/:/, $self->{wakeup1}))[0];
	$self->{wakeup_m1} = (split (/:/, $self->{wakeup1}))[1];
	$self->{sleep1}    = $sleep->get_downtime('1', '');
	$self->{sleep_h1}  = (split (/:/, $self->{sleep1}))[0];
	$self->{sleep_m1}  = (split (/:/, $self->{sleep1}))[1];
	
	$self->{interval2} = $sleep->get_mode('2');
	$self->{sun2}	   = $sleep->get_week('2', 'sun');
	$self->{mon2}	   = $sleep->get_week('2', 'mon');
	$self->{tue2}	   = $sleep->get_week('2', 'tue');
	$self->{wed2}	   = $sleep->get_week('2', 'wed');
	$self->{thu2}	   = $sleep->get_week('2', 'thu');
	$self->{fri2}	   = $sleep->get_week('2', 'fri');
	$self->{sat2}	   = $sleep->get_week('2', 'sat');
	$self->{wakeup2}   = $sleep->get_uptime('2', '');
	$self->{wakeup_h2} = (split (/:/, $self->{wakeup2}))[0];
	$self->{wakeup_m2} = (split (/:/, $self->{wakeup2}))[1];
	$self->{sleep2}    = $sleep->get_downtime('2', '');
	$self->{sleep_h2}  = (split (/:/, $self->{sleep2}))[0];
	$self->{sleep_m2}  = (split (/:/, $self->{sleep2}))[1];
	
	$self->{interval3} = $sleep->get_mode('3');
	$self->{sun3}	   = $sleep->get_week('3', 'sun');
	$self->{mon3}	   = $sleep->get_week('3', 'mon');
	$self->{tue3}	   = $sleep->get_week('3', 'tue');
	$self->{wed3}	   = $sleep->get_week('3', 'wed');
	$self->{thu3}	   = $sleep->get_week('3', 'thu');
	$self->{fri3}	   = $sleep->get_week('3', 'fri');
	$self->{sat3}	   = $sleep->get_week('3', 'sat');
	$self->{wakeup3}   = $sleep->get_uptime('3', '');
	$self->{wakeup_h3} = (split (/:/, $self->{wakeup3}))[0];
	$self->{wakeup_m3} = (split (/:/, $self->{wakeup3}))[1];
	$self->{sleep3}    = $sleep->get_downtime('3', '');
	$self->{sleep_h3}  = (split (/:/, $self->{sleep3}))[0];
	$self->{sleep_m3}  = (split (/:/, $self->{sleep3}))[1];

	if ($self->{wakeup1} eq ':') {
		$self->{wakeup1} = undef;
	}
	if ($self->{sleep1} eq ':') {
		$self->{sleep1} = undef;
	}

	if ($self->{wakeup2} eq ':') {
		$self->{wakeup2} = undef;
	}
	if ($self->{sleep2} eq ':') {
		$self->{sleep2} = undef;
	}

	if ($self->{wakeup3} eq ':') {
		$self->{wakeup3} = undef;
	}
	if ($self->{sleep3} eq ':') {
		$self->{sleep3} = undef;
	}

	return;
}

sub getSleeptimerSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'interval1' => $self->{interval1},
		'sun1'		=> $self->{sun1},
		'mon1'		=> $self->{mon1},
		'tue1'		=> $self->{tue1},
		'wed1'		=> $self->{wed1},
		'thu1'		=> $self->{thu1},
		'fri1'		=> $self->{fri1},
		'sat1'		=> $self->{sat1},
#		'wakeup1'	=> $self->{wakeup_h1}.':'.$self->{wakeup_m1},
		'wakeup1'	=> $self->{wakeup1},
		'wakeup_h1' => $self->{wakeup_h1},
		'wakeup_m1' => $self->{wakeup_m1},
#		'sleep1'	=> $self->{sleep_h1}.':'.$self->{sleep_m1},
		'sleep1'	=> $self->{sleep1},
		'sleep_h1'	=> $self->{sleep_h1},
		'sleep_m1'	=> $self->{sleep_m1},
		
		'interval2' => $self->{interval2},
		'sun2'		=> $self->{sun2},
		'mon2'		=> $self->{mon2},
		'tue2'		=> $self->{tue2},
		'wed2'		=> $self->{wed2},
		'thu2'		=> $self->{thu2},
		'fri2'		=> $self->{fri2},
		'sat2'		=> $self->{sat2},
#		'wakeup2'	=> $self->{wakeup_h2}.':'.$self->{wakeup_m2},
		'wakeup2'	=> $self->{wakeup2},
		'wakeup_h2' => $self->{wakeup_h2},
		'wakeup_m2' => $self->{wakeup_m2},
#		'sleep2'	=> $self->{sleep_h2}.':'.$self->{sleep_m2},
		'sleep2'	=> $self->{sleep2},
		'sleep_h2'	=> $self->{sleep_h2},
		'sleep_m2'	=> $self->{sleep_m2},
		
		'interval3' => $self->{interval3},
		'sun3'		=> $self->{sun3},
		'mon3'		=> $self->{mon3},
		'tue3'		=> $self->{tue3},
		'wed3'		=> $self->{wed3},
		'thu3'		=> $self->{thu3},
		'fri3'		=> $self->{fri3},
		'sat3'		=> $self->{sat3},
#		'wakeup3'	=> $self->{wakeup_h3}.':'.$self->{wakeup_m3},
		'wakeup3'	=> $self->{wakeup3},
		'wakeup_h3' => $self->{wakeup_h3},
		'wakeup_m3' => $self->{wakeup_m3},
#		'sleep3'	=> $self->{sleep_h3}.':'.$self->{sleep_m3},
		'sleep3'	=> $self->{sleep3},
		'sleep_h3'	=> $self->{sleep_h3},
		'sleep_m3'	=> $self->{sleep_m3}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setSleeptimerSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $sleep = BUFFALO::Power::Sleep->new();
	
	$self->{wakeup_h1} = (split (/:/, $q->param('wakeup1')))[0];
	$self->{wakeup_m1} = (split (/:/, $q->param('wakeup1')))[1];
	$self->{sleep_h1}  = (split (/:/, $q->param('sleep1')))[0];
	$self->{sleep_m1}  = (split (/:/, $q->param('sleep1')))[1];
	$self->{wakeup_h2} = (split (/:/, $q->param('wakeup2')))[0];
	$self->{wakeup_m2} = (split (/:/, $q->param('wakeup2')))[1];
	$self->{sleep_h2}  = (split (/:/, $q->param('sleep2')))[0];
	$self->{sleep_m2}  = (split (/:/, $q->param('sleep2')))[1];
	$self->{wakeup_h3} = (split (/:/, $q->param('wakeup3')))[0];
	$self->{wakeup_m3} = (split (/:/, $q->param('wakeup3')))[1];
	$self->{sleep_h3}  = (split (/:/, $q->param('sleep3')))[0];
	$self->{sleep_m3}  = (split (/:/, $q->param('sleep3')))[1];
	
	if (($q->param('interval1')) && ($q->param('interval1') ne 'disable')) {
		# 同時刻
		if ($q->param('wakeup1') eq $q->param('sleep1')) {
			push @errors, "sleeptimer_err1_1";
		}
		# 終了時刻が開始時刻よりも早い
		if ($self->{wakeup_h1} > $self->{sleep_h1}) {
			push @errors, "sleeptimer_err1_2";
		}
		if ($self->{wakeup_h1} == $self->{sleep_h1}) {
			if ($self->{wakeup_m1} > $self->{sleep_m1}) {
				push @errors, "sleeptimer_err1_2";
			}
		}
		# 「終了時刻」が24時以降かつ、「起動時刻」は4時よりも早い
		if (($self->{sleep_h1} >= 24) && ($self->{wakeup_h1} <= 3)) {
			push @errors, "sleeptimer_err1_3";
		}
		# 曜日が選択されていない
		if ($q->param('interval1') eq 'week') {
			if (
				($q->param('sun1') != 1) &&
				($q->param('mon1') != 1) &&
				($q->param('tue1') != 1) &&
				($q->param('wed1') != 1) &&
				($q->param('thu1') != 1) &&
				($q->param('fri1') != 1) &&
				($q->param('sat1') != 1) ) {
					push @errors, "sleeptimer_err1_4";
			}
		}
	}
	
	if (($q->param('interval2')) && ($q->param('interval2') ne 'disable')) {
		# 同時刻
		if ($q->param('wakeup2') eq $q->param('sleep2')) {
			push @errors, "sleeptimer_err2_1";
		}
		# 終了時刻が開始時刻よりも早い
		if ($self->{wakeup_h2} > $self->{sleep_h2}) {
			push @errors, "sleeptimer_err2_2";
		}
		if ($self->{wakeup_h2} == $self->{sleep_h2}) {
			if ($self->{wakeup_m2} > $self->{sleep_m2}) {
				push @errors, "sleeptimer_err2_2";
			}
		}
		# 「終了時刻」が24時以降かつ、「起動時刻」は4時よりも早い
		if (($self->{sleep_h2} >= 24) && ($self->{wakeup_h2} <= 3)) {
			push @errors, "sleeptimer_err2_3";
		}
		# 曜日が選択されていない
		if ($q->param('interval2') eq 'week') {
			if (
				($q->param('sun2') != 1) &&
				($q->param('mon2') != 1) &&
				($q->param('tue2') != 1) &&
				($q->param('wed2') != 1) &&
				($q->param('thu2') != 1) &&
				($q->param('fri2') != 1) &&
				($q->param('sat2') != 1) ) {
					push @errors, "sleeptimer_err2_4";
			}
		}
	}

	if (($q->param('interval3')) && ($q->param('interval3') ne 'disable')) {
		# 同時刻
		if ($q->param('wakeup3') eq $q->param('sleep3')) {
			push @errors, "sleeptimer_err3_1";
		}
		# 終了時刻が開始時刻よりも早い
		if ($self->{wakeup_h3} > $self->{sleep_h3}) {
			push @errors, "sleeptimer_err3_2";
		}
		if ($self->{wakeup_h3} == $self->{sleep_h3}) {
			if ($self->{wakeup_m3} > $self->{sleep_m3}) {
				push @errors, "sleeptimer_err3_2";
			}
		}
		# 「終了時刻」が24時以降かつ、「起動時刻」は4時よりも早い
		if (($self->{sleep_h3} >= 24) && ($self->{wakeup_h3} <= 3)) {
			push @errors, "sleeptimer_err3_3";
		}
		# 曜日が選択されていない
		if ($q->param('interval3') eq 'week') {
			if (
				($q->param('sun3') != 1) &&
				($q->param('mon3') != 1) &&
				($q->param('tue3') != 1) &&
				($q->param('wed3') != 1) &&
				($q->param('thu3') != 1) &&
				($q->param('fri3') != 1) &&
				($q->param('sat3') != 1) ) {
					push @errors, "sleeptimer_err3_4";
			}
		}
	}
	
	if (!@errors) {
		$sleep->set_mode('1', $q->param('interval1'));
		if ($q->param('interval1') ne 'disable') {
			$sleep->set_uptime('1', $self->{wakeup_h1}, $self->{wakeup_m1});
			$sleep->set_downtime('1', $self->{sleep_h1}, $self->{sleep_m1});
		}
		if ($q->param('interval1') eq 'week') {
			$sleep->set_week('1', 'sun', $q->param('sun1'));
			$sleep->set_week('1', 'mon', $q->param('mon1'));
			$sleep->set_week('1', 'tue', $q->param('tue1'));
			$sleep->set_week('1', 'wed', $q->param('wed1'));
			$sleep->set_week('1', 'thu', $q->param('thu1'));
			$sleep->set_week('1', 'fri', $q->param('fri1'));
			$sleep->set_week('1', 'sat', $q->param('sat1'));
		}
		
		$sleep->set_mode('2', $q->param('interval2'));
		if ($q->param('interval2') ne 'disable') {
			$sleep->set_uptime('2', $self->{wakeup_h2}, $self->{wakeup_m2});
			$sleep->set_downtime('2', $self->{sleep_h2}, $self->{sleep_m2});
		}
		if ($q->param('interval2') eq 'week') {
			$sleep->set_week('2', 'sun', $q->param('sun2'));
			$sleep->set_week('2', 'mon', $q->param('mon2'));
			$sleep->set_week('2', 'tue', $q->param('tue2'));
			$sleep->set_week('2', 'wed', $q->param('wed2'));
			$sleep->set_week('2', 'thu', $q->param('thu2'));
			$sleep->set_week('2', 'fri', $q->param('fri2'));
			$sleep->set_week('2', 'sat', $q->param('sat2'));
		}
		
		$sleep->set_mode('3', $q->param('interval3'));
		if ($q->param('interval3') ne 'disable') {
			$sleep->set_uptime('3', $self->{wakeup_h3}, $self->{wakeup_m3});
			$sleep->set_downtime('3', $self->{sleep_h3}, $self->{sleep_m3});
		}
		if ($q->param('interval3') eq 'week') {
			$sleep->set_week('3', 'sun', $q->param('sun3'));
			$sleep->set_week('3', 'mon', $q->param('mon3'));
			$sleep->set_week('3', 'tue', $q->param('tue3'));
			$sleep->set_week('3', 'wed', $q->param('wed3'));
			$sleep->set_week('3', 'thu', $q->param('thu3'));
			$sleep->set_week('3', 'fri', $q->param('fri3'));
			$sleep->set_week('3', 'sat', $q->param('sat3'));
		}
		
		$sleep->save();
	}
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
