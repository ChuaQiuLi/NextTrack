const axios = require("axios");
const cache = require("./cache");

async function getTrackAnalysis(trackId) {
  const cached = cache.get(trackId);

  if (cached) {
    console.log(`Using cached analysis: ${trackId}`);
    return cached;
  }

  const url =
    `https://track-analysis.p.rapidapi.com/pktx/spotify/${trackId}`;

  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "track-analysis.p.rapidapi.com"
    }
  });

  const analysis = response.data;

  console.log(`Fetched analysis from RapidAPI: ${trackId}`);

  cache.set(trackId, analysis);

  return analysis;
}

module.exports = { getTrackAnalysis };