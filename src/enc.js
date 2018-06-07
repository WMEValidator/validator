/*
 * enc.js -- WME Validator self-encryption support
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
 * Function IDs
 */
/** @const */
var F_INIT = 1;
/** @const */
var F_LOGIN = 2;
/** @const */
var F_UPDATEUI = 3;
/** @const */
var F_ONWARNING = 4;
/** @const */
var F_ONSEGMENTSCHANGED = 5;
/** @const */
var F_ONNODESCHANGED = 6;
/** @const */
var F_LOGOUT = 7;
/** @const */
var F_ONLOGIN = 8;
/** @const */
var F_HAXBLUE = 9;
/** @const */
var F_ONRUN = 10;
/** @const */
var F_ONMERGEEND = 11;
/** @const */
var F_STOP = 12;
/** @const */
var F_PAUSE = 13;
/** @const */
var F_VALIDATE = 14;
/** @const */
var F_LAYERSON = 15;
/** @const */
var F_LAYERSOFF = 16;
/** @const */
var F_ONLOADSTART = 17;
/** @const */
var F_ONMOVEEND = 18;
/** @const */
var F_SHOWREPORT = 19;
/** @const */
var F_ONCHANGELAYER = 20;
