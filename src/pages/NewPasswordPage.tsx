import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { resetPassword } from "../services/authServices";
// import { resetPassword } from "../services/authServices";

function getStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8)                    score++;
    if (/[A-Z]/.test(pw))                  score++;
    if (/[0-9]/.test(pw))                  score++;
    if (/[^A-Za-z0-9]/.test(pw))           score++;
    if (pw.length >= 12)                   score++;

    if (score <= 1) return { score, label: "Weak",      color: "#E24B4A" };
    if (score <= 2) return { score, label: "Fair",      color: "#F4A261" };
    if (score <= 3) return { score, label: "Good",      color: "#2A9D8F" };
                    return { score, label: "Strong",    color: "#40916C" };
}

export default function NewPasswordPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    const resetToken: string = location.state?.resetToken ?? "";

    const [password, setPassword]       = useState("");
    const [confirm, setConfirm]         = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");

    const strength = getStrength(password);
    const passwordsMatch = password && confirm && password === confirm;
    const mismatch       = confirm.length > 0 && password !== confirm;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords do not match."); return; }
        if (strength.score < 2)   { setError("Please choose a stronger password."); return; }
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
                    display: flex; flex-direction: column;
                    justify-content: space-between;
                    padding: 3rem; overflow: hidden;
                }

                .sb-grid-overlay {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                .sb-floating-box {
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.15);
                    border-radius: 16px; background: rgba(255,255,255,0.06);
                }

                .sb-logo {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 2.2rem; font-weight: 700;
                    color: #fff; letter-spacing: -0.5px;
                    position: relative; z-index: 1;
                }

                .sb-logo-dot {
                    width: 10px; height: 10px;
                    background: #FFB3B3; border-radius: 50%;
                    display: inline-block; margin-left: 2px; vertical-align: super;
                }

                .sb-left-mid { position: relative; z-index: 1; }

                .sb-left-mid h2 {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-style: italic; font-weight: 400;
                    font-size: 2.4rem; color: rgba(255,255,255,0.95);
                    line-height: 1.25; margin-bottom: 1.25rem;
                }

                .sb-left-mid p {
                    font-size: 0.95rem; color: rgba(255,255,255,0.65);
                    line-height: 1.7; max-width: 300px; font-weight: 300;
                }

                .sb-tips {
                    position: relative; z-index: 1;
                    display: flex; flex-direction: column; gap: 10px;
                }

                .sb-tip {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 0.85rem; color: rgba(255,255,255,0.75);
                }

                .sb-tip-icon {
                    width: 26px; height: 26px; flex-shrink: 0;
                    background: rgba(255,255,255,0.12); border-radius: 7px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px;
                }

                .sb-left-steps {
                    position: relative; z-index: 1;
                    display: flex; flex-direction: column; gap: 14px;
                }

                .sb-step { display: flex; align-items: flex-start; gap: 14px; }

                .sb-step-num {
                    width: 28px; height: 28px; flex-shrink: 0;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,255,255,0.35);
                    background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.9);
                }

                .sb-step-num.done   { background: rgba(255,255,255,0.25); border-color: transparent; }
                .sb-step-num.active { background: rgba(255,255,255,0.9); color: #C1121F; border-color: transparent; }

                .sb-step-text strong {
                    display: block; font-size: 0.88rem;
                    color: rgba(255,255,255,0.9); font-weight: 600; margin-bottom: 2px;
                }

                .sb-step-text span { font-size: 0.8rem; color: rgba(255,255,255,0.45); font-weight: 300; }

                .sb-step-connector { width: 1px; height: 18px; background: rgba(255,255,255,0.15); margin-left: 13px; }

                /* Right */
                .sb-right {
                    flex: 1; background: #FAFAF9;
                    display: flex; align-items: center; justify-content: center;
                    padding: 3rem 2rem;
                }

                .sb-form-container { width: 100%; max-width: 400px; }

                .sb-form-header { margin-bottom: 2rem; }

                .sb-form-header h1 {
                    font-size: 1.9rem; font-weight: 700;
                    color: #1a1a1a; letter-spacing: -0.5px; margin-bottom: 6px;
                }

                .sb-form-header p { font-size: 0.9rem; color: #888; line-height: 1.6; }

                .sb-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }

                .sb-label {
                    font-size: 0.78rem; font-weight: 500; color: #555;
                    letter-spacing: 0.3px; text-transform: uppercase;
                }

                .sb-input-wrap { position: relative; display: flex; align-items: center; }

                .sb-input {
                    width: 100%; padding: 0.75rem 3rem 0.75rem 1rem;
                    border: 1.5px solid #E5E5E2; border-radius: 10px;
                    font-size: 0.95rem; font-family: inherit;
                    background: #fff; color: #1a1a1a; outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s;
                }

                .sb-input:focus  { border-color: #C1121F; box-shadow: 0 0 0 3px rgba(193,18,31,0.1); }
                .sb-input.match  { border-color: #40916C; }
                .sb-input.bad    { border-color: #E24B4A; }
                .sb-input::placeholder { color: #bbb; font-weight: 300; }

                .sb-eye-btn {
                    position: absolute; right: 12px;
                    background: none; border: none; cursor: pointer;
                    color: #888; font-size: 0.8rem; font-family: inherit;
                    font-weight: 500; padding: 4px;
                }

                /* Strength bar */
                .sb-strength-wrap { margin-top: 8px; }

                .sb-strength-track {
                    height: 4px; background: #F0EFED;
                    border-radius: 100px; overflow: hidden; margin-bottom: 5px;
                }

                .sb-strength-fill {
                    height: 100%; border-radius: 100px;
                    transition: width 0.3s, background 0.3s;
                }

                .sb-strength-label { font-size: 0.78rem; font-weight: 500; }

                /* Requirements */
                .sb-reqs {
                    background: #fff; border: 1px solid #EEECEA;
                    border-radius: 10px; padding: 12px 14px;
                    margin-bottom: 14px;
                    display: flex; flex-direction: column; gap: 7px;
                }

                .sb-req {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.82rem; color: #aaa; transition: color 0.2s;
                }

                .sb-req.met { color: #40916C; }

                .sb-req-dot {
                    width: 16px; height: 16px; flex-shrink: 0;
                    border-radius: 50%;
                    border: 1.5px solid #E5E5E2;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 9px; transition: all 0.2s;
                }

                .sb-req.met .sb-req-dot {
                    background: #40916C; border-color: #40916C; color: #fff;
                }

                .sb-error {
                    display: flex; align-items: center; gap: 8px;
                    background: #FFF0F0; border: 1px solid #FFCDD0;
                    border-radius: 8px; padding: 10px 12px;
                    font-size: 0.83rem; color: #C1121F; margin-bottom: 14px;
                }

                .sb-submit {
                    width: 100%; padding: 0.85rem;
                    background: #C1121F; color: #fff; border: none;
                    border-radius: 10px; font-size: 0.95rem; font-weight: 600;
                    font-family: inherit; cursor: pointer; letter-spacing: 0.2px;
                    transition: background 0.18s, transform 0.1s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }

                .sb-submit:hover:not(:disabled) { background: #A50F1A; }
                .sb-submit:active:not(:disabled) { transform: scale(0.99); }
                .sb-submit:disabled { background: #E5A0A4; cursor: not-allowed; }

                .sb-submit-arrow { font-size: 1.1rem; transition: transform 0.18s; }
                .sb-submit:hover:not(:disabled) .sb-submit-arrow { transform: translateX(3px); }

                @media (max-width: 768px) {
                    .sb-left { display: none; }
                    .sb-right { padding: 2rem 1.5rem; }
                }
            `}</style>

            {/* Left */}
            <div className="sb-left">
                <div className="sb-grid-overlay" />
                <div className="sb-floating-box" style={{ width: 100, height: 70, top: "28%", right: "8%" }} />
                <div className="sb-floating-box" style={{ width: 50, height: 50, bottom: "22%", left: "10%", borderRadius: "50%" }} />

                <div className="sb-logo">
                    Slidebox<span className="sb-logo-dot" />
                </div>

                <div className="sb-left-mid">
                    <h2>Almost there.<br />Choose a<br />strong password.</h2>
                    <p>A strong password keeps your gallery safe from unwanted access.</p>
                </div>

                <div className="sb-left-steps">
                    {[
                        { n: 1, label: "Enter your email",   sub: "We'll send you a reset code",  state: "done"   },
                        { n: 2, label: "Verify the OTP",     sub: "Enter the 6-digit code",       state: "done"   },
                        { n: 3, label: "Set a new password", sub: "Choose something strong",      state: "active" },
                    ].map((step, i, arr) => (
                        <div key={step.n}>
                            <div className="sb-step">
                                <div className={`sb-step-num${step.state ? ` ${step.state}` : ""}`}>
                                    {step.state === "done" ? "✓" : step.n}
                                </div>
                                <div className="sb-step-text">
                                    <strong>{step.label}</strong>
                                    <span>{step.sub}</span>
                                </div>
                            </div>
                            {i < arr.length - 1 && <div className="sb-step-connector" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right */}
            <div className="sb-right">
                <div className="sb-form-container">
                    <div className="sb-form-header">
                        <h1>Set new password</h1>
                        <p>Choose a password you haven't used before.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* New password */}
                        <div className="sb-field">
                            <label className="sb-label" htmlFor="new-password">New password</label>
                            <div className="sb-input-wrap">
                                <input
                                    id="new-password"
                                    className="sb-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    required
                                    autoFocus
                                />
                                <button type="button" className="sb-eye-btn" onClick={() => setShowPassword((v) => !v)}>
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="sb-strength-wrap">
                                    <div className="sb-strength-track">
                                        <div
                                            className="sb-strength-fill"
                                            style={{
                                                width: `${(strength.score / 5) * 100}%`,
                                                background: strength.color,
                                            }}
                                        />
                                    </div>
                                    <span className="sb-strength-label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="sb-field">
                            <label className="sb-label" htmlFor="confirm-password">Confirm password</label>
                            <div className="sb-input-wrap">
                                <input
                                    id="confirm-password"
                                    className={`sb-input${passwordsMatch ? " match" : mismatch ? " bad" : ""}`}
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={confirm}
                                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                                    required
                                />
                                <button type="button" className="sb-eye-btn" onClick={() => setShowConfirm((v) => !v)}>
                                    {showConfirm ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Requirements checklist */}
                        {password.length > 0 && (
                            <div className="sb-reqs">
                                {[
                                    { label: "At least 8 characters",          met: password.length >= 8 },
                                    { label: "One uppercase letter (A–Z)",      met: /[A-Z]/.test(password) },
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

                        {error && <div className="sb-error"><span>⚠</span>{error}</div>}

                        <button
                            type="submit"
                            className="sb-submit"
                            disabled={loading || !passwordsMatch || strength.score < 2}
                        >
                            {loading ? "Saving…" : "Save new password"}
                            {!loading && <span className="sb-submit-arrow">→</span>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}