#!/usr/bin/speedy
;#################################################
;# BufDomain.pm
;# usage :
;#	$class = new BufDomain;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#################################################

package BufDomain;

use BUFFALO::Daemon::Samba;
use BufAuthInfo;
use BufCommonDataCheck;
use BufUserListInfo;

use strict;
use JSON;

#require 'dynamic/common/global_init_system.pl';
use global_init_system;

sub new {
	my $class = shift;
	my $self  = bless {
		networkType		=> undef,
		winsIP			=> undef,
		wgName			=> undef,
		authServerType	=> undef,
		authServerName	=> undef,
		windowsServer	=> undef,
		autoUserReg		=> undef,
		authShare		=> undef,
		authShareName	=> undef,
		adBios			=> undef,
		adDns			=> undef,
		adDomCont		=> undef,
		userCount		=> undef

	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->load;
	
	return;
}

sub load {
	my $self = shift;
	my $samba = BUFFALO::Daemon::Samba->new();
	my $auth = BufAuthInfo->new();
	my $user = BufUserListInfo->new();
	
	$auth->init();
	$user->init();
	
	$self->{networkType}	= $samba->get_status;
	$self->{winsIP}			= $samba->get_wins;
	$self->{wgName}			= $samba->get_workgroup;
	$self->{authServerType}	= $auth->get_type();
	$self->{authServerName}	= $auth->get_server_name();
	$self->{windowsServer}	= $auth->get_server_type();
	$self->{autoUserReg}	= $auth->get_user_auto_add();
	$self->{authShare}		= $auth->get_test_folder();
	$self->{authShareName}	= $auth->get_test_folder_name();
	$self->{adBios}			= $samba->get_domain;
	if (!$self->{adBios}) {
		$self->{adBios} = $samba->get_workgroup;
	}
	$self->{adDns} 			= $samba->get_ad_dns;
	$self->{adDomCont}		= $samba->get_pdc;

	my $user_num = scalar($user->get_name());
	$self->{userCount}		= $user_num;
	
	return;
}

sub getDomain_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	
	my $dataHash = {
		'networkType'		=> $self->{networkType},
		'wgName'		 	=> $self->{wgName},
		'authServerType'	=> $self->{authServerType},
		'authServerName'	=> $self->{authServerName},
		'windowsServer'		=> $self->{windowsServer},
		'autoUserReg'		=> $self->{autoUserReg},
		'authShare'			=> $self->{authShare},
		'authShareName'		=> $self->{authShareName},
		'adBios'			=> $self->{adBios},
		'adDns'				=> $self->{adDns},
		'adDomCont'			=> $self->{adDomCont},
		'winsIP'			=> $self->{winsIP},
		'userCount'			=> $self->{userCount}
	};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};
	
	return to_json($jsnHash);
}

