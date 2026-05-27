const express = require("express");
const router = express.Router();

const { searchTracks } = require("../services/spotify");
const { pickBestTrack } = require("../services/recommend");

/* ---------------- SEARCH ---------------- */

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const tracks = await searchTracks(query);

    const results = tracks.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artist,
      preview: t.preview,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ---------------- NEXT TRACK ---------------- */

router.post("/next-track", async (req, res) => {
  try {
    const { trackIds } = req.body;

    const seeds = (trackIds || []).filter(Boolean).slice(-5);

    if (!seeds.length) {
      return res.status(400).json({ error: "At least 1 seed required" });
    }

    // fetch seed tracks
    const seedTracks = await Promise.all(
      seeds.map(async (q) => {
        const r = await searchTracks(q);
        return r?.[0];
      })
    );

    // build candidate pool
    let pool = [];

    for (let seed of seedTracks) {
      const keyword = seed.name.split(" ")[0];
      const results = await searchTracks(keyword);
      pool.push(...results);
    }

    // remove duplicates + seeds
    const unique = Array.from(
      new Map(pool.map((t) => [t.id, t])).values()
    ).filter((t) => !seeds.includes(t.id));

    if (!unique.length) {
      return res.status(404).json({ error: "No candidates found" });
    }

    // PICK BEST TRACK 
    const next = pickBestTrack(unique, seedTracks);

    return res.json({
      nextTrack: {
        id: next.id,
        name: next.name,
        artist: next.artist,
        preview: next.preview,
      },
    });
  } catch (err) {
    console.error("Next-track error:", err);
    res.status(500).json({ error: "Failed to generate next track" });
  }
});

module.exports = router;