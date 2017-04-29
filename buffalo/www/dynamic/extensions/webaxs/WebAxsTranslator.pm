# WebAxsTranslator.pm
#
# Used to access the different languages for error/status messages in WebAxs
# Usage: (for use inside server side scripts)
# $class = WebAxsTranslator->new();
# $class->serverSide();
# $class->{messageToGet};

############################################################
# WARNING : YOU MUST BE EDIT BY UTF-8 CHARACTOR SET
############################################################

package WebAxsTranslator;

use lib '/www/buffalo/www/dynamic/extensions/webaxs';
use strict;

use WebAxsBuffaloFunctions;

# Creates a new class, and retrieves the language from the Buffalo interface
sub new {
	my $class = shift;
	my $self = {};
	$self->{language} = WebAxsBuffaloFunctions->BuffaloGetLanguage();
	bless($self, $class);
	return $self;
}

# Populates the class with the appropriate language
sub serverSide {
	my $self = shift;
	my $en = {};
	my $jp = {};
	my $de = {};

	if (-f '/www/buffalo/www/index.html') {
		$en->{upnp_NoGateway} = 'upnp_NoGateway';
		$jp->{upnp_NoGateway} = 'upnp_NoGateway';
		$de->{upnp_NoGateway} = 'upnp_NoGateway';
	
		$en->{upnp_ForwardFail} = 'upnp_ForwardFail';
		$jp->{upnp_ForwardFail} = 'upnp_ForwardFail';
		$de->{upnp_ForwardFail} = 'upnp_ForwardFail';
	
		$en->{bnas_UpdateFail} = 'bnas_UpdateFail';
		$jp->{bnas_UpdateFail} = 'bnas_UpdateFail';
		$de->{bnas_UpdateFail} = 'bnas_UpdateFail';
	}
	else {
		$en->{upnp_NoGateway} = 'UPnP Gateway not found and/or doesn\'t support port forwarding, use manual setup.';
		$jp->{upnp_NoGateway} = 'UPnP対応のゲートウェイが見つからないか、UPnPが有効になっていない可能性があります。UPnP非対応のルーターをご使用の場合は手動での設定を試みてください。';
		$de->{upnp_NoGateway} = 'UPnP Gateway nicht gefunden und/oder Portweiterleitung wird nicht unterstützt. Bitte manuell konfigurieren.';

		$en->{upnp_ForwardFail} = 'Port forwarding failed. Use manual setup.';
		$jp->{upnp_ForwardFail} = 'ポート転送設定に失敗しました。手動での設定を試みてください。';
		$de->{upnp_ForwardFail} = 'Portweiterleitung fehlgeschlagen. Bitte manuelles Setup verwenden.';

		$en->{bnas_UpdateFail} = 'Error accessing BuffaloNas.com, check internet settings.';
		$jp->{bnas_UpdateFail} = 'BuffaloNas.comへのアクセスに失敗しました。インターネットへの接続設定を確認してください。';
		$de->{bnas_UpdateFail} = 'Fehler bei Zugriff auf BuffaloNas.com, bitte Internet-Einstellungen kontrollieren.';
	}

	$en->{cl_PageTitle} = 'Web Access';
	$jp->{cl_PageTitle} = 'Webアクセス';
	$de->{cl_PageTitle} = 'Webzugriff';

	$en->{flashName_Upload} = 'MultiFileUpload_en.swf';
	$jp->{flashName_Upload} = 'MultiFileUpload_ja.swf';
	$de->{flashName_Upload} = 'MultiFileUpload_de.swf';

# Folder.pm
	$en->{folder_title_make} = "Make folder";
	$jp->{folder_title_make} = "フォルダー作成";
	$de->{folder_title_make} = "Ordner erstellen";
	
	$en->{folder_title_rename} = "Change folder name";
	$jp->{folder_title_rename} = "フォルダー名変更";
	$de->{folder_title_rename} = "Ordner umbenennen";
	
	$en->{folder_title_delete} = "Delete folder name";
	$jp->{folder_title_delete} = "フォルダー削除";
	$de->{folder_title_delete} = "Ordnernamen löschen";
	

	$en->{folder_msg_make} = "Folder name";
	$jp->{folder_msg_make} = "フォルダー名";
	$de->{folder_msg_make} = "Ordnername";
	
	$en->{folder_msg_rename} = "Folder name";
	$jp->{folder_msg_rename} = "フォルダー名";
	$de->{folder_msg_rename} = "Ordnername";
	
	$en->{folder_msg_delete} = "Will you delete folder'$self->{deletedir}' and its sub directory?";
	$jp->{folder_msg_delete} = "フォルダー'$self->{deletedir}'とフォルダー内のすべてのファイルを削除しますか?";
	$de->{folder_msg_delete} = "Soll der Ordner '$self->{deletedir}' inklusive aller Unterordner gelöscht werden?";
	
	$en->{folder_btn_make} = "Make";
	$jp->{folder_btn_make} = "作成";
	$de->{folder_btn_make} = "Erstellen";
	
	$en->{folder_btn_rename} = "Rename";
	$jp->{folder_btn_rename} = "変更";
	$de->{folder_btn_rename} = "Umbenennen";
	
	$en->{folder_btn_cancel} = "Cancel";
	$jp->{folder_btn_cancel} = "キャンセル";
	$de->{folder_btn_cancel} = "Abbrechen";
	
	$en->{folder_btn_yes} = "Yes";
	$jp->{folder_btn_yes} = "はい";
	$de->{folder_btn_yes} = "Ja";
	
	$en->{folder_btn_no} = "No";
	$jp->{folder_btn_no} = "いいえ";
	$de->{folder_btn_no} = "Nein";
	
	$en->{folder_btn_back} = "<!--FILE_BACK_BTN_EN-->";
	$jp->{folder_btn_back} = "戻る";
	$de->{folder_btn_back} = "<!--FILE_BACK_BTN_DE-->";
	
# File.pm
	$en->{file_title_upload} = "Upload file";
	$jp->{file_title_upload} = "ファイルアップロード";
	$de->{file_title_upload} = "Datei-Upload";
	
	$en->{file_title_upload_multi} = "Upload files";
	$jp->{file_title_upload_multi} = "複数ファイルアップロード";
	$de->{file_title_upload_multi} = "Upload mehrerer Dateien";
	
	$en->{file_title_rename} = "Rename file";
	$jp->{file_title_rename} = "ファイル名変更";
	$de->{file_title_rename} = "Datei umbenennen";
	
	$en->{file_title_delete} = "Delete file";
	$jp->{file_title_delete} = "ファイル削除";
	$de->{file_title_delete} = "Datei löschen";
	
	$en->{file_msg_upload} = "Upload file";
	$jp->{file_msg_upload} = "アップロードファイル";
	$de->{file_msg_upload} = "Datei hochladen";
	
	$en->{file_msg_upload_multi} = "Upload files";
	$jp->{file_msg_upload_multi} = "複数ファイルのアップロード";
	$de->{file_msg_upload_multi} = "Dateien hochladen";
	
	$en->{file_msg_rename} = "File name";
	$jp->{file_msg_rename} = "ファイル名";
	$de->{file_msg_rename} = "Dateiname";
	
	$en->{file_msg_delete} = "Will you delete '$self->{deletefile}'";
	$jp->{file_msg_delete} = "'$self->{deletefile}'を削除しますか?";
	$de->{file_msg_delete} = "Soll '$self->{deletefile}' wirklich gelöscht werden?";
	
	$en->{file_btn_upload} = "Upload";
	$jp->{file_btn_upload} = "アップロード";
	$de->{file_btn_upload} = "Upload";
	
	$en->{file_btn_rename} = "Change";
	$jp->{file_btn_rename} = "変更";
	$de->{file_btn_rename} = "Umbenennen";
	
	$en->{file_btn_cancel} = "Cancel";
	$jp->{file_btn_cancel} = "キャンセル";
	$de->{file_btn_cancel} = "Abbrechen";
	
	$en->{file_btn_yes} = "Yes";
	$jp->{file_btn_yes} = "はい";
	$de->{file_btn_yes} = "Ja";
	
	$en->{file_btn_no} = "No";
	$jp->{file_btn_no} = "いいえ";
	$de->{file_btn_no} = "Nein";
	
	$en->{file_btn_back} = "<!--FILE_BACK_BTN_EN-->";
	$jp->{file_btn_back} = "戻る";
	$de->{file_btn_back} = "<!--FILE_BACK_BTN_DE-->";
	
	
#upload.pl
	$en->{file_upload_success} = "File $self->{parm} is uploaded.";
	$jp->{file_upload_success} = "ファイル「$self->{parm}」はアップロードされました。";
	$de->{file_upload_success} = "Datei $self->{parm} wurde hochgeladen.";
	
	$en->{file_upload_failure} = "Uploading is not finished.";
	$jp->{file_upload_failure} = "アップロードされませんでした。";
	$de->{file_upload_failure} = "Die Datei(en) wurde(n) nicht hochgeladen.";
	
	$en->{file_upload_check} = "Enter file name.";
	$jp->{file_upload_check} = "アップロードファイルを指定してください";
	$de->{file_upload_check} = "Dateinamen eingeben!";

	$en->{file_upload_failure_detail_1} = "Error: Up to $self->{parm} characters.";
	$jp->{file_upload_failure_detail_1} = "エラー：$self->{parm}文字まで入力可能です。";
	$de->{file_upload_failure_detail_1} = "Fehler: Bis zu $self->{parm} Zeichen.";
	
	$en->{file_upload_failure_detail_2} = "Error: \" can not be used for file name.";
	$jp->{file_upload_failure_detail_2} = "エラー：ファイル名に「\"」は使用できません。";
	$de->{file_upload_failure_detail_2} = "Fehler: Backslash und Anführungszeichen können nicht im Dateinamen verwendet werden.";
	
	$en->{file_upload_failure_detail_3} = "Error: The same file name, $self->{parm} exists.";
	$jp->{file_upload_failure_detail_3} = "エラー：既に同名ファイル$self->{parm}が存在します。";
	$de->{file_upload_failure_detail_3} = "Fehler: Der Name $self->{parm} existiert bereits.";
	
	$en->{file_upload_btn_close} = "Close";
	$jp->{file_upload_btn_close} = "閉じる";
	$de->{file_upload_btn_close} = "Schließen";

#renamefile.pl
	$en->{file_rename_success} = "Changed file name.";
	$jp->{file_rename_success} = "ファイル名を変更しました。";
	$de->{file_rename_success} = "Dateiname wurde geändert.";
	
	$en->{file_rename_failure} = "Could not change file name.";
	$jp->{file_rename_failure} = "ファイル名を変更できませんでした。";
	$de->{file_rename_failure} = "Dateiname konnte nicht geändert werden.";
	
	$en->{file_rename_check} = "Enter file name.";
	$jp->{file_rename_check} = "ファイル名を入力してください";
	$de->{file_rename_check} = "Dateinamen eingeben!";
	
	$en->{file_rename_failure_detail_1} = "Error: Enter file name.";
	$jp->{file_rename_failure_detail_1} = "エラー：ファイル名を入力してください。";
	$de->{file_rename_failure_detail_1} = "Fehler: Dateinamen eingeben!";
	
	$en->{file_rename_failure_detail_2} = "Error: Up to $self->{parm} characters.";
	$jp->{file_rename_failure_detail_2} = "エラー：$self->{parm}文字まで入力可能です。";
	$de->{file_rename_failure_detail_2} = "Fehler: Bis zu $self->{parm} Zeichen.";
	
	$en->{file_rename_failure_detail_3} = "Error: \" can not be used for file name.";
	$jp->{file_rename_failure_detail_3} = "エラー：ファイル名に「\"」は使用できません。";
	$de->{file_rename_failure_detail_3} = "Fehler: Fehler: Backslash und Anführungszeichen können nicht im Dateinamen verwendet werden.";
	
	$en->{file_rename_failure_detail_4} = "File, $self->{parm} does not exist.";
	$jp->{file_rename_failure_detail_4} = "ファイル'$self->{parm}'が存在しません";
	$de->{file_rename_failure_detail_4} = "Die Datei $self->{parm} existiert nicht.";
	
	$en->{file_rename_failure_detail_5} = "$self->{parm} does already exist.";
	$jp->{file_rename_failure_detail_5} = "$self->{parm} は既に存在します。";
	$de->{file_rename_failure_detail_5} = "Die Datei $self->{parm} existiert bereits.";
	
	$en->{file_rename_btn_close} = "Close";
	$jp->{file_rename_btn_close} = "閉じる";
	$de->{file_rename_btn_close} = "Schließen";
	
#deletefile.pl
	$en->{file_delete_success} = "Delete file.";
	$jp->{file_delete_success} = "ファイルを削除しました。";
	$de->{file_delete_success} = "Datei löschen";
	
	$en->{file_delete_failure} = "Could not delete file.";
	$jp->{file_delete_failure} = "ファイルを削除できませんでした。";
	$de->{file_delete_failure} = "Datei konnte nicht gelöscht werden.";
	
	$en->{file_delete_failure_detail_1} = "Error: The file, $self->{parm} could not be deleted.";
	$jp->{file_delete_failure_detail_1} = "エラー:ファイル $self->{parm} を削除できませんでした。";
	$de->{file_delete_failure_detail_1} = "Fehler: Datei $self->{parm} konnte nicht gelöscht werden.";
	
	$en->{file_delete_btn_close} = "Close";
	$jp->{file_delete_btn_close} = "閉じる";
	$de->{file_delete_btn_close} = "Schließen";
	
#makedir.pl
	$en->{folder_make_success} = "Create folder $self->{parm}.";
	$jp->{folder_make_success} = "フォルダー「$self->{parm}」を作成しました。";
	$de->{folder_make_success} = "Ordner $self->{parm} wurde erstellt.";
	
	$en->{folder_make_failure} = "Could not create folder.";
	$jp->{folder_make_failure} = "フォルダーを作成できませんでした。";
	$de->{folder_make_failure} = "Ordner konnte nicht erstellt werden!";
	
	$en->{folder_make_check} = "Enter folder name.";
	$jp->{folder_make_check} = "フォルダー名を入力してください";
	$de->{folder_make_check} = "Ordnernamen eingeben!";
	
	$en->{folder_make_failure_detail_1} = "Error: Enter folder name.";
	$jp->{folder_make_failure_detail_1} = "エラー：フォルダー名を入力してください。";
	$de->{folder_make_failure_detail_1} = "Fehler: Ordnernamen eingeben!";
	
	$en->{folder_make_failure_detail_2} = "Error: Up to $self->{parm} characters.";
	$jp->{folder_make_failure_detail_2} = "エラー：$self->{parm}文字まで入力可能です。";
	$de->{folder_make_failure_detail_2} = "Fehler: Bis zu $self->{parm} Zeichen.";
	
	$en->{folder_make_failure_detail_3} = "Error: \" \\ / : < > * ? and | can not be used for folder name.";
	$jp->{folder_make_failure_detail_3} = "エラー：フォルダー名に「\" \\ / : < > * ? |」は使用できません。";
	$de->{folder_make_failure_detail_3} = "Fehler: \" \\ / : < > * ? und | können in Ordnernamen nicht verwendet werden.";
	
	$en->{folder_make_failure_detail_4} = "Error: . can not be used for last character of folder name.";
	$jp->{folder_make_failure_detail_4} = "エラー：フォルダー名の末尾に「.」は使用できません。";
	$de->{folder_make_failure_detail_4} = "Fehler: Ein Punkt kann nicht als letztes Zeichen verwendet werden.";
	
	$en->{folder_make_failure_detail_5} = "Error: . can not be used for first character of folder name.";
	$jp->{folder_make_failure_detail_5} = "エラー：フォルダー名の先頭に「.」は使用できません。";
	$de->{folder_make_failure_detail_5} = "Fehler: Ein Punkt kann nicht als erstes Zeichen verwendet werden.";
	
	$en->{folder_make_failure_detail_6} = "Error: The same folder name, $self->{parm} exists.";
	$jp->{folder_make_failure_detail_6} = "エラー：$self->{parm} は既に存在するフォルダーです。";
	$de->{folder_make_failure_detail_6} = "Fehler: Der Ordnername $self->{parm} existiert bereits.";
	
	$en->{folder_make_btn_close} = "Close";
	$jp->{folder_make_btn_close} = "閉じる";
	$de->{folder_make_btn_close} = "Schließen";
	
#renamedir.pl
	$en->{folder_rename_success} = "Changed folder name.";
	$jp->{folder_rename_success} = "フォルダー名を変更しました。";
	$de->{folder_rename_success} = "Ordnername wurde geändert.";
	
	$en->{folder_rename_failure} = "Could not change folder name.";
	$jp->{folder_rename_failure} = "フォルダー名を変更できませんでした。";
	$de->{folder_rename_failure} = "Ordnername konnte nicht geändert werden.";
	
	$en->{folder_rename_check} = "Enter folder name.";
	$jp->{folder_rename_check} = "フォルダー名を入力してください";
	$de->{folder_rename_check} = "Ordnernamen eingeben!";
	
	$en->{folder_rename_failure_detail_1} = "Error: Enter folder name.";
	$jp->{folder_rename_failure_detail_1} = "エラー：フォルダー名を入力してください。";
	$de->{folder_rename_failure_detail_1} = "Fehler: Ordnernamen eingeben!";
	
	$en->{folder_rename_failure_detail_2} = "Error: Up to $self->{parm} characters.";
	$jp->{folder_rename_failure_detail_2} = "エラー：$self->{parm}文字まで入力可能です。";
	$de->{folder_rename_failure_detail_2} = "Fehler: Bis zu $self->{parm} Zeichen.";
	
	$en->{folder_rename_failure_detail_3} = "Error: \" \\ / : < > * ? and | can not be used for folder name.";
	$jp->{folder_rename_failure_detail_3} = "エラー：フォルダー名に「\" \\ / : < > * ? |」は使用できません。";
	$de->{folder_rename_failure_detail_3} = "Fehler: \" \\ / : < > * ? und | können nicht im Ordnernamen verwendet werden.";
	
	$en->{folder_rename_failure_detail_4} = "Error: . can not be used for last character of folder name.";
	$jp->{folder_rename_failure_detail_4} = "エラー：フォルダー名の末尾に「.」は使用できません。";
	$de->{folder_rename_failure_detail_4} = "Fehler: Ein Punkt kann nicht als letztes Zeichen verwendet werden.";
	
	$en->{folder_rename_failure_detail_5} = "Error: . can not be used for first character of folder name.";
	$jp->{folder_rename_failure_detail_5} = "エラー：フォルダー名の先頭に「.」は使用できません。";
	$de->{folder_rename_failure_detail_5} = "Fehler: Ein Punkt kann nicht als erstes Zeichen verwendet werden.";
	
	$en->{folder_rename_failure_detail_6} = "Error: $self->{parm} does not exist.";
	$jp->{folder_rename_failure_detail_6} = "エラー：$self->{parm} が存在しません";
	$de->{folder_rename_failure_detail_6} = "Fehler: $self->{parm} existiert nicht.";
	
	$en->{folder_rename_failure_detail_7} = "Error: The same folder name, $self->{parm} exists.";
	$jp->{folder_rename_failure_detail_7} = "エラー：$self->{parm} は既に存在します。";
	$de->{folder_rename_failure_detail_7} = "Fehler: Der Ordner $self->{parm} existiert bereits.";
	
	$en->{folder_rename_btn_close} = "Close";
	$jp->{folder_rename_btn_close} = "閉じる";
	$de->{folder_rename_btn_close} = "Schließen";
	
#deletedir.pl
	$en->{folder_delete_success} = "Folder is deleted.";
	$jp->{folder_delete_success} = "フォルダーを削除しました。";
	$de->{folder_delete_success} = "Ordner wurde gelöscht.";
	
	$en->{folder_delete_failure} = "Could not delete folder.";
	$jp->{folder_delete_failure} = "フォルダーを削除できませんでした。";
	$de->{folder_delete_failure} = "Ordner konnte nicht gelöscht werden!";
	
	$en->{folder_delete_failure_detail_1} = "Error: Could not delete folder $self->{parm}.";
	$jp->{folder_delete_failure_detail_1} = "エラー：フォルダーを $self->{parm} を削除できませんでした。";
	$de->{folder_delete_failure_detail_1} = "Fehler: Ordner $self->{parm} konnte nicht gelöscht werden.";

	$en->{folder_delete_btn_close} = "Close";
	$jp->{folder_delete_btn_close} = "閉じる";
	$de->{folder_delete_btn_close} = "Schließen";
	
#multiupload.pl
	$en->{file_multiupload_failure_detail_1} = "Error: Up to $self->{parm} characters.";
	$jp->{file_multiupload_failure_detail_1} = "エラー：$self->{parm}文字まで入力可能です。";
	$de->{file_multiupload_failure_detail_1} = "Fehler: Bis zu $self->{parm} Zeichen.";
	
	$en->{file_multiupload_failure_detail_2} = "Error: \" can not be used for file name.";
	$jp->{file_multiupload_failure_detail_2} = "エラー：ファイル名に「\"」は使用できません。";
	$de->{file_multiupload_failure_detail_2} = "Fehler: \" können nicht in Dateinamen verwendet werden.";
	
	$en->{file_multiupload_failure_detail_3} = "Error: The same file name, $self->{parm} exists.";
	$jp->{file_multiupload_failure_detail_3} = "エラー：既に同名ファイル$self->{parm}が存在します。";
	$de->{file_multiupload_failure_detail_3} = "Fehler: Der Dateiname $self->{parm} existiert bereits.";
	
	if ($self->{language} eq 'english') { for my $key (keys %$en) { $self->{$key} = $en->{$key}; } }
	elsif ($self->{language} eq 'japanese') { for my $key (keys %$jp) { $self->{$key} = $jp->{$key}; } }
	elsif ($self->{language} eq 'german') { for my $key (keys %$de) { $self->{$key} = $de->{$key}; } }
	else { for my $key (keys %$en) { $self->{$key} = $en->{$key}; } }
	
	return;
}

sub clientSide {
	my $self = shift;
	my $en = {};
	my $jp = {};
	my $de = {};

	$en->{login_Login} = 'Login';
	$jp->{login_Login} = 'ログイン';
	$de->{login_Login} = 'Anmeldung';

	$en->{login_LoggedIn} = 'Logged in:';
	$jp->{login_LoggedIn} = 'ユーザー:';
	$de->{login_LoggedIn} = 'Angemeldet als:';

	my $language;
	if ($self->{language} eq 'english') { $language = $en; }
	elsif ($self->{language} eq 'japanese') { $language = $jp; }
	elsif ($self->{language} eq 'german') { $language = $de; }
	else { $language = $en; }

	my $languageString = "";
	for my $key (keys %$language) {
		$languageString .= "var server_" . $key . " = \"" . $language->{$key} . "\";\n";
	}
	return $languageString;
}

1;
