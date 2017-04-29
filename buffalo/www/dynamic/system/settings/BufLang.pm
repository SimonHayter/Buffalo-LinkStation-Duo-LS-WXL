#!/usr/bin/speedy
;################################################
;# BufLang.pm
;# usage :
;#	$class = new BufLang;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;################################################

package BufLang;

use BufBasicLocale;
use BufCommonFileInfo;
use BufBittorrent;
use BUFFALO::MediaServer::PacketVideo;

use strict;
use JSON;
use global_init_system;

sub new {
	my $class = shift;
	my $self  = bless {
		language => undef,
		charSet  => undef

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
	my $locale = BufBasicLocale->new();
	$locale->init;

	$self->{language} = $locale->get_lang;
	$self->{charSet} = $locale->get_codepage;
	return;
}

sub getLang_settings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $dataHash = {
		'lang' => $self->{language},
		'winLang' => $self->{charSet}
	};

	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setLang_settings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $locale = BufBasicLocale->new();
	my $fileinfo = BufCommonFileInfo->new();
	my $bittorrent = BufBittorrent->new();
	my $dlna = BUFFALO::MediaServer::PacketVideo->new();
	my $language;
	my $charSet;

	$locale->init();

	$language = $cgiRequest->param('lang');
	$charSet = $cgiRequest->param('winLang');

	$locale->set_lang($language);
	$locale->set_codepage($charSet);
	$locale->save;

	global_init_system->init_hostname();
	global_init_system->init_syslog();
	global_init_system->init_filesystem();

	if (-f '/etc/melco/bittorrent') {
		$fileinfo->init('/etc/melco/bittorrent');
		if ($fileinfo->get_info('bittorrent_status') eq 'on') {
			$bittorrent->restartBittorrentService();
		}
	}

	if (-f '/etc/melco/dlnaserver') {
		$fileinfo->init('/etc/melco/dlnaserver');
		if ($fileinfo->get_info('dlnaserver') eq 'on') {
			$dlna->restart();
		}
	}

	if (-f '/etc/melco/splx') {
		$fileinfo->init('/etc/melco/splx');
		if ($fileinfo->get_info('splx') eq 'on') {
			system('/usr/local/bin/splx_init.sh 1> /dev/null 2> /dev/null');
		}
	}

	system ('touch /www/buffalo/www/dynamic/dynamic.pl');

	return to_json({
		'success '=> (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
