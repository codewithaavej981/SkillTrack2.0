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
  Check,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

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

export default function NotificationPanel({ onClose, onUnreadCountChange }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const loadNotificationsData = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(user?._id);
      setNotifications(res.notifications || []);
      if (onUnreadCountChange) {
        onUnreadCountChange(res.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificationsData();
  }, [user?._id]);

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
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications, user?._id);
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (onUnreadCountChange) {
      onUnreadCountChange(0);
    }
  };

  const handleMarkSingleRead = (e, notif) => {
    e.stopPropagation();
    markNotificationAsRead(notif.id, user?._id);
    const updated = notifications.map((n) =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    const newUnread = updated.filter((n) => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(newUnread);
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id, user?._id);
      const updated = notifications.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      const newUnread = updated.filter((n) => !n.read).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnread);
      }
    }
    onClose();
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getActivityIcon = (type) => {
    switch (type) {
      case "welcome":
        return <Info size={16} />;
      case "goal":
        return <Target size={16} />;
      case "recommendation":
        return <Sparkles size={16} />;
      case "resource":
        return <BookOpen size={16} />;
      default:
        return <CheckCircle2 size={16} />;
    }
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
          <Bell size={16} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-count-pill">{unreadCount} new</span>
          )}
        </h3>

        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-mark-btn"
              onClick={handleMarkAllRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
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
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <CheckCircle2 size={24} />
            </div>
            <h4>All caught up!</h4>
            <p>
              No new alerts right now. As you update skills, complete goals, and
              build milestones, your activity updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.read ? "read" : "unread"}`}
              onClick={() => handleItemClick(notif)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(notif);
                }
              }}
            >
              <div className={`notif-icon ${notif.type}`}>
                {getActivityIcon(notif.type)}
              </div>

              <div className="notif-content">
                <div className="notif-top-row">
                  <div className="notif-title" title={notif.title}>
                    {notif.title}
                  </div>
                  {notif.isDemo && (
                    <span className="notif-demo-badge">Demo</span>
                  )}
                </div>

                <div className="notif-desc">{notif.message}</div>

                <div className="notif-footer-meta">
                  <span className="notif-time">
                    {formatRelativeTime(notif.timestamp)} · {notif.category}
                  </span>

                  {!notif.read && (
                    <button
                      type="button"
                      className="notif-item-mark-btn"
                      onClick={(e) => handleMarkSingleRead(e, notif)}
                      title="Mark as read"
                    >
                      <Check size={12} />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="notif-footer">
        <span>Workspace Activity Feed</span>
        <span>Local &amp; MongoDB Sync</span>
      </div>
    </div>
  );
}
