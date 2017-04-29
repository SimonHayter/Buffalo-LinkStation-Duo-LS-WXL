#!/usr/bin/speedy
;################################################
;# BufDiskCheck.pm
;# usage :
;#	$class = new BufDiskCheck;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################


package BufDiskCheck;

use BufDiskInfo;
use BufUsbStorageListInfo;
use BufDiskFormatType;
use BufTimerInfo;
use BufDiskDf;
use BUFFALO::Common::Model;

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
	my $self		= shift;
	my $disk		= BufDiskInfo->new;
	my $usbdisk		= BufUsbStorageListInfo->new;
	my $diskformat	= BufDiskFormatType->new;
	$disk->init;
	$usbdisk->init;
	$diskformat->init;
	
	my @disk_list = $disk->get_active_disk;
	my @disk_list_ok;
	my $usb_guid;
	my $i;

=pod	
	if ( -f '/var/lock/disk') {
		$self->{flag_raid_lock} = 1;
		$error = 'Information<>Formatting or checking the disk now. <BR>&nbsp;&nbsp;Formatting and disk-checking cannot be started while these are being executed.';
	}
=cut
	
	for ($i = 0; $i < @disk_list; $i++) {
		if ($disk_list[$i] =~ m/^usbdisk/) {
			if ($disk_list[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
			elsif ($disk_list[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
			elsif ($disk_list[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
			elsif ($disk_list[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
			
			my $device			= $usbdisk->get_device_from_guid($usb_guid);
			my $format_type		= $diskformat->get_device_format_type($device."_1");
			if (!$format_type) { $format_type = $diskformat->get_device_format_type($device."_2"); }
			if (!$format_type) { $format_type = $diskformat->get_device_format_type($device."_5"); }
			if ($format_type) { push @disk_list_ok, $disk_list[$i]; }
		}
		elsif ($disk_list[$i] =~ m/^disk/) {
			my $device;
			if	  ($disk_list[$i] eq 'disk1') { $device = '/dev/ls_disk1_6'; }
			elsif ($disk_list[$i] eq 'disk2') { $device = '/dev/ls_disk2_6'; }
			elsif ($disk_list[$i] eq 'disk3') { $device = '/dev/ls_disk3_6'; }
			elsif ($disk_list[$i] eq 'disk4') { $device = '/dev/ls_disk4_6'; }
			my $format_type = $diskformat->get_device_format_type($device);
			if ($format_type) { push @disk_list_ok, $disk_list[$i]; }
		}
		else {
			push @disk_list_ok, $disk_list[$i];
		}
	}
	
	if (($self->{flag_raid_lock}) || (!@disk_list_ok)) { $self->{flag_raid_error} = 1; }
	
	for ($i = 0; $i < @disk_list_ok; $i++) {
		${$self->{allTargets}}[$i] = &convert_diskname($disk_list_ok[$i]);
	}
	
	return;
}

sub get_diskCheck {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{allTargets}};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, { 'target' => ${$self->{allTargets}}[$i] });
	}
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub perform_diskCheck {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @dataArray	= ();
	my @errors		= ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_DISK_CHECK;
	}

	my $disk		= BufDiskInfo->new;
	my $type		= BufDiskFormatType->new;
	
	$disk->init;
	$type->init;
	
	my $device;
	my $mount;
	my $format;
	my $mac;
	
	my $diskname;
	
	$diskname = $cgiRequest->param('target');
	$mount = "/mnt/".$diskname;
	$mac = $cgiRequest->param('delMac');
	$format = $type->get_mount_format_type($mount);
	
	if ($diskname eq 'array1') {
		if ($disk->get_array1_mode ne 'raid10') {
			$device = '/dev/'.$gModel->is('DEVICE_MD1_REAL');
		}
		else {
			$device = '/dev/'.$gModel->is('DEVICE_MD3_REAL');
		}
	}
	elsif ($diskname eq 'array2') {
		if ($disk->get_array2_mode ne 'raid10') {
			$device = '/dev/'.$gModel->is('DEVICE_MD2_REAL');
		}
		else {
			$device = '/dev/'.$gModel->is('DEVICE_MD3_REAL');
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

	if ($mac eq 'on') {
		system("/usr/local/bin/hdd_check_normal.sh $device $mount $format mac 1> /dev/null 2> /dev/null &");
	}
	else {
		system("/usr/local/bin/hdd_check_normal.sh $device $mount $format 1> /dev/null 2> /dev/null &");
	}

	sleep 10;

ERROR_DISK_CHECK:
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

=pod
sub disk_check_get_usbdisk_device {
	my $guid = shift;
	my $disk = BufDiskInfo->new;
	my $usbdisk = BufUsbStorageListInfo->new;
	my $df = BufDiskDf->new;
	$disk->init;
	$usbdisk->init;
	$df->init;
	
	my $device = $usbdisk->get_device_from_guid($guid);
	my $status = $df->get_status($device."_1");
	
	if ($status eq "unmount") {
		$status = $df->get_status($device."_5");
		if ($status eq "unmount") { $device = $device."_1"; }
		else					  { $device = $device."_5"; }
	}
	else { $device = $device."_1"; }
	
	return $device;
}
=cut

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
#	elsif (($name eq "usbdisk3") || ($name eq "/dev/ls_usbdisk1_5") || ($name eq "<!--BUF_CONF_DEVICE_USBHDD_DEVICEFILE7-->")) { $name = "USB Disk 3"; }
#	elsif (($name eq "usbdisk4") || ($name eq "/dev/ls_usbdisk2_5") || ($name eq "<!--BUF_CONF_DEVICE_USBHDD_DEVICEFILE8-->")) { $name = "USB Disk 4"; }
	
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
