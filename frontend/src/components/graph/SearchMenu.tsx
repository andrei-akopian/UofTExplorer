import { useState, useEffect } from "react";
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
}: {
  title: string;
  options: string[];
  filtersHook: QueryFilters;
  setFiltersHook: (filtersHook: QueryFilters) => void;
  filtersTitle: keyof QueryFilters;
  keyFormat: (option: string) => string;
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
      <summary className="border-input-border bg-panel-bg text-text-body flex cursor-pointer list-none items-center gap-2 rounded-md border px-5 py-2.5 text-sm select-none [&::-webkit-details-marker]:hidden">
        {title}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="m2 4 4 4 4-4" stroke="currentColor" />
        </svg>
      </summary>
      <div className="border-border-dropdown bg-panel-bg text-text-body shadow-dropdown absolute top-[calc(100%+6px)] left-0 z-50 flex max-h-[20em] w-max flex-col gap-1.5 overflow-y-auto rounded-md border p-2.5">
        {options.map((option) => (
          <label
            key={keyFormat(option)}
            className="flex max-h-none w-max min-w-[5em] items-center gap-2 overflow-visible text-sm"
          >
            <input
              type="checkbox"
              onChange={(e) => handleChange(e, keyFormat(option))}
            />
            <span>{option}</span>
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
}

export default function SearchMenu({
  query,
  setQuery,
  filtersHook,
  setFiltersHook,
}: SearchMenuProps) {
  const [departments, setDepartments] = useState<string[]>([]);

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

  return (
    <div className="flex flex-wrap gap-2 font-sans">
      <SearchBar query={query} setQuery={setQuery} />
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
  );
}
