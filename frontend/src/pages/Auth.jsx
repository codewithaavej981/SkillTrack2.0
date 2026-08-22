import { useState } from "react";
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

function Field({ icon, title, placeholder, type, value, onChange }) {
  return (
    <label className="field">
      {title}
      <span>
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </span>
    </label>
  );
}

export default function Auth({ register }) {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="auth">
      <section>
        <Link to="/dashboard" className="brand">
          <span>S</span>SkillTrack
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

      <form onSubmit={handleSubmit}>
        <p className="eyebrow">
          WELCOME {register ? "ABOARD" : "BACK"}
        </p>

        <h2>
          {register ? "Create your account" : "Sign in to SkillTrack"}
        </h2>

        <p>
          {register
            ? "Start making your growth visible today."
            : "Pick up right where you left off."}
        </p>

        {error && <Notice message={error} />}

        {register && (
          <Field
            icon={<UserRound />}
            title="Full name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        )}

        <Field
          icon={<Mail />}
          title="Email address"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Field
          icon={<LockKeyhole />}
          title="Password"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          type="submit"
          className="button auth-button"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : register
              ? "Create account"
              : "Sign in"}

          {!loading && <ChevronRight />}
        </button>

        <small>
          {register ? "Already have an account?" : "New to SkillTrack?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </small>
      </form>
    </main>
  );
}