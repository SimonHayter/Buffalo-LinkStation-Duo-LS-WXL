# WebAxsConfig.pm
#
# Used to access and modify WebAxs configuration files
# Usage: $class = WebAxsConfig->new();

package WebAxsConfig;

use lib '/www/cgi-bin/module';
use lib '/www/cgi-bin/module/mv_old';
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;
use warnings;

use WebAxsBuffaloFunctions;
use WebAxsUPnP;
use WebAxsTranslator;
use WebAxsBuffaloNas;


use BufCommonFileInfo;
use BufCommonFileShareInfo;

use constant 'CONFIG_DIR' => '/etc/melco/';
use constant 'WEBAXS_SERVICE' => CONFIG_DIR . 'webaxs/webaxs_service';
use constant 'SHAREINFO_FILE' => CONFIG_DIR . 'shareinfo';
use constant 'SHAREINFO_WEBAXS_FILE' => CONFIG_DIR . 'shareinfo.webaxs';
use constant 'USER_CONFIG_DIR' => CONFIG_DIR . 'webaxs/users/';

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

# Creates a new instance of the class, filling in default parameters as needed
sub new {
	my $class = shift;
	
	my $self = {};
	$self->{mainstatus}			= "off";
	$self->{upnpstatus}			= "on";
	$self->{buffalonasstatus}	= "on";
	$self->{sslstatus}			= "off";
	$self->{name}				= "";
	$self->{altname}			= "";
	$self->{key}				= "";
	$self->{port}				= 0;
	$self->{localip}			= "";
	$self->{externalip}			= "";
	$self->{shares}				= [];
	$self->{sharesanonymous}	= [];
	$self->{sharesanonymous_ui}	= [];
	$self->{sharesanylogin}		= [];
	$self->{sharesanylogin_ui}	= [];
	$self->{namestringlimit}	= 80;
	$self->{tmpdirectory}	= "/mnt/disk1/";
	$self->{inner_port}			= 9000;
	$self->{session_expire_min} = 30;
	$self->{session_exclusive} = "off";
	
	$self->{detail_settings} = "off";
	
	$self->{version}		= "";  # you must be write the version number as the following item.
	
	$self->{sid} = 999999;
	
	bless($self, $class);
	
	$self->load;

	return $self;
}

sub load {
	my $self = shift;
	
=pod
	my $client = RPC::XML::Client->new('http://localhost:8888/');
	my $request = RPC::XML::request->new(
		'login',
		RPC::XML::struct->new({
			username => 'admin',
			password => 'password'
		})
	);
	my $response = $client->send_request($request);
	$self->{sid} = $response->value->{sid};
=cut
	
	$self->{config} = new BufCommonFileInfo;
	$self->{config}->init(WEBAXS_SERVICE);
	
	$self->{shareinfo_webaxs} = new BufCommonFileShareInfo;
	$self->{shareinfo_webaxs}->init(SHAREINFO_WEBAXS_FILE);
	
	$self->{mainstatus} = $self->{config}->get_info('webaxs_service');
	$self->{buffalonasstatus} = $self->{config}->get_info('buffalonas_status');
	$self->{name} = $self->{config}->get_info('buffalonas_name');
	$self->{key} = $self->{config}->get_info('buffalonas_key');
	$self->{altname} = $self->{config}->get_info('other_dns');
	$self->{port} = $self->{config}->get_info('external_port');
	$self->{sslstatus} = $self->{config}->get_info('use_https');
	$self->{upnpstatus} = $self->{config}->get_info('upnp_status');
	$self->{inner_port} = $self->{config}->get_info('internal_port');
	$self->{session_expire_min} = $self->{config}->get_info('session_expire_min');
	$self->{session_exclusive} = $self->{config}->get_info('session_exclusive');
	$self->{detail_settings} = $self->{config}->get_info('detail_settings');


	# Must be write the version number. because webaxs.conf is existed, it will be load the version number from webaxs.conf
	########################################
	$self->{version} = "3.0";
	########################################
}

