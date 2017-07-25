"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _jsChunkNames = require("../../utils/js-chunk-names");

var _path = require("../../utils/path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var glob = require("glob");
var fs = require("fs-extra");

var _require = require("../../redux/"),
    store = _require.store,
    emitter = _require.emitter;

var getLayoutById = function getLayoutById(layouts) {
  return function (id) {
    return layouts.find(function (l) {
      return l.id === id;
    });
  };
};

// Write out pages information.
var writePages = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var _store$getState, program, config, pages, layouts, pagesData, components, json, pageLayouts, defaultLayoutExists, syncRequires, asyncRequires;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            writtenOnce = true;
            _store$getState = store.getState(), program = _store$getState.program, config = _store$getState.config, pages = _store$getState.pages, layouts = _store$getState.layouts;
            // Write out pages.json

            pagesData = pages.reduce(function (mem, _ref2) {
              var path = _ref2.path,
                  matchPath = _ref2.matchPath,
                  componentChunkName = _ref2.componentChunkName,
                  layout = _ref2.layout,
                  jsonName = _ref2.jsonName;
              return [].concat((0, _toConsumableArray3.default)(mem), [{
                componentChunkName: componentChunkName,
                layout: layout,
                layoutComponentChunkName: getLayoutById(layouts)(layout).componentChunkName,
                layoutJsonName: getLayoutById(layouts)(layout).jsonName,
                jsonName: jsonName,
                path: path,
                matchPath: matchPath
              }]);
            }, []);

            // Get list of components, layouts, and json files.

            components = [];
            json = [];
            pageLayouts = [];


            pages.forEach(function (p) {
              components.push({
                componentChunkName: p.componentChunkName,
                component: p.component
              });
              if (p.layout) {
                var layout = getLayoutById(layouts)(p.layout);
                pageLayouts.push(layout);
                json.push({
                  jsonName: layout.jsonName
                });
              }
              json.push({ path: p.path, jsonName: p.jsonName });
            });

            // Add the default layout if it exists.
            defaultLayoutExists = false;

            pageLayouts = _.uniq(pageLayouts);
            components = _.uniqBy(components, function (c) {
              return c.componentChunkName;
            });

            _context.next = 12;
            return fs.writeFile((0, _path.joinPath)(program.directory, ".cache/pages.json"), (0, _stringify2.default)(pagesData, null, 4));

          case 12:

            // Create file with sync requires of layouts/components/json files.
            syncRequires = "// prefer default export if available\nconst preferDefault = m => m && m.default || m\n\n\n";

            syncRequires += "exports.components = {\n" + components.map(function (c) {
              return "  \"" + c.componentChunkName + "\": preferDefault(require(\"" + (0, _path.joinPath)(c.component) + "\"))";
            }).join(",\n") + "\n}\n\n";
            syncRequires += "exports.json = {\n" + json.map(function (j) {
              return "  \"" + j.jsonName + "\": require(\"" + (0, _path.joinPath)(program.directory, "/.cache/json/", j.jsonName) + "\")";
            }).join(",\n") + "\n}\n\n";
            syncRequires += "exports.layouts = {\n" + pageLayouts.map(function (l) {
              return "  \"" + l.componentChunkName + "\": preferDefault(require(\"" + (0, _path.joinPath)(l.component) + "\"))";
            }).join(",\n") + "\n}";

            _context.next = 18;
            return fs.writeFile(program.directory + "/.cache/sync-requires.js", syncRequires);

          case 18:
            // Create file with async requires of layouts/components/json files.
            asyncRequires = "// prefer default export if available\nconst preferDefault = m => m && m.default || m\n\n";

            asyncRequires += "exports.components = {\n" + components.map(function (c) {
              return "  \"" + c.componentChunkName + "\": require(\"gatsby-module-loader?name=" + c.componentChunkName + "!" + (0, _path.joinPath)(c.component) + "\")";
            }).join(",\n") + "\n}\n\n";
            asyncRequires += "exports.json = {\n" + json.map(function (j) {
              return "  \"" + j.jsonName + "\": require(\"gatsby-module-loader?name=" + (0, _jsChunkNames.generatePathChunkName)(j.path) + "!" + (0, _path.joinPath)(program.directory, "/.cache/json/", j.jsonName) + "\")";
            }).join(",\n") + "\n}\n\n";
            asyncRequires += "exports.layouts = {\n" + pageLayouts.map(function (l) {
              return "  \"" + l.componentChunkName + "\": require(\"gatsby-module-loader?name=" + l.componentChunkName + "!" + (0, _path.joinPath)(l.component) + "\")";
            }).join(",\n") + "\n}";

            _context.next = 24;
            return fs.writeFile((0, _path.joinPath)(program.directory, ".cache/async-requires.js"), asyncRequires);

          case 24:
            return _context.abrupt("return");

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function writePages() {
    return _ref.apply(this, arguments);
  };
}();

exports.writePages = writePages;

var writtenOnce = false;
var oldPages = void 0;
var debouncedWritePages = _.debounce(function () {
  if (!writtenOnce || !_.isEqual(oldPages, store.getState().pages)) {
    writePages();
    oldPages = store.getState().pages;
  }
}, 250);

emitter.on("CREATE_PAGE", function () {
  debouncedWritePages();
});
emitter.on("DELETE_PAGE_BY_PATH", function () {
  debouncedWritePages();
});
//# sourceMappingURL=pages-writer.js.map