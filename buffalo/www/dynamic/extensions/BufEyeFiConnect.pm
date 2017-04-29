#!/usr/bin/perl

# *************** WARNING! **************** #
#                                           #
# BELOW SOURCE CODE WAS WRITTEN FOR DOXYGEN #
#                                           #
# *************** WARNING! **************** #

##@file
# Eye-Fi service Low-Level acccessor.

##@class BufEyeFiConnect
# This module is delegate data from WebUI request among two servers .
# the one of server is the "Eye-Fi master server"
# that has a REST like interface and response via JSON formatted data.
# The other, "Eye-Fi Local Agent" has a SOAP like interface and response via
# SOAP-XML formatted data.
# The purpose of this module are dissolving the difference of two servers.
# This module has a REST like interface and response JSON-RPC structured data.
# approximately JSON-RPC structure is below:
# - request was succeed
#   - {"success"=true, "data"= {\<data contents\>}}
# - request was failed
#   - {"succeess"=fase, "errors"=\<resource identifier\>, "Message"=\<reason strings\>}
#
# The succeed structure has a "success" key. The 'Ext.form.action.submit'
# recognize a "success" key is containd in JSONize data and there is evidence
# of select a handler. The failure structure has a "failure" key same reason.
# The data contents are classified two types:
# ONE: Data from extract the SOAP-XML response. All local agent caller returns this type.
# ONE: Data through from the REST api.
# Type one has a flatten structure than originally API response because extraction.
# The extraction process are wholly owned by "xmlkey2hash()" function.
package BufEyeFiConnect;
require Exporter;
our @ISA=("Exporter");

use constant {

    EYEFI_MEDIATYPE_PHOTO => 1,
    EYEFI_MEDIATYPE_VIDEO => 2,
    EYEFI_MEDIATYPE_RAW => 4,
    EYEFI_MEDIATYPE_MASK => 7,

# Resource strings
    Notice_ServerNotFound=>'EFC_serverNotFound',
    Notice_ServerNotResponded=>'EFC_serverNotResponded',
    Notice_InternalServerNotResponded=>'EFC_internalServerNotResponded',
    Notice_InternalServerNotFound=>'EFC_UserNotFound',
    Notice_UserNotFound=>'EFC_UserNotFound',
    Notice_WrongPassword=>'EFC_WrongPassword',
    Notice_CardNotFound=>'EFC_CardNotFound',
    Notice_DestinationNotSet=>'EFC_DestinationNotSet',
    Notice_PartiallyDestination=>'EFC_PartiallyDestination',
    Notice_YetSetDestination=>'EFC_DestinationNotSetYet',
    Notice_DestinationGone=>'EFC_DestinationGone',
    Notice_TemporaryFileisFull=>'EFC_TemporaryFileisFull',
    Notice_TemporaryFileCannotAccess=>'EFC_TemporaryCannotAccess',
    Notice_bad_Auth_hash=>'EFC_BAD_auth_hash',
    Notice_EyeFi_UNKNOWN=>'EFC_UNKNOWN',
    Notice_bad_Auth_Token=>'EFC_BAD_auth_token'
};

our @EXPORT = qw (
    EYEFI_MEDIATYPE_PHOTO EYEFI_MEDIATYPE_VIDEO EYEFI_MEDIATYPE_RAW
    EYEFI_MEDIATYPE_MASK 
    Notice_ServerNotFound Notice_ServerNotResponded 
    Notice_InternalServerNotResponded Notice_InternalServerNotFound 
    Notice_UserNotFound Notice_WrongPassword Notice_CardNotFound 
    Notice_DestinationNotSet Notice_PartiallyDestination Notice_YetSetDestination
    Notice_DestinationGone Notice_bad_Auth_hash Notice_EyeFi_UNKNOWN Notice_bad_Auth_Token
  );
our @EXPORT_OK = qw(logging);


use utf8;
binmode STDOUT, ":utf8";
binmode STDIN, ":utf8";
use strict;
use warnings;
use Data::Dumper;

