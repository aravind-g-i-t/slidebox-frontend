import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { resendOTP, resetOTP, verifyOTP } from "../services/authServices";
import {
  AuthLayout, AuthLeftPanel, AuthSubmitButton, AuthErrorBanner,
} from "../components/index";

const OTP_LENGTH = 6;

interface Props {
  mode: "signup" | "reset";
}

export default function VerifyOtpPage({ mode = "signup" }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const email: string = location.state?.email ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpExpiresAt, setOtpExpiresAt] = useState(location.state?.otpExpiresAt ?? "");

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!otpExpiresAt) return 0;
    return Math.max(0, Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000));
  });
  const totalSeconds = secondsLeft;

  useEffect(() => {
    if (!otpExpiresAt) return;
    const expiresMs = new Date(otpExpiresAt).getTime();
    const updateTimer = () => setSecondsLeft(Math.max(0, Math.floor((expiresMs - Date.now()) / 1000)));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const expired = secondsLeft === 0;
  const urgency = secondsLeft <= 30 && !expired;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const isReset = mode === "reset";

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) { setError("Please enter all 6 digits."); return; }
    if (expired) { setError("This OTP has expired. Please request a new one."); return; }
    try {
      setLoading(true);
      setError("");
      const result = await dispatch(isReset ? resetOTP({ email, otp }) : verifyOTP({ email, otp })).unwrap();
      if (isReset) {
        navigate("/new-password", { state: { resetToken: result.data.resetToken } });
      } else {
        navigate("/signin");
      }
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setError("");
      const result = await dispatch(resendOTP({ email })).unwrap();
      setOtpExpiresAt(result.data.otpExpiresAt);
      setDigits(Array(OTP_LENGTH).fill(""));
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const barColor = expired ? "#E5E5E2" : urgency ? "#E24B4A" : "#C1121F";
  const textColor = expired ? "#bbb" : urgency ? "#E24B4A" : "#C1121F";

  return (
    <AuthLayout>

      <AuthLeftPanel
        headline={<>One step<br />away from<br />your photos.</>}
        sub="We sent a secure verification code to your inbox. It only takes a moment."
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="sb-lock-icon">🔐</div>
          {email && (
            <div className="sb-email-chip">
              <span className="sb-email-chip-dot" />
              {email}
            </div>
          )}
        </div>
        <div style={{ position: "relative", zIndex: 1, fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>
          Didn't receive it? Check your spam folder.
        </div>
      </AuthLeftPanel>

      <div className="sb-right">
        <div className="sb-form-container">
          <div className="sb-form-header">
            <h1>Verify your email</h1>
            <p>Enter the 6-digit code sent to <a href="#">{email || "your email"}</a></p>
          </div>

          {otpExpiresAt && (
            <div className="sb-timer">
              <div>
                <div className="sb-timer-label">Code expires in</div>
                <div className="sb-timer-bar-track" style={{ width: 160 }}>
                  <div className="sb-timer-bar-fill" style={{ width: `${expired ? 0 : pct}%`, background: barColor }} />
                </div>
              </div>
              <div className="sb-timer-value" style={{ color: textColor }}>
                {expired ? "Expired" : formatTime(secondsLeft)}
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyOtp}>
            <div className="sb-otp-row" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  className={`sb-digit${d ? " filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  disabled={expired || loading}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <AuthErrorBanner message={error} />

            <AuthSubmitButton
              loading={loading}
              loadingText="Verifying…"
              disabled={expired || digits.join("").length < OTP_LENGTH}
            >
              Verify &amp; continue
            </AuthSubmitButton>
          </form>

          <p className="sb-resend">
            Didn't get a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{ color: loading ? "#aaa" : "#C1121F" }}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}