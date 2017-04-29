#!/usr/bin/speedy
;################################################
;# BufDiskFormat.pm
;# usage :
;#	$class = new BufDiskFormat;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################


package BufDiskFormat;
use lib "/www/buffalo/www/dynamic/extensions/webaxs";

use BufDiskInfo;
use BufUsbStorageListInfo;
use BufDiskPartition;
use BufCommonDevLink;
use BufShareListInfo;
use BufDiskDf;
use BUFFALO::Common::Model;

use WebAxsConfig;
use BufPocketU;

use strict;
use JSON;

my $gModel = BUFFALO::Common::Model->new();

sub new {
	my $class = shift;
	my $self  = bless {
		flag_raid_lock	=> undef,
		flag_raid_error => undef,
		allTargets => []

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
	my $disk = BufDiskInfo->new;
	my $usbdisk = BufUsbStorageListInfo->new;
	my $partition = BufDiskPartition->new;
	my $devlink = BufCommonDevLink->new;
	$disk->init;
	$usbdisk->init;
	$partition->init;
	$devlink->init;
	
	my @disk_list = $disk->get_active_disk;
	my @disk_list_ok;
	my $i;
	my $j;
	
	for ($i = 0; $i < @disk_list; $i++) {
		if ($disk_list[$i] =~ m/^disk/) {
			my $device;
			if	  ($disk_list[$i] eq 'disk1') { $device = 'ls_disk1'; }
			elsif ($disk_list[$i] eq 'disk2') { $device = 'ls_disk2'; }
			elsif ($disk_list[$i] eq 'disk3') { $device = 'ls_disk3'; }
			elsif ($disk_list[$i] eq 'disk4') { $device = 'ls_disk4'; }
			$device = $devlink->get_dev_sdx($device);
			
			my $disk_partition = $partition->get_capacity($device);
			if (!$disk_partition) {
				$device =~ s/[0-9]$//;
				$disk_partition = $partition->get_capacity($device);
			}
			if ($disk_partition) { push @disk_list_ok, $disk_list[$i]; }
		}
		elsif ($disk_list[$i] =~ m/^usbdisk/) {
			my @usbdisk_guid	= $usbdisk->get_guid;
			my @usbdisk_connect = $usbdisk->get_flag_connect;
			my $guid;
			
			if	  ($disk_list[$i] eq 'usbdisk1') { $guid = $disk->get_usb_disk1; }
			elsif ($disk_list[$i] eq 'usbdisk2') { $guid = $disk->get_usb_disk2; }
#			elsif ($disk_list[$i] eq 'usbdisk3') { $guid = $disk->get_usb_disk3; }
#			elsif ($disk_list[$i] eq 'usbdisk4') { $guid = $disk->get_usb_disk4; }
			
			for ($j = 0; $j < @usbdisk_guid; $j++) {
				if ($usbdisk_guid[$j] eq $guid) {
					if ($usbdisk_connect[$j]) {
						$disk_list[$i] = "ls_".$disk_list[$i];
						push @disk_list_ok, $disk_list[$i];
					}
				}
			}
		}
		else {
			push @disk_list_ok, $disk_list[$i];
		}
	}
	
	if (($self->{flag_raid_lock}) || (!@disk_list_ok)) {
		$self->{flag_raid_error} = 1;
	}
	
	for ($i = 0; $i < @disk_list_ok; $i++) {
		${$self->{allTargets}}[$i] = &convert_diskname($disk_list_ok[$i]);
	}
	
	return;
}

sub get_diskFormat {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $jsnHash;
	my $cnt = @{$self->{allTargets}};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, {
			'target' => ${$self->{allTargets}}[$i]
		});
	}
	
	$jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub perform_diskFormat {
	my $self = shift;
	my $cgiRequest = shift;
	my @dataArray = ();
	my @errors = ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_FORMAT;
	}

	my $disk = BufDiskInfo->new;
	my $partition = BufDiskPartition->new;
	my $share = BufShareListInfo->new;
	
	$disk->init;
	$partition->init;
	$share->init;
	
	my $device;
	my $mount;
	my $format;
	
	my $encrypt;
	my $gpt;

	my $diskname;
	my $disknumber;
	
	$diskname = $cgiRequest->param('disk');
	$mount = '/mnt/'.$diskname;

	$disknumber = $cgiRequest->param('disk');
	$disknumber =~ s#disk##;
	
	$format = $cgiRequest->param('fileSystem');
	if (!$format) {
		$format = 'xfs';
	}
	
	if ($cgiRequest->param('encrypt') eq 'on') {
		$encrypt = 'encrypt';
	}
	
	if ($cgiRequest->param('gpt') eq 'on') {
		$gpt = 'gpt';
	}
	
	if ($diskname eq 'array1') {
		if (($disk->get_array1_dev) && ($disk->get_array1_mode ne 'off')) {
			$device = '/dev/'.$disk->get_array1_dev;
		}
		else {
			if ($disk->get_array1_mode ne 'raid10') {
				$device = '/dev/'.$gModel->is('DEVICE_MD1_REAL');
			}
			else {
				$device = '/dev/'.$gModel->is('DEVICE_MD3_REAL');
			}
		}
	}
		elsif ($diskname eq 'array2') {
			if (($disk->get_array2_dev) && ($disk->get_array2_mode ne 'off')) {
				$device = '/dev/'.$disk->get_array2_dev;
			}
			else {
			if ($disk->get_array2_mode ne 'raid10') {
				$device = '/dev/'.$gModel->is('DEVICE_MD2_REAL');
			}
			else {
				$device = '/dev/'.$gModel->is('DEVICE_MD3_REAL');
			}
		}
	}
	elsif ($diskname =~ /^disk/) {
		$device = '/dev/'.$diskname;
	}
	elsif ($diskname =~ /^usbdisk/) {
		$device = '/dev/'.$diskname;
	}

	if (-f '/var/lock/disk.log') {
		unlink '/var/lock/disk.log';
	}

	if ($disk->get_disk($disknumber) ne 'standby') {
		system ("/usr/local/bin/hdd_format.sh $device $mount $format $encrypt $gpt 1> /dev/null 2> /dev/null &");
		sleep 15;
	}
	else {
		system ("/usr/local/bin/hdd_wakeup.sh $diskname format 1> /dev/null 2> /dev/null &");
		sleep 60;
	}
	
	if ($device !~ /usb/) {
		my @share_name = $share->get_name;
		my @share_disk = $share->get_drive;
		my $i;
		
		# Webアクセス 3.0
		my $webaxs = WebAxsConfig->new();
		my $pocketu = BufPocketU->new;
		for ($i = 0; $i < @share_disk; $i++) {
			if ($cgiRequest->param('disk') eq $share_disk[$i]) {
				$share->set_remove_share($share_name[$i], 'format');
				
				$webaxs->deleteShare($share_name[$i]);
				$pocketu->deleteShare($share_name[$i]);
			}
		}
		$webaxs->restartWebAxs();
	}

