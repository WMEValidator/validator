/*
 * basic.js -- WME Validator basic functions and handlers
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

/*************************************************************************
 * BASIC FUNCTIONS
 *************************************************************************/

/**
 * Escape message string
 * @param {string} msg
 */
function esc(msg) {
	return msg.split("\"").join("\\\"").split("\n").join("\\n");
}

/**
 * Escape regular expression
 * @param {string} e
 */
function escRE(e) {
	return e
		.split("\\").join("\\\\")
		.split("^").join("\\^")
		.split("$").join("\\$")
		.split("+").join("\\+")
		.split("?").join("\\?")
		.split(":").join("\\:")
		.split("!").join("\\!")
		.split(".").join("\\.")
		.split("-").join("\\-")
		.split("*").join(".*")
		.split("(").join("\\(")
		.split(")").join("\\)")
		.split("[").join("\\[")
		.split("]").join("\\]")
		.split("{").join("\\{")
		.split("}").join("\\}")
		;
}

/**
 * Get a message
 * @param {string} mType
 * @param {string} msg
 * @param {boolean=} newLine
 */
function getMsg(mType, msg, newLine) {
	return WV_NAME + " v" + WV_VERSION
		+ (mType ? " " + mType : "")
		+ (msg ? ":"
			+ (newLine ? "\n" : " ")
			+ msg : "");
}

/**
 * Log a message
 * @param {string} msg
 */
function log(msg) {
	window.console.log(getMsg("", msg));
}

/**
 * Show error message
 * @param {string} msg
 */
function error(msg) {
	var s = getMsg("error", msg, true);
	log(s);
	if (!isErrorFlag()) {
		// set error flag
		setErrorFlag();
		alert(s);
	}

	// pause scanning
	async(F_PAUSE);

	// error code
	return -1;
}

/**
 * Show warning message
 * @param {string} msg
 */
function warning(msg) {
	var s = getMsg("warning", msg, true);
	log(s);
	alert(s);

	// error code
	return -1;
}

/**
 * Show info message
 * @param {string} msg
 */
function info(msg) {
	var s = getMsg("", msg, true);
	alert(s);

	// error code
	return -1;
}

/**
 * Execute the function synchronously
 * @param {*=} param
 */
function sync(func, param) {
	return func(param);
}

/**
 * Execute the function asynchronously
 * @param {*=} param
 * @param {number=} inter
 */
function async(func, param, inter) {
	var i = 0;
	if (inter) i = inter;

	window.setTimeout(func, i, param);
}

/**
 * Clear Watch Dogs
 */
function clearWD() {
	// kill WGs
	window.clearTimeout(_RT.$WDmoveID);
	window.clearTimeout(_RT.$WDloadID);
	_RT.$WDmoveID = -1;
	_RT.$WDloadID = -1;
}

/**
 * Update timer
 */
function updateTimer(nstate) {
	var csec = Date.now() / 1e3;

	// update timer
	if (RTStateIs(ST_RUN))
		_RT.$timer.$secInRun += csec - _RT.$timer.$lastUpdate;
	if (RTStateIs(ST_STOP))
		_RT.$timer.$secInRun = 0;
	_RT.$timer.$lastUpdate = csec;
}

/**
 * Set run time state
 */
function setRTState(nstate) {
	// you cannot pause on stop
	if (RTStateIs(ST_STOP) && ST_PAUSE === nstate)
		nstate = ST_STOP;

	updateTimer(nstate);

	// set state
	_RT.$state = nstate;

	// update UI
	async(F_UPDATEUI);
}

/**
 * Clear report
 */
function clearReport() {
	_RT.$seen = {};
	_RT.$revalidate = {};
	_REP = {
		// debug counter
		$debugCounter: LIMIT_DEBUG,
		// limit per check has exceeded
		$isLimitPerCheck: false,
		// at least one editable segment found
		$isEditableFound: false,
		$counterTotal: 0,
		$maxSeverity: 0,
		$incompleteIDs: {},
		$users: {},
		$reportCounters: {},
		$cityCounters: {},
		$countries: {},
		$cities: {},
		$streets: {},
		$cityIDs: {},
		$unsortedCityIDs: [],
		$sortedCityIDs: [],
	};

	_RT.$reportEditableNotFound = false;
}

/**
 * Beep if not muted
 * @param {string=} oscType
 */
function beep(dur, oscType) {
	try {
		if (_UI.pSettings.pScanner.oSounds.CHECKED)
			_AUDIO.beep(dur, oscType);
	}
	catch (e) { }
}

/**
 * Set error flag
 */
function setErrorFlag() { _RT.$error = true }

