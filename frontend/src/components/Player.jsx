import { FaBeer } from "react-icons/fa"

export default function Player({ current, onNext }) {
  if (!current) return null;

  return (
    <div>
      <h2>{current.name}</h2>
      <p>{current.artist}</p>

      {current.preview ? (
        <audio controls autoPlay src={current.preview} />
      ) : (
        <p>🎧 No preview available for this track</p>
      )}

      <button onClick={onNext}>⏭️ Next</button>
    </div>
  );
}