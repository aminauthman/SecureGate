import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  labelEnd?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type,
  autoComplete,
  value,
  onChange,
  error,
  autoFocus,
  onFocus,
  onBlur,
  labelEnd,
}: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-base font-normal text-slate-600 dark:text-slate-400">
          {label}
        </label>
        {labelEnd && <div className="text-sm">{labelEnd}</div>}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full px-4 py-3 text-base font-sans rounded-md border min-h-[48px]
            bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-600"}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && value.length > 0 && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {visible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
