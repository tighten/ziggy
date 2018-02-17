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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["default"] = route;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__UrlBuilder__ = __webpack_require__(1);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var Router = function (_String) {
    _inherits(Router, _String);

    function Router(name, params, absolute) {
        _classCallCheck(this, Router);

        var _this = _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).call(this));

        _this.name = name;
        _this.absolute = absolute;
        _this.urlParams = _this.normalizeParams(params);
        _this.queryParams = _this.normalizeParams(params);
        return _this;
    }

    _createClass(Router, [{
        key: 'normalizeParams',
        value: function normalizeParams(params) {
            if (typeof params === 'undefined') return {};

            params = (typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== 'object' ? [params] : params;
            this.numericParamIndices = Array.isArray(params);

            return _extends({}, params);
        }
    }, {
        key: 'with',
        value: function _with(params) {
            this.urlParams = this.normalizeParams(params);
            return this;
        }
    }, {
        key: 'withQuery',
        value: function withQuery(params) {
            _extends(this.queryParams, params);
            return this;
        }
    }, {
        key: 'hydrateUrl',
        value: function hydrateUrl() {
            var tags = this.urlParams,
                paramsArrayKey = 0,
                template = new __WEBPACK_IMPORTED_MODULE_0__UrlBuilder__["a" /* default */](this.name, this.absolute).construct(),
                params = template.match(/{([^}]+)}/gi),
                needDefaultParams = false;

            if (params && params.length != Object.keys(tags).length) {
                needDefaultParams = true;
            }

            return template.replace(/{([^}]+)}/gi, function (tag) {
                var keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, ''),
                    key = this.numericParamIndices ? paramsArrayKey : keyName,
                    defaultParameter = Ziggy.defaultParameters[keyName];

                if (defaultParameter && needDefaultParams) {
                    if (this.numericParamIndices) {
                        tags = Object.values(tags);
                        tags.splice(key, 0, defaultParameter);
                    } else {
                        tags[key] = defaultParameter;
                    }
                }

                paramsArrayKey++;
                if (typeof tags[key] !== 'undefined') {
                    delete this.queryParams[key];
                    return tags[key].id || encodeURIComponent(tags[key]);
                }
                if (tag.indexOf('?') === -1) {
                    throw new Error('Ziggy Error: \'' + keyName + '\' key is required for route \'' + this.name + '\'');
                } else {
                    return '';
                }
            }.bind(this));
        }
    }, {
        key: 'matchUrl',
        value: function matchUrl() {
            var tags = this.urlParams,
                paramsArrayKey = 0,
                template = new __WEBPACK_IMPORTED_MODULE_0__UrlBuilder__["a" /* default */](this.name, this.absolute).construct();

            var windowUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;

            var searchTemplate = template.replace(/(\{[^\}]*\})/gi, '[^\/\?]+');
            var urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');
            return new RegExp("^" + searchTemplate + "\/$").test(urlWithTrailingSlash);
        }
    }, {
        key: 'constructQuery',
        value: function constructQuery() {
            if (Object.keys(this.queryParams).length === 0) return '';

            var queryString = '?';

            Object.keys(this.queryParams).forEach(function (key, i) {
                queryString = i === 0 ? queryString : queryString + '&';
                queryString += key + '=' + encodeURIComponent(this.queryParams[key]);
            }.bind(this));

            return queryString;
        }
    }, {
        key: 'current',
        value: function current() {
            var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var routeNames = Object.keys(Ziggy.namedRoutes);

            var currentRoute = routeNames.filter(function (name) {
                return new Router(name).matchUrl();
            })[0];

            return name ? name == currentRoute : currentRoute;
        }
    }, {
        key: 'parse',
        value: function parse() {
            this.return = this.hydrateUrl() + this.constructQuery();
        }
    }, {
        key: 'url',
        value: function url() {
            this.parse();
            return this.return;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.url();
        }
    }, {
        key: 'valueOf',
        value: function valueOf() {
            return this.url();
        }
    }]);

    return Router;
}(String);

function route(name, params, absolute) {
    return new Router(name, params, absolute);
};

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UrlBuilder = function () {
    function UrlBuilder(name, absolute) {
        _classCallCheck(this, UrlBuilder);

        this.name = name;
        this.route = Ziggy.namedRoutes[this.name];

        if (typeof this.name === 'undefined') {
            throw new Error('Ziggy Error: You must provide a route name');
        } else if (typeof this.route === 'undefined') {
            throw new Error('Ziggy Error: route \'' + this.name + '\' is not found in the route list');
        }

        this.absolute = typeof absolute === 'undefined' ? true : absolute;
        this.domain = this.setDomain();
        this.path = this.route.uri.replace(/^\//, '');
    }

    _createClass(UrlBuilder, [{
        key: 'setDomain',
        value: function setDomain() {
            if (!this.absolute) return '/';

            if (!this.route.domain) return Ziggy.baseUrl.replace(/\/?$/, '/');

            var host = (this.route.domain || Ziggy.baseDomain).replace(/\/+$/, '');

            if (Ziggy.basePort && host.replace(/\/+$/, '') === Ziggy.baseDomain.replace(/\/+$/, '')) host = Ziggy.baseDomain + ':' + Ziggy.basePort;

            return Ziggy.baseProtocol + '://' + host + '/';
        }
    }, {
        key: 'construct',
        value: function construct() {
            return this.domain + this.path;
        }
    }]);

    return UrlBuilder;
}();

/* harmony default export */ __webpack_exports__["a"] = (UrlBuilder);

/***/ })
/******/ ])["default"];
});