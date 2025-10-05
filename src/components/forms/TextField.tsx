import { HTMLProps } from "react";
import { FieldLabel, Field } from "../ui/field";
import { Input } from "../ui/input";
import { FormFieldProps } from "./FormFieldProps";

export type TextFieldProps = FormFieldProps & {
  type?: HTMLProps<"input">["type"];
};

export type CustomTextFieldProps = Partial<Omit<TextFieldProps, "type">>;

export function TextField({
  label,
  id,
  type = "text",
  placeholder,
  required,
}: TextFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}
