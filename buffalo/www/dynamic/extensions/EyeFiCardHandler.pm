package EyeFiCardHandler;

binmode STDOUT, ":utf8";
binmode STDIN, ":utf8";

use warnings;
use Data::Dumper;
use JSON;
use XML::LibXML;
use BufEyeFiConnect qw(
    EYEFI_MEDIATYPE_PHOTO EYEFI_MEDIATYPE_VIDEO EYEFI_MEDIATYPE_RAW 
    EYEFI_MEDIATYPE_MASK 
    Notice_ServerNotFound Notice_ServerNotResponded 
    Notice_InternalServerNotResponded Notice_InternalServerNotFound 
    Notice_UserNotFound Notice_WrongPassword Notice_CardNotFound 
    Notice_DestinationNotSet Notice_PartiallyDestination Notice_YetSetDestination
    Notice_DestinationGone Notice_bad_Auth_hash Notice_EyeFi_UNKNOWN
    logging);
use EyeFiCardProperties;

use strict;
use Encode;

my $localName = `hostname`;
chomp($localName);
my $res_login =undef;
my $j_login = undef;
my $AuthToken = undef;
my $res_getdt = undef;
my $j_getdt = {};
##@cmethod new(%args)
# A constructor.
# @param args [in] A hash of the parameters.
# @return hash A instance.
sub new{
  my $_invocant = shift;
  my $class = ref($_invocant) || $_invocant;
  my $self= {
    accessor => BufEyeFiConnect->new,
    @_,
  };

#retreve KEY data
# A name of the storable data file with API_KEY and API_SECRET.

  bless $self, $class;
}

## @cmethod scalar getAuthLoginHL(hashref query)
# Request user login to Eye-fi Master Server and 
# put Authenticate token to local store.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - Login (E-Mail formatted string) @n
#   An E-Mail addres of user account.
#  - Password (string) @n
#   A password
#   
# @return JSON-RPC
# - The Success
#  - {
#   - "success": "True", @n
#    fixed form on getting data was succeed.
#   - "data" : {@n
#    It's also fixed form 
#    - "User" : {@n
#     A particular key of getAuthLogin
#     - "AuthToken" : \<scalar string\>, @n
#      The Authentication Token. This is necessary to all REST api call.
#     - "Login"     : \<scalar string\>, @n
#      The user's login name.
#     - "FirstName" : \<scalar string\>, @n
#      First name of the login user
#     - "LastName"  : \<scalar string\>, @n
#      Last name of the login user
#     - "Locale"    : \<scalar string\>, @n
#      Locale code was set by users to use Eye-Fi service. It seems to like ISO639 Language codes.
#     - "Id"        : \<scalar integer\>, @n
#      Response ID. There is no interest.
#     - "Verified"  : \<scalar integer\>, @n
#      There is no definition to determine how to use. It seems to be almost 1.
#    - }
#   - }
#  - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
# @exception EFC_serverNotFound
#  Server is not found.
# @exception EFC_serverNotResponded 
#  Server is found but not responded.
# @exception EFC_UserNotFound
#  Eye-Fi master server respond bad user.
# @exception EFC_WrongPassword
#  Eye-Fi master server respond bad password.

sub getAuthLoginHL(\%\%){
  my $self = shift;
  my $query = shift;
  my $accessor = $self->{'accessor'};
  my %user_data = (Login => ($query->param('Login')),
                   Password => ($query->param('Password')));
  my $result =  $accessor->RESTCall('auth.login',\%user_data);
  return $result;   #D
}

