/*
 * compressor.js -- WME Validator compressor library
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
 * Compressor
 * (c) 2013-2016 berestovskyy
 */
var _COMP = {};

/**
 * Default dictionary
 */
//_COMP.$dict = [" segment",":{EN:\"","function","this.","\\u0"," the ","treet name","tion","roundabout","able:!1},","return","};v.b[",".length","\",FR:\"","\",PL:\"","~w0e","or Highway","~w5d","){var ",")&&f.d(","s://www.waz","\"http~ge.co","]={c:","~w1","drivable","Z(\"div\",",":{writ~r","\",a:\"","Validator","&&p.g(","ncorrect ","_Editing_","eating_and~","egment",";break;case","name",",e~zThe"," to ","+encodeURI(","Freeway","===","road",".match(/","~fm/forum/v","iewtopic.ph",".prototype."," at node ","\"},","if(","~e2,j:\"","roperties",".toUpperCas",".attributes","2952996808,"," conne","abbrevia~t","~w5e","ight",":{enumer~r","street_s~Zs","for","margin","estric~t"," not locked","ground-colo","<a target=\"","ent","report",":\"Benelux_","w_to_label_","\",!0],[\"#",":_blank\" hr","o~6and_~X_~","OwnProperty","1899447441)"," n~d53ud"," class=","display","&&("," and ","rond-point","ing","~d19","var ","~y(a){",".push(","er ","able","zdu na w~)~","ity ~X"];

/**
 * Code table
 */
_COMP.$codes = [];
/**
 * Minimum and maximum codes
 * @const
 */
_COMP.$minCode = 32;
/** @const */
_COMP.$maxCode = 123;
/**
 * Escape char
 * @const
 */
_COMP.$escChar = '~';

/**
 * Get the num of most used words in str
 * with length between minLen and maxLen
 */
_COMP.getMostUsedWords = function (num, maxSize, str, minLen, maxLen) {
	if (maxLen > _COMP.$maxCode - _COMP.$minCode)
		maxLen = _COMP.$maxCode - _COMP.$minCode;

	var top = [];

	// save dict
	var dict = _COMP.$dict;

	var tstr = str;
	while (top.length < num) {
		var word = _COMP.getMostUsedWord(tstr, minLen, maxLen);
		if (!word) break;
		top.push(word);
		// check dict size
		if (top.join(" ").length > maxSize) { top.pop(); break; }
		// compress the string
		_COMP.setDictionary(top);
		tstr = _COMP.compress(str);
	};
	// restore the dictionary
	_COMP.$dict = dict;

	return top;
}

/**
 * Get most used word in str
 * with length between minLen and maxLen
 */
_COMP.getMostUsedWord = function (str, minLen, maxLen) {
	var stat = {};
	var l = str.length;
	for (var i = 0; i < l; i++) {
		for (var j = minLen; j <= maxLen; j++) {
			if (i + j >= l)
				break;
			var w = str.substr(i, j);
			// check for special characters
			if (/[\x00-\x1f]/.test(w))
				break;
			if (stat[w])
				stat[w]++;
			else
				stat[w] = 1;
		}
	}

	// convert to an array of objects
	var a = [];
	for (var p in stat) {
		if (stat.hasOwnProperty(p))
			a.push({
				text: p,
				saved: stat[p] * (p.length - 2)
			});
	}
	if (!a.length)
		return "";
	// sort the array
	return a.sort(function (a, b) {
		return b.saved - a.saved;
	})[0].text;
}

/**
 * Set dictionary
 */
_COMP.setDictionary = function (dict) {
	dict.length = Math.min(_COMP.$maxCode - _COMP.$minCode, dict.length);
	_COMP.$dict = dict;
	_COMP.$codes = [];
}

/**
 * Init codes for the dictionary
 */
_COMP.initCodes = function () {
	if (_COMP.$codes.length != _COMP.$dict.length)
		// init code array
		for (var i = 0; i < _COMP.$dict.length; i++)
			_COMP.$codes[i] = _COMP.$escChar + String.fromCharCode(_COMP.$maxCode - i);
}

/**
 * Compress the string
 */
_COMP.compress = function (str) {
	_COMP.initCodes();

	// escape escape char
	str = str.split(_COMP.$escChar).join(_COMP.$escChar + _COMP.$escChar)
	for (var i = 0; i < _COMP.$dict.length; i++)
		str = str.split(_COMP.$dict[i]).join(_COMP.$codes[i]);

	return str;
}

/**
 * Decompress the string
 */
_COMP.decompress = function (str) {
	_COMP.initCodes();

	for (var i = _COMP.$dict.length - 1; i >= 0; i--)
		str = str.split(_COMP.$codes[i]).join(_COMP.$dict[i]);

	// unescape escape char
	str = str.split(_COMP.$escChar + _COMP.$escChar).join(_COMP.$escChar)

	return str;
}
