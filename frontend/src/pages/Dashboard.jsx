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
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

import Progress from "../components/Progress";
import PageHead from "../components/PageHead";
import { getSkills } from "../services/skillService";
import { getGoals } from "../services/goalService";
import Stats from "../components/Stats";
import CardHead from "../components/CardHead";
import { useAuth } from "../context/AuthContext";
export default function Dashboard() {
  const { user } = useAuth();
  const [skillList, setSkillList] = useState([]);
  const [goalList, setGoalList] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [skills, goals] = await Promise.all([getSkills(), getGoals()]);

        setSkillList(skills || []);
        setGoalList(goals || []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  const activeSkills = skillList.length;

  const activeGoals = goalList.filter((goal) => !goal.completed).length;

  const completedGoals = goalList.filter((goal) => goal.completed).length;

  const goalProgress = goalList.length
    ? Math.round(
        goalList.reduce((total, goal) => total + (goal.progress || 0), 0) /
          goalList.length,
      )
    : 0;

  return (
    <>
      <PageHead
        label="MONDAY, JUNE 17"
        title={`Welcome Back, ${user?.name?.split(" ")[0] || "there"}.`}
        text="Here’s a clear view of the progress you’re making."
        action={
          <Link to="/skills" className="button">
            <Plus />
            Add skill
          </Link>
        }
      />

      <section className="hero">
        <div>
          <span className="hero-icon">
            <Sparkles />
          </span>

          <p className="eyebrow">YOUR LEARNING MOMENTUM</p>

          <h2>{goalProgress}% of your quarterly growth plan</h2>

          <p>Keep building your skills and moving toward your goals.</p>

          <Progress value={goalProgress} color="#fff" />
        </div>

        <div className="ring">
          <b>
            {goalProgress}
            <small>%</small>
          </b>
          <span>overall progress</span>
        </div>
      </section>

      <section className="stats">
        <div>
          <span className="stat purple">
            <BookOpen />
          </span>
          <b>{activeSkills}</b>
          <p>Active skills</p>
          <small>From your skill library</small>
        </div>

        <div>
          <span className="stat orange">
            <Target />
          </span>
          <b>{activeGoals}</b>
          <p>Goals in progress</p>
          <small>{completedGoals} completed</small>
        </div>

        <div>
          <span className="stat green">
            <BookOpen />
          </span>
          <b>—</b>
          <p>Learning time</p>
          <small>Coming with Learning module</small>
        </div>
      </section>

      <section className="grid two">
        <article className="card chart">
          <CardHead
            title="Progress over time"
            text="Your skill-building rhythm this year"
          />

          <ResponsiveContainer width="100%" height={235}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#6956e7" stopOpacity=".26" />
                  <stop offset="1" stopColor="#6956e7" stopOpacity="0" />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#ecebf2" />

              <XAxis dataKey="month" axisLine={false} tickLine={false} />

              <YAxis axisLine={false} tickLine={false} width={27} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="progress"
                stroke="#6956e7"
                strokeWidth={3}
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

          {goalList
            .filter((g) => !g.completed)
            .slice(0, 2)
            .map((g) => (
              <div className="compact" key={g._id}>
                <div>
                  <b>{g.title}</b>
                  <strong>{g.progress}%</strong>
                </div>

                <Progress value={g.progress || 0} />

                <small>
                  <CalendarDays /> Due{" "}
                  {g.deadline
                    ? new Date(g.deadline).toLocaleDateString()
                    : "No deadline"}
                </small>
              </div>
            ))}
        </article>
      </section>

      <section className="grid lower">
        <article className="card">
          <CardHead
            title="Skill focus"
            text="Your strongest momentum"
            link="/skills"
          />

          {skillList.slice(0, 3).map((s) => (
            <div className="skill-line" key={s._id}>
              <i style={{ background: s.color }} />

              <div>
                <b>{s.name}</b>
                <small>
                  {s.level} · {s.next}
                </small>
              </div>

              <aside>
                <b>{s.progress}%</b>
                <Progress value={s.progress} color={s.color} />
              </aside>
            </div>
          ))}
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
              <span>
                {i === 0 ? (
                  <CheckCircle2 />
                ) : i === 1 ? (
                  <BookOpen />
                ) : (
                  <Target />
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
