const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");
const BN = require("bn.js");

const iPhone = puppeteer.devices["iPhone 6"];
const pageURL = "https://www.f2pool.com/coin/bitcoin";

const calcHg = (data) => {
  const sum = data.reduce((prev, cur) => prev + cur.hashrate / 1e3, 0);

  return sum / data.length;
};

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

    page.on("response", async (response) => {
      if (response.url() === pageURL) {
        try {
          console.log("cached ============");

          const data = await response.json();

          Hg = calcHg(data.data);
          console.log("Hg:", Hg);
        } catch (error) {
          console.log("invalid response");
        }
      }
    });

    await page.setViewport({
      width: 1440,
      height: 2600,
    });
    await page.goto(pageURL);

    // const finalResponse = await page.waitForResponse((response) => {
    //   return response.url() === pageURL;
    // });

    // if (finalResponse.url() === pageURL) {
    //   const response = await finalResponse.json();
    //   console.log("✅");

    //   if (response.status === "ok") {
    //     Hg = calcHg(response.data);
    //   }
    // }

    await browser.close();

    res.json({ Hg });
  } catch (err) {
    console.log("err:", err);
    res.end(null);
  }
}
