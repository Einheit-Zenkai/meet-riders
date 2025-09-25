"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NotificationsDropdownProps {
  notifications?: Array<{
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

export default function NotificationsDropdown({ notifications = [] }: NotificationsDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full border hover:bg-accent relative"
        title="Notifications"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-card shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent/50 ${!notification.read ? 'bg-accent/20' : ''}`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
