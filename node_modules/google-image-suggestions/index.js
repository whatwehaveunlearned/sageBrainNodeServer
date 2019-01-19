'use strict';

let request = require('request');
let cheerio = require('cheerio');

let userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.67 Safari/537.36';

module.exports = {
  get(term, callback){
    let url = 'https://www.google.co.uk/search?tbm=isch&q=' + term;

    request(url, (err, res, html) => {
      let $ = cheerio.load(html);
      let suggestions = $('._Bmc a');
      if (err){
        callback(err);
        return;
      }

      let out = {
        suggestions: false,
        list: []
      };
      suggestions.each((index, el) => {
        let suggestion = {
          full: $(el).text(),
          extra: $(el).find('b').text()
        };
        out.list.push(suggestion);
        out.suggestions = true;
      });
      callback(null, out);
    });
  },

  getNew(term, callback){
    let opts = {
      url: `https://encrypted.google.com/search?tbm=isch&q=${term}`,
      headers: {
        'User-Agent': userAgent
      }
    };

    request(opts, (err, res, html) => {
      let $ = cheerio.load(html);
      let suggestions = $('.chip span');
      let out = {
        suggestions: false,
        list: []
      };

      suggestions.each((index, el) => {
        let suggestion = {
          full: `${$(el).text()} ${term}`,
          extra: $(el).text()
        };
        out.list.push(suggestion);
        out.suggestions = true;
      });
      callback(null, out);
    });
  }
};
