"use strict";
const request = require('request-promise');
const user = require('./config.js');
let watson_text = require('./watson-test.js');

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
    let message =  [];
    for(let i in result.data){
        message.push(result.data[i].message);
    }
    watson_text = watson_text.analyse();
    let final_result = watson_text(message[2]);
    console.log(message[2]);
})



const execSync = require('child_process').execSync;
//var response = execSync('matlab -nodisplay -nojvm -nosplash -nodesktop -r "try, run (\'my_script.m\'), catch, exit(1), end, exit(0);"');
