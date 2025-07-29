"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<string>("Loading...");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [envVars, setEnvVars] = useState<{ supabaseUrl: string; supabaseKey: string }>({ supabaseUrl: '', supabaseKey: '' });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check environment variables
        const envCheck = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        };
        setEnvVars(envCheck);

        // Check authentication
        const { user, error } = await getCurrentUser();
        
        if (error) {
          setAuthStatus(`Error: ${error.message}`);
        } else if (user) {
          setAuthStatus("Authenticated");
          setUser(user);
        } else {
          setAuthStatus("Not authenticated");
        }
      } catch (error) {
        setAuthStatus(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthStatus(`Sign out error: ${error.message}`);
      } else {
        setAuthStatus("Signed out");
        setUser(null);
      }
    } catch (error) {
      setAuthStatus(`Sign out exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Supabase URL: <span className="font-mono">{envVars.supabaseUrl}</span></p>
            <p>Supabase Key: <span className="font-mono">{envVars.supabaseKey}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Status: <span className="font-mono">{authStatus}</span></p>
            
            {user && (
              <div className="space-y-2">
                <p>User ID: <span className="font-mono">{user.id}</span></p>
                <p>Email: <span className="font-mono">{user.email}</span></p>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </div>
            )}
            
            {!user && (
              <Button asChild>
                <a href="/login">Go to Login</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 