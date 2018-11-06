(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.route = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var UrlBuilder =
  /*#__PURE__*/
  function () {
    function UrlBuilder(name, absolute, ziggyObject) {
      _classCallCheck(this, UrlBuilder);

      this.name = name;
      this.ziggy = ziggyObject;
      this.route = this.ziggy.namedRoutes[this.name];

      if (typeof this.name === 'undefined') {
        throw new Error('Ziggy Error: You must provide a route name');
      } else if (typeof this.route === 'undefined') {
        throw new Error("Ziggy Error: route '".concat(this.name, "' is not found in the route list"));
      }

      this.absolute = typeof absolute === 'undefined' ? true : absolute;
      this.domain = this.setDomain();
      this.path = this.route.uri.replace(/^\//, '');
    }

    _createClass(UrlBuilder, [{
      key: "setDomain",
      value: function setDomain() {
        if (!this.absolute) return '/';
        if (!this.route.domain) return this.ziggy.baseUrl.replace(/\/?$/, '/');
        var host = (this.route.domain || this.ziggy.baseDomain).replace(/\/+$/, '');
        if (this.ziggy.basePort && host.replace(/\/+$/, '') === this.ziggy.baseDomain.replace(/\/+$/, '')) host = this.ziggy.baseDomain + ':' + this.ziggy.basePort;
        return this.ziggy.baseProtocol + '://' + host + '/';
      }
    }, {
      key: "construct",
      value: function construct() {
        return this.domain + this.path;
      }
    }]);

    return UrlBuilder;
  }();

  var Router =
  /*#__PURE__*/
  function (_String) {
    _inherits(Router, _String);

    function Router(name, params, absolute) {
      var _this;

      var customZiggy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      _classCallCheck(this, Router);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Router).call(this));
      _this.name = name;
      _this.absolute = absolute;
      _this.ziggy = customZiggy ? customZiggy : Ziggy;
      _this.template = _this.name ? new UrlBuilder(name, absolute, _this.ziggy).construct() : '', _this.urlParams = _this.normalizeParams(params);
      _this.queryParams = _this.normalizeParams(params);
      return _this;
    }

    _createClass(Router, [{
      key: "normalizeParams",
      value: function normalizeParams(params) {
        if (typeof params === 'undefined') return {}; // If you passed in a string or integer, wrap it in an array

        params = _typeof(params) !== 'object' ? [params] : params; // If the tags object contains an ID and there isn't an ID param in the
        // url template, they probably passed in a single model object and we should
        // wrap this in an array. This could be slightly dangerous and I want to find
        // a better solution for this rare case.

        if (params.hasOwnProperty('id') && this.template.indexOf('{id}') == -1) {
          params = [params.id];
        }

        this.numericParamIndices = Array.isArray(params);
        return _extends({}, params);
      }
    }, {
      key: "with",
      value: function _with(params) {
        this.urlParams = this.normalizeParams(params);
        return this;
      }
    }, {
      key: "withQuery",
      value: function withQuery(params) {
        _extends(this.queryParams, params);

        return this;
      }
    }, {
      key: "hydrateUrl",
      value: function hydrateUrl() {
        var _this2 = this;

        var tags = this.urlParams,
            paramsArrayKey = 0,
            params = this.template.match(/{([^}]+)}/gi),
            needDefaultParams = false;

        if (params && params.length != Object.keys(tags).length) {
          needDefaultParams = true;
        }

        return this.template.replace(/{([^}]+)}/gi, function (tag, i) {
          var keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, ''),
              key = _this2.numericParamIndices ? paramsArrayKey : keyName,
              defaultParameter = _this2.ziggy.defaultParameters[keyName];

          if (defaultParameter && needDefaultParams) {
            if (_this2.numericParamIndices) {
              tags = Object.values(tags);
              tags.splice(key, 0, defaultParameter);
            } else {
              tags[key] = defaultParameter;
            }
          }

          paramsArrayKey++;

          if (typeof tags[key] !== 'undefined') {
            delete _this2.queryParams[key];
            return tags[key].id || encodeURIComponent(tags[key]);
          }

          if (tag.indexOf('?') === -1) {
            throw new Error("Ziggy Error: '".concat(keyName, "' key is required for route '").concat(_this2.name, "'"));
          } else {
            return '';
          }
        });
      }
    }, {
      key: "matchUrl",
      value: function matchUrl() {
        var tags = this.urlParams;
        var windowUrl = window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;
        var searchTemplate = this.template.replace(/(\{[^\}]*\})/gi, '[^\/\?]+').split('://')[1];
        var urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');
        return new RegExp("^" + searchTemplate + "\/$").test(urlWithTrailingSlash);
      }
    }, {
      key: "constructQuery",
      value: function constructQuery() {
        if (Object.keys(this.queryParams).length === 0) return '';
        var queryString = '?';
        Object.keys(this.queryParams).forEach(function (key, i) {
          if (this.queryParams[key] !== undefined && this.queryParams[key] !== null) {
            queryString = i === 0 ? queryString : queryString + '&';
            queryString += key + '=' + encodeURIComponent(this.queryParams[key]);
          }
        }.bind(this));
        return queryString;
      }
    }, {
      key: "current",
      value: function current() {
        var _this3 = this;

        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var routeNames = Object.keys(this.ziggy.namedRoutes);
        var currentRoute = routeNames.filter(function (name) {
          if (_this3.ziggy.namedRoutes[name].methods.indexOf('GET') === -1) {
            return false;
          }

          return new Router(name, undefined, undefined, _this3.ziggy).matchUrl();
        })[0];

        if (name) {
          var pattern = new RegExp(name.replace('*', '.*').replace('.', '\.'), 'i');
          return pattern.test(currentRoute);
        }

        return currentRoute;
      }
    }, {
      key: "parse",
      value: function parse() {
        this.return = this.hydrateUrl() + this.constructQuery();
      }
    }, {
      key: "url",
      value: function url() {
        this.parse();
        return this.return;
      }
    }, {
      key: "toString",
      value: function toString() {
        return this.url();
      }
    }, {
      key: "valueOf",
      value: function valueOf() {
        return this.url();
      }
    }]);

    return Router;
  }(_wrapNativeSuper(String));

  function route(name, params, absolute, customZiggy) {
    return new Router(name, params, absolute, customZiggy);
  }

  return route;

})));
