var http = require('http');
/* everyone makes a local watson-cred.js
   in the following format:
module.exports = {
  'username': '',
  'password': '',
  'version': '2018-03-16'
*/

var user = require('./watson-cred.js');
var NLU = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NLU(user);

var text = "I'm so happy!";

var tokenizer = require('string-tokenizer');
var tokens_result = tokenizer().input(text).token('word', /[\w]+/).resolve();
var tokens = tokens_result.word;
var word_lengths = tokens.map(s => s.length);
    
var parameters = {
    'text': text,
    'features': {
	'emotion': {},
	'sentiment': {},
    }
};
natural_language_understanding.analyze(parameters, function(err, response) {
    if (err) {
	console.log('error:', err);
    } else {
	console.log(JSON.stringify(response, null, 2));
	console.log(word_lengths);
	http.createServer(function (req, res) {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write('Emotions: ');
	    res.write(JSON.stringify(response.emotion.document.emotion));
	    res.write('Sentiment: ' + JSON.stringify(response.sentiment.document.score));
	    res.end();
	}).listen(8080);
    }
});
