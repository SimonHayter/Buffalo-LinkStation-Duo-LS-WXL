#!/usr/bin/speedy
;#############################################
;# BufArrayProperties.pm
;# usage :
;#	$class = new BufArrayProperties;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;#############################################

package BufArrayProperties;

use BufDiskInfo;
use BufDiskMDStatus;
use BufDiskModel;
use BufDiskPartition;
use BufShareListInfo;
use BufDiskFailShutdown;
use BufCommonTextConvert;

use WebAxsConfig;
use BufPocketU;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();
use BufCommonFileInfo;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		arrayName	  => [],
		arrayMode	  => [],
		arrayStatus	  => [],
		rateStatus	  => [],
		timeStatus	  => [],
		diskTotal	  => [],
		diskNormal	  => [],
		diskError	  => [],
		diskSpare	  => [],
		sizeAllRaw	  => [],
		sizeAllGB	  => [],
		sizeUsedRaw	  => [],
		sizeUsedGB	  => [],
		sizeUsedRate  => [],
		arrayFormat	  => [],
		editMode	  => [],
		canEDP		  => [],

		diskName	  => [],
		diskMode	  => [],
		diskModel	  => [],
		diskSize	  => [],
		diskSpareSet  => [],
		diskBaseEDP	  => [],
		diskAddEDP	  => [],

		diskRebuild	  => []

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load();

	return;
}