use XML::LibXML;
use LWP::UserAgent;
use HTTP::Request::Common;
use HTTP::Response;
use JSON;
use Storable;
use Data::Dumper;
use Time::HiRes qw(time);
use Digest::MD5 qw(md5_hex);
use CGI;
use CGI::Cookie;



##@cmethod new(%args)
# A constructor.
# @param args [in] A hash of the parameters.
# @return hash A instance.
sub new{
    my $_invocant = shift;
    my $class = ref($_invocant) || $_invocant;
    my $self= {

##@var key REST_entry_point
# presetted URL of api.eye.fi. That is used in RESTCall function.
        REST_entry_point => 'https://api.eye.fi/api/rest/partners/1.0/',
##@var key LOCAL_soap_ns
# presetted URL of localAPI namespace. That is used in localCall function.
        LOCAL_soap_ns => 'http://127.0.0.1:59278/api/soap/card-settings/v1',
##@var key LOCAL_entry_point
# presetted URL to access to localAPI. That is used in localCall function.
        LOCAL_entry_point => 'http://127.0.0.1:59278/api/nas/card-settings/v1',
##@var key TIMEOUT
# An access timeout with seconds. There is a number
        TIMEOUT => 20,
##@var key API_KEY
# A owner code for to access Eye-Fi master server. See the document Eye-Fi REST API.
        API_KEY => undef,
##@var key API_SECRET
# A validate code to grant to use API KEY. See the document Eye-Fi REST API
        API_SECRET => undef,
##@var key AuthToken
# A session key for REST API. This key's time to live is till 24 hours at logged in 
# with 'LongSession' option. For details, you may see the document Eye-Fi REST API
        AuthToken => undef,
##@var key Logintime
#  \<Unused\> A login time that succeed.
        LoginTime => undef,

        @_,
    };

#retreve KEY data
# A name of the storable data file with API_KEY and API_SECRET.
    my $KEYS ='/usr/bin/eyefi/.eyefi_perl_keys';
    
    my %_KEY_PAIR = %{retrieve ($KEYS)};
    $self->{'API_KEY'} = $_KEY_PAIR{'API_KEY'};
    $self->{'API_SECRET'} = $_KEY_PAIR{'API_SECRET'};
    bless $self, $class;
}

##@cmethod logging(scalar message)
# log file writer (Local Function)
# @param message : [in] message text.
sub logging($){
    my $mesg = Dumper @_;
    open(my $loghandle, "+>>/var/log/eyefi/EyeFiConnect.log");
    (my $pack , my $filename, my $lineno) = caller;
    (my $sec, my $min, my $hour, my $mday, my $mon, my $year) = localtime(time);
    $year += 1900; $mon +=1;
    print $loghandle "${year}/${mon}.${mday} ${hour}:${min}:${sec}| ${filename}:${lineno} |\n${mesg}\n";
    close $loghandle;
    return @_;
}


## @cmethod scalar RESTCall(scalar Command, hashref Parameters)
# request to api.eye.fi server with the REST format.
# @param Command    : [in] Command to request
# @param Parameters : [in] Hash of parameters set.
# @return JSON formatted string. Must be parsed by caller.
# @exception EFC_serverNotFound
#  Server is not found.
# @exception EFC_serverNotResponded 
#  Server is found but not responded.
# @exception EFC_BAD_auth_token 
#  Auth token is invalid, like as a timeout.
# @exception EFC_UNKNOWN'
#  Other non-classified errors.

