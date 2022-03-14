const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");

const pageURL = "https://www.f2pool.com/coin/bitcoin";
const GETHG_TIME = "getHg";

const calcHg = (data) => {
  const sum = data.reduce((prev, cur) => prev + cur.hashrate / 1e3, 0);

  return sum / data.length;
};

export default async function getHg(req, res) {
  console.time(GETHG_TIME);

  let Hg;

  try {
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

    await page.setViewport({ width: 1440, height: 2600 });
    const gotoAction = page.goto(pageURL);

    await page.waitForResponse(async (response) => {
      try {
        if (response.url() === pageURL) {
          const res = await response.json();
          Hg = calcHg(res.data);

          return res.status === "ok";
        }

        return false;
      } catch (error) {
        return false;
      }
    });

    await gotoAction;
    await browser.close();

    res.json({ Hg });
  } catch (err) {
    console.log("err:", err);
    res.end(null);
  } finally {
    console.timeEnd(GETHG_TIME);
  }
}
