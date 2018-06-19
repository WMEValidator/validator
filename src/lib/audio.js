/*
 * audio.js -- WME Validator audio context library
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
 * Audio Context
 * (c) 2013-2018 Andriy Berestovskyy
 * oscType: sine, square, sawtooth, triangle
 */
var _AUDIO = {};
try {
	_AUDIO._context = new (window.AudioContext || window.webkitAudioContext)();
	_AUDIO.beep =
		/** @param {string=} oscType */
		function (dur, oscType) {
			var osc = _AUDIO._context.createOscillator();
			osc.connect(_AUDIO._context.destination);
			osc.type = oscType || "sine";
			osc.start(0);
			setTimeout(function () { osc.stop(0) }, dur);
		}
}
catch (e) {
	_AUDIO._context = null;
	_AUDIO.beep =
		/** @param {string=} oscType */
		function (dur, oscType) { log("beep!") }
}
