#!/usr/bin/speedy
;#################################################
;# BufDFS.pm
;# usage :
;#	$class = new BufDFS;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;#################################################

package BufDFS;

use BufShareDfsInfo;
use BufCommonDataCheck;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self  = bless {
		dfsService	  => undef,
		multipleLinks => undef,
		dfsRoot 	  => undef,
		linkName	  => [],
		hostname	  => [],
		shareName	  => [],
		linkId		  => [],
		targetId	  => []
		
	}, $class;
	
	return $self;
}

sub init {
	my $self = shift;
	$self->{targetId} = shift;
	
	$self->load();
	
	return;
}

sub load {
	my $self = shift;
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	my $i;
	
	$self->{dfsService} = $dfs->get_function;
	$self->{multipleLinks} = $dfs->get_root_as_link;
	if ($self->{multipleLinks} eq 'on') {
		$self->{multipleLinks} = 'off';
	}
	else {
		$self->{multipleLinks} = 'on';
	}
	$self->{dfsRoot} = $dfs->get_root_name;
	
	for ($i = 1; $i <= 8; $i++) {
		$self->{linkName}->[$i] = $dfs->get_link_name($i);
		$self->{hostname}->[$i] = $dfs->get_link_unc($i, 1, 1);
		$self->{shareName}->[$i] = $dfs->get_link_unc($i, 1, 2);
		$self->{linkId}->[$i] = 'link'.$i;
	}
	
	return;
}

