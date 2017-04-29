function create_reboot_display_mode(){

  var reboot_formatBtn = new Ext.Button({
	id: 'reboot_formatBtn',
	name:'reboot_formatBtn',
	text: S('btn_reboot_linkstation'),
	listeners: {click: function(){ rebootBtnHandler(reboot_form_title);}} 
  }); 

  var warning = S('system_reboot_warning');
  
  var jErrReader = new Ext.data.JsonReader( {
	  id: 'jErrReader',
	  root: 'errors',
	  successProperty: 'success'
	  }, [
	  {name: 'id'},
	  {name: 'msg'}
	]);

  var reboot_form_title = new Ext.FormPanel({
	  id: ID_REBOOT_FORM,
	  animCollapse: false,
	  cls : 'panel-custBorders',		
	  title: S('system_reboot_form_title'),
	  errorReader: jErrReader,
	  autoHeight: true, 
	  collapsible: true,
	  collapsed: true,
	  labelWidth: 160, 
	  width: 640,
	  buttonAlign: 'left',
	  buttons: [reboot_formatBtn],
	  items:[{
		  xtype: 'label', 
		  html: '<p class="label">' + warning +'</p><br>'
	   }],
	  titleCollapse: true
  });
  return reboot_form_title;
}

function rebootBtnHandler(reboot_form_title) {
  msg = S('system_reboot_warning_popup');
  emptyList = true;
  buttons = Ext.MessageBox.OKCANCEL;
  title = S('warning_box_title');
  icon = Ext.MessageBox.QUESTION;
		   
  Ext.MessageBox.show({
	title: title,
	msg: msg,
	buttons: buttons,
	icon: icon,
	fn: function(btn){
	  if(emptyList && btn == 'ok') { 
	  
		reboot_form_title.form.submit({
			url: '/dynamic.pl', 
			params: {bufaction: BUFACT_REBOOT, action: ACTION_REBOOT}, 
			//params: {bufaction: BUFACT_REBOOT }, 
			failure:function(form,action) {formFailureFunction(action);},
			success:function(form,action) {
			  var title =  S('rebooting');
			  var titleFormatted = '<p class="title"><img src="'+WARNING_IMG+'" /> &nbsp ' + title + '</p><br>';
			  var msg = S('reboot_after');
			  var msgFormatted = '<p class="msg">' + msg + '</p>'
			  updateHtmlToContainer(SYSTEM_RENDER_TO, titleFormatted);
			  addHtmlToContainer(SYSTEM_RENDER_TO, msgFormatted);
			  	if(add_iscsi){
					show_menus_submenus_disabled_iscsi();
				}else{
					show_menus_submenus_disabled();
				}
				highlight_sub_menu(selected_sub_menu);
				highlight_menu(selected_menu);
			}
		});
	  }
	}
  });

};

