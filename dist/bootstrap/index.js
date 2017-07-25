"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Promise = require("bluebird");
var glob = require("glob");
var _ = require("lodash");
var slash = require("slash");
var fs = require("fs-extra");
var md5File = require("md5-file/promise");
var crypto = require("crypto");
var report = require("yurnalist");
var convertHrtime = require("convert-hrtime");

var apiRunnerNode = require("../utils/api-runner-node");

var _require = require("graphql"),
    graphql = _require.graphql;

var _require2 = require("../redux"),
    store = _require2.store,
    emitter = _require2.emitter;

var loadPlugins = require("./load-plugins");

var _require3 = require("../utils/cache"),
    initCache = _require3.initCache;

var _require4 = require("../internal-plugins/query-runner/query-watcher"),
    extractQueries = _require4.extractQueries;

var _require5 = require("../internal-plugins/query-runner/page-query-runner"),
    runQueries = _require5.runQueries;

var _require6 = require("../internal-plugins/query-runner/pages-writer"),
    writePages = _require6.writePages;

var activityTimer = function activityTimer(name) {
  var spinner = report.activity();
  var start = process.hrtime();

  var elapsedTime = function elapsedTime() {
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start);
    return convertHrtime(elapsed)["seconds"].toFixed(precision) + " s";
  };
  return {
    start: function start() {
      spinner.tick(name);
    },
    end: function end() {
      report.success(name + " \u2014 " + elapsedTime());
      spinner.end();
    }
  };
};

// Override console.log to add the source file + line number.
// Useful for debugging if you lose a console.log somewhere.
// Otherwise leave commented out.
// require(`./log-line-function`)

