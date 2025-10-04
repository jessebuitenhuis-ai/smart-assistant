type InputProps = {
  labelTxt: string;
  errors?: string[];
} & React.HTMLProps<HTMLInputElement>;

export default function Input({
  labelTxt,
  errors,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
        {labelTxt}
      </label>
      <input
        className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {errors && <p className="text-sm text-red-600">{errors}</p>}
    </div>
  );
}
