// ==UserScript==
// @name                WME Validator Custom Plugin
// @namespace           WME_VAlidator
// @description         test
// @author              davidakachaos
// @include             https://www.waze.com/editor
// @include             /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @version             0
// @grant               none
// ==/UserScript==

/*global W, OL, */

var WMEValidator_Plugin_Test;
(function (WMEValidator_Plugin_Test) {
	var pluginName = "WME Validator Test Plugin";
	WMEValidator_Plugin_Test.name = pluginName;
	WMEValidator_Plugin_Test.active = true;

	function checkSegment(segment){
		segment.report(155);
	}
	WMEValidator_Plugin_Test.checkSegment = checkSegment;
})(WMEValidator_Plugin_Test || (WMEValidator_Plugin_Test = {}));
window.WMEValidator_Plugin_Test = WMEValidator_Plugin_Test;