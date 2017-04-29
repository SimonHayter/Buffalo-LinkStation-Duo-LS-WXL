var hdd_tool_first_time;
function create_hdd_tool_display_mode() {
	hdd_tool_first_time = true;    
	var hddTool = new Ext.form.TextField({
		id:'hddTool',
		name:'hddTool',
		fieldLabel:S('hdd_tools_conn'),
		width: 200,
		readOnly: true
	});
	
	var hddTool_editBtn = new Ext.Button({
		name:'hddTool_editBtn',
		text: S('btn_modify_settings'),
		listeners: {click: function(){ 
		  hddTool_editBtnHandler(hddToolForm);
		  }
		}
	});

	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'hddTool'} 
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var hddToolForm = new Ext.FormPanel({
		id:ID_HDD_TOOL_FORM,
		animCollapse: false,
		itemCls: 'display-label',
		cls : 'panel-custBorders',
		title: S('hdd_tools_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		collapsed: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [hddTool_editBtn],
		items:[hddTool],
		titleCollapse: true
	});

	return hddToolForm;
}

function create_hdd_tools_form_edit_mode() { 
	var hddTool_on = new Ext.form.Radio({
		id: 'hddTool_on',
		hideLabel: true,
		name: 'hddTool',
		boxLabel: S('hdd_tools_conn_reply'),
		inputValue: 'on',
		listeners: {
			check: function(hddTool_on, checked) {
				if (checked) {
					hddTool_off.setValue(false);
					this.checked = true;
				}
			}
		}
	});

	var hddTool_off = new Ext.form.Radio({
		id: 'hddTool_off',
		hideLabel: true,
		name: 'hddTool',
		boxLabel: S('hdd_tools_conn_no_reply'),
			inputValue: 'off',
			checked: true,
		listeners: {
			check: function(hddTool_off, checked) {
				if (checked) {
					hddTool_on.setValue(false);
					this.checked = true;
					 if(!hdd_tool_first_time){
						Ext.MessageBox.show({
						  width: 500,
						  msg: S('hddTool_warning'),
						  buttons:	Ext.Msg.OK,
						  icon:  Ext.MessageBox.INFO
						});
					
					}
					else{
						hdd_tool_first_time = false;
					}
				}
			}
		}
	});

	var hddTool_saveBtn = new Ext.Button({
		id: 'hddTool_saveBtn',
		name:'hddTool_saveBtn',
		text: S('btn_save'),
		listeners: {click: function(){ 
				hddTool_saveBtnHandler(hddToolForm);
			}
		} 
	});

	var hddTool_cancelBtn = new Ext.Button({
		id: 'hddTool_cancelBtn',
		name:'hddTool_cancelBtn',
		text: S('btn_cancel'),
		listeners: {click: function(){ 
		  hddTool_display_mode(hddToolForm);
		  }} 
	});

	var jReader =  new Ext.data.JsonReader({
	  	root: 'data'
		}, [
		{name: 'hddTool'}
	]);

	var jErrReader = new Ext.data.JsonReader( {
		root: 'errors',
		successProperty: 'success'
		}, [
		{name: 'id'},
		{name: 'msg'}
	]);

	var hddToolForm = new Ext.FormPanel({
		id:ID_HDD_TOOL_FORM,
		animCollapse: false,
		cls : 'panel-custBorders',
		title: S('hdd_tools_form_title'),
		reader : jReader,
		errorReader: jErrReader,
		autoHeight: true, 
		collapsible: true,
		labelWidth: 160, 
		width: 640,
		buttonAlign: 'left',
		buttons: [hddTool_saveBtn, hddTool_cancelBtn],
		items:[{
				autoWidth:true,
				layout: 'column',
				cls : 'column-custBorders',
				items:[{
					cls: 'label',
					columnWidth: .264,
					items:[{
						cls: 'label',
						html:S('hdd_tools_conn') + ':'
						}]
					},{
					  layout:'form', 
					  columnWidth:.15,
					  items:[hddTool_on]
					},
					{
					  layout:'form', 
					  columnWidth:.15,
					  items:[ hddTool_off]
					}
				]
			}],
		titleCollapse: true
	});

	return hddToolForm;
}

function hddTool_saveBtnHandler(hddToolForm){
  hddToolForm.form.submit({
	  url: '/dynamic.pl', 
	  params: {bufaction:BUFACT_SET_HDD_TOOL_SETTINGS},
	  waitMsg: S('msg_saving_data'),
	  failure:function(form,action) {formFailureFunction(action);},
	  success:function(form,action) {
		resetCookie();
		hddTool_jsonData = hddToolForm.form.getValues();
		hddTool_display_mode(hddToolForm);
	  }
  });
}

function hddTool_editBtnHandler(hddTool_edit){
  hddTool_edit.destroy();
  hddTool_display = create_hdd_tools_form_edit_mode();
  insertToCentralContainer(ADMIN_SETTINGS_RENDER_TO, hddTool_display, '');
  hddTool_display.form.setValues(hddTool_jsonData);
  hddTool_display.expand(false);
}

function hddTool_display_mode(hddTool_display){
  hddTool_display.destroy();
  hddTool_edit= create_hdd_tool_display_mode();
  insertToCentralContainer(ADMIN_SETTINGS_RENDER_TO, hddTool_edit, '');
  hddTool_edit.form.setValues(hddTool_jsonData);
  hddTool_format_display();
  hddTool_edit.expand(false);
}

function hddTool_format_display(){
	var hddTool = Ext.getCmp('hddTool');
	if(hddTool_jsonData.hddTool == 'off'){
		hddTool.setValue(S('hdd_tools_conn_no_reply'));
	}
	else{
		hddTool.setValue(S('hdd_tools_conn_reply'));
	}
}
