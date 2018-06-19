/*
 * thui.js -- WME Validator tiny HTML user interface library
 * Copyright (C) 2013-2018 Andriy Berestovskyy
 *
 * This file is part of WME Validator: https://github.com/WMEValidator/
 *
 * WME Validator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * WME Validator is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with WME Validator. If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * Tiny HTML User Interface
 * see header for THUI types declarations
 * (c) 2013-2018 Andriy Berestovskyy
 */

/**
 * Default parameters for children objects
 */
/** @struct */
_THUI.$def = {
	_class: "",
	_disclose: 0,
	_name: "",
	_nodisplay: 0,
	_disabled: 0,
	_reverse: 0,
	_style: "",
	_type: "",
	_onclick: null,
	_onwarning: null,
	_onchange: null
}

/**
 * Load values from storage object
 */
_THUI.loadValues = function (uiObj, storageObj) {
	if (!storageObj) return;

	if (uiObj.AUTOSAVE && (uiObj.AUTOSAVE in storageObj)) {
		switch (uiObj.TYPE) {
			case _THUI.TEXT:
			case _THUI.DATE:
				uiObj.VALUE = storageObj[uiObj.AUTOSAVE];
				break;
			default:
				uiObj.CHECKED = storageObj[uiObj.AUTOSAVE];
				break;
		}
		return;
	}

	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];
		switch (classCode(o)) {
			case CC_OBJECT:
				_THUI.loadValues(o, storageObj);
				break;
			case CC_ARRAY:
				for (var j = 0; j < o.length; j++)
					_THUI.loadValues(o[j], storageObj);
				break;
		}
	}
}

/**
 * Save all values to storage object
 * @param {Object=} storageObj
 */
_THUI.saveValues = function (uiObj, storageObj) {
	if (!storageObj) storageObj = {};

	if (uiObj.AUTOSAVE) {
		switch (uiObj.TYPE) {
			case _THUI.TEXT:
			case _THUI.DATE:
				storageObj[uiObj.AUTOSAVE] = uiObj.VALUE;
				break;
			default:
				storageObj[uiObj.AUTOSAVE] = uiObj.CHECKED;
				break;
		}
		return storageObj;
	}

	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];
		switch (classCode(o)) {
			case CC_OBJECT:
				_THUI.saveValues(o, storageObj);
				break;
			case CC_ARRAY:
				for (var j = 0; j < o.length; j++)
					_THUI.saveValues(o[j], storageObj);
				break;
		}
	}
	return storageObj;
}

/**
 * Local storage wrappers
 */
_THUI.storage = {
	get: function (name) {
		try {
			var s = window.localStorage.getItem(name);
			return s ? JSON.parse(s) : null;
		}
		catch (e) {
			return null;
		}
	},
	set: function (name, obj) {
		try {
			var s = JSON.stringify(obj);
			window.localStorage.setItem(name, s);
			return true;
		}
		catch (e) {
			return false;
		}
	}
};

/**
 * Add an element class style to the document
 */
_THUI.addElemetClassStyle = function (elem, cl, newStyle) {
	if (classCodeIs(cl, CC_NUMBER)) cl = "c" + cl;
	return _THUI.addStyle(elem + "." + cl + newStyle);
}

/**
 * Add an element ID style to the document
 */
_THUI.addElemetIdStyle = function (elem, id, newStyle) {
	if (classCodeIs(id, CC_NUMBER)) id = "i" + id;
	return _THUI.addStyle(elem + "#" + id + newStyle);
}

/**
 * Add a style to the document
 */
_THUI.addStyle = function (newStyle) {
	// we assume a style sheet is already exists
	for (var i = 0; i < 10; i++) {
		var sheet = document.styleSheets[i];
		try {
			if ("cssRules" in sheet) {
				return sheet.insertRule(newStyle, sheet.cssRules.length);
			}
		} catch (e) { };
	}
}

/**
 * Get UI element by DOM element
 */
_THUI.getByDOM = function (uiObj, elem) {
	if (uiObj.IDOM == elem || uiObj.ODOM == elem)
		return uiObj;

	var ret = null;
	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];
		switch (classCode(o)) {
			case CC_OBJECT:
				if (ret = _THUI.getByDOM(o, elem))
					return ret;
				break;
			case CC_ARRAY:
				for (var j = 0; j < o.length; j++)
					if (ret = _THUI.getByDOM(o[j], elem))
						return ret;
				break;
		}
	}
	return null;
}

/**
 * Get element by ID
 */
_THUI.getById = function (uiObj, id) {
	if (uiObj.ID && uiObj.ID == id)
		return uiObj;

	var ret = null;
	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];
		switch (classCode(o)) {
			case CC_OBJECT:
				if (ret = _THUI.getById(o, id))
					return ret;
				break;
			case CC_ARRAY:
				for (var j = 0; j < o.length; j++)
					if (ret = _THUI.getById(o[j], id))
						return ret;
				break;
		}
	}
	return null;
}

