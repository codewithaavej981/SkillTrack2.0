import { Link } from "react-router-dom";
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
import { chartData, goals, skills } from "../data/demoData";
import Stats from "../components/Stats";
import CardHead from "../components/CardHead";

export default function Dashboard() {
  return (
    <>
      <PageHead
        label="MONDAY, JUNE 17"
        title="Good morning, Maria."
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

          <h2>71% of your quarterly growth plan</h2>

          <p>
            You’re 6% ahead of where you planned to be. Keep the rhythm going.
          </p>

          <Progress value={71} color="#fff" />
        </div>

        <div className="ring">
          <b>
            71<small>%</small>
          </b>
          <span>overall progress</span>
        </div>
      </section>

      <Stats />

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
                  <stop
                    stopColor="#6956e7"
                    stopOpacity=".26"
                  />
                  <stop
                    offset="1"
                    stopColor="#6956e7"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#ecebf2"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={27}
              />

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

          {goals.slice(0, 2).map((g) => (
            <div className="compact" key={g.id}>
              <div>
                <b>{g.title}</b>
                <strong>{g.progress}%</strong>
              </div>

              <Progress value={g.progress} />

              <small>
                <CalendarDays /> Due {g.due}
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

          {skills.slice(0, 3).map((s) => (
            <div className="skill-line" key={s.id}>
              <i style={{ background: s.color }} />

              <div>
                <b>{s.name}</b>
                <small>
                  {s.level} · {s.next}
                </small>
              </div>

              <aside>
                <b>{s.progress}%</b>
                <Progress
                  value={s.progress}
                  color={s.color}
                />
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