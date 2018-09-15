/*
 * release.js -- WME Validator release information
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
 * RELEASE INFORMATION
 *************************************************************************/

/**
 * WV RELEASE INFORMATION
 */
/** WME Validator version @const */
var WV_VERSION = "2018.09.15";
/** Auto-save password. Increase to reset auto-save config. @const */
var AS_PASSWORD = "v1";
/** @const */
var WV_WHATSNEW = ""
	+ "\nv2018.09.15:"
	+ "\n- berestovskyy: add custom check variables: speedLimit,"
	+ "\n  speedLimitAB, speedLimitBA and checkSpeedLimit"
	+ "\n- berestovskyy: ignore speed limits issues on streets and ramps."
	+ "\n  Please use custom checks instead."
	+ "\n"
	+ "\nv2018.09.13:"
	+ "\n- davidakachaos: new checks for unverified/unset/wrong speed limit"
	+ "\n- davidakachaos: enabled/adjusted some checks for NL"
	+ "\n"
	+ "\nv2018.09.12:"
	+ "\n- davidakachaos: fix 'Show report' and other pop up windows"
	+ "\n- davidakachaos: new check #220 'No connection for public segment'"
	+ "\n- davidakachaos: fix revalidate segment after an edit"
	+ "\n- davidakachaos: fix checks related to restrictions"
	+ "\n- other minor fixes"
	+ "\n"
	+ "\nv2018.08.28:"
	+ "\n- davidakachaos: fix switching to/from event mode"
	+ "\n- davidakachaos: fix 'unneeded node' for segments"
	+ "\n  with different speeds"
	+ "\n- davidakachaos: fix WMECH integration bug"
	;
/** @const */
var WV_LICENSE_VERSION = "1";
/** @const */
var WV_LICENSE = ""
	+ "\nLICENSE:"
	+ "\nWME Validator uses Open Source GPLv3 license,"
	+ "\ni.e. you may copy, distribute and modify the software"
	+ "\nas long as you track changes/dates in source files."
	+ "\nAny modifications to or software including (via compiler)"
	+ "\nGPL-licensed code must also be made available"
	+ "\nunder the GPL along with build & install instructions."
	+ "\n"
	+ "\nWME Validator source code is available on GitHub:"
	+ "\nhttps://github.com/WMEValidator/"
	+ "\n"
	+ "\nFor questions please use official forum:"
	+ "\nhttps://www.waze.com/forum/viewtopic.php?f=819&t=76488"
	+ "\n"
	+ "\nReport bugs on GitHub Issues Tracker:"
	+ "\nhttps://github.com/WMEValidator/validator/issues"
	+ "\n"
	+ "\nNote: WME Validator uses local storage to remember"
	+ "\nyour choices and preferences."
	;

/**
 * WV global access lists
 */
/** @const */
var GA_FORLEVEL = 1;
/** @const */
var GA_FORUSER = "!Dekis,*";

/** @const */
var GA_FORCOUNTRY = "";
/** @const */
//var GA_FORCITY = "";
var GA_FORCITY = "!Kraków,*";
/** @const */
var LIMIT_TOTAL = 2e4;
//var LIMIT_TOTAL = 2e6;
/**
 * Maxs
 */
/** @const */
var MAX_CHECKS = 310;

/*************************************************************************
 * URLs
 *************************************************************************/
/** @const */
var PFX_WIKI = 'https://www.waze.com/wiki/';
/** @const */
var PFX_PEDIA = 'https://wazeopedia.waze.com/wiki/';
/** @const */
var PFX_FORUM = 'https://www.waze.com/forum/viewtopic.php?';
/** @const */
var FORUM_HOME = 't=76488';
/** @const */
var FORUM_FAQ = 't=76488&p=666476#p666476';
/** @const */
var FORUM_LOCAL = 't=76488&p=661300#p661185';
/** @const */
var FORUM_CUSTOM = 't=76488&p=749456#p749456';
