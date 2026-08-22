import { useMemo, useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Stats from "./components/Stats";
import CardHead from "./components/CardHead";
import Progress from "./components/Progress";
import Button from "./components/Button";
import PageHead from "./components/PageHead";
import Notice from "./components/Notice";
import { useAuth } from "./context/AuthContext";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "./services/skillService";
import Skills from "./pages/Skills";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  skills,
  goals,
  chartData,
  resources,
  nav,
  names,
} from "./data/demoData";

function Shell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className={`side ${open ? "open" : ""}`}>
        <div className="brand">
          <span>S</span>SkillTrack{" "}
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
            <Button className="new">
              <Plus />
              New goal
            </Button>
            <Button className="round">
              <Bell />
            </Button>
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

function Learning() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const list = resources.filter(
    (x) =>
      (filter === "All" || x.category === filter) &&
      x.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHead
        label="LEARNING LIBRARY"
        title="Keep your curiosity moving."
        text="Curated resources to support the skills you’re building."
      />
      <section className="continue">
        <span>
          <BookOpen />
        </span>
        <div>
          <p className="eyebrow">CONTINUE LEARNING</p>
          <h2>{resources[0].title}</h2>
          <p>
            {resources[0].source} · {resources[0].time} remaining
          </p>
          <Progress value={64} />
        </div>
        <Button>
          Resume <ChevronRight />
        </Button>
      </section>
      <div className="toolbar learning-tools">
        <label className="search">
          <Search />
          <input
            placeholder="Search learning resources"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="pills">
          {["All", "Design", "Development", "Analytics", "Leadership"].map(
            (x) => (
              <button
                className={filter === x ? "on" : ""}
                onClick={() => setFilter(x)}
                key={x}
              >
                {x}
              </button>
            ),
          )}
        </div>
      </div>
      <section className="resource-grid">
        {list.map((r) => (
          <article className="resource" key={r.title}>
            <div className={`resource-art ${r.tint}`}>
              <BookOpen />
              <span>{r.category}</span>
            </div>
            <div>
              <small>{r.source}</small>
              <h3>{r.title}</h3>
              <p>
                <Clock3 />
                {r.time}
              </p>
              {r.progress ? (
                <>
                  <Progress value={r.progress} />
                  <small>{r.progress}% complete</small>
                </>
              ) : (
                <button>
                  Start learning <ChevronRight />
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />
      <Route element={<Shell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
