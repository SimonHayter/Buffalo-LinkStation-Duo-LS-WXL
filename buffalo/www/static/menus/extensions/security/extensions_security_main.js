var sBoot_jsonData;

function extensions_security_processAuth(){
  verify_userMode();
  Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_VALIDATE_SESSION},
		method: 'GET',
		success: function (result){
		  //Get response from server  
		  rawData = result.responseText;
		  response = Ext.decode(rawData);
		  
		  var success = response.success;
		  if(success){
			resetCookie(response);
			createSecuritySettings();
		  }
		  else {
		   formFailureFunction();
		  }
		}
	});  
} 


function createSecuritySettings(){

  //--------------- create & display forms -----------------------------
  sBootForm = create_sBoot_form_display_mode();

  updateCentralContainer(SYSTEM_RENDER_TO, sBootForm);

 // ----------------- load forms ---------------------------------------
  sBootForm.load({
	  url: '/dynamic.pl', 
	  params: {bufaction:BUFACT_GET_SBOOT},
	  waitMsg: S('msg_loading_data'),
	  failure:function(form,action) {formFailureFunction(action);},
	  success:function(form,action) {
		resetCookie();
		resp = Ext.decode(action.response.responseText);
		sBoot_jsonData = resp.data[0];
		sBoot_display_mode(sBoot_jsonData);
	  }
  });


  /*
  hostnameForm.addListener('expand', 
	function(){
	  dTimeForm.collapse(false);
	  langForm.collapse(false);
	});
	
  dTimeForm.addListener('expand', 
	function(){
	  hostnameForm.collapse(false);
	  langForm.collapse(false);
	});    
  langForm.addListener('expand', 
	function(){
	  hostnameForm.collapse(false);
	  dTimeForm.collapse(false);
	});  
	*/
}
