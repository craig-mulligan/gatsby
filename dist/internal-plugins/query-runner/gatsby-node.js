"use strict";

var fs = require("fs");
var path = require("path");

var _require = require("./query-watcher"),
    watchComponent = _require.watchComponent;

var components = {};

var handlePageOrLayout = function handlePageOrLayout(store) {
  return function (pageOrLayout) {
    // - ensure corresponding page or layout has json files.
    // - get corresponding component
    // - watch component
    // - mark component
    var writeJsonFile = function writeJsonFile(_ref) {
      var jsonName = _ref.jsonName;

      var dest = path.join(store.getState().program.directory, ".cache", "json", jsonName);
      if (!fs.existsSync(dest)) {
        fs.writeFile(dest, "{}", function () {});
      }
    };

    writeJsonFile(pageOrLayout);

    var component = store.getState().components[pageOrLayout.componentPath];

    if (components[component.componentPath]) {
      return;
    }

    watchComponent(component.componentPath);
    components[component.componentPath] = component.componentPath;
  };
};

exports.onCreatePage = function (_ref2) {
  var page = _ref2.page,
      store = _ref2.store,
      boundActionCreators = _ref2.boundActionCreators;

  handlePageOrLayout(store)(page);
};

exports.onCreateLayout = function (_ref3) {
  var layout = _ref3.layout,
      store = _ref3.store,
      boundActionCreators = _ref3.boundActionCreators;

  handlePageOrLayout(store)(layout);
};
//# sourceMappingURL=gatsby-node.js.map