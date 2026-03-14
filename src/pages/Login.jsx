import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { validateEmail } from "../utils/validators";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";

const ROLE_HOME = {
  admin:   "/dashboard/admin",
  student: "/dashboard/student",
};

// New students (profileComplete === false) go to setup first.
// Existing students and admins go straight to their dashboard.
const getDestination = (user) => {
  if (user.role === 'student' && user.profileComplete === false) {
    return "/profile/setup";
  }
  return ROLE_HOME[user.role] || "/dashboard/student";
};

const Login = () => {
  const [form, setForm]           = useState({ email: "", password: "" });
  const [showPassword, setShowPw] = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) return setError("Invalid email");
    if (!form.password)             return setError("Password is required");

    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, user } = res.data;

      login({ ...user, token });
      navigate(getDestination(user), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue your journey</p>

        {error && <p className="error">{error}</p>}

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
            onClick={() => setShowPw(p => !p)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className="switch">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login;