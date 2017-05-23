'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerInMemoryCompiler;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sourceMapSupport = require('source-map-support');

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _registerRequireHook = require('../../util/registerRequireHook');

var _registerRequireHook2 = _interopRequireDefault(_registerRequireHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {
  return null;
};

function registerInMemoryCompiler(compiler) {
  var memoryFs = new _memoryFs2.default();
  compiler.outputFileSystem = memoryFs; // eslint-disable-line no-param-reassign

  var readFile = function readFile(filePath) {
    try {
      var code = memoryFs.readFileSync(filePath, 'utf8');
      return code;
    } catch (e) {
      return null;
    }
  };

  var resolveFile = function resolveFile(filePath, requireCaller) {
    // try to read file from memory-fs as it is
    var code = readFile(filePath);
    var resolvedPath = filePath;

    if (code === null && requireCaller != null) {
      var filename = requireCaller.filename;

      if (filename != null) {
        // if that didn't work, resolve the file relative to it's parent
        resolvedPath = _path2.default.resolve(_path2.default.dirname(filename), filePath);
        code = readFile(resolvedPath);
      }
    }
    return { path: code !== null ? resolvedPath : null, source: code };
  };

  // install require hook to be able to require webpack bundles from memory
  var unmountHook = (0, _registerRequireHook2.default)('.js', resolveFile);

  // install source map support to read source map from memory
  _sourceMapSupport2.default.install({
    emptyCacheBetweenOperations: true,
    handleUncaughtExceptions: false,
    environment: 'node',
    retrieveFile: function retrieveFile(f) {
      return readFile(f);
    } });

  return function unmount() {
    unmountHook();
    readFile = noop;
  };
}