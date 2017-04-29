#!/usr/bin/perl

# CRON.PL
# This script re-establishes UPnP connection, and updates BuffaloNas.com

use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use WebAxsConfig;
use WebAxsBuffaloNas;
use WebAxsBuffaloFunctions;
use WebAxsUPnP;

# Make sure the script doesn't run too long
system('daemonize /www/buffalo/www/dynamic/extensions/webaxs/cronkill.sh');

# Get config data
my $webAxsConf = WebAxsConfig->new();

# If BuffaloNas.com status is on, update Buffalonas.com
if ($webAxsConf->{buffalonasstatus} eq "on") {
	my $buffaloNasClass = WebAxsBuffaloNas->new($webAxsConf);
	$buffaloNasClass->update();
}

# If UPnP is turned on, update the router
if ($webAxsConf->{upnpstatus} eq "on") {
	my $upnpClass = WebAxsUPnP->new($webAxsConf->{port}, $webAxsConf->{inner_port});
	$upnpClass->findUpnpGateway();
	$upnpClass->updateUpnpAll();
}

# Update Local IP in config file
$webAxsConf->{localip} = WebAxsBuffaloFunctions->BuffaloGetLocalIp();
$webAxsConf->saveNoChange();