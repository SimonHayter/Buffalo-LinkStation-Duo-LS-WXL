var printserver_jsonData;

function extensions_printserver_processAuth(){
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
            createPrintserverSettings();
          }
          else {
           formFailureFunction();
          }
        }
    });  
} 


function createPrintserverSettings(){

  //--------------- create & display forms -----------------------------
  printserverForm = create_printserver_form_display_mode();

  updateCentralContainer(SYSTEM_RENDER_TO, printserverForm);

 // ----------------- load forms ---------------------------------------
  printserverForm.load({
      url: '/dynamic.pl', 
      params: {bufaction:BUFACT_GET_PRINTSERVER},
      waitMsg: S('msg_loading_data'),
      failure:function(form,action) {formFailureFunction(action);},
      success:function(form,action) {
        resetCookie();
        resp = Ext.decode(action.response.responseText);
        printserver_jsonData = resp.data[0];
        printserver_format_display(printserver_jsonData);
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
