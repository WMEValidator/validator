/*
 * validate.js -- WME Validator main functionality
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
 * Validate current view
 */
function F_VALIDATE(disabledHL) {
	if (!_RT.$isMapChanged)
		return;
	_RT.$isMapChanged = false;

	// global update severity flag
	var bUpdateMaxSeverity = false;

	if (RTStateIs(ST_RUN))
		beep(10);

	var options;
	var skippedSegment = false;

	if (disabledHL) {
		updateSegmentProperties([], true);
		return;
	}
	if (LIMIT_TOTAL < _REP.$counterTotal && !isErrorFlag()) {
		setErrorFlag();
		if (RTStateIs(ST_RUN)) {
			window.alert(getMsg(
				trS("msg.autopaused"),
				"\n" + trS("msg.limit.segments")
				+ trS("msg.limit.segments.continue"),
				true));
			// pause scanning
			sync(F_PAUSE);
		}
		else
			warning(trS("msg.limit.segments")
				+ trS("msg.limit.segments.clear"));

		return;
	}

	///////////////////////////////////////////////////////////////////////
	// 0. Prepare objects

	// update map info
	_RT.$topCenter = WM.getCenter();

	// 1. Dispatch per view WHC event
	if (_UI.pSettings.pScanner.oReportExt.CHECKED
		&& _RT.oReportWMECH.CHECKED) {
		var el = document.getElementById(_RT.oReportWMECH.FORID);
		if (el) {
			var ev = new CustomEvent("click");
			el.dispatchEvent(ev);
		}
	}

	// 3. TODO: Loop over the segments & run per segment tools
	//  try
	//  {
	//      sync(F_CHECKSEGMENTS);
	//  }
	//  catch(e) {log("ERROR: " + e)}


	// Shortcuts
	/** @const */
	var _repC = _REP.$cities;
	/** @const */
	var _repCC = _REP.$cityCounters;
	/** @const */
	var _repRC = _REP.$reportCounters;
	/** @const */
	var _repS = _REP.$streets;
	/** @const */
	var _repU = _REP.$users;

	///////////////////////////////////////////////////////////////////////
	// Support Functions
	/**
	 * Check limit
	 */
	function isLimitOk(id) {
		if (DEF_DEBUG) {
			return true;
		}
		else
			return !(LIMIT_PERCHECK < _repRC[id]);
	}
	/**
	 * Format date
	 * @returns {string}
	 * @param {string} d
	 */
	function formatDate(d) { var n = new Date(d); return n.toISOString().substr(0, 10); }

	/**
	 * Get user name
	 * @returns {string}
	 * @param {number} objID
	 */
	function getUserName(objID) {
		var u = WMo.users.get(objID);
		return u ? u.userName : objID.toString();
	}

	/**
	 * Get user level
	 * @returns {number}
	 * @param {number} objID
	 */
	function getUserLevel(objID) {
		var u = WMo.users.get(objID);
		return u ? u.normalizedLevel : 0;
	}

	/**
	 * Simple node object constructor
	 * @constructor
	 * @struct
	 * @param {number} objID
	 * @param {number} segID
	 */
	function SimpleNODE(objID, segID) {
		// cached node
		/** @type {Waze.NODE} */
		this.$rawNode = null;
		/** @type {number} */
		this.$nodeID = objID;
		// cached center
		/** @type {OpenLayers.LonLat} */
		this._center = null;
		this.$center = null;
		/** @type {boolean} */
		this.$isUturn = false;
		/** @type {boolean} */
		this.$isEditable = true;
		/** @type {boolean} */
		this.$isPartial = true;
		/** @type {Array} */
		this._rawRestrictions = [];
		/** @type {Array} */
		this._rawRestrictionIDs = [];
		/** @type {Array.<SimpleRESTRICTION>} */
		this._restrictions = null;
		/** @type {Array.<SimpleRESTRICTION>} */
		this.$restrictions = null;
		/** @type {Array} */
		this._rawOtherSegments = [];
		/** @type {Array} */
		this._otherSegments = null;
		/** @type {Array} */
		this.$otherSegments = null;
		/** @type {Array} */
		this._rawOutConnections = [];
		/** @type {Array} */
		this._outConnections = null;
		/** @type {Array} */
		this.$outConnections = null;
		/** @type {Array} */
		this._rawInConnections = [];
		/** @type {Array} */
		this._inConnections = null;
		/** @type {Array} */
		this.$inConnections = null;
		/** @type {number} */
		this.$restrictionsLen = 0;
		/** @type {number} */
		this.$otherSegmentsLen = 0;
		/** @type {number} */
		this.$outConnectionsLen = 0;
		/** @type {number} */
		this.$inConnectionsLen = 0;

		var n = WMo.nodes.get(objID);
		this.$rawNode = n;
		if (n) {
			this.$isPartial = n.attributes.partial;
			this.$isEditable = n.areConnectionsEditable();
			// convert restrictions into an array
			var co = n.attributes.restrictions;
			for (var k in co) {
				if (!co[k])
					continue;
				var _con = k.split(',');
				var con0 = +_con[0];
				if (segID === con0) {
					var con1 = +_con[1];
					var cok = co[k];
					for (var j = 0, l = cok.length; j < l; j++) {
						this._rawRestrictions.push(cok[j]);
						this._rawRestrictionIDs.push(con1);
					}
				}

			}
			this.$restrictionsLen = this._rawRestrictions.length;
			// convert segIDs into an array
			for (var i = 0; i < n.attributes.segIDs.length; i++) {
				var si = n.attributes.segIDs[i];
				// TODO: workaround for hangs at new segment save / 20150105
				if (segID === si || !WMo.segments.get(si))
					continue;
				this._rawOtherSegments.push(si);
			}
			this.$otherSegmentsLen = this._rawOtherSegments.length;
			// convert connections into in/out arrays
			co = n.attributes.connections;
			for (var k in co) {
				if (!co[k])
					continue;
				var _con = k.split(',');
				var con0 = +_con[0];
				var con1 = +_con[1];

				if (segID === con0 && segID === con1) {
					this.$isUturn = true;
					continue;
				}
				// out connection
				if (segID === con0)
					this._rawOutConnections.push(con1);
				// in connection
				if (segID === con1)
					this._rawInConnections.push(con0);
			}
		}
		this.$outConnectionsLen = this._rawOutConnections.length;
		this.$inConnectionsLen = this._rawInConnections.length;

		Object.defineProperties(this, {
			$rawNode: { enumerable: false },
			$nodeID: { writable: false },
			_center: { enumerable: false },
			$center: { get: this.getCenter },
			$isUturn: { writable: false },
			$isEditable: { writable: false },
			$isPartial: { writable: false },
			_rawRestrictions: { enumerable: false },
			_rawRestrictionIDs: { enumerable: false },
			_restrictions: { enumerable: false },
			$restrictions: { get: this.getRestrictions },
			_rawOtherSegments: { enumerable: false },
			_otherSegments: { enumerable: false },
			$otherSegments: { get: this.getOtherSegments },
			_rawOutConnections: { enumerable: false },
			_outConnections: { enumerable: false },
			$outConnections: { get: this.getOutConnections },
			_rawInConnections: { enumerable: false },
			_inConnections: { enumerable: false },
			$inConnections: { get: this.getInConnections },
			$restrictionsLen: { writable: false },
			$otherSegmentsLen: { writable: false },
			$outConnectionsLen: { writable: false },
			$inConnectionsLen: { writable: false },
		});
	}
	/**
	 * Get center
	 * @returns {OpenLayers.LonLat}
	 */
	SimpleNODE.prototype.getCenter = function () {
		if (this._center) return this._center;

		if (!this.$rawNode) return null;

		var bounds = this.$rawNode.geometry.bounds;
		this._center = new OpenLayers.LonLat(bounds.left, bounds.bottom)
			.transform(WM.projection, WM.displayProjection);
		// round the lon/lat
		this._center.lon = Math.round(this._center.lon * 1e5) / 1e5;
		this._center.lat = Math.round(this._center.lat * 1e5) / 1e5;
		return this._center;
	};
	/**
	 * Get restrictions
	 * *returns {Array.<SimpleRESTRICTION>}
	 */
	SimpleNODE.prototype.getRestrictions = function () {
		var t;
		return this._restrictions ? this._restrictions :
			(t = this, this._restrictions = this._rawRestrictions.map(
				function (e, i) {
					return new SimpleRESTRICTION(e, t._rawRestrictionIDs[i])
				})
			);
	}
	/**
	 * Get outward connection
	 * *returns {SimpleSEGMENT}
	 */
	SimpleNODE.prototype.getOutConnections = function () {
		return this._outConnections ? this._outConnections :
			this._outConnections = this._rawOutConnections.map(
				function (e) { return new SimpleSEGMENT(e) });
	}
	/**
	 * Get inward connection
	 * *returns {SimpleSEGMENT}
	 */
	SimpleNODE.prototype.getInConnections = function () {
		return this._inConnections ? this._inConnections :
			this._inConnections = this._rawInConnections.map(
				function (e) { return new SimpleSEGMENT(e) });
	}
	/**
	 * Get another segment
	 * *returns {SimpleSEGMENT}
	 */
	SimpleNODE.prototype.getOtherSegments = function () {
		return this._otherSegments ? this._otherSegments :
			this._otherSegments = this._rawOtherSegments.map(
				function (e) { return new SimpleSEGMENT(e) });
	}


	/**
	 * Simple restriction object constructor
	 * @constructor
	 * @struct
	 * @param {Waze.RESTRICTION} obj
	 * @param {number} segID
	 */
	function SimpleRESTRICTION(obj, segID) {
		// cached node
		/** *type {SimpleSEGMENT} */
		this._to = null;
		this.$to = null;
		/** @type {number} */
		this.$toID = segID;
		/** @type {boolean} */
		this.$allDay = obj.allDay || false;
		/** @type {number} */
		this.$days = obj.days;
		/** @type {string} */
		this.$description = (obj.description || "");
		/** @type {boolean} */
		this.$isInThePast = obj.isInThePast() || false;
		/** @type {boolean} */
		this.$isEnabled = obj.enabled || false;
		/** @type {string} */
		this.$fromDate = (obj.fromDate || "");
		/** @type {string} */
		this.$fromTime = (obj.fromTime || "");
		/** @type {string} */
		this.$toDate = (obj.toDate || "");
		/** @type {string} */
		this.$toTime = (obj.toTime || "");
		/** @type {number} */
		this.$vehicles = obj.vehicleTypes;

		Object.defineProperties(this, {
			_to: { enumerable: false },
			$to: { get: this.getTo },
			$toID: { writable: false },
			$allDay: { writable: false },
			$days: { writable: false },
			$description: { writable: false },
			$isInThePast: { writable: false },
			$isEnabled: { writable: false },
			$fromDate: { writable: false },
			$fromTime: { writable: false },
			$toDate: { writable: false },
			$toTime: { writable: false },
			$vehicles: { writable: false }
		});
	}
	/**
	 * Get to segment
	 * *returns {SimpleSEGMENT}
	 */
	SimpleRESTRICTION.prototype.getTo = function () {
		return this._to ? this._to :
			this._to = new SimpleSEGMENT(this.$toID);
	};

	/**
	 * Simple representation of a segment constructor
	 * @constructor
	 * @struct
	 * @param {number} objID
	 */
	function SimpleSEGMENT(objID) {
		// cached segment
		/** @type {Waze.SEGMENT} */
		this.$rawSegment = null;
		// cached node
		/** *type {SimpleNODE} */
		this._nodeA = null;
		this.$nodeA = null;
		this.$nodeAID = 0;
		// cached node
		/** *type {SimpleNODE} */
		this._nodeB = null;
		this.$nodeB = null;
		this.$nodeBID = 0;
		// cached center
		/** @type {OpenLayers.LonLat} */
		this._center = null;
		this.$center = null;
		// cached restriction
		/** @type {Array.<SimpleRESTRICTION>} */
		this._ABRestrictions = null;
		/** @type {Array.<SimpleRESTRICTION>} */
		this.$ABRestrictions = null;
		// cached restriction
		/** @type {Array.<SimpleRESTRICTION>} */
		this._BARestrictions = null;
		/** @type {Array.<SimpleRESTRICTION>} */
		this.$BARestrictions = null;

		/** @type {number} */
		this.$segmentID = objID;
		/** *type {_WV.SimpleADDRESS} */
		this.$address = null;
		/** @type {boolean} */
		this.$isTurnALocked = false;
		/** @type {boolean} */
		this.$isTurnBLocked = false;
		/** @type {boolean} */
		this.$isRoundabout = false;
		/** @type {boolean} */
		this.$hasHNs = false;
		/** @type {boolean} */
		this.$isEditable = false;
		/** @type {boolean} */
		this.$forceNonEditable = false;
		/** @type {number} */
		this.$type = 0;
		/** @type {number} */
		this.$typeRank = 0;
		/** @type {number} */
		this.$direction = 0;
		/** @type {boolean} */
		this.$isToll = false;
		/** @type {number} */
		this.$elevation = 0;
		/** @type {number} */
		this.$lock = 0;
		/** @type {number} */
		this.$rank = 0;
		/** @type {number} */
		this.$length = 0;
		/** @type {string} */
		this.$updatedOn = "";
		/** @type {string} */
		this.$updatedBy = "";
		/** @type {number} */
		this.$updatedByID = 0;
		/** @type {number} */
		this.$updatedByLevel = 0;
		/** @type {string} */
		this.$createdOn = "";
		/** @type {string} */
		this.$createdBy = "";
		/** @type {number} */
		this.$createdByID = 0;
		/** @type {number} */
		this.$createdByLevel = 0;
		/** @type {Array} */
		this.$alts = [];
		/** @type {number} */
		this.$ABRestrictionsLen = 0;
		/** @type {number} */
		this.$BARestrictionsLen = 0;

		var seg = WMo.segments.get(objID);
		if (classCodeIs(seg, CC_UNDEFINED) || classCodeIs(seg, CC_NULL))
			return;

		var attrs = seg.attributes;

		this.$rawSegment = seg;
		this.$nodeAID = attrs.fromNodeID;
		this.$nodeBID = attrs.toNodeID;

		this.$address = new _WV.SimpleADDRESS(attrs.primaryStreetID);

		this.$isTurnALocked = attrs.revTurnsLocked;
		this.$isTurnBLocked = attrs.fwdTurnsLocked;
		this.$isRoundabout = classCodeDefined(attrs.junctionID)
			&& null !== attrs.junctionID;
		this.$hasHNs = attrs.hasHNs;
		this.$isEditable = seg.arePropertiesEditable();
		this.$type = attrs.roadType;
		this.$typeRank = this.getTypeRank(attrs.roadType);

		this.$direction = getDirection(seg);
		// TODO: this.$isToll = seg.isTollRoad();
		this.$elevation = attrs.level;
		this.$lock = attrs.lockRank + 1;
		this.$rank = attrs.rank + 1;
		if ("length" in attrs)
			this.$length = attrs.length;
		else
			this.$length = Math.round(seg.geometry.getGeodesicLength(WM.projection));

		if (attrs.updatedOn)
			this.$updatedOn = formatDate(attrs.updatedOn);
		if (0 < attrs.updatedBy) {
			this.$updatedByID = attrs.updatedBy;
			this.$updatedBy = getUserName(attrs.updatedBy);
			this.$updatedByLevel = getUserLevel(attrs.updatedBy);
		}
		if (attrs.createdOn)
			this.$createdOn = formatDate(attrs.createdOn);
		if (attrs.createdBy) {
			this.$createdByID = attrs.createdBy;
			this.$createdBy = getUserName(attrs.createdBy);
			this.$createdByLevel = getUserLevel(attrs.createdBy);
		}
		this.$alts = attrs.streetIDs.map(function (objID) {
			return new _WV.SimpleADDRESS(objID);
		});
		this.$ABRestrictionsLen = attrs.fwdRestrictions ?
			attrs.fwdRestrictions.length : 0;
		this.$BARestrictionsLen = attrs.revRestrictions ?
			attrs.revRestrictions.length : 0;

		// mark some properties as readonly
		Object.defineProperties(this, {
			$rawSegment: { enumerable: false },
			_nodeA: { enumerable: false },
			$nodeA: { get: this.getNodeA },
			$nodeAID: { writable: false },
			_nodeB: { enumerable: false },
			$nodeB: { get: this.getNodeB },
			$nodeBID: { writable: false },
			_center: { enumerable: false },
			$center: { get: this.getCenter },
			_ABRestrictions: { enumerable: false },
			$ABRestrictions: { get: this.getABRestrictions },
			_BARestrictions: { enumerable: false },
			$BARestrictions: { get: this.getRevRestrictions },
			$segmentID: { writable: false },
			$isTurnALocked: { writable: false },
			$isTurnBLocked: { writable: false },
			$isRoundabout: { writable: false },
			$hasHNs: { writable: false },
			$typeRank: { writable: false },
			$isEditable: { writable: false },
			$rank: { writable: false },
			$length: { writable: false },
			$updatedOn: { writable: false },
			$updatedBy: { writable: false },
			$updatedByID: { writable: false },
			$updatedByLevel: { writable: false },
			$createdOn: { writable: false },
			$createdBy: { writable: false },
			$createdByID: { writable: false },
			$createdByLevel: { writable: false },
			$ABRestrictionsLen: { writable: false },
			$BARestrictionsLen: { writable: false },
		});
	}
	/**
	 * Get road type rank
	 */
	SimpleSEGMENT.prototype.getTypeRank = function (typeID) {
		return {
			// RT_RUNWAY = 19;
			19: 1,
			// RT_RAILROAD = 18;
			18: 2,
			// RT_STAIRWAY = 16;
			16: 3,
			// RT_BOARDWALK = 10;
			10: 4,
			// RT_TRAIL = 5;
			5: 5,

			// RT_PRIVATE = 17;
			17: 6,
			// RT_PARKING = 20;
			20: 7,
			// RT_DIRT = 8;
			8: 8,

			// RT_SERVICE = 21;
			21: 9,
			// RT_STREET = 1;
			1: 10,
			// RT_PRIMARY = 2;
			2: 11,

			// RT_RAMP = 4;
			4: 12,
			// RT_MINOR = 7;
			7: 13,
			// RT_MAJOR = 6;
			6: 14,
			// RT_FREEWAY = 3;
			3: 15,
		}[typeID];
	}
	/**
	 * Get Node A
	 * *returns {SimpleNODE}
	 */
	SimpleSEGMENT.prototype.getNodeA = function () {
		return this._nodeA ? this._nodeA :
			this._nodeA = new SimpleNODE(this.$nodeAID,
				this.$segmentID)
	};
	/**
	 * Get Node B
	 * *returns {SimpleNODE}
	 */
	SimpleSEGMENT.prototype.getNodeB = function () {
		return this._nodeB ? this._nodeB :
			this._nodeB = new SimpleNODE(this.$nodeBID,
				this.$segmentID)
	};
	/**
	 * Get center
	 * @returns {OpenLayers.LonLat}
	 */
	SimpleSEGMENT.prototype.getCenter = function () {
		if (this._center) return this._center;

		this._center = this.$rawSegment.geometry.bounds.getCenterLonLat().clone()
			.transform(WM.projection, WM.displayProjection);
		// round the lon/lat
		this._center.lon = Math.round(this._center.lon * 1e5) / 1e5;
		this._center.lat = Math.round(this._center.lat * 1e5) / 1e5;
		return this._center;
	};
	/**
	 * Get forward restrictions
	 * *returns {SimpleRESTRICTION}
	 */
	SimpleSEGMENT.prototype.getABRestrictions = function () {
		var t;
		return this._ABRestrictions ? this._ABRestrictions :
			this._ABRestrictions =
			(t = this, this.$rawSegment.attributes.fwdRestrictions.map(
				function (e) {
					return new SimpleRESTRICTION(e, t.$segmentID)
				})
			);
	}
	/**
	 * Get reverse restrictions
	 * *returns {SimpleRESTRICTION}
	 */
	SimpleSEGMENT.prototype.getRevRestrictions = function () {
		var t;
		return this._BARestrictions ? this._BARestrictions :
			this._BARestrictions =
			(t = this, this.$rawSegment.attributes.revRestrictions.map(
				function (e) {
					return new SimpleRESTRICTION(e, t.$segmentID)
				})
			);
	}
	/**
	 * Report a segment
	 *
	 * params is an object or just a check ID:
	 * params.$checkID - check ID
	 * params.$param - optional check param
	 * params.$cityParam - optional report city parameter
	 * params.$streetParam - optional report street parameter
	 *
	 * @param {Object|number} params
	 */
	SimpleSEGMENT.prototype.report = function (params) {
		if (classCodeIs(params, CC_NUMBER))
			params = { $checkID: params };
		var id = params.$checkID;
		if (!id
			|| !isLimitOk(id))
			return;

		/**
		 * Creates a copy of the segment for the report
		 * @param {SimpleSEGMENT} ss
		 */
		function getSegmentCopy(ss) {
			/** @struct */
			return {
				$segmentID: +ss.$segmentID,
				$countryID: +ss.$address.$countryID,
				$cityID: +ss.$address.$cityID,
				$streetID: +ss.$address.$streetID,
				$reportIDs: {},
				$updated: ss.$updatedOn ? ss.$rawSegment.attributes.updatedOn
					: (ss.$createdOn ? ss.$rawSegment.attributes.createdOn : 0),
				$userID: ss.$updatedByID ? +ss.$updatedByID
					: (ss.$createdByID ? +ss.$createdByID : 0),
				$isEditable: ss.$isEditable
					&& (ss.$nodeA.$isEditable || ss.$nodeA.$isPartial)
					&& (ss.$nodeB.$isEditable || ss.$nodeB.$isPartial)
				,
				$typeRank: +ss.$typeRank,
				$center: ss.$center,
				$length: +ss.$length,
			};
		}

		// shortcuts
		var rep = _REP.$cityIDs[this.$address.$cityID];
		var check = _RT.$checks[id];

		// increase report counters
		if (_repRC[id]) _repRC[id]++;
		else _repRC[id] = 1;
		if (LIMIT_PERCHECK < _repRC[id]) {
			_REP.$isLimitPerCheck = true;
			return;
		}

		// city
		if (params.$cityParam)
			rep.$params[id] = params.$cityParam;

		// street
		/** @const */
		var sid = this.$address.$streetID;
		if (!(sid in rep.$streetIDs)) {
			// new street
			rep.$unsortedStreetIDs.push(sid)
			_repS[sid] = this.$address.$street;
			rep.$streetIDs[sid] = {};
			rep.$streetIDs[sid].$params = {};
			rep.$streetIDs[sid].$segmentIDs = {};
			rep.$streetIDs[sid].$unsortedSegmentIDs = [];
			rep.$streetIDs[sid].$sortedSegmentIDs = [];
		}
		rep = rep.$streetIDs[sid];
		if (params.$streetParam)
			rep.$params[id] = params.$streetParam;

		// segment
		if (!(this.$segmentID in rep.$segmentIDs)) {
			// new segment
			rep.$unsortedSegmentIDs.push(this.$segmentID);
			rep.$segmentIDs[this.$segmentID] = getSegmentCopy(this);
		}
		var segmentCopy = rep.$segmentIDs[this.$segmentID];

		// add an user
		var uid = segmentCopy.$userID;
		if (!(uid in _repU)) {
			var n = "";

			if (uid === this.$createdByID)
				n = this.$createdBy;
			else if (uid === this.$updatedByID)
				n = this.$updatedBy;
			_repU[uid] = n;
		}

		// force segment to be non-editable
		var seenObj = _RT.$seen[this.$segmentID];
		if (this.$forceNonEditable) {
			this.$forceNonEditable = false;
			segmentCopy.$isEditable = false;
			// force update max severity
			if (_REP.$maxSeverity <= seenObj[I_SEVERITY]
				|| _REP.$maxSeverity <= check.SEVERITY)
				bUpdateMaxSeverity = true;
		}

		// mark segment as reported
		segmentCopy.$reportIDs[id] = params.$param;

		// update max severity
		if (_REP.$maxSeverity < check.SEVERITY) {
			if (checkFilter(check.SEVERITY, segmentCopy, null)
				&& getFilteredSeverity(check.SEVERITY, id, true))
				_REP.$maxSeverity = check.SEVERITY;
		}

		// mark raw segment as highlighted
		if (!check.REPORTONLY && seenObj[I_SEVERITY] < check.SEVERITY)
			seenObj[I_SEVERITY] = check.SEVERITY;
		seenObj[I_SEGMENTCOPY] = segmentCopy;
	};
	/**
	 * Increase city counter
	 */
	SimpleSEGMENT.prototype.incCityCounter = function () {
		// shortcuts
		var rep = _REP.$cityIDs;
		/** @const */
		var cid = this.$address.$cityID;

		// city
		if (!(cid in rep)) {
			// new city
			_REP.$countries[this.$address.$countryID] = this.$address.$country;
			_REP.$unsortedCityIDs.push(cid);

			_repC[cid] = this.$address.$city;
			_repCC[cid] = 0;
			rep[cid] = {};
			rep[cid].$params = {};
			rep[cid].$streetIDs = {};
			rep[cid].$unsortedStreetIDs = [];
			rep[cid].$sortedStreetIDs = [];
		}
		// increase city counter
		_repCC[cid]++;
		// increase total counter
		_REP.$counterTotal++;
	};
	/**
	 * Delete city check
	 * _REP->$cityIDs->streetIDs->$segmentIDs->$reportIDs
	 */
	function deleteCityCheck(cityID, checkID) {
		var repS = _REP.$cityIDs[cityID].$streetIDs
		for (var sid in repS) {
			if (!repS.hasOwnProperty(sid)) continue;

			var repSG = repS[sid].$segmentIDs;
			for (var sgid in repSG) {
				if (!repSG.hasOwnProperty(sgid)) continue;

				/** @const */
				var reportIDs = repSG[sgid].$reportIDs;
				if (!(checkID in reportIDs)) continue;

				// recalculate seen severity
				/** @const */
				var seen = _RT.$seen[sgid];
				var maxSev = 0;
				var filSev = 0;

				delete reportIDs[checkID];
				for (var repID in reportIDs) {
					if (!reportIDs.hasOwnProperty(repID)) continue;

					var check = _RT.$checks[repID];
					if (!check) continue;

					if (filSev < check.SEVERITY
						&& getFilteredSeverity(check.SEVERITY, repID, true)) {
						filSev = check.SEVERITY;
					}

					if (maxSev < check.SEVERITY) {
						maxSev = check.SEVERITY;
						if (_RT.$curMaxSeverity === maxSev)
							break;
					}
				}
				seen[I_SEVERITY] = maxSev;
				// rehighlight segment
				reHLSegmentID(+sgid, filSev);
			} // for all segments
		} // for all streets
	}
	/**
	 * Returns city object for comparison
	 */
	function getCityCmpObj(cityID, city, otherCity) {
		var obj = {
			$cityID: cityID,
			$counterReported: 0,
			$limit: 0,
			$city: city,
			$otherCity: otherCity,
			$CITY: city.toUpperCase(),
			$noCountyCity: "",
			$noAbbreviationCity: "",
			$sortedCity: "",
			$noSpaceCity: "",
			$reason: "",
		};
		obj.$noCountyCity = obj.$CITY
			.replace(/ *\([^\)]+\) */g, "")
			.replace(/ *\,.*/g, "")
			;
		obj.$noAbbreviationCity = obj.$noCountyCity
			.replace(/ *[^\. ]+ *\. */g, "")
			;
		obj.$noDigitsCity = obj.$noCountyCity
			.replace(/ *\d+ */g, " ")
			;
		obj.$sortedCity = obj.$noAbbreviationCity
			.split(" ").sort().join(" ");
		obj.$noSpaceCity = obj.$noAbbreviationCity
			.split(" ").join("");
		return obj;
	}
	/**
	 * Sets limit for city object
	 */
	function setCmpObjLimits(obj1, obj2) {
		var curCase = '';
		// if obj1 is identical to obj2
		if (obj1.$city === obj2.$city) {
			// same name, but different IDs
			curCase = trS("city.12") + ' ' + obj1.$cityID + ' & ' + obj2.$cityID;
			obj1.$reason = obj2.$reason = curCase;

			obj1.$limit = obj2.$limit = 100;
			return;
		}
		// De Witt & Dewitt
		if (obj1.$noSpaceCity !== obj1.$noAbbreviationCity // obj1 has a space
			&& obj1.$noSpaceCity === obj2.$noAbbreviationCity // DeWitt & Dewitt
		) {
			obj1.$reason = trS("city.13r");
			obj2.$reason = trS("city.13a");

			obj1.$limit = 10;
			obj2.$limit = 1e3;
			return;
		}
		// if obj1 is part of obj2
		if (new RegExp("(^| )" + obj1.$sortedCity).test(obj2.$sortedCity)) {
			// if obj1 has an abbreviation
			if (obj1.$noCountyCity.length !== obj1.$noAbbreviationCity.length) {
				// Poreba Wlk. vs Poreba Wielka -> always report Poreba Wlk.
				// Poreba Wlk. vs Wielka Poreba -> always report Poreba Wlk.
				curCase = trS("city.2");
				obj1.$reason = obj2.$reason = curCase;

				obj1.$limit = 1e3;
				// report up to 10 segments of Poreba Wielka
				obj2.$limit = 10;
				return;
			}
			// if obj1 is very short
			if (3 > obj1.$city.length) {
				// kr vs Krakow -> drop Krakow, always report kr
				curCase = trS("city.3");
				obj1.$reason = obj2.$reason = curCase;

				obj1.$limit = 1e3;
				obj2.$limit = 0;
				return;
			}
			// if obj1 and obj2 are the same
			if (obj1.$CITY === obj2.$CITY) {
				// poreba vs Poreba -> report lowercase poremba
				curCase = trS("city.5");
				obj1.$reason = obj2.$reason = curCase;

				if (obj1.$city.charAt(0) !== obj1.$CITY.charAt(0)) {
					obj1.$limit = 1e3;
					obj2.$limit = 10;
				}
				else {
					obj1.$limit = 10;
					obj2.$limit = 1e3;
				}
				return;
			}
			// if sorted obj1 and obj2 are the same
			if (obj1.$sortedCity === obj2.$sortedCity) {
				if (obj1.$noSpaceCity !== obj1.$noAbbreviationCity) {
					// Wielka Poreba vs Poreba Wielka
					curCase = trS("city.6");
					obj1.$reason = obj2.$reason = curCase;

					obj1.$limit = obj2.$limit = 1e3;
					return;
				}
				if (obj1.$city.length === obj1.$noCountyCity.length) {
					if (obj2.$city.length === obj2.$noCountyCity.length) {
						// Poreba Wlk. vs Poreba Wiel. -> report both
						curCase = trS("city.7");
						obj1.$reason = obj2.$reason = curCase;

						obj1.$limit = obj2.$limit = 1e3;
					}
					else {
						// Vyshneve vs Vyshneve (smth) -> always report Vyshneve
						// Vyshneve vs Vyshneve, smth -> always report Vyshneve
						// curCase = 'City vs City (county)';
						obj1.$reason = trS("city.8a");
						obj2.$reason = trS("city.8r");

						obj1.$limit = 1e3;
						obj2.$limit = 10;
					}
					return;
				}
				if (obj2.$city.length === obj2.$noCountyCity.length) {
					// Poreba Wlk. (smth) vs Poreba Wiel. -> report both
					//curCase = 'City (county) vs City';
					obj1.$reason = trS("city.8r");
					obj2.$reason = trS("city.8a");

					obj1.$limit = 10;
					obj2.$limit = 1e3;
				}
				else {
					// Vyshneve (smth1) vs Vyshneve (smth2) -> report both
					curCase = trS("city.9");
					obj1.$reason = obj2.$reason = curCase;

					obj1.$limit = obj2.$limit = 1e3;
				}
				return;
			} // sorted objects are the same

			// other partial matches
			if (new RegExp(obj1.$sortedCity + "( |$)").test(obj2.$sortedCity)) {
				if (4 < obj2.$sortedCity.length - obj1.$sortedCity.length) {
					// Amsterdam vs Amsterdam Smth -> drop both
					obj1.$reason = trS("city.10a");
					obj2.$reason = trS("city.10r");

					obj1.$limit = obj2.$limit = 10;
					return;
				}
				if (obj1.$noDigitsCity === obj2.$noDigitsCity) {
					// Строитель снт (Волжский) = Строитель 2 снт (Среднеахтубинский р-н)
					curCase = trS("city.14");
					obj1.$reason = obj2.$reason = curCase;

					obj1.$limit = obj2.$limit = 1;
					return;
				}
				// Renens vs Renens VD -> report Renens
				curCase = trS("city.11");
				obj1.$reason = obj2.$reason = curCase;

				obj1.$limit = 1e3;
				obj2.$limit = 10;
				return;
			}
			// krak vs Krakow -> drop Krakow, report krak
			curCase = trS("city.4");
			obj1.$reason = obj2.$reason = curCase;

			obj1.$limit = 1e3;
			obj2.$limit = 10;
			return;
		} // obj1 is a part of obj2
	} // setCmpObjLimits

	/**
	 * Add HLed Segments to the Layer
	 */
	function addHLedSegments() {
		if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE))
			return;

		var features = [];
		for (var i in _RT.$HLedObjects) {
			if (!_RT.$HLedObjects.hasOwnProperty(i)) continue;
			var obj = _RT.$HLedObjects[i];

			if (obj.$severity)
				features.push(new OpenLayers.Feature.Vector(
					obj.$geometry.clone(), { 0: obj.$severity }
				));
		}
		_RT.$HLlayer.destroyFeatures();
		_RT.$HLlayer.addFeatures(features);
	}

	/**
	 * Highlight reported segments
	 */
	function HLSegment(rawSegment) {
		if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE))
			return;

		var segmentID = rawSegment.getID();
		var seenObj = _RT.$seen[segmentID];
		var severity = seenObj[I_SEVERITY];
		var segmentCopy = seenObj[I_SEGMENTCOPY];

		// check filter
		if (!severity || !segmentCopy
			|| !checkFilter(severity, segmentCopy, null))
			return;

		var filteredSeverity = getFilteredSeverityObj(severity,
			segmentCopy.$reportIDs, true);
		if (!filteredSeverity)
			return;

		// add HL object
		/** @struct */
		var obj = {
			$severity: filteredSeverity,
			$geometry: rawSegment.geometry,
		};
		_RT.$HLedObjects[segmentID] = obj;
	}
	/**
	 * Rehighlight reported segments
	 */
	function reHLSegmentID(segmentID, newSeverity) {
		if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE))
			return;

		// force update max severity
		if (_REP.$maxSeverity !== newSeverity)
			bUpdateMaxSeverity = true;

		// check for exclude notes option
		if (oExcludeNotes && RS_NOTE === newSeverity)
			newSeverity = 0;

		if (segmentID in _RT.$HLedObjects) {
			var hlObj = _RT.$HLedObjects[segmentID];
			hlObj.$severity = newSeverity;
		}
	}
	/**
	 * Delete seen segment
	 * _REP->$cityIDs->streetIDs->$segmentIDs->$reportIDs
	 */
	function deleteSeenSegment(segmentID) {
		// set no severity
		reHLSegmentID(segmentID, 0);
		var seen = null;
		if (segmentID in _RT.$seen)
			seen = _RT.$seen[segmentID];
		if (!seen)
			return;

		// force update max severity
		// use <= because it might be the last segment
		if (_REP.$maxSeverity <= seen[I_SEVERITY])
			bUpdateMaxSeverity = true;

		var segmentCopy = seen[I_SEGMENTCOPY];
		var cityID = seen[I_CITYID];
		delete _RT.$seen[segmentID];

		// uncount total counter
		if (0 < _REP.$counterTotal)
			_REP.$counterTotal--;
		// uncount city counter
		if (0 < _repCC[cityID])
			_repCC[cityID]--;
		if (!segmentCopy)
			return;

		var repC = _REP.$cityIDs;
		for (var cid in repC) {
			if (!repC.hasOwnProperty(cid)) continue;

			var repS = repC[cid].$streetIDs
			for (var sid in repS) {
				if (!repS.hasOwnProperty(sid)) continue;

				var repSG = repS[sid].$segmentIDs;
				for (var sgid in repSG) {
					if (!repSG.hasOwnProperty(sgid)
						|| +sgid !== segmentID)
						continue;

					/** @const */
					var reportIDs = repSG[sgid].$reportIDs;

					// uncount report counters
					/** @const */
					for (var repID in reportIDs) {
						if (!reportIDs.hasOwnProperty(repID)) continue;

						if (0 < _repRC[repID])
							_repRC[repID]--;
					}

					// delete reported segment
					delete repSG[sgid];

					// delete the segment from unsorted array
					var repUSG = repS[sid].$unsortedSegmentIDs;
					repUSG.splice(repUSG.indexOf(+sgid), 1);

					// clear sorted array
					repS[sid].$sortedSegmentIDs = [];

					return;
				} // for all segments
			} // for all streets
		} // for all cities
	}

	/**
	 * Update segment properties
	 */
	function updateSegmentProperties(selectedSegments, disabledHL) {
		if (RTStateIs(ST_RUN) || RTStateIs(ST_CONTINUE))
			return;

		// remove WV properties
		var prop = document.getElementById("i" + ID_PROPERTY)
		var propDis = document.getElementById("i" + ID_PROPERTY_DISABLED)

		var defID = ID_PROPERTY;
		var defHTML = '';
		if (disabledHL) {
			defID = ID_PROPERTY_DISABLED;
			defHTML = '<div class="direction-message">'
				+ '<i class="fa fa-info-circle" aria-hidden="true"></i> '
				+ trS("props.disabled")
				+ '</div> '
				;
			// remove prop
			if (prop) {
				prop.parentNode.removeChild(prop);
			}
			prop = propDis;
		}
		else {
			// remove propDis
			if (propDis) {
				propDis.parentNode.removeChild(propDis);
			}
		}

		if (prop)
			prop.innerHTML = defHTML;
		else {
			var segmentProperties = document.getElementsByClassName("segment")[0];
			if (segmentProperties) {
				var refElement = null;
				for (var i = 0; i < segmentProperties.children.length; i++) {
					var c = segmentProperties.children[i];
					if ("selection-text" === c.className)
						continue;

					refElement = c;
					break;
				}
				if (refElement) {
					var d = document.createElement("div");
					d.innerHTML = defHTML;
					d.id = "i" + defID;
					prop = segmentProperties.insertBefore(d, refElement);
				}
			} // if segmentProperties
		} // if prop

		if (disabledHL)
			return;

		// check if there are any segment selected
		if (!selectedSegments.length)
			return;

		// find selected issues
		var selectedIssues = [];
		for (var i = 0; i < selectedSegments.length; i++) {
			var segmentID = selectedSegments[i];
			if (segmentID in _RT.$seen) {
				var segmentCopy = _RT.$seen[segmentID][I_SEGMENTCOPY];
				if (!segmentCopy) continue;
				// segment is selected and highlighted
				for (var cid in segmentCopy.$reportIDs) {
					if (segmentCopy.$reportIDs.hasOwnProperty(cid)) {
						var check = _RT.$checks[cid];
						if (check.REPORTONLY)
							continue;

						selectedIssues.push([check, segmentCopy, cid]);
					}
				}
			}
		} // for all selected segments

		var newProp = '<b style="display:block"><a target="_blank" href="' + PFX_FORUM + FORUM_HOME + '">' + WV_NAME
			+ '</a> ' + trS("props.reports") + ':</b>'
			;
		if (_REP.$isLimitPerCheck) {
			newProp += '<div class="c' + CL_RIGHTTIP + ' c' + CL_NOTE + '">'
				+ '<span><i class="fa fa-info-circle" aria-hidden="true"></i>'
				+ ' <a class="c' + CL_NOTE + '" href="#">'
				+ trS("props.limit.title")
				+ '</a></span>'
				+ '<div class="c' + CL_RIGHTTIPPOPUP + '">'
				+ '<i class="fa fa-times-circle fa-lg fa-pull-left" style="margin-top:0.3em" aria-hidden="true"></i>'
				+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
				+ trS("props.limit.problem")
				+ '.</div>'
				+ '<i class="fa fa-check-square-o fa-lg fa-pull-left" style="color:black;margin-top:0.8em" aria-hidden="true"></i>'
				+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
				+ '<p>' + trS("props.limit.solution") + '.</p>'
				+ '</div></div><br></div>'
				;
		} // limit per check

		// exceptions note
		if (skippedSegment) {
			newProp += '<div class="c' + CL_RIGHTTIP + ' c' + CL_NOTE + '">'
				+ '<span><i class="fa fa-info-circle" aria-hidden="true"></i>'
				+ ' <a class="c' + CL_NOTE + '" href="#">'
				+ trS("props.skipped.title")
				+ '</a></span>'
				+ '<div class="c' + CL_RIGHTTIPPOPUP + '">'
				+ '<i class="fa fa-times-circle fa-lg fa-pull-left" style="margin-top:0.3em" aria-hidden="true"></i>'
				+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
				+ trS("props.skipped.problem")
				+ '.</div>'
				+ '</div><br></div>'
				;
		}


		if (!selectedIssues.length) {
			// update properties
			if (prop && (_REP.$isLimitPerCheck || skippedSegment))
				prop.innerHTML = newProp;
			return;
		}

		// sort the issues
		selectedIssues.sort(function (a, b) { return cmpCheckIDs(a[2], b[2]) });

		// only unique issues
		var selectedCounters = {};
		selectedIssues = selectedIssues.filter(function (e, i, arr) {
			var checkID = e[2];
			// skip first element
			if (i && arr[i - 1][2] === checkID) {
				selectedCounters[checkID]++;
				return false;
			}
			selectedCounters[checkID] = 1;
			return true;
		});
		// create a list of issues
		selectedIssues.forEach(function (e) {
			var check = e[0];
			var segmentCopy = e[1];
			var checkID = e[2];
			var checkCounter = selectedCounters[checkID];
			var sevClass = 0;
			var sevIcon = "";
			var sevBG = "";
			var strCountry = _REP.$countries[segmentCopy.$countryID];
			var ccode = "";

			if (strCountry)
				ccode = _I18n.getCountryCode(strCountry.toUpperCase());
			else {
				// try top country
				ccode = _RT.$cachedTopCCode;
			}
			options = trO(check.OPTIONS, ccode);

			switch (check.SEVERITY) {
				case RS_NOTE:
					sevClass = CL_NOTE;
					sevIcon = "info-circle";
					sevBG = GL_NOTEBGCOLOR;
					break;
				case RS_WARNING:
					sevClass = CL_WARNING;
					sevIcon = "exclamation-triangle";
					sevBG = GL_WARNINGBGCOLOR;
					break;
				case RS_ERROR:
					sevClass = CL_ERROR;
					sevIcon = "times-circle";
					sevBG = GL_ERRORBGCOLOR;
					break;
				case RS_CUSTOM1:
					sevClass = CL_CUSTOM1;
					sevIcon = "user";
					sevBG = GL_CUSTOM1BGCOLOR;
					break;
				case RS_CUSTOM2:
					sevClass = CL_CUSTOM2;
					sevIcon = "user";
					sevBG = GL_CUSTOM2BGCOLOR;
					break;
			}
			var shortTitle = exSOS(check.TITLE, options, "titleEN")
				.replace("WME Color Highlights", "WMECH")
				.replace("WME Toolbox", "WMETB");
			newProp += '<div class="c' + CL_RIGHTTIP + ' c' + sevClass + '">'
				+ '<span><i class="fa fa-' + sevIcon + '" aria-hidden="true"></i>'
				+ ' <a class="c' + sevClass + '" href="#">'
				+ shortTitle
				+ (1 < checkCounter ? ' (' + checkCounter + ')' : '')
				+ '</a></span>'
				+ '<div class="c' + CL_RIGHTTIPPOPUP + '">'
				+ '<i class="fa fa-' + sevIcon + ' fa-lg fa-pull-left" style="margin-top:0.3em" aria-hidden="true"></i>'
				+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
				+ '#' + checkID + ' '
				+ exSOS(check.PROBLEM, options, "problemEN")
				;
			var pl = trO(check.PROBLEMLINK, ccode);
			if (pl) {
				newProp += ': <a target="_blank" href="'
					+ pl
					+ '">'
					+ trO(check.PROBLEMLINKTEXT, ccode)
					+ '</a>'
					;
			}
			else
				newProp += '.';

			newProp += '</div>';

			// show howto
			if (segmentCopy.$isEditable) {
				newProp += '<i class="fa fa-check-square-o fa-pull-left fa-lg" style="color:black;margin-top:0.8em" aria-hidden="true"></i>'
					+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
					;
				if (check.SOLUTION) {
					newProp += '<p>' + exSOS(check.SOLUTION, options, "solutionEN");

					var sl = trO(check.SOLUTIONLINK, ccode);
					if (sl) {
						newProp += ': <a target="_blank" href="'
							+ sl
							+ '">'
							+ trO(check.SOLUTIONLINKTEXT, ccode)
							+ '</a>'
							;
					}
					else
						newProp += '.';

					newProp += '</p>';
				}
			}
			else {
				newProp += '<i class="fa fa-ban fa-pull-left fa-lg" style="color:black;margin-top:0.8em" aria-hidden="true"></i>'
					+ '<div class="c' + CL_RIGHTTIPDESCR + '">'
					+ '<p>' + trS("props.noneditable") + '.</p>';
				;
			}

			// show params
			var cityID = segmentCopy.$cityID;
			var cityParam = _REP.$cityIDs[cityID].$params[checkID];
			if (cityParam)
				newProp += '<p>' + cityParam + '</p>';
			var streetID = segmentCopy.$streetID;
			var streetParam = _REP.$cityIDs[cityID]
				.$streetIDs[streetID].$params[checkID];

			if (streetParam)
				newProp += '<p>' + streetParam + '</p>';

			newProp += '</div></div><br></div>'
				;
		}); // forEach

		// update properties
		if (prop)
			prop.innerHTML = newProp;
	} // updateSegmentProperties

	/**
	 * Match regular expression
	 */
	function matchRegExp(checkID, segmentID, expandedString, options) {
		var optRegExp = options[CO_REGEXP];
		if (!optRegExp) return false;
		var optString = options[CO_STRING];
		var optBool = options[CO_BOOL];
		// debug
		if (options[CO_NUMBER]
			&& 0 < _REP.$debugCounter) {
			var checkTitle = '';
			if (_RT.$checks[checkID] && _RT.$checks[checkID].TITLE)
				checkTitle = _RT.$checks[checkID].TITLE;
			var reported = (optRegExp.test(expandedString) ?
				(optBool ? false : true)
				: (optBool ? true : false));
			_REP.$debugCounter--;
			log(getMsg("debug log for segment " + segmentID + ", check #" + checkID,
				'\n1. '
				+ (optString ?
					'Expand template: ' + optString + ' -> '
					: 'String: ')
				+ expandedString
				+ '\n2. Match RegExp: '
				+ (optBool ? 'not ' : '')
				+ optRegExp
				+ ' -> ' + JSON.stringify(expandedString.match(optRegExp))
				+ '\n=> '
				+ (reported ? "REPORT the segment as #" + checkID + " '" + checkTitle + "'"
					: "skip the segment")
				+ (0 < _REP.$debugCounter ? ''
					: "\nEnd of debug log. Click '\u2718' (Clear report) button to start debug over.")
			));
		}
		if (optRegExp.test(expandedString)) {
			if (!optBool)
				return true;
		}
		else {
			if (optBool)
				return true;
		}
		return false; // not match
	} // matchRegExp


	///////////////////////////////////////////////////////////////////////
	// FOR ALL SEGMENTS

	// shortcuts
	// const:
	var reportWMECH = _UI.pSettings.pScanner.oReportExt.CHECKED
		&& _RT.oReportWMECH.CHECKED;
	var reportToolbox = _UI.pSettings.pScanner.oReportExt.CHECKED
		&& _RT.oReportToolbox.CHECKED;
	var currentZoom = WM.getZoom();
	var slowChecks = _UI.pSettings.pScanner.oSlowChecks.CHECKED
		&& 3 < currentZoom;
	var oExcludeNotes = _UI.pMain.pFilter.oExcludeNotes.CHECKED;

	var selectedSegments = [];
	_RT.$HLedObjects = {};
	for (var segmentKey in WMo.segments.objects) {
		var rawSegment = WMo.segments.objects[segmentKey];
		var segmentID = rawSegment.getID();

		// SPECIAL CASE - skip all checks for locked segments (exceptions)
		// 2014-05-01
		if (_RT.$topUser.$userLevel <= rawSegment.attributes.lockRank
			&& rawSegment.attributes.updatedOn
			&& 1398902400000 < rawSegment.attributes.updatedOn) {
			if (rawSegment.selected) {
				skippedSegment = true;
				// add selected segment to the array
				if (!DEF_DEBUG)
					selectedSegments.push(segmentID);
			}
			if (!DEF_DEBUG)
				continue;
		}

		// skip unrendered features
		if (rawSegment.layer
			&& rawSegment.id in rawSegment.layer.unrenderedFeatures)
			continue;

		if ("Delete" === rawSegment.state) continue;

		var seen = null;
		// check if the segment was already seen
		if (segmentID in _RT.$seen)
			seen = _RT.$seen[segmentID];

		// always re-check selected segments
		if (rawSegment.selected) {
			// add selected segment to the array
			selectedSegments.push(segmentID);

			// mark segment to revalidate
			_RT.$revalidate[segmentID] = true;
			// recheck selected segment if it's not highlighted by WMECH
			if (seen && !seen[I_ISWMECHCOLOR]) {
				deleteSeenSegment(segmentID);
				seen = null;
			}
		}
		else {
			// recheck the segment to revalidate
			if (segmentID in _RT.$revalidate) {
				deleteSeenSegment(segmentID);
				seen = null;
				// unmark segment
				delete _RT.$revalidate[segmentID];
				// delete WMECH color tag from the segment
				delete rawSegment[GL_WMECHCOLOR];
			}
		}

		// emulate WMECH_color
		var segmentGeometry = document.getElementById(rawSegment.geometry.id);
		if (!segmentGeometry) continue;

		var strokeColor = segmentGeometry.getAttribute("stroke").toUpperCase();
		if (4 === strokeColor.length)
			strokeColor = '#' + strokeColor.charAt(1) + strokeColor.charAt(1)
				+ strokeColor.charAt(2) + strokeColor.charAt(2)
				+ strokeColor.charAt(3) + strokeColor.charAt(3);
		if (strokeColor in _RT.$WMECHcolors)
			rawSegment[GL_WMECHCOLOR] = strokeColor;

		// check if the segment was already seen
		if (seen) {
			// check if segment was highlighted before
			var isTBColor = GL_TBCOLOR in rawSegment;
			var isWMECHColor = GL_WMECHCOLOR in rawSegment;

			// if the segment was not partial and highlight is not changed
			if (!seen[I_ISPARTIAL]
				&& (isTBColor === seen[I_ISTBCOLOR])
				&& (isWMECHColor === seen[I_ISWMECHCOLOR])
			) {
				HLSegment(rawSegment);
				continue;
			}
		}

		// check if start extent contains segment center
		/*
		if(RTStateIs(ST_RUN)
			&& !_RT.$startExtent.containsBounds(rawSegment.bounds, true, true))
			continue;
		*/

		///////////////////////////////////////////////////////////////////
		// Prepare simple objects
		var segment = new SimpleSEGMENT(segmentID);
		Object.seal(segment);

		// shortcuts
		var address = segment.$address;
		var country = address.$country;
		var countryLen = country.length;
		var countryCode = country ? _I18n.getCountryCode(country.toUpperCase())
			: _RT.$cachedTopCCode;
		var city = address.$city;
		var cityLen = city.length;
		var cityID = address.$cityID;
		var street = address.$street;
		var state = address.$state;
		var streetLen = street.length;
		var alts = segment.$alts;

		var roadType = segment.$type;
		var typeRank = segment.$typeRank;
		var isToll = segment.$isToll;
		var direction = segment.$direction;
		var elevation = segment.$elevation;
		var lock = Math.max(segment.$lock, segment.$rank);

		var segmentLen = segment.$length;

		var isRoundabout = segment.$isRoundabout;
		var hasHNs = segment.$hasHNs;
		var isDrivable = RR_TRAIL < typeRank;

		var nodeA = segment.$nodeA;
		var nodeB = segment.$nodeB;
		var nodeAID = segment.$nodeAID;
		var nodeBID = segment.$nodeBID;
		var isPartial = nodeA.$isPartial || nodeB.$isPartial;

		var now = Date.now();

		// check partial segment
		if (seen) {
			// if the segment is still partial
			if (seen[I_ISPARTIAL] && isPartial) {
				HLSegment(rawSegment);
				continue;
			}
			// otherwise remove, recheck the segment and reanimate
			deleteSeenSegment(segmentID);
			seen = null;
		}

		// mark segment as seen
		_RT.$seen[segmentID] = seen = [0, null,
			GL_TBCOLOR in rawSegment, GL_WMECHCOLOR in rawSegment,
			isPartial || 4 > currentZoom,
			cityID];

		// increase city counter
		segment.incCityCounter();

		// check if any editable found
		if (segment.$isEditable)
			_REP.$isEditableFound = true;

		// check expiration date
		if (0 === segmentID % 13 && segment.$updatedOn) {
			var relDate = new Date(WV_RELEASE_VALID);
			var nowDate = new Date(segment.$updatedOn);
			if (0 > relDate.getTime() - nowDate) {
				// destroy UI
				_UI = {};
				error("This build of " + WV_NAME + " has expired. Please upgrade!");
				return;
			}
		}

		///////////////////////////////////////////////////////////////////
		// Checks

		///////////////////////////////////////////////////////////////////
		// SPECIAL CASES


		// SPECIAL CASE - skip all the checks if there are no street ID
		if (GL_NOID === street) {
			deleteSeenSegment(segmentID);
			continue;
		}

		// check global access for the segment address
		_RT.$isGlobalAccess = true;
		if (!address.isOkFor(0)) {
			_RT.$isGlobalAccess = false;
			// get next segment
			continue;
		}

		// SPECIAL CASE - report overlapping segments even for new roads
		if (slowChecks
			&& RT_RAILROAD !== roadType) {
			if (nodeA.$otherSegmentsLen
				&& isLimitOk(118)) {
				var rawNode = nodeA.$rawNode;
				var baseAngle = rawNode.getAngleToSegment(rawSegment);
				for (var i = 0; i < nodeA.$otherSegmentsLen; i++) {
					var otherSegment = nodeA.$otherSegments[i];
					if (!otherSegment.$rawSegment) continue;

					var curAngle = rawNode.getAngleToSegment(otherSegment.$rawSegment);
					var angle = Math.abs(baseAngle - curAngle);
					if (angle > 180) angle = 360 - angle;

					if (2 > angle
						&& address.isOkFor(118)) {
						segment.report(118);
						break;
					}
				}
			} // #118

			if (nodeB.$otherSegmentsLen
				&& isLimitOk(119)) {
				var rawNode = nodeB.$rawNode;
				var baseAngle = rawNode.getAngleToSegment(rawSegment);
				for (var i = 0; i < nodeB.$otherSegmentsLen; i++) {
					var otherSegment = nodeB.$otherSegments[i];
					if (!otherSegment.$rawSegment) continue;

					var curAngle = rawNode.getAngleToSegment(otherSegment.$rawSegment);
					var angle = Math.abs(baseAngle - curAngle);
					if (angle > 180) angle = 360 - angle;

					if (2 > angle
						&& address.isOkFor(119)) {
						segment.report(119);
						break;
					}
				}
			} // #119
		} // overlapping segments

		// SPECIAL CASE - skip all checks for new roads
		if (!countryLen
			&& isLimitOk(23)) {
			// mark new segment as not partial
			seen[I_ISPARTIAL] = false;

			if (address.isOkFor(23)) {
				// report and highlight the segment
				segment.report(23);
				HLSegment(rawSegment);
			}
			continue;
		}

		// SPECIAL CASE - skip all checks for construction zones
		if (streetLen
			&& address.isOkFor(101)) {
			options = getCheckOptions(101, countryCode);
			if (options[CO_REGEXP].test(street)) {
				segment.report(101);
				HLSegment(rawSegment);
				continue;
			}
		}

		///////////////////////////////////////////////////////////////////
		// NO GROUP

		if (!state
			&& address.isOkFor(106))
			segment.report(106);


		if (reportToolbox && address.isOkFor(CK_TBFIRST)) {
			var col = rawSegment[GL_TBCOLOR];
			if (col) {
				col = col.toUpperCase();
				for (var i = CK_TBFIRST; i <= CK_TBLAST; i++) {
					var check = _RT.$checks[i];
					if (check.COLOR === col) {
						segment.report(i);
						break;
					}
				}
			}
		}

		if (reportWMECH && address.isOkFor(CK_WMECHFIRST)) {
			var col = rawSegment[GL_WMECHCOLOR];
			if (col) {
				for (var i = CK_WMECHFIRST; i <= CK_WMECHLAST; i++) {
					var check = _RT.$checks[i];
					if (check && check.COLOR === col) {
						segment.report(i);
						break;
					}
				}
			}
		}

		if (alts.length
			&& address.isOkFor(34)) {
			for (var i = 0; i < alts.length; i++) {
				if (!alts[i].$street) {
					segment.report(34);
					break;
				}
			}
		}

		if (slowChecks
			&& (segment.$ABRestrictionsLen || segment.$BARestrictionsLen)
			&& isLimitOk(38)
			&& address.isOkFor(38)) {
			var restrictions = segment.$ABRestrictions.concat(segment.$BARestrictions);
			for (var i = 0; i < restrictions.length; i++) {
				if (restrictions[i].$isInThePast) {
					segment.report(38);
					break;
				}
			}
		}

		if (slowChecks
			&& (nodeA.$restrictionsLen || nodeB.$restrictionsLen)
			&& isLimitOk(39)
			&& address.isOkFor(39)) {
			var restrictions = nodeA.$restrictions.concat(nodeB.$restrictions);
			for (var i = 0; i < restrictions.length; i++) {
				var restriction = restrictions[i];
				if (restriction.$isInThePast) {
					var param = '';
					if (restriction.$to.$address
						&& restriction.$to.$address.$street)
						param = 'turn to ' + restriction.$to.$address.$street;
					segment.report({
						$checkID: 39,
						$streetParam: param,
					});
					break;
				}
			}
		}

		if (nodeAID
			&& nodeAID === nodeBID
			&& address.isOkFor(43))
			segment.report(43);

		if (RT_RAILROAD === roadType
			&& 100 > segmentLen
			&& !isPartial
			&& !nodeA.$otherSegmentsLen
			&& !nodeB.$otherSegmentsLen
			&& address.isOkFor(104))
			segment.report(104);

		if (RT_TRAIL === roadType
			&& -5 === elevation
			&& address.isOkFor(105))
			segment.report(105);

		if ((/*classCodeIs(elevation, CC_NULL)
			||*/ 9 < elevation
			|| -5 > elevation)
			&& address.isOkFor(116))
			segment.report(116);

		// custom checks
		var expandOptions = {
			"country": country,
			"state": state,
			"city": city,
			"street": street,
			//          "altStreets": alts.length,
			"altStreet": alts.map(function (e) { return e.$street }),
			"altCity": alts.map(function (e) { return e.$city }),

			"type": roadType,
			"typeRank": typeRank,
			"toll": +isToll,
			"direction": direction,
			"elevation": elevation,
			"lock": lock,
			"length": segmentLen,
			"ID": segmentID,
			"roundabout": +isRoundabout,
			"hasHNs": +hasHNs,
			"drivable": +isDrivable,

			"Uturn": +(nodeA.$isUturn || nodeB.$isUturn),
			"deadEnd": +!(isPartial || nodeA.$otherSegmentsLen && nodeB.$otherSegmentsLen),

			"partialA": +nodeA.$isPartial,
			"deadEndA": +!(nodeA.$isPartial || nodeA.$otherSegmentsLen),
			"segmentsA": nodeA.$otherSegmentsLen,
			"inA": nodeA.$inConnectionsLen,
			"outA": nodeA.$outConnectionsLen,
			"UturnA": +nodeA.$isUturn,

			"partialB": +nodeB.$isPartial,
			"deadEndB": +!(nodeB.$isPartial || nodeB.$otherSegmentsLen),
			"segmentsB": nodeB.$otherSegmentsLen,
			"inB": nodeB.$inConnectionsLen,
			"outB": nodeB.$outConnectionsLen,
			"UturnB": +nodeB.$isUturn,
			"softTurns": +(!(segment.$isTurnALocked && segment.$isTurnBLocked)),
		};
		for (var i = CK_MATCHFIRST; i <= CK_MATCHLAST; i++) {
			if (!isLimitOk(i)
				|| !address.isOkFor(i))
				continue;

			options = getCheckOptions(i, countryCode);
			var optString = options[CO_STRING];
			var optRegExp = options[CO_REGEXP];
			if (!optString || !optRegExp) continue;

			var expandedString = _I18n.expandSO(optString, expandOptions);

			if (matchRegExp(i, segmentID, expandedString, options))
				segment.report(i);
		} // for all general match checks

		// mirror checks
		/*
				for(var i = CK_MIRRORFIRST; i <= CK_MIRRORLAST; i++)
				{
					if(!address.isOkFor(i)) continue;

					var nodes = {};
					nodes[i] = nodeA;
					nodes[i + 100] = nodeB;
					for(var checkID in nodes)
					{
						if(!isLimitOk(checkID)) continue;

						var node = nodes[checkID];
						window.console.log(checkID, node);
					}
				} // for all mirror checks
		*/

		if (!cityLen
			&& RT_FREEWAY === roadType
			&& isLimitOk(69)
			&& address.isOkFor(69))
			segment.report(69);

		// NO GROUP END

		///////////////////////////////////////////////////////////////////
		// GROUP slowChecks
		if (slowChecks) {
			// GROUP slowChecks
			// v 2
			if (1 === nodeA.$otherSegmentsLen
				&& DIR_UNKNOWN !== direction
				&& !nodeA.$isPartial
				&& !nodeA.$isUturn
				// no turn restrictions
				&& !nodeA.$restrictionsLen
				&& !segment.$ABRestrictionsLen
				&& !segment.$BARestrictionsLen
				&& isLimitOk(36)
				&& address.isOkFor(36)) {
				var otherSegment = nodeA.$otherSegments[0];
				var otherNode, nextNode;
				if (otherSegment.$nodeAID === nodeAID) {
					otherNode = otherSegment.$nodeA;
					nextNode = otherSegment.$nodeB;
				}
				else {
					otherNode = otherSegment.$nodeB;
					nextNode = otherSegment.$nodeA;
				}
				if ((!nodeB.$isPartial || !nextNode.$isPartial)
					&& otherSegment.$segmentID !== segmentID
					&& otherSegment.$rawSegment
					&& (1e4 > (otherSegment.$length + segmentLen) || 1e3 > segmentLen)
					&& otherSegment.$address.$street === street
					&& otherSegment.$address.$city === city
					&& otherSegment.$address.$state === state
					&& otherSegment.$address.$country === country
					&& otherSegment.$type === roadType
					&& otherSegment.$isToll === isToll
					// 2 & 2 || !2 && !2
					&& (
						DIR_TWO === otherSegment.$direction && DIR_TWO === direction
						|| DIR_TWO !== otherSegment.$direction && DIR_TWO !== direction
					)
					&& otherSegment.$elevation === elevation
					// simple loops
					&& otherSegment.$nodeAID !== nodeBID
					&& otherSegment.$nodeBID !== nodeBID
					// restrictions
					&& !otherSegment.$ABRestrictionsLen
					&& !otherSegment.$BARestrictionsLen
					&& !otherNode.$restrictionsLen
					&& deepCompare(otherSegment.$alts, alts)
				) {
					// check deep for loop
					var loopFound = false;
					for (var i = 0; i < nextNode.$otherSegmentsLen; i++) {
						var thirdSegment = nextNode.$otherSegments[i];
						if (thirdSegment.$nodeAID === nodeBID
							|| thirdSegment.$nodeBID === nodeBID
						) {
							loopFound = true;
							break;
						}
					}
					if (!loopFound)
						segment.report(36);
				}
			} // unneeded node A

			// GROUP slowChecks
			// v 2
			if (DIR_UNKNOWN !== direction
				&& !nodeB.$isPartial
				&& 1 === nodeB.$otherSegmentsLen
				&& !nodeB.$isUturn
				// no turn restrictions
				&& !nodeB.$restrictionsLen
				&& !segment.$ABRestrictionsLen
				&& !segment.$BARestrictionsLen
				&& isLimitOk(37)
				&& address.isOkFor(37)) {
				var otherSegment = nodeB.$otherSegments[0];
				var otherNode, nextNode;
				if (otherSegment.$nodeAID === nodeBID) {
					otherNode = otherSegment.$nodeA;
					nextNode = otherSegment.$nodeB;
				}
				else {
					otherNode = otherSegment.$nodeB;
					nextNode = otherSegment.$nodeA;
				}
				if ((!nodeA.$isPartial || !nextNode.$isPartial)
					&& otherSegment.$segmentID !== segmentID
					&& otherSegment.$rawSegment
					&& 1e4 > (otherSegment.$length + segmentLen)
					&& otherSegment.$address.$street === street
					&& otherSegment.$address.$city === city
					&& otherSegment.$address.$state === state
					&& otherSegment.$address.$country === country
					&& otherSegment.$type === roadType
					&& otherSegment.$isToll === isToll
					// 2 & 2 || !2 && !2
					&& (
						DIR_TWO === otherSegment.$direction && DIR_TWO === direction
						|| DIR_TWO !== otherSegment.$direction && DIR_TWO !== direction
					)
					&& otherSegment.$elevation === elevation
					// simple loops
					&& otherSegment.$nodeAID !== nodeAID
					&& otherSegment.$nodeBID !== nodeAID
					// restrictions
					&& !otherSegment.$ABRestrictionsLen
					&& !otherSegment.$BARestrictionsLen
					&& !otherNode.$restrictionsLen
					&& deepCompare(otherSegment.$alts, alts)
				) {
					// check deep for loop
					var loopFound = false;
					for (var i = 0; i < nextNode.$otherSegmentsLen; i++) {
						var thirdSegment = nextNode.$otherSegments[i];
						if (thirdSegment.$nodeAID === nodeAID
							|| thirdSegment.$nodeBID === nodeAID
						) {
							loopFound = true;
							break;
						}
					}
					if (!loopFound)
						segment.report(37);
				}
			} // unneeded node B

		} // GROUP slowChecks


		///////////////////////////////////////////////////////////////////
		// GROUP cityLen
		if (cityLen) {
			// GROUP cutyLen
			// RegExp city name checks
			for (var i = CK_CITYNAMEFIRST; i <= CK_CITYNAMELAST; i++) {
				if (!address.isOkFor(i) || !isLimitOk(i))
					continue;

				if (matchRegExp(i, segmentID, city,
					getCheckOptions(i, countryCode)))
					segment.report(i);
			} // for city name checks

			// v2.0
			// GROUP cityLen
			if (isLimitOk(24)
				&& address.isOkFor(24)) {
				var param = trS("city.1");
				var r = 3 > cityLen ? true : false;

				var cityCounter = _repCC[cityID];

				// check new city
				if (1 === cityCounter
					|| ((cityID in _REP.$incompleteIDs)
						&& !_REP.$incompleteIDs[cityID].$counterReported)) {
					for (var i = 0, len = _REP.$unsortedCityIDs.length; i < len; i++) {
						var cid = _REP.$unsortedCityIDs[i];
						if (cid === cityID) continue;

						var c = _repC[cid];
						var cLen = c.length;
						if (1 > cLen) continue;

						var cityObj = getCityCmpObj(cityID, city, c);
						var cObj = getCityCmpObj(cid, c, city);
						setCmpObjLimits(cityObj, cObj);
						setCmpObjLimits(cObj, cityObj);

						if (cityObj.$limit)
							_REP.$incompleteIDs[cityID] = cityObj;
						if (cObj.$limit && !_REP.$incompleteIDs[cid])
							_REP.$incompleteIDs[cid] = cObj;
						if (cityObj.$limit || cObj.$limit) break;
					} // for
				} // new city

				// check if city was reported before
				if (cityID in _REP.$incompleteIDs) {
					// shortcut
					var incompleteCity = _REP.$incompleteIDs[cityID];

					// increase the counter
					incompleteCity.$counterReported++;

					// check total limit
					if (incompleteCity.$limit < cityCounter) {
						r = false;
						deleteCityCheck(cityID, 24);
						delete _REP.$incompleteIDs[cityID];
					}
					else {
						r = true;
						param = trS("city.consider")
							+ " " + incompleteCity.$otherCity
							+ " [" + incompleteCity.$reason + "]";
					}
				}
				if (r) {
					segment.report({
						$checkID: 24,
						$cityParam: param,
					});
				}
			} // CITYINCOMPLETE

			// GROUP cityLen
			if (RT_RAILROAD === roadType
				&& isLimitOk(24)
				&& address.isOkFor(27))
				segment.report(27);

			// GROUP cityLen
			if (RT_FREEWAY === roadType
				&& isLimitOk(59)
				&& address.isOkFor(59))
				segment.report(59);

		} // GROUP cityLen

		///////////////////////////////////////////////////////////////////
		// GROUP isDrivable
		if (isDrivable) {
			// GROUP isDrivable
			if (slowChecks) {
				if (nodeA.$outConnectionsLen
					// exclude revCons
					&& (DIR_TWO === direction || DIR_BA === direction)
					&& isLimitOk(120)) {
					var rawNode = nodeA.$rawNode;
					var baseAngle = rawNode.getAngleToSegment(rawSegment);
					for (var i = 0; i < nodeA.$outConnectionsLen; i++) {
						var otherSegment = nodeA.$outConnections[i];
						if (!otherSegment.$rawSegment) continue;

						var curAngle = rawNode.getAngleToSegment(otherSegment.$rawSegment);
						var angle = Math.abs(baseAngle - curAngle);
						if (angle > 180) angle = 360 - angle;

						if (30 > angle
							&& 2 <= angle
							&& address.isOkFor(120)) {
							if (10 > angle) {
								segment.report(120);
								break;
							}
							else {
								// exclude bow-ties
								if (!nodeA.$isPartial
									&& 3 > nodeA.$otherSegmentsLen
									&& RR_STREET < typeRank) {
									segment.report(120);
									break;
								}
							}
						}
					} // for all outConnections
				} // #120

				if (nodeB.$outConnectionsLen
					// exclude revCons
					&& (DIR_TWO === direction || DIR_AB === direction)
					&& isLimitOk(121)) {
					var rawNode = nodeB.$rawNode;
					var baseAngle = rawNode.getAngleToSegment(rawSegment);
					for (var i = 0; i < nodeB.$outConnectionsLen; i++) {
						var otherSegment = nodeB.$outConnections[i];
						if (!otherSegment.$rawSegment) continue;

						var curAngle = rawNode.getAngleToSegment(otherSegment.$rawSegment);
						var angle = Math.abs(baseAngle - curAngle);
						if (angle > 180) angle = 360 - angle;

						if (30 > angle
							&& 2 <= angle
							&& address.isOkFor(121)) {
							if (10 > angle) {
								segment.report(121);
								break;
							}
							else {
								// exclude bow-ties
								if (!nodeB.$isPartial
									&& 3 > nodeB.$otherSegmentsLen
									&& RR_STREET < typeRank) {
									segment.report(121);
									break;
								}
							}
						}
					} // for all outConnections
				} // #121
			} // too sharp turns

			// GROUP isDrivable
			// Inward Connectivity
			if (RT_PRIVATE !== roadType
				&& isLimitOk(45)
				&& address.isOkFor(45)) {
				if (!nodeA.$isPartial && !nodeA.$inConnectionsLen) {
					if (DIR_AB === direction)
						segment.report(45); // AB and no in A
					else {
						if (!nodeB.$isPartial && !nodeB.$inConnectionsLen)
							segment.report(45); // no in A and no in B
						else {
							if (slowChecks
								&& DIR_TWO === direction
								&& nodeA.$otherSegmentsLen
								&& isLimitOk(46)) {
								for (var i = 0; i < nodeA.$otherSegmentsLen; i++) {
									var otherSegment = nodeA.$otherSegments[i];
									if (!otherSegment.$rawSegment) continue;

									// if(one of other segments at node A is drivable
									// AND in connection is possible (two way or dir to node B))
									if (RR_TRAIL < otherSegment.$typeRank
										// && RT_PRIVATE !== otherSegment.$type
										&& (DIR_TWO === otherSegment.$direction
											|| (DIR_AB === otherSegment.$direction
												&& nodeAID === otherSegment.$nodeBID)
											|| (DIR_BA === otherSegment.$direction
												&& nodeAID === otherSegment.$nodeAID)
										)) {
										segment.report(46); // no in A, but possible
										break;
									}
								}
							} // DIR_TWO
						}
					} // !DIR_AB
				} // no in connections at A
				else {
					if (!nodeB.$isPartial && !nodeB.$inConnectionsLen) {
						if (DIR_BA === direction)
							segment.report(45); // BA and no in B
						else {
							if (slowChecks
								&& DIR_TWO === direction
								&& nodeB.$otherSegmentsLen
								&& isLimitOk(47)) {
								for (var i = 0; i < nodeB.$otherSegmentsLen; i++) {
									var otherSegment = nodeB.$otherSegments[i];
									if (!otherSegment.$rawSegment) continue;
									// if(one of other segments at node B is drivable
									// AND in connection is possible (two way or dir to node B))
									if (RR_TRAIL < otherSegment.$typeRank
										&& (DIR_TWO === otherSegment.$direction
											|| (DIR_AB === otherSegment.$direction
												&& nodeBID === otherSegment.$nodeBID)
											|| (DIR_BA === otherSegment.$direction
												&& nodeBID === otherSegment.$nodeAID)
										)) {
										segment.report(47); // no in B, but possible
										break;
									}
								}
							} // DIR_TWO
						}
					} // !nodeB.$inConnectionsLen
				}
			} // inward connectivity issues

			// GROUP isDrivable
			// Outward Connectivity
			if (5 < segmentLen
				&& isLimitOk(44)
				&& address.isOkFor(44)) {
				if (!nodeA.$isPartial && !nodeA.$outConnectionsLen) {
					if (DIR_BA === direction)
						segment.report(44); // BA and no out A
					else {
						if (!nodeB.$isPartial && !nodeB.$outConnectionsLen)
							segment.report(44); // no out A and no out B
						else {
							if (slowChecks
								&& DIR_TWO === direction
								&& nodeA.$otherSegmentsLen
								&& isLimitOk(102)) {
								for (var i = 0; i < nodeA.$otherSegmentsLen; i++) {
									var otherSegment = nodeA.$otherSegments[i];
									if (!otherSegment.$rawSegment) continue;
									// if(one of other segments at node A is drivable
									// AND no private
									// AND out connection is possible (two way or dir to node B))
									if (RR_TRAIL < otherSegment.$typeRank
										&& RT_PRIVATE !== otherSegment.$type
										&& (DIR_TWO === otherSegment.$direction
											|| (DIR_BA === otherSegment.$direction
												&& nodeAID === otherSegment.$nodeBID)
											|| (DIR_AB === otherSegment.$direction
												&& nodeAID === otherSegment.$nodeAID)
										)) {
										segment.report(102); // no out A, but possible
										break;
									}
								}
							} // DIR_TWO
						}
					} // !DIR_AB
				} // no in connections at A
				else {
					if (!nodeB.$isPartial && !nodeB.$outConnectionsLen) {
						if (DIR_AB === direction)
							segment.report(44); // AB and no out B
						else {
							if (slowChecks
								&& DIR_TWO === direction
								&& nodeB.$otherSegmentsLen
								&& isLimitOk(103)) {
								for (var i = 0; i < nodeB.$otherSegmentsLen; i++) {
									var otherSegment = nodeB.$otherSegments[i];
									if (!otherSegment.$rawSegment) continue;
									// if(one of other segments at node B is drivable
									// AND ni private
									// AND in connection is possible (two way or dir to node B))
									if (RR_TRAIL < otherSegment.$typeRank
										&& RT_PRIVATE !== otherSegment.$type
										&& (DIR_TWO === otherSegment.$direction
											|| (DIR_BA === otherSegment.$direction
												&& nodeBID === otherSegment.$nodeBID)
											|| (DIR_AB === otherSegment.$direction
												&& nodeBID === otherSegment.$nodeAID)
										)) {
										segment.report(103); // no out B, but possible
										break;
									}
								}
							} // DIR_TWO
						}
					} // !nodeB.$outConnectionsLen
				}
			} // outward connectivity issues

			// GROUP isDrivable
			if (DIR_UNKNOWN === direction
				&& isLimitOk(25)
				&& address.isOkFor(25))
				segment.report(25);

			// GROUP isDrivable
			if (!(nodeAID && nodeBID)
				&& isLimitOk(35)
				&& address.isOkFor(35))
				segment.report(35);

			// GROUP isDrivable
			if (RR_PRIMARY > typeRank) {
				if (nodeAID && nodeBID
					&& address.isOkFor(200)) {
					if (!segment.$isTurnALocked
						&& nodeA.$otherSegmentsLen
						&& isLimitOk(200))
						segment.report(200);
					if (!segment.$isTurnBLocked
						&& nodeB.$otherSegmentsLen
						&& isLimitOk(300))
						segment.report(300);
				}
			}
			else {
				if (nodeAID && nodeBID
					&& address.isOkFor(201)) {
					if (!segment.$isTurnALocked
						&& nodeA.$otherSegmentsLen
						&& isLimitOk(201))
						segment.report(201);
					if (!segment.$isTurnBLocked
						&& nodeB.$otherSegmentsLen
						&& isLimitOk(301))
						segment.report(301);
				}
			}

			// GROUP isDrivable
			if ((
				(DIR_AB === direction && nodeA.$outConnectionsLen)
				|| (DIR_BA === direction && nodeA.$inConnectionsLen)
			)
				&& isLimitOk(41)
				&& address.isOkFor(41))
				segment.report(41);

			// GROUP isDrivable
			if ((
				(DIR_BA === direction && nodeB.$outConnectionsLen)
				|| (DIR_AB === direction && nodeB.$inConnectionsLen)
			)
				&& isLimitOk(42)
				&& address.isOkFor(42))
				segment.report(42);

			// GROUP isDrivable.!nodeApartial
			if (!nodeA.$isPartial) {
				// GROUP isDrivable.!nodeApartial
				if (slowChecks
					&& 5 < segmentLen
					// only for dead-ends
					&& !nodeA.$otherSegmentsLen
					&& nodeA.$rawNode.geometry.bounds
					&& isLimitOk(107)
					&& address.isOkFor(107)) {
					// check if any other segment is close to the node A
					var IDs = nodeA.$rawNode.attributes.segIDs;
					var pt = new OpenLayers.Geometry.Point(
						nodeA.$rawNode.geometry.bounds.left,
						nodeA.$rawNode.geometry.bounds.bottom
					);
					for (var segKey in WMo.segments.objects) {
						var seg = WMo.segments.objects[segKey];
						if (segmentID === seg.getID()) continue;
						if (!seg.geometry) continue;
						// different elevations
						if (elevation !== seg.attributes.level) continue;
						// only for non-deleted segments
						if ("Delete" === seg.state) continue;
						// only for drivable segments
						if (RR_TRAIL
							>= SimpleSEGMENT.prototype.getTypeRank(seg.attributes.roadType))
							continue;

						// check if node A is not connected to the segment
						// only for dead-ends!
						if (LIMIT_TOLERANCE > seg.geometry.distanceTo(pt, null)) {
							// other segment is not editable
							if (!seg.arePropertiesEditable())
								segment.$forceNonEditable = true;
							segment.report(107);
							break;
						}
					}
				}

				// GROUP isDrivable.!nodeApartial
				if (nodeA.$isUturn) {
					/*
										if(!nodeA.$otherSegmentsLen
											&& isLimitOk(77)
											&& address.isOkFor(77))
											segment.report(77);
					*/

					if (slowChecks
						&& 1 === nodeA.$outConnectionsLen
						&& isLimitOk(99)
						&& address.isOkFor(99)
						&& nodeA.$outConnections[0].$isRoundabout)
						segment.report(99);
				}

				// GROUP isDrivable.!nodeApartial
				if (slowChecks
					&& nodeA.$otherSegmentsLen
					&& !isRoundabout
					&& isLimitOk(78)
					&& address.isOkFor(78)) {
					for (var i = 0; i < nodeA.$otherSegmentsLen; i++) {
						var otherSegment = nodeA.$otherSegments[i];
						if (!otherSegment.$rawSegment) continue;
						// same endpoints
						if (RR_TRAIL < otherSegment.$typeRank
							&& nodeAID && nodeBID
							&& (
								(otherSegment.$nodeAID === nodeAID
									&& otherSegment.$nodeBID === nodeBID)
								|| (otherSegment.$nodeAID === nodeBID
									&& otherSegment.$nodeBID === nodeAID)
							)
						) {
							// report either lower rank or longer segment
							if (otherSegment.$typeRank > typeRank
								|| otherSegment.$length < segmentLen
								&& otherSegment.$typeRank === typeRank
								|| otherSegment.$segmentID < segmentID
								&& otherSegment.$length === segmentLen
								&& otherSegment.$typeRank === typeRank
							) {
								segment.report(78);
								break;
							}
						}
					}
				}

				// GROUP isDrivable.!nodeApartial.!nodeBpartial
				if (!nodeB.$isPartial) {
					// GROUP isDrivable.!nodeApartial.!nodeBpartial
					options = getCheckOptions(109, countryCode);
					if (options[CO_NUMBER] > segmentLen
						&& nodeA.$otherSegmentsLen
						&& nodeB.$otherSegmentsLen
						&& !isRoundabout
						&& address.isOkFor(109))
						segment.report(109);

					/*
										// GROUP isDrivable.!nodeApartial.!nodeBpartial
										if(RT_RAMP === roadType
											&& nodeA.$otherSegmentsLen
											&& nodeB.$otherSegmentsLen
											&& RR_RAMP > nodeA.$otherSegments[0].$typeRank
											&& RR_RAMP > nodeB.$otherSegments[0].$typeRank
											&& address.isOkFor(CK_RAMPTOSTREET))
											segment.report(CK_RAMPTOSTREET);
					*/

					/*
										// GROUP isDrivable.!nodeApartial.!nodeBpartial
										if(RT_FREEWAY === roadType
											&& nodeA.$otherSegmentsLen
											&& nodeB.$otherSegmentsLen
											&& (
												RR_TRAIL >= nodeA.$otherSegments[0].$typeRank
												|| RR_TRAIL >= nodeB.$otherSegments[0].$typeRank
												|| RT_STREET === nodeA.$otherSegments[0].$type
												|| RT_STREET === nodeB.$otherSegments[0].$type
												|| RT_PRIMARY === nodeA.$otherSegments[0].$type
												|| RT_PRIMARY === nodeB.$otherSegments[0].$type
											)
											&& address.isOkFor(CK_FREEWAYTOSTREET))
											segment.report(CK_FREEWAYTOSTREET);
					*/

					// GROUP isDrivable.!nodeApartial.!nodeBpartial
					// H - A-B
					//   A: 2 other, 1 out, 0 or 1 in
					//   B: 2 other, 1 in, 0 or 1 out
					// at least 2 segments with the same street name on A and B
					if (slowChecks
						&& 15 > segmentLen
						&& !streetLen
						//                      && !isRoundabout
						//                      && RR_STREET < typeRank
						//                      && RT_RAMP !== roadType
						&& 2 === nodeA.$otherSegmentsLen
						&& 2 === nodeB.$otherSegmentsLen
						&& isLimitOk(79)
						&& address.isOkFor(79)
						&& nodeA.$otherSegments[0].$rawSegment
						&& nodeA.$otherSegments[1].$rawSegment
						&& nodeB.$otherSegments[0].$rawSegment
						&& nodeB.$otherSegments[1].$rawSegment
						&& nodeA.$otherSegments[0].$address.$street

						&& nodeA.$otherSegments[0].$type
						=== nodeA.$otherSegments[1].$type
						&& nodeB.$otherSegments[0].$type
						=== nodeB.$otherSegments[1].$type
						&& nodeA.$otherSegments[0].$address.$street
						=== nodeA.$otherSegments[1].$address.$street
						&& nodeB.$otherSegments[0].$address.$street
						=== nodeB.$otherSegments[1].$address.$street
						&& nodeA.$otherSegments[0].$address.$street
						=== nodeB.$otherSegments[0].$address.$street
					) {
						if ((DIR_TWO === direction || DIR_BA === direction)
							&& 1 === nodeA.$outConnectionsLen
							&& 2 > nodeA.$inConnectionsLen

							&& 1 === nodeB.$inConnectionsLen
							&& 2 > nodeB.$outConnectionsLen
						)
							segment.report(79);
						if ((DIR_TWO === direction || DIR_AB === direction)
							&& 1 === nodeB.$outConnectionsLen
							&& 2 > nodeB.$inConnectionsLen

							&& 1 === nodeA.$inConnectionsLen
							&& 2 > nodeA.$outConnectionsLen
						)
							segment.report(79);
					} // #79
				} // GROUP isDrivable.!nodeApartial.!nodeBpartial
			} // GROUP isDrivable.!nodeApartial

			// GROUP isDrivable.!nodeBpartial
			if (!nodeB.$isPartial) {
				// GROUP isDrivable.!nodeBpartial
				if (slowChecks
					&& 5 < segmentLen
					// only for dead-ends
					&& !nodeB.$otherSegmentsLen
					&& nodeB.$rawNode.geometry.bounds
					&& isLimitOk(108)
					&& address.isOkFor(108)) {
					// check if any other segment is close to the node B
					var IDs = nodeB.$rawNode.attributes.segIDs;
					var pt = new OpenLayers.Geometry.Point(
						nodeB.$rawNode.geometry.bounds.left,
						nodeB.$rawNode.geometry.bounds.bottom
					);
					for (var segKey in WMo.segments.objects) {
						var seg = WMo.segments.objects[segKey];
						if (segmentID === seg.getID()) continue;
						if (!seg.geometry) continue;
						// different elevations
						if (elevation !== seg.attributes.level) continue;
						// only for non-deleted segments
						if ("Delete" === seg.state) continue;
						// only for drivable segments
						if (RR_TRAIL
							>= SimpleSEGMENT.prototype.getTypeRank(seg.attributes.roadType))
							continue;

						if (LIMIT_TOLERANCE > seg.geometry.distanceTo(pt, null)) {
							// other segment is not editable
							if (!seg.arePropertiesEditable())
								segment.$forceNonEditable = true;
							segment.report(108);
							break;
						}
					}
				}

				// GROUP isDrivable.!nodeBpartial
				if (nodeB.$isUturn) {
					if (!nodeB.$otherSegmentsLen
						&& isLimitOk(77)
						&& address.isOkFor(77))
						segment.report(77);

					if (slowChecks
						&& 1 === nodeB.$outConnectionsLen
						&& isLimitOk(99)
						&& address.isOkFor(99)
						&& nodeB.$outConnections[0].$isRoundabout)
						segment.report(99);
				}
			} // GROUP isDrivable.!nodeBpartial

			// GROUP isDrivable && Freeway
			if (RT_FREEWAY === roadType) {
				// GROUP isDrivable && Freeway
				if (0 !== elevation
					&& isLimitOk(110)
					&& address.isOkFor(110))
					segment.report(110);

				// GROUP isDrivable && Freeway
				options = getCheckOptions(150, countryCode);
				if (options[CO_NUMBER] > lock
					&& isLimitOk(150)
					&& address.isOkFor(150))
					segment.report(150);

				// GROUP isDrivable && Freeway
				if (DIR_TWO === direction
					&& address.isOkFor(90))
					segment.report(90);

			} // GROUP isDrivable && Freeway

			// GROUP isDrivable && Major
			if (RT_MAJOR === roadType) {
				// GROUP isDrivable && Major
				options = getCheckOptions(151, countryCode);
				if (options[CO_NUMBER] > lock
					&& isLimitOk(151)
					&& address.isOkFor(151))
					segment.report(151);
			} // GROUP isDrivable && Major

			// GROUP isDrivable && Minor
			if (RT_MINOR === roadType) {
				// GROUP isDrivable && Minor
				options = getCheckOptions(152, countryCode);
				if (options[CO_NUMBER] > lock
					&& isLimitOk(152)
					&& address.isOkFor(152))
					segment.report(152);
			} // GROUP isDrivable && Minor

			// GROUP isDrivable && Ramp
			if (RT_RAMP === roadType) {
				// GROUP isDrivable && Ramp
				if (DIR_TWO === direction
					&& isLimitOk(91)
					&& address.isOkFor(91))
					segment.report(91);

				// GROUP isDrivable && Ramp
				options = getCheckOptions(153, countryCode);
				if (options[CO_NUMBER] > lock
					&& isLimitOk(153)
					&& address.isOkFor(153))
					segment.report(153);
			} // GROUP isDrivable && Ramp

			// GROUP isDrivable && Primary
			if (RT_PRIMARY === roadType) {
				// GROUP isDrivable && Primary
				options = getCheckOptions(154, countryCode);
				if (options[CO_NUMBER] > lock
					&& isLimitOk(154)
					&& address.isOkFor(154))
					segment.report(154);
			} // GROUP isDrivable && Primary

		} // GROUP isDrivable
		else {
			// GROUP !isDrivable
			if (slowChecks
				// exclude house numbers
				&& !hasHNs
				// exclude Railroads
				&& RT_RAILROAD !== roadType
			) {

				// GROUP !isDrivable && slowChecks && !hasHNs && !Railroad
				if (nodeA.$otherSegmentsLen
					// exclude dead-ends < 300m
					//                  && !nodeB.$isPartial
					&& (nodeB.$otherSegmentsLen || 300 < segmentLen)
					&& isLimitOk(114)
					&& address.isOkFor(114)) {
					for (var i = 0; i < nodeA.$otherSegmentsLen; i++) {
						var otherSegment = nodeA.$otherSegments[i];
						if (!otherSegment.$rawSegment) continue;

						// if one of other segments at node A is drivable
						if (RR_TRAIL < otherSegment.$typeRank) {
							segment.report(114);
							break;
						}
					}
				}

				// GROUP !isDrivable && slowChecks && !hasHNs && !Railroad
				if (nodeB.$otherSegmentsLen
					// exclude dead-ends < 300m
					//                  && !nodeA.$isPartial
					&& (nodeA.$otherSegmentsLen || 300 < segmentLen)
					&& isLimitOk(115)
					&& address.isOkFor(115)) {
					for (var i = 0; i < nodeB.$otherSegmentsLen; i++) {
						var otherSegment = nodeB.$otherSegments[i];
						if (!otherSegment.$rawSegment) continue;

						// if one of other segments at node B is drivable
						if (RR_TRAIL < otherSegment.$typeRank) {
							segment.report(115);
							break;
						}
					}
				}
			} // GROUP !isDrivable && slowChecks && !hasHNs && !Railroad
		} // GROUP !isDrivable

		///////////////////////////////////////////////////////////////////
		// GROUP streetLen
		if (streetLen) {
			// GROUP streetLen
			// Street type-name checks: {check:type}
			/** @const */
			var checkIDType = {
				160: RT_FREEWAY, 161: RT_MAJOR, 162: RT_MINOR,
				163: RT_RAMP, 164: RT_PRIMARY, 165: RT_STREET, 166: RT_PARKING,
				167: RT_RAILROAD, 169: 0
			};
			// mirror checks
			/** @const */
			var checkIDID = { 160: 70, 161: 71, 162: 72 };
			for (var i in checkIDType) {
				i = +i;
				if (!address.isOkFor(i) || !isLimitOk(i))
					continue;

				var rType = checkIDType[i];

				options = getCheckOptions(i, countryCode);

				if (rType === roadType || !rType) {
					if (matchRegExp(i, segmentID, street, options))
						segment.report(i);
				}
				else {
					var mi = checkIDID[i];
					if (mi
						&& address.isOkFor(mi)
						&& !matchRegExp(i, segmentID, street, options))
						segment.report(mi);
				}
			} // for typeName

			// GROUP streetLen
			// RegExp street name checks
			for (var i = CK_STREETNAMEFIRST; i <= CK_STREETNAMELAST; i++) {
				if (!address.isOkFor(i) || !isLimitOk(i))
					continue;

				if (matchRegExp(i, segmentID, street,
					getCheckOptions(i, countryCode)))
					segment.report(i);
			} // for street name checks

			// GROUP streetLen
			if (cityLen
				&& RT_RAMP === roadType
				&& isLimitOk(57)
				&& address.isOkFor(57))
				segment.report(57);

			// GROUP streetLen
			if (-1 !== street.indexOf("CONST ZN")
				&& isLimitOk(117)
				&& address.isOkFor(117))
				segment.report(117);

			// GROUP streetLen
			if (RT_RAMP !== roadType
				&& -1 !== street.indexOf('.')
				&& isLimitOk(95)
				&& address.isOkFor(95))
				segment.report(95);

			// GROUP streetLen && Ramp
			if (RT_RAMP === roadType) {
				// GROUP streetLen && Ramp
				if (DIR_TWO === direction) {
					if (isLimitOk(28)
						&& address.isOkFor(28))
						segment.report(28);
				}
			} // GROUP streetLen && Ramp

			// GROUP streetLen
			if (RR_RAMP > typeRank) {
				options = getCheckOptions(73, countryCode);
				if (options[CO_NUMBER] > streetLen
					&& isLimitOk(73)
					&& address.isOkFor(73))
					segment.report(73);
			}

			// GROUP streetLen
			if (isDrivable) {
				if (RT_RAMP === roadType) {
					options = getCheckOptions(112, countryCode);
					if (options[CO_NUMBER] < streetLen
						&& isLimitOk(112)
						&& address.isOkFor(112))
						segment.report(112);
				}
				else {
					options = getCheckOptions(52, countryCode);
					if (options[CO_NUMBER] < streetLen
						&& isLimitOk(52)
						&& address.isOkFor(52))
						segment.report(52);
				}
			}
		} // GROUP streetLen

		///////////////////////////////////////////////////////////////////
		// GROUP isRoundabout && isDrivable
		if (isRoundabout && isDrivable) {
			// GROUP isRoundabout
			if (streetLen
				&& isLimitOk(29)
				&& address.isOkFor(29))
				segment.report(29);

			// GROUP isRoundabout
			if (DIR_TWO === direction
				&& address.isOkFor(48))
				segment.report(48);

			// GROUP isRoundabout
			if (!nodeA.$isPartial && 2 < nodeA.$otherSegmentsLen) {
				if (2 < nodeA.$outConnectionsLen) {
					if (address.isOkFor(87))
						segment.report(87);
				}
				else {
					if (address.isOkFor(74))
						segment.report(74);
				}
			}

			// GROUP isRoundabout
			if (slowChecks
				&& !isPartial
				&& (DIR_AB === direction || DIR_BA === direction)
			) {
				// GROUP isRoundabout.loops
				// check if roundabout connected to another roundabout
				var okA = false;
				var okB = false;
				var anode, bnode;
				if (DIR_AB === direction)
					anode = nodeA, bnode = nodeB;
				else
					anode = nodeB, bnode = nodeA;
				for (var i = 0; i < bnode.$outConnectionsLen; i++) {
					var otherSegment = bnode.$outConnections[i];
					if (otherSegment.$isRoundabout) {
						okB = true;
						break;
					}
				}
				if (okB)
					for (var i = 0; i < anode.$inConnectionsLen; i++) {
						var otherSegment = anode.$inConnections[i];
						if (otherSegment.$isRoundabout) {
							okA = true;
							break;
						}
					}

				// GROUP isRoundabout.loops
				if ((!okB || !okA)
					&& address.isOkFor(50))
					segment.report(50);
			} // GROUP isRoundabout.loops

		} // GROUP isRoundabout


		// highlight reported segments
		HLSegment(rawSegment);
	} // for all segments

	// update severity if needed
	if (bUpdateMaxSeverity
		&& (RTStateIs(ST_STOP) || RTStateIs(ST_PAUSE)))
		async(F_SHOWREPORT, RF_UPDATEMAXSEVERITY);

	// update segment properties
	updateSegmentProperties(selectedSegments, false);

	// add HLed segments to the layer
	addHLedSegments();
}
