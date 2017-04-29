#!/usr/bin/speedy
;################################################
;# BufHddTool.pm
;# usage :
;#	$class = new BufHddTool;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufHddTool;

use BufCommonFileInfo;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		hddTool => undef
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

	$info->init('/etc/melco/info');

	$self->{hddTool} = $info->get_info('clientutility');

	return;
}

sub getHddToolSettings {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'hddTool' => $self->{hddTool}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setHddToolSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $info = BufCommonFileInfo->new();

	$info->init('/etc/melco/info');

	my $hddTool;
	$hddTool = $cgiRequest->param('hddTool');

	if (@errors == 0) {
		$info->set_info('clientutility', $hddTool);
		$info->save;

		system('/etc/init.d/clientUtil_servd.sh restart 1> /dev/null 2> /dev/null &');
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
