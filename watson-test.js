"use strict";
let NLU = require('watson-developer-cloud/natural-language-understanding/v1.js');
let tokenizer = require('string-tokenizer');

module.exports = {
    analyse: function () {
        let nlu = new NLU({
            'username': '3f9b8595-b15b-4432-a413-43b72d93fbf8',
            'password': 'HvFtLfWWbccR',
            'version': '2018-03-16'
        });

        return function(text) {
            return new Promise(function(resolve, reject) {
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
                nlu.analyze(parameters, function (err, response) {
                    if (err) {
                        console.log('error:', err);
                        reject(err);
                    } else {
                        var emotions = response.emotion.document.emotion;
                        var sentiment = response.sentiment.document.score;
                        // console.log('emotions');
                        // console.log(JSON.stringify(emotions, null, 2));
                        // console.log('sentiment');
                        // console.log(JSON.stringify(sentiment));
                        // console.log('word counts');
                        // console.log(word_lengths);

                        resolve({ 'emotions': emotions, 'sentiment': sentiment, 'word_lengths': word_lengths });
                    }
                });
            })
        }
    }
}