# Saves the config file, and restarts the lighttpd web server reflecting changes
sub saveChanged {
	my $self = shift;
	
	# Ensure there are no 'lingering' shares that need to be deleted
	my @shareListAll = WebAxsBuffaloFunctions->BuffaloGetCurrentShares();
	## !-- added y-okumura
	push @shareListAll, 'usbdisk1';
	push @shareListAll, 'usbdisk2';
	
	foreach my $shareName (@{$self->{shares}}) {
#		unless (grep(/^$shareName$/,@shareListAll)) {
		unless (grep(/^\Q$shareName\E$/, @shareListAll)) {
			$self->modifyShare("enabled","off",$shareName);
			$self->modifyShare("anonymous","off",$shareName);
			$self->modifyShare("anylogin","off",$shareName);
		}
	}
	
	$self->_save();
#	system('/modules/webaxs/bin/daemonize /modules/webaxs/_init.sh restart');
#	system('daemonize /modules/webaxs/_init.sh restart');

	$self->restartWebAxs();

}

# Saves the config file for situations that don't need a lighttpd restart (update of local/external ip, etc)
sub saveNoChange {
	my $self = shift;
	$self->_save();
}

# Saves the WebAxs Config file
sub _save {
	my $self = shift;
	
	$self->{config}->set_info('webaxs_service',$self->{mainstatus});
	$self->{config}->set_info('buffalonas_status',$self->{buffalonasstatus});
	$self->{config}->set_info('buffalonas_name',$self->{name});
	$self->{config}->set_info('buffalonas_key',$self->{key});
	$self->{config}->set_info('other_dns',$self->{altname});
	$self->{config}->set_info('external_port',$self->{port});
	$self->{config}->set_info('use_https',$self->{sslstatus});
	$self->{config}->set_info('upnp_status',$self->{upnpstatus});
	$self->{config}->set_info('internal_port',$self->{inner_port});
	$self->{config}->set_info('session_expire_min',$self->{session_expire_min});
	$self->{config}->set_info('session_exclusive',$self->{session_exclusive});
	$self->{config}->set_info('detail_settings',$self->{detail_settings});
	
	$self->{config}->save();
	$self->{shareinfo_webaxs}->save();
}

