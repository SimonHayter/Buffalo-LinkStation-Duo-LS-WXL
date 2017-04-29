#!/usr/bin/speedy
;##############################
;# BufPocketU.pm
;# 
;# usage :
;#	$class = BufPocketU->new();
;# (C) 2008 BUFFALO INC. All rights reserved.
;##############################

package BufPocketU;

use strict;
use JSON;

use CGI;
use Encode;
use Jcode;

use lib '/www/cgi-bin/module';
use BufCommonFileInfo;
use BufCommonFileShareInfo;
use BufCommonDataCheck;

use constant 'CONFIG_DIR' => '/etc/melco/';
use constant 'SHAREINFO_POCKETU_FILE' => CONFIG_DIR . 'shareinfo.pocketu';
use constant 'POCKETU_SERVICE' => CONFIG_DIR . 'pocketu/pocketu_service';
use constant 'SHAREINFO_FILE' => CONFIG_DIR . 'shareinfo';

my $pocketUCronScript = "/www/buffalo/www/dynamic/extensions/pocketu/cron.pl";

use RPC::XML::Client;
$RPC::XML::ENCODING = 'utf-8';

sub new {
	my $class = shift;
	my $self  = bless {
		sid => 99999,
		shareinfo_pocketu => undef,
	}, $class;
	
	$self->load;
	return $self;
}

# 形だけ
sub init {
	my $self = shift;
	return;
}

sub load {
	my $self = shift;
	
	$self->{shareinfo_pocketu} = new BufCommonFileShareInfo;
	$self->{shareinfo_pocketu}->init(SHAREINFO_POCKETU_FILE);


	if(0){
	my $client = RPC::XML::Client->new('http://localhost:8888/');
	my $request = RPC::XML::request->new(
		'login',
		RPC::XML::struct->new({
			username => 'admin',
			password => 'password'
		})
	);
	my $response = $client->send_request($request);
	$self->{sid} = $response->value->{sid};
	}
	return;
}

sub nn_getWebaxsSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	push (@dataArray, {
		'pocketu_service' => $self->{pocketu_service},
		'pocketu_id' => $self->{pocketu_id},
		'pocketu_password' => $self->{pocketu_password},
	});
	
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors'=>\@errors
	};

	return to_json($jsnHash);
}

