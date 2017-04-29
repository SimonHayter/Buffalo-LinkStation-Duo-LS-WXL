#!/usr/bin/speedy
;##############################
;# BufTimemachine.pm
;# 
;# usage :
;#	$class = BufTimemachine->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufTimemachine;

use strict;
use JSON;

use CGI;
use BufCommonFileInfo;
use BufShareInfo;

sub new {
	my $class = shift;
	my $self  = bless {
		time_machine_status =>	undef,
		time_machine_dir	=>	undef,
		lock				=>	undef

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
	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/time_machine');

	$self->{lock} = 0;

	$self->{time_machine_status} = $info->get_info('time_machine_status');
	if ($self->{time_machine_status} eq '') {
		$self->{time_machine_status} = 'off';
	}
	if ($self->{time_machine_status} eq 'off') {
		$self->{lock} = 1;
	}

	$self->{time_machine_dir} = $info->get_info('time_machine_dir');
	if ($self->{time_machine_dir} !~ m#/mnt/usbdisk[1-4]#) {
		$self->{time_machine_dir} =~ s#/mnt/.*?/##;
	}
	else {
		$self->{time_machine_dir} =~ s#/mnt/##;
	}
	$self->{time_machine_dir} =~ s#/$##;

	if (-f '/var/lock/time_machine') {
		$self->{lock} = 2;
	}

	return;
}

sub getTimemachineSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'time_machine_status' => $self->{time_machine_status},
		'time_machine_dir'	  => $self->{time_machine_dir}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setTimemachineSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $info = BufCommonFileInfo->new();
	$info->init('/etc/melco/time_machine');

	$info->set_info('time_machine_status' ,$q->param('time_machine_status'));
	if ($q->param('time_machine_status') eq 'on') {
		if ($q->param('time_machine_dir') =~ m#^/mnt/#) {
			$info->set_info('time_machine_dir', $q->param('time_machine_dir'));
			$self->{time_machine_dir} = $q->param('time_machine_dir');
		}
	}
	$info->save();

	my $info2 = BufCommonFileInfo->new();
	$info2->init('/etc/melco/info');

	if ($q->param('time_machine_status') eq 'on') {
		$info2->set_info('atalk', 'on');
	}
	$info2->save();

	if ($self->{time_machine_dir} !~ m#/mnt/usbdisk[1-4]#) {
		$self->{time_machine_dir} =~ s#/mnt/.*?/##;
	}
	else {
		$self->{time_machine_dir} =~ s#/mnt/##;
	}
	$self->{time_machine_dir} =~ s#/$##;
	my $share = BufShareInfo->new();

	$share->init($self->{time_machine_dir});
	$share->set_os_mac('1');
	if ($share->get_trashbox eq 'off') {
		$share->set_trashbox('0');
	}
	else {
		$share->set_trashbox('1');
	}

	$share->save;

	system('/etc/init.d/atalk.sh restart 1> /dev/null 2> /dev/null &');

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getTimemachineFolders {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	use BufDiskInfo;
	use BufShareListInfo;
	use BufUsbStorageListInfo;
	use BufCommonBDU;

	my $disk		   = BufDiskInfo->new;
	my $share_list	   = BufShareListInfo->new;
	my $usbshare_list  = BufShareListInfo->new;
	my $usbdisk_status = BufUsbStorageListInfo->new;
	my $bdu 		   = BufCommonBDU->new;
	   $disk->init;
	   $share_list->init;
	   $usbshare_list->init('usb');
	   $usbdisk_status->init;
	my @share		 = $share_list->get_name;
	my @drive		 = $share_list->get_drive;
	my @usbshare	 = $usbshare_list->get_name;
	my @usbdrive	 = $usbshare_list->get_drive;
	my @usbdisk_guid = $usbdisk_status->get_guid;
	my @share_bdu;
	my $usb_guid;
	my @data;

	my $i;
	my $j;

	for ($i=0; $i<@share; $i++) {
#		push @data, $share[$i];
#		push @data, '/mnt/'.$drive[$i].'/'.$share[$i];
		push(@dataArray, {	'opt' => $share[$i],
					'val' => '/mnt/'.$drive[$i].'/'.$share[$i]});

		# 2Kwڂ͑ΏۂƂȂ
		if (0) {
			$bdu->init('/mnt/'.$drive[$i].'/'.$share[$i]);
			@share_bdu = $bdu->get_bdu_list;
			for ($j=0; $j<@share_bdu; $j++) {

				# pX̒80byteĂ΃XLbv
				if (length($share[$i].'/'.$share_bdu[$j]) > 80) {
					next;
				}

				# USBfBXNւ̃V{bNN͕\Ȃ
				if ($share_bdu[$j] eq 'usbdisk1') {
					if (!system ('test -L '.'/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]) & 127) {
						next;
					}
				}

#				push @data, $share[$i].'/'.$share_bdu[$j];
#				push @data, '/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j];
				push(@dataArray, {	'opt' => $share[$i].'/'.$share_bdu[$j],
							'val' => '/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]});
			}
		}
	}

# USBfBXN͑ΏۂƂȂ
#	for ($i=0; $i<@usbshare; $i++) {
	for ($i=0; $i<0; $i++) {
		   if ($usbshare[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
		elsif ($usbshare[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
		elsif ($usbshare[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
		elsif ($usbshare[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
		else								{ $usb_guid = ""; }

		if ($usb_guid) {
#			push @data, $usbshare[$i];
#			push @data, '/mnt/'.$usbshare[$i];
			push(@dataArray, {	'opt' => $usbshare[$i],
						'val' => '/mnt/'.$usbshare[$i]});

			$bdu->init('/mnt/'.$usbshare[$i]);
			@share_bdu = $bdu->get_bdu_list;
			for ($j=0; $j<@share_bdu; $j++) {
				# pX̒80byteĂ΃XLbv
				if (length($usbshare[$i].'/'.$share_bdu[$j]) > 80) {
					next;
				}

#				push @data, $usbshare[$i].'/'.$share_bdu[$j];
#				push @data, '/mnt/'.$usbshare[$i].'/'.$share_bdu[$j];
				push(@dataArray, {	'opt' => $usbshare[$i].'/'.$share_bdu[$j],
							'val' => '/mnt/'.$usbshare[$i].'/'.$share_bdu[$j]});
			}
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getTimemachineImage {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'lock' => $self->{lock}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub createTimemachineImage {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $host = $q->param('host');
	my $mac  = $q->param('mac');
	$mac = lc($mac);

	if ($mac !~ m#[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]:[0-9a-f][0-9a-f]#) {
		push @errors, "timemachine_err1";
	}

	if (!@errors) {
		system("/etc/init.d/setup_sparsebundle.sh $host $mac 1> /dev/null 2> /dev/null &");
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
