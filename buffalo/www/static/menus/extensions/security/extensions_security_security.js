function create_sBoot_form_display_mode() { 
  
    var sBoot = new Ext.form.TextField({
      id:'sBoot',
      name:'sBoot',
      fieldLabel:S('ext_security_secureBoot'),
      width: 200,
      readOnly: true,
	  itemCls: 'display-label'
    });
	
    var hn_editBtn = new Ext.Button({
        id: 'hn_editBtn',
        name:'hn_editBtn',
        text: S('btn_modify_settings'),
        listeners: {click: function(){ 
          sBootForm_editBtnHandler(securityForm);
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
        id:ID_SERUCITY_FORM,
        cls : 'panel-custBorders',
        title: S('ext_security_secureBoot_title'),
        reader : jReader,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
        labelWidth: 160, 
        width: 640,
        buttonAlign: 'left',
        buttons: [hn_editBtn],
        titleCollapse: true,
        items:[sBoot]
    });
   
    return securityForm;
}


function create_sBoot_form_edit_mode() { 
  var sBoot_on = new Ext.form.Radio({
    id: 'sBoot_on',
    hideLabel: true,
    name: 'sBoot',
    boxLabel: S('enable') ,
    inputValue: 'on'
  });


  var sBoot_off = new Ext.form.Radio({
    id: 'sBoot_off',
    hideLabel: true,
    name: 'sBoot',
    boxLabel: S('disable') ,
    inputValue: 'off'
  });
    
	 var masterKeyBtn = new Ext.Button({
        id: 'masterKeyBtn',
        name:'masterKeyBtn',
        text: S('ext_security_secureBoot_createKey'),
        listeners: {click: function(){ 
          }
        } 
    });
    
	 var subKeyBtn = new Ext.Button({
        id: 'subKeyBtn',
        name:'subKeyBtn',
        text: S('ext_security_secureBoot_createKey'),
        listeners: {click: function(){ 
          }
        } 
    });
    	
	
    var hn_saveBtn = new Ext.Button({
        id: 'hn_saveBtn',
        name:'hn_saveBtn',
        text: S('btn_save'),
        listeners: {click: function(){ 
          security_saveBtnHandler(securityForm);
          }
          
        } 
    });
    
    var hn_cancelBtn = new Ext.Button({
        id: 'hn_cancelBtn',
        name:'hn_cancelBtn',
        text: S('btn_cancel'),
        listeners: {click: function(){ 
          sBoot_display_mode(securityForm);
          }} 
    });
    
    var jReader =  new Ext.data.JsonReader({
      	root: 'data'
        }, [
        {name: 'sBoot'}
    ]);
    
    var jErrReader = new Ext.data.JsonReader( {
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);

    var securityForm = new Ext.FormPanel({
        id:ID_NAME_FORM,
        cls : 'panel-custBorders',
        title: S('ext_security_secureBoot_title'),
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
	            html: S('ext_security_secureBoot') + ":"       
	            },{
	            cls:'label',
	            columnWidth:.24,
	            items:[sBoot_on]
	            },{
	            cls:'label',
	            columnWidth:.49,
	            items:[sBoot_off]
	          }]
	        },
			{
	          autoWidth:true,
	          layout: 'column',
	          cls : 'column-custBorders',
	          items:[
	            {cls: 'label',
	            columnWidth:.264,
	            html: S('ext_security_secureBoot_masterKey') + ":"       
	            },{
	            cls:'label',
	            columnWidth:.24,
	            items:[masterKeyBtn]
	            }]
	        },
			{
	          autoWidth:true,
	          layout: 'column',
	          cls : 'column-custBorders',
	          items:[
	            {cls: 'label',
	            columnWidth:.264,
	            html: S('ext_security_secureBoot_subKey') + ":"       
	            },{
	            cls:'label',
	            columnWidth:.24,
	            items:[subKeyBtn]
	            }]
	        }
			]
    });
         
   
    return securityForm;
}


function security_saveBtnHandler(hnForm){

  hnForm.form.submit({
      url: '/dynamic.pl', 
      params: {bufaction:BUFACT_SET_SBOOT},
      waitMsg: S('msg_saving_data'),
      failure:function(form,action) {formFailureFunction(action);},
      success:function(form,action) {
        resetCookie();
        sBoot_jsonData = hnForm.form.getValues();
        sBoot_display_mode(hnForm);
      }
  });  
  
}


function sBootForm_editBtnHandler(sBootForm_edit){
  sBootForm_edit.destroy();
  sBootForm_display = create_sBoot_form_edit_mode();
  updateCentralContainer(SYSTEM_RENDER_TO, sBootForm_display);
  sBootForm_display.form.setValues(sBoot_jsonData);
  radioSelection_sBoot(sBoot_jsonData);
  sBootForm_display.expand(false); 
}

function sBoot_display_mode(sBootForm_display){
  sBootForm_display.destroy();
  sBootForm_edit = create_sBoot_form_display_mode();
  updateCentralContainer(SYSTEM_RENDER_TO, sBootForm_edit);
  sBootForm_edit.form.setValues(sBoot_jsonData);
  sBoot_display(sBoot_jsonData);
  sBootForm_edit.expand(false);
}

function radioSelection_sBoot(data){

  selectedMethod = data.sBoot;
  var sBoot_on = Ext.getCmp('sBoot_on');
  var sBoot_off = Ext.getCmp('sBoot_off');

  
  if (selectedMethod == 'on') {
    sBoot_on.setValue(true);
  }
  else{
   sBoot_off.setValue(true);
  }
}

function sBoot_display(data){

  selectedMethod = data.sBoot;
  sBoot_field = Ext.getCmp('sBoot');

  var value;
  if (selectedMethod == 'on') {
    value = S('enabled');
  }
  else{
    value = S('disabled');
  }

	sBoot_field.setValue(value);
}
