#!/usr/bin/speedy
;##############################
;# BufMediaserver.pm
;#
;# usage :
;#	$class = BufMediaserver->new();
;# (C) 2011 BUFFALO INC. All rights reserved.
;##############################

package BufMediaserver;

use strict;
use JSON;

use CGI;
use BUFFALO::MediaServer::PacketVideo;
use BUFFALO::MediaServer::MtDaapd;
use BUFFALO::Common::Model;
use BufCommonFileInfo;
use BufNasFeature;

my $gModel = BUFFALO::Common::Model->new();

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';
my $sid = 999999;


sub new {
	my $class = shift;
	my $self  = bless {
		service_dlna   =>  undef,
		service_itunes	 =>  undef,
		service_squeezebox	 =>  undef,
		folder_dlna	  =>  undef,
		folder_itunes	  =>  undef,
		folder_squeezebox	  =>  undef,

		usblink   =>  undef,
		status	  =>  undef,
		auto	  =>  undef,
		freq	  =>  undef,
		freq_char =>  undef,
		inotify   =>  undef,
		allow	  =>  [],
		mac 	  =>  [],
		ip		  =>  [],
		name	  =>  [],
		dtcp_stat =>  undef,
		dtcp_ver  =>  undef,
		dtcp_disk =>  undef,

		squeezebox_port => undef

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
	my $dlna = BUFFALO::MediaServer::PacketVideo->new();
	my $daap = BUFFALO::MediaServer::MtDaapd->new();

	$self->{service_dlna} = $dlna->get_status();
	$self->{service_itunes} = $daap->get_status();

	$self->{folder_dlna}  = $dlna->get_folder_base();
	if ($self->{folder_dlna} !~ m#/mnt/usbdisk[1-4]#) {
		$self->{folder_dlna} =~ s#/mnt/.*?/##;
	}
	else {
		$self->{folder_dlna} =~ s#/mnt/##;
	}
	$self->{folder_dlna} =~ s#/$##;

	$self->{folder_itunes}	= $daap->get_folder_base();
	if ($self->{folder_itunes} !~ m#/mnt/usbdisk[1-4]#) {
		$self->{folder_itunes} =~ s#/mnt/.*?/##;
	}
	else {
		$self->{folder_itunes} =~ s#/mnt/##;
	}
	$self->{folder_itunes} =~ s#/$##;

	$self->{usblink}  = $dlna->get_usbdisk_support();
	$self->{auto}	  = $dlna->get_db_refresh_mode();

	$self->{freq}	  = $dlna->get_db_refresh_cycle();
	if ($self->{freq} == -1) {
		$self->{freq} = '';
		$self->{freq_char} = 'Synchronize I/O';
		$self->{inotify} = 'on';
	}
	else {
		$self->{freq_char} = $self->{freq};
		$self->{inotify} = 'off';
	}
	if ($self->{freq} == 0) {
		$self->{freq_char} = '';
		$self->{freq} = '';
	}

	@{$self->{allow}} = $dlna->get_list_client_status();
	@{$self->{mac}}   = $dlna->get_list_client_mac();
	@{$self->{ip}}	  = $dlna->get_list_client_ip();
	@{$self->{name}}  = $dlna->get_list_client_devicename();

	if ($gModel->is('SUPPORT_DTCP_IP')) {
		if ($gModel->is('PID') ne '0x00000012') {
			if (-f '/etc/melco/majishanzu/majishanzu_state') {
				my $info = BufCommonFileInfo->new();
				$info->init('/etc/melco/majishanzu/majishanzu_state');

				if ($info->get_info('Status') eq '0') {
					$self->{dtcp_stat} = 'ok';
					$self->{dtcp_ver} = $info->get_info('Version');
				}
				else {
					$self->{dtcp_stat} = 'fail';
				}
			}
			else {
				if (-f '/usr/local/sbin/majishanzu') {
					$self->{dtcp_stat} = 'fail';
				}
			}
		}

		my $info2 = BufCommonFileInfo->new();
		$info2->init('/etc/melco/dlnaserver');
		$self->{dtcp_disk} = $info2->get_info('diskinfo');
		$self->{dtcp_disk} =~ s#/mnt/##;
	}

	# for debug
	my $debug = undef;

#	$debug = 'ok';
#	$debug = 'ng';
#	$debug = 'no_support';

	if ($debug) {
		if ($debug eq 'ok') {
			$self->{dtcp_stat} = 'ok';
			$self->{dtcp_ver} = '1.22';
		}
		elsif ($debug eq 'ng') {
			$self->{dtcp_stat} = 'fail';
			$self->{dtcp_ver} = undef;
		}
		else {
			$self->{dtcp_stat} = undef;
			$self->{dtcp_ver} = undef;
		}
	}

	if ($gModel->is('SUPPORT_SQUEEZEBOX')) {
		my $squeeze_info = BufCommonFileInfo->new();
		$squeeze_info->init('/etc/melco/squeezeboxserver/squeezeboxserver_service');

		$self->{service_squeezebox} = $squeeze_info->get_info('service');

		$self->{folder_squeezebox} = $squeeze_info->get_info('audiodir');
		$self->{folder_squeezebox} =~ s#^"##;
		$self->{folder_squeezebox} =~ s#"$##;

		if ($self->{folder_squeezebox} !~ m#/mnt/usbdisk[1-4]#) {
			$self->{folder_squeezebox} =~ s#/mnt/.*?/##;
		}
		else {
			$self->{folder_squeezebox} =~ s#/mnt/##;
		}
		$self->{folder_squeezebox} =~ s#/$##;

		$self->{squeezebox_port} = $squeeze_info->get_info('httpport');
	}

	return;
}

sub getMediaserverDlnaSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'service'	=> $self->{service_dlna},
		'folder'	=> $self->{folder_dlna},
		'usblink'	=> $self->{usblink},
		'auto'		=> $self->{auto},
		'freq'		=> $self->{freq},
		'freq_char' => $self->{freq_char},
		'inotify'	=> $self->{inotify},
		'dtcp_stat' => $self->{dtcp_stat},
		'dtcp_ver'	=> $self->{dtcp_ver},
		'dtcp_disk'	=> $self->{dtcp_disk}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getMediaserverItunesSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'service'	=> $self->{service_itunes},
		'folder'	=> $self->{folder_itunes}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getMediaserverSqueezeboxSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'service'	=> $self->{service_squeezebox},
		'folder'	=> $self->{folder_squeezebox},
		'squeezebox_port'	=> $self->{squeezebox_port}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setMediaserverDlnaSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	if ($q->param('service') eq 'on') {
		if ($q->param('auto') eq 'on') {
			if ($q->param('inotify') ne 'on') {
				if ($q->param('freq') eq '') {
					push @errors, "mediaserver_err1";
				}
			}
		}
	}

  if (!@errors) {
    if($q->param('folder') =~ /`/) {
				push @errors, "mediaserver_err3";
    }
  }
	
	if (!@errors) {
		my $dlna = BUFFALO::MediaServer::PacketVideo->new();

		$dlna->set_status($q->param('service'));
		if ($q->param('service') eq 'on') {
			if ($q->param('folder') =~ m#^/mnt/#) {
				$dlna->set_folder_base($q->param('folder'));
			}
		}
		$dlna->set_usbdisk_support($q->param('usblink'));
		$dlna->set_db_refresh_mode($q->param('auto'));

		if ($q->param('auto') eq 'on') {
			if ($q->param('inotify') eq 'on') {
				$dlna->set_db_refresh_cycle('-1');
			}
			else {
				$dlna->set_db_refresh_cycle($q->param('freq'));
			}
		}
		my $dtcp_disk = $q->param('dtcp_disk');
		$dtcp_disk = '/mnt/'.$dtcp_disk;
		$dlna->set_dtcp_disk($dtcp_disk);

		$dlna->save();

		if ($q->param('rescan') eq 'on') {
			sleep 2;
			if ($q->param('rebuild') eq 'on') {
				$dlna->db_rebuild();
			}
			else {
				$dlna->db_rescan();
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

sub setMediaserverItunesSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	if (!@errors) {
		my $daap = BUFFALO::MediaServer::MtDaapd->new();

		$daap->set_status($q->param('service'));
		if ($q->param('service') eq 'on') {
			if ($q->param('folder') =~ m#^/mnt/#) {
				$daap->set_folder_base($q->param('folder'));
			}
		}

=pod
		if ($q->param('auto') eq 'on') {
			if ($q->param('inotify') eq 'on') {
				$daap->set_db_refresh_cycle('3600');
			}
			else {
				$daap->set_db_refresh_cycle($q->param('freq') * 60);
			}
		}
=cut
		$daap->save();

		$daap->restart();
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setMediaserverSqueezeboxSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	if ($q->param('service') eq 'on') {
		my $client = RPC::XML::Client->new('http://localhost:8888/');

		my $request = RPC::XML::request->new(
			'network.isAvailablePort',
			RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				port => RPC::XML::i4->new($q->param('squeezebox_port')),
				service =>	RPC::XML::string->new('squeezebox')
			})
		);
		
		my $response = $client->send_request($request);
		if ($response->is_fault) {
			my $message = $response->value->{faultString};
			push @errors, "XML_SERVER_ERROR";
		}
		
		if ($response->value->{status}) {
			push @errors, "mediaserver_err2";
		}
	}

	if (!@errors) {
		my $squeeze_info = BufCommonFileInfo->new();
		my $squeeze_folder = $q->param('folder');
		my $squeeze_port = $q->param('squeezebox_port');

		$squeeze_info->init('/etc/melco/squeezeboxserver/squeezeboxserver_service');
		$squeeze_info->set_info('service', $q->param('service'));

		if ($q->param('service') eq 'on') {
			if ($squeeze_folder =~ m#^/mnt/#) {
				$squeeze_folder = '"' . $squeeze_folder . '"';

				$squeeze_info->set_info('audiodir', $squeeze_folder);
				$squeeze_info->set_info('playlistdir', $squeeze_folder);
			}

			$squeeze_info->set_info('httpport', $squeeze_port);
		}

		$squeeze_info->save();

		system ('/etc/init.d/squeeze.sh restart 1>/dev/null 2>/dev/null');
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub restartMediaserverDlnaService {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dlna = BUFFALO::MediaServer::PacketVideo->new();

	$dlna->restart();

	push (@dataArray, '');
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub restartMediaserverItunesService {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $daap = BUFFALO::MediaServer::MtDaapd->new();

	$daap->restart();

	push (@dataArray, '');
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub restartMediaserverSqueezeboxService {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	system ('/etc/init.d/squeeze.sh restart 1>/dev/null 2>/dev/null');

	push (@dataArray, '');
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub getMediaserverFolders {
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

	for ($i = 0; $i < @share; $i++) {
		push(@dataArray, {
			'opt' => $share[$i],
			'val' => '/mnt/'.$drive[$i].'/'.$share[$i]
		});

		$bdu->init('/mnt/'.$drive[$i].'/'.$share[$i]);
		@share_bdu = $bdu->get_bdu_list;
		for ($j = 0; $j < @share_bdu; $j++) {
			if (length($share[$i].'/'.$share_bdu[$j]) > 80) {
				next;
			}

			if ($share_bdu[$j] eq 'usbdisk1') {
				if (!system ('test -L '.'/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]) & 127) {
					next;
				}
			}

			push(@dataArray, {
				'opt' => $share[$i].'/'.$share_bdu[$j],
				'val' => '/mnt/'.$drive[$i].'/'.$share[$i].'/'.$share_bdu[$j]
			});
		}
	}

	for ($i = 0; $i < 0; $i++) {
		   if ($usbshare[$i] eq "usbdisk1") { $usb_guid = $disk->get_usb_disk1; }
		elsif ($usbshare[$i] eq "usbdisk2") { $usb_guid = $disk->get_usb_disk2; }
		elsif ($usbshare[$i] eq "usbdisk3") { $usb_guid = $disk->get_usb_disk3; }
		elsif ($usbshare[$i] eq "usbdisk4") { $usb_guid = $disk->get_usb_disk4; }
		else								{ $usb_guid = ""; }

		if ($usb_guid) {
			push(@dataArray, {
				'opt' => $usbshare[$i],
				'val' => '/mnt/'.$usbshare[$i]
			});

			$bdu->init('/mnt/'.$usbshare[$i]);
			@share_bdu = $bdu->get_bdu_list;
			for ($j = 0; $j < @share_bdu; $j++) {
				if (length($usbshare[$i].'/'.$share_bdu[$j]) > 80) {
					next;
				}

				push(@dataArray, {
					'opt' => $usbshare[$i].'/'.$share_bdu[$j],
					'val' => '/mnt/'.$usbshare[$i].'/'.$share_bdu[$j]
				});
			}
		}
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub getMediaserverDlnaClients {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $cnt = @{$self->{mac}};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {
			'allow' => ${$self->{allow}}[$i],
			'mac'	=> ${$self->{mac}}[$i],
			'ip'	=> ${$self->{ip}}[$i],
			'name'	=> ${$self->{name}}[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setMediaserverDlnaClients {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my $json = new JSON;
	my $i;

	my $macData = $json->utf8->decode($q->param('mac'));
	my $allowData = $json->utf8->decode($q->param('allow'));

	my $dlna = BUFFALO::MediaServer::PacketVideo->new();

	for ($i = 0 ; $i < @{$macData}; $i++) {
		if (${$allowData}[$i] eq '1') {
			$dlna->client_enable(${$macData}[$i]);
	}
	else {
			$dlna->client_disable(${$macData}[$i]);
		}

		sleep 2;
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub get_dtcp_stat {
	my $self = shift;
	return $self->{dtcp_stat};
}

sub get_dtcp_ver {
	my $self = shift;
	return $self->{dtcp_ver};
}

sub updateMediaserverModule {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	if (-f '/var/lock/majishanzu_update') {
		my $data = readpipe('cat /var/lock/majishanzu_update');
		chomp $data;

		push (@dataArray, {
			'result' => $data
		});

		if (($data eq 'success') || ($data eq 'fail')) {
			unlink '/var/lock/majishanzu_update';
		}
	}
	else {
		system ('/etc/init.d/twonky.sh restart update 1>/dev/null 2>/dev/null &');
		push (@dataArray, {
			'result' => 'download'
		});
	}

	sleep 3;

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub initSqueezeboxService {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	system ('/etc/init.d/squeeze.sh refresh_start 1>/dev/null 2>/dev/null');
	sleep 3;

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
