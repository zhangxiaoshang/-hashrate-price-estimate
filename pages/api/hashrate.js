const hashrate = async (req, res) => {
  try {
    const response = await fetch(
      "https://ycharts.com/charts/fund_data.json?annotations=&annualizedReturns=false&calcs=&chartType=interactive&chartView=&correlations=&dateSelection=range&displayDateRange=false&displayTicker=false&endDate=&format=real&legendOnChart=false&note=&partner=basic_2000&quoteLegend=false&recessions=false&scaleType=linear&securities=id%3AI%3ABNHR%2Cinclude%3Atrue%2C%2C&securityGroup=&securitylistName=&securitylistSecurityId=&source=false&splitType=single&startDate=&title=&units=false&useCustomColors=false&useEstimates=false&zoom=1&redesign=true&chartCreator=&maxPoints=688"
    );
    const res = await response.json();
    console.log(res);
    const raw_data = res.chart_data[0][0].raw_data;
    const hashrate = raw_data.map((raw) => raw[1]);

    res.statusCode = 200;
    return res.json({
      hashrate: hashrate,
    });
  } catch (e) {
    res.statusCode = 404;
    return res.json(e);
  }
};

export default hashrate;
