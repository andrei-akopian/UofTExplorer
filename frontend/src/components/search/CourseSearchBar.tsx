import { useEffect, useState } from "react";
import { useSearch } from "../../hooks/useGraph";
import SuggestionEntry from "./SuggestionEntry";

function CourseChip({
  course,
  onRemove,
}: {
  course: string;
  onRemove: () => void;
}) {
  return (
    <div className="border-border-card bg-panel-bg shadow-card flex items-center gap-[0.55rem] rounded-[0.95rem] border px-[0.9rem] py-[0.78rem] text-[0.96rem]">
      {course}
      <button
        key={`${course}-remove`}
        type="button"
        className="text-error hover:text-error-hover"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

export default function CourseSearchBar({
  searchResults,
  setSearchResults,
  title,
  placeholder,
}: {
  searchResults: string[];
  setSearchResults: (results: string[]) => void;
  title: string;
  placeholder: string;
}) {
  const { results, search } = useSearch(300, true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  useEffect(() => {
    setNumSelected(searchResults.length);
  }, [searchResults]);

  return (
    <div className="border-border-card bg-card-bg shadow-card relative w-full shrink-0 rounded-2xl border px-4 py-1 text-sm">
      <label
        className="text-text-muted mb-[0.45rem] flex items-center gap-[0.55rem] text-[0.88rem] font-semibold"
        htmlFor="avoidedSearch"
      >
        {title}
        <span className="bg-badge text-badge-text min-w-8 rounded-full px-[0.6rem] py-[0.28rem] text-center font-bold">
          {numSelected}
        </span>
      </label>
      <input
        type="text"
        className="border-border-card bg-input-bg focus:border-focus-border focus:ring-focus-ring box-border w-full rounded-[0.9rem] border px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:ring-2 focus:outline-none"
        placeholder={placeholder}
        autoComplete="off"
        value={query}
        onChange={handleChange}
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
                  if (searchResults.find((x) => x == result.code)) {
                    return;
                  }
                  setSearchResults([
                    ...searchResults,
                    result.code || result.label,
                  ]);
                  setQuery("");
                  setShowSearchResults(false);
                }}
                labelling={`${result.code}: ${result.title}${result.num_prereqs ? ` | ${result.num_prereqs}` : ""}`}
              />
            ))
          ) : (
            <div>No results found</div>
          )}
        </div>
      )}
      <div className="mt-[0.65rem] flex min-h-0 flex-wrap gap-[0.55rem]">
        {searchResults.map((course) => (
          <CourseChip
            course={course}
            onRemove={() =>
              setSearchResults(searchResults.filter((c) => c !== course))
            }
          />
        ))}
      </div>
      <div className="border-border-card bg-panel-bg shadow-card absolute top-[calc(100%+0.35rem)] right-0 left-0 z-10 max-h-72 overflow-y-auto rounded-[0.95rem] border [&.show]:block [&:not(.show)]:hidden"></div>
    </div>
  );
}
