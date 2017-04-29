#!/usr/bin/speedy
;##############################
;# BufSecurity.pm
;# 
;# usage :
;#	$class = BufSecurity->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufSecurity;

use strict;
use JSON;

use CGI;
use BufCommonFileInfo;

sub new {
	my $class = shift;
	my $self  = bless {
		clientutility =>  undef,
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
	
	$self->{clientutility} = $info->get_info('clientutility');
	if ($self->{clientutility} eq '') {
		$self->{clientutility} = 'on';
	}
	return;
}

sub getSecuritySettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'clientutility' => $self->{clientutility}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setSecuritySettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/info');
	
	$info->set_info('clientutility', $q->param('clientutility'));
	
	$info->save();
	system ('/etc/init.d/clientUtil_servd.sh restart 1> /dev/null 2> /dev/null &');
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
