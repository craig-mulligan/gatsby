"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require("lodash");
var normalize = require("normalize-path");

module.exports = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var action = arguments[1];

  switch (action.type) {
    case "DELETE_CACHE":
      return [];
    case "CREATE_PAGE":
      action.payload.component = normalize(action.payload.component);
      if (!action.plugin && !action.plugin.name) {
        console.log("");
        console.error((0, _stringify2.default)(action, null, 4));
        console.log("");
        throw new Error("Pages can only be created by plugins. There wasn't a plugin set\n        when creating this page.");
      }
      action.payload.pluginCreator___NODE = "Plugin " + action.plugin.name;
      var index = _.findIndex(state, function (p) {
        return p.path === action.payload.path;
      });
      // If the path already exists, overwrite it.
      // Otherwise, add it to the end.
      if (index !== -1) {
        return [].concat((0, _toConsumableArray3.default)(state.slice(0, index).concat(action.payload).concat(state.slice(index + 1))));
      } else {
        return [].concat((0, _toConsumableArray3.default)(state.concat(action.payload)));
      }
    case "DELETE_PAGE":
      return state.filter(function (p) {
        return p.path !== action.payload.path;
      });
    default:
      return state;
  }
};
//# sourceMappingURL=pages.js.map