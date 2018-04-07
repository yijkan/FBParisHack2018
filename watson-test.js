var http = require('http');

var NLU = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NLU({
    'username': 'ff526fa0-8c44-49bb-9ef0-c1e1f7c52dd5',
    'password': 'Fhdph6EbJIaJ',
    'version': '2018-03-16'
});

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
	    res.end('Hello World!');
	}).listen(8080);
    }
});
