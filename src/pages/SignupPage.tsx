import { useState } from "react";
import { signup } from "../services/authServices";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await dispatch(
                signup({ name, email, phone, password })
            ).unwrap();
            const otpExpiresAt = result.data.otpExpiresAt;
            navigate("/verify-otp", { state: { email, otpExpiresAt } });
        } catch (error) {
            console.log(error);
        }
    };

    const fields = [
        { id: "name", label: "Full name", type: "text", value: name, setter: setName, icon: "👤" },
        { id: "email", label: "Email address", type: "email", value: email, setter: setEmail, icon: "✉" },
        { id: "phone", label: "Phone number", type: "text", value: phone, setter: setPhone, icon: "📱" },
    ];

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
                    backdrop-filter: blur(2px);
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

                .sb-tagline {
                    position: relative;
                    z-index: 1;
                }

                .sb-tagline h2 {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-style: italic;
                    font-weight: 400;
                    font-size: 2.4rem;
                    color: rgba(255,255,255,0.95);
                    line-height: 1.25;
                    margin-bottom: 1.25rem;
                }

                .sb-tagline p {
                    font-size: 0.95rem;
                    color: rgba(255,255,255,0.65);
                    line-height: 1.7;
                    max-width: 300px;
                    font-weight: 300;
                }

                .sb-features {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .sb-feature {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: rgba(255,255,255,0.8);
                    font-size: 0.88rem;
                    font-weight: 400;
                }

                .sb-feature-icon {
                    width: 28px;
                    height: 28px;
                    background: rgba(255,255,255,0.12);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    flex-shrink: 0;
                }

                .sb-image-grid {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-8deg);
                    display: grid;
                    grid-template-columns: repeat(3, 80px);
                    grid-template-rows: repeat(3, 80px);
                    gap: 8px;
                    opacity: 0.18;
                    z-index: 0;
                }

                .sb-img-cell {
                    border-radius: 10px;
                    background: rgba(255,255,255,0.4);
                }

                .sb-img-cell:nth-child(2) { background: rgba(255,255,255,0.25); border-radius: 14px; }
                .sb-img-cell:nth-child(5) { background: rgba(255,255,255,0.55); }
                .sb-img-cell:nth-child(7) { border-radius: 40px; }

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
                    font-weight: 400;
                }

                .sb-form-header p a {
                    color: #C1121F;
                    text-decoration: none;
                    font-weight: 500;
                }

                .sb-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-bottom: 14px;
                }

                .sb-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
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
                    padding: 0.75rem 1rem 0.75rem 1rem;
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

                .sb-input::placeholder {
                    color: #bbb;
                    font-weight: 300;
                }

                .sb-input-icon {
                    position: absolute;
                    right: 12px;
                    font-size: 14px;
                    opacity: 0.4;
                    pointer-events: none;
                }

                .sb-eye-btn {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #888;
                    font-size: 13px;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    font-family: inherit;
                }

                .sb-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 20px 0;
                }

                .sb-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #E5E5E2;
                }

                .sb-divider-text {
                    font-size: 0.78rem;
                    color: #bbb;
                    font-weight: 400;
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

                .sb-submit:hover { background: #A50F1A; }
                .sb-submit:active { transform: scale(0.99); }

                .sb-submit-arrow {
                    font-size: 1.1rem;
                    transition: transform 0.18s;
                }

                .sb-submit:hover .sb-submit-arrow {
                    transform: translateX(3px);
                }

                .sb-terms {
                    margin-top: 16px;
                    font-size: 0.78rem;
                    color: #aaa;
                    text-align: center;
                    line-height: 1.6;
                }

                .sb-terms a {
                    color: #C1121F;
                    text-decoration: none;
                }

                @media (max-width: 768px) {
                    .sb-left { display: none; }
                    .sb-right { padding: 2rem 1.5rem; }
                }
            `}</style>

            {/* Left panel */}
            <div className="sb-left">
                <div className="sb-grid-overlay" />

                {/* Decorative image grid background */}
                <div className="sb-image-grid">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="sb-img-cell" />
                    ))}
                </div>

                {/* Floating decorative boxes */}
                <div className="sb-floating-box" style={{ width: 120, height: 80, top: "30%", right: "8%" }} />
                <div className="sb-floating-box" style={{ width: 60, height: 60, bottom: "28%", left: "10%", borderRadius: "50%" }} />

                {/* Logo */}
                <div className="sb-logo">
                    Slidebox<span className="sb-logo-dot" />
                </div>

                {/* Middle tagline */}
                <div className="sb-tagline">
                    <h2>Your images,<br />beautifully<br />organized.</h2>
                    <p>Store, sort, and showcase your photo collections with a workspace built for visual thinkers.</p>
                </div>

                {/* Feature list */}
                <div className="sb-features">
                    {[
                        { icon: "🗂", text: "Smart album organization" },
                        { icon: "🔒", text: "Private & shareable galleries" },
                        { icon: "⚡", text: "Lightning-fast uploads" },
                    ].map((f) => (
                        <div key={f.text} className="sb-feature">
                            <div className="sb-feature-icon">{f.icon}</div>
                            {f.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — form */}
            <div className="sb-right">
                <div className="sb-form-container">
                    <div className="sb-form-header">
                        <h1>Create your account</h1>
                        <p>
                            Already have one?{" "}
                            <a href="/login">Sign in instead →</a>
                        </p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className="sb-field-group">
                            {fields.map((f) => (
                                <div key={f.id} className="sb-field">
                                    <label className="sb-label" htmlFor={f.id}>
                                        {f.label}
                                    </label>
                                    <div className="sb-input-wrap">
                                        <input
                                            id={f.id}
                                            className="sb-input"
                                            type={f.type}
                                            placeholder={f.label}
                                            value={f.value}
                                            onChange={(e) => f.setter(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Password field */}
                            <div className="sb-field">
                                <label className="sb-label" htmlFor="password">
                                    Password
                                </label>
                                <div className="sb-input-wrap">
                                    <input
                                        id="password"
                                        className="sb-input"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingRight: "2.5rem" }}
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
                        </div>

                        <button type="submit" className="sb-submit">
                            Create account
                            <span className="sb-submit-arrow">→</span>
                        </button>
                    </form>

                    <p className="sb-terms">
                        By registering, you agree to Slidebox's{" "}
                        <a href="/terms">Terms of Service</a> and{" "}
                        <a href="/privacy">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}