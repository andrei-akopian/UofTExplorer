import { useState, useEffect, useCallback } from "react";
import { getDepartments } from "../../lib/api";
import SearchBar from "./SearchBar";

const breadths = [
  "Creative and Cultural Representations (1)",
  "Thought, Belief, and Behaviour (2)",
  "Society and its Institutions (3)",
  "Living Things and Their Environment (4)",
  "The Physical and Mathematical Universes (5)",
];

type QueryFilters = {
  cr_ncr: string[];
  departments: string[];
  breadth_requirements: string[];
};

function FilterBar({
  title,
  options,
  filtersHook,
  setFiltersHook,
  filtersTitle,
  keyFormat,
  renderOptionLabel,
}: {
  title: string;
  options: string[];
  filtersHook: QueryFilters;
  setFiltersHook: (filtersHook: QueryFilters) => void;
  filtersTitle: keyof QueryFilters;
  keyFormat: (option: string) => string;
  renderOptionLabel?: (option: string) => React.ReactNode;
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    console.log(`Toggled ${key}: ${e.target.checked}`);
    const index = filtersHook[filtersTitle].indexOf(key);
    if (e.target.checked && index === -1) {
      setFiltersHook({
        ...filtersHook,
        [filtersTitle]: [...filtersHook[filtersTitle], key],
      });
    } else if (!e.target.checked && index !== -1) {
      setFiltersHook({
        ...filtersHook,
        [filtersTitle]: filtersHook[filtersTitle].filter(
          (k: string) => k != key,
        ),
      });
    }
  }

  return (
    <details className="group close-on-outclick relative">
      <summary className="border-input-border bg-panel-bg text-text-body flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-sm select-none sm:w-auto sm:justify-start sm:px-5 [&::-webkit-details-marker]:hidden">
        {title}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="m2 4 4 4 4-4" stroke="currentColor" />
        </svg>
      </summary>
      <div className="border-border-dropdown bg-surface-1 text-text-body shadow-dropdown absolute top-[calc(100%+6px)] left-0 z-50 flex max-h-[20em] w-max max-w-88 min-w-full flex-col gap-1.5 overflow-y-auto rounded-md border p-2.5">
        {options.map((option) => (
          <label
            key={keyFormat(option)}
            className="flex flex-nowrap items-start gap-2 text-sm"
          >
            <input
              type="checkbox"
              onChange={(e) => handleChange(e, keyFormat(option))}
              className="mt-0.5 shrink-0"
            />
            <span className="max-w-xs min-w-0 wrap-break-word">
              {renderOptionLabel ? renderOptionLabel(option) : option}
            </span>
          </label>
        ))}
      </div>
    </details>
  );
}

interface SearchMenuProps {
  query: string;
  setQuery: (q: string) => void;
  filtersHook: QueryFilters;
  setFiltersHook: (filtersHook: QueryFilters) => void;
  onLoadGraph: () => void;
  isLoading: boolean;
}

