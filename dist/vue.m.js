function t(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function r(r,e,n){return e&&t(r.prototype,e),n&&t(r,n),r}function e(){return(e=Object.assign||function(t){for(var r=1;r<arguments.length;r++){var e=arguments[r];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])}return t}).apply(this,arguments)}function n(t){return(n=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function o(t,r){return(o=Object.setPrototypeOf||function(t,r){return t.__proto__=r,t})(t,r)}function i(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(t){return!1}}function u(t,r,e){return(u=i()?Reflect.construct:function(t,r,e){var n=[null];n.push.apply(n,r);var i=new(Function.bind.apply(t,n));return e&&o(i,e.prototype),i}).apply(null,arguments)}function f(t){var r="function"==typeof Map?new Map:void 0;return(f=function(t){if(null===t||-1===Function.toString.call(t).indexOf("[native code]"))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return u(t,arguments,n(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),o(e,t)})(t)}var a="undefined"!=typeof Symbol&&Symbol,c="Function.prototype.bind called on incompatible ",y=Array.prototype.slice,p=Object.prototype.toString,l=Function.prototype.bind||function(t){var r=this;if("function"!=typeof r||"[object Function]"!==p.call(r))throw new TypeError(c+r);for(var e,n=y.call(arguments,1),o=function(){if(this instanceof e){var o=r.apply(this,n.concat(y.call(arguments)));return Object(o)===o?o:this}return r.apply(t,n.concat(y.call(arguments)))},i=Math.max(0,r.length-n.length),u=[],f=0;f<i;f++)u.push("$"+f);if(e=Function("binder","return function ("+u.join(",")+"){ return binder.apply(this,arguments); }")(o),r.prototype){var a=function(){};a.prototype=r.prototype,e.prototype=new a,a.prototype=null}return e},s=l.call(Function.call,Object.prototype.hasOwnProperty),v=SyntaxError,d=Function,b=TypeError,h=function(t){try{return d('"use strict"; return ('+t+").constructor;")()}catch(t){}},m=Object.getOwnPropertyDescriptor;if(m)try{m({},"")}catch(t){m=null}var g,j=function(){throw new b},S=m?function(){try{return j}catch(t){try{return m(arguments,"callee").get}catch(t){return j}}}():j,A="function"==typeof a&&"function"==typeof Symbol&&"symbol"==typeof a("foo")&&"symbol"==typeof Symbol("bar")&&function(){if("function"!=typeof Symbol||"function"!=typeof Object.getOwnPropertySymbols)return!1;if("symbol"==typeof Symbol.iterator)return!0;var t={},r=Symbol("test"),e=Object(r);if("string"==typeof r)return!1;if("[object Symbol]"!==Object.prototype.toString.call(r))return!1;if("[object Symbol]"!==Object.prototype.toString.call(e))return!1;for(r in t[r]=42,t)return!1;if("function"==typeof Object.keys&&0!==Object.keys(t).length)return!1;if("function"==typeof Object.getOwnPropertyNames&&0!==Object.getOwnPropertyNames(t).length)return!1;var n=Object.getOwnPropertySymbols(t);if(1!==n.length||n[0]!==r)return!1;if(!Object.prototype.propertyIsEnumerable.call(t,r))return!1;if("function"==typeof Object.getOwnPropertyDescriptor){var o=Object.getOwnPropertyDescriptor(t,r);if(42!==o.value||!0!==o.enumerable)return!1}return!0}(),O=Object.getPrototypeOf||function(t){return t.__proto__},w={},P="undefined"==typeof Uint8Array?void 0:O(Uint8Array),E={"%AggregateError%":"undefined"==typeof AggregateError?void 0:AggregateError,"%Array%":Array,"%ArrayBuffer%":"undefined"==typeof ArrayBuffer?void 0:ArrayBuffer,"%ArrayIteratorPrototype%":A?O([][Symbol.iterator]()):void 0,"%AsyncFromSyncIteratorPrototype%":void 0,"%AsyncFunction%":w,"%AsyncGenerator%":w,"%AsyncGeneratorFunction%":w,"%AsyncIteratorPrototype%":w,"%Atomics%":"undefined"==typeof Atomics?void 0:Atomics,"%BigInt%":"undefined"==typeof BigInt?void 0:BigInt,"%Boolean%":Boolean,"%DataView%":"undefined"==typeof DataView?void 0:DataView,"%Date%":Date,"%decodeURI%":decodeURI,"%decodeURIComponent%":decodeURIComponent,"%encodeURI%":encodeURI,"%encodeURIComponent%":encodeURIComponent,"%Error%":Error,"%eval%":eval,"%EvalError%":EvalError,"%Float32Array%":"undefined"==typeof Float32Array?void 0:Float32Array,"%Float64Array%":"undefined"==typeof Float64Array?void 0:Float64Array,"%FinalizationRegistry%":"undefined"==typeof FinalizationRegistry?void 0:FinalizationRegistry,"%Function%":d,"%GeneratorFunction%":w,"%Int8Array%":"undefined"==typeof Int8Array?void 0:Int8Array,"%Int16Array%":"undefined"==typeof Int16Array?void 0:Int16Array,"%Int32Array%":"undefined"==typeof Int32Array?void 0:Int32Array,"%isFinite%":isFinite,"%isNaN%":isNaN,"%IteratorPrototype%":A?O(O([][Symbol.iterator]())):void 0,"%JSON%":"object"==typeof JSON?JSON:void 0,"%Map%":"undefined"==typeof Map?void 0:Map,"%MapIteratorPrototype%":"undefined"!=typeof Map&&A?O((new Map)[Symbol.iterator]()):void 0,"%Math%":Math,"%Number%":Number,"%Object%":Object,"%parseFloat%":parseFloat,"%parseInt%":parseInt,"%Promise%":"undefined"==typeof Promise?void 0:Promise,"%Proxy%":"undefined"==typeof Proxy?void 0:Proxy,"%RangeError%":RangeError,"%ReferenceError%":ReferenceError,"%Reflect%":"undefined"==typeof Reflect?void 0:Reflect,"%RegExp%":RegExp,"%Set%":"undefined"==typeof Set?void 0:Set,"%SetIteratorPrototype%":"undefined"!=typeof Set&&A?O((new Set)[Symbol.iterator]()):void 0,"%SharedArrayBuffer%":"undefined"==typeof SharedArrayBuffer?void 0:SharedArrayBuffer,"%String%":String,"%StringIteratorPrototype%":A?O(""[Symbol.iterator]()):void 0,"%Symbol%":A?Symbol:void 0,"%SyntaxError%":v,"%ThrowTypeError%":S,"%TypedArray%":P,"%TypeError%":b,"%Uint8Array%":"undefined"==typeof Uint8Array?void 0:Uint8Array,"%Uint8ClampedArray%":"undefined"==typeof Uint8ClampedArray?void 0:Uint8ClampedArray,"%Uint16Array%":"undefined"==typeof Uint16Array?void 0:Uint16Array,"%Uint32Array%":"undefined"==typeof Uint32Array?void 0:Uint32Array,"%URIError%":URIError,"%WeakMap%":"undefined"==typeof WeakMap?void 0:WeakMap,"%WeakRef%":"undefined"==typeof WeakRef?void 0:WeakRef,"%WeakSet%":"undefined"==typeof WeakSet?void 0:WeakSet},R=function t(r){var e;if("%AsyncFunction%"===r)e=h("async function () {}");else if("%GeneratorFunction%"===r)e=h("function* () {}");else if("%AsyncGeneratorFunction%"===r)e=h("async function* () {}");else if("%AsyncGenerator%"===r){var n=t("%AsyncGeneratorFunction%");n&&(e=n.prototype)}else if("%AsyncIteratorPrototype%"===r){var o=t("%AsyncGenerator%");o&&(e=O(o.prototype))}return E[r]=e,e},F={"%ArrayBufferPrototype%":["ArrayBuffer","prototype"],"%ArrayPrototype%":["Array","prototype"],"%ArrayProto_entries%":["Array","prototype","entries"],"%ArrayProto_forEach%":["Array","prototype","forEach"],"%ArrayProto_keys%":["Array","prototype","keys"],"%ArrayProto_values%":["Array","prototype","values"],"%AsyncFunctionPrototype%":["AsyncFunction","prototype"],"%AsyncGenerator%":["AsyncGeneratorFunction","prototype"],"%AsyncGeneratorPrototype%":["AsyncGeneratorFunction","prototype","prototype"],"%BooleanPrototype%":["Boolean","prototype"],"%DataViewPrototype%":["DataView","prototype"],"%DatePrototype%":["Date","prototype"],"%ErrorPrototype%":["Error","prototype"],"%EvalErrorPrototype%":["EvalError","prototype"],"%Float32ArrayPrototype%":["Float32Array","prototype"],"%Float64ArrayPrototype%":["Float64Array","prototype"],"%FunctionPrototype%":["Function","prototype"],"%Generator%":["GeneratorFunction","prototype"],"%GeneratorPrototype%":["GeneratorFunction","prototype","prototype"],"%Int8ArrayPrototype%":["Int8Array","prototype"],"%Int16ArrayPrototype%":["Int16Array","prototype"],"%Int32ArrayPrototype%":["Int32Array","prototype"],"%JSONParse%":["JSON","parse"],"%JSONStringify%":["JSON","stringify"],"%MapPrototype%":["Map","prototype"],"%NumberPrototype%":["Number","prototype"],"%ObjectPrototype%":["Object","prototype"],"%ObjProto_toString%":["Object","prototype","toString"],"%ObjProto_valueOf%":["Object","prototype","valueOf"],"%PromisePrototype%":["Promise","prototype"],"%PromiseProto_then%":["Promise","prototype","then"],"%Promise_all%":["Promise","all"],"%Promise_reject%":["Promise","reject"],"%Promise_resolve%":["Promise","resolve"],"%RangeErrorPrototype%":["RangeError","prototype"],"%ReferenceErrorPrototype%":["ReferenceError","prototype"],"%RegExpPrototype%":["RegExp","prototype"],"%SetPrototype%":["Set","prototype"],"%SharedArrayBufferPrototype%":["SharedArrayBuffer","prototype"],"%StringPrototype%":["String","prototype"],"%SymbolPrototype%":["Symbol","prototype"],"%SyntaxErrorPrototype%":["SyntaxError","prototype"],"%TypedArrayPrototype%":["TypedArray","prototype"],"%TypeErrorPrototype%":["TypeError","prototype"],"%Uint8ArrayPrototype%":["Uint8Array","prototype"],"%Uint8ClampedArrayPrototype%":["Uint8ClampedArray","prototype"],"%Uint16ArrayPrototype%":["Uint16Array","prototype"],"%Uint32ArrayPrototype%":["Uint32Array","prototype"],"%URIErrorPrototype%":["URIError","prototype"],"%WeakMapPrototype%":["WeakMap","prototype"],"%WeakSetPrototype%":["WeakSet","prototype"]},I=l.call(Function.call,Array.prototype.concat),k=l.call(Function.apply,Array.prototype.splice),M=l.call(Function.call,String.prototype.replace),x=l.call(Function.call,String.prototype.slice),U=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,W=/\\(\\)?/g,N=function(t){var r=x(t,0,1),e=x(t,-1);if("%"===r&&"%"!==e)throw new v("invalid intrinsic syntax, expected closing `%`");if("%"===e&&"%"!==r)throw new v("invalid intrinsic syntax, expected opening `%`");var n=[];return M(t,U,function(t,r,e,o){n[n.length]=e?M(o,W,"$1"):r||t}),n},B=function(t,r){var e,n=t;if(s(F,n)&&(n="%"+(e=F[n])[0]+"%"),s(E,n)){var o=E[n];if(o===w&&(o=R(n)),void 0===o&&!r)throw new b("intrinsic "+t+" exists, but is not available. Please file an issue!");return{alias:e,name:n,value:o}}throw new v("intrinsic "+t+" does not exist!")},T=function(t,r){if("string"!=typeof t||0===t.length)throw new b("intrinsic name must be a non-empty string");if(arguments.length>1&&"boolean"!=typeof r)throw new b('"allowMissing" argument must be a boolean');var e=N(t),n=e.length>0?e[0]:"",o=B("%"+n+"%",r),i=o.name,u=o.value,f=!1,a=o.alias;a&&(n=a[0],k(e,I([0,1],a)));for(var c=1,y=!0;c<e.length;c+=1){var p=e[c],l=x(p,0,1),d=x(p,-1);if(('"'===l||"'"===l||"`"===l||'"'===d||"'"===d||"`"===d)&&l!==d)throw new v("property names with quotes must have matching quotes");if("constructor"!==p&&y||(f=!0),s(E,i="%"+(n+="."+p)+"%"))u=E[i];else if(null!=u){if(!(p in u)){if(!r)throw new b("base intrinsic for "+t+" exists, but the property is not available.");return}if(m&&c+1>=e.length){var h=m(u,p);u=(y=!!h)&&"get"in h&&!("originalValue"in h.get)?h.get:u[p]}else y=s(u,p),u=u[p];y&&!f&&(E[i]=u)}}return u},C=(function(t){var r=T("%Function.prototype.apply%"),e=T("%Function.prototype.call%"),n=T("%Reflect.apply%",!0)||l.call(e,r),o=T("%Object.getOwnPropertyDescriptor%",!0),i=T("%Object.defineProperty%",!0),u=T("%Math.max%");if(i)try{i({},"a",{value:1})}catch(t){i=null}t.exports=function(t){var r=n(l,e,arguments);if(o&&i){var f=o(r,"length");f.configurable&&i(r,"length",{value:1+u(0,t.length-(arguments.length-1))})}return r};var f=function(){return n(l,r,arguments)};i?i(t.exports,"apply",{value:f}):t.exports.apply=f}(g={exports:{}}),g.exports),D=C(T("String.prototype.indexOf")),$=function(t,r){var e=T(t,!!r);return"function"==typeof e&&D(t,".prototype.")>-1?C(e):e},G="function"==typeof Map&&Map.prototype,_=Object.getOwnPropertyDescriptor&&G?Object.getOwnPropertyDescriptor(Map.prototype,"size"):null,q=G&&_&&"function"==typeof _.get?_.get:null,V=G&&Map.prototype.forEach,z="function"==typeof Set&&Set.prototype,J=Object.getOwnPropertyDescriptor&&z?Object.getOwnPropertyDescriptor(Set.prototype,"size"):null,L=z&&J&&"function"==typeof J.get?J.get:null,H=z&&Set.prototype.forEach,Q="function"==typeof WeakMap&&WeakMap.prototype?WeakMap.prototype.has:null,Z="function"==typeof WeakSet&&WeakSet.prototype?WeakSet.prototype.has:null,K="function"==typeof WeakRef&&WeakRef.prototype?WeakRef.prototype.deref:null,X=Boolean.prototype.valueOf,Y=Object.prototype.toString,tt=Function.prototype.toString,rt=String.prototype.match,et="function"==typeof BigInt?BigInt.prototype.valueOf:null,nt=Object.getOwnPropertySymbols,ot="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?Symbol.prototype.toString:null,it="function"==typeof Symbol&&"object"==typeof Symbol.iterator,ut=Object.prototype.propertyIsEnumerable,ft=("function"==typeof Reflect?Reflect.getPrototypeOf:Object.getPrototypeOf)||([].__proto__===Array.prototype?function(t){return t.__proto__}:null),at={__proto__:null,default:{}}.custom,ct=at&&dt(at)?at:null,yt="function"==typeof Symbol&&void 0!==Symbol.toStringTag?Symbol.toStringTag:null,pt=function t(r,e,n,o){var i=e||{};if(ht(i,"quoteStyle")&&"single"!==i.quoteStyle&&"double"!==i.quoteStyle)throw new TypeError('option "quoteStyle" must be "single" or "double"');if(ht(i,"maxStringLength")&&("number"==typeof i.maxStringLength?i.maxStringLength<0&&Infinity!==i.maxStringLength:null!==i.maxStringLength))throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');var u=!ht(i,"customInspect")||i.customInspect;if("boolean"!=typeof u&&"symbol"!==u)throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");if(ht(i,"indent")&&null!==i.indent&&"\t"!==i.indent&&!(parseInt(i.indent,10)===i.indent&&i.indent>0))throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');if(void 0===r)return"undefined";if(null===r)return"null";if("boolean"==typeof r)return r?"true":"false";if("string"==typeof r)return jt(r,i);if("number"==typeof r)return 0===r?Infinity/r>0?"0":"-0":String(r);if("bigint"==typeof r)return String(r)+"n";var f=void 0===i.depth?5:i.depth;if(void 0===n&&(n=0),n>=f&&f>0&&"object"==typeof r)return vt(r)?"[Array]":"[Object]";var a,c=function(t,r){var e;if("\t"===t.indent)e="\t";else{if(!("number"==typeof t.indent&&t.indent>0))return null;e=Array(t.indent+1).join(" ")}return{base:e,prev:Array(r+1).join(e)}}(i,n);if(void 0===o)o=[];else if(gt(o,r)>=0)return"[Circular]";function y(r,e,u){if(e&&(o=o.slice()).push(e),u){var f={depth:i.depth};return ht(i,"quoteStyle")&&(f.quoteStyle=i.quoteStyle),t(r,f,n+1,o)}return t(r,i,n+1,o)}if("function"==typeof r){var p=function(t){if(t.name)return t.name;var r=rt.call(tt.call(t),/^function\s*([\w$]+)/);return r?r[1]:null}(r),l=Et(r,y);return"[Function"+(p?": "+p:" (anonymous)")+"]"+(l.length>0?" { "+l.join(", ")+" }":"")}if(dt(r)){var s=it?String(r).replace(/^(Symbol\(.*\))_[^)]*$/,"$1"):ot.call(r);return"object"!=typeof r||it?s:At(s)}if((a=r)&&"object"==typeof a&&("undefined"!=typeof HTMLElement&&a instanceof HTMLElement||"string"==typeof a.nodeName&&"function"==typeof a.getAttribute)){for(var v="<"+String(r.nodeName).toLowerCase(),d=r.attributes||[],b=0;b<d.length;b++)v+=" "+d[b].name+"="+lt(st(d[b].value),"double",i);return v+=">",r.childNodes&&r.childNodes.length&&(v+="..."),v+"</"+String(r.nodeName).toLowerCase()+">"}if(vt(r)){if(0===r.length)return"[]";var h=Et(r,y);return c&&!function(t){for(var r=0;r<t.length;r++)if(gt(t[r],"\n")>=0)return!1;return!0}(h)?"["+Pt(h,c)+"]":"[ "+h.join(", ")+" ]"}if(function(t){return!("[object Error]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r)){var m=Et(r,y);return 0===m.length?"["+String(r)+"]":"{ ["+String(r)+"] "+m.join(", ")+" }"}if("object"==typeof r&&u){if(ct&&"function"==typeof r[ct])return r[ct]();if("symbol"!==u&&"function"==typeof r.inspect)return r.inspect()}if(function(t){if(!q||!t||"object"!=typeof t)return!1;try{q.call(t);try{L.call(t)}catch(t){return!0}return t instanceof Map}catch(t){}return!1}(r)){var g=[];return V.call(r,function(t,e){g.push(y(e,r,!0)+" => "+y(t,r))}),wt("Map",q.call(r),g,c)}if(function(t){if(!L||!t||"object"!=typeof t)return!1;try{L.call(t);try{q.call(t)}catch(t){return!0}return t instanceof Set}catch(t){}return!1}(r)){var j=[];return H.call(r,function(t){j.push(y(t,r))}),wt("Set",L.call(r),j,c)}if(function(t){if(!Q||!t||"object"!=typeof t)return!1;try{Q.call(t,Q);try{Z.call(t,Z)}catch(t){return!0}return t instanceof WeakMap}catch(t){}return!1}(r))return Ot("WeakMap");if(function(t){if(!Z||!t||"object"!=typeof t)return!1;try{Z.call(t,Z);try{Q.call(t,Q)}catch(t){return!0}return t instanceof WeakSet}catch(t){}return!1}(r))return Ot("WeakSet");if(function(t){if(!K||!t||"object"!=typeof t)return!1;try{return K.call(t),!0}catch(t){}return!1}(r))return Ot("WeakRef");if(function(t){return!("[object Number]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r))return At(y(Number(r)));if(function(t){if(!t||"object"!=typeof t||!et)return!1;try{return et.call(t),!0}catch(t){}return!1}(r))return At(y(et.call(r)));if(function(t){return!("[object Boolean]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r))return At(X.call(r));if(function(t){return!("[object String]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r))return At(y(String(r)));if(!function(t){return!("[object Date]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r)&&!function(t){return!("[object RegExp]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}(r)){var S=Et(r,y),A=ft?ft(r)===Object.prototype:r instanceof Object||r.constructor===Object,O=r instanceof Object?"":"null prototype",w=!A&&yt&&Object(r)===r&&yt in r?mt(r).slice(8,-1):O?"Object":"",P=(A||"function"!=typeof r.constructor?"":r.constructor.name?r.constructor.name+" ":"")+(w||O?"["+[].concat(w||[],O||[]).join(": ")+"] ":"");return 0===S.length?P+"{}":c?P+"{"+Pt(S,c)+"}":P+"{ "+S.join(", ")+" }"}return String(r)};function lt(t,r,e){var n="double"===(e.quoteStyle||r)?'"':"'";return n+t+n}function st(t){return String(t).replace(/"/g,"&quot;")}function vt(t){return!("[object Array]"!==mt(t)||yt&&"object"==typeof t&&yt in t)}function dt(t){if(it)return t&&"object"==typeof t&&t instanceof Symbol;if("symbol"==typeof t)return!0;if(!t||"object"!=typeof t||!ot)return!1;try{return ot.call(t),!0}catch(t){}return!1}var bt=Object.prototype.hasOwnProperty||function(t){return t in this};function ht(t,r){return bt.call(t,r)}function mt(t){return Y.call(t)}function gt(t,r){if(t.indexOf)return t.indexOf(r);for(var e=0,n=t.length;e<n;e++)if(t[e]===r)return e;return-1}function jt(t,r){if(t.length>r.maxStringLength){var e=t.length-r.maxStringLength,n="... "+e+" more character"+(e>1?"s":"");return jt(t.slice(0,r.maxStringLength),r)+n}return lt(t.replace(/(['\\])/g,"\\$1").replace(/[\x00-\x1f]/g,St),"single",r)}function St(t){var r=t.charCodeAt(0),e={8:"b",9:"t",10:"n",12:"f",13:"r"}[r];return e?"\\"+e:"\\x"+(r<16?"0":"")+r.toString(16).toUpperCase()}function At(t){return"Object("+t+")"}function Ot(t){return t+" { ? }"}function wt(t,r,e,n){return t+" ("+r+") {"+(n?Pt(e,n):e.join(", "))+"}"}function Pt(t,r){if(0===t.length)return"";var e="\n"+r.prev+r.base;return e+t.join(","+e)+"\n"+r.prev}function Et(t,r){var e=vt(t),n=[];if(e){n.length=t.length;for(var o=0;o<t.length;o++)n[o]=ht(t,o)?r(t[o],t):""}var i,u="function"==typeof nt?nt(t):[];if(it){i={};for(var f=0;f<u.length;f++)i["$"+u[f]]=u[f]}for(var a in t)ht(t,a)&&(e&&String(Number(a))===a&&a<t.length||it&&i["$"+a]instanceof Symbol||(/[^\w$]/.test(a)?n.push(r(a,t)+": "+r(t[a],t)):n.push(a+": "+r(t[a],t))));if("function"==typeof nt)for(var c=0;c<u.length;c++)ut.call(t,u[c])&&n.push("["+r(u[c])+"]: "+r(t[u[c]],t));return n}var Rt=T("%TypeError%"),Ft=T("%WeakMap%",!0),It=T("%Map%",!0),kt=$("WeakMap.prototype.get",!0),Mt=$("WeakMap.prototype.set",!0),xt=$("WeakMap.prototype.has",!0),Ut=$("Map.prototype.get",!0),Wt=$("Map.prototype.set",!0),Nt=$("Map.prototype.has",!0),Bt=function(t,r){for(var e,n=t;null!==(e=n.next);n=e)if(e.key===r)return n.next=e.next,e.next=t.next,t.next=e,e},Tt=function(){var t,r,e,n={assert:function(t){if(!n.has(t))throw new Rt("Side channel does not contain "+pt(t))},get:function(n){if(Ft&&n&&("object"==typeof n||"function"==typeof n)){if(t)return kt(t,n)}else if(It){if(r)return Ut(r,n)}else if(e)return function(t,r){var e=Bt(t,r);return e&&e.value}(e,n)},has:function(n){if(Ft&&n&&("object"==typeof n||"function"==typeof n)){if(t)return xt(t,n)}else if(It){if(r)return Nt(r,n)}else if(e)return function(t,r){return!!Bt(t,r)}(e,n);return!1},set:function(n,o){Ft&&n&&("object"==typeof n||"function"==typeof n)?(t||(t=new Ft),Mt(t,n,o)):It?(r||(r=new It),Wt(r,n,o)):(e||(e={key:{},next:null}),function(t,r,e){var n=Bt(t,r);n?n.value=e:t.next={key:r,next:t.next,value:e}}(e,n,o))}};return n},Ct=String.prototype.replace,Dt=/%20/g,$t={default:"RFC3986",formatters:{RFC1738:function(t){return Ct.call(t,Dt,"+")},RFC3986:function(t){return String(t)}},RFC1738:"RFC1738",RFC3986:"RFC3986"},Gt=Object.prototype.hasOwnProperty,_t=Array.isArray,qt=function(){for(var t=[],r=0;r<256;++r)t.push("%"+((r<16?"0":"")+r.toString(16)).toUpperCase());return t}(),Vt=function(t,r){for(var e=r&&r.plainObjects?Object.create(null):{},n=0;n<t.length;++n)void 0!==t[n]&&(e[n]=t[n]);return e},zt={arrayToObject:Vt,assign:function(t,r){return Object.keys(r).reduce(function(t,e){return t[e]=r[e],t},t)},combine:function(t,r){return[].concat(t,r)},compact:function(t){for(var r=[{obj:{o:t},prop:"o"}],e=[],n=0;n<r.length;++n)for(var o=r[n],i=o.obj[o.prop],u=Object.keys(i),f=0;f<u.length;++f){var a=u[f],c=i[a];"object"==typeof c&&null!==c&&-1===e.indexOf(c)&&(r.push({obj:i,prop:a}),e.push(c))}return function(t){for(;t.length>1;){var r=t.pop(),e=r.obj[r.prop];if(_t(e)){for(var n=[],o=0;o<e.length;++o)void 0!==e[o]&&n.push(e[o]);r.obj[r.prop]=n}}}(r),t},decode:function(t,r,e){var n=t.replace(/\+/g," ");if("iso-8859-1"===e)return n.replace(/%[0-9a-f]{2}/gi,unescape);try{return decodeURIComponent(n)}catch(t){return n}},encode:function(t,r,e,n,o){if(0===t.length)return t;var i=t;if("symbol"==typeof t?i=Symbol.prototype.toString.call(t):"string"!=typeof t&&(i=String(t)),"iso-8859-1"===e)return escape(i).replace(/%u[0-9a-f]{4}/gi,function(t){return"%26%23"+parseInt(t.slice(2),16)+"%3B"});for(var u="",f=0;f<i.length;++f){var a=i.charCodeAt(f);45===a||46===a||95===a||126===a||a>=48&&a<=57||a>=65&&a<=90||a>=97&&a<=122||o===$t.RFC1738&&(40===a||41===a)?u+=i.charAt(f):a<128?u+=qt[a]:a<2048?u+=qt[192|a>>6]+qt[128|63&a]:a<55296||a>=57344?u+=qt[224|a>>12]+qt[128|a>>6&63]+qt[128|63&a]:(a=65536+((1023&a)<<10|1023&i.charCodeAt(f+=1)),u+=qt[240|a>>18]+qt[128|a>>12&63]+qt[128|a>>6&63]+qt[128|63&a])}return u},isBuffer:function(t){return!(!t||"object"!=typeof t||!(t.constructor&&t.constructor.isBuffer&&t.constructor.isBuffer(t)))},isRegExp:function(t){return"[object RegExp]"===Object.prototype.toString.call(t)},maybeMap:function(t,r){if(_t(t)){for(var e=[],n=0;n<t.length;n+=1)e.push(r(t[n]));return e}return r(t)},merge:function t(r,e,n){if(!e)return r;if("object"!=typeof e){if(_t(r))r.push(e);else{if(!r||"object"!=typeof r)return[r,e];(n&&(n.plainObjects||n.allowPrototypes)||!Gt.call(Object.prototype,e))&&(r[e]=!0)}return r}if(!r||"object"!=typeof r)return[r].concat(e);var o=r;return _t(r)&&!_t(e)&&(o=Vt(r,n)),_t(r)&&_t(e)?(e.forEach(function(e,o){if(Gt.call(r,o)){var i=r[o];i&&"object"==typeof i&&e&&"object"==typeof e?r[o]=t(i,e,n):r.push(e)}else r[o]=e}),r):Object.keys(e).reduce(function(r,o){var i=e[o];return r[o]=Gt.call(r,o)?t(r[o],i,n):i,r},o)}},Jt=Object.prototype.hasOwnProperty,Lt={brackets:function(t){return t+"[]"},comma:"comma",indices:function(t,r){return t+"["+r+"]"},repeat:function(t){return t}},Ht=Array.isArray,Qt=Array.prototype.push,Zt=function(t,r){Qt.apply(t,Ht(r)?r:[r])},Kt=Date.prototype.toISOString,Xt=$t.default,Yt={addQueryPrefix:!1,allowDots:!1,charset:"utf-8",charsetSentinel:!1,delimiter:"&",encode:!0,encoder:zt.encode,encodeValuesOnly:!1,format:Xt,formatter:$t.formatters[Xt],indices:!1,serializeDate:function(t){return Kt.call(t)},skipNulls:!1,strictNullHandling:!1},tr=function t(r,e,n,o,i,u,f,a,c,y,p,l,s,v,d){var b,h=r;if(d.has(r))throw new RangeError("Cyclic object value");if("function"==typeof f?h=f(e,h):h instanceof Date?h=y(h):"comma"===n&&Ht(h)&&(h=zt.maybeMap(h,function(t){return t instanceof Date?y(t):t})),null===h){if(o)return u&&!s?u(e,Yt.encoder,v,"key",p):e;h=""}if("string"==typeof(b=h)||"number"==typeof b||"boolean"==typeof b||"symbol"==typeof b||"bigint"==typeof b||zt.isBuffer(h))return u?[l(s?e:u(e,Yt.encoder,v,"key",p))+"="+l(u(h,Yt.encoder,v,"value",p))]:[l(e)+"="+l(String(h))];var m,g=[];if(void 0===h)return g;if("comma"===n&&Ht(h))m=[{value:h.length>0?h.join(",")||null:void 0}];else if(Ht(f))m=f;else{var j=Object.keys(h);m=a?j.sort(a):j}for(var S=0;S<m.length;++S){var A=m[S],O="object"==typeof A&&void 0!==A.value?A.value:h[A];if(!i||null!==O){var w=Ht(h)?"function"==typeof n?n(e,A):e:e+(c?"."+A:"["+A+"]");d.set(r,!0);var P=Tt();Zt(g,t(O,w,n,o,i,u,f,a,c,y,p,l,s,v,P))}}return g},rr=Object.prototype.hasOwnProperty,er=Array.isArray,nr={allowDots:!1,allowPrototypes:!1,allowSparse:!1,arrayLimit:20,charset:"utf-8",charsetSentinel:!1,comma:!1,decoder:zt.decode,delimiter:"&",depth:5,ignoreQueryPrefix:!1,interpretNumericEntities:!1,parameterLimit:1e3,parseArrays:!0,plainObjects:!1,strictNullHandling:!1},or=function(t){return t.replace(/&#(\d+);/g,function(t,r){return String.fromCharCode(parseInt(r,10))})},ir=function(t,r){return t&&"string"==typeof t&&r.comma&&t.indexOf(",")>-1?t.split(","):t},ur=function(t,r,e,n){if(t){var o=e.allowDots?t.replace(/\.([^.[]+)/g,"[$1]"):t,i=/(\[[^[\]]*])/g,u=e.depth>0&&/(\[[^[\]]*])/.exec(o),f=u?o.slice(0,u.index):o,a=[];if(f){if(!e.plainObjects&&rr.call(Object.prototype,f)&&!e.allowPrototypes)return;a.push(f)}for(var c=0;e.depth>0&&null!==(u=i.exec(o))&&c<e.depth;){if(c+=1,!e.plainObjects&&rr.call(Object.prototype,u[1].slice(1,-1))&&!e.allowPrototypes)return;a.push(u[1])}return u&&a.push("["+o.slice(u.index)+"]"),function(t,r,e,n){for(var o=n?r:ir(r,e),i=t.length-1;i>=0;--i){var u,f=t[i];if("[]"===f&&e.parseArrays)u=[].concat(o);else{u=e.plainObjects?Object.create(null):{};var a="["===f.charAt(0)&&"]"===f.charAt(f.length-1)?f.slice(1,-1):f,c=parseInt(a,10);e.parseArrays||""!==a?!isNaN(c)&&f!==a&&String(c)===a&&c>=0&&e.parseArrays&&c<=e.arrayLimit?(u=[])[c]=o:u[a]=o:u={0:o}}o=u}return o}(a,r,e,n)}},fr=function(){function t(t,r,e){var n;this.name=t,this.definition=r,this.bindings=null!=(n=r.bindings)?n:{},this.config=e}var e=t.prototype;return e.matchesUrl=function(t){if(!this.definition.methods.includes("GET"))return!1;var r=this.template.replace(/\/{[^}?]*\?}/g,"(/[^/?]+)?").replace(/{[^}]+}/g,"[^/?]+").replace(/^\w+:\/\//,"");return new RegExp("^"+r+"$").test(t.replace(/\/+$/,"").split("?").shift())},e.compile=function(t){var r=this;return this.parameterSegments.length?this.template.replace(/{([^}?]+)\??}/g,function(e,n){var o;if([null,void 0].includes(t[n])&&r.parameterSegments.find(function(t){return t.name===n}).required)throw new Error("Ziggy error: '"+n+"' parameter is required for route '"+r.name+"'.");return encodeURIComponent(null!=(o=t[n])?o:"")}).replace(/\/+$/,""):this.template},r(t,[{key:"template",get:function(){return((this.config.absolute?this.definition.domain?""+this.config.url.match(/^\w+:\/\//)[0]+this.definition.domain+(this.config.port?":"+this.config.port:""):this.config.url:"")+"/"+this.definition.uri).replace(/\/+$/,"")}},{key:"parameterSegments",get:function(){var t,r;return null!=(t=null==(r=this.template.match(/{[^}?]+\??}/g))?void 0:r.map(function(t){return{name:t.replace(/{|\??}/g,""),required:!/\?}$/.test(t)}}))?t:[]}}]),t}(),ar=function(t){var n,i;function u(r,n,o,i){var u,f;if(void 0===o&&(o=!0),(f=t.call(this)||this).t=null!=(u=null!=i?i:Ziggy)?u:null==globalThis?void 0:globalThis.Ziggy,f.t=e({},f.t,{absolute:o}),r){if(!f.t.routes[r])throw new Error("Ziggy error: route '"+r+"' is not in the route list.");f.i=new fr(r,f.t.routes[r],f.t),f.u=f.p(n)}return f}i=t,(n=u).prototype=Object.create(i.prototype),n.prototype.constructor=n,o(n,i);var f=u.prototype;return f.toString=function(){var t=this,r=Object.keys(this.u).filter(function(r){return!t.i.parameterSegments.some(function(t){return t.name===r})}).filter(function(t){return"_query"!==t}).reduce(function(r,n){var o;return e({},r,((o={})[n]=t.u[n],o))},{});return this.i.compile(this.u)+function(t,r){var e,n=t,o=function(t){if(!t)return Yt;if(null!=t.encoder&&"function"!=typeof t.encoder)throw new TypeError("Encoder has to be a function.");var r=t.charset||Yt.charset;if(void 0!==t.charset&&"utf-8"!==t.charset&&"iso-8859-1"!==t.charset)throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");var e=$t.default;if(void 0!==t.format){if(!Jt.call($t.formatters,t.format))throw new TypeError("Unknown format option provided.");e=t.format}var n=$t.formatters[e],o=Yt.filter;return("function"==typeof t.filter||Ht(t.filter))&&(o=t.filter),{addQueryPrefix:"boolean"==typeof t.addQueryPrefix?t.addQueryPrefix:Yt.addQueryPrefix,allowDots:void 0===t.allowDots?Yt.allowDots:!!t.allowDots,charset:r,charsetSentinel:"boolean"==typeof t.charsetSentinel?t.charsetSentinel:Yt.charsetSentinel,delimiter:void 0===t.delimiter?Yt.delimiter:t.delimiter,encode:"boolean"==typeof t.encode?t.encode:Yt.encode,encoder:"function"==typeof t.encoder?t.encoder:Yt.encoder,encodeValuesOnly:"boolean"==typeof t.encodeValuesOnly?t.encodeValuesOnly:Yt.encodeValuesOnly,filter:o,format:e,formatter:n,serializeDate:"function"==typeof t.serializeDate?t.serializeDate:Yt.serializeDate,skipNulls:"boolean"==typeof t.skipNulls?t.skipNulls:Yt.skipNulls,sort:"function"==typeof t.sort?t.sort:null,strictNullHandling:"boolean"==typeof t.strictNullHandling?t.strictNullHandling:Yt.strictNullHandling}}(r);"function"==typeof o.filter?n=(0,o.filter)("",n):Ht(o.filter)&&(e=o.filter);var i=[];if("object"!=typeof n||null===n)return"";var u=Lt[r&&r.arrayFormat in Lt?r.arrayFormat:r&&"indices"in r?r.indices?"indices":"repeat":"indices"];e||(e=Object.keys(n)),o.sort&&e.sort(o.sort);for(var f=Tt(),a=0;a<e.length;++a){var c=e[a];o.skipNulls&&null===n[c]||Zt(i,tr(n[c],c,u,o.strictNullHandling,o.skipNulls,o.encode?o.encoder:null,o.filter,o.sort,o.allowDots,o.serializeDate,o.format,o.formatter,o.encodeValuesOnly,o.charset,f))}var y=i.join(o.delimiter),p=!0===o.addQueryPrefix?"?":"";return o.charsetSentinel&&(p+="iso-8859-1"===o.charset?"utf8=%26%2310003%3B&":"utf8=%E2%9C%93&"),y.length>0?p+y:""}(e({},r,this.u._query),{addQueryPrefix:!0,arrayFormat:"indices",encodeValuesOnly:!0,skipNulls:!0,encoder:function(t,r){return"boolean"==typeof t?Number(t):r(t)}})},f.current=function(t,r){var e=this,n=this.t.absolute?this.l().host+this.l().pathname:this.l().pathname.replace(this.t.url.replace(/^\w*:\/\/[^/]+/,""),"").replace(/^\/+/,"/"),o=Object.entries(this.t.routes).find(function(r){return new fr(t,r[1],e.t).matchesUrl(n)})||[void 0,void 0],i=o[0],u=o[1];if(!t)return i;var f=new RegExp("^"+t.replace(".","\\.").replace("*",".*")+"$").test(i);if([null,void 0].includes(r)||!f)return f;var a=new fr(i,u,this.t);r=this.p(r,a);var c=this.v(u);return!(!Object.values(r).every(function(t){return!t})||Object.values(c).length)||Object.entries(r).every(function(t){return c[t[0]]==t[1]})},f.l=function(){var t,r,e,n,o,i,u="undefined"!=typeof window?window.location:{},f=u.host,a=u.pathname,c=u.search;return{host:null!=(t=null==(r=this.t.location)?void 0:r.host)?t:void 0===f?"":f,pathname:null!=(e=null==(n=this.t.location)?void 0:n.pathname)?e:void 0===a?"":a,search:null!=(o=null==(i=this.t.location)?void 0:i.search)?o:void 0===c?"":c}},f.has=function(t){return Object.keys(this.t.routes).includes(t)},f.p=function(t,r){var n=this;void 0===t&&(t={}),void 0===r&&(r=this.i),t=["string","number"].includes(typeof t)?[t]:t;var o=r.parameterSegments.filter(function(t){return!n.t.defaults[t.name]});if(Array.isArray(t))t=t.reduce(function(t,r,n){var i,u;return e({},t,o[n]?((i={})[o[n].name]=r,i):((u={})[r]="",u))},{});else if(1===o.length&&!t[o[0].name]&&(t.hasOwnProperty(Object.values(r.bindings)[0])||t.hasOwnProperty("id"))){var i;(i={})[o[0].name]=t,t=i}return e({},this.h(r),this.m(t,r))},f.h=function(t){var r=this;return t.parameterSegments.filter(function(t){return r.t.defaults[t.name]}).reduce(function(t,n,o){var i,u=n.name;return e({},t,((i={})[u]=r.t.defaults[u],i))},{})},f.m=function(t,r){var n=r.bindings,o=r.parameterSegments;return Object.entries(t).reduce(function(t,r){var i,u,f=r[0],a=r[1];if(!a||"object"!=typeof a||Array.isArray(a)||!o.some(function(t){return t.name===f}))return e({},t,((u={})[f]=a,u));if(!a.hasOwnProperty(n[f])){if(!a.hasOwnProperty("id"))throw new Error("Ziggy error: object passed as '"+f+"' parameter is missing route model binding key '"+n[f]+"'.");n[f]="id"}return e({},t,((i={})[f]=a[n[f]],i))},{})},f.v=function(t){var r,n=this.l().pathname.replace(this.t.url.replace(/^\w*:\/\/[^/]+/,""),"").replace(/^\/+/,""),o=function(t,r,n){void 0===r&&(r="");var o=[t,r].map(function(t){return t.split(n)}),i=o[0];return o[1].reduce(function(t,r,n){var o;return/^{[^}?]+\??}$/.test(r)&&i[n]?e({},t,((o={})[r.replace(/^{|\??}$/g,"")]=i[n],o)):t},{})};return e({},o(this.l().host,t.domain,"."),o(n,t.uri,"/"),function(t,r){var e=nr;if(""===t||null==t)return e.plainObjects?Object.create(null):{};for(var n="string"==typeof t?function(t,r){var e,n={},o=(r.ignoreQueryPrefix?t.replace(/^\?/,""):t).split(r.delimiter,Infinity===r.parameterLimit?void 0:r.parameterLimit),i=-1,u=r.charset;if(r.charsetSentinel)for(e=0;e<o.length;++e)0===o[e].indexOf("utf8=")&&("utf8=%E2%9C%93"===o[e]?u="utf-8":"utf8=%26%2310003%3B"===o[e]&&(u="iso-8859-1"),i=e,e=o.length);for(e=0;e<o.length;++e)if(e!==i){var f,a,c=o[e],y=c.indexOf("]="),p=-1===y?c.indexOf("="):y+1;-1===p?(f=r.decoder(c,nr.decoder,u,"key"),a=r.strictNullHandling?null:""):(f=r.decoder(c.slice(0,p),nr.decoder,u,"key"),a=zt.maybeMap(ir(c.slice(p+1),r),function(t){return r.decoder(t,nr.decoder,u,"value")})),a&&r.interpretNumericEntities&&"iso-8859-1"===u&&(a=or(a)),c.indexOf("[]=")>-1&&(a=er(a)?[a]:a),n[f]=rr.call(n,f)?zt.combine(n[f],a):a}return n}(t,e):t,o=e.plainObjects?Object.create(null):{},i=Object.keys(n),u=0;u<i.length;++u){var f=i[u],a=ur(f,n[f],e,"string"==typeof t);o=zt.merge(o,a,e)}return!0===e.allowSparse?o:zt.compact(o)}(null==(r=this.l().search)?void 0:r.replace(/^\?/,"")))},f.valueOf=function(){return this.toString()},f.check=function(t){return this.has(t)},r(u,[{key:"params",get:function(){return this.v(this.t.routes[this.current()])}}]),u}(f(String)),cr={install:function(t,r){return t.mixin({methods:{route:function(t,e,n,o){return void 0===o&&(o=r),function(t,r,e,n){var o=new ar(t,r,e,n);return t?o.toString():o}(t,e,n,o)}}})}};export{cr as ZiggyVue};
