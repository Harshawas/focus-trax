const STORAGE_KEY = "focusTraxNotifications";
const EVENT_NAME = "focustrax-notifications-updated";

function readNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read notifications:", error);
    return [];
  }
}

function emitNotificationUpdate(detail = {}) {
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: {
        ts: Date.now(),
        ...detail,
      },
    })
  );
}

function writeNotifications(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitNotificationUpdate({ count: items.length });
  } catch (error) {
    console.error("Failed to write notifications:", error);
  }
}

export function getNotifications() {
  return readNotifications();
}

export function addNotification({ title, message, type = "info" }) {
  const items = readNotifications();

  const newItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...items].slice(0, 30);
  writeNotifications(updated);

  console.log("Notification added:", newItem);
  return newItem;
}

export function forceRefreshNotifications() {
  emitNotificationUpdate({ forced: true });
}

export function markAllNotificationsRead() {
  const items = readNotifications().map((item) => ({
    ...item,
    read: true,
  }));
  writeNotifications(items);
}

export function clearNotifications() {
  writeNotifications([]);
}

export function getUnreadNotificationCount() {
  return readNotifications().filter((item) => !item.read).length;
}

export function formatNotificationTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString();
}

export const NOTIFICATION_EVENT_NAME = EVENT_NAME;