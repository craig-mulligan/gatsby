"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globCB = require("glob");
var Promise = require("bluebird");
var _ = require("lodash");
var chokidar = require("chokidar");
var systemPath = require("path");

var glob = Promise.promisify(globCB);

var createPath = require("./create-path");
var validatePath = require("./validate-path");

// Path creator.
// Auto-create layouts.
// algorithm is glob /layouts directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createPagesStatefully = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref2, options, doneCb) {
    var store = _ref2.store,
        boundActionCreators = _ref2.boundActionCreators;
    var createLayout, deleteLayout, program, layoutDirectory, exts, files;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createLayout = boundActionCreators.createLayout, deleteLayout = boundActionCreators.deleteLayout;
            program = store.getState().program;
            layoutDirectory = systemPath.posix.join(program.directory, "/src/layouts");
            exts = program.extensions.map(function (e) {
              return "" + e.slice(1);
            }).join(",");

            // Get initial list of files.

            _context.next = 6;
            return glob(layoutDirectory + "/**/?(" + exts + ")");

          case 6:
            files = _context.sent;

            files.forEach(function (file) {
              return _createLayout(file, layoutDirectory, createLayout);
            });

            // Listen for new component pages to be added or removed.
            chokidar.watch(layoutDirectory + "/**/*.{" + exts + "}").on("add", function (path) {
              if (!_.includes(files, path)) {
                _createLayout(path, layoutDirectory, createLayout);
                files.push(path);
              }
            }).on("unlink", function (path) {
              // Delete the page for the now deleted component.
              store.getState().layouts.filter(function (p) {
                return p.component === path;
              }).forEach(function (layout) {
                deleteLayout({ name: layout.name });
                files = files.filter(function (f) {
                  return f !== name;
                });
              });
            }).on("ready", function () {
              return doneCb();
            });

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();
var _createLayout = function _createLayout(filePath, layoutDirectory, createLayout) {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(systemPath.posix.relative(layoutDirectory, filePath))) {
    return;
  }

  // Create page object
  var layout = {
    id: createPath(layoutDirectory, filePath),
    component: filePath

    // Add page
  };createLayout(layout);
};
//# sourceMappingURL=gatsby-node.js.map