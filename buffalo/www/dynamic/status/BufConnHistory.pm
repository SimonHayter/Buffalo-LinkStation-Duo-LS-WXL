#!/usr/bin/speedy
;################################################
;# BufConnHistory.pm
;# usage :
;#	$class = new BufConnHistory;
;#	$class->init;
;# (C) 2009 BUFFALO INC. All rights reserved.
;################################################

package BufConnHistory;

use strict;
use JSON;

sub new {
	my $class = shift;
	my $self = bless {
		filename => '/var/log/ietd.log',

		date => [],
		status => [],
		volumeName => [],
		initiator => []

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
	my $data;
	my @temp;
	my $temp;

	system ("touch $self->{filename}");

	# file open & lock
	if (!open (FILE, "<$self->{filename}")) { die "[BufConnHistory._load]File Open Error - $self->{filename}\n"; }
	if (!flock FILE, 2) 					{ die "[BufConnHistory._load]File Lock Error - $self->{filename}\n"; }
	
	while ($data = <FILE>) {
		if ($data =~ m#logged in#) {
			push @{$self->{status}}, 'on';

			@temp = split / /, $data;

			if (!$temp[1]) {
				push @{$self->{date}}, $temp[0].'/'.$temp[2].' '. $temp[3];

				$temp = $temp[18];
				$temp =~ m#.+?:.+?:(.+)?"#;
				push @{$self->{volumeName}}, $1;

				$temp = $temp[13];
				$temp =~ s#"##g;
				push @{$self->{initiator}}, $temp;
			}
			else {
				push @{$self->{date}}, $temp[0].'/'.$temp[1].' '.$temp[2];
	
				$temp = $temp[17];
				$temp =~ m#.+?:.+?:(.+)?"#;
				push @{$self->{volumeName}}, $1;
	
				$temp = $temp[12];
				$temp =~ s#"##g;
				push @{$self->{initiator}}, $temp;
			}
		}
		elsif ($data =~ m#logged off#) {
			push @{$self->{status}}, 'off';

			@temp = split / /, $data;

			push @{$self->{date}}, $temp[0].'/'.$temp[1].' '.$temp[2];

			$temp = $temp[16];
			$temp =~ m#.+?:.+?:(.+)?"#;
			push @{$self->{volumeName}}, $1;

			push @{$self->{initiator}}, '-';
		}
	}

	return;
}

=for comment

# login
Aug 26 11:47:39 TS-IXL787 ietd: tid 1 - sid 281475899523136 : Initiator "iqn.1991-05.com.microsoft:win7-x64" logged in to Target "iqn.2004-08.jp.buffalo:TS-IXL787-0050434F0787:array1".

0	Aug
1	26
2	11:47:39
3	TS-IXL787
4	ietd:
5	tid
6	1
7	-
8	sid
9	281475899523136
10	:
11	Initiator
12	"iqn.1991-05.com.microsoft:win7-x64"
13	logged
14	in
15	to
16	Target
17	"iqn.2004-08.jp.buffalo:TS-IXL787-0050434F0787:array1".

# logout
Aug 26 13:14:41 TS-IXL787 ietd: tid 1 - sid 281475899523136 : Initiator logged off from Target "iqn.2004-08.jp.buffalo:TS-IXL787-0050434F0787:array1".

0 Aug
1 26
2 13:14:41
3 TS-IXL787
4 ietd:
5 tid
6 1
7 -
8 sid
9 281475899523136
10 :
11 Initiator
12 logged
13 off
14 from
15 Target
16 "iqn.2004-08.jp.buffalo:TS-IXL787-0050434F0787:array1".

=cut

sub getConnHistory {
	my $self = shift;
	my @errors;
	my @dataArray;
	
	my $i;

	for ($i = 0; $i < @{$self->{date}}; $i++) {
		push (@dataArray, {
			'date' => ${$self->{date}}[$i],
			'status' => ${$self->{status}}[$i],
			'volumeName' => ${$self->{volumeName}}[$i],
			'initiator' => ${$self->{initiator}}[$i]
		});
	}

	my $jsnHash = {
		'success' => JSON::true,
		'data' => \@dataArray,
		'errors' => \@errors
	};

	return to_json($jsnHash);
}

1;
