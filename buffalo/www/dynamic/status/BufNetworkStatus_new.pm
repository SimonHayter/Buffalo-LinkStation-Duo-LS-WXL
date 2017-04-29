#!/usr/bin/speedy
;################################################
;# BufNetworkStatus_new.pm
;# usage :
;#	$class = new BufNetworkStatus;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufNetworkStatus_new;

use BufCommonFileInfo;
use BUFFALO::Common::Model;
use BUFFALO::Network::Ip;
use BUFFALO::Network::Dns;
use BufNetworkStatus;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		mac_1 => undef,
		ipAddr_1 => undef,
		subMsk_1 => undef,
		ethFrameSize_1 => undef,
		linkSpeed_1 => undef,
		packReceived_1 => undef,
		packReceivedErr_1 => undef,
		packTransmitted_1 => undef,
		packTransmittedErr_1 => undef,

		mac_2 => undef,
		ipAddr_2 => undef,
		subMsk_2 => undef,
		ethFrameSize_2 => undef,
		linkSpeed_2 => undef,
		packReceived_2 => undef,
		packReceivedErr_2 => undef,
		packTransmitted_2 => undef,
		packTransmittedErr_2 => undef,

		gtwy => undef,
		primDns => undef,
		secDns => undef,
		portTrunk => undef

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

	my $file = BufCommonFileInfo->new;
	my $gModel = BUFFALO::Common::Model->new();

	$file->init('/etc/melco/info');

	my $ip_1;
	my $ip_2;

	if ($file->get_info('my_eth2') eq 'trunk') {
		$ip_1 = BUFFALO::Network::Ip->new('bond0');
		$ip_2 = BUFFALO::Network::Ip->new('bond0');
	}
	else {
		$ip_1 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
		$ip_2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	}

	my $dns = BUFFALO::Network::Dns->new();

	my $netinfo_1 = BufNetworkStatus->new();
	my $netinfo_2 = BufNetworkStatus->new();
	$netinfo_1->init($gModel->is('DEVICE_NETWORK_PRIMARY'));
	$netinfo_2->init($gModel->is('DEVICE_NETWORK_SECONDARY'));

	$self->{mac_1} = $ip_1->get_mac;
	$self->{ipAddr_1} = $ip_1->get_ip;
	$self->{subMsk_1} = $ip_1->get_subnet;
	$self->{ethFrameSize_1} = $ip_1->get_mtu;
	$self->{linkSpeed_1} = $netinfo_1->get_link;
	$self->{packReceived_1} = $netinfo_1->get_packet_rx;
	$self->{packReceivedErr_1} = $netinfo_1->get_errorpacket_rx;
	$self->{packTransmitted_1} = $netinfo_1->get_packet_tx;
	$self->{packTransmittedErr_1} = $netinfo_1->get_errorpacket_tx;

	$self->{mac_2} = $ip_2->get_mac;
	$self->{ipAddr_2} = $ip_2->get_ip;
	$self->{subMsk_2} = $ip_2->get_subnet;
	$self->{ethFrameSize_2} = $ip_2->get_mtu;
	$self->{linkSpeed_2} = $netinfo_2->get_link;
	$self->{packReceived_2} = $netinfo_2->get_packet_rx;
	$self->{packReceivedErr_2} = $netinfo_2->get_errorpacket_rx;
	$self->{packTransmitted_2} = $netinfo_2->get_packet_tx;
	$self->{packTransmittedErr_2} = $netinfo_2->get_errorpacket_tx;

	$self->{gtwy} = $ip_1->get_gateway;
	$self->{primDns} = ($dns->get_nameserver)[0];
	$self->{secDns} = ($dns->get_nameserver)[1];

	$self->{portTrunk} = $file->get_info('port_trunk');
	if (!$self->{portTrunk}) {
		$self->{portTrunk} = 'off';
	}

	return;
}

sub getNetworkStatus {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'mac_1' => $self->{mac_1},
		'ipAddr_1' => $self->{ipAddr_1},
		'subMsk_1' => $self->{subMsk_1},
		'ethFrameSize_1' => $self->{ethFrameSize_1},
		'linkSpeed_1' => $self->{linkSpeed_1},
		'packReceived_1' => $self->{packReceived_1},
		'packReceivedErr_1' => $self->{packReceivedErr_1},
		'packTransmitted_1' => $self->{packTransmitted_1},
		'packTransmittedErr_1' => $self->{packTransmittedErr_1},
		
		'mac_2' => $self->{mac_2},
		'ipAddr_2' => $self->{ipAddr_2},
		'subMsk_2' => $self->{subMsk_2},
		'ethFrameSize_2' => $self->{ethFrameSize_2},
		'linkSpeed_2' => $self->{linkSpeed_2},
		'packReceived_2' => $self->{packReceived_2},
		'packReceivedErr_2' => $self->{packReceivedErr_2},
		'packTransmitted_2' => $self->{packTransmitted_2},
		'packTransmittedErr_2' => $self->{packTransmittedErr_2},
		
		'gtwy' => $self->{gtwy},
		'primDns' => $self->{primDns},
		'secDns' => $self->{secDns},
		'portTrunk' => $self->{portTrunk}
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
