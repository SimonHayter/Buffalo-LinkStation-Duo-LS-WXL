#!/usr/bin/perl 
$ENV{PATH} = "/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin";

use strict;
use lib '/www/cgi-bin/module';
#use lib '/www/cgi-bin/module/mv';

use lib '/www/buffalo/www/dynamic/auth';
use lib '/www/buffalo/www/dynamic/common';
use lib '/www/buffalo/www/dynamic/network';


use JSON;
use CGI;
use CGI::Carp qw(fatalsToBrowser);

use BufAuth;
use BufBasicLocale;
use BufPHP;

my @dataArray;
my @errors;

my $max_filesize = 1024 * 100; # 100KB
$CGI::POST_MAX = $max_filesize;

# run dos2unix if needed
$| = 1;

# List of Allowed extensions
my $query = new CGI;
my $path = '/tmp';

main();

sub main {
	print $query->start_html();

	my $Auth = BufAuth->new();
	$Auth->init;

	my $valid = $Auth->validate_Login();
	if ($valid) {
		checkFormat();
	}
	else {
		printError();
	}
}

sub checkFormat {
	my $errorMsg = '';
	$query->import_names('q');
	my $file;
	
	# Get the value from UI parameter sent in the submit action
	my $purpose = $q::purpose;
	
	if ($purpose eq 'ssl_key') {
		$file = $q::ssl_key;
	}
	elsif ($purpose eq 'ssl_crt') {
		$file = $q::ssl_certificate;
	}
	elsif ($purpose eq 'php_ini') {
		$file = $q::phpFile;
	}

	# Check file extension
	if ($file) {
		my @ta = split('\.', $file);
		my $sz = scalar(@ta);

		if ($sz > 1){
			my $ext = $ta[$sz - 1];
			
			if ($purpose eq 'ssl_key') {
				if (!grep(/$ext/i, 'key')) {
					printError("file_error_1");
					return;
				}
			}
			elsif ($purpose eq 'ssl_crt') {
				if (!grep(/$ext/i, 'crt')) {
					printError("file_error_1");
					return;
				}
			}
		}
		else {
			printError("file_error_2"); # The file is empty
			return;
		}
		
		# now upload file
		uploadFile($file, $purpose);
	}	
	else {
		printError("file_error_2"); # The file is empty
	}
}

sub uploadFile {
	my $filepath = shift;
	my $purpose = shift;

	my $bytes_read = 0;
	my $size = '';
	my $buff = '';
	my $start_time;
	my $filename = '';
	my $write_file = '';

	if ($filepath =~ /([^\/\\]+)$/){
		$filename = "$1";
	}
	else {
		$filename = "$filepath";
	}

	# if there's any space in the filename, get rid of them
	$filename =~ s/\s+//g;

	if ($purpose eq 'ssl_key') {
		$write_file = "$path/server.key";
	}
	elsif ($purpose eq 'ssl_crt') {
		$write_file = "$path/server.crt";
	}
	elsif ($purpose eq 'php_ini') {
		$write_file = "$path/php.ini";
	}

	if (open(WFD, ">$write_file")) {
		$start_time = time();
		while ($bytes_read = read($filepath, $buff, 2096)) {
			$size += $bytes_read;
			binmode WFD;
			print WFD $buff;

			if ($size >= $max_filesize) {
				last;
			}
		}
		close(WFD);
	}

	if ((stat $write_file)[7] <= 0) {
		unlink($write_file);
		printError("file_error_2");

		return;
	}
	else {
		if ($purpose eq 'php_ini') {
			my $php = BufPHP->new();
			$php->uploadPhpSettings();

			push @dataArray, "file_imported";
		}
		else {
			if ((-f '/tmp/server.key') && (-f '/tmp/server.crt')) {
				system ("/usr/local/bin/update_sslkey.sh 1>/dev/null 2>/dev/null &");
			}

			push @dataArray, "file_uploaded_ssl";
		}

		print to_json ({
			'success' => JSON::true,
			'data' => \@dataArray,
			'errors' => \@errors
		});
	}
}

sub printError {
	my $errorMsg = shift;
	if ($errorMsg) {
		push @errors, $errorMsg;
	}

	print to_json ({
		'success' => JSON::false,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}
