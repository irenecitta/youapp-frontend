"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
  }
  if (form.password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }
  setLoading(true);
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        username: form.username,
        password: form.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    router.push("/");
  } catch (err: any) {
    setError(err.message || "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="mobile-container">
      <div className="page-wrapper">

        <button onClick={() => router.back()} className="back-btn">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>


        <div className="page-title">
          <h1>Register</h1>
        </div>


        <form onSubmit={handleSubmit} className="form-container">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Create Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="eye-btn">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="redirect-text">
            Have an account?{" "}
            <Link href="/login" className="link-gold">
              Login here
            </Link>
          </p>
        </form>
      </div>

      <style jsx>{`
                .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 40px;
        }
        .page-title {
          margin-bottom: 40px;
        }
        .page-title h1 {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin: 0;
        }
        
      `}</style>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
