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
 *
 * WME Validator is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
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
var WV_VERSION = "2020.11.1";
/** Auto-save password. Increase to reset auto-save config. @const */
var AS_PASSWORD = "v1";
/** @const */
var WV_WHATSNEW = `v2020.11.1:
- paulvdwyn: update Motorway naming for BE

v2020.10.25:
- davidakachaos: updated Wiki links for BE/NL

v2020.04.12:
- davidakachaos: fixes for latests WME

v2019.09.24:
- davidakachaos: Added new places checks!
- davidakachaos: Added Dutch translations for places checks
- other minor fixes
Please report any issues/suggestions on the forum:
https://www.waze.com/forum/viewtopic.php?t=76488

v2019.08.29:
- luc45z: update PL abbreviations

v2019.08.16:
- jangliss: Fix for layer refresh if layer did not trigger update
- jangliss: Add lock checks for railroad and private roads

v2019.04.11:
- berestovskyy: hot fix for login issue
- berestovskyy: fixed audio for Google Chrome

See the full Change Log:
https://www.waze.com/forum/viewtopic.php?f=819&t=76488&p=787161#p787161`
	;
/** @const */
var WV_LICENSE_VERSION = "1";
/** @const */
var WV_LICENSE = `LICENSE:
WME Validator uses Open Source GPLv3 license,
i.e. you may copy, distribute and modify the software
as long as you track changes/dates in source files.
Any modifications to or software including (via compiler)
GPL-licensed code must also be made available
under the GPL along with build & install instructions.

WME Validator source code is available on GitHub:
https://github.com/WMEValidator/

For questions please use official forum:
https://www.waze.com/forum/viewtopic.php?f=819&t=76488

Report bugs on GitHub Issues Tracker:
https://github.com/WMEValidator/validator/issues

Note: WME Validator uses local storage to remember
your choices and preferences.`
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
