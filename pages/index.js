import React, { useEffect, useState } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import getHashrateData from "../lib/get-data";
import styles from "../styles/Home.module.css";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

export default function Home({ gH, difficulty, wbtcAPR, monthMa3, update_at }) {
  const [data, setData] = useState({
    H: 1e9,
    Cy: 6.3 * 6 * 24 * 365,
    gH: gH,
    D: difficulty,
    Pc: monthMa3,
    rB: wbtcAPR,
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
        <title>算力价格计算器</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>算力价格计算器(USDT/T)</h1>
        <p>
          上一次更新数据: {dayjs(update_at).fromNow()}
          <a style={{ cursor: "pointer" }} onClick={() => location.reload()}>
            (点击更新)
          </a>
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            H:为单位算力默认1T即10^9
            <span className={styles.wrapRight}>
              <input
                value={data.H}
                onChange={(e) => setData({ ...data, H: e.target.value })}
              />
              <span>= {data.H / 1e9} T</span>
            </span>
          </label>
          <label>
            Cy:一年产出固定为6.3*6*24*365（半年期即365换成163）
            <span className={styles.wrapRight}>
              <input
                value={data.Cy}
                onChange={(e) => setData({ ...data, Cy: e.target.value })}
              />
              <span>BTC</span>
            </span>
          </label>
          <label>
            gH:全网算力增速 (过去7天平均 - 过去1年平均) / 过去1年平均
            <span className={styles.wrapRight}>
              <input
                value={data.gH}
                onChange={(e) => setData({ ...data, gH: e.target.value })}
              />
              <span>≈ {Math.round(data.gH * 10000) / 100} %</span>
            </span>
          </label>
          <label>
            D:难度
            <span className={styles.wrapRight}>
              <input
                value={data.D}
                onChange={(e) => setData({ ...data, D: e.target.value })}
              />
              <span>≈ {Math.round((data.D / 1e9) * 100) / 100}</span>
            </span>
          </label>
          <label>
            Pc:比特币季度价格(月线MA3)
            <span className={styles.wrapRight}>
              <input
                value={data.Pc}
                onChange={(e) => setData({ ...data, Pc: e.target.value })}
              />

              <span>{Math.round(data.Pc * 100) / 100} USDT</span>
            </span>
          </label>

          <label>
            rB: aave中wbtc的APR
            <span className={styles.wrapRight}>
              <input
                value={data.rB}
                onChange={(e) => setData({ ...data, rB: e.target.value })}
              />
              <span>= {data.rB * 100}%</span>
            </span>
          </label>

          <label>
            P: 一年期算力价格
            <span className={styles.wrapRight}>
              <input value={Math.round(data.P * 100) / 100} readOnly />
              <span>USDT/T</span>
            </span>
          </label>
          <label>
            P2: 半年期算力价格
            <span className={styles.wrapRight}>
              <input value={Math.round(data.P2 * 100) / 100} readOnly />
              <span>USDT/T</span>
            </span>
          </label>

          <button>计算</button>
        </form>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  // return {
  //   props: {
  //     gH: 0.34698583947291917,
  //     statistics_timestamp: "1644796800",
  //     difficulty: 26690525287.405,
  //     difficulty_statistics_timestamp: 1644796800000,
  //     wbtcAPR: 0.0027,
  //     monthMa3: 42248.26666666666,
  //     update_at: 1644821398550,
  //   },
  // };

  const data = await getHashrateData();
  if (data) {
    return {
      props: {
        ...data,
      },

      revalidate: 60,
    };
  }

  return null;
}
