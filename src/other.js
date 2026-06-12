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
 *
 * WME Validator is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WME Validator. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * On Segments Changed Handler
 */
function F_ONSEGMENTSCHANGED(e) {
	// add nearby segments to _RT.$revalidate
	let changedNodes = [];
	for (let i = 0; i < e.length; i++) {
		const sg = wmeSDK.DataModel.Segments.getById({segmentId: e[i]} );
		if (sg) {
			var nodeIDs = [sg.fromNodeId, sg.toNodeId];
			for (let j = 0; j < nodeIDs.length; j++) {
				let nodeID = nodeIDs[j];
				if (!nodeID) continue;
				let node = wmeSDK.DataModel.Nodes.getById({nodeId: nodeID} );
				if (node)
					changedNodes.push(node);
			}
		}
	}
	if (changedNodes.length)
		sync(F_ONNODESCHANGED, changedNodes);
}

/**
 * On Nodes Changed Handler
 */
function F_ONNODESCHANGED(e) {
	// add nearby segments to _RT.$revalidate
	let reHL = false;
	for (let i = 0; i < e.length; i++) {
		let nd = e[i];
		if (typeof nd === 'number') { nd = wmeSDK.DataModel.Nodes.getById({nodeId: nd} ); }
		//console.log('VAL NODES CHANGED ' + i, nd);
		if (nd) {
			let ids = nd.hasOwnProperty('connectedSegmentIds') ? nd.connectedSegmentIds :nd.attributes.segIDs;

			for (let j = 0; j < ids.length; j++)
				_RT.$revalidate[ids[j]] = true,
					reHL = true;
		}
	}
	// revalidate all the objects
	if (reHL)
		HLAllObjects();
}

/**
* On Venues Changed Handler
*/
function F_ONVENUESCHANGED(e) {
	// add nearby venues to _RT.$revalidate
	var reHL = false;
	for (var i = e.length - 1; i >= 0; i--) {
		var id = e[i];
		_RT.$revalidate[id] = true;
		reHL = true;
	}
	if (reHL)
		HLAllObjects();
}

/**
 * On Change Layer Handler
 */
/** @suppress {strictMissingProperties} */
function F_ONCHANGELAYER(e) {
	// Trigger of layer change was not by a layer (ie WMETB Config Dialog)
	if (!e.hasOwnProperty('layerName')) {
		return;
	}
/*	if (-1 !== e.layer.id.indexOf(GL_TBPREFIX)) {
		if (!e.layer.visibility) {
			for (var segmentID in WMo.segments.objects) {
				if (!WMo.segments.objects.hasOwnProperty(segmentID)) continue;
				delete WMo.segments.objects[segmentID][GL_TBCOLOR];
			}
		}
		ForceHLAllObjects();
	}
	else */
		if (GL_LAYERNAME === e.layerName
			&& wmeSDK.Map.isLayerVisibile({ layerName: GL_LAYERNAME }) !== _UI.pSettings.pScanner.oHLReported.CHECKED) {
			// switch Validator on/off
			_RT.$switchValidator = true;
			async(F_UPDATEUI);
		}
}

/**
 * On Move End Handler
 */
