var urlparser = require("url-parser");
var through = require("through");
var concat = require("concat-stream");
var hyperquest = require("hyperquest");
var trumpet = require("trumpet");

var parser = require("./src/parser.js");

module.exports.test = function test(url) {
    parsedurl = urlparser.parse(url);

    if (parsedurl.hostname === "plosone.org")
        return true;

    if (parsedurl.hostname === "www.plosone.org")
        return true;

    if (parsedurl.href === "plosone.org")
        return true;

    if (parsedurl.href === "www.plosone.org")
        return true;

    return false;
};

module.exports.download = function download(url, options) {
    var output = through();

    var request = hyperquest.get(url);

    request.on("response", function (response) {
        output.emit("response", response);
    });

    request.on("error", function (error) {
        output.emit("error", error);
    });

    request.pipe(parser(output));

    return output;
};
