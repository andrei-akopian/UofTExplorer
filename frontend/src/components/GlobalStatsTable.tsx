import { useState, useEffect } from "react";
import { fetchGlobalStats } from "../lib/api";
import type { GlobalStats } from "../types";

export default function GlobalStatsTable() {
  const [data, setData] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await fetchGlobalStats();
        setData(stats);
        setLoading(false);
      } catch {
        console.error("global stats request failed");
      }
    };
    fetchData();
  }, []);

  let entries: React.ReactNode;
  if (loading || data === null) {
    entries = (
      <tbody>
        <tr className="odd:bg-panel-bg even:bg-surface-1">
          <td className="border-border-card border-b px-3 py-2">Loading...</td>
          <td className="border-border-card border-b px-3 py-2">Loading...</td>
        </tr>
      </tbody>
    );
  } else {
    entries = (
      <tbody>
        {Object.entries(data).map(([key, value], index) => (
          <tr key={index} className="odd:bg-panel-bg even:bg-surface-1">
            <td className="border-border-card border-b px-3 py-2">{key}</td>
            <td className="border-border-card border-b px-3 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <div className="mt-4 mb-6 overflow-x-auto">
      <table className="border-border-card min-w-full border-separate border-spacing-0 border-t border-b [counter-increment:tablecaption]">
        <caption className="mt-2 ml-0 w-full px-1 pt-1 text-left italic before:font-bold before:not-italic before:[content:'Table_'counter(tablecaption)'._']">
          Statistics computed on the entire graph.
        </caption>
        <thead>
          <tr>
            <th className="bg-surface-2 text-text-body px-3 py-2 text-left font-semibold">
              Statistic
            </th>
            <th className="bg-surface-2 text-text-body px-3 py-2 text-left font-semibold">
              Value
            </th>
          </tr>
        </thead>
        {entries}
      </table>
    </div>
  );
}
