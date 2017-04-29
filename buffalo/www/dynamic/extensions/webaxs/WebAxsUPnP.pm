# WebAxsUPnP.pm
#
# Class to use UPnP functionality
# Usage: $class = WebAxsUPnP->new(portnumber);

package WebAxsUPnP;

use lib '/www/cgi-bin/module/mv_old';
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use Net::UPnP::ControlPoint;
use Net::UPnP::GW::Gateway;
use WebAxsBuffaloFunctions;
use WebAxsTranslator;

# Creates a new instance of the class (saving the port number)
sub new {
	my $class = shift;
	my $port = shift;
	my $inner_port = shift;
	
	my $self = {};
	$self->{port}			= $port;
	$self->{inner_port}		= $inner_port;
	$self->{gatewayDevice}	= undef;
	$self->{gatewayControl} = undef;
	$self->{service} = undef;
	
	bless($self, $class);
	return $self;
}

# Updates the UPnP usage on a port. Deletes the port forwarding first, and then readds the port forwarding. FindGateway must be called before this function.
# Returns a string representing an error, and a null string if there is no error
sub updateUpnpAll {
	my $self = shift;
	$self->deletePortForwarding();
	unless ($self->forwardPort()) {
		# Get translator ready
		my $translator = WebAxsTranslator->new();
		$translator->serverSide();
		
		return $translator->{upnp_ForwardFail};
	}
	return "";
}

# Updates the UPnP usage on a port. Adds the port forwarding. FindGateway must be called before this function.
# Returns a string representing an error, and a null string if there is no error
sub updateUpnpForwardOnly {
	my $self = shift;
	unless ($self->forwardPort()) {
		# Get translator ready
		my $translator = WebAxsTranslator->new();
		$translator->serverSide();
		
		return $translator->{upnp_ForwardFail};
	}
	return "";
}

# Finds a UPnP gateway. Stores gateway in class.
# Returns 1 if gateway found, 0 if not
sub findUpnpGateway {
	my $self = shift;
	
	my $obj = Net::UPnP::ControlPoint->new();
	my @dev_list = ();
	my $retry_cnt = 0;
	while (@dev_list <= 0 && $retry_cnt < 5) {
		@dev_list = $obj->search(st =>'upnp:rootdevice', mx => 3);
		$retry_cnt++;
	}
	
	UPNP: foreach my $dev (@dev_list) {
		my $device_type = $dev->getdevicetype();
		if ($device_type eq 'urn:schemas-upnp-org:device:InternetGatewayDevice:1') {

###TODO###
			my $skip = 0;
			PPP: for (my $i = 1; $i <= 5; $i++) {
				my $upnp_try = "urn:schemas-upnp-org:service:WANPPPConnection:" . "$i";
				if ($dev->getservicebyname($upnp_try)) {
					$skip = 1;
					$self->{service} = $upnp_try;
					last PPP;
				}
			}
##########
			unless ($skip) {
				WANIP: for (my $i = 1; $i <= 5; $i++) {
					my $upnp_try = "urn:schemas-upnp-org:service:WANIPConnection:" . "$i";
					if ($dev->getservicebyname($upnp_try)) {
						$self->{service} = $upnp_try;
						last WANIP;
					}
					next UPNP if ($i == 5);
				}
			}
			my $gwdev = Net::UPnP::GW::Gateway->new();
			$gwdev->setdevice($dev);
			$self->{gatewayControl} = $dev;
			$self->{gatewayDevice} = $gwdev;
			return 1;
		}
	}
	return 0;
}

# Forwards the port via Upnp. FindGateway must be called before this function.
# Returns 1 for success, 0 for failure
sub forwardPort {
	my $self = shift;
	
	my %portMapAction = (
		NewRemoteHost => '',
		NewExternalPort => $self->{port},
		NewProtocol => 'TCP',
		NewInternalPort => $self->{inner_port},
		NewInternalClient => WebAxsBuffaloFunctions->BuffaloGetLocalIp(),
		NewEnabled => 1,
		NewPortMappingDescription => 'BuffaloWebAxs_'.WebAxsBuffaloFunctions->BuffaloGetLocalIp(),
		NewLeaseDuration => 0,
		Service => $self->{service},
		);
	unless ($self->{gatewayDevice}->addportmapping(%portMapAction) == 1) { return 0; }
	return 1;
}

# Deletes a port mapping via Upnp. FindGateway must be called before this function.
sub deletePortForwarding {
	my $self = shift;
	
	my %deleteMapAction = (
		NewRemoteHost => '',
		NewExternalPort => $self->{port},
		NewProtocol => 'TCP',
		Service => $self->{service},
		);
	$self->{gatewayDevice}->deleteportmapping(%deleteMapAction);
	return;
}

1;
