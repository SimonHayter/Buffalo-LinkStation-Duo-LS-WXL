#!/usr/bin/speedy
;################################################
;# BufPortTrunking.pm
;# usage :
;#	$class = new BufPortTrunking;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################


package BufPortTrunking;

use BufCommonFileInfo;

use strict;
use JSON;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

sub new {
	my $class = shift;
	my $self  = bless {
		port_trunk => undef
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
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');
	
	$self->{port_trunk} = $file->get_info('port_trunk');
	if ($file->get_info('my_eth2') eq 'off') {
		$self->{port_trunk} = 'disabled';
	}
	elsif ($self->{port_trunk} eq '') {
		$self->{port_trunk} = 'off';
	}
	
	return;
}

sub getPortTrunkingSettings {
	my $self  = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $dataHash = {
		'portTrunkMode' => $self->{port_trunk}
	};
	
	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

sub setPortTrunkingSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');
	my $mode;
	
	$mode = $cgiRequest->param('portTrunkMode');
	
	$file->set_info('port_trunk', $mode);
	if ($mode ne 'off') {
		$file->set_info('my_eth2', 'trunk');
	}
	else {
		$file->set_info('my_eth2', 'on');
	}
	
	$file->save();

	# iptables設定の初期化/反映
	system ("/etc/init.d/firewall.sh init 1>/dev/null 2>/dev/null");
	system ("/etc/init.d/firewall.sh restart 1>/dev/null 2>/dev/null &");

	system('/usr/local/bin/change_notify.sh network 1> /dev/null 2> /dev/null &');
	system('/etc/init.d/networking.sh restart 1> /dev/null 2> /dev/null &');
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
