#!/usr/bin/speedy
;################################################
;# BufRoot.pm
;# usage :
;#	$class = new BufRoot;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufRoot;

use BufBasicLocale;
use BufBasicHostname;
use BufBasicFirmware;
use BUFFALO::Network::Ip;
use BUFFALO::Daemon::Samba;
use BufBasicDate;
use BufDiskInfo;
use BufDiskDf;
use BufUsbStorageListInfo;
use BufCommonDevLink;
use BufCommonFileInfo;
use BufMediaserver;
use BufClientInfo;


use strict;
use JSON;
use Jcode;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

sub new {
	my $class = shift;
	my $self  = bless {
		hostname	=> undef,
		version		=> undef,
		serial_num	=> undef,
		dtcp_stat	=> undef,
		dtcp_ver	=> undef,
		ipAddr		=> undef,
		ipAddr2		=> undef,
		authMethod	=> undef,
		wgName		=> undef,
		adBios		=> undef,
		storage		=> undef,
		volumes		=> undef,
		place		=> undef,
		manager		=> undef

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
	
	my $locale		= BufBasicLocale->new;
	my $hostname	= BufBasicHostname->new;
	my $firmware	= BufBasicFirmware->new;
	my $mediaserver = BufMediaserver->new();
	
	my $file		= BufCommonFileInfo->new;
	my $file2		= BufCommonFileInfo->new;
	$file->init('/var/tmp/encryptinfo');
	$file2->init('/etc/melco/info');
	
	my $ip;
	if ($file2->get_info('my_eth2') eq 'trunk') {
		$ip			= BUFFALO::Network::Ip->new('bond0');
	}
	else {
		$ip			= BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	}
	my $ip_2		= BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	my $samba		= BUFFALO::Daemon::Samba->new;
	my $disk		= BufDiskInfo->new;
	my $df			= BufDiskDf->new;
	my $usbdisk		= BufUsbStorageListInfo->new;
	my $devlink		= BufCommonDevLink->new;

	$locale->init;
	$hostname->init;
	$firmware->init;
	$mediaserver->init;
	$disk->init;
	$df->init;
	$usbdisk->init;
	$devlink->init;
	
	my $lang = $locale->get_lang();
	if ($lang eq 'japanese') {
		require 'dynamic/common/buf_common_ja.pl';
	}
	else {
		require 'dynamic/common/buf_common.pl';
	}
	
	my $status;
	my $disk_name;
	my $disk_capacity;
	my $disk_use;
	my $disk_usage;
	my $hdd;
	my $encrypt;
	
	$self->{hostname}	= $hostname->get_name;
	$self->{version}	= $firmware->get_version;
	$self->{ipAddr}		= $ip->get_ip;
	$self->{ipAddr2}	= $ip_2->get_ip;

	$self->{dtcp_stat}	= $mediaserver->get_dtcp_stat;
	$self->{dtcp_ver}	= $mediaserver->get_dtcp_ver;

	if ($samba->get_status eq 'ad') {
		$self->{authMethod}	= 'ad';
	}
	elsif ($samba->get_status eq 'domain') {
		$self->{authMethod}	= 'domain';
	}
	else {
		$self->{authMethod}	= 'wg';
	}

	$self->{wgName}		= $samba->get_workgroup;
	$self->{adBios}		= $samba->get_domain;
	if (!$self->{adBios}) {
		$self->{adBios}	= $samba->get_workgroup;
	}
#	$self->{currentDate}  = getTimeStamp();

	my $place = $file2->get_info('place');
	my $manager = $file2->get_info('manager');

	$place =~ s#"##g;
	$manager =~ s#"##g;

	my $j = new Jcode($place);
	foreach my $buff ($j->jfold(20)){
		$self->{place} .= "$buff<br />\n";
	}

	$j = new Jcode($manager);
	foreach my $buff ($j->jfold(20)){
		$self->{manager} .= "$buff<br />\n";
	}

	if ($disk->get_array1_mode ne "off") {
		if ($file->get_info('array1_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
		if ($disk->get_array1_mode eq 'raid10') {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_MD3_REAL'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_MD3_REAL'));
			}
		}
		else {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_MD1_REAL'));
			}
			else {
#				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_MD1_REAL'));
				$status = $df->get_status_mntpoint('/mnt/array1');
			}
		}
		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('/dev/'.$gModel->is('DEVICE_MD1_REAL'));
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_array2_mode ne "off") {
		if ($file->get_info('array2_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
		if ($disk->get_array2_mode eq 'raid10') {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_MD3_REAL'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_MD3_REAL'));
			}
		}
		else {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_MD2_REAL'));
			}
			else {
#				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_MD2_REAL'));
				$status = $df->get_status_mntpoint('/mnt/array2');
			}
		}
		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('/dev/'.$gModel->is('DEVICE_MD2_REAL'));
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_disk1 eq "normal") {
		if ($file->get_info('disk1_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
#		$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD1_REAL'));
#		$status = $df->get_status($devlink->get_dev_sdx6('disk1'));
		$status = $df->get_status_mntpoint('/mnt/disk1');

		if ($status eq "unmount") {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_HDD1_LINK'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD1_LINK'));
			}
		}

		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('disk1');
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_disk2 eq "normal") {
		if ($file->get_info('disk2_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
#		$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD2_REAL'));
#		$status = $df->get_status($devlink->get_dev_sdx6('disk2'));
		$status = $df->get_status_mntpoint('/mnt/disk2');

		if ($status eq "unmount") {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_HDD2_LINK'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD2_LINK'));
			}
		}

		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('disk2');
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_disk3 eq "normal") {
		if ($file->get_info('disk3_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
#		$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD3_REAL'));
#		$status = $df->get_status($devlink->get_dev_sdx6('disk3'));
		$status = $df->get_status_mntpoint('/mnt/disk3');

		if ($status eq "unmount") {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_HDD3_LINK'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD3_LINK'));
			}
		}

		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('disk3');
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_disk4 eq "normal") {
		if ($file->get_info('disk4_encrypted') eq 'yes') {
			$encrypt = 1;
		}
		else {
			$encrypt = 0;
		}
		
#		$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD4_REAL'));
#		$status = $df->get_status($devlink->get_dev_sdx6('disk4'));
		$status = $df->get_status_mntpoint('/mnt/disk4');

		if ($status eq "unmount") {
			if ($encrypt) {
				$status = $df->get_status('/dev/mapper/cbd_'.$gModel->is('DEVICE_HDD4_LINK'));
			}
			else {
				$status = $df->get_status('/dev/'.$gModel->is('DEVICE_HDD4_LINK'));
			}
		}

		if ($status ne "unmount") {
			$disk_name		= &convert_diskname('disk4');
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
	}
	
	if ($disk->get_usb_disk1) {
		my $device = $usbdisk->get_device_from_guid($disk->get_usb_disk1);
#		$status = $df->get_status($device."1");
		
		$device = $devlink->get_dev_sdx('usbdisk1');
		$status = $df->get_status($device."1");
		if ($status ne "unmount") {
			$disk_name		= &convert_diskname("usbdisk1");
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
		else {
			$status = $df->get_status($device."2");
			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk1");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."5");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk1");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
			}
		}
		
		if ($status eq "unmount") {
			$device = $usbdisk->get_device_from_guid($disk->get_usb_disk1);
			$status = $df->get_status($device."_1");

			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk1");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."_2");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk1");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
				else {
					$status = $df->get_status($device."_5");
					if ($status ne "unmount") {
						$disk_name		= &convert_diskname("usbdisk1");
						$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
						$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
						$disk_usage		= sprintf("%.1f", $df->get_use_rate);
						$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
						$self->{volumes}++;
					}
				}
			}
		}
	}
	
	if ($disk->get_usb_disk2) {
		my $device = $usbdisk->get_device_from_guid($disk->get_usb_disk2);
#		$status = $df->get_status($device."1");
		
		$device = $devlink->get_dev_sdx('usbdisk2');
		$status = $df->get_status($device."1");

		if ($status eq "unmount") {
			$device = $usbdisk->get_device_from_guid($disk->get_usb_disk2);
			$status = $df->get_status($device."_1");
		}

		if ($status ne "unmount") {
			$disk_name		= &convert_diskname("usbdisk2");
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
		else {
			$status = $df->get_status($device."2");
			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk2");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."5");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk2");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
			}
		}
		
		if ($status eq "unmount") {
			$device = $usbdisk->get_device_from_guid($disk->get_usb_disk2);
			$status = $df->get_status($device."_1");

			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk2");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."_2");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk2");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
				else {
					$status = $df->get_status($device."_5");
					if ($status ne "unmount") {
						$disk_name		= &convert_diskname("usbdisk2");
						$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
						$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
						$disk_usage		= sprintf("%.1f", $df->get_use_rate);
						$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
						$self->{volumes}++;
					}
				}
			}
		}
	}
	
	if ($disk->get_usb_disk3) {
		my $device = $usbdisk->get_device_from_guid($disk->get_usb_disk3);
#		$status = $df->get_status($device."1");
		
		$device = $devlink->get_dev_sdx('usbdisk3');
		$status = $df->get_status($device."1");
		if ($status ne "unmount") {
			$disk_name		= &convert_diskname("usbdisk3");
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
		else {
			$status = $df->get_status($device."2");
			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk3");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."5");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk3");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
			}
		}
		
		if ($status eq "unmount") {
			$device = $usbdisk->get_device_from_guid($disk->get_usb_disk3);
			$status = $df->get_status($device."_1");

			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk3");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."_2");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk3");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
				else {
					$status = $df->get_status($device."_5");
					if ($status ne "unmount") {
						$disk_name		= &convert_diskname("usbdisk3");
						$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
						$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
						$disk_usage		= sprintf("%.1f", $df->get_use_rate);
						$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
						$self->{volumes}++;
					}
				}
			}
		}
	}
	
	if ($disk->get_usb_disk4) {
		my $device = $usbdisk->get_device_from_guid($disk->get_usb_disk4);
#		$status = $df->get_status($device."1");
		
		$device = $devlink->get_dev_sdx('usbdisk4');
		$status = $df->get_status($device."1");
		if ($status ne "unmount") {
			$disk_name		= &convert_diskname("usbdisk4");
			$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
			$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
			$disk_usage		= sprintf("%.1f", $df->get_use_rate);
			$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
			$self->{volumes}++;
		}
		else {
			$status = $df->get_status($device."2");
			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk4");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."5");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk4");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
			}
		}
		
		if ($status eq "unmount") {
			$device = $usbdisk->get_device_from_guid($disk->get_usb_disk4);
			$status = $df->get_status($device."_1");

			if ($status ne "unmount") {
				$disk_name		= &convert_diskname("usbdisk4");
				$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
				$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
				$disk_usage		= sprintf("%.1f", $df->get_use_rate);
				$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
				$self->{volumes}++;
			}
			else {
				$status = $df->get_status($device."_2");
				if ($status ne "unmount") {
					$disk_name		= &convert_diskname("usbdisk4");
					$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
					$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
					$disk_usage		= sprintf("%.1f", $df->get_use_rate);
					$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
					$self->{volumes}++;
				}
				else {
					$status = $df->get_status($device."_5");
					if ($status ne "unmount") {
						$disk_name		= &convert_diskname("usbdisk4");
						$disk_capacity	= sprintf("%.1f", $df->get_all_space / 1024 / 1024);
						$disk_use		= sprintf("%.1f", $df->get_use_space / 1024 / 1024);
						$disk_usage		= sprintf("%.1f", $df->get_use_rate);
						$hdd			.= "<b>" .$disk_name."</b>:    ".$disk_use." GB / ".$disk_capacity." GB (".$disk_usage." %)<br>";
						$self->{volumes}++;
					}
				}
			}
		}
	}
	
	$self->{storage} = $hdd;

	my $serial_num = readpipe('/usr/local/sbin/getsn.sh 2>/dev/null');
	if ($serial_num) {
		$self->{serial_num} = $serial_num;
	}

	return;
}

