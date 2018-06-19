/*
 * other.js -- WME Validator other functions and handlers
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
 * On Segments Changed Handler
 */
function F_ONSEGMENTSCHANGED(e)
{
	// add nearby segments to _RT.$revalidate
	var changedNodes = [];
	for(var i = 0; i < e.length; i++)
	{
		var nodeIDs = [e[i].attributes.fromNodeID, e[i].attributes.toNodeID];
		for(var j = 0; j < nodeIDs.length; j++)
		{
			var nodeID = nodeIDs[j];
			if(!nodeID) continue;
			var node = WMo.nodes.get(nodeID);
			if(node)
				changedNodes.push(node);
		}
	}
	if(changedNodes.length)
		sync(F_ONNODESCHANGED, changedNodes);
}

/**
 * On Nodes Changed Handler
 */
function F_ONNODESCHANGED(e)
{
	// add nearby segments to _RT.$revalidate
	var reHL = false;
	for(var i = 0; i < e.length; i++)
	{
		var ids = e[i].attributes.segIDs;
		for(var j = 0; j < ids.length; j++)
			_RT.$revalidate[ids[j]] = true,
			reHL = true;
	}
	// revalidate all the segments
	if(reHL)
		HLAllSegments();
}

/**
 * On Change Layer Handler
 */
function F_ONCHANGELAYER(e)
{
	if(-1 !== e.layer.id.indexOf(GL_TBPREFIX))
	{
		if(!e.layer.visibility)
		{
			for(var segmentID in WMo.segments.objects)
			{
				if(!WMo.segments.objects.hasOwnProperty(segmentID)) continue;
				delete WMo.segments.objects[segmentID][GL_TBCOLOR];
			}
		}
		ForceHLAllSegments();
	}
	else
		if(GL_LAYERUNAME === e.layer.uniqueName
			&& e.layer.visibility !== _UI.pSettings.pScanner.oHLReported.CHECKED
		)
		{
			// switch Validator on/off
			_RT.$switchValidator = true;
			async(F_UPDATEUI);
		}
}

/**
 * On Move End Handler
 */
function F_ONMOVEEND()
{
	var c = WM.getCenter();

	if(-1 === _RT.$WDmoveID
		&& -1 === _RT.$WDloadID
		&& c.equals(_RT.$nextCenter)
		)
		_RT.$WDmoveID = window.setTimeout(onMergeEnd, WD_SHORT);
	else
	{
		// autopause on user move
		if(RTStateIs(ST_RUN) && !_RT.$firstStep
			&& !c.equals(_RT.$nextCenter)
			&& !c.equals(_RT.$startCenter)
		)
		{
			_RT.$curMessage = {
				TEXT: trS("msg.autopaused.text"),
				TITLE: trS("msg.autopaused.tip"),
			};
			async(F_PAUSE);
		}
	}

	_RT.$moveEndCenter = c;
}

/**
 * On Load Start Handler
 */
function F_ONLOADSTART()
{
	var c = WM.getCenter();

	// kill move WD
	window.clearTimeout(_RT.$WDmoveID);

	if(-1 === _RT.$WDloadID
		&& c.equals(_RT.$nextCenter)
	)
		_RT.$WDloadID = window.setTimeout(onMergeEnd, WD_LONG);

	_RT.$WDmoveID = -1;

}

/**
 * Switch all layers but roads off
 */
function F_LAYERSOFF()
{
	// TODO:
//  Waze.Config.segments.zoomToRoadType[SCAN_ZOOM] = -1;

	_RT.$HLlayer.destroyFeatures();
//  if(_RT.$layersVisibility || _UI.pSettings.pScanner.oShowLayers.CHECKED)
	if(_RT.$layersVisibility || GL_SHOWLAYERS)
		return;
	WM.layers.forEach(function(el) {
		if(el.displayInLayerSwitcher && GL_LAYERUNAME !== el.uniqueName)
		{
			if(el.getVisibility())
				_RT.$layersVisibility += "T";
			else
				_RT.$layersVisibility += "F";

			el.setVisibility(false);
		}
	});
}

/**
 * Switch all layers back on
 */
function F_LAYERSON()
{
//  if(!_RT.$layersVisibility || _UI.pSettings.pScanner.oShowLayers.CHECKED)
	if(!_RT.$layersVisibility || GL_SHOWLAYERS)
		return;
	var j = 0;
	WM.layers.forEach(function(el) {
		if(el.displayInLayerSwitcher && GL_LAYERUNAME !== el.uniqueName)
		{
			if(_RT.$layersVisibility.length > j)
			{
				el.setVisibility("T" === _RT.$layersVisibility.charAt(j));
				j++;
			}
		}
	});
	_RT.$layersVisibility = "";
}

/**
 * Pause scanning
 */
