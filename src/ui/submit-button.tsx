import { ReactNode } from "react";
import Button, { ButtonProps } from "./button";

type SubmitButtonProps = {
  pending?: boolean;
  pendingEl?: ReactNode;
} & Omit<ButtonProps, "type">;

export default function SubmitButton({
  children,
  pending,
  pendingEl,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && pendingEl ? pendingEl : children}
    </Button>
  );
}
