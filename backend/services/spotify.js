const axios = require("axios");

let accessToken = null;
let tokenExpiry = 0;

function mapTrack(t) {
  return {
    id: t.id,
    name: t.name,
    artist: t.artists?.map((a) => a.name).join(", ") || "",
    artistNames: t.artists?.map((a) => a.name) || [],
    artistIds: t.artists?.map((a) => a.id) || [],
    album: t.album?.name || null,
    albumId: t.album?.id || null,
    preview: t.preview_url,
    duration_ms: t.duration_ms,
    image: t.album?.images?.[0]?.url || null,
    popularity: t.popularity ?? 0,
  };
}

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
  // token usually expires in 3600s
  tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
}

async function ensureToken() {
  if (!accessToken || Date.now() >= tokenExpiry) {
    await getAccessToken();
  }
}

async function searchTracks(query, limit = 10) {
  await ensureToken();

  const res = await axios.get("https://api.spotify.com/v1/search", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      q: query,
      type: "track",
      limit,
    },
  });

  return res.data.tracks.items.map(mapTrack);
}

async function getTrackById(id) {
  await ensureToken();

  const res = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return mapTrack(res.data);
}

module.exports = { searchTracks, getTrackById, ensureToken, getAccessToken };