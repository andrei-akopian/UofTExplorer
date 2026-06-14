import { useState } from "react";
import { useSearch } from "../../hooks/useGraph";
import SuggestionEntry from "../search/SuggestionEntry";

type SearchTab = "courses" | "programs" | "departments";

export default function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  const { results, search } = useSearch(300, false, true);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("courses");

  const courseResults = results.filter((result) => result.type === "course");
  const programResults = results.filter((result) => result.type === "program");
  const departmentResults = results.filter(
    (result) => result.type === "department",
  );

  const visibleResults =
    activeTab === "courses"
      ? courseResults
      : activeTab === "programs"
        ? programResults
        : departmentResults;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    void search(e.target.value);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <input
        type="text"
        placeholder="Search for course, program, department, or 'all' ..."
        value={query}
        onChange={handleChange}
        autoComplete="off"
        onFocus={() => {
          setShowSearchResults(true);
          setActiveTab("courses");
          if (!query.trim()) {
            void search("");
          }
        }}
        onBlur={() => setShowSearchResults(false)}
        className={`border-input-border bg-input-bg text-text-body focus:border-input-focus-border focus:ring-input-focus-ring w-full rounded-md border px-3 py-2.5 text-sm sm:min-w-96 md:min-w-120 ${query.length > 0 ? "not-italic" : "italic"} focus:ring-2 focus:outline-none`}
      />
      {showSearchResults && (
        <div className="border-border-dropdown bg-panel-bg shadow-dropdown absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border">
          <div className="border-border-card bg-panel-bg sticky top-0 z-10 grid grid-cols-3 border-b">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab("courses")}
              className={`px-2 py-2 text-xs font-semibold transition-colors ${activeTab === "courses" ? "bg-input-focus-border text-white" : "bg-panel-bg text-text-muted"}`}
            >
              Courses ({courseResults.length})
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab("programs")}
              className={`px-2 py-2 text-xs font-semibold transition-colors ${activeTab === "programs" ? "bg-input-focus-border text-white" : "bg-panel-bg text-text-muted"}`}
            >
              Programs ({programResults.length})
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab("departments")}
              className={`px-2 py-2 text-xs font-semibold transition-colors ${activeTab === "departments" ? "bg-input-focus-border text-white" : "bg-panel-bg text-text-muted"}`}
            >
              Departments ({departmentResults.length})
            </button>
          </div>

          {visibleResults.length > 0 ? (
            visibleResults.map((result) => (
              <SuggestionEntry
                key={result.id}
                id={result.code || result.label}
                title={result.title || ""}
                classSize={
                  result.class_size ? String(result.class_size) : undefined
                }
                numNodes={result.num_nodes || 0}
                onClickCallback={() => {
                  setQuery(result.code || result.label);
                  setShowSearchResults(false);
                }}
              />
            ))
          ) : (
            <div className="text-text-muted px-3 py-2 text-sm">
              No {activeTab} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
