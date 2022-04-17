const express = require("express");
const mysql = require("mysql2");
const cors = require('cors')
const passport = require("passport");
const passportJwt = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');
const { SESSION_SECRET, CLIENT_ID, CLIENT_SECRET } = require("./config/app.config.js").security;
const PORT = 5000;
const app = express()


app.disable("x-powered-by");

app.use(passport.initialize());
app.use(cors());


passport.use(new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "上記で設定したロールバック URL"
    }, function(accessToken, refreshToken, profile, done){
          // ここで profile を確認して結果を返す
    }
));

app.listen(PORT, () => {
  console.log(`listening port 5000`)
})

// CREATE TABLE questions (id INT AUTO_INCREMENT, content varchar(255),genre varchar(255),level INT, PRIMARY KEY (id));
// show tables;
// select * from questions;
// desc questions
// ;
// CREATE TABLE choices (id INT AUTO_INCREMENT, questions_id INT,is_answer varchar(255),content varchar(255), PRIMARY KEY (id));
// show tables;

// CREATE TABLE foods (id INT AUTO_INCREMENT, content varchar(255),genre varchar(255),level INT, PRIMARY KEY (id));
// show tables;