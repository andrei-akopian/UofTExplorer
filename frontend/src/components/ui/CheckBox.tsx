import type { InputHTMLAttributes } from "react";

type CheckBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function CheckBox({
  checked,
  className,
  ...props
}: CheckBoxProps) {
  return (
    <input
      type="checkbox"
      className={`cursor-pointer ${className}`}
      checked={checked}
      {...props}
    />
  );
}
