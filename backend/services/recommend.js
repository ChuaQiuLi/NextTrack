function score(track, seeds) {
  let s = 0;

  const seedNames = seeds.map((t) => t.name.toLowerCase());
  const seedArtists = seeds.map((t) => t.artist?.toLowerCase());

  // name similarity
  for (let name of seedNames) {
    if (track.name.toLowerCase().includes(name.split(" ")[0])) {
      s -= 2;
    }
  }

  // artist similarity (strong signal)
  if (seedArtists.includes(track.artist?.toLowerCase())) {
    s -= 3;
  }

  // avoid repetition
  s += track.name.length * 0.01;

  // diversity
  s += Math.random() * 0.5;

  return s;
}



function pickBestTrack(tracks, seeds) {
  let best = tracks[0];
  let bestScore = Infinity;

  for (let t of tracks) {
    const s = score(t, seeds);

    if (s < bestScore) {
      bestScore = s;
      best = t;
    }
  }

  return best;
}

module.exports = { score, pickBestTrack };