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
  getLearningResources,
  createLearningResource,
  updateLearningResource,
} from "./services/learningService";
// import { getLearningResources } from "./services/learningService";
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
  Sun,
  Moon,
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
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
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
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await getLearningResources();
        setResources(data);
      } catch (error) {
        console.error("Failed to load learning resources:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const list = resources.filter(
    (x) =>
      (filter === "All" || x.category === filter) &&
      x.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStartLearning = async (resource) => {
    try {
      const updated = await updateLearningResource(resource._id, {
        progress: 10,
      });

      setResources((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (error) {
      console.error("Failed to update learning progress:", error);
    }
  };

  const handleComplete = async (resource) => {
    try {
      const updated = await updateLearningResource(resource._id, {
        progress: 100,
        completed: true,
      });

      setResources((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (error) {
      console.error("Failed to complete resource:", error);
    }
  };

  return (
    <>
      <PageHead
        label="LEARNING LIBRARY"
        title="Keep your curiosity moving."
        text="Curated resources to support the skills you’re building."
      />

      <Button onClick={() => setShowForm((prev) => !prev)}>
        <Plus />
        Add resource
      </Button>

      {showForm && (
        <form
          className="card"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            try {
              const newResource = await createLearningResource({
                title: formData.get("title"),
                source: formData.get("source"),
                category: formData.get("category"),
                url: formData.get("url"),
              });

              setResources((prev) => [newResource, ...prev]);
              setShowForm(false);
              e.target.reset();
            } catch (error) {
              console.error("Failed to create resource:", error);
            }
          }}
        >
          <input name="title" placeholder="Resource title" required />

          <input name="source" placeholder="Source" required />

          <select name="category" defaultValue="Development">
            <option>Design</option>
            <option>Development</option>
            <option>Analytics</option>
            <option>Leadership</option>
          </select>

          <input name="url" placeholder="Resource URL" />

          <Button type="submit">Add resource</Button>
        </form>
      )}

      {loading ? (
        <p>Loading learning resources...</p>
      ) : (
        <>
          {resources.length > 0 && (
            <section className="continue">
              <span>
                <BookOpen />
              </span>

              <div>
                <p className="eyebrow">CONTINUE LEARNING</p>
                <h2>{resources[0].title}</h2>
                <p>{resources[0].source}</p>
                <Progress value={resources[0].progress} />
              </div>

              <Button onClick={() => handleStartLearning(resources[0])}>
                Resume <ChevronRight />
              </Button>
            </section>
          )}

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
            {list.length > 0 ? (
              list.map((r) => (
                <article className="resource" key={r._id}>
                  <div className="resource-art">
                    <BookOpen />
                    <span>{r.category}</span>
                  </div>

                  <div>
                    <small>{r.source}</small>
                    <h3>{r.title}</h3>

                    {r.progress > 0 && (
                      <>
                        <Progress value={r.progress} />
                        <small>{r.progress}% complete</small>
                      </>
                    )}

                    {r.progress === 0 && (
                      <button onClick={() => handleStartLearning(r)}>
                        Start learning <ChevronRight />
                      </button>
                    )}

                    {r.progress > 0 && r.progress < 100 && (
                      <button onClick={() => handleComplete(r)}>
                        Mark complete <Check />
                      </button>
                    )}

                    {r.completed && <small>✓ Completed</small>}
                  </div>
                </article>
              ))
            ) : (
              <p>No learning resources found.</p>
            )}
          </section>
        </>
      )}
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
