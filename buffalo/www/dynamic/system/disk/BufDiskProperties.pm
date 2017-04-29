#!/usr/bin/speedy
;################################################
;# BufDiskProperties.pm
;# usage :
;#	$class = new BufDiskProperties;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufDiskProperties;

use BufCommonDevLink;
use BufDiskPartition;
use BufDiskDf;
use BufCommonTextConvert;
use BufDiskModel;
use BufDiskFormatType;
use BufDiskInfo;
use BufUsbStorageListInfo;
use BufCommonFileInfo;
use BufDiskMDStatus;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use strict;
use JSON;

use WebAxsConfig;
use BufPocketU;

my $array_count;
my $disk_count;
my $usbdisk_count;
my $connect_disk;

sub new {
	my $class = shift;
	my $self  = bless {
		unitName => undef,
		capacity => undef,
		status => undef,
		encryp => undef,
		amountUsed => undef,
		percentUsed => undef,
		fileFormat => undef,
		venderName	=> undef,	# only for usbdisk
		modelName  => undef,	# only for usbdisk
		canFormat => undef,
		canRemove => undef,
		canWakeup => undef,
		over2tb => undef,
		allDisks => []
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	my $curDisk = shift;

	$array_count = 0;
	$disk_count = 0;
	$usbdisk_count = 0;
	$connect_disk = 0;

	$self->load($curDisk);
	
	return;
}

sub load {
	my $self = shift;
	my $curDisk = shift;
	my $devlink = BufCommonDevLink->new;
	my $diskpartition = BufDiskPartition->new;
	my $diskdf = BufDiskDf->new;
	my $text = BufCommonTextConvert->new;
	my $diskinfo = BufDiskInfo->new;
	my $usbdiskinfo = BufUsbStorageListInfo->new;
	my $file = BufCommonFileInfo->new;
	
	my $device_ts;
	my $device;
	my $device_partitions;
	my $capacity;
	my $usbdisk;
	my @guidlist;
	my @unit;
	my @vender;
	my @product;
	my @device;
	my $flag_usb;
	my $i;
	my $j;
	my $k;
	my $raid10_flag;
	
	$devlink->init;
	$diskpartition->init;
	$diskdf->init;
	$diskinfo->init;
	$usbdiskinfo->init;
	$file->init('/var/tmp/encryptinfo');
	
# とりあえず、ここを拡張してみる → 意味ない? forループ回す回数の決定にしか使ってないような
# 挿抜を考慮した設計になっているのだろうか?

#	@{$self->{allDisks}} = ('Disk 1', 'USB Disk 1', 'USB Disk 2');
#	@{$self->{allDisks}} = ('array1', 'array2', 'disk1', 'disk2', 'disk3', 'disk4', 'usbdisk1', 'usbdisk2');

	for ($i = 1 ; $i <= $gModel->is('MAX_ARRAY_NUM'); $i++) {
		push ( @{$self->{allDisks}}, 'array'.$i );
	}
	for ($i = 1 ; $i <= $gModel->is('MAX_DISK_NUM'); $i++) {
		push ( @{$self->{allDisks}}, 'disk'.$i );
		if (($devlink->get_connect($i)) && !($diskinfo->get_disk($i) =~ m#^remove#) && !($diskinfo->get_disk($i) =~ m#^degrade#)) {
			$connect_disk++;
		}
	}
	for ($i = 1 ; $i <= $gModel->is('MAX_USBDISK_NUM'); $i++) {
		push ( @{$self->{allDisks}}, 'usbdisk'.$i );
	}



## --> ここから array[n] 取得処理
	for ($i = 1; $i <= $gModel->is('MAX_ARRAY_NUM'); $i++) {
		if ($file->get_info('array'.$i.'_encrypted') eq 'yes') {
			$self->{encryp}->[$i] = 'on';
		}
		else {
			$self->{encryp}->[$i] = 'off';
		}

		if ($diskinfo->get_array_mode($i) eq 'raid10') {
			if ($self->{encryp}->[$i] eq 'on') {
				$device = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD3_REAL');
				$device_partitions = "/dev/".$gModel->is('DEVICE_MD3_REAL');
				$capacity = $diskpartition->get_capacity($device_partitions);
			}
			else {
				$device = "/dev/".$gModel->is('DEVICE_MD3_REAL');
				$capacity = $diskpartition->get_capacity($device);
			}
			$raid10_flag++;
		}
		else {
			if ($self->{encryp}->[$i] eq 'on') {
				$device = "/dev/mapper/cbd_".$gModel->is('DEVICE_MD'.$i.'_REAL');
				$device_partitions = "/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL');
				$capacity = $diskpartition->get_capacity($device_partitions);
			}
			else {
				$device = "/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL');
				$capacity = $diskpartition->get_capacity($device);
				if ((!$capacity) || ($capacity eq '-')) {
					$capacity = &systeminfo_disk_capacity_all_mntpoint('/mnt/array'.$i);
				}
			}
		}
		
		if ((!$capacity) || ($diskinfo->get_array_mode($i + 1) eq 'raid10')) {
			$self->{status}->[$i] = 'Disconnected';
		}
		else {
			$self->{status}->[$i] = $diskdf->get_status($device);

			if ((!$self->{status}->[$i]) || ($self->{status}->[$i] eq '-')) {
				$self->{status}->[$i] = $diskdf->get_status_mntpoint('/mnt/array'.$i);
			}

			$self->{unitName}->[$i] = &system_disk_model($device);
			if ((!$self->{unitName}->[$i]) || ($self->{unitName}->[$i] eq '-')) {
				$self->{unitName}->[$i] = &system_disk_model('/mnt/array'.$i);
			}

			$self->{capacity}->[$i] = &systeminfo_disk_capacity_all($device);
			if ((!$self->{capacity}->[$i]) || ($self->{capacity}->[$i] eq '-')) {
				$self->{capacity}->[$i] = &systeminfo_disk_capacity_all_mntpoint('/mnt/array'.$i);
			}

			$self->{amountUsed}->[$i] = &systeminfo_disk_capacity_used($device);
			if ((!$self->{amountUsed}->[$i]) || ($self->{amountUsed}->[$i] eq '-')) {
				$self->{amountUsed}->[$i] = &systeminfo_disk_capacity_used_mntpoint('/mnt/array'.$i);
			}

			$self->{percentUsed}->[$i] = &systeminfo_disk_capacity_pctused($device);
			if ((!$self->{percentUsed}->[$i]) || ($self->{percentUsed}->[$i] eq '-')) {
				$self->{percentUsed}->[$i] = &systeminfo_disk_capacity_pctused_mntpoint('/mnt/array'.$i);
			}

			$self->{fileFormat}->[$i] = &system_disk_format($device);
			if ((!$self->{fileFormat}->[$i]) || ($self->{fileFormat}->[$i] eq '-')) {
				$self->{fileFormat}->[$i] = &system_disk_format_mntpoint('/mnt/array'.$i);
			}

			$self->{canFormat}->[$i] = 1;
			$self->{canRemove}->[$i] = 0;
			$self->{canWakeup}->[$i] = 0;
			$array_count++;
		}

		if ($raid10_flag) {
			$i = $gModel->is('MAX_ARRAY_NUM') + 1;
		}
	}
## <-- ここまで array[n] 取得処理



## --> ここから (新)disk[n] 取得処理
	for ($i = 1; $i <= $gModel->is('MAX_DISK_NUM'); $i++) {
		if ($file->get_info('disk'.$i.'_encrypted') eq 'yes') {
			$self->{encryp}->[10 + $i] = 'on';
		}
		else {
			$self->{encryp}->[10 + $i] = 'off';
		}

		if ($self->{encryp}->[10 + $i] eq 'on') {
			$device_ts = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD'.$i.'_LINK');
#			$device = "/dev/mapper/cbd_".$gModel->is('DEVICE_HDD'.$i.'_REAL');
			$device = $devlink->get_dev_sdx($i);
			$device = s#"/dev/"#"/dev/mapper/cbd_"#;
		}
		else {
			$device_ts = "/dev/".$gModel->is('DEVICE_HDD'.$i.'_LINK');
#			$device = "/dev/".$gModel->is('DEVICE_HDD'.$i.'_REAL');
			$device = $devlink->get_dev_sdx($i);
		}
		$capacity = $diskpartition->get_capacity($device);
		my $flag = 0;
		
		if (!$capacity) {
			$device = $devlink->get_dev_sdx($device_ts);
			$capacity = $diskpartition->get_capacity($device);
			$flag++;
		}

		# diskinfoのエントリ値を取得する
		$self->{status}->[10 + $i] = $diskinfo->get_disk($i);

		# 対象のdevlinkが存在しなければ
		if (!$devlink->get_connect($i)) {
			if ($self->{status}->[10 + $i] =~ m#^normal#) {
				$self->{status}->[10 + $i] = 'disconnect';
			}
			
			if (($self->{status}->[10 + $i] =~ m#^normal#) || ($self->{status}->[10 + $i] =~ m#^degrade#) || ($self->{status}->[10 + $i] =~ m#^remove#)) {
				$self->{canWakeup}->[10 + $i] = 1;
			}
			else {
				$self->{canWakeup}->[10 + $i] = 0;
			}

			# standbyの場合、フォーマットのみ許可(ディスクチェック不許可)
			if ($self->{status}->[10 + $i] eq 'standby') {
				$self->{canFormat}->[10 + $i] = 2;
			}
		}
		else {
			$self->{canWakeup}->[10 + $i] = 0;
			$self->{unitName}->[10 + $i] = &system_disk_model($device);

			$self->{capacity}->[10 + $i] = &systeminfo_disk_capacity_all($device_ts);
			if ((!$self->{capacity}->[10 + $i]) || ($self->{capacity}->[10 + $i] eq '-')) {
				$self->{capacity}->[10 + $i] = &systeminfo_disk_capacity_all_mntpoint('/mnt/disk'.$i);
			}

			$self->{amountUsed}->[10 + $i] = &systeminfo_disk_capacity_used($device_ts);
			if ((!$self->{amountUsed}->[10 + $i]) || ($self->{amountUsed}->[10 + $i] eq '-')) {
				$self->{amountUsed}->[10 + $i] = &systeminfo_disk_capacity_used_mntpoint('/mnt/disk'.$i);
			}

			$self->{percentUsed}->[10 + $i] = &systeminfo_disk_capacity_pctused($device_ts);
			if ((!$self->{percentUsed}->[10 + $i]) || ($self->{percentUsed}->[10 + $i] eq '-')) {
				$self->{percentUsed}->[10 + $i] = &systeminfo_disk_capacity_pctused_mntpoint('/mnt/disk'.$i);
			}

			$self->{fileFormat}->[10 + $i] = &system_disk_format($device_ts);
			if ((!$self->{fileFormat}->[10 + $i]) || ($self->{fileFormat}->[10 + $i] eq '-')) {
				$self->{fileFormat}->[10 + $i] = &system_disk_format_mntpoint('/mnt/disk'.$i);
			}

			# normal の場合、フォーマット/ディスクチェック許可
			if ($self->{status}->[10 + $i] =~ m#^normal#) {
				$self->{canFormat}->[10 + $i] = 1;

				# EDP可能であるかチェック
				if ($gModel->is('SUPPORT_EDP')) {
					system ("/usr/local/sbin/edp.sh checkedp disk$i 1>/dev/null 2>/dev/null");
					my $is_edp = $? >> 8;
					if ($is_edp == 0) {
						$self->{status}->[10 + $i] = "normal_edp";
					}
				}
			}
			# remove、remove_removed の場合、フォーマットのみ許可(ディスクチェック不許可)
			elsif ($self->{status}->[10 + $i] =~ m#^remove#) {
				$self->{canFormat}->[10 + $i] = 2;
			}
			else {
				$self->{canFormat}->[10 + $i] = 0;
			}
			
			if (($self->{status}->[10 + $i] =~ m#^normal#) ||
			($self->{status}->[10 + $i] =~ m#^array#) ||
			($self->{status}->[10 + $i] =~ m#^degrade#)) {
				if ($connect_disk > 1) {
					$self->{canRemove}->[10 + $i] = 1;
				}
				else {
					$self->{canRemove}->[10 + $i] = 0;
				}

				if ($self->{status}->[10 + $i] =~ m#^array([0-9])#) {
					my @md_status;
					my $mdstat = BufDiskMDStatus->new;
					$mdstat->init;

					unless ($diskinfo->get_array_dev_list($+)) {
						@md_status = $mdstat->get_all_status("/dev/".$gModel->is('DEVICE_MD'.$+.'_REAL'));
					}
					else {
						@md_status = $mdstat->get_all_status("/dev/".$diskinfo->get_array_dev_list($+));
					}

					if ($md_status[0] ne "ok") {
						$self->{canRemove}->[10 + $i] = 0;
					}
				}
			}
			else {
				$self->{canRemove}->[10 + $i] = 0;
			}
			
			$disk_count++;
		}
	}

## <-- ここまで (新)disk[n] 取得処理



## --> ここから (新)usbdisk[n] 取得処理
#	@guidlist = $usbdiskinfo->get_guid;
	@unit  = $usbdiskinfo->get_scsi_device_name;
	@vender = $usbdiskinfo->get_vender_name;
	@product = $usbdiskinfo->get_product_name;
	@device = $usbdiskinfo->get_device_file;
	$flag_usb = 0;
	
	for ($i = 1; $i <= $gModel->is('MAX_USBDISK_NUM'); $i++) {
#		if ($usbdisk eq $guidlist[$i - 1]) {
		if ($devlink->get_connect_usb($i)) {
			$self->{status}->[20 + $i] = '';
			
			if (!$vender[20 + $i]) { $vender[20 + $i] = "-"; }
			if (!$product[20 + $i]) { $product[20 + $i] = "-"; }
			if (!$unit[20 + $i]){ $unit[20 + $i] = "-"; }
			
#			$self->{unitName}->[20 + $i] = $unit[$i - 1];
#			$self->{venderName}->[20 + $i] = $vender[$i - 1];
#			$self->{modelName}->[20 + $i] = $product[$i - 1];

			for ($j = 0 ; $j < @device; $j++) {
				if ($device[$j] eq '/dev/usbdisk'.$i) {
					$k = $j;
				}
			}
			$self->{unitName}->[20 + $i] = $unit[$k];
			$self->{venderName}->[20 + $i] = $vender[$k];
			$self->{modelName}->[20 + $i] = $product[$k];
			
			# devlinkから実デバイス名を引き、1を付加して、容量取得を試みる
#			my $dev_usbdisk = $device[$i - 1];
			my $dev_usbdisk = $device[$k];
			$dev_usbdisk = $dev_usbdisk."_1";
			
#			$self->{capacity}->[20 + $i] = &systeminfo_disk_capacity_all($dev_usbdisk);
			$self->{capacity}->[20 + $i] = &systeminfo_disk_capacity_all_mntpoint('/mnt/usbdisk'.$i);
#			$self->{amountUsed}->[20 + $i] = &systeminfo_disk_capacity_used($dev_usbdisk);
			$self->{amountUsed}->[20 + $i] = &systeminfo_disk_capacity_used_mntpoint('/mnt/usbdisk'.$i);
#			$self->{percentUsed}->[20 + $i] = &systeminfo_disk_capacity_pctused($dev_usbdisk);
			$self->{percentUsed}->[20 + $i] = &systeminfo_disk_capacity_pctused_mntpoint('/mnt/usbdisk'.$i);
#			$self->{fileFormat}->[20 + $i] = &system_disk_format($dev_usbdisk);
			$self->{fileFormat}->[20 + $i] = &system_disk_format_mntpoint('/mnt/usbdisk'.$i);
			$usbdisk_count++;
			
			$self->{encryp}->[20 + $i] = 'off';
			$self->{canFormat}->[20 + $i] = 1;
			$self->{canRemove}->[20 + $i] = 1;
			$self->{over2tb}->[20 + $i] = is_over2TB('/dev/usbdisk'.$i);
			
			$flag_usb = 1;
#			last;
		}
		else {
			$self->{status}->[20 + $i] = 'disconnect';
			$self->{canFormat}->[20 + $i] = 0;
			$self->{canRemove}->[20 + $i] = 0;
		}
	}
	

#		if (!$flag_usb) { $self->{status}  = "Disconnected"; }
#	}
## <-- ここまで (新)usbdisk[n] 取得処理

	return;
}

# This method will return all the disks that are available on the system (static)
sub get_dynamicVal {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	
#	for ($i = 1; $i <= $array_count; $i++) {
	for ($i = 1; $i <= $gModel->is('MAX_ARRAY_NUM'); $i++) {
		if (!$self->{unitName}->[$i]) { next; }
		
		push (@dataArray, {
			'disk' => 'array'.$i,
			'unitName' => $self->{unitName}->[$i],
			'encryp' => $self->{encryp}->[$i],
			'capacity' => $self->{capacity}->[$i],
			'amountUsed' => $self->{amountUsed}->[$i],
			'percentUsed' => $self->{percentUsed}->[$i],
			'fileFormat' => $self->{fileFormat}->[$i],
			'manufacturer' => $self->{venderName}->[$i],
			'modelName' => $self->{modelName}->[$i],
			'canFormat' => $self->{canFormat}->[$i],
			'canRemove' => $self->{canRemove}->[$i],
			'canWakeup' => $self->{canWakeup}->[$i]
		});
	}
#	for ($i = 1; $i <= $disk_count; $i++) {
	for ($i = 1; $i <= $gModel->is('MAX_DISK_NUM'); $i++) {
		# とりあえず、接続されていなくても、表示はするように変更
#		if (!$self->{unitName}->[10 + $i]) { next; }
		
		push (@dataArray, {
			'disk' => 'disk'.$i,
			'unitName' => $self->{unitName}->[10 + $i],
			'encryp' => $self->{encryp}->[10 + $i],
			'capacity' => $self->{capacity}->[10 + $i],
			'amountUsed' => $self->{amountUsed}->[10 + $i],
			'percentUsed' => $self->{percentUsed}->[10 + $i],
			'fileFormat' => $self->{fileFormat}->[10 + $i],
			'manufacturer' => $self->{venderName}->[10 + $i],
			'modelName' => $self->{modelName}->[10 + $i],
			'canFormat' => $self->{canFormat}->[10 + $i],
			'canRemove' => $self->{canRemove}->[10 + $i],
			'canWakeup' => $self->{canWakeup}->[10 + $i],
			'status' => $self->{status}->[10 + $i]
		});

		if (($gModel->is('SUPPORT_HIDDEN_RAID_MENU')) && ($connect_disk <= 1)) {
			$i = $gModel->is('MAX_DISK_NUM');
		}
	}
#	for ($i = 1; $i <= $usbdisk_count; $i++) {
	for ($i = 1; $i <= $gModel->is('MAX_USBDISK_NUM'); $i++) {
		# とりあえず、接続されていなくても、表示はするように変更
#		if (!$self->{unitName}->[20 + $i]) { next; }
		
		push (@dataArray, {
			'disk' => 'usbdisk'.$i,
			'unitName' => $self->{unitName}->[20 + $i],
			'encryp' => $self->{encryp}->[20 + $i],
			'capacity' => $self->{capacity}->[20 + $i],
			'amountUsed' => $self->{amountUsed}->[20 + $i],
			'percentUsed' => $self->{percentUsed}->[20 + $i],
			'fileFormat' => $self->{fileFormat}->[20 + $i],
			'manufacturer' => $self->{venderName}->[20 + $i],
			'modelName' => $self->{modelName}->[20 + $i],
			'canFormat' => $self->{canFormat}->[20 + $i],
			'canRemove' => $self->{canRemove}->[20 + $i],
			'canWakeup' => $self->{canWakeup}->[20 + $i],
			'over2tb' => $self->{over2tb}->[20 + $i],
			'status' => $self->{status}->[20 + $i]
		});
	}
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

# This method will be called when getting diskProperties
sub get_diskProperties {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	
	my $dataHash = {
		'unitName' => $self->{unitName},
		'totalCap' => $self->{capacity},
		'amtUsed' => $self->{amountUsed},
		'pctUsed' => $self->{percentUsed},
		'fileFormat' => $self->{fileFormat},
		'manufacturer' => $self->{venderName},
		'modelName' => $self->{modelName},
		'status' => $self->{status}
	};
	
	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

# This method will be called when clikcing the "Remove USB Disk Assignemnt" button
sub del_diskAssignment {
	my $self		= shift;
	my $cgiRequest	= shift;
	my $target		= $cgiRequest->param('target');
	my @errors		= ();
	my @dataArray	= ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_DISK_REMOVE;
	}

	my $disk		= BufDiskInfo->new();
	my $share		= BufShareListInfo->new;

	$disk->init();
	$share->init;

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();

	if ($target =~ m#usbdisk#) {
		system("/usr/bin/perl /usr/local/bin/WebAxs_UnmoutUsbDisk.pl $target 1> /dev/null 2> /dev/null");
		$webaxs->restartWebAxs();
		
		if ($target eq "usbdisk1") {
			$disk->set_usb_disk1('');
		}
		elsif ($target eq "usbdisk2") {
			$disk->set_usb_disk2('');
		}
		$disk->save;
		
		system ("grep -v '$target' /var/tmp/usb_list > /var/tmp/usb_list");
		system ("/usr/local/bin/kernelmon_exec.sh FUNCSW_long_pushed 1> /dev/null 2> /dev/null &");
	}
	else {
		# 通常モードの場合のみ、共有フォルダ情報から対象アレイの共有フォルダを消去
		my $target_no = $target;
		$target_no =~ s/disk//;

		if ($disk->get_disk($target_no) eq 'normal') {
			my @share_name = $share->get_name;
			my @share_disk = $share->get_drive;
			my $i;
			
			my $pocketu = BufPocketU->new;
			
			for ($i=0; $i<@share_disk; $i++) {
				if ($target eq $share_disk[$i]) {
					$share->set_remove_share($share_name[$i], 'remove');
					
					$webaxs->deleteShare($share_name[$i]);
					$pocketu->deleteShare($share_name[$i]);
				}
			}
			$webaxs->restartWebAxs();
		}

		system ("/usr/local/bin/hdd_remove.sh $target 1> /dev/null 2> /dev/null &");
		sleep 20;
	}
	
ERROR_DISK_REMOVE:
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors'=> \@errors
	});
}

sub wakeupDisk {
	my $self		= shift;
	my $cgiRequest	= shift;
	my $target		= $cgiRequest->param('target');
	my @errors		= ();
	my @dataArray	= ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_DISK_WAKEUP;
	}

	my $diskinfo = BufDiskInfo->new;
	$diskinfo->init;
	my $i = $target;
	$i =~ s#disk##;
	
	if ($diskinfo->get_disk($i) eq 'normal') {
		system ("/usr/local/bin/hdd_wakeup.sh $target format 1> /dev/null 2> /dev/null &");
		sleep 20;
	}
	else {
		system ("/usr/local/bin/hdd_wakeup.sh $target 1> /dev/null 2> /dev/null &");
		sleep 20;
	}
	
ERROR_DISK_WAKEUP:
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub system_disk_model {
	my $device = shift;
	my $diskmodel = BufDiskModel->new;
	my $unit_name;
	
	$diskmodel->init;
#	$unit_name = $diskmodel->get_model($device);
	$unit_name = $diskmodel->get_model_real($device);
	if (!$unit_name) { $unit_name = "-"; }
	
	return $unit_name;
}

sub systeminfo_disk_capacity_all {
	my $device = shift;
	my $capacity_all;
	my $diskdf = BufDiskDf->new;
	my $text = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $i;
	my $status;

	for ($i = 1; $i <= 3; $i++) {
		$status = $diskdf->get_status($device);

		if ($status eq "unmount") {
			if ($i == 1) {
				$device =~ s/_1/_2/;
			}
			else {
				$device =~ s/_2/_5/;
			}
		}
		else {
			last;
		}
	}

	$capacity_all = $diskdf->get_all_space;
	$text->init($diskdf->get_all_space);
	if ($capacity_all) {
		$capacity_all = $text->ins_comma." KB";
	}
	else {
		$capacity_all = "-";
	}

	return $capacity_all;
}

sub systeminfo_disk_capacity_all_mntpoint {
	my $device = shift;
	my $capacity_all;
	my $diskdf = BufDiskDf->new;
	my $text = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $status;
	$status = $diskdf->get_status_mntpoint($device);
	$capacity_all = $diskdf->get_all_space;
	$text->init($diskdf->get_all_space);
	if ($capacity_all) {
		$capacity_all = $text->ins_comma." KB";
	}
	elsif ($device !~ m#/mnt/array#) {
		$capacity_all = "-";
	}

	return $capacity_all;
}

sub systeminfo_disk_capacity_used {
	my $device = shift;
	my $capacity_use;
	
	my $diskdf = BufDiskDf->new;
	my $text   = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $i;
	my $status;

	for ($i = 1; $i <= 3; $i++) {
		$status = $diskdf->get_status($device);

		if ($status eq "unmount") {
			if ($i == 1) {
				$device =~ s/_1/_2/;
			}
			else {
				$device =~ s/_2/_5/;
			}
		}
		else {
			last;
		}
	}

	$capacity_use = $diskdf->get_use_space;
	$text->init($diskdf->get_use_space);
	if ($capacity_use) {
		$capacity_use = $text->ins_comma." KB";
	}
	else {
		$capacity_use = "-";
	}

	return $capacity_use;
}

sub systeminfo_disk_capacity_used_mntpoint {
	my $device = shift;
	my $capacity_use;
	
	my $diskdf = BufDiskDf->new;
	my $text   = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $status;
	$status = $diskdf->get_status_mntpoint($device);

	$capacity_use = $diskdf->get_use_space;
	$text->init($diskdf->get_use_space);
	if ($capacity_use) {
		$capacity_use = $text->ins_comma." KB";
	}
	else {
		$capacity_use = "-";
	}

	return $capacity_use;
}

sub systeminfo_disk_capacity_pctused {
	my $device = shift;
	my $capacity_pctUse;
	
	my $diskdf = BufDiskDf->new;
	my $text = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $i;
	my $status;

	for ($i = 1; $i <= 3; $i++) {
		$status = $diskdf->get_status($device);

		if ($status eq "unmount") {
			if ($i == 1) {
				$device =~ s/_1/_2/;
			}
			else {
				$device =~ s/_2/_5/;
			}
		}
		else {
			last;
		}
	}

	$capacity_pctUse = $diskdf->get_use_rate;
	$text->init($diskdf->get_use_rate);
	if ($capacity_pctUse) {
		$capacity_pctUse = $text->ins_comma." %";
	}
	else {
		$capacity_pctUse = "-";
	}

	return $capacity_pctUse;
}

sub systeminfo_disk_capacity_pctused_mntpoint {
	my $device = shift;
	my $capacity_pctUse;
	
	my $diskdf = BufDiskDf->new;
	my $text = BufCommonTextConvert->new;
	my $flag = '';
	$diskdf->init;

	my $status;
	$status = $diskdf->get_status_mntpoint($device);

	$capacity_pctUse = $diskdf->get_use_rate;
	$text->init($diskdf->get_use_rate);
	if ($capacity_pctUse) {
		$capacity_pctUse = $text->ins_comma." %";
	}
	else {
		$capacity_pctUse = "-";
	}

	return $capacity_pctUse;
}

sub system_disk_format {
	my $device = shift;
	my $devlink = BufCommonDevLink->new;
	my $diskformat = BufDiskFormatType->new;
	my $format_type;
	
	$diskformat->init;
	$devlink->init;
	
	if ($device =~ m/sd[a-d]/) {
		$device = $devlink->get_dev_ls_diskx_6("$device");
	}
	
	$format_type = $diskformat->get_device_format_type($device);
	$format_type = &convert_diskname($format_type);
	
	if (!$format_type) {
		if ($device =~ m/usbdisk/) {
			$device =~ s/_1/_2/;
			$format_type = $diskformat->get_device_format_type($device);
			$format_type = &convert_diskname($format_type);
			if (!$format_type) {
				$device =~ s/_2/_5/;
				$format_type = $diskformat->get_device_format_type($device);
				$format_type = &convert_diskname($format_type);
				if (!$format_type) {
					$format_type = "-";
				}
			}
		}
		else {
			$format_type = "-";
		}
	}
	
	return $format_type;
}

sub system_disk_format_mntpoint {
	my $device = shift;
	my $devlink = BufCommonDevLink->new;
	my $diskformat = BufDiskFormatType->new;
	my $format_type;
	
	$diskformat->init;
	$devlink->init;
	
	$format_type = $diskformat->get_mount_format_type($device);
	$format_type = &convert_diskname($format_type);
	
	if (!$format_type) {
		if ($device =~ m/usbdisk/) {
			$device =~ s/_1/_2/;
			$format_type = $diskformat->get_mount_format_type($device);
			$format_type = &convert_diskname($format_type);
			if (!$format_type) {
				$device =~ s/_2/_5/;
				$format_type = $diskformat->get_mount_format_type($device);
				$format_type = &convert_diskname($format_type);
				if (!$format_type) {
					$format_type = "-";
				}
			}
		}
		else {
			$format_type = "-";
		}
	}
	
	return $format_type;
}

sub convert_diskname {
	my $name = shift;
	
	if ($name eq "xfs")		{ $name = "XFS"; }
	elsif ($name eq "ext3")	{ $name = "EXT3"; }
	elsif ($name eq "vfat")	{ $name = "FAT"; }
	elsif ($name eq "ntfs")	{ $name = "NTFS"; }
	elsif ($name eq "ufsd")	{ $name = "NTFS"; }

	return $name;
}

sub is_over2TB {
	my $disk = shift;
	
	my $devsize = "";
	my $res = readpipe("fdisk -l $disk");
	
	if($res =~ /Disk $disk: .* (\d+) bytes/)
	{
		$devsize = $1;
		if($devsize > 2 * 1024 * 1024 * 1024 * 1024)
		{
			return 1;
		} 
		else
		{
			return 0;
		}
	}
	else
	{
		return 0;
	}
}

1;