# Invoked from the web admin interface. Updates the WebAxs status (does Upnp, updates buffalonas.com, etc)
# Usage:
# $object->updateStatus($mainstatus, $upnpstatus, $buffalonasstatus, $sslstatus, $name, $key, $port);
# Where:
# $mainstatus = "on" or "off" (turns on or off WebAxs feature)
# $upnpstatus = "on" or "off" (set UPnP utilization)
# $buffalonasstatus = "on" or "off" (set usage of BuffaloNas.com)
# $sslstatus = "on" or "off" (set usage of ssl/https)
# $name = string defining the name for buffalonas.com
# $key = string defining the key/password for buffalonas.com
# $port = external port that is forwarded to the WebAxs feature (set only when UPnP not used)
# Returns:
# A null string for success or a string containing the error
sub updateStatus {
	my $self = shift;
	my $new_mainstatus = shift;
	my $new_upnpstatus = shift;
	my $new_buffalonasstatus = shift;
	my $new_sslstatus = shift;
	my $new_name = shift;
	my $new_key = shift;
	my $new_altname = shift;
	my $new_port = shift;
	my $new_inner_port = shift;
	my $new_session_expire_min = shift;
	my $new_session_exclusive = shift;
	my $new_detail_settings = shift;
	my $service = 0;
	
	#At first, check this
	$self->{detail_settings} = $new_detail_settings;

	# Get translator ready
	my $translator = WebAxsTranslator->new();
	$translator->serverSide();
	
	# First, check to see if we are turning off the main WebAxs feature
	if ($new_mainstatus eq "off") {
		# Delete an existing port forwarding on the router if using UPnP
		if ($self->{upnpstatus} eq "on") {
			my $upnpClass = WebAxsUPnP->new($self->{port});
			$service = $upnpClass->findUpnpGateway();
			if ($service) { $upnpClass->deletePortForwarding(); }
		}
		# Disable cron job
		WebAxsBuffaloFunctions->BuffaloDisableCron();

		# Update config file
		$self->{mainstatus} = "off";

		# don't erase those when new_mainstatus is off
		if (0) {
			$self->{buffalonasstatus} = "on";
			$self->{name} = "";
			$self->{key} = "";
			$self->{altname} = "";
			$self->{port} = "";
			$self->{localip} = "";
			$self->{externalip} = "";
			$self->{inner_port} = 9000;
			$self->{session_expire_min} = 30;
			$self->{session_exclusive} = "off";
		}

		$self->saveChanged();
		return;
	}
	
	# Update SSL status
	$self->{sslstatus} = $new_sslstatus;
	
	my $client = RPC::XML::Client->new('http://localhost:8888/');

	my $request = RPC::XML::request->new(
		'network.setServicePort',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($self->{sid}),
			port => RPC::XML::i4->new($new_inner_port),
			service =>  RPC::XML::string->new("webaxs")
		})
	);
	
	my $response = $client->send_request($request);
	if ($response->is_fault) {
		my $message = $response->value->{faultString};
		return 'XML_SERVER_ERROR';
	}
	
	if ($response->value->{status}) {
		return 'webaxs_err10';
	}
	
	# If we are using UPnP (or were using it), set that up
	if ( ($self->{upnpstatus} eq "on") || ($new_upnpstatus eq "on") ) {
		# First, create a upnp class, and find the gateway
		my $upnpClass = WebAxsUPnP->new($self->{port},$new_inner_port);
		my $gatewayFound = $upnpClass->findUpnpGateway();
		
		# Clear out the old port (if possible)
		if ( ($gatewayFound) && ($self->{port} > 0) ) { $upnpClass->deletePortForwarding(); }
		
		# Continue setting up UPnP if it is still enabled
		if ($new_upnpstatus eq "on") {
			# Return UPnP error if we have no gateway
			unless ($gatewayFound) { return $translator->{upnp_NoGateway}; }
			# Create a new port number if needed
			if ( ($self->{upnpstatus} eq "off") || ($self->{port} < 30000) ) {
				$self->{port} = int(rand(20000)) + 30000;
			}
			# Forward port
			$upnpClass->{port} = $self->{port};
			my $upnpError = $upnpClass->updateUpnpAll();
			unless ($upnpError eq "") { return $upnpError; }
			# Save current data (successful UPnP forwarding)
			$self->{inner_port} = $new_inner_port;
			$self->{upnpstatus} = "on";
			$self->saveNoChange();
		}
		else { $self->{upnpstatus} = "off"; }
	}

	$self->{inner_port} = $new_inner_port;

	# Put 'new' local IP into the class, and turn on mainstatus in config
	$self->{mainstatus} = "on";
	$self->{localip} = WebAxsBuffaloFunctions->BuffaloGetLocalIp();
	
	# Manual setup (port assignment)
	if ($new_upnpstatus eq "off") { $self->{port} = $new_port; }
	
	# Update Buffalonas.com
	if ($new_buffalonasstatus eq "on") {
		$self->{name} = $new_name;
		$self->{key} = $new_key;
		# Clear alternate DNS name
		$self->{altname} = "";
		my $bufNasClass = WebAxsBuffaloNas->new($self);
		my $bufNasError = $bufNasClass->update();
		unless ($bufNasError eq "") { return $bufNasError; }
	}
	else {
		# If buffalonas.com is turned off, clear out the data
		$self->{name} = "";
		$self->{key} = "";
		# Save alternate DNS name
		$self->{altname} = $new_altname;
	}
	# Update config for Upnp status
	$self->{buffalonasstatus} = $new_buffalonasstatus;
	

	$self->{session_expire_min} = $new_session_expire_min;
	$self->{session_exclusive} = $new_session_exclusive;

	# Enable cron job
	WebAxsBuffaloFunctions->BuffaloEnableCron();
	
	# Save changes (and restart the web server)
	$self->saveChanged();
	return "";
}

# Checks if a share is enabled, has anonymous access turned on, or if a share allows all users in
# Usage:
# $object->isShare("enabled","sharename");	(to check if a share is enabled)
# $object->isShare("anonymous","sharename");	(to check if a share allows anonymous access)
# $object->isShare("anylogin","sharename");	(to check if a share allows all users)
# Returns:
# 1 for true, 0 for false
sub isShare {
	my $self = shift;
	my $type = shift;
	my $shareName = shift;
	my $isUi = shift;

	if ($shareName eq "") {
		return 0;
	}
	
	my $shareValue = [$self->{shareinfo_webaxs}->get_key_value($shareName)]->[2];

	if (defined($shareValue)) {
		if ($type eq "enabled") {
			if($shareValue ne "off"){
				return 1;
			}
		}
		elsif ($type eq "anonymous") {
			if($shareValue eq "anony"){
				return 1;
			}
		}
		elsif($type eq "anylogin") {
			if($shareValue eq "all"){
				return 1;
			}
		}
		return 0;
	}
	
	return 0;
}

