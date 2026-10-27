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
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Button from "./components/Button";
import NotificationPanel from "./components/NotificationPanel";
import BrandLogo from "./components/BrandLogo";
import { useAuth } from "./context/AuthContext";
import { nav, names } from "./data/demoData";
import {
  getNotifications,
  subscribeToNotifications,
} from "./services/notificationService";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Subscribe to live notification counts
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((count) => {
      setUnreadCount(count);
    });
    getNotifications(user?._id).then((res) => {
      setUnreadCount(res.unreadCount);
    });
    return unsubscribe;
  }, [user?._id]);

  // Dismiss drawer & notification popover on route change
  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="shell">
      <aside className={`side ${open ? "open" : ""}`} aria-label="Navigation drawer">
        <div className="brand">
          <BrandLogo size={32} />
          <div className="brand-title-wrap">
            <span className="brand-name">SkillTracker</span>
            <span className="brand-version">AI 2.0</span>
          </div>
          <button
            type="button"
            className="close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
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
          <NavLink
            to="/profile"
            className="mini-profile"
            onClick={() => setOpen(false)}
          >
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
            type="button"
            className="logout"
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/login");
            }}
          >
            <LogOut />
            Log out
          </button>
        </div>
      </aside>
      {open && (
        <button
          type="button"
          className="backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <main>
        <header>
          <button
            type="button"
            className="hamburger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <span className="crumb">
            Workspace <em>/</em> {names[location.pathname] || "Dashboard"}
          </span>

          <div className="header-actions">
            {/* Dark / Light toggle */}
            <Button
              className="theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            {/* AI Assistant header entry */}
            <NavLink
              to="/assistant"
              className={({ isActive }) =>
                `header-ai-btn ${isActive ? "active" : ""}`
              }
              title="AI Assistant"
              aria-label="AI Assistant"
            >
              <Sparkles size={15} className="header-ai-icon" />
              <span className="header-ai-label">AI Assistant</span>
            </NavLink>

            <Button className="btn-add" onClick={() => navigate("/goals?add=true")}>
              <Plus size={15} />
              <span>Add goal</span>
            </Button>

            <div className="notif-wrapper">
              <Button
                className={`round notif-btn ${notifOpen ? "active" : ""}`}
                onClick={() => setNotifOpen((prev) => !prev)}
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-badge" aria-hidden="true">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <NotificationPanel
                  onClose={() => setNotifOpen(false)}
                  onUnreadCountChange={setUnreadCount}
                />
              )}
            </div>

            <NavLink to="/profile" className="avatar" aria-label="Open profile">
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
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
