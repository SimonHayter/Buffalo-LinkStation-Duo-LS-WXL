#!/usr/bin/speedy
;#############################################
;# BufServices.pm
;# usage :
;#	$class = new BufServices;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;#############################################

package BufServices;

use BufCommonFileInfo;
use BufCommonFileShareInfo;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self;

	my @service_name;

	if ($gModel->is('SUPPORT_SERVICE_MAPPING')) {
		@service_name = (
			'webui',
			'webui_ssl',
			'samba',
			'atalk',
			'ftp',
			'backup',
			'clientutility'
		);

		# NFS
		if ($gModel->is('SUPPORT_NFS')) {
			push @service_name, 'nfs';
		}

		# SFTP
		if ($gModel->is('SUPPORT_SFTP')) {
			push @service_name, 'sftp';
		}

		# Webアクセス
		if ($gModel->is('SUPPORT_WEBAXS')) {
			push @service_name, 'webaxs';
		}

		# TeraSearch
		if ($gModel->is('SUPPORT_TERA_SEARCH')) {
			push @service_name, 'chimera';
		}

		# 電源連動
		if ($gModel->is('SUPPORT_POWER_INTERLOCK')) {
			push @service_name, 'pwrmgr';
		}

		# DLNAサーバー
		if ($gModel->is('SUPPORT_DLNA_SERVER')) {
			push @service_name, 'twonky';
		}

		# iTunesサーバー
		if ($gModel->is('SUPPORT_ITUNES_SERVER')) {
			push @service_name, 'itunes';
		}

		# BitTorrent
		if ($gModel->is('SUPPORT_BITTORRENT')) {
			push @service_name, 'bittorrent';
		}
	}
	else {
		@service_name = (
			'atalk',
			'ftp'
		);
	}

	$self = bless {
			serviceName => [
				@service_name
			],
			eth1 => [],
			eth2 => []
	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $key = shift;
	
	$self->load();
	
	return;
}

sub load {
	my $self = shift;
	my $cnt = @{$self->{serviceName}};
	my $i;
	my $value;
	my @value = ();
	
	# 初期化
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');

	my $fileshare = BufCommonFileShareInfo->new;
	$fileshare->init('/etc/melco/service_ports');
	
	for ($i=0; $i<$cnt; $i++) {
		$value = $file->get_info($self->{serviceName}->[$i]);
		
		# ethが1つの時
		if ($gModel->is('DEVICE_NETWORK_NUM') == 1) {
			if ($value eq 'on') {
				$self->{eth1}->[$i] = 'on';
			}
			else {
				$self->{eth1}->[$i] = 'off';
			}
		}
		# それ以外
		else {
			@value = $fileshare->get_key_value($self->{serviceName}->[$i]);

			if ($value[1]) {
				$self->{eth1}->[$i] = 'on';
			}
			else {
				$self->{eth1}->[$i] = 'off';
			}

			if ($value[2]) {
				$self->{eth2}->[$i] = 'on';
			}
			else {
				$self->{eth2}->[$i] = 'off';
			}

			if ($self->{serviceName}->[$i] eq 'clientutility') {
				if ($value eq 'off') {
					$self->{eth1}->[$i] = 'off';
					$self->{eth2}->[$i] = 'off';
				}
			}
			elsif (($self->{serviceName}->[$i] eq 'atalk') || ($self->{serviceName}->[$i] eq 'ftp')) {
				if ($value ne 'on') {
					$self->{eth1}->[$i] = 'off';
					$self->{eth2}->[$i] = 'off';
				}
			}
		}
	}

	return;
}

