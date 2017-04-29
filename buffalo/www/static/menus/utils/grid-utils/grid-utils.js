function removeGridMember(id, all) {
	var grid;
	var selModel;
	var selectedRecords;
	var msg;
	var jsonStore;

	grid = Ext.getCmp(id); // get front Grid object

	if (!all) {
		selModel = grid.getSelectionModel(); // get selection model object
		selectedRecords = selModel.getSelections(); // get selected records in front grid
		if (selectedRecords.length == 0) {
			msg = S('qTip_select_first');
			msgBox('', msg, Ext.MessageBox.OK, Ext.MessageBox.ERROR);
			return 0;
		}

		jsonStore = grid.getStore(); // get front json store object
		var i;
		for (i = 0; i < selectedRecords.length; i++) {
			jsonStore.remove(selectedRecords[i]); // remove records of front grid
		}
	}
	else {
		jsonStore = grid.getStore();
		jsonStore.removeAll();
	}

	return 1;
}

// this function can only take care of one field(column) of the grid
function gridDataAsJSON(gridId, fieldToRetrieve) {
	grid = Ext.getCmp(gridId);
	jsonStore = grid.getStore();
	records = jsonStore.getRange();

	var dataToParse = new Array(records.length);
	var i;
	for (i = 0; i < records.length; i++) {
//		dataToParse[i] = records[i].data. + fieldToRetrieve;
	}
	jsonData = Ext.util.JSON.encode(dataToParse);

	return jsonData;
}

// updates the searchbox on the grid toolbar
function update_combo_search(grid, combo, dataIndex) {
	var store = grid.getStore();
	var newRecords = store.getRange(0, store.getCount());

	var names = new Array();
	var i;
	for (i = 0; i < newRecords.length; i++) {
		names[i] = new Array(2);
		names[i][0] = i;
		names[i][1] = newRecords[i].get(dataIndex);
	}
	var store = combo.store;
	store.loadData(names);
}
