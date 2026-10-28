import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LockKeyhole,
  LogOut,
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

const getUserInitials = (name) => {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const compressImage = (file, maxDim = 256, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function Profile() {
  const { user, setUser, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
  });

  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      location: user.location || "",
    });
    setPhoto(user.avatar || null);
  }, [user]);

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const compressedData = await compressImage(file, 256, 0.85);

      const response = await api.put("/auth/profile", {
        avatar: compressedData,
      });

      const updatedUser = response.data?.user;
      if (!updatedUser || !updatedUser.avatar) {
        throw new Error("Server failed to persist avatar.");
      }

      setPhoto(updatedUser.avatar);
      if (setUser) setUser(updatedUser);
      await refreshUser();
      setMessage("Profile photo updated successfully.");
    } catch (error) {
      console.error("Failed to update profile photo:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile photo."
      );
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("/auth/profile", {
        avatar: "",
      });

      const updatedUser = response.data?.user;
      setPhoto(null);
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
      await refreshUser();
      setMessage("Profile photo removed.");
    } catch (error) {
      console.error("Failed to remove profile photo:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove profile photo."
      );
    } finally {
      setSaving(false);
    }
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
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        location: form.location,
      };
      if (photo !== null) {
        payload.avatar = photo;
      }

      const response = await api.put("/auth/profile", payload);
      const updatedUser = response.data?.user;
      if (updatedUser) {
        if (setUser) setUser(updatedUser);
        if (typeof updatedUser.avatar !== "undefined") {
          setPhoto(updatedUser.avatar || null);
        }
      }
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update profile."
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
            <button
              type="button"
              className="profile-banner-action"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
            >
              <UserRound size={13} aria-hidden="true" />
              <span>Change photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-circle">
              {photo ? (
                <img
                  src={photo}
                  alt={form.name || "Profile"}
                  className="profile-photo"
                />
              ) : (
                <i className="profile-avatar-initials" aria-hidden="true">
                  {getUserInitials(form.name || user?.name)}
                </i>
              )}
            </div>

            {photo && (
              <button
                type="button"
                className="profile-remove-photo-btn"
                onClick={handleRemovePhoto}
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="profile-details-head">
            <h2>{form.name || "User"}</h2>

            <p className="profile-role-line">
              {form.role || "Add your role"}
              {form.location && ` · ${form.location}`}
            </p>
          </div>

          <div className="profile-meta-block">
            <span>
              <Mail size={15} aria-hidden="true" />
              {form.email || "No email"}
            </span>

            <span>
              <UserRound size={15} aria-hidden="true" />
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "recently"}
            </span>
          </div>

          <div className="profile-card-footer">
            <button
              type="button"
              className="profile-logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={14} aria-hidden="true" />
              <span>Log out</span>
            </button>
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
            <button type="button">
              <span>
                <ShieldCheck />
                Privacy and data
              </span>
              <ChevronRight />
            </button>

            <button type="button">
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
