"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var html = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(program) {
    var _ref2, graphqlRunner;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return bootstrap(program);

          case 2:
            _ref2 = _context.sent;
            graphqlRunner = _ref2.graphqlRunner;

            // Copy files from the static directory to
            // an equivalent static directory within public.
            copyStaticDirectory();

            console.log("Generating CSS");
            _context.next = 8;
            return buildCSS(program).catch(function (err) {
              console.log("");
              console.log("Generating CSS failed", err);
              console.log("");
              console.log(err);
              process.exit(1);
            });

          case 8:

            console.log("Compiling production bundle.js");
            _context.next = 11;
            return buildProductionBundle(program).catch(function (err) {
              console.log("");
              console.log("Generating JS failed", err);
              console.log("");
              console.log(err);
              process.exit(1);
            });

          case 11:

            console.log("Generating static HTML for pages");
            _context.next = 14;
            return buildHTML(program).catch(function (err) {
              console.log("");
              console.log(err);
              console.log("");
              console.log("Generating static HTML for pages failed");
              console.log("See our docs page on debugging HTML builds for help https://goo.gl/yL9lND");

              process.exit(1);
            });

          case 14:
            _context.next = 16;
            return apiRunnerNode("onPostBuild", { graphql: graphqlRunner });

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function html(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var buildCSS = require("./build-css");
var buildHTML = require("./build-html");
var buildProductionBundle = require("./build-javascript");
var bootstrap = require("../bootstrap");
var apiRunnerNode = require("./api-runner-node");
var copyStaticDirectory = require("./copy-static-directory");

module.exports = html;
//# sourceMappingURL=build.js.map