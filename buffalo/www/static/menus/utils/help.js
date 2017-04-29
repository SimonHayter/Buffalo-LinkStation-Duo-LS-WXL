function getHelp(menu){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {bufaction: "getHelp" + menu},
		method: 'GET',
		success: function (result){
			//Get response from server
			var rawData = result.responseText;
			var response = Ext.decode(rawData);

			var success = response.success;
			if (success){
			//resetCookie(response);
				var win = Ext.getCmp('helpWindow');
				if (win){
					win.destroy();
				}
				win = createHelpWin(menu);
				var encodeVal = Ext.util.Format.htmlDecode(response.data[0].helpInfo);

				var textArea = new Ext.form.TextArea({
					value: response.data[0].helpInfo
				});

				Ext.QuickTips.init();

				var textEditor = new Ext.form.HtmlEditor({
					width: 800,
					height: 300,
					value: encodeVal,
					readOnly: true
				});

				var p = new Ext.Panel({
					width:400,
					html: encodeVal,
					height: 200,
					autoScroll : true
				});
/*
				win.add({
					html: encodeVal
				});
*/
				win.add(p);
				win.show();
/*
				var toolbar = textEditor.getToolbar();
				toolbar.hide();
*/
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createHelpWin(menu){
	var win =  new Ext.Window({
		html: '<div id="help_display" class="x-hidden"></div>',
		layout: 'fit',
		id: 'helpWindow',
		autoScroll: true,
		width: 500,
		height: 300,
		closeAction: 'hide',
		plain: true,
		title: S('help'),
		buttons: [{
			text: S('btn_close'),
			handler: function(){
				win.close();
			}
		}]
	});

	return win;
}
