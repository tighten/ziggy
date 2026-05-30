//#region node_modules/qs-esm/lib/formats.js
const replace = String.prototype.replace;
const percentTwenties = /%20/g;
const Format = {
	RFC1738: "RFC1738",
	RFC3986: "RFC3986"
};
const formatters = {
	RFC1738: function(value) {
		return replace.call(value, percentTwenties, "+");
	},
	RFC3986: function(value) {
		return String(value);
	}
};
const RFC1738 = Format.RFC1738;
Format.RFC3986;
var formats_default = Format.RFC3986;
//#endregion
//#region node_modules/qs-esm/lib/utils.js
const has$2 = Object.prototype.hasOwnProperty;
const isArray$2 = Array.isArray;
const overflowChannel = /* @__PURE__ */ new WeakMap();
var markOverflow = function markOverflow(obj, maxIndex) {
	overflowChannel.set(obj, maxIndex);
	return obj;
};
function isOverflow(obj) {
	return overflowChannel.has(obj);
}
var getMaxIndex = function getMaxIndex(obj) {
	return overflowChannel.get(obj);
};
var setMaxIndex = function setMaxIndex(obj, maxIndex) {
	overflowChannel.set(obj, maxIndex);
};
const hexTable = (function() {
	const array = [];
	for (let i = 0; i < 256; ++i) array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
	return array;
})();
const compactQueue = function compactQueue(queue) {
	while (queue.length > 1) {
		const item = queue.pop();
		const obj = item.obj[item.prop];
		if (isArray$2(obj)) {
			const compacted = [];
			for (let j = 0; j < obj.length; ++j) if (typeof obj[j] !== "undefined") compacted.push(obj[j]);
			item.obj[item.prop] = compacted;
		}
	}
};
const arrayToObject = function arrayToObject(source, options) {
	const obj = options && options.plainObjects ? Object.create(null) : {};
	for (let i = 0; i < source.length; ++i) if (typeof source[i] !== "undefined") obj[i] = source[i];
	return obj;
};
const merge = function merge(target, source, options) {
	if (!source) return target;
	if (typeof source !== "object") {
		if (isArray$2(target)) target.push(source);
		else if (target && typeof target === "object") {
			if (isOverflow(target)) {
				var newIndex = getMaxIndex(target) + 1;
				target[newIndex] = source;
				setMaxIndex(target, newIndex);
			} else if (options && (options.plainObjects || options.allowPrototypes) || !has$2.call(Object.prototype, source)) target[source] = true;
		} else return [target, source];
		return target;
	}
	if (!target || typeof target !== "object") {
		if (isOverflow(source)) {
			var sourceKeys = Object.keys(source);
			var result = options && options.plainObjects ? {
				__proto__: null,
				0: target
			} : { 0: target };
			for (var m = 0; m < sourceKeys.length; m++) {
				var oldKey = parseInt(sourceKeys[m], 10);
				result[oldKey + 1] = source[sourceKeys[m]];
			}
			return markOverflow(result, getMaxIndex(source) + 1);
		}
		return [target].concat(source);
	}
	let mergeTarget = target;
	if (isArray$2(target) && !isArray$2(source)) mergeTarget = arrayToObject(target, options);
	if (isArray$2(target) && isArray$2(source)) {
		source.forEach(function(item, i) {
			if (has$2.call(target, i)) {
				const targetItem = target[i];
				if (targetItem && typeof targetItem === "object" && item && typeof item === "object") target[i] = merge(targetItem, item, options);
				else target.push(item);
			} else target[i] = item;
		});
		return target;
	}
	return Object.keys(source).reduce(function(acc, key) {
		const value = source[key];
		if (has$2.call(acc, key)) acc[key] = merge(acc[key], value, options);
		else acc[key] = value;
		return acc;
	}, mergeTarget);
};
const decode = function(str, decoder, charset) {
	const strWithoutPlus = str.replace(/\+/g, " ");
	if (charset === "iso-8859-1") return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
	try {
		return decodeURIComponent(strWithoutPlus);
	} catch (e) {
		return strWithoutPlus;
	}
};
const limit = 1024;
const encode = function encode(str, defaultEncoder, charset, kind, format) {
	if (str.length === 0) return str;
	let string = str;
	if (typeof str === "symbol") string = Symbol.prototype.toString.call(str);
	else if (typeof str !== "string") string = String(str);
	if (charset === "iso-8859-1") return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
		return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
	});
	let out = "";
	for (let j = 0; j < string.length; j += limit) {
		const segment = string.length >= limit ? string.slice(j, j + limit) : string;
		const arr = [];
		for (let i = 0; i < segment.length; ++i) {
			let c = segment.charCodeAt(i);
			if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === RFC1738 && (c === 40 || c === 41)) {
				arr[arr.length] = segment.charAt(i);
				continue;
			}
			if (c < 128) {
				arr[arr.length] = hexTable[c];
				continue;
			}
			if (c < 2048) {
				arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
				continue;
			}
			if (c < 55296 || c >= 57344) {
				arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
				continue;
			}
			i += 1;
			c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
			arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
		}
		out += arr.join("");
	}
	return out;
};
const compact = function compact(value) {
	const queue = [{
		obj: { o: value },
		prop: "o"
	}];
	const refs = [];
	for (let i = 0; i < queue.length; ++i) {
		const item = queue[i];
		const obj = item.obj[item.prop];
		const keys = Object.keys(obj);
		for (let j = 0; j < keys.length; ++j) {
			const key = keys[j];
			const val = obj[key];
			if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
				queue.push({
					obj,
					prop: key
				});
				refs.push(val);
			}
		}
	}
	compactQueue(queue);
	return value;
};
const isRegExp = function isRegExp(obj) {
	return Object.prototype.toString.call(obj) === "[object RegExp]";
};
const isBuffer = function isBuffer(obj) {
	if (!obj || typeof obj !== "object") return false;
	return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};
