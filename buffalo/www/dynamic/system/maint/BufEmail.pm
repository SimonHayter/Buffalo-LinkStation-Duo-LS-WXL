#!/usr/bin/speedy
;#################################################
;# BufEmail.pm
;# usage :
;#	$class = new BufEmail;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#################################################


package BufEmail;

use BufMaintenanceEmail;
use BufCommonFileInfo;
use BufCommonDataCheck;
use strict;
use JSON;

sub new {
	my $class = shift;
	my $self = bless {
		notification	=> undef,
		hddStatRpt		=> undef,
		systemAlert		=> undef,
		fanTrouble		=> undef,
		diskError		=> undef,
		backupComp		=> undef,

		quotaRpt		=> undef,

		hddStatSendTime	=> undef,
		smtpAddr		=> undef,
		smtpPort		=> undef,
		pop3Addr		=> undef,
		pop3Port		=> undef,
#		method			=> undef,
		authType		=> undef,
		user			=> undef,
		passwd			=> undef,
		ssl_tls			=> undef,
		sendMsg			=> undef,
		subject			=> undef,
		emailList		=> [],
		maxEmailList	=> 5
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->load;
	
	return;
}

sub load {
	my $self			= shift;
	my $mail			= BufMaintenanceEmail->new();
	my $max_emailList	= $self->{maxEmailList};
	my $i;
	$mail->init();
	
	$self->{notification}		= $mail->get_status;
#	$self->{hddStatRpt}			= $mail->get_daily;
	$self->{hddStatRpt}			= $mail->get_hdd_report;
	$self->{systemAlert}		= $mail->get_system_report;
	$self->{fanTrouble}			= $mail->get_fan;
	$self->{diskError}			= $mail->get_disk;
	$self->{backupComp}			= $mail->get_backup;

	$self->{quotaRpt}			= $mail->get_quota_report;

	$self->{hddStatSendTime}	= $mail->get_hdd_status_time;
	$self->{smtpAddr}			= $mail->get_smtp;
	
	$self->{smtpPort}			= $mail->get_smtp_port;
	$self->{pop3Addr}			= $mail->get_pop3;
	$self->{pop3Port}			= $mail->get_pop3_port;
#	$self->{method}				= $mail->get_method;
	$self->{authType}		 	= $mail->get_method;
	
#	if (!$self->{authType}) {
#		$self->{authType} = 'no';
#	}
	
	$self->{user}				= $mail->get_user;
	$self->{passwd}				= $mail->get_password;
	if ($self->{passwd}) {
		$self->{passwd} = 1;
	}
	else {
		$self->{passwd} = undef;
	}
	
	$self->{ssl_tls}			= $mail->get_ssl_tls;
	
	$self->{sendMsg}			= 'on';
	$self->{subject}			= $mail->get_subject;
	
	for ($i = 1; $i <= $max_emailList; $i++) {
		if ($mail->get_email($i)) {
			$self->{emailList}->[$i - 1] = $mail->get_email($i);
		}
	}
	
	return;
}

sub get_mailSettings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	
	my $dataHash = {
		'notification'		=> $self->{notification},
		'hddStatRpt'		=> $self->{hddStatRpt},
		'systemAlert'		=> $self->{systemAlert},
		'fanTrouble'		=> $self->{fanTrouble},
		'diskError'			=> $self->{diskError},
		'backupComp'		=> $self->{backupComp},

		'quotaRpt'			=> $self->{quotaRpt},

		'hddStatSendTime'	=> $self->{hddStatSendTime},
		'smtpAddr'			=> $self->{smtpAddr},
		
		'smtpPort'			=> $self->{smtpPort},
		'pop3Addr'			=> $self->{pop3Addr},
		'pop3Port'			=> $self->{pop3Port},
		'authType'			=> $self->{authType},
		'user'				=> $self->{user},
		'passwd'			=> $self->{passwd},
		'ssl_tls'			=> $self->{ssl_tls},
		
		'sendMsg'			=> $self->{sendMsg},
		'subject'			=> $self->{subject}
	};
	
	@dataArray = ($dataHash);
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub get_emailList {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt			= @{$self->{emailList}};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push (@dataArray, {'email' => $self->{emailList}->[$i]});
	}
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>@errors };
	return to_json($jsnHash);
}

sub set_mailSettings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $mail		= BufMaintenanceEmail->new;
	my $file		= BufCommonFileInfo->new();
	my $cnt			= $self->{maxEmailList};
	my $i;
	$mail->init();
	$file->init('/etc/melco/ssmtp.conf');
	
	my $notification	= $cgiRequest->param('notification');
	my $hddStatRpt		= $cgiRequest->param('hddStatRpt');
	my $systemAlert		= $cgiRequest->param('systemAlert');
	my $fanTrouble		= $cgiRequest->param('fanTrouble');
	my $diskError		= $cgiRequest->param('diskError');
	my $backupComp		= $cgiRequest->param('backupComp');

	my $quotaRpt		= $cgiRequest->param('quotaRpt');

	my $hddStatSendTime	= $cgiRequest->param('hddStatSendTime');
	my $smtpAddr		= $cgiRequest->param('smtpAddr');
	my $sendMsg			= $cgiRequest->param('sendMsg');
	my $subject			= $cgiRequest->param('subject');
	my $emailList		= $json->utf8->decode($cgiRequest->param('emailList'));
	my $smtpPort		= $cgiRequest->param('smtpPort');
	my $pop3Addr		= $cgiRequest->param('pop3Addr');
	my $pop3Port		= $cgiRequest->param('pop3Port');
	my $authType		= $cgiRequest->param('authType');
	my $user			= $cgiRequest->param('user');
	$user =~ s#\s##g;
	my $passwd			= $cgiRequest->param('passwd');
	my $ssl_tls			= $cgiRequest->param('ssl_tls');
	
	@errors = check_Data($self, $cgiRequest);

