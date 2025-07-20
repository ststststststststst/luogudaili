const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  createProxyMiddleware({
    target: 'https://www.luogu.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/proxy': ''
    }
  })(req, res);
};
