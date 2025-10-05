import { ReactNode, HTMLProps } from "react";

export interface FormFieldProps {
  label: ReactNode;
  id: string;
  placeholder: string;
  name: string;
  required?: boolean;
}
