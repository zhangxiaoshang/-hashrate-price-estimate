import React, { useEffect, useState } from "react";
import Head from "next/head";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import styles from "../styles/Home.module.css";

dayjs.locale("zh-cn");
dayjs.extend(relativeTime);

export default function Home({ gH, Hg, Pc, wbtcAPR, update_at }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    H: 1e9,
    Cy: 6.3 * 6 * 24 * 365,
    gH,
    Hg,
    Pc,
    rB: wbtcAPR,
    P: undefined,
    P2: undefined,
  });

  useEffect(() => {
    // handleSubmit();
  }, []);

  const handleSubmit = (e) => {
    e && e.preventDefault();
    const { H, Cy, gH, Hg, D, Pc, rB } = data;
    // const P =
    //   (Cy / ((1 + rB / 2) * (1 + gH / 2))) * ((H * 600) / (D * 2 ** 32)) * Pc;

    const part1 = (H / Hg) * Cy;
    const part2 = (1 + gH / 2) * (1 + rB / 2);
    const P = (part1 / part2) * Pc;

    // P2
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
        <title>Hashrate Price Calculator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Hashrate Price Calculator</h1>
        <p>
          last update: {dayjs(update_at).format("YYYY.MM.DD HH:mm:ss")}
          <a
            style={{ cursor: "pointer" }}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                location.reload();
              }, 5000);
            }}
          >
            {loading ? "loading..." : " update"}
          </a>
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Hash rate of NFTs(Default 1T)
            <span className={styles.wrapRight}>
              <input
                value={data.H}
                onChange={(e) => setData({ ...data, H: e.target.value })}
              />
              <span>= {data.H / 1e9} T</span>
            </span>
          </label>
          <label>
            Cy: Global mined BTC/year, 6.3*6*24*365 about 331128
            <span className={styles.wrapRight}>
              <input
                value={data.Cy}
                onChange={(e) => setData({ ...data, Cy: e.target.value })}
              />
              <span>BTC</span>
            </span>
          </label>
          <label>
            gH: Global hash rate growth rate/year
            <span className={styles.wrapRight}>
              <input
                value={data.gH}
                onChange={(e) => setData({ ...data, gH: e.target.value })}
              />
              <span>≈ {Math.round(data.gH * 10000) / 100} %</span>
            </span>
          </label>

          <label>
            Hg:Global hash rate
            <span className={styles.wrapRight}>
              <input
                value={data.Hg}
                onChange={(e) =>
                  setData({
                    ...data,
                    Hg: e.target.value,
                  })
                }
              />
              <span>TH/s</span>
            </span>
          </label>

          <label>
            Pc: Price of BTC
            <span className={styles.wrapRight}>
              <input
                value={data.Pc}
                onChange={(e) => setData({ ...data, Pc: e.target.value })}
              />

              <span>{Math.round(data.Pc * 100) / 100} USDT</span>
            </span>
          </label>

          <label>
            rB: BTC lending interest rate
            <span className={styles.wrapRight}>
              <input
                value={data.rB}
                onChange={(e) => setData({ ...data, rB: e.target.value })}
              />
              <span>= {data.rB * 100}%</span>
            </span>
          </label>

          <label>
            P: Price of these NFTs(Default 1T)
            <span className={styles.wrapRight}>
              <input
                value={Math.round(data.P * 100) / 100 || undefined}
                readOnly
              />
              <span>USDT/T</span>
            </span>
          </label>
          <label>
            Pm: Price for mining
            <span className={styles.wrapRight}>
              <input
                value={Math.round(data.P * 100 * 0.9) / 100 || undefined}
                readOnly
              />
              <span>USDT/T</span>
            </span>
          </label>
          {/* <label>
            P2: 半年期算力价格
            <span className={styles.wrapRight}>
              <input value={Math.round(data.P2 * 100) / 100} readOnly />
              <span>USDT/T</span>
            </span>
          </label> */}

          <button>计算</button>
        </form>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const LOG_TIME = "getStaticProps";
  console.time(LOG_TIME);

  try {
    const baseURL =
      process.env.NODE_ENV === "production"
        ? "https://hashrate-price-estimate.vercel.app"
        : "http://localhost:3000";

    const allResponse = await Promise.all([
      fetch(baseURL.concat("/api/getGH")),
      fetch(baseURL.concat("/api/getHg")),
      fetch(baseURL.concat("/api/getPc")),
    ]);

    console.log("allResponse:", allResponse);
    const [{ gH }, { Hg }, { Pc }] = await Promise.all(
      allResponse.map((res) => res.json())
    );

    console.log({ gH, Hg, Pc });

    return {
      props: {
        gH: gH || null,
        Hg: Hg || null,
        Pc: Pc || null,
        wbtcAPR: 0.0027,
        update_at: Date.now(),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.log(LOG_TIME, error);
    return {
      props: {},
      revalidate: 10,
    };
  } finally {
    console.timeEnd(LOG_TIME);
  }
}
