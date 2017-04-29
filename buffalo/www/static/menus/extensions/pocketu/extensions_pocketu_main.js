var pocketUjsonData;

function extensions_pocketU_processAuth(){
	verify_userMode();
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_VALIDATE_SESSION
		},
		method: 'GET',
		success: function (result){
			// Get response from server  
			rawData = result.responseText;
			response = Ext.decode(rawData);

			var success = response.success;
			if (success) {
				resetCookie(response);
				createPocketUSettings();
			}
			else {
				formFailureFunction();
			}
		}
	});
}

function createPocketUSettings(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: BUFACT_GET_POCKETU
		},
		method: 'GET',
		success: function (result){
			var MaskElems = Ext.DomQuery.select('.ext-el-mask');
			Ext.get(MaskElems).hide();

			resetCookie();
			var resp = Ext.decode(result.responseText);
			pocketUjsonData = resp.data[0];
			
			pocketUFolderForm = createPocketUFolderFormDisplayMode();
			pocketUForm = createPocketUFormDisplayMode();

			updateCentralContainer(SYSTEM_RENDER_TO, pocketUFolderForm);
			addToCentralContainer(SYSTEM_RENDER_TO, pocketUForm);
			
//			pocketUEditBtnHandler(pocketUForm);
			formatDisplayPocketU(pocketUjsonData);
		},
		failure: function(result) {
			formFailureFunction();
		}
	});
}

function pocketUValidateSession(){
	Ext.Ajax.request({
		url: '/dynamic.pl',
		params: {
			bufaction: "validateSession"
		},
		method: 'GET',
		success: function (result){
			rawData = result.responseText;
			response = Ext.decode(rawData);
			
			var success = response.success;
			if (success) {
				resetCookie(response);
			}
			else {
				formFailureFunction();
			}
		}
	})
}

