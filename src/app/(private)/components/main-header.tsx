"use client";

import { Bell, Search, User } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function MainHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-white px-4 py-3 shadow">
      <div className="mx-auto md:px-4 flex max-w-md items-center justify-between">
        <div className="relative p-4 cursor-pointer  rounded-full bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-3 right-3 block h-3 w-3 rounded-full bg-primary border-2 border-zinc-800" />
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/search" className="rounded-full bg-zinc-800 p-4">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Link href="/user-profile" className="rounded-full bg-zinc-800 p-4">
            <User className="h-5 w-5" />
            <span className="sr-only">User Settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
