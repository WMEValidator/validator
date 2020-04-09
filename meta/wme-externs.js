/*
 * wme-externs.js -- WME extern definitions for closure compiler
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

///////////////////////////////////////////////////////////////////////////
// I18n Namespace
var I18n = {
	locale: "",
	translations: {
		en: {
			layers: {
				name: {},
			},
		},
	},
	currentLocale: function () { },
}

///////////////////////////////////////////////////////////////////////////
// OpenLayers Namespace
/** @type {Object} */
var OpenLayers = {
	INCHES_PER_UNIT: {},
	options: {
		displayInLayerSwitcher: true,
		renderers: [],
		uniqueName: "",
		shortcutKey: "",
		accelerator: "",
		units: "",
		styleMap: {},
		projection: {},
		rendererOptions: { zIndexing: true },

		graphicZIndex: 0,
		fillOpacity: 0,
		strokeOpacity: 0,
		strokeWidth: 0,
		pointRadius: 0,
	},
	Bounds: {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		containsBounds: function (bounds, partial, inclusive) { },
		getWidth: function () { },
		getHeight: function () { },
		getCenterLonLat: function () { },
	},
	Class: 0,
	Feature: {
		Vector: function (a, b) { },
	},
	Geometry: {
		Point: function (a, b) { },
	},
	Style: function (a, b) { },
	Layer: {
	},
	Projection: function (a) { },
	GeometryPoint: {
		getPoint: function () { }
	}
};

/** @constructor */
OpenLayers.Layer.Vector = function (a, b) {
	this.destroyFeatures = function () { };
	this.addFeatures = function (a) { };
	this.setOpacity = function (a) { };
	this.setVisibility = function (a) { };
	this.visibility = true;
	this.unrenderedFeatures = {};
}
/**
 * @constructor
 * @param {Object=} b
 */
OpenLayers.StyleMap = function (a, b) {
	this.addUniqueValueRules = function (a, b, c) { };
}
/** @constructor */
OpenLayers.LonLat = function (a, b) {
	this.lon = 0;
	this.lat = 0;
	this.equals = function (e) { };
	this.containsLonLat = function (e) { };
	this.transform = function (s, d) { };
};

