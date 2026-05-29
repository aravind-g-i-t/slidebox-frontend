import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Top-level page wrapper.
 * Pass <AuthLeftPanel> and a right-panel <div className="sb-right"> as children.
 *
 * @example
 * <AuthLayout>
 *   <AuthLeftPanel headline={…} sub="…" />
 *   <div className="sb-right">
 *     <div className="sb-form-container">…</div>
 *   </div>
 * </AuthLayout>
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="sb-page">{children}</div>;
}