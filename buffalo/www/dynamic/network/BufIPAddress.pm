#!/usr/bin/speedy
;################################################
;# BufIPAddress.pm
;# usage :
;#	$class = new BufIPAddress;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufIPAddress;

use BUFFALO::Network::Ip;
use BUFFALO::Network::Dns;
use BufCommonDataCheck;
use BufCommonFileInfo;
use BufCommonFileShareInfo;
use BufModulesInfo;
require 'dynamic/common/global_init_system.pl';

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use strict;
use JSON;

use lib "/www/buffalo/www/dynamic/extensions/webaxs";
use WebAxsConfig;

my $modules = BufModulesInfo->new();
$modules->init();

sub new {
	my $class = shift;
	my $self = bless {
		eth_1 => undef,
		dhcpStatus_1 => undef,
		ipAddr_1 => undef,
		subNetMsk_1 => undef,

		eth_2 => undef,
		dhcpStatus_2 => undef,
		ipAddr_2 => undef,
		subNetMsk_2 => undef,

		gtwy => undef,
		primDns => undef,
		secDns => undef,

		wol => undef

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
	my $ip;

	if ($file->get_info('my_eth2') eq 'trunk') {
		$ip = BUFFALO::Network::Ip->new('bond0');
	}
	else {
		$ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	}
	my $dns = BUFFALO::Network::Dns->new();

	$self->{eth_1} = 'on';
	$self->{dhcpStatus_1} = $ip->get_status;
	$self->{ipAddr_1} = $ip->get_ip;
	$self->{subNetMsk_1} = $ip->get_subnet;

	# eth2がある場合
	if ($gModel->is('DEVICE_NETWORK_NUM') != 1) {
		my $my_eth2 = $file->get_info('my_eth2');
		$self->{eth_2} = $my_eth2;

		my $ip_2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
		$self->{dhcpStatus_2} = $ip_2->get_status;
		$self->{ipAddr_2} = $ip_2->get_ip;
		$self->{subNetMsk_2} = $ip_2->get_subnet;
	}

	$self->{gtwy} = $ip->get_gateway;
	$self->{primDns} = ($dns->get_nameserver)[0];
	$self->{secDns} = ($dns->get_nameserver)[1];

	$self->{wol} = $file->get_info('wol');
	if (!$self->{wol}) {
		$self->{wol} = "off";
	}

	return;
}

sub getIP_settings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dataHash = {
		'eth_1' => $self->{eth_1},
		'dhcpStatus_1' => $self->{dhcpStatus_1},
		'ipAddr_1' => $self->{ipAddr_1},
		'subMsk_1' => $self->{subNetMsk_1},

		'eth_2' => $self->{eth_2},
		'dhcpStatus_2' => $self->{dhcpStatus_2},
		'ipAddr_2' => $self->{ipAddr_2},
		'subMsk_2' => $self->{subNetMsk_2},

		'gtwy' => $self->{gtwy},
		'primDns' => $self->{primDns},
		'secDns' => $self->{secDns},

		'wol' => $self->{wol}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setIP_settings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $result = 0;

	my $ip;
	my $dns = BUFFALO::Network::Dns->new();
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');
	if ($file->get_info('my_eth2') eq 'trunk') {
		$ip = BUFFALO::Network::Ip->new('bond0');
	}
	else {
		$ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	}

	require 'dynamic/common/global_init_system.pl';

	# eth1
	my $dhcpStatus_1 = $cgiRequest->param('dhcpStatus_1');
	my $ipAddr_1 = $cgiRequest->param('ipAddr_1');
	my $subNet_1 = $cgiRequest->param('subMsk_1');

	# eth2
	my $eth_2 = $cgiRequest->param('eth_2');
	my $dhcpStatus_2 = $cgiRequest->param('dhcpStatus_2');
	my $ipAddr_2 = $cgiRequest->param('ipAddr_2');
	my $subNet_2 = $cgiRequest->param('subMsk_2');

	my $gtwy = $cgiRequest->param('gtwy');
	my $primDns = $cgiRequest->param('primDns');
	my $secDns = $cgiRequest->param('secDns');

	my $wol = $cgiRequest->param('wol');

	my @errors = validate_Data($cgiRequest);
	print to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});

	if (@errors == 0) {
		if ($dhcpStatus_1 eq 'static') {
			my @list = ( $primDns, $secDns );
			$dns->set_nameserver(@list);
		}
		else {
			$dns->set_nameserver('', '');
		}
		$dns->save;

		$ip->set_status($dhcpStatus_1); 
		$ip->set_ip($ipAddr_1);
		$ip->set_subnet($subNet_1);
		$ip->set_gateway($gtwy);
		$ip->save;

		# eth2がある場合
		if ($gModel->is('DEVICE_NETWORK_NUM') != 1) {
			my $file2 = BufCommonFileInfo->new;
			$file2->init('/etc/melco/info');
			if ($file2->get_info('my_eth2') ne 'trunk') {
				$file2->set_info('my_eth2', $eth_2);
				$file2->save;
			}

			if ($eth_2 eq 'on') {
				my $ip_2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
				$ip_2->set_status($dhcpStatus_2); 
				$ip_2->set_ip($ipAddr_2);
				$ip_2->set_subnet($subNet_2);
				$ip_2->save;
			}
		}

		my $file3 = BufCommonFileInfo->new;
		$file3->init('/etc/melco/info');
		$file3->set_info('wol', $wol);
		$file3->save;

		readpipe('/usr/local/bin/change_notify.sh network');
		&init_network();
		&init_filesystem();

		if ($gModel->is('SUPPORT_WOL')) {
			&init_wol();
		}
	}

	$modules->exec_trigger('ip_edit');

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	$webaxs->restartWebAxs();

	return;
}

