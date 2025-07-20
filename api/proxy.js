const https = require('https');
const HK_IP = '203.198.7.16';

module.exports = async (req, res) => {
  const path = req.query.path || req.url.slice(1);
  const isStatic = path.includes('static') || path.includes('_next');
  
  const options = {
    hostname: 'www.luogu.com',
    path: '/' + path.replace(/^\/+/, ''),
    method: req.method,
    headers: {
      ...req.headers,
      host: 'www.luogu.com',
      'accept-language': 'en-US',
      'x-forwarded-for': HK_IP,
      'cf-connecting-ip': HK_IP 
    },
    localAddress: true 
  };

  if (isStatic) {
    return https.get(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }).on('error', (e) => {
      console.error('Static error:', e);
      res.status(504).send('HK CDN Timeout');
    });
  }

  const proxy = https.request(options, (proxyRes) => {
    const headers = { 
      ...proxyRes.headers,
      'x-vercel-region': 'hkg1'
    };
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxy);
  proxy.on('error', (e) => {
    console.error('香港代理出了点问题:', e);
    res.status(502).json({ error: "不好意思，香港节点代理失败，或许后面会上线更多节点。。。" });
  });
};
