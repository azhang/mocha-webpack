'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = testRunnerReporter;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _types = require('../webpack/types');

var _createStatsFormatter = require('../webpack/util/createStatsFormatter');

var _createStatsFormatter2 = _interopRequireDefault(_createStatsFormatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = function log() {
  var _console;

  (_console = console).log.apply(_console, arguments); // eslint-disable-line no-console
  console.log(); // eslint-disable-line no-console
};


var formatTitleInfo = function formatTitleInfo(title) {
  return _chalk2.default.inverse('', title, '');
};
var formatTitleWarn = function formatTitleWarn(title) {
  return _chalk2.default.black.bgYellow('', title, '');
};
var formatTitleError = function formatTitleError(title) {
  return _chalk2.default.white.bold.bgRed('', title, '');
};

var Reporter = function () {
  function Reporter(options) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Reporter);

    this.onUncaughtException = function (err) {
      log(formatTitleError('UNCAUGHT EXCEPTION'), 'Exception occurred after running tests');
      log(err.stack);
    };

    this.onLoadingException = function (err) {
      log(formatTitleError('RUNTIME EXCEPTION'), 'Exception occurred while loading your tests');
      log(err.stack);
    };

    this.onWebpackStart = function () {
      _this.clearConsole();
      if (_this.added.length > 0) {
        log(formatTitleInfo('MOCHA'), 'The following test entry files were added:');
        log(_this.added.map(function (f) {
          return '+ ' + f;
        }).join('\n'));
      }

      if (_this.removed.length > 0) {
        log(formatTitleInfo('MOCHA'), 'The following test entry files were removed:');
        log(_this.removed.map(function (f) {
          return '- ' + f;
        }).join('\n'));
      }

      log(formatTitleInfo('WEBPACK'), 'Compiling...');

      _this.added.length = 0;
      _this.removed.length = 0;
    };

    this.onWebpackReady = function (err, stats) {
      _this.clearConsole();
      if (stats != null) {
        var _formatStats = _this.formatStats(stats),
            _errors = _formatStats.errors,
            _warnings = _formatStats.warnings;

        if (_errors.length === 0 && _warnings.length === 0) {
          var startTime = stats.startTime,
              endTime = stats.endTime;

          var compileTime = endTime - startTime;
          log(formatTitleInfo('WEBPACK'), 'Compiled successfully in ' + _chalk2.default.green(compileTime + 'ms'));
          return;
        }

        if (_errors.length > 0) {
          _this.displayErrors('error', _errors);
          return;
        }

        if (_warnings.length > 0) {
          _this.displayErrors('warning', _warnings);
        }
      } else {
        _this.displayErrors('error', [err]);
      }
    };

    this.onMochaStart = function () {
      log(formatTitleInfo('MOCHA'), 'Testing...');
    };

    this.onMochaAbort = function () {
      log(formatTitleInfo('MOCHA'), 'Tests aborted');
    };

    this.onMochaReady = function (failures) {
      if (failures === 0) {
        log(formatTitleInfo('MOCHA'), 'Tests completed ' + _chalk2.default.green('successfully'));
      } else {
        log(formatTitleInfo('MOCHA'), 'Tests completed with ' + _chalk2.default.red(failures + ' failure(s)'));
      }
    };

    this.onEntryAdded = function (file) {
      _this.added.push(file);
    };

    this.onEntryRemoved = function (file) {
      _this.removed.push(file);
    };

    var eventEmitter = options.eventEmitter,
        interactive = options.interactive,
        cwd = options.cwd;


    this.added = [];
    this.removed = [];
    this.interactive = interactive;
    this.formatStats = (0, _createStatsFormatter2.default)(cwd);

    eventEmitter.on('uncaughtException', this.onUncaughtException);
    eventEmitter.on('exception', this.onLoadingException);
    eventEmitter.on('webpack:start', this.onWebpackStart);
    eventEmitter.on('webpack:ready', this.onWebpackReady);
    eventEmitter.on('mocha:begin', this.onMochaStart);
    eventEmitter.on('mocha:aborted', this.onMochaAbort);
    eventEmitter.on('mocha:finished', this.onMochaReady);
    eventEmitter.on('entry:added', this.onEntryAdded);
    eventEmitter.on('entry:removed', this.onEntryRemoved);
  }

  (0, _createClass3.default)(Reporter, [{
    key: 'clearConsole',
    value: function clearConsole() {
      if (this.interactive) {
        process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
      }
    }
  }, {
    key: 'displayErrors',
    value: function displayErrors(severity, errors) {
      var errorCount = errors.length;

      var message = severity === 'error' ? 'Failed to compile with ' + _chalk2.default.red(errorCount + ' ' + severity + '(s)') : 'Compiled with ' + _chalk2.default.yellow(errorCount + ' ' + severity + '(s)');

      var titleColor = severity === 'error' ? formatTitleError : formatTitleWarn;
      log(titleColor('WEBPACK'), message);
      errors.forEach(function (err) {
        return log(err);
      });
    }
  }]);
  return Reporter;
}();

function testRunnerReporter(options) {
  new Reporter(options); // eslint-disable-line no-new
}