sub RESTCall(\@$\%){
    my $self = shift or die 'Irregal Paramters';
    my ($cmd, $prms) = @_;
    my $api_sig_ord = $self->{API_SECRET};
    my $accurl = "$self->{REST_entry_point}?";
    my $millisecs = int(Time::HiRes::time()*1000);
    #get sorted parameters
    my %wholePrms;
    while (my ($pkey, $pval) = each %$prms){
        $wholePrms{$pkey}=$pval;
    }
    $wholePrms{'method'} = $cmd;
    $wholePrms{'api_key'} = $self->{API_KEY};
    $wholePrms{'format'} = 'json';
    $wholePrms{'call_id'} = $millisecs;
    if(defined $self->{'AuthToken'}){
        $wholePrms{'AuthToken'}=$self->{'AuthToken'};
    };
    foreach my $pkey (sort keys(%wholePrms)){
        my $pval = $wholePrms{$pkey};
        $api_sig_ord = "$api_sig_ord$pkey$pval";
        $pval =~ s/([^\w ])/'%'.unpack('H2', $1)/eg;
        $pval =~ tr/ /+/;
        $pkey =~ s/([^\w ])/'%'.unpack('H2', $1)/eg;
        $pkey =~ tr/ /+/;
        $accurl = "${accurl}&${pkey}=${pval}";
    }
    #add API signature
    my $api_sig = md5_hex($api_sig_ord);
    $accurl = "${accurl}&api_sig=${api_sig}";
    my $res = undef;
    my $req = undef;
    my $ua  = undef;
    my $tout= $self->{TIMEOUT};
    local $SIG{ALRM}=sub{die("timeout RESTcall");};
    eval{
        alarm ($tout);
        $ua = LWP::UserAgent->new;
        $ua->timeout($tout);
        $req =  HTTP::Request->new('GET', ${accurl});
        $res = $ua->request($req);
        alarm 0;
    };
    alarm 0;
    if($@ =~m/timeout/ or not defined $res){ #time out
        logging($@);
        return to_json({"success"=>"false","errors"=> [Notice_ServerNotResponded()] ,"data"=>["Time Out"]}, {utf8 => 1});
    };
    # Responsed
#    logging($res);
    my $resj;
    if ($res->is_success){
        my $auth_result = from_json($res->content);
        if (exists $auth_result->{'Error'}){
            if($auth_result->{'Error'}{'Code'} == 1){
                $resj = to_json({"success"=>"false","errors"=>[Notice_UserNotFound()],"data"=>["User not found"]}, {utf8 => 1});
            }elsif($auth_result->{'Error'}{'Code'} == 9){
                $resj = to_json({"success"=>"false","errors"=>[Notice_WrongPassword()],"data"=>["Wrong Password"]}, {utf8 => 1});
            }elsif($auth_result->{'Error'}{'Code'} == 6){
                $resj = to_json({"success"=>"false","errors"=>[Notice_bad_Auth_Token()],"data"=>["Authentication key is not valid."]}, {utf8 => 1});
            }else{
                $resj = to_json({"success"=>"false","errors"=>[Notice_UNKNOWN()],"data"=>[$auth_result->{'Error'}{'Code'}]}, {utf8 => 1});
            }
            logging($auth_result);
        }
        #response analize
        if (exists $auth_result->{'Response'}){
            my $userdata = $auth_result->{'Response'};
            #JSONize
            $resj = to_json({"success"=>"true", "data"=>[$userdata],"errors"=>[]},{utf8 => 1});
        }
    }
    if($res->is_error){
        logging($res->content);
        if($res->content =~m/^5\d{2}/g){
            $resj =  to_json({"success"=>"false","errors"=>[Notice_ServerNotResponded()],"data"=>[$res->content]}, {utf8 => 1});
        }elsif($res->content =~ m/^4\d{2}/g){
            $resj = to_json({"success"=>"false","errors"=>[Notice_ServerNotFound()],"data"=>[$res->content]}, {utf8 => 1});
        }
    }
    return $resj;
}

## @cmethod hashref xmlkey2hash(scalar str, arrayref Keys)
# request to api.eye.fi server with the REST format.
# @param str  : [in] XML to parse.
# @param Keys : [in] list of element name as hash key.
sub xmlkey2hash(\%\$\@){
    my $self = shift;
    my $str = shift;
    my $Keys = shift;
    
    my %hash;

    my $xmlinstance = new XML::LibXML;
    my $Xresult = $xmlinstance->parse_string($str);

    foreach my $tagName (@$Keys){
        my @tags = $Xresult->getElementsByTagName($tagName);
        foreach my $tag (@tags){
            $hash{$tagName}=$tag->textContent;
        }
    }
    return \%hash;
}

