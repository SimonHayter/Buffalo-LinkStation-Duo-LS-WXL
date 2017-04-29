/*
  Customized
*/

Ext.UpdateManager.defaults.indicatorText = '<div class="loading-indicator">';
Ext.UpdateManager.defaults.indicatorText += S('data_loading') +'</div>';

if(Ext.View){
  Ext.View.prototype.emptyText = "";
}

if(Ext.grid.Grid){
  Ext.grid.Grid.prototype.ddText = "{0}" + S('data_select_row');
}

if(Ext.TabPanelItem){
  Ext.TabPanelItem.prototype.closeText = S('tab_close');
}

if(Ext.form.Field){
  Ext.form.Field.prototype.invalidText = S('field_invalid');
}

if(Ext.LoadMask){
  Ext.LoadMask.prototype.msg = S('data_loading');
}

Date.monthNames = [
 S('date_months_jan'),
 S('date_months_feb'),
 S('date_months_mar'),
 S('date_months_apr'),
 S('date_months_may'),
 S('date_months_jun'),
 S('date_months_jul'),
 S('date_months_aug'),
 S('date_months_sep'),
 S('date_months_oct'),
 S('date_months_nov'),
 S('date_months_dec')
];

Date.getShortMonthName = function(month) {
  return Date.monthNames[month].substring(0, 3);
};

Date.monthNumbers = {
  Jan : 0,
  Feb : 1,
  Mar : 2,
  Apr : 3,
  May : 4,
  Jun : 5,
  Jul : 6,
  Aug : 7,
  Sep : 8,
  Oct : 9,
  Nov : 10,
  Dec : 11
};

Date.getMonthNumber = function(name) {
  return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
};

Date.dayNames = [
 S('Sun'),
 S('Mon'),
 S('Tue'),
 S('Wed'),
 S('Thu'),
 S('Fri'),
 S('Sat')
];

Date.getShortDayName = function(day) {
  return Date.dayNames[day].substring(0, 3);
};

if(Ext.MessageBox){
  Ext.MessageBox.buttonText = {
	ok	   :  S('btn_ok'),
	cancel :  S('btn_cancel'),
	yes    :  S('btn_yes'),
	no	   :  S('btn_no')
  };
}

if(Ext.util.Format){
  Ext.util.Format.date = function(v, format){
	if(!v) return "";
	if(!(v instanceof Date)) v = new Date(Date.parse(v));
	return v.dateFormat(format || S('date_format'));
  };
}

if(Ext.DatePicker){
  Ext.apply(Ext.DatePicker.prototype, {
	todayText		  : S('date_picker_todayText'),
	minText 		  : S('date_picker_minText'),
	maxText 		  : S('date_picker_maxText'),
	disabledDaysText  : "",
	disabledDatesText : "",
	monthNames		  : Date.monthNames,
	dayNames		  : Date.dayNames,
	nextText		  : S('date_picker_nextText'),
	prevText		  : S('date_picker_prevText'),
	monthYearText	  : S('date_picker_monthYearText'),
	
	todayTip		  : "{0} " + S('date_picker_todayTip'),
	format			  : S('date_format'),
	okText			  : "&#160;OK&#160;",
	cancelText		  : S('btn_cancel'),
	startDay		  : 0
  });
}

if(Ext.PagingToolbar){
  Ext.apply(Ext.PagingToolbar.prototype, {
	beforePageText : S('paging_tbar_beforePageText'),
	afterPageText  : S('paging_tbar_afterPageText') + " {0}",
	firstText	   : S('paging_tbar_firstText'),
	prevText	   : S('paging_tbar_prevText'),
	nextText	   : S('paging_tbar_nextText'),
	lastText	   : S('paging_tbar_lastText'),
	refreshText    : S('paging_tbar_refreshText'),
	displayMsg	   : S('paging_tbar_displayMsg_disp') + " {0} - {1} " + 
					 S('paging_tbar_displayMsg_of') + " {2}",
	emptyMsg	   : S('paging_tbar_nextText')
  });
}

if(Ext.form.TextField){
  Ext.apply(Ext.form.TextField.prototype, {
	minLengthText : S('textfield_minLengthText') + " {0}",
	maxLengthText : S('textfield_maxLengthText') +" {0}",
	blankText	  : S('textfield_blankText'),
	regexText	  : "",
	emptyText	  : null
  });
}

if(Ext.form.NumberField){
  Ext.apply(Ext.form.NumberField.prototype, {
	minText : S('numberField_minText') + "{0}",
	maxText : S('numberField_maxText') + "{0}",
	nanText : "{0} " + S('numberField_nanText') 
  });
}

