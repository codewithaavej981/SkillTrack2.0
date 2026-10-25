import { useState, useEffect, useMemo } from "react";
import PageHead from "../components/PageHead";
import Button from "../components/Button";
import Progress from "../components/Progress";
import Notice from "../components/Notice";
import {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
  deleteLearningResource,
} from "../services/learningService";
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search,
  Check,
  ExternalLink,
  Edit3,
  Trash2,
  RotateCcw,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Development",
  "Design",
  "Analytics",
  "Leadership",
  "AI / ML",
  "Cybersecurity",
  "Other",
];

const FORM_CATEGORIES = [
  "Development",
  "Design",
  "Analytics",
  "Leadership",
  "AI / ML",
  "Cybersecurity",
  "Other",
];

const CATEGORY_COLORS = {
  Development: "#6956e7",
  Design: "#24a47f",
  Analytics: "#ef8b45",
  Leadership: "#d6547d",
  "AI / ML": "#8b5cf6",
  Cybersecurity: "#0ea5e9",
  Other: "#64748b",
};

const getCategoryArtClass = (category) => {
  switch (category) {
    case "Design":
      return "green";
    case "Analytics":
      return "orange";
    case "Leadership":
      return "rose";
    case "AI / ML":
      return "violet";
    case "Cybersecurity":
      return "cyan";
    case "Other":
      return "slate";
    default:
      return "purple";
  }
};

const sanitizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function Learning() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resumingId, setResumingId] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState({
    title: "",
    source: "",
    category: "Development",
    url: "",
    progress: 0,
    completed: false,
  });

  // Notice auto-clear
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLearningResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load learning resources:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load learning resources. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Real data calculations
  const totalCount = resources.length;
  const completedCount = resources.filter(
    (r) => r.completed || Number(r.progress || 0) >= 100
  ).length;
  const inProgressCount = resources.filter((r) => {
    const p = Number(r.progress || 0);
    return !r.completed && p > 0 && p < 100;
  }).length;
  const avgProgress = totalCount
    ? Math.round(
        resources.reduce((acc, r) => acc + Number(r.progress || 0), 0) /
          totalCount
      )
    : 0;

  // Active / continue resource
  const continueResource = useMemo(() => {
    const inProgressList = resources.filter((r) => {
      const p = Number(r.progress || 0);
      return !r.completed && p > 0 && p < 100;
    });

    if (inProgressList.length > 0) {
      return [...inProgressList].sort((a, b) => {
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        return timeB - timeA;
      })[0];
    }

    return (
      resources.find((r) => !r.completed && Number(r.progress || 0) === 0) ||
      null
    );
  }, [resources]);

  // Filtered and sorted resources
  const filteredAndSortedResources = useMemo(() => {
    const result = resources.filter((resource) => {
      // Category filter
      if (categoryFilter !== "All" && resource.category !== categoryFilter) {
        return false;
      }

      // Status filter
      const progress = Number(resource.progress || 0);
      const isCompleted = Boolean(resource.completed || progress >= 100);

      if (statusFilter === "in-progress" && (isCompleted || progress === 0)) {
        return false;
      }
      if (statusFilter === "completed" && !isCompleted) {
        return false;
      }
      if (statusFilter === "not-started" && (isCompleted || progress > 0)) {
        return false;
      }

      // Search query (title and source)
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const titleMatch = (resource.title || "").toLowerCase().includes(query);
        const sourceMatch = (resource.source || "").toLowerCase().includes(query);
        const categoryMatch = (resource.category || "").toLowerCase().includes(query);
        if (!titleMatch && !sourceMatch && !categoryMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "progress-desc") {
        return Number(b.progress || 0) - Number(a.progress || 0);
      }
      if (sortBy === "progress-asc") {
        return Number(a.progress || 0) - Number(b.progress || 0);
      }
      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      // default: recently updated or created
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return result;
  }, [resources, categoryFilter, statusFilter, search, sortBy]);

  // Form handling
  const openAddForm = () => {
    setEditingResource(null);
    setForm({
      title: "",
      source: "",
      category: "Development",
      url: "",
      progress: 0,
      completed: false,
    });
    setShowForm(true);
    setNotice("");
    setError("");
  };

  const openEditForm = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title || "",
      source: resource.source || "",
      category: resource.category || "Development",
      url: resource.url || "",
      progress: Number(resource.progress || 0),
      completed: Boolean(
        resource.completed || Number(resource.progress || 0) >= 100
      ),
    });
    setShowForm(true);
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
        progress: checked ? 100 : prev.progress === 100 ? 50 : prev.progress,
      }));
    } else if (name === "progress") {
      const num = Math.min(100, Math.max(0, Number(value) || 0));
      setForm((prev) => ({
        ...prev,
        progress: num,
        completed:
          num >= 100 ? true : prev.completed && num < 100 ? false : prev.completed,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.title.trim() || !form.source.trim()) {
      setError("Please provide both a resource title and source.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        source: form.source.trim(),
        category: form.category,
        url: form.url.trim(),
        progress: Number(form.progress || 0),
        completed: Boolean(
          form.completed || Number(form.progress || 0) >= 100
        ),
      };

      if (editingResource) {
        const updated = await updateLearningResource(
          editingResource._id,
          payload
        );
        setResources((prev) =>
          prev.map((r) => (r._id === updated._id ? updated : r))
        );
        setNotice(`"${updated.title}" updated successfully.`);
      } else {
        const created = await createLearningResource(payload);
        setResources((prev) => [created, ...prev]);
        setNotice(`"${created.title}" added to your library.`);
      }

      closeForm();
    } catch (err) {
      console.error("Failed to save resource:", err);
      setError(
        err.response?.data?.message || "Failed to save learning resource."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Quick actions
  const handleResume = async (resource) => {
    if (!resource?._id || resumingId) return;

    try {
      setResumingId(resource._id);
      setError("");

      const current = Number(resource.progress || 0);
      // Advance progress: if not started (0%), start at 25%; if in progress, advance by 25% up to 100%
      const nextProgress = current === 0 ? 25 : Math.min(100, current + 25);
      const isDone = nextProgress >= 100;

      const updated = await updateLearningResource(resource._id, {
        progress: nextProgress,
        completed: isDone,
      });

      // Update state immediately so progress bar and cards update
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );

      const safeUrl = sanitizeUrl(resource.url);
      if (safeUrl) {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
        setNotice(
          isDone
            ? `Completed "${resource.title}"! 🎉 Link opened in a new tab.`
            : `Resumed "${resource.title}" — progress updated to ${nextProgress}%. Link opened in a new tab.`
        );
      } else {
        setNotice(
          isDone
            ? `Completed "${resource.title}"! 🎉 (Note: No external URL configured for this resource)`
            : `Resumed "${resource.title}" — progress updated to ${nextProgress}%. (Note: No external link configured; edit resource to add one)`
        );
      }
    } catch (err) {
      console.error("Failed to resume learning:", err);
      setError(
        err.response?.data?.message || "Failed to update learning progress."
      );
    } finally {
      setResumingId(null);
    }
  };

  const handleStartLearning = async (resource) => {
    try {
      setError("");
      const current = Number(resource.progress || 0);
      const nextProgress = current === 0 ? 25 : Math.min(100, current + 25);
      const isDone = nextProgress >= 100;

      const updated = await updateLearningResource(resource._id, {
        progress: nextProgress,
        completed: isDone,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );

      const safeUrl = sanitizeUrl(resource.url);
      if (safeUrl) {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
        setNotice(`Started "${resource.title}" (25% progress). Link opened in a new tab.`);
      } else {
        setNotice(
          `Started "${resource.title}" (25% progress). (Note: No external URL configured for this resource)`
        );
      }
    } catch (err) {
      console.error("Failed to start learning:", err);
      setError(
        err.response?.data?.message || "Failed to update learning progress."
      );
    }
  };

  const handleStepProgress = async (resource, increment = 25) => {
    try {
      setError("");
      const current = Number(resource.progress || 0);
      const next = Math.min(100, current + increment);
      const isDone = next >= 100;
      const updated = await updateLearningResource(resource._id, {
        progress: next,
        completed: isDone,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      setNotice(
        isDone
          ? `Completed "${resource.title}"! 🎉`
          : `Updated "${resource.title}" to ${next}%.`
      );
    } catch (err) {
      console.error("Failed to step progress:", err);
      setError("Failed to update progress.");
    }
  };

  const handleComplete = async (resource) => {
    try {
      setError("");
      const updated = await updateLearningResource(resource._id, {
        progress: 100,
        completed: true,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      setNotice(`Marked "${resource.title}" as complete! 🎉`);
    } catch (err) {
      console.error("Failed to complete resource:", err);
      setError("Failed to complete resource.");
    }
  };

  const handleReopen = async (resource) => {
    try {
      setError("");
      const updated = await updateLearningResource(resource._id, {
        progress: 50,
        completed: false,
      });
      setResources((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      setNotice(`Reopened "${resource.title}" for review.`);
    } catch (err) {
      console.error("Failed to reopen resource:", err);
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.title}"?`
    );
    if (!confirmed) return;

    try {
      setError("");
      await deleteLearningResource(resource._id);
      setResources((prev) => prev.filter((r) => r._id !== resource._id));
      setNotice(`Deleted "${resource.title}".`);
      if (editingResource?._id === resource._id) {
        closeForm();
      }
    } catch (err) {
      console.error("Failed to delete resource:", err);
      setError(
        err.response?.data?.message || "Failed to delete learning resource."
      );
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStatusFilter("all");
    setSortBy("recent");
  };

  return (
    <>
      <PageHead
        label="LEARNING LIBRARY"
        title="Keep your curiosity moving."
        text="Curated resources to support the skills and milestones you’re building."
        action={
          <Button className="btn-add" onClick={openAddForm}>
            <Plus size={16} />
            Add resource
          </Button>
        }
      />

      <Notice message={notice || error} />

      {error && !loading && (
        <article
          className="card"
          style={{ padding: "24px", textAlign: "center", marginBottom: "18px" }}
        >
          <p style={{ color: "var(--danger, #e5484d)", marginBottom: "14px" }}>
            {error}
          </p>
          <Button
            type="button"
            onClick={loadResources}
            style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
          >
            <RefreshCw size={14} /> Retry
          </Button>
        </article>
      )}

      {showForm && (
        <form className="card learning-form" onSubmit={handleSubmitForm}>
          <h3>
            {editingResource
              ? `Edit: ${editingResource.title}`
              : "Add learning resource"}
          </h3>

          <input
            name="title"
            placeholder="Resource title (e.g., Complete React & Node Guide)"
            value={form.title}
            onChange={handleFormChange}
            required
            autoFocus
          />

          <input
            name="source"
            placeholder="Source (e.g., Coursera, Udemy, YouTube, Book)"
            value={form.source}
            onChange={handleFormChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleFormChange}
          >
            {FORM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            name="url"
            type="url"
            placeholder="Resource URL (e.g., https://coursera.org/...)"
            value={form.url}
            onChange={handleFormChange}
          />

          <label className="progress-slider-label">
            <span>
              Progress: <b>{form.progress}%</b>
            </span>
            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              value={form.progress}
              onChange={handleFormChange}
            />
          </label>

          <label className="goal-check learning-check">
            <input
              type="checkbox"
              name="completed"
              checked={form.completed}
              onChange={handleFormChange}
            />
            <span>Mark as completed</span>
          </label>

          <div>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingResource
                ? "Update resource"
                : "Save resource"}
            </Button>

            <Button type="button" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Real Data KPI Metric Strip */}
      <div className="goal-stats learning-stats">
        <div>
          <b>{totalCount}</b>
          <span>Total resources</span>
        </div>
        <div>
          <b>{inProgressCount}</b>
          <span>In progress</span>
        </div>
        <div>
          <b>{completedCount}</b>
          <span>Completed</span>
        </div>
        <div>
          <b>{avgProgress}%</b>
          <span>Average progress</span>
        </div>
      </div>

      {loading ? (
        <article className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading your learning library...</p>
        </article>
      ) : (
        <>
          {/* Continue Learning Banner */}
          {continueResource && (
            <section className="continue">
              <span>
                <BookOpen />
              </span>

              <div>
                <p className="eyebrow">CONTINUE LEARNING</p>
                <h2>{continueResource.title}</h2>
                <p>
                  {continueResource.source} · {continueResource.category}
                </p>

                <Progress
                  value={Number(continueResource.progress || 0)}
                  color={
                    CATEGORY_COLORS[continueResource.category] || "#6956e7"
                  }
                />
              </div>

              <div className="continue-actions">
                <button
                  type="button"
                  className="btn-resume button"
                  onClick={() => handleResume(continueResource)}
                  disabled={resumingId === continueResource._id}
                  title="Update progress and resume learning"
                >
                  {resumingId === continueResource._id ? (
                    "Resuming..."
                  ) : (
                    <>
                      Resume <ChevronRight size={15} />
                    </>
                  )}
                </button>
                {sanitizeUrl(continueResource.url) ? (
                  <a
                    href={sanitizeUrl(continueResource.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-continue-link"
                    title="Open in new tab"
                  >
                    Open link <ExternalLink size={13} />
                  </a>
                ) : null}
              </div>
            </section>
          )}

          {/* Search, Filter & Sort Toolbar */}
          <div className="toolbar learning-tools">
            <div className="learning-toolbar-top">
              <label className="search">
                <Search size={16} />
                <input
                  placeholder="Search by title, source, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearch("")}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <div className="select">
                <Filter size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by completion status"
                >
                  <option value="all">All Status</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="not-started">Not Started</option>
                </select>
              </div>

              <div className="select">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort resources"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="progress-desc">Progress: High to Low</option>
                  <option value="progress-asc">Progress: Low to High</option>
                  <option value="title-asc">Title: A to Z</option>
                </select>
              </div>
            </div>

            <div className="learning-pills-row">
              <div className="pills">
                {CATEGORIES.map((category) => (
                  <button
                    type="button"
                    className={categoryFilter === category ? "on" : ""}
                    onClick={() => setCategoryFilter(category)}
                    key={category}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <span className="results-count">
                Showing {filteredAndSortedResources.length} of {totalCount}{" "}
                {totalCount === 1 ? "resource" : "resources"}
              </span>
            </div>
          </div>

          {/* Resources Grid or Empty States */}
          {totalCount === 0 ? (
            <article className="card learning-empty-card">
              <div className="learning-empty-icon">
                <BookOpen />
              </div>
              <h3>Your learning library is empty</h3>
              <p>
                Curate courses, documentation, articles, and books to accelerate
                your skill growth and milestone achievements.
              </p>
              <Button onClick={openAddForm} style={{ marginTop: "8px" }}>
                <Plus size={16} /> Add your first resource
              </Button>
            </article>
          ) : filteredAndSortedResources.length === 0 ? (
            <article className="card learning-empty-card">
              <div className="learning-empty-icon">
                <Search />
              </div>
              <h3>No matching learning resources</h3>
              <p>
                No items match your active search &ldquo;{search}&rdquo; and
                filters. Try adjusting your search keywords or resetting your
                filters.
              </p>
              <Button
                variant="secondary"
                onClick={handleResetFilters}
                style={{ marginTop: "8px" }}
              >
                Reset search &amp; filters
              </Button>
            </article>
          ) : (
            <section className="resource-grid">
              {filteredAndSortedResources.map((resource) => {
                const progress = Number(resource.progress || 0);
                const isComplete = Boolean(
                  resource.completed || progress >= 100
                );
                const safeUrl = sanitizeUrl(resource.url);
                const artClass = getCategoryArtClass(resource.category);
                const categoryColor =
                  CATEGORY_COLORS[resource.category] || "#6956e7";

                return (
                  <article className="resource card" key={resource._id}>
                    <div className={`resource-art ${artClass}`}>
                      <div className="resource-art-top">
                        <span className="category-pill">
                          {resource.category || "General"}
                        </span>

                        <div className="resource-actions">
                          {safeUrl && (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open resource link safely in new tab"
                              className="art-action-btn"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => openEditForm(resource)}
                            title="Edit resource"
                            className="art-action-btn"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(resource)}
                            title="Delete resource"
                            className="art-action-btn delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="resource-art-bottom">
                        <BookOpen />
                        <span>{resource.source}</span>
                      </div>
                    </div>

                    <div className="resource-body">
                      <div className="resource-meta">
                        <span
                          className="resource-source"
                          title={resource.source}
                        >
                          {resource.source}
                        </span>

                        {isComplete ? (
                          <span className="status-badge completed">
                            <Check size={11} /> Completed
                          </span>
                        ) : progress > 0 ? (
                          <span className="status-badge in-progress">
                            {progress}%
                          </span>
                        ) : (
                          <span className="status-badge not-started">
                            Not started
                          </span>
                        )}
                      </div>

                      <h3 title={resource.title}>{resource.title}</h3>

                      <div className="resource-progress-section">
                        <div className="progress-labels">
                          <span>Progress</span>
                          <b>{progress}%</b>
                        </div>
                        <Progress value={progress} color={categoryColor} />
                      </div>

                      <div className="resource-footer">
                        {progress === 0 && !isComplete ? (
                          <Button
                            type="button"
                            className="btn-start"
                            onClick={() => handleStartLearning(resource)}
                          >
                            Start learning <ChevronRight size={14} />
                          </Button>
                        ) : !isComplete ? (
                          <div className="progress-action-group">
                            <button
                              type="button"
                              className="btn-step"
                              onClick={() => handleStepProgress(resource, 25)}
                              title="Add 25% progress"
                            >
                              +25%
                            </button>

                            <button
                              type="button"
                              className="btn-complete"
                              onClick={() => handleComplete(resource)}
                            >
                              <Check size={13} /> Complete
                            </button>
                          </div>
                        ) : (
                          <div className="completed-action-group">
                            <button
                              type="button"
                              className="btn-reopen"
                              onClick={() => handleReopen(resource)}
                              title="Reset progress to 50%"
                            >
                              <RotateCcw size={12} /> Reset
                            </button>

                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-visit"
                              >
                                Visit <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </>
  );
}
