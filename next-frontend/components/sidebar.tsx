import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  Home,
  Megaphone as Explore,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
} from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onCompose: () => void;
}

export default function Sidebar({ isOpen, onToggle, onCompose }: SidebarProps) {
  const [activePage, setActivePage] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "explore", label: "Explore", icon: Explore, href: "/explore" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Heart,
      href: "/notifications",
    },
    { id: "messages", label: "Messages", icon: Mail, href: "/messages" },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <>
      {/* Toggle Button - Mobile */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay - Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static w-72 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-sidebar-border">
          <div className="text-2xl font-bold text-primary">𝕏</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-6 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.href}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-lg",
                    activePage === item.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-sidebar-accent/10 text-sidebar-foreground"
                  )}
                >
                  <Icon size={24} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Compose Button */}
        <div className="p-4 lg:p-6 border-t border-sidebar-border">
          <button
            onClick={onCompose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-bold rounded-full"
          >
            <span className="hidden sm:inline">Post</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 lg:p-6 border-t border-sidebar-border">
          <button className="w-full flex items-center justify-between p-3 hover:bg-sidebar-accent/10 rounded-full transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-sm">Alex Johnson</div>
                <div className="text-xs text-sidebar-foreground/60">
                  @alexjohnson
                </div>
              </div>
            </div>
            <MoreHorizontal size={20} className="hidden sm:block" />
          </button>
        </div>
      </aside>
    </>
  );
}
