'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch (error) {
      setErrorMessage("Unexpected error. Please try again.");
      setStatus("error");
      console.error("Supabase error:", error);
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        {status === "success" ? (
          <div className="text-center text-green-600 space-y-2">
            <p>🎉 Account created! Please check your email to confirm your account.</p>
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 underline">
                Log in here
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
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
                  minLength={6}
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Confirm Password</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Log in here
          </Link>
        </p>
      </Card>
    </Container>
  );
}
