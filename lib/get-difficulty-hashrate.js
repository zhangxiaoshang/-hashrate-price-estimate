const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");

const difficultyApi = "https://explorer.api.btc.com/stats/insight/difficulty?";
const hashratePageURL = "https://btc.com/btc/insights-hashrate";
const hashrateApi = "https://explorer.api.btc.com/stats/insight/hashrate";

const getGH = (hashrate) => {
  if (!hashrate || !hashrate.length) return 0;

  const hashrate_last7 = hashrate.slice(0, 7);

  const hashrate_last7_avg =
    hashrate_last7.reduce((pre, cur) => pre + cur / 1e18, 0) / 7;
  const hashrate_last365_avg =
    hashrate.slice(0, 365).reduce((pre, cur) => pre + cur / 1e18, 0) / 365;

  return (hashrate_last7_avg - hashrate_last365_avg) / hashrate_last365_avg;
};

export default async function getDifficultyHashrate() {
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

    let difficulty;
    let difficulty_statistics_timestamp;
    let hashrate;
    let statistics_timestamp;

    console.time("difficulty");
    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1"
    );

    await page.goto(`https://btc.com/btc/insights-difficulty`);
    const someResponse = await page.waitForResponse((response) =>
      response.url().startsWith(difficultyApi)
    );

    if (someResponse.url().startsWith(difficultyApi)) {
      const res = await someResponse.json();
      difficulty = res.data.btc.list[0].difficulty / 1e3;
      difficulty_statistics_timestamp =
        res.data.btc.statistics_timestamp * 1000;
    }

    console.timeEnd("difficulty");

    console.time("hashrate");
    await page.goto(hashratePageURL);
    const finalResponse = await page.waitForResponse((response) =>
      response.url().startsWith(hashrateApi)
    );

    if (finalResponse.url().startsWith(hashrateApi)) {
      const res = await finalResponse.json();
      hashrate = res.data.btc.list.slice(0, 365).map((item) => item.hashrate);
      statistics_timestamp = res.data.btc.statistics_timestamp;
    }
    console.timeEnd("hashrate");

    await browser.close();

    return {
      difficulty,
      difficulty_statistics_timestamp,
      gH: getGH(hashrate),
      statistics_timestamp,
    };
  } catch (err) {
    return null;
  }
}
