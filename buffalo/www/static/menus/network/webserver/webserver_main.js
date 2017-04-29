var webserverRenderBefore;

function webserver_processAuth(){
  verify_userMode();
  Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {bufaction:BUFACT_VALIDATE_SESSION} ,
		method: 'GET',
		success: function (result){
		  //Get response from server  
		  rawData = result.responseText;
		  response = Ext.decode(rawData);
		  
		  var success = response.success;
		  if(success){
			resetCookie(response);
			createWebserverSettings();
		  }
		  else failureFunction(response);
		}
	});  
} 


function createWebserverSettings(){
	var webserverForm = webserver_display_mode();
	updateCentralContainer(SYSTEM_RENDER_TO, webserverForm);
	webserver_load_form(webserverForm);
	webserverRenderBefore = ID_PHP_FORM;
	
	var phpForm = php_display_mode();
	addToCentralContainer(SYSTEM_RENDER_TO, phpForm);
	php_load_form(phpForm);
}
