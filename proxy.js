 puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const TARGET_HOST = 'https://www.luogu.com';

module.exports = async (req, res) => {
  const userPath = req.url.startsWith('/') ? req.url : `/${req.url}`;
  const targetUrl = `${TARGET_HOST}${userPath}`;
  
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: [...chromium.args, '--disable-gpu'],
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36');
    
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await page.addScriptTag({
      content: `
        document.addEventListener('error', e => {
          if(e.target.tagName === 'SCRIPT') {
            e.target.src = e.target.src.replace(/^https?:\\/\\/[^\\/]+/, '');
          }
        }, true);
      `
    });

    const processedHtml = await page.evaluate(() => {
      document.querySelectorAll('[src^="/"], [href^="/"]').forEach(el => {
        if(el.src) el.src = el.src;
        if(el.href) el.href = el.href;
      });
      return document.documentElement.outerHTML;
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(processedHtml);
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    res.status(500).send(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>服务异常提示</title><style>body{font-family:'Arial',sans-serif;background-color:#f5f7fa;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;color:#333}.error-container{background:white;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);padding:40px;text-align:center;max-width:500px;width:90%}.error-icon{font-size:60px;color:#ff5252;margin-bottom:20px}h1{color:#ff5252;margin-bottom:15px;font-size:24px}p{margin-bottom:25px;line-height:1.6;color:#666}.btn{background-color:#4285f4;color:white;border:none;padding:12px 24px;border-radius:6px;font-size:16px;cursor:pointer;transition:background-color 0.3s}.btn:hover{background-color:#3367d6}.error-details{margin-top:20px;font-size:14px;color:#999}</style></head><body><div class="error-container"><div class="error-icon">⚠️</div><h1>代理服务异常</h1><p>当前代理服务器连接出现问题，可能导致部分功能无法正常使用。</p><button class="btn" onclick="location.reload()">重新加载</button><div class="error-details"><p>错误代码:PROXY_503|时间:<span id="current-time"></span></p></div></div><script>document.getElementById('current-time').textContent=new Date().toLocaleString();</script></body></html>`);
  } finally {
    if (browser) await browser.close();
  }
};
