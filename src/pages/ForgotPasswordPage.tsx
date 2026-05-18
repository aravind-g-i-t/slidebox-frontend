import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../redux/store";
import { verifyEmail } from "../services/authServices";

export default function ForgotPasswordPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const result = await dispatch(verifyEmail({ email })).unwrap();
            navigate("/reset-otp", {
                state: {
                    email,
                    otpExpiresAt: result.data.otpExpiresAt
                }
            });
            setSent(true);
        } catch {
            setError("No account found with that email address.");
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
                    position: absolute; inset: 0;
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

                .sb-left-steps {
                    position: relative; z-index: 1;
                    display: flex; flex-direction: column; gap: 14px;
                }

                .sb-step {
                    display: flex; align-items: flex-start; gap: 14px;
                }

                .sb-step-num {
                    width: 28px; height: 28px; flex-shrink: 0;
                    border-radius: 50%;
                    border: 1.5px solid rgba(255,255,255,0.35);
                    background: rgba(255,255,255,0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.9);
                }

                .sb-step-num.active {
                    background: rgba(255,255,255,0.9);
                    color: #C1121F;
                    border-color: transparent;
                }

                .sb-step-text strong {
                    display: block; font-size: 0.88rem;
                    color: rgba(255,255,255,0.9); font-weight: 600;
                    margin-bottom: 2px;
                }

                .sb-step-text span {
                    font-size: 0.8rem; color: rgba(255,255,255,0.45); font-weight: 300;
                }

                .sb-step-connector {
                    width: 1px; height: 18px;
                    background: rgba(255,255,255,0.15);
                    margin-left: 13px;
                }

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
                .sb-form-header a { color: #C1121F; text-decoration: none; font-weight: 500; }

                .sb-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }

                .sb-label {
                    font-size: 0.78rem; font-weight: 500; color: #555;
                    letter-spacing: 0.3px; text-transform: uppercase;
                }

                .sb-input {
                    width: 100%; padding: 0.75rem 1rem;
                    border: 1.5px solid #E5E5E2; border-radius: 10px;
                    font-size: 0.95rem; font-family: inherit;
                    background: #fff; color: #1a1a1a; outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s;
                }

                .sb-input:focus { border-color: #C1121F; box-shadow: 0 0 0 3px rgba(193,18,31,0.1); }
                .sb-input::placeholder { color: #bbb; font-weight: 300; }

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

                .sb-back {
                    margin-top: 18px; text-align: center;
                    font-size: 0.85rem; color: #aaa;
                }

                .sb-back a { color: #C1121F; text-decoration: none; font-weight: 500; }

                /* Sent confirmation card */
                .sb-sent-card {
                    background: #F6FDF6; border: 1.5px solid #B7E4C7;
                    border-radius: 14px; padding: 2rem 1.5rem;
                    text-align: center; margin-bottom: 1.5rem;
                }

                .sb-sent-icon { font-size: 2.8rem; margin-bottom: 12px; }

                .sb-sent-card h2 {
                    font-size: 1.15rem; font-weight: 700; color: #1a1a1a; margin-bottom: 6px;
                }

                .sb-sent-card p { font-size: 0.88rem; color: #666; line-height: 1.6; }

                .sb-sent-email {
                    display: inline-block; margin-top: 10px;
                    background: #fff; border: 1px solid #D4EDDA;
                    border-radius: 100px; padding: 5px 14px;
                    font-size: 0.85rem; color: #2D6A4F; font-weight: 500;
                }

                @media (max-width: 768px) {
                    .sb-left { display: none; }
                    .sb-right { padding: 2rem 1.5rem; }
                }
            `}</style>

            {/* Left panel */}
            <div className="sb-left">
                <div className="sb-grid-overlay" />
                <div className="sb-floating-box" style={{ width: 100, height: 70, top: "28%", right: "8%" }} />
                <div className="sb-floating-box" style={{ width: 50, height: 50, bottom: "28%", left: "10%", borderRadius: "50%" }} />

                <div className="sb-logo">
                    Slidebox<span className="sb-logo-dot" />
                </div>

                <div className="sb-left-mid">
                    <h2>Reset your<br />password<br />in 3 steps.</h2>
                    <p>We'll send a secure code to your email. It only takes a minute.</p>
                </div>

                <div className="sb-left-steps">
                    {[
                        { n: 1, label: "Enter your email", sub: "We'll send you a reset code", active: true },
                        { n: 2, label: "Verify the OTP", sub: "Enter the 6-digit code", active: false },
                        { n: 3, label: "Set a new password", sub: "Choose something strong", active: false },
                    ].map((step, i, arr) => (
                        <div key={step.n}>
                            <div className="sb-step">
                                <div className={`sb-step-num${step.active ? " active" : ""}`}>{step.n}</div>
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

            {/* Right panel */}
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
                            <button
                                className="sb-submit"
                                onClick={() => navigate("/reset-otp", { state: { email } })}
                            >
                                Enter OTP <span className="sb-submit-arrow">→</span>
                            </button>
                            <p className="sb-back">
                                Wrong email? <a href="#" onClick={(e) => { e.preventDefault(); setSent(false); }}>Try again</a>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="sb-form-header">
                                <h1>Forgot password?</h1>
                                <p>Enter the email address linked to your Slidebox account and we'll send you a reset code.</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="sb-field">
                                    <label className="sb-label" htmlFor="email">Email address</label>
                                    <input
                                        id="email"
                                        className="sb-input"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        required
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="sb-error"><span>⚠</span>{error}</div>
                                )}

                                <button type="submit" className="sb-submit" disabled={loading}>
                                    {loading ? "Sending…" : "Send reset code"}
                                    {!loading && <span className="sb-submit-arrow">→</span>}
                                </button>
                            </form>

                            <p className="sb-back">
                                Remembered it? <a href="/signin">Sign in instead</a>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}