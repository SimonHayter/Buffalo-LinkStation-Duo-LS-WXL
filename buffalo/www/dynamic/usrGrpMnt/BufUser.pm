#!/usr/bin/speedy
;################################################
;# BufUser.pm
;# usage :
;#	$class = new BufUser;
;#	$class->init;
;# (C) 2008 BUFFALO INC. All rights reserved.
;################################################

package BufUser;

use BufUserListInfo;
use BufUserInfo;
use BufAuthInfo;
use BufCommonDataCheck;
use BufUserAutoAddListInfo;
use BufGroupListInfo;
use BufGroupInfo;
use BufQuotaInfo;
use BufDiskDf;
use BufModulesInfo;
use global_init_system;

use strict;
use JSON;

use lib "/www/buffalo/www/dynamic/extensions/webaxs";
use WebAxsConfig;

my $old_user_name;
my $admin_name;

my $modules = BufModulesInfo->new();
$modules->init();

sub new {
	my $class = shift;
	my $self  = bless {
		userName		=> undef,
		userId			=> undef,
		userDesc		=> undef,
		userMode		=> undef,
		primGroup		=> undef,
		quota			=> undef,
		quota_soft		=> undef,
		quota_hard		=> undef,
		not_admin		=> undef,
		user_groups		=> [],
		allUsers		=> [],
		allDescs		=> [],
		allMode			=> [],
		allExtUsers		=> [],
		allExtDescs		=> []
	}, $class;
	
	return $self;
}

sub init {
	my $self		= shift;
	my $curUser		= shift;

	$self->load($curUser);
	return;
}

