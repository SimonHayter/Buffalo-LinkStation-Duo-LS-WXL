#!/usr/bin/speedy
;##############################
;# BufTmnas.pm
;# 
;# usage :
;#	$class = BufTmnas->new();
;# (C) 2010 BUFFALO INC. All rights reserved.
;##############################

package BufTmnas;

use strict;
use JSON;

use BufCommonFileInfo;
use BufShareInfo;
use BufCommonFileShareInfo;
use BUFFALO::Network::Ip;
use BUFFALO::Common::Model;


sub new {
	my $class = shift;
	my $self  = bless {
		filename_tmnas	=> "/etc/melco/shareinfo.splx",
		filename_shareinfo_tmnas	=> "/etc/melco/shareinfo.splx",
		service =>	undef,
		dir		=>	undef,
		dir_win	=>	undef,
		dir_mac	=>	undef,
		port	=>	undef

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
	my $file = BufCommonFileInfo->new();
	my $file2 = BufCommonFileInfo->new();
	my $gModel = BUFFALO::Common::Model->new();

	$file->init('/etc/melco/splx');
	$file2->init('/etc/melco/info');

	$self->{service} = $file->get_info('splx');
	$self->{dir} = $file->get_info('splx_dir');
	$self->{dir} =~ s#^"##;
	$self->{dir} =~ s#"$##;

	my $folder_name = $self->{dir};
	$folder_name =~ s#^/mnt/.+/##;
	$self->{dir} = $folder_name;

	if ($folder_name eq 'TMNAS') {
		my $ip_address;
		my $ip;
		if ($file2->get_info('my_eth2') eq 'trunk') {
			$ip = BUFFALO::Network::Ip->new('bond0');
		}
		else {
			$ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
		}

		$ip_address = $ip->get_ip;
		if (!$ip_address) {
			$ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
			$ip_address = $ip->get_ip;
		}

		$self->{dir_win} = 'Windows:<br />\\\\' . $ip_address . '\\' . $folder_name . '$';
		$self->{dir_mac} = 'Macintosh:<br />smb://' . $ip_address . '/' . $folder_name . '$';
	}
	else {
		$self->{dir_win} = $folder_name;
		$self->{dir_mac} = '';
	}

	$self->{port} = $file->get_info('splx_port');

	return;
}

sub getTmnasServiceSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'service' => $self->{service},
		'dir' => $self->{dir},
		'dir_win' => $self->{dir_win},
		'dir_mac' => $self->{dir_mac},
		'port' => $self->{port}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setTmnasServiceSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $check = BufCommonDataCheck->new();
	my $file = BufCommonFileInfo->new();
	$file->init('/etc/melco/splx');

	my $service = $q->param('service');
	my $dir = $q->param('dir');

	if (@errors == 0) {
		$file->set_info('splx', $service);
		if ($service eq 'on') {
			if ($dir =~ m#^/mnt/#) {
				$dir = '"' . $dir . '"';
				$file->set_info('splx_dir', $dir);
			}
		}

		$file->save();

		system('/etc/init.d/splx restart 1> /dev/null 2> /dev/null &');
		if ($service eq 'on') {
			sleep 70;
		}
		else {
			sleep 30;
		}
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setTmnasFolderSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $name = $q->param('shareName');
	my $volume = $q->param('volume');
	my $realtime = $q->param('realtime');
	my $scheduled = $q->param('scheduled');
	my $manual = $q->param('manual');

	my $share = BufShareInfo->new();
	my $share_tmnas = BufCommonFileShareInfo->new();
	$share->init($name);
	$share_tmnas->init($self->{filename_tmnas});

	if ($name =~ m#^usbdisk[1-4]$#) {
		if (!$share_tmnas->get_key_value($name)) {
			if (!$share_tmnas->set_add_key_value(
				$name,
				$name."/..",
				$realtime,
				$scheduled,
				$manual
			)) { return 0; }
		}
		else {
			if (!$share_tmnas->set_change_key_value(
				$name,
				$name."/..",
				$realtime,
				$scheduled,
				$manual
			)) { return 0; }
		}

		$share_tmnas->save();
	}
	else {
		if (!$share_tmnas->get_key_value($name)) {
			if (!$share_tmnas->set_add_key_value(
				$name,
				$share->get_drive(),
				$realtime,
				$scheduled,
				$manual
			)) { return 0; }

			$share_tmnas->save();
		}
		else {
			$share->set_realtime($realtime);
			$share->set_scheduled($scheduled);
			$share->set_manual($manual);

			$share->save;
		}
	}

	system('/etc/init.d/splx restart 1> /dev/null 2> /dev/null &');
	if ($self->{service} eq 'on') {
		sleep 70;
	}
	else {
		sleep 30;
	}

	push (@dataArray, '');
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub initTmnasServiceSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	system('/usr/local/bin/splx_init.sh 1> /dev/null 2> /dev/null');

	push (@dataArray, '');
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
