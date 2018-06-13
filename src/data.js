/*
 * data.js -- WME Validator global data
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
 * DEFINES
 *************************************************************************/

/**
 * Debug mode
 */
/** @define {boolean} */
var DEF_DEBUG = false;

/*************************************************************************
 * THUI
 *************************************************************************/
var _THUI = {};
/**
 * THUI Element Types
 */
/** const */
_THUI.NONE = 1;
/** const */
_THUI.DIV = 2;
/** const */
_THUI.NUMBER = 3;
/** const */
_THUI.RADIO = 4;
/** const */
_THUI.CHECKBOX = 5;
/** const */
_THUI.BUTTON = 6;
/** const */
_THUI.TEXT = 7;
/** const */
_THUI.PASSWORD = 8;
/** const */
_THUI.DATE = 9;

/*************************************************************************
 * DATA
 *************************************************************************/

/**
 * Global private namespace
 * @type {Object}
 */
var _WV = {};

/**
 * Global WME Beta Version Flag
 */
var WME_BETA = false;


/**
 * Global Login Flag
 */
_WV.$loggedIn = 0;


/**
 * Private array of functions
 * @dict
 */
_WV.$functions = [];

/**
 * User interface
 * See F_LOGIN
 * @struct
 */
var _UI = {};

/**
 * Runtime private variables
 * See F_LOGIN
 * @struct
 */
var _RT = {}

/**
 * Global report object
 * @struct
 */
var _REP = {}

/**
 * Global names
 */
/** @const */
var GL_SHOWLAYERS = false;
/** @const */
var GL_LAYERNAME = WV_NAME;
/** @const */
//var GL_LAYERBIT = 13;
/** @const */
var GL_LAYERUNAME = WV_NAME_NO_SPACE;
/** @const */
var GL_LAYERACCEL = "toggle" + WV_NAME_NO_SPACE;
/** @const */
var GL_LAYERSHORTCUT = "A+v";
/** @const */
var GL_TBCOLOR = "WMETB_color";
/** @const */
var GL_TBPREFIX = "WMETB";
/** @const */
var GL_WMECHCOLOR = "WMECH_color";
/** @const */
var GL_NOTECOLOR = "#30E";
/** @const */
var GL_NOTEBGCOLOR = "#EEF";
/** @const */
var GL_WARNINGCOLOR = "#DA0";
//var GL_WARNINGCOLOR = "#960";
/** @const */
var GL_WARNINGBGCOLOR = "#FFE";
/** @const */
var GL_ERRORCOLOR = "#E00";
/** @const */
var GL_ERRORBGCOLOR = "#FEE";
/** @const */
var GL_CUSTOM1COLOR = "#0A0";
/** @const */
var GL_CUSTOM1BGCOLOR = "#EFE";
/** @const */
var GL_CUSTOM2COLOR = "#09E";
/** @const */
var GL_CUSTOM2BGCOLOR = "#EFF";
/** @const */
var GL_VISITEDCOLOR = "#0E0";
/** @const */
var GL_VISITEDBGCOLOR = "#EFE";
/** @const */
var GL_NOID = "No ID";
/** @const */
var GL_GRAYCOLOR = "#AAA";
/** @const */
var GL_TODOMARKER = "TODO: ";

/**
 * Segment road types
 */
/** @const */
var RT_RUNWAY = 19;
/** @const */
var RR_RUNWAY = 1;
/** @const */
var RT_RAILROAD = 18;
/** @const */
var RR_RAILROAD = 2;
/** @const */
var RT_STAIRWAY = 16;
/** @const */
var RR_STAIRWAY = 3;
/** @const */
var RT_BOARDWALK = 10;
/** @const */
var RR_BOARDWALK = 4;
/** @const */
var RT_TRAIL = 5;
/** @const */
var RR_TRAIL = 5;

/** @const */
var RT_PRIVATE = 17;
/** @const */
var RR_PRIVATE = 6;
/** @const */
var RT_PARKING = 20;
/** @const */
var RR_PARKING = 7;
/** @const */
var RT_DIRT = 8;
/** @const */
var RR_DIRT = 8;
/** @const */
var RT_SERVICE = 21;
/** @const */
var RR_SERVICE = 9;

/** @const */
var RT_STREET = 1;
/** @const */
var RR_STREET = 10;
/** @const */
var RT_PRIMARY = 2;
/** @const */
var RR_PRIMARY = 11;

