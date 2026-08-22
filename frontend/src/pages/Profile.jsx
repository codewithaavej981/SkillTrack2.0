import { useRef, useState, useEffect } from "react";
import {
  ChevronRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Button from "../components/Button";
import PageHead from "../components/PageHead";
import CardHead from "../components/CardHead";
import Notice from "../components/Notice";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      location: user.location || "",
    });
  }, [user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhoto(URL.createObjectURL(file));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.put("/auth/profile", form);

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead
        label="ACCOUNT"
        title="Your profile"
        text="Manage your personal details and workspace preferences."
      />

      <section className="profile-layout">
        <article className="card profile">
          <div className="profile-banner">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="profile-photo"
              />
            ) : (
              <i>
                {form.name
                  ? form.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "U"}
              </i>
            )}

            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <UserRound />
              Change photo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          <h2>{form.name || "User"}</h2>

          <p>
            {form.role || "Add your role"}
            {form.location && ` · ${form.location}`}
          </p>

          <div>
            <span>
              <Mail />
              {form.email || "No email"}
            </span>

            <span>
              <UserRound />
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    },
                  )
                : "recently"}
            </span>
          </div>
        </article>

        <div className="settings">
          <article className="card">
            <CardHead
              title="Personal information"
              text="Update the details shown in your workspace"
            />

            <form onSubmit={handleSave}>
              <div className="inputs">
                <label>
                  Full name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Role
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Solapur, Maharashtra"
                  />
                </label>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>

              {message && <Notice message={message} />}
            </form>
          </article>

          <article className="card">
            <CardHead
              title="Notifications"
              text="Stay informed without adding noise"
            />

            {[
              "Weekly progress summary",
              "Goal deadline reminders",
              "Learning recommendations",
            ].map((item, index) => (
              <label className="toggle" key={item}>
                <span>
                  {item}

                  <small>
                    {index === 0
                      ? "A digest every Monday"
                      : "Only when it’s useful"}
                  </small>
                </span>

                <input
                  type="checkbox"
                  defaultChecked={index !== 2}
                />
              </label>
            ))}
          </article>

          <article className="card links">
            <button>
              <span>
                <ShieldCheck />
                Privacy and data
              </span>
              <ChevronRight />
            </button>

            <button>
              <span>
                <LockKeyhole />
                Password and security
              </span>
              <ChevronRight />
            </button>
          </article>
        </div>
      </section>
    </>
  );
}