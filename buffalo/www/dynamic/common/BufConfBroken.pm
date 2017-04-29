#!/usr/bin/speedy

package BufConfBroken;

use strict;
use JSON;
use BufCommonFileInfo;

sub new {
	my $class = shift;
	my $self = bless {
		filename => "/etc/config_broken",
		broken => undef,
		initialized => []
	}, $class;
	return $self;
}

sub init {
	my $self = shift;
	$self->load();
}

sub load {
	my $self = shift;
	my $data;
	my $res;
	my $nas_feature;
	my $f;
	my %setting_table = (
		"etc/melco/dlnaserver" => ["mediaserver_server_field"],
		"etc/melco/squeezeboxserver/squeezeboxserver_service" => ["mediaserver_server_field"],
		"etc/melco/ituneserver" => ["mediaserver_server_field"],
		"etc/melco/shareinfo" => ["header_1_1"],
		"etc/melco/shareinfo.hidden" => ["header_1_1"],
		"etc/melco/shareinfo.vfs" => ["header_1_1"],
		"etc/melco/DirectCopy" => ["header_1_3"],
		"etc/melco/info" =>["header_3", "header_3_2_1", "hostname_form_title", "dTime_form_Title", "lang_form_title", "disk_mngt_array_maint_fail_label", "disk_mngt_array_maint_sync_speed_label", "disk_mngt_array_maint_title", "printserver_form_title"],
		"etc/melco/backup1" => ["net_settings_backup"],
		"etc/melco/backup2" => ["net_settings_backup"],
		"etc/melco/backup3" => ["net_settings_backup"],
		"etc/melco/backup4" => ["net_settings_backup"],
		"etc/melco/backup5" => ["net_settings_backup"],
		"etc/melco/backup6" => ["net_settings_backup"],
		"etc/melco/backup7" => ["net_settings_backup"],
		"etc/melco/backup8" => ["net_settings_backup"],
		"etc/melco/timer_status" => ["net_settings_backup"],
		"etc/melco/email" => ["emailNotif_form_title"],
		"etc/cron/crontabs/root" => ["sleeptimer_form_title"],
		"etc/melco/webaxs/webaxs_service" => ["net_settings_webaxs"],
		"etc/melco/sxuptp.conf" => ["header_5_11"],
		"etc/melco/ups" => ["system_ups_synchonization"],
		"etc/melco/httpd" => ["header_3_4"],
		"etc/melco/port.list" => ["header_3_4"],
		"etc/melco/mysql" => ["header_3_5"],
		"etc/melco/my.cnf" => ["header_3_5"],
		"etc/melco/bittorrent" => ["bittorrent_form_title"],
		"etc/melco/time_machine" => ["timemachine_form_title"],
		"etc/eyefi/eyefi.conf" => ["header_5_10"],
		"etc/passwd" => ["header_2"],
		"etc/shadow" => ["header_2"],
		"etc/shadow-" => ["header_2"],
		"etc/group" => ["header_2"],
		"etc/gshadow" => ["header_2"],
		"etc/samba/smbpasswd.tdb" => ["header_2"],
		"etc/samba/smbusers" => ["header_2"],
	);
	if( -f $self->{filename} ) {
		$self->{broken} = JSON::true;
		$self->{initialized} = [];
		$nas_feature = new BufCommonFileInfo();
		$nas_feature->init("/etc/nas_feature");
		if(!open(FH, "<$self->{filename}")) {die("[BufConfBroken.load]File Open Error - $self->{filename}\n");}
		if(!flock(FH, 1)) {die("[BufConfBroken.load]File Lock Error - $self->{filename}\n");}
		while($data = <FH>) {
			chomp($data);
			if(exists($setting_table{$data})) {
				$res = $setting_table{$data};
				foreach my $r ( @$res ) {
					if($r eq "header_5_11") {
						$f = $nas_feature->get_info("SUPPORT_SXUPTP");
						if($f ne "1" && $f ne "on")
						{
							next;
						}
					}
					if($r eq "header_3_5") {
						$f = $nas_feature->get_info("SUPPORT_MYSQL");
						if($f ne "1" && $f ne "on")
						{
							next;
						}
					}
					if($r eq "bittorrent_form_title") {
						$f = $nas_feature->get_info("SUPPORT_BITTORRENT");
						if($f ne "1" && $f ne "on")
						{
							next;
						}
					}
					$self->_add_item($r);
				}
			}
		}
		if(!close(FH)) {die("[BufConfBroken.load]File Close Error - $self->{filename}\n");}
		if($self->_get_items_count() > 0) {
			$self->{broken} = JSON::true;
		}
		else {
			$self->{broken} = JSON::false;
		}
	}
	else {
		$self->{broken} = JSON::false;
	}
}

sub _add_item {
	my $self = shift;
	my $item = shift;
	my $items = $self->{initialized};

	foreach my $i ( @$items ) {
		if ( $i eq $item) {
			return;
		}
	}
	push(@$items, $item);
}

sub _get_items_count {
	my $self = shift;
	my $items = $self->{initialized};
	my $count = @$items;

	return $count;
}

sub get_broken {
	my $self = shift;
	return to_json( { "broken"=>$self->{broken}, "initialized"=>$self->{initialized} } );
}

sub clear {
	my $self = shift;
	$self->{broken} = JSON::false;
	$self->{initialized} = [];

	if( -f $self->{filename}) {
		if(!unlink($self->{filename})){die("[BufConfBroken.clear]File Unlink Error - $self->{filename}\n");}
	}
}

1;
