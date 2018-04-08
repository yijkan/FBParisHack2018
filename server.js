"use strict";
// This is accomplished with a help from the example open source of Jared HANDSON
// big credit to him, here's the link to his repo: https://github.com/jaredhanson 
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
const https = require('https');
const fs = require('fs');
const execSync = require('child_process').execSync;
const port = 3000

const httpsOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
}

// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  clientID: 240447903194882 || process.env.CLIENT_ID,
  clientSecret: "015a9838fbcefb810c5d022b73226185" || process.env.CLIENT_SECRET,
  callbackURL: 'https://localhost:3000/login/facebook/return',
  profileFields: ['displayName', 'feed.limit(4)']
},
  function (accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function (req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function (req, res) {
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook', { scope: 'user_posts' }));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login', scope: 'user_posts' }),
  function (req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render('profile', { user: req.user, post_user: req.user._json.feed.data });
    analyse_text(req.user._json.feed);
  });

const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})

let analyse_text = function (result) {
  let watson_text = require('./watson-test.js');
  let messages = [];
  for (let i in result.data) {
    messages.push(result.data[i].message);
  }
  // console.log(messages);
  watson_text = watson_text.analyse();
  let results = [];
  let promise;
  for (let i in messages) {
    if (i == 0) {
      promise = watson_text(messages[0]);
    } else {
      promise = promise.then(
        function(result) {
          // console.log(result);
          results.push(result);
          return watson_text(messages[i]);
        },
        function(error) {
          console.log("error");
        }
      );
    }
  }
  if (promise) {
    promise.then(
      function(result) {
        // console.log(result);
        results.push(result);
        var stmt = mk_matlab_stmt(results);
        var response = execSync('matlab -nodisplay -nojvm -nosplash -nodesktop -r "' + stmt + ';quit"');
        //var response = execSync('echo "' + stmt + '"');

        var Sound = require('node-aplay');
        // fire and forget: 
        console.log("started to play");
        new Sound('./output.wav').play();
      },
      function(error) {
        console.log("error");
      }
    );
  }

  // const request = require('request-promise');
  // const user = require('./config.js');


  // const options = {
  //   method: 'GET',
  //   uri: 'https://graph.facebook.com/545189548932708/feed',
  //   qs: {
  //     access_token: user.hao.access_token,
  //     limit: 3
  //   }
  // };
  // request(options).then(fbRes => {
  //   let result = JSON.parse(fbRes);
  //   let message = [];
  //   for (let i in result.data) {
  //     message.push(result.data[i].message);
  //   }
  //   watson_text = watson_text.analyse();
  //   let final_result = watson_text(message[2]);
  //   console.log(message[2]);
  // })
}

function len_str(word_lengths) {
  let str = ", [";
  for (let i in word_lengths) {
    str = str + " " + word_lengths[i];
  }
  str = str + "]";
  return str;
}

function mk_list_item(obj) {
  let str = obj.emotions.sadness + ", " + obj.emotions.joy + ", " + obj.emotions.fear + ", ";
  str = str + obj.emotions.disgust + ", " + obj.emotions.anger + ", " + obj.sentiment;
  str = str + len_str(obj.word_lengths);
  return str;
}

function mk_matlab_stmt(obj_array) {
  let str = "music({";
  for (let i in obj_array) {
    str = str + mk_list_item(obj_array[i]) + "; ";
  }
  return str + "})";
}