sub load {
	my $self		= shift;
	my $curUser		= shift;
	my $i;
	my $j;
	my $local_ext_flag;
	my $guest_mode_flag = 1;
	
	my $temp = readpipe("grep ':x:52:' /etc/passwd 2> /dev/null");
	my @temp = split( /:/ , $temp);
	
	$admin_name = $temp[0];
	
	my $temp = readpipe("grep '^guest:' /etc/shadow 2> /dev/null");
	my @temp = split( /:/ , $temp, 9);

#	if ($temp[8] =~ /x/) {
	if (!$temp) {
		$guest_mode_flag = 0;
	}
	
	my $user_list	= BufUserListInfo->new();
	$user_list->init();
	
	my $userauto = BufUserAutoAddListInfo->new();
	$userauto->init();

	my @name		= $user_list->get_name;
	my @comment		= $user_list->get_comment;
	
	my @ext_name		= $userauto->get_list_name;
	my @ext_comment		= $userauto->get_list_comment;
	
	# Get the current userId
	my $curUserId = 0;
	for ($i = 0; $i < @name; $i++) {
		if ($name[$i] eq $curUser) {
			$curUserId = $i;
			$local_ext_flag = 'local';
			last;
		}
	}

	if ($local_ext_flag ne 'local') {
		$curUserId = 0;
		for ($i = 0; $i < @ext_name; $i++) {
			if ($ext_name[$i] eq $curUser) {
				$curUserId = $i;
				$local_ext_flag = 'ext';
				last;
			}
		}
	}
	
	my $quota = BufQuotaInfo->new();
	$quota->init('user', $curUser);
	
	# Initialize userName and userDesc
	if ($local_ext_flag eq 'local') {
		$self->{userName}	 = $name[$curUserId];
		$self->{userDesc}	 = $comment[$curUserId];

		if ($self->{userName} eq $admin_name) {
			$self->{userMode} = '1';
		}
		elsif ($self->{userName} eq 'guest') {
			if ($guest_mode_flag) {
				$self->{userMode} = '2';
			}
			else {
				$self->{userMode} = '3';
			}
		}
		else {
			$self->{userMode} = '0';
		}
	}
	else {
		$self->{userName}	 = $ext_name[$curUserId];
		$self->{userDesc}	 = $ext_comment[$curUserId];
	}
	
	# grep時に都合が悪い文字($ . * ^)はエスケープ
	my $name_escape = $self->{userName};
	$name_escape =~ s#\$#\\\$#g;
	$name_escape =~ s#\.#\\\.#g;
	$name_escape =~ s#\*#\\\*#g;
	$name_escape =~ s#\^#\\\^#g;

#	$temp = readpipe("grep '^$self->{userName}:' /etc/passwd 2> /dev/null");
	$temp = readpipe("grep '^$name_escape:' /etc/passwd 2> /dev/null");
	@temp = split( /:/ , $temp);
	
	$self->{userId} 	 = $temp[2];
	if (!$self->{userId}) {
		$self->{userId} = 20;
	}

	$temp = readpipe("grep ':x:$temp[3]:' /etc/group 2> /dev/null");
	@temp = split( /:/ , $temp);
	$self->{primGroup}	 = $temp[0];
	if (!$self->{primGroup}) {
		$self->{primGroup} = 'guest';
	}
	
	$self->{quota} = $quota->get_quota;
	$self->{quota_soft} = $quota->get_size_soft;
	$self->{quota_soft} = $self->{quota_soft} / 1000000;
	$self->{quota_hard} = $quota->get_size_hard;
	$self->{quota_hard} = $self->{quota_hard} / 1000000;
	
	# Initialize user_groups (all groups this user belongs to)
	my $group_list	= BufGroupListInfo->new();
	my $group		= BufGroupInfo->new();
	$group_list->init();
	my @groups	   = $group_list->get_name;
	my @group_users;
	
	for ($i = 0; $i < @groups; $i++) {
		$group->init($groups[$i]);
		@group_users  = $group->get_user;
	
		for ($j = 0; $j < @group_users; $j++) {
			if ($self->{userName} eq $group_users[$j]) {
				push @{$self->{user_groups}}, $groups[$i];
				last;
			}
		}
	}
	
	# Initialize allUsers and allDescs
	# Sort all the users other than admin and guest
	my @nameArray;
	my @sortArray;
	my @descArray;
	my $cnt = @name;
	
	my $admin_name_regExp = $admin_name;
	$admin_name_regExp =~ s#\$#\\\$#;
	$admin_name_regExp =~ s#\^#\\\^#;
	$admin_name_regExp =~ s#\*#\\\*#;

	for ($i = 0; $i < $cnt; $i++) {
#		if (@name[$i] !~ m/^(admin|guest)$/){
		unless (@name[$i] =~ m/^($admin_name_regExp|guest)$/){
			push (@sortArray, @name[$i]);
		}
	}
	@sortArray = sort { lc($a) cmp lc($b) } @sortArray;
	
	$j = $cnt - @sortArray;
	for ($i = 0; $i < $j; $i++) {
		push(@nameArray, @name[$i]);
	}
	
	for ($i = 0; $i < @sortArray; $i++) {
		push(@nameArray, @sortArray[$i] );
	}
	@{$self->{allUsers}} = @nameArray;
	
	for ($i = 0; $i < @nameArray; $i++) {
		for ($j = 0; $j < @name; $j++) {
			if ($self->{allUsers}->[$i] eq $name[$j]) {
				$self->{allDescs}->[$i] = $comment[$j];

				if ($self->{allUsers}->[$i] eq $admin_name) {
					$self->{allMode}->[$i] = '1';
				}
				elsif ($self->{allUsers}->[$i] eq 'guest') {
					if ($guest_mode_flag) {
						$self->{allMode}->[$i] = '2';
					}
					else {
						$self->{allMode}->[$i] = '3';
					}
				}
				else {
					$self->{allMode}->[$i] = '0';
				}

				last;
			}
		}
	}

	@nameArray = ();
	@sortArray = ();
	@descArray = ();
	my $cnt = @ext_name;
	
	for ($i = 0; $i < $cnt; $i++) {
		push (@sortArray, @ext_name[$i]);
	}
	@sortArray = sort { lc($a) cmp lc($b) } @sortArray;
	
	$j = $cnt - @sortArray;
	for ($i = 0; $i < $j; $i++) {
		push(@nameArray, @ext_name[$i]);
	}
	
	for ($i = 0; $i < @sortArray; $i++) {
		push(@nameArray, @sortArray[$i] ); 
	}
	@{$self->{allExtUsers}} = @nameArray;
	
	for ($i = 0; $i < @nameArray; $i++) {
		for ($j = 0; $j < @ext_name; $j++) {
			if ($self->{allExtUsers}->[$i] eq $ext_name[$j]) {
				$self->{allExtDescs}->[$i] = $ext_comment[$j];
				last;
			}
		}
	}

	return;
}

