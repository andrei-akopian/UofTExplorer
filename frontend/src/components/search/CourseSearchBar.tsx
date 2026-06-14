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
    <div className="border-border-card bg-panel-bg shadow-card flex items-center gap-[0.55rem] rounded-[0.95rem] border px-[0.9rem] py-[0.78rem] font-mono text-[0.96rem]">
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
        ref={inputRef}
        type="text"
        className="border-border-card bg-input-bg focus:border-input-focus-border focus:ring-input-focus-ring box-border w-full rounded-[0.9rem] border px-[0.9rem] py-[0.78rem] text-[0.96rem] focus:ring-2 focus:outline-none"
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
            className="border-border-dropdown bg-surface-1 shadow-dropdown fixed z-9999 max-h-72 overflow-y-auto rounded-[0.95rem] border"
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

      <div className="mt-[0.65rem] flex min-h-0 flex-wrap gap-[0.55rem]">
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
