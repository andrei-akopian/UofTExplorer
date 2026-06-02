import { useState } from "react";
import { useSearch } from "../hooks/useGraph";
import SuggestionEntry from "./SuggestionEntry";

export default function SearchQueryBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  const { results, loading, error, search, clear } = useSearch(300);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search for course, program, department, or 'all'"
        value={query}
        onChange={handleChange}
        autoComplete="off"
        onFocus={() => setShowSearchResults(true)}
        onBlur={() => setShowSearchResults(false)}
      />
      {showSearchResults && (
        <div className={showSearchResults ? "" : "hidden"}>
          {results.length > 0 ? (
            results.map((result) => (
              <SuggestionEntry
                key={result.id}
                onClickCallback={() => {
                  setQuery(result.code || result.label);
                  setShowSearchResults(false);
                }}
                labelling={`${result.code}: ${result.title} | ${result.num_prereqs}`}
              />
            ))
          ) : (
            <div>No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