/** @suppress {strictMissingProperties} */
function F_ONMOVEEND() {
	const c = wmeSDK.Map.getMapCenter();

	if (-1 === _RT.$WDmoveID
		&& -1 === _RT.$WDloadID
		&& ptEqual(c,_RT.$nextCenter)
	)
		_RT.$WDmoveID = window.setTimeout(onMergeEnd, WD_SHORT);
	else {
		// autopause on user move
		if (RTStateIs(ST_RUN) && !_RT.$firstStep
			&& !ptEqual(c,_RT.$nextCenter)
			&& !ptEqual(c,_RT.$startCenter)
		) {
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
/** @suppress {strictMissingProperties} */
function F_ONLOADSTART() {
	const c = wmeSDK.Map.getMapCenter();

	// kill move WD
	window.clearTimeout(_RT.$WDmoveID);

	if (-1 === _RT.$WDloadID
		&& ptEqual(c,_RT.$nextCenter)
	)
		_RT.$WDloadID = window.setTimeout(onMergeEnd, WD_LONG);

	_RT.$WDmoveID = -1;

}

/**
 * Pass in a layer switcher DOM selector. If its currently checked/enabled, disable it and add to layerToggle list
 */
function disableLayer( sel )
{
	const l = document.querySelector(sel);
	if (l && l.checked) {
		l.click();
		_RT.layerToggle.push(sel);
	}
}

/**
 * Switch all layers but roads off
 */
/** @suppress {strictMissingProperties} */
function F_LAYERSOFF() {
	// TODO:
	//  Waze.Config.segments.zoomToRoadType[SCAN_ZOOM] = -1;

	wmeSDK.Map.removeAllFeaturesFromLayer( { layerName: GL_LAYERNAME } );
	if (GL_SHOWLAYERS)
		return;
	_RT.layerToggle = [];
	disableLayer('#layer-switcher-group_display');
	disableLayer('#layer-switcher-group_permanent_hazards');
	disableLayer("#layer-switcher-group_issues_tracker");
	disableLayer("#layer-switcher-group_places");

}

/**
 * Switch all layers back on
 */
/** @suppress {strictMissingProperties} */
function F_LAYERSON() {
	if (_RT.layerToggle.length == 0 || GL_SHOWLAYERS)
		return;

	for (let l = 0; l<_RT.layerToggle.length; l++) {
		const ll = document.querySelector(_RT.layerToggle[l]);
		ll.click();
	}
	_RT.layerToggle = [];

}

/**
 * Pause scanning
 */
function F_PAUSE() {
	if (!RTStateIs(ST_RUN))
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
/** @suppress {strictMissingProperties} */
function F_STOP() {
	if (!RTStateIs(ST_STOP)) {
		beep(100, "square");
		// restore current view
		if (_RT.$startCenter) {
			wmeSDK.Map.setMapCenter({ lonLat: _RT.$startCenter, zoomLevel: _RT.$startZoom} );
		}
		if (!_REP.$maxSeverity)
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
 * Compares two points, passed in as lonLat object
 */
function ptEqual(a,b)
{
	const aa = turf.point( [a.lon, a.lat] );
	const bb = turf.point( [b.lon, b.lat] );
	const eq = turf.booleanEqual(aa,bb);
	return eq;
}

/**
 * Merge End Handler
 */
/** @suppress {strictMissingProperties} */
function F_ONMERGEEND() {
	const ldf = W.app.attributes.loadingFeatures;
	if (ldf ) {
		setTimeout(F_ONMERGEEND, 50);
		return;
	}
	/** @const */
	const c = wmeSDK.Map.getMapCenter();

	// skip all but next center runs
	if (RTStateIs(ST_RUN) && _RT.$nextCenter && !ptEqual(c,_RT.$nextCenter)) {
		return;
	}
	//tlog("ONMERGEEND called...");

	const [left, bottom, right, top] = wmeSDK.Map.getMapExtent();
	const p1 = turf.point( [left,top]);
	const p2 = turf.point( [right,top]);
	const p3 = turf.point( [left,bottom]);
	const ew = turf.distance(p1,p2,u_meters);
	const eh = turf.distance(p1,p3,u_meters);

	/** @const */
	var ew2 = ew / 2;
	/** @const */
	var eh2 = eh / 2;
	var s = _RT.$startExtent;
	if (!s) {
		s = { left, bottom, right, top};
		//showExtent(s, 'ONMERGE set s: ');
	}
	const s1 = turf.point( [s.left,s.top]);
	const s2 = turf.point( [s.right,s.top]);
	const s3 = turf.point( [s.left,s.bottom]);

	/** @const */
	var cx = c.lon;
	/** @const */
	var cy = c.lat;
	/** @const */
	var dir = Math.round(_RT.$direction / Math.abs(_RT.$direction));

	const sw = turf.distance(s1,s2,u_meters);
	const sh = turf.distance(s1,s3,u_meters);

	// calculate real step X and Y
	/** @const */
	var kxMax = Math.ceil(sw / (ew * SCAN_STEP / 100));
	/** @const */
	var stepX = sw / kxMax;
	/** @const */
	var kyMax = Math.ceil(sh / (eh * SCAN_STEP / 100));
	/** @const */
	var stepY = sh / kyMax;

	if (RTStateIs(ST_CONTINUE)) {
		if (_RT.$nextCenter) {
			setRTState(ST_RUN);
			// restore current view and continue
			wmeSDK.Map.setMapCenter({ lonLat: _RT.$nextCenter, zoomLevel: SCAN_ZOOM} );
			clearWD();
			return;
		}
		// no saved position - rerun
		async(F_ONRUN);
		return;
	}
	// Highlight reported objects
	if (!RTStateIs(ST_RUN)) {
		HLAllObjects();
		return;
	}

	async(F_UPDATEUI);

	if (_RT.$firstStep) {
		// make first step
		_RT.$firstStep = false;
		_RT.$curStep = 1;
		_RT.$stepCount = kxMax * kyMax;
		const startPt = turf.point([s.left,s.top]);
		let newPtA = turf.destination(startPt,ew2,90, u_meters);
		let newPt = turf.destination(newPtA,eh2,0, u_meters);
		_RT.$nextCenter = { lon:newPt.geometry.coordinates[0], lat: newPt.geometry.coordinates[1] };
		showPt(_RT.$nextCenter, 'ONMERGE FIRSTSTEP nxCen: ');
		wmeSDK.Map.setMapCenter({ lonLat: _RT.$nextCenter, zoomLevel: SCAN_ZOOM} );
		clearWD();
		return;
	}

	// do the job!
	//tlog("ONMERGEEND DO VALIDATE ...");
	sync(F_VALIDATE, false);

	///////////////////////////////////////////////////////////////////////
	// New X coordinate

	// 1. Get nearest position
	var deltaX = Number.MAX_VALUE;
	var deltaY = Number.MAX_VALUE;
	var kx = 0;
	var ky = 0;
/*	for (var i = 0; ; i++) {
		var x = s.left + ew2 + i * stepX;
		var y = s.top - eh2 - i * stepY;
		if (x > s.right && y < s.bottom) break;

		var cd = Math.abs(x - cx);
		if (cd < deltaX) deltaX = cd, kx = i;

		cd = Math.abs(y - cy);
		if (cd < deltaY) deltaY = cd, ky = i;
	} */
	updateTimer(ST_RUN);
	_RT.$curStep++;
	//var curStep = ky * kxMax + (0 < dir ? kx : kxMax - kx);
	if (4 < _RT.$curStep) {
		//if (0 === curStep % 5) {
			//var maxStep = (kyMax*(kxMax - 1));
			var maxStep = kyMax * kxMax;
			var minETA = (maxStep / _RT.$curStep - 1) * _RT.$timer.$secInRun / 60;
			var strMsg = (1 > minETA) ?
				trS("msg.scanning.text.soon")
				: trSO("msg.scanning.text", { "n": Math.round(minETA) })
				;
			_RT.$curMessage = {
				TEXT: strMsg,
				TITLE: trS("msg.scanning.tip"),
			};
		//}
	}

	// 2. Make an X step
	kx = kx + dir;

	// 3. Check if new X is within start extent
	let newX; // = s.left + ew2 + kx * stepX;
	const startPt = turf.point([cx,cy]);
	let newPt = turf.destination(startPt,stepX,90, u_meters);
	newX = newPt.geometry.coordinates[0];
	if (newX < s.left || newX > s.right
		// or if center is closer to the start border that the edge
		// || Math.abs(newX - s.left) < Math.abs(newX - ew2 - s.left)  // #######
		// || Math.abs(newX - s.right) < Math.abs(newX + ew2 - s.right)
	) {
		// step back
		newX = s.left + ew2 + (kx - dir) * stepX;
		const startPt = turf.point([s.left,cy]);
		let newPtA = turf.destination(startPt,ew2,90, u_meters);
		newPt = turf.destination(newPtA,stepY,180, u_meters);
		newX = newPt.geometry.coordinates[0];
		//showPt(newPt, 'ONMERGE move down nxCen: ');
		// change direction
		//_RT.$direction = -_RT.$direction;
		// make an Y step
		ky++;
	}

	// 4. Check if new Y is within start extent
	//var newY = s.top - eh2 - ky * stepY;
	let newY = newPt.geometry.coordinates[1];
	if (newY < s.bottom
		// or if center is closer to the start border that the edge
		// ### || Math.abs(newY - s.bottom) < Math.abs(newY - eh2 - s.bottom)
	) {
		// finished!
		// check if any editable objects was found
		if (!_REP.$isEditableFound && _UI.pMain.pFilter.oExcludeNonEditables.CHECKED)
			_RT.$reportEditableNotFound = true;

		async(F_STOP);
		return;
	}

	_RT.$nextCenter = { lon: newX, lat: newY };
	showPt(_RT.$nextCenter, 'ONMERGE PAN step ' + _RT.$curStep +' nxCen: ');
	// pan map
	wmeSDK.Map.setMapCenter({ lonLat: _RT.$nextCenter, zoomLevel: SCAN_ZOOM} );
	clearWD();
}
function showcoord( f )
{
	return f.toString().substring(0,7) + ' ';
}
function showPt( p, tx )
{
	let e;
	if (p.geometry) {
		const cc = p.geometry.coordinates;
		e = showcoord(cc[0]);
		e += showcoord(cc[1]);
	}
	else {
		e = showcoord(p.lon);
		e += showcoord(p.lat);
	}
	console.info('VAL ' + tx + e)
}
function showExtent( ex, tx )
{
	let e = showcoord(ex.left);
	e += showcoord(ex.bottom);
	e += showcoord(ex.right);
	e += showcoord(ex.top);
	console.info('VAL ' + tx + e);
}

/**
 * Run Handler
 */
/** @suppress {strictMissingProperties} */
function F_ONRUN() {
	// clear error flag
	clearErrorFlag();

	if (RTStateIs(ST_RUN))
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
	let [left, bottom, right, top] = wmeSDK.Map.getMapExtent();
	_RT.$startExtent = {left, bottom, right, top};
	showExtent(_RT.$startExtent, 'ONRUN start: ');
	_RT.$startCenter = wmeSDK.Map.getMapCenter();
	_RT.$startZoom = wmeSDK.Map.getZoomLevel();
	_RT.$nextCenter = null;
	_RT.$moveEndCenter = null;

	//  clearReport();

	_RT.$nextCenter = { lon:left, lat: top };
	showPt(_RT.$nextCenter, 'ONRUN start nxCen: ');
	wmeSDK.Map.setMapCenter({ lonLat: _RT.$nextCenter, zoomLevel: SCAN_ZOOM} );
}

/**
 * Login Handler
 */
function F_ONLOGIN() {
	if (wmeSDK.State.isLoggedIn()) {
		if (!_WV.$loggedIn) {
			// set the flag and do login
			_WV.$loggedIn = true;
			async(F_LOGIN);
		}
	}
	else {
		if (_WV.$loggedIn) {
			// reset the flag and do logout
			_WV.$loggedIn = false;
			async(F_LOGOUT);
		}
		else {
			// we have no user and no flag is set
			log("waiting for login...");
			async(F_ONLOGIN, null, 1e3);
		}
	}
}

/**
 * Init
 */
function F_INIT() {
	// init shortcuts
	//UW = window;
	//nW = UW.W;
	//WLM = nW.loginManager;
//	WSM = nW.selectionManager;
	//WM = nW.map;
	//WMo = nW.model;
	//WC = nW.controller;
/*	if (!nW || !WLM || !WLM.user || !WSM || !WM || !WMo || !WC || !$("#user-tabs")) {
		log("waiting for WME...")
		async(F_INIT, null, 1e3);
		return;
	} */
	// Now we surely have WM as map, but stuff moved to W.map.olMap for us
	// So we redefine WM here to use olMap instead, now we have map loaded.
	//WM = nW.map.olMap;

	// detect new WME version
	WME_BETA = /beta/.test(location.href);
	setupPolicy();

	// Google Analytics
	/*var _gaq = UW["_gaq"];
	if (_gaq) {
		_gaq.push(["WME_Validator._setAccount", "UA-46853768-3"]);
		_gaq.push(["WME_Validator._setDomainName", "waze.com"]);
		_gaq.push(["WME_Validator._trackPageview"]);
	} */

	// check for .address-edit added to the edit-panel
	const panelObserver = new MutationObserver((mutations) => {
		mutations.forEach(function(mutation) {
			for (let i = 0; i < mutation.addedNodes.length; i++) {
				const addedNode = mutation.addedNodes[i];

				// Only fire up if it's a node
				if (addedNode.nodeType === Node.ELEMENT_NODE) {
					if (addedNode.querySelector('.address-edit')) {
						//log('address-edit added to DOM');
						addPanelDetails();
					}
				}
			}
		});
	});
	panelObserver.observe(document.getElementById('edit-panel'), { childList: true , subtree: true });

	_WV.$loggedIn = false;
	// install login/logout handler
	wmeSDK.Events.on({ eventName: "wme-logged-in", eventHandler:onLogin });

	// do login or wait for user
	async(F_ONLOGIN);

	///////////////////////////////////////////////////////////////////////
	// Custom RegExp
	// build regexps
	_WV.buildRegExp = function (checkID, options, strRegExp) {
		try {
			// skip leading white spaces
			while (strRegExp && ' ' === strRegExp.charAt(0))
				strRegExp = strRegExp.substr(1);

			if (strRegExp) {
				// debug
				if ('D' === strRegExp.charAt(0)) {
					strRegExp = strRegExp.substr(1);
					options[CO_NUMBER] = 1;
				}
				else
					options[CO_NUMBER] = 0;
				// negate
				if ('!' === strRegExp.charAt(0)) {
					strRegExp = strRegExp.substr(1);
					options[CO_BOOL] = true;
				}
				else
					options[CO_BOOL] = false;

				if ('/' === strRegExp.charAt(0))
					strRegExp = strRegExp.substr(1);
				var strRegExpOptions = '';
				var arrMatch = strRegExp.match(/\/([igmy]*)$/);
				if (arrMatch) {
					strRegExpOptions = arrMatch[1];
					strRegExp = strRegExp.slice(0, -arrMatch[0].length);
				}
				options[CO_REGEXP] =
					new RegExp(strRegExp, strRegExpOptions);
			}
			else {
				options[CO_BOOL] = false;
				options[CO_NUMBER] = 0;
				options[CO_REGEXP] = null;
			}
		} catch (e) {
			error(trSO("err.regexp", { "n": checkID }) + '\n\n' + e);
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
	_WV.SimpleCITY = function (objID) {
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

		if (objID) {
			this.$cityID = objID;
			var oc = wmeSDK.DataModel.Cities.getById( {cityId: objID} );
			if (oc) {
				this.$city = oc.isEmpty ? "" : oc.name;
				var o = wmeSDK.DataModel.States.getById( {stateId: oc.stateId} );
				if (o)
					this.$state = o.name;
				this.$countryID = oc.countryId;
				o = wmeSDK.DataModel.Countries.getById( {countryId: oc.countryId} );
				if (o)
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
	_WV.SimpleCITY.prototype.isOkFor = function (checkID) {
		// check for global access
		if (!_RT.$isGlobalAccess) return false;

		/** @const */
		var rep = _RT.$checks[checkID];

		if (!rep.$cache) rep.$cache = {};
		/** @const */
		var cache = rep.$cache;

		/** @const */
		var forCity = rep.FORCITY;
		/** @const */
		var hash = forCity ? this.$hash : this.$countryID;

		if (hash in cache) return cache[hash];

		// check access lists and create a hash record

		// no access by default
		cache[hash] = false;

		//////////////////////////////////////////////////////////////////////////
		// Check the level
		/** @const */
		var forLevel = rep.FORLEVEL;
		if (forLevel && forLevel > _RT.$topUser.$userLevel) return false;

		//////////////////////////////////////////////////////////////////////////
		// Check the city
		if (forCity) {
			/** @const */
			var curCity = this.$city.toUpperCase();
			if (!_WV.checkAccessFor(forCity,
				function (e) { return e.toUpperCase() === curCity })
			)
				return false;
		}

		//////////////////////////////////////////////////////////////////////////
		// Check the user
		/** @const */
		var forUser = rep.FORUSER;
		if (forUser) {
			/** @const */
			var curUser = _RT.$topUser.$userName.toUpperCase();
			if (!_WV.checkAccessFor(forUser,
				function (e) { return e.toUpperCase() === curUser })
			)
				return false;
		}

		//////////////////////////////////////////////////////////////////////////
		// Check the country
		/** @const */
		var forCountry = rep.FORCOUNTRY;
		if (forCountry) {
			/** @const */
			var curCountry = this.$country.toUpperCase();

			if (!_WV.checkAccessFor(forCountry, function (e) {
				if (e in _I18n.$code2country)
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
	_WV.SimpleADDRESS = function (objID) {
		/** @type {number} */
		this.$streetID = 0;
		/** @type {string} */
		this.$street = "";
		if (objID?.isEmpty) {
		}
		else if (objID?.street) {
			this.$streetID = objID.street.id;
		} else if (objID) {
			this.$streetID = objID;
		}

		if (this.$streetID) {
			let o = wmeSDK.DataModel.Streets.getById({streetId: this.$streetID}) ;//WMo.streets.getObjectById(objID);
			if (o) {
				this.$street = o.isEmpty ? '' : o.name;
				_WV.SimpleCITY.call(this, o.cityId)
			}
			else {
				this.$street = GL_NOID;
				_WV.SimpleCITY.call(this, 0);
			}
		}

		Object.defineProperties(this, {
			$streetID: { writable: false },
		});
	};
	_WV.SimpleADDRESS.prototype = new _WV.SimpleCITY;
	_WV.SimpleADDRESS.prototype.constructor = _WV.SimpleADDRESS;
}

/**
 * Warn User
 */
function F_ONWARNING(e) {
	// update document
	_THUI.viewToDoc(_UI);

	// get target object
	var target = _THUI.getByDOM(_UI, e.target);

	// check if target has a warning
	if (target && target.CHECKED && target.WARNING)
		warning(target.WARNING);

	async(F_UPDATEUI);
}

/**
 * Update User Interface
 */
/** @suppress {strictMissingProperties} */
function F_UPDATEUI(e) {
	/**
	 * Destroj HLs
	 */
	function destroyHLs() {
		_RT.$HLedObjects = {};
		wmeSDK.Map.removeAllFeaturesFromLayer( { layerName: GL_LAYERNAME } );
	}
	/**
	 * Updates report buttons
	 */
	function updateReportButtons() {
		if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE)) {
			btns.bReport.CLASS = "btn btn-default";
			btns.bReport.DISABLED = true;
			btns.bReportBB.DISABLED = true;
			return;
		}

		if (!_REP.$maxSeverity) {
			btns.bReport.CLASS = "btn btn-default";
			btns.bReport.DISABLED = true;
			btns.bReportBB.DISABLED = true;
		}
		else {
			switch (_REP.$maxSeverity) {
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
		if (15 < wmeSDK.Map.getZoomLevel()) {
			btns.bScan.CLASS = "btn btn-default";
			btns.bScan.DISABLED = true;
			btns.bScan.TITLE = trS("button.scan.tip.NA");
		}
		else {
			btns.bScan.CLASS = "btn btn-success";
			btns.bScan.DISABLED = false;
			btns.bScan.TITLE = trS("button.scan.tip");
		}

		// update clear button
		if (_REP.$isLimitPerCheck) {
			btns.bClear.CLASS = "btn btn-danger";
			btns.bClear.TITLE = trS("button.clear.tip.red");
		}
		else {
			btns.bClear.CLASS = "btn btn-default";
			btns.bClear.TITLE = trS("button.clear.tip");
		}

		// update validator title
		if (_UI.pSettings.pScanner.oHLReported.CHECKED) {
			// TODO: France
			_UI.pMain.pTabs.tMain.TEXT = '<i class="fa fa-check-square-o" aria-hidden="true"></i> ' + 'Validator:';
			//            _UI.pMain.pTabs.tMain.TEXT = '<i class="fa fa-check-square-o" aria-hidden="true"></i><span style="background-color:#9999e0"> Val</span><span style="background-color:#f8f8f8">ida</span><span style="background-color:#e09999">tor:</span>';
			_UI.pMain.pTabs.tMain.TITLE = trS("tab.switch.tip.off");
		}
		else {
			_UI.pMain.pTabs.tMain.TEXT = '<font color="#ccc"><i class="fa fa-power-off" aria-hidden="true"></i> ' + 'Validator:</font>';
			_UI.pMain.pTabs.tMain.TITLE = trS("tab.switch.tip.on");
		}
		_UI.pMain.pTabs.tMain.TITLE += '\nWME Validator Version ' + WV_VERSION;

	}
	/**
	 * Returns simple representation of top city and country
	 */
	function getTopCity() {
		let i = wmeSDK.DataModel.Cities.getTopCity();
		if (i) return new _WV.SimpleCITY(i.id);

		return new _WV.SimpleCITY(0);
	}
	_RT.$topCity = getTopCity();
	if (_RT.$topCity.$country)
		_RT.$cachedTopCCode = _I18n.getCountryCode(_RT.$topCity.$country.toUpperCase());

	// update document
	_THUI.viewToDoc(_UI);

	// check global access
	_RT.$isGlobalAccess = true;
	if (!_RT.$topCity.isOkFor(0))
		_RT.$isGlobalAccess = false;

	if (!_RT.$isGlobalAccess) {
		_UI.pMain.NODISPLAY = 1;
		_UI.pSettings.NODISPLAY = 1;
		_UI.pTips.NODISPLAY = 1;
		_UI.pNoAccess.NODISPLAY = 0;
		_THUI.docToView(_UI);
		return;
	}
	else
		if (!_UI.pNoAccess.NODISPLAY) {
			_UI.pMain.NODISPLAY = 0;
			_UI.pTips.NODISPLAY = 0;
			_UI.pNoAccess.NODISPLAY = 1;
		}

	// check for Toolbox
	if (_RT.oReportToolbox.NA
		&& null !== document.getElementById(_RT.oReportToolbox.FORID)) {
		_RT.oReportToolbox.CHECKED = true;
		_RT.oReportToolbox.NA = false;
		clearReport();
		async(ForceHLAllObjects, null, 1e3);
	}
	// check for WMECH
	if (_RT.oReportWMECH.NA
		&& null !== document.getElementById(_RT.oReportWMECH.FORID)) {
		_RT.oReportWMECH.CHECKED = true;
		_RT.oReportWMECH.NA = false;
		clearReport();
		async(ForceHLAllObjects, null, 1e3);
	}
	// build custom RegExps
	var customOptions = _RT.$checks[128].OPTIONS[_I18n.$defLng];
	if (customOptions[CO_STRING] !== _UI.pSettings.pCustom.oTemplate1.VALUE
		|| _RT.$RegExp1 !== _UI.pSettings.pCustom.oRegExp1.VALUE) {
		customOptions[CO_STRING] = _UI.pSettings.pCustom.oTemplate1.VALUE;
		if (customOptions[CO_STRING]) {
			clearErrorFlag();
			_RT.$RegExp1 = _UI.pSettings.pCustom.oRegExp1.VALUE;
			_WV.buildRegExp(128, customOptions,
				_UI.pSettings.pCustom.oRegExp1.VALUE);
		}
		else
			customOptions[CO_REGEXP] = null;
	}
	customOptions = _RT.$checks[129].OPTIONS[_I18n.$defLng];
	if (customOptions[CO_STRING] !== _UI.pSettings.pCustom.oTemplate2.VALUE
		|| _RT.$RegExp2 !== _UI.pSettings.pCustom.oRegExp2.VALUE) {
		customOptions[CO_STRING] = _UI.pSettings.pCustom.oTemplate2.VALUE;
		if (customOptions[CO_STRING]) {
			clearErrorFlag();
			_RT.$RegExp2 = _UI.pSettings.pCustom.oRegExp2.VALUE;
			_WV.buildRegExp(128, customOptions,
				_UI.pSettings.pCustom.oRegExp2.VALUE);
		}
		else
			customOptions[CO_REGEXP] = null;
	}
	// set user checks flag
	if (_RT.$checks[128].OPTIONS[_I18n.$defLng][CO_REGEXP])
		_RT.$curMaxSeverity = RS_CUSTOM1;
	else if (_RT.$checks[129].OPTIONS[_I18n.$defLng][CO_REGEXP])
		_RT.$curMaxSeverity = RS_CUSTOM2;
	else
		_RT.$curMaxSeverity = RS_ERROR;

	///////////////////////////////////////////////////////////////////////
	// Button handlers
	if (e) {
		// check if a button pressed
		switch (_THUI.getByDOM(_UI, e.target)) {
			case _UI.pMain.pTabs.tMain:
				_RT.$switchValidator = true;
				break;
			case _UI.pSettings.pCustom.oTemplate1:
			case _UI.pSettings.pCustom.oRegExp1:
			case _UI.pSettings.pCustom.oTemplate2:
			case _UI.pSettings.pCustom.oRegExp2:
				_RT.$isMapChanged = true;
				clearReport();
				async(ForceHLAllObjects);
				break;
			case _UI.pMain.pFilter.oEnablePlaces:
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
				// highlight objects
				async(ForceHLAllObjects);
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
				if (!RTStateIs(ST_PAUSE))
					break;
				// start report over
				if (LIMIT_TOTAL < _REP.$counterTotal)
					clearReport();

				async(F_LAYERSOFF);
				_RT.$curMessage = {
					TEXT: trS("msg.continuing.text"),
					TITLE: trS("msg.continuing.tip"),
				};
				setRTState(ST_CONTINUE);
				// restore start view and continue
				if (_RT.$startCenter) {
					wmeSDK.Map.setMapCenter({ lonLat: _RT.$startCenter, zoomLevel: _RT.$startZoom} );
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
				// highlight objects
				async(ForceHLAllObjects);
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
	if (_RT.$switchValidator) {
		_UI.pSettings.pScanner.oHLReported.CHECKED =
			!_UI.pSettings.pScanner.oHLReported.CHECKED;
		if (_UI.pSettings.pScanner.oHLReported.CHECKED) {
			ForceHLAllObjects();
			wmeSDK.Map.setLayerVisibility( { layerName: GL_LAYERNAME, visibility: true });
		}
		else {
			ForceHLAllObjects();
			destroyHLs();
			wmeSDK.Map.setLayerVisibility( { layerName: GL_LAYERNAME, visibility: false });
		}
		_RT.$switchValidator = false;
	}

	// check if any editable objects was found
	if (_RT.$reportEditableNotFound) {
		_RT.$reportEditableNotFound = false;
		_UI.pMain.pFilter.oExcludeNonEditables.CHECKED = false;
		info(trS("filter.noneditables.reverted"));
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
	if (_UI.pSettings.pTabs.tAbout.CHECKED) {
		_UI.pSettings.pButtons.bReset.NODISPLAY = 1;
		_UI.pSettings.pButtons.bList.NODISPLAY = 0;
		_UI.pSettings.pButtons.bWizard.NODISPLAY = 0;
	}
	else {
		_UI.pSettings.pButtons.bReset.NODISPLAY = 0;
		_UI.pSettings.pButtons.bList.NODISPLAY = 1;
		_UI.pSettings.pButtons.bWizard.NODISPLAY = 1;
	}

	///////////////////////////////////////////////////////////////////////
	// Update UI on state
	var btns = _UI.pMain.pButtons;
	switch (getRTState()) {
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
			if (isEmpty(_RT.$seen))
				btns.bClear.DISABLED = true;
			else
				btns.bClear.DISABLED = false;
			updateReportButtons();
			if (_REP.$maxSeverity && !_UI.pMain.NODISPLAY)
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

	if (RTStateIs(ST_STOP) && !_REP.$maxSeverity) {
		// always display a zoom out message
		if (!_UI.pMain.NODISPLAY) {
			if (15 < wmeSDK.Map.getZoomLevel())
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
	if (_RT.$curMessage.TITLE)
		_UI.pTips.TITLE = _RT.$curMessage.TITLE;
	else
		_UI.pTips.TITLE = "";
	if (_RT.$curMessage.CLASS)
		_UI.pTips.CLASS = _RT.$curMessage.CLASS;
	else
		_UI.pTips.CLASS = CL_MSG;

	// save values to local storage
	var storageObj = _THUI.saveValues(_UI);
	storageObj[AS_VERSION] = WV_VERSION;
	storageObj[AS_LICENSE] = WV_LICENSE_VERSION;
	storageObj[AS_PASSWORD] = 1;
	try {
		window.localStorage.setItem(AS_NAME,
			JSON.stringify(storageObj));
	}
	catch (err) { }

	// update view
	_THUI.docToView(_UI);
}

/**
 * Logout a user
 */
function F_LOGOUT() {
	log("logout");
	// destroy UI
	_UI = {};

	// unregister event handlers
	eventOff("wme-map-move-end",onMoveEnd);
	eventOff("wme-map-zoom-changed",onZoomEnd);
	eventOff("wme-map-layer-changed",onChangeLayer);
	eventOff("wme-selection-changed",  onSelChanged);
	eventOff("wme-data-model-objects-added", onObjectsAdded );
	eventOff("wme-data-model-objects-changed", onObjectsChanged );
	eventOff("wme-data-model-objects-removed", onObjectsRemoved );

}
function eventOff( eventName, eventHandler ) {
	try {
		wmeSDK.Events.off({ eventName, eventHandler });
	} catch(e) {
		console.info('VAL Events.off failed ' + eventName);
	}
}

// call the init function when the library is initialized
window.SDK_INITIALIZED.then(() => {
	wmeSDK = getWmeSdk({ scriptId, scriptName });
	wmeSDK.Events.once({ eventName: 'wme-ready' }).then(async () => {
		F_INIT();
	});
});