var preferDefault = function preferDefault(m) {
  return m && m.default || m;
};

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(program) {
    var activity, config, firstLine, flattenedPlugins, pluginVersions, hashes, pluginsHash, state, oldPluginsHash, srcDir, siteDir, hasAPIFile, ssrPlugins, browserPlugins, browserAPIRunner, browserPluginsRequires, sSRAPIRunner, ssrPluginsRequires, extensions, apiResults, graphqlRunner, checkJobsDone;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Fix program directory path for windows env
            program.directory = slash(program.directory);

            store.dispatch({
              type: "SET_PROGRAM",
              payload: program
            });

            // Try opening the site's gatsby-config.js file.
            activity = activityTimer("open and validate gatsby-config.js");

            activity.start();
            config = void 0;

            try {
              // $FlowFixMe
              config = preferDefault(require(program.directory + "/gatsby-config"));
            } catch (e) {
              firstLine = e.toString().split("\n")[0];

              if (!/Error: Cannot find module.*gatsby-config/.test(firstLine)) {
                console.log("");
                console.log("");
                console.log(e);
                process.exit(1);
              }
            }

            store.dispatch({
              type: "SET_SITE_CONFIG",
              payload: config
            });

            activity.end();

            _context.next = 10;
            return loadPlugins(config);

          case 10:
            flattenedPlugins = _context.sent;


            // Check if any plugins have been updated since our last run. If so
            // we delete the cache is there's likely been changes
            // since the previous run.
            //
            // We do this by creating a hash of all the version numbers of installed
            // plugins, the site's package.json, gatsby-config.js, and gatsby-node.js.
            // The last, gatsby-node.js, is important as many gatsby sites put important
            // logic in there e.g. generating slugs for custom pages.
            pluginVersions = flattenedPlugins.map(function (p) {
              return p.version;
            });
            _context.next = 14;
            return Promise.all([md5File("package.json"), Promise.resolve(md5File(program.directory + "/gatsby-config.js").catch(function () {})), // ignore as this file isn't required),
            Promise.resolve(md5File(program.directory + "/gatsby-node.js").catch(function () {}))] // ignore as this file isn't required),
            );

          case 14:
            hashes = _context.sent;
            pluginsHash = crypto.createHash("md5").update((0, _stringify2.default)(pluginVersions.concat(hashes))).digest("hex");
            state = store.getState();
            oldPluginsHash = state && state.status ? state.status.PLUGINS_HASH : "";

            // Check if anything has changed. If it has, delete the site's .cache
            // directory and tell reducers to empty themselves.
            //
            // Also if the hash isn't there, then delete things just in case something
            // is weird.

            if (oldPluginsHash && pluginsHash !== oldPluginsHash) {
              console.log("\nOne or more of your plugins have changed since the last time you ran Gatsby. As\na precaution, we're deleting your site's cache to ensure there's not any stale\ndata\n");
            }

            if (!(!oldPluginsHash || pluginsHash !== oldPluginsHash)) {
              _context.next = 29;
              break;
            }

            _context.prev = 20;
            _context.next = 23;
            return fs.remove(program.directory + "/.cache");

          case 23:
            _context.next = 28;
            break;

          case 25:
            _context.prev = 25;
            _context.t0 = _context["catch"](20);

            console.error("Failed to remove .cache files. " + _context.t0.message);

          case 28:
            // Tell reducers to delete their data (the store will already have
            // been loaded from the file system cache).
            store.dispatch({
              type: "DELETE_CACHE"
            });

          case 29:

            // Update the store with the new plugins hash.
            store.dispatch({
              type: "UPDATE_PLUGINS_HASH",
              payload: pluginsHash
            });

            // Now that we know the .cache directory is safe, initialize the cache
            // directory.
            initCache();

            // Ensure the public/static directory is created.
            _context.next = 33;
            return fs.mkdirp(program.directory + "/public/static");

          case 33:

            // Copy our site files to the root of the site.
            activity = activityTimer("copy gatsby files");
            activity.start();
            srcDir = __dirname + "/../cache-dir";
            siteDir = program.directory + "/.cache";
            _context.prev = 37;
            _context.next = 40;
            return fs.copy(srcDir, siteDir, { clobber: true });

          case 40:
            _context.next = 42;
            return fs.mkdirs(program.directory + "/.cache/json");

          case 42:
            _context.next = 49;
            break;

          case 44:
            _context.prev = 44;
            _context.t1 = _context["catch"](37);

            console.log("Unable to copy site files to .cache");
            console.log(_context.t1);
            process.exit(1);

          case 49:

            // Find plugins which implement gatsby-browser and gatsby-ssr and write
            // out api-runners for them.
            hasAPIFile = function hasAPIFile(env, plugin) {
              return (
                // TODO make this async...
                glob.sync(plugin.resolve + "/gatsby-" + env + "*")[0]
              );
            };

            ssrPlugins = _.filter(flattenedPlugins.map(function (plugin) {
              return {
                resolve: hasAPIFile("ssr", plugin),
                options: plugin.pluginOptions
              };
            }), function (plugin) {
              return plugin.resolve;
            });
            browserPlugins = _.filter(flattenedPlugins.map(function (plugin) {
              return {
                resolve: hasAPIFile("browser", plugin),
                options: plugin.pluginOptions
              };
            }), function (plugin) {
              return plugin.resolve;
            });
            browserAPIRunner = "";


            try {
              browserAPIRunner = fs.readFileSync(siteDir + "/api-runner-browser.js", "utf-8");
            } catch (err) {
              console.error("Failed to read " + siteDir + "/api-runner-browser.js");
            }

            browserPluginsRequires = browserPlugins.map(function (plugin) {
              return "{\n      plugin: require('" + plugin.resolve + "'),\n      options: " + (0, _stringify2.default)(plugin.options) + ",\n    }";
            }).join(",");


            browserAPIRunner = "var plugins = [" + browserPluginsRequires + "]\n" + browserAPIRunner;

            sSRAPIRunner = "";


            try {
              sSRAPIRunner = fs.readFileSync(siteDir + "/api-runner-ssr.js", "utf-8");
            } catch (err) {
              console.error("Failed to read " + siteDir + "/api-runner-ssr.js");
            }

            ssrPluginsRequires = ssrPlugins.map(function (plugin) {
              return "{\n      plugin: require('" + plugin.resolve + "'),\n      options: " + (0, _stringify2.default)(plugin.options) + ",\n    }";
            }).join(",");

            sSRAPIRunner = "var plugins = [" + ssrPluginsRequires + "]\n" + sSRAPIRunner;

            fs.writeFileSync(siteDir + "/api-runner-browser.js", browserAPIRunner, "utf-8");
            fs.writeFileSync(siteDir + "/api-runner-ssr.js", sSRAPIRunner, "utf-8");

            activity.end();

            // Source nodes
            activity = activityTimer("source and transform nodes");
            activity.start();
            _context.next = 67;
            return require("../utils/source-nodes")();

          case 67:
            activity.end();

            // Create Schema.
            activity = activityTimer("building schema");
            activity.start();
            _context.next = 72;
            return require("../schema")();

          case 72:
            activity.end();

            // Collect resolvable extensions and attach to program.
            extensions = [".js", ".jsx"];
            // Change to this being an action and plugins implement `onPreBootstrap`
            // for adding extensions.

            _context.next = 76;
            return apiRunnerNode("resolvableExtensions", {
              traceId: "initial-resolvableExtensions"
            });

          case 76:
            apiResults = _context.sent;


            store.dispatch({
              type: "SET_PROGRAM_EXTENSIONS",
              payload: _.flattenDeep([extensions, apiResults])
            });

            graphqlRunner = function graphqlRunner(query) {
              var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

              var schema = store.getState().schema;
              return graphql(schema, query, context, context, context);
            };

            // Collect layouts.


            activity = activityTimer("createLayouts");
            activity.start();
            _context.next = 83;
            return apiRunnerNode("createLayouts", {
              graphql: graphqlRunner,
              traceId: "initial-createLayouts",
              waitForCascadingActions: true
            });

          case 83:
            activity.end();

            // Collect pages.
            activity = activityTimer("createPages");
            activity.start();
            _context.next = 88;
            return apiRunnerNode("createPages", {
              graphql: graphqlRunner,
              traceId: "initial-createPages",
              waitForCascadingActions: true
            });

          case 88:
            activity.end();

            // A variant on createPages for plugins that want to
            // have full control over adding/removing pages. The normal
            // "createPages" API is called every time (during development)
            // that data changes.
            activity = activityTimer("createPagesStatefully");
            activity.start();
            _context.next = 93;
            return apiRunnerNode("createPagesStatefully", {
              graphql: graphqlRunner,
              traceId: "initial-createPagesStatefully",
              waitForCascadingActions: true
            });

          case 93:
            activity.end();
            // Extract queries
            activity = activityTimer("extract queries from components");
            activity.start();
            _context.next = 98;
            return extractQueries();

          case 98:
            activity.end();

            // Run queries
            activity = activityTimer("run graphql queries");
            activity.start();
            _context.next = 103;
            return runQueries();

          case 103:
            activity.end();

            // Write out files.
            activity = activityTimer("write out page data");
            activity.start();
            _context.next = 108;
            return writePages();

          case 108:
            activity.end();

            // Update Schema for SitePage.
            activity = activityTimer("update schema");
            activity.start();
            _context.next = 113;
            return require("../schema")();

          case 113:
            activity.end();

            checkJobsDone = _.debounce(function (resolve) {
              var state = store.getState();
              if (state.jobs.active.length === 0) {
                console.log("");
                console.log("bootstrap finished, time since started: " + process.uptime() + "sec");
                console.log("");
                resolve({ graphqlRunner: graphqlRunner });
              }
            }, 100);

            if (!(store.getState().jobs.active.length === 0)) {
              _context.next = 122;
              break;
            }

            console.log("");
            console.log("bootstrap finished, time since started: " + process.uptime() + " s");
            console.log("");
            return _context.abrupt("return", { graphqlRunner: graphqlRunner });

          case 122:
            return _context.abrupt("return", new Promise(function (resolve) {
              // Wait until all side effect jobs are finished.
              emitter.on("END_JOB", function () {
                return checkJobsDone(resolve);
              });
            }));

          case 123:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[20, 25], [37, 44]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=index.js.map