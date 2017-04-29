#!/usr/bin/speedy
;################################################
;# BufAdmin.pm
;# usage :
;#	$class = new BufAdmin;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufAdmin;

use BufCommonDataCheck;
use BufUserInfo;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		username => undef,
		password => undef
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

	my $temp = readpipe("grep ':x:52:' /etc/passwd 2> /dev/null");
	my @temp = split( /:/ , $temp);
	
	$self->{username} = $temp[0];

	return;
}

sub getAdminSettings {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $dataHash = {
		'username' => $self->{username}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

sub setAdminSettings {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $check = BufCommonDataCheck->new();
	my $user = BufUserInfo->new();
	my $username = $cgiRequest->param('username');
	my $password = $cgiRequest->param('password');

	$check->init($username);

	if ($username eq '') { push @errors, 'user_err1'; }
	if (!$check->check_max_length('20')) {push @errors, 'user_err2'; }
	if (!$check->check_danger_name_permit_admin) { push @errors, 'user_err3'; }
	if (!$check->check_user2) { push @errors, 'user_err4'; }
	if (!$check->check_1st_symbol2) { push @errors, 'user_err5'; }

	$check->init($password);

	if ($password eq '') { push @errors, 'user_err10'; }
	if (!$check->check_max_length('20')) { push @errors, 'user_err11'; }
	if (!$check->check_password2) { push @errors, 'user_err12'; }
	if (!$check->check_1st_symbol) { push @errors, 'user_err13'; }

	if (@errors == 0) {
				$user->init($self->{username});
				$user->set_name($username);
				$user->set_pass($password);
				$user->save;
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
