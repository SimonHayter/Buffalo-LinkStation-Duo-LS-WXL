# WebAxsConfig.pm
#
# Used to access and modify WebAxs configuration files
# Usage: $class = WebAxsConfig->new();

package WebAxs2Config;

use lib '/www/cgi-bin/module/mv_old';
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use JSON1;
my $webAxsConfFile = "/modules/webaxs/etc/webaxs.conf";

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
	$self->{tmpdirectory}		= "/mnt/disk1/";
	
	bless($self, $class);

	# Loads the existing WebAxs.conf info into the class
	if (-r $webAxsConfFile) {
		open (WACONF,"<" . $webAxsConfFile);
		my $fileString = join("",<WACONF>);
		close (WACONF);
		my $loadedData = jsonToObj($fileString);
		for my $key (keys(%$loadedData)) { $self->{$key} = $loadedData->{$key}; }
	}

	$self->{sharesanonymous_ui} = $self->{sharesanonymous};
	$self->{sharesanylogin_ui} = $self->{sharesanylogin};

	# when guest disable, anonymous access disable.
	my $temp = readpipe("grep '^guest:' /etc/shadow 2> /dev/null");
	if (!$temp) {
		foreach my $sharesanonymous (@{$self->{sharesanonymous}}) {
			push @{$self->{sharesanylogin}}, $sharesanonymous;
		}
		$self->{sharesanonymous} = [];
	}


	return $self;
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
	
	if($shareName eq ""){
		return 0;
	}
	my @shareList = @{$self->{shares}};
	if ($type eq "anonymous") {
		if ($isUi) {
			@shareList = @{$self->{sharesanonymous_ui}};
		}
		else {
			@shareList = @{$self->{sharesanonymous}};
		}
	}
	if ($type eq "anylogin") {
		if ($isUi) {
			@shareList = @{$self->{sharesanylogin_ui}};
		}
		else {
			@shareList = @{$self->{sharesanylogin}};
		}
	}

	foreach my $share (@shareList) {
		if ($share eq $shareName) {
			return 1;
		}
	}

	return;
}
