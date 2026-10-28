import { useState, useEffect, useRef } from "react";
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

const getUserInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

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

  // Dismiss drawer, notification popover & user menu on route change
  useEffect(() => {
    setOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Outside click handler for header user dropdown
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Prevent background scrolling when mobile sidebar is open
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

  const initials = getUserInitials(user?.name);

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
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User"}
                  className="avatar-img"
                />
              ) : (
                initials
              )}
            </i>

            <span>
              <b>{user?.name || "User"}</b>
              <small>{user?.role || "SkillTracker Member"}</small>
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

            {/* Header User Menu with Avatar and Logout */}
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button
                type="button"
                className="avatar header-avatar-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-label="User account menu"
                aria-expanded={userMenuOpen}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "User"}
                    className="avatar-img"
                  />
                ) : (
                  initials
                )}
              </button>

              {userMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-header">
                    <div className="user-menu-avatar">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name || "User"}
                          className="avatar-img"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="user-menu-info">
                      <b>{user?.name || "User"}</b>
                      <small>{user?.email || "Authenticated"}</small>
                    </div>
                  </div>
                  <div className="user-menu-divider" />
                  <NavLink
                    to="/profile"
                    className="user-menu-item"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <UserRound size={15} />
                    <span>Your profile</span>
                  </NavLink>
                  <button
                    type="button"
                    className="user-menu-item logout-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    role="menuitem"
                  >
                    <LogOut size={15} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
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
