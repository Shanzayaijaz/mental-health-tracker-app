'use client';
import Link from "next/link";
import {
  Menu,
  X,
  Brain,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton } from "@/components/auth/sign-in-button";
import { getCurrentUser, supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Add Dashboard to nav items when user is logged in
  const dynamicNavItems = user 
    ? [{ href: "/dashboard", label: "Dashboard" }, ...navItems]
    : navItems;

  return (
    <div className="w-full fixed top-0 z-50 bg-background/95 backdrop-blur">
      <div className="absolute inset-0 border-b border-popover" />
      
      <header className="relative max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <Brain className="h-6 w-6 text-primary animate-glow" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
            MoodSync AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-1">
            {dynamicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignInButton />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            {/* Menu */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-primary/10 px-4 bg-background/95 backdrop-blur relative z-50"
            >
              <nav className="flex flex-col space-y-1 py-4">
                {dynamicNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors cursor-pointer touch-manipulation min-h-[44px] flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}