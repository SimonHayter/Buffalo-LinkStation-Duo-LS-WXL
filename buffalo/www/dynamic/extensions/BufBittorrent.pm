#!/usr/bin/speedy
;################################################
;# BufBittorrent.pm
;# 
;# usage :
;#	$class = BufBittorrent->new();
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufBittorrent;

use strict;
use JSON;

use CGI;
use BufCommonFileInfo;
use BufDiskDf;

my $info = BufCommonFileInfo->new();

sub new {
	my $class = shift;
	my $self  = bless {
		bittorrent_status => undef,
		bittorrent_dir => undef

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
	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/bittorrent');

	$self->{bittorrent_status} = $info->get_info('bittorrent_status');
	if ($self->{bittorrent_status} eq '') {
		$self->{bittorrent_status} = 'off';
	}
	$self->{bittorrent_dir} = $info->get_info('bittorrent_dir');

	if ($self->{bittorrent_dir} !~ m#/mnt/usbdisk[1-4]#) {
		$self->{bittorrent_dir} =~ s#/mnt/.*?/##;
	}
	else {
		$self->{bittorrent_dir} =~ s#/mnt/##;
	}
	$self->{bittorrent_dir} =~ s#/$##;
	$self->{bittorrent_dir} =~ s#"##g;

	return;
}

sub getBittorrentSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'bittorrent_status' => $self->{bittorrent_status},
		'bittorrent_dir'	=> $self->{bittorrent_dir}
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setBittorrentSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/bittorrent');

	$info->set_info('bittorrent_status' ,$q->param('bittorrent'));
	if ($q->param('bittorrent') eq 'on') {
		if ($q->param('bittorrent_dir') =~ m#^/mnt/#) {
			$info->set_info('bittorrent_dir', '"'.$q->param('bittorrent_dir').'"');
		}
	}

	$info->save();
	system('/etc/init.d/bittorrent.sh restart 1> /dev/null 2> /dev/null &');

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getBittorrentFolders {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	use BufDiskInfo;
	use BufShareListInfo;
	use BufUsbStorageListInfo;
	use BufCommonBDU;

	my $disk = BufDiskInfo->new;
	my $share_list = BufShareListInfo->new;
	my $usbshare_list = BufShareListInfo->new;
	my $usbdisk_status = BufUsbStorageListInfo->new;
	my $bdu = BufCommonBDU->new;

	$disk->init;
	$share_list->init;
	$usbshare_list->init('usb');
	$usbdisk_status->init;

	my @share = $share_list->get_name;
	my @drive = $share_list->get_drive;
	my @usbshare = $usbshare_list->get_name;
	my @usbdrive = $usbshare_list->get_drive;
	my @usbdisk_guid = $usbdisk_status->get_guid;
	my @share_bdu;
	my $usb_guid;
	my @data;

	my $i;
	my $j;

	for ($i = 0; $i < @share; $i++) {
		push(@dataArray, {
			'opt' => $share[$i],
			'val' => '/mnt/'.$drive[$i].'/'.$share[$i]
		});

		$bdu->init('/mnt/'.$drive[$i].'/'.$share[$i]);
		@share_bdu = $bdu->get_bdu_list;

		for ($j=0; $j<@share_bdu; $j++) {
			if (length($share[$i].'/'.$share_bdu[$j]) > 80) {
				next;
			}

			if ($share_bdu[$j] eq 'usbdisk1') {
				if (!system ('test -L '.'/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]) & 127) {
					next;
				}
			}

			push(@dataArray, {
				'opt' => $share[$i].'/'.$share_bdu[$j],
				'val' => '/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]
			});
		}
	}

	my $df = BufDiskDf->new;
	$df->init;

	for ($i = 0; $i < @usbshare; $i++) {
=pod
		if ($usbshare[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
		elsif ($usbshare[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
		elsif ($usbshare[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
		elsif ($usbshare[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
		else { $usb_guid = ""; }

		if ($usb_guid) {
=cut

		my $status = $df->get_status_mntpoint('/mnt/'.$usbshare[$i]);
		if ($status ne "unmount") {
			push(@dataArray, {
				'opt' => $usbshare[$i],
				'val' => '/mnt/'.$usbshare[$i]
			});

			$bdu->init('/mnt/'.$usbshare[$i]);
			@share_bdu = $bdu->get_bdu_list;
			for ($j=0; $j<@share_bdu; $j++) {
				if (length($usbshare[$i].'/'.$share_bdu[$j]) > 80) {
					next;
				}

				push(@dataArray, {
					'opt' => $usbshare[$i].'/'.$share_bdu[$j],
					'val' => '/mnt/'.$usbshare[$i].'/'.$share_bdu[$j]
				});
			}
		}
	}
	
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub restartBittorrentService {
	my $self = shift;

	system('/etc/init.d/bittorrent.sh restart 1> /dev/null 2> /dev/null &');

	return;
}

sub initBittorrentSettings {
	my $self = shift;
	my $info = BufCommonFileInfo->new();

	unlink('/usr/local/bittorrent/settings.dat');
	unlink('/etc/melco/settings.dat');

	$info->init('/etc/melco/bittorrent');
	$info->set_info('bittorrent_status', 'off');
	$info->set_info('bittorrent_dir', '');
	$info->save();

	readpipe('/etc/init.d/bittorrent.sh stop 1> /dev/null 2> /dev/null');
	unlink('/usr/local/bittorrent/settings.dat');

	return;
}

1;
