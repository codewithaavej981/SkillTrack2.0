import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { chartData } from "../data/demoData";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

import Progress from "../components/Progress";
import PageHead from "../components/PageHead";
import { getSkills } from "../services/skillService";
import { getGoals } from "../services/goalService";
import { getLearningResources } from "../services/learningService";
import CardHead from "../components/CardHead";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [skillList, setSkillList] = useState([]);
  const [goalList, setGoalList] = useState([]);
  const [resourceList, setResourceList] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [skillsRes, goalsRes, resourcesRes] = await Promise.allSettled([
          getSkills(),
          getGoals(),
          getLearningResources(),
        ]);

        setSkillList(
          skillsRes.status === "fulfilled" && Array.isArray(skillsRes.value)
            ? skillsRes.value
            : [],
        );
        setGoalList(
          goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value)
            ? goalsRes.value
            : [],
        );
        setResourceList(
          resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value)
            ? resourcesRes.value
            : [],
        );
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  const activeSkills = skillList.length;
  const activeGoals = goalList.filter((goal) => !goal.completed).length;
  const completedGoals = goalList.filter((goal) => goal.completed).length;

  const completedResources = resourceList.filter(
    (r) => Boolean(r.completed) || Number(r.progress || 0) >= 100,
  ).length;

  // Estimated learning time: 3.5h per completed resource, proportional for in-progress
  const totalLearningHours = Math.round(
    resourceList.reduce((acc, r) => {
      if (r.completed || Number(r.progress || 0) >= 100) return acc + 3.5;
      return acc + (Number(r.progress || 0) / 100) * 3.5;
    }, 0),
  );

  const goalProgress = goalList.length
    ? Math.round(
        goalList.reduce((total, goal) => total + (goal.progress || 0), 0) /
          goalList.length,
      )
    : 0;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  const activeGoalItems = goalList.filter((g) => !g.completed);

  return (
    <>
      <PageHead
        label={todayFormatted}
        title={`Welcome Back, ${user?.name?.split(" ")[0] || "there"}.`}
        text="Here’s a clear view of the progress you’re making."
        action={
          <Link to="/skills" className="button btn-add-skill">
            <Plus size={16} />
            <span>Add skill</span>
          </Link>
        }
      />

      <section className="hero">
        <div className="hero-content">
          <span className="hero-icon" aria-hidden="true">
            <Sparkles size={17} />
          </span>

          <p className="eyebrow">YOUR LEARNING MOMENTUM</p>

          <h2>{goalProgress}% of your quarterly growth plan</h2>

          <p>Keep building your skills and moving toward your goals.</p>

          <Progress value={goalProgress} color="#fff" />
        </div>

        <div
          className="ring"
          style={{ "--progress": goalProgress }}
          role="progressbar"
          aria-valuenow={goalProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall progress: ${goalProgress}%`}
        >
          <b>
            {goalProgress}
            <small>%</small>
          </b>
          <span>overall progress</span>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span className="stat purple" aria-hidden="true">
            <BookOpen size={20} />
          </span>
          <div className="stat-info">
            <b>{activeSkills}</b>
            <p>Active skills</p>
            <small>From your skill library</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat orange" aria-hidden="true">
            <Target size={20} />
          </span>
          <div className="stat-info">
            <b>{activeGoals}</b>
            <p>Goals in progress</p>
            <small>{completedGoals} completed</small>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat green" aria-hidden="true">
            <Clock size={20} />
          </span>
          <div className="stat-info">
            <b>{resourceList.length > 0 ? `${totalLearningHours}h` : "0h"}</b>
            <p>Learning time</p>
            <small>
              {resourceList.length > 0
                ? completedResources > 0
                  ? `${completedResources} completed`
                  : `${resourceList.length} in progress`
                : "From learning library"}
            </small>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card chart">
          <CardHead
            title="Progress over time"
            text="Your skill-building rhythm this year"
          />

          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6956e7" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6956e7" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="var(--border, #ecebf2)" strokeDasharray="3 3" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted, #898596)", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={36}
                tick={{ fill: "var(--text-muted, #898596)", fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface, #ffffff)",
                  borderColor: "var(--border, #ebeaf0)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  color: "var(--text, #302d40)",
                  fontSize: "12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="progress"
                stroke="#6956e7"
                strokeWidth={2.5}
                fill="url(#fill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="card">
          <CardHead
            title="Active goals"
            text="Stay close to the finish line"
            link="/goals"
          />

          {activeGoalItems.length === 0 ? (
            <div className="card-empty-state">
              <span className="empty-icon" aria-hidden="true">
                <Target size={20} />
              </span>
              <p>No active goals in progress</p>
              <Link to="/goals?add=true" className="empty-action-btn">
                <Plus size={14} /> Add new goal
              </Link>
            </div>
          ) : (
            activeGoalItems.slice(0, 2).map((g) => (
              <div className="compact" key={g._id}>
                <div>
                  <b>{g.title}</b>
                  <strong>{g.progress}%</strong>
                </div>

                <Progress value={g.progress || 0} />

                <small>
                  <CalendarDays size={13} aria-hidden="true" /> Due{" "}
                  {g.deadline
                    ? new Date(g.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"}
                </small>
              </div>
            ))
          )}
        </article>
      </section>

      <section className="grid lower">
        <article className="card">
          <CardHead
            title="Skill focus"
            text="Your strongest momentum"
            link="/skills"
          />

          {skillList.length === 0 ? (
            <div className="card-empty-state">
              <span className="empty-icon" aria-hidden="true">
                <BookOpen size={20} />
              </span>
              <p>No skills tracked yet</p>
              <Link to="/skills" className="empty-action-btn">
                <Plus size={14} /> Add your first skill
              </Link>
            </div>
          ) : (
            skillList.slice(0, 3).map((s) => (
              <div className="skill-line" key={s._id}>
                <i style={{ background: s.color || "var(--velvet, #6956e7)" }} aria-hidden="true" />

                <div className="skill-line-details">
                  <b>{s.name}</b>
                  <small>
                    {s.level} {s.next ? `· ${s.next}` : ""}
                  </small>
                </div>

                <aside>
                  <b>{s.progress}%</b>
                  <Progress value={s.progress} color={s.color} />
                </aside>
              </div>
            ))
          )}
        </article>

        <article className="card">
          <CardHead
            title="Recent activity"
            text="Small steps add up"
            link="/learning"
          />

          {[
            "Completed “Reusable component patterns”",
            "Updated Product Design progress",
            "Added a new career goal",
          ].map((x, i) => (
            <div className="activity" key={x}>
              <span aria-hidden="true">
                {i === 0 ? (
                  <CheckCircle2 size={16} />
                ) : i === 1 ? (
                  <BookOpen size={16} />
                ) : (
                  <Target size={16} />
                )}
              </span>

              <div>
                <b>{x}</b>

                <small>
                  {i === 0
                    ? "React Development · 42 min ago"
                    : i === 1
                      ? "Skill progress · Yesterday"
                      : "Goal planning · Jun 14"}
                </small>
              </div>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
