#!/usr/bin/speedy
;################################################
;# BufEFS.pm
;# usage :
;#	$class = new BufEFS;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################


package BufEFS;

use BUFFALO::Network::Ip;
use BufCommonFileInfo;

use strict;
use JSON;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

sub new {
	my $class = shift;
	my $self  = bless {
		mtu  => undef,
		mtu2 => undef
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
	my $ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	my $ip_2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');
	
	$self->{mtu} = $ip->get_mtu;
	if ($file->get_info('my_eth2') ne 'on') {
		$self->{mtu2} = 'disabled';
	}
	else {
		if (!$ip_2->get_mtu) {
			$self->{mtu2} = '1518';
		}
		else {
			$self->{mtu2} = $ip_2->get_mtu;
		}
	}
	
	return;
}

sub getEFS_settings {
	my $self  = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $dataHash = {
		'ethFrameSize_1' => $self->{mtu},
		'ethFrameSize_2' => $self->{mtu2}
	};
	
	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

sub setEFS_settings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	my $ip_2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	my $mtu;
	my $mtu2;
	
	$mtu = $cgiRequest->param('ethFrameSize_1');
	$mtu2 = $cgiRequest->param('ethFrameSize_2');
	
	$ip->set_mtu($mtu);
	$ip->save;
	
	if ($mtu2) {
		$ip_2->set_mtu($mtu2);
		$ip_2->save;
	}
	
	system('/usr/local/bin/change_notify.sh network 1> /dev/null 2> /dev/null &');
	system('/etc/init.d/networking.sh restart 1> /dev/null 2> /dev/null &');
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
