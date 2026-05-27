const axios = require("axios");

let accessToken = null;

/* ---------------- AUTH ---------------- */

async function getAccessToken() {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
      },
    }
  );

  accessToken = res.data.access_token;
}

async function ensureToken() {
  if (!accessToken) await getAccessToken();
}

/* ---------------- SEARCH ONLY ---------------- */

async function searchTracks(query) {
  await ensureToken();

  const res = await axios.get("https://api.spotify.com/v1/search", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      q: query,
      type: "track",
      limit: 10,
    },
  });

  return res.data.tracks.items.map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artists[0]?.name,
    preview: t.preview_url,
  }));
}

module.exports = {
  searchTracks,
  ensureToken,
  getAccessToken,
};