import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";

const getGH = (hashrate) => {
  const hashrate_last7 = hashrate.slice(0, 7);

  const hashrate_last7_avg =
    hashrate_last7.reduce((pre, cur) => pre + cur / 1e18, 0) / 7;
  const hashrate_last365_avg =
    hashrate.slice(0, 365).reduce((pre, cur) => pre + cur / 1e18, 0) / 365;

  return (hashrate_last7_avg - hashrate_last365_avg) / hashrate_last365_avg;
};

export default function Home({ hashrate, difficulty, statistics_timestamp }) {
  console.log({
    hashrate,
    difficulty,
    statistics_timestamp,
  });
  const [data, setData] = useState({
    H: 1e9,
    Cy: 6.3 * 6 * 24 * 365,
    gH: getGH(hashrate),
    D: difficulty,
    Pc: 42630,
    rB: 0.0028,
    P: undefined,
    P2: undefined,
  });

  useEffect(() => {
    // handleSubmit();
  }, []);

  const handleSubmit = (e) => {
    e && e.preventDefault();
    const { H, Cy, gH, D, Pc, rB } = data;
    const P =
      (Cy / ((1 + rB / 2) * (1 + gH / 2))) * ((H * 600) / (D * 2 ** 32)) * Pc;

    const P2 =
      (Cy / 2 / ((1 + rB / 4) * (1 + gH / 4))) *
      ((H * 600) / (D * 2 ** 32)) *
      Pc; // 半年期

    setData({
      ...data,
      P,
      P2,
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Fetch Twitter Follower</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>算力价格计算器(USDT/T)</h1>
        <form onSubmit={handleSubmit}>
          <label>
            H:为单位算力默认1T即10^9
            <input
              value={data.H}
              onChange={(e) => setData({ ...data, H: e.target.value })}
            />
          </label>
          <label>
            Cy:一年产出固定为6.3*6*24*365（半年期即365换成163）
            <input
              value={data.Cy}
              onChange={(e) => setData({ ...data, Cy: e.target.value })}
            />
          </label>
          <label>
            gH:全网算力增速 (过去7天平均 - 过去1年平均) / 过去1年平均
            <input
              value={data.gH}
              onChange={(e) => setData({ ...data, gH: e.target.value })}
            />
          </label>
          <label>
            D:难度
            <input
              value={data.D}
              onChange={(e) => setData({ ...data, D: e.target.value })}
            />
          </label>
          <label>
            Pc:比特币季度价格
            <input
              value={data.Pc}
              onChange={(e) => setData({ ...data, Pc: e.target.value })}
            />
          </label>
          <label>
            rB: aave中wbtc的APR
            <input
              value={data.rB}
              onChange={(e) => setData({ ...data, rB: e.target.value })}
            />
          </label>

          <label>
            P: 一年期算力价格(USDT/T)
            <input value={data.P} readOnly />
          </label>
          <label>
            P2: 半年期算力价格(USDT/T)
            <input value={data.P2} readOnly />
          </label>

          <button>Submit</button>
        </form>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  console.log("getStaticProps==============================");

  // const response = await fetch("http://localhost:3000/api/data");

  try {
    const response = await fetch(
      "https://hashrate-price-estimate.vercel.app/api/data"
    );

    const res = await response.json();

    const hashrate = res.hashrate.slice(0, 365).map((item) => item.hashrate);
    const difficulty = res.difficulty;
    const statistics_timestamp = res.statistics_timestamp;

    console.log({
      hashrate: hashrate.length,
      difficulty,
      statistics_timestamp,
    });

    return {
      props: {
        hashrate: hashrate,
        difficulty,
        statistics_timestamp: statistics_timestamp * 1000,
      },
      revalidate: 60,
    };
  } catch (error) {
    return {
      props: {
        hashrate: [],
        difficulty: 0,
        statistics_timestamp: Date.now(),
      },
      revalidate: 60,
    };
  }
}