## @cmethod scalar getAuthLogoutHL(hashref query)
# Request user logout to Eye-fi Master Server and
# delete Authenticate token from local store.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - auth_token (string) @n
#    The authentication Token.
# @return JSON-RPC
# - The Success
#  - {
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {@n
#     There is empty.
#   - }
#  - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
# @error
# - EFC_serverNotFound
#  Server is not found.
# - EFC_serverNotResponded 
#  Server is found but not responded.
# - EFC_BAD_auth_token 
#  Auth token is invalid, like as a timeout.

sub getAuthLogoutHL(\%\%){
  my $self = shift;
  my $query = shift;
  my $accessor = $self->{'accessor'};
  my %user_data = (auth_token => ($query->param('auth_token')));
  my $result = $accessor->RESTCall('auth.logout',\%user_data);
  return $result;
}

## @cmethod scalar sub getCardsPropertiesList(hashref query)
# Get CardProperty array with local store.
# If user has no cards, This function will be failed
#  with Notice_CardNotFound.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - auth_token\<string\>@n
#   The authentication token
# @return JSON-RPC 
# - The Success
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {
#    - "NumofCards": \<integer\>@n
#     Number of the cards.
#    - "Cards" : \<array of CardProperty\>@n
#    -{
#     - "Name": \<utf-8 encoded string\>@n
#      the Card's name
#     - "Enabled": \<boolean\>
#      true to transfer enable
#     - "Destination": \<utf-8 encoded string\>
#      collapted directory name to store the photos
#      The API will return '' if destination was not determined.
#     - "Notify": \<resource identifier\>
#      The resource identifier to notified some message
#      every possible notification is:
#      - EFC_DestinationNotSet
#       Shows the destination is not available.
#      - EFC_PartiallyDestination
#       Shows multiple transferring. Only this notify will be occured with valid destination parameter is set.
#      - EFC_YetSetDestination
#       Shows the card has no destination string. It means the card is not initialized yet.
#      - EFC_DestinationGone
#       Shows the destination is not found in filesystem immediately.
#     - "auth_hash": \<string (hash)\>
#      hash for retrieve local store data.
#     - "partial_transfer": \<boolean\>
#      This bit will be shown transfer setting is parted by other PC.
#    - }
#   - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'errors' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'data' : \<string\>
#     Description of a failure.
#  - }
# @exception EFC_serverNotFound
#  Server is not found.
# @exception EFC_serverNotResponded 
#  Server is found but not responded.
# @exception EFC_BAD_auth_token 
#  Auth token is invalid, like as a timeout.
# @exception EFC_internalServerNotResponded
#  Internal local agent is not responded. This error 
# @exception EFC_CardNotFound
#  User hasn't cards.
# @exception EFC_UNKNOWN'
#  Other non-classified errors.

sub getCardsPropertiesList(\%\$){
  my $self = shift;
  my $query = shift;
  my $accessor = $self->{'accessor'};
  my $auth_token  = $query->param('auth_token');

#local valiables
  my $devices;
  my @cardslist;
  my $card;

  my %user_data;
  my @data_order;
  my @retrieves;
  my @features;
  my $feated;
  my $prop;
  my $desktopEnable;
  my $desktopStatus;
  my $tempFolder;
  my $destination;
  my $destination_bin;
  my $result;
  my $auth_hash;

#get equipped cards
  GETCARDS_TRANSACTION:{ eval {
    %user_data = (auth_token => $auth_token);
    $devices = from_json($accessor->RESTCall('devices.get',\%user_data),{utf8=>1});
    if(exists $devices->{success} and $devices->{'success'} eq 'false'){
      #redirect error code
      $result = $devices;
      logging($result);
      last GETCARDS_TRANSACTION;
    }
#    logging($devices);
    if(exists $devices->{"data"}[0] and not ref($devices->{"data"}[0]) eq "ARRAY" and exists $devices->{"data"}[0]{"Device"}){
      # Equiped cards are exist.
      for $prop (@{$devices->{"data"}[0]{"Device"}}){
        push(@cardslist, new EyeFiCardProperties);
        $card = $cardslist[$#cardslist];
        $card->setCardName($prop->{Name});
        $card->setMacAddr($prop->{Mac});
        $card->setFeaturesfromProperty($prop->{"Features"});
        @features = $card->getFeatures();
        foreach $feated (@features) {
          %user_data = ('MacAddress' => $card->getMacAddr(),
                        'MediaType' => $feated);
          @data_order=('MacAddress','MediaType');
          @retrieves =('Enabled');
          $desktopEnable = from_json(
             $accessor->localCall('GetDesktopSync',\%user_data, \@data_order, \@retrieves), {utf8=>1}
          );
          if(not exists $desktopEnable->{success} or $desktopEnable->{'success'} eq 'false'){
            #redirect error code
            $result = $desktopEnable;
            logging($result);
            last GETCARDS_TRANSACTION;
          }
          if($desktopEnable->{"data"}[0]{"Enabled"} eq 'false'){
            $card->setTransferEnabledwithFeature($feated, 0);
          } else {
            $card->setTransferEnabledwithFeature($feated, 1);
            %user_data = ('MacAddress' => $card->getMacAddr(),
                          'MediaType' => $feated,
                          'CardName'=>$card->getCardName());
            @data_order= ('MacAddress','CardName','MediaType');
            @retrieves = ('PhotoFolder', 'AddDate','DateType',
                          'DesktopId','DefaultFolder','CustomDateFormat');
            $desktopStatus = from_json($accessor->localCall('GetFolderConfig',
                                       \%user_data,\@data_order,\@retrieves),{utf8=>1});
            if(exists $desktopStatus->{success} and $desktopStatus->{'success'} eq "false"){
              #redirect error code
              $result = $desktopStatus;
              logging($result);
              last GETCARDS_TRANSACTION;
            }
            if(exists $desktopStatus->{'data'}[0]{'PhotoFolder'}){
              $tempFolder = $desktopStatus->{'data'}[0]{'PhotoFolder'};
              if($tempFolder =~ m/^(\/mnt)/){
                $tempFolder =~ s/^\/mnt\/[\w]+\///;
              } else {
                $tempFolder ='';
              }
              $desktopStatus->{'data'}[0]{'PhotoFolder'}= $tempFolder;
            }
            #Directory Passing Phase 2
            if(exists $desktopStatus->{'data'}[0]{'DefaultFolder'}){
              $tempFolder = $desktopStatus->{'data'}[0]{'DefaultFolder'};
              if($tempFolder =~ m/^(\/mnt)/){
                $tempFolder =~ s/^\/mnt\/[\w]+\///;
              } else {
                $tempFolder ='';
              }
              $desktopStatus->{'data'}[0]{'DefaultFolder'}= $tempFolder;
            }
            $card->addPropertiesWithMediaType($feated, $desktopStatus);
          }
        }
      }
    }else{
    # There is no managed card.
      $result = {
        "success"=>"false",
        "errors"=>[Notice_CardNotFound()],
        "data"=>["in getCardsPropertiesList"]
      };
      last GETCARDS_TRANSACTION;
    }
    my @cardsPropertiesList;
    my $cardProperties;
    my $success=1;
    #Transcode from CardProperties object to CardsPropertiesList
    for(my $targetNo = 0; $targetNo <= $#cardslist; $targetNo++){
      push(@cardsPropertiesList, {});
      $cardProperties = $cardsPropertiesList[$#cardsPropertiesList];
      $card = $cardslist[$targetNo];
      $cardProperties->{"Name"} = $card->getCardName();
      $cardProperties->{"Enabled"} = $card->getTransferActive() ? "true": "false";
      $cardProperties->{"Destination"} = '';
      $cardProperties->{"Notify"}='';
      if($card->getTransferActive()){
        $destination = $card->getDestination();
        if($destination ne ''){
          #Destination validate
          my $lines;
          my @dirList;
          my $siDH;
          my @tempDirs;
          my $tempDir;
          my $prefix;
          my $drive;
          my $dirhit =0;
          open(my $sinfoFH,"</etc/melco/shareinfo") or die "error at open shareinfo for decode";
          SIFH: while($lines = readline($sinfoFH)){
           utf8::upgrade($lines);
           if($lines=~m/^([^\.].*?)<>(\w+?)<>/){
              $prefix=$1; $drive=$2;
		utf8::upgrade($prefix);
		$prefix = decode('utf-8',$prefix);
              utf8::upgrade($destination);
              if("/mnt/$drive/$prefix" =~m|$destination$|s){
                $dirhit =1;
                last SIFH;
                }
              opendir($siDH,"/mnt/$drive/$prefix") or last SIFH; 
              #@tempDirs = map {"/mnt/$drive/$prefix/$_"} grep !/^\.\.?\z/, readdir $siDH;
		@tempDirs = grep !/^\.\.?\z/, readdir $siDH;
              closedir($siDH);
		foreach $tempDir (@tempDirs){
                utf8::upgrade($tempDir);
		  $tempDir = decode('utf-8',$tempDir);
		  if(-d "/mnt/$drive/$prefix/$tempDir"){
                  if("/mnt/$drive/$prefix/$tempDir"=~m|$destination$|){
		      $dirhit = 1;
                    last SIFH;
                    }
                  }
                }

              }
            }
          close($sinfoFH);
          if($dirhit){
            $cardProperties->{"Destination"} = $destination;
          } else {
            $cardProperties->{"Notify"}=Notice_DestinationGone();
          }
        } else {
          #Destination was not set
          $cardProperties->{"Notify"} = Notice_YetSetDestination();
        }
      } else {
        #Destination is other
        if($card->getPartialTransfer()){
          $cardProperties->{"Notify"} = Notice_PartiallyDestination();
        } else {
          $cardProperties->{"Notify"} = Notice_DestinationNotSet();
        }
      }

      #create auth_hash (data packing)
      if($card->getFeature(EYEFI_MEDIATYPE_PHOTO)){
        if($card->getTransferEnabled(EYEFI_MEDIATYPE_PHOTO)){
          $auth_hash = 'PHO:';
        } else {
          $auth_hash = 'pho:';
        }
      }
      if($card->getFeature(EYEFI_MEDIATYPE_VIDEO)){
        if($card->getTransferEnabled(EYEFI_MEDIATYPE_VIDEO)){
          $auth_hash = $auth_hash.'VID:';
        } else {
          $auth_hash = $auth_hash.'vid:';
        }
      }
      if($card->getFeature(EYEFI_MEDIATYPE_RAW)){
        if($card->getTransferEnabled(EYEFI_MEDIATYPE_RAW)){
          $auth_hash = $auth_hash.'RAW:';
        } else {
          $auth_hash = $auth_hash.'raw:';
        }
      }
      $auth_hash=$auth_hash."MAC:".$card->getMacAddr();
      $cardProperties->{"auth_hash"} = $auth_hash;
      $cardProperties->{"partial_transfer"} = $card->getPartialTransfer == 1? 'true': 'false';
      $auth_hash=''; #clear auth_hash
    }
    $result = {
    "success" => "true",
    "data" => [{
      "NumOfCards" => $#cardslist,
      "Cards" => \@cardsPropertiesList
      }]
    };
  };} # transaction end;
  if($@){
    logging($@);
    $result = {
    "success"=>"false",
    "errors"=>[Notice_EyeFi_UNKNOWN()],
    "data"=>[$@]
    };
  }
  return to_json($result);
}

## @cmethod scalar sub setCardProperties(hashref query)
# Set transfer enable and destination setting
# 
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
# - "auth_hash": \<string (hash)\>
#  hash for retrieve local store data.
# - "Enabled": \<boolean\>
#  true to set transfer enable
# - "Destination": \<utf-8 encoded string\>
#  collapted directory name to store the photos
# - "partial_transfer": \<boolean\>
#  true to stay partial transfer mode.
# - "auth_token"
#  The authentication token.
# @return JSON-RPC 
# - The Success
#  - "success": "True", @n
#    fixed form on getting data was succeed.
#  - "data" : {
#   - "Result": \<boolean\>@n
#    true if succeed.
#   - }
#  - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
# @exception EFC_serverNotFound
#  Server is not found.
# @exception EFC_serverNotResponded 
#  Server is found but not responded.
# @exception EFC_BAD_auth_token 
#  Auth token is invalid, like as a timeout.
# @exception EFC_internalServerNotResponded
#  Internal local agent is not responded. This error 
# @exception EFC_bad_Auth_hash
#  Invalid auth_hash is detected.
# @exception EFC_DestinationGone
#  Destination is invalid or not match filesystem.
# @exception EFC_UNKNOWN'
#  Other non-classified errors. (In the function, these errors are occured by local agent error).

sub setCardProperties(\%\$){
  my $self = shift;
  my $query = shift;
  my $accessor = $self->{'accessor'};
  my $auth_token  = $query->param('auth_token');
  my $auth_hash  = $query->param('auth_hash');
  my $Enabled  = $query->param('Enabled');
  my $Destination  = $query->param('Destination');
  my $PartialTransfer  = $query->param('partial_transfer');

  my $localName = `hostname`;
  chomp($localName);
  
  my %user_data;
  my @data_order;
  my @retrieves;

  my $targetMAC;
  my $targetDownsync;
  my $targetUploadKey;
  
  my $setDesktop;
  my $removeDesktop;
  my $desktopEnable;
  my $setFolderConfig;
  my $masterDir = '';
  my $targetEnabled;
  my $targetDest;
  my $targetPartialTransfer;
  my $setMask;
  my $removeMask;
  my @features;
  my $feated;
  my $card = EyeFiCardProperties->new;

  my $result;

  
  SETCARD_TRANSACTION:{ eval {

    if($Enabled =~/(true)|(false)/){
      if($1 eq 'true'){
        $targetEnabled=1;
      } else {
        $targetEnabled=0;
      }
    } else {
      $result = {
        "success"=>"false",
        "errors"=>[Notice_bad_Auth_hash()],
        "data"=>[]
      };
      logging($result);
      last SETCARD_TRANSACTION;
    }
    if($PartialTransfer =~/(true)|(false)/){
      if($1 eq 'true'){
        $targetPartialTransfer=1;
      } else {
        $targetPartialTransfer=0;
      }
    } else {
      $result = {
        "success"=>"false",
        "errors"=>[Notice_bad_Auth_hash()],
        "data"=>[]
      };
      logging($result);
      last SETCARD_TRANSACTION;
    }
   
    if($targetEnabled == 1 ){
      if($Destination eq ''){
        $result = {
          "success"=>"false",
          "errors"=>[Notice_DestinationGone()],
          "data"=>[]
        };
        logging($result);
        last SETCARD_TRANSACTION;
      }
      $targetDest = $Destination;
      #directories list get
      my $lines;
      my @dirList;
      my $siDH;
      my @tempDirs;
      my $tempDir;
      my $prefix;
      my $drive;
      
      open(my $sinfoFH,"</etc/melco/shareinfo") or die "error at open shareinfo for decode";
      SIFH: while($lines = readline($sinfoFH)){
        if($lines=~m/^([^\.].*?)<>(\w+?)<>/){
          $prefix=$1; $drive=$2;
          if($prefix =~m/$Destination/){
            $masterDir = "/mnt/$drive/$prefix";
            next SIFH;
          }
          opendir($siDH,"/mnt/$drive/$prefix") or last SIFH; 
          @tempDirs = map {"/mnt/$drive/$prefix/$_"} grep !/^\.\.?\z/, readdir $siDH;
          closedir($siDH);
          foreach $tempDir (@tempDirs){
            if(-d $tempDir){
              if($tempDir=~m|$Destination$|){
                $masterDir = $tempDir;
              }
            }
          }
        }
      }
      close($sinfoFH);

      if($masterDir eq ''){
        $result = {
          "success"=>"false",
          "errors"=>[Notice_DestinationGone()],
          "data"=>[],
        };
        logging($result);
        last SETCARD_TRANSACTION;
      }
    }

    #decode auth_hash
    if($auth_hash =~m/(pho)|(PHO):/g){
      $card->setFeature(EYEFI_MEDIATYPE_PHOTO,1);
      if($auth_hash =~m/(PHO:)/){
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_PHOTO,1);
      }else{
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_PHOTO,0);
      }
    }else{
      $card->setFeature(EYEFI_MEDIATYPE_PHOTO,0);
      $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_PHOTO,0);
    }
    if($auth_hash =~m/(vid)|(VID):/g){
      $card->setFeature(EYEFI_MEDIATYPE_VIDEO,1);
      if($auth_hash =~m/(VID:)/){
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_VIDEO,1);
      }else{
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_VIDEO,0);
      }
    }else{
      $card->setFeature(EYEFI_MEDIATYPE_VIDEO,0);
      $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_VIDEO,0);
    }
    if($auth_hash =~m/(raw)|(RAW):/g){
      $card->setFeature(EYEFI_MEDIATYPE_RAW,1);
      if($auth_hash =~m/(RAW:)/){
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_RAW,1);
      }else{
        $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_RAW,0);
      }
    }else{
      $card->setFeature(EYEFI_MEDIATYPE_RAW,0);
      $card->setTransferEnabledwithFeature(EYEFI_MEDIATYPE_RAW,0);
    }
    if($card->getFeature(EYEFI_MEDIATYPE_PHOTO) and $auth_hash =~m/(MAC:)(.*$)/){
      $targetMAC = $2;
      $card->setMacAddr($targetMAC);
    }else{
      #bad auth_hash
      $result = {
        "success"=>"false",
        "errors"=>[Notice_bad_Auth_hash()],
        "data"=>[]
      };
      logging($result);
      last SETCARD_TRANSACTION;
    }

    $accessor->setDestinationDirectory($targetEnabled, $masterDir);

    #calculate bitmask
    my $success = 1;
    @features = $card->getFeatures();
    foreach $feated (@features) {
      $setMask=0;
      if($targetPartialTransfer == 0 or $card->getTransferEnabled($feated)==1){
        if($targetEnabled == 1){
          $setMask = $feated;
        }
      }
      $removeMask = ($feated & (~$setMask));

      if($setMask > 0){
       %user_data=(auth_token => $auth_token,
                    Mac => $targetMAC,
                    DesktopID => $localName,
                    MediaType=>$setMask
                    );
        $setDesktop = from_json($accessor->RESTCall('devices.setDesktop',\%user_data), {utf8=>1});

        if(exists $setDesktop->{"success"} and $setDesktop->{"success"} eq 'true'){
          if(exists $setDesktop->{"data"}[0]{"DownsyncKey"}){
            $targetDownsync = $setDesktop->{"data"}[0]{"DownsyncKey"};
          }
          if(exists $setDesktop->{"data"}[0]{"UploadKey"}){
            $targetUploadKey = $setDesktop->{"data"}[0]{"UploadKey"};
          }
        } else {
          #setDesktop Fail
          $result = $setDesktop;
          logging($result);
          last SETCARD_TRANSACTION;
        }
        %user_data = ('MacAddress' => $targetMAC,
          'Enable' => 1,
          'MediaType' => $setMask
        );
        @data_order = ('MacAddress','Enable','MediaType');
        @retrieves =('Result');
        $desktopEnable = from_json($accessor->localCall('SetDesktopSync',\%user_data, \@data_order, \@retrieves), {utf8=>1});

        if(not exists $desktopEnable->{"success"} or $desktopEnable->{"success"} eq "false"){
          $result = $desktopEnable;
          $success = 0;
          last SETCARD_TRANSACTION;
        }
        if($desktopEnable->{"data"}[0]{"Result"} eq 'false'){
          $result = {
            "success" => "false",
            "errors"=> [Notice_EyeFi_UNKNOWN()],
            "data"=> ["cannot changing transfer enable"]
          };
          logging($result);
          $success = 0;
          last SETCARD_TRANSACTION;
        }
        %user_data = (
          'MacAddress' => $targetMAC,
          'PhotoFolder' => $masterDir,
          'AddDate' => 1,
          'DateType' => 1,
          'UploadKey' => $targetUploadKey,
          'DownsyncKey' => $targetDownsync,
          'CustomDateFormat' => "%Y-%m-%d",
          'MediaType' => $setMask
        );
        @data_order = (
          'MacAddress','PhotoFolder','AddDate','DateType','UploadKey','DownsyncKey',
          'CustomDateFormat','MediaType'
        );
        @retrieves = ('Result');
        my $desktopStatus = from_json($accessor->localCall('SetFolderConfig',\%user_data,\@data_order, \@retrieves), {utf8=>1});
        if(not exists $desktopStatus->{"success"} or $desktopStatus->{"success"} eq "false"){
          $result = $desktopStatus;
          $success = 0;
          last SETCARD_TRANSACTION;
        }
        if($desktopStatus->{"data"}[0]{"Result"} eq "false"){
          $result = {
            "success" => "false",
            "errors"=>[Notice_EyeFi_UNKNOWN()],
            "data"=> ["cannot change settings"]
          };
          $success = 0;
          last SETCARD_TRANSACTION;
        }
      }
      if($removeMask > 0){
        %user_data=(auth_token => $auth_token,
                    Mac => $targetMAC,
                    DesktopID => $localName,
                    MediaType=> $removeMask
                    );
        $removeDesktop = from_json($accessor->RESTCall('devices.removeDesktop',\%user_data), {utf8=>1});
#        logging($removeDesktop);
        if(not exists $removeDesktop->{"success"} or $removeDesktop->{"success"} eq "false"){
          #removeDesktop Fail
          $result = $removeDesktop;
          logging($result);
          last SETCARD_TRANSACTION;
        }
        %user_data = ('MacAddress' => $targetMAC,
          'Enable' => 0,
          'MediaType' => $removeMask
        );
        @data_order = ('MacAddress','Enable','MediaType');
        @retrieves =('Result');
        $desktopEnable = from_json($accessor->localCall('SetDesktopSync',\%user_data, \@data_order, \@retrieves), {utf8=>1});
        if(not exists $desktopEnable->{"success"} or $desktopEnable->{"success"} eq "false"){
          $result = $desktopEnable;
          $success = 0;
          last SETCARD_TRANSACTION;
        }
        if($desktopEnable->{"data"}[0]{"Result"} eq 'false'){
          $result = {
            "success" => "false",
            "errors"=> [Notice_EyeFi_UNKNOWN()],
            "data"=> ["cannot changing transfer enable"]
          };
          logging($result);
          $success = 0;
          last SETCARD_TRANSACTION;
        }
      }
      
      if($success){
        $result = {
          "success" => "true",
          "errors"=>[],
          "data"=> [("Result"=>"success")]
        };
      }
    }
  };}
  if($@){
    logging($@);
    $result = {
      "success"=>"false",
      "errors"=>[Notice_EyeFi_UNKNOWN()],
      "data"=>[$@]
    };
  }  
  return to_json($result);
}