/** @const */
var RT_RAMP = 4;
/** @const */
var RR_RAMP = 12;
/** @const */
var RT_MINOR = 7;
/** @const */
var RR_MINOR = 13;
/** @const */
var RT_MAJOR = 6;
/** @const */
var RR_MAJOR = 14;
/** @const */
var RT_FREEWAY = 3;
/** @const */
var RR_FREEWAY = 15;

/**
 * Segment directions
 */
/** @const */
var DIR_UNKNOWN = 0;
/** @const */
var DIR_AB = 1;
/** @const */
var DIR_BA = 2;
/** @const */
var DIR_TWO = 3;

/**
 * States constants
 * 0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b (directions),
 *  report formats: 0x59f111f1, 0x923f82a4, 0xab1c5ed5
 */
/** @const */
var ST_STOP = 0x428a2f98;
/** @const */
var ST_RUN = 0x71374491;
/** @const */
var ST_PAUSE = 0xb5c0fbcf;
/** @const */
var ST_CONTINUE = 0xe9b5dba5;

/**
 * Pan directions
 * (IDs from states)
 */
/** @const */
var DIR_L2R = 0x3956c25b;
/** @const */
var DIR_R2L = -0x3956c25b;

/**
 * Report formats
 * (IDs from states)
 */
/** @const */
var RF_HTML = 0x59f111f1;
/** @const */
var RF_BB = 0x923f82a4;
/** @const */
var RF_LIST = 0xab1c5ed5;
// internal: updates max severity for the given filters
/** @const */
var RF_UPDATEMAXSEVERITY = 1;
/** @const */
var RF_CREATEPACK = 2;

/**
 * Report traversal commands
 */
/** @const */
var RT_STOP = 1;
/** @const */
var RT_NEXTCHECK = 2;


/**
 * Report severities
 */
/** @const */
var RS_NOTE = 1;
/** @const */
var RS_WARNING = 2;
/** @const */
var RS_ERROR = 3;
/** @const */
var RS_CUSTOM2 = 4;
/** @const */
var RS_CUSTOM1 = 5;
/** @const */
var RS_MAX = 6;

/**
 * Limits
 */
/** @const */
var LIMIT_PERCHECK = 300;
/** @const */
var LIMIT_TOLERANCE = 6; // ~5m
/** @const */
var LIMIT_DEBUG = 20;

/**
 * Check IDs
 */
/** @const */
var CK_TBFIRST = 1;
/** @const */
var CK_TBLAST = 9;
/** @const */
var CK_WMECHFIRST = 13;
/** @const */
var CK_WMECHLAST = 22;
// Used to generate type checks
/** @const */
var CK_TYPEFIRST = 70;
/** @const */
var CK_TYPELAST = 72;
// Used to match and validate the segment:
/** @const */
var CK_MATCHFIRST = 128;
/** @const */
var CK_MATCHLAST = 139;
// Used to generate custom checks descriptions
/** @const */
var CK_CUSTOMFIRST = 130;
/** @const */
var CK_CUSTOMLAST = 139;
// Used to generate lock checks
/** @const */
var CK_LOCKFIRST = 150;
/** @const */
var CK_LOCKLAST = 154;
// Used to generate street type-name checks
/** @const */
var CK_STREETTNFIRST = 160;
/** @const */
var CK_STREETTNLAST = 167;
// Used to generate regexp street name checks
/** @const */
var CK_STREETNAMEFIRST = 170;
/** @const */
var CK_STREETNAMELAST = 175;
// Used to generate regexp city name checks
/** @const */
var CK_CITYNAMEFIRST = 190;
/** @const */
var CK_CITYNAMELAST = 193;
// Used to generate mirror node checks
/** @const */
var CK_MIRRORFIRST = 200;
/** @const */
var CK_MIRRORLAST = 201;

/**
 * Element IDs and classes
 *
 * 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
 *  0x06ca6351, 0x14292967,
 * 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa,

 *  0x5cb0a9dc, 0x76f988da,
 */
