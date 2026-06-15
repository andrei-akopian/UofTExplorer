interface GraphInfoMenuProps {
  children: React.ReactNode;
  nodesOpen?: boolean;
}

export default function GraphInfoMenu({
  children,
  nodesOpen,
}: GraphInfoMenuProps) {
  return (
    <div className="fixed right-3 bottom-3 z-30 flex flex-row items-end gap-2 sm:right-4 sm:bottom-4">
      {children}
    </div>
  );
}
