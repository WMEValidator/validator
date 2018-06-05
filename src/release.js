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
/** CHECKSUM @const */
var CF_SUMBLUE = 329630;
/** @const */
var WV_SHORTNAME = "Validator";
/** @const */
var WV_NAME = "WME " + WV_SHORTNAME;
/** @const */
var WV_NAME_ = WV_NAME.split(" ").join("_");
/** @const */
var WV_NAME_NO_SPACE = WV_NAME.split(" ").join("");
/** @const */
var WV_ABBREVIATION = "WV";
/** @const */
var WV_RELEASE_DATE = "2016-11-03";
/** @const */
var WV_RELEASE_VALID = "2023-07-01"; /* This check should be removed eventually, but setting to the future for now so we can just get the script working */
/* Version: 1.1.20 */
/** @const */
var WV_MAJOR = "1.1";
/** @const */
var WV_MINOR = "20";
/** Auto-save password @const */
var AS_PASSWORD = "3";
/** @const */
var WV_VERSION = WV_MAJOR + "." + WV_MINOR;
/** @const */
var WV_WHATSNEW = ""
	+ "- Fixed #23 Unconfirmed road"
	+ "\n"
	+ "\n04.06.2016 v1.1.19:"
	+ "\n- Fixed WME Beta"
	+ "\n- Fixed icons in segment properties"
	+ "\n- The work is still in progress..."
	+ "\n"
	+ "\n02.06.2016 v1.1.18:"
	+ "\n- Fixed Firefox browser"
	+ "\n- Added Validator tab"
	+ "\n"
	+ "\n01.06.2016 v1.1.17:"
	+ "\n- Fixed (some) icons"
	+ "\n- Fixed (some) event handlers"
	+ "\n"
	+ "\n29.01.2016 v1.1.16:"
	+ "\n- Fixed Firefox browser (thanks to Glodenox)"
	+ "\n- Updated CZ localizations"
	+ "\n"
	+ "\n13.12.2015 v1.1.15:"
	+ "\n- Updated US and CZ localizations"
	;
/** @const */
var WV_LICENSE_VERSION = "1";
/** @const */
var WV_LICENSE = ""
	+ "\nLICENSE:"
	+ "\nThis script has some features locked for certain"
	+ "\ncountries/editor levels, so there are 2 restrictions:"
	+ "\n"
	+ "\n1. You may not modify or reverse engineer the script."
	+ "\n2. You may not use the script for commercial purposes."
	+ "\n"
	+ "\nThe script is distributed 'as is'. No warranty of any"
	+ "\nkind is expressed or implied. You use at your own risk."
	+ "\n"
	+ "\nIf you do not agree with the terms of this license,"
	+ "\nyou must remove the script files from your storage"
	+ "\ndevices and cease to use " + WV_NAME + '.'
	+ "\n"
	+ "\nNote: " + WV_NAME + " uses local storage to remember"
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
var GA_LEVEL1 = 1;
/**
 * Users allowed to lookup other users
 * @const
 */
var GA_SUPERUSER = "berestovskyy";

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
