'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.route = route;

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

            return Object.assign({}, params);
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
            Object.assign(this.queryParams, params);

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