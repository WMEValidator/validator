/*
 * i18n.js -- WME Validator internationalization library
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
 * Simple I18n Class
 * (c) 2013-2018 Andriy Berestovskyy
 *
 * $defLng - default language
 * $lng - current language
 * $translations - translations database
 * $curSet - current localization set (i.e. $translations[$lng])
 * $fallbackSet - fallback language set (i.e. $translations[$code2code]
 * $defSet - default language set (i.e. $translations[$defLng]
 * $code2code - fallback country code
 * $lng2code - language to country translation table
 * $code2dir - country code to direction translation table
 */
var _I18n = {
	/** @const */
	$defLng: "EN",
	// current language
	$lng: "",
	// localization database
	$translations: null,
	// current string set
	$curSet: null,
	// current code
	$curCode: '',
	// fallback string set
	$fallbackSet: null,
	// fallback code
	$fallbackCode: '',
	// default string set
	$defSet: null,
	// country <-> code conversion
	$country2code: null,
	$code2country: null,
	// country fallback table
	$code2code: null,
	// language fallback table
	$lng2code: null,
	// rtl languages table
	$code2dir: null
};

/**
 * Init i18n
 */
_I18n.init = function (options) {
	_I18n.$lng = options.$lng || _I18n.$defLng;
	_I18n.$translations = options.$translations || {};
	_I18n.$country2code = options.$country2code || {};
	_I18n.$code2country = options.$code2country || {};
	_I18n.$code2code = options.$code2code || {};
	_I18n.$lng2code = options.$lng2code || {};
	_I18n.$code2dir = options.$code2dir || {};
}

/**
 * Add translation
 */
_I18n.addTranslation = function (translation) {
	var ccode = translation[".codeISO"];
	if (!ccode) {
		//      window.console.log("I18n: country code is not found");
		return;
	}
	ccode = ccode.toUpperCase();
	_I18n.$translations[ccode] = translation;

	if (_I18n.$defLng !== ccode) {
		var country = translation[".country"];
		if (country) {
			if (!classCodeIs(country, CC_ARRAY))
				country = [country];
			for (var i = 0; i < country.length; i++) {
				var ucountry = country[i].toUpperCase();
				//              if(ucountry in _I18n.$country2code)
				//                  window.console.log("I18n: duplicate country: " + country[i]);
				_I18n.$country2code[ucountry] = ccode;
				if (!(ccode in _I18n.$code2country))
					_I18n.$code2country[ccode] = ucountry;
			}
		}
		//      else
		//          window.console.log("I18n: country is not found");

		var lng = translation[".lng"];
		if (lng) {
			if (!classCodeIs(lng, CC_ARRAY))
				lng = [lng];
			for (var i = 0; i < lng.length; i++) {
				var ulng = lng[i].toUpperCase();
				//              if(ulng in _I18n.$lng2code)
				//                  window.console.log("I18n: duplicate language: " + lng[i]);
				_I18n.$lng2code[ulng] = ccode;
			}
		}
		var dir = translation[".dir"];
		if (dir) {
			//          if(ccode in _I18n.$code2dir)
			//              window.console.log("I18n: duplicate direction for code: " + ccode);
			_I18n.$code2dir[ccode] = dir.toLowerCase();
		}
		var fcode = translation[".fallbackCode"];
		if (fcode) {
			fcode = fcode.toUpperCase();
			//          if(ccode in _I18n.$code2code)
			//              window.console.log("I18n: duplicate fallback for code: " + ccode);
			if (_I18n.$defLng !== fcode)
				_I18n.$code2code[ccode] = fcode;
		}
	}

	_I18n.$curCode = _I18n.getCodeOL(_I18n.$translations, _I18n.$lng);
	_I18n.$curSet = _I18n.getValueOC(_I18n.$translations, _I18n.$curCode);

	_I18n.$fallbackCode = _I18n.getFallbackCodeOC(_I18n.$translations,
		_I18n.$curCode);
	_I18n.$fallbackSet = _I18n.getValueOC(_I18n.$translations,
		_I18n.$fallbackCode);
	_I18n.$defSet = _I18n.$translations[_I18n.$defLng];

	//  window.console.log(_I18n)
}

