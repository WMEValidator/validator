/*
 * helpers.js -- WME Validator helper functions
 * Copyright (C) 2013-2018 Andriy Berestovskyy
 *
 * This file is part of WME Validator: https://github.com/WMEValidator/
 *
 * WME Validator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WME Validator is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WME Validator. If not, see <http://www.gnu.org/licenses/>.
 */

/*************************************************************************
 * HELPER FUNCTIONS
 *************************************************************************/

/**
 * Known class codes
 */
/** @const */
var CC_UNDEFINED = 48;
/** @const */
var CC_NULL = 34;
/** @const */
var CC_BOOL = 46;
/** @const */
var CC_NUMBER = 44;
/** @const */
var CC_STRING = 58;
/** @const */
var CC_GLOBAL = 5;
/** @const */
var CC_FUNCTION = 37;
/** @const */
var CC_ARRAY = 32;
/** @const */
var CC_OBJECT = 42;
/** @const */
var CC_REGEXP = 23;
/** @const */
var CC_DATE = 33;

/**
 * Get object class name
 */
function classOf(val) { return {}.toString.call(val).slice(8, -1); }

/**
 * Get object class code
 */
function classCode(obj) {
	return {}.toString.call(obj).charCodeAt(8)
		^ {}.toString.call(obj).charCodeAt(11);
}

/**
 * Compare class code and object class code
 */
function classCodeIs(obj, cc) {
	return cc === classCode(obj);
}

/**
 * Returns true if object is defined
 */
function classCodeDefined(obj) {
	return CC_UNDEFINED !== classCode(obj);
}

/**
 * Check if object has no properties
 */
function isEmpty(obj) {
	for (var k in obj)
		if (obj.hasOwnProperty(k))
			return false;
	return true;
}

/**
 * Deep copy of object or array
 * See: object copy function at MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#An_object_copy_function
 */
function deepCopy(obj) {
	switch (classCode(obj)) {
		case CC_ARRAY:
			var cpy = [];
			for (var i = 0, len = obj.length; i < len; i++)
				cpy[i] = deepCopy(obj[i]);
			return cpy;
		case CC_OBJECT:
			var cpy = {};
			for (var attr in obj)
				if (obj.hasOwnProperty(attr))
					cpy[attr] = deepCopy(obj[attr]);
			return cpy;
	}
	return obj;
}

/**
 * Compare deep two arrays or objects
 */
function deepCompare(obj1, obj2) {
	if (obj1 === obj2)
		return true;
	if (classCode(obj1) !== classCode(obj2))
		return false;

	switch (classCode(obj1)) {
		case CC_ARRAY:
			if (obj1.length != obj2.length)
				return false;
			for (var i = 0; i < obj1.length; i++)
				if (!deepCompare(obj1[i], obj2[i]))
					return false;
			return true;
		case CC_OBJECT:
			for (var k in obj1) {
				if (!obj1.hasOwnProperty(k))
					continue;
				if (!obj2.hasOwnProperty(k))
					return false;
				if (!deepCompare(obj1[k], obj2[k]))
					return false;
			}
			return true;
	}
	// any other type
	return false;
}

function getDirection(seg) {
	return (seg.attributes.fwdDirection ? 1 : 0) + (seg.attributes.revDirection ? 2 : 0);
};

function getLocalizedValue(val, country) {
	var ipu = OpenLayers.INCHES_PER_UNIT;
	var mph = false;
	if ((country == "United Kingdom") ||
		(country == "Jersey") ||
		(country == "Guernsey") ||
		(country == "United States"))
		mph = true;
	return mph ?
		Math.round(val * ipu["km"] / ipu["mi"]) : val;
}

// Function from WazeWrap with permission from justins83
function AddLayerCheckbox(group, checkboxText, checked, callback){
	group = group.toLowerCase();
	var normalizedText = checkboxText.toLowerCase().replace(/\s/g, '_');
	var checkboxID = "layer-switcher-item_" + normalizedText;
	var groupPrefix = 'layer-switcher-group_';
	var groupClass = groupPrefix + group.toLowerCase();
	sessionStorage[normalizedText] = checked;

	var CreateParentGroup = function(groupChecked){
		var groupList = $('.layer-switcher').find('.list-unstyled.togglers');
		var checkboxText = group.charAt(0).toUpperCase() + group.substr(1);
		var newLI = $('<li class="group">');
		newLI.html([
			'<div class="controls-container toggler">',
			'<input class="' + groupClass + '" id="' + groupClass + '" type="checkbox" ' + (groupChecked ? 'checked' : '') +'>',
			'<label for="' + groupClass + '">',
			'<span class="label-text">'+ checkboxText + '</span>',
			'</label></div>',
			'<ul class="children"></ul>'
		].join(' '));

		groupList.append(newLI);
		$('#' + groupClass).change(function(){sessionStorage[groupClass] = this.checked;});
	};

	if(group !== "issues" && group !== "places" && group !== "road" && group !== "display") //"non-standard" group, check its existence
		if($('.'+groupClass).length === 0){ //Group doesn't exist yet, create it
			var isParentChecked = (typeof sessionStorage[groupClass] == "undefined" ? true : sessionStorage[groupClass]=='true');
			CreateParentGroup(isParentChecked);  //create the group
			sessionStorage[groupClass] = isParentChecked;

			W.app.modeController.model.bind('change:mode', function(model, modeId, context){ //make it reappear after changing modes
				CreateParentGroup((sessionStorage[groupClass]=='true'));
			});
		}

	var buildLayerItem = function(isChecked){
		var groupChildren = $("."+groupClass).parent().parent().find('.children').not('.extended');
		var  $li = $('<li>');
		$li.html([
			'<div class="controls-container toggler">',
			'<input type="checkbox" id="' + checkboxID + '"  class="' + checkboxID + ' toggle">',
			'<label for="' + checkboxID + '"><span class="label-text">' + checkboxText + '</span></label>',
			'</div>',
		].join(' '));

		groupChildren.append($li);
		$('#' + checkboxID).prop('checked', isChecked);
		$('#' + checkboxID).change(function(){callback(this.checked); sessionStorage[normalizedText] = this.checked;});
		if(!$('#' + groupClass).is(':checked')){
			$('#' + checkboxID).prop('disabled', true);
			callback(false);
		}

		$('#' + groupClass).change(function(){$('#' + checkboxID).prop('disabled', !this.checked); callback(!this.checked ? false : sessionStorage[normalizedText]=='true');});
	};


	W.app.modeController.model.bind('change:mode', function(model, modeId, context){
		buildLayerItem((sessionStorage[normalizedText]=='true'));
	});

	buildLayerItem(checked);
};
