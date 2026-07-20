import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
    <div className="border-border-card bg-panel-bg shadow-card flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm">
      {course}
      <button
        key={`${course}-remove`}
        type="button"
        className="text-error hover:text-error-hover hover:cursor-pointer"
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
  const { results, loading, search } = useSearch(300, true, true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [numSelected, setNumSelected] = useState(0);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const courseResults = results.filter((result) => result.type === "course");

  const updateDropdownRect = () => {
    if (inputRef.current) {
      setDropdownRect(inputRef.current.getBoundingClientRect());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSearchResults(true);
    setQuery(e.target.value);
    search(e.target.value);
  };

  useEffect(() => {
    setNumSelected(searchResults.length);
  }, [searchResults]);

  return (
    <div className="border-border-card bg-card-bg shadow-card relative w-full shrink-0 rounded-xl border px-3 py-2 text-xs">
      <label
        className="text-text-muted mb-2 flex items-center gap-2 text-xs font-semibold"
        htmlFor="avoidedSearch"
      >
        {title}
        <span className="bg-badge text-badge-text min-w-7 rounded-full px-2 py-0.5 text-center text-[0.7rem] font-bold">
          {numSelected}
        </span>
      </label>
      <input
        ref={inputRef}
        type="text"
        className="border-border-card bg-input-bg focus:border-input-focus-border focus:ring-input-focus-ring box-border w-full rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        placeholder={placeholder}
        autoComplete="off"
        value={query}
        onChange={handleChange}
        onFocus={() => {
          updateDropdownRect();
          setShowSearchResults(true);
          if (!query.trim()) {
            void search("");
          }
        }}
        onBlur={() => setShowSearchResults(false)}
      />

      {showSearchResults &&
        dropdownRect &&
        createPortal(
          <div
            className="border-border-dropdown bg-surface-1 shadow-dropdown fixed z-9999 max-h-72 overflow-y-auto rounded-xl border"
            style={{
              top: dropdownRect.bottom + 6,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
          >
            {loading ? (
              <div className="text-text-muted px-3 py-2 text-sm">
                Loading results...
              </div>
            ) : courseResults.length > 0 ? (
              courseResults.map((result) => (
                <SuggestionEntry
                  key={result.id}
                  id={result.code || result.label}
                  title={result.title || ""}
                  classSize={
                    result.class_size ? String(result.class_size) : undefined
                  }
                  numNodes={result.num_nodes || 0}
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
                />
              ))
            ) : (
              <div className="text-text-muted px-3 py-2 text-sm">
                No courses found
              </div>
            )}
          </div>,
          document.body,
        )}

      <div className="mt-2 flex min-h-0 flex-wrap gap-2">
        {searchResults.map((course) => (
          <CourseChip
            key={course}
            course={course}
            onRemove={() =>
              setSearchResults(searchResults.filter((c) => c !== course))
            }
          />
        ))}
      </div>
    </div>
  );
}
