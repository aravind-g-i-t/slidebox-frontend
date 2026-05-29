import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { resetPassword } from "../services/authServices";
import {
  AuthLayout, AuthLeftPanel, AuthStepList, AuthFormField,
  AuthSubmitButton, AuthErrorBanner,
} from "../components/index";

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  if (pw.length >= 12)          score++;

  if (score <= 1) return { score, label: "Weak",   color: "#E24B4A" };
  if (score <= 2) return { score, label: "Fair",   color: "#F4A261" };
  if (score <= 3) return { score, label: "Good",   color: "#2A9D8F" };
                  return { score, label: "Strong", color: "#40916C" };
}

const STEPS = [
  { label: "Enter your email",   sub: "We'll send you a reset code", state: "done"   as const },
  { label: "Verify the OTP",     sub: "Enter the 6-digit code",      state: "done"   as const },
  { label: "Set a new password", sub: "Choose something strong",     state: "active" as const },
];

export default function NewPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken: string = location.state?.resetToken ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const strength = getStrength(password);
  const passwordsMatch = password && confirm && password === confirm;
  const mismatch       = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (strength.score < 2)    { setError("Please choose a stronger password."); return; }
    try {
      setLoading(true);
      setError("");
      await dispatch(resetPassword({ resetToken, password })).unwrap();
      navigate("/signin", { state: { resetSuccess: true } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <AuthLeftPanel
        headline={<>Almost there.<br />Choose a<br />strong password.</>}
        sub="A strong password keeps your gallery safe from unwanted access."
      >
        <AuthStepList steps={STEPS} />
      </AuthLeftPanel>

      <div className="sb-right">
        <div className="sb-form-container">
          <div className="sb-form-header">
            <h1>Set new password</h1>
            <p>Choose a password you haven't used before.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <AuthFormField
              id="new-password" label="New password" type="password"
              placeholder="Min. 8 characters" value={password} required autoFocus
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />

            {password.length > 0 && (
              <div className="sb-strength-wrap" style={{ marginTop: -8, marginBottom: 14 }}>
                <div className="sb-strength-track">
                  <div className="sb-strength-fill" style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }} />
                </div>
                <span className="sb-strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}

            <AuthFormField
              id="confirm-password" label="Confirm password" type="password"
              placeholder="Repeat your password" value={confirm} required
              inputClassName={passwordsMatch ? "match" : mismatch ? "bad" : ""}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            />

            {password.length > 0 && (
              <div className="sb-reqs">
                {[
                  { label: "At least 8 characters",         met: password.length >= 8 },
                  { label: "One uppercase letter (A–Z)",     met: /[A-Z]/.test(password) },
                  { label: "One number (0–9)",               met: /[0-9]/.test(password) },
                  { label: "One special character (!@#…)",   met: /[^A-Za-z0-9]/.test(password) },
                ].map((req) => (
                  <div key={req.label} className={`sb-req${req.met ? " met" : ""}`}>
                    <div className="sb-req-dot">{req.met ? "✓" : ""}</div>
                    {req.label}
                  </div>
                ))}
              </div>
            )}

            <AuthErrorBanner message={error} />

            <AuthSubmitButton
              loading={loading}
              loadingText="Saving…"
              disabled={!passwordsMatch || strength.score < 2}
            >
              Save new password
            </AuthSubmitButton>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}