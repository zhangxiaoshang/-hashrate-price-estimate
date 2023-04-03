const TIME_LOG = "getPc";

/**
 * @deprecated 由于binance api限现在弃用，使用okx api 替换
 * @date 2023.04.03
 * @param {*} req
 * @param {*} res
 */
// export default async function monthMa3(req, res) {
//   try {
//     console.time(TIME_LOG);

//     const response = await fetch(
//       "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30"
//     );
//     const data = await response.json();

//     let sum = 0;
//     data.forEach(
//       ([
//         open_time,
//         open_price,
//         heigh_price,
//         low_price,
//         close_price,
//         volume,
//         close_time,
//         amount,
//       ]) => {
//         sum += parseFloat(close_price);
//       }
//     );
//     const Pc = sum / data.length;
//     res.json({ Pc });
//   } catch (error) {
//     res.end(null);
//   } finally {
//     console.timeEnd(TIME_LOG);
//   }
// }

export default async function monthMa3(req, res) {
  try {
    console.time(TIME_LOG);

    const response = await fetch(
      "https://www.okx.com/api/v5/market/candles?instId=BTC-USDT&bar=1D&limit=31"
    );
    const data = await response.json();

    if (data.code === "0") {
      const klines = data.data.filter((item) => item[item.length - 1] === "1"); // k线已完结

      let sum = 0;
      klines.forEach(([ts, o, h, l, c]) => {
        sum += parseFloat(c);
      });
      const Pc = sum / klines.length;
      res.json({ Pc });
    } else {
      console.log("monthMa3 res with error code:", data);
    }
  } catch (error) {
    res.end(null);
  } finally {
    console.timeEnd(TIME_LOG);
  }
}
