import fetch from 'node-fetch';

export default async (req, res) => {
  try {
    const TARGET_URL = "https://www.luogu.com";
    const fullUrl = new URL(req.url, TARGET_URL).href;

    if (req.url.includes("/lg4/captcha")) {
      const captchaResp = await fetch(fullUrl, {
        headers: {
          "Host": "www.luogu.com",
          "Cookie": req.headers.cookie || "",
          "User-Agent": "Mozilla/5.0",
          "Referer": TARGET_URL,
        },
      });

      res.setHeader("Content-Type", captchaResp.headers.get("content-type") || "image/png");
      return captchaResp.body.pipe(res);
    }

    const response = await fetch(fullUrl, {
      headers: {
        ...req.headers,
        "Host": "www.luogu.com", 
        "Referer": TARGET_URL,
      },
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
    console.error("代理错误:", error);
    res.status(500).json({
      error: "服务器内部错误",
      message: error.message,
    });
  }
};
