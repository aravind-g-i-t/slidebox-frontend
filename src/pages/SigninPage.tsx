import { useState } from "react";
import { useDispatch } from "react-redux";
import { signin } from "../services/authServices";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/slices/userSlice";

export default function SigninPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const result = await dispatch(signin({ email, password })).unwrap();
            dispatch(setUser(result.data.user))
            navigate("/home");
        } catch {
            setError("Invalid email or password. Please try again.");
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

                .sb-mosaic {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    grid-template-rows: repeat(2, 48px);
                    gap: 6px;
                }

                .sb-mosaic-cell {
                    border-radius: 8px;
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .sb-mosaic-cell:nth-child(1) { border-radius: 14px; background: rgba(255,255,255,0.2); }
                .sb-mosaic-cell:nth-child(4) { border-radius: 50%; }
                .sb-mosaic-cell:nth-child(6) { background: rgba(255,255,255,0.07); }
                .sb-mosaic-cell:nth-child(7) { border-radius: 14px; }

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
                    margin-bottom: 2.5rem;
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

                .sb-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    margin-bottom: 14px;
                }

                .sb-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                }

                .sb-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .sb-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1.5px solid #E5E5E2;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    background: #fff;
                    color: #1a1a1a;
                    outline: none;
                    transition: border-color 0.18s, box-shadow 0.18s;
                }

                .sb-input:focus {
                    border-color: #C1121F;
                    box-shadow: 0 0 0 3px rgba(193,18,31,0.1);
                }

                .sb-input::placeholder { color: #bbb; font-weight: 300; }

                .sb-eye-btn {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #888;
                    font-size: 0.8rem;
                    font-family: inherit;
                    font-weight: 500;
                    padding: 4px;
                }

                .sb-forgot {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: -6px;
                    margin-bottom: 20px;
                }

                .sb-forgot a {
                    font-size: 0.82rem;
                    color: #C1121F;
                    text-decoration: none;
                    font-weight: 500;
                }

                .sb-error {
                    font-size: 0.83rem;
                    color: #C1121F;
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #FFF0F0;
                    border: 1px solid #FFCDD0;
                    border-radius: 8px;
                    padding: 10px 12px;
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
                    margin-bottom: 20px;
                }

                .sb-submit:hover:not(:disabled) { background: #A50F1A; }
                .sb-submit:active:not(:disabled) { transform: scale(0.99); }
                .sb-submit:disabled { background: #E5A0A4; cursor: not-allowed; }

                .sb-submit-arrow {
                    font-size: 1.1rem;
                    transition: transform 0.18s;
                }

                .sb-submit:hover:not(:disabled) .sb-submit-arrow {
                    transform: translateX(3px);
                }

                .sb-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .sb-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #E5E5E2;
                }

                .sb-divider-text {
                    font-size: 0.78rem;
                    color: #bbb;
                }

                .sb-signup-prompt {
                    text-align: center;
                    font-size: 0.88rem;
                    color: #888;
                }

                .sb-signup-prompt a {
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
                <div className="sb-floating-box" style={{ width: 110, height: 75, top: "34%", right: "8%" }} />
                <div className="sb-floating-box" style={{ width: 55, height: 55, bottom: "22%", left: "10%", borderRadius: "50%" }} />

                <div className="sb-logo">
                    Slidebox<span className="sb-logo-dot" />
                </div>

                <div className="sb-left-mid">
                    <h2>Welcome<br />back to your<br />gallery.</h2>
                    <p>Sign in to pick up right where you left off. Your albums, albums, and memories are waiting.</p>
                </div>

                <div className="sb-mosaic">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="sb-mosaic-cell" />
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div className="sb-right">
                <div className="sb-form-container">
                    <div className="sb-form-header">
                        <h1>Sign in</h1>
                        <p>
                            New to Slidebox?{" "}
                            <a href="/signup">Create an account →</a>
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="sb-field">
                            <label className="sb-label" htmlFor="email">Email address</label>
                            <div className="sb-input-wrap">
                                <input
                                    id="email"
                                    className="sb-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="sb-field">
                            <label className="sb-label" htmlFor="password">Password</label>
                            <div className="sb-input-wrap">
                                <input
                                    id="password"
                                    className="sb-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    style={{ paddingRight: "3.5rem" }}
                                    required
                                />
                                <button
                                    type="button"
                                    className="sb-eye-btn"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="sb-forgot">
                            <a href="/forgot-password">Forgot password?</a>
                        </div>

                        {error && (
                            <div className="sb-error">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="sb-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Sign in"}
                            {!loading && <span className="sb-submit-arrow">→</span>}
                        </button>
                    </form>

                    <div className="sb-divider">
                        <div className="sb-divider-line" />
                        <span className="sb-divider-text">or</span>
                        <div className="sb-divider-line" />
                    </div>

                    <p className="sb-signup-prompt">
                        Don't have an account?{" "}
                        <a href="/signup">Register for free</a>
                    </p>
                </div>
            </div>
        </div>
    );
}