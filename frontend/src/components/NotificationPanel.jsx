import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  BookOpen,
  Target,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { getAnalytics } from "../services/analyticsService";

const STORAGE_KEY = "skilltrack_last_read_notif";

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Recently";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function NotificationPanel({ onClose, onUnreadChange }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastReadTime, setLastReadTime] = useState(() => {
    return Number(localStorage.getItem(STORAGE_KEY) || 0);
  });
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Load real workspace activities from backend
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await getAnalytics();
        if (!isMounted) return;

        const realActivities = res?.data?.recentActivities || [];
        setActivities(realActivities);

        const currentLastRead = Number(
          localStorage.getItem(STORAGE_KEY) || 0
        );
        const unreadCount = realActivities.filter((act) => {
          const t = new Date(act.timestamp || 0).getTime();
          return t > currentLastRead;
        }).length;

        if (onUnreadChange) {
          onUnreadChange(unreadCount > 0);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [onUnreadChange]);

  // Click outside and Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Use mousedown with timeout to avoid closing immediately on trigger click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const markAllAsRead = () => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setLastReadTime(now);
    if (onUnreadChange) {
      onUnreadChange(false);
    }
  };

  const handleItemClick = (activity) => {
    onClose();
    if (activity.type === "goal") {
      navigate("/goals");
    } else if (activity.type === "skill") {
      navigate("/skills");
    } else if (activity.type === "resource") {
      navigate("/learning");
    } else {
      navigate("/dashboard");
    }
  };

  const unreadCount = activities.filter((act) => {
    const t = new Date(act.timestamp || 0).getTime();
    return t > lastReadTime;
  }).length;

  const getActivityIcon = (type, action) => {
    if (type === "goal") {
      return action?.toLowerCase().includes("completed") ? (
        <CheckCircle2 size={16} />
      ) : (
        <Target size={16} />
      );
    }
    if (type === "skill") {
      return <Sparkles size={16} />;
    }
    return <BookOpen size={16} />;
  };

  return (
    <div
      className="notif-panel"
      ref={panelRef}
      role="dialog"
      aria-label="Notifications panel"
      tabIndex={-1}
    >
      <div className="notif-header">
        <h3>
          <Bell size={16} /> Notifications
          {unreadCount > 0 && (
            <span className="notif-count-pill">{unreadCount} new</span>
          )}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-mark-btn"
              onClick={markAllAsRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={14} style={{ marginRight: "4px" }} />
              Mark read
            </button>
          )}

          <button
            type="button"
            className="notif-close-btn"
            onClick={onClose}
            aria-label="Close notification panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="notif-list">
        {loading ? (
          <div className="notif-empty">
            <p style={{ color: "var(--text-muted)" }}>Checking for updates...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <CheckCircle2 size={22} />
            </div>
            <h4>All caught up!</h4>
            <p>
              No new alerts right now. As you update skills, complete goals, and
              build milestones, your activity updates will appear here.
            </p>
          </div>
        ) : (
          activities.map((act) => {
            const isUnread =
              new Date(act.timestamp || 0).getTime() > lastReadTime;
            return (
              <div
                key={act.id}
                className={`notif-item ${isUnread ? "unread" : ""}`}
                onClick={() => handleItemClick(act)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick(act);
                  }
                }}
              >
                <div className={`notif-icon ${act.type}`}>
                  {getActivityIcon(act.type, act.action)}
                </div>

                <div className="notif-content">
                  <div className="notif-title" title={act.title}>
                    {act.title}
                  </div>
                  <div className="notif-desc">{act.action}</div>
                  <div className="notif-time">
                    {formatRelativeTime(act.timestamp)} · {act.category}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="notif-footer">
        <span>Workspace Activity Feed</span>
        <span>MongoDB Atlas</span>
      </div>
    </div>
  );
}
