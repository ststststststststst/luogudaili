 https = require('https');
module.exports = (req, res) => {
  const path = req.url.replace(/^\/api\//, '');
  https.get({
    hostname: 'www.luogu.com',
    path: '/' + path,
    headers: {
      ...req.headers,
      host: 'www.luogu.com',
      'x-real-ip': '203.198.7.16'
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  }).on('error', () => res.status(502).end());
};
