const express = require("express");
const mysql = require("mysql2");
const cors = require('cors')

const cookieSession = require('cookie-session');
const passport = require("passport");
const passportJwt = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');
const { PORT, SESSION_SECRET, CLIENT_ID, CALLBACK_URL, CLIENT_SECRET, COOKIE_KEYS } = require("./config/app.config.js").security;
const { HOST, USER, DATABASE, PASSWORD } = require("./config/app.config.js").database;
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connection = mysql.createConnection({
  host: HOST,
  user: USER,
  database: DATABASE,
  password: PASSWORD,
  multipleStatements: true,// ';'区切りで，複数のクエリを一度に送信可能
});
app.use(cors());
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(cookieSession({
  name: 'session',
  keys: [COOKIE_KEYS],
  maxAge: 24 * 60 * 60 * 1000 // 生存時間（ミリ秒），24 hours
}))


app.use(passport.initialize());
app.use(session({
  secret: SESSION_SECRET,
}));
app.use(passport.session());

// ユーザ情報をセッションへ保存（シリアライズ）
passport.serializeUser((user, done) => {
  done(null, user);
});

// req.userにユーザ情報を格納
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        proxy: true
    }, (accessToken, refreshToken, profile, done) => {
        if (profile) {
          console.log('ID: '+profile.id);
          console.log('Name: '+profile.displayName);
          console.log('Email : '+profile.emails[0].value);
          // MySQLのユーザテーブルにprofile.id登録（いなければ）
          // ~下のみたいな(mongoDBの場合)
          // User.findOne({ googleId: profile.id });
          // if (exiting) {
          //   return done(null, exiting);
          // }
          //   const user=await new User({ googleId: profile.id }).save();
          //   done(null, user);
          return done(null, profile);
        }
        else {
            return done(null, false);
        }
    }
));

//認証をgoogleにさせる
app.get('/auth/google', passport.authenticate('google', {
  scope: ["profile", "email"]
  // scope: ['https://www.googleapis.com/auth/plus.login']
}));

app.get('/auth/google/callback',
    passport.authenticate('google',{
      failureRedirect: '/',  // 失敗したときの遷移先
    }),
    (req, res) => {
      // console.log(res.user)  // 認証に成功したときの処理
      res.redirect('/main');
    }

);

//ログアウト
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get("/api", (req, res) => {
  console.log("Hello!");
});

app.listen(PORT, () => {
  console.log(`listening port ${PORT}`)
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