## @cmethod scalar sub getDestinationFolders(hashref query)
# get destination folders
# 
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This query isn't needed any parameters.
# @return JSON-RPC 
# - The Success
#  - "success": "True", @n
#    fixed form on getting data was succeed.
#  - "data" : {
#   - [
#    - "value": \<string\>@n directory name(s).
#    - ]
#   - }
#  - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
#
# @exception EFC_UNKNOWN'
#  Other non-classified errors. (In the function, these errors are occured by local agent error).

sub getDestinationFolders(\%\$){
  my $self = shift;
  my $query = shift;
  my $result;
  my @dirlist;
  my $lines;
  my $prefix;
  my $drive;
  my @tempDirs;
  my $tempDir;
  my $siDH;
  eval{
    open(my $sinfoFH,"</etc/melco/shareinfo") or die "error at open shareinfo for decode";
    SIFH: while($lines = readline($sinfoFH)){
      if($lines=~m/^([^\.].*?)<>(\w+?)<>/){
        $prefix=$1; $drive=$2;
        push(@dirlist, {"val"=>"$prefix"});
        opendir($siDH,"/mnt/$drive/$prefix") or last SIFH; 
        @tempDirs = grep !/^\./, readdir $siDH;
        closedir($siDH);
        foreach $tempDir (@tempDirs){
          if(-d "/mnt/$drive/$prefix/$tempDir"){
            push(@dirlist,{"val"=>"$prefix/$tempDir"});
          }
        }
      }
    }
    close($sinfoFH);
    
    $result = {
      "success" => "true",
      "data" => \@dirlist
    };
#    logging($@);
  };
  if($@){
    logging($@);
    $result = {
      "success"=>"false",
      "errors"=>[Notice_EyeFi_UNKNOWN()],
      "data"=>[$@]
    };
  }
  return to_json($result);
}
1;
