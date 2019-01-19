var test = require("tape");

test("require against the module", function(t) {
    var papermonk = require("./");

    t.ok(papermonk, "must not be undefined");

    t.end();
});

test("exports an object", function(t) {
    var papermonk = require("./");

    t.equal(typeof(papermonk), "object", "papermonk exports an object");
    t.notEqual(typeof(papermonk), "string", "papermonk isn't a string");

    t.end();
});

test("exports Papermonk", function(t) {
    var papermonk = require("./");

    t.isNot(papermonk.Papermonk, undefined, "papermonk.Papermonk must be exported");

    t.end();
});

test("resets when required again", function(t) {
    var papermonk1 = require("./");

    count = papermonk1.downloaders.length;

    // reset the downloaders
    papermonk1.downloaders = [];

    var papermonk2 = require("./");

    if (papermonk2.downloaders.length == count)
        t.pass("papermonk downloaders resets when required a second time");

    t.end();
});

test("_matches calls test", function(t) {
    var papermonk = require("./");

    var url = "http://httpbin.org/test";

    var downloader = {};

    downloader.test = function(url) {
        t.pass("test was called");
        t.end();
    }

    papermonk._matches(downloader, url);
});

test("_matches calls test with a url", function(t) {
    var papermonk = require("./");

    var url = "http://httpbin.org/test";

    var downloader = {};

    downloader.test = function(innerurl) {
        t.pass("test was called");

        if (innerurl === url)
            t.pass("url works");

        t.end();
    }

    papermonk._matches(downloader, url);
});

test("_findMatchingDownloaders throws Error when no matching downloader found", function(t) {
    var papermonk = require("./");

    // just some test config
    var fname = "_findMatchingDownloaders";
    var url = "http://httpbin.org/get";

    // reset downloaders
    papermonk.downloaders = [];

    t.throws(function() {
        papermonk._findMatchingDownloaders(undefined);
    }, Error, fname + " throws when url is undefined");

    t.throws(function() {
        papermonk._findMatchingDownloaders(null);
    }, Error, fname + " throws when url is null");

    t.throws(function() {
        papermonk._findMatchingDownloaders("");
    }, Error, fname + " throws when url is an empty string");

    t.throws(function() {
        papermonk._findMatchingDownloaders(url);
    }, Error, fname + " throws when url is " + url);

    t.end();
});

test("_findMatchingDownloaders returns a matching downloader", function(t) {
    var papermonk = require("./");

    var expected_url = "http://httpbin.org/get";

    /* setup the mock downloader */

    var downloader = {};

    downloader.test = function(url) {
        if (url === expected_url) {
            t.ok("downloader.test called with correct url");
            return true;
        } else {
            t.fail("downloader.test called with wrong url");
            return false;
        }
    };

    papermonk.downloaders = [downloader];

    /* run the test */

    var result = papermonk._findMatchingDownloaders(expected_url);

    t.equal(result[0], downloader, "_findMatchingDownloaders returns the right matching downloader");

    t.end();
});
