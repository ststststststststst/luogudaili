const TARGET = "https://www.luogu.com";

export default async (req, res) => {
  const path = req.query.path || req.url.replace(/^\/api\//, '');
  const url = new URL(path, TARGET);

  const headers = { ...req.headers };
  delete headers['host'];
  delete headers['connection'];
  delete headers['content-length'];

  try {
    const resp = await fetch(url, {
      method: req.method,
      headers: {
        ...headers,
        'Host': new URL(TARGET).hostname,
        'Origin': TARGET,
        'Referer': TARGET
      },
      redirect: 'manual',
      body: req.method !== 'GET' ? req.body : undefined
    });

    [...resp.headers].forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(resp.status).send(await resp.text());
  } catch (e) {
    console.error('Proxy Error:', e);
    return res.status(500).json({ error: "Proxy Error" });
  }
};
