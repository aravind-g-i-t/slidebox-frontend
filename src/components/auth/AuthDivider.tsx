
interface AuthDividerProps {
  label?: string;
}

/**
 * Horizontal rule with a centred label (defaults to "or").
 *
 * @example
 * <AuthDivider />
 * <AuthDivider label="continue with" />
 */
export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <div className="sb-divider">
      <div className="sb-divider-line" />
      <span className="sb-divider-text">{label}</span>
      <div className="sb-divider-line" />
    </div>
  );
}