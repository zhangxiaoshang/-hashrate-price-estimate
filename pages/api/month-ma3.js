export default async function monthMa3(req, res) {
  try {
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

    res.json({ monthMa3 });
  } catch (error) {
    res.end(null);
  }
}