/**
 * Get dependant codes
 */
_I18n.getDependantCodes = function (uc) {
	var ret = [];
	for (var depCode in _I18n.$code2code) {
		if (_I18n.$code2code[depCode] === uc)
			ret.push(depCode);
	}
	return ret;
}

/**
 * Get country code
 */
_I18n.getCountryCode = function (uc) {
	if (uc in _I18n.$country2code)
		return _I18n.$country2code[uc];
	return "";
}

/**
 * Get country
 */
_I18n.getCountry = function (ucc) {
	if (ucc in _I18n.$code2country)
		return _I18n.$code2country[ucc];
	return "";
}

/**
 * Get capitalized country
 */
_I18n.getCapitalizedCountry = function (ucc) {
	return _I18n.capitalize(_I18n.getCountry(ucc)).toLowerCase().replace(/\b./g, function (c) {
		return c.toUpperCase();
	});
}

/**
 * Capitalize country
 */
_I18n.capitalize = function (str) {
	return str.toLowerCase().replace(/\b./g, function (c) {
		return c.toUpperCase();
	});
}

/**
 * Get direction
 */
_I18n.getDir = function () {
	if (_I18n.$curCode in _I18n.$code2dir)
		return _I18n.$code2dir[_I18n.$curCode];
	if (_I18n.$fallbackCode in _I18n.$code2dir)
		return _I18n.$code2dir[_I18n.$fallbackCode];
	return "ltr";
}

/**
 * Get string from the translations
 */
_I18n.getString = function (label) {
	if (label in _I18n.$curSet)
		//      return "ok" + _I18n.$curSet[label];
		return _I18n.$curSet[label];
	if (label in _I18n.$fallbackSet)
		//      return "ok" + _I18n.$fallbackSet[label];
		return _I18n.$fallbackSet[label];
	if (label in _I18n.$defSet)
		return _I18n.$defSet[label];
	// TODO: remove
	var ret = "[missing " + label + "]";
	//  window.console.log(ret);
	return ret;
}

/**
 * Check if label exists
 */
_I18n.isLabelExist = function (label) {
	if (label in _I18n.$curSet)
		return true;
	if (label in _I18n.$fallbackSet)
		return true;
	if (label in _I18n.$defSet)
		return true;
	return false;
}

/**
 * Get country code from object by language
 */
_I18n.getCodeOL = function (obj, lng) {
	var ccode = _I18n.$lng2code[lng];
	if (ccode) {
		if (ccode in obj)
			return ccode;
		else
			return _I18n.getFallbackCodeOC(obj, ccode);
	}
	else
		return _I18n.$defLng;
}

/**
 * Get fallback country code from object by code
 */
_I18n.getFallbackCodeOC = function (obj, ccode) {
	var fcode = _I18n.$code2code[ccode];
	if (fcode && (fcode in obj))
		return fcode;
	return _I18n.$defLng;
}



/**
 * Get value from object by language
 */
_I18n.getValueOL = function (obj, lng) {
	return _I18n.getValueOC(obj, _I18n.getCodeOL(obj, lng));
}

/**
 * Get value by object and country code
 */
_I18n.getValueOC = function (obj, ccode) {
	if (ccode in obj)
		return obj[ccode];
	else {
		if (ccode in _I18n.$code2code) {
			var fcode = _I18n.$code2code[ccode];
			if (fcode in obj)
				return obj[fcode];
		}
	}
	return obj[_I18n.$defLng];
}

/**
 * Expand string with options object
 */
_I18n.expandSO = function (str, options) {
	if (!options) return str;

	return str.replace(/\$\{(\w+)(\[(\d+)\]|\[(\W*)\])?\}/g,
		function (all, name, arr, idx, delims) {
			if (arr) {
				if (idx)
					return options[name][idx] || '';
				return options[name].join(delims);
			}
			else
				return options[name];
		});
}

/**
 * Translate Object
 */
_I18n.t = function (obj, ccode, options) {
	return _I18n.expandSO(_I18n.getValueOC(obj, ccode), options);
}

/**
 * Translate Object using language
 */
_I18n.tL = function (obj, options) {
	return _I18n.expandSO(_I18n.getValueOL(obj, _I18n.$lng), options);
}
