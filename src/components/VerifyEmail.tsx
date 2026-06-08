import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { apiClient } from "../api/api";
import { isAxiosError } from "axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmailPage(): JSX.Element {
  const api = apiClient();
  const navigate = useNavigate();
  const q = useQuery();
  const token = q.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }

    let cancelled = false;

    const verifyEmail = async () => {
      setStatus("pending");
      setMessage(null);

      try {
        const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (res.data?.ok) {
          setStatus("success");
          setMessage("Email verified! Redirecting to dashboard…");
          setTimeout(() => navigate("/home"), 1500);
          return;
        }
        setStatus("error");
        setMessage(res.data?.error || "Verification failed");
      } catch (err: unknown) {
        if (cancelled) return;
        type VerifyErrorResponse = { error?: string };
        const serverMsg = isAxiosError<VerifyErrorResponse>(err)
          ? err.response?.data?.error ?? err.message ?? "Verification failed"
          : err instanceof Error
          ? err.message
          : "Verification failed";
        setStatus("error");
        setMessage(serverMsg);
      }
    };

    verifyEmail();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Revise</div>
        <p className="auth-tagline">Learn 10 words a day</p>

        <h2 className="auth-title">Verify your email</h2>

        {(status === "idle" || status === "pending") && (
          <p className="auth-status">
            {status === "idle" ? "Preparing verification…" : "Verifying your email — please wait…"}
          </p>
        )}

        {status === "success" && (
          <div className="auth-msg auth-msg--success">{message}</div>
        )}

        {status === "error" && (
          <>
            <div className="auth-msg auth-msg--error">
              {message || "Verification failed."}
            </div>
            <p className="auth-status" style={{ fontSize: 13, color: "#6b7280" }}>
              If your token expired, request a new one by signing up again.
            </p>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
