const TARGET = "https://www.luogu.com";
export default async (req, res) => {
  const url = new URL(req.url, TARGET);
  const headers = {
    "Host": new URL(TARGET).hostname,
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "X-Forwarded-For": req.headers["x-real-ip"] || "8.8.8.8"
  };
  try {
    const resp = await fetch(url, { headers });
    let html = await resp.text();
    html = html.replace(
      /(href|src)=(["'])(\/[^"']+)/g, 
      `$1=$2https://${req.headers.host}$3`
    );
    res.status(resp.status).send(html);
  } catch (e) {
    res.status(500).send("Proxy Error");
  }
};
