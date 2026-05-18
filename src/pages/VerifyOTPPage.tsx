import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { resendOTP, resetOTP, verifyOTP } from "../services/authServices";

const OTP_LENGTH = 6;

interface Props {
  mode: "signup" | "reset"
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
  const [otpExpiresAt, setOtpExpiresAt] = useState(
    location.state?.otpExpiresAt ?? "");

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!otpExpiresAt) return 0;

    return Math.max(
      0,
      Math.floor(
        (new Date(otpExpiresAt).getTime() - Date.now()) / 1000
      )
    );
  });
  const totalSeconds = secondsLeft;

  useEffect(() => {
    if (!otpExpiresAt) return;

    const expiresMs = new Date(otpExpiresAt).getTime();

    const updateTimer = () => {
      setSecondsLeft(
        Math.max(
          0,
          Math.floor((expiresMs - Date.now()) / 1000)
        )
      );
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  const expired = secondsLeft === 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const urgency = secondsLeft <= 30 && !expired;

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const isReset = mode === "reset"

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Handle verify otp running");

    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (expired) {
      setError("This OTP has expired. Please request a new one.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      console.log(email, otp);


      const result = await dispatch(
        isReset
          ? resetOTP({ email, otp })
          : verifyOTP({ email, otp })
      ).unwrap();
      console.log(result);


      if (isReset) {
        navigate("/new-password", {
          state: {
            resetToken: result.data.resetToken,
          },
        });
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
    if (!email) {
      return;
    }
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .sb-left {
                    width: 45%;
                    background: #C1121F;
                    background-image:
                        radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.25) 0%, transparent 60%);
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 3rem;
                    overflow: hidden;
                }

                .sb-grid-overlay {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                .sb-floating-box {
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.15);
                    border-radius: 16px;
                    background: rgba(255,255,255,0.06);
                }

                .sb-logo {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .sb-logo-dot {
                    width: 10px;
                    height: 10px;
                    background: #FFB3B3;
                    border-radius: 50%;
                    display: inline-block;
                    margin-left: 2px;
                    vertical-align: super;
                }

                .sb-left-mid {
                    position: relative;
                    z-index: 1;
                }

                .sb-left-mid h2 {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-style: italic;
                    font-weight: 400;
                    font-size: 2.4rem;
                    color: rgba(255,255,255,0.95);
                    line-height: 1.25;
                    margin-bottom: 1.25rem;
                }

                .sb-left-mid p {
                    font-size: 0.95rem;
                    color: rgba(255,255,255,0.65);
                    line-height: 1.7;
                    max-width: 300px;
                    font-weight: 300;
                }

                .sb-email-chip {
                    margin-top: 1.5rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 100px;
                    padding: 6px 14px;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.9);
                    font-weight: 400;
                    word-break: break-all;
                }

                .sb-email-chip-dot {
                    width: 7px;
                    height: 7px;
                    background: #FFB3B3;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .sb-lock-icon {
                    position: relative;
                    z-index: 1;
                    width: 52px;
                    height: 52px;
                    background: rgba(255,255,255,0.12);
                    border: 1.5px solid rgba(255,255,255,0.2);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                /* Right panel */
                .sb-right {
                    flex: 1;
                    background: #FAFAF9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                }

                .sb-form-container {
                    width: 100%;
                    max-width: 400px;
                }

                .sb-form-header {
                    margin-bottom: 2rem;
                }

                .sb-form-header h1 {
                    font-size: 1.9rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.5px;
                    margin-bottom: 6px;
                }

                .sb-form-header p {
                    font-size: 0.9rem;
                    color: #888;
                }

                .sb-form-header a {
                    color: #C1121F;
                    text-decoration: none;
                    font-weight: 500;
                }

                /* Timer */
                .sb-timer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #fff;
                    border: 1.5px solid #E5E5E2;
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 24px;
                }

                .sb-timer-label {
                    font-size: 0.8rem;
                    color: #aaa;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    font-weight: 500;
                }

                .sb-timer-value {
                    font-size: 1.3rem;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    letter-spacing: 1px;
                    transition: color 0.3s;
                }

                .sb-timer-bar-track {
                    height: 3px;
                    background: #F0EFED;
                    border-radius: 100px;
                    overflow: hidden;
                    margin-top: 8px;
                }

                .sb-timer-bar-fill {
                    height: 100%;
                    border-radius: 100px;
                    transition: width 1s linear, background 0.3s;
                }

                /* OTP digit inputs */
                .sb-otp-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    justify-content: space-between;
                }

                .sb-digit {
                    width: calc((100% - 40px) / 6);
                    min-width: 0;
                    height: 58px;
                    text-align: center;
                    font-size: 1.4rem;
                    font-weight: 700;
                    font-family: 'DM Sans', sans-serif;
                    border: 1.5px solid #E5E5E2;
                    border-radius: 10px;
                    background: #fff;
                    color: #1a1a1a;
                    outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s;
                    caret-color: #C1121F;
                }

                .sb-digit:focus {
                    border-color: #C1121F;
                    box-shadow: 0 0 0 3px rgba(193,18,31,0.1);
                }

                .sb-digit.filled {
                    border-color: #C1121F;
                    background: #FFF8F8;
                    color: #C1121F;
                }

                .sb-digit:disabled {
                    background: #F5F5F3;
                    color: #bbb;
                    border-color: #E5E5E2;
                    cursor: not-allowed;
                }

                .sb-error {
                    font-size: 0.83rem;
                    color: #C1121F;
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .sb-submit {
                    width: 100%;
                    padding: 0.85rem;
                    background: #C1121F;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    letter-spacing: 0.2px;
                    transition: background 0.18s, transform 0.1s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .sb-submit:hover:not(:disabled) { background: #A50F1A; }
                .sb-submit:active:not(:disabled) { transform: scale(0.99); }
                .sb-submit:disabled {
                    background: #E5A0A4;
                    cursor: not-allowed;
                }

                .sb-submit-arrow {
                    font-size: 1.1rem;
                    transition: transform 0.18s;
                }

                .sb-submit:hover:not(:disabled) .sb-submit-arrow {
                    transform: translateX(3px);
                }

                .sb-resend {
                    margin-top: 18px;
                    text-align: center;
                    font-size: 0.83rem;
                    color: #aaa;
                }

                .sb-resend a {
                    color: #C1121F;
                    text-decoration: none;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .sb-left { display: none; }
                    .sb-right { padding: 2rem 1.5rem; }
                }
            `}</style>

      {/* Left panel */}
      <div className="sb-left">
        <div className="sb-grid-overlay" />
        <div className="sb-floating-box" style={{ width: 100, height: 70, top: "32%", right: "10%" }} />
        <div className="sb-floating-box" style={{ width: 50, height: 50, bottom: "25%", left: "12%", borderRadius: "50%" }} />

        <div className="sb-logo">
          Slidebox<span className="sb-logo-dot" />
        </div>

        <div className="sb-left-mid">
          <div className="sb-lock-icon">🔐</div>
          <h2 style={{ marginTop: "1.25rem" }}>One step<br />away from<br />your photos.</h2>
          <p>We sent a secure verification code to your inbox. It only takes a moment.</p>
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
      </div>

      {/* Right panel */}
      <div className="sb-right">
        <div className="sb-form-container">
          <div className="sb-form-header">
            <h1>Verify your email</h1>
            <p>Enter the 6-digit code sent to <a href="#">{email || "your email"}</a></p>
          </div>

          {/* Timer */}
          {otpExpiresAt && (() => {
            const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
            const barColor = expired ? "#E5E5E2" : urgency ? "#E24B4A" : "#C1121F";
            const textColor = expired ? "#bbb" : urgency ? "#E24B4A" : "#C1121F";
            return (
              <div className="sb-timer">
                <div>
                  <div className="sb-timer-label">Code expires in</div>
                  <div className="sb-timer-bar-track" style={{ marginTop: 6, width: 160 }}>
                    <div
                      className="sb-timer-bar-fill"
                      style={{ width: `${expired ? 0 : pct}%`, background: barColor }}
                    />
                  </div>
                </div>
                <div className="sb-timer-value" style={{ color: textColor }}>
                  {expired ? "Expired" : formatTime(secondsLeft)}
                </div>
              </div>
            );
          })()}

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

            {error && (
              <div className="sb-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="sb-submit"
              disabled={loading || expired || digits.join("").length < OTP_LENGTH}
            >
              {loading ? "Verifying…" : "Verify & continue"}
              {!loading && <span className="sb-submit-arrow">→</span>}
            </button>
          </form>

          <p className="sb-resend">
            Didn't get a code?{" "}
            <button
              style={{color: loading?"grey":"red"}}
              type="button"
              onClick={handleResend}
              disabled={ loading}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}