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
    <div className="flex items-center gap-[0.55rem] rounded-[0.95rem] border border-[#d2daea] bg-white px-[0.9rem] py-[0.78rem] text-[0.96rem] shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
      {course}
      <button
        key={`${course}-remove`}
        type="button"
        className="text-[#dc2626] hover:text-[#b42318]"
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
}: {
  searchResults: string[];
  setSearchResults: (results: string[]) => void;
  title: string;
}) {
  const { results, loading, error, search, clear } = useSearch(300, true);
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
    <div className="relative w-full shrink-0 rounded-2xl border border-[rgba(104,124,156,0.16)] bg-[rgba(255,255,255,0.6)] px-[0.9rem] py-[0.85rem] pb-[0.95rem] shadow-[0_4px_12px_rgba(37,53,84,0.06)]">
      <label
        className="mb-[0.45rem] flex items-center gap-[0.55rem] text-[0.88rem] font-semibold text-[#42516d]"
        htmlFor="avoidedSearch"
      >
        {title}
        <span className="min-w-8 rounded-full bg-[#e7eefb] px-[0.6rem] py-[0.28rem] text-center font-bold text-[#35518a]">
          {numSelected}
        </span>
      </label>
      <input
        type="text"
        className="box-border w-[96%] rounded-[0.9rem] border border-[#c9d4e5] bg-[#fcfdff] px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:border-[#7f9ede] focus:ring-2 focus:ring-[rgba(70,114,202,0.2)] focus:outline-none"
        placeholder="Add a course to avoid"
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
                  setSearchResults([
                    ...searchResults,
                    result.code || result.label,
                  ]);
                  setQuery("");
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
      <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-10 max-h-72 overflow-y-auto rounded-[0.95rem] border border-[#d2daea] bg-white shadow-[0_16px_30px_rgba(34,48,79,0.14)] [&.show]:block [&:not(.show)]:hidden"></div>
    </div>
  );
}
