
const https = require('https');
module.exports = (req, res) => {
  const path = req.query.path || '';
  https.get({
    hostname: 'www.luogu.com',
    path: '/' + path,
    headers: {
      'host': 'www.luogu.com',
      'x-real-ip': '203.198.7.16',
      'accept-language': 'en-US'
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'x-vercel-region': 'hkg1'
    });
    proxyRes.pipe(res);
  }).on('error', (e) => {
    console.error(e);
    res.status(502).send('Proxy Error');
  });
};
