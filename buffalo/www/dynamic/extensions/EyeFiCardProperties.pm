## @class
# This module is for store card properties.
package EyeFiCardProperties;
#There is the same to

use BufEyeFiConnect qw(
	EYEFI_MEDIATYPE_PHOTO EYEFI_MEDIATYPE_VIDEO EYEFI_MEDIATYPE_RAW 
	logging);

binmode STDOUT, ":utf8";
binmode STDIN, ":utf8";
use strict;
use Data::Dumper;

## @cmethod new(%args)
# A constructor.
# @param args [in] A hash of the parameters.
# @return hash A instance.
sub new(\%){
	my $_invocant = shift;
	my $class = ref($_invocant) || $_invocant;
	my $self= {
		CardName => '',
		MacAddr => '',
		MediaType => [1],
		Properties => [
			{
				#(Undefined)
				"Feated"=>0,
				"Enabled"=>0,
				"DestinationDesktop" => '',
				"DestinationFolder" => ''
			},
			{
				#Photo
				"Feated"=>1,
				"Enabled"=>1,
				"DestinationDesktop" => '',
				"DestinationFolder" => ''
			},{
				#Video
				"Feated"=>0,
				"Enabled"=>0,
				"DestinationDesktop" => '',
				"DestinationFolder" => ''
			},{
				#(Undefined)
				"Feated"=>0,
				"Enabled"=>0,
				"DestinationDesktop" => '',
				"DestinationFolder" => ''
			},{
				#RAW
				"Feated"=>0,
				"Enabled"=>0,
				"DestinationDesktop" => '',
				"DestinationFolder" => ''
			}
		],
		@_,
	};
	my $hostname = `hostname`;
	$self->{"selfName"} = chomp ($hostname);
	bless $self, $class;
}

sub setCardName(\%\$){
	my $self = shift;
	my $name = shift;
	return $self->{"CardName"} = $name;
}

sub getCardName(\%){
	my $self = shift;
	return $self->{"CardName"};
}

sub setMacAddr(\%\$){
	my $self = shift;
	my $MacAddr = shift;
	return $self->{"MacAddr"} = $MacAddr;
}

sub getMacAddr(\%){
	my $self = shift;
	return $self->{"MacAddr"};
}


sub setFeaturesfromProperty(\%\%){
	my $self = shift;
	my $p_properties= shift;

	if(exists $p_properties->{"video"}{"enabled"}){
		if($p_properties->{"video"}{"enabled"} == 1){
			$self->setFeature(EYEFI_MEDIATYPE_VIDEO, 1);
			$self->{"Properties"}[EYEFI_MEDIATYPE_VIDEO]{"Feated"}
			   = $p_properties->{"raw"}{"on"};
		} else {
			$self->setFeature(EYEFI_MEDIATYPE_VIDEO, 0);
		}
	} else {return 0};
	if(exists $p_properties->{"raw"}{"enabled"}){
		if($p_properties->{"raw"}{"enabled"} == 1){
			$self->setFeature(EYEFI_MEDIATYPE_RAW, 1);
			$self->{"Properties"}[EYEFI_MEDIATYPE_RAW]{"Feated"}
			  = $p_properties->{"raw"}{"on"};
		} else {
			$self->setFeature(EYEFI_MEDIATYPE_RAW, 0);
		}
	} else {return 0;}
	return 1;
}
sub setFeature(\%\$\$){
	my $self = shift;
	my $p_mediatype = shift;
	my $feated = shift;

	if($feated){
		$self->{"Properties"}[$p_mediatype]{"Feated"} = 1;
		my @ltemp = @{$self->{"MediaType"}};
		my %atemp;
		push(@ltemp, $p_mediatype);
		@{$self->{"MediaType"}} = grep {!$atemp{$_}++} @ltemp;
	}else{
		$self->{"Properties"}[$p_mediatype]{"Feated"} = 0;
		my @ltemp = @{$self->{"MediaType"}};
		my %atemp;
		@{$self->{"MediaType"}} = grep {$_!=$p_mediatype} @ltemp;
	}
	
	return 0;
}

sub getFeatures(\%){
	my $self = shift;
	return @{$self->{"MediaType"}};
}

sub getFeature(\%\$){
	my $self = shift;
	my $p_mediatype= shift;
	my @features = @{$self->{"MediaType"}};
	my $response = (grep {$_==$p_mediatype} @features);
	return $response;
}

sub setTransferEnabledwithFeature(\%\$\$){
	my $self = shift;
	my $p_mediatype= shift;
	my $p_Enabled = shift;
	$self->{"Properties"}[$p_mediatype]{"Enabled"} = $p_Enabled;
	return $self->{"Properties"}[$p_mediatype]{"Enabled"};
}

sub getTransferEnabled(\%\$){
	my $self = shift;
	my $p_mediatype= shift;
	return $self->{"Properties"}[$p_mediatype]{"Enabled"};
}



sub addPropertiesWithMediaType(\%\$\%){
	my $self = shift;
	my $p_mediatype = shift;
	my $p_properties = shift;

	#properties parsing
	if(exists $p_properties->{"data"}[0]){
		if(exists $p_properties->{"data"}[0]{"PhotoFolder"}){
			@{$self->{"Properties"}}[$p_mediatype]->{"PhotoFolder"}=
			  $p_properties->{"data"}[0]{"PhotoFolder"};
		}
		if(exists $p_properties->{"data"}[0]{"DesktopId"}){
			@{$self->{"Properties"}}[$p_mediatype]->{"DesktopID"}=
			  $p_properties->{"data"}[0]{"DesktopId"};
		}
	}
	return 1;
}

sub getTransferActive(\%){
	my $self=shift;
	my $flags = 0;
	foreach my $mediatype (@{$self->{"MediaType"}}) {
		if($self->{"Properties"}[$mediatype]{"Enabled"}==1){
				$flags = 1;
		}
	}
	return $flags;
}

sub getPartialTransfer(\%){
	my $self=shift;
	my $dest = '';
	foreach my $mediatype (@{$self->{"MediaType"}}) {
		if($dest eq ''){
			$dest = $self->{"Properties"}[$mediatype]{"PhotoFolder"};
		} elsif ($dest ne $self->{"Properties"}[$mediatype]{"PhotoFolder"}){
			return 1;
		}
	}
	return 0;
}

sub getDestination(\%){
	my $self=shift;
	my $dest = '';
	foreach my $mediatype (@{$self->{"MediaType"}}) {
		if('' ne $self->{"Properties"}[$mediatype]{"PhotoFolder"})
		{
			$dest = $self->{"Properties"}[$mediatype]{"PhotoFolder"};
		}
	}
	return $dest;
}
1;
