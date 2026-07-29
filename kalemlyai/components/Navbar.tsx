"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Sparkles, LayoutDashboard, LogOut, ChevronDown, MessageSquare, Plus, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Don't show full navbar on embed iframe pages
  const isEmbedPage = pathname?.startsWith("/embed");
  if (isEmbedPage) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-bots", label: "My Bots", icon: Bot },
    { href: "/dashboard/history", label: "History", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#06141b]/90 backdrop-blur-md border-b border-[#253745] px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#253745] flex items-center justify-center border border-[#4a5c6a] group-hover:scale-105 transition-transform shadow-xs">
            <Bot className="w-5 h-5 text-[#ccd0cf]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-[#ccd0cf] tracking-tight">
              Kalemly<span className="text-[#9ba8ab]">AI</span>
            </span>
            <span className="text-[10px] text-[#9ba8ab] font-medium tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#ccd0cf]" /> RAG AI Builder
            </span>
          </div>
        </Link>

        {/* Central Nav Links (Visible on all main pages) */}
        {isAuthenticated && user && (
          <nav className="hidden md:flex items-center gap-2 bg-[#11212d] border border-[#253745] p-1.5 rounded-2xl">
            <Link
              href="/"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                pathname === "/"
                  ? "bg-[#253745] text-[#ccd0cf] shadow-xs"
                  : "text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745]/50"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#253745] text-[#ccd0cf] shadow-xs"
                      : "text-[#9ba8ab] hover:text-[#ccd0cf] hover:bg-[#253745]/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/create"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  pathname === "/create"
                    ? "bg-[#ccd0cf] text-[#06141b]"
                    : "bg-[#253745] text-[#ccd0cf] hover:bg-[#4a5c6a]"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>New Bot</span>
              </Link>

              {/* User profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11212d] hover:bg-[#253745] border border-[#253745] transition-all text-xs text-[#ccd0cf]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#4a5c6a] flex items-center justify-center text-[10px] font-bold text-[#ccd0cf]">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[110px] truncate font-medium">{user.full_name}</span>
                  <ChevronDown className="w-3 h-3 text-[#9ba8ab]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#11212d] border border-[#253745] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in">
                    <div className="px-4 py-3 border-b border-[#253745]">
                      <p className="text-xs font-bold text-[#ccd0cf] truncate">{user.full_name}</p>
                      <p className="text-[11px] text-[#9ba8ab] truncate">{user.email}</p>
                    </div>

                    {/* Mobile nav items */}
                    <div className="md:hidden border-b border-[#253745] py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#ccd0cf] hover:bg-[#253745]"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/my-bots"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#ccd0cf] hover:bg-[#253745]"
                      >
                        My Bots
                      </Link>
                      <Link
                        href="/dashboard/history"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-[#ccd0cf] hover:bg-[#253745]"
                      >
                        History
                      </Link>
                    </div>

                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-rose-400 hover:bg-[#253745] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/login"
                className="text-[#9ba8ab] hover:text-[#ccd0cf] transition-colors px-3 py-2"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-[#253745] text-[#ccd0cf] hover:bg-[#4a5c6a] transition-all shadow-xs"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
