import { useEffect, useMemo, useState } from "react";

import Progress from "../components/Progress";
import Button from "../components/Button";
import PageHead from "../components/PageHead";
import Notice from "../components/Notice";

import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../services/skillService";

import {
  BookOpen,
  Edit3,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export default function Skills() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [note, setNote] = useState("");
  const [skillList, setSkillList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Development",
    level: "Beginner",
    progress: 0,
    description: "",
  });

  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem("skillDraft");

    if (savedDraft) {
      setForm(JSON.parse(savedDraft));
      setShowForm(true);
    }
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem("skillDraft");

    if (savedDraft) {
      setForm(JSON.parse(savedDraft));
      setShowForm(true);
    }

    setDraftLoaded(true);
  }, []);
  useEffect(() => {
    if (!draftLoaded) return;

    localStorage.setItem("skillDraft", JSON.stringify(form));
  }, [form, draftLoaded]);

  
  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkillList(data || []);
    } catch (error) {
      setNote(error.response?.data?.message || "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const list = useMemo(
    () =>
      skillList.filter(
        (x) =>
          (cat === "All" || x.category === cat) &&
          x.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [skillList, search, cat],
  );

  const openAddForm = () => {
    setEditingSkill(null);

    setForm({
      name: "",
      category: "Development",
      level: "Beginner",
      progress: 0,
      description: "",
    });

    setNote("");
    setShowForm(true);
  };

  const openEditForm = (skill) => {
    setEditingSkill(skill);

    setForm({
      name: skill.name || "",
      category: skill.category || "Development",
      level: skill.level || "Beginner",
      progress: skill.progress || 0,
      description: skill.description || "",
    });

    setNote("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "progress" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNote("");

    try {
      if (editingSkill) {
        await updateSkill(editingSkill._id, form);
        setNote("Skill updated successfully.");
      } else {
        await createSkill(form);
        setNote("Skill added successfully.");
        localStorage.removeItem("skillDraft");
      }

      setShowForm(false);
      setEditingSkill(null);

      await loadSkills();
    } catch (error) {
      setNote(error.response?.data?.message || "Failed to save skill.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?",
    );

    if (!confirmed) return;

    try {
      await deleteSkill(id);
      setNote("Skill deleted successfully.");
      await loadSkills();
    } catch (error) {
      setNote(error.response?.data?.message || "Failed to delete skill.");
    }
  };

  return (
    <>
      <PageHead
        label="SKILL LIBRARY"
        title="Build your edge."
        text="Track the capabilities that move your work and career forward."
        action={
          <Button className="btn-add" onClick={openAddForm}>
            <Plus />
            Add skill
          </Button>
        }
      />

      <Notice message={note} />

      {showForm && (
        <form className="skill-form" onSubmit={handleSubmit}>
          <h3>{editingSkill ? "Edit skill" : "Add a new skill"}</h3>

          <input
            name="name"
            placeholder="Skill name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select name="category" value={form.category} onChange={handleChange}>
            <option>Design</option>
            <option>Development</option>
            <option>Analytics</option>
            <option>Leadership</option>
          </select>

          <select name="level" value={form.level} onChange={handleChange}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <input
            name="progress"
            type="number"
            min="0"
            max="100"
            value={form.progress}
            onChange={handleChange}
            placeholder="Progress %"
          />

          <textarea
            name="description"
            placeholder="Short description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          <div>
            <Button type="submit">
              {editingSkill ? "Update skill" : "Save skill"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="toolbar">
        <label className="search">
          <Search />
          <input
            placeholder="Search your skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="select">
          <Filter />
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>All</option>
            <option>Design</option>
            <option>Development</option>
            <option>Analytics</option>
            <option>Leadership</option>
          </select>
        </label>
      </div>

      {loading ? (
        <Notice message="Loading skills..." />
      ) : (
        <section className="skill-grid">
          {list.length === 0 ? (
            <Notice message="No skills found. Add your first skill!" />
          ) : (
            list.map((s) => {
              const skillColor = s.color || "#6956e7";

              return (
                <article className="skill-card" key={s._id}>
                  <div className="card-top">
                    <span>{s.category}</span>

                    <Button className="more">
                      <MoreHorizontal />
                    </Button>
                  </div>

                  <i
                    className="orb"
                    style={{
                      color: skillColor,
                      background: `${skillColor}18`,
                    }}
                  >
                    <BookOpen />
                  </i>

                  <h3>{s.name}</h3>

                  <div className="level">
                    <b className={s.level?.toLowerCase()}>{s.level}</b>

                    <span>{s.progress}% complete</span>
                  </div>

                  <Progress value={s.progress} color={skillColor} />

                  <p>{s.description || "Keep learning and improving."}</p>

                  <footer>
                    <button onClick={() => openEditForm(s)}>
                      <Edit3 />
                      Edit
                    </button>

                    <button onClick={() => handleDelete(s._id)}>
                      <Trash2 />
                      Delete
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>
      )}
    </>
  );
}
