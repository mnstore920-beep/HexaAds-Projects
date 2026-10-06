"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  CheckCheck,
  Shield,
  Clock
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'alert';
}

const initialNotifications: NotificationItem[] = [
  
];

export default function HeaderUserMenu() {
  const { data: session } = useSession();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const displayName =
    session?.user?.name ||
    session?.user?.email?.split('@')[0] ||
    'User';

  const userEmail = session?.user?.email || 'user@example.com';
  const avatarUrl = session?.user?.image || '/A1.jpeg';

  return (
    <div className="relative flex items-center gap-[37px]">

      <div className="relative" ref={notificationRef}>
        <button
          type="button"
          onClick={() => {
            setIsNotificationOpen(!isNotificationOpen);
            setIsUserMenuOpen(false);
          }}
          className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-none p-0 transition-all cursor-pointer ${
            isNotificationOpen ? 'text-[#6366F1]' : 'text-[#6366F1] hover:text-[#4F46E5]'
          }`}
          aria-label="Notifications"
        >
            <Bell className="h-[34px] w-[34px]" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute -right-[1px] -top-[1px] block h-[6px] w-[6px] rounded-full bg-[#EF4444]" aria-hidden="true" />
          )}
        </button>

        {isNotificationOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#EAE6FF] text-[#5842EC] rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[#5842EC] hover:text-[#4632db] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                      !item.read ? 'bg-[#F9F8FF]' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          !item.read ? 'bg-[#5842EC]' : 'bg-transparent'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4
                          className={`text-xs truncate ${
                            !item.read
                              ? 'font-bold text-gray-900'
                              : 'font-medium text-gray-700'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pt-2.5 border-t border-gray-100 text-center">
              <Link
                href="/dashboard/data-sources"
                onClick={() => setIsNotificationOpen(false)}
                className="text-xs text-gray-500 hover:text-[#5842EC] font-medium"
              >
                View all notifications &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsUserMenuOpen(!isUserMenuOpen);
            setIsNotificationOpen(false);
          }}
          className="flex items-center rounded-xl border border-transparent p-0 transition-all cursor-pointer"
          aria-label="User menu"
        >
          {/* Avatar */}
          <div className="relative flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAE6FF] text-xs font-bold text-[#5842EC] shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="hidden max-w-[130px] text-left md:block lg:hidden">
            <div className="text-xs font-bold text-gray-800 truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[11px] text-gray-400 truncate leading-tight">
              {userEmail}
            </div>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 lg:hidden ${
              isUserMenuOpen ? 'rotate-180 text-gray-600' : ''
            }`}
          />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-200 bg-[#EAE6FF] flex-shrink-0 flex items-center justify-center text-[#5842EC] font-bold text-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-[#EAE6FF] text-[#5842EC] rounded-full uppercase tracking-wider">
                  Pro Plan
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-[#5842EC] transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-[#5842EC] transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/dashboard/data-sources"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-[#5842EC] transition-colors"
              >
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Data Sources</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />

            {/* Sign Out Button */}
            <div className="px-2 py-1">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}