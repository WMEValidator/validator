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

/*************************************************************************
 * ENCRYPTED FUNCTIONS
 *************************************************************************/

/**
 * Function IDs
 * password protected functions must be < 0
 *
 * 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb,
 *   0x81c2c92e, 0x92722c85,
 * 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624,
 *   0xf40e3585, 0x106aa070,
 * 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
 *   0x5b9cca4f, 0x682e6ff3,
 * 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb,
 *   0xbef9a3f7, 0xc67178f2

 * 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
 *   0x9bdc06a7, 0xc19bf174,
 */
/** @const */
var F_INIT = 0x27b70a85;
/** @const */
var F_LOGIN = 0x2e1b2138;
/** @const */
var F_UPDATEUI = 0x4d2c6dfc;
/** @const */
var F_ONWARNING = 0x53380d13;
/** @const */
var F_ONSEGMENTSCHANGED = 0x650a7354;
/** @const */
//var F_HAX = 0x766a0abb;
/** @const */
var F_ONNODESCHANGED = 0x81c2c92e;
/** @const */
var F_LOGOUT = 0x92722c85;
/** @const */
var F_ONLOGIN = 0xa2bfe8a1;
/** @const */
//var F_ONSEGMENTSREMOVED = 0xa81a664b;
/** @const */
//var F_HAXRED = 0xc24b8b70;
/** @const */
var F_HAXBLUE = 0xc76c51a3;
/** @const */
var F_ONRUN = 0xd192e819;
/** @const */
var F_ONMERGEEND = 0xd6990624;
/** @const */
var F_STOP = 0xf40e3585;
/** @const */
var F_PAUSE = 0x106aa070;
/** @const */
var F_VALIDATE = 0x19a4c116;
/** @const */
var F_LAYERSON = 0x1e376c08;
/** @const */
var F_LAYERSOFF = 0x2748774c;
/** @const */
var F_ONLOADSTART = 0x34b0bcb5;
/** @const */
var F_ONMOVEEND = 0x391c0cb3;
/** @const */
//var F_CHECKSEGMENTS = 0x84c87814;
/** @const */
var F_SHOWREPORT = 0x90befffa;
/** @const */
var F_ONCHANGELAYER = 0xa4506ceb;

/** @const */
var F_ARRAY = [
	F_INIT, F_LOGIN, F_UPDATEUI, F_ONWARNING, /*F_HAX,*/
	F_LOGOUT, F_ONLOGIN, /*F_HAXRED,*/ F_HAXBLUE, F_ONRUN,
	F_STOP, F_PAUSE, F_VALIDATE, F_LAYERSON, F_LAYERSOFF,
	F_ONLOADSTART, F_ONMOVEEND,
	F_SHOWREPORT, F_ONMERGEEND, F_ONCHANGELAYER,
	F_ONSEGMENTSCHANGED, F_ONNODESCHANGED
];
/** @const */
var F_LENGTH = F_ARRAY.length;

/*************************************************************************
 * CRITICAL FUNCTIONS
 *************************************************************************/

// HEADER
/** @const */
var CF_UNSHIFT = 0;
/** @const */
var CF_SLENGTH = 1;
/** @const */
var CF_TOSTRING = 2;
/** @const */
var CF_CHARCODEAT = 3;
// DATA
/** @const */
var CF_ASYNC = 4;
/** @const */
var CF_SONCLICK = 5;
/** @const */
var CF_DOCUMENT = 6;
// BASIC
/** @const */
var CF_CLEARTIMEOUT = 7;
/** @const */
var CF_SSETATTRIBUTE = 8;
/** @const */
var CF_FUNCTION = 9;
// HANDLERS
/** @const */
var CF_SETTIMEOUT = 10;
/** @const */
var CF_WINDOW = 11;
/** @const */
var CF_CREATEELEMENT = 12;
// ENCRYPTED
/** @const */
var CF_CLASSCODE = 13;
/** @const */
var CF_REPLACE = 14;
/** @const */
var CF_SCONSOLE = 15;
/** @const */
var CF_APPLY = 16;
/** @const */
var CF_CALL = 17;
// ASYNC
/** @const */
var CF_JSONPARSE = 18;
/** @const */
var CF_DDE = 19;
// LIB
/** @const */
var CF_SLOG = 20;
/** @const */
var CF_EVAL = 21;
/** @const */
var CF_SERROR = 22;
/** @const */
var CF_SWARN = 23;
// END
/** @const */
var CF_TEADECRYPT = 24;
// ASYNC after timeout:
/** @const */
var CF_CONSOLE = 25;
/** @const */
var CF_LOG = 26;
/** @const */
var CF_ERROR = 27;
// DDE:
/** @const */
var CF_WARN = 28;
/** @const */
var CF_ALERT = 29;

// array of mutators
var CFM = [CF_SLENGTH, CF_UNSHIFT];

/**
 * Critical functions calls
 */
function CFGET(cfunc) { return CFA[CFM[cfunc]] }
function CFABSENT(cfunc) { return cfunc >= CFA[CFGET(CF_SLENGTH)] }
function CFCALL(cfunc) { return CFGET(cfunc)() }
function CFCALL1(cfunc, param1) { return CFGET(cfunc)(param1) }
function CFCALL2(cfunc, param1, param2) { return CFGET(cfunc)(param1, param2) }
function CFCALL3(cfunc, param1, param2, param3) { return CFGET(cfunc)(param1, param2, param3) }
function CFAPPLYTHIS(cfunc, obj) { return CFGET(cfunc).apply(obj) }
function CFAPPLYTHIS1(cfunc, obj, param1) { return CFGET(cfunc).apply(obj, param1) }
function CFCALLTHIS1(cfunc, obj, param1) { return CFAPPLYTHIS1(cfunc, obj, [param1]) }
function CFCALLTHIS2(cfunc, obj, param1, param2) { return CFAPPLYTHIS1(cfunc, obj, [param1, param2]) }
function CFCALLTHIS3(cfunc, obj, param1, param2, param3) { return CFAPPLYTHIS1(cfunc, obj, [param1, param2, param3]) }
/** @param {...*} args */
function CFADD(args) {
	var us = CFGET(CF_UNSHIFT);
	var len = CFGET(CF_SLENGTH);
	var ra = [].slice.call(arguments, 0).reverse();
	CFAPPLYTHIS1(CF_UNSHIFT, CFA, ra);
	for (var i = CFM[len], lim = CFM[len] + ra[len];
		i < lim; i++)
		us.call(CFM, i);
}
