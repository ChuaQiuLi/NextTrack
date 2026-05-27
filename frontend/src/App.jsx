import React, { useState } from "react";
import { searchTracks, getNextTrack } from "./services/api";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [preferences, setPreferences] = useState({
    energy: 0.5,
    valence: 0.5,
  });
  const [loading, setLoading] = useState(false);

  // search
  const search = async () => {
    const data = await searchTracks(query);
    setResults(data);
  };

  // recommendation engine
  const fetchNext = async (updated) => {
    if (updated.length < 1) return;

    setLoading(true);

    const seedIds = updated.slice(-5).map((t) => t.id);
    const data = await getNextTrack(seedIds, preferences);

    if (data?.nextTrack) {
      setPlaylist((prev) => [
        ...prev,
        {
          id: data.nextTrack.id,
          name: data.nextTrack.name,
          artist: data.nextTrack.artist,
          preview: data.nextTrack.preview,
        },
      ]);
    }

    setLoading(false);
  };

  // add track 
  const addTrack = (track) => {
    if (!track?.id) return;

    if (playlist.find((t) => t.id === track.id)) return;

    const updated = [...playlist, track];
    setPlaylist(updated);

    if (updated.length >= 1) {
      fetchNext(updated);
    }
  };

  
  return (
    <div style={{ padding: 20 }}>
      <h1>NextTrack 🎵</h1>

      {/* SEARCH */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search songs..."
      />
      <button onClick={search}>Search</button>

      {/* RESULTS */}
      <ul>
        {results.map((t) => (
          <li key={t.id}>
            {t.name} - {t.artist}
            <button onClick={() => addTrack(t)}>Add</button>
            {t.preview && <audio controls src={t.preview} />}
          </li>
        ))}
      </ul>

      {/* PREFERENCES */}
      <h3>Energy</h3>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={preferences.energy}
        onChange={(e) =>
          setPreferences({ ...preferences, energy: +e.target.value })
        }
      />

      <h3>Valence</h3>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={preferences.valence}
        onChange={(e) =>
          setPreferences({ ...preferences, valence: +e.target.value })
        }
      />

      {/* PLAYLIST */}
      <h2>Playlist</h2>

      {playlist.length === 0 ? (
        <p>Search and pick a song to begin</p>
      ) : (
        <>
          {loading && <p>Generating next track...</p>}

          {playlist.map((t, i) => (
            <div key={i}>
              {i + 1}. {t.name} - {t.artist}
              {t.preview && <audio controls src={t.preview} />}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;