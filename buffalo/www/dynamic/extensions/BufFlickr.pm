#!/usr/bin/speedy
;##############################
;# BufFlickr.pm
;# 
;# usage :
;#	$class = BufFlickr->new();
;# (C) 2010 BUFFALO INC. All rights reserved.
;##############################

package BufFlickr;

use strict;
use JSON;

use BufCommonFileInfo;
use BufShareInfo;
use BufCommonFileShareInfo;
use BUFFALO::Network::Ip;
use BUFFALO::Common::Model;
use File::Basename;

sub new {
	my $class = shift;
	my $self  = bless {
		filename => "/etc/melco/flickrfs/flickrfs",
		flickrfs_service => undef,
		mntpoint => undef,
		mntpoint_raw => undef,
		path_win => undef,
		path_mac => undef,
		pic_permission => undef,
		username => undef,
		authed => undef

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

	if (!-e $self->{filename}) {
		my $flickr = dirname($self->{filename}); 
		system("mkdir $flickr 1>/dev/null 2>/dev/null");
		system("touch $self->{filename} 1>/dev/null 2>/dev/null");
	}

	$file->init($self->{filename});
	$file2->init('/etc/melco/info');

	$self->{flickrfs_service} = $file->get_info('flickrfs_service');
	$self->{mntpoint} = $file->get_info('mntpoint');
	$self->{mntpoint} =~ s#^"##;
	$self->{mntpoint} =~ s#"$##;
	$self->{mntpoint_raw} = $self->{mntpoint};

	my $folder_name = $self->{mntpoint};
	$folder_name =~ s#^/mnt/.+/##;
	$self->{mntpoint} = $folder_name;

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

	$self->{path_win} = 'Windows:<br />\\\\' . $ip_address . '\\' . $folder_name . '\flickr';
	$self->{path_mac} = 'Macintosh:<br />smb://' . $ip_address . '/' . $folder_name . '/flickr';
#	$self->{path_win} = $folder_name . '/flickr';

	$self->{pic_permission} = $file->get_info('pic_permission');
	$self->{username} = $file->get_info('username');
	if (!$self->{username}) {
		$self->{username} = '-';
	}

	if (-f '/etc/melco/flickrfs/auth.xml') {
		$self->{authed} = 1;
	}
	else {
		$self->{authed} = 0;
	}

	return;
}

sub getFlickrSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'service' => $self->{flickrfs_service},
		'dir' => $self->{mntpoint},
		'path_win' => $self->{path_win},
		'path_mac' => $self->{path_mac},
		'username' => $self->{username},
		'authed' => $self->{authed}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setFlickrSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $error_start;

	my $check = BufCommonDataCheck->new();
	my $file = BufCommonFileInfo->new();
	$file->init($self->{filename});

	my $service = $q->param('service');
	my $dir = $q->param('dir');
	my $token = $q->param('flickr_token');
	$token =~ s/-//g;

	if ($token) {
		unless ($token =~ /^[0-9]{9}$/) {
			push @errors, 'flickr_auth_error1';
		}
	}

	unless ($dir =~ m#^/mnt/#) {
		$dir = $file->get_info('mntpoint');
		$dir =~ s#^"##;
		$dir =~ s#"$##;
	}

	if (-f $dir.'/flickr') {
		push @errors, 'flickr_folder_error1';
	}

	if (-f $dir.'/fail_to_upload') {
		push @errors, 'flickr_folder_error2';
	}

	if (@errors == 0) {
		system("/etc/init.d/flickrfs.sh stop $self->{mntpoint_raw} 1>/dev/null 2>/dev/null");

		$file->set_info('flickrfs_service', $service);
		if ($service eq 'on') {
			if ($dir =~ m#^/mnt/#) {
				$dir = '"' . $dir . '"';
				$file->set_info('mntpoint', $dir);
			}
			else {
				$dir = $self->{mntpoint_raw};
			}
		}
		$file->save();

		if ($service eq 'on') {
			if ($token) {
				system("export HOME='/root' && /etc/init.d/flickrfs.sh real_start $dir $token 1>/dev/null 2>/dev/null");
			}
			else {
				system("export HOME='/root' && /etc/init.d/flickrfs.sh real_start $dir 1>/dev/null 2>/dev/null");
			}

			$error_start = $? >> 8;
#			if ($error_start == 0) {
#				system("/etc/init.d/flickrfs.sh sync $dir 1>/dev/null 2>/dev/null &");
#			}

			unless (-f '/etc/melco/flickrfs/auth.xml') {
				push @errors, 'flickr_auth_error2';

				$file->set_info('flickrfs_service', 'off');
				$file->save();
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

sub remountFlickrSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	system("/etc/init.d/flickrfs.sh stop $self->{mntpoint_raw} 1>/dev/null 2>/dev/null");
	system("export HOME='/root' && /etc/init.d/flickrfs.sh real_start $self->{mntpoint_raw} 1>/dev/null 2>/dev/null");
#	system("/etc/init.d/flickrfs.sh sync $self->{mntpoint_raw} 1>/dev/null 2>/dev/null &");

	push (@dataArray, '');
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub initFlickrSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	system('/etc/init.d/flickrfs.sh init /etc/melco/flickrfs/auth.xml 1>/dev/null 2>/dev/null');

	push (@dataArray, '');
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
