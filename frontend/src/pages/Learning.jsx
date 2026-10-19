import { useState, useEffect } from "react";
import PageHead from "../components/PageHead";
import Button from "../components/Button";
import Progress from "../components/Progress";
import Notice from "../components/Notice";
import {
  getLearningResources,
  createLearningResource,
  updateLearningResource,
} from "../services/learningService";
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search,
  Check,
} from "lucide-react";

export default function Learning() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setError("");

        const data = await getLearningResources();
        setResources(data || []);
      } catch (err) {
        console.error("Failed to load learning resources:", err);
        setError("Failed to load learning resources.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const list = resources.filter((resource) => {
    const matchesFilter =
      filter === "All" || resource.category === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      resource.title?.toLowerCase().includes(searchText) ||
      resource.source?.toLowerCase().includes(searchText) ||
      resource.category?.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  // First resource that is not completed
  const continueResource = resources.find(
    (resource) => Number(resource.progress || 0) < 100
  );

  const updateResourceInState = (updated) => {
    setResources((prev) =>
      prev.map((item) =>
        item._id === updated._id ? updated : item
      )
    );
  };

  const handleStartLearning = async (resource) => {
    try {
      setError("");

      // Don't reset existing progress
      const currentProgress = Number(resource.progress || 0);

      const updated = await updateLearningResource(resource._id, {
        progress: currentProgress > 0 ? currentProgress : 10,
        completed: false,
      });

      updateResourceInState(updated);
    } catch (err) {
      console.error("Failed to update learning progress:", err);
      setError("Failed to update learning progress.");
    }
  };

  const handleComplete = async (resource) => {
    try {
      setError("");

      const updated = await updateLearningResource(resource._id, {
        progress: 100,
        completed: true,
      });

      updateResourceInState(updated);
    } catch (err) {
      console.error("Failed to complete resource:", err);
      setError("Failed to complete resource.");
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setError("");

      const newResource = await createLearningResource({
        title: formData.get("title"),
        source: formData.get("source"),
        category: formData.get("category"),
        url: formData.get("url"),
      });

      setResources((prev) => [newResource, ...prev]);

      form.reset();
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create resource:", err);
      setError("Failed to create learning resource.");
    }
  };

  return (
    <>
      <PageHead
        label="LEARNING LIBRARY"
        title="Keep your curiosity moving."
        text="Curated resources to support the skills you’re building."
      />

      <Button className="btn-add" onClick={() => setShowForm((prev) => !prev)}>
        <Plus />
        {showForm ? "Close" : "Add resource"}
      </Button>

      {error && (
        <Notice message={error} />
      )}

      {showForm && (
        <form
          className="card learning-form"
          onSubmit={handleCreateResource}
        >
          <h3>Add learning resource</h3>

          <input
            name="title"
            placeholder="Resource title"
            required
          />

          <input
            name="source"
            placeholder="Source (YouTube, Udemy, etc.)"
            required
          />

          <select
            name="category"
            defaultValue="Development"
          >
            <option>Design</option>
            <option>Development</option>
            <option>Analytics</option>
            <option>Leadership</option>
          </select>

          <input
            name="url"
            type="url"
            placeholder="https://example.com"
          />

          <div>
            <Button type="submit">
              Add resource
            </Button>

            <Button
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading learning resources...</p>
      ) : (
        <>
          {continueResource && (
            <section className="continue">
              <span>
                <BookOpen />
              </span>

              <div>
                <p className="eyebrow">CONTINUE LEARNING</p>

                <h2>{continueResource.title}</h2>

                <p>{continueResource.source}</p>

                <Progress
                  value={Number(continueResource.progress || 0)}
                />
              </div>

              <Button
                onClick={() =>
                  handleStartLearning(continueResource)
                }
              >
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
              {[
                "All",
                "Design",
                "Development",
                "Analytics",
                "Leadership",
              ].map((category) => (
                <button
                  type="button"
                  className={filter === category ? "on" : ""}
                  onClick={() => setFilter(category)}
                  key={category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <section className="resource-grid">
            {list.length > 0 ? (
              list.map((resource) => {
                const progress = Number(
                  resource.progress || 0
                );

                return (
                  <article
                    className="resource"
                    key={resource._id}
                  >
                    <div className="resource-art">
                      <BookOpen />

                      <span>
                        {resource.category}
                      </span>
                    </div>

                    <div>
                      <small>
                        {resource.source}
                      </small>

                      <h3>{resource.title}</h3>

                      {progress > 0 && (
                        <>
                          <Progress value={progress} />

                          <small>
                            {progress}% complete
                          </small>
                        </>
                      )}

                      {progress === 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStartLearning(resource)
                          }
                        >
                          Start learning <ChevronRight />
                        </button>
                      )}

                      {progress > 0 && progress < 100 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleComplete(resource)
                          }
                        >
                          Mark complete <Check />
                        </button>
                      )}

                      {resource.completed && (
                        <small>✓ Completed</small>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <p>No learning resources found.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
