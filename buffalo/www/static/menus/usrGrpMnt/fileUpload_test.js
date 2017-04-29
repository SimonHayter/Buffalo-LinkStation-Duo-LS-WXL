function fileUpdateForm(){

	var csv_file = new Ext.form.TextField({
		  name: 'file',
		hideLabel: true,
		width: 200,
		  height: 23,
		  inputType:'file'
	});
	
	var csv_import = new Ext.Button({
	  id: 'csv_import',
	  text: 'Import',
	  handler: function(){
			fileUpdateFormHandler_ft(userForm2);
	  }
   });
	
	 var userForm2 = new Ext.FormPanel({
		allowDomMove : false,
		id: 'myForm',
		labelAlign: 'left',
		header: false,
		bodyStyle:'padding:5px',
		width: 300,
		items: [csv_file, csv_import],
		  fileUpload:true,
		  method:'POST'
	});
	  userForm.render(document.body);

}
function fileUpdateFormHandler_ft(userForm2){
	userForm2.form.submit({
		url: '/import.pl', 
		waitMsg: S('uploading'),
		failure:function(form,action){
		},
		success:function(form,action) {
			  resetCookie();
		}
	});
}