/**
 * Get error flag
 */
function isErrorFlag() { return _RT.$error }
/**
 * Clear error flag
 */
function clearErrorFlag() { _RT.$error = false }

/**
 * Check run time state
 */
function RTStateIs(st) { return getRTState() === st }
/**
 * Returns current run time state
 */
function getRTState() { return _RT.$state }

/**
 * Highlight segments
 */
function HLAllSegments() {
	if (RTStateIs(ST_STOP) || RTStateIs(ST_PAUSE)) {
		if (_UI.pSettings.pScanner.oHLReported.CHECKED)
			sync(F_VALIDATE, false);
		else
			sync(F_VALIDATE, true);
	}
	// always update UI to update zoom levels/allowed countries
	async(F_UPDATEUI);
}

/**
 * Force Highlight segments
 */
function ForceHLAllSegments() {
	_RT.$isMapChanged = true;
	HLAllSegments();
}

/**
 * Reset Defaults
 */
function resetDefaults() {
	_UI.pMain.pFilter.oExcludeNonEditables.CHECKED = true;
	_UI.pMain.pFilter.oExcludeDuplicates.CHECKED = true;
	_UI.pMain.pFilter.oExcludeStreets.CHECKED = false;
	_UI.pMain.pFilter.oExcludeOther.CHECKED = false;
	_UI.pMain.pFilter.oExcludeNotes.CHECKED = false;

	_UI.pMain.pSearch.oIncludeYourEdits.CHECKED = false;
	_UI.pMain.pSearch.oIncludeUpdatedBy.VALUE = '';
	_RT.$includeUpdatedByCache = {};
	_UI.pMain.pSearch.oIncludeUpdatedSince.VALUE = "";
	_RT.$includeUpdatedSinceTime = 0;
	_UI.pMain.pSearch.oIncludeCityName.VALUE = "";
	_RT.$includeCityNameCache = {};
	_UI.pMain.pSearch.oIncludeChecks.VALUE = "";
	_RT.$includeChecksCache = {};

	_UI.pSettings.pScanner.oSlowChecks.CHECKED = true;
	_UI.pSettings.pScanner.oReportExt.CHECKED = true;
	_UI.pSettings.pScanner.oHLReported.CHECKED = true;
	//  _UI.pSettings.pScanner.oShowLayers.CHECKED = false;
	_UI.pSettings.pScanner.oSounds.CHECKED = false;

	_UI.pSettings.pCustom.oTemplate1.VALUE = "";
	_UI.pSettings.pCustom.oRegExp1.VALUE = "";
	_UI.pSettings.pCustom.oTemplate2.VALUE = "";
	_UI.pSettings.pCustom.oRegExp2.VALUE = "";
}

/**
 * Compare checks IDs (array sort)
 */
function cmpCheckIDs(a, b) {
	var checkA = _RT.$checks[a], checkB = _RT.$checks[b];
	if (checkA.SEVERITY !== checkB.SEVERITY)
		return checkB.SEVERITY - checkA.SEVERITY;

	// if severities are the same - sort by the name
	var cmp = checkA.TITLE.localeCompare(checkB.TITLE);
	if (!cmp)
		return a - b;
	return cmp;
}
/**
 * Check no city
 */
function checkNoCity(str) {
	return str ? str : "No City";
}
/**
 * Check no street
 */
function checkNoStreet(str) {
	return str ? str : "No Street";
}

/**
 * Returns new max severity after filters has been applied
 */
function getFilteredSeverity(oldSeverity, checkID, checkToHL) {
	if (!_UI.pMain.pSearch.oIncludeChecks.VALUE)
		return oldSeverity;

	var check = _RT.$checks[checkID];
	if (checkToHL && check.REPORTONLY)
		return 0;

	var textSeverity = getTextSeverity(check.SEVERITY).toUpperCase();

	var cache = _RT.$includeChecksCache;
	/** @const */
	var hash = checkID;

	if (hash in cache) {
		if (cache[hash])
			return check.SEVERITY;
	}
	else {
		var forChecks = _UI.pMain.pSearch.oIncludeChecks.VALUE;
		// try top country
		var ccode = _RT.$cachedTopCCode;
		var options = trO(check.OPTIONS, ccode);
		var curTitle = exSOS(check.TITLE, options, "titleEN");
		try {
			cache[hash] = false;
			if (_WV.checkAccessFor(forChecks,
				function (e) {
					if (/^#?\d+$/.test(e)) {
						if ("#" === e.charAt(0))
							e = e.slice(1)
						// try to compare IDs
						return +checkID === +e;
					}
					if (e.toUpperCase() === textSeverity)
						return true;
					// escape user input
					e = escRE(e);
					var r = new RegExp("^" + e + "$", "i");
					return r.test(curTitle);
				})
			) {
				cache[hash] = true;
				return check.SEVERITY;
			}
		}
		catch (e) {
			//          delete cache[hash];
			//          error("Error in 'Reported as' search field:\n\n" + e);
		}
	}

	return 0;
}
/**
 * Returns new max severity after filters has been applied
 */
