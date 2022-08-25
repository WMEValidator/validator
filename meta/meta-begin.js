// ==UserScript==
// @name                WME Validator
// @version             2022.8.25
// @description         This script validates a map area in Waze Map Editor, highlights issues and generates a very detailed report with wiki references and solutions
// @match               https://beta.waze.com/*editor*
// @match               https://www.waze.com/*editor*
// @exclude             https://www.waze.com/*user/*editor/*
// @grant               none
// @icon                https://raw.githubusercontent.com/WMEValidator/release/master/img/WV-icon96.png
// @namespace           a
// @homepage            https://www.waze.com/forum/viewtopic.php?f=819&t=76488
// @author              Andriy Berestovskyy <berestovskyy@gmail.com>
// @copyright           2013-2018 Andriy Berestovskyy
// @license             GPLv3
// @contributor         justins83
// @contributor         davidakachaos
// @contributor         jangliss
// @contributor         Glodenox
// @contributor         dalverson
// ==/UserScript==
/*
 * WME Validator uses Open Source GPLv3 license, i.e. you may copy,
 * distribute and modify the software as long as you track changes/dates
 * in source files. Any modifications to or software including
 * (via compiler) GPL-licensed code must also be made available under
 * the GPL along with build & install instructions.
 *
 * WME Validator source code is available on GitHub:
 * https://github.com/WMEValidator/
 *
 * For questions please use official forum:
 * https://www.waze.com/forum/viewtopic.php?f=819&t=76488
 *
 * Report bugs on GitHub Issues Tracker:
 * https://github.com/WMEValidator/validator/issues
 */

(function () {