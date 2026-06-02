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
    >
      {labelling}
    </div>
  );
}
