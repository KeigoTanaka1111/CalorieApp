const express = require("express");
const mysql = require("mysql2");
const cors = require('cors')

// const passportJwt = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');
const cookieSession = require('cookie-session');
const passport = require("passport");
const app = express()

const { PORT, SESSION_SECRET, CLIENT_ID, CALLBACK_URL, CLIENT_SECRET, COOKIE_KEYS } = require("./config/app.config.js").security;
const { HOST, USER, DATABASE, PASSWORD } = require("./config/app.config.js").database;

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
  // maxAge: 24 * 60 * 60 * 1000, // 生存時間（ミリ秒），24 hours,
  maxAge: 24 // 生存時間（ミリ秒），24 hours
}))


app.use(passport.initialize());
// app.use(session({
//   secret: SESSION_SECRET,
// }));
app.use(passport.session({
  secret: SESSION_SECRET,
}));

// ユーザ情報をセッションへ保存（シリアライズ）req.session.passport.userに入る
passport.serializeUser((user, done) => {
  done(null, user.id);
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
          connection.query(`
            SELECT EXISTS(SELECT * FROM user WHERE user_id = ${profile.id}) AS exist_check;
            `,
            (err, results, fields) => {
              console.log(results)
              if(results[0].exist_check == 0){// userに未登録のユーザならその情報を追加
                connection.query(`
                  INSERT INTO user VALUES(${profile.id}, 10);
                  `,
                  (err, results, fields) => {
                    console.log("きちゃった")
                  }
                )
              }
              else{// テスト用
                console.log("登録済みだよ")
              }
            }
          )
          return done(null, profile);
        }
        else {
            return done(null, false);
        }
    }
));

//認証をgoogleにさせる
app.get('/auth/google', passport.authenticate('google', {
  scope: ["profile"]
  // scope: ["profile", "email"]
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
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  })
  // req.logOut();
  // res.redirect('/');
});

app.get("/registerFood", (req, res) => {
  // console.log("registerFood!");
  // console.log(req.query);
  // query = `INSERT INTO food VALUES(0, "${req.query.foodName}", ${req.query.id}, ${req.query.foodCalorie});`
  // console.log(query)
  connection.query(
    `INSERT INTO food VALUES(0, "${req.query.foodName}", ${req.query.id}, ${req.query.foodCalorie});`,
    (err, results, fields) => {
      // console.log(results);
      res.send(results);
    }
  );
});

app.get("/registeredFood", (req, res) => {
  connection.query(
    `SELECT * FROM food WHERE user_id=${req.query.user_id};`,
    (err, results, fields) => {
      // console.log(results);
      res.send(results);
    }
  );
});

app.get("/register", (req, res) => {
  query = `INSERT INTO register VALUES(0, ${req.query.food_id}, ${req.query.user_id}, ${req.query.date});`
  console.log(query)
  connection.query(
    `INSERT INTO register VALUES(0, ${req.query.food_id}, ${req.query.user_id}, "${req.query.date}");`,
    (err, results, fields) => {
      // console.log(results);
      res.send(results);
    }
  );
});

app.get("/registered", (req, res) => {
  connection.query(
    `SELECT * FROM register WHERE user_id=${req.query.user_id};`,
    (err, results, fields) => {
      // console.log(results);
      res.send(results);
    }
  );
});

app.get("/delete", (req, res) => {
  connection.query(
    `DELETE FROM register WHERE id=${req.query.id};`,
    (err, results, fields) => {
      console.log(results);
      res.send(results);
    }
  );
});
app.get("/user", (req, res) => {
  console.log(req.query.user_id)
  connection.query(
    `SELECT * FROM user WHERE user_id=${req.query.user_id};`,
    (err, results, fields) => {
      console.log(results);
      res.send(results);
    }
  );
});
app.get("/registerDecrement", (req, res) => {
  console.log("registerDecrementのregisterable:"+req.query.registerable)
  connection.query(
    `UPDATE user SET registerable=${req.query.registerable} WHERE user_id=${req.query.user_id};`,
    (err, results, fields) => {
      console.log(results);
      res.send(results);
    }
  );
});

app.listen(PORT, () => {
  console.log(`listening port ${PORT}`)
})