## @cmethod scalar localCall(scalar Command, hashref Parameters, arrayref Order, arrayref Retrieves)
# request with the SOAP protocol to Local agent of NAS.
# @param Command    : [in] Command to request
# @param Parameters : [in] hash of parameters, names and values.
# @param Order      : [in] the xml element order of SOAP request. the order must be aligned by document order.
# @param Retrieves  : [in] element names is contained from XML-RPC result.
# @return JSON.
# @exception EFC_internalServerNotResponded
#  Internal local agent is not responded.
# @exception EFC_internalServerNotResponded
#  Internal local agent is not found. (physically impossible)

sub localCall(\@$\%\@\@){
    use utf8;
    my $self = shift or die;
    my ($Command, $Parameters, $Order, $Retrieves) = @_;

    # build XML

    my $doc = XML::LibXML::Document->new(1.0, 'UTF-8');
    my $base = $doc->createElementNS('http://schemas.xmlsoap.org/soap/envelope/','soap:Envelope');
    $doc->setDocumentElement($base);
    my $body = $doc->createElement('soap:Body');
    my $scmd = $doc->createElementNS($self->{'LOCAL_soap_ns'}, ${Command});

    foreach my $indx (@$Order){
        my $elem = $doc->createElement($indx);
        my $text=$Parameters->{$indx};
        $elem->appendChild($doc->createTextNode($text));
        $scmd->appendChild($elem);
    }

    $body->appendChild($scmd);
    $base->appendChild($body);

    my $xmlReq = $doc->toString;
    #POST Action
    my $req  = undef;
    my $hed  = undef;
    my $res  = undef;
    my $ua   = undef;
    my $tout = $self->{TIMEOUT};
    $SIG{ALRM}=sub{die("timeout LOCALcall")};
    eval{
        alarm ($tout);
        $ua = LWP::UserAgent->new;
        $hed = HTTP::Headers->new(
             'SOAPAction' =>"urn:${Command}",
             'Content-Type'=>'text/xml; charset="utf-8"');
        $ua->timeout($tout);
        $req = HTTP::Request->new('POST', $self->{LOCAL_entry_point}, $hed, $xmlReq);
        $res = $ua->request($req);
        alarm 0;
    };
    alarm 0;
    if($@ =~m/timeout/ or not defined $res){ #timeout
        logging($@);
        return to_json({"success"=>"false","errors"=>[Notice_InternalServerNotResponded()],"data"=>["Time Out"]}, {utf8 => 1});
    };
    my $resj;
    if($res->is_success){
        #parse
        my $Hresult = $self->xmlkey2hash($res->content, $Retrieves);
        $resj = to_json({"success"=>"true","data"=>[$Hresult],"errors"=>[]}, {utf8 => 1});

    }
    if($res->is_error){
        logging($res->content);
        if($res->content =~m/^5\d{2}/g){
            $resj = to_json({"success"=>"false","errors"=>[Notice_InternalServerNotResponded()],"data"=>[$res->content]}, {utf8 => 1});
        }elsif($res->content =~ m/^4\d{2}/g){
            $resj = to_json({"success"=>"false","errors"=>[Notice_InternalServerNotFound()],"data"=>[$res->content]}, {utf8 => 1});
        }
    }
    return $resj;
}


## @cmethod scalar getAuthLogin(hashref query)
# Request user login to Eye-fi Master Server.
# The Master Server will return an Auth_Token and some properties of 
# user when be succeed to login.
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
sub getAuthLogin(\%\%){
    my $self = shift;
    my $query = shift;
#    logging($query);
    my %user_data = (Login => ($query->param('Login')),
                     Password => ($query->param('Password')));
#    $self->logging(Dumper \%user_data);
    my $result =  $self->RESTCall('auth.login',\%user_data);
#    logging($result);
    return $result;
}

## @cmethod scalar getAuthLogout(hashref query)
# Request user logout to Eye-fi Master Server.
# The Master Server will return nothing when be succeed to logout.
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
sub getAuthLogout(\%\%){
    my $self = shift;
    my $query = shift;
#    logging($query);
    my %user_data = (auth_token => ($query->param('auth_token')));
    my $result = $self->RESTCall('auth.logout',\%user_data);
#    logging($result);
    return $result;
}

