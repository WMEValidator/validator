/*
 * login.js -- WME Validator initialization on user login
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
 * Login new user
 */
function F_LOGIN()
{
	log("login " + WLM.user.userName);

	///////////////////////////////////////////////////////////////////////
	// Support Functions
	/**
	 * Parse access list and returns array of rules
	 */
	_WV.parseAccessList = function(s)
	{
		var a = s.split(/\s*,\s*/)
		var res = [];
		a.forEach(function(r, i) {
			var n = false;
			if("!" === r.charAt(0))
				n = true, r = r.slice(1);
			res[i] = {$id: r, $not: n}
		});
		return res;
	}

	/**
	 * Check for list of rules
	 */
	_WV.checkAccessFor = function(forStr, cmpFunc)
	{
		// empty list is true
		if(!forStr)
			return true;
		var l = _WV.parseAccessList(forStr);
		// empty list is true
		if(!l.length)
			return true;
		for(var i = 0; i < l.length; i++)
		{
			var r = l[i];
			if("*" === r.$id || cmpFunc(r.$id))
			{
				// match found
				if(r.$not)
					return false;
				else
					return true;
			}
		}
		// non-empty list did not match - false
		return false;
	}
	// Generate mirror checks
	function mirrorChecks(defTranslation)
	{
		var allLabels = _RT.$otherLabels.concat(_RT.$textLabels);
		for(var i = CK_MIRRORFIRST; i <= CK_MIRRORLAST; i++)
		{
			allLabels.forEach(function(l) {
				var label = i + '.' + l;
				if(!(label in defTranslation)) return;

				var value = defTranslation[label];
				var mLabel = (i + 100) + '.' + l;
				switch(l)
				{
				case "title":
				case "problem":
				case "solution":
					defTranslation[mLabel] = value.replace(/ A($|\b)/g, " B");
					break;
				case "params":
					defTranslation[mLabel] = deepCopy(value);
					break;
				default:
					defTranslation[mLabel] = value;
					break;
				}
			});
		}
	} // mirorChecks


	///////////////////////////////////////////////////////////////////////
	// Runtime private variables
	/** @struct */
	_RT = {
		// package labels
		$textLabels: ['title', 'problem', 'solution'],
		$otherLabels: ['enabled', 'color', 'severity',
			'reportOnly', 'params', 'problemLink', 'solutionLink'],
		// max severity possible
		$curMaxSeverity: RS_ERROR,
		// saved options
		$RegExp1: '',
		$RegExp2: '',
		// hidden options
		oReportWMECH: {
			FORID: '_cbHighlightLocked',
			CHECKED: false,
			NA: true,
		},
		oReportToolbox: {
			FORID: 'WMETB_NavBar',
			CHECKED: false,
			NA: true,
		},

		// map changed flag
		$isMapChanged: false,
		// current language
		$lng: I18n.locale.toUpperCase(),
		// cache for updated by filter
		$includeUpdatedByCache: {},
		// filter parsed time
		$includeUpdatedSinceTime: 0,
		// cache for city name filter
		$includeCityNameCache: {},
		// cache for checks filter
		$includeChecksCache: {},
		// switch Validator on/off
		$switchValidator: false,
		// HL layer
		$HLlayer: null,
		// array of objects to animate
		$HLedObjects: {},
		// global access flag
		$isGlobalAccess: false,
		// timer to measure ETA
		$timer: { $secInRun: 0, $lastUpdate: 0 },
		// current message to show
		$curMessage: {TEXT: "", TITLE: "", CLASS: CL_MSG},
		// top city and country
		$topCity: null,
		// cached top country code
		$cachedTopCCode: "",
		// top (logged in) user
		$topUser: {
			$userID: WLM.user.id,
			$userName: WLM.user.userName,
			$userLevel: WLM.user.normalizedLevel,
			$isSuperUser: WLM.user.userName === GA_SUPERUSER,
			$isCM: WLM.user.editableCountryIDs ?
				0 !== WLM.user.editableCountryIDs.length : false,
			$countryIDs: WLM.user.editableCountryIDs ?
				WLM.user.editableCountryIDs : [],
		},
		// top (current) map center
		$topCenter: null,
		// watch dog
		$WDmoveID: -1,
		$WDloadID: -1,
		// current layers visibility
		$layersVisibility: "",
		// current state
		$state:     ST_STOP,
		// current direction
		$direction: DIR_L2R,
		// first step
		$firstStep: true,
		// current map position
		$startExtent:   null,
		$startCenter:   null,
		$startZoom:     null,
		$nextCenter:    null,
		$moveEndCenter: null,
		// map of seen object IDs
		$seen: {},
		// map of segment IDs to revalidate
		$revalidate: {},
		// current user
		$curUserName: WLM.user.userName,
		// error flag
		$error: false,
		// no editable segment was found - show a message
		$reportEditableNotFound: false,
		// unsorted checks
		$checks: {},
		// sorted checks
		$sortedCheckIDs: null,
		// WMECH colors
		$WMECHcolors: {},
		// untranslated languages
//      $untranslatedLocales: ["ja", "ro", "tr", "af",
//          "ko", "ms", "hu", "nl", "sv", "no",
//          "da", "lt", "zh"],
		$untranslatedLngs: ["IT"],
	};

	///////////////////////////////////////////////////////////////////////
	// WV Checks
	///////////////////////////////////////////////////////////////////////
	_RT.$checks = {
		// Global access
		0: {
			SEVERITY: RS_MAX,
			REPORTONLY: false,
			TITLE: 'Global access list to test before any of the checks below',
			FORCOUNTRY: GA_FORCOUNTRY,
			FORCITY: GA_FORCITY,
			FORUSER: GA_FORUSER,
			FORLEVEL: GA_FORLEVEL,
			OPTIONS: {},
			COLOR: '',
			PROBLEM: '',
			PROBLEMLINK: '',
			PROBLEMLINKTEXT: '',
			SOLUTION: '',
			SOLUTIONLINK: '',
			SOLUTIONLINKTEXT: '',
		},
	}; // _RT.$checks

	///////////////////////////////////////////////////////////////////////
	// Locales
	///////////////////////////////////////////////////////////////////////
	// init I18n
	_I18n.init({$lng: _RT.$lng});

	/** @const */
	var defTranslation = _translations[_I18n.$defLng];

	// Generate Toolbox check descriptions in EN
	/** @const */
	var defTBProblem = "The segment is highlighted by WME Toolbox. It is not a problem";
	/** @const */
	var defTBProblemLink = "W:Community_Plugins,_Extensions_and_Tools#WME_Toolbox";
	/** @const */
	var TBchecks = [
		// color, severity, reportOnly, title,
		//   problem, problemLink,
		//   solution, solutionLink
		["#3030FF", 'W', , "Roundabout which may cause issues",
			"Junction IDs of the roundabout segments are not consecutive", "",
			"Redo the roundabout", "W:Creating_and_Editing_a_roundabout#Improving_manually_drawn_roundabouts"
		],
		["#FF30FF", , , "Simple segment",
			"The segment has unneeded geometry nodes", ,
			"Simplify segment geometry by hovering mouse pointer and pressing \"d\" key",
				"W:Creating_and_Editing_street_segments#Adjusting_road_geometry_.28nodes.29"
		],
		["#11F247", , true, "Lvl 2 lock"],
		["#71F211", , true, "Lvl 3 lock"],
		["#E2F211", , true, "Lvl 4 lock"],
		["#F29011", , true, "Lvl 5 lock"],
		["#F22011", , true, "Lvl 6 lock"],
		["#00A8FF", , true, "House numbers"],
		["#F7B020", , true, "Segment with time restrictions"]
	];
	for(var i = CK_TBFIRST; i <= CK_TBLAST; i++)
	{
		var cc = TBchecks[i - CK_TBFIRST];
		var cp = cc[4] || defTBProblem;
		var cpl = cc[5];
		if(!classCodeDefined(cpl))
			cpl = defTBProblemLink;

		defTranslation[i + '.enabled'] = true;
		defTranslation[i + '.color'] = cc[0];
		if(cc[1]) defTranslation[i + '.severity'] = cc[1];
		if(cc[2]) defTranslation[i + '.reportOnly'] = cc[2];
		defTranslation[i + '.title'] = "WME Toolbox: " + cc[3];
		defTranslation[i + '.problem'] = cp;
		if(cpl) defTranslation[i + '.problemLink'] = cpl;
		if(cc[6]) defTranslation[i + '.solution'] = cc[6];
		if(cc[7]) defTranslation[i + '.solutionLink'] = cc[7];
	}

	// Generate WMECH check descriptions in EN
	/** @const */
	var defWMECHProblem = "The segment is highlighted by WME Color Highlights. It is not a problem";
	/** @const */
	var defWMECHProblemLink = "W:Community_Plugins,_Extensions_and_Tools#WME_Color_Highlights_.28WMECH.29";
	/** @const */
	var WMECHchecks = [
		// color, severity, reportOnly, title,
		//   problem, problemLink,
		//   solution, solutionLink
		["#000000", , true, "Editor lock"],
		["#0000FF", , true, "Toll road / One way road"],
		["#00FF00", , true, "Recently edited"],
		["#880000", , true, "Road rank"],
		["#888888", , true, "No city"],
		["#990099", , true, "Time restriction / Highlighted road type"],
		["#FFBB00", , true, "No name"],
		["#FFFF00", , true, "Filter by city"],
		["#FFFF01", , true, "Filter by city (alt. city)"],
		["#00FF00", , true, "Filter by editor"]
	];
	for(var i = CK_WMECHFIRST; i <= CK_WMECHLAST; i++)
	{
		var cc = WMECHchecks[i - CK_WMECHFIRST];
		/** @const */
		var cp = defWMECHProblem;
		/** @const */
		var cpl = defWMECHProblemLink;

		defTranslation[i + '.enabled'] = true;
		defTranslation[i + '.color'] = cc[0];
		if(cc[1]) defTranslation[i + '.severity'] = cc[1];
		if(cc[2]) defTranslation[i + '.reportOnly'] = cc[2];
		defTranslation[i + '.title'] = "WME Color Highlights: " + cc[3];
		defTranslation[i + '.problem'] = cp;
		if(cpl) defTranslation[i + '.problemLink'] = cpl;
	}

	/** @const */
	var streetNames = ["Freeway", "Major Highway", "Minor Highway",
		"Ramp", "Primary Street", "Street", "Parking Lot Road",
		"Railroad"];
	// Generate custom checks descriptions in EN
	for(var i = CK_TYPEFIRST; i <= CK_TYPELAST; i++)
	{
		var streetName = streetNames[i - CK_TYPEFIRST];
		defTranslation[i + '.severity'] = "W";
		defTranslation[i + '.title'] = "Must be a " + streetName;
		defTranslation[i + '.problem'] = "This segment must be a " + streetName;
		defTranslation[i + '.solution'] = "Set the road type to "
			+ streetName + " or change the road name";
	}
	// Generate custom checks descriptions in EN
	for(var i = CK_CUSTOMFIRST; i <= CK_CUSTOMLAST; i++)
	{
		defTranslation[i + '.title'] = "Custom check";
		defTranslation[i + '.severity'] = "W";
		defTranslation[i + '.problem'] = "The segment matched custom conditions";
		defTranslation[i + '.solution'] = "Solve the issue";
		defTranslation[i + '.params'] = {
			"template.title": "{string} expandable template",
			"template": "${street}",
			"regexp.title": "{string} regular expression to match the template",
			"regexp": "!/.+/",
			"titleEN.title": "{string} check title in English",
			"titleEN": "",
			"problemEN.title": "{string} problem description in English",
			"problemEN": "",
			"solutionEN.title": "{string} solution instructions in English",
			"solutionEN": "",
		};
	}
	// Generate lock checks descriptions in EN
	/** @const */
	var lockLevels = {
		150: 5,
		151: 4,
		152: 3,
		153: 4,
		154: 2,
	};
	for(var i = CK_LOCKFIRST; i <= CK_LOCKLAST; i++)
	{
		var lockName = streetNames[i - CK_LOCKFIRST];
		var lockLevel = lockLevels[i];
		defTranslation[i + '.title'] = "No lock on " + lockName;
		defTranslation[i + '.problem'] = "The " + lockName + " segment should be locked at least to Lvl ${n}";
		defTranslation[i + '.solution'] = "Lock the segment";
		defTranslation[i + '.params'] = {
			"n.title": "{number} minimum lock level",
			"n": lockLevel,
		};
	}
	// Generate street type-names
	/** @const */
	var streetRegExps = {
		160: "!/^[AS][0-9]{1,2}/",
		161: "!/^[0-9]{1,2}/",
		162: "!/^[0-9]{1,3}/",
		163: "!/^[AS]?[0-9]* ?> /",
	};
	/** @const */
	var streetDefRegExp = "!/.?/";
	for(var i = CK_STREETTNFIRST; i <= CK_STREETTNLAST; i++)
	{
		var streetName = streetNames[i - CK_STREETTNFIRST];
		var streetRegExp = streetRegExps[CK_STREETTNFIRST] || streetDefRegExp;
		if(i < 165 || i > 167)
			defTranslation[i + '.severity'] = "W";
		defTranslation[i + '.title'] = "Incorrect " + streetName + " name";
		defTranslation[i + '.problem'] = "The " + streetName
			+ " segment has incorrect street name";
		defTranslation[i + '.solution'] = "Rename the segment in accordance with the guidelines";
		defTranslation[i + '.params'] = {
			"regexp.title": "{string} regular expression to match incorrect "
				+ streetName + " name",
			"regexp": streetRegExp,
		};
	}
	// Generate mirror checks
	mirrorChecks(defTranslation);

	// init internal translations
	var listOfIntPacks = '';
	for(var translationsKey in _translations)
	{
		var translation = _translations[translationsKey];
		mirrorChecks(translation);
		_I18n.addTranslation(translation);

		// update listOfIntPacks
		var country = translation[".country"];
		if(!country) continue;
		if(classCodeIs(country, CC_ARRAY))
			country = country[0];
		country = country.split(' ').join('&nbsp;')

		if(listOfIntPacks)
			listOfIntPacks += ', ';
		if(".lng" in translation)
			listOfIntPacks += '<b>' + country + '*';
		else
			listOfIntPacks += country;

		if(".author" in translation)
		{
			listOfIntPacks += ' by&nbsp;' + translation[".author"];
		}
		if(".lng" in translation)
			listOfIntPacks += '</b>';
		if(".updated" in translation)
			listOfIntPacks += ' (' + translation[".updated"] + ')';
	}
	listOfIntPacks += '.';
	listOfIntPacks += '<br>* localization pack with translations';

	// add external translations
	var listOfPacks = '';
	for(var gObject in window)
	{
		if(!window.hasOwnProperty(gObject)) continue;
		if(-1 !== gObject.indexOf(WV_NAME_))
		{
			var translation = window[gObject];
			log("found localization pack: " + gObject.replace(WV_NAME_ + '_', ''));
			mirrorChecks(translation);
			_I18n.addTranslation(translation);

			// update listOfPacks
			if(".country" in translation)
			{
				var country = translation[".country"];
				if(classCodeIs(country, CC_ARRAY))
					country = country[0];
				listOfPacks += '<b>' + country;

				if(".author" in translation)
					listOfPacks += ' by&nbsp;' + translation[".author"];
				listOfPacks +=  '</b>';

				if(!(".lng" in translation))
					listOfPacks += '<br>(does not include translations)';

				if(".updated" in translation)
				{
					listOfPacks += '<br>Updated: ' + translation[".updated"];
					if(".link" in translation
						&& translation[".link"])
						listOfPacks += ' <a target="_blank" href="'
							+ translation[".link"]
							+ '">check&nbsp;for&nbsp;updates</a>';
				}
				listOfPacks += '<br>';
			}
		}
	}
	listOfPacks = (listOfPacks ? listOfPacks : "No external localization packs found");
	listOfPacks += '<br><b>See</b> <a target="_blank" href="'
		+ PFX_FORUM + FORUM_LOCAL + '">'
		+ 'how to create a localization pack</a>';

	// Generate $checks
	for(var i = 1; i < MAX_CHECKS; i++)
	{
		var check = {
			ENABLED: {},
			PROBLEMLINK: {},
			PROBLEMLINKTEXT: {},
			SOLUTIONLINK: {},
			SOLUTIONLINKTEXT: {},
		};

		// set title
		var label = i + '.title';
		if(!_I18n.isLabelExist(label))
			continue;
		check.TITLE = trS(label);

		label = i + '.color';
		if(_I18n.isLabelExist(label))
		{
			var col = trS(label).toUpperCase();
			check.COLOR = col;
			// Generate $WMECHcolors
			if(CK_WMECHFIRST <= i
				&& CK_WMECHLAST >= i)
				_RT.$WMECHcolors[col] = true;
		}
		label = i + '.problem';
		if(_I18n.isLabelExist(label))
			check.PROBLEM = trS(label);
		label = i + '.solution';
		if(_I18n.isLabelExist(label))
			check.SOLUTION = trS(label);
		label = i + '.reportOnly';
		if(_I18n.isLabelExist(label))
			check.REPORTONLY = trS(label);
		label = i + '.severity';
		var s = 'N';
		if(_I18n.isLabelExist(label))
			s = trS(label);
		if(s)
		{
			switch(s.charAt(0))
			{
			case "w":
			case "W":
				check.SEVERITY = RS_WARNING;
				break;
			case "e":
			case "E":
				check.SEVERITY = RS_ERROR;
				break;
			case "1":
				check.SEVERITY = RS_CUSTOM1;
				break;
			case "2":
				check.SEVERITY = RS_CUSTOM2;
				break;
			default:
				check.SEVERITY = RS_NOTE;
				break;
			}
		}
		else
			check.SEVERITY = RS_NOTE;

		// set country-dependant params
		label = i + '.enabled';
		var labelP = i + '.params';
		var labelPL = i + '.problemLink';
		var labelSL = i + '.solutionLink';

		var defEnabled = false;
		var arrCodes = [];
		for(var ccode in _I18n.$translations)
		{
			var translation = _I18n.$translations[ccode];
			if(label in translation)
			{
				var e = translation[label];
				check.ENABLED[ccode] = e;
				// create FORCOUNTRY
				if(_I18n.$defLng === ccode)
				{
					if(e) defEnabled = true;
				}
				else
				{
					if(e)
						arrCodes.push(ccode);
					else
						arrCodes.push('!' + ccode);
				}
			}

			if(labelPL in translation)
			{
				var l = translation[labelPL]
					.replace('W:', PFX_WIKI)
					.replace('F:', PFX_FORUM)
					;
				check.PROBLEMLINK[ccode] = encodeURI(l);
				if(-1 !== l.indexOf(PFX_WIKI))
					check.PROBLEMLINKTEXT[ccode] = trS('report.link.wiki');
				else
				if(-1 !== l.indexOf(PFX_FORUM))
					check.PROBLEMLINKTEXT[ccode] = trS('report.link.forum');
				else
					check.PROBLEMLINKTEXT[ccode] = trS('report.link.other');
			}
			if(labelSL in translation)
			{
				var l = translation[labelSL]
					.replace('W:', PFX_WIKI)
					.replace('F:', PFX_FORUM)
				;
				check.SOLUTIONLINK[ccode] = encodeURI(l);
				if(-1 !== l.indexOf(PFX_WIKI))
					check.SOLUTIONLINKTEXT[ccode] = trS('report.link.wiki');
				else
				if(-1 !== l.indexOf(PFX_FORUM))
					check.SOLUTIONLINKTEXT[ccode] = trS('report.link.forum');
				else
					check.SOLUTIONLINKTEXT[ccode] = trS('report.link.other');
			}
			if(labelP in translation)
			{
				var params = translation[labelP];
				if(!check.OPTIONS)
					check.OPTIONS = {};
				if(!(ccode in check.OPTIONS))
					check.OPTIONS[ccode] = params;

				if(params["template"])
					check.OPTIONS[ccode][CO_STRING] = params["template"];
				if(params["regexp"])
					_WV.buildRegExp(i, check.OPTIONS[ccode], params["regexp"]);
				if(params["n"])
					check.OPTIONS[ccode][CO_NUMBER] = +params["n"];
			} // .params
		} // for codeKeys
		// create FORCOUNTRY
		if(defEnabled)
		{
			if(arrCodes.length)
				check.FORCOUNTRY = arrCodes.join(',') + ',*';
		}
		else
		{
			if(arrCodes.length)
				check.FORCOUNTRY = arrCodes.join(',');
			else
				check.FORCOUNTRY = '!*';
		}

		_RT.$checks[i] = check;
	}
//  window.console.log(_RT.$checks);

	///////////////////////////////////////////////////////////////////////
	// User interface
	var dir = _I18n.getDir();
	var dirLeft = trLeft(dir);
	var dirRight = trRight(dir);
	// Waze-styled tabs
	var cssRules, cssRules2, cssRulesA = ">a{text-decoration:underline;cursor:pointer;pointer-events:auto}";
	_THUI.addElemetClassStyle("div", CL_TABS, "{border-bottom:2px solid #ddd;height:29px}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input{display:none}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">label{white-space:nowrap;overflow:hidden;max-width:100px;text-overflow:ellipsis;cursor:pointer;display:inline-block;margin:0px;margin-" + dirRight + ":3px;padding:4px 12px;border-radius:4px 4px 0 0;background-color:#dadbdc}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:checked+label{font-weight:normal;margin:-2px;min-height:31px;margin-" + dirRight + ":2px;cursor:default;border:2px solid #ddd;border-bottom-color:#fff;background-color:#fff}");
	// !important for WME beta
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:disabled+label{font-weight:bold !important;padding-" + dirLeft + ":0px;color:#333;cursor:default;background-color:transparent}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:enabled+label:hover{background-color:#fff}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:checked+label:hover{background-color:#fff}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:enabled+label>span>span.c" + CL_COLLAPSE + "{display:none}");
	_THUI.addElemetClassStyle("div", CL_TABS, ">input:checked+label>span>span.c" + CL_COLLAPSE + "{display:inline}");
	// Collapsing tab
	// _THUI.addElemetClassStyle("ul", "nav", ">li.active>a>span+span.c" + CL_COLLAPSE + "{display:inline}");
	// _THUI.addElemetClassStyle("ul", "nav", ">li>a>span+span.c" + CL_COLLAPSE + "{display:none}");
	// fixed height panel
	_THUI.addElemetClassStyle("div", CL_PANEL, "{background-color:#fff;padding:4px;margin:0;margin-bottom:4px;border-bottom:2px solid #ddd;white-space:nowrap;overflow-x:hidden;overflow-y:auto;text-overflow:ellipsis;width:100%;height:" + SZ_PANEL_HEIGHT + "px}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">span" + cssRulesA);
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label>span" + cssRulesA);
	_THUI.addElemetClassStyle("div", CL_PANEL, ">span>p" + cssRulesA);
	// custom color markers
	cssRules = ">span{border-radius:5px;background-color:";
	_THUI.addElemetClassStyle("label", "c1", cssRules
		+ GL_CUSTOM1COLOR + ";color:" + GL_CUSTOM1BGCOLOR + "}");
	_THUI.addElemetClassStyle("label", "c2", cssRules
		+ GL_CUSTOM2COLOR + ";color:" + GL_CUSTOM2BGCOLOR + "}");
	cssRules = ">span>a{color:white}";
	_THUI.addElemetClassStyle("label", "c1", cssRules);
	_THUI.addElemetClassStyle("label", "c2", cssRules);
	// buttons
//  "{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
	_THUI.addElemetClassStyle("div", CL_BUTTONS, "{overflow:hidden;margin-bottom:1em}");
	_THUI.addElemetClassStyle("div", CL_BUTTONS, ">button{font-weight:normal;padding:4px 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
	_THUI.addElemetClassStyle("div", CL_BUTTONS, ">button>i{pointer-events:none}");
	_THUI.addElemetClassStyle("div", CL_BUTTONS, ">button:disabled{background-color:#eee;border-bottom:0px;cursor:default;pointer-events:auto}");
	// checkboxes
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.checkbox{display:block;height:24px;font-weight:normal;margin:0}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.checkbox>span{display:inline-block;height:20px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
	// date
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.date{display:block;height:32px;font-weight:normal;margin:0;padding-" + dirRight + ":155px}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.date>span{display:inline-block;line-height:28px;vertical-align:middle;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.date>input[type=date]{box-sizing:border-box;height:28px;padding:2px 10px;padding-" + dirRight + ":2px;float:" + dirRight + ";margin-" + dirRight + ":-155px;width:150px}");
	// text
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.text{display:block;height:30px;font-weight:normal;margin:0;padding-" + dirRight + ":155px}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.text>span{display:inline-block;line-height:28px;vertical-align:middle;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
	_THUI.addElemetClassStyle("div", CL_PANEL, ">label.text>input[type=text]{box-sizing:border-box;height:28px;padding:2px 10px;float:" + dirRight + ";margin-" + dirRight + ":-155px;width:150px}");
	// number inputs
//  _THUI.addElemetClassStyle("div", CL_PANEL, ">label.number{font-weight:normal;display:block;line-height:28px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}");
//  _THUI.addElemetClassStyle("div", CL_PANEL, ">label.number>span{float:" + dirLeft + "}");
//  _THUI.addElemetClassStyle("div", CL_PANEL, ">label.number>input[type=number]{box-sizing:border-box;display:inline-block;width:64px;height:26px;line-height:20px;border-width:1px;float:" + dirRight + ";padding:2px 6px;margin:0}");
	// password inputs
//  _THUI.addElemetClassStyle("div", CL_PANEL, ">input[type=password]{box-sizing:border-box;width:270px;height:28px}");
//  cssRules = ''
	// show translate and report banner
	cssRules = "{position:relative;height:2em;width:100%;margin-bottom:";
	cssRules2 = ">span{position:absolute;" + dirLeft + ":0;bottom:0;display:inline-block;padding:4px 12px;margin:0px;border-radius:8px;border-bottom-" + dirLeft + "-radius:0;box-shadow:3px 3px 3px #aaa;border:1px solid ";
	_THUI.addElemetClassStyle("div", CL_TRANSLATETIP, cssRules + "12px}");
	_THUI.addElemetClassStyle("div", CL_TRANSLATETIP, cssRules2 + "#aea;background-color:#cfc;" + dirLeft + ":auto;" + dirRight + ":0;border-radius:8px;border-bottom-" + dirRight + "-radius:0}");
	_THUI.addElemetClassStyle("div", CL_TRANSLATETIP, ">span" + cssRulesA);
	// message box
	_THUI.addElemetClassStyle("div", CL_MSG, cssRules + "1em}");
	_THUI.addElemetClassStyle("div", CL_MSG, cssRules2 + "#ded;background-color:#efe}");
	_THUI.addElemetClassStyle("div", CL_MSGY, cssRules + "1em}");
	_THUI.addElemetClassStyle("div", CL_MSGY, cssRules2 + "#ee9;background-color:#ffa}");
	// segment properties
	_THUI.addElemetIdStyle("div", ID_PROPERTY, "{padding-bottom:5px}");
	_THUI.addElemetIdStyle("div", ID_PROPERTY, ">b" + cssRulesA);
	cssRules = '{color:' + GL_NOTECOLOR + '}';
	_THUI.addElemetClassStyle("div", CL_NOTE, cssRules);
	_THUI.addElemetClassStyle("a", CL_NOTE, cssRules);
	cssRules = '{color:' + GL_WARNINGCOLOR + '}';
	_THUI.addElemetClassStyle("div", CL_WARNING, cssRules);
	_THUI.addElemetClassStyle("a", CL_WARNING, cssRules);
	cssRules = '{color:' + GL_ERRORCOLOR + '}';
	_THUI.addElemetClassStyle("div", CL_ERROR, cssRules);
	_THUI.addElemetClassStyle("a", CL_ERROR, cssRules);
	cssRules = '{color:' + GL_CUSTOM1COLOR + '}';
	_THUI.addElemetClassStyle("div", CL_CUSTOM1, cssRules);
	_THUI.addElemetClassStyle("a", CL_CUSTOM1, cssRules);
	cssRules = '{color:' + GL_CUSTOM2COLOR + '}';
	_THUI.addElemetClassStyle("div", CL_CUSTOM2, cssRules);
	_THUI.addElemetClassStyle("a", CL_CUSTOM2, cssRules);
	_THUI.addElemetClassStyle("div", CL_RIGHTTIP, "{white-space:nowrap;position:relative;cursor:help}");
	_THUI.addElemetClassStyle("div", CL_RIGHTTIP, ">span{display:inline-block;overflow:hidden;text-overflow:ellipsis;width:279px}");
	_THUI.addElemetClassStyle("div", CL_RIGHTTIP, ">span" + cssRulesA);
	cssRules = ';z-index:1000000;position:absolute;visibility:hidden;opacity:0;transition:0.1s ease;' + dirLeft + ':30px;top:-1.7em;cursor:default}';
	_THUI.addElemetClassStyle('div', CL_RIGHTTIP, ':before{content:"";position:absolute;border:1em solid transparent;border-' + dirRight + '-color:#ddd;margin-' + dirLeft + ':-2em;margin-top:1.5em' + cssRules);
	_THUI.addElemetClassStyle('div', CL_RIGHTTIPPOPUP, '{white-space:normal;background-color:#fafafa;padding:1em;width:230px;box-shadow:3px 3px 3px #aaa;border-radius:1em;border:1px solid #ddd' + cssRules);
	_THUI.addElemetClassStyle('div', CL_RIGHTTIPDESCR, '{margin-' + dirLeft + ':2em}');
	_THUI.addElemetClassStyle('div', CL_RIGHTTIPDESCR, cssRulesA);
	_THUI.addElemetClassStyle('div', CL_RIGHTTIPDESCR, '>p{color:black;margin-top:0.5em;margin-bottom:0.5em !important}');
	_THUI.addElemetClassStyle('div', CL_RIGHTTIPDESCR, '>p' + cssRulesA);
	cssRules = '{visibility:visible;opacity:1}';
	_THUI.addElemetClassStyle('div', CL_RIGHTTIP, ':hover:before' + cssRules);
	_THUI.addElemetClassStyle('div', CL_RIGHTTIP, ':hover>div' + cssRules);

	_UI = {
	// set to defaults to suppress warnings
	_DISABLED: undefined,
	_NODISPLAY: undefined,
	MAXLENGTH: undefined,
	REVERSE: undefined,
	WARNING: undefined,
	TYPE: undefined,
	FORUSER: undefined,
	FORCITY: undefined,
	FORCOUNTRY: undefined,
	FORLEVEL: undefined,
	ACCESSKEY: undefined,
	STYLEI: "",
//  STYLEO: "",
	DISCLOSE: 0,
	_NAME: "",
	READONLY: 0,
	_STYLE: "",
	ONWARNING: null,
	ONCHANGE: null,
	_ONCHANGE: undefined,
	ONCLICKO: undefined,
	MIN: undefined,
	MAX: undefined,
	STEP: undefined,
	CLASS: CL_UI,

	// global params
	_TYPE: _THUI.DIV,
	_ONWARNING: onWarning,
	pTips: {
	},
	pTranslateBanner: {
		CLASS: CL_TRANSLATETIP,
//      NODISPLAY: 1,
		TEXT: "Please help to "
			+ '<a target="_blank" href="' + PFX_FORUM + FORUM_LOCAL + '">'
			+ 'translate Validator!</a>',
		TITLE: trS("about.tip"),
	},
	pNoAccess: {
		CLASS: CL_PANEL,
		NODISPLAY: 1,
		STYLE: 'text-align:center',
		TEXT: trS("noaccess.text"),
		TITLE: trS("noaccess.tip"),
	},
	pMain: {
		pTabs: {
			CLASS: CL_TABS,
			_DISCLOSE: 1,
			_TYPE: _THUI.RADIO,
			_ONCLICK: onUpdateUI,
			tMain: {
				// text and title update automatically
				TEXT:   '',
				TITLE:  '',
				DISABLED: 1,
				STYLEO: "cursor:pointer;max-width:97px",
				ONCLICKO: onUpdateUI
			},
			tFilter: {
				TEXT:   '<i class="fa fa-filter" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.filter.text") + "</span>",
				TITLE:  trS("tab.filter.tip"),
				CHECKED: 1
			},
			tSearch: {
				TEXT:   '<i class="fa fa-search" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.search.text") + "</span>",
				TITLE:  trS("tab.search.tip"),
			},
			tHelp: {
				TEXT:   '<i class="fa fa-question-circle" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.help.text") + "</span>",
				TITLE:  trS("tab.help.tip"),
				STYLEO: "float:" + dirRight
			},
		}, // pMain.pTabs
		pFilter: {
			CLASS: CL_PANEL,
			_CLASS: "checkbox",
			_TYPE: _THUI.CHECKBOX,
			_REVERSE: 1,
			_ONCHANGE: onUpdateUI,
			oExcludeNonEditables: {
				TEXT: trS("filter.noneditables.text"),
				TITLE: trS("filter.noneditables.tip"),
				AUTOSAVE: AS_NONEDITABLES
			},
			oExcludeDuplicates: {
				TEXT: trS("filter.duplicates.text"),
				TITLE: trS("filter.duplicates.tip"),
				AUTOSAVE: AS_DUPLICATES
			},
			oExcludeStreets: {
				TEXT: trS("filter.streets.text"),
				TITLE: trS("filter.streets.tip"),
				AUTOSAVE: AS_STREETS
			},
			oExcludeOther: {
				TEXT: trS("filter.other.text"),
				TITLE: trS("filter.other.tip"),
				AUTOSAVE: AS_OTHERS
			},
			oExcludeNotes: {
				TEXT: trS("filter.notes.text"),
				TITLE: trS("filter.notes.tip"),
				AUTOSAVE: AS_NOTES
			},
		}, // pMain.pFilter
		pSearch: {
			CLASS: CL_PANEL,
			NODISPLAY: 1,
//          _CLASS: "checkbox",
//          _TYPE: _THUI.CHECKBOX,
			_REVERSE: 1,
			_ONCHANGE: onUpdateUI,
			oIncludeYourEdits: {
				NODISPLAY: 1,
				TYPE: _THUI.CHECKBOX,
				TEXT: trS("search.youredits.text"),
				TITLE: trS("search.youredits.tip"),
				CLASS: "checkbox",
				AUTOSAVE: AS_YOUREDITS
			},
			oIncludeUpdatedBy: {
//              NODISPLAY: 1,
				TYPE: _THUI.TEXT,
				TEXT: trS("search.updatedby.text"),
				TITLE: trS("search.updatedby.tip"),
				PLACEHOLDER: trS("search.updatedby.example"),
				CLASS: "form-label text",
				CLASSI: "form-control",
				AUTOSAVE: AS_UPDATEDBY
			},
			oIncludeUpdatedSince: {
				TYPE: _THUI.DATE,
				TEXT: trS("search.updatedsince.text"),
				TITLE: trS("search.updatedsince.tip"),
				PLACEHOLDER: trS("search.updatedsince.example"),
				CLASS: "form-label date",
				CLASSI: "form-control",
				AUTOSAVE: AS_UPDATEDSINCE
			},
			oIncludeCityName: {
				TYPE: _THUI.TEXT,
				TEXT: trS("search.city.text"),
				TITLE: trS("search.city.tip"),
				PLACEHOLDER: trS("search.city.example"),
				CLASS: "form-label text",
				CLASSI: "form-control",
				AUTOSAVE: AS_CITYNAME
			},
			oIncludeChecks: {
				TYPE: _THUI.TEXT,
				TEXT: trS("search.checks.text"),
				TITLE: trS("search.checks.tip"),
				PLACEHOLDER: trS("search.checks.example"),
				CLASS: "form-label text",
				CLASSI: "form-control",
				AUTOSAVE: AS_CHECKS
			},
		}, // pMain.pSearch
		pHelp: {
			CLASS: CL_PANEL,
			NODISPLAY: 1,
			TEXT: trS("help.text"),
			TITLE: trS("help.tip"),
		}, // pMain.pHelp
		pButtons: {
			CLASS: CL_BUTTONS,
			_CLASS: "btn btn-default",
			_TYPE: _THUI.BUTTON,
			_ONCLICK: onUpdateUI,
			bScan: {
				TEXT:   "\uf04b",
				// title updates automatically
				TITLE:  "",
				STYLE:  "float:" + dirLeft + ";width:38px;font-family:FontAwesome"
			},
			bPause: {
				NODISPLAY: 1,
				TEXT:   "\uf04c",
				TITLE:  trS("button.pause.tip"),
				STYLE:  "float:" + dirLeft + ";width:38px;font-family:FontAwesome"
			},
			bContinue: {
				TEXT:   "\uf04b",
				TITLE:  trS("button.continue.tip"),
				NODISPLAY: 1,
				STYLE:  "float:" + dirLeft + ";width:38px;font-family:FontAwesome"
			},
			bStop: {
				TEXT:   "\uf04d",
				TITLE:  trS("button.stop.tip"),
				STYLE:  "float:" + dirLeft + ";width:38px;font-family:FontAwesome;margin-" + dirRight + ":10px"
			},
			bClear: {
//              TEXT:   "\uf016",
				TEXT:   "\u2718",
				// title updates automatically
				TITLE:  "",
				NODISPLAY: 1,
				DISABLED: 1,
				STYLE:  "float:" + dirLeft + ";width:38px;margin-" + dirRight + ":10px"
			},
			bReport: {
				TEXT:   trS("button.report.text"),
				TITLE:  trS("button.report.tip"),
				STYLE:  "float:" + dirLeft + ";max-width:110px",
				ONCLICK: onShowReport
			},
			bReportBB: {
//              TEXT:   "\uf003",
				TEXT:   "\uf0e0",
				TITLE:  trS("button.BBreport.tip"),
				ONCLICK: onShareReport,
				STYLE:  "float:" + dirLeft + ";width:38px;font-family:FontAwesome"
			},
			bSettings: {
				TEXT:   "\uf013",
				TITLE:  trS("button.settings.tip"),
				STYLE:  "float:" + dirRight + ";width:38px;font-family:FontAwesome"
			},
		} // pMain.pButtons
	}, // pMain
	pSettings: {
		NODISPLAY: 1,
		pTabs: {
			CLASS: CL_TABS,
			_DISCLOSE: 1,
			_TYPE: _THUI.RADIO,
			_ONCLICK: onUpdateUI,
			tMain: {
				TEXT:   trS("tab.settings.text") + ':',
				TITLE:  WV_NAME + " Version " + WV_VERSION,
				STYLEO: "max-width:85px",
				DISABLED: 1
			},
			tCustom: {
				TEXT:   '<i class="fa fa-user" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.custom.text") + "</span>",
				STYLEO: "max-width:110px",
				TITLE:  trS("tab.custom.tip"),
				CHECKED: 1
			},
			tScanner: {
				TEXT:   '<i class="fa fa-wrench" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.scanner.text") + "</span>",
				TITLE:  trS("tab.scanner.tip"),
				STYLEO: "max-width:110px",
			},
			tAbout: {
				TEXT:   '<i class="fa fa-question-circle" aria-hidden="true"></i>' + "<span class='c" + CL_COLLAPSE + "'> " + trS("tab.about.text") + "</span>",
				TITLE:  trS("tab.about.tip"),
				STYLEO: "float:" + dirRight + ";max-width:110px"
			}
		}, // pSettings.pTabs
		pCustom: {
			CLASS: CL_PANEL,
			_CLASS: "form-label text",
			_REVERSE: 1,
			_ONCHANGE: onUpdateUI,
			oTemplate1: {
				TYPE: _THUI.TEXT,
				TEXT: '&nbsp;' + trS("custom.template.text"),
				TITLE: trS("custom.template.tip"),
				PLACEHOLDER: trS("custom.template.example"),
				CLASS: "form-label text c1",
				CLASSI: "form-control",
				AUTOSAVE: AS_CUSTOM1TEMPLATE
			},
			oRegExp1: {
				TYPE: _THUI.TEXT,
				TEXT: '&nbsp;' + trS("custom.regexp.text"),
				TITLE: trS("custom.regexp.tip"),
				PLACEHOLDER: trS("custom.regexp.example"),
				CLASSI: "form-control",
				AUTOSAVE: AS_CUSTOM1REGEXP
			},
			oTemplate2: {
				TYPE: _THUI.TEXT,
				TEXT: '&nbsp;' + trS("custom.template.text"),
				TITLE: trS("custom.template.tip"),
				PLACEHOLDER: trS("custom.template.example"),
				CLASS: "form-label text c2",
				CLASSI: "form-control",
				AUTOSAVE: AS_CUSTOM2TEMPLATE
			},
			oRegExp2: {
				TYPE: _THUI.TEXT,
				TEXT: '&nbsp;' + trS("custom.regexp.text"),
				TITLE: trS("custom.regexp.tip"),
				PLACEHOLDER: trS("custom.regexp.example"),
				CLASSI: "form-control",
				AUTOSAVE: AS_CUSTOM2REGEXP
			},
		}, // pSettings.pCustom
		pScanner: {
			NODISPLAY: 1,
			CLASS: CL_PANEL,
			_CLASS: "checkbox",
			_TYPE: _THUI.CHECKBOX,
			_REVERSE: 1,
			_ONCHANGE: onUpdateUI,
			oSlowChecks: {
				TEXT: trS("scanner.slow.text"),
				TITLE: trS("scanner.slow.tip"),
				AUTOSAVE: AS_SLOWCHECKS
			},
			oReportExt: {
				TEXT: trS("scanner.ext.text"),
				TITLE: trS("scanner.ext.tip"),
				AUTOSAVE: AS_REPORTEXT
			},
			oHLReported: {
				TEXT: trS("scanner.highlight.text"),
				TITLE: trS("scanner.highlight.tip"),
				AUTOSAVE: AS_HLISSUES
			},
			oSounds: {
				TEXT: trS("scanner.sounds.text"),
				TITLE: trS("scanner.sounds.tip"),
				NATITLE: trS("scanner.sounds.NA"),
				AUTOSAVE: AS_SOUNDS
			},
		}, // pSettings.pScanner
		pAbout: {
			CLASS: CL_PANEL,
			NODISPLAY: 1,
			TEXT: '<p><b>' + WV_NAME + '</b>'
				+ '<br>Version ' + WV_VERSION + ' <a target="_blank" href="' + PFX_FORUM + FORUM_HOME + '">check for updates</a>'
				+ '<br>Expiration date: ' + WV_RELEASE_VALID
				+ '<br>&copy; 2013-2018 Andriy Berestovskyy</p>'
				+ '<p><b>Built-in localization packs for:</b><br>'
				+ listOfIntPacks
				+ '<p><b>External localization packs for:</b><br>'
				+ listOfPacks
				+ '</p>'
				+ '<p><b>Special thanks to:</b><br>OyyoDams, Timbones, paulkok_my, petervdveen, MdSyah, sketch, AlanOfTheBerg, arbaot, Zniwek, orbitc, robindlc, fernandoanguita, BellHouse, vidalnit, Manzareck, gad_m, Zirland and <b>YOU!</b></p>',
			TITLE: trS("about.tip"),
			STYLE: 'direction:ltr;text-align:center;white-space:normal'
		}, // pSettings.pAbout
		pButtons: {
			CLASS: CL_BUTTONS,
			_CLASS: "btn btn-default",
			_TYPE: _THUI.BUTTON,
			_ONCLICK: onUpdateUI,
			bReset: {
				TEXT:   '<i class="fa fa-undo" aria-hidden="true"></i> ' + trS("button.reset.text"),
				TITLE:  trS("button.reset.tip"),
				STYLE:  "float:" + dirLeft + ";max-width:165px",
			},
			bList: {
				NODISPLAY: 1,
				TEXT:   '<i class="fa fa-list" aria-hidden="true"></i> ' + trS("button.list.text"),
				TITLE:  trS("button.list.tip"),
				STYLE:  "float:" + dirLeft + ";max-width:165px",
				ONCLICK: onShowChecks
			},
			bWizard: {
				NODISPLAY: 1,
				TEXT:   '<i class="fa fa-magic" aria-hidden="true"></i>',
				TITLE:  trS("button.wizard.tip"),
				STYLE:  "float:" + dirLeft + ";margin-" + dirLeft + ":6px;width:38px",
				ONCLICK: onCreatePack
			},
			bBack: {
				TEXT:   '<i class="fa fa-angle-double-' + dirLeft + '" aria-hidden="true"></i> ' + trS("button.back.text"),
				TITLE:  trS("button.back.tip"),
				STYLE:  "float:" + dirRight + ";max-width:70px"
			}
		} // pSettings.pButtons
	} // pSettings
	}; // _UI

	// init report
	clearReport();

	// check if user is a country manager
	if(_RT.$topUser.$isCM || _RT.$topUser.$isSuperUser)
	{
		_UI.pMain.pSearch.oIncludeYourEdits.NODISPLAY = 1;
		_UI.pMain.pSearch.oIncludeUpdatedBy.NODISPLAY = 0;
	}
	else
	{
		_UI.pMain.pSearch.oIncludeYourEdits.NODISPLAY = 0;
		_UI.pMain.pSearch.oIncludeUpdatedBy.NODISPLAY = 1;
	}

	// show translate banner
	if(-1 !== _RT.$untranslatedLngs.indexOf(_RT.$lng.split('-')[0]))
		_UI.pTranslateBanner.NODISPLAY = 0;
	else
		_UI.pTranslateBanner.NODISPLAY = 1;


	// check for AudioContext
	if(!classCodeDefined(UW.AudioContext)
		&& !classCodeDefined(UW.webkitAudioContext))
	{
		_UI.pSettings.pScanner.oSounds.CHECKED = false;
		_UI.pSettings.pScanner.oSounds.NA = true;
	}

	// reset defaults
	resetDefaults();

	// load saved values from local storage
	var storageObj = null;
	var s = null;
	try
	{
		s = window.localStorage.getItem(AS_NAME);
		storageObj = s ? JSON.parse(s) : null;
		if (!(AS_PASSWORD in storageObj))
		{
			storageObj = null;
		}
	}
	catch (e) {}

	if(!storageObj || WV_LICENSE_VERSION !== storageObj[AS_LICENSE])
	{
		if(!confirm(WV_LICENSE))
		{
			// destroy UI
			_UI = {};
			// uninstall login/logout handler
			WLM.events.un({
				"afterloginchanged": onLogin,
				"login": onLogin
			});
			return;
		}
	}

	var showWhatsNew = false;
	if(s && !storageObj)
	{
		warning("\nDue to the major changes in Validator, all filter options\nand settings have been RESET to their DEFAULTS.");
		showWhatsNew = true;
	}
	if(storageObj && WV_VERSION !== storageObj[AS_VERSION])
		showWhatsNew = true;

	if(showWhatsNew)
		info(WV_WHATSNEW);

	_THUI.loadValues(_UI, storageObj);

	// create a styleMap with a custom default symbolizer
	var styleMap = new OpenLayers.StyleMap({
		strokeWidth: HL_WIDTH,
	});

	// create a lookup table with different symbolizers for 0, 1 and 2
	var lookup = {};
	lookup[RS_NOTE] = {
		strokeColor: GL_NOTECOLOR,
		graphicZIndex: 10,
	};
	lookup[RS_WARNING] = {
		strokeColor: GL_WARNINGCOLOR,
		graphicZIndex: 20,
	};
	lookup[RS_ERROR] = {
		strokeColor: GL_ERRORCOLOR,
		graphicZIndex: 30,
	};
	lookup[RS_CUSTOM2] = {
		strokeColor: GL_CUSTOM2COLOR,
		graphicZIndex: 40,
	};
	lookup[RS_CUSTOM1] = {
		strokeColor: GL_CUSTOM1COLOR,
		graphicZIndex: 50,
	};

	// add rules from the above lookup table, with the keyes mapped to
	// the "type" property of the features, for the "default" intent
	styleMap.addUniqueValueRules("default", 0, lookup);

	_RT.$HLlayer = new OpenLayers.Layer.Vector(GL_LAYERNAME, {
		uniqueName: GL_LAYERUNAME,
		shortcutKey: GL_LAYERSHORTCUT,
		accelerator: GL_LAYERACCEL,
		units: "m",

		styleMap: styleMap,
		projection: new OpenLayers.Projection("EPSG:4326"),
		visibility: _UI.pSettings.pScanner.oHLReported.CHECKED,
	});
	I18n.translations[I18n.currentLocale()].layers.name[GL_LAYERUNAME] = GL_LAYERNAME;
	_RT.$HLlayer.setOpacity(HL_OPACITY);
	WM.addLayer(_RT.$HLlayer);
	_RT.$HLlayer.setVisibility(_UI.pSettings.pScanner.oHLReported.CHECKED);
	WM.raiseLayer(_RT.$HLlayer, 99);

	// Create Validator tab
	$('#user-tabs ul').append('<li>'
		+ '<a data-toggle="tab" href="#sidepanel-' + ID_PREFIX + '">'
		+ '<span class="fa fa-check-square-o"></span>'
		// + '<span class="c' + CL_COLLAPSE + '"> ' + WV_SHORTNAME + ':</span>'
		+ ' ' + WV_SHORTNAME
		+ '</a></li>'
		);
	$('#user-tabs+div.tab-content').append(
		'<div class="tab-pane" id="sidepanel-' + ID_PREFIX + '"></div>'
		);
	// append user interface after the details or ad the bottom
	_THUI.appendUI(document.getElementById("sidepanel-" + ID_PREFIX),
		_UI, "i" + ID_PREFIX);

	async(F_UPDATEUI);
	// for the highlights
	async(ForceHLAllSegments, null, 700);

	// register event handlers
	WMo.events.on({
		"mergeend": onMergeEnd,
	});
	WM.events.on({
		"moveend": onMoveEnd,
		"zoomend": HLAllSegments,
		"changelayer": onChangeLayer,
	});
	WSM.events.on({
		"selectionchanged": ForceHLAllSegments
	});
	WC.events.on({
		"loadstart": onLoadStart,
	});

	// monitor segments and nodes changes
	// TODO: fix me to WMo.segments.on
	// WMo.segments.events.on({
	//     "objectsadded": onSegmentsAdded,
	//     "objectschanged": onSegmentsChanged,
	//     "objectsremoved": onSegmentsRemoved,
	// });
	// WMo.nodes.events.on({
	//     "objectschanged": onNodesChanged,
	//     "objectsremoved": onNodesRemoved,
	// });
}
