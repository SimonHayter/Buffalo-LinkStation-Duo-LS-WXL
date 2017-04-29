#!/usr/bin/speedy
;################################################
;# BufWebServer.pm
;# 
;# usage :
;#	$class = BufWebServer->new();
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufWebServer;

use strict;
use JSON;
use CGI;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

my $sid;
$sid = 999999;

sub new {
	my $class = shift;
	my $self  = bless {
		webserver => undef,
		port => undef,
		target => undef,
		target_real => undef
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

=pod
	$request = RPC::XML::request->new(
		'login',
		RPC::XML::struct->new({
			username => 'admin',
			password => 'password'
		})
	);

	$response = $client->send_request($request);
	$sid = $response->value->{sid};
=cut

	$request = RPC::XML::request->new(
		'httpd.getInfo',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($sid)
		})
	);
	$response = $client->send_request($request);

	$self->{webserver} = $response->value->{enable};
	if ($self->{webserver}) {
		$self->{webserver} = 'on';
	}
	else {
		$self->{webserver} = 'off';
	}

	$self->{port} = $response->value->{port};

	$self->{target} = $response->value->{datadir};
	$self->{target_real} = $self->{target};
	$self->{target} =~ s#^/mnt/.+?/##;
	$self->{target} =~ s#^/mnt/##;

	return;
}

sub getWebserverSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'webserver' => $self->{webserver},
		'port' => $self->{port},
		'target' => $self->{target},
		'target_real' => $self->{target_real}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setWebserverSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;

	my $check = BufCommonDataCheck->new();


	my $webserver = $q->param('webserver');
	if ($webserver eq 'on') {
		$webserver = 1;
	}
	else {
		$webserver = 0;
	}

	my $port = $q->param('port');
	my $target = $q->param('target');
	my $target_real = $q->param('target_real');

#	unless ($target =~ m#^/mnt/.+?/#) {
	unless ($target =~ m#^/mnt/#) {
		$target = $target_real;
	}

	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $apiarg;
		if ($webserver) {
			$apiarg = RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				enable => RPC::XML::boolean->new($webserver),
				port => RPC::XML::i4->new($port),
				datadir => RPC::XML::string->new($target)
			});
		}
		else {
			$apiarg = RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				enable => RPC::XML::boolean->new($webserver)
			});
		}

		my $request = RPC::XML::request->new(
			'httpd.setInfo',
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
