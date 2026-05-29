
interface AuthErrorBannerProps {
  message?: string;
}

/**
 * Red ⚠ error banner. Renders nothing when message is falsy,
 * so it's safe to always mount it.
 *
 * @example
 * <AuthErrorBanner message={error} />
 */
export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="sb-error">
      <span>⚠</span> {message}
    </div>
  );
}