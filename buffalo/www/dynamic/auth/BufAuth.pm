#!/usr/bin/speedy
;#################################################
;# BufAuth.pm
;# useage :
;#	$class = new BufAuth;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;#################################################


package BufAuth;

use lib '/www/buffalo/www/dynamic/system/update';

use BUFFALO::Session::Create;
use BufGroupInfo;
use BufCommonFileInfo;
use BufBasicLocale;
use BufUpdate;

use strict;
use JSON;


sub new {
	my $class = shift;
	my $self = bless {
		language => undef,
		update => undef

	}, $class;

	return $self;
}

sub init {
	my $self = shift;
	$self->load;

	return;
}

sub load {
	my $self	= shift;
	my $locale	= BufBasicLocale->new();
	my $update = BufUpdate->new();

	$locale->init();
	$update->init();

	my $language = $locale->get_lang();

	if ($language eq "japanese")		{ $language = "ja"; }
	elsif ($language eq "english")		{ $language = "en"; }
	elsif ($language eq "german")		{ $language = "de"; }
	elsif ($language eq "french")		{ $language = "fr"; }
	elsif ($language eq "italian")		{ $language = "it"; }
	elsif ($language eq "spanish")		{ $language = "es"; }
	elsif ($language eq "simplified")	{ $language = "zh-cn"; }
	elsif ($language eq "traditional")	{ $language = "zh-tw"; }
	elsif ($language eq "korean")		{ $language = "ko"; }
	elsif ($language eq "portuguese")	{ $language = "pt"; }
	elsif ($language eq "dutch")		{ $language = "nl"; }
	elsif ($language eq "swedish")		{ $language = "sv"; }
	elsif ($language eq "thai")			{ $language = "th"; }
	elsif ($language eq "russian")		{ $language = "ru"; }
	elsif ($language eq "arabic")		{ $language = "ar"; }
	elsif ($language eq "finnish")		{ $language = "fi"; }
	elsif ($language eq "turkish")		{ $language = "tr"; }

	else								{ $language = "en"; }

	$self->{language} = $language;
	$self->{update} = $update->getUpdateStatus_wo_JSON();

	return;
}

