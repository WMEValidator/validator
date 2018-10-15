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

/*global W, OL, $ */

var WMEValidator_Plugin_Test;
(function (WMEValidator_Plugin_Test) {
	var pluginName = "WME Validator Test Plugin";
	WMEValidator_Plugin_Test.name = pluginName;
	WMEValidator_Plugin_Test.active = true;

	function customChecks(){
		return {
			"270.enabled": true,
			"270.severity": 'W',
			"270.reportOnly": false,
			"270.title": "This is a test!",
			"270.problem": "This comes from a custum plugin",
			// "270.problemLink": "W:Fixing_\"smudged\"_cities",
			"270.solution": "Consider disabling the plugin",
			// "270.solutionLink": "F:t=50314#p450378",
		}
	}
	WMEValidator_Plugin_Test.customChecks = customChecks;

	function checkSegments(segments){
		var def = $.Deferred();
		for (var i = segments.length - 1; i >= 0; i--) {
			var segment = segments[i];
			var address = segment.$address;
			var city = address.$city;
			if (city === "Heerenveen") {
				segment.report(270);
			}
		}

		def.resolve();
		return def.promise();
	}
	WMEValidator_Plugin_Test.checkSegments = checkSegments;
})(WMEValidator_Plugin_Test || (WMEValidator_Plugin_Test = {}));
window.WMEValidator_Plugin_Test = WMEValidator_Plugin_Test;