
export interface AuthFeature {
  icon: string;
  text: string;
}

interface AuthFeatureListProps {
  features: AuthFeature[];
}

/**
 * Icon + text feature bullets for the left panel (used on sign-up page).
 *
 * @example
 * const features: AuthFeature[] = [
 *   { icon: "🗂", text: "Smart album organization" },
 *   { icon: "🔒", text: "Private & shareable galleries" },
 *   { icon: "⚡", text: "Lightning-fast uploads" },
 * ];
 * <AuthFeatureList features={features} />
 */
export function AuthFeatureList({ features }: AuthFeatureListProps) {
  return (
    <div className="sb-features">
      {features.map((f) => (
        <div key={f.text} className="sb-feature">
          <div className="sb-feature-icon">{f.icon}</div>
          {f.text}
        </div>
      ))}
    </div>
  );
}