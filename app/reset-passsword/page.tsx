"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "updating" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const access_token = params.get("access_token");
    if (!access_token) {
      setError("Invalid or missing reset token.");
      setStatus("error");
    }
  }, [params]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("updating");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  return (
    <Container className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Reset Your Password</h1>

        {status === "success" ? (
          <p className="text-green-600 text-center font-semibold">
            ✅ Password updated! Redirecting to login...
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            <div className="space-y-2">
              <label className="block text-sm font-medium">New Password</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  className="flex-1 border-none outline-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "updating"}
            >
              {status === "updating" ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        )}
      </Card>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center">Reset Your Password</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </Container>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}