import type { ReactNode } from "react";

interface AuthLeftPanelProps {
  /** Italic Playfair headline — use <br /> for line breaks */
  headline: ReactNode;
  /** Muted subtext rendered beneath the headline */
  sub?: string;
  /** Bottom-of-panel slot: steps, features, mosaic grid, etc. */
  children?: ReactNode;
}

/**
 * Red brand panel rendered on the left side of every auth page.
 * Includes the Slidebox logo, grid overlay, decorative floating boxes,
 * the italic headline, and an optional bottom slot.
 *
 * @example
 * <AuthLeftPanel
 *   headline={<>Welcome<br />back to your<br />gallery.</>}
 *   sub="Sign in to pick up right where you left off."
 * >
 *   <AuthStepList steps={steps} />
 * </AuthLeftPanel>
 */
export function AuthLeftPanel({ headline, sub, children }: AuthLeftPanelProps) {
  return (
    <div className="sb-left">
      <div className="sb-grid-overlay" />
      <div className="sb-floating-box" style={{ width: 110, height: 75, top: "34%", right: "8%" }} />
      <div className="sb-floating-box" style={{ width: 55, height: 55, bottom: "22%", left: "10%", borderRadius: "50%" }} />

      <div className="sb-logo">
        Slidebox<span className="sb-logo-dot" />
      </div>

      <div className="sb-left-mid">
        <h2>{headline}</h2>
        {sub && <p>{sub}</p>}
      </div>

      {children}
    </div>
  );
}