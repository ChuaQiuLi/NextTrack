const BASE_URL = "http://localhost:5000/api/track";

export const searchTracks = async (query) => {
  const res = await fetch(`${BASE_URL}/search?q=${query}`);
  return res.ok ? await res.json() : [];
};

export const getNextTrack = async (trackIds, preferences) => {
  const res = await fetch(`${BASE_URL}/next-track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trackIds, preferences }),
  });

  return res.ok ? await res.json() : null;
};