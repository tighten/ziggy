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
        _this.urlParams = _this.normalizeParams(params);
        _this.queryParams = _this.normalizeParams(params);
        _this.absolute = absolute === undefined ? true : absolute;
        _this.domain = _this.constructDomain();
        _this.url = namedRoutes[_this.name].uri.replace(/^\//, '');
        return _this;
    }

    _createClass(Router, [{
        key: 'normalizeParams',
        value: function normalizeParams(params) {
            if (params === undefined) return {};

            params = (typeof params === 'undefined' ? 'undefined' : _typeof(params)) !== 'object' ? [params] : params;
            this.numericParamIndices = Array.isArray(params);

            return _extends({}, params);
        }
    }, {
        key: 'constructDomain',
        value: function constructDomain() {
            if (this.name === undefined) {
                throw 'Ziggy Error: You must provide a route name';
            } else if (namedRoutes[this.name] === undefined) {
                throw 'Ziggy Error: route "' + this.name + '" is not found in the route list';
            } else if (!this.absolute) {
                return '/';
            }

            var routeDomain = (namedRoutes[this.name].domain || baseDomain).replace(/\/+$/, '');
            if (basePort && routeDomain.replace(/\/+$/, '') === baseDomain.replace(/\/+$/, '')) {
                routeDomain = routeDomain + ':' + basePort;
            }

            return baseProtocol + '://' + routeDomain + '/';
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
        key: 'constructUrl',
        value: function constructUrl() {
            var url = this.domain + this.url,
                tags = this.urlParams,
                paramsArrayKey = 0;

            return url.replace(/{([^}]+)}/gi, function (tag) {
                var keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, ''),
                    key = this.numericParamIndices ? paramsArrayKey : keyName;

                paramsArrayKey++;
                if (typeof tags[key] !== 'undefined') {
                    delete this.queryParams[key];
                    return tags[key].id || tags[key];
                }
                if (tag.indexOf('?') === -1) {
                    throw 'Ziggy Error: "' + keyName + '" key is required for route "' + this.name + '"';
                } else {
                    return '';
                }
            }.bind(this));
        }
    }, {
        key: 'constructQuery',
        value: function constructQuery() {
            if (Object.keys(this.queryParams).length === 0) return '';

            var queryString = '?';

            Object.keys(this.queryParams).forEach(function (key, i) {
                queryString = i === 0 ? queryString : queryString + '&';
                queryString += key + '=' + this.queryParams[key];
            }.bind(this));

            return queryString;
        }
    }, {
        key: 'toString',
        value: function toString() {
            this.parse();
            return this.return;
        }
    }, {
        key: 'valueOf',
        value: function valueOf() {
            this.parse();
            return this.return;
        }
    }, {
        key: 'parse',
        value: function parse() {
            this.return = this.constructUrl() + this.constructQuery();
        }
    }]);

    return Router;
}(String);

function route(name, params, absolute) {
    return new Router(name, params, absolute);
};

/***/ })
/******/ ])["default"];
});