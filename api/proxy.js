
const TARGET = "https://www.luogu.com";
export default async (req, res) => {
  const url = new URL(req.url, TARGET);
  const headers = {
    ...req.headers,
    "Host": new URL(TARGET).hostname,
    "Origin": TARGET,
    "Referer": `${TARGET}/`,
    "X-Forwarded-For": req.headers["x-real-ip"] || "8.8.8.8",
    "Accept": "application/json, text/plain, */*"
  };
  delete headers["connection"];
  
  try {
    const resp = await fetch(url, {
      headers,
      redirect: "manual",
      credentials: "include"
    });
    if ([301, 302, 307, 308].includes(resp.status)) {
      return res.redirect(resp.headers.get("Location"));
    }
    [...resp.headers].forEach(([key, value]) => {
      if (!["content-encoding"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    
    const content = await resp.text();
    res.status(resp.status).send(content);
  } catch (e) {
    console.error("Proxy Error:", e);
    res.status(502).json({ error: "Proxy Error" });
  }
};