///////////////////////////////////////////////////////////////////////////
// Waze Namespace
var Waze = {
	Action: {
		CreateRoundabout: {},
		AddAlternateStreet: function (a, b) { },
		UpdateSegmentAddress: function (a, b) { },
		UpdateObject: function (a, b) { }
	},
	Config: {
		segments: {
			zoomToRoadType: {},
		},
	},
	Control: {
		Permalink: {
			layerVisibilityBitmask: {}
		},
	},
	Feature: {
		Vector: {
			Segment: {
				DEFAULT_NEW_SEGMENT_ATTRIBUTES: {
					revDirection: false
				}
			}
		}
	},
	Renderer: {
		ExtendedSVG: {},
	},
	Model: {
		ObjectType: {
			SEGMENT: "",
		}
	},
	Util: {
		localStorage: {
			get: function (a) { },
			set: function (a, b) { }
		}
	}
};
/** @constructor */
Waze.NODE = function () {
	/** @type {Object} */
	this.bounds;
	this.getAngleToSegment;
	this.geometry = {
		id: "",
		/** @type {Object} */
		bounds: {},
		distanceTo: function (l, o) { },
		getGeodesicLength: function (p) { },
	};
}
/** @constructor */
Waze.ACTION = function () {
	this.roundaboutSegments = [];
	this.doSubAction = function (a) { };
}
/** @constructor */
Waze.SEGMENT = function () {
	this.getID = function () { };
	this.atPoint = function (c, tx, ty) { };
	this.id = "";
	this.fid = 0;
	this.state = "";
	this.selected = false;
	this.layer = {};
	this.arePropertiesEditable = function () { };
	this.hasRestrictions = function () { };
	this.getFlagAttributes = function () { };
	/** @type {Object} */
	this.bounds;
	this.geometry = {
		id: "",
		/** @type {Object} */
		bounds: {},
		distanceTo: function (l, o) { },
		getGeodesicLength: function (p) { },
	};
	this.getAddress = function () { };
	this.getDirection = function () { };
	this.isTollRoad = function () { };

	this.attributes = {
		fromNodeID: 0,
		toNodeID: 0,
		junctionID: 0,
		hasHNs: 0,
		primaryStreetID: 0,
		createdBy: 0,
		createdOn: 0,
		streetIDs: [],
		level: 0,
		lockRank: 0,
		rank: 0,
		roadType: 0,
		revCrossSpeed: 0,
		fwdCrossSpeed: 0,
		updatedBy: 0,
		updatedOn: 0,
		restrictions: [],
		fwdTurnsLocked: true,
		revTurnsLocked: true,
		fwdDirection: true,
		revDirection: true,
		fwdMaxSpeed: 0,
		fwdMaxSpeedUnverified: true,
		revMaxSpeed: 0,
		revMaxSpeedUnverified: true,
		hasClosures: false,
	};
}
/** @constructor */
Waze.VENUE = function () {
	this.getID = function () { };
	// this.atPoint = function (c, tx, ty) { };
	this.id = "";
	this.fid = 0;
	this.state = "";
	this.selected = false;
	this.layer = {};
	this.arePropertiesEditable = function () { };
	this.is2D = function () { };
	this.isParkingLot = function () { };
	this.isGasStation = function () { };
	/** @type {Object} */
	this.bounds;
	this.geometry = {
		id: "",
		/** @type {Object} */
		bounds: {},
		distanceTo: function (l, o) { },
		getGeodesicArea: function (p) { },
		getCentroid: function () { },
	};
	this.getAddress = function () { };
	this.getNavigationPoints = function () { };
	this.getMainCategory = function () { };
	this.getCategorySet = function () { };
	this.isPoint = function () { };

	this.attributes = {
		adLocked: false,
		aliases: [],
		approved: false,
		brand: null,
		categories: [],
		categoryAttributes: {
			PARKING_LOT: {
				canExitWhileClosed: false,
				costType: "UNKNOWN",
				estimatedNumberOfSpots: "",
				hasTBR: false,
				lotType: [],
				paymentType: [],
			},
		},
		createdBy: 0,
		createdOn: 0,
		description: null,
		entryExitPoints: [],
		externalProviderIDs: [],
		geometry: {},
		level: 0,
		lockRank: 0,
		name: null,
		streetID: 0,
		updatedBy: 0,
		updatedOn: 0,
		openingHours: [],
		permissions: -1,
		phone: null,
		residential: false,
		services: [],
		url: null,
		venueUpdateRequests: [],
	};
}
/** @constructor */
Waze.RESTRICTION = function () {
	this.getDirection = function () { };
	this.getDescription = function () { };
	this.getTimeFrame = function () { };
	this.getDriveProfileList = function () { };
	this.isBidi = function () { };
	this.isForward = function () { };
	this.isReverse = function () { };
	this.isEditable = function () { };
	this.isAllowedModality = function () { };
	this.isBlockedModality = function () { };
};
/** @constructor */
Waze.TIMEFRAME = function () {
	this.getEndDate = function () { };
	this.getFromTime = function () { };
	this.getStartDate = function () { };
	this.getToTime = function () { };
	this.getWeekdays = function () { };
	this.isAllDay = function () { };
	this.isAllWeek = function () { };
}
/** @constructor */
Waze.DRIVEPROFILE = function () {
	this.isAllVehicles = function () { };
	this.isEmpty = function () { };
}

/** @constructor */
Waze.ROADCLOSURE = function() {
	this.id = "",
	this.segID = 0,
	this.active = true,
	this.forward = true,
	this.createdBy = 0,
	this.createdOn = 0,
	this.updatedBy = 0,
	this.updatedOn = 0,
	this.location = "",
	this.reason = "",
	this.endDate = "",
	this.startDate = "",
	this.state = null
}

var CITY = {
	getID: function () { },
	attributes: {
		countryID: 0,
		stateID: 0,
		isEmpty: true,
		name: ""
	}
}

