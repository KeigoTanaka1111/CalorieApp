const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const passport = require("passport");

const app = express()

const { PORT, SESSION_SECRET, CLIENT_ID, CALLBACK_URL, CLIENT_SECRET, COOKIE_KEYS } = require("./config/app.config.js").security;
const { HOST, USER, DATABASE, PASSWORD } = require("./config/app.config.js").database;
const { SECRET_KEY } = require("./config/app.config.js").stripe;
const stripe = require('stripe')(SECRET_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// MySQLとのコネクションの確立，切れた場合は再接続
const handleDisconnect = () => {
  connection = mysql.createConnection({
    host: HOST,
    user: USER,
    database: DATABASE,
    password: PASSWORD,
    multipleStatements: true,// ';'区切りで，複数のクエリを一度に送信可能
  });
  //connection取得
  connection.connect((err) => {
    if (err) {
      console.log('ERROR.CONNECTION_DB: ', err);
      setTimeout(handleDisconnect, 1000);
    }
  });
  //error('PROTOCOL_CONNECTION_LOST')時に再接続
  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('ERROR.CONNECTION_LOST: ', err);
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.use(cors());
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(cookieSession({
  name: 'session',
  keys: [COOKIE_KEYS],
  maxAge: 24 * 60 * 60 * 1000, // 生存時間（ミリ秒），24 hours,
  // maxAge: 24 // 生存時間（ミリ秒）
}))

app.use(passport.initialize());
app.use(passport.session({ // cookieSessionとかexpress-sessionの後に
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

/*
GoogleStrategyの作成
新規ユーザならuserテーブルに追加
*/
passport.use(new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        proxy: true
    }, (accessToken, refreshToken, profile, done) => {
        if (profile) {
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
                    console.log("新規登録:"+profile.id)
                  }
                )
              }
              else{// テスト用
                // console.log("登録済み")
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
}));

app.get('/auth/google/callback',
  passport.authenticate('google',{//フォローアップリクエストでcodeの値を再確認
    failureRedirect: '/',  // 失敗したときの遷移先
  }),
  (req, res) => {
    // console.log(res.user)  // 認証に成功したときの処理
    res.redirect('/main');
  }
);

//ログアウト
app.get('/logout', (req, res) => {
  req.session = null;
  res.clearCookie('connect.sid');
  res.redirect('/');
});

// 食品名とカロリーをuserに紐付けて登録
app.post("/registerFood", (req, res) => {
  query = `INSERT INTO food VALUES(0, "${req.body.foodName}", ${req.user}, ${req.body.foodCalorie});`
  console.log(query)
  connection.query(
    `INSERT INTO food VALUES(0, "${req.body.foodName}", ${req.user}, ${req.body.foodCalorie});`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// ユーザが登録した食品情報を取得
app.get("/registeredFood", (req, res) => {
  connection.query(
    `SELECT * FROM food WHERE user_id=${req.user};`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// 食事内容(食品情報，日付など)を登録
app.post("/register", (req, res) => {
  connection.query(
    `INSERT INTO register VALUES(0, ${req.body.food_id}, ${req.user}, "${req.body.date}");`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// ユーザの食事内容一覧を取得
app.get("/registered", (req, res) => {
  connection.query(
    `SELECT * FROM register WHERE user_id=${req.user};`,
    // `SELECT * FROM register WHERE user_id=${req.query.user_id};`,
    (err, results, fields) => {
      console.log("registered:"+JSON.stringify(results));
      res.send(results);
    }
  );
});

// 選択された食事内容を削除
app.post("/delete", (req, res) => {
  connection.query(
    `DELETE FROM register WHERE id=${req.body.id};`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// ユーザ情報を取得
app.get("/user", (req, res) => {
  connection.query(
    `SELECT * FROM user WHERE user_id=${req.user};`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// 登録可能数を1減らす
app.post("/registerDecrement", (req, res) => {
  connection.query(
    `UPDATE user SET registerable=${req.body.registerable} WHERE user_id=${req.user};`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});

// stripeによる決済（test）
app.post("/api/stripe", async(req, res) => {
  const charge = await stripe.charges.create({ //stripe.chargesとか調べる
    amount: 100,
    currency: "JPY",//日本円ならjpy
    source: req.body.token.id,
  });
  // 今回はテスト用だが，本来なら上のchargeをstripeAPIに送り，決済
  //登録可能数を10増やす
  connection.query(
    `UPDATE user SET registerable=${req.body.registerable + 10} WHERE user_id=${req.user};`,
    (err, results, fields) => {
      res.send(results);
    }
  );
});
app.get('*', (req, res, next) => {
  res.sendFile('index.html', {root: 'public'});  //クライアントにindex.html
});
app.listen(process.env.PORT ||PORT, () => {
  console.log(`listening port ${PORT}`);
});
