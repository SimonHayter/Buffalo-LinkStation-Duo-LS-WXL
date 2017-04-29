#!/usr/bin/speedy
;################################################
;# BufGroup.pm
;# usage:
;#	  $class = new BufGroup;
;#	  $class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufGroup;

use BufGroupListInfo;
use BufGroupInfo;
use BufUserListInfo;
use BufUserAutoAddListInfo;
use BufCommonDataCheck;
use BufQuotaInfo;
use BufDiskDf;
use BufModulesInfo;
use global_init_system;

use strict;
use JSON;

use lib "/www/buffalo/www/dynamic/extensions/webaxs";
use WebAxsConfig;

my $old_group_name;
my $admin_name;

my $modules = BufModulesInfo->new();
$modules->init();

sub new {
	my $class = shift;
	my $self  = bless {
		groupName		 =>  undef,
		groupId 		 =>  undef,
		groupDesc		 =>  undef,
		quota			 =>  undef,
		quota_soft		 =>  undef,
		quota_hard		 =>  undef,
		group_users 	 =>  [],
		group_userDescs  =>  [],
		allGroups		 =>  [],
		allDescs		 =>  [],
		allMembers		 =>  []
	}, $class;

	return $self;
}

sub init {
	my $self		= shift;
	my $curGroup	= shift;
	$self->load($curGroup);

	return;
}

sub load {
	my $self		= shift;
	my $curGroup	= shift;
	my $group_list	= BufGroupListInfo->new();
	my $group		= BufGroupInfo->new();

	my $temp = readpipe("grep ':x:52:' /etc/passwd 2> /dev/null");
	my @temp = split( /:/ , $temp);

	$admin_name = $temp[0];

	# Get the current group object
	$group_list->init();
	$group->init($curGroup);

	my $quota = BufQuotaInfo->new();
	$quota->init('group', $curGroup);

	# Initialize groupName and groupDesc
	$self->{groupName}		= $group->get_name;
	$self->{groupDesc}		= $group->get_comment;
	my $temp = readpipe("grep '^$self->{groupName}:' /etc/group 2> /dev/null");
	my @temp = split( /:/ , $temp);
	$self->{groupId}		= $temp[2];

 	$self->{quota} = $quota->get_quota;
	$self->{quota_soft} = $quota->get_size_soft;
	$self->{quota_soft} = $self->{quota_soft} / 1000000;
	$self->{quota_hard} = $quota->get_size_hard;
	$self->{quota_hard} = $self->{quota_hard} / 1000000;

	# Initialize the group_users and their desccriptions
	@{$self->{group_users}} = $group->get_user;
	my $user_list = BufUserListInfo->new();
	$user_list->init();
	my @comments	 = $user_list->get_comment;
	my @names		 = $user_list->get_name;
	my $cnt 		 = @{$self->{group_users}};

	for (my $i = 0; $i < $cnt; $i++) {
#		${$self->{group_userDescs}}[$i] = 'user does not exist anymore';
		${$self->{group_userDescs}}[$i] = '!!!NOT_EXIST!!!';

		for (my $j = 0; $j < @names; $j++) {
			if (${$self->{group_users}}[$i] eq $names[$j]) {
				${$self->{group_userDescs}}[$i] = $comments[$j];
				last;
			}
		}
	}

	# Initialize allGroups and allDescs
	# Sort all the groups other than admin, guest and hdusers
	my @nameArray;
	my @sortArray;
	my @descArray;
	my @groups		  = $group_list->get_name;
	my @groupComments = $group_list->get_comment;
	my $cnt = @groups;

	for (my $i=0; $i<$cnt; $i++) {
		if (@groups[$i] !~ m/^(admin|guest|hdusers)$/){
			push (@sortArray, @groups[$i]);
		}
	}
	@sortArray = sort { lc($a) cmp lc($b) } @sortArray;

	my $j = $cnt - @sortArray;
	for (my $i = 0; $i < $j; $i++) {
		push(@nameArray, @groups[$i]);
	}

	for (my $i = 0; $i < @sortArray; $i++) {
		push(@nameArray, @sortArray[$i] );
	}

	@{$self->{allGroups}} = @nameArray;

	for (my $i = 0; $i < @nameArray; $i++) {
		for (my $j = 0; $j < @groups; $j++) {
			if ($self->{allGroups}->[$i] eq $groups[$j]) {
				$self->{allDescs}->[$i] = $groupComments[$j];
				last;
			}
		}
	}

	# Initialize allMembers
	$cnt = @{$self->{allGroups}};
	for (my $i = 0; $i < $cnt; $i++) {
		$group->init($self->{allGroups}->[$i]);
#		$self->{allMembers}->[$i] = $group->get_user;

		my @count_valid_user = $group->get_user;
		my $user_list = BufUserListInfo->new();
		$user_list->init();
		my @names = $user_list->get_name;
		my $j;
		my $k;

		for ($j = 0; $j < @count_valid_user; $j++) {
			for ($k = 0; $k < @names; $k++) {
				if ($count_valid_user[$j] eq $names[$k]) {
					$self->{allMembers}->[$i]++;
				}
			}
		}

		my $auto_user_list = BufUserAutoAddListInfo->new();
		$auto_user_list->init();
		@names = $auto_user_list->get_list_name;

		for ($j = 0; $j < @count_valid_user; $j++) {
			for ($k = 0; $k < @names; $k++) {
				if ($count_valid_user[$j] eq $names[$k]) {
					$self->{allMembers}->[$i]++;
				}
			}
		}

#		if (($self->{allGroups}->[$i] eq 'admin') || ($self->{allGroups}->[$i] eq 'guest')) {
		if (($self->{allGroups}->[$i] eq 'admin') && ($self->{allMembers}->[$i] == 0)) {
			$self->{allMembers}->[$i]++;
		}

		if (($self->{allGroups}->[$i] eq 'guest') && ($self->{allMembers}->[$i] == 0)) {
			$self->{allMembers}->[$i] = 1;
		}
	}

	return;
}