# This method will return all the Users that are in the system
sub getUser_allList {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt			= @{$self->{allUsers}};
	my $jsnHash;
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, {
			'userName' => $self->{allUsers}->[$i],
			'userDesc' => $self->{allDescs}->[$i],
			'userMode' => $self->{allMode}->[$i]
		});
	}
	
	$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub getExternalUser_allList {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt			= @{$self->{allExtUsers}};
	my $jsnHash;
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, { 'userName' => $self->{allExtUsers}->[$i], 'userDesc' => $self->{allExtDescs}->[$i] });
	}
	
	$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

sub getBothUser_allList {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $cnt			= @{$self->{allUsers}};
	my $cnt2		= @{$self->{allExtUsers}};
	my $jsnHash;
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		push(@dataArray, { 'userName' => $self->{allUsers}->[$i], 'userDesc' => $self->{allDescs}->[$i] });
	}
	for ($i = 0; $i < $cnt2; $i++) {
		push(@dataArray, { 'userName' => $self->{allExtUsers}->[$i], 'userDesc' => $self->{allExtDescs}->[$i] });
	}
	
	$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	return to_json($jsnHash);
}

# This method will be called when populating the User Info for the current User
sub getUser_settings {
	my $self		= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $jsnHash;
	
	my $dataHash = {
		'userName'		=> $self->{userName},
		'userId'		=> $self->{userId},
		'userDesc'		=> $self->{userDesc},
		'userMode'		=> $self->{userMode},
		'memberOf'		=> $self->{user_groups},
		'primGroup'		=> $self->{primGroup},
		'quota'			=> $self->{quota},
		'quota_soft'	=> $self->{quota_soft},
		'quota_hard'	=> $self->{quota_hard}
	};
	$old_user_name = $self->{userName};
	
	@dataArray = ($dataHash);
	$jsnHash = { 'success'=>JSON::true, 'data'=>\@dataArray, 'errors'=>\@errors };
	
	return to_json($jsnHash);
}

