function sessionExpiredNotif() {
//	Ext.get('root_doc').unmask();
	var MaskElems = Ext.DomQuery.select('.ext-el-mask');
	Ext.get(MaskElems).hide();

	Ext.MessageBox.show({
		title: S('error_box_title'),
		msg: S('session_expired'),
		buttons: Ext.MessageBox.OK,
		icon: Ext.MessageBox.ERROR,
		fn: function (btn) {
			failureFunction();
		}
	});
}

function formFailureFunction(action) {
	if (!action) {
		sessionExpiredNotif();
	}
	else if (action.response) {
		var rawData = action.response.responseText;
		// Convert raw data in a JSON structure: '{success: true|false, errors: [], data:[]}
		response = Ext.decode(rawData);
		evaluate_respose(response);
	}
	else {
		var titleRef = 'error_box_title';
		var msgRef = 'qTip_required_values';
		msgBox_usingDictionary(titleRef, msgRef, Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
}

function evaluate_respose(response) {
	if (response != undefined) {
		if (response.errors.length > 0) {
			var errorCode = '';
			var iscsi_error_found = false;

			if (add_iscsi) {
				for (var i = 0; i < response.errors.length; i++) {
					errorCode += S(response.errors[i]) + '<br>';
					if (response.errors[i] == 'err_iscsi_running') {
						iscsi_error_found = true;
					}
				}
				if (iscsi_error_found) {
					show_iscsi_error();
				}
			}
			else {
				for (var i = 0; i < response.errors.length; i++) {
					errorCode += S(response.errors[i]) + '<br>';
				}
			}

			msgBox2(S('error_box_title'), errorCode, Ext.Msg.OK, Ext.MessageBox.ERROR, '');
		}
		else {
			sessionExpiredNotif();
		}
	}
}

function show_iscsi_error() {
	var msg = S('err_iscsi_running');
	var buttons = Ext.MessageBox.OKCANCEL;
	var title = S('error_box_title');
	var icon = Ext.MessageBox.ERROR;
	Ext.MessageBox.show({
		title: S('error_box_title'),
		msg: msg,
		buttons: buttons,
		icon: icon,
		fn: function (btn) {
			if (btn == 'ok') {
				refresh();
			}
		}
	});

}

function winAjaxFailureFunction(parsedData) {
	if (parsedData && parsedData.errors.length > 0) {
		var errorCode = parsedData.errors[0];
		msgBox_usingDictionary('error_box_title', errorCode, Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
	else {
		sessionExpiredNotif();
	}
}

function winAjaxFailureFunction_rawData(rawData) {
	var rawData = rawData.responseText;
	var parsedData = Ext.decode(rawData);

	if (parsedData && parsedData.errors.length > 0) {
		var errorCode = parsedData.errors[0];
		msgBox_usingDictionary('error_box_title', errorCode, Ext.Msg.OK, Ext.MessageBox.ERROR);
	}
	else {
		sessionExpiredNotif();
	}
}

function winAjaxFailureFunction_with_width(parsedData, width) {
	if (parsedData && parsedData.errors.length > 0) {
		var errorCode = parsedData.errors[0];

		Ext.MessageBox.show({
			title: S('error_box_title'),
			width: width,
			msg: S(errorCode),
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR,
			fn: function (btn) {
				if (btn == 'ok') {
					failureFunction();
				}
			}
		});
	}
	else {
		sessionExpiredNotif();
	}
}

function msgBox_usingDictionary(titleRef, msgRef, btnType, icon) {
	var title = S(titleRef);
	var msg = S(msgRef);

	Ext.MessageBox.show({
		width: 300,
		title: title,
		msg: msg,
		buttons: btnType,
		icon: icon
	});
}

function msgBox_usingDictionary_logout(titleRef, msgRef, btnType, icon) {
	var title = S(titleRef);
	var msg = S(msgRef);

	Ext.MessageBox.show({
		width: 500,
		title: title,
		msg: msg,
		buttons: btnType,
		fn:	function() {
			delCookies();
			refresh();
		},
		icon: icon
	});
}

function msgBox_usingDictionary_with_func(titleRef, msgRef, btnType, icon, func) {
	var title = S(titleRef);
	var msg = S(msgRef);

	Ext.MessageBox.show({
		width: 500,
		title: title,
		msg: msg,
		buttons: btnType,
		fn:	func,
		icon: icon
	});
}

function msgBox_usingDictionary_with_width(titleRef, msgRef, btnType, icon, width) {
	var title = S(titleRef);
	var msg = S(msgRef);

	Ext.MessageBox.show({
		width: width,
		title: title,
		msg: msg,
		buttons: btnType,
		icon: icon,
		cloable: false
	});
}

function msgBox2(title, msg, btnType, icon, width) {
	if (!width) width = 300;
	Ext.MessageBox.show({
		width: width,
		title: title,
		msg: msg,
		buttons: btnType,
		icon: icon
	});
}

function refresh() {
	var sURL = unescape(window.location.pathname);
	window.location.replace(sURL);
}

function dTime_customizedToDefault(dateVal) {
	var dateSplitted = dateVal.split("/", 3);
	var displayedFormat = S('date_format');
	var newDate;
	if (displayedFormat == 'm/d/Y') {
		newDate = dateVal;
	}
	else if (displayedFormat == 'd/m/Y') {
		// [0] day, [1] month, [2] year -> [1]/[0]/[2] (m/d/Y)
		newDate = dateSplitted[1] + "/" + dateSplitted[0] + "/" + dateSplitted[2];
	}
	else if (displayedFormat == 'Y/m/d') {
		// [0] Year, [1] month, [2] day -> [1]/[2]/[0] (m/d/Y)
		newDate = dateSplitted[1] + "/" + dateSplitted[2] + "/" + dateSplitted[0];
	}

	return newDate;
}

function dTime_defaultToCustomized(dateVal) {
	var dateSplitted = dateVal.split("/", 3);
	var displayedFormat = S('date_format');
	var newDate;
	if (displayedFormat == 'm/d/Y') {
		newDate = dateVal;
	}
	else if (displayedFormat == 'd/m/Y') {
		//(m/d/Y) [0] month, [1] day, [2] year	->	[1]/[0]/[2]
		newDate = dateSplitted[1] + "/" + dateSplitted[0] + "/" + dateSplitted[2];
	}
	else if (displayedFormat == 'Y/m/d') {
		//(m/d/Y) [0] month, [1] day, [2] year	->	[2]/[0]/[1]
		newDate = dateSplitted[2] + "/" + dateSplitted[0] + "/" + dateSplitted[1];
	}
	return newDate;
}

function date_time_format_time_zone(rawTz) {
	var timeZone_value;

	var regExpOldstyle = /^[-0-9]/
	var isOld = rawTz.search(regExpOldstyle);
	if (isOld != -1) {
		var regExpFormatted = /^\G.*/
		var formatted = rawTz.search(regExpFormatted);

		// checks if the first character is a "-" (e.g. -9)
		var regExp_minus = /^\-.*/;
		var found_minus = rawTz.search(regExp_minus);

		// checks if the first character is a "+" (e.g. +09)
		var regExp_plus = /^\+.*/;
		var found_plus = rawTz.search(regExp_plus);

		// checks if the last character is a ".5" (e.g. 5.5)
		var regExp_comma5 = /.*\.5$/;
		var found_comma5 = rawTz.search(regExp_comma5);

		// checks if the last character is a ".75" (e.g. 5.75)
		var regExp_comma75 = /.*\.75$/;
		var found_comma75 = rawTz.search(regExp_comma75);

		if (formatted != -1) {
			timeZone_value = rawTz;
		}
		else if (found_minus != -1) {
			if (found_comma5 != -1) {
				timeZone_value = "GMT" + (rawTz.replace(".5", "")) + ":30";
			}
			else if (found_comma75 != -1) {
				timeZone_value = "GMT" + (rawTz.replace(".75", "")) + ":45";
			}
			else {
				timeZone_value = "GMT" + rawTz + ":00";
			}
		}
		else if (found_plus != -1) {
			if (found_comma5 != -1) {
				timeZone_value = "GMT" + (rawTz.replace(".5", "")) + ":30";
			}
			else if (found_comma75 != -1) {
				timeZone_value = "GMT" + (rawTz.replace(".75", "")) + ":45";
			}
			else {
				timeZone_value = "GMT" + rawTz + ":00";
			}
		}
		else {
			if (found_comma5 != -1) {
				timeZone_value = "GMT+" + (rawTz.replace(".5", "")) + ":30";
			}
			else if (found_comma75 != -1) {
				timeZone_value = "GMT+" + (rawTz.replace(".75", "")) + ":45";
			}
			else {
				timeZone_value = "GMT+" + rawTz + ":00";
			}
		}
	}
	else {
		timeZone_value = S('timezone_region_' + rawTz);
	}

	return timeZone_value;
}

function remove_useless_mask() {
	var MaskElems = Ext.DomQuery.select('.ext-el-mask');
	if (MaskElems.length >= 2) {
		var i;
		for (i = 1; i < MaskElems.length; i++) {
			Ext.removeNode(MaskElems[i]);
		}
	}
}
