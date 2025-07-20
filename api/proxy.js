
const TARGET = "https://www.luogu.com";
const BAD_REQUESTS = new Set(['javascript:void(0)']);

export default async (req, res) => {
  const urlStr = req.url.startsWith('/') ? req.url.slice(1) : req.url;
  
  if (BAD_REQUESTS.has(urlStr.toLowerCase())) {
    return res.status(204).end(); 
  }

  const url = new URL(urlStr, TARGET);
  const headers = {
    ...req.headers,
    host: new URL(TARGET).hostname,
    'x-forwarded-host': req.headers.host,
    'x-real-ip': req.headers['x-real-ip'] || '8.8.8.8'
  };
  
  try {
    const resp = await fetch(url, {
      headers,
      redirect: 'manual',
      credentials: 'omit'
    });
    [...resp.headers].forEach(([k, v]) => {
      if (!['content-security-policy'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });

    return res.status(resp.status).send(await resp.text());
  } catch (e) {
    console.error(`Proxy Error [${url}]:`, e);
    return res.status(502).json({ 
      error: "Bad Gateway",
      originalUrl: url.toString() 
    });
  }
};
