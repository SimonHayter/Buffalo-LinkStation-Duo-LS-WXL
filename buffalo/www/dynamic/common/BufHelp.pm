#!/usr/bin/speedy

;################################################
;# BufHelp.pm
;# usage :
;#	$class = new BufHelp;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################


package BufHelp;

use BufCommonFileInfo;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self = bless {
		help_file	=> undef,
		helpMessage	=> undef
	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	my $path = shift;
	my $menu = shift;
	$self->load($path, $menu);

	return;
}

sub load {
	my $self = shift;
	my $path = shift;
	my $menu = shift;
	my $help = BufCommonFileInfo->new;

	$self->{help_file}	= $path.$menu.'.html';
	$help->init($self->{help_file}, 'all');

	$self->{helpMessage} = $help->get_info_all();

	return;
}

sub get_Info {
	my $self		= shift;
	my @dataArray	= ();
	my @errors		= ();

	push(@dataArray, {'helpInfo' => $self->{helpMessage} });

	return to_json( { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
