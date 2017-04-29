#!/usr/bin/perl

use lib '/www/cgi-bin/module';
#use lib '/www/cgi-bin/module/mv';

use lib '/www/buffalo/www/dynamic/auth';
use lib '/www/buffalo/www/dynamic/system/update';

use CGI;
use CGI::Carp qw(fatalsToBrowser);

use strict;
use BufAuth;
use BUFFALO::Information::Log;
use BUFFALO::Network::Ip;
use BUFFALO::Common::Model;

my $cgiRequest = CGI->new();
my $target = $cgiRequest->param("target");

unless ($target) {
	$target = 'log';
#	$target = 'rsrc';
}

if ($target eq 'log' && authenticate()) {
	my $gModel = BUFFALO::Common::Model->new();

	my $network = BUFFALO::Network::Ip->new($gModel->is('DEVICE_NETWORK_PRIMARY'));
	my $mac = $network->get_mac();
	$mac =~ s/://g;

	my $log = BUFFALO::Information::Log->new();
	my $file_path = '../'.$log->_get_all_save();
	my $data;
	my $filename;

	$filename = $mac.'.tgz';

	print "Content-disposition: attachment; filename=\"$filename\"\n";
	print "Content-type: text/download; name=\"$filename\"\n\n";

	# file open & lock
	if (!open (FILE, "<$file_path")) { die "[export]File Open Error - $file_path\n"; }
	if (!flock FILE, 2) { die "[export]File Lock Error - $file_path\n"; }

	while ($data = <FILE>) {
		print $data;
	}
}

if ($target eq 'rsrc' && authenticate()) {
#if ($target eq 'rsrc') {
	my $i;
	my $filename;

	my $target;
	my $filesize;

	my $fullpath;

	my @mounts = (
		'array1',
		'array2',
		'array3',
		'array4',
		'disk1',
		'disk2',
		'disk3',
		'disk4',
		'disk5',
		'disk6',
		'disk7',
		'disk8'
	);

	$filename = '/etc/melco/shareinfo';

	for ($i = 0; $i < @mounts; $i++) {
		$filesize = -s '/mnt/'.$mounts[$i];

		if ($filesize && ($filesize != 4096)) {
			$target = $mounts[$i];
			$i = @mounts;
		}
	}

	unless ($target) {
		goto END;
	}
	unless (open (FILE, ">>$filename")) {
		goto END;
	}
	unless (flock FILE, 2) {
		goto END;
	}

	$fullpath = '/mnt/'.$target.'/rsrc';

	unless (-d $fullpath) {
		mkdir $fullpath;

		print FILE "rsrc<>$target<><>all<>all<>all<>all<>1<>1<>1<>1<><>0<>1<>0<>0<>0<>1;\n";

		system ("ln -s /www/buffalo/www/locale $fullpath 1>/dev/null 2>&1");
		system ("mv $fullpath/locale $fullpath/webui 1>/dev/null 2>&1");

		system ("ln -s /usr/local/webaxs/www/ui/locale $fullpath 1>/dev/null 2>&1");
		system ("mv $fullpath/locale $fullpath/webaxs_full 1>/dev/null 2>&1");

		system ("ln -s /usr/local/webaxs/www/MultiDevice/locale $fullpath 1>/dev/null 2>&1");
		system ("mv $fullpath/locale $fullpath/webaxs_mobile 1>/dev/null 2>&1");

		system ("chmod -R 777 $fullpath/webui/ & 1>/dev/null 2>&1");
		system ("chmod -R 777 $fullpath/webaxs_full/ & 1>/dev/null 2>&1");
		system ("chmod -R 777 $fullpath/webaxs_mobile/ & 1>/dev/null 2>&1");

		mkdir $fullpath.'/_backup';
		system ("cp -r $fullpath/webui $fullpath/_backup/webui & 1>/dev/null 2>&1");
		system ("cp -r $fullpath/webaxs_full $fullpath/_backup/webaxs_full & 1>/dev/null 2>&1");
		system ("cp -r $fullpath/webaxs_mobile $fullpath/_backup/webaxs_mobile & 1>/dev/null 2>&1");
	}

	flock FILE, 8;
	close FILE;

	system ("/etc/init.d/smb.sh restart & 1>/dev/null 2>&1");
}

sub authenticate {
	my $Auth = BufAuth->new();
	$Auth->init;

	return $Auth->validate_Login();
}

END:
