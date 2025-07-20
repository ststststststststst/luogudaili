const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      executablePath: await chrome.executablePath,
      args: chrome.args,
      headless: true,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
      'X-Forwarded-For': '203.198.7.16'
    });

    await page.goto('https://www.luogu.com' + req.url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const content = await page.content();
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
    
  } catch (error) {
    console.error('抱歉，香港代理崩溃了qaq，请刷新或稍后再试...', error);
    res.status(500).send('页面加载失败，请稍后重试');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
