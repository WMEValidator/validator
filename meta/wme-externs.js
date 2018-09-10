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

 * WME Validator is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

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
	currentLocale: function(){},
}

///////////////////////////////////////////////////////////////////////////
// OpenLayers Namespace
/** @type {Object} */
var OpenLayers = {
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
	this.areConnectionsEditable;
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
	/** @type {Object} */
	this.bounds;
	this.geometry = {
		id: "",
		/** @type {Object} */
		bounds: {},
		distanceTo: function (l, o) { },
		getGeodesicLength: function (p) { },
	},
		this.getAddress = function () { };
	this.getDirection = function () { };
	this.isTollRoad = function () { };
	this.isRoutable = function () { };

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
		fwdRestrictions: [],
		revRestrictions: [],
		fwdTurnsLocked: true,
		revTurnsLocked: true,
		fwdDirection: true,
		revDirection: true,
		fwdMaxSpeed: 0,
		fwdMaxSpeedUnverified: true,
		revMaxSpeed: 0,
		revMaxSpeedUnverified: true,
	};
}
/** @constructor */
Waze.RESTRICTION = function () {
	this.allDay = true;
	this.days = 0;
	this.description = "";
	this.isInThePast = function () { };
	this.enabled = true;
	this.fromDate = "";
	this.fromTime = "";
	this.toDate = "";
	this.toTime = "";
	this.vehicleTypes = -1;
};

var CITY = {
	getID: function () { },
	attributes: {
		countryID: 0,
		stateID: 0,
		isEmpty: true,
		name: ""
	}
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
		modeController:{
			model:{
				bind: function(a, b) { },
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
		addLayer: function (a) { },
		dragging: false,
		projection: {},
		displayProjection: {},
		layers: {
			uniqueName: "",
			displayInLayerSwitcher: 0,
			setVisibility: function (a) { },
			getVisibility: function () { }
		},
		getCenter: function () { },
		getControlsByClass: function (c) { },
		getExtent: function () { },
		getZoom: function () { },
		getLayersByName: function (a) { },
		panTo: function (center) { },
		raiseLayer: function (a, b) { },
		zoomTo: function (zoom) { },
		zoomToExtent: function (ext) { }
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
		events: { on: 0, un: 0 },
		actionManager: {
			events: { on: 0, un: 0 },
			unsavedActionsNum: function () { }
		},
		segments: {
			getObjectArray: function () { },
			getObjectById: function (e) { },
			objects: {},
			topCityID: 0
		},
		nodes: {
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
		}
	},
	controller: {},
};

///////////////////////////////////////////////////////////////////////////
// window Namespace
window.OpenLayers = {};
window.$ = function (e) { };
// window.Waze = {};
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