ERROR_FORMAT:
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub convert_diskname {
	my $name = shift;
	
	if (($name eq "array1") || ($name eq "/dev/md1")) { $name = "RAID Array 1"; }
	elsif (($name eq "array2") || ($name eq "/dev/md2")) { $name = "RAID Array 2"; }
	
	elsif (($name eq "disk1") || ($name eq "/dev/ls_disk1_6")) { $name = "Disk 1"; }
	elsif (($name eq "disk2") || ($name eq "/dev/ls_disk2_6")) { $name = "&nbsp;Disk 2"; }
	elsif (($name eq "disk3") || ($name eq "/dev/ls_disk3_6")) { $name = "&nbsp;Disk 3"; }
	elsif (($name eq "disk4") || ($name eq "/dev/ls_disk4_6")) { $name = "&nbsp;Disk 4"; }
	
	elsif (($name eq "usbdisk1") || ($name eq "ls_usbdisk1") || ($name eq "/dev/ls_usbdisk1_1") || ($name eq "/dev/ls_usbdisk1_2") || ($name eq "/dev/ls_usbdisk1_5")) { $name = "USB Disk 1"; }
	elsif (($name eq "usbdisk2") || ($name eq "ls_usbdisk2") || ($name eq "/dev/ls_usbdisk2_1") || ($name eq "/dev/ls_usbdisk2_2") || ($name eq "/dev/ls_usbdisk2_5")) { $name = "USB Disk 2"; }
	
	elsif ($name eq "raid1") { $name = "RAID1"; }
	elsif ($name eq "raid5") { $name = "RAID5"; }
	elsif ($name eq "jbod")  { $name = "Spanning"; }
	
	elsif ($name eq "xfs")	 { $name = "XFS"; }
	elsif ($name eq "ext3")  { $name = "EXT3"; }
	elsif ($name eq "vfat")  { $name = "FAT"; }
	elsif ($name eq "ntfs")  { $name = "NTFS"; }
	elsif ($name eq "ufsd")  { $name = "NTFS"; }
	
	return $name;
}

1;
