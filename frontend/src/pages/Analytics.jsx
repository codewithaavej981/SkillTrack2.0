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

import { Target } from "lucide-react";

import PageHead from "../components/PageHead";
import Stats from "../components/Stats";
import CardHead from "../components/CardHead";
import { skills } from "../data/demoData";

export default function Analytics() {
  const data = skills.map((x) => ({
    name: x.name.split(" ")[0],
    progress: x.progress,
    color: x.color,
  }));

  const pie = [
    { name: "Complete", value: 1, color: "#24a47f" },
    { name: "Working", value: 2, color: "#6956e7" },
  ];

  return (
    <>
      <PageHead
        label="PERFORMANCE INSIGHTS"
        title="See the shape of your growth."
        text="A concise view of your learning habits and momentum."
      />

      <Stats />

      <section className="grid two analytics">
        <article className="card chart">
          <CardHead
            title="Skill proficiency"
            text="Current progress by capability"
          />

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid
                vertical={false}
                stroke="#ecebf2"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="progress"
                radius={[6, 6, 0, 0]}
              >
                {data.map((x) => (
                  <Cell
                    key={x.name}
                    fill={x.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="card donut">
          <CardHead
            title="Goal completion"
            text="Quarterly goal status"
          />

          <div className="pie">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={5}
                  stroke="none"
                >
                  {pie.map((x) => (
                    <Cell
                      key={x.name}
                      fill={x.color}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div>
              <b>33%</b>
              <span>complete</span>
            </div>
          </div>

          <p className="legend">
            ● 1 completed <i>●</i> 2 in progress
          </p>
        </article>
      </section>

      <section className="insight">
        <Target />

        <div>
          <b>
            Strongest pattern: consistent weekly progress
          </b>

          <p>
            You’ve logged learning activity in 4 of the last 5
            weeks. Your React skill is gaining the fastest.
          </p>
        </div>

        <button>View recommendations</button>
      </section>
    </>
  );
}