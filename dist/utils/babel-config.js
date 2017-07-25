"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _resolve = require("babel-core/lib/helpers/resolve");

var _resolve2 = _interopRequireDefault(_resolve);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _json = require("json5");

var _json2 = _interopRequireDefault(_json);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _apiRunnerNode = require("./api-runner-node");

var _apiRunnerNode2 = _interopRequireDefault(_apiRunnerNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO update this to store Babelrc config in Redux store.

/**
 * Uses babel-core helpers to resolve the plugin given it's name. It
 * resolves plugins in the following order:
 *
 * 1. Adding babel-type prefix and checking user's local modules
 * 2. Adding babel-type prefix and checking Gatsby's modules
 * 3. Checking users's modules without prefix
 * 4. Checking Gatsby's modules without prefix
 *
 */
function resolvePlugin(pluginName, directory, type) {
  // When a plugin is specified with options in babelrc, the pluginName contains
  // the array with [name, options]. In that case we extract the name.
  pluginName = Array.isArray(pluginName) ? pluginName[0] : pluginName;

  var gatsbyPath = _path2.default.resolve(__dirname, "..", "..");
  var plugin = (0, _resolve2.default)("babel-" + type + "-" + pluginName, directory) || (0, _resolve2.default)("babel-" + type + "-" + pluginName, gatsbyPath) || (0, _resolve2.default)(pluginName, directory) || (0, _resolve2.default)(pluginName, gatsbyPath);

  var name = _lodash2.default.startsWith(pluginName, "babel") ? pluginName : "babel-" + type + "-" + pluginName;
  var pluginInvariantMessage = "\n  You are trying to use a Babel plugin or preset which Gatsby cannot find: " + pluginName + "\n\n  You can install it using \"npm install --save " + name + "\".\n\n  You can use any of the Gatsby provided plugins without installing them:\n    - babel-plugin-add-module-exports\n    - babel-plugin-transform-object-assign\n    - babel-preset-es2015\n    - babel-preset-react\n    - babel-preset-stage-0\n  ";

  (0, _invariant2.default)(plugin !== null, pluginInvariantMessage);
  return plugin;
}

/**
 * Normalizes a Babel config object to include only absolute paths.
 * This way babel-loader will correctly resolve Babel plugins
 * regardless of where they are located.
 */
function normalizeConfig(config, directory) {
  var normalizedConfig = {
    presets: [],
    plugins: []
  };

  var presets = config.presets || [];
  presets.forEach(function (preset) {
    normalizedConfig.presets.push(resolvePlugin(preset, directory, "preset"));
  });

  var plugins = config.plugins || [];
  plugins.forEach(function (plugin) {
    var normalizedPlugin = void 0;

    if (_lodash2.default.isArray(plugin)) {
      normalizedPlugin = [resolvePlugin(plugin[0], directory, "plugin"), plugin[1]];
    } else {
      normalizedPlugin = resolvePlugin(plugin, directory, "plugin");
    }

    normalizedConfig.plugins.push(normalizedPlugin);
  });

  return (0, _objectAssign2.default)({}, config, normalizedConfig);
}

/**
 * Locates a .babelrc in the Gatsby site root directory. Parses it using
 * json5 (what Babel uses). It throws an error if the users's .babelrc is
 * not parseable.
 */
function findBabelrc(directory) {
  try {
    var babelrc = _fs2.default.readFileSync(_path2.default.join(directory, ".babelrc"), "utf-8");
    return _json2.default.parse(babelrc);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    } else {
      throw error;
    }
  }
}

/**
 * Reads the user's package.json and returns the "babel" section. It will
 * return undefined when the "babel" section does not exist.
 */
function findBabelPackage(directory) {
  try {
    // $FlowIssue - https://github.com/facebook/flow/issues/1975
    var packageJson = require(_path2.default.join(directory, "package.json"));
    return packageJson.babel;
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      return null;
    } else {
      throw error;
    }
  }
}

/**
 * Returns a normalized Babel config to use with babel-loader. All of
 * the paths will be absolute so that Babel behaves as expected.
 */
module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(program, stage) {
    var directory, babelrc, normalizedConfig, modifiedConfig, merged;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            directory = program.directory;
            babelrc = findBabelrc(directory) || findBabelPackage(directory);

            // If user doesn't have a custom babelrc, add defaults.

            if (!babelrc) {
              babelrc = {};
            }
            if (!babelrc.plugins) {
              babelrc.plugins = [];
            }
            if (!babelrc.presets) {
              babelrc.presets = [];
            }

            // Add default plugins and presets.
            ;[[require.resolve("babel-preset-env"), {
              loose: true,
              uglify: true,
              modules: false,
              targets: {
                browsers: program.browserslist
              },
              exclude: ["transform-regenerator", "transform-es2015-typeof-symbol"]
            }], "stage-0", "react"].forEach(function (preset) {
              babelrc.presets.push(preset);
            });["add-module-exports", "transform-object-assign"].forEach(function (plugin) {
              babelrc.plugins.push(plugin);
            });

            if (stage === "develop") {
              babelrc.plugins.unshift("transform-react-jsx-source");
              babelrc.plugins.unshift("react-hot-loader/babel");
            }

            // Always add this plugin so our generated routes
            // will work regardless of how users export
            // their components. Yeah for multiple module standards!
            babelrc.plugins.unshift("add-module-exports");

            babelrc.plugins.unshift(require.resolve("./babel-plugin-extract-graphql"));

            if (!babelrc.hasOwnProperty("cacheDirectory")) {
              babelrc.cacheDirectory = true;
            }

            normalizedConfig = normalizeConfig(babelrc, directory);
            _context.next = 15;
            return (0, _apiRunnerNode2.default)("modifyBabelrc", { babelrc: babelrc });

          case 15:
            modifiedConfig = _context.sent;

            if (modifiedConfig.length > 0) {
              modifiedConfig = _lodash2.default.merge.apply(_lodash2.default, [{}].concat((0, _toConsumableArray3.default)(modifiedConfig)));
              // Otherwise this means no plugin changed the babel config.
            } else {
              modifiedConfig = {};
            }

            // Merge all together.
            merged = _lodash2.default.defaultsDeep(modifiedConfig, normalizedConfig);
            return _context.abrupt("return", merged);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function babelConfig(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return babelConfig;
}();
//# sourceMappingURL=babel-config.js.map