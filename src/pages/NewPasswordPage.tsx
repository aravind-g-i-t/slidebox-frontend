import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { resetPassword } from "../services/authServices";
import { useToast } from "../hooks/useToast";
import { getPasswordStrength } from "../utils/validation";
import { getErrorMessage } from "../utils/errors";
import {
  AuthLayout, AuthLeftPanel, AuthStepList, AuthFormField,
  AuthSubmitButton, AuthErrorBanner,
} from "../components/index";

const STEPS = [
  { label: "Enter your email",   sub: "We'll send you a reset code", state: "done"   as const },
  { label: "Verify the OTP",     sub: "Enter the 6-digit code",      state: "done"   as const },
  { label: "Set a new password", sub: "Choose something strong",     state: "active" as const },
];

const MIN_PASSWORD_SCORE = 2;

export default function NewPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const resetToken: string = location.state?.resetToken ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const strength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;
  const mismatch       = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    if (!resetToken) {
      showToast("Your reset session has expired. Please request a new code.", "warning");
      navigate("/forgot-password", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }
    if (strength.score < MIN_PASSWORD_SCORE) {
      setError("Please choose a stronger password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await dispatch(resetPassword({ resetToken, password })).unwrap();
      showToast("Password updated. You can now sign in.", "success");
      navigate("/signin", { state: { resetSuccess: true } });
    } catch (err) {
      const message = getErrorMessage(err, "Something went wrong. Please try again.");
      setError(message);
      showToast(message, "error");
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
              disabled={!passwordsMatch || strength.score < MIN_PASSWORD_SCORE}
            >
              Save new password
            </AuthSubmitButton>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}