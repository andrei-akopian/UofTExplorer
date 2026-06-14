interface BottomRightMenuProps {
  children: React.ReactNode;
}

export default function BottomRightMenu({ children }: BottomRightMenuProps) {
  return <div className="flex flex-row items-end gap-2">{children}</div>;
}
