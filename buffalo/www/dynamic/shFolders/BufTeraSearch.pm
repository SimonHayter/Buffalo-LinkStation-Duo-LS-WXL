#!/usr/bin/speedy
;#################################################
;# BufTeraSearch.pm
;# usage :
;#	$class = new BufTeraSearch;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#################################################

package BufTeraSearch;

use BufCommonFileInfo;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		chimera_service		=> undef,
		chimera_update_at	=> undef
		
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->load();
	
	return;
}

sub load {
	my $self = shift;
	my $file = BufCommonFileInfo->new();
	$file->init('/etc/melco/chimera');
	
	$self->{chimera_service} = $file->get_info('chimera_service');
	$self->{chimera_update_at} = $file->get_info('chimera_update_at');
	
	return;
}

sub getTeraSearch {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	push(@dataArray, {
		'indexSearch'	=> $self->{chimera_service},
		'indexTime'		=> $self->{chimera_update_at}
	});
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setTeraSearch {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $file = BufCommonFileInfo->new();
	$file->init('/etc/melco/chimera');
	
	$self->{chimera_service} = $cgiRequest->param('indexSearch');
	$self->{chimera_update_at}= $cgiRequest->param('indexTime');
	
	$file->set_info('chimera_service', $self->{chimera_service});
	if ($self->{chimera_service} eq 'on') {
		$file->set_info('chimera_update_at', $self->{chimera_update_at});
	}
	$file->save;
	
	system("/etc/init.d/chimera-control.sh restart 1> /dev/null 2> /dev/null &");
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub updateTeraSearch {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	system("/etc/init.d/chimera-control.sh index renew 1> /dev/null 2> /dev/null &");
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
