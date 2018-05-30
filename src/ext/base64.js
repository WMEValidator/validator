/*
 * This is an early and modified version of TEA Block:
 * https://github.com/chrisveness/crypto/
 * (c) Chris Veness 2002-2017
 *
 * MIT Licence
 */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2012                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Base64 = {};  // Base64 namespace

/*
 * The next few functions are (c) Andriy Berestovskyy
 */
// Get base64 code from a char
// z-aZ-A:9-0/.
Base64.getCode = function (char) {
	var c = 122 - char.charCodeAt(0);
	return c - Math.floor((c - Math.floor(c / 26) * 6) / 26) * 6;
}

// Get base 64 char from a code
// z-aZ-A:9-0/.
Base64.getChar = function (code) {
	return String.fromCharCode(122 - code - Math.floor(code / 26) * 6);
}

// Check if getChar corresponds to getCode
Base64.testCodes = function () {
	// Get base 64 code from a char
	var chars = "";
	for (var i = 0; i < 65; i++) {
		chars += Base64.getChar(i);
	}

	// check if unique
	var codes = [];
	for (var i = 0; i < chars.length; i++) {
		var c = chars.charCodeAt(i);
		if (codes[c]) {
			codes[c]++;
			window.console.log("Dub: " + i);
		}
		else
			codes[c] = 1;
	}

	// check is code == char
	for (var i = 0; i < 65; i++) {
		var ch = Base64.getChar(i);
		var co = Base64.getCode(ch);
		if (i != co) {
			window.console.log("Mismatch: " + i);
		}
	}

	window.console.log(chars);
}


// Updated to use getCode/getChar functions by berestovskyy
/** @param {boolean=} utf8encode */
Base64.encode = function (str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
	utf8encode = (typeof utf8encode == undefined) ? false : utf8encode;
	var o1, o2, o3, bits, h1, h2, h3, h4, e = [], pad = '', c, plain, coded;

	plain = utf8encode ? Utf8.encode(str) : str;

	c = plain.length % 3;  // pad string to length of multiple of 3
	if (c > 0) { while (c++ < 3) { pad += Base64.getChar(64); plain += '\0'; } }
	// note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars

	for (c = 0; c < plain.length; c += 3) {  // pack three octets into four hexets
		o1 = plain.charCodeAt(c);
		o2 = plain.charCodeAt(c + 1);
		o3 = plain.charCodeAt(c + 2);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hextets to index into code string
		e[c / 3] = Base64.getChar(h1) + Base64.getChar(h2) + Base64.getChar(h3) + Base64.getChar(h4);
	}
	coded = e.join('');  // join() is far faster than repeated string concatenation in IE

	// replace 'A's from padded nulls with '='s
	coded = coded.slice(0, coded.length - pad.length) + pad;

	return coded;
}

// Updated to use getCode/getChar functions by berestovskyy
/** @param {boolean=} utf8decode */
Base64.decode = function (str, utf8decode) {
	utf8decode = (typeof utf8decode == undefined) ? false : utf8decode;
	var o1, o2, o3, h1, h2, h3, h4, bits, d = [], plain, coded;

	coded = utf8decode ? Utf8.decode(str) : str;


	for (var c = 0; c < coded.length; c += 4) {  // unpack four hexets into three octets
		h1 = Base64.getCode(coded.charAt(c));
		h2 = Base64.getCode(coded.charAt(c + 1));
		h3 = Base64.getCode(coded.charAt(c + 2));
		h4 = Base64.getCode(coded.charAt(c + 3));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >>> 16 & 0xff;
		o2 = bits >>> 8 & 0xff;
		o3 = bits & 0xff;

		d[c / 4] = String.fromCharCode(o1, o2, o3);
		// check for padding
		if (h4 == 0x40) d[c / 4] = String.fromCharCode(o1, o2);
		if (h3 == 0x40) d[c / 4] = String.fromCharCode(o1);
	}
	plain = d.join('');  // join() is far faster than repeated string concatenation in IE

	return utf8decode ? Utf8.decode(plain) : plain;
}

/** @const */
Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
//Base64.code = "0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZefghijklmnopqrstuvwxyz";
/** @param {boolean=} utf8encode */
Base64.encodeStd = function (str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
	utf8encode = (typeof utf8encode == undefined) ? false : utf8encode;
	var o1, o2, o3, bits, h1, h2, h3, h4, e = [], pad = '', c, plain, coded;
	var b64 = Base64.code;

	plain = utf8encode ? Utf8.encode(str) : str;

	c = plain.length % 3;  // pad string to length of multiple of 3
	if (c > 0) { while (c++ < 3) { pad += Base64.code[64]; plain += '\0'; } }
	// note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars

	for (c = 0; c < plain.length; c += 3) {  // pack three octets into four hexets
		o1 = plain.charCodeAt(c);
		o2 = plain.charCodeAt(c + 1);
		o3 = plain.charCodeAt(c + 2);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hextets to index into code string
		e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	}
	coded = e.join('');  // join() is far faster than repeated string concatenation in IE

	// replace 'A's from padded nulls with '='s
	coded = coded.slice(0, coded.length - pad.length) + pad;

	return coded;
}
/** @param {boolean=} utf8decode */
Base64.decodeStd = function (str, utf8decode) {
	utf8decode = (typeof utf8decode == undefined) ? false : utf8decode;
	var o1, o2, o3, h1, h2, h3, h4, bits, d = [], plain, coded;
	var b64 = Base64.code;

	coded = utf8decode ? Utf8.decode(str) : str;


	for (var c = 0; c < coded.length; c += 4) {  // unpack four hexets into three octets
		h1 = b64.indexOf(coded.charAt(c));
		h2 = b64.indexOf(coded.charAt(c + 1));
		h3 = b64.indexOf(coded.charAt(c + 2));
		h4 = b64.indexOf(coded.charAt(c + 3));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >>> 16 & 0xff;
		o2 = bits >>> 8 & 0xff;
		o3 = bits & 0xff;

		d[c / 4] = String.fromCharCode(o1, o2, o3);
		// check for padding
		if (h4 == 0x40) d[c / 4] = String.fromCharCode(o1, o2);
		if (h3 == 0x40) d[c / 4] = String.fromCharCode(o1);
	}
	plain = d.join('');  // join() is far faster than repeated string concatenation in IE

	return utf8decode ? Utf8.decode(plain) : plain;
}
