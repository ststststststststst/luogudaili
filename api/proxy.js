
export default async (req, res) => {
  const targetUrl = new URL(req.url, "https://www.luogu.com").href;

  if (req.url.startsWith("/lg4/captcha")) {
    const response = await fetch(targetUrl, {
      headers: {
        "Host": "www.luogu.com",
        "Cookie": req.headers.cookie || "",
        "User-Agent": "Mozilla/5.0"
      }
    });
    response.body.pipe(res);
    return;
  }
  const response = await fetch(targetUrl, { headers });
  const html = await response.text();
  res.send(html.replace(
    /(src|href)=(["'])(\/[^"']+)/g, 
    `$1=$2https://${req.headers.host}$3`
  ));
};
