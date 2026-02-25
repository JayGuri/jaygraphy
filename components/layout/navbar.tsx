"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { getCurrentUser, isAdmin, signOut } from "@/lib/supabase/auth";

export function Navbar() {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser();
      const email = user?.email ?? null;
      setUserEmail(email);
      if (email) {
        const admin = await isAdmin(email);
        setIsAdminUser(admin);
      }
    }
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsAdminUser(false);
      setUserEmail(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/map", label: "Map" },
    { href: "/favorites", label: "Favorites" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="text-xl font-bold">
            JAYGRAPHY
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-blue-400 font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Upload button - only for admins */}
            {isAdminUser && (
              <Link
                href="/upload"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                title="Upload Photos"
              >
                <Upload className="w-5 h-5" />
              </Link>
            )}

            {/* Logout button - only when logged in */}
            {userEmail && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                title={`Logout (${userEmail})`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