/** The whole UI @const */
var CL_UI = 0xa831c66d - 1;
/** Common prefix @const */
var ID_PREFIX = 0x983e5152;
/** Waze-style tabs @const */
var CL_TABS = 0xa831c66d;
/** Panel with fixed height @const */
var CL_PANEL = 0xb00327c8;
/** Buttons @const */
var CL_BUTTONS = 0xbf597fc7;
/** @const */
var CL_MSG = 0xc6e00bf3;
/** @const */
var CL_MSGY = 0xd5a79147;
/** @const */
var CL_TRANSLATETIP = 0xd5a79147 + 1;

/** @const */
var AS_LICENSE = "license";
/** @const */
var AS_VERSION = "version";
/** Filter: @const */
var AS_NONEDITABLES = "non_editables";
/** @const */
var AS_DUPLICATES = "duplicates";
/** @const */
var AS_STREETS = "streets";
/** @const */
var AS_OTHERS = "others";
/** @const */
var AS_NOTES = "notes";

/** @const */
var AS_YOUREDITS = "your_edits";
/** @const */
var AS_UPDATEDSINCE = "updated_since";
/** @const */
var AS_CITYNAME = "city_name";
/** @const */
var AS_CHECKS = "checks";
/** @const */
var AS_UPDATEDBY = "updated_by";

/** Settings: @const */
var AS_SOUNDS = "sounds";
/** @const */
var AS_HLISSUES = "hl_issues";
/** @const */
var AS_SLOWCHECKS = "slow_checks";
/** @const */
var AS_CUSTOM1TEMPLATE = "custom1_template";
/** @const */
var AS_CUSTOM1REGEXP = "custom1_regexp";
/** @const */
var AS_CUSTOM2TEMPLATE = "custom2_template";
/** @const */
var AS_CUSTOM2REGEXP = "custom2_regexp";
/** @const */
var AS_REPORTEXT = "report_ext";

/** @const */
var ID_PROPERTY = 0xe49b69c1;
/** @const */
var ID_PROPERTY_DISABLED = 0xe49b69c1 + 1;
/** @const */
var CL_COLLAPSE = 0xefbe4786;
/** @const */
var CL_NOTE = 0x0fc19dc6;
/** @const */
var CL_WARNING = 0x240ca1cc;
/** @const */
var CL_ERROR = 0x2de92c6f;
/** @const */
var CL_CUSTOM1 = 0x2de92c6f + 1;
/** @const */
var CL_CUSTOM2 = 0x2de92c6f + 2;
/** @const */
var CL_RIGHTTIP = 0x4a7484aa;
/** @const */
var CL_RIGHTTIPPOPUP = 0x4a7484aa + 1;
/** @const */
var CL_RIGHTTIPDESCR = 0x4a7484aa + 2;

/**
 * Autosave
 */
/** Auto-save object name @const */
var AS_NAME = WV_NAME_;

/**
 * Sizes
 */
/** @const */
var SZ_PANEL_HEIGHT = 190;

/**
 * Scan constants
 */
/** @const */
var SCAN_ZOOM = 4;
/** @const */
var SCAN_STEP = 100;

/**
 * HL constants
 */
/** @const */
var HL_WIDTH = 30;
/** @const */
var HL_OPACITY = 0.4;

/**
 * Array indexes
 */
/** @const */
var I_SEVERITY = 0;
/** @const */
var I_SEGMENTCOPY = 1;
/** @const */
var I_ISTBCOLOR = 2;
/** @const */
var I_ISWMECHCOLOR = 3;
/** @const */
var I_ISPARTIAL = 4;
/** @const */
var I_CITYID = 5;

/**
 * Check options
 */
/** @const */
var CO_MIN = 0;
/** @const */
var CO_REGEXP = 0;
/** @const */
var CO_STRING = 1;
/** @const */
var CO_NUMBER = 2;
/** @const */
var CO_BOOL = 3;
/** @const */
var CO_MAX = 3;

/**
 * Watch Dogs
 */
/** @const */
var WD_SHORT = 5;
/** @const */
var WD_LONG = 1e4;

/**
 * Shortcuts
 */
/** Waze @const */
var Wa = null;
/** new W @const */
var nW = null;
/** Waze.map @const */
var WM = null;
/** Waze.loginManager @const */
var WLM = null;
/** Waze.selectionManager @const */
var WSM = null;
/** Waze.model @const */
var WMo = null;
/** Waze.controller @const */
var WC = null;
/** unsafeWindow @const */
var UW = null;
/** requite @const */
var R = null;
