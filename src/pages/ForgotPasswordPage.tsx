import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { verifyEmail } from "../services/authServices";
import {
  AuthLayout, AuthLeftPanel, AuthStepList, AuthFormField,
  AuthSubmitButton, AuthErrorBanner,
} from "../components/index";

const STEPS = [
  { label: "Enter your email", sub: "We'll send you a reset code", state: "active" as const },
  { label: "Verify the OTP",   sub: "Enter the 6-digit code" },
  { label: "Set a new password", sub: "Choose something strong" },
];

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const result = await dispatch(verifyEmail({ email })).unwrap();
      navigate("/reset-otp", { state: { email, otpExpiresAt: result.data.otpExpiresAt } });
      setSent(true);
    } catch {
      setError("No account found with that email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      <AuthLeftPanel
        headline={<>Reset your<br />password<br />in 3 steps.</>}
        sub="We'll send a secure code to your email. It only takes a minute."
      >
        <AuthStepList steps={STEPS} />
      </AuthLeftPanel>

      <div className="sb-right">
        <div className="sb-form-container">
          {sent ? (
            <>
              <div className="sb-sent-card">
                <div className="sb-sent-icon">📬</div>
                <h2>Check your inbox</h2>
                <p>We've sent a 6-digit reset code to:</p>
                <span className="sb-sent-email">{email}</span>
                <p style={{ marginTop: 12 }}>It expires in 10 minutes. Check your spam folder if you don't see it.</p>
              </div>
              <AuthSubmitButton type="button" onClick={() => navigate("/reset-otp", { state: { email } })}>
                Enter OTP
              </AuthSubmitButton>
              <p className="sb-back">
                Wrong email?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); }}>Try again</a>
              </p>
            </>
          ) : (
            <>
              <div className="sb-form-header">
                <h1>Forgot password?</h1>
                <p>Enter the email address linked to your Slidebox account and we'll send you a reset code.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <AuthFormField
                  id="email" label="Email address" type="email"
                  placeholder="you@example.com" value={email} required autoFocus
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
                <AuthErrorBanner message={error} />
                <AuthSubmitButton loading={loading} loadingText="Sending…">
                  Send reset code
                </AuthSubmitButton>
              </form>

              <p className="sb-back">
                Remembered it? <a href="/signin">Sign in instead</a>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}