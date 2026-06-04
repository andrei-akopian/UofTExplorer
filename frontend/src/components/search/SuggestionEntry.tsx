export default function SuggestionEntry({
  key,
  onClickCallback,
  labelling,
}: {
  key: string;
  onClickCallback: () => void;
  labelling: string;
}) {
  return (
    <div
      key={key}
      onClick={onClickCallback}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className="cursor-pointer border-b border-slate-100 px-3 py-2 text-sm text-slate-800 last:border-b-0 hover:bg-slate-50"
    >
      {labelling}
    </div>
  );
}
