function updateCentralContainer(centralHtmlId, formObj) {
	var container = Ext.get(centralHtmlId); // gets the center container
	var changed_sub_menu = false;
	var changed_menu = false;
	if (cmp_selected_sub_menu != selected_sub_menu) {
		changed_sub_menu = true;
	}
	cmp_selected_sub_menu = selected_sub_menu;

	if (cmp_selected_menu != selected_menu) {
		changed_menu = true;
	}
	cmp_selected_menu = selected_menu;

	if (changed_menu || changed_sub_menu) {
		if (container != undefined) {
			while (container.first()) {
				element = container.first();
				element.remove();
			}
		}
	}
	else if (container != undefined && !changed_sub_menu) {
		while (container.first()) {
			element = container.first();
			element.remove();
		}
	}

	formObj.render(centralHtmlId); // Render the new form
/*
	if (selected_menu != "btn_debug"){
//		Ext.get('root_doc').unmask();
		var MaskElems = Ext.DomQuery.select('.ext-el-mask');
		Ext.get(MaskElems).hide();
	}
*/
}

function addToCentralContainer(centralHtmlId, formObj) {
	var container = Ext.get(centralHtmlId); // gets the center container 
	formObj.render(centralHtmlId);
}

function insertToCentralContainer(centralHtmlId, formObj, idPrevElement) {
	var container = Ext.get(centralHtmlId); // gets the center container 
	formObj.render(centralHtmlId, idPrevElement);
}

function updateSkipFirstCentralContainer(centralHtmlId, formObj) {
	var container = Ext.get(centralHtmlId); // gets the center container 
	if (container != undefined) {
		first = container.first()
		while (container.last()) {
			last = container.last();
			if (last != first) last.remove();
			else break;
		}
	}
	formObj.render(centralHtmlId); // Render the new form
}

function updateHeaderContainer(headerHtmlId, newHeader) {
	var container = Ext.get(headerHtmlId); // gets the center container 
	container.update(newHeader);
}

function updateHtmlToContainer(centralHtmlId, html) {
	var container = Ext.get(centralHtmlId); // gets the center container 
	if (container != undefined) {
		while (container.first()) {
			element = container.first();
			element.remove();
		}
	}
	container.createChild(html);
}

function addHtmlToContainer(centralHtmlId, html) {
	var container = Ext.get(centralHtmlId); // gets the center container 
	container.createChild(html);
}

function update_header(editMode, itemHeaderRef, itemChild) {
	var header = S(itemHeaderRef);

	if (editMode) {
		header += " >  ";
		header = "<h3>" + header + "<b id='pageName_item'>" + itemChild + "</b> </h3> ";
		// --------------------------------------------
	}
	else {
		header = "<h3>" + header + "</h3>";
	}
	updateHeaderContainer(SUBMENU_RENDER_TO, header);
}
