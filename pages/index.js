import Head from "next/head";
import styles from "../styles/Home.module.css";
import React from "react";

export default function Home() {
  const [inputValue, setInputValue] = React.useState("");
  const [userFollowers, setUserFollowers] = React.useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/followers", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ TWuser: inputValue }),
    })
      .then((res) => res.json())
      .then((userData) => {
        setUserFollowers(userData);
      });
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Fetch Twitter Follower</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Fetch A Twitter Follower</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Enter a Twitter username
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </label>
          <button>Submit</button>
        </form>
        {userFollowers.followerCount >= 0 ? (
          <p>Followers: {userFollowers.followerCount}</p>
        ) : (
          <p>{userFollowers.error}</p>
        )}
      </main>
    </div>
  );
}