sub load {
	my $self  = shift;
	my @md_status;
	my @md_status_1;
	my @md_status_2;
	my $i;
	my $j;
	my $k;

	# 初期化
	my $disk = BufDiskInfo->new;
	my $mdstat = BufDiskMDStatus->new;
	my $format = BufDiskFormatType->new;
	my $model = BufDiskModel->new;
	my $partition = BufDiskPartition->new;
	my $devlink = BufCommonDevLink->new;
	my $common_info = BufCommonFileInfo->new();
	my $text = BufCommonTextConvert->new;

	$disk->init;
	$mdstat->init;
	$format->init;
	$model->init;
	$partition->init;
	$devlink->init;
	$common_info->init('/etc/melco/info');

	my @sizeAllRaw = $mdstat->get_array_size_all_raw;
	my @sizeAllGB = $mdstat->get_array_size_all_gb;
	my @sizeUsedRaw = $mdstat->get_array_size_use_raw;
	my @sizeUsedGB = $mdstat->get_array_size_use_gb;
	my @sizeUsedRate = $mdstat->get_array_size_use_rate;

	for ($i = 1; $i <= $gModel->is('MAX_ARRAY_NUM') ; $i++) {
		push @{$self->{arrayName}}, 'array'.$i;
		$self->{arrayMode}->[$i - 1] = $disk->get_array_mode($i);

		# RAID構成済みかどうか判定
		# RAID構築済みの場合
		if ($self->{arrayMode}->[$i - 1] ne 'off') {
			# RAID10以外
			if ($self->{arrayMode}->[$i - 1] ne 'raid10') {
				# ディスクリストの取得
				push @{$self->{diskTotal}->[$i - 1]}, $disk->get_array_disk_list($i);

				my $mdstat_get_status_path;
				unless ($disk->get_array_dev_list($i)) {
					$mdstat_get_status_path = "/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL');
				}
				else {
					$mdstat_get_status_path = "/dev/".$disk->get_array_dev_list($i);
				}
				@md_status = $mdstat->get_all_status($mdstat_get_status_path);

				# mdstatからエラー判定
				# エラーなら
				if (($md_status[0] eq "error") || (!$md_status[0])) {
					$self->{arrayStatus}->[$i - 1] = 'error';

					# エラーディスクの取得
					@{$self->{diskError}->[$i - 1]} = $mdstat->get_error_disk("/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL'));

					# RAID10以外の場合は、エラーディスクが2台あれば崩壊
					if (@{$self->{diskError}->[$i - 1]} >= 2) {
						# 消すしかない
						$self->{editMode}->[$i - 1] = 'delete';
					}
					else {
						# リビルド可能
						$self->{editMode}->[$i - 1] = 'rebuild';
					}
					# 稼働ディスクの取得
					for ($j = 0; $j < @{$self->{diskTotal}->[$i - 1]}; $j++) {
						my $flag = 0;
						for ($k = 0; $k < @{$self->{diskError}->[$i - 1]}; $k++) {
							if (${$self->{diskTotal}->[$i - 1]}[$j] eq ${$self->{diskError}->[$i - 1]}[$k]) {
								$flag = 1;
							}
						}

						if (!$flag) {
							push @{$self->{diskNormal}->[$i - 1]}, ${$self->{diskTotal}->[$i - 1]}[$j];
						}
					}
				}
				# エラーでなければ
				else {
					$self->{arrayStatus}->[$i - 1] = $md_status[0];
					$self->{editMode}->[$i - 1] = 'edit';

					# RAID構築済みでも、EDP+サポートなら
					if ($gModel->is('SUPPORT_EDP_PLUS')) {
						if ($disk->get_free_disk >= 1) {
							$self->{canEDP}->[$i - 1] = 1;
						}
					}

					# resync / recover / scan の場合
					if ($md_status[0] ne "ok") {
						$self->{rateStatus}->[$i - 1] = $md_status[1];
						$self->{timeStatus}->[$i - 1] = $md_status[2];

						# EDP不可
						$self->{canEDP}->[$i - 1] = 0;
					}

					# 稼働ディスクの取得
					@{$self->{diskNormal}->[$i - 1]} = @{$self->{diskTotal}->[$i - 1]};
				}

				# エラーの有無に拘わらず、取得すべき情報を取得
				# フォーマットの取得
#				@{$self->{arrayFormat}->[$i - 1]} = $format->get_device_format_type("/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL'));
				@{$self->{arrayFormat}->[$i - 1]} = $format->get_mount_format_type("/mnt/array".$i);

#				if (!@{$self->{arrayFormat}->[$i - 1]}) {
#					@{$self->{arrayFormat}->[$i - 1]} = $format->get_device_format_type("/dev/mapper/cbd_".$gModel->is('DEVICE_MD'.$i.'_REAL'));
#				}

				# サイズの取得(iSCSI)
				if ($common_info->get_info('workingmode') eq 'iSCSI') {
					@{$self->{sizeAllRaw}->[$i - 1]} = sprintf("%.0f", $partition->get_capacity("/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL')));
					$text->init(@{$self->{sizeAllRaw}->[$i - 1]});
					@{$self->{sizeAllRaw}->[$i - 1]} = $text->ins_comma;
					@{$self->{sizeAllGB}->[$i - 1]} = sprintf("%.1f", $partition->get_capacity("/dev/".$gModel->is('DEVICE_MD'.$i.'_REAL')) / 1024 / 1024);
				}
			}

			# RAID10
			else {
				# ディスクリストの取得
				push @{$self->{diskTotal}->[$i - 1]}, $disk->get_array_disk_list($i);

				@md_status_1 = $mdstat->get_all_status("/dev/".$gModel->is('DEVICE_MD1_REAL'));
				@md_status_2 = $mdstat->get_all_status("/dev/".$gModel->is('DEVICE_MD2_REAL'));

				if ((!$md_status_1[1]) || (($md_status_1[1] > $md_status_2[1]) && ($md_status_2[1]))) { $md_status_1[1] = $md_status_2[1]; }
				if ((!$md_status_1[2]) || ($md_status_1[2] < $md_status_2[2])) { $md_status_1[2] = $md_status_2[2]; }

				# mdstatからエラー判定
				# エラーなら
				if (($md_status_1[0] eq "error") || ($md_status_2[0] eq "error")) {
					$self->{arrayStatus}->[$i - 1] = 'error';

					# エラーディスクの取得
					my @diskError1 = $mdstat->get_error_disk("/dev/".$gModel->is('DEVICE_MD1_REAL'));
					my @diskError2 = $mdstat->get_error_disk("/dev/".$gModel->is('DEVICE_MD2_REAL'));
					my @diskError = @diskError1 + @diskError2;
					@{$self->{diskError}->[$i - 1]} = @diskError;

					# RAID10の場合は、エラーディスクが2台でも崩壊じゃない可能性有り
					# エラーディスク3台以上
					if (@{$self->{diskError}->[$i - 1]} > 3) {
						# 消すしかない
						$self->{editMode}->[$i - 1] = 'delete';
					}
					# エラーディスク2台 かつ 同一サブアレイの場合
					elsif (@{$self->{diskError}->[$i - 1]} > 1) {
						if ((@diskError1 > 1) || (@diskError2 > 1)){
							$self->{editMode}->[$i - 1] = 'delete';
						}
					}
					else {
						# リビルド可能
						$self->{editMode}->[$i - 1] = 'rebuild';
					}
					# 稼働ディスクの取得
					for ($j = 0; $j < @{$self->{diskTotal}->[$i - 1]}; $j++) {
						my $flag = 0;
						for ($k = 0; $k < @{$self->{diskError}->[$i - 1]}; $k++) {
							if (${$self->{diskTotal}->[$i - 1]}[$j] eq ${$self->{diskError}->[$i - 1]}[$k]) {
								$flag = 1;
							}
						}

						if (!$flag) {
							push @{$self->{diskNormal}->[$i - 1]}, ${$self->{diskTotal}->[$i - 1]}[$j];
						}
					}
				}
				else {
				# エラーでなければ
					$self->{editMode}->[$i - 1] = 'edit';

					# resync / recover / scan の場合
					if (($md_status_1[0] ne "ok") || ($md_status_2[0] ne "ok")){
						if (($md_status_1[0] eq 'resync') || ($md_status_2[0] eq 'resync')){
							$self->{arrayStatus}->[$i - 1] = 'resync';
						}
						elsif (($md_status_1[0] =~ 'recover') || ($md_status_2[0] =~ 'recover')){
							$self->{arrayStatus}->[$i - 1] = 'recover';
						}
						elsif (($md_status_1[0] eq 'scan') || ($md_status_2[0] eq 'scan')){
							$self->{arrayStatus}->[$i - 1] = 'scan';
						}

						$self->{rateStatus}->[$i - 1] = $md_status_1[1];
						$self->{timeStatus}->[$i - 1] = $md_status_1[2];
					}
					else {
						if ($md_status_1[0]) {
							$self->{arrayStatus}->[$i - 1] = $md_status_1[0];
						}
						else {
							$self->{arrayStatus}->[$i - 1] = $md_status_2[0];
						}
					}

					# 稼働ディスクの取得
					@{$self->{diskNormal}->[$i - 1]} = @{$self->{diskTotal}->[$i - 1]};
				}

				# エラーの有無に拘わらず、取得すべき情報を取得
				# フォーマットの取得
#				@{$self->{arrayFormat}->[$i - 1]} = $format->get_device_format_type("/dev/".$gModel->is('DEVICE_MD3_REAL'));
				@{$self->{arrayFormat}->[$i - 1]} = $format->get_mount_format_type("/mnt/array".$i);
#				if (!@{$self->{arrayFormat}->[$i - 1]}) {
#					@{$self->{arrayFormat}->[$i - 1]} = $format->get_device_format_type("/dev/mapper/cbd_".$gModel->is('DEVICE_MD3_REAL'));
#				}

				# サイズの取得(iSCSI)
				if ($common_info->get_info('workingmode') eq 'iSCSI') {
					@{$self->{sizeAllRaw}->[$i - 1]} = sprintf("%.0f", $partition->get_capacity("/dev/".$gModel->is('DEVICE_MD3_REAL')));
					$text->init(@{$self->{sizeAllRaw}->[$i - 1]});
					@{$self->{sizeAllRaw}->[$i - 1]} = $text->ins_comma;
					@{$self->{sizeAllGB}->[$i - 1]} = sprintf("%.1f", $partition->get_capacity("/dev/".$gModel->is('DEVICE_MD3_REAL')) / 1024 / 1024);
				}
			}

			# サイズの取得
			# (iSCSiモードの場合は、partitions情報をdf情報で上書きしない!)
			if ($common_info->get_info('workingmode') ne 'iSCSI') {
				@{$self->{sizeAllRaw}->[$i - 1]} = @sizeAllRaw[$i];
				@{$self->{sizeAllGB}->[$i - 1]} = @sizeAllGB[$i];
			}
			@{$self->{sizeUsedRaw}->[$i - 1]} = @sizeUsedRaw[$i];
			@{$self->{sizeUsedGB}->[$i - 1]} = @sizeUsedGB[$i];
			@{$self->{sizeUsedRate}->[$i - 1]} = @sizeUsedRate[$i];

			# スペアディスクの取得
			@{$self->{diskSpare}->[$i - 1]} = $disk->get_spare_disk_list;
		}
		# RAID未構築の場合
		else {
			# 通常モードが2台以上ある場合
			if ($disk->get_free_disk >= 2) {
				$self->{editMode}->[$i - 1] = 'create';
			}
			else {
				$self->{editMode}->[$i - 1] = 'none';
			}

			# EDP+可能であるかチェック
			if ($gModel->is('SUPPORT_EDP_PLUS')) {
				system("/usr/local/sbin/edp.sh checkedp disk1 1>/dev/null 2>/dev/null");
				my $is_edp_disk1 = $? >> 8;
				system("/usr/local/sbin/edp.sh checkedp disk2 1>/dev/null 2>/dev/null");
				my $is_edp_disk2 = $? >> 8;
				system("/usr/local/sbin/edp.sh checkedp disk3 1>/dev/null 2>/dev/null");
				my $is_edp_disk3 = $? >> 8;
				system("/usr/local/sbin/edp.sh checkedp disk4 1>/dev/null 2>/dev/null");
				my $is_edp_disk4 = $? >> 8;

				my $getsize_disk1 = readpipe("/usr/local/sbin/edp.sh getsize disk1 2>/dev/null");
				my $getsize_disk2 = readpipe("/usr/local/sbin/edp.sh getsize disk2 2>/dev/null");
				my $getsize_disk3 = readpipe("/usr/local/sbin/edp.sh getsize disk3 2>/dev/null");
				my $getsize_disk4 = readpipe("/usr/local/sbin/edp.sh getsize disk4 2>/dev/null");

				my $available_disk_count = 0;
				if ($getsize_disk1 > 0) {
					$available_disk_count++;
				}
				if ($getsize_disk2 > 0) {
					$available_disk_count++;
				}
				if ($getsize_disk3 > 0) {
					$available_disk_count++;
				}
				if ($getsize_disk4 > 0) {
					$available_disk_count++;
				}

				if ($available_disk_count >= 2) {
					if (($is_edp_disk1 == 0) && (($getsize_disk2 >= $getsize_disk1) || ($getsize_disk3 >= $getsize_disk1) || ($getsize_disk4 >= $getsize_disk1))) {
						@{$self->{diskBaseEDP}->[1]} = ('1');
					}
					if (($is_edp_disk2 == 0) && (($getsize_disk1 >= $getsize_disk2) || ($getsize_disk3 >= $getsize_disk2) || ($getsize_disk4 >= $getsize_disk2))) {
						@{$self->{diskBaseEDP}->[2]} = ('1');
					}
					if (($is_edp_disk3 == 0) && (($getsize_disk1 >= $getsize_disk3) || ($getsize_disk2 >= $getsize_disk3) || ($getsize_disk4 >= $getsize_disk3))) {
						@{$self->{diskBaseEDP}->[3]} = ('1');
					}
					if (($is_edp_disk4 == 0) && (($getsize_disk1 >= $getsize_disk4) || ($getsize_disk2 >= $getsize_disk4) || ($getsize_disk3 >= $getsize_disk4))) {
						@{$self->{diskBaseEDP}->[4]} = ('1');
					}

					my $available_edp_disk_count = 0;
					if (@{$self->{diskBaseEDP}->[1]}[0]) {
						$available_disk_count++;
					}
					if (@{$self->{diskBaseEDP}->[2]}[0]) {
						$available_edp_disk_count++;
					}
					if (@{$self->{diskBaseEDP}->[3]}[0]) {
						$available_edp_disk_count++;
					}
					if (@{$self->{diskBaseEDP}->[4]}[0]) {
						$available_edp_disk_count++;
					}

					if ($available_edp_disk_count) {
						$self->{canEDP}->[$i - 1] = 1;
					}
				}
			}
			# EDP可能であるかチェック
			elsif ($gModel->is('SUPPORT_EDP')) {
				system("/usr/local/sbin/edp.sh checkedp disk1 1>/dev/null 2>/dev/null");
				my $is_edp_disk1 = $? >> 8;
				system("/usr/local/sbin/edp.sh checkedp disk2 1>/dev/null 2>/dev/null");
				my $is_edp_disk2 = $? >> 8;

				my $getsize_disk1 = readpipe("/usr/local/sbin/edp.sh getsize disk1 2>/dev/null");
				my $getsize_disk2 = readpipe("/usr/local/sbin/edp.sh getsize disk2 2>/dev/null");

				if (($getsize_disk1 > 0) && ($getsize_disk2 > 0)) {
					if (($is_edp_disk1 == 0) && ($getsize_disk2 >= $getsize_disk1)) {
						@{$self->{diskBaseEDP}->[1]} = ('1');
					}
					if (($is_edp_disk2 == 0) && ($getsize_disk1 >= $getsize_disk2)) {
						@{$self->{diskBaseEDP}->[2]} = ('1');
					}

					if ((@{$self->{diskBaseEDP}->[1]}[0]) || (@{$self->{diskBaseEDP}->[2]}[0])) {
						$self->{canEDP}->[$i - 1] = 1;
					}
				}
			}
		}
	}

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $sizeTemp;
	my $deviceTemp;

	for ($i = 1; $i <= $cnt; $i++) {
		@{$self->{diskName}->[$i]} = 'disk'.$i;
		@{$self->{diskMode}->[$i]} = $disk->get_disk($i);
#		@{$self->{diskModel}->[$i]} = $model->get_model('disk'.$i);

#		$deviceTemp = '/dev/'.$gModel->is('DEVICE_HDD'.$i.'_REAL');
		$deviceTemp = $devlink->get_dev_sdx($i);

		@{$self->{diskModel}->[$i]} = $model->get_model_real($deviceTemp);
		$sizeTemp = $partition->get_capacity($deviceTemp);
		if (!$sizeTemp) {
			$deviceTemp =~ s/[0-9]$//;
			$sizeTemp = $partition->get_capacity($deviceTemp);
		}
		if ((!$sizeTemp) || ($disk->get_disk($i) eq 'standby')) {
#			@{$self->{diskSize}->[$i]} = 'none';
			@{$self->{diskSize}->[$i]} = '';
		}
		else {
			$sizeTemp = sprintf("%.1f", $sizeTemp / 1024 / 1024);
			@{$self->{diskSize}->[$i]} = $sizeTemp;
		}

		if ((($disk->get_disk($i) =~ m#^degrade#) || ($disk->get_disk($i) =~ m#^remove#)) && ($devlink->get_connect($i))) {
			@{$self->{diskRebuild}->[$i]} = 1;
		}
	}

	return;
}

sub getArrayList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{arrayName}};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {
			'arrayName'    => $self->{arrayName}->[$i],
			'arrayMode'    => $self->{arrayMode}->[$i],
			'arrayStatus'  => $self->{arrayStatus}->[$i],
			'rateStatus'   => $self->{rateStatus}->[$i],
			'timeStatus'   => $self->{timeStatus}->[$i],
			'diskTotal'    => $self->{diskTotal}->[$i],
			'diskNormal'   => $self->{diskNormal}->[$i],
			'diskError'    => $self->{diskError}->[$i],
			'diskSpare'    => $self->{diskSpare}->[$i],
			'sizeAllRaw'   => $self->{sizeAllRaw}->[$i],
			'sizeUsedRaw'  => $self->{sizeUsedRaw}->[$i],
			'sizeUsedRate' => $self->{sizeUsedRate}->[$i],
			'arrayFormat'  => $self->{arrayFormat}->[$i],
			'editMode' => $self->{editMode}->[$i],
			'canEDP' => $self->{canEDP}->[$i],
			'arrayDiskNum'	=> $#{$self->{diskTotal}->[$i]} + 1
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => @errors
	};

	return to_json($jsnHash);
}

sub getArraySettings {
	my $self = shift;
	my $target = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{arrayName}};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		if ($self->{arrayName}->[$i] eq $target) {
			push (@dataArray, {
				'arrayName'   => $self->{arrayName}->[$i],
				'arrayMode'   => $self->{arrayMode}->[$i],
				'arrayStatus' => $self->{arrayStatus}->[$i],
				'diskTotal'   => $self->{diskTotal}->[$i],
				'diskNormal'  => $self->{diskNormal}->[$i],
				'diskError'   => $self->{diskError}->[$i],
				'diskSpare'   => $self->{diskSpare}->[$i]
			});
		}
	}

	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub getArrayEditInfo {
	my $self = shift;
	my $target = shift;
	my @errors = ();
	my @dataArray = ();
	my @dataArray2 = ();

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $i;

	my $rmm - 0;
	if ($target =~ /_rmm/) {
		$rmm = 1;
	}
	$target =~ s#_rmm##;

	my $target_num = $target;
	$target_num =~ s#array##;

	push (@dataArray2, {
		'arrayName'	=> $self->{arrayName}->[$target_num - 1],
		'arrayMode'	=> $self->{arrayMode}->[$target_num - 1],
		'arraySize'	=> $self->{sizeAllGB}->[$target_num - 1]
	});

	my $disk = BufDiskInfo->new;
	$disk->init();
	my @mode_list = $disk->get_all_disk_mode;

	for ($i = 1; $i <= $cnt; $i++) {
		if (($gModel->is('SUPPORT_HOT_SWAP')) || ($self->{arrayMode}->[$target_num - 1] eq 'off') || ($rmm)) {
			if (($mode_list[$i] eq $target) || ($mode_list[$i] =~ m#^normal#) || ($mode_list[$i] eq 'standby')) {
				push (@dataArray, {
					'diskName'		=> $self->{diskName}->[$i],
					'diskMode'		=> $self->{diskMode}->[$i],
					'diskModel'		=> $self->{diskModel}->[$i],
					'diskSize'		=> $self->{diskSize}->[$i],
					'diskSpareSet'	=> $self->{diskMode}->[$i],
					'diskBaseEDP'	=> $self->{diskBaseEDP}->[$i]
				});
			}
		}
		else {
			if ($mode_list[$i] eq $target) {
				push (@dataArray, {
					'diskName'		=> $self->{diskName}->[$i],
					'diskMode'		=> $self->{diskMode}->[$i],
					'diskModel'		=> $self->{diskModel}->[$i],
					'diskSize'		=> $self->{diskSize}->[$i],
					'diskSpareSet'	=> $self->{diskMode}->[$i],
					'diskBaseEDP'	=> $self->{diskBaseEDP}->[$i]
				});
			}
		}
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'data2' => \@dataArray2,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getArrayRebuildInfo {
	my $self = shift;
	my $target = shift;
	my @errors = ();
	my @dataArray = ();
	my @dataArray2 = ();

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $i;
	my $target_num = $target;
	$target_num =~ s#array##;

	push (@dataArray2, {
		'arrayName'	=> $self->{arrayName}->[$target_num - 1],
		'arrayMode'	=> $self->{arrayMode}->[$target_num - 1],
		'arraySize'	=> $self->{sizeAllGB}->[$target_num - 1]
	});
	my $array_mode = $self->{arrayMode}->[$target_num - 1];

	my $disk = BufDiskInfo->new;
	$disk->init();
	my @mode_list = $disk->get_all_disk_mode;

	my $recover_counter = 0;

	my $devlink = BufCommonDevLink->new;
	$devlink->init;

	for ($i = 1; $i <= $cnt; $i++) {
		if (($mode_list[$i] eq $target) || ($mode_list[$i] =~ m#degrade#) || (($mode_list[$i] =~ m#remove#) && ($devlink->get_connect($i)))) {
			if (
				($mode_list[$i] eq $target) ||
				(($array_mode eq 'raid5') && ($recover_counter < 1)) ||
				(($array_mode eq 'raid1') && ($recover_counter < 1)) ||
				(($array_mode eq 'raid10') && ($recover_counter < 2)) ||
				(($array_mode eq 'raid6') && ($recover_counter < 2))
			) {
				push (@dataArray,
					{
						'diskName'		=> $self->{diskName}->[$i],
						'diskMode'		=> $self->{diskMode}->[$i],
						'diskModel'		=> $self->{diskModel}->[$i],
						'diskSize'		=> $self->{diskSize}->[$i],
						'diskRebuild'	=> $self->{diskRebuild}->[$i]
					});
			}

			if (($mode_list[$i] =~ m#degrade#) || (($mode_list[$i] =~ m#remove#) && ($devlink->get_connect($i)))) {
				$recover_counter++;
			}
		}
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'data2' => \@dataArray2,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getArrayCreateInfo {
	my $self = shift;
	my $target = shift;
	my @errors = ();
	my @dataArray = ();
	my @dataArray2 = ();
	my $temp;

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $i;

	$target =~ s#array##;
	push (@dataArray2, {
		'arrayName'	=> $self->{arrayName}->[$target - 1],
		'arrayMode'	=> $self->{arrayMode}->[$target - 1],
		'arraySize'	=> $self->{sizeAllGB}->[$target - 1]
	});

	my $disk = BufDiskInfo->new;
	$disk->init();
	my @mode_list = $disk->get_all_disk_mode;

	for ($i = 1; $i <= $cnt; $i++) {
		if ($mode_list[$i] =~ m#^normal#){
			push (@dataArray, {
				'diskName'		=> $self->{diskName}->[$i],
				'diskMode'		=> $self->{diskMode}->[$i],
				'diskModel'		=> $self->{diskModel}->[$i],
				'diskSize'		=> $self->{diskSize}->[$i],
				'diskSpareSet'	=> $self->{diskMode}->[$i]
			});
		}
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'data2' => \@dataArray2,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getArrayCreatableMode {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	my $normal = 0;

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $i;

	my $disk = BufDiskInfo->new;
	$disk->init();
	my @normal = $disk->get_free_disk();

	if (@normal == $cnt) {
		if ($gModel->is('SUPPORT_RAID0')) {
			push (@dataArray, {
				'mode'	=> 'raid0'
			});
		}
	}

	if (@normal >= 2) {
		if ($gModel->is('SUPPORT_RAID1')) {
			push (@dataArray, {
				'mode'	=> 'raid1'
			});
		}
	}

	if (@normal >= 3) {
		if ($gModel->is('SUPPORT_RAID5')) {
			push (@dataArray, {
				'mode'	=> 'raid5'
			});
		}
	}

	if (@normal >= 4) {
		if ($gModel->is('SUPPORT_RAID10')) {
			push (@dataArray, {
				'mode'	=> 'raid10'
			});
		}

		if ($gModel->is('SUPPORT_RAID6')) {
			push (@dataArray, {
				'mode'	=> 'raid6'
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

sub getArrayEdpBaseDisk {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	if (@{$self->{diskBaseEDP}->[1]}[0]) {
		push (@dataArray, {
			'basedisk'	=> 'disk1'
		});
	}
	if (@{$self->{diskBaseEDP}->[2]}[0]) {
		push (@dataArray, {
			'basedisk'	=> 'disk2'
		});
	}
	if (@{$self->{diskBaseEDP}->[3]}[0]) {
		push (@dataArray, {
			'basedisk'	=> 'disk3'
		});
	}
	if (@{$self->{diskBaseEDP}->[4]}[0]) {
		push (@dataArray, {
			'basedisk'	=> 'disk4'
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub changeSpare {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_SPARE;
	}

	my $target = $cgiRequest->param('target');
	my $target_no = $target;
	$target_no =~ s#disk##;

	my $disk = BufDiskInfo->new;
	$disk->init;

	my $share = BufShareListInfo->new;
	$share->init;

	my $raidfail = BufDiskFailShutdown->new;
	$raidfail->init();

	if ($disk->get_disk($target_no) eq 'standby') {
		$disk->set_disk($target_no, 'normal');

		# コマンド発行
		system ("/usr/local/bin/hdd_wakeup.sh $target format 1> /dev/null 2> /dev/null &");
		sleep 20;
	}
	else {
		# 障害発生時のシャットダウン設定を強制解除
		$raidfail->set_status('off');
		$raidfail->save;

		# 共有フォルダ情報から対象アレイの共有フォルダを消去
		my @share_name = $share->get_name;
		my @share_disk = $share->get_drive;
		my $i;

		# Webアクセス3.0
		my $webaxs = WebAxsConfig->new();
		my $pocketu = BufPocketU->new;
		$pocketu->init;

		for ($i=0; $i<@share_disk; $i++) {
			if ($target eq $share_disk[$i]) {
				$share->set_remove_share($share_name[$i], 'raid');

				$webaxs->deleteShare($share_name[$i]);
				$pocketu->deleteShare($share_name[$i]);
			}
		}
		$disk->set_disk($target_no, 'standby');
		$webaxs->restartWebAxs();

		# コマンド発行
		system ("/usr/local/bin/hdd_standby.sh $target 1> /dev/null 2> /dev/null &");
		sleep 10;
	}

	$disk->save($gModel->is('MAX_DISK_NUM'), $gModel->is('MAX_ARRAY_NUM'), $gModel->is('MAX_USBDISK_NUM'));
	sleep 10;

ERROR_SPARE:
	my $jsnHash = {
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub beforeChangeArray {
	# 現在のdiskinfoをバックアップ
	system("cp /etc/melco/diskinfo /etc/melco/diskinfo.bak");

	# mkraid_ready作成(LCD RAIDアレイ不整合エラー判定用)
	system("touch /var/lock/mkraid_ready");

	# mkraid、mkraid_statusがなぜか残っている場合は削除
	if ( -f '/var/lock/mkraid') {
		system ("rm -f /var/lock/mkraid");
	}
	if ( -f '/var/lock/mkraid_status') {
		system ("rm -f /var/lock/mkraid_status");
	}
}

sub deleteArray {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	my $temp;

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_RAID_DELETE;
	}

	my $target = $cgiRequest->param('target');
	my $target_num = $target;
	$target_num =~ s#array##;

	my $disk = BufDiskInfo->new;
	my $share = BufShareListInfo->new;
	$disk->init;
	$share->init;

	my @array_list = $disk->get_array_disk_list($target_num);
	my $array_list = join (" ", @array_list);
	beforeChangeArray();

	# 新しいdiskinfoを生成
	for ($i = 0; $i < @array_list; $i++) {
		$temp = $array_list[$i];
		$temp =~ s#disk##;
		$disk->set_disk($temp, 'normal');
	}
	$disk->set_array($target_num, 'off');

	$disk->save($gModel->is('MAX_DISK_NUM'), $gModel->is('MAX_ARRAY_NUM'), $gModel->is('MAX_USBDISK_NUM'));

	# 共有フォルダ情報から対象アレイの共有フォルダを消去
	my @share_name = $share->get_name;
	my @share_disk = $share->get_drive;
	my $i;

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	my $pocketu = BufPocketU->new;

	for ($i=0; $i<@share_disk; $i++) {
		if ($target eq $share_disk[$i]) {
			$share->set_remove_share($share_name[$i], 'raid');

			$webaxs->deleteShare($share_name[$i]);
			$pocketu->deleteShare($share_name[$i]);
		}
	}
	$webaxs->restartWebAxs();

	# コマンド発行
	system ("/usr/local/bin/erase_raid.sh $target $array_list 1> /dev/null 2> /dev/null &");
	sleep 5;

ERROR_RAID_DELETE:
	my $jsnHash = {
		'success' => JSON::false,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub createArray {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $cnt = @{$self->{arrayName}};
	my $i;
	my $j;
	my $temp;

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_RAID_CREATE;
	}

	my $arrayName = $cgiRequest->param('array');
	my $target_num = $arrayName;
	$target_num =~ s#array##;
	my $arrayMode = $cgiRequest->param('mode');
	my @arrayDisk = $cgiRequest->param('disk');
	my $arrayDisk = join (" ", @arrayDisk);

	my $disk = BufDiskInfo->new;
	my $share = BufShareListInfo->new;
	$disk->init;
	$share->init;

	beforeChangeArray();

	# 新しいdiskinfoを生成
	for ($i = 0; $i < @arrayDisk; $i++) {
		$temp = $arrayDisk[$i];
		$temp =~ s#disk##;
		$disk->set_disk($temp, $arrayName);
	}
	$disk->set_array($target_num, $arrayMode);

	$disk->save($gModel->is('MAX_DISK_NUM'), $gModel->is('MAX_ARRAY_NUM'), $gModel->is('MAX_USBDISK_NUM'));

	# 共有フォルダ情報から対象アレイの共有フォルダを消去
	my @share_name = $share->get_name;
	my @share_disk = $share->get_drive;

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	my $pocketu = BufPocketU->new;

	for ($j=0; $j<@arrayDisk; $j++) {
		for ($i=0; $i<@share_disk; $i++) {
			if ($arrayDisk[$j] eq $share_disk[$i]) {
				$share->set_remove_share($share_name[$i], 'raid');

				$webaxs->deleteShare($share_name[$i]);
				$pocketu->deleteShare($share_name[$i]);
			}
		}
	}
	$webaxs->restartWebAxs();

	# コマンド発行
	system ("/usr/local/bin/mk".$arrayMode.".sh $arrayName $arrayDisk 1> /dev/null 2> /dev/null &");
	sleep 5;

ERROR_RAID_CREATE:
	my $jsnHash = {
		'success' => JSON::false,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub rebuildArray {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	my $temp;
	my $target_disk;
	my $target_disk_num;

	if (-f '/var/lock/disk') {
		push @errors, "diskDiskFormatMsg";
		goto ERROR_RAID_REBUILD;
	}

	my $target = $cgiRequest->param('target');
	my $target_num = $target;
	$target_num =~ s#array##;

	my $cnt = $gModel->is('MAX_DISK_NUM');
	my $disk = BufDiskInfo->new;
	$disk->init();
	my @mode_list = $disk->get_all_disk_mode;

	for ($i = 1; $i <= $cnt; $i++) {
		if ((($mode_list[$i] =~ m#^degrade#) && $self->{diskRebuild}->[$i]) || (($mode_list[$i] =~ m#^remove#) && $self->{diskRebuild}->[$i])) {
			$target_disk = 'disk'.$i;
			$target_disk_num = $i;

			$i = $cnt + 1;
		}
	}

	beforeChangeArray();

	# コマンド発行
	system ("/usr/local/bin/raid_rebuild.sh $target $target_disk 1> /dev/null 2> /dev/null &");
	sleep 5;

ERROR_RAID_REBUILD:
	my $jsnHash = {
		'success' => JSON::false,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub edpArray {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $targetArray = $cgiRequest->param('targetArray');
	my $baseDisk = $cgiRequest->param('baseDisk');
	my $addDisk = $cgiRequest->param('addDisk');
	my $nextMode = $cgiRequest->param('nextMode');

	if (-f '/usr/local/bin/raid_util.sh') {
		unless ($nextMode eq 'expansion') {
			if ($baseDisk) {
				system ("/usr/local/bin/raid_util.sh $targetArray migration $nextMode --base=$baseDisk --add=$addDisk 1>/dev/null 2>/dev/null &");
	}
			else {
				system ("/usr/local/bin/raid_util.sh $targetArray migration $nextMode --base=$targetArray --add=$addDisk 1>/dev/null 2>/dev/null &");
			}
		}
		else {
			system ("/usr/local/bin/raid_util.sh $targetArray expansion --base=$targetArray --add=$addDisk 1>/dev/null 2>/dev/null &");
		}
	}
	else {
		system ("/usr/local/sbin/edp.sh create $targetArray $baseDisk $addDisk 1>/dev/null 2>/dev/null &");
	}

	sleep 5;

	my $jsnHash = {
		'success' => JSON::false,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
