const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");
const BN = require("bn.js");

const iPhone = puppeteer.devices["iPhone 6"];
const pageURL = "https://www.f2pool.com/coin/bitcoin";

export default async function getHg(req, res) {
  console.log("getHg");
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
    // await page.emulate(iPhone);
    await page.setViewport({
      width: 1440,
      height: 2600,
    });
    await page.goto(pageURL);

    const finalResponse = await page.waitForResponse((response) => {
      console.log(response.url());
      return response.url() === pageURL;
    });

    if (finalResponse.url() === pageURL) {
      const response = await finalResponse.json();

      if (response.status === "ok") {
        const sum = response.data.reduce(
          (prev, cur) => prev + cur.hashrate / 1e3,
          0
        );

        Hg = sum / response.data.length;
      }
    }

    await browser.close();

    res.json({ Hg });
  } catch (err) {
    console.log("err:", err);
    res.end(null);
  }
}
