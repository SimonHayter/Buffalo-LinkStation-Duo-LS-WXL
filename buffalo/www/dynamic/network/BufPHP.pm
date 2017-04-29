#!/usr/bin/speedy
;################################################
;# BufPHP.pm
;# 
;# usage :
;#	$class = BufPHP->new();
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufPHP;

use strict;
use JSON;

use CGI;
use BufCommonDataCheck;

use BUFFALO::Common::Model;
my $gModel = BUFFALO::Common::Model->new();

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

my $sid;
$sid = 999999;

sub new {
	my $class = shift;
	my $self  = bless {
		php_content => undef
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

	my $client;
	my $request;
	my $response;

	$client = RPC::XML::Client->new('http://localhost:8888/');

=pod
	$request = RPC::XML::request->new(
		'login',
		RPC::XML::struct->new({
			username => 'admin',
			password => 'password'
		})
	);

	$response = $client->send_request($request);
	$sid = $response->value->{sid};
=cut

	$request = RPC::XML::request->new(
		'httpd.readPhpini',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($sid)
		})
	);
	$response = $client->send_request($request);

	$self->{php_content} = $response->value->{phpini};

	return;
}

sub getPhpSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push (@dataArray, {
		'php_content' => $self->{php_content}
	});

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setPhpSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();

	my $check = BufCommonDataCheck->new();

=pod
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
=cut

	my $php_content = $q->param('php_content');

	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'httpd.writePhpini',
			RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				phpini => RPC::XML::string->new($php_content)
			})
		);
		
		my $response = $client->send_request($request);
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub restorePhpSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'httpd.restorePhpini',
			RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid)
			})
		);
		
		my $response = $client->send_request($request);
	}

	push (@dataArray, '');
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub uploadPhpSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	my $php_content = readpipe('cat /tmp/php.ini 2> /dev/null');

	if (@errors == 0) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'httpd.writePhpini',
			RPC::XML::struct->new({
				sid => RPC::XML::i4->new($sid),
				phpini => RPC::XML::string->new($php_content)
			})
		);

		my $response = $client->send_request($request);
	}
}

1;
