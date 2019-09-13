(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("route", [], factory);
	else if(typeof exports === 'object')
		exports["route"] = factory();
	else
		root["route"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/js/UrlBuilder.js
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

/* harmony default export */ var js_UrlBuilder = (UrlBuilder);
// CONCATENATED MODULE: ./src/js/route.js
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return route; });
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function route_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function route_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function route_createClass(Constructor, protoProps, staticProps) { if (protoProps) route_defineProperties(Constructor.prototype, protoProps); if (staticProps) route_defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



var route_Router =
/*#__PURE__*/
function (_String) {
  _inherits(Router, _String);

  function Router(name, params, absolute) {
    var _this;

    var customZiggy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    route_classCallCheck(this, Router);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Router).call(this));
    _this.name = name;
    _this.absolute = absolute;
    _this.ziggy = customZiggy ? customZiggy : Ziggy;
    _this.template = _this.name ? new js_UrlBuilder(name, absolute, _this.ziggy).construct() : '', _this.urlParams = _this.normalizeParams(params);
    _this.queryParams = {};
    _this.hydrated = '';
    return _this;
  }

  route_createClass(Router, [{
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

      if (this.hydrated) return this.hydrated;
      return this.hydrated = this.template.replace(/{([^}]+)}/gi, function (tag, i) {
        var keyName = _this2.trimParam(tag),
            defaultParameter = _this2.ziggy.defaultParameters[keyName],
            tagValue; // If a default parameter exists, and a value wasn't
        // provided for it manually, use the default value


        if (defaultParameter && !_this2.urlParams[keyName]) {
          delete _this2.urlParams[keyName];
          return defaultParameter;
        } // We were passed an array, shift the value off the
        // object and return that value to the route


        if (_this2.numericParamIndices) {
          _this2.urlParams = Object.values(_this2.urlParams);
          tagValue = _this2.urlParams.shift();
        } else {
          tagValue = _this2.urlParams[keyName];
          delete _this2.urlParams[keyName];
        } // The type of the value is undefined; is this param
        // optional or not


        if (typeof tagValue === 'undefined') {
          if (tag.indexOf('?') === -1) {
            throw new Error('Ziggy Error: \'' + keyName + '\' key is required for route \'' + _this2.name + '\'');
          } else {
            return '';
          }
        } // If an object was passed and has an id, return it


        if (tagValue.id) {
          return encodeURIComponent(tagValue.id);
        }

        return encodeURIComponent(tagValue);
      });
    }
  }, {
    key: "matchUrl",
    value: function matchUrl() {
      var windowUrl = window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname; // Strip out optional parameters

      var optionalTemplate = this.template.replace(/(\/\{[^\}]*\?\})/g, '/').replace(/(\{[^\}]*\})/gi, '[^\/\?]+').replace(/\/?$/, '').split('://')[1];
      var searchTemplate = this.template.replace(/(\{[^\}]*\})/gi, '[^\/\?]+').split('://')[1];
      var urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');
      var regularSearch = new RegExp("^" + searchTemplate + "\/$").test(urlWithTrailingSlash);
      var optionalSearch = new RegExp("^" + optionalTemplate + "\/$").test(urlWithTrailingSlash);
      return regularSearch || optionalSearch;
    }
  }, {
    key: "constructQuery",
    value: function constructQuery() {
      if (Object.keys(this.queryParams).length === 0 && Object.keys(this.urlParams).length === 0) return '';

      var remainingParams = _extends(this.urlParams, this.queryParams);

      var queryString = '?';
      Object.keys(remainingParams).forEach(function (key, i) {
        if (remainingParams[key] !== undefined && remainingParams[key] !== null) {
          queryString = i === 0 ? queryString : queryString + '&';
          queryString += key + '=' + encodeURIComponent(remainingParams[key]);
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
        var pattern = new RegExp('^' + name.replace('*', '.*').replace('.', '\.') + '$', 'i');
        return pattern.test(currentRoute);
      }

      return currentRoute;
    }
  }, {
    key: "extractParams",
    value: function extractParams(uri, template, delimiter) {
      var _this4 = this;

      var uriParts = uri.split(delimiter);
      var templateParts = template.split(delimiter);
      return templateParts.reduce(function (params, param, i) {
        return param.indexOf('{') === 0 && param.indexOf('}') !== -1 && uriParts[i] ? _extends(params, _defineProperty({}, _this4.trimParam(param), uriParts[i])) : params;
      }, {});
    }
  }, {
    key: "parse",
    value: function parse() {
      this["return"] = this.hydrateUrl() + this.constructQuery();
    }
  }, {
    key: "url",
    value: function url() {
      this.parse();
      return this["return"];
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.url();
    }
  }, {
    key: "trimParam",
    value: function trimParam(param) {
      return param.replace(/{|}|\?/g, '');
    }
  }, {
    key: "valueOf",
    value: function valueOf() {
      return this.url();
    }
  }, {
    key: "params",
    get: function get() {
      var namedRoute = this.ziggy.namedRoutes[this.current()];
      return _extends(this.extractParams(window.location.hostname, namedRoute.domain || '', '.'), this.extractParams(window.location.pathname.slice(1), namedRoute.uri, '/'));
    }
  }]);

  return Router;
}(_wrapNativeSuper(String));

function route(name, params, absolute, customZiggy) {
  return new route_Router(name, params, absolute, customZiggy);
}
;

/***/ })
/******/ ])["default"];
});