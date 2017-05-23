'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = requireWebpackConfig;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _interpret = require('interpret');

var _interpret2 = _interopRequireDefault(_interpret);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sortExtensions(ext1, ext2) {
  if (ext1 === '.js') {
    return -1;
  }
  if (ext2 === '.js') {
    return 1;
  }
  return ext1.length - ext2.length;
}

var extensions = (0, _keys2.default)(_interpret2.default.extensions).sort(sortExtensions);

function fileExists(filePath) {
  try {
    return _fs2.default.lstatSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

function findConfigFile(dirPath, baseName) {
  for (var i = 0; i < extensions.length; i++) {
    var filePath = _path2.default.resolve(dirPath, '' + baseName + extensions[i]);
    if (fileExists(filePath)) {
      return filePath;
    }
  }
  return null;
}

function getConfigExtension(configPath) {
  for (var i = extensions.length - 1; i >= 0; i--) {
    var extension = extensions[i];
    if (configPath.indexOf(extension, configPath.length - extension.length) > -1) {
      return extension;
    }
  }
  return _path2.default.extname(configPath);
}

function registerCompiler(moduleDescriptor) {
  if (!moduleDescriptor) {
    return;
  }

  if (typeof moduleDescriptor === 'string') {
    require(moduleDescriptor); // eslint-disable-line global-require
  } else if (!Array.isArray(moduleDescriptor)) {
    var module = require(moduleDescriptor.module); // eslint-disable-line global-require
    moduleDescriptor.register(module);
  } else {
    for (var i = 0; i < moduleDescriptor.length; i++) {
      try {
        registerCompiler(moduleDescriptor[i]);
        break;
      } catch (e) {
        // do nothing
      }
    }
  }
}

function requireWebpackConfig(webpackConfig) {
  if (!webpackConfig) {
    return {};
  }

  var configPath = _path2.default.resolve(webpackConfig);
  var configExtension = getConfigExtension(configPath);

  if (!fileExists(configPath)) {
    if (configExtension !== '.js') {
      return {};
    }

    var configDirPath = _path2.default.dirname(configPath);
    var configBaseName = _path2.default.basename(configPath, configExtension);

    configPath = findConfigFile(configDirPath, configBaseName);
    if (configPath === null) {
      return {};
    }

    configExtension = getConfigExtension(configPath);
  }

  registerCompiler(_interpret2.default.extensions[configExtension]);
  var config = require(configPath); // eslint-disable-line global-require

  if (typeof config === 'function') {
    return config('test');
  }

  return config.default || config;
}