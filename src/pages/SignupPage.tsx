import { useState } from "react";
import { signup } from "../services/authServices";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import {
  AuthLayout, AuthLeftPanel, AuthFeatureList, AuthFormField,
  AuthSubmitButton, AuthErrorBanner,
} from "../components/index";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError("");
      const result = await dispatch(
        signup({ name, email, phone, password })
      ).unwrap();
      const otpExpiresAt = result.data.otpExpiresAt;
      navigate("/verify-otp", { state: { email, otpExpiresAt } });
    } catch(err) {
      setError(err as string)
      

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthLeftPanel
        headline={<>Your images,<br />beautifully<br />organized.</>}
        sub="Store, sort, and showcase your photo collections with a workspace built for visual thinkers."
      >
        <AuthFeatureList
          features={[
            { icon: "🗂", text: "Smart album organization" },
            { icon: "🔒", text: "Private & shareable galleries" },
            { icon: "⚡", text: "Lightning-fast uploads" },
          ]}
        />
      </AuthLeftPanel>

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
            <AuthFormField
              id="name" label="Full name" type="text"
              placeholder="Full name" value={name} required
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
            <AuthFormField
              id="email" label="Email address" type="email"
              placeholder="Email address" value={email} required
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
            <AuthFormField
              id="phone" label="Phone number" type="text"
              placeholder="Phone number" value={phone} required
              onChange={(e) => { setPhone(e.target.value); setError(""); }}
            />
            <AuthFormField
              id="password" label="Password" type="password"
              placeholder="Min. 8 characters" value={password} required
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
            <AuthErrorBanner message={error} />
            <AuthSubmitButton loading={loading} loadingText="Creating account…">
              Create account
            </AuthSubmitButton>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#aaa", lineHeight: 1.6 }}>
            By registering, you agree to Slidebox's{" "}
            <a href="/terms" style={{ color: "#C1121F", textDecoration: "none" }}>Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" style={{ color: "#C1121F", textDecoration: "none" }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}