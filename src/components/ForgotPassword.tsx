import React, { useState } from "react";
import { Link } from "react-router";
import { apiClient } from "../api/api";
import { isAxiosError } from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      setIsLoading(true);
      await apiClient().post("/auth/forgot-password", { email });
      setIsSuccess(true);
      setMsg("If that email exists, a reset link has been sent.");
    } catch (err: unknown) {
      const serverMsg = isAxiosError<{ error?: string }>(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setMsg(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Improve English vocabulary</div>
        <p className="auth-tagline">Learn 10 words a day</p>

        <h2 className="auth-title">Reset your password</h2>

        {msg && (
          <div
            className={`auth-msg ${isSuccess ? "auth-msg--success" : "auth-msg--error"}`}
          >
            {msg}
          </div>
        )}

        {!isSuccess && (
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
            <button className="auth-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
