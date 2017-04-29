function create_hddSpindown_form_display_mode() { 
  
    var hddSpindown = new Ext.form.TextField({
      id:'hddSpindown',
      name:'hddSpindown',
      fieldLabel:S('ext_powerMgmnt_hddSpindown'),
      width: 200,
      readOnly: true,
	  itemCls: 'display-label'
    });
	
    var hn_editBtn = new Ext.Button({
        id: 'hn_editBtn',
        name:'hn_editBtn',
        text: S('btn_modify_settings'),
        listeners: {click: function(){ 
          hddSpindown_editBtnHandler(securityForm);
          }
          
        } 
    });

    var jReader =  new Ext.data.JsonReader({
      	root: 'data'
        }, [
        {name: 'clientutility'}
    ]);
    
    var jErrReader = new Ext.data.JsonReader( {
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);

    var securityForm = new Ext.FormPanel({
        id:ID_HDDSPINDOWN_FORM,
        cls : 'panel-custBorders',
        title: S('ext_powerMgmnt_hddSpindown_title'),
        reader : jReader,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
        labelWidth: 160, 
        width: 640,
        buttonAlign: 'left',
        buttons: [hn_editBtn],
        titleCollapse: true,
		animCollapse: false,
		collapsed: true,
        items:[hddSpindown]
    });
   
    return securityForm;
}


function create_hddSpindown_form_edit_mode() { 
  var hddSpindown_on = new Ext.form.Radio({
    id: 'hddSpindown_on',
    hideLabel: true,
    name: 'hddSpindown',
    boxLabel: S('enable') ,
    inputValue: 'on'
  });


  var hddSpindown_off = new Ext.form.Radio({
    id: 'hddSpindown_off',
    hideLabel: true,
    name: 'hddSpindown',
    boxLabel: S('disable') ,
    inputValue: 'off'
  });
    
	
    var hn_saveBtn = new Ext.Button({
        id: 'hn_saveBtn',
        name:'hn_saveBtn',
        text: S('btn_save'),
        listeners: {click: function(){ 
          hddSpindown_saveBtnHandler(securityForm);
          }
          
        } 
    });
    
    var hn_cancelBtn = new Ext.Button({
        id: 'hn_cancelBtn',
        name:'hn_cancelBtn',
        text: S('btn_cancel'),
        listeners: {click: function(){ 
          hddSpindown_display_mode(securityForm);
          }} 
    });
    
    var jReader =  new Ext.data.JsonReader({
      	root: 'data'
        }, [
        {name: 'hddSpindown'}
    ]);
    
    var jErrReader = new Ext.data.JsonReader( {
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);

    var securityForm = new Ext.FormPanel({
        id:ID_HDDSPINDOWN_FORM,
        cls : 'panel-custBorders',
        title: S('ext_powerMgmnt_hddSpindown_title'),
        reader : jReader,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
		animCollapse: false,
        labelWidth: 160, 
        width: 640,
        buttonAlign: 'left',
        buttons: [hn_saveBtn, hn_cancelBtn],
        titleCollapse: true,
        items:[{
	          autoWidth:true,
	          layout: 'column',
	          cls : 'column-custBorders',
	          items:[
	            {cls: 'label',
	            columnWidth:.264,
	            html: S('ext_powerMgmnt_hddSpindown') + ":"       
	            },{
	            cls:'label',
	            columnWidth:.24,
	            items:[hddSpindown_on]
	            },{
	            cls:'label',
	            columnWidth:.49,
	            items:[hddSpindown_off]
	          }]
	        }]
    });
         
   
    return securityForm;
}


function hddSpindown_saveBtnHandler(hnForm){

  hnForm.form.submit({
      url: '/dynamic.pl', 
      params: {bufaction:BUFACT_SET_HDD},
      waitMsg: S('msg_saving_data'),
      failure:function(form,action) {formFailureFunction(action);},
      success:function(form,action) {
        resetCookie();
        hddSpindown_jsonData = hnForm.form.getValues();
		  hnForm.destroy();
		  hddSpindownForm_edit = create_hddSpindown_form_display_mode();
		  insertToCentralContainer(SYSTEM_RENDER_TO, hddSpindownForm_edit, hddRenderBefore);
		  hddSpindownForm_edit.form.setValues(hddSpindown_jsonData);
		  hddSpindown_display(hddSpindown_jsonData);
		  hddSpindownForm_edit.expand(false);
      }
  });  
  
}


function hddSpindown_editBtnHandler(hddSpindownForm_edit){
  hddSpindownForm_edit.destroy();
  hddSpindownForm_display = create_hddSpindown_form_edit_mode();
  insertToCentralContainer(SYSTEM_RENDER_TO, hddSpindownForm_display, hddRenderBefore);
  hddSpindownForm_display.form.setValues(hddSpindown_jsonData);
  radioSelection_hddSpindown(hddSpindown_jsonData);
  hddSpindownForm_display.expand(false); 
}

function hddSpindown_display_mode(hddSpindownForm_display){
  hddSpindownForm_display.destroy();
  hddSpindownForm_edit = create_hddSpindown_form_display_mode();
  insertToCentralContainer(SYSTEM_RENDER_TO, hddSpindownForm_edit, hddRenderBefore);
  hddSpindownForm_edit.form.setValues(hddSpindown_jsonData);
  hddSpindown_display(hddSpindown_jsonData);
  hddSpindownForm_edit.expand(false);
}

function radioSelection_hddSpindown(data){

  selectedMethod = data.hddSpindown;
  var sBoot_on = Ext.getCmp('hddSpindown_on');
  var sBoot_off = Ext.getCmp('hddSpindown_off');

  
  if (selectedMethod == 'on') {
    sBoot_on.setValue(true);
  }
  else{
   sBoot_off.setValue(true);
  }
}

function hddSpindown_display(data){

  selectedMethod = data.hddSpindown;
  sBoot_field = Ext.getCmp('hddSpindown');

  var value;
  if (selectedMethod == 'on') {
    value = S('enabled');
  }
  else{
    value = S('disabled');
  }

	sBoot_field.setValue(value);
}
