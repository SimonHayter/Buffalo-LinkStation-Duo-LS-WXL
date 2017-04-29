# WebAxsBuffaloFunctions.pm
#
# Used to access Buffalo's perl functions on the Link/Terastation

package WebAxsBuffaloFunctions;

use lib '/www/cgi-bin/module';
use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use BUFFALO::Common::Model;
our $gModel = BUFFALO::Common::Model->new();

my $webAxsCronScript = "/www/buffalo/www/dynamic/extensions/webaxs/cron.pl";

# Get Local IP
sub BuffaloGetLocalIp {
	use BUFFALO::Network::Ip;
	use BufCommonFileInfo;

	my $ip;
	my $file = BufCommonFileInfo->new;
	$file->init('/etc/melco/info');

	if ($file->get_info('my_eth2') eq 'trunk') {
		$ip	= BUFFALO::Network::Ip->new('bond0');
	}
	else {
		$ip = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	}

	return $ip->get_ip();
}

# Get Global IP
sub BuffaloGetGlobalIp {
use lib '/www/cgi-bin/module/mv_old';
use Net::UPnP::ControlPoint;
use Net::UPnP::GW::Gateway;
	
	my $obj = Net::UPnP::ControlPoint->new();
	my @dev_list = ();
	my $retry_cnt = 0;
	my $resp = 0;
	my $serv = 0;
	my $ip = '';
	
	while (@dev_list <= 0 && $retry_cnt < 5) {
		@dev_list = $obj->search(st =>'upnp:rootdevice', mx => 3);
		$retry_cnt++;
	}
	
	UPNP: foreach my $dev (@dev_list) {
		my $device_type = $dev->getdevicetype();
		if ($device_type eq 'urn:schemas-upnp-org:device:InternetGatewayDevice:1') {
			my $skip = 0;
			PPP: for (my $i = 1; $i <= 5; $i++) {
				my $upnp_try = "urn:schemas-upnp-org:service:WANPPPConnection:" . "$i";
				if ($dev->getservicebyname($upnp_try)) {
					$skip = 1;
					$serv = $dev->getservicebyname($upnp_try);
					last PPP;
				}
			}
			
			unless ($skip) {
				WANIP: for (my $i = 1; $i <= 5; $i++) {
					my $upnp_try = "urn:schemas-upnp-org:service:WANIPConnection:" . "$i";
					if ($dev->getservicebyname($upnp_try)) {
						$serv = $dev->getservicebyname($upnp_try);
						last WANIP;
					}
					next UPNP if ($i == 5);
				}
			}
			
			$resp = $serv->postaction("GetExternalIPAddress");
			unless($resp->getstatuscode() == 200){
				next;
			}

			$ip = $resp->getargumentlist();
			$ip = $ip->{'NewExternalIPAddress'};
			last;
		}
	}
	return $ip;
}

# Get set language
sub BuffaloGetLanguage {
	use BufBasicLocale;
	my $bufLocale = BufBasicLocale->new();
	$bufLocale->init();
	return $bufLocale->get_lang();
}

# Enables the WebAxs Cron script
sub BuffaloEnableCron {
	use BUFFALO::Common::Crontab;
	my $cron = BUFFALO::Common::Crontab->new();
	$cron->set_remove_schedule($webAxsCronScript);
	
	my $startTime = int(rand(15));
	my $schedule = '' . $startTime . ',' . ($startTime+15) . ',' .
		($startTime+30) . ',' . ($startTime+45);
	$cron->set_add_schedule($schedule, '*', '*', '*', '*', $webAxsCronScript);
	$cron->save();
}

# Disables the WebAxs Cron script
sub BuffaloDisableCron {
	use BUFFALO::Common::Crontab;
	my $cron = BUFFALO::Common::Crontab->new();
	$cron->set_remove_schedule($webAxsCronScript);
	$cron->save();
}

# Gets a list of all current shares
sub BuffaloGetCurrentShares {
	use BufShareListInfo;
	my $shareList = BufShareListInfo->new();
	$shareList->init();
	return $shareList->get_name();
}

# Get a list of all users on the Link/Terastation (excluding admin and guest accounts)
# Returns: List of all users
sub BuffaloGetAllUsers {
	use BufUserListInfo;
	my $userClass = BufUserListInfo->new();
	$userClass->init();
	my @allUsers = ();
	foreach my $user ($userClass->get_name()) {
		if ($gModel->is('SUPPORT_WEBAXS_ADMIN_ACCESS') eq '1') {
			if ( ($user ne 'guest') ) { push(@allUsers,$user); }
		}else{
			if ( ($user ne 'admin') && ($user ne 'guest') ) { push(@allUsers,$user); }
		}
	}
	return @allUsers;
}

# Get a list of all LOCAL users authorized to a share
# Usage: BuffaloGetShare($shareName, $type);		(where $type is "readonly" or "readwrite")
# Returns: List of users authorized to RO or RW on share
sub BuffaloGetShare {
	my $self = shift;
	my $shareName = shift;
	my $type = shift;

	use BufShareInfo;
	use BufGroupListInfo;
	use BufGroupInfo;
	
	my $shareClass = BufShareInfo->new();
	$shareClass->init($shareName);
	
	# Create a user list array that will eventually hold all the users of this share. Start by populating it with just the user accounts.
	my @userList = ();
	if ($type eq "readwrite") { @userList = $shareClass->get_user_rw(); }
	else { @userList = $shareClass->get_user_r(); }

	# Go through groups
	my $groupListClass = BufGroupListInfo->new();
	$groupListClass->init();
	my @allGroups = $groupListClass->get_name();
	
	my @groupList = ();
	if ($type eq "readwrite") { @groupList = $shareClass->get_group_rw(); }
	else { @groupList = $shareClass->get_group_r(); }
	
	foreach my $groupName (@groupList) {
		# Check to make sure group is a local group
#		unless (grep(/^$groupName$/,@allGroups)) { next; }
		unless (grep(/^\Q$groupName\E$/, @allGroups)) { next; }
		# If it is a local group, parse its members into the user list array
		my $groupClass = BufGroupInfo->new();
		$groupClass->init($groupName);
		push(@userList,$groupClass->get_user);
	}
	
	# Go through each of the users in the user list, and verify that they are all local users
	my @allUsers = BuffaloGetAllUsers();
	my @returnUserList = ();
	foreach my $userName (@userList) {
#		unless (grep(/^$userName$/,@allUsers)) { next; }
		unless (grep(/^\Q$userName\E$/, @allUsers)) { next; }
		# Make sure we don't put the same user in twice
#		if (grep(/^$userName$/,@returnUserList)) { next; }
		if (grep(/^\Q$userName\E$/, @returnUserList)) { next; }
		push(@returnUserList,$userName);
	}
	
	return @returnUserList;
}

# Get the path that a share is on
# Usage: BuffaloGetSharePath($shareName)
# Returns: Location of share
sub BuffaloGetSharePath {
	my $self = shift;
	my $shareName = shift;
	
	use BufShareListInfo;
	my $sharesClass	= BufShareListInfo->new();
	$sharesClass->init();
	
	my @shareNames = $sharesClass->get_name;
	my @driveNames = $sharesClass->get_drive;

	my $i = 0;
	for ($i=0; $i<@shareNames; $i++) {
		if ($shareName eq $shareNames[$i]) { last; }
	}
	
	if ($shareName =~ /^usbdisk[1-4]$/) {
		return "/mnt/" . $shareName . "/";
	}
	if ($i == @shareNames) { return ""; }
	return "/mnt/" . $driveNames[$i] . "/" . $shareName . "/";
}

1;
















