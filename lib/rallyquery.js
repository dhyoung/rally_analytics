(function() {
  var RallyQuery, jsType, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = this;

  jsType = (function() {
    var classToType, name, _i, _len, _ref;
    classToType = {};
    _ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  RallyQuery = (function() {

    /*
      This is total hack to get around the fact that I don't have App SDK 2.0 access yet
    */

    function RallyQuery(config, _XHRClass) {
      var addRequiredHeader, key, os, platform, userAgent, value, _ref;
      this._XHRClass = _XHRClass;
      this._gotResponse = __bind(this._gotResponse, this);
      this.debug = false;
      if (this._XHRClass == null) {
        throw new Error('Must provide an XHRClass as the second parameter for this AnalyticsQuery constructor.');
      }
      this._xhr = null;
      this._query = '';
      this._fetch = true;
      this._order = null;
      this._startIndex = 0;
      this._pageSize = 200;
      this._callback = null;
      this.headers = {};
      this.headers['X-RallyIntegrationLibrary'] = 'rally_analytics-0.1.0';
      if (typeof navigator !== "undefined" && navigator !== null) {
        platform = navigator.appName + ' ' + navigator.appVersion;
        userAgent = navigator.userAgent;
        os = navigator.platform;
      } else if (typeof process !== "undefined" && process !== null) {
        platform = 'Node.js (or some other non-browser) ' + process.version;
        userAgent = 'Rally analytics toolkit on Node.js (or some other non-browser)';
        os = process.platform;
      }
      this.headers['X-RallyIntegrationPlatform'] = platform;
      this.headers['X-RallyIntegrationOS'] = os;
      _ref = config.additionalHeaders;
      for (key in _ref) {
        value = _ref[key];
        this.headers[key] = value;
      }
      addRequiredHeader = function(headers, key) {
        if (config[key] != null) {
          return headers[key] = config[key];
        } else {
          throw new Error("Must include config[" + key + "] header when instantiating this rally_analytics.AnalyticsQuery object");
        }
      };
      addRequiredHeader(this.headers, 'X-RallyIntegrationName');
      addRequiredHeader(this.headers, 'X-RallyIntegrationVendor');
      addRequiredHeader(this.headers, 'X-RallyIntegrationVersion');
      this.username = config.username;
      this.password = config.password;
      this.protocol = "https";
      this.server = "rally1.rallydev.com/slm";
      this.service = "webservice";
      this.version = "1.31";
      this.endpoint = "preferences.js";
      this._firstPage = true;
      this.lastResponseText = '';
      this.lastResponse = {};
      this.lastMeta = {};
      this.allResults = [];
      this.allMeta = [];
    }

    RallyQuery.prototype.resetQuery = function() {
      return this._query = null;
    };

    RallyQuery.prototype.query = function(_query) {
      this._query = _query;
      return this;
    };

    RallyQuery.prototype.order = function(_order) {
      this._order = _order;
      return this;
    };

    RallyQuery.prototype.fetch = function(_fetch) {
      this._fetch = _fetch;
      return this;
    };

    RallyQuery.prototype.start = function(_startIndex) {
      this._startIndex = _startIndex;
      return this;
    };

    RallyQuery.prototype.startIndex = function(_startIndex) {
      this._startIndex = _startIndex;
      return this;
    };

    RallyQuery.prototype.pagesize = function(_pageSize) {
      this._pageSize = _pageSize;
      return this;
    };

    RallyQuery.prototype.pageSize = function(_pageSize) {
      this._pageSize = _pageSize;
      return this;
    };

    RallyQuery.prototype.auth = function(username, password) {
      this.username = username;
      this.password = password;
      return this;
    };

    RallyQuery.prototype.getBaseURL = function() {
      return this.protocol + '://' + [this.server, this.service, this.version, this.endpoint].join('/');
    };

    RallyQuery.prototype.getQueryString = function() {
      var queryArray;
      if (this._query != null) {
        queryArray = [];
        queryArray.push('query=' + this._query);
        if (this._order != null) queryArray.push('order=' + this._order);
        if (this._fetch != null) queryArray.push('fetch=' + this._fetch);
        queryArray.push('start=' + this._startIndex);
        queryArray.push('pagesize=' + this._pageSize);
        return queryArray.join('&');
      } else {
        throw new Error('find clause not set');
      }
    };

    RallyQuery.prototype.getURL = function() {
      return this.getBaseURL() + '?' + this.getQueryString();
    };

    RallyQuery.prototype.getAll = function(_callback) {
      var key, value, _ref;
      this._callback = _callback;
      if (this._query == null) {
        throw new Error('Must set query clause before calling getAll');
      }
      this._xhr = new this._XHRClass();
      this._xhr.onreadystatechange = this._gotResponse;
      this._xhr.open('GET', this.getURL(), true, this.username, this.password);
      _ref = this.headers;
      for (key in _ref) {
        value = _ref[key];
        this._xhr.setRequestHeader(key, value);
      }
      this._xhr.send();
      return this;
    };

    RallyQuery.prototype._gotResponse = function() {
      var key, o, value, _i, _len, _ref, _ref2, _ref3, _return;
      var _this = this;
      if (this._xhr.readyState === 4) {
        _return = function() {
          _this._firstPage = true;
          _this._startIndex = 0;
          return _this._callback.call(_this);
        };
        this.lastResponseText = this._xhr.responseText;
        if (this.debug) console.log('\nlastResponse\n' + this.lastResponseText);
        this.lastResponse = JSON.parse(this.lastResponseText).QueryResult;
        if (false) {
          return _return();
        } else {
          if (this._firstPage) {
            this._firstPage = false;
            this.allResults = [];
            this.allMeta = [];
            this._pageSize = this.lastResponse.PageSize;
          } else {

          }
          _ref = this.lastResponse.Results;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            o = _ref[_i];
            this.allResults.push(o);
          }
          this.lastMeta = {};
          _ref2 = this.lastResponse;
          for (key in _ref2) {
            value = _ref2[key];
            if (key !== 'Results') this.lastMeta[key] = value;
          }
          this.allMeta.push(this.lastMeta);
          if (this.lastResponse.Results.length + this.lastResponse.StartIndex >= this.lastResponse.TotalResultCount) {
            return _return();
          } else {
            this._startIndex += this._pageSize;
            this._xhr = new this._XHRClass();
            this._xhr.onreadystatechange = this._gotResponse;
            this._xhr.open('GET', this.getURL(), true, this.username, this.password);
            _ref3 = this.headers;
            for (key in _ref3) {
              value = _ref3[key];
              this._xhr.setRequestHeader(key, value);
            }
            return this._xhr.send();
          }
        }
      }
    };

    return RallyQuery;

  })();

  root.RallyQuery = RallyQuery;

}).call(this);