sub setDomain_settings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $samba		= BUFFALO::Daemon::Samba->new();
	my $auth		= BufAuthInfo->new();
	$auth->init();
	
	my $networkType		= $cgiRequest->param('networkType');
	my $convertUsers	= $cgiRequest->param('convertUsers');
	my $wgName			= $cgiRequest->param('wgName');
	my $winsIP			= $cgiRequest->param('winsIP');
	
	my $authServerType	= $cgiRequest->param('authServerType');
	my $authServerName	= $cgiRequest->param('authServerName');
	my $windowsServer	= $cgiRequest->param('windowsServer');
	my $autoUserReg		= $cgiRequest->param('autoUserReg');
	my $authShare		= $cgiRequest->param('authShare');
	my $authShareName	= $cgiRequest->param('authShareName');
	
	my $adBios			= $cgiRequest->param('adBios');
	my $adDns			= $cgiRequest->param('adDns');
	my $adDomCont		= $cgiRequest->param('adDomCont');
	my $adAdmin			= $cgiRequest->param('adAdminUser');
	my $adPwd			= $cgiRequest->param('adAdminPwd');

	my $domain_fail_flag = 0;
	
	if ($networkType eq 'workgroup') { @errors = validate_data_workgroup($cgiRequest); }
	elsif ($networkType eq 'domain') { @errors = validate_data_domain($cgiRequest); } 
	else							 { @errors = validate_data_ad($cgiRequest); }
	
	if ($networkType ne 'workgroup') {
#		use BufDeamonProFtp;
#		my $proftp = BufDeamonProFtp->new();
#		$proftp->init();
#		$proftp->set_status('off');
#		$proftp->save();
	}
	
	if ($networkType eq 'workgroup') {
		if (@errors == 0) {
			$samba->set_status($networkType);
			$samba->set_workgroup($wgName);
#			$samba->set_workgroup(utf8_uc($wgName));
			$samba->set_wins($winsIP);
			$samba->save;
			
			if ($authServerType eq 'server') {
				$auth->set_type('server');
#				$auth->set_server_name(utf8_uc($authServerName));
				$auth->set_server_name($authServerName);
				$auth->set_server_type($windowsServer);
				$auth->set_user_auto_add($autoUserReg);
				if ($autoUserReg eq 'on') {
					$auth->set_test_folder($authShare);
					if ($authShare eq 'on') {
						$auth->set_test_folder_name($authShareName);
					}
				}
				$auth->save();
			}

			&network_workgroup_setup_autoadduser_process($cgiRequest, $convertUsers);
			
			global_init_system->stop_filesystem();
			global_init_system->init_filesystem();
		}
	}
	elsif ($networkType eq 'domain') {
		if (@errors == 0) {
			system("cp /etc/melco/info /etc/melco/info.domain");

			$samba->set_status($networkType);
			$samba->set_domain($adBios);
			$samba->set_pdc($adDomCont);
			$samba->set_wins($winsIP);
			$samba->save;
			network_workgroup_setup_autoadduser_process($cgiRequest);
			
			global_init_system->stop_filesystem();
			
			if (!$samba->set_join_domain_nt(&utf8_uc($adBios), $adAdmin, $adPwd)) {
				system("cp /etc/melco/info.domain /etc/melco/info");
				$domain_fail_flag = 1;
			}
			
			global_init_system->init_filesystem();
			sleep 5;
			
			if ((!$samba->get_check_security()) || ($domain_fail_flag)) {
				&network_workgroup_setup_domain_ad_restore();
				push @errors, "domain_err60";
			}
		}
	}
	else {
		if (@errors == 0) {
			system("cp /etc/melco/info /etc/melco/info.domain");

			$samba->set_status($networkType);
			$samba->set_domain($adBios);
			$samba->set_ad_dns($adDns);
			$samba->set_pdc($adDomCont);
			$samba->set_wins($winsIP);
			$samba->save;
			&network_workgroup_setup_autoadduser_process($cgiRequest);
			
			global_init_system->stop_filesystem();
			
			if (!$samba->set_join_domain_ad(&utf8_uc($adBios), $adAdmin, $adPwd)) {
				system("cp /etc/melco/info.domain /etc/melco/info");
				$domain_fail_flag = 1;
			}
			
			global_init_system->init_filesystem();
			
			if ((!$samba->get_check_security()) || ($domain_fail_flag)) {
				&network_workgroup_setup_domain_ad_restore();
				push @errors, "domain_err50";
			}
		}
	}
	
	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

