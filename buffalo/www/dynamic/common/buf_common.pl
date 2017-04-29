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
	
	if (($name eq "array1") || ($name eq '/dev/'.$gModel->is('DEVICE_MD1_REAL'))) { $name = "RAID Array 1"; }
	elsif (($name eq "array2") || ($name eq '/dev/'.$gModel->is('DEVICE_MD2_REAL'))) { $name = "RAID Array 2"; }
	
	elsif (($name eq "disk1") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD1_LINK'))) { $name = "Disk 1"; }
	elsif (($name eq "disk2") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD2_LINK'))) { $name = "Disk 2"; }
	elsif (($name eq "disk3") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD3_LINK'))) { $name = "Disk 3"; }
	elsif (($name eq "disk4") || ($name eq '/dev/'.$gModel->is('DEVICE_HDD4_LINK'))) { $name = "Disk 4"; }
	
	elsif (($name eq "usbdisk1")) { $name = "USB Disk 1"; }
	elsif (($name eq "usbdisk2")) { $name = "USB Disk 2"; }
	elsif (($name eq "usbdisk3")) { $name = "USB Disk 3"; }
	elsif (($name eq "usbdisk4")) { $name = "USB Disk 4"; }
	
	elsif ($name eq "raid1") { $name = "RAID1"; }
	elsif ($name eq "raid5") { $name = "RAID5"; }
	elsif ($name eq "raid0") { $name = "RAID0"; }
	elsif ($name eq "jbod")  { $name = "Spanning"; }
	elsif ($name eq "raid10") { $name = "RAID10"; }
	
	elsif ($name eq "xfs")	 { $name = "XFS"; }
	elsif ($name eq "ext3")  { $name = "EXT3"; }
	elsif ($name eq "vfat")  { $name = "FAT"; }
	elsif ($name eq "ntfs")  { $name = "NTFS"; }
	elsif ($name eq "ufsd")  { $name = "NTFS"; }
	
	return $name;
}

1;
