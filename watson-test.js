"use strict";
let NLU = require('watson-developer-cloud/natural-language-understanding/v1.js');
let tokenizer = require('string-tokenizer');
module.exports = {
    analyse: function () {
        let natural_language_understanding = new NLU({
            'username': '3f9b8595-b15b-4432-a413-43b72d93fbf8',
            'password': 'HvFtLfWWbccR',
            'version': '2018-03-16'
        });

        return function(text){
            let tokens_result = tokenizer().input(text).token('word', /[\w]+/).resolve();
            let tokens = tokens_result.word;
            let word_lengths = tokens.map(s => s.length);
            let parameters = {
                'text': text,
                'features': {
                    'emotion': {},
                    'sentiment': {},
                }
            };
            natural_language_understanding.analyze(parameters, function (err, response) {
                if (err) {
                    console.log('error:', err);
                } else {
                    console.log(JSON.stringify(response, null, 2));
                    console.log(word_lengths);
                }
            });
        }
    }
}