## @cmethod scalar getDevicesGet(hashref query)
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
#    fixed form on getting data was succeed.
#   - "data" : { @n
#    It's also fixed form.
#    - "Device" : @n
#     A particular keycode of getDevicesGet
#     - {                         
#     - "Mac"                 : \<scalar string\>, @n
#      The Card MAC address. It is necessary to LocalAgent API.
#     - "Name"                : \<scalar string\>, @n
#      The Card name. This is wrote with UTF-8. It is necessary to LocalAgent APIs.
#     - "Features":{
#      The Card features set. The features description is formatted as array of hash as below,
#     - "DesktopId"           : \<scalar string\>, @n
#      The Card was set transfer acivate, the parameter gives destnation hostname.@n
#      {\<key\>:{on:\<value\> ,enabled:\<value\>}} @n
#      Suites of the Key are seem to be added one after the other by time progress.
#      A some key has no necessity for the "Eye-fi connected". You may ignore some keys no necessary.
#      - "video":{"on":\<value\>,"enabled":\<value\>}, @n
#       Video transfer feature. key "on" has "1" if card has featured video transfer.
#       key "enabled" has "1" if transfer video via wireless is activated.
#      - "raw":{"on":\<value\>,"enabled":\<value\>}, @n
#       RAW photo transfer feature. key "on" will "1" if card has featured video transfer.
#       key "enabled" has "1" if transfer RAW photo via wireless is activated.
#      - "adhoc":{"on":\<value\>,"enabled":\<value\>}, 
#      - "endless_memory":{"on":\<value\>,"enabled":\<value\>}, 
#      - "hotspots":{"on":\<value\>,"enabled":\<value\>},
#      - "geo":{"on":\<value\>,"enabled":\<value\>},
#      - "online":{"on":\<value\>,"enabled":\<value\>} @n
#       There is no definition to determine how to use.
#      - }
#     - "DesktopUploadAssist" : \<scalar integer\>,
#     - "Type"                : \<scalar integer\>,
#     - "EndlessMemory"       : \<scalar integer\>,
#     - "Brand"               : \<scalar string\>,
#     - "Mode"                : \<scalar string\>,
#     - "UploadPolicy"        : \<scalar integer\>, @n
#      There is no definition to determine how to use.
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
sub getDevicesGet(\%\%){
    my $self = shift;
    my $query = shift;
#    logging($query);
    my %user_data = (auth_token => ($query->param('auth_token')));
#    logging(\%user_data);
    my $result = $self->RESTCall('devices.get',\%user_data);
    return $result;   #D
}


## @cmethod scalar setDevicesSetDesktop(hashref query)
# Request to set the desktop the destnation to Eye-fi Master Server.
# The Master Server will return nothing when be succeed to logout.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.(T.B.D.)
#  - auth_token \<Scalar string\>@n
#   The authentication Token.
#  - Mac \<Scalar string\>@n
#   The MAC address for set transfer.
#  - DesktopID \<Scalar string\>@n
#   The host name of NAS.
# @return JSON-RPC 
# - {
#   - "success": "True", @n
#    fixed form on getting data was succeed.
#   - "data" : { @n
#    It's also fixed form.
#    - "Response" : {@n
#     A particular keycode of setDevicesSetDesktop.
#     - "DownsyncKey" : \<scalar string\>, @n
#      A key between LocalAgent and Eye-Fi Masterservers.
#     - "UploadKey" : \<scalar string\>, @n
#      A key between LocalAgent and Eye-Fi Card.
#      This value will be all zeroes when the device is not "Eye-Fi Card",
#      look like a iPhone.
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
sub setDevicesSetDesktop(\%\%){
    my $self = shift;
    my $query = shift;
#    logging($query);
    my %user_data = (auth_token => ($query->param('auth_token')),
                     Mac => ($query->param('MacAddress')),
                     DesktopID => ($query->param('DesktopID')),
                    );
#    $self->logging(Dumper \%user_data);
    my $result = $self->RESTCall('devices.setDesktop',\%user_data);
#    logging($result);
    return $result;   #D
}