# for WebAxs 3.0
sub modifyShareFor3 {
	my $self = shift;
	my $value = shift;
	my $shareName = shift;

	# 要素が存在しない場合、サイズ0の配列が返却される
	if ($self->{shareinfo_webaxs}->get_key_value($shareName) == 0) {
		$self->createShare($value,$shareName);
	}
	else {
		$self->_modifyShare($value,$shareName);
	}
	return;
}

sub deleteShare {
	my $self = shift;
	my $shareName = shift;
	
	$self->{shareinfo_webaxs}->set_remove_key($shareName);
	
	$self->_save();
}

sub changeShareName {
	my $self = shift;
	my $oldName = shift;
	my $newName = shift;
	
	$self->{shareinfo_webaxs}->set_change_key($oldName, $newName);
	$self->_save();
}


sub _modifyShare {
	my $self = shift;
	my $value = shift;
	my $shareName = shift;
	
	$self->{shareinfo_webaxs}->set_change_key_value($shareName,
		[$self->{shareinfo_webaxs}->get_key_value($shareName)]->[1],
		$value);
	$self->_save();
	return;
}

sub createShare {
	my $self = shift;
	my $value = shift;
	my $shareName = shift;
	
	if(!defined($value)){
		$value = 'off';
	}
	
	if ($shareName =~ /usbdisk[1-4]/) {
		$self->{shareinfo_webaxs}->set_add_key_value($shareName,
			$shareName."/..", $value, "", "", "", "", "");
	}
	else {
		my $shareinfo = new BufCommonFileShareInfo;
		$shareinfo->init(SHAREINFO_FILE);
		$self->{shareinfo_webaxs}->set_add_key_value($shareName, 
			[$shareinfo->get_key_value($shareName)]->[1], 
			$value, "", "", "", "", "");
	}
	$self->_save();
}

sub getShareInfo {
	my $self = shift;
	my $shareName = shift;
	
	my $value = [$self->{shareinfo_webaxs}->get_key_value($shareName)];
	
	return $value->[2];
}

sub getDiskInfo {
	my $self = shift;
	my $shareName = shift;
	
	my $value = [$self->{shareinfo_webaxs}->get_key_value($shareName)];
	
	return $value->[1];
	}

sub getAllShare {
	my $self = shift;
	my @info = $self->{shareinfo_webaxs}->get_key_all();
	
	return @info;
}


sub changeUserName {
	my $self = shift;
	my $oldName = shift;
	my $newName = shift;
	
	unless(-f USER_CONFIG_DIR . $oldName){
		return;
	}
	
	rename(USER_CONFIG_DIR . $oldName,USER_CONFIG_DIR . $newName)
}

sub restartWebAxs {
	my $self = shift;
	my $command = shift;
	
	if(!defined($command) || ($command ne 'graceful')){
		$command = 'restart';#default restart method
	}
	
	system('/usr/local/webaxs/sbin/init.sh ' . $command . ' 1 >/dev/null 2> /dev/null &');
}

sub extra {
	my $self = shift;
	print "\n";
	print "mainstatus: " . $self->{mainstatus} . "\n";
	print "upnpstatus: " . $self->{upnpstatus} . "\n";
	print "buffalonasstatus: " . $self->{buffalonasstatus} . "\n";
	print "sslstatus: " . $self->{sslstatus} . "\n";
	print "name: " . $self->{name} . "\n";
	print "key: " . $self->{key} . "\n";
	print "port: " . $self->{port} . "\n";
	print "localip: " . $self->{localip} . "\n";
	print "externalip: " . $self->{externalip} . "\n";
	print "shares: " . join(",",@{$self->{shares}}) . "\n";
	print "sharesanonymous: " . join(",",@{$self->{sharesanonymous}}) . "\n";
	print "sharesanylogin: " . join(",",@{$self->{sharesanylogin}}) . "\n";
	print "namestringlimit: " . $self->{namestringlimit} . "\n";
	print "tmpdirectory: " . $self->{tmpdirectory} . "\n";
	print "version: " . $self->{version} . "\n";
	return;
}

1;
