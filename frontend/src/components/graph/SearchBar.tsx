import { useState } from "react";
import { useSearch } from "../../hooks/useGraph";
import SuggestionEntry from "../search/SuggestionEntry";

export default function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  const { results, search } = useSearch(300);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for course, program, department, or 'all' ..."
        value={query}
        onChange={handleChange}
        autoComplete="off"
        onFocus={() => setShowSearchResults(true)}
        onBlur={() => setShowSearchResults(false)}
        className={`border-input-border bg-input-bg text-text-body focus:border-input-focus-border focus:ring-input-focus-ring min-w-93 rounded-md border px-3 py-2.5 text-sm ${query.length > 0 ? "not-italic" : "italic"} focus:ring-2 focus:outline-none`}
      />
      {showSearchResults && (
        <div className="border-border-dropdown bg-panel-bg shadow-dropdown absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border">
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
            <div className="text-text-muted px-3 py-2 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
