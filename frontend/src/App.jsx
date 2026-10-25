import { useState, useEffect } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Skills from "./pages/Skills";
import Goals from "./pages/Goals";
import Learning from "./pages/Learning";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Button from "./components/Button";
import NotificationPanel from "./components/NotificationPanel";
import { useAuth } from "./context/AuthContext";
import { nav, names } from "./data/demoData";

function Shell() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className={`side ${open ? "open" : ""}`}>
        <div className="brand">
          <span>S</span>SkillTracker 2.0{" "}
          <Button className="close" onClick={() => setOpen(false)}>
            <X />
          </Button>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              to={to}
              end={to === "/dashboard"}
              key={to}
              onClick={() => setOpen(false)}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="upgrade">
            <Sparkles />
            <b>Unlock your momentum</b>
            <p>Build a focused learning plan.</p>
            <button>View plans</button>
          </div>
          <NavLink to="/profile" className="mini-profile">
            <i>
              {user?.name
                ? user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U"}
            </i>

            <span>
              <b>{user?.name || "User"}</b>
              <small>{user?.role || "SkillTrack member"}</small>
            </span>

            <ChevronDown />
          </NavLink>
          <button
            className="logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut />
            Log out
          </button>
        </div>
      </aside>
      {open && <button className="backdrop" onClick={() => setOpen(false)} />}
      <main>
        <header>
          <Button className="hamburger" onClick={() => setOpen(true)}>
            <Menu />
          </Button>

          <span className="crumb">
            Workspace <em>/</em> {names[location.pathname] || "Dashboard"}
          </span>

          <div>
            {/* Dark / Light toggle */}
            <Button
              className="theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun /> : <Moon />}
            </Button>

            <Button className="btn-add" onClick={() => navigate("/goals?add=true")}>
              <Plus />
              Add goal
            </Button>

            <div className="notif-wrapper">
              <Button
                className={`round notif-btn ${notifOpen ? "active" : ""}`}
                onClick={() => setNotifOpen((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell size={18} />
                {hasUnreadNotifs && <span className="notif-badge" />}
              </Button>

              {notifOpen && (
                <NotificationPanel
                  onClose={() => setNotifOpen(false)}
                  onUnreadChange={setHasUnreadNotifs}
                />
              )}
            </div>

            <NavLink to="/profile" className="avatar">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U"}
            </NavLink>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
      <nav className="mobile-nav">
        {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <NavLink to={to} key={to}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/profile">
          <UserRound />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />

      {/* Protected workspace routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
