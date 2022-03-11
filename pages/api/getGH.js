const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");

const hashratePageURL = "https://btc.com/btc/insights-hashrate";
const hashrateApi = "https://explorer.api.btc.com/stats/insight/hashrate";

const calcGh = (hashrate) => {
  if (!hashrate || !hashrate.length) return 0;

  const hashrate_last7 = hashrate.slice(0, 7);

  const hashrate_last7_avg =
    hashrate_last7.reduce((pre, cur) => pre + cur / 1e18, 0) / 7;
  const hashrate_last365_avg =
    hashrate.slice(0, 365).reduce((pre, cur) => pre + cur / 1e18, 0) / 365;

  return (hashrate_last7_avg - hashrate_last365_avg) / hashrate_last365_avg;
};

export default async function getGH(req, res) {
  console.log("getGH");

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

    let hashrate;
    let statistics_timestamp;

    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1"
    );

    await page.goto(hashratePageURL);
    // await page.screenshot({ path: "screenshot.png" });

    const finalResponse = await page.waitForResponse((response) =>
      response.url().startsWith(hashrateApi)
    );

    if (finalResponse.url().startsWith(hashrateApi)) {
      const res = await finalResponse.json();
      hashrate = res.data.btc.list.slice(0, 365).map((item) => item.hashrate);
      statistics_timestamp = res.data.btc.statistics_timestamp;
    }

    await browser.close();

    res.json({
      gH: calcGh(hashrate),
      statistics_timestamp,
    });
  } catch (err) {
    console.log("err:", err);
    res.end(null);
  }
}
