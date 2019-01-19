// easy dictionary merging
var extend = require("xtend");

// get all registered downloader modules
var downloaders = require("./src/downloaders.js");

function Papermonk(options) {
    // empty options by default
    if (options === undefined)
        options = {};

    // default: only use the first downloader
    if (options.enable_multiple_downloaders === undefined)
        options.enable_multiple_downloaders = false;

    this.options = options;

    // maybe let the options override these entries?
    this.downloaders = downloaders;
};

Papermonk.prototype._matches = function(downloader, url) {
    return downloader.test(url);
};

Papermonk.prototype._findMatchingDownloaders = function(url) {
    var matching = [];

    this.downloaders.forEach(function(downloader, index) {
        if (this._matches(downloader, url)) {
            matching.push(downloader);
        }
    }, this);

    if (matching.length === 0) {
        throw new Error("No matching downloader available.");
    } else {
        return matching;
    }
};

Papermonk.prototype.download = function(url, options, callback) {
    // merge local options into a copy of this Papermonk's options
    var options = extend(this.options, options);

    // get a list of all matching downloader modules
    var matches = this._findMatchingDownloaders(url);

    // default is to use only the first matching downloader
    if (options.enable_multiple_downloaders === false) {
        matches = [matches[0]];
    }

    // call each downloader
    matches.forEach(function(downloader, index) {
        downloader.download(url, options, callback);
    });

    return true;
};

// TODO: figure out a better thing to export
module.exports = new Papermonk();

// make Papermonk accessible to the outside world
module.exports.Papermonk = Papermonk;
