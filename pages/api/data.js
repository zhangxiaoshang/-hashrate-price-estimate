const puppeteer = require("puppeteer");
const chrome = require("chrome-aws-lambda");

const fn = async (req, res) => {
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

  let difficulty;
  let difficulty_statistics_timestamp;
  await page.goto(`https://btc.com/btc/insights-difficulty`);
  const difficultyApi = "https://explorer.api.btc.com/stats/insight/difficulty";
  const someResponse = await page.waitForResponse((response) =>
    response.url().startsWith(difficultyApi)
  );

  if (someResponse.url().startsWith(difficultyApi)) {
    const res = await someResponse.json();
    difficulty = res.data.btc.list;
    difficulty_statistics_timestamp = res.data.btc.statistics_timestamp;
  }

  let hashrate;
  let statistics_timestamp;
  await page.goto(`https://btc.com/btc/insights-hashrate`);
  const targetApi = "https://explorer.api.btc.com/stats/insight/hashrate";
  const finalResponse = await page.waitForResponse((response) =>
    response.url().startsWith(targetApi)
  );

  if (finalResponse.url().startsWith(targetApi)) {
    const res = await finalResponse.json();
    hashrate = res.data.btc.list;
    statistics_timestamp = res.data.btc.statistics_timestamp;
  }

  await browser.close();

  res.status(200).json(
    JSON.stringify({
      hashrate,
      statistics_timestamp,
      // difficulty: difficulty[0],
      difficulty: 26690525287405 / 1e3,
      difficulty_statistics_timestamp,
    })
  );
};

export default fn;
