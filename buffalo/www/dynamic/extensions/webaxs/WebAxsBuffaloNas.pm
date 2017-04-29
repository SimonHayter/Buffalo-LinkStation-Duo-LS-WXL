# WebAxsBuffaloNas.pm
#
# Class to update and communicate with BuffaloNas.com
# Usage: $class = WebAxsBuffaloNas->new(WebAxsConfigClass);

package WebAxsBuffaloNas;

use lib '/www/cgi-bin/module';
use lib '/www/cgi-bin/module/mv_old';
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use LWP::Simple;
use JSON1;
use WebAxsBuffaloFunctions;
use WebAxsTranslator;

my $webAxsURL = "http://buffalonas.com/reply.php";

# Creates a new instance of the class; invoked with the WebAxsConfig class;
sub new {
	my $class = shift;
	my $webAxsConfig = shift;
	
	my $self = {};
	$self->{webaxsconfig} = $webAxsConfig;

	bless($self, $class);
	return $self;
}

# Updates BuffaloNas.com
sub update {
	my $self = shift;
	
	# Get translator ready
	my $translator = WebAxsTranslator->new();
	$translator->serverSide();

	my $request =
		'?name=' . $self->{webaxsconfig}->{name} .
		'&key=' . $self->{webaxsconfig}->{key} .
		'&port=' . $self->{webaxsconfig}->{port} .
		'&localip=' . WebAxsBuffaloFunctions->BuffaloGetLocalIp() .
		'&localport=' . $self->{webaxsconfig}->{inner_port} .
		'&ssl=' . $self->{webaxsconfig}->{sslstatus} ;

	my $globalip = WebAxsBuffaloFunctions->BuffaloGetGlobalIp();

	$globalip =~ s/\s//g;
	$globalip =~ s/0*([0-9]+)/$1/g;

	if($globalip =~ /^(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])\.(\d|[01]?\d\d|2[0-4]\d|25[0-5])$/){
		if($globalip !~ /^10\./ ){
			if($globalip !~ /^172\.(1[6-9]|2\d|3[0-1])\./ ){
				if($globalip !~ /^192\.168\./ ){
					$request = $request . '&globalip=' . $globalip;
				}
			}
		}
	}

	my $content = get($webAxsURL . $request);
	return $translator->{bnas_UpdateFail} unless defined $content;

	# Decode data returned from BuffaloNas.com
	my $jsonDecode = jsonToObj($content);
	if ($jsonDecode->[0] ne "OK") {
		return $jsonDecode->[1];
	}

	return "";
}

1;
