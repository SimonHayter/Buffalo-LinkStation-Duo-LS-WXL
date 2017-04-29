Ext.ux.RadioSelectionModel = function (config) {
	Ext.ux.RadioSelectionModel.superclass.constructor.call(this, config);
	this.renderer = function (v, p, record) {
		var checked = record === this.selections.get(0);
		var retval = '<div class="ux-radio">' + '<input type="radio" name="' + this.id + '"' + (checked ? 'checked="checked"' : '') + '></div>';
		return retval;
	}.createDelegate(this);
};

Ext.extend(Ext.ux.RadioSelectionModel, Ext.grid.RowSelectionModel, {
	id: 'radio',
	header: '<div> </div>',
	width: 20,
	height: 5,
	sortable: false,
	fixed: true,
	dataIndex: '',
	singleSelect: true,
	selectRow: function (index) {
		// call parent
		Ext.ux.RadioSelectionModel.superclass.selectRow.apply(this, arguments);

		// check radio
		var row = Ext.fly(this.grid.view.getRow(index));
		if (row) {
			row.child('input[type=radio]').dom.checked = true;
		}
	},
	lock: function (index) {
		// call parent
//		Ext.ux.RadioSelectionModel.superclass.lock.apply(this, arguments);

		// disable radio
		var row = Ext.fly(this.grid.view.getRow(index));
		if (row) {
			row.child('input[type=radio]').dom.disabled = true;
		}
	},
	unlock: function (index) {
		// call parent
		Ext.ux.RadioSelectionModel.superclass.unlock.apply(this, arguments);

		// enable radio
		var row = Ext.fly(this.grid.view.getRow(index));
		if (row) {
			row.child('input[type=radio]').dom.disabled = false;
		}
	}
});
