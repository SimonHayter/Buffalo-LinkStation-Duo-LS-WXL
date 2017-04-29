#!/usr/bin/speedy

;#############################################
;# BufImHere.pm
;#
;# usage :
;#  $class = new BufImHere;
;#  $class->init;
;#
;# (C) 2008 BUFFALO INC. All rights reserved.
;#############################################

package BufImHere;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self = bless {
		
	}, $class;
	return $self;
}

sub init {
	my $self = shift;
	return;
}

sub exec_imhere {
	my $self = shift;
	my @dataArray;
	my @errors;
	my $jsnHash;
	
	system("/usr/local/bin/imhere.sh");
	
	$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
	
	return;
}

1;
