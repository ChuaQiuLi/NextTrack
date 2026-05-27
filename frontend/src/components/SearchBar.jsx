export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search song..."
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
}