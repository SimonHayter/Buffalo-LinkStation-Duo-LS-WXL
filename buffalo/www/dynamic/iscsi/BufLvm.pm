#!/usr/bin/speedy
;################################################
;# BufLvm.pm
;# 
;# usage :
;#	$class = BufLvm->new();
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufLvm;

use strict;
use JSON;

use CGI;
use BufVolumeListInfo;
use BufiSCSIDisksInfo;
use BufCommonDevLink;

sub new {
	my $class = shift;
	my $self  = bless {
		disk => [],
		lvm_status => [],
		real_path => [],
		size => [],
		remain => []

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
	my $volumelist_info = BufVolumeListInfo->new();
	my $iscsi_disks_info = BufiSCSIDisksInfo->new();
	my $devlink = BufCommonDevLink->new();

	$volumelist_info->init();
	$iscsi_disks_info->init();
	$devlink->init();

	my $i;
	my $j;
	my $flag;

	@{$self->{disk}} = $volumelist_info->get_pv_dev();
	@{$self->{lvm_status}} = $volumelist_info->get_pv_vg_name();
	@{$self->{size}} = $volumelist_info->get_pv_total_pe();
	@{$self->{remain}} = $volumelist_info->get_pv_free_pe();
	my @pv_size = $volumelist_info->get_pv_size;
	my @path = $iscsi_disks_info->get_path;

	for ($i = 0; $i < @{$self->{disk}}; $i++) {
		if (${$self->{lvm_status}}[$i]) {
			${$self->{real_path}}[$i] = ${$self->{lvm_status}}[$i];
			${$self->{lvm_status}}[$i] = 'on';
		}
		else {
			$flag = 0;

			${$self->{real_path}}[$i] = ${$self->{disk}}[$i];
			${$self->{lvm_status}}[$i] = 'off';
			${$self->{size}}[$i] = sprintf("%d", $pv_size[$i] / 1024 / 1024);

			for ($j = 1; $j < @path; $j++) {
				if ($path[$j][0] eq ${$self->{disk}}[$i]) {
					${$self->{remain}}[$i] = 0;
					$flag = 1;
				}
			}
			if (!$flag) {
				${$self->{remain}}[$i] = ${$self->{size}}[$i];
			}
		}

		${$self->{disk}}[$i] = $devlink->get_string_from_dev(${$self->{disk}}[$i]);

	}

	return;
}

sub getLvmList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $i;

	for ($i = 0; $i < @{$self->{disk}}; $i++) {
		if (${$self->{disk}}[$i]) {
			push (@dataArray, {
				'disk' => ${$self->{disk}}[$i],
				'real_path' => ${$self->{real_path}}[$i],
				'lvm_status' => ${$self->{lvm_status}}[$i],
				'size' => ${$self->{size}}[$i],
				'remain' => ${$self->{remain}}[$i]
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

sub setLvmSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $error = 0;

	my $key = $q->param('disk');
	if ($q->param('status') eq 'enable') {
		system("/usr/local/bin/lvm_control.sh LibLvmChangeLVM $key 1>/dev/null 2>/dev/null");
	}
	else {
		system("/usr/local/bin/lvm_control.sh LibLvmChangeRaw $key 1>/dev/null 2>/dev/null");
	}
	$error = $? >> 8;
	if ($error) {
		push @errors, '<!--BUF_STATIC_HTML_VOLUME_ERROR_VOLUME_SUBMIT_DELETE_LVM-->';
	}

	system ("/usr/local/bin/lvm_control.sh LibLvmShowDev_list 1>/dev/null 2>/dev/null");

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
