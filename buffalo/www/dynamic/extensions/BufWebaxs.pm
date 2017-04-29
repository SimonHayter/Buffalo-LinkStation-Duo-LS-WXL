#!/usr/bin/speedy
;##############################
;# BufWebaxs.pm
;# 
;# usage :
;#	$class = BufWebaxs->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufWebaxs;

use strict;
use JSON;

use CGI;
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use WebAxsConfig;


sub new {
	my $class = shift;
	my $self  = bless {
		service =>	undef,
		ssl 	=>	undef,
		server	=>	undef,
		name	=>	undef,
		key 	=>	undef,
		ddns	=>	undef,
		upnp	=>	undef,
		port	=>	undef,
		inner_port			=>	undef,
		session_expire_min	=>	undef,
		session_exclusive	=>	undef
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
	my $webaxs = WebAxsConfig->new();
	
	my $service = $webaxs->{mainstatus};
	my $ssl = $webaxs->{sslstatus};
	my $server = $webaxs->{buffalonasstatus};
	my $name = $webaxs->{name};
	my $key = $webaxs->{key};
	my $ddns = $webaxs->{altname};
	my $upnp = $webaxs->{upnpstatus};
	my $port = $webaxs->{port};
	my $inner_port = $webaxs->{inner_port};
	my $session_expire_min = $webaxs->{session_expire_min};
	my $session_exclusive = $webaxs->{session_exclusive};
	my $detail_settings = $webaxs->{detail_settings};
	
	if (!$service) { $service = ''; }
	if (!$ssl) { $ssl = ''; }
	if (!$server) { $server = ''; }
	if (!$name)  { $name = ''; }
	if (!$key) { $key = ''; }
	if (!$ddns) { $ddns = ''; }
	if (!$upnp) { $upnp = ''; }
	if (!$port) { $port = ''; }
	if (!$inner_port) { $inner_port = ''; }
	if (!$detail_settings) { $detail_settings = ''; }
	
	$self->{service} = $service;
	$self->{ssl} = $ssl;
	$self->{server} = $server;
	$self->{name} = $name;
	$self->{key} = $key;
	$self->{ddns} = $ddns;
	$self->{upnp} = $upnp;
	$self->{port} = $port;
	$self->{inner_port} = $inner_port;
	$self->{session_expire_min} = $session_expire_min;
	$self->{session_exclusive} = $session_exclusive;
	$self->{detail_settings} = $detail_settings;
	
	return;
}

sub nn_getWebaxsSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'service' => $self->{service},
		'name' => $self->{name}
	});
	
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors'=>\@errors
	};

	return to_json($jsnHash);
}

sub getWebaxsSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'service' => $self->{service},
		'ssl' => $self->{ssl},
		'server' => $self->{server},
		'name' => $self->{name},
		'key' => $self->{key},
		'ddns' => $self->{ddns},
		'upnp' => $self->{upnp},
		'port' => $self->{port},
		'inner_port' => $self->{inner_port},
		'session_expire_min' => $self->{session_expire_min},
		'session_exclusive' => $self->{session_exclusive},
		'detail_settings' => $self->{detail_settings},
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setWebaxsSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $check  = BufCommonDataCheck->new();
	
	my $service = $q->param('service');
	my $ssl = $q->param('ssl');
	my $server = $q->param('server');
	my $name = $q->param('name');
	my $key = $q->param('key');
	my $ddns = $q->param('ddns');
	my $upnp = $q->param('upnp');
	my $port = $q->param('port');
	
	my $inner_port = $q->param('inner_port');
	if (!$inner_port) {
		$inner_port = 9000;
	}
	
	my $session_expire_min = $q->param('session_expire_min');
	my $session_exclusive = $q->param('session_exclusive');
	
	my $detail_settings = $q->param('detail_settings');
	
	if ($port =~ m/.+/) {
		$port =~ s/^0+(.+)/$+/;
	}
	
	# error check
	if ($service eq "on") {
		if ($server eq "on") {
			if (($name =~ /[^A-Za-z0-9_-]/) || (!$name)) {
				push @errors, "webaxs_err1";
			}
			if (($key =~ /[^A-Za-z0-9_-]/) || (!$key)) {
				push @errors, "webaxs_err2";
			}
		}
		else {
			$check->init($ddns);
			if ((!$check->check_workgroup) || (!$ddns)) {
				push @errors, "webaxs_err3";
			}
		}
		
		if ($upnp eq "off") {
			if (($port =~ /[^0-9]/) || ($port eq '')) {
				push @errors, "webaxs_err4";
			}
			if ($port > 65535) {
				push @errors, "webaxs_err5";
			}
		}
		
		if (($inner_port =~ /[^0-9]/) || ($inner_port eq '')) {
			push @errors, "webaxs_err8";
		}

		if ($inner_port > 65535) {
			push @errors, "webaxs_err9";
		}

		if (($session_expire_min =~ /[^0-9]/) || ($session_expire_min eq '')) {
			push @errors, "webaxs_err10";
		}

		if ($session_expire_min > 120) {
			push @errors, "webaxs_err11";
		}
	}

	my $webaxs = WebAxsConfig->new();
	if (@errors == 0) {
		push @errors, $webaxs->updateStatus($service, $upnp, $server, $ssl, $name, $key, $ddns, $port, $inner_port, $session_expire_min, $session_exclusive,$detail_settings);
	}

	if ($errors[0] eq '') {
		shift @errors;
		system('daemonize /modules/webaxs/_init.sh restart');
	}
	elsif ($errors[0] =~ m#^The account name chosen#) {
		$errors[0] = 'webaxs_err6';
	}
	elsif ($errors[0] =~ m#^The device name and key#) {
		$errors[0] = 'webaxs_err7';
	}
	
	$webaxs->restartWebAxs();

	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub setWebaxsFolderSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $name  = $q->param('shareName');
	my $value = $q->param('webaxs_perm');
	
	my $webaxs = WebAxsConfig->new();
	
	$webaxs->modifyShareFor3($value,$name);
#	$webaxs->saveChanged();
	$webaxs->restartWebAxs();

	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
