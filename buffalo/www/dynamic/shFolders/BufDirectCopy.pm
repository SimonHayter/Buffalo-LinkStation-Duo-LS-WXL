#!/usr/bin/speedy
;#################################################
;# BufDirectCopy.pm
;# usage :
;#	$class = new BufDirectCopy;
;#	$class->init;
;# (C) 2010 BUFFALO INC. All rights reserved.
;#################################################

package BufDirectCopy;

use BufCommonFileInfo;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		DC_FOLDER	=> undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load();

	return;
}

sub load {
	my $self = shift;
	my $file = BufCommonFileInfo->new();
	$file->init('/etc/melco/DirectCopy');

	$self->{DC_FOLDER} = $file->get_info('DC_FOLDER');
	if ($self->{DC_FOLDER} =~ m#/mnt/usbdisk#) {
		$self->{DC_FOLDER} =~ s#/mnt/##;
	}
	else {
		$self->{DC_FOLDER} =~ s#/mnt/.+/##;
	}
	$self->{DC_FOLDER} =~ s#"##g;

	return;
}

sub getDirectCopy {
	my $self = shift;
	my @errors;
	my @dataArray;

	push(@dataArray, {
		'shareName'	=> $self->{DC_FOLDER}
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub setDirectCopy {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	if ($cgiRequest->param('shareName') =~ m#^/mnt/#) {
		my $file = BufCommonFileInfo->new();
		$file->init('/etc/melco/DirectCopy');

		$file->set_info('DC_FOLDER', '"'.$cgiRequest->param('shareName').'"');
		$file->save;
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
