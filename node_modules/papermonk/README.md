# papermonk

Use **papermonk** to extract bibliographic data (including a link to the pdf)
from publishers, while also downloading pdfs and journals, including
supplementary materials.

<img src="http://diyhpl.us/~bryan/images/projects/papermonk.png" />

## install

With [npm](http://npmjs.org/) do:

```
npm install -g papermonk
```

Alternatively, install from git:

```
npm install git://github.com/kanzure/papermonk.git
```

or from a local git repo:

```
git clone git@github.com:kanzure/papermonk.git papermonk
cd papermonk/
npm install .
```

## usage

``` js
var papermonk = require("papermonk");

var options = {
    pdf: true,
}

papermonk.download("http://httpbin.org/get", options, function(bibliodata, pdfstream) {
    console.log("metadata: " + bibliodata);
});
```

## testing

```
node tests.js
```

## TODO

* in-browser tests (probably using browserify)

* example module

* example module testing

## changelog

* v0.0.3 - replace stubbed modules with [papermonk-downloader-plosone](https://github.com/kanzure/papermonk-downloader-plosone)

* v0.0.2 - basic testing

* v0.0.1 - initial commit

## license

BSD
