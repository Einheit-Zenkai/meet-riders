import { create } from "zustand";

export interface NotificationItem {
  id: string; // make it unique e.g. `live-start:${partyId}`
  message: string;
  timestamp: Date;
  read: boolean;
  href?: string; // optional navigation target
}

interface NotificationsState {
  notifications: NotificationItem[];
  add: (n: NotificationItem) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  has: (id: string) => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  add: (n) => set((state) => {
    if (state.notifications.some((x) => x.id === n.id)) return state; // de-dup
    return { notifications: [n, ...state.notifications] };
  }),
  markRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  has: (id) => get().notifications.some((n) => n.id === id),
}));
