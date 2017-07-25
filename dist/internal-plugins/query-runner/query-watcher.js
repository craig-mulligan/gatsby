"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** *
 * Jobs of this module
 * - Maintain the list of components in the Redux store. So monitor new components
 *   and add/remove components.
 * - Watch components for query changes and extract these and update the store.
 * - Ensure all page queries are run as part of bootstrap and report back when
 *   this is done
 * - Whenever a query changes, re-run all pages that rely on this query.
 ***/

var _ = require("lodash");
var chokidar = require("chokidar");

var _require = require("../../redux/"),
    store = _require.store;

var _require2 = require("../../redux/actions"),
    boundActionCreators = _require2.boundActionCreators;

var queryCompiler = require("./query-compiler").default;
var queryRunner = require("./query-runner");
var invariant = require("invariant");
var normalize = require("normalize-path");

exports.extractQueries = function () {
  // TODO We can just grab the components straight from store here?
  var state = store.getState();
  var pagesAndLayouts = [].concat((0, _toConsumableArray3.default)(state.pages), (0, _toConsumableArray3.default)(state.layouts));
  var components = _.uniq(pagesAndLayouts.map(function (p) {
    return p.component;
  }));
  queryCompiler().then(function (queries) {
    components.forEach(function (component) {
      var query = queries.get(normalize(component));
      boundActionCreators.replaceComponentQuery({
        query: query && query.text,
        componentPath: component
      });
    });

    return;
  });

  // During development start watching files to recompile & run
  // queries on the fly.
  if (process.env.NODE_ENV !== "production") {
    watch();

    // Ensure every component is being watched.
    components.forEach(function (component) {
      watcher.add(component);
    });
  }
};

var runQueriesForComponent = function runQueriesForComponent(componentPath) {
  var pages = getPagesForComponent(componentPath);
  // Remove page & layout data dependencies before re-running queries because
  // the changing of the query could have changed the data dependencies.
  // Re-running the queries will add back data dependencies.
  boundActionCreators.deleteComponentsDependencies(pages.map(function (p) {
    return p.path || p.id;
  }));
  var component = store.getState().components[componentPath];
  return _promise2.default.all(pages.map(function (p) {
    return queryRunner(p, component);
  }));
};

var getPagesForComponent = function getPagesForComponent(componentPath) {
  var state = store.getState();
  return [].concat((0, _toConsumableArray3.default)(state.pages), (0, _toConsumableArray3.default)(state.layouts)).filter(function (p) {
    return p.componentPath === componentPath;
  });
};

var watcher = void 0;
exports.watchComponent = function (componentPath) {
  // We don't start watching until mid-way through the bootstrap so ignore
  // new components being added until then. This doesn't affect anything as
  // when extractQueries is called from bootstrap, we make sure that all
  // components are being watched.
  if (watcher) {
    watcher.add(componentPath);
  }
};
var watch = function watch(rootDir) {
  if (watcher) return;
  var debounceCompile = _.debounce(function () {
    queryCompiler().then(function (queries) {
      var components = store.getState().components;
      queries.forEach(function (_ref, id) {
        var text = _ref.text;

        invariant(components[id], id + " not found in the store components: " + (0, _stringify2.default)(components));

        if (text !== components[id].query) {
          boundActionCreators.replaceComponentQuery({
            query: text,
            componentPath: id
          });
          runQueriesForComponent(id);
        }
      });
    });
  }, 100);

  watcher = chokidar.watch(rootDir + "/src/**/*.{js,jsx,ts,tsx}").on("change", function (path) {
    debounceCompile();
  });
};
//# sourceMappingURL=query-watcher.js.map