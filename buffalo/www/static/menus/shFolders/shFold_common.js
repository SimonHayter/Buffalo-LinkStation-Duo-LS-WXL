function shFolders_renderPermissions(v){
  var value;
  if(v){
	value = S("sh_field_" + v);
  }
  return value;
}

/*
function shFolders_popup_shFolders_renderPermissions(v, meta, record, rowIndex){
	var value;
	value = shFolders_renderPermissions(v);	
	return value;
}
*/

function shFolders_headerRenderer(v, unused,r, rowIndex, colIndex, ds){
  var value = S(v);
  return value;
}

// This function adds the new users froom the poup grid to the front grid
function match_existent(storeFront, storePopup){
	
}

function create_editor_combo(){
  var ro = S('sh_field_ro');
  var rw = S('sh_field_rw');
  // List of permissions for combo box
//  permissionsList = [['0',ro],['1',rw]];
  var permissionsList = [['ro',ro],['rw',rw]];
  
  var permStore = new Ext.data.SimpleStore({
    data: permissionsList,
    fields: ['val', 'opt']
  }); 
  
  //Creating permissions combo for grid
  var permissionsCombo = new Ext.form.ComboBox({
    //id: 'share_perm_combo',
    hiddenName: 'permissions',
   typeAhead: true,
   triggerAction: 'all',
   mode: 'local',
   store: permStore,
   displayField: 'opt',
   valueField: 'val',
   lazyRender:true,
   listClass: 'x-combo-list-small',
   editable: false
  });

  return permissionsCombo;
}

/*  Description: Filters the grid content based on 'valueToSearch' passed
*/

function shFolders_findByName(field, valueToSearch, gridId){
  // get Grid object
  domainGrid = Ext.getCmp(gridId);
  domainStore = domainGrid.getStore();
  domainStore.filter(field, valueToSearch, true, false);
}
/*  Description: Displays all the existing grid records
*/
function shFolders_removeSearchFilter(gridId){
  // get Grid object
  domainGrid = Ext.getCmp(gridId);
  domainStore = domainGrid.getStore();
  if(domainStore.isFiltered()){
    domainStore.clearFilter(false);
  }
}
/*  Description: Filters the grid content based on the search box value
*/
function shFolders_filterRecords(gridId){
  //search box value
  valueToSearch = Ext.getCmp(ID_SH_FOLD_POPUP_DOMAIN_SEARCH).getRawValue();
  
  if(!valueToSearch){ //
    shFolders_removeSearchFilter(gridId);
    toggleRemoveFilterButton = Ext.getCmp(ID_SH_FOLD_POPUP_REMOVE_FILTER_BTN).toggle(false);
    searchField = Ext.getCmp(ID_SH_FOLD_POPUP_DOMAIN_SEARCH),
    searchField.clearValue();
  }
  else{
    shFolders_findByName('name', valueToSearch,  gridId);
    toggleRemoveFilterButton = Ext.getCmp(ID_SH_FOLD_POPUP_REMOVE_FILTER_BTN).toggle(true);
  }
}
/*  Description: Assign different functionalities to some special keys in the domain search box

function activateSpecialKey(field, e, combo, gridId) {
  if (e.getKey() == e.ENTER) {
      shFolders_filterRecords(gridId);
  }
  else if(e.getKey() == e.DOWN){
    combo.expand();
  }
}
*/

/*  Description: Get the Local  users /groups selected in the popup grid and updates the front grid
*/
function shFolders_submitPopupHandler(popupWin, id, type){
  var grid;
  var sm;
  var selectedRecords;
  var frontGrid;
  var store;

  // .: update front grid :.
  frontGrid = Ext.getCmp(id + type); //  get front Grid object
  frontStore = frontGrid.getStore();  //  get front json store object
  var popupGrid = Ext.getCmp('popupGrid'); //  get grid object
  var sm = popupGrid.getSelectionModel(); //  get selection model Object
  var records_popup = sm.getSelections();  //  get records selected in popup grid
 
   new_size = records_popup.length;
	dataToParse_local_users = new Array(new_size);
	var found;
	var indexExist;
	for (var i = 0; i < new_size; i++) {
		name = records_popup[i].data.name;
		permissions = records_popup[i].data.permissions;
		
		record = frontStore.getById(name);
		
		if(record){
			//frontStore.remove(record);
			permissions = record.get('permissions'); // keep permissions of front grid			
			indexOf = frontStore.indexOf(record);
			frontStore.data.removeAt(indexOf);
		}
		dataToParse_local_users[i] = {"id": name, "name" : name, "permissions": permissions};
	}

  var new_data = {"data": dataToParse_local_users};

  frontStore.loadData(new_data, true);
  frontStore.sort('name', 'ASC');

	var arrayOfRecords = frontStore.getRange();
	udpateCombo(arrayOfRecords, type);

  popupWin.close();
  addMemberBtn = Ext.getCmp('addMember' + type);
  addMemberBtn.enable();
}
