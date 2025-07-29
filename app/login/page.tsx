'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Mail, Lock, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Magic Link login
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        console.error("Supabase error:", error);
      } else {
        setStatus("sent");
        console.log("Magic link sent successfully to:", email);
      }
    } catch (error) {
      setErrorMessage("Supabase is not configured. Please check your environment variables.");
      setStatus("error");
      console.error("Configuration error:", error);
    }
  };

  // Email + Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        console.error("Supabase error:", error);
      } else {
        setStatus("sent");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setErrorMessage("Supabase is not configured. Please check your environment variables.");
      setStatus("error");
      console.error("Configuration error:", error);
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <div className="flex justify-center gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${tab === "magic" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            onClick={() => { setTab("magic"); setStatus("idle"); setErrorMessage(""); }}
            type="button"
          >
            <KeyRound className="inline w-4 h-4 mr-1" /> Magic Link
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${tab === "password" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            onClick={() => { setTab("password"); setStatus("idle"); setErrorMessage(""); }}
            type="button"
          >
            <Lock className="inline w-4 h-4 mr-1" /> Email + Password
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          {tab === "magic" ? (
            <>
              <p>🔐 Secure passwordless login</p>
              <p>📧 We&apos;ll send you a secure link to your email</p>
              <p>⏰ Links expire in 1 minute for security</p>
            </>
          ) : (
            <>
              <p>🔑 Login with your email and password</p>
              <p>Forgot your password? Use the magic link option above.</p>
            </>
          )}
        </div>

        {tab === "magic" && (
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}
            {status === "sent" ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-green-600 font-medium">
                  ✨ Magic link sent successfully!
                </p>
                <p className="text-xs text-gray-600">
                  Check your email inbox (and spam folder) immediately.
                </p>
                <p className="text-xs text-orange-600 font-medium">
                  ⏰ Link expires in 1 minute - check your email now!
                </p>
              </div>
            ) : (
              <Button type="submit" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send Magic Link"}
              </Button>
            )}
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Password</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? "Logging in..." : "Login"}
            </Button>
            
            <div className="flex justify-between items-center pt-2">
              <Link href="/forgot-password">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </Link>
              <Link href="/signup">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Create Account
                </button>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </Container>
  );
}