sub getServicesList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{serviceName}};
	my $i;

	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');
	if ($file->get_info('my_eth2') eq 'trunk') {
		for ($i = 0; $i < $cnt; $i++) {
			push (@dataArray, {
				'serviceName' => $self->{serviceName}->[$i],
				'eth1' => $self->{eth1}->[$i],
				'eth2' => 'trunk'
			});
		}
	}
	elsif (!$file->get_info('my_eth2')) {
		for ($i = 0; $i < $cnt; $i++) {
			push (@dataArray, {
				'serviceName' => $self->{serviceName}->[$i],
				'eth1' => $self->{eth1}->[$i],
				'eth2' => 'disable'
			});
		}
	}
	else {
		for ($i = 0; $i < $cnt; $i++) {
			push (@dataArray, {
				'serviceName' => $self->{serviceName}->[$i],
				'eth1' => $self->{eth1}->[$i],
				'eth2' => $self->{eth2}->[$i]
			});
		}
	}
	
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setServicesSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my @get_value = ();
	my @set_value = ();

	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');

	my $fileshare = BufCommonFileShareInfo->new;
	$fileshare->init('/etc/melco/service_ports');

	my $serviceName = $cgiRequest->param('serviceName');
	my $eth1 = $cgiRequest->param('eth1');
	my $eth2 = $cgiRequest->param('eth2');

	if ($gModel->is('SUPPORT_SERVICE_MAPPING')) {
		# Web設定関連は、完全OFFにはできない
		# イーサネット2 有効時
		if ($file->get_info('my_eth2') eq 'on') {
			if ($serviceName eq 'webui') {
				if (($eth1 eq 'off') && ($eth2 eq 'off')) {
					@get_value = $fileshare->get_key_value('webui_ssl');
					if ((!$get_value[1]) && (!$get_value[2])) {
						push @errors, 'net_settings_service_err1';
					}
				}
			}
			if ($serviceName eq 'webui_ssl') {
				if (($eth1 eq 'off') && ($eth2 eq 'off')) {
					@get_value = $fileshare->get_key_value('webui');
					if ((!$get_value[1]) && (!$get_value[2])) {
						push @errors, 'net_settings_service_err1';
					}
				}
			}
		}

		# イーサネット2 無効時
		if (!$file->get_info('my_eth2')) {
			if ($serviceName eq 'webui') {
				if ($eth1 eq 'off') {
					@get_value = $fileshare->get_key_value('webui_ssl');
					if (!$get_value[1]) {
						push @errors, 'net_settings_service_err1';
					}
				}
			}
			if ($serviceName eq 'webui_ssl') {
				if ($eth1 eq 'off') {
					@get_value = $fileshare->get_key_value('webui');
					if (!$get_value[1]) {
						push @errors, 'net_settings_service_err1';
					}
				}
			}
		}

		# ポートトランキング使用時
		if ($gModel->is('SUPPORT_PORT_TRUNKING')) {
			if ($file->get_info('my_eth2') eq 'trunk') {
				if ($serviceName eq 'webui') {
					if ($eth1 eq 'off') {
						@get_value = $fileshare->get_key_value('webui_ssl');
						if (!$get_value[1]) {
							push @errors, 'net_settings_service_err1';
						}
					}
				}
				if ($serviceName eq 'webui_ssl') {
					if ($eth1 eq 'off') {
						@get_value = $fileshare->get_key_value('webui');
						if (!$get_value[1]) {
							push @errors, 'net_settings_service_err1';
						}
					}
				}
			}
		}
	}

	if (@errors == 0) {
		# eth 1基
		if ($gModel->is('DEVICE_NETWORK_NUM') == 1) {
			if ($eth1 eq 'on') {
				$file->set_info($serviceName, 'on');
			}
			else {
				$file->set_info($serviceName, 'off');
			}

			# 設定ファイルへ保存
			$file->save();
		}
		# eth 2基
		else {
			if ($eth1 eq 'on') {
				$eth1 = '1';
			}
			else {
				$eth1 = '0';
			}

			if ($eth2 eq 'on') {
				$eth2 = '1';
			}
			else {
				$eth2 = '0';
			}

			# 設定ファイルへ保存
			@set_value = ($serviceName, $eth1, $eth2);
			$fileshare->set_change_key_value(@set_value);
			$fileshare->save();

			# /etc/melco/info にも書く必要がある特別なサービス
			if ($serviceName eq 'atalk') {
				if ((!$eth1) && (!$eth2)) {
					$file->set_info('atalk', 'off');
				}
				else {
					$file->set_info('atalk', 'on');
				}
				$file->save();
			}
			elsif ($serviceName eq 'ftp') {
				if ((!$eth1) && (!$eth2)) {
					$file->set_info('ftp', 'off');
				}
				else {
					$file->set_info('ftp', 'on');
				}
				$file->save();
			}
			elsif ($serviceName eq 'clientutility') {
				if ((!$eth1) && (!$eth2)) {
					$file->set_info('clientutility', 'off');
				}
				else {
					$file->set_info('clientutility', 'on');
				}
				$file->save();
			}
		}

		# /etc/melco/info にも書く必要がある特別なサービス
		# 再起動
		if ($serviceName eq 'atalk') {
			system ("/etc/init.d/atalk.sh restart 1>/dev/null 2>/dev/null &");
		}
		elsif ($serviceName eq 'ftp') {
			system ("/etc/init.d/ftpd.sh restart 1>/dev/null 2>/dev/null &");
		}
		elsif ($serviceName eq 'clientutility') {
			system ("/etc/init.d/clientUtil_servd.sh restart 1>/dev/null 2>/dev/null &");
		}

		if ($gModel->is('DEVICE_NETWORK_NUM') != 1) {
			# iptablesへの反映
			my $pid = fork;
			if (!defined $pid) {
				die "[BufServices]Fork Error\n";
			}
			elsif (!$pid) {
				if (($serviceName eq 'webui') || ($serviceName eq 'webui_ssl')) {
					sleep 5;
				}
				system ("/etc/init.d/firewall.sh restart 1>/dev/null 2>/dev/null &");
				exit;
			}
		}
	}
	
	my $jsnHash = {
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