/**
 * Update view
 */
_THUI.docToView = function (uiObj) {
	// initiate update mode by passing null parent
	_THUI.appendUI(null, uiObj);
}

/**
 * Update document
 *
 * Updates only: VALUE, CHECKED
 */
_THUI.viewToDoc = function (uiObj) {
	if (uiObj.IDOM) {
		if (classCodeDefined(uiObj.IDOM.value)) {
			var val = uiObj.IDOM.value;
			if (classCodeDefined(uiObj.MAX) && val > uiObj.MAX)
				val = uiObj.MAX;
			if (classCodeDefined(uiObj.MIN) && val < uiObj.MIN)
				val = uiObj.MIN;
			uiObj.VALUE = val;
		}
		if (classCodeDefined(uiObj.IDOM.checked))
			uiObj.CHECKED = uiObj.IDOM.checked;
	}

	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];
		switch (classCode(o)) {
			case CC_OBJECT:
				_THUI.viewToDoc(o);
				break;
			case CC_ARRAY:
				o.forEach(_THUI.viewToDoc);
				break;
		}
	}
}

/**
 * Creates or updates user interface
 *
 * Just update values if the parent parameter is null
 *
 * About _THIU
 * All simple values are properties
 * All structures and arrays are sub-elements/lists
 *
 * Prefixes:
 * _ - use _ prefix to set a default parameter for children objects
 *
 * For the first element we use:
 * [_]CLASS - element class
 * [_]STYLE[IO] - direct styles for inner/outer elements
 *
 * For the inner (input) element we use:
 * CHECKED - the element is checked by default
 * [_]DISABLED - the element is disabled by default
 * MAX - max value
 * MAXLENGTH - max length
 * MIN - min value
 * [_]NAME - the name of an element
 * READONLY - the element is readonly
 * STEP - step value
 * VALUE - default value
 * ONCLICK - on click handler
 *
 * For both elements we use:
 * [_]NODISPLAY - the element is hidden by default
 * TITLE - element title text
 *
 * Special:
 * ID - assign an id to the element (for inner if present, otherwise for outer)
 * [_]DISCLOSE - disclose inner element from outer
 * [_]REVERSE - reverse order of elements
 * TEXT - main element text (depend on type)
 * [_]TYPE - element type:
 *   DIV - simple div element
 *   NUMBER - input + label
 *   RADIO - input + label
 *   CHECKBOX - input + label
 *
 * What is DISCLOSE?
 * Some of the objects consists 3 elements: outer, inner and outer text.
 * Standard way of representing them is: <outer><inner>outer text</outer>
 * If DISCLOSE is present: <inner><outer>outer text</outer>
 *
 * What is REVERSE?
 * RVERSE changes inner element and outer text:
 *   <outer><inner>outer text</outer> --> <outer>outer text<inner></outer>
 * If DISCLOSE is present it reverse order of elements:
 *   <inner><outer>outer text</outer> --> <outer>outer text</outer><inner>
 */

/**
 * Append user interface object representation as a child to the given
 * parent element
 *
 * @param {?Element} parent
 * @param {Object} uiObj
 * @param {string=} uiPrefix
 * @param {string=} uiName
 */
