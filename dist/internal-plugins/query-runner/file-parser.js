"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _taggedTemplateLiteral2 = require("babel-runtime/helpers/taggedTemplateLiteral");

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var parseToAst = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(filePath, fileStr) {
    var ast, transpiled, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, tmp;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ast = void 0;
            transpiled = void 0;
            // TODO figure out why awaiting apiRunnerNode doesn't work
            // Currently if I try that it just returns immediately.
            //
            // Preprocess and attempt to parse source; return an AST if we can, log an
            // error if we can't.
            // const transpiled = await apiRunnerNode(`preprocessSource`, {
            // filename: filePath,
            // contents: fileStr,
            // })

            if (!(transpiled && transpiled.length)) {
              _context.next = 40;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 6;
            _iterator = (0, _getIterator3.default)(transpiled);

          case 8:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 23;
              break;
            }

            item = _step.value;
            _context.prev = 10;
            tmp = babylon.parse(item, {
              sourceType: "module",
              plugins: ["*"]
            });

            ast = tmp;
            return _context.abrupt("break", 23);

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](10);

            console.info(_context.t0);
            return _context.abrupt("continue", 20);

          case 20:
            _iteratorNormalCompletion = true;
            _context.next = 8;
            break;

          case 23:
            _context.next = 29;
            break;

          case 25:
            _context.prev = 25;
            _context.t1 = _context["catch"](6);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 29:
            _context.prev = 29;
            _context.prev = 30;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 32:
            _context.prev = 32;

            if (!_didIteratorError) {
              _context.next = 35;
              break;
            }

            throw _iteratorError;

          case 35:
            return _context.finish(32);

          case 36:
            return _context.finish(29);

          case 37:
            if (ast === undefined) {
              console.error("Failed to parse preprocessed file " + filePath);
            }
            _context.next = 41;
            break;

          case 40:
            try {
              ast = babylon.parse(fileStr, {
                sourceType: "module",
                sourceFilename: true,
                plugins: ["*"]
              });
            } catch (e) {
              console.log("Failed to parse " + filePath);
              console.log(e);
            }

          case 41:
            return _context.abrupt("return", ast);

          case 42:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[6, 25, 29, 37], [10, 16], [30,, 32, 36]]);
  }));

  return function parseToAst(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var findGraphQLTags = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(file, text) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new _promise2.default(function (resolve) {
              parseToAst(file, text).then(function (ast) {
                if (!ast) return [];

                var queries = [];
                (0, _babelTraverse2.default)(ast, {
                  ExportNamedDeclaration: function ExportNamedDeclaration(path, state) {
                    path.traverse({
                      TaggedTemplateExpression: function TaggedTemplateExpression(innerPath) {
                        var gqlAst = getGraphQLTag(innerPath);
                        if (gqlAst) {
                          gqlAst.definitions.forEach(function (def) {
                            if (!def.name || !def.name.value) {
                              console.log(stripIndent(_templateObject, file));
                              process.exit(1);
                            }
                          });

                          queries.push.apply(queries, (0, _toConsumableArray3.default)(gqlAst.definitions));
                        }
                      }
                    });
                  }
                });
                resolve(queries);
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function findGraphQLTags(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var _templateObject = (0, _taggedTemplateLiteral3.default)(["\n                  GraphQL definitions must be \"named\".\n                  The query with the missing name is in ", ".\n                  To fix the query, add \"query MyQueryName\" to the start of your query.\n                  So instead of:\n                  {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n\n                  Do:\n\n                  query MyQueryName {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n                "], ["\n                  GraphQL definitions must be \"named\".\n                  The query with the missing name is in ", ".\n                  To fix the query, add \"query MyQueryName\" to the start of your query.\n                  So instead of:\n                  {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n\n                  Do:\n\n                  query MyQueryName {\n                    allMarkdownRemark {\n                      totalCount\n                    }\n                  }\n                "]);

var _babelTraverse = require("babel-traverse");

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require("fs-extra");
var crypto = require("crypto");

// Traverse is a es6 module...

var babylon = require("babylon");
var Bluebird = require("bluebird");

var _require = require("common-tags"),
    stripIndent = _require.stripIndent;

var apiRunnerNode = require("../../utils/api-runner-node");

var _require2 = require("../../utils/babel-plugin-extract-graphql"),
    getGraphQLTag = _require2.getGraphQLTag;

var cache = {};

var FileParser = function () {
  function FileParser() {
    (0, _classCallCheck3.default)(this, FileParser);
  }

  (0, _createClass3.default)(FileParser, [{
    key: "parseFile",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(file) {
        var text, hash, astDefinitions;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // TODO figure out why fs-extra isn't returning a promise
                text = fs.readFileSync(file, "utf8");

                if (!(text.indexOf("graphql") === -1)) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", null);

              case 3:
                hash = crypto.createHash("md5").update(file).update(text).digest("hex");
                _context3.prev = 4;
                _context3.t0 = cache[hash];

                if (_context3.t0) {
                  _context3.next = 10;
                  break;
                }

                _context3.next = 9;
                return findGraphQLTags(file, text);

              case 9:
                _context3.t0 = cache[hash] = _context3.sent;

              case 10:
                astDefinitions = _context3.t0;
                return _context3.abrupt("return", astDefinitions.length ? {
                  kind: "Document",
                  definitions: astDefinitions
                } : null);

              case 14:
                _context3.prev = 14;
                _context3.t1 = _context3["catch"](4);

                console.error("Failed to parse GQL query from file: " + file);
                console.error(_context3.t1.message);
                return _context3.abrupt("return", null);

              case 19:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[4, 14]]);
      }));

      function parseFile(_x5) {
        return _ref3.apply(this, arguments);
      }

      return parseFile;
    }()
  }, {
    key: "parseFiles",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(files) {
        var _this = this;

        var documents;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                documents = new _map2.default();
                return _context4.abrupt("return", _promise2.default.all(files.map(function (file) {
                  return new _promise2.default(function (resolve) {
                    _this.parseFile(file).then(function (doc) {
                      if (doc) documents.set(file, doc);
                      resolve();
                    }).catch(function (e) {
                      console.log("parsing file failed", file, e);
                    });
                  });
                })).then(function () {
                  return documents;
                }).catch(function (e) {
                  console.log("parsing files failed", e);
                }));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function parseFiles(_x6) {
        return _ref4.apply(this, arguments);
      }

      return parseFiles;
    }()
  }]);
  return FileParser;
}();

exports.default = FileParser;
//# sourceMappingURL=file-parser.js.map