sub getDfsServices {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	push(@dataArray, {
		'dfsService' => $self->{dfsService},
		'multipleLinks' => $self->{multipleLinks},
		'dfsRoot' => $self->{dfsRoot}
	});
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub getDfsRoot {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	push(@dataArray, {
		'dfsRoot' => $self->{dfsRoot}
	});
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub getDfsLinksList {
	my $self = shift;
	my @errors;
	my @dataArray;
	my $i;

	for ($i = 1; $i <= 8; $i++) {
		if ($self->{linkName}->[$i]) {
			push(@dataArray, {
				'linkName' => $self->{linkName}->[$i],
				'hostname' => $self->{hostname}->[$i],
				'shareName' => $self->{shareName}->[$i],
				'linkId' => $self->{linkId}->[$i]
			});
		}
	}
	
	my $jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub setDfsServices {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	
	my $dfsService = $cgiRequest->param('dfsService');
	my $multipleLinks = $cgiRequest->param('multipleLinks');
	
	if ($multipleLinks eq 'on') {
		$multipleLinks = 'off';
	}
	else {
		$multipleLinks = 'on';
	}
	
	$dfs->set_function($dfsService);
	$dfs->set_root_as_link($multipleLinks);
#	if (($dfsService eq 'on') && (!$self->{dfsRoot})) {
#		$dfs->set_root_name('_dfs_root');
#	}

# -->

	if ($dfsService eq 'on') {
		my $check = BufCommonDataCheck->new();
		my $dfsRoot = $cgiRequest->param('dfsRoot');
		
		$check->init($dfsRoot);
		
		if ($dfsRoot eq "") { push @errors, 'dfs_err1'; }
		elsif (!$check->check_still_authtest) { push @errors, 'dfs_err2'; }
#		if (!$check->check_max_length('12')) { push @errors, 'dfs_err3'; }
		if (!$check->check_max_length('27')) { push @errors, 'dfs_err3'; }
		if (!$check->check_danger_sharename) { push @errors, 'dfs_err4'; }
		if (!$check->check_share)		{ push @errors, 'dfs_err5'; }
		if (!$check->check_1st_num) 	{ push @errors, 'dfs_err6'; }
		if (!$check->check_1st_symbol2) { push @errors, 'dfs_err6'; }
		if (!$check->check_still_share) { push @errors, 'dfs_err7'; }
		
		if (@errors == 0) {
			$dfs->set_root_name($dfsRoot);
		}
	}

	$dfs->save;

# <--
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub setDfsRoot {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	
	my $check = BufCommonDataCheck->new();
	my $dfsRoot = $cgiRequest->param('dfsRoot');
	
	$check->init($dfsRoot);
	
	if ($dfsRoot eq "") { push @errors, 'dfs_err1'; }
	elsif (!$check->check_still_authtest) { push @errors, 'dfs_err2'; }
#	if (!$check->check_max_length('12')) { push @errors, 'dfs_err3'; }
	if (!$check->check_max_length('27')) { push @errors, 'dfs_err3'; }
	if (!$check->check_danger_sharename) { push @errors, 'dfs_err4'; }
	if (!$check->check_share)		{ push @errors, 'dfs_err5'; }
	if (!$check->check_1st_num) 	{ push @errors, 'dfs_err6'; }
	if (!$check->check_1st_symbol2) { push @errors, 'dfs_err6'; }
	if (!$check->check_still_share) { push @errors, 'dfs_err7'; }
	
	if (@errors == 0) {
		$dfs->set_root_name($dfsRoot);
		$dfs->save;
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub setDfsLink {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $targetId_num = $self->{targetId};
	$targetId_num =~ s#link##;
	
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	
	my $check = BufCommonDataCheck->new();
	my $linkName = $cgiRequest->param('linkName');
	my $hostname = $cgiRequest->param('hostname');
	my $shareName = $cgiRequest->param('shareName');
	
	$check->init($linkName);
	if ($linkName eq "") { push @errors, 'dfs_err8'; }
#	if (!$check->check_max_length('12')) { push @errors, 'dfs_err9'; }
	if (!$check->check_max_length('27')) { push @errors, 'dfs_err9'; }
	if (!$check->check_share)		{ push @errors, 'dfs_err10'; }
	if (!$check->check_1st_num) 	{ push @errors, 'dfs_err11'; }
	if (!$check->check_1st_symbol2) { push @errors, 'dfs_err11'; }
	if (!$check->check_still_dfslink($targetId_num)) { push @errors, 'dfs_err12'; }
	
	$check->init($hostname);
	if ($hostname eq "") { push @errors, 'dfs_err13'; }
	elsif ($hostname =~ m/\./ ) {
		if (!$check->check_ip) { push @errors, 'dfs_err14'; }
	}
	else {
#		if (!$check->check_max_length('12')) { push @errors, 'dfs_err15'; }
		if (!$check->check_max_length('15')) { push @errors, 'dfs_err15'; }
		if (!$check->check_hostname)	{ push @errors, 'dfs_err16'; }
		if (!$check->check_1st_symbol2) { push @errors, 'dfs_err17'; }
	}
	
	$check->init($shareName);
	if ($shareName eq "") { push @errors, 'dfs_err18'; }
#	if (!$check->check_max_length('12')) { push @errors, 'dfs_err19'; }
	if (!$check->check_max_length('27')) { push @errors, 'dfs_err19'; }
	if (!$check->check_share)		{ push @errors, 'dfs_err20'; }
	if (!$check->check_1st_num) 	{ push @errors, 'dfs_err21'; }
	if (!$check->check_1st_symbol2) { push @errors, 'dfs_err21'; }
	
	if (@errors == 0) {
		if ($dfs->get_root_as_link eq 'on') {
			$dfs->set_link_unc(1, 1, 1, $hostname);
			$dfs->set_link_unc(1, 1, 2, $shareName);
			$dfs->save;
		}
		else {
			$dfs->set_link_name($targetId_num, $linkName);
			$dfs->set_link_unc($targetId_num, 1, 1, $hostname);
			$dfs->set_link_unc($targetId_num, 1, 2, $shareName);
			$dfs->save;
		}
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub addDfsLink {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	
	my $check = BufCommonDataCheck->new();
	my $linkName = $cgiRequest->param('linkName');
	my $hostname = $cgiRequest->param('hostname');
	my $shareName = $cgiRequest->param('shareName');

	if ($self->{multipleLinks} eq 'on') {
		$check->init($linkName);
		if ($linkName eq "") { push @errors, 'dfs_err8'; }
#		if (!$check->check_max_length('12')) { push @errors, 'dfs_err9'; }
		if (!$check->check_max_length('27')) { push @errors, 'dfs_err9'; }
		if (!$check->check_share)		{ push @errors, 'dfs_err10'; }
		if (!$check->check_1st_num) 	{ push @errors, 'dfs_err11'; }
		if (!$check->check_1st_symbol2) { push @errors, 'dfs_err11'; }
	}
	
	$check->init($hostname);
	if ($hostname eq "") { push @errors, 'dfs_err13'; }
	elsif ($hostname =~ m/\./ ) {
		if (!$check->check_ip) { push @errors, 'dfs_err14'; }
	}
	else {
#		if (!$check->check_max_length('12')) { push @errors, 'dfs_err15'; }
		if (!$check->check_max_length('15')) { push @errors, 'dfs_err15'; }
		if (!$check->check_hostname)	{ push @errors, 'dfs_err16'; }
		if (!$check->check_1st_symbol2) { push @errors, 'dfs_err17'; }
	}
	
	$check->init($shareName);
	if ($shareName eq "") { push @errors, 'dfs_err18'; }
#	if (!$check->check_max_length('12')) { push @errors, 'dfs_err19'; }
	if (!$check->check_max_length('27')) { push @errors, 'dfs_err19'; }
	if (!$check->check_share)		{ push @errors, 'dfs_err20'; }
	if (!$check->check_1st_num) 	{ push @errors, 'dfs_err21'; }
	if (!$check->check_1st_symbol2) { push @errors, 'dfs_err21'; }
	
	if (@errors == 0) {
		if ($dfs->get_root_as_link eq 'on') {
#			$dfs->set_link_name(1, $linkName);
			$dfs->set_link_name(1, $self->{dfsRoot});
			$dfs->set_link_unc(1, 1, 1, $hostname);
			$dfs->set_link_unc(1, 1, 2, $shareName);
			$dfs->save;
		}
		else {
			for ($i = 1; $i <= 8; $i++) {
				if (!$dfs->get_link_name($i)) {
					$dfs->set_link_name($i, $linkName);
					$dfs->set_link_unc($i, 1, 1, $hostname);
					$dfs->set_link_unc($i, 1, 2, $shareName);
					$dfs->save;
					
					$i = 9;
				}
			}
		}
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub delDfsLinkList {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();
	my $i;
	
	my $json = new JSON;
	my $dfs = BufShareDfsInfo->new();
	$dfs->init;
	
	my $delList = $json->utf8->decode($cgiRequest->param('delList'));

	for ($i = 1; $i <= 8; $i++) {
		for my $del_target (@{$delList}) {
			$del_target =~ s#link##;
			if ($i eq $del_target) {
				$dfs->set_link_name($i, "");
				$dfs->set_link_unc($i, 1, 1, "");
				$dfs->set_link_unc($i, 1, 2, "");
				$dfs->save;
			}
		}
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

1;