sub validate_data_workgroup {
	my $cgiRequest = shift;
	my $check = BufCommonDataCheck->new();
	my @errors;
	
	$check->init($cgiRequest->param('wgName'));
	if ($cgiRequest->param('wgName') eq "") { push @errors, "domain_err1"; }
#	if (!$check->check_max_length('15')) {push @errors, "domain_err2"; }
	if (!$check->check_max_length('23')) {push @errors, "domain_err2"; }
	if (!$check->check_workgroup) { push @errors, "domain_err3"; }
	if (!$check->check_1st_symbol2) { push @errors, "domain_err4"; }
	
	# Validate WINS server IP
	if( $cgiRequest->param('winsIP')) {
		$check->init($cgiRequest->param('winsIP'));
		if( !$check->check_ip ) { push @errors, "domain_err5"; }
	}
	
	if ( $cgiRequest->param('authServerType') eq 'server') {
	
		$check->init($cgiRequest->param('authServerName'));
		if ($cgiRequest->param('authServerName') eq '') { push @errors, "domain_err6"; }
		if (!$check->check_max_length('63')) { push @errors, "domain_err7"; }
		if (!$check->check_external_hostname_ip) { push @errors, "domain_err8"; }
		if (!$check->check_1st_symbol2) { push @errors, "domain_err9"; }
		
		
		if (($cgiRequest->param('autoUserReg') eq 'on') && ($cgiRequest->param('authShare') eq 'on')) {
			$check->init($cgiRequest->param('authShareName'));
			if ($cgiRequest->param('authShareName') eq '') { push @errors, "domain_err10"; }
#			if (!$check->check_max_length('12')) { push @errors, "domain_err11"; }
			if (!$check->check_max_length('27')) { push @errors, "domain_err11"; }
			if (!$check->check_danger_sharename) { push @errors, "domain_err12"; }
			if (!$check->check_share) { push @errors, "domain_err13"; }
			if (!$check->check_1st_num) { push @errors, "domain_err14"; }
			if (!$check->check_1st_symbol2) { push @errors, "domain_err15"; }
			if (!$check->check_still_share) { push @errors, "domain_err16"; }
		}
	}
	
	return @errors;
}

sub validate_data_domain {
	my $cgiRequest = shift;
	my $check = BufCommonDataCheck->new();
	my @errors;
	
	$check->init($cgiRequest->param('adBios'));
	if ($cgiRequest->param('adBios') eq "") { push @errors, "domain_err17"; }
#	if (!$check->check_max_length('15')) {push @errors, "domain_err18"; }
	if (!$check->check_max_length('23')) {push @errors, "domain_err18"; }
	if (!$check->check_workgroup) { push @errors, "domain_err19"; }
	if (!$check->check_1st_symbol2) { push @errors, "domain_err20"; }
	
	$check->init($cgiRequest->param('adDomCont'));
	if ($cgiRequest->param('adDomCont') eq "") { push @errors, "domain_err21"; }
	if (!$check->check_max_length('63')) {push @errors, "domain_err22"; }
	if (!$check->check_hostname) { push @errors, "domain_err23"; }
	if (!$check->check_1st_symbol2) { push @errors, "domain_err24"; }
	
	$check->init($cgiRequest->param('adAdminUser'));
	if ($cgiRequest->param('adAdminUser') eq "") { push @errors, "domain_err36"; }
	if (!$check->check_max_length('256')) {push @errors, "domain_err37"; }
	if (!$check->check_user) { push @errors, "domain_err38"; }
	
	$check->init($cgiRequest->param('adAdminPwd'));
	if ($cgiRequest->param('adAdminPwd') eq "")  { push @errors, "domain_err39"; }
	if (!$check->check_max_length('256')) {push @errors, "domain_err40"; }
	if (!$check->check_password2) { push @errors, "domain_err41"; }

	if( $cgiRequest->param('winsIP')) {
		$check->init($cgiRequest->param('winsIP'));
		if (!$check->check_ip) { push @errors, "domain_err5"; }
	}
	
	return @errors;
}

