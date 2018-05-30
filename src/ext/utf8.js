/*
 * This is an early version of TEA Block:
 * https://github.com/chrisveness/crypto/
 * (c) Chris Veness 2002-2017
 *
 * MIT Licence
 */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2012                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace
Utf8.encode = function (strUni) {
	// use regular expressions & String.replace callback function for better efficiency
	// than procedural approaches
	var strUtf = strUni.replace(
		/[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
		function (c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
		}
	);
	strUtf = strUtf.replace(
		/[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
		function (c) {
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
		}
	);
	return strUtf;
}
Utf8.decode = function (strUtf) {
	// note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
	var strUni = strUtf.replace(
		/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
		function (c) {  // (note parentheses for precence)
			var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
			return String.fromCharCode(cc);
		}
	);
	strUni = strUni.replace(
		/[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
		function (c) {  // (note parentheses for precence)
			var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
			return String.fromCharCode(cc);
		}
	);
	return strUni;
}

