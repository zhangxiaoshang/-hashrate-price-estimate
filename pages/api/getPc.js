const TIME_LOG = "getPc";

export default async function monthMa3(req, res) {
  try {
    console.time(TIME_LOG);

    const response = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30"
    );
    const data = await response.json();

    let sum = 0;
    data.forEach(
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
        sum += parseFloat(close_price);
      }
    );
    const Pc = sum / data.length;
    res.json({ Pc });
  } catch (error) {
    res.end(null);
  } finally {
    console.timeEnd(TIME_LOG);
  }
}
