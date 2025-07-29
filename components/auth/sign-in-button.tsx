"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface SignInButtonProps {
  className?: string;
}

export function SignInButton({ className }: SignInButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" className={className} disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <Button 
        variant="outline" 
        onClick={handleSignOut}
        className={className}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}