var concat = require("concat-stream");
var trumpet = require("trumpet");
var hyperquest = require("hyperquest");

module.exports = function parser(output) {
    var tr = trumpet();

    methods = [
        parseTitle,
        parsePdfUrl,
    ];

    // setup all of the parsers
    methods.forEach(function process(method) {
        method(tr, output);
    });

    // TODO: are these two necessary?
    tr.on("end", function() {
        output.end();
    });

    tr.on("error", function(error) {
        output.error(error);
    });

    // return the stream
    return tr;
};

var makepipe = module.exports.makepipe = function makepipe(url) {
    return function download(stream) {
        return hyperquest.get(url).pipe(stream);
    };
};

var parseTitle = module.exports.parseTitle = function parseTitle(tr, output) {
    tr.selectAll("title", function (title) {
        title.createReadStream().pipe(concat(function(body) {
            output.queue({title: body.toString()});
        }));
    });
};

var parsePdfUrl = module.exports.parsePdfUrl = function parsePdfUrl(tr, output) {
    // http://dx.plos.org/10.1371/journal.pone.0071334.pdf
    tr.selectAll("meta[name=citation_pdf_url]", function (meta) {
        meta.getAttribute("content", function(pdfurl) {
            var file = {
                "name": "paper.pdf",
                "url": pdfurl,
                "pipe": makepipe(pdfurl),
            };

            var data = {
                "pdfurl": pdfurl,
                "file": file,
            };

            output.queue(data);
        });
    });
};
