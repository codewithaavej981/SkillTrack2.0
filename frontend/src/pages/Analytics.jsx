import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
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
import { Award, BookOpen, Target, RefreshCw } from "lucide-react";

import PageHead from "../components/PageHead";
import Stats from "../components/Stats";
import CardHead from "../components/CardHead";
import { getAnalytics } from "../services/analyticsService";

const CATEGORY_COLORS = {
  Development: "#6956e7",
  Design: "#24a47f",
  Analytics: "#ef8b45",
  Leadership: "#d6547d",
  Cybersecurity: "#0ea5e9",
  "AI / ML": "#8b5cf6",
  Other: "#64748b",
};

const formatTimestamp = (ts) => {
  if (!ts) return "Recently";
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const progress = payload[0].value ?? item.progress ?? 0;
    return (
      <div className="analytics-tooltip">
        <p className="tooltip-title">{item.fullName || item.name}</p>
        <div className="tooltip-row">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: item.color || "#6956e7" }}
          />
          <span className="tooltip-category">{item.category || "Skill"}:</span>
          <b className="tooltip-value">{progress}%</b>
        </div>
      </div>
    );
  }
  return null;
}

function DonutTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="analytics-tooltip">
        <p className="tooltip-title">{item.name}</p>
        <div className="tooltip-row">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: item.payload?.color || "#6956e7" }}
          />
          <span className="tooltip-category">Goals:</span>
          <b className="tooltip-value">{item.value}</b>
        </div>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAnalytics();
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        setError("Failed to retrieve analytics data.");
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load analytics. Please ensure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const skillsData = data?.skills || {
    total: 0,
    avgProgress: 0,
    byLevel: {},
    byCategory: {},
    items: [],
  };

  const goalsData = data?.goals || {
    total: 0,
    completed: 0,
    inProgress: 0,
    completionRate: 0,
    avgProgress: 0,
    items: [],
  };

  const learningData = data?.learning || {
    total: 0,
    completed: 0,
    remaining: 0,
    inProgress: 0,
    items: [],
  };

  const recentActivities = data?.recentActivity || [];

  // Skill proficiency bar chart (limit to 8 capabilities for clear readability)
  const skillChartData = (skillsData.items || []).slice(0, 8).map((s, idx) => ({
    name: s.name.length > 18 ? `${s.name.slice(0, 17)}…` : s.name,
    mobileLabel: s.name.length > 14 ? `${s.name.slice(0, 13)}…` : s.name,
    fullName: s.name,
    progress: s.progress || 0,
    category: s.category || "Skill",
    color:
      CATEGORY_COLORS[s.category] ||
      ["#6956e7", "#24a47f", "#ef8b45", "#d6547d"][idx % 4],
  }));

  // Goal completion donut chart
  const completedGoals = goalsData.completed || 0;
  const inProgressGoals = goalsData.inProgress || 0;
  const totalGoals = goalsData.total || 0;
  const completionRate = goalsData.completionRate || 0;

  const pieData =
    totalGoals > 0
      ? [
          { name: "Completed", value: completedGoals, color: "#24a47f" },
          { name: "In Progress", value: inProgressGoals, color: "#6956e7" },
        ]
      : [];

  // Dynamic growth pattern insight derived from actual user capabilities and goals
  const topSkill =
    (skillsData.items || []).length > 0
      ? [...skillsData.items].sort(
          (a, b) => (b.progress || 0) - (a.progress || 0)
        )[0]
      : null;

  let insightTitle = "Ready to start your growth momentum";
  let insightText =
    "Add your active skills and goals to unlock real-time performance insights.";

  if (topSkill && topSkill.progress > 0) {
    insightTitle = `Strongest capability: ${topSkill.name}`;
    insightText = `Leading your skillset at ${topSkill.progress}% proficiency (${topSkill.level || "Beginner"}). Average capability progress across ${skillsData.total} skills is ${skillsData.avgProgress}%.`;
  } else if (goalsData.total > 0) {
    insightTitle = `${goalsData.completed} of ${goalsData.total} goals achieved`;
    insightText = `You have attained a ${goalsData.completionRate}% completion rate with average milestone progress of ${goalsData.avgProgress}%.`;
  } else if (skillsData.total > 0) {
    insightTitle = `${skillsData.total} active capabilities tracked`;
    insightText = `Your skills are cataloged in your library with an average baseline progress of ${skillsData.avgProgress}%.`;
  }

  return (
    <>
      <PageHead
        label="PERFORMANCE INSIGHTS"
        title="See the shape of your growth."
        text="A concise view of your learning habits and momentum."
      />

      {loading && (
        <article className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading performance insights...</p>
        </article>
      )}

      {error && !loading && (
        <article
          className="card"
          style={{ padding: "32px", textAlign: "center", marginBottom: "19px" }}
        >
          <p style={{ color: "var(--danger, #e5484d)", marginBottom: "16px" }}>
            {error}
          </p>
          <button
            className="button"
            onClick={fetchAnalytics}
            style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </article>
      )}

      {!loading && !error && (
        <>
          <Stats
            skillsTotal={skillsData.total}
            skillsAvgProgress={skillsData.avgProgress}
            goalsInProgress={goalsData.inProgress}
            goalsCompleted={goalsData.completed}
            learningTotal={learningData.total}
            learningCompleted={learningData.completed}
          />

          <section className="grid two analytics">
            <article className="card chart">
              <CardHead
                title="Skill proficiency"
                text="Current progress by capability"
                link="/skills"
              />

              {skillChartData.length === 0 ? (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <p style={{ marginBottom: "14px" }}>No skills recorded yet.</p>
                  <Link
                    to="/skills"
                    className="button"
                    style={{ display: "inline-flex", fontSize: "13px" }}
                  >
                    Add your first skill
                  </Link>
                </div>
              ) : isMobile ? (
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(220, skillChartData.length * 38 + 28)}
                >
                  <BarChart
                    layout="vertical"
                    data={skillChartData}
                    margin={{ top: 6, right: 18, left: -4, bottom: 6 }}
                  >
                    <CartesianGrid horizontal={false} stroke="var(--border, #ecebf2)" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                      tick={{ fontSize: 10, fill: "var(--text-muted, #858193)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="mobileLabel"
                      width={92}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--text-muted, #858193)" }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(105, 86, 231, 0.08)" }}
                    />
                    <Bar dataKey="progress" radius={[0, 5, 5, 0]} barSize={14}>
                      {skillChartData.map((x) => (
                        <Cell key={x.fullName} fill={x.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={skillChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 45 }}
                  >
                    <CartesianGrid vertical={false} stroke="var(--border, #ecebf2)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={55}
                      tick={{ fontSize: 11, fill: "var(--text-muted, #858193)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      width={32}
                      tick={{ fontSize: 11, fill: "var(--text-muted, #858193)" }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(105, 86, 231, 0.08)" }}
                    />
                    <Bar dataKey="progress" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {skillChartData.map((x) => (
                        <Cell key={x.fullName} fill={x.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </article>

            <article className="card donut">
              <CardHead
                title="Goal completion"
                text="Milestone progress"
                link="/goals"
              />

              {totalGoals === 0 ? (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <p style={{ marginBottom: "14px" }}>No goals tracked yet.</p>
                  <Link
                    to="/goals"
                    className="button"
                    style={{ display: "inline-flex", fontSize: "13px" }}
                  >
                    Create your first goal
                  </Link>
                </div>
              ) : (
                <>
                  <div className="pie">
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={56}
                          outerRadius={78}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {pieData.map((x) => (
                            <Cell key={x.name} fill={x.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div>
                      <b>{completionRate}%</b>
                      <span>complete</span>
                    </div>
                  </div>

                  <p className="legend">
                    <span style={{ color: "#24a47f", fontWeight: 600 }}>● {completedGoals} completed</span>{" "}
                    <span style={{ color: "#6956e7", fontWeight: 600, marginLeft: "10px" }}>● {inProgressGoals} in progress</span>
                  </p>
                </>
              )}
            </article>
          </section>

          <section className="insight">
            <Target />
            <div>
              <b>{insightTitle}</b>
              <p>{insightText}</p>
            </div>
            <Link to="/skills" className="button">
              View skills
            </Link>
          </section>

          {recentActivities.length > 0 && (
            <article className="card" style={{ marginTop: "19px" }}>
              <CardHead
                title="Recent activity log"
                text="Chronological updates across skills, goals, and learning"
              />
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                {recentActivities.map((act) => (
                  <div className="activity" key={act.id}>
                    <span>
                      {act.type === "goal" ? (
                        <Target />
                      ) : act.type === "resource" ? (
                        <BookOpen />
                      ) : (
                        <Award />
                      )}
                    </span>
                    <div>
                      <b>{act.title}</b>
                      <small>
                        {act.action} · {formatTimestamp(act.timestamp)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}
        </>
      )}
    </>
  );
}
