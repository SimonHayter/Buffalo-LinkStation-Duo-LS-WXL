#!/usr/bin/speedy
;############################################
;# BufReset.pm
;# usage:
;#    $class = new BufReset;
;#    $class->init;
;# (C) 2007 BUFFALO INC. All rights reserved
;# Author: 
;# Date:   
;# Modified By: Deva Kodali
;# Last Modified: 03/31/08, modified as part of cleaning the code, 05/30/08
;##########################################################

package BufReset;

use strict;
use JSON;


sub new {
    my $class = shift;
    my $self  = bless {
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
    return;
}

sub reset_LinkStation {
    my $self        = shift;
    my $cgiRequest  = shift;
    my @errors      = ();
    my @dataArray   = ();
    
    # Get the values from GUI
    my $action      = $cgiRequest->param('action');

  	# Commit changes to the system 
  	if ($action eq 'shutdown') {
        system("/sbin/shutdown -h now 1> /dev/null 2> /dev/null &");
    } 
    else {  
        system("/sbin/reboot 1> /dev/null 2> /dev/null &");
    }    
    
    return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