function getFilteredSeverityObj(oldSeverity, checkIDs, checkToHL) {
	if (!_UI.pMain.pSearch.oIncludeChecks.VALUE)
		return oldSeverity;

	var ret = 0;
	for (var cid in checkIDs) {
		if (!checkIDs.hasOwnProperty(cid))
			continue;

		var check = _RT.$checks[cid];
		if (getFilteredSeverity(check.SEVERITY, cid, checkToHL)) {
			if (ret < check.SEVERITY) {
				ret = check.SEVERITY;

				if (_RT.$curMaxSeverity === ret)
					return ret;
			}
		}
	} // for all check IDs

	return ret;
}
/**
 * Check filter
 */
function checkFilter(severity, segmentCopy, seenSegments) {
	if (seenSegments) {
		if (segmentCopy.$segmentID in seenSegments
			&& _UI.pMain.pFilter.oExcludeDuplicates.CHECKED)
			return false;
		seenSegments[segmentCopy.$segmentID] = null;
	}

	if ((RR_STREET === segmentCopy.$typeRank
		|| RR_SERVICE === segmentCopy.$typeRank)
		&& _UI.pMain.pFilter.oExcludeStreets.CHECKED)
		return false;
	if (RR_SERVICE > segmentCopy.$typeRank
		&& _UI.pMain.pFilter.oExcludeOther.CHECKED)
		return false;
	if (!segmentCopy.$isEditable
		&& _UI.pMain.pFilter.oExcludeNonEditables.CHECKED)
		return false;
	if (RS_NOTE === severity
		&& _UI.pMain.pFilter.oExcludeNotes.CHECKED)
		return false;

	if (segmentCopy.$userID !== _RT.$topUser.$userID
		&& !_UI.pMain.pSearch.oIncludeYourEdits.NODISPLAY
		&& _UI.pMain.pSearch.oIncludeYourEdits.CHECKED)
		return false;

	if (!_UI.pMain.pSearch.oIncludeUpdatedBy.NODISPLAY
		&& _UI.pMain.pSearch.oIncludeUpdatedBy.VALUE) {
		var cache = _RT.$includeUpdatedByCache;
		var hash = segmentCopy.$userID;

		if (hash in cache) {
			if (!cache[hash])
				return false;
		}
		else {
			var forUser = _UI.pMain.pSearch.oIncludeUpdatedBy.VALUE;
			var curUser = _REP.$users[segmentCopy.$userID];
			try {
				cache[hash] = false;
				// check if the user tries to match another user
				if (curUser !== _RT.$topUser.$userName
					&& !_RT.$topUser.$isCM
					&& !_RT.$topUser.$isSuperUser)
					return false;
				// check if CM match country ID
				if (_RT.$topUser.$isCM
					&& -1 === _RT.$topUser.$countryIDs.indexOf(segmentCopy.$countryID))
					return false;
				if (!_WV.checkAccessFor(forUser,
					function (e) {
						// escape user input
						e = escRE(e);
						// substitute 'me'
						e = e.replace(/(^|\b)(me|i)($|\b)/gi, _RT.$topUser.$userName);

						var r = new RegExp("^" + e + "$", "i");
						return r.test(curUser);
					})
				)
					return false;
				cache[hash] = true;
			}
			catch (e) { }
		}
	}

	if (segmentCopy.$updated && _UI.pMain.pSearch.oIncludeUpdatedSince.VALUE) {
		try {
			if (!_RT.$includeUpdatedSinceTime)
				_RT.$includeUpdatedSinceTime =
					new Date(_UI.pMain.pSearch.oIncludeUpdatedSince.VALUE).getTime();
			if (segmentCopy.$updated < _RT.$includeUpdatedSinceTime)
				return false;
		}
		catch (e) { }
	}

	if (_UI.pMain.pSearch.oIncludeCityName.VALUE) {
		if (!segmentCopy.$cityID)
			return false;

		var cache = _RT.$includeCityNameCache;
		var hash = segmentCopy.$cityID;

		if (hash in cache) {
			if (!cache[hash])
				return false;
		}
		else {
			var forCity = _UI.pMain.pSearch.oIncludeCityName.VALUE;
			var curCity = _REP.$cities[segmentCopy.$cityID];
			try {
				cache[hash] = false;
				if (!_WV.checkAccessFor(forCity,
					function (e) {
						// escape user input
						e = escRE(e);
						var r = new RegExp("^" + e + "$", "i");
						return r.test(curCity);
					})
				)
					return false;
				cache[hash] = true;
			}
			catch (e) { }
		}
	}

	return true;
}