=pod
	if ($passwd ne '********') {
		$passwd = "'".$passwd."'";
	}
	else {
		$passwd = '';
	}
=cut
	
	if (@errors == 0) {
		if ($notification eq "on") {
			$mail->set_status($notification);
			$mail->set_smtp($smtpAddr);
			$mail->set_subject($subject);
			$mail->set_hdd_report($hddStatRpt);
			$mail->set_disk($diskError);
			$mail->set_system_report($systemAlert);
			$mail->set_fan($fanTrouble);
			$mail->set_backup($backupComp);
			
			$mail->set_quota_report($quotaRpt);
			
			$mail->set_smtp_port($smtpPort);
			$mail->set_pop3($pop3Addr);
			$mail->set_pop3_port($pop3Port);
			$mail->set_method($authType);
			$mail->set_user($user);
#			if ($passwd) {
			if ($passwd ne "\ \ \ \ \ \ \ \ ") {
				$mail->set_password($passwd);
			}
			$mail->set_ssl_tls($ssl_tls);
			
			$file->set_info("FromLineOverride", "YES");
			$file->save();

			for ($i = 0; $i < $cnt; $i++) {
				$mail->set_email($i + 1, $emailList->[$i] );
			}
			if ($hddStatRpt eq "on") {
				$mail->set_hdd_status_time($hddStatSendTime);
			}
		}
		else {
			$mail->set_status($notification);
		}
		$mail->save;
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub check_Data {
	my $self			= shift;
	my $cgiRequest		= shift;
	my @errors			= ();
	my $check			= BufCommonDataCheck->new();
	my $json			= new JSON;
	
	my $notification	= $cgiRequest->param('notification');
	my $hddStatRpt		= $cgiRequest->param('hddStatRpt');
	my $systemAlert		= $cgiRequest->param('systemAlert');
	my $fanTrouble		= $cgiRequest->param('fanTrouble');
	my $diskError		= $cgiRequest->param('diskError');
	my $backupComp		= $cgiRequest->param('backupComp');

	my $quotaRpt		= $cgiRequest->param('quotaRpt');

	my $smtpAddr		= $cgiRequest->param('smtpAddr');
	my $subject			= $cgiRequest->param('subject');
	my $emailList		= $json->utf8->decode($cgiRequest->param('emailList'));
	my $cnt				= @{$emailList};

	my $authType		= $cgiRequest->param('authType');
	my $pop3Addr		= $cgiRequest->param('pop3Addr');
	my $user			= $cgiRequest->param('user');

	my $i;
	
	if ($notification eq "on") {
		$check->init($smtpAddr);
		if ($smtpAddr eq "") { push @errors, 'emailNotif_err1'; }
		if (!$check->check_max_length('50')) { push @errors, 'emailNotif_err2'; }
		if (!$check->check_smtp_address) { push @errors, 'emailNotif_err3'; }
		
		$check->init($subject);
		if ($subject eq "") { push @errors, 'emailNotif_err4'; }
#		if (!$check->check_max_length('50')) { push @errors, 'emailNotif_err5'; }
		if (!$check->check_max_length('75')) { push @errors, 'emailNotif_err5'; }
		if (!$check->check_1st_space) { push @errors, 'emailNotif_err6'; }
		if (!$check->check_comment) { push @errors, 'emailNotif_err7'; }
		
		if ($cnt eq 0) {
			push @errors, 'emailNotif_err8';
		}
		else {
			for ($i = 0; $i < $cnt; $i++) {
				$check->init($emailList->[$i]);
				if (!$check->check_mail_address_at_mark) { push @errors, ('emailNotif_err9'); }
				elsif (!$check->check_mail_address) { push @errors, ('emailNotif_err10'); }
			}
		}
		
		if ((!$hddStatRpt) && (!$diskError) && (!$systemAlert) && (!$fanTrouble) && (!$backupComp) && (!$quotaRpt)) {
			push @errors, 'emailNotif_err11';
		}

		if ($authType eq 'PBS') {
			$check->init($pop3Addr);
			if ($pop3Addr eq "") { push @errors, 'emailNotif_err12'; }
			if (!$check->check_max_length('50')) { push @errors, 'emailNotif_err13'; }
			if (!$check->check_smtp_address) { push @errors, 'emailNotif_err14'; }
		}
	}
	
	return @errors;
}

sub set_EmailTestMsg {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $mail		= BufMaintenanceEmail->new;
	$mail->init();

	my $return;
	$return = $mail->set_test_email('/usr/share/tmail/test.jp');
	if ($return) {
		push @errors, 'emailNotif_testMsgError';
	}

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