# This function will return the language in the system.
sub get_lang {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();

	push(@dataArray, {
		'lang' => $self->{language},
		'update' => $self->{update}
	});

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub verify_Login {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $success;
	my $sid;
	my $rid;
	my $pageMode;

	my $guest_mode_flag = 1;
	my $temp = readpipe("grep '^guest:' /etc/shadow 2> /dev/null");
	if (!$temp) {
		$guest_mode_flag = 0;
	}

	my $group = BufGroupInfo->new();
	$group->init('admin');

	my $common_info = BufCommonFileInfo->new();
	$common_info->init('/etc/melco/info');

	my @adGroup_user = $group->get_user;

	my $admin_name = 'admin';
	my $temp = readpipe("grep ':x:52:' /etc/passwd 2> /dev/null");
	my @temp = split( /:/ , $temp);
	if ($temp[0]) {
		$admin_name = $temp[0];
	}

	my $username = $cgiRequest->param("user");
	my $pwd = $cgiRequest->param("password");

	if ((!global_authenticate('login', $username, $pwd)) && (($username ne 'guest') || (!$guest_mode_flag))) {
		$success = JSON::false;
		return to_json( { 'success'=> $success, 'data'=>\@dataArray, 'errors'=>\@errors } );
	}
	else {
		$success = JSON::true;
	}

	my $sss = BUFFALO::Session::Create->new($sid, $rid, $username) or die;

	$sid = $sss->sid();
	$rid = $sss->rid();
	$username = $sss->username();

	$pageMode = 2; # other

#	if ($username eq 'admin') {
	if ($username eq $admin_name) {
		$pageMode = 0;
	}
	else {
		foreach my $temp (@adGroup_user){
			if ($temp eq $username) {
				$pageMode = 1;
			}
		}
	}

	if (($common_info->get_info('workingmode') eq 'iSCSI') && ($pageMode != 0)) {
		$success = JSON::false;
	}

	push(@dataArray, {'sid' => $sid, 'pageMode' => $pageMode});
	return to_json( { 'success'=> $success, 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub validate_Login {
	my $self = shift;
	my $success = 0;

	my $file;
	my $file_temp;
	my $cookie;
	my $myCookie;
	my @crumbs;
	my @ssid_lan;

	# cookie properties
	my $uid;
	my $sid;

	# import/split all cookies
	my $rcvd_cookies = $ENV{'HTTP_COOKIE'};
	my @cookies = split/; /,$rcvd_cookies;

	# file constants
	my $cgiPrefix = 'cgisess_';
	my $path = '/var/session/';

	my $i;

	for ($i = 0 ; $i < @cookies; $i++) {
		unless ($cookies[$i] =~ m#^webui_session_#) {
			next;
		}

		@crumbs = split(/=/,$cookies[$i]);
		$uid = @crumbs[0];
		$uid =~ s#^webui_session_##;
		@ssid_lan = split(/_/,@crumbs[1]);
		$sid = @ssid_lan[0];
		$file = $path.$cgiPrefix.$sid;
		$file_temp = $path.$cgiPrefix.$sid.'_temp';

		# add validation for sid, username & expire date
		if (-e $file) { # check sid
#			my $session_file = readpipe("cat $file");
			open (FILE, "<$file") or die "Can't open session file $file";
			my $session_file = do { local $/; <FILE> };
			close (FILE);

			my @session_file = split(/username\' => \'/, $session_file);
			my $session_username = $session_file[1];
			$session_username =~ s/'.*//;

			@session_file = split(/_SESSION_ETIME\' => /, $session_file);
			my $session_etime = $session_file[1];
			$session_etime =~ s/,.*//;

			@session_file = split(/_SESSION_ATIME\' => /, $session_file);
			my $session_atime = $session_file[1];
			$session_atime =~ s/,.*//;

			if (($session_username eq $uid) && ($session_atime + $session_etime >= time())) {
				$success = 1;
				my $time = time();
#				system ("sed -e 's/$session_atime/$time/' $file > $file_temp 2> /dev/null");
#				system ("mv $file_temp $file 2> /dev/null");
				$session_file =~ s/$session_atime/$time/;
				open (FILE, ">$file") or die "Can't open session file for writing $file";
				print FILE $session_file;
				close (FILE);
			}
			else {
				unlink ($file);
			}
		}

		return $success;
	}
}

use Authen::PAM;
use POSIX qw(ttyname);

our $global_auth_service;
our $global_auth_username;
our $global_auth_password;
our $global_auth_pamh;
our $global_auth_responce;
our $global_auth_ttyname;

sub global_authenticate {
	$global_auth_service  = shift;
	$global_auth_username = shift;
	$global_auth_password = shift;
	$global_auth_ttyname = ttyname(fileno(STDIN));

	ref($global_auth_pamh = new Authen::PAM($global_auth_service, $global_auth_username, \&_global_authenticate_conv)) || die '[top] Can not create object - Authen::PAM';

	$global_auth_responce = $global_auth_pamh->pam_set_item(PAM_TTY(), $global_auth_ttyname);
	$global_auth_responce = $global_auth_pamh->pam_authenticate();

	undef $global_auth_service;
	undef $global_auth_username;
	undef $global_auth_password;
	undef $global_auth_pamh;
	undef $global_auth_ttyname;

	if ($global_auth_responce == PAM_SUCCESS()) {
		undef $global_auth_responce;
		return 1;
	}
	else {
		undef $global_auth_responce;
		return 0;
	}

	undef $global_auth_responce;
	return 0;
}

sub _global_authenticate_conv {
	my @res;

	while (@_) {
		my $code = shift;
		my $msg = shift;
		my $ans = '';

		$ans = $global_auth_username if ($code == PAM_PROMPT_ECHO_ON());
		$ans = $global_auth_password if ($code == PAM_PROMPT_ECHO_OFF());

		push @res, (PAM_SUCCESS(), $ans);
	}
	push @res, PAM_SUCCESS();

	return @res;
}

1;
