import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth/useAuth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { signup } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const EMAIL_REGEX =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!EMAIL_REGEX.test(email)) {
      setMsg("Please enter a valid email address.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await signup(name, email, password);
      setMsg(
        res?.message ||
          "Signup successful! Please check your email to verify your account.",
      );
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setMsg(error?.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = !!msg?.toLowerCase().includes("success");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Improve English vocabulary</div>
        <p className="auth-tagline">Learn 10 words a day</p>

        <h2 className="auth-title">Create an account</h2>

        {msg && (
          <div
            className={`auth-msg ${isSuccess ? "auth-msg--success" : "auth-msg--error"}`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="auth-field">
            <input
              className="auth-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <button className="auth-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
