"use strict";
const request = require('request-promise');
const user = require('./config.js');
let watson_text = require('./watson-test.js');
let execSync = require('child_process').execSync;

/*
const options = {
    method: 'GET',
    uri: 'https://graph.facebook.com/545189548932708/feed',
    qs: {
      access_token: user.hao.access_token,
      limit:3      
    }
};
request(options).then(fbRes => {
    let result = JSON.parse(fbRes);
    let message = [];
    for(let i in result.data){
        message.push(result.data[i].message);
    }
    analyze_messages(message);
})
*/
function len_str(word_lengths) {
    let str = "";
    for (let i in word_lengths) {
        str = " " +  str + word_lengths[i];
    }
    str = str + "]";
    return str;
}

function mk_list_item(obj) {
    let str = "[" + obj.emotions.sadness + " " + obj.emotions.joy + " " + obj.emotions.fear + " ";
    str = str + obj.emotions.disgust + " " + obj.emotions.anger + " " + obj.sentiment;
    str = str + len_str(obj.word_lengths);
    return str;
}

function mk_matlab_stmt(obj_array) {
    let str = "[";
    for (let i in obj_array) {
        str = str + mk_list_item(obj_array[i]) + " ";
    }
    return str + "]";
}

function analyze_messages(messages) {
    watson_text = watson_text.analyse();
    let results = [];
    let promise;
    for (let i in messages) {
        if (i == 0) {
            promise = watson_text(messages[0]);
        } else {
            promise = promise.then(
                function(result) {
                    results.push(result);
                    return watson_text(messages[i]);
                },
                function(error) {
                    print("error");
                }
            );
        }
    }
    if (promise) {
        promise.then(
            function(result) {
                results.push(result);
                var stmt = mk_matlab_stmt(results);
                // var response = execSync('matlab -nodisplay -nojvm -nosplash -nodesktop -r "' + stmt + '"');
                var response = execSync('echo "' + stmt + '"');
                console.log(response.toString()); // prints echoed text to console
            },
            function(error) {
                print("error");
            }
        );
    }
}

analyze_messages(["hello everyone", "hello everyone"]);
