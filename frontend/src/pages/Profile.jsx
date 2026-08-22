import { useRef, useState } from "react";
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

export default function Profile() {
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhoto(URL.createObjectURL(file));
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
              <img src={photo} alt="Profile" className="profile-photo" />
            ) : (
              <i>MC</i>
            )}

            <Button onClick={() => fileInputRef.current?.click()}>
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

          <h2>Maria Chen</h2>
          <p>Product designer · San Francisco</p>

          <div>
            <span>
              <Mail />
              maria.chen@example.com
            </span>

            <span>
              <UserRound />
              Member since March 2024
            </span>
          </div>
        </article>

        <div className="settings">
          <article className="card">
            <CardHead
              title="Personal information"
              text="Update the details shown in your workspace"
            />

            <div className="inputs">
              {[
                ["Full name", "Maria Chen"],
                ["Email address", "maria.chen@example.com"],
                ["Role", "Product designer"],
                ["Location", "San Francisco, CA"],
              ].map(([label, value]) => (
                <label key={label}>
                  {label}
                  <input defaultValue={value} />
                </label>
              ))}
            </div>

            <Button>Save changes</Button>
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