## @cmethod scalar getLocalGetDesktopSync(hashref query)
# Request to get the status of transfer enable.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - MacAddress \<Scalar string\>@n
#   MAC Address of card to get a parameter.
#  - MediaType \<Scalar integer\>@n
#   A order of mediatype to transfer from a card that has the previous MAC Address.
#  - MediaType \<Scalar integer\>@n
#   A order of mediatype to transfer from a card that has the previous MAC Address.
# @return JSON formatted string. 
# - The Success
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {
#    - "Enabled" : \<Case-sensitive string, "true"/"false"\>@n
#     True when transfer configration was set. False when transfer configration was unset.
#    - }
#   - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
sub getLocalGetDesktopSync(\%\%){
    my $self = shift;
    my $query = shift;
#    logging(Dumper $query);
    my %user_data = ('MacAddress' => $query->param('MacAddress'),
                     'MediaType' => $query->param('MediaType'));
    my @data_order=('MacAddress','MediaType');
    my @retrieves =('Enabled');
    my $result = $self->localCall('GetDesktopSync',\%user_data, \@data_order, \@retrieves);
    return $result;
}

## @cmethod scalar getLocalGetFolderConfig(hashref query)
# Request to get LocalAgent settings about one feature of one card.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - MacAddress \<Scalar string\>@n
#   MAC Address of card to get a parameter.
#  - MediaType \<Scalar integer\>@n
#   A order of mediatype to transfer from a card that has the previous MAC Address.
#  - CardName \<Scalar utf-8 encoded string\>@n
#   The Name of card. This parameter will retreive by calling getDevicesGet(). 
# @return JSON formatted string. 
# - The Success
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {
#    - "PhotoFolder": \<Scalar utf-8 encoded string\>, @n
#     The destination folder actually set. The value will be sikped
#     prefix in result from LocalAgent as system directory names.@n
#     ex.: LocalAgent returns "/mnt/disk1/share/" will be translate
#     to "/share" and discard "/mnt/disk[0-9]" matched directory prefix.
#    - "DefaultFolder": \<Scalar utf-8 encoded string\>, @n
#     It is not used. but it is necessary to call setLocalSetFolderConfig().
#    - "AddDate": \<Case-sensitive string, "true"/"false"\>@n
#     It is not used. but it is necessary to call setLocalSetFolderConfig().
#    - "DateType": \<Scalar integer\>,@n
#     It is not used. but it is necessary to call setLocalSetFolderConfig().
#    - "DesktopId": \<Scalar string\>, @n
#     It is not used. but it is necessary to call setLocalSetFolderConfig().
#    - "CustomDateFormat": \<Scalar string\>, @n
#     It is not used. but it is necessary to call setLocalSetFolderConfig().
#   - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
sub getLocalGetFolderConfig(\%\$){
    my $self = shift;
    my $query = shift;


#    logging($query);
    my %user_data = ('MacAddress' => $query->param('MacAddress'),
                     'CardName' => $query->param('CardName'),
                     'MediaType' => $query->param('MediaType'));
    my @data_order= ('MacAddress','CardName','MediaType');
    my @retrieves = ('PhotoFolder','AddDate','DateType','DesktopId','DefaultFolder','CustomDateFormat');
    my $result = $self->localCall('GetFolderConfig',\%user_data,\@data_order,\@retrieves);
    my $Jresult = from_json($result);
    if($Jresult->{'success'} eq "true"){
        #Directory Passing Phase 1
        if(exists $Jresult->{'data'}[0]{'PhotoFolder'}){
            my $tempFolder = $Jresult->{'data'}[0]{'PhotoFolder'};
            if($tempFolder =~ m/^(\/mnt)/){
                $tempFolder =~ s/^\/mnt\/[\w]+\///;
            } else {
                $tempFolder ='';
            }
            $Jresult->{'data'}{'PhotoFolder'}= $tempFolder;
        }
        #Directory Passing Phase 2
        if(exists $Jresult->{'data'}[0]{'DefaultFolder'}){
            my $tempFolder = $Jresult->{'data'}[0]{'DefaultFolder'};
            if($tempFolder =~ m/^(\/mnt)/){
                $tempFolder =~ s/^\/mnt\/[\w]+\///;
            } else {
                $tempFolder ='';
            }
            $Jresult->{'data'}[0]{'DefaultFolder'}= $tempFolder;
        }
    }
    return to_json($Jresult);
}

## @cmethod scalar setLocalSetDesktopSync(hashref query)
# Request to set transfer status about one card.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - MacAddress \<Scalar string\>@n
#   MAC Address of card to get a parameter.
#  - MediaType \<Scalar integer\>@n
#   A order of mediatype to transfer from a card that has the previous MAC Address.
# @return JSON formatted string. 
# - The Success
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {
#    - "Result" : \<Case-sensitive string, "true"/"false"\>@n
#     True when transfer configration was accepted.
#     False when transfer configration was not accepted.
#    - }
#   - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
sub setLocalSetDesktopSync(\%\$){
    my $self = shift;
    my $query = shift;
    my @ResponseItems = ('Result');
    my $Jresult = "";

#    logging($query);
    my %user_data = ('MacAddress' => $query->param('MacAddress'),
                     'Enable' => $query->param('Enable'),
                     'MediaType' => $query->param('MediaType'));
    my @data_order = ('MacAddress','Enable','MediaType');
    my @retrieves =('Result');
    my $result = $self->localCall('SetDesktopSync',\%user_data, \@data_order, \@retrieves);
    return $result;
}


## @cmethod scalar setLocalSetFolderConfig(hashref query)
# Request to set LocalAgent settings about one feature of one card.
#
# @param query: [in] An object reference of the CGI package instance.
# The instance will be made from dynamic.pl.
# This function are based on the assumption that the query has below 
# parameters.
#  - MacAddress \<Scalar string\>@n
#   MAC Address of card to get a parameter.
#  - MediaType \<Scalar integer\>@n
#   A order of mediatype to transfer from a card that has the previous MAC Address.
#  - CardName \<Scalar utf-8 encoded string\>@n
#   The Name of card. This parameter will retreive by calling getDevicesGet(). 
#  - "PhotoFolder": \<Scalar utf-8 encoded string\>, @n
#   The destination folder to set. (T.B.D.)
#  - "AddDate": \<Scalar utf-8 encoded string\>, @n
#   Rightnow, Must be set to True. (T.B.D.)
#  - "DateType": \<Scalar integer\>,@n
#   (T.B.D.)
#  - "CustomDateFormat": \<Scalar utf-8 encoded string\>, @n
#   Must be set null string, as "". (T.B.D.)
#  - "UploadKey": \<Scalar string\>, @n
#   Set "UploadKey" from setDevicesSetDesktop().
#  - "DownsyncKey": \<Scalar utf-8 encoded string\>, @n
#   Set "DownsyncKey" from setDevicesSetDesktop().
# @return JSON formatted string. 
# - The Success
#   - "success": "True", @n
#     fixed form on getting data was succeed.
#   - "data" : {
#    - "Result" : \<Case-sensitive string, "true"/"false"\>@n
#     True when transfer configration was accepted.
#     False when transfer configration was not accepted.
#   - }
# - The Failure
#  - {
#   - 'success': False,
#     fixed form on getting data was succeed
#   - 'Error' : \<resource identifier\>
#     Resource identifier for displaying error message
#   - 'Message' : \<string\>
#     Description of a failure.
#  - }
sub setLocalSetFolderConfig(\%\$){
    my $self = shift;
    my $query = shift;
    my $Jresult = "";

#    logging($query);
    #detect directories
    my $masterDir = '';
    my $targetDest = $query->param('PhotoFolder');
    if($targetDest ne ''){
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
                opendir($siDH,"/mnt/$drive/$prefix") or last SIFH; 
                @tempDirs = map {"/mnt/$drive/$prefix/$_"} grep !/^\.\.?\z/, readdir $siDH;
                closedir($siDH);
                foreach $tempDir (@tempDirs){
                    if(-d $tempDir){
                        if($tempDir=~m|$targetDest$|){
                            $masterDir = $tempDir;
                        }
                    }
                }
            }
        }
        close($sinfoFH);
    }
    if($masterDir eq ''){
        logging("invalid PhotoFolder");
        die "setLocalSetFolderConfig: irregal call";
    }
    my %user_data = (
        'MacAddress' => $query->param('MacAddress'),
        'PhotoFolder' => $masterDir,
        'AddDate' => $query->param('AddDate'),
        'DateType' => $query->param('DateType'),
        'UploadKey' => $query->param('UploadKey'),
        'DownsyncKey' => $query->param('DownsyncKey'),
        'CustomDateFormat' => $query->param('CustomDateFormat'),
        'MediaType' => $query->param('MediaType')
    );
    my @data_order = (
        'MacAddress',
        'PhotoFolder',
        'AddDate',
        'DateType',
        'UploadKey',
        'DownsyncKey',
        'CustomDateFormat',
        'MediaType'
    );
    my @retrieves = ('Result');
    my $result = $self->localCall('SetFolderConfig',\%user_data,\@data_order, \@retrieves);
    return $result;
}

## @cmethod scalar getLocalAgentStatus()
# get localAgent status.
# @return JSON formatted string. Must be parsed by caller.
# @exception EFC_serverNotFound
#  Server is not found.
# @exception EFC_serverPending
#  Server is pending to run by user.
# @exception EFC_serverDisabled
#  Server is pending to run by user.
# @exception EFC_serverAvailable
#  Server is pending to run by user.

## @cmethod scalar setLocalAgentEnable(scalar Enable)
# set LocalAgent to enable.
# In details, the function access the configuration file :/etc/eyefi/bufeyefi.conf.
# the bufeyefi.conf is formatted to imitiate with windows INI file script.
# ex:
# \[Enabled\]
# Enabled = true
#
# Next, the function invokes daemon initializer script(/etc/init.d/eyefid.sh) with enough parameter.
# The daemon initializer readed this line and invoke /usr/local/eyefid if it was needed.
# 
# @param Enable    : [in] if 0 then disable, 1 then enable.
# @return JSON formatted string. Must be parsed by caller.
# @exception EFC_TemporaryCannotAccess
#  cannot write bufeyefi.conf file
# @exception EFC_serverPending
#  Server is pending to run by user.

## @cmethod scalar setDestinationDirectory(scalar Destination)
# set LocalAgent to enable.
# In details, the function access the configuration file :/etc/eyefi/bufeyefi.conf.
# the bufeyefi.conf is formatted to imitiate with windows INI file script.
# ex:
# \[Enabled\]
# Enabled = true
#
# Next, the function invokes daemon initializer script(/etc/init.d/eyefid.sh) with enough parameter.
# The daemon initializer readed this line and invoke /usr/local/eyefid if it was needed.
# 
# @param Enabled        : [in] if 0 then disabled transfer, 1 then enabled transfer.
# @param Destination    : [in] Full path to destination folder.
# @return JSON formatted string. Must be parsed by caller.
# @exception EFC_TemporaryCannotAccess
#  cannot write bufeyefi.conf file
# @exception EFC_serverPending
#  Server is pending to run by user.
sub setDestinationDirectory(\%\$){
    my $self = shift;
    my $Enabled = shift;
    my $Destination = shift;
    if(-e "/etc/eyefi" and -d "/etc/eyefi"){
        if(-e "/etc/eyefi/disabled.txt"){
            unlink("/etc/eyefi/disabled.txt");
        }
        if(-e "/etc/eyefi/enabled.txt"){
            unlink("/etc/eyefi/enabled.txt");
        }
        if($Enabled){
            open(my $desthandle, ">/etc/eyefi/enabled.txt");
            print $desthandle "$Destination\n";
            close $desthandle;
        } else {
            open(my $desthandle, ">/etc/eyefi/disabled.txt");
            print "";
            close $desthandle;
        }
    }
}


1;
