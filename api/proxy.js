 https = require('https');
const TARGET = new URL('https://www.luogu.com');

module.exports = async (req, res) => {
  const path = req.url.replace(/^\/api\//, '');
  const options = {
    hostname: TARGET.hostname,
    path: '/' + path,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET.hostname,
      origin: TARGET.origin,
      referer: TARGET.origin + '/',
      'x-real-ip': req.headers['x-real-ip'] || '8.8.8.8'
    },
    rejectUnauthorized: false 
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
  proxyReq.on('error', (e) => {
    console.error('Proxy error:', e);
    res.status(502).end();
  });
};
