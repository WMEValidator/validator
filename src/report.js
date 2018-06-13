/*
 * report.js -- WME Validator report support
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
 * Show generated report
 */
function F_SHOWREPORT(reportFormat) {
	// shortcuts
	/** @const */
	var _now = new Date();
	/** @const */
	var _nowISO = _now.toISOString().slice(0, 10);
	/** @const */
	var _repU = _REP.$users;
	/** @const */
	var _repC = _REP.$cities;
	/** @const */
	var _repCC = _REP.$cityCounters;
	/** @const */
	var _repRC = _REP.$reportCounters;
	/** @const */
	var _repS = _REP.$streets;
	/** @const */
	var isBeta = -1 !== window.location.href.indexOf("beta");

	// false if at least one filter or search set
	var noFilters = true;

	// final report data
	var FR = '';
	var FRheader = '';
	var FRfooter = '';

	// window object
	var newWin = null;

	///////////////////////////////////////////////////////////////////////
	// Format strings
	// h1
	var Bh1, Eh1;
	// h2
	var Bh2, Eh2;
	// small
	var Bsmall, Esmall;
	// big
	var Bbig, Ebig;
	// link
	var Ba, Ca, Ea;
	// link target Validator
	var BaV;
	// color
	var Bcolor, Ccolor, Ecolor;
	// bold
	var Bb, Eb;
	// p
	var Bp, Ep;
	// br
	var Br;
	// ol
	var Bol, Eol;
	// ul
	var Bul, Eul;
	// li
	var Bli, Eli;
	// code
	var Bcode, Ecode;
	// &mdash; &nbsp;
	var Mdash, Nbsp;
	// current format
	var curFormat;

	///////////////////////////////////////////////////////////////////////
	// Support functions
	function setFormat(fmt) {
		curFormat = fmt;
		switch (fmt) {
			case RF_HTML:
				Bh1 = '\n<h1>', Eh1 = '</h1>\n<hr>\n';
				Bh2 = '\n\n<h2>', Eh2 = '</h2>\n';
				Bsmall = '<small>', Esmall = '</small>';
				Bbig = '<big>', Ebig = '</big>';
				Ba = '<a target="_blank" href="', Ca = '">', Ea = '</a>';
				BaV = '<a target="Validator" href="';
				Bcolor = '<span style="color:', Ccolor = '">', Ecolor = '</span>';
				Bb = '<b>', Eb = '</b>';
				Bp = '<p>', Ep = '</p>';
				Br = '<br>\n';
				Bul = '\n<ul>\n', Eul = '\n</ul>\n';
				Bcode = '\n<div style="text-align:left" dir="ltr" class="code" onclick="selectAll(this)">', Ecode = '</div>\n';
				Bol = '\n<ol>\n', Eol = '\n</ol>\n';
				Bli = '\n<li>', Eli = '</li>\n';
				Mdash = ' &mdash; ';
				Nbsp = '&nbsp;';
				break;
			case RF_BB:
				Bh1 = '\n[size=200]', Eh1 = '[/size]\n';
				Bh2 = '\n[size=150]', Eh2 = '[/size]\n';
				Bsmall = '[size=85]', Esmall = '[/size]';
				Bbig = '[size=120]', Ebig = '[/size]';
				Ba = '[url=', Ca = ']', Ea = '[/url]';
				BaV = Ba;
				Bcolor = '[color=', Ccolor = ']', Ecolor = '[/color]';
				Bb = '[b]', Eb = '[/b]';
				Bp = '\n', Ep = '\n';
				Br = '\n';
				Bul = '\n[list]', Eul = '[/list]\n';
				Bcode = '\n[code]', Ecode = '\n[/code]';
				Bol = '\n[list=1]', Eol = '[/list]\n';
				Bli = '\n[*]', Eli = '[/*]\n';
				Mdash = ' - ';
				Nbsp = ' ';
				break;
		}
		return '';
	}
	// returns report source
	function getReportSource() {
		var m = 0;
		var n = "";
		for (var cid in _repCC) {
			if (_repCC.hasOwnProperty(cid) && m < _repCC[cid] && _repC[cid]) {
				m = _repCC[cid];
				n = _repC[cid];
			}
		}
		return n;
	}

	// returns top permalink
	function getTopPermalink() {
		var center, zoom;
		if (_RT.$startCenter) {
			center = _RT.$startCenter;
			zoom = _RT.$startZoom;
		}
		else {
			center = WM.getCenter();
			zoom = WM.getZoom();
		}
		var c = center.clone()
			.transform(WM.projection, WM.displayProjection);
		return window.location.origin
			+ window.location.pathname
			+ '?zoom=' + zoom
			+ '&lat=' + Math.round(c.lat * 1e5) / 1e5
			+ '&lon=' + Math.round(c.lon * 1e5) / 1e5
			+ '&env=' + nW.location.code
			;
	}

	// returns HTML header
	function getHTMLHeader(strTitle) {
		var dir = _I18n.getDir();
		var dirLeft = trLeft(dir);
		var dirRight = trRight(dir);
		return '<html dir="' + dir + '"><head><style>'
			+ '\na{background-color:white}'
			+ '\na:visited{background-color:' + GL_VISITEDBGCOLOR
			+ ' !important;color:' + GL_VISITEDCOLOR + ' !important}'
			+ '\n.note a{background-color:' + GL_NOTEBGCOLOR
			+ ';color:' + GL_NOTECOLOR + '}'
			+ '\n.warning a{background-color:' + GL_WARNINGBGCOLOR
			+ ';color:' + GL_WARNINGCOLOR + '}'
			+ '\n.error a{background-color:' + GL_ERRORBGCOLOR
			+ ';color:' + GL_ERRORCOLOR + '}'
			+ '\n.custom1 a{background-color:' + GL_CUSTOM1BGCOLOR
			+ ';color:' + GL_CUSTOM1COLOR + '}'
			+ '\n.custom2 a{background-color:' + GL_CUSTOM2BGCOLOR
			+ ';color:' + GL_CUSTOM2COLOR + '}'
			+ '\ndiv.note{background-color:' + GL_NOTEBGCOLOR + ';padding:1em;margin-top:0.5em}'
			+ '\ndiv.warning{background-color:' + GL_WARNINGBGCOLOR + ';padding:1em;margin-top:0.5em}'
			+ '\ndiv.error{background-color:' + GL_ERRORBGCOLOR + ';padding:1em;margin-top:0.5em}'
			+ '\nh2+ul>li{margin-bottom:1em}'
			+ '\nul{margin-top:0}'
			+ '\nh1,h2{margin-bottom:4px;font-family:Georgia,Times,"Times New Roman",serif}'
			+ '\nbody{margin:2em;font-family:"Lucida Grande","Lucida Sans Unicode","DejaVu Sans",Lucida,Arial,Helvetica,sans-serif}'
			+ '\ndiv#contents{display:inline-block;margin:1em 0;padding:1em;background-color:#f9f9f9;border:1px solid #aaa}'
			+ '\ndiv#contents li{margin-bottom:0.1em}'
			+ '\ndiv.code::before{content: "CODE: SELECT ALL";display:block;border-bottom:1px solid #ccc;font:bold 1em "Lucida Grande","Trebuchet MS",Verdana,Helvetica,Arial,sans-serif;color:#105289;margin-bottom:5px;}'
			+ '\ndiv.code{margin-top:0.5em;display:block;width:650px;overflow:auto;padding:0.5em;border:1px solid #ccc;background-color:#f4fff4;white-space:pre;font:0.9em Monaco,"Andale Mono","Courier New",Courier,mono;line-height:1.3em;color:#2E8B57;cursor:pointer}'
			+ '\n</style>'
			+ '\n<script>'
			+ '\nfunction selectAll(e){'
			+ 'if(window.getSelection){'
			+ 'var s = window.getSelection();'
			+ 'var r = document.createRange();'
			+ 'r.selectNodeContents(e);'
			+ 's.removeAllRanges();'
			+ 's.addRange(r);'
			+ '}}'
			+ '\n</script>'
			+ '\n<title>' + strTitle + " " + _nowISO + '</title>'
			+ '\n<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>'
			//          + '\n<link href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">'
			+ '\n</head><body>'
			;
	}
	// returns natural list
	function getNaturalList(arr) {
		if (1 === arr.length)
			return arr[0];
		var ret = '';
		arr.forEach(function (e, i) {
			if (arr.length - 1 === i)
				ret += ' ' + trS("report.and") + ' ';
			else if (0 !== i)
				ret += ', ';
			ret += e;
		});
		return ret;
	}
	// returns document header
	function getHeader(strTitle) {
		var ret = Bh1 + strTitle + Eh1;
		if (RF_LIST !== reportFormat
			&& RF_CREATEPACK !== reportFormat) {
			ret += Bsmall + trS("report.generated.by")
				+ ' ' + _RT.$curUserName + ' '
				+ trS("report.generated.on")
				+ ' '
				+ _nowISO + Esmall + Br
				+ Br + Bb
				+ trS("report.source")
				+ ' ' + Eb + Ba + getTopPermalink() + Ca
				+ checkNoCity(getReportSource())
				+ Ea + Br
				;

			var filters = [];
			if (_UI.pMain.pFilter.oExcludeDuplicates.CHECKED)
				filters.push(trS("report.filter.duplicate"));
			if (_UI.pMain.pFilter.oExcludeStreets.CHECKED)
				filters.push(trS("report.filter.streets"));
			if (_UI.pMain.pFilter.oExcludeOther.CHECKED)
				filters.push(trS("report.filter.other"));
			if (_UI.pMain.pFilter.oExcludeNonEditables.CHECKED)
				filters.push(trS("report.filter.noneditable"));
			if (_UI.pMain.pFilter.oExcludeNotes.CHECKED)
				filters.push(trS("report.filter.notes"));
			if (filters.length) {
				noFilters = false;
				ret += Bb + trS("report.filter.title")
					+ ' ' + Eb + getNaturalList(filters)
					+ ' '
					+ trS("report.filter.excluded")
					+ Br;
			}
			filters = [];
			if (!_UI.pMain.pSearch.oIncludeYourEdits.NODISPLAY
				&& _UI.pMain.pSearch.oIncludeYourEdits.CHECKED)
				filters.push(trS("report.search.updated.by")
					+ ' ' + _RT.$curUserName);
			if (!_UI.pMain.pSearch.oIncludeUpdatedBy.NODISPLAY
				&& _UI.pMain.pSearch.oIncludeUpdatedBy.VALUE)
				filters.push(trS("report.search.updated.by")
					+ ' ' + _UI.pMain.pSearch.oIncludeUpdatedBy.VALUE);
			if (_UI.pMain.pSearch.oIncludeUpdatedSince.VALUE)
				filters.push(trS("report.search.updated.since")
					+ ' ' + _UI.pMain.pSearch.oIncludeUpdatedSince.VALUE);
			if (_UI.pMain.pSearch.oIncludeCityName.VALUE)
				filters.push(trS("report.search.city")
					+ ' ' + _UI.pMain.pSearch.oIncludeCityName.VALUE);
			if (_UI.pMain.pSearch.oIncludeChecks.VALUE)
				filters.push(trS("report.search.reported")
					+ ' ' + _UI.pMain.pSearch.oIncludeChecks.VALUE);
			if (filters.length) {
				noFilters = false;
				ret += Bb + trS("report.search.title")
					+ Eb + ' ' + trS("report.search.only")
					+ ' ' + getNaturalList(filters)
					+ ' ' + trS("report.search.included") + Br;
			}

			if (isBeta)
				ret += Br + Bb + trS("report.beta.warning") + Eb + Br
					+ trS("report.beta.text")
					+ Br + Bb + trS("report.beta.share") + Eb + Br
					;
		}
		return ret;
	}
	// returns document sub header
	function getSubHeader(strTitle) {
		return Bh2 + strTitle + Eh2;
	}
	// returns text representation of access list
	function getTextACL(acl) {
		if (acl)
			return acl.split(',').join(', ');
		else
			return '*';
	}
	// returns check properties
	function getCheckProperties(checkID, ccode, showSeverity, showCountry) {
		var check = _RT.$checks[checkID];
		var ret = "";
		if (showSeverity && check.SEVERITY && RS_MAX > check.SEVERITY)
			ret += Bb
				+ trS("report.list.severity") + ' ' + Eb + getTextSeverity(check.SEVERITY)
				+ (check.REPORTONLY ?
					" (" + trS("report.list.reportOnly") + ")" : "")
				+ Br;
		if (1 < check.FORLEVEL)
			ret += Bb + trS("report.list.forEditors")
				+ ' ' + Eb + check.FORLEVEL + ' '
				+ trS("report.list.andUp") + Br;
		if (showCountry)
			ret += Bb + trS("report.list.forCountries")
				+ ' ' + Eb + getTextACL(check.FORCOUNTRY) + Br;
		if (check.FORCITY)
			ret += Bb + trS("report.list.forCities")
				+ ' ' + Eb + getTextACL(check.FORCITY) + Br;

		var options;
		if (check.OPTIONS && (options = getCheckOptions(checkID, ccode))) {
			var defParams = ccode === _I18n.$defLng;
			var arrParams = [];
			for (var optionName in options) {
				// skip options with dots and numbers
				if (!/^[a-z]+$/i.test(optionName))
					continue;
				var optionTitle = options[optionName + '.title'];
				if (defParams && !optionTitle)
					continue;
				arrParams.push({
					$name: optionName,
					$title: optionTitle,
					$value: options[optionName]
				});
			}
			if (arrParams.length) {
				ret += Bb;
				var country = _I18n.getCapitalizedCountry(ccode) || ccode;
				if (defParams)
					ret += trS("report.list.params");
				else
					ret += trSO("report.list.params.set", { "country": country });
				ret += Eb + Bcode + '"' + checkID + '.params": {\n';

				for (var i = 0; i < arrParams.length; i++) {
					var param = arrParams[i];
					if (defParams)
						ret += '  // ' + param.$title + '\n';
					ret += '  "' + param.$name + '": '
						+ JSON.stringify(param.$value) + ',' + '\n';
				}
				ret += "}," + Ecode;
			}
		}
		return ret;
	}
	function addTextLabels(pack, label, defSet, oldPack) {
		var defData = (defSet[label] || '')
			.replace(new RegExp('^W:'), PFX_WIKI)
			.replace(new RegExp('^F:'), PFX_FORUM)
			;
		var origData = (oldPack[label] || '');
		if (origData) {
			var oldData = origData
				.replace(new RegExp('^' + GL_TODOMARKER), '')
				.replace(new RegExp('^W:'), PFX_WIKI)
				.replace(new RegExp('^F:'), PFX_FORUM)
				;
			// preserve old data
			var oldDataEN = (oldPack[label + '.en'] || '')
				.replace(new RegExp('^W:'), PFX_WIKI)
				.replace(new RegExp('^F:'), PFX_FORUM)
				;
			if (oldDataEN) {
				if (oldDataEN === defData) {
					// no changes
					pack[label + '.en'] = defData;
					pack[label] = origData;
				}
				else {
					// new default string
					pack[label + '.en'] = defData;
					pack[label] = GL_TODOMARKER + oldData;
				}
			}
			else {
				// no english data
				// we assume no changes
				pack[label + '.en'] = defData;
				pack[label] = origData;
			}
		}
		else {
			// no old data
			// mark line for translation
			pack[label + '.en'] = defData;
			pack[label] = GL_TODOMARKER + defData;
		}
	}
	// returns new pack header
	function getPackHeader(country, lng) {
		return '// ==UserScript==' + Br
			+ '// @name                ' + WV_NAME + ' Localization for ' + country + Br
			+ '// @version             ' + WV_VERSION + Br
			+ '// @description         This script localizes ' + WV_NAME + ' for ' + country
			+ '. You also need main package (' + WV_NAME + ') installed.' + Br
			+ '// @match               https://editor-beta.waze.com/*editor/*' + Br
			+ '// @match               https://www.waze.com/*editor/*' + Br
			+ '// @grant               none' + Br
			+ '// @run-at              document-start' + Br
			+ '// ==/UserScript==' + Br
			+ '//' + Br
			+ '/*' + Br
			+ (lng ?
				'  Please translate all the lines marked with "' + GL_TODOMARKER + '"' + Br
				+ '  Please DO NOT change ".en" properties. To override english text use "titleEN",' + Br
				+ '  "problemEN" and "solutionEN" properties (see an example below).' + Br
				+ Br
				: '')
			+ '  See Settings->About->Available checks for complete list of checks and their params.' + Br
			+ Br
			+ '  Examples:' + Br
			+ Br
			+ '  Enable #170 "Lowercase street name" but allow lowercase "exit" and "to":' + Br
			+ '    "170.enabled": true,' + Br
			+ '    "170.params": {' + Br
			+ '        "regexp": "/^((exit|to) )?[a-z]/",' + Br
			+ '    "},' + Br
			+ Br
			+ '  Enable #130 "Custom check" to find a dot in street names, but allow dots at Ramps:' + Br
			+ '    "130.enabled": true,' + Br
			+ '    "130.params": {' + Br
			+ '        "titleEN": "Street name with a dot",' + Br
			+ '        "problemEN": "There is a dot in the street name (excluding Ramps)",' + Br
			+ '        "solutionEN": "Expand the abbreviation or remove the dot",' + Br
			+ '        "template": "${type}:${street}",' + Br
			+ '        "regexp": "D/^[^4][0-9]?:.*\\\\./",' + Br
			+ '    },' + Br
			+ '    *Note: use D at the beginning of RegExp to enable debugging on JS console.' + Br
			+ '    *Note: do not forget to escape backslashes in strings, i.e. use "\\\\" instead of "\\".' + Br
			+ '*/' + Br
			;
	}
	// returns new pack
	function getPack(country, ccode, lng) {
		var ucountry = country.toUpperCase();
		var _country = country.split(' ').join('_');
		var oldPack = _I18n.$translations[ccode] || {};

		var ret = ''
			+ Br
			+ 'window.' + WV_NAME_ + '_' + _country + ' = '
			;

		var newCountries = [];
		for (var k in _I18n.$country2code) {
			if (ccode === _I18n.$country2code[k]
				&& ucountry !== k)
				newCountries.push(_I18n.capitalize(k));
		}
		// add current country to the top of the list
		newCountries.unshift(country);

		// add current user to authors
		var newAuthor = oldPack[".author"] || _RT.$topUser.$userName;
		if (-1 === newAuthor.indexOf(_RT.$topUser.$userName))
			newAuthor += " and " + _RT.$topUser.$userName;

		var newLink = oldPack[".link"] || GL_TODOMARKER;

		var pack = {
			".country": (1 === newCountries.length ?
				newCountries[0]
				: newCountries),
			".codeISO": ccode,

			".author": newAuthor,
			".updated": _nowISO,
			".link": newLink,
		};
		if (ccode in _I18n.$code2code)
			pack[".fallbackCode"] = _I18n.$code2code[ccode];

		if (lng) {
			if (ccode in _I18n.$code2dir)
				pack[".dir"] = _I18n.$code2dir[ccode];

			var newLngs = [];
			for (var k in _I18n.$lng2code) {
				if (ccode === _I18n.$lng2code[k]
					&& k !== lng)
					newLngs.push(k);
			}
			// add current lng to the top of the list
			newLngs.unshift(lng);
			pack[".lng"] = (1 === newLngs.length ?
				newLngs[0]
				: newLngs);
		}

		// compare and add UI strings
		if (lng) {
			for (var label in _I18n.$defSet) {
				// skip meta labels and checks
				if (/^\./.test(label)
					|| /^[0-9]/.test(label))
					continue;

				// get data
				addTextLabels(pack, label, _I18n.$defSet, oldPack);
			}
		}

		// compare and add checks
		var allLabels = _RT.$otherLabels.concat(_RT.$textLabels);
		var arrDepCodes = _I18n.getDependantCodes(ccode);
		for (var i = 1; i < MAX_CHECKS; i++) {
			// skip mirror checks
			if ((CK_MIRRORFIRST + 100) <= i
				&& (CK_MIRRORLAST + 100) >= i)
				continue;
			// check is enabled?
			var label = i + '.enabled';

			var checkEnabled = false;
			if (_I18n.$defSet[label] || oldPack[label])
				checkEnabled = true;
			if (!checkEnabled) {
				// check dependant countries
				for (var depC = 0; depC < arrDepCodes.length; depC++) {
					var depCode = arrDepCodes[depC];
					if (_I18n.$translations[depCode]
						&& _I18n.$translations[depCode][label])
						checkEnabled = true;
				}
			}
			// check if check is no longer exist
			if (checkEnabled && !((i + '.title') in _I18n.$defSet)) {
				pack[i + '.note'] = GL_TODOMARKER + "The check #" + i + " is no longer exist. See the forum thread for more details.";
				continue;
			}

			for (var j = 0; j < allLabels.length; j++) {
				var labelSfx = allLabels[j];
				label = i + '.' + labelSfx;

				var defData = _I18n.$defSet[label];
				var oldData = oldPack[label];

				if (classCodeDefined(defData) || classCodeDefined(oldData)) {
					if (-1 !== _RT.$textLabels.indexOf(labelSfx)) {
						// text label
						if (lng && checkEnabled)
							addTextLabels(pack, label, _I18n.$defSet, oldPack);
					}
					else {
						// copy and clear compiled params
						if ("params" === labelSfx) {
							if (!classCodeDefined(oldData))
								continue;
							defData = deepCopy(defData || {});
							oldData = deepCopy(oldData);
							for (var k = CO_MIN; k <= CO_MAX; k++) {
								delete defData[k];
								delete oldData[k];
							}
							for (var k in defData) {
								if (!defData.hasOwnProperty(k)) continue;
								if (/\.title$/.test(k))
									delete defData[k];
							}
						}

						// non-text label
						if (!deepCompare(defData, oldData))
							pack[label] = oldData;
					}
				}
			}
		}

		ret += JSON.stringify(pack, null, '  ') + ';\n';

		return ret;
	}

	// returns list of checks
	function getListOfChecks(countryID, country) {
		var ucountry = country.toUpperCase();
		var ccode = "";
		if (countryID)
			ccode = _I18n.getCountryCode(ucountry);

		var ret = trS("report.list.see") + ' ' + Bb
			+ trS("report.list.checks") + Eb + Br + Br;

		var fallbacks = '';
		if (ccode)
			for (var i in _I18n.$country2code) {
				if (!_I18n.$country2code.hasOwnProperty(i)) continue;

				if (i === ucountry)
					continue;

				var acode = _I18n.$country2code[i];
				if (ccode && acode !== ccode)
					continue;

				fallbacks += _I18n.capitalize(i)
					+ ' \u2192 '
					+ country + Br;
			}
		for (var i in _I18n.$code2code) {
			if (!_I18n.$code2code.hasOwnProperty(i)) continue;

			var countryFrom = _I18n.getCapitalizedCountry(i);
			var countryTo = _I18n.getCapitalizedCountry(_I18n.$code2code[i]);
			if (ccode && i !== ccode && _I18n.$code2code[i] !== ccode)
				continue;
			if (country && countryFrom !== country && countryTo !== country)
				continue;
			fallbacks += countryFrom + ' (' + i + ') \u2192 '
				+ countryTo
				+ ' (' + _I18n.$code2code[i] + ')' + Br;
		}
		if (fallbacks)
			ret += Bb + trS("report.list.fallback") + Eb + Br
				+ fallbacks;

		var sortedIDs = getSortedCheckIDs();
		if (ccode) {
			// country
			var enabledIDs = [];
			var disabledIDs = [];

			// check if enabled for country
			sortedIDs.forEach(function (cid) {
				var c = _RT.$checks[cid];
				if (!c) return;
				// do not show global access
				if (RS_MAX === c.SEVERITY) return;

				var en = true;
				var forCountry = c.FORCOUNTRY;
				if (forCountry) {
					if (!_WV.checkAccessFor(forCountry, function (e) {
						if (e in _I18n.$code2country)
							return _I18n.$code2country[e] === ucountry;
						error("Please report: fc=" + e);
						return false;
					}))
						en = false;
				}
				if (en)
					enabledIDs.push(cid);
				else
					disabledIDs.push(cid);
			});

			ret += Bh2 + trSO("report.list.enabled", { "n": enabledIDs.length })
				+ ' ' + country + ":" + Eh2 + Bul;
			enabledIDs.forEach(function (cid) {
				ret += Bli + getCheckDescription(cid, countryID, Bb, Eb + Br)
					+ Bsmall;
				ret += getCheckProperties(cid, ccode, false, false);
				ret += Esmall + Eli;
			});
			ret += Eul;

			ret += Bh2 + trSO("report.list.disabled", { "n": disabledIDs.length })
				+ ' ' + country + ":" + Eh2 + Bul;
			disabledIDs.forEach(function (cid) {
				ret += Bli + getCheckDescription(cid, 0, Bb, Eb + Br) + Bsmall;
				ret += getCheckProperties(cid, _I18n.$defLng, false, true);
				ret += Esmall + Eli;
			});
			ret += Eul;
		}
		else {
			// no country
			ret += Bh2 + trSO("report.list.total", { "n": sortedIDs.length }) + ':'
				+ Eh2 + Bul;
			sortedIDs.forEach(function (cid) {
				var c = _RT.$checks[cid];
				if (!c) return;
				// do not show global access
				if (RS_MAX === c.SEVERITY) return;

				ret += Bli + getCheckDescription(cid, 0, Bb, Eb + Br) + Bsmall;
				ret += getCheckProperties(cid, _I18n.$defLng, false, true);
				ret += Esmall + Eli;
			});
			ret += Eul;
		}

		return ret;
	}
	// returns HTML footer
	function getHTMLFooter() {
		return '\n<hr>'
			+ '\n<center dir="ltr"><small>' + WV_NAME + ' v' + WV_VERSION + '<br>&copy; 2013-2018 Andriy Berestovskyy</small></center>'
			+ '\n</body></html>'
			;
	}
	// returns text area header
	function getTAHeader(h) {
		var ret =
			'\n<p>'
			+ (RF_CREATEPACK === reportFormat ?
				trS("msg.textarea.pack")
				: trS("msg.textarea"))
			+ ':</p>'
			+ '\n<p><textarea style="resize:vertical;width:100%;height:' + h + '">';
		setFormat(RF_BB);
		return ret;
	}
	// returns text area footer
	function getTAFooter() {
		setFormat(RF_HTML);
		return '\n</textarea></p>';
	}
	// returns size warning
	function getSizeWarning(size) {
		return 5e4 < size ?
			'\n<p style="color:#e00">'
			+ trSO("report.size.warning", { "n": size })
			+ '</p>'
			: '';
	}
	// opens new browser window
	function openWindow(data) {
		UW.open("data:text/html;charset=UTF-8," + encodeURIComponent(data),
			"_blank");
	}
	// opens new browser window for final report
	/** @param {string=} title */
	function openWindowFR(title) {
		var encFR = "data:text/html;charset=UTF-8,";
		if (newWin) {
			// insert save button
			if (reportFormat === RF_HTML) {
				title = title.split(" ").join("_");
				newWin.document.write(FRheader);
				var saveRep = FRheader;
				saveRep += FR;
				saveRep += FRfooter;
				saveRep = encodeURIComponent(saveRep);
				var saveLink = '<br><a download="';
				saveLink += title;
				saveLink += '_';
				saveLink += _nowISO;
				saveLink += '.html" href="data:text/html;charset=UTF-8,';
				saveLink += saveRep;
				saveRep = '';
				saveLink += '"><button>';
				saveLink += trS("report.save");
				saveLink += '</button></a><br>';
				newWin.document.write(saveLink);
				newWin.document.write(FR);
				newWin.document.write(saveLink);
				newWin.document.write(FRfooter);
			}
			else
				newWin.document.write(FR);
		}
		else {
			encFR += encodeURIComponent(FRheader);
			FRheader = '';
			encFR += encodeURIComponent(FR);
			FR = '';
			encFR += encodeURIComponent(FRfooter);
			FRfooter = '';
			UW.open(encFR, "_blank");
		}
	}
	// filter helpers
	var seenSegments = {};
	var lastCheckID = -1;
	var lastCityID = -1;
	var lastStreetID = -1;
	var counterNotes = 0;
	var counterWarnings = 0;
	var counterErrors = 0;
	var counterCustoms1 = 0;
	var counterCustoms2 = 0;
	// reset filter
	function resetFilter() {
		seenSegments = {};
		lastCheckID = -1;
		lastCityID = -1;
		lastStreetID = -1;
		counterNotes = 0;
		counterWarnings = 0;
		counterErrors = 0;
		counterCustoms1 = 0;
		counterCustoms2 = 0;
	}
	// returns TOC
	function getTOC() {
		resetFilter();
		FR += '\n<br><div id="contents">';
		FR += '\n<big><b>';
		FR += trS("report.contents");
		FR += '</b></big>';
		FR += '\n<ol>';
		traverseReport(function (obj) {
			if (checkFilter(0, obj.$segmentCopy, seenSegments)
				&& getFilteredSeverity(obj.$check.SEVERITY, obj.$checkID, false)) {
				if (obj.$checkID !== lastCheckID) {
					lastCheckID = obj.$checkID;
					var check = obj.$check;

					var strCountry = _REP.$countries[obj.$segmentCopy.$countryID];
					var ccode = "";

					if (strCountry)
						ccode = _I18n.getCountryCode(strCountry.toUpperCase());
					else {
						// try top country
						ccode = _RT.$cachedTopCCode;
					}
					var options = trO(check.OPTIONS, ccode)
					FR += '\n<li class="';
					FR += getTextSeverity(obj.$check.SEVERITY);
					FR += '"><a href="#a';
					FR += lastCheckID;
					FR += '">';
					FR += exSOS(check.TITLE, options, "titleEN");
					FR += '</a></li>';
				}
				// TODO:
				// bug: TOC item shows duplicate segments
				// solution: filter, then create the toc and report

				// alt solution: remove dublicate checks!
				//              return RT_NEXTCHECK;
			}
		});

		FR += '\n<li><a href="#a">';
		FR += trS("report.summary");
		FR += '</a></li>';
		FR += '\n</ol>\n</div>';
	}
	// get sorted check IDs
	function getSortedCheckIDs() {
		return _RT.$sortedCheckIDs ? _RT.$sortedCheckIDs
			: _RT.$sortedCheckIDs =
			Object.keys(_RT.$checks)
				.sort(cmpCheckIDs);
	}
	// _REP->$cityIDs->streetIDs->$segmentIDs->$reportIDs
	// traverse report and call a handler
	function traverseReport(handler) {
		var mapCenter = WM.getCenter();

		// get sorted cities
		function getSortedCities() {
			var ret = _REP.$sortedCityIDs;
			if (!ret || ret.length != _REP.$unsortedCityIDs.length)
				return _REP.$sortedCityIDs =
					[].concat(_REP.$unsortedCityIDs).sort(function (a, b) {
						return _repC[a].localeCompare(_repC[b]);
					});
			return ret;
		}
		// get sorted streets
		function getSortedStreets(repC) {
			var ret = repC.$sortedStreetIDs;
			if (!ret || ret.length != repC.$unsortedStreetIDs.length)
				return repC.$sortedStreetIDs
					= [].concat(repC.$unsortedStreetIDs).sort(function (a, b) {
						return _repS[a].localeCompare(_repS[b]);
					});
			return ret;
		}
		// get hypot
		function getHypot(c1, c2) {
			//          return Math.round(Math.sqrt(c1*c1 + c2*c2)*10);
			return Math.sqrt(c1 * c1 + c2 * c2);
		}
		// get sorted segments
		function getSortedSegments(repS) {
			var ret = repS.$sortedSegmentIDs;
			var repSeg = repS.$segmentIDs;
			if (!ret || ret.length != repS.$unsortedSegmentIDs.length)
				return repS.$sortedSegmentIDs
					= [].concat(repS.$unsortedSegmentIDs).sort(function (a, b) {
						var segA = repSeg[a], segB = repSeg[b];
						if (segA.$typeRank !== segB.$typeRank)
							return segB.$typeRank - segA.$typeRank;
						// if ranks are the same - sort by the distance
						/** @const */
						var distAB = getHypot(segA.$center.lat - segB.$center.lat,
							segA.$center.lon - segB.$center.lon);
						// the segments are close
						if (0.002 > distAB) return 0;
						/** @const */
						var distA = getHypot(mapCenter.lat - segA.$center.lat,
							mapCenter.lon - segA.$center.lon);
						/** @const */
						var distB = getHypot(mapCenter.lat - segB.$center.lat,
							mapCenter.lon - segB.$center.lon);
						return distA - distB;
					});
			return ret;
		}

		///////////////////////////////////////////////////////////////////
		// For all sorted checks
		var checkIDs = getSortedCheckIDs();
		nextCheck: for (var i = 1; i < checkIDs.length; i++) {
			var checkID = checkIDs[i];
			var check = _RT.$checks[checkID];
			if (!check) continue;

			// filter minor issues
			if (_UI.pMain.pFilter.oExcludeNotes.CHECKED
				&& RS_NOTE === check.SEVERITY
			)
				continue;

			// for all cities
			var sortedCities = getSortedCities();
			for (var sorcid = 0; sorcid < sortedCities.length; sorcid++) {
				var cid = sortedCities[sorcid];
				var repC = _REP.$cityIDs[cid];

				// for all streets
				var sortedStreets = getSortedStreets(repC);
				for (var sorsid = 0; sorsid < sortedStreets.length; sorsid++) {
					var sid = sortedStreets[sorsid];
					var repS = repC.$streetIDs[sid];

					// for all segment copies
					var sortedSegments = getSortedSegments(repS);
					for (var sorscid = 0; sorscid < sortedSegments.length; sorscid++) {
						var scid = sortedSegments[sorscid];
						var sc = repS.$segmentIDs[scid];
						if (checkID in sc.$reportIDs) {
							var obj = {
								$checkID: checkID,
								$check: check,
								$param: sc.$reportIDs[checkID],
								$cityParam: repC.$params[checkID],
								$streetParam: repS.$params[checkID],
								$segmentCopy: sc
							};
							switch (handler(obj)) {
								case RT_STOP:
									return;
								case RT_NEXTCHECK:
									continue nextCheck;
							};
						} // checkID in reportIDs
					} // for all segmets
				} // for all streets
			} // for all cities
		} // for all checks
	}

	// closes report street
	function closeReportStreet() {
		if (0 <= lastStreetID || 0 <= lastCityID) {
			lastStreetID = -1;
			FR += Eli;
		}
	}
	// closes report city
	function closeReportCity() {
		if (0 <= lastCityID) {
			lastCityID = -1;
			closeReportStreet();
			FR += Eul;
		}
	}
	// closes report check
	function closeReportCheck() {
		if (0 <= lastCheckID) {
			if (LIMIT_PERCHECK < _repRC[lastCheckID]) {
				if (1 === _repRC[lastCheckID] - LIMIT_PERCHECK)
					FR += '[and more...]';
				else {
					FR += '[and ';
					FR += (_repRC[lastCheckID] - LIMIT_PERCHECK);
					FR += ' segments more...]';
				}
			}
			lastCheckID = -1;
			closeReportCity();
		}
		if (RF_HTML === curFormat)
			FR += '</div>';
	}
	// returns check description
	function getCheckDescription(checkID, countryID, headB, headE) {
		var check = _RT.$checks[checkID];
		var ret = headB;
		var strCountry = _REP.$countries[countryID];
		var ccode = "";

		if (strCountry)
			ccode = _I18n.getCountryCode(strCountry.toUpperCase());
		else {
			// try top country
			ccode = _RT.$cachedTopCCode;
		}
		var options = trO(check.OPTIONS, ccode);

		if (check.COLOR)
			ret += Bcolor + check.COLOR + Ccolor + '\u2588\u2588 ' + Ecolor;
		ret += ''
			+ (countryID ? exSOS(check.TITLE, options, "titleEN") : check.TITLE)
			+ ' (#' + checkID + ')'
			+ headE;

		var sevColor = GL_NOTECOLOR;
		switch (check.SEVERITY) {
			case RS_WARNING:
				sevColor = GL_WARNINGCOLOR;
				break;
			case RS_ERROR:
				sevColor = GL_ERRORCOLOR;
				break;
			case RS_CUSTOM1:
				sevColor = GL_CUSTOM1COLOR;
				break;
			case RS_CUSTOM2:
				sevColor = GL_CUSTOM2COLOR;
				break;
		}

		if (check.PROBLEM) {
			ret += Bcolor + sevColor + Ccolor
				+ (countryID ? exSOS(check.PROBLEM, options, "problemEN")
					: check.PROBLEM);
			var pl = trO(check.PROBLEMLINK, ccode);
			if (pl) {
				ret += ': ' + Ba + pl + Ca
					+ trO(check.PROBLEMLINKTEXT, ccode) + Ea;
			}
			else
				ret += '.';

			ret += Ecolor + Br;
		}

		if (check.SOLUTION) {
			ret += (countryID ? exSOS(check.SOLUTION, options, "solutionEN")
				: check.SOLUTION);
			var sl = trO(check.SOLUTIONLINK, ccode);
			if (sl) {
				ret += ': ' + Ba + sl + Ca
					+ trO(check.SOLUTIONLINKTEXT, ccode) + Ea;
			}
			else
				ret += '.';

			ret += Br;
		}

		return ret;
	}
	// returns report check
	function getReportCheck(obj) {
		closeReportCheck();

		if (RF_HTML === curFormat) {
			FR += '<div class="';
			FR += getTextSeverity(obj.$check.SEVERITY);
			FR += '"><a name="a';
			FR += obj.$checkID;
			FR += '"></a>';
		}

		FR += getCheckDescription(obj.$checkID, obj.$segmentCopy.$countryID,
			Bh2, Eh2);
		FR += Br;
	}
	// returns report city
	function getReportCity(obj) {
		closeReportCity();
		FR += Bbig;
		FR += Bb;
		FR += checkNoCity(_repC[obj.$segmentCopy.$cityID]);
		FR += Eb;
		FR += Ebig;
		if (obj.$cityParam) {
			FR += Mdash;
			FR += obj.$cityParam;
		}
		FR += Bul;
	}
	// returns report street
	function getReportStreet(obj) {
		closeReportStreet();
		FR += Bli;
		FR += checkNoStreet(_repS[obj.$segmentCopy.$streetID]);
		FR += ', ';
		FR += checkNoCity(_repC[obj.$segmentCopy.$cityID]);
		if (obj.$streetParam) {
			FR += Mdash;
			FR += obj.$streetParam;
		}
		FR += Br;
	}

	// returns permalink
	function getPermalink(obj) {
		var z = SCAN_ZOOM;
		if (50 > obj.$segmentCopy.$length)
			z = 7;
		else if (500 > obj.$segmentCopy.$length) {
			if (6 > z) z += 1;
		}
		else
			z = 4;
		FR += window.location.origin;
		FR += window.location.pathname;
		FR += '?zoom=';
		FR += z;
		FR += '&lat=';
		FR += obj.$segmentCopy.$center.lat;
		FR += '&lon=';
		FR += obj.$segmentCopy.$center.lon;
		FR += '&env=';
		FR += nW.location.code;
		FR += '&segments=';
		FR += obj.$segmentCopy.$segmentID;
	}
	// report item handler
	function getReportItem(obj) {
		if (!checkFilter(0, obj.$segmentCopy, seenSegments)
			|| !getFilteredSeverity(obj.$check.SEVERITY, obj.$checkID, false))
			return;

		// update max severity
		if (_REP.$maxSeverity < obj.$check.SEVERITY)
			_REP.$maxSeverity = obj.$check.SEVERITY;

		if (obj.$checkID !== lastCheckID) {
			getReportCheck(obj);
			if (noFilters) {
				var c = _repRC[obj.$checkID];
				switch (obj.$check.SEVERITY) {
					case RS_NOTE:
						counterNotes += c;
						break;
					case RS_WARNING:
						counterWarnings += c;
						break;
					case RS_ERROR:
						counterErrors += c;
						break;
					case RS_CUSTOM1:
						counterCustoms1 += c;
						break;
					case RS_CUSTOM2:
						counterCustoms2 += c;
						break;
				}
			}
		}
		if (obj.$segmentCopy.$cityID !== lastCityID)
			getReportCity(obj);
		if (obj.$segmentCopy.$streetID !== lastStreetID)
			getReportStreet(obj);
		lastCheckID = obj.$checkID;
		lastCityID = obj.$segmentCopy.$cityID;
		lastStreetID = obj.$segmentCopy.$streetID;

		if (!noFilters) {
			switch (obj.$check.SEVERITY) {
				case RS_NOTE:
					counterNotes++;
					break;
				case RS_WARNING:
					counterWarnings++;
					break;
				case RS_ERROR:
					counterErrors++;
					break;
				case RS_CUSTOM1:
					counterCustoms1++;
					break;
				case RS_CUSTOM2:
					counterCustoms2++;
					break;
			}
		}

		FR += BaV;
		getPermalink(obj);
		FR += Ca
		if (isBeta) FR += 'B:';
		FR += obj.$segmentCopy.$segmentID;
		FR += Ea;
		FR += ' ';
	}
	// returns total counters
	function getSummary() {
		if (RF_HTML === curFormat)
			FR += '<a name="a"></a>';

		FR += Bh2;
		FR += trS("report.summary");
		FR += Eh2;
		FR += Bb;
		FR += trS("report.segments");
		FR += Eb;
		FR += ' ';
		FR += _REP.$counterTotal;
		FR += Br;
		if (counterCustoms1 || counterCustoms2) {
			FR += Bb;
			FR += trS("report.customs");
			FR += Eb;
			FR += ' ';
			FR += counterCustoms1;
			FR += '/';
			FR += counterCustoms2;
			if (_REP.$isLimitPerCheck)
				FR += '*';
			FR += Br;
		}

		FR += Bb;
		FR += trS("report.reported");
		FR += Eb;
		FR += ' ';
		var summary = [];
		if (counterErrors)
			summary.push(Bb + trS("report.errors") + Mdash + Eb + ' '
				+ counterErrors
				+ (_REP.$isLimitPerCheck ? '*' : '')
				+ ' (' + Math.round(counterErrors * 1e3 / _REP.$counterTotal)
				+ '\u2030)'
			);
		if (counterWarnings)
			summary.push(Bb + trS("report.warnings") + Mdash + Eb + ' '
				+ counterWarnings
				+ (_REP.$isLimitPerCheck ? '*' : '')
				+ ' (' + Math.round(counterWarnings * 1e3 / _REP.$counterTotal)
				+ '\u2030)'
			);
		if (counterNotes)
			summary.push(Bb + trS("report.notes") + Mdash + Eb + ' ' + counterNotes
				+ (_REP.$isLimitPerCheck ? '*' : '')
			);

		FR += getNaturalList(summary);
		FR += Br;

		if (_REP.$isLimitPerCheck) {
			FR += trS("report.note.limit");
			FR += Br;
		}

		FR += Br;
		FR += trS("report.forum");
		FR += ' ';
		FR += Ba;
		FR += PFX_FORUM;
		FR += FORUM_HOME;
		FR += Ca;
		FR += trS("report.forum.link");
		FR += Ea;
		FR += Br;
		FR += Br;
		FR += trS("report.thanks");
		FR += Br;
	}
	// returns report
	function getReport(fmt) {
		var oldFormat = curFormat;
		setFormat(fmt);

		resetFilter();
		_REP.$maxSeverity = 0;

		traverseReport(function (e) {
			getReportItem(e)
		});

		closeReportCheck();
		getSummary();

		setFormat(oldFormat);
	}
	// update max severity
	function updateMaxSeverity() {
		resetFilter();
		_REP.$maxSeverity = 0;

		traverseReport(function (obj) {
			if (checkFilter(0, obj.$segmentCopy, seenSegments)
				&& getFilteredSeverity(obj.$check.SEVERITY, obj.$checkID, false)) {
				if (_REP.$maxSeverity < obj.$check.SEVERITY)
					_REP.$maxSeverity = obj.$check.SEVERITY;
				if (_RT.$curMaxSeverity === _REP.$maxSeverity)
					return RT_STOP;
			}
		});
	}

	// prepare report
	setFormat(RF_HTML);
	var t = trS("report.title");
	switch (reportFormat) {
		case RF_UPDATEMAXSEVERITY:
			updateMaxSeverity();
			break;
		case RF_CREATEPACK:
			var wType = "Localization Package Wizard";
			if (!window.confirm(getMsg(wType,
				"\nBefore starting the Wizard:"
				+ "\n\n1. Position WME over your country"
				+ "\n   so the Wizard will know your country name"
				+ "\n\n2. Switch WME to your language"
				+ "\n   so the Wizard will add translations into the package"
				+ "\n\n3. Enable any previous version of localization pack"
				+ "\n   so the Wizard will preserve already translated text"
				,
				true)))
				break;
			// prompt for country
			var country = _RT.$topCity && _RT.$topCity.$country ?
				_RT.$topCity.$country
				: window.prompt(
					getMsg(wType,
						"\nWME country name (example: United Kingdom):", true))
				;
			if (!country)
				break;
			var ucountry = country.toUpperCase();

			// prompt for country code
			var ccode = _I18n.getCountryCode(ucountry) ?
				_I18n.getCountryCode(ucountry)
				: window.prompt(
					getMsg(wType,
						"\nISO 3166-1 Alpha-2 country code (example: UK):", true));
			;
			if (!ccode)
				break;
			ccode = ccode.toUpperCase();

			// prompt for language
			var lng = window.prompt(
				getMsg(wType,
					"\nPlease confirm the WME language code:"
					+ "\n\nfor \"EN\" no translations will be included into the package"
					+ "\nfor any other code the translations will be included"
					,
					true),
				_RT.$lng);
			if (!lng)
				break;
			lng = lng.toUpperCase();

			if (_I18n.$defLng === lng)
				t = "Minimal Localization for " + country;
			else
				t = "Localization and Translation for " + country;

			if (_I18n.$defLng === lng)
				lng = '';

			var lPack =
				getHTMLHeader(t)
				+ getHeader(t)
				+ getTAHeader('400px')
				+ getPackHeader(country, lng)
				+ getPack(country, ccode, lng)
				;
			// generate dependants
			var arrDepCodes = _I18n.getDependantCodes(ccode);
			for (var i = 0; i < arrDepCodes.length; i++) {
				var depCode = arrDepCodes[i];
				var depCountry = _I18n.getCapitalizedCountry(depCode);
				if (depCountry && depCode) {
					lPack += '\n// Dependant package:';
					lPack += getPack(depCountry, depCode, '');
				}
			}

			openWindow(
				lPack
				+ getTAFooter()
				+ getHTMLFooter()
			);
			break;
		case RF_LIST:
			var countryID = 0;
			var country = "";
			t = trS("report.list.title") + ' ';
			// try top city
			if (_RT.$topCity && _RT.$topCity.$country) {
				countryID = _RT.$topCity.$countryID;
				country = _RT.$topCity.$country;
				t += country + " (v" + WV_VERSION + ")";
			}
			else
				t += "v" + WV_VERSION;
			openWindow(
				getHTMLHeader(t)
				+ getHeader(t)
				+ getListOfChecks(countryID, country)
				+ getTAHeader('200px')
				+ getHeader(t)
				+ getListOfChecks(countryID, country)
				+ getTAFooter()
				+ getHTMLFooter()
			);
			break;
		case RF_HTML:
			// open new window
			if (-1 !== window.navigator.vendor.indexOf("Google"))
				newWin = UW.open("", "_blank");
			FR += getHTMLHeader(t);
			FR += getHeader(t);
			// save header to insert save button
			FRheader = FR;
			FR = '';
			getTOC();
			getReport(RF_HTML);
			// ignore empty reports
			if (0 === counterNotes + counterWarnings + counterErrors
				+ counterCustoms1 + counterCustoms2) {
				if (newWin)
					newWin.close();
				async(F_UPDATEUI);
				break;
			}
			FRfooter += getHTMLFooter();
			openWindowFR(t);
			break;
		case RF_BB:
			// open new window
			if (-1 !== window.navigator.vendor.indexOf("Google"))
				newWin = UW.open("", "_blank");

			var tf = t + " " + trS("report.share");
			FR += getHTMLHeader(tf);
			FR += getHeader(tf);
			FR += getTAHeader('200px');
			var beforeShareLen = FR.length;
			FR += getHeader(t);
			getReport(RF_BB);
			var shareLen = FR.length - beforeShareLen;

			// ignore empty reports
			if (0 === counterNotes + counterWarnings + counterErrors
				+ counterCustoms1 + counterCustoms2) {
				if (newWin)
					newWin.close();
				//          updateMaxSeverity();
				async(F_UPDATEUI);
				break;
			}
			FR += getTAFooter();
			FR += getSizeWarning(shareLen);
			FR += getHTMLFooter();
			openWindowFR();
			break;
	}

	resetFilter();
}
