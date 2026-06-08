import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      setIsLoading(true);
      await login(email, password);
      navigate("/home");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setMsg(error?.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Revise</div>
        <p className="auth-tagline">Learn 10 words a day</p>

        <h2 className="auth-title">Welcome back</h2>

        {msg && <div className="auth-msg auth-msg--error">{msg}</div>}

        <form onSubmit={handle}>
          <div className="auth-field">
            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <input
              className="auth-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-footer" style={{ textAlign: "right", marginTop: 0, marginBottom: 12 }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button className="auth-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
