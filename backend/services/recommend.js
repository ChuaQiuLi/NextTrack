function normalize(value, max) {
  return value / max;
}

// Build average playlist profile
function buildPlaylistProfile(playlist) {

  let count = 0;

  const profile = {
    energy: 0,
    danceability: 0,
    happiness: 0,
    tempo: 0,
    acousticness: 0,
    speechiness: 0
  };

  playlist.forEach(track => {

    if (!track.analysis) return;

    count++;

    profile.energy += track.analysis.energy || 0;
    profile.danceability += track.analysis.danceability || 0;
    profile.happiness += track.analysis.happiness || 0;
    profile.tempo += track.analysis.tempo || 0;
    profile.acousticness += track.analysis.acousticness || 0;
    profile.speechiness += track.analysis.speechiness || 0;

  });

  if (count === 0) return profile;

  Object.keys(profile).forEach(key => {
    profile[key] /= count;
  });

  return profile;
}

function metadataScore(candidate, playlist) {

  let score = 0;

  for (const seed of playlist) {

    // Same artist
    if (candidate.artist === seed.artist) {
      score += 30;
    }

    // Same album
    if (candidate.album === seed.album) {
      score += 10;
    }

    // Similar duration (within 15 seconds)
    if (Math.abs(candidate.duration_ms - seed.duration_ms) <= 15000) {
      score += 10;
    }

  }

  // Popular songs receive a small bonus
  score += candidate.popularity * 0.2;

  return score;

}

function weightedEuclidean(candidate, profile) {

  const weights = {
    energy: 0.30,
    danceability: 0.25,
    happiness: 0.20,
    tempo: 0.10,
    acousticness: 0.05,
    speechiness: 0.05
  };

  let distance = 0;

  distance += weights.energy * Math.pow(normalize(candidate.analysis.energy,100) - normalize(profile.energy,100), 2);

  distance += weights.danceability * Math.pow(normalize(candidate.analysis.danceability,100) - normalize(profile.danceability,100), 2);

  distance += weights.happiness * Math.pow(normalize(candidate.analysis.happiness,100) - normalize(profile.happiness,100), 2);

  distance += weights.tempo * Math.pow(normalize(candidate.analysis.tempo,220) - normalize(profile.tempo,220), 2);

  distance += weights.acousticness * Math.pow(normalize(candidate.analysis.acousticness,100) - normalize(profile.acousticness,100), 2);

  distance += weights.speechiness * Math.pow(normalize(candidate.analysis.speechiness,100) - normalize(profile.speechiness,100), 2);

  return Math.sqrt(distance);

}

function rankTracks(candidates, playlist) {

  const profile = buildPlaylistProfile(playlist);

  return candidates
    .map(candidate => {

      const distance = weightedEuclidean(candidate, profile);

      const similarityScore = candidate.metadataScore * 0.4 + (1 / (1 + distance)) * 0.6;

      return { ...candidate, distance, similarityScore };

    })
    
    .sort((a, b) => b.similarityScore - a.similarityScore);

}


module.exports = { buildPlaylistProfile, weightedEuclidean, rankTracks, metadataScore };



// function normalize(str = "") {
//   return str.toLowerCase().trim();
// }

// function tokenize(str = "") {
//   return normalize(str).split(/[\s\-()[\]&,.!?:;'"\\/]+/).filter(Boolean);
// }


// function overlapCount(a = [], b = []) {
//   const setB = new Set(b);
//   return a.filter((x) => setB.has(x)).length;
// }


// function scoreCandidate(candidate, playlistTracks) {
//   let score = 0;

//   const candidateArtist = normalize(candidate.artist);
//   const candidateAlbum = normalize(candidate.album);
//   const candidateTokens = tokenize(candidate.name);


//   for (const seed of playlistTracks) {
//     const seedArtist = normalize(seed.artist);
//     const seedAlbum = normalize(seed.album);
//     const seedTokens = tokenize(seed.name);

//     // same artist = strong positive signal
//     if (candidateArtist && seedArtist && candidateArtist === seedArtist) {
//       score += 5;
//     }

//     // same album = medium positive signal
//     if (candidateAlbum && seedAlbum && candidateAlbum === seedAlbum) {
//       score += 3;
//     }

//     // title/token overlap = weak positive signal
//     score += overlapCount(candidateTokens, seedTokens) * 1.5;
//   }

//   // small popularity bonus
//   score += (candidate.popularity || 0) / 25;

//   // prefer tracks with preview so that user can play track previews
//   if (candidate.preview) {
//     score += 1;
//   }

//   // tiny randomness to break ties
//   score += Math.random() * 0.2;

//   return score;

// }



// function pickBestTrack(candidates, playlistTracks) {
//   if (!candidates.length) return null;

//   let best = null;
//   let bestScore = -Infinity;

//   for (const candidate of candidates) {
//     const s = scoreCandidate(candidate, playlistTracks);

//     if (s > bestScore) {
//       bestScore = s;
//       best = candidate;
//     }
//   }

//   return best;
// }

// module.exports = { scoreCandidate, pickBestTrack };