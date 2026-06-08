import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { apiClient } from "../api/api";
import { isAxiosError } from "axios";
import Spinner from "./Spinner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    setMsg("");
    try {
      setIsLoading(true);
      await apiClient().post("/auth/reset-password", { token, password });
      setIsSuccess(true);
      setMsg("Password updated. You can now sign in.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: unknown) {
      const serverMsg = isAxiosError<{ error?: string }>(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setMsg(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">Improve English vocabulary</div>
          <p className="auth-tagline">Learn 10 words a day</p>
          <div className="auth-msg auth-msg--error">
            Invalid or missing reset token.
          </div>
          <p className="auth-footer">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Improve English vocabulary</div>
        <p className="auth-tagline">Learn 10 words a day</p>

        <h2 className="auth-title">Set a new password</h2>

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
                placeholder="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="auth-field">
              <input
                className="auth-input"
                placeholder="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button className="auth-btn" type="submit" disabled={isLoading}>
              {isLoading ? <><Spinner />Updating…</> : "Update password"}
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
