const { createProxyMiddleware }  = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    ["/api", "/auth/google", "/logout", "/registerFood", "/registeredFood", "/register", "/registered", "/delete", "/user", "/registerDecrement"],
    createProxyMiddleware({
      target: "http://localhost:8080"//サーバ側のポート
    })
  );
};