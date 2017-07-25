"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require("fs");
var path = require("path");

var _require = require("./query-watcher"),
    watchComponent = _require.watchComponent;

var components = {};

exports.onCreateComponent = function (_ref) {
  var component = _ref.component,
      store = _ref.store,
      boundActionCreators = _ref.boundActionCreators;

  // if we haven't seen component before
  // - get corresponding pages + layouts
  // - ensure they have a json files
  // - watch component
  // - mark component
  var writeJsonFile = function writeJsonFile(_ref2) {
    var jsonName = _ref2.jsonName;

    // console.log(jsonName)
    var dest = path.join(store.getState().program.directory, ".cache", "json", jsonName);
    if (!fs.existsSync(dest)) {
      fs.writeFile(dest, "{}", function () {});
    }
  };

  if (!components[component.componentPath]) {
    var state = store.getState();
    var pagesAndLayouts = [].concat((0, _toConsumableArray3.default)(state.pages), (0, _toConsumableArray3.default)(state.layouts));

    pagesAndLayouts.filter(function (pl) {
      return pl.componentPath === component.componentPath;
    }).map(writeJsonFile);

    watchComponent(component.componentPath);
    components[component.componentPath] = component.componentPath;
  }
};
//# sourceMappingURL=gatsby-node.js.map