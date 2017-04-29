#!/usr/bin/speedy
;################################################
;# BufHDDSpindown.pm
;# 
;# usage :
;#	$class = BufHDDSpindown->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufHDDSpindown;

use strict;
use JSON;

use CGI;
use BufCommonFileInfo;

sub new {
	my $class = shift;
	my $self  = bless {
		hddSpindown =>	undef
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
	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/info');
	
	$self->{hdd_spindown} = $info->get_info('hdd_spindown');
	if ($self->{hdd_spindown} eq '') {
		$self->{hdd_spindown} = 'off';
	}
	return;
}

sub getHDDSpindownSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'hddSpindown' => $self->{hdd_spindown}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setHDDSpindownSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/info');
	
	$info->set_info('hdd_spindown', $q->param('hddSpindown'));
	
	$info->save();
#	system ('/etc/init.d/xxx.sh restart 1> /dev/null 2> /dev/null &');
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
