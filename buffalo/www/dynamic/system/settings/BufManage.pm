#!/usr/bin/speedy
;################################################
;# BufManage.pm
;# usage :
;#	$class = new BufManage;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufManage;

use BufCommonFileInfo;
use BufCommonDataCheck;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		place	=> undef,
		manager => undef
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

	$self->{place} = $info->get_info('place');
	$self->{manager} = $info->get_info('manager');

	$self->{place} =~ s#"##g;
	$self->{manager} =~ s#"##g;

	return;
}

sub getManagSettings {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'place' => $self->{place},
		'manager' => $self->{manager}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setManagSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $check = BufCommonDataCheck->new();
	my $info = BufCommonFileInfo->new();

	$info->init('/etc/melco/info');

	my $place;
	my $manager;
	
	$place = $cgiRequest->param('place');
	$manager = $cgiRequest->param('manager');

	$check->init($place);
#	if (!$check->check_max_length('50')) { push @errors, "place_err1"; }
	if (!$check->check_max_length('75')) { push @errors, "place_err1"; }
	if (!$check->check_comment) { push @errors, "place_err2"; }

	$check->init($manager);
#	if (!$check->check_max_length('50')) { push @errors, "manager_err1"; }
	if (!$check->check_max_length('75')) { push @errors, "manager_err1"; }
	if (!$check->check_comment) { push @errors, "manager_err2"; }

	if (@errors == 0) {
		$info->set_info('place', '"'.$place.'"');
		$info->set_info('manager', '"'.$manager.'"');

		$info->save;
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