if(Ext.form.DateField){
  Ext.apply(Ext.form.DateField.prototype, {
	disabledDaysText  : S('dateField_disabledDaysText'),
	disabledDatesText : S('dateField_disabledDatesText'),
	minText 		  : S('dateField_minText') + " {0}",
	maxText 		  : S('dateField_maxText') + " {0}",
	invalidText 	  : "{0} " + S('dateField_invalidText') + " {1}",
	format			  : S('date_format')
	//,altFormats		  : S('date_altFormats')
  });
}

if(Ext.form.ComboBox){
  Ext.apply(Ext.form.ComboBox.prototype, {
	loadingText 	  : S('data_loading'),
	valueNotFoundText : undefined
  });
}

if(Ext.form.VTypes){
  Ext.apply(Ext.form.VTypes, {
	emailText	 : S('email_emailText'),
	urlText 	 : S('email_urlText'),
	alphaText	 : S('email_alphaText'),
	alphanumText : S('email_alphanumText')
  });
}

if(Ext.form.HtmlEditor){
  Ext.apply(Ext.form.HtmlEditor.prototype, {
	createLinkText : S('email_urlText'),
	buttonTips : {
	  bold : {
		title: S('html_bold_title'),
		text: S('html_bold_text'),
		cls: 'x-html-editor-tip'
	  },
	  italic : {
		title: S('html_italic_title'),
		text: S('html_italic_text'),
		cls: 'x-html-editor-tip'
	  },
	  underline : {
		title: S('html_underline_title'),
		text: S('html_underline_text'),
		cls: 'x-html-editor-tip'
	  },
	  increasefontsize : {
		title: S('html_increasefontsize_title'),
		text: S('html_increasefontsize_text'),
		cls: 'x-html-editor-tip'
	  },
	  decreasefontsize : {
		title: S('html_decreasefontsize_title'),
		text: S('html_decreasefontsize_text'),
		cls: 'x-html-editor-tip'
	  },
	  backcolor : {
		title: S('html_backcolor_title'),
		text: S('html_backcolor_text'),
		cls: 'x-html-editor-tip'
	  },
	  forecolor : {
		title: S('html_forecolor_title'),
		text: S('html_forecolor_text'),
		cls: 'x-html-editor-tip'
	  },
	  justifyleft : {
		title: S('html_justifyleft_title'),
		text: S('html_justifyleft_text'),
		cls: 'x-html-editor-tip'
	  },
	  justifycenter : {
		title: S('html_justifycenter_title'),
		text: S('html_justifycenter_text'),
		cls: 'x-html-editor-tip'
	  },
	  justifyright : {
		title: S('html_justifyright_title'),
		text: S('html_justifyright_text'),
		cls: 'x-html-editor-tip'
	  },
	  insertunorderedlist : {
		title: S('html_insertunorderedlist_title'),
		text: S('html_insertunorderedlist_text'),
		cls: 'x-html-editor-tip'
	  },
	  insertorderedlist : {
		title: S('html_insertorderedlist_title'),
		text: S('html_insertorderedlist_text'),
		cls: 'x-html-editor-tip'
	  },
	  createlink : {
		title: S('html_createlink_title'),
		text: S('html_createlink_text'),
		cls: 'x-html-editor-tip'
	  },
	  sourceedit : {
		title: S('html_sourceedit_title'),
		text: S('html_sourceedit_text'),
		cls: 'x-html-editor-tip'
	  }
	}
  });
}

if(Ext.grid.GridView){
  Ext.apply(Ext.grid.GridView.prototype, {
	sortAscText  : S('grid_view_sortAscText'),
	sortDescText : S('grid_view_sortDescText'),
	lockText	 : S('grid_view_lockText'),
	unlockText	 : S('grid_view_unlockText'),
	columnsText  : S('grid_view_columnsText')
  });
}

if(Ext.grid.GroupingView){
  Ext.apply(Ext.grid.GroupingView.prototype, {
	emptyGroupText :  S('grid_view_sortAscText'),
	groupByText    : S('grouping_view_groupByText'),
	showGroupsText : S('grouping_view_showGroupsText')
  });
}

if(Ext.grid.PropertyColumnModel){
  Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
	nameText   : S('propertyColumnModel_name'),
	valueText  : S('propertyColumnModel_value'),
	dateFormat : S('date_format')
  });
}

if(Ext.layout.BorderLayout != undefined){
	if(Ext.layout.BorderLayout.SplitRegion){
	  Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
		splitTip			: S('SplitRegion_splitTip'),
		collapsibleSplitTip : S('SplitRegion_collapsibleSplitTip')
	  });
	}
}
