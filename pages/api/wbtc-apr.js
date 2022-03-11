const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");
const cheerio = require("cheerio");

const aaveMarketsPageURL = "https://app.aave.com/#/markets";

export default async function getWbtcAPR(req, res) {
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

    let wbtcAPR;

    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1"
    );

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // get WBTC APY from https://app.aave.com/#/markets

    await page.goto(aaveMarketsPageURL);

    console.timeEnd("page.goto");

    const selector = ".Markets__mobile--cards";

    await page.waitForSelector(selector);

    console.timeEnd("waitForSelector");

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

    browser.close();
    console.timeEnd("aaveMarkets");

    res.json(wbtcAPR);
  } catch (error) {
    console.log("---", error);
    res.end(null);
  }
}
