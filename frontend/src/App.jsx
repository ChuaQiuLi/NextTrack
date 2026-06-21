import React, { useState } from "react";
import { searchTracks, getNextTrack } from "./services/api";
import "./App.css";


function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);

  // convert Spotify duration_ms to mm:ss
  const formatDuration = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // search tracks
  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const data = await searchTracks(query);
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
  };

  // recommendation engine placeholder
  const fetchNext = async (updated) => {
    if (updated.length < 1) return;

    setLoading(true);

    try {
      const data = await getNextTrack(updated);

      if (data?.nextTrack) {
        setPlaylist((prev) => [...prev, data.nextTrack]);
      }
    } 
    
    catch (err) {
      console.error("Next track fetch failed:", err);
    } 
    
    finally {
      setLoading(false);
    }
  };

  // add track to playlist
  const addTrack = (track) => {
    if (!track?.id) return;

    const exists = playlist.some((t) => t.id === track.id);
    if (exists) return;

    const updated = [...playlist, track];
    setPlaylist(updated);

    if (updated.length >= 1) {
      fetchNext(updated);
    }
  };

  return (
    <div className="page">
      <div className = "container">
        <h1 className = "title">NextTrack</h1>
        <p className = "subtitle">
          Search a song and start building your playlist
        </p>

        
        <div className = "searchBar">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search songs..." className = "input" onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}/>
          <button onClick={handleSearch} className = "searchButton">
            Search
          </button>
        </div>

        
        <div className = "mainGrid">
          {/* Search results */}
          <div className = "card">
            <h2 className = "sectionTitle">Search Results</h2>

            {results.length === 0 ? (
              <p className = "emptyText">No search results yet.</p>
            ) : (
              <ol className = "trackList">
                {results.map((track) => (
                  <li key={track.id} className = "trackListItem">
                    <div className = "trackRow">
                      
                      {/* Album image */}
                      <div className = "imageWrapper">
                        {track.image ? (
                          <img src={track.image} alt={track.name} className = "trackImage"/>
                        ) : (
                          <div className = "imagePlaceholder">No Image</div>
                        )}
                      </div>

                      // Track details
                      <div className = "trackInfo">
                        <div className = "trackName">{track.name}</div>
                        <div className = "trackArtist">{track.artist}</div>
                        <div className = "trackMeta">
                          {track.album && <span>Album: {track.album}</span>}
                          <span>Duration: {formatDuration(track.duration_ms)}</span>
                        </div>

                        <div className = "actionRow">
                          <button onClick={() => addTrack(track)} className = "addButton">Add</button>

                          {track.preview ? (
                            <audio controls src={track.preview} className = "audioPlayer"/>
                          ) : (
                            <span className = "noPreview">No preview available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>


          <div className = "card">
            <h2 className = "sectionTitle">Playlist</h2>

            {playlist.length === 0 ? (
              <p className = "emptyText">Start your music journey</p>
            ) : (
              <>
                {loading && (
                  <p className = "loadingText">Finding your next recommendation...</p>
                )}

                <ol className = "list">
                  {playlist.map((track) => (
                    <li key={track.id} className = "listItem">
                      <div className = "trackRow">
                        <div className = "imageWrapper">
                          {track.image ? (
                            <img src={track.image} alt={track.name} className = "trackImage"/>
                          ) : (
                            <div className = "imagePlaceholder">No Image</div>
                          )}
                        </div>

                        <div className = "trackInfo">
                          <div className = "trackName">{track.name}</div>
                          <div className = "trackArtist">{track.artist}</div>
                          <div className = "trackMeta">
                            {track.album && <span>Album: {track.album}</span>}
                            <span>Duration: {formatDuration(track.duration_ms)}</span>
                          </div>

                          <div className = "actionRow">
                            {track.preview ? (
                              <audio controls src={track.preview} className = "audio" />
                            ) : (
                              <span className = "noPreview">No preview available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;