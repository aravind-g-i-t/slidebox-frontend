import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface AuthFormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  id: string;
  label: string;
  /**
   * "password" enables the built-in show/hide toggle automatically.
   * All other native input types work as-is.
   */
  type?: string;
  /** Extra class added to <input> — use "match" (green) or "bad" (red) for validation states */
  inputClassName?: string;
  /** Rendered flush-right below the input (e.g. a "Forgot password?" link) */
  hint?: ReactNode;
}

/**
 * Labelled form field with optional show/hide toggle for passwords.
 * All native InputHTMLAttributes (value, onChange, placeholder, required, autoFocus…)
 * are forwarded to the underlying <input>.
 *
 * @example
 * // Plain text field
 * <AuthFormField id="email" label="Email address" type="email"
 *   placeholder="you@example.com" value={email}
 *   onChange={(e) => setEmail(e.target.value)} required />
 *
 * // Password field — show/hide toggle is automatic
 * <AuthFormField id="password" label="Password" type="password"
 *   placeholder="Min. 8 characters" value={password}
 *   hint={<a href="/forgot-password">Forgot password?</a>}
 *   onChange={(e) => setPassword(e.target.value)} required />
 *
 * // Confirm field with validation state
 * <AuthFormField id="confirm" label="Confirm password" type="password"
 *   inputClassName={match ? "match" : mismatch ? "bad" : ""}
 *   value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
 */
export function AuthFormField({
  id,
  label,
  type = "text",
  inputClassName = "",
  hint,
  style,
  ...inputProps
}: AuthFormFieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="sb-field">
      <label className="sb-label" htmlFor={id}>
        {label}
      </label>

      <div className="sb-input-wrap">
        <input
          id={id}
          className={`sb-input${inputClassName ? ` ${inputClassName}` : ""}`}
          type={resolvedType}
          style={isPassword ? { paddingRight: "3.5rem", ...style } : style}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="sb-eye-btn"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {hint && <div className="sb-field-hint">{hint}</div>}
    </div>
  );
}