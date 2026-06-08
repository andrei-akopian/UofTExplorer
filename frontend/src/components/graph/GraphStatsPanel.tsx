import type { GraphData } from "../../types";

function TextDisplay({ data, entry }: { data: GraphData; entry: string }) {
  return (
    <p>
      {entry}: {data.live_stats?.[entry]}
    </p>
  );
}

export default function GraphStatsPanel({ data }: { data: GraphData }) {
  return (
    <div className="h-full w-full rounded-2xl border-2 border-indigo-200 bg-blue-50 drop-shadow-xl">
      <div className="m-4 overflow-auto text-[14px]">
        <TextDisplay data={data} entry={"Number of courses"} />
        <TextDisplay data={data} entry={"Number of requisites"} />
        <br></br>
        <TextDisplay data={data} entry={"Number of courses in breadth 1"} />
        <TextDisplay data={data} entry={"Number of courses in breadth 2"} />
        <TextDisplay data={data} entry={"Number of courses in breadth 3"} />
        <TextDisplay data={data} entry={"Number of courses in breadth 4"} />
        <TextDisplay data={data} entry={"Number of courses in breadth 5"} />
        <br></br>
        <TextDisplay
          data={data}
          entry={"Number of courses eligible for CR/NCR"}
        />
        <TextDisplay
          data={data}
          entry={"Number of courses not eligible for CR/NCR"}
        />
      </div>
    </div>
  );
}