function F_PAUSE()
{
	if(!RTStateIs(ST_RUN))
		return;

	beep(50, "square");
	// update max severity
	sync(F_SHOWREPORT, RF_UPDATEMAXSEVERITY);
	setRTState(ST_PAUSE);
	async(F_LAYERSON);
}


/**
 * Stop scanning
 */
function F_STOP()
{
	if(!RTStateIs(ST_STOP))
	{
		beep(100, "square");
		// restore current view
		if(_RT.$startCenter)
		{
			WM.panTo(_RT.$startCenter);
			WM.zoomTo(_RT.$startZoom);
		}
		if(!_REP.$maxSeverity)
			_RT.$curMessage = {
				TEXT: trS("msg.noissues.text"),
				TITLE: trS("msg.noissues.tip"),
			};
	}

	// update max severity
	sync(F_SHOWREPORT, RF_UPDATEMAXSEVERITY);
	setRTState(ST_STOP);
	async(F_LAYERSON);
}

/**
 * Merge End Handler
 */
function F_ONMERGEEND()
{
	/** @const */
	var c = WM.getCenter();

	// skip all but next center runs
	if(RTStateIs(ST_RUN) && _RT.$nextCenter && !c.equals(_RT.$nextCenter))
		return;
	/** @const */
	var e = WM.getExtent();
	/** @const */
	var ew = e.getWidth();
	/** @const */
	var eh = e.getHeight();
	/** @const */
	var ew2 = ew/2;
	/** @const */
	var eh2 = eh/2;
	var s = _RT.$startExtent;
	if(!s) s = new UW.OpenLayers.Bounds();
	/** @const */
	var cx = c.lon;
	/** @const */
	var cy = c.lat;
	/** @const */
	var dir = Math.round(_RT.$direction/Math.abs(_RT.$direction));
	/** @const */
	var sw = s.getWidth();
	/** @const */
	var sh = s.getHeight();

	// calculate real step X and Y
	/** @const */
	var kxMax = Math.ceil(sw/(ew*SCAN_STEP/100));
	/** @const */
	var stepX = sw/kxMax;
	/** @const */
	var kyMax = Math.ceil(sh/(eh*SCAN_STEP/100));
	/** @const */
	var stepY = sh/kyMax;

	if(RTStateIs(ST_CONTINUE))
	{
		if(_RT.$nextCenter)
		{
			setRTState(ST_RUN);
			// restore current view and continue
			WM.zoomTo(SCAN_ZOOM);
			WM.panTo(_RT.$nextCenter);
			clearWD();
			return;
		}
		// no saved position - rerun
		async(F_ONRUN);
		return;
	}
	// Highlight reported segments
	if(!RTStateIs(ST_RUN))
	{
		HLAllSegments();
		return;
	}

	async(F_UPDATEUI);

	if(_RT.$firstStep)
	{
		// make first step
		_RT.$firstStep = false;
		var newX = s.left + ew2;
		var newY = s.top - eh2;
		// save current view for pause
		_RT.$nextCenter = new UW.OpenLayers.LonLat(newX, newY);
		WM.zoomTo(SCAN_ZOOM);
		WM.panTo(_RT.$nextCenter);
		clearWD();
		return;
	}

	// do the job!
	sync(F_VALIDATE, false);

	///////////////////////////////////////////////////////////////////////
	// New X coordinate

	// 1. Get nearest position
	var deltaX = Number.MAX_VALUE;
	var deltaY = Number.MAX_VALUE;
	var kx = 0;
	var ky = 0;
	for(var i = 0;;i++)
	{
		var x = s.left + ew2 + i*stepX;
		var y = s.top - eh2 - i*stepY;
		if(x > s.right && y < s.bottom) break;

		var cd = Math.abs(x - cx);
		if(cd < deltaX) deltaX = cd, kx = i;

		cd = Math.abs(y - cy);
		if(cd < deltaY) deltaY = cd, ky = i;
	}
	updateTimer(ST_RUN);
	var curStep = ky*kxMax + (0 < dir? kx : kxMax - kx);
	if(4 < curStep)
	{
		if(0 === curStep%5)
		{
			//var maxStep = (kyMax*(kxMax - 1));
			var maxStep = kyMax*kxMax;
			var minETA = (maxStep / curStep - 1) * _RT.$timer.$secInRun / 60;
			var strMsg = (1 > minETA) ?
				trS("msg.scanning.text.soon")
				: trSO("msg.scanning.text", {"n": Math.round(minETA)})
				;
			_RT.$curMessage = {
				TEXT: strMsg,
				TITLE: trS("msg.scanning.tip"),
			};
		}
	}

	// 2. Make an X step
	kx = kx + dir;

	// 3. Check if new X is within start extent
	var newX = s.left + ew2 + kx*stepX;
	if(newX < s.left || newX > s.right
		// or if center is closer to the start border that the edge
		|| Math.abs(newX - s.left) < Math.abs(newX - ew2 - s.left)
		|| Math.abs(newX - s.right) < Math.abs(newX + ew2 - s.right)
	)
	{
		// step back
		newX = s.left + ew2 + (kx - dir)*stepX;
		// change direction
		_RT.$direction = -_RT.$direction;
		// make an Y step
		ky++;
	}

	// 4. Check if new Y is within start extent
	var newY = s.top - eh2 - ky*stepY;
	if(newY < s.bottom
		// or if center is closer to the start border that the edge
		|| Math.abs(newY - s.bottom) < Math.abs(newY - eh2 - s.bottom)
	)
	{
		// finished!
		// check if any editable segment was found
		if(!_REP.$isEditableFound && _UI.pMain.pFilter.oExcludeNonEditables.CHECKED)
			_RT.$reportEditableNotFound = true;

		async(F_STOP);
		return;
	}

	_RT.$nextCenter = new UW.OpenLayers.LonLat(newX, newY);
	// pan map
	WM.zoomTo(SCAN_ZOOM);
	WM.panTo(_RT.$nextCenter);
	clearWD();
}

