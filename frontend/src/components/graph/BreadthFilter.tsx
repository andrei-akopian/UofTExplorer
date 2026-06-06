import { type QueryFilters } from "../../types";

const breadths = [
  "Creative and Cultural Representations (1)",
  "Thought, Belief, and Behaviour (2)",
  "Society and its Institutions (3)",
  "Living Things and Their Environment (4)",
  "The Physical and Mathematical Universes (5)",
];

export function BreadthFilter({
  filtersHook,
  setFiltersHook,
  filtersTitle,
  keyFormat,
}: {
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
    <div className="group flex flex-row rounded-md border border-gray-300 bg-white p-2.5 px-5">
      <div className="px-1">BR:</div>
      {breadths.map((option) => (
        <label
          key={keyFormat(option)}
          className="solid max-h-fit border-r border-l"
        >
          <input
            type="checkbox"
            className="peer hidden"
            onChange={(e) => handleChange(e, keyFormat(option))}
          />
          <div className="peer-checked:bg-[#0E6EDF] peer-checked:text-white">
            {/*Put BR number at the top, and then its name like tooltip.*/}
            <div className="box-content w-[1em] px-2 text-center">
              {option[option.length - 2]}
            </div>
            <span className="hidden h-[22em] text-nowrap [writing-mode:vertical-rl] group-hover:block">
              {option.substring(0, option.length - 3)}
            </span>
          </div>
        </label>
      ))}
    </div>
  );
}
