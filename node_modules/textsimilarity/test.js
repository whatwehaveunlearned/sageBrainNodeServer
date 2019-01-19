var assert = require('assert');
var textsimilarity = require('./index.js');

it("should return 1", function(){
	assert.equal(textsimilarity("a", "a"), 1);
});

it("should return 1, cause its a similar", function(){
	var text1 = "This is very simple test";
	var text2 = "Test is very simple this";
	assert.equal(Math.round(textsimilarity(text1, text2)), 1);
});

it("should return 0", function() {
	var text1 = "This is great band";
	var text2 = "Do it";
	assert.equal(textsimilarity(text1, text2),0);
});

it("should return 0 as missing first argument", function() {
	assert.equal(textsimilarity('', 'node js'), 0);
});

it("should return 0 as missing second argument", function() {
	assert.equal(textsimilarity('node js', ''), 0);
});

it("should return 0.5", function(){
	var text1 = "Its a great day";
	var text2 = "it was a great night";
	assert.equal(textsimilarity(text1, text2), 0.4472135954999579);
});