#!/usr/bin/speedy
;################################################
;# BufSyslog.pm
;# 
;# usage :
;#	$class = BufSyslog->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufSyslog;

use strict;
use JSON;

use CGI;
use BufMaintenanceLog;
use BufCommonDataCheck;
use BUFFALO::Network::Ip;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();


sub new {
	my $class = shift;
	my $self  = bless {
		syslogService => undef,
		syslogIp => undef,
		syslogSystem => undef,
		syslogSmb => undef,
		syslogFtp => undef,
		syslogIscsi => undef,
		
		syslogLink => undef,
		syslogTarget => undef
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
	my $log  = BufMaintenanceLog->new();
	$log->init();
	
	my @item;
	my $i;
	@item = $log->get_list_item();
	
	$self->{syslogService} = $log->get_status();
	$self->{syslogIp} = $log->get_ip();

	for ($i = 0; $i < @item; $i++) {
		if ($item[$i] eq 'system'){
			$self->{syslogSystem} = '1';
		}
		elsif ($item[$i] eq 'file_smb') {
			$self->{syslogSmb} = '1';
		}
		elsif ($item[$i] eq 'file_ftp') {
			$self->{syslogFtp} = '1';
		}
		elsif ($item[$i] eq 'file_iscsi') {
			$self->{syslogIscsi} = '1';
		}
	}
	
	$self->{syslogLink} = $log->get_link();
	if (!$self->{syslogLink}) {
		$self->{syslogLink} = 'off';
	}
	$self->{syslogTarget} = $log->get_target();
	$self->{syslogTarget} =~ s#"##g;
	$self->{syslogTarget} =~ s#/mnt/.+/##;
	
	return;
}

sub getSyslogSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'syslogService' => $self->{syslogService},
		'syslogIp' => $self->{syslogIp},
		'syslogSystem' => $self->{syslogSystem},
		'syslogSmb' => $self->{syslogSmb},
		'syslogFtp' => $self->{syslogFtp},
		'syslogIscsi' => $self->{syslogIscsi},
		'syslogLink' => $self->{syslogLink},
		'syslogTarget' => $self->{syslogTarget}
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setSyslogSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	my @item;
	my $target;
	
	my $log  = BufMaintenanceLog->new();
	my $check = BufCommonDataCheck->new();
	my $ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	my $ip2 = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_SECONDARY'));
	
	$log->init();
	
	if ($q->param('syslogService') eq 'on') {
		# IPアドレスをチェック
		$check->init($q->param('syslogIp'));
		if (!$q->param('syslogIp')) {
			push @errors, 'syslog_err1';
		}
		if (!$check->check_ip()) {
			push @errors, 'syslog_err2';
		}
		if (($q->param('syslogIp') eq $ip->get_ip()) || ($q->param('syslogIp') eq $ip2->get_ip())) {
			push @errors, 'syslog_err3';
		}
		
		# 転送情報に一つもチェックがついていなければエラー
		if ((!$q->param('syslogSystem')) && (!$q->param('syslogSmb')) && (!$q->param('syslogFtp')) && (!$q->param('syslogIscsi'))) {
			push @errors, 'syslog_err4';
		}
	}
	
	if (@errors == 0) {
		$log->set_status($q->param('syslogService'));
		if ($q->param('syslogService') eq 'on') {
			$log->set_ip($q->param('syslogIp'));
			
			if ($q->param('syslogSystem') eq '1') {
				push @item, 'system';
			}
			if ($q->param('syslogSmb') eq '1') {
				push @item, 'file_smb';
			}
			if ($q->param('syslogFtp') eq '1') {
				push @item, 'file_ftp';
			}
			if ($q->param('syslogIscsi') eq '1') {
				push @item, 'file_iscsi';
			}
			$log->set_list_item(@item);
		}
		
		$log->set_link($q->param('syslogLink'));
		if ($q->param('syslogLink') eq 'on') {
			if ($q->param('syslogTarget') =~ m#^/mnt/#) {
				$target = '"'.$q->param('syslogTarget').'"';
				$log->set_target($target);
			}
		}
		
		$log->save();
	}
	
	system ("/etc/init.d/syslog.sh restart 1> /dev/null 2> /dev/null");
	system ("/etc/init.d/syslog_user_setup.sh 1> /dev/null 2> /dev/null &");
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
