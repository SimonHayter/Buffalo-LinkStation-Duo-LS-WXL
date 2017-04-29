function create_ethFrame_display(){

    var ethFrameSize_1 = new Ext.form.TextField({
        id: 'ethFrameSize_1',
        name:'ethFrameSize_1',
        fieldLabel:S('net_settings_ethFrameSize_1'),
        width: 200,
        readOnly: true
    });

    var ethFrameSize_2 = new Ext.form.TextField({
        id: 'ethFrameSize_2',
        name:'ethFrameSize_2',
        fieldLabel:S('net_settings_ethFrameSize_2'),
        width: 200,
        readOnly: true
    });
    
    
    var editBtn = new Ext.Button({
        id: 'editBtn',
        name:'editBtn',
        text: S('btn_modify_settings'),
        listeners: {click: function(){ 
        //destroy display form
        ethFrameForm_display.destroy();
         
        ethFrameForm_edit = create_ethFrame_edit(); 
        insertToCentralContainer(NETWORK_RENDER_TO, ethFrameForm_edit, ethFrameBefore);
        
	        var ethSize_1 = eth_jsonData.ethFrameSize_1;
	        var ethSize_2 = eth_jsonData.ethFrameSize_2;
         
				   
			var ethFrameSize_1 = Ext.getCmp('ethFrameSize_combo_1');
			var ethFrameSize_2 = Ext.getCmp('ethFrameSize_combo_2');
			ethFrameSize_1.setValue(ethSize_1);
			if(ethSize_2 == 'disabled' || !ethSize_2){
				ethFrameSize_2.disable();
				
			}else{
				ethFrameSize_2.setValue(ethSize_2);
			}
          }
        } 
    });
    
    var jReader =  new Ext.data.JsonReader({
      	root: 'data'
        }, [
        {name: 'ethFrameSize_1'},
        {name: 'ethFrameSize_2'}
    ]);
    
    var jErrReader = new Ext.data.JsonReader( {
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);
    
   var items;
   if(add_eth){
	items = [ethFrameSize_1, ethFrameSize_2];
   }
   else{
	items = [ethFrameSize_1];
   }
   
    var ethFrameForm_display = new Ext.FormPanel({
        id:ID_ETH_SETTINGS_FORM,
		animCollapse: false,
        title: S('net_settings_ethFrameSize_title'),
        cls : 'panel-custBorders',
        itemCls: 'display-label',
        reader : jReader,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
        collapsed: true,
        labelWidth: 160, 
        width: 640,
        buttonAlign: 'left',
        items: items,
        buttons: [editBtn],
		titleCollapse: true

    });
return ethFrameForm_display;
}

function create_ethFrame_edit() { 

  var ehtFrameSizeList = [
    ['1518',S('net_settings_eth_1518')],
    ['4102',S('net_settings_eth_4102')],
    ['7422',S('net_settings_eth_7422')],
    ['9694',S('net_settings_eth_9694')]
  ];
                  
 // ....: Create form ITEMS :....  
    var ethFrameSize_combo_1 = new Ext.form.ComboBox({
        id: 'ethFrameSize_combo_1',
        hiddenName:'ethFrameSize_1',
        fieldLabel: S('net_settings_ethFrameSize_1'),
        store: new Ext.data.SimpleStore({
          fields: ['val', 'opt'],
          data: ehtFrameSizeList
        }),
        displayField:'opt',
        emptyText:'Select One',
        valueField:'val',
        typeAhead: true,
        mode: 'local',
        triggerAction: 'all',
        selectOnFocus:true,
        forceSelection:true,
        listWidth:160,
        width:180,
        editable: false
    });
     var ethFrameSize_combo_2 = new Ext.form.ComboBox({
        id: 'ethFrameSize_combo_2',
        hiddenName:'ethFrameSize_2',
        fieldLabel: S('net_settings_ethFrameSize_2'),
        store: new Ext.data.SimpleStore({
          fields: ['val', 'opt'],
          data: ehtFrameSizeList
        }),
        displayField:'opt',
        emptyText:S('disabled'),
        valueField:'val',
        typeAhead: true,
        mode: 'local',
        triggerAction: 'all',
        selectOnFocus:true,
        forceSelection:true,
        listWidth:160,
        width:180,
        editable: false
    });
       
    
    var saveBtn = new Ext.Button({
        id: 'saveBtn',
        name:'saveBtn',
        text: S('btn_save'),
        listeners: {click: function(){ 

          ethFrame_saveBtnHandler(ethFrameForm_edit);

          }
          
        } 
    });
    
    var cancelBtn = new Ext.Button({
        id: 'cancelBtn',
        name:'cancelBtn',
        text: S('btn_cancel'),
        listeners: {click: function(){ 
        ethFrameForm_edit.destroy();
        ethFrameForm_display = create_ethFrame_display(); 
        insertToCentralContainer(NETWORK_RENDER_TO, ethFrameForm_display, ethFrameBefore);
		
        set_ethFrame_status_display(eth_jsonData);
        ethFrameForm_display.expand();
          }} 
    });
    
    var jReader =  new Ext.data.JsonReader({
      	root: 'data'
        }, [
        {name: 'ethFrameSize_1'},
        {name: 'ethFrameSize_2'}
    ]);
    
    var jErrReader = new Ext.data.JsonReader( {
        root: 'errors',
        successProperty: 'success'
        }, [
        {name: 'id'},
        {name: 'msg'}
    ]);

	var items;
	if(add_eth){
		items = [ethFrameSize_combo_1, ethFrameSize_combo_2];
	}
	else{
		items = [ethFrameSize_combo_1];
	}
	
 // ....: Create Network Sharing Services settings form and add itmes from above  :....
    var ethFrameForm_edit = new Ext.FormPanel({
        id:ID_ETH_SETTINGS_FORM,
		animCollapse: false,
        title: S('net_settings_ethFrameSize_title'),
        cls : 'panel-custBorders',
        reader : jReader,
        errorReader: jErrReader,
        autoHeight: true, 
        collapsible: true,
        collapsed: false,
        labelWidth: 160, 
        width: 640,
        buttonAlign: 'left',
        items: items,
        buttons: [saveBtn, cancelBtn] ,
		titleCollapse: true 
    });
  return ethFrameForm_edit;
}

function ethFrame_saveBtnHandler(ethFrameForm_edit){
  ethFrameForm_edit.form.submit({
        url: '/dynamic.pl', 
        params: {bufaction:BUFACT_SET_EFS_SETTINGS}, 
        waitMsg: S('msg_saving_data'),
        failure:function(form,action) {formFailureFunction(action);},
        success:function(form,action) {
        resetCookie();
        
        //update the json data
        eth_jsonData = ethFrameForm_edit.form.getValues();
        ethFrameForm_edit.destroy();
        ethFrameForm_display = create_ethFrame_display(); 
        insertToCentralContainer(NETWORK_RENDER_TO, ethFrameForm_display,ethFrameBefore);

		
		set_ethFrame_status_display(eth_jsonData);
		if(!add_iscsi){
			getLeftPanelInfo(MENU_INDEX_NETWORK);
		}
		ethFrameForm_display.expand();
        }
    });
}

function set_ethFrame_status_display(eth_jsonData){
	if(add_eth){
		var ethFrame_1=eth_jsonData.ethFrameSize_1;
		var ethFrame_2=eth_jsonData.ethFrameSize_2;

		ethFrame_setDisplayValues(ethFrame_1, 1);
		ethFrame_setDisplayValues(ethFrame_2, 2);
		
	}
	else{
		ethFrame_setDisplayValues(eth_jsonData.ethFrameSize_1, 1);
	}
}

function ethFrame_setDisplayValues(frameSize, eth){
 var ethFrameField
if(eth == 1)
  ethFrameField = Ext.getCmp('ethFrameSize_1');
else
  ethFrameField = Ext.getCmp('ethFrameSize_2');

  var ethSizeVal;
  if (frameSize == '1518')
    ethSizeVal = S('net_settings_eth_1518');
  else if(frameSize == '4102')
    ethSizeVal = S('net_settings_eth_4102');
  else if(frameSize == '7422')
    ethSizeVal = S('net_settings_eth_7422');
  else if(frameSize == '9694') 
    ethSizeVal = S('net_settings_eth_9694');
  else
	ethSizeVal = S('disabled');
	

  ethFrameField.setValue(ethSizeVal);
}

function ethFrame_check_iscsi(){
  if(add_iscsi && IS_ISCSI_RUNNING){
	Ext.getCmp('editBtn').disable();
  }
}