_THUI.appendUI = function (parent, uiObj, uiPrefix, uiName) {
	// check the arguments
	uiPrefix = uiPrefix || "";
	uiName = uiName || "";

	// get the properties
	var id = uiObj.ID;
	if (!classCodeDefined(id)) id = "";
	/** @const */
	var NA = uiObj.NA || false;
	/** @const */
	var NAti = uiObj.NATITLE || "";
	/** @const */
	var ch = uiObj.CHECKED || false;
	var cl = classCodeDefined(uiObj.CLASS) ? uiObj.CLASS : _THUI.$def._class;
	var cli = uiObj.CLASSI;
	/** @const */
	var _cl = uiObj._CLASS;
	/** @const */
	var va = uiObj.VALUE;
	/** @const */
	var disc = classCodeDefined(uiObj.DISCLOSE) ? uiObj.DISCLOSE : _THUI.$def._disclose;
	/** @const */
	var _disc = uiObj._DISCLOSE;
	/** @const */
	// NA element always disabled
	var di = NA ? NA : (classCodeDefined(uiObj.DISABLED) ? uiObj.DISABLED : _THUI.$def._disabled);
	/** @const */
	var _di = uiObj._DISABLED;
	/** @const */
	var no = classCodeDefined(uiObj.NODISPLAY) ? uiObj.NODISPLAY : _THUI.$def._nodisplay;
	/** @const */
	var _no = uiObj._NODISPLAY;
	/** @const */
	var ma = uiObj.MAX;
	/** @const */
	var mal = uiObj.MAXLENGTH;
	/** @const */
	var plh = uiObj.PLACEHOLDER;
	/** @const */
	var mi = uiObj.MIN;
	var name = classCodeDefined(uiObj.NAME) ? uiObj.NAME : _THUI.$def._name;
	/** @const */
	var _name = uiObj._NAME;
	/** @const */
	var ro = uiObj.READONLY || false;
	/** @const */
	var re = classCodeDefined(uiObj.REVERSE) ? uiObj.REVERSE : _THUI.$def._reverse;
	/** @const */
	var _re = uiObj._REVERSE;
	/** @const */
	var step = uiObj.STEP;
	/** @const */
	var st = classCodeDefined(uiObj.STYLE) ? uiObj.STYLE : _THUI.$def._style;
	/** @const */
	var _st = uiObj._STYLE;
	/** @const */
	var sti = classCodeDefined(uiObj.STYLEI) ? uiObj.STYLEI : "";
	/** @const */
	var sto = classCodeDefined(uiObj.STYLEO) ? uiObj.STYLEO : "";
	/** @const */
	var te = uiObj.TEXT || "";
	// NA element has different title
	/** @const */
	var ti = NA ? (NAti ? NAti : "Not available") : uiObj.TITLE;
	/** @const */
	var ty = classCodeDefined(uiObj.TYPE) ? uiObj.TYPE : _THUI.$def._type;
	/** @const */
	var _ty = uiObj._TYPE;
	/** @const */
	var accK = uiObj.ACCESSKEY || "";

	// handlers
	/** @const */
	var oncl = uiObj.ONCLICK || _THUI.$def._onclick;
	/** @const */
	var onclo = uiObj.ONCLICKO;
	/** @const */
	var _oncl = uiObj._ONCLICK;
	/** @const */
	var onwa = uiObj.ONWARNING || _THUI.$def._onwarning;
	/** @const */
	var _onwa = uiObj._ONWARNING;
	/** @const */
	var onch = uiObj.ONCHANGE || _THUI.$def._onchange;
	/** @const */
	var _onch = uiObj._ONCHANGE;

	// array of elements to push
	var els = [];
	// inner element by defauld is input
	var iel = document.createElement("input");
	// outer element (i.e. <label><input>outer text</label>)
	// by default is label
	var oel = document.createElement("label");
	// outer text (i.e. <label><input>outer text</label>)
	// by default is TEXT
	var ote = te;

	// check and convert types
	if (classCodeIs(uiPrefix, CC_NUMBER)) uiPrefix = "p" + uiPrefix;
	if (classCodeIs(id, CC_NUMBER)) id = "i" + id;
	if (classCodeIs(cl, CC_NUMBER)) cl = "c" + cl;
	if (classCodeIs(cli, CC_NUMBER)) cli = "c" + cli;
	if (classCodeIs(name, CC_NUMBER)) name = "n" + name;

	// create new elements
	switch (ty) {
		case _THUI.NONE:
			iel = oel = null;
			ote = "";
			break;
		case _THUI.NUMBER:
			iel.type = "number";
			break;
		case _THUI.RADIO:
			// we need an unique id to disclose input from label
			if (disc && !id) id = uiPrefix + uiName + "i";
			// name should be the same across radio buttons
			if (!name) name = uiPrefix + "n";

			iel.type = "radio";
			if (disc) oel.htmlFor = id;
			break;
		case _THUI.CHECKBOX:
			// we need an unique id to disclose input from label
			if (disc && !id) id = uiPrefix + uiName + "i";
			// name should be unique as well
			//if(!name) name = uiPrefix + uiName + "n";

			iel.type = "checkbox";
			if (disc) oel.htmlFor = id;
			break;
		case _THUI.BUTTON:
			iel = document.createElement("button");
			//      if(te) iel.appendChild(document.createTextNode(te));
			if (te) iel.innerHTML = te;
			oel = null;
			ote = "";
			break;
		case _THUI.TEXT:
			iel.type = "text";
			break;
		case _THUI.PASSWORD:
			iel.type = "password";
			break;
		case _THUI.DATE:
			iel.type = "date";
			break;
		default:
			// create simple div element with text inside by default
			iel = null;
			oel = document.createElement("div");
			break;
	}
	// combine elements
	if (oel && iel && !disc) {
		if (re)
			// enclosed reverse composition: <outer>outer text<inner></outer>
			oel.appendChild(iel);
		else
			// [default] enclosed composition: <outer><inner>outer text</outer>
			oel.insertBefore(iel, oel.firstChild);
	}

	// now check if the elements are new
	if (classCodeDefined(uiObj.ODOM))
		// we already have ODOM, so just get them
		oel = uiObj.ODOM;
	if (classCodeDefined(uiObj.IDOM))
		// we already have IDOM, so just get them
		iel = uiObj.IDOM;

	// add text to the outer element if present
	if (ote) {
		var spanEl = document.createElement("span");
		spanEl.innerHTML = ote;
		// to switch on/off validator?
		spanEl.style.pointerEvents = "none";
		// remove all spans
		var oldSpans = oel.getElementsByTagName("span");
		var bInserted = false;
		for (var i = 0; i < oldSpans.length; i++)
			oel.removeChild(oldSpans[i]);

		oel.insertBefore(spanEl, oel.firstChild);
	}

	// push elements
	if (oel && iel) {
		// only if we have both inner and outer elements
		if (disc) {
			if (re)
				// disclosed reverse composition: <outer>outer text</outer><inner>
				els.push(oel, iel);
			else
				// disclosed composition: <inner><outer>outer text</outer>
				els.push(iel, oel);
		}
		else
			els.push(oel);
	}
	else {
		// we have just one or no elements
		if (oel) els.push(oel);
		if (iel) els.push(iel);
	}

	// ID is for inner if present, otherwise for outer
	if (id) {
		if (iel) iel.id = id;
		else if (oel) oel.id = id;

		// store id for futher use
		uiObj.ID = id;
	}

	// store name for future use
	if (name)
		uiObj.NAME = name;

	// add attributes to the inner element
	if (iel) {
		if (cli) iel.className = cli;
		if (accK) iel.accessKey = accK;
		if (classCodeDefined(ch)) iel.checked = ch;
		iel.disabled = di;
		if (classCodeDefined(ma)) iel.max = ma;
		if (classCodeDefined(mal)) iel.maxLength = mal;
		if (classCodeDefined(mi)) iel.min = mi;
		if (plh) iel.placeholder = plh;
		if (name) iel.name = name;
		if (classCodeDefined(ro)) iel.readonly = ro;
		if (classCodeDefined(step)) iel.step = step;
		if (classCodeDefined(va)) iel.value = va;

		if (classCodeDefined(oncl)) iel.onclick = oncl;
		if (classCodeDefined(onch)) iel.onchange = onch;
		if (classCodeDefined(onwa)
			&& uiObj.WARNING) iel.onchange = onwa;
		if (sti) iel.style.cssText = sti;
	}

	// add attributes to the outer element
	if (oel) {
		if (classCodeDefined(onclo)) oel.onclick = onclo;
		if (sto) oel.style.cssText = sto;
	}

	// add attributes to the first element
	var fel = els[0];
	if (fel) {
		if (cl) fel.className = cl;
		if (st) fel.style.cssText = st;
	}
	else
		// if no elements - append subobjects directly to the parent
		fel = parent;

	// append all sub-objects
	// save the defaults
	var oldDef = deepCopy(_THUI.$def);

	// set new defaults
	if (classCodeDefined(_cl)) _THUI.$def._class = _cl;
	if (classCodeDefined(_disc)) _THUI.$def._disclose = _disc;
	if (classCodeDefined(_name)) _THUI.$def._name = _name;
	if (classCodeDefined(_di)) _THUI.$def._disabled = _di;
	if (classCodeDefined(_no)) _THUI.$def._nodisplay = _no;
	if (classCodeDefined(_re)) _THUI.$def._reverse = _re;
	if (classCodeDefined(_st)) _THUI.$def._style = _st;
	if (classCodeDefined(_ty)) _THUI.$def._type = _ty;
	if (_oncl) _THUI.$def._onclick = _oncl;
	if (_onch) _THUI.$def._onchange = _onch;
	if (_onwa) _THUI.$def._onwarning = _onwa;

	for (var i in uiObj) {
		if (!uiObj.hasOwnProperty(i))
			continue;

		var o = uiObj[i];

		switch (classCode(o)) {
			case CC_OBJECT:
				fel = _THUI.appendUI(fel, o, uiPrefix + uiName, i);
				break;
			case CC_ARRAY:
				for (var j = 0; j < o.length; j++)
					if (classCodeIs(o[j], CC_OBJECT))
						fel = _THUI.appendUI(fel, o[j], uiPrefix + uiName, i);
				break;
		}
	}
	// restore the defaults
	_THUI.$def = oldDef;

	// add attributes to both elements and add it to the parent
	els.forEach(function (e) {
		if (no) e.style.display = "none"; else e.style.display = "";
		if (classCodeDefined(ti)) e.title = ti;

		if (e !== uiObj.IDOM && e !== uiObj.ODOM)
			parent.appendChild(e);
	});

	// store elements for futher updates
	uiObj.IDOM = iel;
	uiObj.ODOM = oel;
	// make IDOM/ODOM hidden for iterations
	Object.defineProperties(uiObj, {
		IDOM: { enumerable: false },
		ODOM: { enumerable: false }
	});

	return parent;
}
