import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  loading?: boolean;
  /** Text shown while loading (defaults to "Please wait…") */
  loadingText?: string;
  disabled?: boolean;
  children: ReactNode;
  /** Defaults to "submit" */
  type?: "submit" | "button";
  onClick?: () => void;
}

/**
 * Full-width red submit button with an animated → arrow.
 * The arrow disappears and the button is disabled while loading.
 *
 * @example
 * <AuthSubmitButton loading={loading} loadingText="Signing in…">
 *   Sign in
 * </AuthSubmitButton>
 */
export function AuthSubmitButton({
  loading = false,
  loadingText,
  disabled,
  children,
  type = "submit",
  onClick,
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      className="sb-submit"
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? (loadingText ?? "Please wait…") : children}
      {!loading && <span className="sb-submit-arrow">→</span>}
    </button>
  );
}