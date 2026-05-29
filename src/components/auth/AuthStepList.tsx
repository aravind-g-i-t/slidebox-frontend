
export interface AuthStep {
  label: string;
  sub: string;
  /** "done" = completed ✓, "active" = current step, undefined = upcoming */
  state?: "done" | "active";
}

interface AuthStepListProps {
  steps: AuthStep[];
}

/**
 * Numbered step tracker for multi-step flows (forgot-password, reset-password).
 * Rendered inside the bottom slot of <AuthLeftPanel>.
 *
 * @example
 * const steps: AuthStep[] = [
 *   { label: "Enter your email",   sub: "We'll send you a reset code", state: "done"   },
 *   { label: "Verify the OTP",     sub: "Enter the 6-digit code",      state: "done"   },
 *   { label: "Set a new password", sub: "Choose something strong",     state: "active" },
 * ];
 * <AuthStepList steps={steps} />
 */
export function AuthStepList({ steps }: AuthStepListProps) {
  return (
    <div className="sb-left-steps">
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="sb-step">
            <div className={`sb-step-num${step.state ? ` ${step.state}` : ""}`}>
              {step.state === "done" ? "✓" : i + 1}
            </div>
            <div className="sb-step-text">
              <strong>{step.label}</strong>
              <span>{step.sub}</span>
            </div>
          </div>
          {i < steps.length - 1 && <div className="sb-step-connector" />}
        </div>
      ))}
    </div>
  );
}