# This method will return all the Groups that are in the system
sub getGroup_allList {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt 		= @{$self->{allGroups}};

	for (my $i = 0; $i < $cnt; $i++) {
		push(@dataArray, { 'groupName' => $self->{allGroups}->[$i], 'totalMembers' => $self->{allMembers}->[$i] });
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

# This method will be called when populating the Group Info for the current Group
sub getGroup_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $groupUsers;

	if ($self->{groupName} eq 'admin') {
		push(@{$groupUsers}, {'userName' => $admin_name, 'userDesc' => ''});
	}
	for (my $i = 0; $i < @{$self->{group_users}}; $i++) {
		push(@{$groupUsers}, {'userName' => $self->{group_users}->[$i], 'userDesc' => $self->{group_userDescs}->[$i]});
	}

	my $dataHash = {
		'groupName'   => $self->{groupName},
		'groupId'	  => $self->{groupId},
		'groupDesc'   => $self->{groupDesc},
		'quota' 	  => $self->{quota},
		'quota_soft'  => $self->{quota_soft},
		'quota_hard'  => $self->{quota_hard},
		'members'	  => $groupUsers,
		'adminName'	  => $admin_name
	};

	$old_group_name = $self->{groupName};

	@dataArray = ($dataHash);
	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

# This method will be called when populating the Group Members for the current Group
sub get_groupUsers {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt 		= @{$self->{group_users}};

	for (my $i = 0; $i < $cnt; $i++) {
		 push(@dataArray, {'userName' => $self->{group_users}->[$i]});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

# This method will be called when adding a new Group or editing the current Group
sub setGroup_settings {
	my $self		= shift;
	my $cgiRequest	= shift;
	my $edit_flag	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $group_list	= BufGroupListInfo->new();
	my $group		= BufGroupInfo->new();

	# Get the values from GUI
	my $groupName	= $cgiRequest->param('groupName');
	my $groupId 	= $cgiRequest->param('groupId');
	my $groupDesc	= $cgiRequest->param('groupDesc');
	my $groupUsers	= $cgiRequest->param('members');
	my $userlist	= $json->utf8->decode($groupUsers);
#	my $old_name	= $self->{groupName};
	my $old_name	= $old_group_name;
	my $old_gid 	= $self->{groupId};
	my $quota		= $cgiRequest->param('quota');
	my $quota_soft	= $cgiRequest->param('quota_soft');
	my $quota_hard	= $cgiRequest->param('quota_hard');
	if ($quota) {
		$quota_soft = $quota_soft * 1000000;
		$quota_hard = $quota_hard * 1000000;
	}
	else {
		$quota_soft = '';
		$quota_hard = '';
	}

	# Perform the validation on data
	@errors = validate_data($self, $cgiRequest);

	# Commit changes to the system
	if (@errors == 0) {
#		if (!$old_name) {
#		if ($old_name ne $groupName) {
		if (!$edit_flag) {
			# adds the group in /etc/melco/groupinfo file
			$group_list->init();
			$group_list->set_add_group($groupName, $groupDesc, $groupId, @{$userlist});

			my $quotainfo = BufQuotaInfo->new();
			$quotainfo->init('group');
			$quotainfo->set_add_quota($groupName, $quota_hard, $quota_soft);

			$modules->exec_trigger('group_edit');

			# Webアクセス3.0
			my $webaxs = WebAxsConfig->new();
			$webaxs->restartWebAxs();
		}
		else {
			# edit group to /etc/melco/groupinfo file
			$group->init($old_name);
			$group->set_name($groupName);
			$group->set_comment($groupDesc);
			$group->set_user(@{$userlist});
			$group->set_gid($groupId);
			$group->set_old_gid($old_gid);
			$group->save;

			my $quotainfo = BufQuotaInfo->new();
#			$quotainfo->init('group', $groupName);
			$quotainfo->init('group', $old_name);
			$quotainfo->set_name($groupName);
			$quotainfo->set_size_hard($quota_hard);
			$quotainfo->set_size_soft($quota_soft);
			$quotainfo->save;

			$modules->exec_trigger('group_add');

			# Webアクセス3.0
			my $webaxs = WebAxsConfig->new();
			$webaxs->restartWebAxs();
		}

		#msg_commitedChanges = 'Committing changes to memory...<>Settings have been successfully committed to memory.';
		push (@dataArray, 'msg_commitedChanges');
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

# This method will be called by the method setGroup_settings to check the data which comes from gui for errors
sub validate_data {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my $check		= BufCommonDataCheck->new();

	# Get the values from GUI
	my $groupName	= $cgiRequest->param('groupName');
	my $groupId 	= $cgiRequest->param('groupId');
	my $groupDesc	= $cgiRequest->param('groupDesc');
#	my $old_name	= $self->{groupName};
	my $old_name	= $old_group_name;
	my $quota		= $cgiRequest->param('quota');
	my $quota_soft	= $cgiRequest->param('quota_soft');
	my $quota_hard	= $cgiRequest->param('quota_hard');
	if (!$quota) {
		$quota_soft = '';
		$quota_hard = '';
	}

	# validate the group name
	$check->init($groupName);
	if ($groupName eq "") { push @errors, 'grp_err1'; }
	if (!$check->check_max_length('20')) {push @errors, 'grp_err2'; }
#	if (!$check->check_danger_name) { push @errors, 'grp_err3'; }
	if (!$check->check_danger_name_permit_admin) { push @errors, 'grp_err3'; }
	if (!$check->check_group)		{ push @errors, 'grp_err4'; }
	if (!$check->check_1st_symbol)	{ push @errors, 'grp_err5'; }
	if ($old_name) {
		if (lc $groupName ne lc $old_name) {
			if (!$check->check_still_group) { push @errors, 'grp_err6'; }
		}
	}
	else {
		if (!$check->check_still_group) { push @errors, 'grp_err6'; }
	}

	# validate the group description
	$check->init($groupDesc);
#	if (!$check->check_max_length('50')) { push @errors, 'grp_err7'; }
	if (!$check->check_max_length('75')) { push @errors, 'grp_err7'; }
	if (!$check->check_1st_space) { push @errors, 'grp_err8'; }
	if (!$check->check_comment)   { push @errors, 'grp_err9'; }

#	if (!$check->check_1st_num) 	{ push @errors, 'grp_err5'; }
#	if ($groupName =~ /[A-Z]/) { push @errors, 'grp_err12'; }

	# validate gid
	if ($groupId) {
		my $temp;
		if ($self->{groupName}) {  # group edit case
#			$temp = readpipe("grep -v -e '^$self->{groupName}:' /etc/group 2> /dev/null | grep ':x:$groupId:' 2> /dev/null");
			$temp = readpipe("grep -v -e '^$old_group_name:' /etc/group 2> /dev/null | grep ':x:$groupId:' 2> /dev/null");
#			die "grep -v -e '^$old_group_name:' /etc/group 2> /dev/null | grep ':x:$groupId:' 2> /dev/null";
		}
		else {	# group add case
			$temp = readpipe("grep ':x:$groupId:' /etc/group 2> /dev/null");
		}

		if ($temp) {
			push @errors, 'grp_err11';
		}
	}

	# validate quota capacity
	my $df = BufDiskDf->new();
	$df->init();

	my $max_capacity_kb = $df->get_max_capacity_kb;
	my $max_capacity_gb = sprintf("%d", $max_capacity_kb / 1024 / 1024);

	if ($quota_hard) {
		if ($quota_hard > $max_capacity_gb) {
			push @errors, 'grp_err13';
		}
	}
	if ($quota_soft) {
		if ($quota_soft > $max_capacity_gb) {
			push @errors, 'grp_err14';
		}
		if ($quota_soft > $quota_hard) {
			push @errors, 'grp_err15';
		}
	}

	return @errors;
}

# This method will be called to delete the selected Groups
sub delGroup_list {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $json		= new JSON;
	my $group_list	= BufGroupListInfo->new();
	my $check		= BufCommonDataCheck->new();
	my $del_group;
	my $group_del;
	$group_list->init();

	my $quota = BufQuotaInfo->new();
	$quota->init('group');

	my $delList 	= $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};
	my $i;

	for ($i = 0; $i < $cnt; $i++) {
		$del_group = $delList->[$i];

		$check->init($del_group);
		if (!$check->check_danger_name)  { push @errors, $del_group.' '.'grp_err10'; }

		if (@errors == 0) {
			$group_list->set_remove_group($del_group);
			$quota->set_remove_quota($del_group);
		}
	}
	for ($i = 0; $i < $cnt; $i++) {
		$delList->[$i] = '"'.$delList->[$i].'"';
	}
	$group_del = join " ", @{$delList};
	system ("/usr/local/sbin/delusraxs group $group_del 1> /dev/null 2> /dev/null");
	my $is_deleted = $? >> 8;
	if ($is_deleted == 0) {
		global_init_system->init_filesystem();
	}

	$modules->exec_trigger('group_del');

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	$webaxs->restartWebAxs();

	if (@errors == 0) {
		push (@dataArray, 'msg_commitedChanges');
	}

	return to_json({
		'success' => (scalar @errors == 0 ? JSON::true : JSON::false),
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
