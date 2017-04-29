#!/usr/bin/speedy

package global_init_system;

sub init_filesystem {
	system("sync");
	system('/usr/local/bin/mkrsconf.pl > /dev/null');
	system("sync");
	&init_inet_restart;
	&init_samba_restart;
	&init_netatalk_restart;
	&init_proftp_restart;
	&init_sftp_restart;
	&init_eyefi_restart;
	return;
}

sub init_syslog {
	system("sync");
	&init_syslog_restart;
}

sub stop_filesystem {
	system("sync");
	&init_inet_stop;
	&init_samba_stop;
	&init_netatalk_stop;
	&init_proftp_stop;
	&init_eyefi_stop;
	return;
}

sub init_hostname {
	system('/etc/init.d/sethostname.sh 1> /dev/null 2> /dev/null');
	return;
}

sub init_network {
	system('/etc/init.d/networking.sh restart 1> /dev/null 2> /dev/null');
	return;
}

sub init_samba_stop {
	system("/etc/init.d/smb.sh stop 1> /dev/null 2> /dev/null");
	return;
}

sub init_samba_restart {
	system("/etc/init.d/smb.sh stop 1> /dev/null 2> /dev/null");
	system("/etc/init.d/smb.sh start 1> /dev/null 2> /dev/null &");
	return;
}

sub init_netatalk_stop {
	system("/etc/init.d/atalk.sh stop 1> /dev/null 2> /dev/null ");
	return;
}

sub init_netatalk_restart {
	system("/etc/init.d/atalk.sh stop 1> /dev/null 2> /dev/null ");
	system("/etc/init.d/atalk.sh start 1> /dev/null 2> /dev/null &");
	return;
}

sub init_proftp_stop {
	system("/etc/init.d/ftpd.sh stop 1> /dev/null 2> /dev/null");
	return;
}

sub init_proftp_restart {
	system("/etc/init.d/ftpd.sh stop 1> /dev/null 2> /dev/null");
	system("/etc/init.d/ftpd.sh start 1> /dev/null 2> /dev/null &");
	return;
}

sub init_sftp_restart {
	system("/etc/init.d/sshd.sh stop 1> /dev/null 2> /dev/null");
	system("/etc/init.d/sshd.sh start 1> /dev/null 2> /dev/null &");
	return;
}

sub init_inet_stop {
	system("/etc/init.d/inetd stop 1> /dev/null 2> /dev/null");
	&init_rsync_stop;
	return;
}

sub init_inet_restart {
	system("/etc/init.d/inetd stop 1> /dev/null 2> /dev/null");
	&init_rsync_stop;
	system("/etc/init.d/inetd start 1> /dev/null 2> /dev/null");
	return;
}

sub init_rsync_stop {
	system("killall rsync stop 1> /dev/null 2> /dev/null");
	return;
}

sub init_syslog_stop {
	system("/etc/init.d/syslog.sh stop 1> /dev/null 2> /dev/null");
	return;
}

sub init_syslog_restart {
	system("/etc/init.d/syslog.sh stop 1> /dev/null 2> /dev/null");
	system("/etc/init.d/syslog.sh start 1> /dev/null 2> /dev/null");
	return;
}

sub init_eyefi_stop {
	if(-e "/etc/init.d/eyefid.sh"){
		system("/etc/init.d/eyefid.sh stop 1> /dev/null 2> /dev/null");
		&init_rsync_stop;
	}
	return;
}

sub init_eyefi_restart {
	if(-e "/etc/init.d/eyefid.sh"){
		system("/etc/init.d/eyefid.sh restart 1> /dev/null 2> /dev/null");
	}
	return;
}

1;
