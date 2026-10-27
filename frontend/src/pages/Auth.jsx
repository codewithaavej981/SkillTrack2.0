import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Notice from "../components/Notice";
import BrandLogo from "../components/BrandLogo";

function Field({
  id,
  name,
  icon,
  title,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
}) {
  return (
    <label htmlFor={id} className="field">
      <span className="field-label">{title}</span>
      <span className="field-input-wrap">
        <span className="field-icon">{icon}</span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
      </span>
    </label>
  );
}

export default function Auth({ register }) {
  const { user, loading: authLoading, login, register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (register) {
        await registerUser(name, email, password);
      } else {
        await login(email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <Link to="/dashboard" className="brand">
          <BrandLogo size={36} />
          <div className="brand-title-wrap">
            <span className="brand-name">SkillTracker</span>
            <span className="brand-version">AI 2.0</span>
          </div>
        </Link>

        <div>
          <p className="eyebrow">YOUR GROWTH, CLARIFIED</p>

          <h1>
            Turn your ambition into <em>momentum.</em>
          </h1>

          <p>
            Build skills with intent, make progress visible, and stay close to
            what matters.
          </p>
        </div>

        <ul>
          <li>
            <CheckCircle2 />
            See your progress at a glance
          </li>

          <li>
            <CheckCircle2 />
            Build better learning habits
          </li>

          <li>
            <CheckCircle2 />
            Reach your next milestone
          </li>
        </ul>
      </section>

      <div className="auth-main">
        <div className="auth-card-wrap">
          <div className="auth-mobile-brand">
            <Link to="/dashboard" className="brand">
              <BrandLogo size={34} />
              <div className="brand-title-wrap">
                <span className="brand-name">SkillTracker</span>
                <span className="brand-version">AI 2.0</span>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate={false}>
            <div className="auth-form-head">
              <p className="eyebrow">
                WELCOME {register ? "ABOARD" : "BACK"}
              </p>

              <h2>
                {register ? "Create your account" : "Sign in to SkillTrack"}
              </h2>

              <p className="auth-subtitle">
                {register
                  ? "Start making your growth visible today."
                  : "Pick up right where you left off."}
              </p>
            </div>

            {error && <Notice message={error} />}

            <div className="auth-fields">
              {register && (
                <Field
                  id="auth-name"
                  name="name"
                  icon={<UserRound />}
                  title="Full name"
                  placeholder="Your full name"
                  type="text"
                  value={name}
                  autoComplete="name"
                  required
                  onChange={(event) => setName(event.target.value)}
                />
              )}

              <Field
                id="auth-email"
                name="email"
                icon={<Mail />}
                title="Email address"
                placeholder="you@example.com"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />

              <Field
                id="auth-password"
                name="password"
                icon={<LockKeyhole />}
                title="Password"
                placeholder="••••••••"
                type="password"
                value={password}
                autoComplete={register ? "new-password" : "current-password"}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="button auth-button"
              disabled={loading}
            >
              {loading ? (
                "Please wait..."
              ) : register ? (
                <>
                  <span>Create account</span>
                  <ChevronRight size={18} />
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            <small className="auth-switch">
              {register ? "Already have an account?" : "New to SkillTrack?"}{" "}
              <Link to={register ? "/login" : "/register"}>
                {register ? "Sign in" : "Create an account"}
              </Link>
            </small>
          </form>
        </div>
      </div>
    </div>
  );
}
