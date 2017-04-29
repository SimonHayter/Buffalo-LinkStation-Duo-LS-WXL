#!/usr/bin/speedy
;#############################################
;# BufNSS.pm
;# useage :
;#  $class = new BufNSS;
;#  $class->init;
;# (C) 2007 BUFFALO INC. All rights reserved
;# Author: Deva Kodali
;# Date:   03/28/08
;##########################################################

package BufNSS;

use BufDeamonNetatalk;
use BufDeamonProFtp;
use global_init_system;

use strict;
use JSON;


sub new {
    my $class = shift;
    my $self = bless {
        atalk				   => undef,
        ftp						 => undef
    }, $class;
    return $self;
}

sub init {
    my $self = shift;
    $self->load;
    return;
}

sub load {
    my $self     = shift;
    my $netatalk = BufDeamonNetatalk->new();
    my $proftp   = BufDeamonProFtp->new();

    $netatalk->init();
    $proftp->init();

    # Initialize the class member variables 
    $self->{atalk}	  = $netatalk->get_status;
    $self->{ftp}			= $proftp->get_status;
    return;
}

# This method will be called when populating the Network Sharing Services tab
sub getNSS_settings {
    my $self        = shift;
    my @errors      = ();
    my @dataArray   = ();

    my $dataHash = {
        'atalk'   	=> $self->{atalk},
        'ftp' 			=> $self->{ftp}
    };

    @dataArray = ($dataHash);
    my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
    return to_json($jsnHash);
}

# This method will be called when editing the Network Sharing Services settings
sub setNSS_settings {
    my $self        = shift;
    my $cgiRequest  = shift;
    my @errors      = ();
    my @dataArray   = ();
    my $netatalk    = BufDeamonNetatalk->new();
    my $proftp      = BufDeamonProFtp->new();
    my $atalk;
    my $ftp;
    
    $netatalk->init();
    $proftp->init();
    
    # Get the values from GUI
    $atalk    = $cgiRequest->param('atalk');
    $ftp    	= $cgiRequest->param('ftp');
   
    # Commit changes to the system
    $netatalk->set_status($atalk);
    $netatalk->save;
    global_init_system->init_netatalk_restart();
    
    $proftp->set_status($ftp);
    $proftp->save;
    global_init_system->init_proftp_restart();

    return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