sub get_Info {
	my $self		= shift;
	my $menu		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $generalInfo;
	my $menuInfo;

	my $file		= BufCommonFileInfo->new;
	$file->init('/etc/melco/info');

	push (@{$generalInfo}, { 'name' => "r_hostname", 'value' => $self->{hostname} });

	if ($self->{dtcp_stat} eq 'ok') {
		push (@{$generalInfo}, { 'name' => "r_version", 'value' => $self->{version}.'<br />(DTCP-IP:'.$self->{dtcp_ver}.')' });
	}
	else {
		push (@{$generalInfo}, { 'name' => "r_version", 'value' => $self->{version} });
	}

	if ($self->{serial_num}) {
		push (@{$generalInfo}, { 'name' => "r_serial_num", 'value' => $self->{serial_num} });
	}

	push (@{$generalInfo}, { 'name' => "r_ipAddr:1", 'value' => $self->{ipAddr} });

	if ($file->get_info('my_eth2') eq 'on') {
		push (@{$generalInfo}, { 'name' => "r_ipAddr:2", 'value' => $self->{ipAddr2} });
	}

	if ($file->get_info('workingmode') ne 'iSCSI') {
		if (($self->{authMethod} eq 'ad') || ($self->{authMethod} eq 'domain')) {
			push (@{$generalInfo}, { 'name' => "r_domainName", 'value' => $self->{adBios} });
		}
		else{
			push (@{$generalInfo}, { 'name' => "r_workgroup", 'value' => $self->{wgName} });
		}

		push (@{$generalInfo}, { 'name' => "r_storage", 'value' => $self->{storage} });
	}
	else {
		push (@{$generalInfo}, { 'name' => "r_place", 'value' => $self->{place} });
		push (@{$generalInfo}, { 'name' => "r_manager", 'value' => $self->{manager} });
	}
	
	if ($menu eq '1') { $menuInfo = get_shFoldersInfo($self); }
	elsif ($menu eq '2') { $menuInfo = get_userGroupsInfo(); }
	elsif ($menu eq '3') { $menuInfo = get_networkInfo(); }
	elsif ($menu eq '6') { $menuInfo = get_iSCSIClientInfo(); }
	
	push (@dataArray, {'generalInfo' => $generalInfo}, {'specificInfo' => $menuInfo});
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub get_shFoldersInfo {
	my $self = shift;
	use BufShare;
	my $Share = BufShare->new();
	my $menuInfo;
	
	$Share->init_only_sharenumber;

	my $shares = @{$Share->{allShares}};
	my $volumes = $self->{volumes};
	
	push (@{$menuInfo}, { 'name' => "r_shFolders", 'value' => $shares });
	push (@{$menuInfo}, { 'name' => "r_volumes", 'value' => $volumes });
	
	return $menuInfo;
}

sub get_userGroupsInfo {
	use BufUser;
	use BufGroup;
	my $User	= BufUser->new();
	my $Group	= BufGroup->new();
	my $menuInfo; 
	
	$User->init;
	$Group->init;
	
	my $users	= @{$User->{allUsers}};
	my $groups	= @{$Group->{allGroups}};
	
	push (@{$menuInfo}, { 'name' => "r_users", 'value' => $users });
	push (@{$menuInfo}, { 'name' => "r_groups", 'value' => $groups });
	
	return $menuInfo;
}

sub get_networkInfo {
	use BUFFALO::Network::Ip;
	my $ip		= BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	my $ip2		= BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	my $dhcp	= $ip->get_status;
	my $dhcp2	= $ip2->get_status;
	my $efs 	= $ip->get_mtu;
	my $efs2 	= $ip2->get_mtu;
	my $menuInfo; 

	my $file2		= BufCommonFileInfo->new;
	$file2->init('/etc/melco/info');

	$dhcp		= ($dhcp eq 'dhcp' ? 'r_enabled' : 'r_disabled');
	$dhcp2		= ($dhcp2 eq 'dhcp' ? 'r_enabled' : 'r_disabled');

	push (@{$menuInfo}, { 'name' => "net_settings_eht_1: DHCP", 'value' => $dhcp });
	push (@{$menuInfo}, { 'name' => "r_efs:1", 'value' => $efs });

	if ($gModel->is('DEVICE_NETWORK_NUM') > 1) {
		if ($file2->get_info('my_eth2') eq 'on') {
			if ($dhcp2) {
				push (@{$menuInfo}, { 'name' => "net_settings_eht_2: DHCP", 'value' => $dhcp2 });
			}
			if ($efs2) {
				push (@{$menuInfo}, { 'name' => "r_efs:2", 'value' => $efs2 });
			}
		}
	}

	return $menuInfo;
}

sub get_backupsInfo {
	# This is not complete

	use BufDiskBackupJobs;
	my $Backups = BufDiskBackupJobs->new();
	my $menuInfo; 
	my @curJobId;
	my @curTime;
	my @curDay;
	my $source;
	my $dest;
	my $time;

	$Backups->init;
	my $scheduleTypes = $Backups->{allSchedules};
	my $days = $Backups->{allDays};
	my $times = $Backups->{allTimes};
	my $cnt = $scheduleTypes;

	for (my $i=0; $i<$cnt; $i++) {
		if($scheduleTypes->{$i} eq "now") {
			push (@curTime, $times->{$i});
			push (@curJobId, $i);
			last;
		}
	}

	# get the lowest time and corresponding jobId, then initialize the job and get the values
	for (my $i=0; $i<@curTime; $i++) {	
	
	}

	push (@{$menuInfo}, { 'name' => "r_source", 'value' => $source });
	push (@{$menuInfo}, { 'name' => "r_dest", 'value' => $dest });
	push (@{$menuInfo}, { 'name' => "r_timet", 'value' => $time });

	return $menuInfo;
}

sub get_iSCSIClientInfo {
	my $client = BufClientInfo->new();
	$client->init();

	my @client_volume = $client->get_volume;
	my @client_pc = $client->get_pc;
	my @client_ip = $client->get_ip;

	my $menuInfo;
	my $i;

	for ($i = 0; $i < @client_volume; $i++) {
		push (@{$menuInfo}, {
			'name' =>  $client_volume[$i],
			'value' => $client_ip[$i]
		});
	}
	if (!$menuInfo) {
		$menuInfo = "";
	}

	return $menuInfo;
}

sub getTimeStamp {
	my $date	 = BufBasicDate->new;
	$date->init;
	
	my $month	 = (($date->get_month) < 10 ? "0".$date->get_month : $date->get_month );
	my $day		 = (($date->get_day) < 10 ? "0".$date->get_day : $date->get_day );
	my $year 	 = $date->get_year;
	my $hour	 = (($date->get_hour) < 10 ? "0".$date->get_hour : $date->get_hour );
	my $min		 = (($date->get_min) < 10 ? "0".$date->get_min : $date->get_min ); 

	return $month."/".$day."/".$year." ".$hour.":".$min;
}

1;
