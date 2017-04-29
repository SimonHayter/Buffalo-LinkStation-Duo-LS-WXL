function create_printserver_form_display_mode() { 
	var warn_usedby_usbdev = S('Warn_Usedby_USBDevServer');
	var isHide = true;
	if (deviceservermode == 'on') {
		isHide = false;
	}

	var printserver = new Ext.form.TextField({
		id: 'printserver',
		name: 'printserver',
		fieldLabel:S('printserver_form_title'),
		width: 400,
		readOnly: true
	}); 

	var hn_editBtn = new Ext.Button({
		id: 'hn_editBtn',
		name:'hn_editBtn',
		text: S('btn_modify_settings'),
		listeners: {click: function(){ 
		  printserver_editBtnHandler(printserverForm);
		  }
		  
		} 
	});

	var hn_delBtn = new Ext.Button({
		id: 'hn_delBtn',
		name:'hn_delBtn',
		text: S('btn_delete_queue'),
		listeners: {click: function(){ 
		  printserver_delBtnHandler(printserverForm);
		  }
		  
		} 
	});

	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'printserver'}
	]);
	
	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var printserverForm = new Ext.FormPanel({
		id:ID_PRINTSERVER_FORM,
		cls: 'panel-custBorders',
		itemCls: 'display-label',
		title: S('printserver_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_editBtn, hn_delBtn],
		titleCollapse: true,
		items:[
			printserver,
			{
			autoWidth: true,
			layout: 'column',
			id: 'warn_usedby_usbdev',
			name: 'warn_usedby_usbdev',
			cls : 'column-custBorders',
			items: [{
				cls: 'warnings',
				columnWidth: 1.0,
				html: warn_usedby_usbdev
			}],
			hideMode: 'display',
			hidden : isHide,
			hideLabel: isHide
		}]
	});
   
	return printserverForm;
}


function create_printserver_form_edit_mode() { 
  var printserver_on = new Ext.form.Radio({
	id: 'printserver_on',
	hideLabel: true,
	name: 'printserver',
	boxLabel: S('enable'),
	inputValue: 'on'
  });

  var printserver_off = new Ext.form.Radio({
	id: 'printserver_off',
	hideLabel: true,
	name: 'printserver',
	boxLabel: S('disable'),
	inputValue: 'off'
  });
	
	var hn_saveBtn = new Ext.Button({
		id: 'hn_saveBtn',
		name:'hn_saveBtn',
		text: S('btn_save'),
		listeners: {click: function(){ 
		  printserver_saveBtnHandler(printserverForm);
		  }
		  
		} 
	});
	
	var hn_cancelBtn = new Ext.Button({
		id: 'hn_cancelBtn',
		name:'hn_cancelBtn',
		text: S('btn_cancel'),
		listeners: {click: function(){ 
		  printserver_display_mode(printserverForm);
		  }} 
	});
	
/*	  var hn_delBtn = new Ext.Button({
		id: 'hn_delBtn',
		name:'hn_delBtn',
		text: S('btn_delete_queue'),
		listeners: {click: function(){ 
		  printserver_delBtnHandler(printserverForm);
		  }
		  
		} 
	});
*/
	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'printserver'}
	]);
	
	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var printserverForm = new Ext.FormPanel({
		id:ID_PRINTSERVER_FORM,
		cls : 'panel-custBorders',
		title: S('printserver_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [hn_saveBtn, hn_cancelBtn/*, hn_delBtn*/],
		titleCollapse: true,
		items:[{
			autoWidth: true,
			layout: 'column',
			cls : 'column-custBorders',
			items: [{
				cls: 'label',
				columnWidth: .264,
				html: S('printserver_form_title') + ":"
			},{
				layout: 'form',
				columnWidth: .368,
				items: [printserver_on]
			},{
				layout:'form',
				columnWidth:.368,
				items:[printserver_off]
			}]
		}]
	});
		 
   
	return printserverForm;
}


function printserver_saveBtnHandler(psForm){

  psForm.form.submit({
	  url: '/dynamic.pl', 
	  params: {bufaction:BUFACT_SET_PRINTSERVER},
	  waitMsg: S('msg_saving_data'),
	  failure:function(form,action) {formFailureFunction(action);},
	  success:function(form,action) {
		resetCookie();
		printserver_jsonData = psForm.form.getValues();
		printserver_display_mode(psForm);
		printserver_format_display(printserver_jsonData);
	  }
  });  
}


function printserver_editBtnHandler(psForm_edit){
  psForm_edit.destroy();
  psForm_display = create_printserver_form_edit_mode();
  insertToCentralContainer(SYSTEM_RENDER_TO, psForm_display, ID_PRINTSERVER_FORM);
  psForm_display.form.setValues(printserver_jsonData);
  radioSelection_printserver(printserver_jsonData);
  psForm_display.expand(true); 
}

function printserver_display_mode(psForm_display){
  psForm_display.destroy();
  psForm_edit = create_printserver_form_display_mode();
  insertToCentralContainer(SYSTEM_RENDER_TO, psForm_edit, ID_PRINTSERVER_FORM);
  printserver_format_display(printserver_jsonData);
  psForm_edit.expand(true);
}

function printserver_delBtnHandler(psForm_edit){
  psForm_edit.form.submit({
	  url: '/dynamic.pl', 
	  params: {bufaction:BUFACT_DEL_PRINTSERVER},
	  waitMsg: S('deleting_queue'),
	  failure:function(form,action) {
	   msgBox_usingDictionary('printserver_job_title', 'printserver_job_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
	  formFailureFunction(action);},
	  success:function(form,action) {
		resetCookie();
		msgBox_usingDictionary('printserver_job_title', 'printserver_job_finish', Ext.Msg.OK, Ext.MessageBox.INFO);
	  }
  });
}

function radioSelection_printserver(data){
  selectedMethod = data.printserver;
  printserverRadioEn = Ext.getCmp('printserver_on');
  printserverRadioDis = Ext.getCmp('printserver_off');

  if (selectedMethod == 'on') {
	printserverRadioEn.setValue(true);
  }
  else{
	printserverRadioDis.setValue(true);
  }

}

function printserver_format_display(data) {
	var delBtn = Ext.getCmp('hn_delBtn');
	var printserver = Ext.getCmp('printserver');

	if (data.printserver == 'off') {
		delBtn.disable();
		printserver.setValue(S('disabled'));
	}
	else{
		printserver.setValue(S('enabled'));
	}
}
