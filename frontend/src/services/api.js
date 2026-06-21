const BASE_URL = "http://localhost:5000/api/track";

export const searchTracks = async (query) => {
  const res = await fetch(`${BASE_URL}/search?q=${query}`);
  return res.ok ? await res.json() : [];
};