/**
 * Run Handler
 */
function F_ONRUN()
{
	// clear error flag
	clearErrorFlag();

	if(RTStateIs(ST_RUN))
		return;

	async(F_LAYERSOFF);

	_RT.$curMessage = {
		TEXT: trS("msg.starting.text"),
		TITLE: trS("msg.starting.tip"),
	};
	setRTState(ST_RUN);
	clearWD();
	_RT.$direction = DIR_L2R;
	_RT.$firstStep = true;

	// save current view
	var e = WM.getExtent();
	_RT.$startExtent = e;
	_RT.$startCenter = WM.getCenter();
	_RT.$startZoom = WM.getZoom();
	_RT.$nextCenter = null;
	_RT.$moveEndCenter = null;

//  clearReport();

	_RT.$nextCenter = new UW.OpenLayers.LonLat(e.left, e.top);
	WM.panTo(_RT.$nextCenter);
	WM.zoomTo(SCAN_ZOOM);
}

/**
 * Login Handler
 */
function F_ONLOGIN()
{
	if(WLM.user)
	{
		if(!_WV.$loggedIn)
		{
			// set the flag and do login
			_WV.$loggedIn = true;
			async(F_LOGIN);
		}
	}
	else
	{
		if(_WV.$loggedIn)
		{
			// reset the flag and do logout
			_WV.$loggedIn = false;
			async(F_LOGOUT);
		}
		else
			// we have no user and no flag is set
			log("waiting for login...");
	}
}

/**
 * Init
 */
