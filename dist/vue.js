!(function (t, r) {
    "object" == typeof exports && "undefined" != typeof module
        ? r(exports)
        : "function" == typeof define && define.amd
        ? define(["exports"], r)
        : r(((t || self).ZiggyVue = {}));
})(this, function (t) {
    function r(t, r) {
        for (var n = 0; n < r.length; n++) {
            var e = r[n];
            (e.enumerable = e.enumerable || !1),
                (e.configurable = !0),
                "value" in e && (e.writable = !0),
                Object.defineProperty(t, e.key, e);
        }
    }
    function n(t, n, e) {
        return (
            n && r(t.prototype, n),
            e && r(t, e),
            Object.defineProperty(t, "prototype", { writable: !1 }),
            t
        );
    }
    function e() {
        return (
            (e = Object.assign
                ? Object.assign.bind()
                : function (t) {
                      for (var r = 1; r < arguments.length; r++) {
                          var n = arguments[r];
                          for (var e in n)
                              Object.prototype.hasOwnProperty.call(n, e) &&
                                  (t[e] = n[e]);
                      }
                      return t;
                  }),
            e.apply(this, arguments)
        );
    }
    function o(t) {
        return (
            (o = Object.setPrototypeOf
                ? Object.getPrototypeOf.bind()
                : function (t) {
                      return t.__proto__ || Object.getPrototypeOf(t);
                  }),
            o(t)
        );
    }
    function i(t, r) {
        return (
            (i = Object.setPrototypeOf
                ? Object.setPrototypeOf.bind()
                : function (t, r) {
                      return (t.__proto__ = r), t;
                  }),
            i(t, r)
        );
    }
    function u() {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
            return (
                Boolean.prototype.valueOf.call(
                    Reflect.construct(Boolean, [], function () {})
                ),
                !0
            );
        } catch (t) {
            return !1;
        }
    }
    function f(t, r, n) {
        return (
            (f = u()
                ? Reflect.construct.bind()
                : function (t, r, n) {
                      var e = [null];
                      e.push.apply(e, r);
                      var o = new (Function.bind.apply(t, e))();
                      return n && i(o, n.prototype), o;
                  }),
            f.apply(null, arguments)
        );
    }
    function a(t) {
        var r = "function" == typeof Map ? new Map() : void 0;
        return (
            (a = function (t) {
                if (
                    null === t ||
                    -1 === Function.toString.call(t).indexOf("[native code]")
                )
                    return t;
                if ("function" != typeof t)
                    throw new TypeError(
                        "Super expression must either be null or a function"
                    );
                if (void 0 !== r) {
                    if (r.has(t)) return r.get(t);
                    r.set(t, n);
                }
                function n() {
                    return f(t, arguments, o(this).constructor);
                }
                return (
                    (n.prototype = Object.create(t.prototype, {
                        constructor: {
                            value: n,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0,
                        },
                    })),
                    i(n, t)
                );
            }),
            a(t)
        );
    }
    var c = String.prototype.replace,
        l = /%20/g,
        s = "RFC3986",
        p = {
            default: s,
            formatters: {
                RFC1738: function (t) {
                    return c.call(t, l, "+");
                },
                RFC3986: function (t) {
                    return String(t);
                },
            },
            RFC1738: "RFC1738",
            RFC3986: s,
        },
        v = Object.prototype.hasOwnProperty,
        y = Array.isArray,
        d = (function () {
            for (var t = [], r = 0; r < 256; ++r)
                t.push(
                    "%" + ((r < 16 ? "0" : "") + r.toString(16)).toUpperCase()
                );
            return t;
        })(),
        b = function (t, r) {
            for (
                var n = r && r.plainObjects ? Object.create(null) : {}, e = 0;
                e < t.length;
                ++e
            )
                void 0 !== t[e] && (n[e] = t[e]);
            return n;
        },
        h = {
            arrayToObject: b,
            assign: function (t, r) {
                return Object.keys(r).reduce(function (t, n) {
                    return (t[n] = r[n]), t;
                }, t);
            },
            combine: function (t, r) {
                return [].concat(t, r);
            },
            compact: function (t) {
                for (
                    var r = [{ obj: { o: t }, prop: "o" }], n = [], e = 0;
                    e < r.length;
                    ++e
                )
                    for (
                        var o = r[e],
                            i = o.obj[o.prop],
                            u = Object.keys(i),
                            f = 0;
                        f < u.length;
                        ++f
                    ) {
                        var a = u[f],
                            c = i[a];
                        "object" == typeof c &&
                            null !== c &&
                            -1 === n.indexOf(c) &&
                            (r.push({ obj: i, prop: a }), n.push(c));
                    }
                return (
                    (function (t) {
                        for (; t.length > 1; ) {
                            var r = t.pop(),
                                n = r.obj[r.prop];
                            if (y(n)) {
                                for (var e = [], o = 0; o < n.length; ++o)
                                    void 0 !== n[o] && e.push(n[o]);
                                r.obj[r.prop] = e;
                            }
                        }
                    })(r),
                    t
                );
            },
            decode: function (t, r, n) {
                var e = t.replace(/\+/g, " ");
                if ("iso-8859-1" === n)
                    return e.replace(/%[0-9a-f]{2}/gi, unescape);
                try {
                    return decodeURIComponent(e);
                } catch (t) {
                    return e;
                }
            },
            encode: function (t, r, n, e, o) {
                if (0 === t.length) return t;
                var i = t;
                if (
                    ("symbol" == typeof t
                        ? (i = Symbol.prototype.toString.call(t))
                        : "string" != typeof t && (i = String(t)),
                    "iso-8859-1" === n)
                )
                    return escape(i).replace(/%u[0-9a-f]{4}/gi, function (t) {
                        return "%26%23" + parseInt(t.slice(2), 16) + "%3B";
                    });
                for (var u = "", f = 0; f < i.length; ++f) {
                    var a = i.charCodeAt(f);
                    45 === a ||
                    46 === a ||
                    95 === a ||
                    126 === a ||
                    (a >= 48 && a <= 57) ||
                    (a >= 65 && a <= 90) ||
                    (a >= 97 && a <= 122) ||
                    (o === p.RFC1738 && (40 === a || 41 === a))
                        ? (u += i.charAt(f))
                        : a < 128
                        ? (u += d[a])
                        : a < 2048
                        ? (u += d[192 | (a >> 6)] + d[128 | (63 & a)])
                        : a < 55296 || a >= 57344
                        ? (u +=
                              d[224 | (a >> 12)] +
                              d[128 | ((a >> 6) & 63)] +
                              d[128 | (63 & a)])
                        : ((a =
                              65536 +
                              (((1023 & a) << 10) |
                                  (1023 & i.charCodeAt((f += 1))))),
                          (u +=
                              d[240 | (a >> 18)] +
                              d[128 | ((a >> 12) & 63)] +
                              d[128 | ((a >> 6) & 63)] +
                              d[128 | (63 & a)]));
                }
                return u;
            },
            isBuffer: function (t) {
                return !(
                    !t ||
                    "object" != typeof t ||
                    !(
                        t.constructor &&
                        t.constructor.isBuffer &&
                        t.constructor.isBuffer(t)
                    )
                );
            },
            isRegExp: function (t) {
                return "[object RegExp]" === Object.prototype.toString.call(t);
            },
            maybeMap: function (t, r) {
                if (y(t)) {
                    for (var n = [], e = 0; e < t.length; e += 1)
                        n.push(r(t[e]));
                    return n;
                }
                return r(t);
            },
            merge: function t(r, n, e) {
                if (!n) return r;
                if ("object" != typeof n) {
                    if (y(r)) r.push(n);
                    else {
                        if (!r || "object" != typeof r) return [r, n];
                        ((e && (e.plainObjects || e.allowPrototypes)) ||
                            !v.call(Object.prototype, n)) &&
                            (r[n] = !0);
                    }
                    return r;
                }
                if (!r || "object" != typeof r) return [r].concat(n);
                var o = r;
                return (
                    y(r) && !y(n) && (o = b(r, e)),
                    y(r) && y(n)
                        ? (n.forEach(function (n, o) {
                              if (v.call(r, o)) {
                                  var i = r[o];
                                  i &&
                                  "object" == typeof i &&
                                  n &&
                                  "object" == typeof n
                                      ? (r[o] = t(i, n, e))
                                      : r.push(n);
                              } else r[o] = n;
                          }),
                          r)
                        : Object.keys(n).reduce(function (r, o) {
                              var i = n[o];
                              return (
                                  (r[o] = v.call(r, o) ? t(r[o], i, e) : i), r
                              );
                          }, o)
                );
            },
        },
        g = Object.prototype.hasOwnProperty,
        m = {
            brackets: function (t) {
                return t + "[]";
            },
            comma: "comma",
            indices: function (t, r) {
                return t + "[" + r + "]";
            },
            repeat: function (t) {
                return t;
            },
        },
        j = Array.isArray,
        w = String.prototype.split,
        O = Array.prototype.push,
        E = function (t, r) {
            O.apply(t, j(r) ? r : [r]);
        },
        R = Date.prototype.toISOString,
        S = p.default,
        x = {
            addQueryPrefix: !1,
            allowDots: !1,
            charset: "utf-8",
            charsetSentinel: !1,
            delimiter: "&",
            encode: !0,
            encoder: h.encode,
            encodeValuesOnly: !1,
            format: S,
            formatter: p.formatters[S],
            indices: !1,
            serializeDate: function (t) {
                return R.call(t);
            },
            skipNulls: !1,
            strictNullHandling: !1,
        },
        k = function t(r, n, e, o, i, u, f, a, c, l, s, p, v, y) {
            var d,
                b = r;
            if (
                ("function" == typeof f
                    ? (b = f(n, b))
                    : b instanceof Date
                    ? (b = l(b))
                    : "comma" === e &&
                      j(b) &&
                      (b = h.maybeMap(b, function (t) {
                          return t instanceof Date ? l(t) : t;
                      })),
                null === b)
            ) {
                if (o) return u && !v ? u(n, x.encoder, y, "key", s) : n;
                b = "";
            }
            if (
                "string" == typeof (d = b) ||
                "number" == typeof d ||
                "boolean" == typeof d ||
                "symbol" == typeof d ||
                "bigint" == typeof d ||
                h.isBuffer(b)
            ) {
                if (u) {
                    var g = v ? n : u(n, x.encoder, y, "key", s);
                    if ("comma" === e && v) {
                        for (
                            var m = w.call(String(b), ","), O = "", R = 0;
                            R < m.length;
                            ++R
                        )
                            O +=
                                (0 === R ? "" : ",") +
                                p(u(m[R], x.encoder, y, "value", s));
                        return [p(g) + "=" + O];
                    }
                    return [p(g) + "=" + p(u(b, x.encoder, y, "value", s))];
                }
                return [p(n) + "=" + p(String(b))];
            }
            var S,
                k = [];
            if (void 0 === b) return k;
            if ("comma" === e && j(b))
                S = [{ value: b.length > 0 ? b.join(",") || null : void 0 }];
            else if (j(f)) S = f;
            else {
                var T = Object.keys(b);
                S = a ? T.sort(a) : T;
            }
            for (var C = 0; C < S.length; ++C) {
                var N = S[C],
                    D =
                        "object" == typeof N && void 0 !== N.value
                            ? N.value
                            : b[N];
                if (!i || null !== D) {
                    var F = j(b)
                        ? "function" == typeof e
                            ? e(n, N)
                            : n
                        : n + (c ? "." + N : "[" + N + "]");
                    E(k, t(D, F, e, o, i, u, f, a, c, l, s, p, v, y));
                }
            }
            return k;
        },
        T = Object.prototype.hasOwnProperty,
        C = Array.isArray,
        N = {
            allowDots: !1,
            allowPrototypes: !1,
            arrayLimit: 20,
            charset: "utf-8",
            charsetSentinel: !1,
            comma: !1,
            decoder: h.decode,
            delimiter: "&",
            depth: 5,
            ignoreQueryPrefix: !1,
            interpretNumericEntities: !1,
            parameterLimit: 1e3,
            parseArrays: !0,
            plainObjects: !1,
            strictNullHandling: !1,
        },
        D = function (t) {
            return t.replace(/&#(\d+);/g, function (t, r) {
                return String.fromCharCode(parseInt(r, 10));
            });
        },
        F = function (t, r) {
            return t && "string" == typeof t && r.comma && t.indexOf(",") > -1
                ? t.split(",")
                : t;
        },
        I = function (t, r, n, e) {
            if (t) {
                var o = n.allowDots ? t.replace(/\.([^.[]+)/g, "[$1]") : t,
                    i = /(\[[^[\]]*])/g,
                    u = n.depth > 0 && /(\[[^[\]]*])/.exec(o),
                    f = u ? o.slice(0, u.index) : o,
                    a = [];
                if (f) {
                    if (
                        !n.plainObjects &&
                        T.call(Object.prototype, f) &&
                        !n.allowPrototypes
                    )
                        return;
                    a.push(f);
                }
                for (
                    var c = 0;
                    n.depth > 0 && null !== (u = i.exec(o)) && c < n.depth;

                ) {
                    if (
                        ((c += 1),
                        !n.plainObjects &&
                            T.call(Object.prototype, u[1].slice(1, -1)) &&
                            !n.allowPrototypes)
                    )
                        return;
                    a.push(u[1]);
                }
                return (
                    u && a.push("[" + o.slice(u.index) + "]"),
                    (function (t, r, n, e) {
                        for (
                            var o = e ? r : F(r, n), i = t.length - 1;
                            i >= 0;
                            --i
                        ) {
                            var u,
                                f = t[i];
                            if ("[]" === f && n.parseArrays) u = [].concat(o);
                            else {
                                u = n.plainObjects ? Object.create(null) : {};
                                var a =
                                        "[" === f.charAt(0) &&
                                        "]" === f.charAt(f.length - 1)
                                            ? f.slice(1, -1)
                                            : f,
                                    c = parseInt(a, 10);
                                n.parseArrays || "" !== a
                                    ? !isNaN(c) &&
                                      f !== a &&
                                      String(c) === a &&
                                      c >= 0 &&
                                      n.parseArrays &&
                                      c <= n.arrayLimit
                                        ? ((u = [])[c] = o)
                                        : "__proto__" !== a && (u[a] = o)
                                    : (u = { 0: o });
                            }
                            o = u;
                        }
                        return o;
                    })(a, r, n, e)
                );
            }
        },
        $ = function (t, r) {
            var n = (function (t) {
                if (!t) return N;
                if (null != t.decoder && "function" != typeof t.decoder)
                    throw new TypeError("Decoder has to be a function.");
                if (
                    void 0 !== t.charset &&
                    "utf-8" !== t.charset &&
                    "iso-8859-1" !== t.charset
                )
                    throw new TypeError(
                        "The charset option must be either utf-8, iso-8859-1, or undefined"
                    );
                return {
                    allowDots:
                        void 0 === t.allowDots ? N.allowDots : !!t.allowDots,
                    allowPrototypes:
                        "boolean" == typeof t.allowPrototypes
                            ? t.allowPrototypes
                            : N.allowPrototypes,
                    arrayLimit:
                        "number" == typeof t.arrayLimit
                            ? t.arrayLimit
                            : N.arrayLimit,
                    charset: void 0 === t.charset ? N.charset : t.charset,
                    charsetSentinel:
                        "boolean" == typeof t.charsetSentinel
                            ? t.charsetSentinel
                            : N.charsetSentinel,
                    comma: "boolean" == typeof t.comma ? t.comma : N.comma,
                    decoder:
                        "function" == typeof t.decoder ? t.decoder : N.decoder,
                    delimiter:
                        "string" == typeof t.delimiter ||
                        h.isRegExp(t.delimiter)
                            ? t.delimiter
                            : N.delimiter,
                    depth:
                        "number" == typeof t.depth || !1 === t.depth
                            ? +t.depth
                            : N.depth,
                    ignoreQueryPrefix: !0 === t.ignoreQueryPrefix,
                    interpretNumericEntities:
                        "boolean" == typeof t.interpretNumericEntities
                            ? t.interpretNumericEntities
                            : N.interpretNumericEntities,
                    parameterLimit:
                        "number" == typeof t.parameterLimit
                            ? t.parameterLimit
                            : N.parameterLimit,
                    parseArrays: !1 !== t.parseArrays,
                    plainObjects:
                        "boolean" == typeof t.plainObjects
                            ? t.plainObjects
                            : N.plainObjects,
                    strictNullHandling:
                        "boolean" == typeof t.strictNullHandling
                            ? t.strictNullHandling
                            : N.strictNullHandling,
                };
            })(r);
            if ("" === t || null == t)
                return n.plainObjects ? Object.create(null) : {};
            for (
                var e =
                        "string" == typeof t
                            ? (function (t, r) {
                                  var n,
                                      e = {},
                                      o = (
                                          r.ignoreQueryPrefix
                                              ? t.replace(/^\?/, "")
                                              : t
                                      ).split(
                                          r.delimiter,
                                          Infinity === r.parameterLimit
                                              ? void 0
                                              : r.parameterLimit
                                      ),
                                      i = -1,
                                      u = r.charset;
                                  if (r.charsetSentinel)
                                      for (n = 0; n < o.length; ++n)
                                          0 === o[n].indexOf("utf8=") &&
                                              ("utf8=%E2%9C%93" === o[n]
                                                  ? (u = "utf-8")
                                                  : "utf8=%26%2310003%3B" ===
                                                        o[n] &&
                                                    (u = "iso-8859-1"),
                                              (i = n),
                                              (n = o.length));
                                  for (n = 0; n < o.length; ++n)
                                      if (n !== i) {
                                          var f,
                                              a,
                                              c = o[n],
                                              l = c.indexOf("]="),
                                              s =
                                                  -1 === l
                                                      ? c.indexOf("=")
                                                      : l + 1;
                                          -1 === s
                                              ? ((f = r.decoder(
                                                    c,
                                                    N.decoder,
                                                    u,
                                                    "key"
                                                )),
                                                (a = r.strictNullHandling
                                                    ? null
                                                    : ""))
                                              : ((f = r.decoder(
                                                    c.slice(0, s),
                                                    N.decoder,
                                                    u,
                                                    "key"
                                                )),
                                                (a = h.maybeMap(
                                                    F(c.slice(s + 1), r),
                                                    function (t) {
                                                        return r.decoder(
                                                            t,
                                                            N.decoder,
                                                            u,
                                                            "value"
                                                        );
                                                    }
                                                ))),
                                              a &&
                                                  r.interpretNumericEntities &&
                                                  "iso-8859-1" === u &&
                                                  (a = D(a)),
                                              c.indexOf("[]=") > -1 &&
                                                  (a = C(a) ? [a] : a),
                                              (e[f] = T.call(e, f)
                                                  ? h.combine(e[f], a)
                                                  : a);
                                      }
                                  return e;
                              })(t, n)
                            : t,
                    o = n.plainObjects ? Object.create(null) : {},
                    i = Object.keys(e),
                    u = 0;
                u < i.length;
                ++u
            ) {
                var f = i[u],
                    a = I(f, e[f], n, "string" == typeof t);
                o = h.merge(o, a, n);
            }
            return h.compact(o);
        },
        A = /*#__PURE__*/ (function () {
            function t(t, r, n) {
                var e, o;
                (this.name = t),
                    (this.definition = r),
                    (this.bindings = null != (e = r.bindings) ? e : {}),
                    (this.wheres = null != (o = r.wheres) ? o : {}),
                    (this.config = n);
            }
            var r = t.prototype;
            return (
                (r.matchesUrl = function (t) {
                    var r = this;
                    if (!this.definition.methods.includes("GET")) return !1;
                    var n = this.template
                            .replace(
                                /(\/?){([^}?]*)(\??)}/g,
                                function (t, n, e, o) {
                                    var i,
                                        u =
                                            "(?<" +
                                            e +
                                            ">" +
                                            ((null == (i = r.wheres[e])
                                                ? void 0
                                                : i.replace(
                                                      /(^\^)|(\$$)/g,
                                                      ""
                                                  )) || "[^/?]+") +
                                            ")";
                                    return o ? "(" + n + u + ")?" : "" + n + u;
                                }
                            )
                            .replace(/^\w+:\/\//, ""),
                        e = t.replace(/^\w+:\/\//, "").split("?"),
                        o = e[0],
                        i = e[1],
                        u = new RegExp("^" + n + "/?$").exec(o);
                    if (u) {
                        for (var f in u.groups)
                            u.groups[f] =
                                "string" == typeof u.groups[f]
                                    ? decodeURIComponent(u.groups[f])
                                    : u.groups[f];
                        return { params: u.groups, query: $(i) };
                    }
                    return !1;
                }),
                (r.compile = function (t) {
                    var r = this,
                        n = this.parameterSegments;
                    return n.length
                        ? this.template
                              .replace(/{([^}?]+)(\??)}/g, function (e, o, i) {
                                  var u, f, a;
                                  if (!i && [null, void 0].includes(t[o]))
                                      throw new Error(
                                          "Ziggy error: '" +
                                              o +
                                              "' parameter is required for route '" +
                                              r.name +
                                              "'."
                                      );
                                  if (
                                      n[n.length - 1].name === o &&
                                      ".*" === r.wheres[o]
                                  )
                                      return encodeURIComponent(
                                          null != (a = t[o]) ? a : ""
                                      ).replace(/%2F/g, "/");
                                  if (
                                      r.wheres[o] &&
                                      !new RegExp(
                                          "^" +
                                              (i
                                                  ? "(" + r.wheres[o] + ")?"
                                                  : r.wheres[o]) +
                                              "$"
                                      ).test(null != (u = t[o]) ? u : "")
                                  )
                                      throw new Error(
                                          "Ziggy error: '" +
                                              o +
                                              "' parameter does not match required format '" +
                                              r.wheres[o] +
                                              "' for route '" +
                                              r.name +
                                              "'."
                                      );
                                  return encodeURIComponent(
                                      null != (f = t[o]) ? f : ""
                                  );
                              })
                              .replace(this.origin + "//", this.origin + "/")
                              .replace(/\/+$/, "")
                        : this.template;
                }),
                n(t, [
                    {
                        key: "template",
                        get: function () {
                            return (
                                this.origin +
                                "/" +
                                this.definition.uri
                            ).replace(/\/+$/, "");
                        },
                    },
                    {
                        key: "origin",
                        get: function () {
                            return this.config.absolute
                                ? this.definition.domain
                                    ? "" +
                                      this.config.url.match(/^\w+:\/\//)[0] +
                                      this.definition.domain +
                                      (this.config.port
                                          ? ":" + this.config.port
                                          : "")
                                    : this.config.url
                                : "";
                        },
                    },
                    {
                        key: "parameterSegments",
                        get: function () {
                            var t, r;
                            return null !=
                                (t =
                                    null ==
                                    (r = this.template.match(/{[^}?]+\??}/g))
                                        ? void 0
                                        : r.map(function (t) {
                                              return {
                                                  name: t.replace(
                                                      /{|\??}/g,
                                                      ""
                                                  ),
                                                  required: !/\?}$/.test(t),
                                              };
                                          }))
                                ? t
                                : [];
                        },
                    },
                ]),
                t
            );
        })(),
        P = /*#__PURE__*/ (function (t) {
            var r, o;
            function u(r, n, o, i) {
                var u;
                if (
                    (void 0 === o && (o = !0),
                    ((u = t.call(this) || this).t =
                        null != i
                            ? i
                            : "undefined" != typeof Ziggy
                            ? Ziggy
                            : null == globalThis
                            ? void 0
                            : globalThis.Ziggy),
                    (u.t = e({}, u.t, { absolute: o })),
                    r)
                ) {
                    if (!u.t.routes[r])
                        throw new Error(
                            "Ziggy error: route '" +
                                r +
                                "' is not in the route list."
                        );
                    (u.i = new A(r, u.t.routes[r], u.t)), (u.u = u.l(n));
                }
                return u;
            }
            (o = t),
                ((r = u).prototype = Object.create(o.prototype)),
                (r.prototype.constructor = r),
                i(r, o);
            var f = u.prototype;
            return (
                (f.toString = function () {
                    var t = this,
                        r = Object.keys(this.u)
                            .filter(function (r) {
                                return !t.i.parameterSegments.some(function (
                                    t
                                ) {
                                    return t.name === r;
                                });
                            })
                            .filter(function (t) {
                                return "_query" !== t;
                            })
                            .reduce(function (r, n) {
                                var o;
                                return e({}, r, (((o = {})[n] = t.u[n]), o));
                            }, {});
                    return (
                        this.i.compile(this.u) +
                        (function (t, r) {
                            var n,
                                e = t,
                                o = (function (t) {
                                    if (!t) return x;
                                    if (
                                        null != t.encoder &&
                                        "function" != typeof t.encoder
                                    )
                                        throw new TypeError(
                                            "Encoder has to be a function."
                                        );
                                    var r = t.charset || x.charset;
                                    if (
                                        void 0 !== t.charset &&
                                        "utf-8" !== t.charset &&
                                        "iso-8859-1" !== t.charset
                                    )
                                        throw new TypeError(
                                            "The charset option must be either utf-8, iso-8859-1, or undefined"
                                        );
                                    var n = p.default;
                                    if (void 0 !== t.format) {
                                        if (!g.call(p.formatters, t.format))
                                            throw new TypeError(
                                                "Unknown format option provided."
                                            );
                                        n = t.format;
                                    }
                                    var e = p.formatters[n],
                                        o = x.filter;
                                    return (
                                        ("function" == typeof t.filter ||
                                            j(t.filter)) &&
                                            (o = t.filter),
                                        {
                                            addQueryPrefix:
                                                "boolean" ==
                                                typeof t.addQueryPrefix
                                                    ? t.addQueryPrefix
                                                    : x.addQueryPrefix,
                                            allowDots:
                                                void 0 === t.allowDots
                                                    ? x.allowDots
                                                    : !!t.allowDots,
                                            charset: r,
                                            charsetSentinel:
                                                "boolean" ==
                                                typeof t.charsetSentinel
                                                    ? t.charsetSentinel
                                                    : x.charsetSentinel,
                                            delimiter:
                                                void 0 === t.delimiter
                                                    ? x.delimiter
                                                    : t.delimiter,
                                            encode:
                                                "boolean" == typeof t.encode
                                                    ? t.encode
                                                    : x.encode,
                                            encoder:
                                                "function" == typeof t.encoder
                                                    ? t.encoder
                                                    : x.encoder,
                                            encodeValuesOnly:
                                                "boolean" ==
                                                typeof t.encodeValuesOnly
                                                    ? t.encodeValuesOnly
                                                    : x.encodeValuesOnly,
                                            filter: o,
                                            format: n,
                                            formatter: e,
                                            serializeDate:
                                                "function" ==
                                                typeof t.serializeDate
                                                    ? t.serializeDate
                                                    : x.serializeDate,
                                            skipNulls:
                                                "boolean" == typeof t.skipNulls
                                                    ? t.skipNulls
                                                    : x.skipNulls,
                                            sort:
                                                "function" == typeof t.sort
                                                    ? t.sort
                                                    : null,
                                            strictNullHandling:
                                                "boolean" ==
                                                typeof t.strictNullHandling
                                                    ? t.strictNullHandling
                                                    : x.strictNullHandling,
                                        }
                                    );
                                })(r);
                            "function" == typeof o.filter
                                ? (e = (0, o.filter)("", e))
                                : j(o.filter) && (n = o.filter);
                            var i = [];
                            if ("object" != typeof e || null === e) return "";
                            var u =
                                m[
                                    r && r.arrayFormat in m
                                        ? r.arrayFormat
                                        : r && "indices" in r
                                        ? r.indices
                                            ? "indices"
                                            : "repeat"
                                        : "indices"
                                ];
                            n || (n = Object.keys(e)), o.sort && n.sort(o.sort);
                            for (var f = 0; f < n.length; ++f) {
                                var a = n[f];
                                (o.skipNulls && null === e[a]) ||
                                    E(
                                        i,
                                        k(
                                            e[a],
                                            a,
                                            u,
                                            o.strictNullHandling,
                                            o.skipNulls,
                                            o.encode ? o.encoder : null,
                                            o.filter,
                                            o.sort,
                                            o.allowDots,
                                            o.serializeDate,
                                            o.format,
                                            o.formatter,
                                            o.encodeValuesOnly,
                                            o.charset
                                        )
                                    );
                            }
                            var c = i.join(o.delimiter),
                                l = !0 === o.addQueryPrefix ? "?" : "";
                            return (
                                o.charsetSentinel &&
                                    (l +=
                                        "iso-8859-1" === o.charset
                                            ? "utf8=%26%2310003%3B&"
                                            : "utf8=%E2%9C%93&"),
                                c.length > 0 ? l + c : ""
                            );
                        })(e({}, r, this.u._query), {
                            addQueryPrefix: !0,
                            arrayFormat: "indices",
                            encodeValuesOnly: !0,
                            skipNulls: !0,
                            encoder: function (t, r) {
                                return "boolean" == typeof t ? Number(t) : r(t);
                            },
                        })
                    );
                }),
                (f.p = function (t) {
                    var r = this;
                    t
                        ? this.t.absolute &&
                          t.startsWith("/") &&
                          (t = this.v().host + t)
                        : (t = this.h());
                    var n = {},
                        o = Object.entries(this.t.routes).find(function (e) {
                            return (n = new A(e[0], e[1], r.t).matchesUrl(t));
                        }) || [void 0, void 0];
                    return e({ name: o[0] }, n, { route: o[1] });
                }),
                (f.h = function () {
                    var t = this.v(),
                        r = t.pathname,
                        n = t.search;
                    return (
                        (this.t.absolute
                            ? t.host + r
                            : r
                                  .replace(
                                      this.t.url.replace(/^\w*:\/\/[^/]+/, ""),
                                      ""
                                  )
                                  .replace(/^\/+/, "/")) + n
                    );
                }),
                (f.current = function (t, r) {
                    var n = this.p(),
                        o = n.name,
                        i = n.params,
                        u = n.query,
                        f = n.route;
                    if (!t) return o;
                    var a = new RegExp(
                        "^" + t.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
                    ).test(o);
                    if ([null, void 0].includes(r) || !a) return a;
                    var c = new A(o, f, this.t);
                    r = this.l(r, c);
                    var l = e({}, i, u);
                    return (
                        !(
                            !Object.values(r).every(function (t) {
                                return !t;
                            }) ||
                            Object.values(l).some(function (t) {
                                return void 0 !== t;
                            })
                        ) ||
                        Object.entries(r).every(function (t) {
                            return l[t[0]] == t[1];
                        })
                    );
                }),
                (f.v = function () {
                    var t,
                        r,
                        n,
                        e,
                        o,
                        i,
                        u = "undefined" != typeof window ? window.location : {},
                        f = u.host,
                        a = u.pathname,
                        c = u.search;
                    return {
                        host:
                            null !=
                            (t =
                                null == (r = this.t.location) ? void 0 : r.host)
                                ? t
                                : void 0 === f
                                ? ""
                                : f,
                        pathname:
                            null !=
                            (n =
                                null == (e = this.t.location)
                                    ? void 0
                                    : e.pathname)
                                ? n
                                : void 0 === a
                                ? ""
                                : a,
                        search:
                            null !=
                            (o =
                                null == (i = this.t.location)
                                    ? void 0
                                    : i.search)
                                ? o
                                : void 0 === c
                                ? ""
                                : c,
                    };
                }),
                (f.has = function (t) {
                    return Object.keys(this.t.routes).includes(t);
                }),
                (f.l = function (t, r) {
                    var n = this;
                    void 0 === t && (t = {}),
                        void 0 === r && (r = this.i),
                        null != t || (t = {}),
                        (t = ["string", "number"].includes(typeof t) ? [t] : t);
                    var o = r.parameterSegments.filter(function (t) {
                        return !n.t.defaults[t.name];
                    });
                    if (Array.isArray(t))
                        t = t.reduce(function (t, r, n) {
                            var i, u;
                            return e(
                                {},
                                t,
                                o[n]
                                    ? (((i = {})[o[n].name] = r), i)
                                    : "object" == typeof r
                                    ? r
                                    : (((u = {})[r] = ""), u)
                            );
                        }, {});
                    else if (
                        1 === o.length &&
                        !t[o[0].name] &&
                        (t.hasOwnProperty(Object.values(r.bindings)[0]) ||
                            t.hasOwnProperty("id"))
                    ) {
                        var i;
                        ((i = {})[o[0].name] = t), (t = i);
                    }
                    return e({}, this.g(r), this.m(t, r));
                }),
                (f.g = function (t) {
                    var r = this;
                    return t.parameterSegments
                        .filter(function (t) {
                            return r.t.defaults[t.name];
                        })
                        .reduce(function (t, n, o) {
                            var i,
                                u = n.name;
                            return e(
                                {},
                                t,
                                (((i = {})[u] = r.t.defaults[u]), i)
                            );
                        }, {});
                }),
                (f.m = function (t, r) {
                    var n = r.bindings,
                        o = r.parameterSegments;
                    return Object.entries(t).reduce(function (t, r) {
                        var i,
                            u,
                            f = r[0],
                            a = r[1];
                        if (
                            !a ||
                            "object" != typeof a ||
                            Array.isArray(a) ||
                            !o.some(function (t) {
                                return t.name === f;
                            })
                        )
                            return e({}, t, (((u = {})[f] = a), u));
                        if (!a.hasOwnProperty(n[f])) {
                            if (!a.hasOwnProperty("id"))
                                throw new Error(
                                    "Ziggy error: object passed as '" +
                                        f +
                                        "' parameter is missing route model binding key '" +
                                        n[f] +
                                        "'."
                                );
                            n[f] = "id";
                        }
                        return e({}, t, (((i = {})[f] = a[n[f]]), i));
                    }, {});
                }),
                (f.valueOf = function () {
                    return this.toString();
                }),
                (f.check = function (t) {
                    return this.has(t);
                }),
                n(u, [
                    {
                        key: "params",
                        get: function () {
                            var t = this.p();
                            return e({}, t.params, t.query);
                        },
                    },
                ]),
                u
            );
        })(/*#__PURE__*/ a(String));
    t.ZiggyVue = {
        install: function (t, r) {
            var n = function (t, n, e, o) {
                return (
                    void 0 === o && (o = r),
                    (function (t, r, n, e) {
                        var o = new P(t, r, n, e);
                        return t ? o.toString() : o;
                    })(t, n, e, o)
                );
            };
            t.mixin({ methods: { route: n } }),
                parseInt(t.version) > 2 && t.provide("route", n);
        },
    };
});
