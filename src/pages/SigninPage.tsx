import { useState } from "react";
import { useDispatch } from "react-redux";
import { signin } from "../services/authServices";
import type { AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/slices/userSlice";
import {
  AuthLayout, AuthLeftPanel, AuthFormField,
  AuthSubmitButton, AuthDivider, AuthErrorBanner,
} from "../components/index";
 
export default function SigninPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
 
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError("");
      const result = await dispatch(signin({ email, password })).unwrap();
      dispatch(setUser(result.data.user));
      navigate("/home");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <AuthLayout>
      <AuthLeftPanel
        headline={<>Welcome<br />back to your<br />gallery.</>}
        sub="Sign in to pick up right where you left off. Your albums and memories are waiting."
      >
        <div className="sb-mosaic">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="sb-mosaic-cell" />)}
        </div>
      </AuthLeftPanel>
 
      <div className="sb-right">
        <div className="sb-form-container">
          <div className="sb-form-header">
            <h1>Sign in</h1>
            <p>New to Slidebox? <a href="/signup">Create an account →</a></p>
          </div>
 
          <form onSubmit={handleLogin}>
            <AuthFormField
              id="email" label="Email address" type="email"
              placeholder="you@example.com" value={email} required
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
            <AuthFormField
              id="password" label="Password" type="password"
              placeholder="Your password" value={password} required
              hint={<a href="/forgot-password" style={{ fontSize: "0.82rem", color: "#C1121F", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
            <AuthErrorBanner message={error} />
            <AuthSubmitButton loading={loading} loadingText="Signing in…">Sign in</AuthSubmitButton>
          </form>
 
          <AuthDivider />
          <p style={{ textAlign: "center", fontSize: "0.88rem", color: "#888" }}>
            Don't have an account? <a href="/signup" style={{ color: "#C1121F", textDecoration: "none", fontWeight: 500 }}>Register for free</a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
