#!/usr/bin/speedy
;################################################
;# BufPing.pm
;# usage :
;#	$class = new BufPing;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufPing;

use strict;
use JSON;
use BufCommonDataCheck;

sub new {
	my $class = shift;
	my $self  = bless {
		ipAddr => undef,
		result => undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;

	return;
}

sub getPingResults {
	my $self = shift;
	my $q = shift;
	my @errors;
	my @dataArray;
	my $check = BufCommonDataCheck->new();

	$self->{ipAddr} = $q->param('ipAddr');
	$check->init($self->{ipAddr});
	if (!$check->check_ip) {
		push @errors, 'ip_err1';
	}

	if (@errors == 0) {
		$self->{result} = readpipe("/usr/local/bin/ping -c 4 $self->{ipAddr} 2>&1");
	}

	my $dataHash = {
		'result' => $self->{result}
	};
	@dataArray = ($dataHash);

	my $jsnHash = {
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