const combine = function combine(a, b, arrayLimit, plainObjects) {
	if (isOverflow(a)) {
		var newIndex = getMaxIndex(a) + 1;
		a[newIndex] = b;
		setMaxIndex(a, newIndex);
		return a;
	}
	var result = [].concat(a, b);
	if (result.length > arrayLimit) return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
	return result;
};
const maybeMap = function maybeMap(val, fn) {
	if (isArray$2(val)) {
		const mapped = [];
		for (let i = 0; i < val.length; i += 1) mapped.push(fn(val[i]));
		return mapped;
	}
	return fn(val);
};
//#endregion
//#region node_modules/qs-esm/lib/stringify.js
const has$1 = Object.prototype.hasOwnProperty;
const arrayPrefixGenerators = {
	brackets: function brackets(prefix) {
		return prefix + "[]";
	},
	comma: "comma",
	indices: function indices(prefix, key) {
		return prefix + "[" + key + "]";
	},
	repeat: function repeat(prefix) {
		return prefix;
	}
};
const isArray$1 = Array.isArray;
const push = Array.prototype.push;
const pushToArray = function(arr, valueOrArray) {
	push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
};
const toISO = Date.prototype.toISOString;
const defaultFormat = formats_default;
const defaults$1 = {
	addQueryPrefix: false,
	allowDots: false,
	allowEmptyArrays: false,
	arrayFormat: "indices",
	charset: "utf-8",
	charsetSentinel: false,
	delimiter: "&",
	encode: true,
	encodeDotInKeys: false,
	encoder: encode,
	encodeValuesOnly: false,
	format: defaultFormat,
	formatter: formatters[defaultFormat],
	indices: false,
	serializeDate: function serializeDate(date) {
		return toISO.call(date);
	},
	skipNulls: false,
	strictNullHandling: false
};
const isNonNullishPrimitive = function isNonNullishPrimitive(v) {
	return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
};
const sentinel = {};
const _stringify = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
	let obj = object;
	let tmpSc = sideChannel;
	let step = 0;
	let findFlag = false;
	while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
		const pos = tmpSc.get(object);
		step += 1;
		if (typeof pos !== "undefined") if (pos === step) throw new RangeError("Cyclic object value");
		else findFlag = true;
		if (typeof tmpSc.get(sentinel) === "undefined") step = 0;
	}
	if (typeof filter === "function") obj = filter(prefix, obj);
	else if (obj instanceof Date) obj = serializeDate(obj);
	else if (generateArrayPrefix === "comma" && isArray$1(obj)) obj = maybeMap(obj, function(value) {
		if (value instanceof Date) return serializeDate(value);
		return value;
	});
	if (obj === null) {
		if (strictNullHandling) return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, "key", format) : prefix;
		obj = "";
	}
	if (isNonNullishPrimitive(obj) || isBuffer(obj)) {
		if (encoder) return [formatter(encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, "key", format)) + "=" + formatter(encoder(obj, defaults$1.encoder, charset, "value", format))];
		return [formatter(prefix) + "=" + formatter(String(obj))];
	}
	const values = [];
	if (typeof obj === "undefined") return values;
	let objKeys;
	if (generateArrayPrefix === "comma" && isArray$1(obj)) {
		if (encodeValuesOnly && encoder) obj = maybeMap(obj, encoder);
		objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
	} else if (isArray$1(filter)) objKeys = filter;
	else {
		const keys = Object.keys(obj);
		objKeys = sort ? keys.sort(sort) : keys;
	}
	const encodedPrefix = encodeDotInKeys ? prefix.replace(/\./g, "%2E") : prefix;
	const adjustedPrefix = commaRoundTrip && isArray$1(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
	if (allowEmptyArrays && isArray$1(obj) && obj.length === 0) return adjustedPrefix + "[]";
	for (let j = 0; j < objKeys.length; ++j) {
		const key = objKeys[j];
		const value = typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key];
		if (skipNulls && value === null) continue;
		const encodedKey = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
		const keyPrefix = isArray$1(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
		sideChannel.set(object, step);
		const valueSideChannel = /* @__PURE__ */ new WeakMap();
		valueSideChannel.set(sentinel, sideChannel);
		pushToArray(values, _stringify(value, keyPrefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, generateArrayPrefix === "comma" && encodeValuesOnly && isArray$1(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
	}
	return values;
};
const normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
	if (!opts) return defaults$1;
	if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
	if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
	if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") throw new TypeError("Encoder has to be a function.");
	const charset = opts.charset || defaults$1.charset;
	if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
	let format = formats_default;
	if (typeof opts.format !== "undefined") {
		if (!has$1.call(formatters, opts.format)) throw new TypeError("Unknown format option provided.");
		format = opts.format;
	}
	const formatter = formatters[format];
	let filter = defaults$1.filter;
	if (typeof opts.filter === "function" || isArray$1(opts.filter)) filter = opts.filter;
	let arrayFormat;
	if (opts.arrayFormat in arrayPrefixGenerators) arrayFormat = opts.arrayFormat;
	else if ("indices" in opts) arrayFormat = opts.indices ? "indices" : "repeat";
	else arrayFormat = defaults$1.arrayFormat;
	if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
	const allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults$1.allowDots : !!opts.allowDots;
	return {
		addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
		allowDots,
		allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults$1.allowEmptyArrays,
		arrayFormat,
		charset,
		charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults$1.charsetSentinel,
		commaRoundTrip: opts.commaRoundTrip,
		delimiter: typeof opts.delimiter === "undefined" ? defaults$1.delimiter : opts.delimiter,
		encode: typeof opts.encode === "boolean" ? opts.encode : defaults$1.encode,
		encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
		encoder: typeof opts.encoder === "function" ? opts.encoder : defaults$1.encoder,
		encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
		filter,
		format,
		formatter,
		serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults$1.serializeDate,
		skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults$1.skipNulls,
		sort: typeof opts.sort === "function" ? opts.sort : null,
		strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults$1.strictNullHandling
	};
};
function stringify(object, opts) {
	let obj = object;
	const options = normalizeStringifyOptions(opts);
	let objKeys;
	let filter;
	if (typeof options.filter === "function") {
		filter = options.filter;
		obj = filter("", obj);
	} else if (isArray$1(options.filter)) {
		filter = options.filter;
		objKeys = filter;
	}
	const keys = [];
	if (typeof obj !== "object" || obj === null) return "";
	const generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
	const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
	if (!objKeys) objKeys = Object.keys(obj);
	if (options.sort) objKeys.sort(options.sort);
	const sideChannel = /* @__PURE__ */ new WeakMap();
	for (let i = 0; i < objKeys.length; ++i) {
		const key = objKeys[i];
		if (options.skipNulls && obj[key] === null) continue;
		pushToArray(keys, _stringify(obj[key], key, generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
	}
	const joined = keys.join(options.delimiter);
	let prefix = options.addQueryPrefix === true ? "?" : "";
	if (options.charsetSentinel) if (options.charset === "iso-8859-1") prefix += "utf8=%26%2310003%3B&";
	else prefix += "utf8=%E2%9C%93&";
	return joined.length > 0 ? prefix + joined : "";
}
//#endregion
//#region node_modules/qs-esm/lib/parse.js
const has = Object.prototype.hasOwnProperty;
const isArray = Array.isArray;
const defaults = {
	allowDots: false,
	allowEmptyArrays: false,
	allowPrototypes: false,
	allowSparse: false,
	arrayLimit: 20,
	charset: "utf-8",
	charsetSentinel: false,
	comma: false,
	decodeDotInKeys: false,
	decoder: decode,
	delimiter: "&",
	depth: 5,
	duplicates: "combine",
	ignoreQueryPrefix: false,
	interpretNumericEntities: false,
	parameterLimit: 1e3,
	parseArrays: true,
	plainObjects: false,
	strictNullHandling: false
};
const interpretNumericEntities = function(str) {
	return str.replace(/&#(\d+);/g, function($0, numberStr) {
		return String.fromCharCode(parseInt(numberStr, 10));
	});
};
const parseArrayValue = function(val, options) {
	if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) return val.split(",");
	return val;
};
const isoSentinel = "utf8=%26%2310003%3B";
const charsetSentinel = "utf8=%E2%9C%93";
const parseValues = function parseQueryStringValues(str, options) {
	const obj = { __proto__: null };
	const cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
	const limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
	const parts = cleanStr.split(options.delimiter, limit);
	let skipIndex = -1;
	let i;
	let charset = options.charset;
	if (options.charsetSentinel) {
		for (i = 0; i < parts.length; ++i) if (parts[i].indexOf("utf8=") === 0) {
			if (parts[i] === charsetSentinel) charset = "utf-8";
			else if (parts[i] === isoSentinel) charset = "iso-8859-1";
			skipIndex = i;
			i = parts.length;
		}
	}
	for (i = 0; i < parts.length; ++i) {
		if (i === skipIndex) continue;
		const part = parts[i];
		const bracketEqualsPos = part.indexOf("]=");
		const pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
		let key, val;
		if (pos === -1) {
			key = options.decoder(part, defaults.decoder, charset, "key");
			val = options.strictNullHandling ? null : "";
		} else {
			key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
			val = maybeMap(parseArrayValue(part.slice(pos + 1), options), function(encodedVal) {
				return options.decoder(encodedVal, defaults.decoder, charset, "value");
			});
		}
		if (val && options.interpretNumericEntities && charset === "iso-8859-1") val = interpretNumericEntities(val);
		if (part.indexOf("[]=") > -1) val = isArray(val) ? [val] : val;
		const existing = has.call(obj, key);
		if (existing && options.duplicates === "combine") obj[key] = combine(obj[key], val, options.arrayLimit, options.plainObjects);
		else if (!existing || options.duplicates === "last") obj[key] = val;
	}
	return obj;
};
const parseObject = function(chain, val, options, valuesParsed) {
	let leaf = valuesParsed ? val : parseArrayValue(val, options);
	for (let i = chain.length - 1; i >= 0; --i) {
		let obj;
		const root = chain[i];
		if (root === "[]" && options.parseArrays) if (isOverflow(leaf)) obj = leaf;
		else obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : combine([], leaf, options.arrayLimit, options.plainObjects);
		else {
			obj = options.plainObjects ? Object.create(null) : {};
			const cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
			const decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
			const index = parseInt(decodedRoot, 10);
			if (!options.parseArrays && decodedRoot === "") obj = { 0: leaf };
			else if (!isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
				obj = [];
				obj[index] = leaf;
			} else if (decodedRoot !== "__proto__") obj[decodedRoot] = leaf;
		}
		leaf = obj;
	}
	return leaf;
};
const parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
	if (!givenKey) return;
	const key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
	const brackets = /(\[[^[\]]*])/;
	const child = /(\[[^[\]]*])/g;
	let segment = options.depth > 0 && brackets.exec(key);
	const parent = segment ? key.slice(0, segment.index) : key;
	const keys = [];
	if (parent) {
		if (!options.plainObjects && has.call(Object.prototype, parent)) {
			if (!options.allowPrototypes) return;
		}
		keys.push(parent);
	}
	let i = 0;
	while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
		i += 1;
		if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
			if (!options.allowPrototypes) return;
		}
		keys.push(segment[1]);
	}
	if (segment) keys.push("[" + key.slice(segment.index) + "]");
	return parseObject(keys, val, options, valuesParsed);
};
const normalizeParseOptions = function normalizeParseOptions(opts) {
	if (!opts) return defaults;
	if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
	if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
	if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") throw new TypeError("Decoder has to be a function.");
	if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
	const charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
	const duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
	if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") throw new TypeError("The duplicates option must be either combine, first, or last");
	return {
		allowDots: typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots,
		allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
		allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
		allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
		arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
		charset,
		charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
		comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
		decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
		decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
		delimiter: typeof opts.delimiter === "string" || isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
		depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
		duplicates,
		ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
		interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
		parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
		parseArrays: opts.parseArrays !== false,
		plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
		strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
	};
};
function parse(str, opts) {
	const options = normalizeParseOptions(opts);
	if (str === "" || str === null || typeof str === "undefined") return options.plainObjects ? Object.create(null) : {};
	const tempObj = typeof str === "string" ? parseValues(str, options) : str;
	let obj = options.plainObjects ? Object.create(null) : {};
	const keys = Object.keys(tempObj);
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		const newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
		obj = merge(obj, newObj, options);
	}
	if (options.allowSparse === true) return obj;
	return compact(obj);
}
//#endregion
//#region src/js/Route.js
/**
* A Laravel route. This class represents one route and its configuration and metadata.
*/
var Route = class {
	/**
	* @param {String} name - Route name.
	* @param {Object} definition - Route definition.
	* @param {Object} config - Ziggy configuration.
	*/
	constructor(name, definition, config) {
		this.name = name;
		this.definition = definition;
		this.bindings = definition.bindings ?? {};
		this.wheres = definition.wheres ?? {};
		this.config = config;
	}
	/**
	* Get a 'template' of the complete URL for this route.
	*
	* @example
	* https://{team}.ziggy.dev/user/{user}
	*
	* @return {String} Route template.
	*/
	get template() {
		const template = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
		return template === "" ? "/" : template;
	}
	/**
	* Get a template of the origin for this route.
	*
	* @example
	* https://{team}.ziggy.dev/
	*
	* @return {String} Route origin template.
	*/
	get origin() {
		return !this.config.absolute ? "" : this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url;
	}
	/**
	* Get an array of objects representing the parameters that this route accepts.
	*
	* @example
	* [{ name: 'team', required: true }, { name: 'user', required: false }]
	*
	* @return {Array} Parameter segments.
	*/
	get parameterSegments() {
		return this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
			name: segment.replace(/{|\??}/g, ""),
			required: !/\?}$/.test(segment)
		})) ?? [];
	}
	/**
	* Get whether this route's template matches the given URL.
	*
	* @param {String} url - URL to check.
	* @return {Object|false} - If this route matches, returns the matched parameters.
	*/
	matchesUrl(url) {
		if (!this.definition.methods.includes("GET")) return false;
		const pattern = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
			const regex = `(?<${segment}>${this.wheres[segment]?.replace(/(^\^)|(\$$)/g, "") || "[^/?]+"})`;
			return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
		}).replace(/^\w+:\/\//, "");
		const [location, query] = url.replace(/^\w+:\/\//, "").split("?");
		const matches = new RegExp(`^${pattern}/?$`).exec(location) ?? new RegExp(`^${pattern}/?$`).exec(decodeURI(location));
		if (matches) {
			for (const k in matches.groups) matches.groups[k] = typeof matches.groups[k] === "string" ? decodeURIComponent(matches.groups[k]) : matches.groups[k];
			return {
				params: matches.groups,
				query: parse(query)
			};
		}
		return false;
	}
	/**
	* Hydrate and return a complete URL for this route with the given parameters.
	*
	* @param {Object} params
	* @return {String}
	*/
	compile(params) {
		if (!this.parameterSegments.length) return this.template;
		return this.template.replace(/{([^}?]+)(\??)}/g, (_, segment, optional) => {
			if (!optional && [null, void 0].includes(params[segment])) throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`);
			if (this.wheres[segment]) {
				if (!new RegExp(`^${optional ? `(${this.wheres[segment]})?` : this.wheres[segment]}$`).test(params[segment] ?? "")) throw new Error(`Ziggy error: '${segment}' parameter '${params[segment]}' does not match required format '${this.wheres[segment]}' for route '${this.name}'.`);
			}
			return encodeURI(params[segment] ?? "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
		}).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "");
	}
};
//#endregion
//#region src/js/Router.js
/**
* A collection of Laravel routes. This class constitutes Ziggy's main API.
*/
var Router = class extends String {
	/**
	* @param {String} [name] - Route name.
	* @param {(String|Number|Array|Object)} [params] - Route parameters.
	* @param {Boolean} [absolute] - Whether to include the URL origin.
	* @param {Object} [config] - Ziggy configuration.
	*/
	constructor(name, params, absolute = true, config) {
		super();
		this._config = config ?? (typeof Ziggy !== "undefined" ? Ziggy : globalThis?.Ziggy);
		if (!this._config && typeof document !== "undefined" && document.getElementById("ziggy-routes-json")) {
			globalThis.Ziggy = JSON.parse(document.getElementById("ziggy-routes-json").textContent);
			this._config = globalThis.Ziggy;
		}
		this._config = {
			...this._config,
			absolute
		};
		if (name) {
			if (!this._config.routes[name]) throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
			this._route = new Route(name, this._config.routes[name], this._config);
			this._params = this._parse(params);
		}
	}
	/**
	* Get the compiled URL string for the current route and parameters.
	*
	* @example
	* // with 'posts.show' route 'posts/{post}'
	* (new Router('posts.show', 1)).toString(); // 'https://ziggy.dev/posts/1'
	*
	* @return {String}
	*/
	toString() {
		const unhandled = Object.keys(this._params).filter((key) => !this._route.parameterSegments.some(({ name }) => name === key)).filter((key) => key !== "_query").reduce((result, current) => ({
			...result,
			[current]: this._params[current]
		}), {});
		return this._route.compile(this._params) + stringify({
			...unhandled,
			...this._params["_query"]
		}, {
			addQueryPrefix: true,
			arrayFormat: "indices",
			encodeValuesOnly: true,
			skipNulls: true,
			encoder: (value, encoder) => typeof value === "boolean" ? Number(value) : encoder(value)
		});
	}
	/**
	* Get the parameters, values, and metadata from the given URL.
	*
	* @param {String} [url] - The URL to inspect, defaults to the current window URL.
	* @return {{ name: string, params: Object, query: Object, route: Route }}
	*/
	_unresolve(url) {
		if (!url) url = this._currentUrl();
		else if (this._config.absolute && url.startsWith("/")) url = this._location().host + url;
		let matchedParams = {};
		const [name, route] = Object.entries(this._config.routes).find(([name, route]) => matchedParams = new Route(name, route, this._config).matchesUrl(url)) || [void 0, void 0];
		return {
			name,
			...matchedParams,
			route
		};
	}
	_currentUrl() {
		const { host, pathname, search } = this._location();
		return (this._config.absolute ? host + pathname : pathname.replace(this._config.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + search;
	}
	/**
	* Get the name of the route matching the current window URL, or, given a route name
	* and parameters, check if the current window URL and parameters match that route.
	*
	* @example
	* // at URL https://ziggy.dev/posts/4 with 'posts.show' route 'posts/{post}'
	* route().current(); // 'posts.show'
	* route().current('posts.index'); // false
	* route().current('posts.show'); // true
	* route().current('posts.show', { post: 1 }); // false
	* route().current('posts.show', { post: 4 }); // true
	*
	* @param {String} [name] - Route name to check.
	* @param {(String|Number|Array|Object)} [params] - Route parameters.
	* @return {(Boolean|String|undefined)}
	*/
	current(name, params) {
		const { name: current, params: currentParams, query, route } = this._unresolve();
		if (!name) return current;
		const match = new RegExp(`^${name.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(current);
		if ([null, void 0].includes(params) || !match) return match;
		const routeObject = new Route(current, route, this._config);
		params = this._parse(params, routeObject);
		const routeParams = {
			...currentParams,
			...query
		};
		if (Object.values(params).every((p) => !p) && !Object.values(routeParams).some((v) => v !== void 0)) return true;
		const isSubset = (subset, full) => {
			return Object.entries(subset).every(([key, value]) => {
				if (Array.isArray(value) && Array.isArray(full[key])) return value.every((v) => full[key].includes(v) || full[key].includes(decodeURIComponent(v)));
				if (typeof value === "object" && typeof full[key] === "object" && value !== null && full[key] !== null) return isSubset(value, full[key]);
				return full[key] == value || full[key] == decodeURIComponent(value);
			});
		};
		return isSubset(params, routeParams);
	}
	/**
	* Get an object representing the current location (by default this will be
	* the JavaScript `window` global if it's available).
	*
	* @return {Object}
	*/
	_location() {
		const { host = "", pathname = "", search = "" } = typeof window !== "undefined" ? window.location : {};
		return {
			host: this._config.location?.host ?? host,
			pathname: this._config.location?.pathname ?? pathname,
			search: this._config.location?.search ?? search
		};
	}
	/**
	* Get all parameter values from the current window URL.
	*
	* @example
	* // at URL https://tighten.ziggy.dev/posts/4?lang=en with 'posts.show' route 'posts/{post}' and domain '{team}.ziggy.dev'
	* route().params; // { team: 'tighten', post: 4, lang: 'en' }
	*
	* @return {Object}
	*/
	get params() {
		const { params, query } = this._unresolve();
		return {
			...params,
			...query
		};
	}
	get routeParams() {
		return this._unresolve().params;
	}
	get queryParams() {
		return this._unresolve().query;
	}
	/**
	* Check whether the given route exists.
	*
	* @param {String} name
	* @return {Boolean}
	*/
	has(name) {
		return this._config.routes.hasOwnProperty(name);
	}
	/**
	* Parse Laravel-style route parameters of any type into a normalized object.
	*
	* @example
	* // with route parameter names 'event' and 'venue'
	* _parse(1); // { event: 1 }
	* _parse({ event: 2, venue: 3 }); // { event: 2, venue: 3 }
	* _parse(['Taylor', 'Matt']); // { event: 'Taylor', venue: 'Matt' }
	* _parse([4, { uuid: 56789, name: 'Grand Canyon' }]); // { event: 4, venue: 56789 }
	*
	* @param {(String|Number|Array|Object)} params - Route parameters.
	* @param {Route} route - Route instance.
	* @return {Object} Normalized complete route parameters.
	*/
	_parse(params = {}, route = this._route) {
		params ??= {};
		params = ["string", "number"].includes(typeof params) ? [params] : params;
		const segments = route.parameterSegments.filter(({ name }) => !this._config.defaults[name]);
		if (Array.isArray(params)) params = params.reduce((result, current, i) => segments[i] ? {
			...result,
			[segments[i].name]: current
		} : typeof current === "object" ? {
			...result,
			...current
		} : {
			...result,
			[current]: ""
		}, {});
		else if (segments.length === 1 && !params.hasOwnProperty(segments[0].name) && (params.hasOwnProperty(Object.values(route.bindings)[0]) || params.hasOwnProperty("id"))) params = { [segments[0].name]: params };
		return {
			...this._defaults(route),
			...this._substituteBindings(params, route)
		};
	}
	/**
	* Populate default parameters for the given route.
	*
	* @example
	* // with default parameters { locale: 'en', country: 'US' } and 'posts.show' route '{locale}/posts/{post}'
	* defaults(...); // { locale: 'en' }
	*
	* @param {Route} route
	* @return {Object} Default route parameters.
	*/
	_defaults(route) {
		return route.parameterSegments.filter(({ name }) => this._config.defaults[name]).reduce((result, { name }, i) => ({
			...result,
			[name]: this._config.defaults[name]
		}), {});
	}
	/**
	* Substitute Laravel route model bindings in the given parameters.
	*
	* @example
	* _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
	*
	* @param {Object} params - Route parameters.
	* @param {Object} route - Route definition.
	* @return {Object} Normalized route parameters.
	*/
	_substituteBindings(params, { bindings, parameterSegments }) {
		return Object.entries(params).reduce((result, [key, value]) => {
			if (!value || typeof value !== "object" || Array.isArray(value) || !parameterSegments.some(({ name }) => name === key)) return {
				...result,
				[key]: value
			};
			const binding = value.hasOwnProperty(bindings[key]) ? bindings[key] : value.hasOwnProperty("id") ? "id" : void 0;
			if (binding === void 0) throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`);
			return {
				...result,
				[key]: value[binding]
			};
		}, {});
	}
	valueOf() {
		return this.toString();
	}
};
//#endregion
//#region src/js/index.js
function route(name, params, absolute, config) {
	const router = new Router(name, params, absolute, config);
	return name ? router.toString() : router;
}
const ZiggyVue = { install(app, options) {
	const r = (name, params, absolute, config = options) => route(name, params, absolute, config);
	if (parseInt(app.version) > 2) {
		app.config.globalProperties.route = r;
		app.provide("route", r);
	} else app.mixin({ methods: { route: r } });
} };
function useRoute(defaultConfig) {
	if (!defaultConfig && !globalThis.Ziggy && typeof Ziggy === "undefined" && !document.getElementById("ziggy-routes-json")) throw new Error("Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into the useRoute hook.");
	return (name, params, absolute, config = defaultConfig) => route(name, params, absolute, config);
}
//#endregion
export { ZiggyVue, route, useRoute };
