var COOKIE_EXPIRATION_MIN = 10;
var login_lock = 0;

function login(f, lang) {
	if (login_lock != 0) {
		return;
	}
	login_lock = 1;

	var uid = Ext.getCmp('user');
	var uid_value = uid.getValue();
	var pwd = Ext.getCmp('password');
	var pwd_value = pwd.getValue();

	f.form.submit({
		url: '/dynamic.pl',
		params: {
			bufaction: 'verifyLogin'
		},
		waitTitle: S('Please Wait...'),
		waitMsg: S('Logging In...'),
		success: function(form, action){
			var decodedResponse= Ext.decode(action.response.responseText);
			var jsonData = decodedResponse.data; 
			loginSuccess(f, action, uid_value, lang);
		},
		failure: function(form, action){
			login_lock = 0;

			var title = S('error_box_title');
			var msg = S('l_invalid_uName_pwd');

			Ext.MessageBox.show({
				width: 300,
				title: title,
				msg: msg,
				buttons: Ext.Msg.OK,
				icon: Ext.MessageBox.ERROR,
				fn: function(btn){
					pwd.setRawValue('');
					uid.setRawValue('');
					uid.clearInvalid();
					uid.focus();
				}
			});
		}
	});
};

function loginSuccess(form, action, username, lang) {
	if (action.type == 'submit') {
		resp = Ext.decode(action.response.responseText);
		var sid = resp.data[0].sid;
		var pageMode = resp.data[0].pageMode;
		delCookies();
		createCookie('webui_session_' + username, sid, COOKIE_EXPIRATION_MIN, lang, pageMode);
		successRedirect();
	}
};

function createCookie(name, value, minutes, lang, pageMode) {
	var exp = new Date();
	exp.getTimezoneOffset() * 60 * 1000;
	exp.setTime(exp.getTime() + (minutes * 60 * 1000));
	var expires = ";expires=" + exp;
	var val = value + "_" + lang + "_" + pageMode;
	setCookie(name, val, exp, "/", false, false);
}

function setCookie(name, value, expires, path, domain, secure) {
	var newCookie =
		name + "=" + escape(value) +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");

	document.cookie = newCookie;
}

function delCookies() {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");
	var curDomain = document.domain;

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*)=(.*)/;
	var matchCookie;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				var name = matchCookie[1];
				var value = matchCookie[2];
				if ((document.domain == curDomain)) {
					setCookie(name, value, new Date(0), "/", false, false);
				}
			}
		}
	}
}

function resetCookie(response) {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*?)=(.*?)_(.*?)_(.*)/;
	var matchCookie;

	var name;
	var value;
	var lang;
	var mode;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				name = matchCookie[1];
				value = matchCookie[2];
				if (response != undefined){
					if (response.data.length > 0){
						lang = response.data[0].lang;
					}
				}
				else {
					lang = matchCookie[3];
				}
				mode = matchCookie[4];
			}
			break;
		}
	}

	delCookies();
	createCookie(name, value, COOKIE_EXPIRATION_MIN, lang, mode);
};

function getNameFromCookie() {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*?)=(.*?)_(.*?)_(.*)/;
	var matchCookie;
	var splitName;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				splitName = matchCookie[1].split("webui_session_");
				return splitName[1];
			}
			break;
		}
	}
}

function getLangFromCookie() {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*?)=(.*?)_(.*?)_(.*)/;
	var matchCookie;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				return matchCookie[3];
			}
			break;
		}
	}
};

function getPageModeFromCookie() {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*?)=(.*?)_(.*?)_(.*)/;
	var matchCookie;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				return matchCookie[4];
			}
			break;
		}
	}
};

function updateCookieLang(lang) {
	var curCookie = document.cookie;
	var curCookieArray = curCookie.split("; ");

	var i;
	var reWebui = /^webui_session_/;
	var reValue = /(.*?)=(.*?)_(.*?)_(.*)/;
	var matchCookie;

	var name;
	var sid;
	var lang;
	var mode;

	for (i = 0; i < curCookieArray.length; i++) {
		if (reWebui.exec(curCookieArray[i])) {
			if ((matchCookie = reValue.exec(curCookieArray[i])) != null) {
				name = matchCookie[1];
				sid = matchCookie[2];
				mode = matchCookie[4];
			}
			break;
		}
	}

	delCookies();

	if (lang == 'english') { lang = 'en'; }
	else if (lang == 'japanese') { lang = 'ja'; }
	else if (lang == 'german') { lang = 'de'; }
	else if (lang == 'french') { lang = 'fr'; }
	else if (lang == 'italian') { lang = 'it'; }
	else if (lang == 'spanish') { lang = 'es'; }
	else if (lang == 'simplified') { lang = 'zh-cn'; }
	else if (lang == 'traditional') { lang = 'zh-tw'; }
	else if (lang == 'korean') { lang = 'ko'; }
	else if (lang == 'portuguese') { lang = 'pt'; }
	else if (lang == 'dutch') { lang = 'nl'; }
	else if (lang == 'swedish') { lang = 'sv'; }
	else if (lang == 'thai') { lang = 'th'; }
	else if (lang == 'russian') { lang = 'ru'; }
	else if (lang == 'arabic') { lang = 'ar'; }
	else if (lang == 'finnish') { lang = 'fi'; }
	else if (lang == 'turkish') { lang = 'tr'; }
	else { lang = 'en'; }

	createCookie(name, sid, COOKIE_EXPIRATION_MIN, lang, mode);
	successRedirect();
}

function verify_userMode() {
//	Ext.get('root_doc').mask();
	var MaskElems = Ext.DomQuery.select('.ext-el-mask');
	Ext.get(MaskElems).show();

	var cName = getNameFromCookie();
	if (userLoginName != cName){
		formFailureFunction();
	}
}

function failureFunction() {
	failRedirect();
	delCookies();
};

function getLanguage(response) {
	var language;
	if (response != undefined) {
		if (response.data.length > 0) {
			language = response.data[0].lang;
		}
	}
	return language;
}

function failRedirect() {
	window.location = '/static/index.html';
}

function successRedirect() {
	window.location.href = '/static/root.html';
}