sub validate_data_ad {
	my $cgiRequest = shift;
	my $check = BufCommonDataCheck->new();
	my @errors;
	
	$check->init($cgiRequest->param('adBios'));
	if ($cgiRequest->param('adBios') eq "") { push @errors, "domain_err25"; }
#	if (!$check->check_max_length('15')) {push @errors, "domain_err26"; }
	if (!$check->check_max_length('23')) {push @errors, "domain_err26"; }
	if (!$check->check_workgroup) { push @errors, "domain_err27"; }
	if (!$check->check_1st_symbol2) { push @errors, "domain_err28"; }
	
	$check->init($cgiRequest->param('adDns'));
	if ($cgiRequest->param('adDns') eq "") { push @errors, "domain_err29"; }
	if (!$check->check_max_length('255')) {push @errors, "domain_err30"; }
	#if (!$check->check_smtp_address) { push @errors, "domain_err31"; }
	if (!$check->check_dns_domain) { push @errors, "domain_err31"; }
	
	$check->init($cgiRequest->param('adDomCont'));
	if ($cgiRequest->param('adDomCont') eq "") { push @errors, "domain_err32"; }
	if (!$check->check_max_length('63')) {push @errors, "domain_err33"; }
	if (!$check->check_hostname) { push @errors, "domain_err34"; }
	if (!$check->check_1st_symbol2) { push @errors, "domain_err35"; }
	
	$check->init($cgiRequest->param('adAdminUser'));
	if ($cgiRequest->param('adAdminUser') eq "") { push @errors, "domain_err36"; }
	if (!$check->check_max_length('256')) {push @errors, "domain_err37"; }
	if (!$check->check_user) { push @errors, "domain_err38"; }
	
	$check->init($cgiRequest->param('adAdminPwd'));
	if ($cgiRequest->param('adAdminPwd') eq "")  { push @errors, "domain_err39"; }
	if (!$check->check_max_length('256')) {push @errors, "domain_err40"; }
	if (!$check->check_password2) { push @errors, "domain_err41"; }
	
	if( $cgiRequest->param('winsIP')) {
		$check->init($cgiRequest->param('winsIP'));
		if (!$check->check_ip) { push @errors, "domain_err5"; }
	}
	
	system("cp /etc/melco/info /etc/melco/info.domain");
	
	return @errors;
}

sub network_workgroup_setup_autoadduser_process() {
	my $cgiRequest = shift;
	my $convertUsers = shift;

	my $authServerType = $cgiRequest->param('authServerType');
	
#	if ($q->param('hiddenNetworkAuthSetupCurrent') == 1) {
		if ($authServerType ne 'server') {
			use BufUserAutoAddListInfo;
			my $autouser = BufUserAutoAddListInfo->new();
			$autouser->init();
			my @userlist	= $autouser->get_list_name();
			my @usercomment = $autouser->get_list_comment();
			my $i;
			
			for ($i=0; $i<@userlist; $i++) {
				$autouser->set_convert_user($userlist[$i], $usercomment[$i].'!!!conv!!!');
			}
		}
#	}
#	else {
		if (($authServerType eq 'server') && ($convertUsers eq 'on')) {
			use BufUserInfo;
			use BufUserListInfo;
			use BufUserAutoAddListInfo;
			
			my $user	 = BufUserListInfo->new();
			my $autouser = BufUserAutoAddListInfo->new();
			
			$user->init();
			$autouser->init();
			
			my @userlist = $user->get_name();
			my $i;
			
			system("cp /etc/group /etc/group.tmp");
			system("sync");
			
			for ($i=0; $i<@userlist; $i++) {
				my $userinfo = BufUserInfo->new();
				$userinfo->init($userlist[$i]);
				my $user_comment = $userinfo->get_comment();
				$user_comment =~ s/!!!conv!!!$//;
				$autouser->set_convert_user_local_to_auto($userlist[$i], $user_comment);
			}
			
			system("sync");
			system("cp /etc/group.tmp /etc/group");
			system("sync");
			unlink "/etc/group.tmp";
		}
#	}
	return;
}

sub network_workgroup_setup_domain_ad_restore {
	system("cp /etc/melco/info.domain /etc/melco/info");
	system("/usr/local/sbin/nas_configgen -c samba 1> /dev/null 2> /dev/null");
	
	global_init_system->init_filesystem();
	
	return 1;
}

sub utf8_uc {
	use Jcode;
	my $text = shift;
	
	Jcode::convert(\$text, 'euc');
	$text = uc $text;
	Jcode::convert(\$text, 'utf8');
	
	return $text;
}

sub utf8_lc {
	use Jcode;
	my $text = shift;
	
	Jcode::convert(\$text, 'euc');
	$text = lc $text;
	Jcode::convert(\$text, 'utf8');
	
	return $text;
}

1;
