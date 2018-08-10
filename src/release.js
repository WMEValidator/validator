/*
 * release.js -- WME Validator release information
 * Copyright (C) 2013-2018 Andriy Berestovskyy
 *
 * This file is part of WME Validator:
 *
 * GnuPG is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * GnuPG is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA
 *
 * Note: This code is heavily based on the GNU MP Library.
 *	 Actually it's the same code with only minor changes in the
 *	 way the data is stored; this is to support the abstraction
 *	 of an optional secure memory allocation which may be used
 *	 to avoid revealing of sensitive data due to paging etc.
 *	 The GNU MP Library itself is published under the LGPL;
 *	 however I decided to publish this code under the plain GPL.
 */

/*************************************************************************
 * RELEASE INFORMATION
 *************************************************************************/

/**
 * WV RELEASE INFORMATION
 */
/** WME Validator version @const */
var WV_VERSION = "2018.08.09";
/** Auto-save password. Increase to reset auto-save config. @const */
var AS_PASSWORD = "v1";
/** @const */
var WV_WHATSNEW = ""
	+ "\nv2018.08.09:"
	+ "\n- GreasyFork release is live again"
	+ "\n- disable #114 and #115 (drivable & non-drivable)"
	+ "\n"
	+ "\nv2018.08.01:"
	+ "\n- Transfer NL translations from Greasyfork"
	+ "\n- other minor changes"
	+ "\n"
	+ "\nv2018.07.18:"
	+ "\n- First public open source release"
	+ "\n"
	+ "\n03.11.2016 v1.1.20:"
	+ "\n- Fixed #23 Unconfirmed road"
	+ "\n"
	+ "\n04.06.2016 v1.1.19:"
	+ "\n- Fixed WME Beta"
	+ "\n- Fixed icons in segment properties"
	+ "\n- The work is still in progress..."
	+ "\n"
	+ "\n02.06.2016 v1.1.18:"
	+ "\n- Fixed Firefox browser"
	+ "\n- Added Validator tab"
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
var PFX_WIKI = 'https://wazeopedia.waze.com/wiki/';
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