sub checkPocketUInternetConnection {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $client = RPC::XML::Client->new('http://localhost:8888/');

	my $request = RPC::XML::request->new(
		'pocketu.checkConnectVPN',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($self->{sid}),
		})
	);
	
	my $response = $client->send_request($request);
	if ($response->is_fault) {
		my $message = $response->value->{faultString};
		push(@errors,"XML_SERVER_ERROR");
	}
	
	if($response->value->{status}){
		for (my $i = 0; $i < @{$response->value->{error}}; $i++) {
			push @errors, $response->value->{error}->[$i];
		}
	}
	
	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub getPocketUSettings {
	my $self = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $client = RPC::XML::Client->new('http://localhost:8888/');

	my $request = RPC::XML::request->new(
		'pocketu.readPocketUConf',
		RPC::XML::struct->new({
			sid => RPC::XML::i4->new($self->{sid}),
		})
	);
	
	my $response = $client->send_request($request);
	if ($response->is_fault) {
		my $message = $response->value->{faultString};
		push(@errors,"XML_SERVER_ERROR");
	}
	
	my $pocketu_service = $response->value->{pocketu_service};
	my $pocketu_id = $response->value->{pocketu_id};
	my $pocketu_vpn_connection = $response->value->{pocketu_vpn_connection};
	my $pocketu_status = $response->value->{pocketu_status};
	
	if (!$pocketu_service) { $pocketu_service = 'off'; }
	if (!$pocketu_id) { $pocketu_id = ''; }
	
	push (@dataArray, {
		'pocketu_service' => $pocketu_service,
		'pocketu_id' => $pocketu_id,
		'pocketu_status' => $pocketu_status,
		'pocketu_vpn_connection' => $pocketu_vpn_connection,
	});
	
	my $jsnHash = {'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setPocketUSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $pocketu_service = $q->param('pocketu_service');
	my $pocketu_id = $q->param('pocketu_id');
	my $pocketu_password = $q->param('pocketu_password');

	my $check = BufCommonDataCheck->new();
	$check->init($pocketu_id);

	if ($check->check_2byte) {
		my $client = RPC::XML::Client->new('http://localhost:8888/');
		my $request = RPC::XML::request->new(
			'pocketu.writePocketUConf',
			RPC::XML::struct->new({
				sid => RPC::XML::i4->new($self->{sid}),
				pocketu_service => RPC::XML::string->new($pocketu_service),
				pocketu_id => RPC::XML::string->new($pocketu_id),
				pocketu_password => RPC::XML::string->new($pocketu_password),
			})
		);
		
		my $response = $client->send_request($request);
		if ($response->is_fault) {
			my $message = $response->value->{faultString};
			push(@errors,"XML_SERVER_ERROR");
		}
		
		if ($response->value->{status}) {
			for (my $i = 0; $i < @{$response->value->{error}}; $i++) {
				my $ee = $response->value->{error}->[$i];
				my $e;
				if ($ee eq "pocketU_error_format") {
					$e = "pocketU_error_format";
				}
				elsif ($ee eq "pocketU_error_time_out") {
					$e = "pocketU_error_time_out";
				}
				elsif ($ee eq "pocketU_error_id_password") {
					$e = "pocketU_error_id_password";
				}
				elsif ($ee eq "pocketU_error_hardware") {
					$e = "pocketU_error_hardware";
				}
				elsif ($ee eq "pocketU_machine_infomation_remove") {
					$e = "pocketU_machine_infomation_remove";
				}
				else {
					$e = "pocketU_error_unknown";
				}
				
				push @errors, $e;
			}
		}
	}
	else {
		push @errors, "pocketU_error_id_password";
	}

	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

my $patPocketUFolderName = qr/(
	\p{InBasicLatin}
	| \p{InHalfwidthAndFullwidthForms}
	| \p{InHiragana}
	| \p{InKatakana}
	| \p{Han}
	| \p{InCJKSymbolsAndPunctuation}
	| \p{InKatakanaPhoneticExtensions}
	| \p{InCJKUnifiedIdeographs}
)/x;

# jsonを返さない(内部処理向け)
sub getPocketUFolderSettings {
	my $self = shift;
	my $shareName = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $full_width_tilde = "\xEF\xBD\x9E";
	
	my $original = $shareName;
	$original =~ s/$full_width_tilde//g;
	my $converted = $original;

	Jcode::convert( $converted, "sjis", "utf8" );
	Jcode::convert( $converted, "utf8", "sjis" );

	if($original ne $converted){
		return 'unavailable';
	}
	
	my $checkName = Encode::decode_utf8($shareName);
	# 使用できない文字のチェック
	if ($checkName !~ /^$patPocketUFolderName+$/) {
		return 'unavailable';
	}
	
	my $pocketu_perm = [$self->{shareinfo_pocketu}->get_key_value($shareName)]->[2];
	if (defined($pocketu_perm)) {
		return $pocketu_perm;
	}
	
	return 'off';
}

sub setPocketUFolderSettings {
	my $self = shift;
	my $q = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $shareName  = $q->param('shareName');
	my $value = $q->param('pocketU_perm');
	
	# create or modify?
	# 要素が存在しない場合、サイズ0の配列が返却される
	if ($self->{shareinfo_pocketu}->get_key_value($shareName) == 0) {
		$self->createShare($value,$shareName);
	}
	else {
		$self->modifyShare($value,$shareName);
	}

	push (@dataArray, '');
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );

}

# jsonを返さない 内部処理向け
sub deleteShare {
	my $self = shift;
	my $shareName = shift;
	
	$self->{shareinfo_pocketu}->set_remove_key($shareName);
	
	$self->{shareinfo_pocketu}->save();
}

# jsonを返さない 内部処理向け
sub createShare {
	my $self = shift;
	my $value = shift;
	my $shareName = shift;
	if ($shareName =~ /usbdisk[1-4]/) {
		$self->{shareinfo_pocketu}->set_add_key_value($shareName, $shareName."/..", $value, "", "", "", "", "");
	}
	else {
		# parse shareinfo
		my $shareinfo = new BufCommonFileShareInfo;
		$shareinfo->init(SHAREINFO_FILE);
		$self->{shareinfo_pocketu}->set_add_key_value($shareName, 
			[$shareinfo->get_key_value($shareName)]->[1],
			 $value, "", "", "", "", "");
	}
	
	$self->{shareinfo_pocketu}->save();
}

# jsonを返さない　内部処理向け
sub modifyShare {
	my $self = shift;
	my $value = shift;
	my $shareName = shift;
	
	$self->{shareinfo_pocketu}->set_change_key_value($shareName,
		[$self->{shareinfo_pocketu}->get_key_value($shareName)]->[1],
		$value);
	
	$self->{shareinfo_pocketu}->save();
	return;
	}
	
sub changeShareName {
	my $self = shift;
	my $oldName = shift;
	my $newName = shift;
	
	$self->{shareinfo_pocketu}->set_change_key($oldName, $newName);
	$self->{shareinfo_pocketu}->save();
}

# jsonを返さない 内部処理向け
sub getShareInfo {
	my $self = shift;
	my $shareName = shift;
	
	my $value = [$self->{shareinfo_pocketu}->get_key_value($shareName)];
	
	return $value->[2];
}

# jsonを返さない 内部処理向け
sub getDiskInfo {
	my $self = shift;
	my $shareName = shift;
	
	my $value = [$self->{shareinfo_pocketu}->get_key_value($shareName)];
	
	return $value->[1];
}

# Enables the WebAxs Cron script
sub pocketUEnableCron {
	use BUFFALO::Common::Crontab;
	my $cron = BUFFALO::Common::Crontab->new();
	$cron->set_remove_schedule($pocketUCronScript);
	
	my $startTime = int(rand(24));
	my $schedule = '' . $startTime;
	$cron->set_add_schedule(0, $schedule, '*', '*', '*', $pocketUCronScript);
	$cron->save();
}

# Disables the WebAxs Cron script
sub pocketUDisableCron {
	use BUFFALO::Common::Crontab;
	my $cron = BUFFALO::Common::Crontab->new();
	$cron->set_remove_schedule($pocketUCronScript);
	$cron->save();
}

1;
