function create_alertSound_display_mode(){

    var tempErrBox = new Ext.form.TextField({
          id: 'tempErrBox',
          name:'tempErrBox',
          fieldLabel:S('system_alertSound_tempErr'),
         // width: 350,
          readOnly: true
      });
     
    var diskErrBox = new Ext.form.TextField({
        id: 'diskErrBox',
        name:'diskErrBox',
        fieldLabel:S('system_alertSound_diskErr'),
       // width: 350,
        readOnly: true
    });
         
   var fanErrBox = new Ext.form.TextField({
        id: 'fanErrBox',
        name:'fanErrBox',
        fieldLabel:S('system_alertSound_fanErr'),
      //  width: 350,
        readOnly: true
    });
    
	var upsErrBox = new Ext.form.TextField({
        id: 'upsErrBox',
        name:'upsErrBox',
        fieldLabel:S('system_alertSound_upsErr'),
      //  width: 350,
        readOnly: true
    });
    
    var e_editBtn = new Ext.Button({
      id: 'e_editBtn',
      name:'e_editBtn',
      text: S('btn_modify_settings'),
      listeners: {click: function(){ 
        alertSound_display.destroy();
        alertSound_edit = create_alertSound_edit_mode();
        insertToCentralContainer(SYSTEM_RENDER_TO, alertSound_edit, render_alert_form_before); // need to change it for update form id
        alertSound_edit.form.setValues(alertSound_jsonData);
		}}
	});
        
    var jErrReader = new Ext.data.JsonReader( {
        id: 'jErrReader',
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);
  
   var jReader_display =  new Ext.data.JsonReader({
	    id: 'jReader_edit',
      	root: 'data'
        }, [
        {name: 'tempErrBox'},
        {name: 'diskErrBox'},
        {name: 'fanErrBox'},  
        {name: 'upsErrBox'}
    ]);
    
    var alertSound_display = new Ext.FormPanel({
        id:ID_ALERT_SOUND_FORM,
		animCollapse: false,
        title: S('system_alertSound_title'),
        itemCls: 'display-label',
        cls : 'panel-custBorders',
        reader : jReader_display,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
        collapsed: true,
        labelWidth: 160,
        width: 640,
        buttonAlign: 'left',
        buttons: [e_editBtn],
        items:[tempErrBox, diskErrBox, fanErrBox, upsErrBox],
		titleCollapse: true
    });
    return alertSound_display;      
}


function create_alertSound_edit_mode(){
  
    var tempErrBox = new Ext.form.Checkbox({
      id: 'tempErrBox',
      name: 'tempErrBox',
      hideLabel:true,
      boxLabel:S('system_alertSound_tempErr')
    });

    var diskErrBox = new Ext.form.Checkbox({
      id: 'diskErrBox',
      name: 'diskErrBox',
      hideLabel:true,
      boxLabel:S('system_alertSound_diskErr')
    });	
	
	var fanErrBox = new Ext.form.Checkbox({
      id: 'fanErrBox',
      name: 'fanErrBox',
      hideLabel:true,
      boxLabel:S('system_alertSound_fanErr')
    });	
	
	var upsErrBox = new Ext.form.Checkbox({
      id: 'upsErrBox',
      name: 'upsErrBox',
      hideLabel:true,
      boxLabel:S('system_alertSound_upsErr')
    });		
	
	 var jReader_edit =  new Ext.data.JsonReader({
        id: 'jReader_edit',
      	root: 'data'
        }, [
        {name: 'tempErrBox'},
        {name: 'diskErrBox'},
        {name: 'fanErrBox'},
        {name: 'upsErrBox'}
    ]);
	
	
	var jErrReader = new Ext.data.JsonReader( {
	  id: 'jErrReader',
	  root: 'errors',
	  successProperty: 'success'
	  }, [
	  {name: 'id'},
	  {name: 'msg'}
	]);
	var alertSound_saveBtn = new Ext.Button({
        id: 'alertSound_saveBtn',
        name:'alertSound_saveBtn',
        text: S('btn_save'),
        listeners: {click: function(){ 
           alertSound_saveBtnHandler(alert_sound_form);
		   }
          
        } 
    });
    var alertSound_cancelBtn = new Ext.Button({
        id: 'alertSound_cancelBtn',
        name:'alertSound_cancelBtn',
        text: S('btn_cancel'),
        listeners: {click: function(){ 
           alertSound_cancelBtnHandler(alert_sound_form);
           
          }} 
    });
	var legend_alert = S('system_alertSound_legend');
	var alert_sound_form = new Ext.FormPanel({
	  id:ID_ALERT_SOUND_FORM,
	  animCollapse: false,
	  cls : 'panel-custBorders',        
	  title: S('system_alertSound_title'),
	  reader : jReader_edit,
	  errorReader: jErrReader,
	  autoHeight: true, 
	  collapsible: true,
	  collapsed: false,
	  labelWidth: 160, 
	  width: 640,
	  buttonAlign: 'left',
	  buttons: [alertSound_saveBtn, alertSound_cancelBtn],
	  items:[{
	          xtype: 'label', 
	          html: '<p class="label">' + legend_alert +'</p><br>'
			},
			tempErrBox, diskErrBox, fanErrBox, upsErrBox ],
	  titleCollapse: true
	});
	return alert_sound_form;      
}


function alertSound_saveBtnHandler(alert_sound_form_edit){
  alert_sound_form_edit.form.submit({
      url: '/dynamic.pl', 
      params: {bufaction:BUFACTION_SET_ALERT_SOUND}, 
      waitMsg: S('msg_saving_data'),
      failure:function(form,action) {formFailureFunction(action);},
      success:function(form,action) {
        alertSound_jsonData = alert_sound_form_edit.form.getValues();
		alert_sound_form_edit.destroy();
        alert_sound_form_display = create_alertSound_display_mode(); 
        insertToCentralContainer(SYSTEM_RENDER_TO, alert_sound_form_display, render_alert_form_before);
		alertSound_fieldValuesHandler(alert_sound_form_display, alertSound_jsonData);
		alert_sound_form_display.expand(false); 
	}
  });  

}
function alertSound_cancelBtnHandler(alert_sound_form_edit){

	alert_sound_form_edit.destroy();
	alert_sound_form_display = create_alertSound_display_mode(); 
	insertToCentralContainer(SYSTEM_RENDER_TO, alert_sound_form_display, render_alert_form_before);
	alertSound_fieldValuesHandler(alert_sound_form_display, alertSound_jsonData);
	alert_sound_form_display.expand(false); 
}
function alertSound_fieldValuesHandler(alert_sound_form_display, data){
	var tempErrBox = data.tempErrBox;
	var diskErrBox =  data.diskErrBox;
	var fanErrBox = data.fanErrBox;
	var upsErrBox = data.upsErrBox;
	
	var on_val = S('on');
	var off_val = S('off');
	
	if(tempErrBox == 'on'){
		Ext.getCmp('tempErrBox').setValue(on_val);
	}
	else{
		Ext.getCmp('tempErrBox').setValue(off_val);
	}
	
	if(diskErrBox == 'on'){
		Ext.getCmp('diskErrBox').setValue(on_val);
	}
	else{
		Ext.getCmp('diskErrBox').setValue(off_val);
	}
	if(fanErrBox == 'on'){
		Ext.getCmp('fanErrBox').setValue(on_val);
	}
	else{
		Ext.getCmp('fanErrBox').setValue(off_val);
	}	
	if(upsErrBox == 'on'){
		Ext.getCmp('upsErrBox').setValue(on_val);
	}
	else{
		Ext.getCmp('upsErrBox').setValue(off_val);
	}	
}