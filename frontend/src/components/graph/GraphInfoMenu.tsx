interface BottomRightMenuProps {
  children: React.ReactNode;
}

export default function BottomRightMenu({ children }: BottomRightMenuProps) {
  return (
    <div className="fixed right-3 bottom-3 z-30 flex flex-row items-end gap-2 sm:right-4 sm:bottom-4">
      {children}
    </div>
  );
}
