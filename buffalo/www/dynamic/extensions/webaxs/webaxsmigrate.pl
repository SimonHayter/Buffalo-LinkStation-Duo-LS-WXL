use strict;
use lib '/www/buffalo/www/dynamic/extensions/webaxs';

use WebAxs2Config;
use WebAxsConfig;

use constant 'CONFIG_DIR' => '/etc/melco/';
use constant 'SHAREINFO_FILE' => CONFIG_DIR . 'shareinfo';
use constant "USBDISK_SHAREINFO" => CONFIG_DIR . 'usbshareinfo';

use constant 'WEBAXS2_CONFIG' => '/modules/webaxs/etc/webaxs.conf';

use lib '/www/cgi-bin/module';
use BufCommonFileInfo;
use BufCommonFileShareInfo;



unless(-f WEBAXS2_CONFIG){
	print "*** WebAxs2 file not found. ***\n";
	exit;
}

my $webaxs2 = WebAxs2Config->new;
my $webaxs3 = WebAxsConfig->new;

my $shareinfo = new BufCommonFileShareInfo;
$shareinfo->init(SHAREINFO_FILE);

foreach($shareinfo->get_key_all){
	my $webaxs_perm;

	if (!$webaxs2->isShare("enabled", $_)) {
		$webaxs_perm = 'off';
	}
	elsif ($webaxs2->isShare("anonymous", $_, "ui")) {
		$webaxs_perm = 'anony';
	}
	elsif ($webaxs2->isShare("anylogin", $_, "ui")) {
		$webaxs_perm = 'all';
	}
	else {
		$webaxs_perm = 'below';
	}

	print("$_:$webaxs_perm\n");
	$webaxs3->modifyShareFor3($webaxs_perm, $_);
}

my $usbshareinfo = new BufCommonFileShareInfo;
$usbshareinfo->init(USBDISK_SHAREINFO);

system("rm /etc/melco/shareinfo.webaxs.USBDISK");

foreach($usbshareinfo->get_key_all){
	my $webaxs_perm;

	if (!$webaxs2->isShare("enabled", $_)) {
		$webaxs_perm = 'off';
	}
	elsif ($webaxs2->isShare("anonymous", $_, "ui")) {
		$webaxs_perm = 'anony';
	}
	elsif ($webaxs2->isShare("anylogin", $_, "ui")) {
		$webaxs_perm = 'all';
	}
	else {
		$webaxs_perm = 'below';
	}

	print("$_:$webaxs_perm\n");
	$webaxs3->modifyShareFor3($webaxs_perm, $_);
	system("perl /usr/local/bin/WebAxs_UnmoutUsbDisk.pl $_");
	$webaxs3->deleteShare($_);
}

$webaxs3->{mainstatus} = $webaxs2->{mainstatus};
$webaxs3->{upnpstatus} = $webaxs2->{upnpstatus};
$webaxs3->{buffalonasstatus} = $webaxs2->{buffalonasstatus};
$webaxs3->{buffalonasstatus} = $webaxs2->{buffalonasstatus};
$webaxs3->{sslstatus} = $webaxs2->{sslstatus};
$webaxs3->{name} = $webaxs2->{name};
$webaxs3->{key} = $webaxs2->{key};
$webaxs3->{altname} = $webaxs2->{altname};
$webaxs3->{port} = $webaxs2->{port};
$webaxs3->{inner_port} = "9000";
$webaxs3->{session_expire_min} = "30";
$webaxs3->{session_exclusive} = "off";
$webaxs3->{detail_settings} = "on";

$webaxs3->_save;
unlink(WEBAXS2_CONFIG);

my $webaxs2cron = '/modules/webaxs/module/scripts/cron.pl';
my $webaxs3cron = '/www/buffalo/www/dynamic/extensions/webaxs/cron.pl';
my $crontab = '/etc/cron/crontabs/root';
system("sed -i -e 's%$webaxs2cron%$webaxs3cron%' '$crontab'");

my @result = `df | grep /dev/usbdisk | sed -e 's|.*/mnt/usbdisk||'`;

foreach(@result){
	chomp;
	my $disk_name = 'usbdisk' . $_;
	system("perl /usr/local/bin/WebAxs_MountUsbDisk.pl $disk_name > /hoge 2>&1");
}

sleep 5;
