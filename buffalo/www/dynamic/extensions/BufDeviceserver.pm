#!/usr/bin/speedy
;##############################
;# BufDeviceserver.pm
;# 
;# usage :
;#  $class = BufDeviceserver->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufDeviceserver;

use strict;
use JSON;
use CGI;

#use BUFFALO::PrintServer::Windows;
use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

my $sid;
$sid = 999999;

sub new {
	my $class = shift;
	my $self  = bless {
		deviceserver => undef
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
	
	my $client;
	my $request;
	my $response;

	$client = RPC::XML::Client->new('http://localhost:8888/');

	$request = RPC::XML::request->new(
		'sxuptp.getInfo',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($sid)
		})
	);
	$response = $client->send_request($request);

	$self->{deviceserver} = $response->value->{enable};
	if ($self->{deviceserver}) {
		$self->{deviceserver} = 'on';
	}
	else {
		$self->{deviceserver} = 'off';
	}

	return;
}

sub getDeviceserverSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'deviceserver' => $self->{deviceserver}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setDeviceserverSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;

	my $check = BufCommonDataCheck->new();

	my $deviceserver = $q->param('deviceserver');
	if ($deviceserver eq 'on') {
		$deviceserver = 1;
	}
	else {
		$deviceserver = 0;
	}

	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $apiarg;
		if ($deviceserver) {
			$apiarg = RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				enable => RPC::XML::boolean->new($deviceserver)
			});
		}
		else {
			$apiarg = RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				enable => RPC::XML::boolean->new($deviceserver)
			});
		}

		my $request = RPC::XML::request->new(
			'sxuptp.setInfo',
			$apiarg
		);

		my $response = $client->send_request($request);

		if ($response->is_fault) {
			push @errors, $response->value->{faultString};
		}

		if ($response->value->{status}) {
			for ($i = 0; $i < @{$response->value->{error}}; $i++) {
				push @errors, $response->value->{error}->[$i];
			}
		}
	}
	
	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;





=pod
sub new {
	my $class = shift;
	my $self  = bless {
		deviceserver =>  undef,
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
#	my $windows = BUFFALO::DeviceServer::Windows->new();
	
#	$self->{deviceserver} = $windows->get_status();
	if ($self->{deviceserver} eq '') {
		$self->{deviceserver} = 'on';
	}
	return;
}

sub getDeviceserverSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'deviceserver' => $self->{deviceserver}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setDeviceserverSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $windows = BUFFALO::DeviceServer::Windows->new();

	$windows->set_status($q->param('deviceserver'));
	$windows->save();
	
	system ("/etc/init.d/smb.sh restart 1>/dev/null 2>/dev/null &");
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub delDeviceserverJob {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $windows = BUFFALO::DeviceServer::Windows->new();
	
	$windows->set_remove_queue();
	
	push (@dataArray, '');
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}
=cut

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