sub validate_Data {
	my $cgiRequest = shift;
	my @errors = ();
	my $check = BufCommonDataCheck->new();

	# Get the values from GUI
	my $dhcpStatus_1 = $cgiRequest->param('dhcpStatus_1');
	my $ipAddr_1 = $cgiRequest->param('ipAddr_1');
	my $subNet_1 = $cgiRequest->param('subMsk_1');

	my $eth_2 = $cgiRequest->param('eth_2');
	my $dhcpStatus_2 = $cgiRequest->param('dhcpStatus_2');
	my $ipAddr_2 = $cgiRequest->param('ipAddr_2');
	my $subNet_2 = $cgiRequest->param('subMsk_2');

	my $gtwy = $cgiRequest->param('gtwy');
	my $primDns = $cgiRequest->param('primDns');
	my $secDns = $cgiRequest->param('secDns');

	if ($dhcpStatus_1 eq 'static') {
		$check->init($ipAddr_1);
		if (!$check->check_ip) {
			push @errors, "ip_err1";
		}

		if (!$check->check_ip_subnet($ipAddr_1, $subNet_1)) {
			push @errors, "ip_err2";
		}

		$check->init($subNet_1);
		if (!$check->check_subnet()) {
			push @errors, "ip_err2";
		}

		if ($gtwy) {
			$check->init($gtwy);
			if( !$check->check_ip ) {
				push @errors, "ip_err3";
			}
		}

		if ($primDns) {
			$check->init($primDns);
			if( !$check->check_ip ) {
				push @errors, "ip_err4";
			}
		}

		if ($secDns) {
			$check->init($secDns);
			if( !$check->check_ip ) {
				push @errors, "ip_err5";
			}
		}
	}

	if ($eth_2 eq 'on') {
		if ($dhcpStatus_2 eq 'static') {
			$check->init($ipAddr_2);
			if (!$check->check_ip) {
				push @errors, "ip_err1";
			}

			if (!$check->check_ip_subnet($ipAddr_2, $subNet_2)) {
				push @errors, "ip_err2";
			}

			$check->init($subNet_2);
			if (!$check->check_subnet()) {
				push @errors, "ip_err2";
			}

			if ($dhcpStatus_1 eq 'static') {
				if ($ipAddr_1 eq $ipAddr_2) {
					push @errors, "ip_err6";
				}
			}
		}
	}
	else {
		if ($gModel->is('SUPPORT_SERVICE_MAPPING')) {
			my $fileshare = BufCommonFileShareInfo->new;
			$fileshare->init('/etc/melco/service_ports');

			my @get_value_webui = $fileshare->get_key_value('webui');
			my @get_value_webui_ssl = $fileshare->get_key_value('webui_ssl');

			if ((!$get_value_webui[1]) && (!$get_value_webui_ssl[1])) {
				push @errors, 'ip_err7';
			}
		}
	}

	return @errors;
}

1;
