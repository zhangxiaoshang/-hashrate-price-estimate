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

    page.on("response", async (response) => {
      if (response.url() === pageURL) {
        try {
          const data = await response.json();

          Hg = calcHg(data.data);
        } catch (error) {
          // console.log("invalid response");
        }
      }
    });

    await page.setViewport({ width: 1440, height: 2600 });
    await page.goto(pageURL);

    await browser.close();

    res.json({ Hg });
  } catch (err) {
    console.log("err:", err);
    res.end(null);
  } finally {
    console.timeEnd(GETHG_TIME);
  }
}
