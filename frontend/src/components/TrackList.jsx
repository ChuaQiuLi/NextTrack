import { FaBeer } from "react-icons/fa"

export default function TrackList({ results, onPlay }) {
  return (
    <ul>
      {results.map((t) => (
        <li key={t.id}>
          {t.name} - {t.artist}
          <button onClick={() => onPlay(t)}>▶️</button>
        </li>
      ))}
    </ul>
  );
}  