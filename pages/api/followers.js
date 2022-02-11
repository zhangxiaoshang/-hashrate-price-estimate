const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const chrome = require("chrome-aws-lambda");

const fn = async (req, res) => {
  const slug = req?.body?.TWuser;
  if (!slug) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ id: null }));
    return;
  }

  console.log("slug: ", slug);
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "production"
      ? {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        }
      : {}
  );

  const page = await browser.newPage();
  page.setUserAgent(
    "Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru) Presto/2.8.119 Version/11.10"
  );
  await page.goto(`https://m.youtube.com/${slug}/videos`);

  let content = await page.content();
  var $ = cheerio.load(content);
  $.prototype.exists = function (selector) {
    return this.find(selector).length > 0;
  };

  let id = null;
  const isLive = $("body").exists('[data-style="LIVE"]');
  if (isLive) {
    const url = $("ytm-compact-video-renderer .compact-media-item-image").attr(
      "href"
    );
    console.log("url:", url);
    const arr = url.split("?v=");
    id = arr[1];
  }

  await browser.close();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ id }));
};

export default fn;
