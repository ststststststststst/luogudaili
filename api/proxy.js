import fetch from 'node-fetch';

export default async (req, res) => {
  try {
    const targetUrl = `https://www.luogu.com${req.url}`; 

    if (req.url.includes("/lg4/captcha")) {
      const captchaResp = await fetch(targetUrl, {
        headers: {
          "Host": "www.luogu.com",
          "Cookie": req.headers.cookie || "",
          "User-Agent": "Mozilla/5.0"
        }
      });
      res.setHeader("Content-Type", captchaResp.headers.get("content-type"));
      return captchaResp.body.pipe(res);
    }

    const response = await fetch(targetUrl, {
      headers: {
        ...req.headers,
        "Host": "www.luogu.com"  
      }
    });
    if (response.headers.get("content-type")?.includes("text/html")) {
      let html = await response.text();
      html = html.replace(
        /(src|href)=(["'])(\/[^"']+)/g,
        `$1=$2https://${req.headers.host}$3`
      );
      res.send(html);
    } else {
      response.body.pipe(res);
    }
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