var FLAGS = {
	tunnel: false,
	unpaved: false,
	headlights: false,
	nearbyHOV: false,
	fwdSpeedCamera: false
}

var STREET = {
	getID: function () { },
	cityID: 0,
	isEmpty: true,
	name: ""
}

var ADDRESS = {
	street: {},
	city: {},
	state: { name: "" },
	country: { name: "" },
}

var ATTRIBUTES = {
	// node
	connections: {},
	restrictions: {},
	segIDs: [],
	partial: true
}

var Components = { interfaces: { gmIGreasemonkeyService: 0 } };
String.prototype.startsWith = function (a) { };

///////////////////////////////////////////////////////////////////////////
// W Namespace
var W = {
	app: {
		modeController: {
			model: {
				bind: function (a, b) { },
			},
		},
		getAppRegionCode: function () { },
	},
	accelerators: {
		events: {
			register: function (a, b, c) { },
		},
	},
	MapLayers: {
		layerVisibilityBitmask: {}
	},
	map: {
		mapState: {
			getLayerVisibilityBitmask: function () { },
			_getLayerVisibilityBitmask: function () { },
		},
		olMap: {
			addLayer: function (a) { },
			dragging: false,
			projection: {},	
			getCenter: function () { },
			getControlsByClass: function (c) { },
			getExtent: function () { },
			getZoom: function () { },
			getLayersByName: function (a) { },
			panTo: function (center) { },
			raiseLayer: function (a, b) { },
			zoomTo: function (zoom) { },
			zoomToExtent: function (ext) { },
			displayProjection: {},
			layers: {
				uniqueName: "",
				displayInLayerSwitcher: 0,
				setVisibility: function (a) { },
				getVisibility: function () { }
			},
		},
	},
	loginManager: {
		events: { on: 0, un: 0, register: 0 },
		user: {
			id: 0,
			userName: 0,
			normalizedLevel: 0,
			editableCountryIDs: [],
			isStaffUser: function () { },
			isCountryManager: function () { }
		},
		expired: 0,
		previousUser: 0,
		getLoggedInUser: function () { },
		initialize: function () { },
		isLoggedIn: function () { },
		getUserRank: function () { },
		login: function (e, t) { },
		logout: function () { },
		changeUserName: function (e, t) { }
	}, // loginManager
	selectionManager: {
		events: { on: 0, un: 0 },
		selectedItems: [],
	}, // selectionManager
	model: {
		isLeftHand: false,
		isImperial: false,
		events: { on: 0, un: 0 },
		actionManager: {
			events: { on: 0, un: 0 },
			unsavedActionsNum: function () { }
		},
		segments: {
			getObjectArray: function () { },
			getObjectById: function (e) { },
			events: { on: 0, un: 0 },
			objects: {},
			topCityID: 0
		},
		nodes: {
			events: { on: 0, un: 0 },
			getObjectById: function (i) { }
		},
		streets: {
			getObjectById: function (i) { }
		},
		cities: {
			getObjectById: function (i) { }
		},
		states: {
			getObjectById: function (i) { },
			getByAttributes: function (i) { }
		},
		countries: {
			getObjectById: function (i) { },
			getByAttributes: function (i) { }
		},
		users: {
			getObjectById: function (i) { }
		},
		roadClosures: {
			getObjectById: function (i) { }
		},
		venues: {
			events: { on: 0, un: 0 },
			objects: {},
			getObjectById: function (i) { }
		},
	},
	controller: {},
	prefs: {},
};

///////////////////////////////////////////////////////////////////////////
// window Namespace
window.OpenLayers = {};
window.$ = function (e) { };
window.W = {};
window.viewHelpers = {
	formatRank: function (r) { }
};
window.require = {};

///////////////////////////////////////////////////////////////////////////
// Other externs

Event.layer = {
	id: "",
	visibility: false,
};

Error.prepareStackTrace = function (a, b) { };
//var CallSite = {
//	getLineNumber: function(){}
//}

var WME_Validator_I18n = {};
window.WME_Validator_I18n = {};
