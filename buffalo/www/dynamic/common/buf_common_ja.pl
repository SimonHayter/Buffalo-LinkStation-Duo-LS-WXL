#!/usr/bin/speedy
;################################################
;# usage :
;#	&convert_diskname($name);
;#
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

use strict;
use JSON;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

sub convert_diskname {
	my $name = shift;
	
	if (($name eq "array1") || ($name eq '/dev/'.$gModel->is('DEVICE_MD1_REAL'))) { $name = "RAIDアレイ1"; }
	elsif (($name eq "array2") || ($name eq '/dev/'.$gModel->is('DEVICE_MD2_REAL'))) { $name = "RAIDアレイ2"; }
	
	elsif (($name eq "disk1") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD1_LINK'))) { $name = "ディスク1"; }
	elsif (($name eq "disk2") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD2_LINK'))) { $name = "ディスク2"; }
	elsif (($name eq "disk3") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD3_LINK'))) { $name = "ディスク3"; }
	elsif (($name eq "disk4") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD4_LINK'))) { $name = "ディスク4"; }
	
	elsif (($name eq "usbdisk1")) { $name = "USBディスク1"; }
	elsif (($name eq "usbdisk2")) { $name = "USBディスク2"; }
	elsif (($name eq "usbdisk3")) { $name = "USBディスク3"; }
	elsif (($name eq "usbdisk4")) { $name = "USBディスク4"; }
	
	elsif ($name eq "raid1") { $name = "RAID1"; }
	elsif ($name eq "raid5") { $name = "RAID5"; }
	elsif ($name eq "raid0") { $name = "RAID0"; }
	elsif ($name eq "jbod")  { $name = "スパニング"; }
	elsif ($name eq "raid10") { $name = "RAID10"; }
	
	elsif ($name eq "xfs")	 { $name = "XFS"; }
	elsif ($name eq "ext3")  { $name = "EXT3"; }
	elsif ($name eq "vfat")  { $name = "FAT"; }
	elsif ($name eq "ntfs")  { $name = "NTFS"; }
	elsif ($name eq "ufsd")  { $name = "NTFS"; }
	
	return $name;
}

1;
