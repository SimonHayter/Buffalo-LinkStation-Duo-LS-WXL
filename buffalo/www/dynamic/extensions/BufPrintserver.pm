#!/usr/bin/speedy
;##############################
;# BufPrintserver.pm
;# 
;# usage :
;#	$class = BufPrintserver->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufPrintserver;

use strict;
use JSON;

use CGI;
use BUFFALO::PrintServer::Windows;


sub new {
	my $class = shift;
	my $self  = bless {
		printserver =>	undef,
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
	my $windows = BUFFALO::PrintServer::Windows->new();
	
	$self->{printserver} = $windows->get_status();
	if ($self->{printserver} eq '') {
		$self->{printserver} = 'on';
	}
	return;
}

sub getPrintserverSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'printserver' => $self->{printserver}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setPrintserverSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $windows = BUFFALO::PrintServer::Windows->new();

	$windows->set_status($q->param('printserver'));
	$windows->save();
	
	system ("/etc/init.d/smb.sh restart 1>/dev/null 2>/dev/null &");
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub delPrintserverJob {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $windows = BUFFALO::PrintServer::Windows->new();
	
	$windows->set_remove_queue();
	
	push (@dataArray, '');
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

#sub restartPrintserverJob {
#	my $self = shift;
#	my @errors = ();
#	my @dataArray = ();
#	
#	my $windows = BUFFALO::PrintServer::Windows->new();
#	
#	$windows->restart_server();
#	
#	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
#	return to_json($jsnHash);
#}

1;
