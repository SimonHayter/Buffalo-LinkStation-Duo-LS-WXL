#!/usr/bin/speedy
;################################################
;# BufSnmp.pm
;# 
;# usage :
;#	$class = BufSnmp->new();
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufSnmp;

use strict;
use warnings;
use JSON;

use CGI;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

#my $sid;
#$sid = 999999;

sub new {
	my $class = shift;
	my $self  = bless {
		sid => 999999
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
		'login',
		RPC::XML::struct->new({
			username => 'admin',
			password => 'password'
		})
	);

	$response = $client->send_request($request);
	#$sid = $response->value->{sid};
	$self->{sid} = $response->value->{sid};

	return;
}

sub getSnmpSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $snmp = 'off';
	my $community_name = '';
	my $trap_notify = '';
	my $trap_notify_community_name_1 = '';
	my $trap_notify_ip_1 = '';
	
	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'snmp.readSnmpConf',
			RPC::XML::struct->new({
				#sid => RPC::XML::i4->new($sid)
				sid => RPC::XML::i4->new($self->{sid})
			})
		);
		
		my $response = $client->send_request($request);
		$snmp = $response->value->{snmp};
		$community_name = $response->value->{community_name};
		$trap_notify = $response->value->{trap_notify};
		$trap_notify_community_name_1 = $response->value->{trap_notify_community_name_1};
		$trap_notify_ip_1 = $response->value->{trap_notify_ip_1};
	}
	
	push (@dataArray, {
		'snmp' => $snmp,
		'community_name' => $community_name,
		'trap_notify' => $trap_notify,
		'trap_notify_community_name_1' => $trap_notify_community_name_1,
		'trap_notify_ip_1' => $trap_notify_ip_1
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setSnmpSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $snmp = $q->param('snmp');
	my $community_name = $q->param('community_name');
	my $trap_notify = $q->param('trap_notify');
	my $trap_notify_community_name_1 = $q->param('trap_notify_community_name_1');
	my $trap_notify_ip_1 = $q->param('trap_notify_ip_1');
	
	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'snmp.writeSnmpConf',
			RPC::XML::struct->new({
				#sid => RPC::XML::i4->new($sid),
				sid => RPC::XML::i4->new($self->{sid}),
				snmp => RPC::XML::string->new($snmp),
				community_name => RPC::XML::string->new($community_name),
				trap_notify => RPC::XML::string->new($trap_notify),
				trap_notify_community_name_1 => RPC::XML::string->new($trap_notify_community_name_1),
				trap_notify_ip_1 => RPC::XML::string->new($trap_notify_ip_1)
			})
		);
		
		my $response = $client->send_request($request);
		if ($response->is_fault) {
			push @errors, $response->value->{faultString};
		}
		
		if ($response->value->{status}) {
			for (my $i = 0; $i < @{$response->value->{error}}; $i++) {
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
