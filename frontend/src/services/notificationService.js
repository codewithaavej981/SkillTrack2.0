/**
 * Notification Service for SkillTrack 2.0
 * Manages user notifications, persistent read states, and realistic seeded demo notifications.
 * Clearly differentiates demo system notifications from live workspace activity events.
 */

import { getAnalytics } from "./analyticsService";

const STORAGE_PREFIX = "skilltrack_notifications_state_v2";

// 4 realistic, clearly identified demo notifications per requirements
export const SEEDED_DEMO_NOTIFICATIONS = [
  {
    id: "demo-notif-welcome",
    isDemo: true,
    type: "welcome",
    category: "System",
    title: "Welcome to SkillTrack 2.0",
    message: "Your learning workspace is ready. Start by reviewing your skills and goals.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actionUrl: "/dashboard",
    read: false,
  },
  {
    id: "demo-notif-goal",
    isDemo: true,
    type: "goal",
    category: "Goals",
    title: "Goal progress update",
    message: "Your Java Developer goal is currently 74% complete.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    actionUrl: "/goals",
    read: false,
  },
  {
    id: "demo-notif-recommendation",
    isDemo: true,
    type: "recommendation",
    category: "AI Mentor",
    title: "Learning recommendation",
    message: "New resources are available to support your development skills.",
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
    actionUrl: "/assistant",
    read: false,
  },
  {
    id: "demo-notif-library",
    isDemo: true,
    type: "resource",
    category: "Library",
    title: "Learning library updated",
    message: "Your learning library contains your saved resources. Continue where you left off.",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // ~1 day ago
    actionUrl: "/learning",
    read: true, // Initially read to demonstrate mixed read/unread states
  },
];

const listeners = new Set();

const notifyListeners = (unreadCount) => {
  for (const listener of listeners) {
    try {
      listener(unreadCount);
    } catch (e) {
      console.error("Notification listener error:", e);
    }
  }
};

export const subscribeToNotifications = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const getStorageKey = (userId) => {
  const cleanId = userId ? String(userId) : "shared_workspace";
  return `${STORAGE_PREFIX}_${cleanId}`;
};

/**
 * Get read notification IDs map from localStorage
 */
const getStoredReadMap = (userId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save read notification IDs map to localStorage
 */
const saveStoredReadMap = (userId, readMap) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(readMap));
  } catch (e) {
    console.warn("Failed to persist notification state to localStorage:", e);
  }
};

/**
 * Fetch merged notifications (seeded demo notifications + live workspace events)
 * Idempotent: does not duplicate or reset on page reload.
 */
export const getNotifications = async (userId) => {
  const readMap = getStoredReadMap(userId);

  // 1. Process seeded demo notifications with persisted read states
  const demoItems = SEEDED_DEMO_NOTIFICATIONS.map((item) => {
    const isExplicitlyRead = readMap[item.id] !== undefined ? readMap[item.id] : item.read;
    return {
      ...item,
      read: isExplicitlyRead,
    };
  });

  // 2. Fetch live workspace events from analytics API if available
  let liveEvents = [];
  try {
    const res = await getAnalytics();
    const recent = res?.data?.recentActivities || [];
    liveEvents = recent.map((act) => {
      const actId = `event-${act.id || act._id || `${act.type}_${act.timestamp}`}`;
      const isRead = readMap[actId] === true;
      return {
        id: actId,
        isDemo: false,
        type: act.type || "activity",
        category: act.category || "Workspace",
        title: act.title || "Workspace Activity",
        message: act.action || "Activity updated",
        timestamp: act.timestamp || new Date().toISOString(),
        actionUrl: act.type === "goal" ? "/goals" : act.type === "skill" ? "/skills" : "/learning",
        read: isRead,
      };
    });
  } catch {
    // Graceful fallback to demo items if analytics service is unreached
  }

  // Combine and sort by timestamp descending
  const combined = [...liveEvents, ...demoItems].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const unreadCount = combined.filter((n) => !n.read).length;
  notifyListeners(unreadCount);

  return {
    notifications: combined,
    unreadCount,
  };
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = (notifId, userId) => {
  const readMap = getStoredReadMap(userId);
  readMap[notifId] = true;
  saveStoredReadMap(userId, readMap);
};

/**
 * Mark all given notifications as read
 */
export const markAllNotificationsAsRead = (notifications, userId) => {
  const readMap = getStoredReadMap(userId);
  for (const notif of notifications) {
    readMap[notif.id] = true;
  }
  saveStoredReadMap(userId, readMap);
  notifyListeners(0);
};

/**
 * Get current unread count synchronously from stored state
 */
export const getCachedUnreadCount = (userId) => {
  const readMap = getStoredReadMap(userId);
  let unread = 0;
  for (const item of SEEDED_DEMO_NOTIFICATIONS) {
    const isRead = readMap[item.id] !== undefined ? readMap[item.id] : item.read;
    if (!isRead) unread++;
  }
  return unread;
};
