"use strict";

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createHash = require("crypto").createHash;

var getHashFn = function getHashFn(_ref) {
  var _ref$hashFunction = _ref.hashFunction,
      hashFunction = _ref$hashFunction === undefined ? "md5" : _ref$hashFunction,
      _ref$hashDigest = _ref.hashDigest,
      hashDigest = _ref$hashDigest === undefined ? "hex" : _ref$hashDigest,
      _ref$hashDigestBits = _ref.hashDigestBits,
      hashDigestBits = _ref$hashDigestBits === undefined ? 64 : _ref$hashDigestBits,
      _ref$cache = _ref.cache,
      cache = _ref$cache === undefined ? new _set2.default() : _ref$cache;
  return function (input) {
    var hash = createHash(hashFunction);
    hash.update(input);
    var digest = hash.digest(hashDigest);
    var partialDigest = digest.substr(0, hashDigestBits / 4);
    var output = parseInt(partialDigest, 16);
    // guard against collisions
    if (cache.has(output)) {
      throw Error("Hash collision at f(" + input + ") = " + output);
    }
    cache.add(output);
    return output;
  };
};

module.exports = getHashFn;
//# sourceMappingURL=get-hash-fn.js.map