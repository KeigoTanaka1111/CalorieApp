const { createProxyMiddleware }  = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    ["/api", "/auth/google", "/logout"],
    createProxyMiddleware({
      target: "http://localhost:8080"//サーバ側のポート
    })
  );
};