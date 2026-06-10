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
      className="border-border-card text-text-body hover:bg-surface-1 cursor-pointer border-b px-3 py-2 text-sm last:border-b-0"
    >
      {labelling}
    </div>
  );
}