/**
 * Translate object by country code
 */
function trO(obj, ccode) {
	if (obj)
		return _I18n.getValueOC(obj, ccode);
}

/**
 * Get check options
 */
function getCheckOptions(checkID, ccode) {
	return _I18n.getValueOC(_RT.$checks[checkID].OPTIONS, ccode);
}

/**
 * Get Left Direction
 */
function trLeft(dir) {
	if ("ltr" === dir)
		return "left";
	else
		return "right";
}

/**
 * Get Right Direction
 */
function trRight(dir) {
	if ("ltr" === dir)
		return "right";
	else
		return "left";
}

/**
 * Translate string
 */
function trS(label) {
	return _I18n.getString(label);
}

/**
 * Translate string with options
 */
function trSO(label, options) {
	return _I18n.expandSO(_I18n.getString(label), options);
}

/**
 * Expand string with options and substitute
 */
function exSOS(str, options, subst) {
	if (options && _I18n.$defLng === _RT.$lng && options[subst])
		return _I18n.expandSO(options[subst], options);
	else
		return _I18n.expandSO(str, options);
}

/**
 * Returns text representation of severity
 */
function getTextSeverity(sev) {
	switch (sev) {
		case RS_WARNING: return "warning";
		case RS_ERROR: return "error";
		case RS_CUSTOM1: return "custom1";
		case RS_CUSTOM2: return "custom2";
	}
	return "note";
}

/*************************************************************************
 * HANDLERS
 *************************************************************************/

/**
 * Update UI handler
 */
function onUpdateUI(e) {
	async(F_UPDATEUI, e);
}

/**
 * Show Available Checks Handler (only sync calls for popup blocker!)
 */
function onShowChecks(e) {
	sync(F_SHOWREPORT, RF_LIST);
}

/**
 * Create language pack (only sync calls for popup blocker!)
 */
function onCreatePack(e) {
	sync(F_SHOWREPORT, RF_CREATEPACK);
}

/**
 * Show Report Handler (only sync calls for popup blocker!)
 */
function onShowReport(e) {
	sync(F_SHOWREPORT, RF_HTML);
}

/**
 * Show BB Report Handler (only sync calls for popup blocker!)
 */
function onShareReport(e) {
	sync(F_SHOWREPORT, RF_BB);
}

/**
 * Warning handler
 */
function onWarning(e) {
	async(F_ONWARNING, e);
}

/**
 * Login changed handler
 */
function onLogin() {
	async(F_ONLOGIN);
}

/**
 * Merge End Handler
 */
function onMergeEnd() {
	_RT.$isMapChanged = true;
	// kill WDs
	window.clearTimeout(_RT.$WDmoveID);
	window.clearTimeout(_RT.$WDloadID);

	async(F_ONMERGEEND);
}

/**
 * Move End Handler
 */
function onMoveEnd() {
	if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE))
		async(F_ONMOVEEND);
	else
		ForceHLAllSegments();
}

/**
 * Load Start Handler
 */
function onLoadStart() {
	async(F_ONLOADSTART);
}

/**
 * Change Layer Handler
 */
function onChangeLayer(e) {
	sync(F_ONCHANGELAYER, e);
}

/**
 * Segments Changed Handler
 */
function onSegmentsChanged(e) {
	_RT.$isMapChanged = true;
	sync(F_ONSEGMENTSCHANGED, e);
}
/**
 * Segments Removed Handler
 */
function onSegmentsRemoved(e) {
	_RT.$isMapChanged = true;
	if (1 === e.length)
		if (RTStateIs(ST_STOP) || RTStateIs(ST_PAUSE))
			sync(F_ONSEGMENTSCHANGED, e);
}
/**
 * Segments Removed Handler
 */
function onSegmentsAdded(e) {
	_RT.$isMapChanged = true;
}

/**
 * Nodes Changed Handler
 */
function onNodesChanged(e) {
	_RT.$isMapChanged = true;
	sync(F_ONNODESCHANGED, e);
}
/**
 * Nodes Removed Handler
 */
function onNodesRemoved(e) {
	_RT.$isMapChanged = true;
	if (1 === e.length)
		if (RTStateIs(ST_STOP) || RTStateIs(ST_PAUSE))
			sync(F_ONNODESCHANGED, e);
}
