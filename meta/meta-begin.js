// ==UserScript==
// @name                WME Validator
// @version             1.1.20
// @description         This script validates a map area in Waze Map Editor, highlights issues and generates a very detailed report with wiki references and solutions
// @match               https://editor-beta.waze.com/*editor/*
// @match               https://www.waze.com/*editor/*
// @exclude             https://www.waze.com/*user/*editor/*
// @grant               none
// @icon                http://s3.amazonaws.com/uso_ss/icon/191016/large.png?1388868317
// @namespace           a
// @author              berestovskyy
// @copyright           2013-2018 berestovskyy
// ==/UserScript==
//
/*
 * LICENSE:
 * This script has some features locked for certain
 * countries/editor levels, so there are 2 restrictions:
 *
 * 1. You may not modify or reverse engineer the script.
 * 2. You may not use the script for commercial purposes.
 *
 * The script is distributed 'as is'. No warranty of any
 * kind is expressed or implied. You use at your own risk.
 *
 * If you do not agree with the terms of this license,
 * you must remove the script files from your storage
 * devices and cease to use WME Validator.
 *
 */
(function () {