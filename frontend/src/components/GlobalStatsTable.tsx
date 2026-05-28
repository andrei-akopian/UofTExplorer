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
  if (loading) {
    entries = (
      <tbody>
        <tr className="odd:bg-white even:bg-slate-50">
          <td className="border-b border-slate-200 px-3 py-2">Loading...</td>
          <td className="border-b border-slate-200 px-3 py-2">Loading...</td>
        </tr>
      </tbody>
    );
  } else {
    entries = (
      <tbody>
        {Object.entries(data).map(([key, value], index) => (
          <tr key={index} className="odd:bg-white even:bg-slate-50">
            <td className="border-b border-slate-200 px-3 py-2">{key}</td>
            <td className="border-b border-slate-200 px-3 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <div className="mt-4 mb-6 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 border-t border-b border-slate-300">
        <caption className="mb-2 block text-left text-sm text-slate-700">
          <span className="font-semibold">Table 1. </span>Statistics computed on
          the entire graph.
        </caption>
        <thead>
          <tr>
            <th className="bg-slate-50 px-3 py-2 text-left font-semibold text-slate-900">
              Statistic
            </th>
            <th className="bg-slate-50 px-3 py-2 text-left font-semibold text-slate-900">
              Value
            </th>
          </tr>
        </thead>
        {entries}
      </table>
    </div>
  );
}
