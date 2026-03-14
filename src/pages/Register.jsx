import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { Eye, EyeOff } from "lucide-react";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validators";
import "./Login.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateName(form.name))
      return setError("Name must be at least 2 characters long");
    if (!validateEmail(form.email))
      return setError("Invalid email format");
    if (!validatePassword(form.password))
      return setError("Password must be 8+ chars, include uppercase, lowercase and number");

    setLoading(true);
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submit}>
        <h2>Create Account</h2>

        {error && <p className="error">{error}</p>}

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Counsellor role is not available via public registration.
            Counsellors are created by an admin from the admin dashboard. */}
        <select
          className="role-select"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>

        <p className="switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Sign in</span>
        </p>
      </form>
    </div>
  );
};

export default Register;