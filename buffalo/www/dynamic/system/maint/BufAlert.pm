#!/usr/bin/speedy
;#############################################
;# BufAlert.pm
;# usage :
;#  $class = new BufAlert;
;#  $class->init;
;# (C) 2007 BUFFALO INC. All rights reserved
;# Author: Deva Kodali
;# Date:
;##########################################################


package BufAlert;

use BufMaintenanceCaution;
use strict;
use JSON;

sub new {
    my $class = shift;
    my $self = bless {
        tempError      =>  undef,
        diskError      =>  undef,
        fanError       =>  undef,
        upsError       =>  undef
    }, $class;
    return $self;
}

sub init {
    my $self = shift;
    $self->load;
    return;
}

sub load {
    my $self    = shift;
    my $caution = BufMaintenanceCaution->new();
    $caution->init();
    
    # Initialize the class member variables
    $self->{tempError}   =   $caution->get_temp_over;
    $self->{diskError}   =   $caution->get_disk_error;
    $self->{fanError}    =   $caution->get_fan_error;
    $self->{upsError}    =   $caution->get_ups_fail;
}

# This method will be called when populating the Alert Sound tab
sub getAlert_settings {
    my $self        = shift;
    my @errors      = ();
    my @dataArray   = ();
    
    my $dataHash = {
        'tempErrBox' => $self->{tempError},
        'diskErrBox' => $self->{diskError},
        'fanErrBox'  => $self->{fanError},
        'upsErrBox'  => $self->{upsError}
    };

    @dataArray = ($dataHash);
    my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
    return to_json($jsnHash);
}

# This method will be called when setting the Alert Settings
sub setAlert_settings {
    my $self        = shift;
    my $cgiRequest  = shift;
    my @dataArray   = ();
    my @errors      = ();
    my $caution     = BufMaintenanceCaution->new();

    $caution->init();
    
    # Get the values from GUI
    my $tempError = $cgiRequest->param('tempErrBox');
	  my $diskError = $cgiRequest->param('diskErrBox');
	  my $fanError  = $cgiRequest->param('fanErrBox');
	  my $upsError  = $cgiRequest->param('upsErrBox');

	  # Commit changes to the system
    $caution->set_temp_over($tempError);
    $caution->set_disk_error($diskError);
    $caution->set_fan_error($fanError);
    $caution->set_ups_fail($upsError);
    $caution->save;

    return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
