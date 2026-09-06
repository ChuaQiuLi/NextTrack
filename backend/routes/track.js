const express = require("express");
const router = express.Router();

const { searchTracks, getTrackById } = require("../services/spotify");
const { rankTracks, metadataScore } = require("../services/recommend");
const { getTrackAnalysis } = require("../services/analysis");



router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const tracks = await searchTracks(query);
    res.json(tracks);
  } 
  
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }

});




router.post("/next-track", async (req, res) => {
  try {
    const { trackIds } = req.body;

    const playlistIds = (trackIds || []).filter(Boolean);

    if (!playlistIds.length) {
      return res.status(400).json({ error: "At least 1 track required" });
    }

    // fetch ALL playlist tracks
    const playlistTracks = [];


    for (const id of playlistIds) {

      try {

        const track = await getTrackById(id);
        track.analysis = await getTrackAnalysis(track.id);
        playlistTracks.push(track);

      } 
      
      catch (err) {
        console.error( "Skipping playlist track", id, err.response?.data || err.message );

      }

    }

    // build candidate pool from EVERY playlist track
    let pool = [];

    for (const seed of playlistTracks) {
      if (!seed) continue;

      if (!seed.artistNames?.length) continue;

      for (const seed of playlistTracks) {
        if (!seed) continue;
        if (!seed.artistNames?.length) continue;

        // Search by track name once
        const [byTrack, broadSearch] = await Promise.all([
          searchTracks(`track:${seed.name}`, 8),
          searchTracks(seed.name, 8)
        ]);

        pool.push(...byTrack);
        pool.push(...broadSearch);
        
        
        // Search by each artist
        for (const artist of seed.artistNames) {
          const byArtist = await searchTracks(`artist:${artist}`, 8);
          pool.push(...byArtist);
        }

      }

    }

    // remove duplicates
    const uniquePool = Array.from(new Map(pool.map((track) => [track.id, track])).values());

    // remove songs already in playlist
    const filteredPool = uniquePool.filter(track => !playlistIds.includes(track.id)).map(track => ({
      ...track,
      metadataScore: metadataScore(track, playlistTracks)
    }))
    .sort((a, b) => b.metadataScore - a.metadataScore);


    if (!filteredPool.length) {
      return res.status(404).json({ error: "No candidates found" });
    }

    // Reduce candidate pool
    const candidatePool = filteredPool.slice(0,10);

    const analysedPool = [];

    for(const track of candidatePool) {

      try {

        track.analysis = await getTrackAnalysis(track.id);
        analysedPool.push(track);

      }

      catch(err) {
        console.log("Skipping",track.name);

      }

    }

    
    if (!analysedPool.length) {
      return res.status(404).json({ error: "Unable to analyse candidate tracks." });
    }


    // pick best candidate based on current playlist tracks
    const recommendations = rankTracks(analysedPool, playlistTracks);

    if (!recommendations.length) {
      return res.status(404).json({ error: "No next track found" });
    }

    return res.json({ recommendations: recommendations.slice(0, 5) });
        
  } 
  
  catch (err) {
    console.error("Next-track error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate next track" });
  }

});

module.exports = router;


