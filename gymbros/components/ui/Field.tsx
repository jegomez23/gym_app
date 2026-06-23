import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/*
  Form primitives. One focus ring, one validation language, one spacing rhythm.
  Features compose <Field> + <Input|Textarea|Select> instead of re-declaring
  Tailwind strings on every input.
*/

const controlBase =
  "w-full rounded-md border border-white/8 bg-white/3 px-4 py-3.5 text-body text-primary-text outline-none transition duration-(--duration-fast) placeholder:text-secondary-text/60 focus-visible:border-accent-border focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-50";

const invalidClass =
  "border-danger-border focus-visible:border-danger-border focus-visible:ring-danger-soft";

type FieldProps = {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  helper,
  error,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className="text-caption font-medium text-secondary-text"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-caption text-danger" role="alert">
          {error}
        </span>
      ) : (
        helper && (
          <span className="text-caption leading-5 text-secondary-text/80">
            {helper}
          </span>
        )
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...props },
  ref
) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${controlBase} ${invalid ? invalidClass : ""} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = "", invalid = false, ...props }, ref) {
    return (
      <textarea
        aria-invalid={invalid || undefined}
        className={`${controlBase} resize-none leading-7 ${invalid ? invalidClass : ""} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className = "", invalid = false, children, ...props },
    ref
  ) {
    return (
      <select
        aria-invalid={invalid || undefined}
        className={`${controlBase} cursor-pointer ${invalid ? invalidClass : ""} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
