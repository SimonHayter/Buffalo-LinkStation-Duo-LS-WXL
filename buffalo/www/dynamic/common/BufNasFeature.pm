#!/usr/bin/speedy

;################################################
;# BufNasFeature.pm
;#
;# usage :
;#	$class = new BufNasFeature;
;#	$class->init;
;#
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufNasFeature;

use BUFFALO::Common::Model;
use BufDiskInfo;
use BufCommonDevLink;
use BufCommonFileInfo;
use strict;
use JSON;

use BufDeviceserver;
use BufEyeFi;

my $gModel = BUFFALO::Common::Model->new();

sub get_all_value {
	my $self = shift;
	my @info = $gModel->get_all_value;
	my $diskinfo = BufDiskInfo->new;
	$diskinfo->init;
	my $devlink = BufCommonDevLink->new;
	$devlink->init;

	my @dataArray;
	my @errors;
	my $jsnHash;
	my $i;
	my $j;
	my $connect_disk;

	my $common_info = BufCommonFileInfo->new();
	$common_info->init('/etc/melco/info');

	push @info, 'workingmode';
	push @info, $common_info->get_info('workingmode');

	if ($gModel->is('SUPPORT_SXUPTP')) {
		my $deviceserver = BufDeviceserver->new();
		$deviceserver->init;

		push @info, 'deviceservermode';
		push @info, $deviceserver->{deviceserver};
	}

	if ($gModel->is('SUPPORT_EYEFI')) {
		my $eyefi = BufEyeFi->new();
		$eyefi->init;

		push @info, 'eyefimode';
		push @info, $eyefi->{eyefi};
	}
	
	if ($gModel->is('SUPPORT_OL_UPDATE')) {
		my $update = BufUpdate->new();
		$update->init;

		push @info, 'up_notify';
		push @info, $update->{notify};
	}

	for ($i = 0; $i < @info; $i = $i + 2) {
		if (@info[$i] eq 'SUPPORT_RAID') {
			for ($j = 1 ; $j <= $gModel->is('MAX_DISK_NUM'); $j++) {
				if (($devlink->get_connect($j)) && !($diskinfo->get_disk($j) =~ m#^remove#)) {
					$connect_disk++;
				}
			}

			if (($gModel->is('SUPPORT_HIDDEN_RAID_MENU')) && ($connect_disk <= 1)) {
				@info[$i + 1] = 'off';
			}
		}

		if (@info[$i] eq 'SUPPORT_DTCP_IP') {
			if ($gModel->is('PID') eq '0x00000012') {
				@info[$i + 1] = '0';
			}
		}

		push(@dataArray, {
			'id' => @info[$i],
			'value' => @info[$i + 1]
		});
	}

	unless (-f '/root/.files/hostname_macaddress.sparsebundle.tar.gz') {
		push(@dataArray, {
			'id' => 'SUPPORT_TIME_MACHINE_NATIVE',
			'value' => 'on'
		});
	}

	$jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
