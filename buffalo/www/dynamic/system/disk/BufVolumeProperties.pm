#!/usr/bin/speedy
;#############################################
;# BufVolumeProperties.pm
;# usage :
;#	$class = new BufVolumeProperties;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#############################################

package BufVolumeProperties;

use BufVolumeListInfo;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use strict;
use JSON;

my $old_name;

sub new {
	my $class = shift;
	my $self  = bless {
		name		=> [],
		desc		=> [],
		disk		=> [],
		diskSize	=> [],
		size		=> [],
		remain		=> [],
		amountUsed	=> [],
		percentUsed => [],
		fileFormat	=> [],
		encrypt 	=> [],
		
		diskAll 	=> [],
		sizeAll 	=> [],
		remainAll	=> [],
		encryptAll	=> []
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	my $key = shift;
	
	$self->load($old_name);
	
	# 編集の場合
	if ($key) {
		$old_name = $key;
	}
	
	return;
}

sub load {
	my $self = shift;
	my $i;
	my $j;
	
	# 初期化
	my $volume = BufVolumeListInfo->new;
	$volume->init();
	
	my @lv_list = $volume->get_lv_dev;		# name
	### NOTHING! ###				# desc
	my @lv_belong_vg = $volume->get_lv_belong_vg;	# disk
	my @vg_list = $volume->get_pv_vg_name;		# diskSize
	my @pv_total_pe = $volume->get_pv_total_pe;
	my @pv_free_pe = $volume->get_pv_free_pe;	# remain
	my @lv_total_pe = $volume->get_lv_total_pe;	# size
	
	for ($i=0;$i<@lv_list;$i++) {
		# name
		$lv_list[$i] =~ s#/dev/.+/lvm[0-9]+_##;
		$self->{name}->[$i] = $lv_list[$i];
		
		# desc
		$self->{desc}->[$i] = 'sample_desc';
		
		# disk
		if (($lv_belong_vg[$i] =~ m/(array[0-9])/) || ($lv_belong_vg[$i] =~ m/(disk[0-9])/)) {
			$self->{disk}->[$i] = $1;
		}
		
		# size
		$self->{size}->[$i] = $lv_total_pe[$i];
		
		# diskSize / remain
		for ($j=0; $j < @vg_list; $j++) {
			$vg_list[$j] =~ s#/dev/lvm_##;
			if ($self->{disk}->[$i] eq $vg_list[$j]) {
				$self->{diskSize}->[$i] = $pv_total_pe[$j];
				$self->{remain}->[$i] = $pv_free_pe[$j];
			}
		}
		
		# amountUsed / percentUsed
		$self->{amountUsed}->[$i] = '10.55';
		$self->{percentUsed}->[$i] = '12.3';
		
		# fileFormat
		$self->{fileFormat}->[$i] = 'xfs';
		
		# encrypt
		$self->{encrypt}->[$i] = 'on';
	}
	
	for ($i=0;$i<@vg_list;$i++) {
		# diskAll
		$self->{diskAll}->[$i] = $vg_list[$i];
		
		# sizeAll
		$self->{sizeAll}->[$i] = $pv_total_pe[$i];
		
		# remainAll
		$self->{remainAll}->[$i] = $pv_free_pe[$i];
		
		# encryptAll
		$self->{encryptAll}->[$i] = 'on';
	}
	
	return;
}

sub getVolumeList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{name}};
	my $i;
	
	for ($i=0; $i<$cnt; $i++) {
		push (@dataArray, {
			'name'		  => $self->{name}->[$i],
			'disk'		  => $self->{disk}->[$i],
			'size'		  => $self->{size}->[$i],
			'amountUsed'  => $self->{amountUsed}->[$i],
			'percentUsed' => $self->{percentUsed}->[$i],
			'fileFormat'  => $self->{fileFormat}->[$i],
			'encrypt'	  => $self->{encrypt}->[$i]
		});
	}
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub getVolumeSettings {
	my $self = shift;
	my $target_volume = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{name}};
	my $i;
	
	for ($i=0; $i<$cnt; $i++) {
		if ($target_volume eq $self->{name}->[$i]) {
			push (@dataArray, {
				'name'	   => $self->{name}->[$i],
				'desc'	   => $self->{desc}->[$i],
				'disk'	   => $self->{disk}->[$i],
				'diskSize' => $self->{diskSize}->[$i],
				'size'	   => $self->{size}->[$i],
				'remain'   => $self->{remain}->[$i]
			});
		}
	}
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub getDiskAreaList {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $cnt = @{$self->{diskAll}};
	my $i;
	
	for ($i=0; $i<$cnt; $i++) {
		push (@dataArray, {
			'disk'	  => $self->{diskAll}->[$i],
			'size'	  => $self->{sizeAll}->[$i],
			'remain'  => $self->{remainAll}->[$i],
			'encrypt' => $self->{encryptAll}->[$i]
		});
	}
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub setLvm {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $disk = $cgiRequest->param('disk');
	my $status = $cgiRequest->param('status');
	
	my $error = 0;
	my $jsnHash;
	
	# モード判定
	if ($status eq 'on') {
#		system("/usr/local/bin/lvm_control.sh LibLvmChangeLVM $disk 1>/dev/null 2>/dev/null");
	}
	else {
#		system("/usr/local/bin/lvm_control.sh LibLvmChangeRaw $disk 1>/dev/null 2>/dev/null");
	}
	
	# 完了表示
	$error = $? >> 8;
	if (!$error) {
		$jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	else {
		push @errors, "lvm_err1";
		$jsnHash = {'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	return to_json($jsnHash);
}

sub addVolume {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $name = $cgiRequest->param('name');
	my $desc = $cgiRequest->param('desc');
	my $disk = $cgiRequest->param('disk');
	my $size = $cgiRequest->param('size');
	my $encrypt = $cgiRequest->param('encrypt');
	
	my $error = 0;
	my $jsnHash;
	
	system ("/usr/local/bin/lvm_control.sh LibLvmCreateNewLv $disk $name $size 1>/dev/null 2>/dev/null");
	
	# 完了表示
	$error = $? >> 8;
	if (!$error) {
		$jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	else {
		push @errors, "lvm_err2";
		$jsnHash = {'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	return to_json($jsnHash);
}

sub delVolume {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $name = $cgiRequest->param('name');
	my $disk = $cgiRequest->param('disk');
	
	my $error = 0;
	my $jsnHash;
	
	system ("/usr/local/bin/lvm_control.sh LibLvmDeleteLv $disk $name 1>/dev/null 2>/dev/null");
	
	# 完了表示
	$error = $? >> 8;
	if (!$error) {
		$jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	else {
		push @errors, "lvm_err3";
		$jsnHash = {'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	return to_json($jsnHash);
}

sub setVolumeSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $name = $cgiRequest->param('name');
	my $desc = $cgiRequest->param('desc');
	my $disk = $cgiRequest->param('disk');
	my $size = $cgiRequest->param('size');
	my $enlargeSize = $cgiRequest->param('enlargeSize');
	my $addedSize = $cgiRequest->param('addedSize');
	my $size_total = $size + $addedSize;
	
	my $error_rename = 0;
	my $error_resize = 0;
	my $jsnHash;
	
	# 説明を書き込む
	### NOTHING
	
	# 名称変更する場合
	if (($old_name) && ($old_name ne $name)) {
		system ("/usr/local/bin/lvm_control.sh LibLvmRename $disk $old_name $name 1>/dev/null 2>/dev/null");
		$error_rename = $? >> 8;
	}
	
	# 拡張する場合
	if ($enlargeSize eq 'on') {
		system ("/usr/local/bin/lvm_control.sh LibLvmResize $disk $name $size_total 1>/dev/null 2>/dev/null");
		$error_resize = $? >> 8;
	}
	
	# 完了表示
	if (!$error_rename && !$error_resize) {
		$jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	else {
		if ($error_rename) {
			push @errors, "lvm_err4";
		}
		if ($error_resize) {
			push @errors, "lvm_err5";
		}
		$jsnHash = {'success'=>JSON::false, 'data'=>\@dataArray, 'errors'=>@errors };
	}
	return to_json($jsnHash);
}

1;
