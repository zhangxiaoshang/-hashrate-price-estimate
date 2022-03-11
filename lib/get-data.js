const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");
const cheerio = require("cheerio");

const difficultyApi = "https://explorer.api.btc.com/stats/insight/difficulty?";
const hashratePageURL = "https://btc.com/btc/insights-hashrate";
const hashrateApi = "https://explorer.api.btc.com/stats/insight/hashrate";
const aaveMarketsPageURL = "https://app.aave.com/#/markets";

const getGH = (hashrate) => {
  if (!hashrate || !hashrate.length) return 0;

  const hashrate_last7 = hashrate.slice(0, 7);

  const hashrate_last7_avg =
    hashrate_last7.reduce((pre, cur) => pre + cur / 1e18, 0) / 7;
  const hashrate_last365_avg =
    hashrate.slice(0, 365).reduce((pre, cur) => pre + cur / 1e18, 0) / 365;

  return (hashrate_last7_avg - hashrate_last365_avg) / hashrate_last365_avg;
};

const fn = async () => {
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
    let wbtcAPR;

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

    console.timeEnd("ifficulty");

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

    // get WBTC APY from https://app.aave.com/#/markets
    await page.goto(aaveMarketsPageURL);
    const selector = ".Markets__mobile--cards";
    await page.waitForSelector(selector);
    const htmlString = await page.$eval(selector, (el) => el.outerHTML);
    const $ = cheerio.load(htmlString);
    const nodes = $(selector);
    nodes.find(".MarketMobileCard").each((i, elem) => {
      const tokenName = $(elem)
        .find(".TokenIconWithFullName .TokenIcon__name b")
        .text();

      if (tokenName === "WBTC Coin") {
        const textNodes = $(elem).find(
          ".MarketMobileCard__cards>.MarketMobileCard__card:first-child .ValuePercent > p.ValuePercent__value"
        );
        textNodes.each((i, elem) => {
          wbtcAPR = wbtcAPR
            ? wbtcAPR + parseFloat($(elem).text())
            : parseFloat($(elem).text());
        });

        console.log("wbtcAPR", wbtcAPR);
      }
    });

    await browser.close();
    console.timeEnd("aaveMarkets");

    // 通过币安API获取BTC的月度MA3(季度价格)
    const response = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1M&limit=12"
    );
    const data = await response.json();
    console.log("data: ", data);
    let last3_price_sum = 0;
    data
      .reverse()
      .slice(0, 3)
      .forEach(
        ([
          open_time,
          open_price,
          heigh_price,
          low_price,
          close_price,
          volume,
          close_time,
          amount,
        ]) => {
          last3_price_sum += parseFloat(close_price);
        }
      );
    const monthMa3 = last3_price_sum / 3;

    console.timeEnd("aaveMarkets");

    const result = {
      gH: getGH(hashrate),
      statistics_timestamp,
      difficulty,
      difficulty_statistics_timestamp,
      wbtcAPR: wbtcAPR / 1e2,
      monthMa3,
      update_at: Date.now(),
    };

    console.log(result);

    return result;
  } catch (error) {
    console.log("---", error);
    return null;
  }
};

export default fn;