export default function SearchMenu({
  query,
  setQuery,
  filtersHook,
  setFiltersHook,
  onLoadGraph,
  isLoading,
}: SearchMenuProps) {
  const [departments, setDepartments] = useState<string[]>([]);

  const toggleFilter = (
    filterType: keyof QueryFilters,
    key: string,
    checked: boolean,
  ) => {
    const index = filtersHook[filterType].indexOf(key);
    if (checked && index === -1) {
      setFiltersHook({
        ...filtersHook,
        [filterType]: [...filtersHook[filterType], key],
      });
    } else if (!checked && index !== -1) {
      setFiltersHook({
        ...filtersHook,
        [filterType]: filtersHook[filterType].filter((k: string) => k != key),
      });
    }
  };

  useEffect(() => {
    setFiltersHook({
      cr_ncr: [],
      departments: [],
      breadth_requirements: [],
    });
  }, []);

  useEffect(() => {
    getDepartments().then((departments) => {
      const departmentList: string[] = [];
      for (const dept in departments) {
        departmentList.push(`${dept} (${departments[dept]})`);
      }
      setDepartments(departmentList);
    });
  }, []);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key == "Enter") {
        onLoadGraph();
      }
    },
    [onLoadGraph],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  return (
    <div className="flex w-full flex-col gap-2 font-sans sm:w-auto sm:flex-row sm:flex-wrap">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <SearchBar query={query} setQuery={setQuery} />
      </div>

      <details className="group close-on-outclick relative sm:hidden">
        <summary className="border-input-border bg-panel-bg text-text-body flex w-full cursor-pointer list-none items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-sm select-none [&::-webkit-details-marker]:hidden">
          Filters
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="m2 4 4 4 4-4" stroke="currentColor" />
          </svg>
        </summary>
        <div className="border-border-dropdown bg-surface-1 text-text-body shadow-dropdown fixed top-28 right-2 left-2 z-60 flex max-h-[70vh] flex-col gap-3 overflow-y-auto rounded-md border p-2.5">
          <details className="group" open>
            <summary className="text-text-muted flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase [&::-webkit-details-marker]:hidden">
              CR / NCR
              <span className="text-text-subtle transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {["Eligible", "Ineligible"].map((option) => {
                const key = option.toLowerCase();
                return (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filtersHook.cr_ncr.includes(key)}
                      onChange={(e) =>
                        toggleFilter("cr_ncr", key, e.target.checked)
                      }
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </details>

          <details className="group">
            <summary className="text-text-muted flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase [&::-webkit-details-marker]:hidden">
              Departments
              <span className="text-text-subtle transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-1.5 flex max-h-40 max-w-40 flex-col gap-1.5 overflow-y-auto pr-1">
              {departments.map((option) => {
                const key = option.slice(0, 3);
                return (
                  <label
                    key={key}
                    className="flex flex-nowrap items-start gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filtersHook.departments.includes(key)}
                      onChange={(e) =>
                        toggleFilter("departments", key, e.target.checked)
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <span className="wrap-break-word">
                      <span className="font-mono">{option.slice(0, 3)}</span>
                      {option.slice(3)}
                    </span>
                  </label>
                );
              })}
            </div>
          </details>

          <details className="group">
            <summary className="text-text-muted flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase [&::-webkit-details-marker]:hidden">
              Breadth Requirements
              <span className="text-text-subtle transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {breadths.map((option) => {
                const key = option.at(-2) ?? "";
                return (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filtersHook.breadth_requirements.includes(key)}
                      onChange={(e) =>
                        toggleFilter(
                          "breadth_requirements",
                          key,
                          e.target.checked,
                        )
                      }
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </details>
        </div>
      </details>

      <div className="hidden sm:contents">
        <FilterBar
          title="CR / NCR"
          options={["Eligible", "Ineligible"]}
          filtersHook={filtersHook}
          setFiltersHook={setFiltersHook}
          filtersTitle="cr_ncr"
          keyFormat={(option) => option.toLowerCase()}
        />
        <FilterBar
          title="Departments"
          options={departments}
          filtersHook={filtersHook}
          setFiltersHook={setFiltersHook}
          filtersTitle="departments"
          keyFormat={(option) => option.slice(0, 3)}
          renderOptionLabel={(option) => (
            <>
              <span className="font-mono">{option.slice(0, 3)}</span>
              {option.slice(3)}
            </>
          )}
        />
        <FilterBar
          title="Breadth Requirements"
          options={breadths}
          filtersHook={filtersHook}
          setFiltersHook={setFiltersHook}
          filtersTitle="breadth_requirements"
          keyFormat={(option) => option.at(-2) ?? ""}
        />
      </div>
      <button
        onClick={onLoadGraph}
        disabled={isLoading}
        className="from-btn-gradient-from to-btn-gradient-to hidden cursor-pointer rounded-md border-0 bg-linear-to-br px-5 py-2 font-sans text-sm text-white transition-colors duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex sm:w-auto sm:text-base"
      >
        Load Graph
      </button>
    </div>
  );
}
