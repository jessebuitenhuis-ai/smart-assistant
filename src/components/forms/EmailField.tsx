import { CustomTextFieldProps, TextField, TextFieldProps } from "./TextField";

export function EmailField({
  id = "email",
  label = "Email",
  placeholder = "m@example.com",
  ...props
}: CustomTextFieldProps) {
  return (
    <TextField
      type="email"
      id={id}
      label={label}
      name={id}
      placeholder={placeholder}
      {...props}
    />
  );
}