function F_INIT()
{
	var relDate = new Date(WV_RELEASE_VALID);
	var nowDate = Date.now();
	if(0 > relDate.getTime() - nowDate)
	{
		// destroy UI
		_UI = {};
		error("This build of " + WV_NAME + " has expired. Please upgrade!");
		return;
	}

	// init shortcuts
	UW = window;
	Wa = UW.Waze;
	nW = UW.W;
	WLM = nW.loginManager;
	WSM = nW.selectionManager;
	WM = nW.map;
	WMo = nW.model;
	WC = nW.controller;
	if(!Wa || !WLM || !WSM || !WM || !WMo || !WC || !$("#user-tabs"))
	{
		log("waiting for WME...")
		async(F_INIT, null, 1e3);
		return;
	}

	// detect new WME version
	if(classCodeDefined(UW.require))
	{
		R = UW.require;
			WME_BETA = /beta/.test(location.href);
	}

	// Google Analytics
	var _gaq = UW["_gaq"];
	if(_gaq)
	{
		_gaq.push([WV_NAME_ + "._setAccount", "UA-46853768-3"]);
		_gaq.push([WV_NAME_ + "._setDomainName", "waze.com"]);
		_gaq.push([WV_NAME_ + "._trackPageview"]);
	}

	_WV.$loggedIn = false;
	// install login/logout handler
	WLM.events.on({
		"loginStatus": onLogin,
		"login": onLogin
	});

	// do login or wait for user
	async(F_ONLOGIN);

	///////////////////////////////////////////////////////////////////////
	// Custom RegExp
	// build regexps
	_WV.buildRegExp = function(checkID, options, strRegExp)
	{
		try{
			// skip leading white spaces
			while(strRegExp && ' ' === strRegExp.charAt(0))
				strRegExp = strRegExp.substr(1);

			if(strRegExp)
			{
				// debug
				if('D' === strRegExp.charAt(0))
				{
					strRegExp = strRegExp.substr(1);
					options[CO_NUMBER] = 1;
				}
				else
					options[CO_NUMBER] = 0;
				// negate
				if('!' === strRegExp.charAt(0))
				{
					strRegExp = strRegExp.substr(1);
					options[CO_BOOL] = true;
				}
				else
					options[CO_BOOL] = false;

				if('/' === strRegExp.charAt(0))
					strRegExp = strRegExp.substr(1);
				var strRegExpOptions = '';
				var arrMatch = strRegExp.match(/\/([igmy]*)$/);
				if(arrMatch)
				{
					strRegExpOptions = arrMatch[1];
					strRegExp = strRegExp.slice(0, -arrMatch[0].length);
				}
				options[CO_REGEXP] =
					new RegExp(strRegExp, strRegExpOptions);
			}
			else
			{
				options[CO_BOOL] = false;
				options[CO_NUMBER] = 0;
				options[CO_REGEXP] = null;
			}
		} catch(e)
		{
			error(trSO("err.regexp", {"n": checkID}) + '\n\n' + e);
			options[CO_BOOL] = false;
			options[CO_NUMBER] = 0;
			options[CO_REGEXP] = null;
		}
	} // buildRegExp

	///////////////////////////////////////////////////////////////////////
	// Simple address and simple city classes

	/**
	 * Simple city object constructor
	 * @struct
	 * @param {number=} objID
	 * @constructor
	 */
	_WV.SimpleCITY = function(objID)
	{
		/** @type {number} */
		this.$hash = 0;
		/** @type {number} */
		this.$cityID = 0;
		/** @type {string} */
		this.$city = "";
		/** @type {string} */
		this.$state = "";
		/** @type {number} */
		this.$countryID = 0;
		/** @type {string} */
		this.$country = "";

		if(objID)
		{
			this.$cityID = objID;
			var oc = WMo.cities.get(objID);
			if(oc)
			{
				this.$city = oc.attributes.isEmpty ? "" : oc.attributes.name;
				var o = WMo.states.get(oc.attributes.stateID);
				if(o)
					this.$state = o.name;
					this.$countryID = oc.attributes.countryID;
				o = WMo.countries.get(oc.attributes.countryID);
				if(o)
					this.$country = o.name;
			}
			this.$hash = this.$cityID + this.$countryID;

			Object.defineProperties(this, {
				$hash: { writable: false },
				$cityID: { writable: false },
				$state: { writable: false },
				$countryID: { writable: false },
				$country: { writable: false },
			});
		}
	}
	/**
	 * Check access for the check
	 * @param {number} checkID
	 * @returns {boolean}
	 */
	_WV.SimpleCITY.prototype.isOkFor = function(checkID)
	{
		// check for global access
		if(!_RT.$isGlobalAccess) return false;

		/** @const */
		var rep = _RT.$checks[checkID];

		if(!rep.$cache) rep.$cache = {};
		/** @const */
		var cache = rep.$cache;

		/** @const */
		var forCity = rep.FORCITY;
		/** @const */
		var hash = forCity? this.$hash : this.$countryID;

		if(hash in cache) return cache[hash];

		// check access lists and create a hash record

		// no access by default
		cache[hash] = false;

		//////////////////////////////////////////////////////////////////////////
		// Check the level
		/** @const */
		var forLevel = rep.FORLEVEL;
		if(forLevel && forLevel > _RT.$topUser.$userLevel) return false;

		//////////////////////////////////////////////////////////////////////////
		// Check the city
		if(forCity)
		{
			/** @const */
			var curCity = this.$city.toUpperCase();
			if(!_WV.checkAccessFor(forCity,
				function(e) {return e.toUpperCase() === curCity})
			)
				return false;
		}

		//////////////////////////////////////////////////////////////////////////
		// Check the user
		/** @const */
		var forUser = rep.FORUSER;
		if(forUser)
		{
			/** @const */
			var curUser = _RT.$topUser.$userName.toUpperCase();
			if(!_WV.checkAccessFor(forUser,
				function(e) {return e.toUpperCase() === curUser})
			)
				return false;
		}

		//////////////////////////////////////////////////////////////////////////
		// Check the country
		/** @const */
		var forCountry = rep.FORCOUNTRY;
		if(forCountry)
		{
			/** @const */
			var curCountry = this.$country.toUpperCase();

			if(!_WV.checkAccessFor(forCountry, function(e) {
				if(e in _I18n.$code2country)
					return _I18n.$code2country[e] === curCountry;
				error("Please report: fc=" + e);
				return false;
			}))
				return false;
		}

		// the tool has passed all the checks
		cache[hash] = true;
		return true;
	}

	/**
	 * Simple address object constructor
	 * @struct
	 * @param {number} objID
	 * @constructor
	 */
	_WV.SimpleADDRESS = function(objID)
	{
		/** @type {number} */
		this.$streetID = 0;
		/** @type {string} */
		this.$street = "";

		if(objID)
		{
			this.$streetID = objID;
			var o = WMo.streets.get(objID);
			if(o)
			{
				this.$street = o.isEmpty ? "" : o.name;
				_WV.SimpleCITY.call(this, o.cityID);
			}
			else
			{
				this.$street = GL_NOID;
				_WV.SimpleCITY.call(this, 0);
			}
		}

		Object.defineProperties(this, {
			$streetID: { writable: false },
		});
	}
	_WV.SimpleADDRESS.prototype = new _WV.SimpleCITY;
	_WV.SimpleADDRESS.prototype.constructor = _WV.SimpleADDRESS;
}

