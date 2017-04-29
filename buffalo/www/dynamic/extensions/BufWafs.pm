#!/usr/bin/speedy
;##############################
;# BufWafs.pm
;# 
;# usage :
;#	$class = BufWafs->new();
;# (C) 2011 BUFFALO INC. All rights reserved.
;##############################

package BufWafs;

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
		filename => "/etc/melco/wbfs/webaxs.conf",
		ServiceName => undef,
		UserKey0 => undef,
		UserVal0 => undef,
		URL0 => undef,
		buffaloNAS0 => undef,
		MntPoint => undef,
		MntPointRaw => undef,
		GeekPoint => undef,
		PathWin => undef,
		PathMac => undef

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
		system("/etc/init.d/wafs.sh init 1>/dev/null 2>/dev/null");
	}

	$file->init($self->{filename});
	$file2->init('/etc/melco/info');

	$self->{ServiceName} = $file->get_info('ServiceName');
	$self->{MntPoint} = $file->get_info('MntPoint');
	$self->{MntPoint} =~ s#^"##;
	$self->{MntPoint} =~ s#"$##;
	$self->{MntPointRaw} = $self->{MntPoint};

	my $folder_name = $self->{MntPoint};
	$folder_name =~ s#/([^/]*?)$##;
	$folder_name =~ s#^/mnt/.+/##;

	my $folder_name2 = $self->{MntPoint};
	$folder_name2 =~ s#^/mnt/.+/##;
	$folder_name2 =~ s#/.+$##;

	$self->{MntPoint} = $folder_name;
	$self->{GeekPoint} = $folder_name2;

	$self->{UserKey0} = $file->get_info('UserKey0');
	$self->{UserVal0} = $file->get_info('UserVal0');
	$self->{URL0} = $file->get_info('URL0');
	$self->{buffaloNAS0} = $file->get_info('URL0');
	$self->{buffaloNAS0} =~ s#^http://buffalonas.com/##;

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

	$self->{PathWin} = 'Windows:<br />\\\\' . $ip_address . '\\' . $folder_name . '\\' . $folder_name2 . '\webaxs';
	$self->{PathMac} = 'Macintosh:<br />smb://' . $ip_address . '/' . $folder_name . '/' . $folder_name2 . '/webaxs';

	return;
}

sub getWafsSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'ServiceName' => $self->{ServiceName},
		'UserKey0' => $self->{UserKey0},
		#'UserVal0' => $self->{UserVal0},
		'URL0' => $self->{URL0},
		'buffaloNAS0' => $self->{buffaloNAS0},
		'MntPoint' => $self->{MntPoint},
		'MntPointRaw' => $self->{MntPointRaw},
		'PathWin' => $self->{PathWin},
		'PathMac' => $self->{PathMac}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setWafsSettings {
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
	my $url = $q->param('wafs_token');
	my $user = $q->param('wafs_user');
	my $pass = $q->param('wafs_pass');
	
	my $wbfs_name = 'wbfs'; #required
	my $i = 1;
	unless ($dir =~ m#^/mnt/#) {
		$dir = $file->get_info('MntPoint');
		$dir =~ s#^"##;
		$dir =~ s#"$##;
	}
#system("echo \"$dir\" >>/root/temp ");

	my $spool = readpipe("/etc/init.d/wafs.sh get_spool 2>/dev/null");
	$spool =~ s/\r//;
	$spool =~ s/\n//;

	my $spool = $spool . "/wbfs";
	$file->set_info('SpoolPrefix', $spool);
	if (!-d $spool) {
		mkdir $spool;
	}

	if (@errors == 0) {
		system("/etc/init.d/wafs.sh stop -k $self->{MntPointRaw} 1>/dev/null 2>/dev/null");

		if ($service eq 'on') {
			$file->set_info('ServiceName', 'WebAxs');
		}
		else {
			$file->set_info('ServiceName', 'WebAxsoff');
		}

		if ( $self->{MntPointRaw} ne $dir ) {
			my $mnt_ca = $dir . '/' . $wbfs_name;
			my $mnt_isempty = readpipe("/etc/init.d/wafs.sh is_empty $mnt_ca 2>/dev/null");
			$mnt_isempty =~ s/\r//;
			$mnt_isempty =~ s/\n//;
			#system("echo \"$mnt_isempty\" >>/root/temp ");
			#system("echo \"$dir\" >>/root/temp ");
			if ($mnt_isempty eq 'no') {
				for ($i = 1; $i <= 65535; $i++) {
					my $mnt = $dir . '/' . $wbfs_name . $i;
					$mnt_isempty = readpipe("/etc/init.d/wafs.sh is_empty $mnt 2>/dev/null");
					$mnt_isempty =~ s/\r//;
					$mnt_isempty =~ s/\n//;
					if ($mnt_isempty eq 'empty' || !-d $mnt) {
						$dir = $mnt;
						last;
					}
				}
			}
			else {
				$dir = $mnt_ca;
			}
		}
		if (!-d $dir) {
			mkdir $dir;
		}
#system("echo \"$dir\" >>/root/temp ");
		my $pass_escaped = $pass;
		$pass_escaped =~ s/'/''/g;
		my $pass_encrypted = readpipe("/etc/init.d/wafs.sh encrypt '$pass_escaped' 2>/dev/null");
		$pass_encrypted =~ s/\r//;
		$pass_encrypted =~ s/\n//;

		$url = "http://buffalonas.com/" . $url;
		$file->set_info('UserKey0', $user);
		$file->set_info('UserVal0', $pass_encrypted);
		$file->set_info('URL0', $url);
		$file->set_info('MntPoint', $dir);
		$file->save();

		if ($service eq 'on') {
			system("/etc/init.d/wafs.sh force_start $dir 1>/dev/null 2>/dev/null");
			$error_start = $? >> 8;

			my $check1 = readpipe("ls $dir 2>/tmp/wbfs_error; cat /tmp/wbfs_error");
			$check1 =~ s/\r//;
			$check1 =~ s/\n//;

#system("echo ls \"$dir\" 2>/tmp/wbfs_error; cat /tmp/wbfs_error >>/root/temp ");
			my $result1 = index($check1, "Software caused connection abort");	
			my $result2 = index($check1, "Transport endpoint is not connected");
#system("echo \"$check1\" >>/root/temp ");
			if ($result1 >= 0 || $result2 >= 0) {
				push @errors, 'wafs_folder_error1';
				system("/etc/init.d/wafs.sh stop 1>/dev/null 2>/dev/null");
				$file->set_info('ServiceName', 'WebAxsoff');
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

sub remountWafsSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	system("/etc/init.d/wafs.sh restart $self->{MntPointRaw} 1>/dev/null 2>/dev/null");

	push (@dataArray, '');
	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}


1;
