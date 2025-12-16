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
    <div style={{ maxWidth: 560, margin: "40px auto" }}>
      <h2>Login</h2>
      {msg && <div style={{ color: "red" }}>{msg}</div>}
      <form onSubmit={handle}>
        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Wait..." : "Login"}
          </button>
        </div>
      </form>
      <p>
        Or <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
