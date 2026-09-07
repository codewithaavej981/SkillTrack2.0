import { useEffect, useMemo, useState } from "react";

import Progress from "../components/Progress";
import Button from "../components/Button";
import PageHead from "../components/PageHead";
import Notice from "../components/Notice";

import { Check, Clock3, Edit3, Plus, Target, Trash2 } from "lucide-react";

// import { goals } from "../data/demoData";

import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../services/goalService";
export default function Goals() {
  const [note, setNote] = useState("");
  const [goalList, setGoalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web Developement",
    progress: 0,
    deadline: "",
    completed: false,
  });

  const openAddForm = () => {
    setEditingGoal(null);

    setForm({
      title: "",
      description: "",
      deadline: "",
      completed: false,
    });

    setNote("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNote("");

    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, form);
        setNote("Goal updated successfully.");
      } else {
        await createGoal(form);
        setNote("Goal added successfully.");
      }

      setShowForm(false);
      setEditingGoal(null);

      const data = await getGoals();
      setGoalList(data || []);
    } catch (error) {
      setNote(error.response?.data?.message || "Failed to save goal.");
    }
  };

  const activeGoals = goalList.filter((goal) => !goal.completed).length;

  const completedGoals = goalList.filter((goal) => goal.completed).length;

  const averageProgress = goalList.length
    ? Math.round(
        goalList.reduce((total, goal) => total + (goal.progress || 0), 0) /
          goalList.length,
      )
    : 0;

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        const data = await getGoals();
        setGoalList(data || []);
      } catch (error) {
        setNote(error.response?.data?.message || "Failed to load goals.");
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  return (
    <>
      <PageHead
        label="GOAL PLANNING"
        title="Make the next milestone real."
        text="Connect daily progress to the outcomes you care about."
        action={
          <Button className="btn-add" onClick={openAddForm}>
            <Plus />
            Add goal
          </Button>
        }
      />

      <Notice message={note} />
      {showForm && (
        <form className="skill-form" onSubmit={handleSubmit}>
          <h3>{editingGoal ? "Edit goal" : "Add a new goal"}</h3>

          <input
            name="title"
            placeholder="Goal title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="What do you want to achieve?"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          <select name="category" value={form.category} onChange={handleChange}>
            <option>Web Development</option>
            <option>AI / ML</option>
            <option>Cybersecurity</option>
            <option>Data Science</option>
            <option>Other</option>
          </select>

          <label>
            Progress: {form.progress}%
            <input
              name="progress"
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={handleChange}
            />
          </label>

          <input
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
          />

          <label className="goal-check">
            <input
              type="checkbox"
              name="completed"
              checked={form.completed}
              onChange={handleChange}
            />
            Mark as completed
          </label>

          <div>
            <Button type="submit">
              {editingGoal ? "Update goal" : "Save goal"}
            </Button>

            <Button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="goal-stats">
  <div>
    <b>{activeGoals}</b>
    <span>Goals in progress</span>
  </div>

  <div>
    <b>{completedGoals}</b>
    <span>Completed goals</span>
  </div>

  <div>
    <b>{averageProgress}%</b>
    <span>Average completion</span>
  </div>
</div>

      <section className="goal-grid">
        {goalList.map((g) => (
          <article
            className={`goal-card ${g.completed ? "done" : ""}`}
            key={g._id}
          >
            <div className="card-top">
              <span className={g.completed ? "completed" : "active"}>
                {g.completed ? "Completed" : "In progress"}
              </span>

              <aside>
                <button
                  onClick={() => {
                    setEditingGoal(g);
                    setForm({
                      title: g.title || "",
                      description: g.description || "",
                      category: g.category || "Web Development",
                      progress: g.progress || 0,
                      deadline: g.deadline
                        ? new Date(g.deadline).toISOString().split("T")[0]
                        : "",
                      completed: g.completed || false,
                    });
                    setShowForm(true);
                    setNote("");
                  }}
                >
                  <Edit3 />
                </button>

                <button
                  onClick={async () => {
                    const confirmed = window.confirm(`Delete "${g.title}"?`);

                    if (!confirmed) return;

                    try {
                      await deleteGoal(g._id);

                      setGoalList((previous) =>
                        previous.filter((goal) => goal._id !== g._id),
                      );

                      setNote("Goal deleted successfully.");
                    } catch (error) {
                      setNote(
                        error.response?.data?.message ||
                          "Failed to delete goal.",
                      );
                    }
                  }}
                >
                  <Trash2 />
                </button>
              </aside>
            </div>

            <i className="goal-icon">{g.completed ? <Check /> : <Target />}</i>

            <h3>{g.title}</h3>
            <span className="goal-category">{g.category || "Other"}</span>

            <p>{g.description}</p>

            <div className="goal-progress">
              <span>
                Progress <b>{g.progress || 0}%</b>
              </span>

              <Progress
                value={g.progress || 0}
                color={g.completed ? "#24a47f" : "#6956e7"}
              />
            </div>

            <footer>
              <Clock3 />
              {g.completed
                ? "Completed"
                : g.deadline
                  ? `Due ${new Date(g.deadline).toLocaleDateString()}`
                  : "No deadline"}
            </footer>
          </article>
        ))}
      </section>
    </>
  );
}