# This method will be called when adding a new User or editing the current User
sub setUser_settings {
	my $self			= shift;
	my $cgiRequest		= shift;
	my $edit_flag		= shift;
	my @errors			= ();
	my @dataArray		= ();
	my $user_list		= BufUserListInfo->new();
	my $user			= BufUserInfo->new();
	my $auth			= BufAuthInfo->new();
	my $flag_auto_user	= 0;
	
	# Get the values from GUI
	my $userName	= $cgiRequest->param('userName');
	my $userId		= $cgiRequest->param('userId');
	my $userDesc	= $cgiRequest->param('userDesc');
	my $primGroup	= $cgiRequest->param('primGroup');
	my $quota		= $cgiRequest->param('quota');
	my $quota_soft	= $cgiRequest->param('quota_soft');
	my $quota_hard	= $cgiRequest->param('quota_hard');
	my $not_admin	= $cgiRequest->param('not_admin');

	my $orig_userName	= $cgiRequest->param('orig_userName');
	my $old_name;

	if ($orig_userName) {
		$old_user_name = $orig_userName;
	}

	if ($quota) {
		$quota_soft = $quota_soft * 1000000;
		$quota_hard = $quota_hard * 1000000;
	}
	else {
		$quota_soft = '';
		$quota_hard = '';
	}
	
	my $pwd			= $cgiRequest->param('pwd');
#	my $old_name	= $self->{userName};
	$old_name	= $old_user_name;

	$auth->init();
	
	# if domain = off in /etc/melco/info then this is = 'local' (Deva)
	# not to worry about other users other than 'local' users at this point (Deva)
	if ($edit_flag) {
		if ($auth->get_type() eq 'server') {
			# this doesn't have the required file "/etc/melco/autoadduserinfo"
			my $autouser = BufUserAutoAddListInfo->new();
			$autouser->init();
			my @autouser_name = $autouser->get_list_name();
			my $username = $userName;
			my $i;
			
			for ($i = 0; $i < @autouser_name; $i++) {
				if ($username eq $autouser_name[$i]) {
					$flag_auto_user = 1;
					last;
				}
			}
		}
	}
	
	# Perform the validation on data
	@errors = validate_Data($self, $cgiRequest, $flag_auto_user, $edit_flag);
	
	# Commit changes to the system
	if (@errors == 0) {
		# Webアクセス3.0
		my $webaxs = WebAxsConfig->new();

#		if (!$old_name) {
#		if ($old_name ne $userName) {
		if (!$edit_flag) {
			# adds user to /etc/melco/userinfo file
			$user_list->init();
			$user_list->set_add_user($userName, $pwd, $userDesc, $userId, $primGroup);

			if (!$not_admin) {
				my $quotainfo = BufQuotaInfo->new();
				$quotainfo->init('user');
				$quotainfo->set_add_quota($userName, $quota_hard, $quota_soft);
			}

			$modules->exec_trigger('user_add');
		}
		else {
			# add/edit the user in autouserinfo file
			if ($flag_auto_user) {
				use BufUserAutoAddInfo;
				my $autouser = BufUserAutoAddInfo->new();
				$autouser->init($userName);
				$autouser->set_comment($userDesc);
				$autouser->save();
				
				$user->init($userName);
				$user->set_uid($userId);
				$user->set_pri_group($primGroup);
				$user->save('auto');
				
				if (!$not_admin) {
					my $quotainfo = BufQuotaInfo->new();
					$quotainfo->init('user', $userName);
					$quotainfo->set_size_hard($quota_hard);
					$quotainfo->set_size_soft($quota_soft);
					$quotainfo->save;
				}
			}
			else {
				# edit the user in /etc/melco/userinfo file and pwd file
				$user->init($old_name);
				$user->set_name($userName);
				$user->set_pass($pwd);
				$user->set_comment($userDesc);
				$user->set_uid($userId);
				$user->set_pri_group($primGroup);
				$user->save;
				
				if (!$not_admin) {
					my $quotainfo = BufQuotaInfo->new();
	#				$quotainfo->init('user', $userName);
					$quotainfo->init('user', $old_name);
					$quotainfo->set_name($userName);
					$quotainfo->set_size_hard($quota_hard);
					$quotainfo->set_size_soft($quota_soft);
					$quotainfo->save;
				}
			}

			$modules->exec_trigger('user_edit');

			# Webアクセス3.0
			$webaxs->changeUserName($old_name, $userName);

			if ($edit_flag && ($old_name eq $admin_name)) {
				system ('/usr/local/bin/addgroup_adminuser.sh 1> /dev/null 2> /dev/null');
			}
		}

		# Webアクセス3.0
		$webaxs->restartWebAxs();

#		msg_commitedChanges = 'Committing changes to memory...<>Settings have been successfully committed to memory.';
		push (@dataArray, 'msg_commitedChanges');
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub validate_Data {
	my $self			= shift;
	my $cgiRequest		= shift;
	my $flag_auto_user	= shift;
	my $edit_flag		= shift;
	my @errors			= ();
	my $check			= BufCommonDataCheck->new();
	
	my $userName		= $cgiRequest->param('userName');
	my $userDesc		= $cgiRequest->param('userDesc');
	my $pwd				= $cgiRequest->param('pwd');
	my $userId			= $cgiRequest->param('userId');
#	my $old_name		= $self->{userName};
	my $old_name		= $old_user_name;
	my $quota			= $cgiRequest->param('quota');
	my $quota_soft		= $cgiRequest->param('quota_soft');
	my $quota_hard		= $cgiRequest->param('quota_hard');
	if (!$quota) {
		$quota_soft = '';
		$quota_hard = '';
	}

	# grep時に都合が悪い文字($ . * ^)はエスケープ
	my $old_name_escape = $old_user_name;
	$old_name_escape =~ s#\$#\\\$#g;
	$old_name_escape =~ s#\.#\\\.#g;
	$old_name_escape =~ s#\*#\\\*#g;
	$old_name_escape =~ s#\^#\\\^#g;

	if (!$flag_auto_user) {
		$check->init($userName);

		if ($userName eq '') { push @errors, 'user_err1'; }
		if (!$check->check_max_length('20')) {push @errors, 'user_err2'; }
		if ($edit_flag && ($old_name eq $admin_name)) {
			if (!$check->check_danger_name_permit_admin) { push @errors, 'user_err3'; }
		}
		else {
			if (!$check->check_danger_name) { push @errors, 'user_err3'; }
		}
		if (!$check->check_user2) { push @errors, 'user_err4'; }
#		if (!$check->check_1st_num) { push @errors, 'user_err5';}
		if (!$check->check_1st_symbol2) { push @errors, 'user_err5'; }
		if ($edit_flag) {
			if (lc $userName ne lc $old_name) {
				if (!$check->check_still_user) { push @errors, 'user_err6'; }
			}
		}
		else {
			if (!$check->check_still_user) { push @errors, 'user_err6'; }
		}
		
		if ((!$old_name)||(($old_name) && ($pwd ne '********************'))){
			$check->init($pwd);
			if ($pwd eq '') { push @errors, 'user_err10'; }
			if (!$check->check_max_length('20')) { push @errors, 'user_err11'; }
			if (!$check->check_password2) { push @errors, 'user_err12'; }
#			if (!$check->check_1st_symbol) { push @errors, 'user_err13'; }
		}
	}
	
	$check->init($userDesc);
#	if (!$check->check_max_length('50')) { push @errors, 'user_err7'; }
	if (!$check->check_max_length('75')) { push @errors, 'user_err7'; }
	if (!$check->check_1st_space) { push @errors, 'user_err8'; }
	if (!$check->check_comment)   { push @errors, 'user_err9'; }

	if ($old_name) {
		if ($old_name ne $userName) {
			if ($pwd eq '********************') {
				push @errors, 'user_err14';
			}
		}
	}
	
	if ($userId) {
		my $temp;
		
		# user edit case
#		if ($self->{userName}) {
		if ($edit_flag) {
#			$temp = readpipe("grep -v '^$self->{userName}:' /etc/passwd 2> /dev/null | grep ':x:$userId:' 2> /dev/null");
#			$temp = readpipe("grep -v '^$old_user_name:' /etc/passwd 2> /dev/null | grep ':x:$userId:' 2> /dev/null");
			$temp = readpipe("grep -v '^$old_name_escape:' /etc/passwd 2> /dev/null | grep ':x:$userId:' 2> /dev/null");
		}
		# user add case
		else {
			$temp = readpipe("grep ':x:$userId:' /etc/passwd 2> /dev/null");
		}
		
		if ($temp) {
			push @errors, 'user_err16';
		}
	}
	
	my $df = BufDiskDf->new();
	$df->init();
	
	my $max_capacity_kb = $df->get_max_capacity_kb;
	my $max_capacity_gb = sprintf("%d", $max_capacity_kb / 1024 / 1024);
	
	if ($quota_hard) {
		if ($quota_hard > $max_capacity_gb) {
			push @errors, 'user_err17';
		}
	}
	if ($quota_soft) {
		if ($quota_soft > $max_capacity_gb) {
			push @errors, 'user_err18';
		}
		if ($quota_soft > $quota_hard) {
			push @errors, 'user_err19';
		}
	}

	return @errors;
}

sub delUser_list {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();

	my $json		= new JSON;
	my $user_list	= BufUserListInfo->new();
	my $del_user;
	my $user_del;
	$user_list->init();
	
	my $quota = BufQuotaInfo->new();
	$quota->init('user');
	
	my $delList		= $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		$del_user = $delList->[$i];
		
		$user_list->set_remove_user($del_user);
		$quota->set_remove_quota($del_user);
	}
	
	for ($i = 0; $i < $cnt; $i++) {
		$delList->[$i] = '"'.$delList->[$i].'"';
	}
	$user_del = join " ", @{$delList};
	system ("/usr/local/sbin/delusraxs user $user_del 1> /dev/null 2> /dev/null");
	my $is_deleted = $? >> 8;
	if ($is_deleted == 0) {
		global_init_system->init_filesystem();
	}

	$modules->exec_trigger('user_del');

	# Webアクセス3.0
	my $webaxs = WebAxsConfig->new();
	$webaxs->restartWebAxs();

	if (@errors == 0) {
		push (@dataArray, 'msg_commitedChanges');
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub delExternalUser_list {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $user_list	= BufUserAutoAddListInfo->new();
	my $del_user;
	my $user_del;
	$user_list->init();
	
	my $quota = BufQuotaInfo->new();
	$quota->init('user');
	
	my $delList		= $json->utf8->decode($cgiRequest->param('delList'));
	my $cnt = @{$delList};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		$del_user = $delList->[$i];
		
		$user_list->set_remove_user($del_user);
		$quota->set_remove_quota($del_user);
	}
	
	for ($i = 0; $i < $cnt; $i++) {
		$delList->[$i] = '"'.$delList->[$i].'"';
	}
	$user_del = join " ", @{$delList};
	system ("/usr/local/sbin/delusraxs user $user_del 1> /dev/null 2> /dev/null");
	my $is_deleted = $? >> 8;
	if ($is_deleted == 0) {
		global_init_system->init_filesystem();
	}
	
	if (@errors == 0) {
		push (@dataArray, 'msg_commitedChanges');
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub convLocalToExternalUserList {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;
	my $user_list	= BufUserListInfo->new();
	my $add_list	= BufUserAutoAddListInfo->new();
	$user_list->init();
	$add_list->init();
	
	my $convList	= $json->utf8->decode($cgiRequest->param('convList'));
	my $cnt = @{$convList};
	my $i;
	
	for ($i = 0; $i < $cnt; $i++) {
		my $conv_user = $convList->[$i];
		
		my $userinfo = BufUserInfo->new();
		$userinfo->init($conv_user);
		my $user_comment = $userinfo->get_comment();
		$user_comment =~ s/!!!conv!!!$//;
		my $uid = $userinfo->get_uid();
		my $pri_group = $userinfo->get_pri_group();
		
		$add_list->set_convert_user_local_to_auto($conv_user, $user_comment, $uid, $pri_group);
	}
	
	if (@errors == 0) {
		push (@dataArray, 'msg_commitedChanges');
	}
	
	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub uploadUserCsvImport {
	my $self		= shift;
	my $cgiRequest	= shift;
	my @errors		= ();
	my @dataArray	= ();
	my $json		= new JSON;

	my $data = $cgiRequest->param('csv_content');

	system ("echo '$data' > /tmp/csv_import.csv");
	system ("perl /usr/local/bin/csv_user.pl import /tmp/csv_import.csv 1> /dev/null 2> /dev/null &");
	
	sleep 3;

	return to_json( { 'success'=> (scalar @errors == 0 ? JSON::true : JSON::false), 'data'=>\@dataArray, 'errors'=>\@errors } );
}

sub setUserActivate {
	my $self = shift;
	my $cgiRequest = shift;
	my @errors = ();
	my @dataArray = ();

	my $userName = $cgiRequest->param('userName');
	my $mode = $cgiRequest->param('mode');
	
	if ($userName eq 'guest') {
		if ($mode eq 'activate') {
			readpipe ("echo 'guest:x:20:21:Linux User,,,:/home:/bin/sh' >> /etc/passwd");
			readpipe ("echo 'guest:!:13148:0:99999:7:::' >> /etc/shadow");
		}
		elsif ($mode eq 'inactivate') {
			readpipe ("grep -v '^guest:' /etc/passwd > /etc/passwd_");
			readpipe ("mv -f /etc/passwd_ /etc/passwd");

			readpipe ("grep -v '^guest:' /etc/shadow > /etc/shadow_");
			readpipe ("mv -f /etc/shadow_ /etc/shadow");
		}
	}

	push (@dataArray, '');

	system ("/etc/init.d/smb.sh restart 1>/dev/null 2>/dev/null &");
	system ("/etc/init.d/atalk.sh restart 1>/dev/null 2>/dev/null &");
	system ("/etc/init.d/ftpd.sh restart 1>/dev/null 2>/dev/null &");
	system('/modules/webaxs/_init.sh restart 1> /dev/null 2> /dev/null &');

	return to_json({
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	});
}

1;
