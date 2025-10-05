import { CustomTextFieldProps, TextField, TextFieldProps } from "./TextField";

export function PasswordField({
  label = "Password",
  id = "password",
  placeholder = "Your password",
  ...props
}: CustomTextFieldProps) {
  return (
    <TextField
      type="password"
      id={id}
      label={label}
      placeholder={placeholder}
      {...props}
    />
  );
}
