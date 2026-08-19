"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
  type NotificationRow,
} from "@/lib/actions/notifications";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getUnreadNotificationCount().then(setUnread).catch(() => {});
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      getMyNotifications().then(setNotifications).catch(() => {});
      if (unread > 0) {
        startTransition(async () => {
          await markNotificationsRead();
          setUnread(0);
        });
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