/**
 * Warn User
 */
function F_ONWARNING(e)
{
	// update document
	_THUI.viewToDoc(_UI);

	// get target object
	var target = _THUI.getByDOM(_UI, e.target);

	// check if target has a warning
	if(target && target.CHECKED && target.WARNING)
		warning(target.WARNING);

	async(F_UPDATEUI);
}

/**
 * Update User Interface
 */
function F_UPDATEUI(e)
{
	/**
	 * Destroj HLs
	 */
	 function destroyHLs(){
		_RT.$HLedObjects = {};
		_RT.$HLlayer.destroyFeatures();
	 }
	/**
	 * Updates report buttons
	 */
	function updateReportButtons()
	{
		if(RTStateIs(ST_RUN)||RTStateIs(ST_CONTINUE))
		{
			btns.bReport.CLASS = "btn btn-default";
			btns.bReport.DISABLED = true;
			btns.bReportBB.DISABLED = true;
			return;
		}

		if(!_REP.$maxSeverity)
		{
			btns.bReport.CLASS = "btn btn-default";
			btns.bReport.DISABLED = true;
			btns.bReportBB.DISABLED = true;
		}
		else
		{
			switch(_REP.$maxSeverity)
			{
			case RS_NOTE:
				btns.bReport.CLASS = "btn btn-info";
				break;
			case RS_WARNING:
				btns.bReport.CLASS = "btn btn-warning";
				break;
			case RS_ERROR:
				btns.bReport.CLASS = "btn btn-danger";
				break;
			case RS_CUSTOM1:
				btns.bReport.CLASS = "btn btn-success";
				break;
			case RS_CUSTOM2:
				btns.bReport.CLASS = "btn btn-primary";
				break;
			}
			btns.bReport.DISABLED = false;
			btns.bReportBB.DISABLED = false;
		}

		// update start button
		if(3 < WM.getZoom())
		{
			btns.bScan.CLASS = "btn btn-default";
			btns.bScan.DISABLED = true;
			btns.bScan.TITLE = trS("button.scan.tip.NA");
		}
		else
		{
			btns.bScan.CLASS = "btn btn-success";
			btns.bScan.DISABLED = false;
			btns.bScan.TITLE = trS("button.scan.tip");
		}

		// update clear button
		if(_REP.$isLimitPerCheck)
		{
			btns.bClear.CLASS = "btn btn-danger";
			btns.bClear.TITLE = trS("button.clear.tip.red");
		}
		else
		{
			btns.bClear.CLASS = "btn btn-default";
			btns.bClear.TITLE = trS("button.clear.tip");
		}

		// update validator title
		if(_UI.pSettings.pScanner.oHLReported.CHECKED)
		{
// TODO: France
			_UI.pMain.pTabs.tMain.TEXT = '<i class="fa fa-check-square-o" aria-hidden="true"></i> ' + WV_SHORTNAME + ':';
//            _UI.pMain.pTabs.tMain.TEXT = '<i class="fa fa-check-square-o" aria-hidden="true"></i><span style="background-color:#9999e0"> Val</span><span style="background-color:#f8f8f8">ida</span><span style="background-color:#e09999">tor:</span>';
			_UI.pMain.pTabs.tMain.TITLE = trS("tab.switch.tip.off");
		}
		else
		{
			_UI.pMain.pTabs.tMain.TEXT = '<font color="#ccc"><i class="fa fa-power-off" aria-hidden="true"></i> ' + WV_SHORTNAME + ':</font>';
			_UI.pMain.pTabs.tMain.TITLE = trS("tab.switch.tip.on");
		}
		_UI.pMain.pTabs.tMain.TITLE += '\n' + WV_NAME + " Version " + WV_VERSION;

	}
	/**
	 * Returns simple representation of top city and country
	 */
	function getTopCity()
	{
		var i = WMo.segments.topCityID;
		if(i) return new _WV.SimpleCITY(i);

		return new _WV.SimpleCITY(0);
	}
	_RT.$topCity = getTopCity();
	if(_RT.$topCity.$country)
		_RT.$cachedTopCCode = _I18n.getCountryCode(_RT.$topCity.$country.toUpperCase());

	// update document
	_THUI.viewToDoc(_UI);

	// check global access
	_RT.$isGlobalAccess = true;
	if(!_RT.$topCity.isOkFor(0))
		_RT.$isGlobalAccess = false;

	if(!_RT.$isGlobalAccess)
	{
		_UI.pMain.NODISPLAY = 1;
		_UI.pSettings.NODISPLAY = 1;
		_UI.pTips.NODISPLAY = 1;
		_UI.pNoAccess.NODISPLAY = 0;
		_THUI.docToView(_UI);
		return;
	}
	else
		if(!_UI.pNoAccess.NODISPLAY)
		{
			_UI.pMain.NODISPLAY = 0;
			_UI.pTips.NODISPLAY = 0;
			_UI.pNoAccess.NODISPLAY = 1;
		}

	// check for Toolbox
	if(_RT.oReportToolbox.NA
		&& null !== document.getElementById(_RT.oReportToolbox.FORID))
	{
		_RT.oReportToolbox.CHECKED = true;
		_RT.oReportToolbox.NA = false;
		clearReport();
		async(ForceHLAllSegments, null, 1e3);
	}
	// check for WMECH
	if(_RT.oReportWMECH.NA
		&& null !== document.getElementById(_RT.oReportWMECH.FORID))
	{
		_RT.oReportWMECH.CHECKED = true;
		_RT.oReportWMECH.NA = false;
		clearReport();
		async(ForceHLAllSegments, null, 1e3);
	}
	// build custom RegExps
	var customOptions = _RT.$checks[128].OPTIONS[_I18n.$defLng];
	if(customOptions[CO_STRING] !== _UI.pSettings.pCustom.oTemplate1.VALUE
		|| _RT.$RegExp1 !== _UI.pSettings.pCustom.oRegExp1.VALUE)
	{
		customOptions[CO_STRING] = _UI.pSettings.pCustom.oTemplate1.VALUE;
		if(customOptions[CO_STRING])
		{
			clearErrorFlag();
			_RT.$RegExp1 = _UI.pSettings.pCustom.oRegExp1.VALUE;
			_WV.buildRegExp(128, customOptions,
				_UI.pSettings.pCustom.oRegExp1.VALUE);
		}
		else
			customOptions[CO_REGEXP] = null;
	}
	customOptions = _RT.$checks[129].OPTIONS[_I18n.$defLng];
	if(customOptions[CO_STRING] !== _UI.pSettings.pCustom.oTemplate2.VALUE
		|| _RT.$RegExp2 !== _UI.pSettings.pCustom.oRegExp2.VALUE)
	{
		customOptions[CO_STRING] = _UI.pSettings.pCustom.oTemplate2.VALUE;
		if(customOptions[CO_STRING])
		{
			clearErrorFlag();
			_RT.$RegExp2 = _UI.pSettings.pCustom.oRegExp2.VALUE;
			_WV.buildRegExp(128, customOptions,
				_UI.pSettings.pCustom.oRegExp2.VALUE);
		}
		else
			customOptions[CO_REGEXP] = null;
	}
	// set user checks flag
	if(_RT.$checks[128].OPTIONS[_I18n.$defLng][CO_REGEXP])
		_RT.$curMaxSeverity = RS_CUSTOM1;
	else if(_RT.$checks[129].OPTIONS[_I18n.$defLng][CO_REGEXP])
		_RT.$curMaxSeverity = RS_CUSTOM2;
	else
		_RT.$curMaxSeverity = RS_ERROR;

	///////////////////////////////////////////////////////////////////////
	// Button handlers
	if(e)
	{
		// check if a button pressed
		switch(_THUI.getByDOM(_UI, e.target))
		{
		case _UI.pMain.pTabs.tMain:
			_RT.$switchValidator = true;
			break;
		case _UI.pSettings.pCustom.oTemplate1:
		case _UI.pSettings.pCustom.oRegExp1:
		case _UI.pSettings.pCustom.oTemplate2:
		case _UI.pSettings.pCustom.oRegExp2:
			_RT.$isMapChanged = true;
			clearReport();
			async(ForceHLAllSegments);
			break;
		case _UI.pMain.pFilter.oExcludeNonEditables:
		case _UI.pMain.pFilter.oExcludeDuplicates:
		case _UI.pMain.pFilter.oExcludeStreets:
		case _UI.pMain.pFilter.oExcludeOther:
		case _UI.pMain.pFilter.oExcludeNotes:
		case _UI.pMain.pSearch.oIncludeYourEdits:
		case _UI.pMain.pSearch.oIncludeUpdatedBy:
		case _UI.pMain.pSearch.oIncludeUpdatedSince:
		case _UI.pMain.pSearch.oIncludeCityName:
		case _UI.pMain.pSearch.oIncludeChecks:
			_RT.$includeUpdatedByCache = {};
			_RT.$includeUpdatedSinceTime = 0;
			_RT.$includeCityNameCache = {};
			_RT.$includeChecksCache = {};
			// update max severity
			async(F_SHOWREPORT, RF_UPDATEMAXSEVERITY);
			// highlight segments
			async(ForceHLAllSegments);
			break;
		case _UI.pMain.pButtons.bScan:
			async(F_ONRUN);
			break;
		case _UI.pMain.pButtons.bStop:
			async(F_STOP);
			break;
		case _UI.pMain.pButtons.bClear:
			_RT.$isMapChanged = true;
			clearErrorFlag();
			clearReport();
			destroyHLs();
			break;
		case _UI.pMain.pButtons.bPause:
			_RT.$curMessage = {
				TEXT: trS("msg.paused.text"),
				TITLE: trS("msg.paused.tip"),
			};
			async(F_PAUSE);
			break;
		case _UI.pMain.pButtons.bContinue:
			// clear error flag
			clearErrorFlag();
			if(!RTStateIs(ST_PAUSE))
				break;
			// start report over
			if(LIMIT_TOTAL < _REP.$counterTotal)
				clearReport();

			async(F_LAYERSOFF);
			_RT.$curMessage = {
				TEXT: trS("msg.continuing.text"),
				TITLE: trS("msg.continuing.tip"),
			};
			setRTState(ST_CONTINUE);
			// restore start view and continue
			if(_RT.$startCenter)
			{
				WM.zoomTo(_RT.$startZoom);
				WM.panTo(_RT.$startCenter);
			}
			clearWD();
			break;
		case _UI.pMain.pButtons.bSettings:
			_UI.pMain.NODISPLAY = true;
			_UI.pSettings.NODISPLAY = false;
			_RT.$curMessage = {
				TEXT: trS("msg.settings.text"),
				TITLE: trS("msg.settings.tip"),
			};
			break;
		case _UI.pSettings.pButtons.bReset:
			resetDefaults();
			_RT.$curMessage = {
				TEXT: trS("msg.reset.text"),
				TITLE: trS("msg.reset.tip"),
			};
			// update max severity
			sync(F_SHOWREPORT, RF_UPDATEMAXSEVERITY);
			// highlight segments
			async(ForceHLAllSegments);
			break;
		case _UI.pSettings.pButtons.bBack:
			_UI.pMain.NODISPLAY = false;
			_UI.pSettings.NODISPLAY = true;
			break;
		case _UI.pSettings.pScanner.oHLReported:
			// switch Validator on/off
			_UI.pSettings.pScanner.oHLReported.CHECKED =
				!_UI.pSettings.pScanner.oHLReported.CHECKED;
			_RT.$switchValidator = true;
			break;
		}

		// check if target has a warning
		async(F_ONWARNING, e);
	}

	// check switch flag
	if(_RT.$switchValidator)
	{
		_UI.pSettings.pScanner.oHLReported.CHECKED =
			!_UI.pSettings.pScanner.oHLReported.CHECKED;
		if(_UI.pSettings.pScanner.oHLReported.CHECKED)
		{
			ForceHLAllSegments();
			_RT.$HLlayer.setVisibility(true);
		}
		else
		{
			ForceHLAllSegments();
			destroyHLs();
			_RT.$HLlayer.setVisibility(false);
		}
		_RT.$switchValidator = false;
	}

	// check if any editable segment was found
	if(_RT.$reportEditableNotFound)
	{
		_RT.$reportEditableNotFound = false;
		_UI.pMain.pFilter.oExcludeNonEditables.CHECKED = false;
		info("'Exclude non-editable segments' filter option has been removed because the area you just scanned has no editable segments.\n\nNow just click 'Show report' to view the report!");
	}
	///////////////////////////////////////////////////////////////////////
	// Update panels
	_UI.pMain.pHelp.NODISPLAY = !_UI.pMain.pTabs.tHelp.CHECKED;
	_UI.pMain.pFilter.NODISPLAY = !_UI.pMain.pTabs.tFilter.CHECKED;
	_UI.pMain.pSearch.NODISPLAY = !_UI.pMain.pTabs.tSearch.CHECKED;
	_UI.pSettings.pScanner.NODISPLAY = !_UI.pSettings.pTabs.tScanner.CHECKED;
	_UI.pSettings.pCustom.NODISPLAY = !_UI.pSettings.pTabs.tCustom.CHECKED;
	_UI.pSettings.pAbout.NODISPLAY = !_UI.pSettings.pTabs.tAbout.CHECKED;

	///////////////////////////////////////////////////////////////////////
	// Update buttons on panel
	if(_UI.pSettings.pTabs.tAbout.CHECKED)
	{
		_UI.pSettings.pButtons.bReset.NODISPLAY = 1;
		_UI.pSettings.pButtons.bList.NODISPLAY = 0;
		_UI.pSettings.pButtons.bWizard.NODISPLAY = 0;
	}
	else
	{
		_UI.pSettings.pButtons.bReset.NODISPLAY = 0;
		_UI.pSettings.pButtons.bList.NODISPLAY = 1;
		_UI.pSettings.pButtons.bWizard.NODISPLAY = 1;
	}

	///////////////////////////////////////////////////////////////////////
	// Update UI on state
	var btns = _UI.pMain.pButtons;
	switch(getRTState())
	{
	case ST_CONTINUE:
	case ST_RUN:
		btns.bScan.NODISPLAY = true;
		btns.bPause.NODISPLAY = false;
		btns.bContinue.NODISPLAY = true;
		btns.bStop.NODISPLAY = false;
		btns.bClear.NODISPLAY = true;
		updateReportButtons();
		btns.bSettings.DISABLED = true;
		_UI.pMain.pFilter._DISABLED = true;
		_UI.pMain.pSearch._DISABLED = true;
		break;
	case ST_STOP:
		btns.bScan.NODISPLAY = false;
		btns.bPause.NODISPLAY = true;
		btns.bContinue.NODISPLAY = true;
		btns.bStop.NODISPLAY = true;
		btns.bClear.NODISPLAY = false;
		if(isEmpty(_RT.$seen))
			btns.bClear.DISABLED = true;
		else
			btns.bClear.DISABLED = false;
		updateReportButtons();
		if(_REP.$maxSeverity && !_UI.pMain.NODISPLAY)
			_RT.$curMessage = {
				TEXT: trS("msg.finished.text"),
				TITLE: trS("msg.finished.tip"),
				CLASS: CL_MSGY
			};
		btns.bSettings.DISABLED = false;
		_UI.pMain.pFilter._DISABLED = false;
		_UI.pMain.pSearch._DISABLED = false;
		break;
	case ST_PAUSE:
		btns.bScan.NODISPLAY = true;
		btns.bPause.NODISPLAY = true;
		btns.bContinue.NODISPLAY = false;
		btns.bContinue.DISABLED = false;
		btns.bStop.NODISPLAY = false;
		btns.bClear.NODISPLAY = true;
		updateReportButtons();
		btns.bSettings.DISABLED = false;
		_UI.pMain.pFilter._DISABLED = false;
		_UI.pMain.pSearch._DISABLED = false;
		break;
	}

	///////////////////////////////////////////////////////////////////////
	// Update current message

	if(RTStateIs(ST_STOP) && !_REP.$maxSeverity)
	{
		// always display a zoom out message
		if(!_UI.pMain.NODISPLAY)
		{
			if(3 < WM.getZoom())
				_RT.$curMessage = {
					TEXT: _UI.pSettings.pScanner.oHLReported.CHECKED ?
						trS("msg.pan.text")
						: trS("msg.zoomout.text"),
					TITLE: "",
					CLASS: CL_MSGY
				};
			else
				_RT.$curMessage = {
					TEXT: trS("msg.click.text"),
					TITLE: "",
					CLASS: CL_MSGY
				};
		}
	}


	_UI.pTips.TEXT = _RT.$curMessage.TEXT;
	if(_RT.$curMessage.TITLE)
		_UI.pTips.TITLE = _RT.$curMessage.TITLE;
	else
		_UI.pTips.TITLE = "";
	if(_RT.$curMessage.CLASS)
		_UI.pTips.CLASS = _RT.$curMessage.CLASS;
	else
		_UI.pTips.CLASS = CL_MSG;

	// save values to local storage
	var storageObj = _THUI.saveValues(_UI);
	storageObj[AS_VERSION] = WV_VERSION;
	storageObj[AS_LICENSE] = WV_LICENSE_VERSION;
	storageObj[AS_PASSWORD] = 1;
	try
	{
		window.localStorage.setItem(AS_NAME,
			JSON.stringify(storageObj));
	}
	catch (err) {}

	// update view
	_THUI.docToView(_UI);
}

/**
 * Logout a user
 */
function F_LOGOUT()
{
	log("logout");
	// destroy UI
	_UI = {};

	// unregister event handlers
	WMo.events.un({
		"mergeend": onMergeEnd,
	});
	WM.events.un({
		"moveend": onMoveEnd,
		"zoomend": HLAllSegments,
		"changelayer": onChangeLayer,
	});
	WSM.events.un({
		"selectionchanged": ForceHLAllSegments
	});
	WC.events.un({
		"loadstart": onLoadStart,
	});

	// monitor segments and nodes changes
	WMo.segments.events.un({
		"objectsadded": onSegmentsAdded,
		"objectschanged": onSegmentsChanged,
		"objectsremoved": onSegmentsRemoved,
	});
	WMo.nodes.events.un({
		"objectschanged": onNodesChanged,
		"objectsremoved": onNodesRemoved,
	});
}

// call the init function when the library is initialized
async(F_INIT, 0, 1);
