var nfs_setup_jsonData;
var nfs_folders_jsonData;

var nfsServiceRenderBefore;
var nfsFoldersRenderBefore;
var nfsClientRenderBefore;

function nfs_processAuth(){
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
        	createNFSSettings();
			
          }
         // else winAjaxFailureFunction(response);
          else failureFunction(response);
        }
    });
}

function createNFSSettings(){
	//create forms
	nfsServiceRenderBefore = ID_NFS_FOLDER_SETTINGS_FORM || ID_NFS_FOLDER_SETTINGS_FORM_EDIT;
	nfsFoldersRenderBefore = ID_NFS_CLIENT_SETTINGS_FORM || ID_NFS_CLIENT_SETTINGS_FORM_EDIT;
	nfsClientRenderBefore = '';

	// << NFS Service Setup >>
   var nfsForm = nfs_form_display_mode();
   updateCentralContainer(NETWORK_RENDER_TO, nfsForm);
   
   nfsForm.load({
      url: '/dynamic.pl', 
      params: {bufaction:BUFACT_GET_NFS_SERVICE_SETTINGS}, 
      waitMsg: S('msg_loading_data'),
      failure:function(form,action) {formFailureFunction(action);},
      success:function(form,action) {
        resetCookie();
        resp = Ext.decode(action.response.responseText);
        nfs_setup_jsonData = resp.data[0];
        set_nfs_status_display(nfs_setup_jsonData);
      }
  });  
    // << NFS Shared Folders Setup >> 
	var nfsShFoldForms = nfs_folders_createMainForm();
    addToCentralContainer(NETWORK_RENDER_TO, nfsShFoldForms);
    // << NFS Client Setup >> 
	var nfsClientForms = nfsClient_createMainForm();
    addToCentralContainer(NETWORK_RENDER_TO, nfsClientForms);      
 }
