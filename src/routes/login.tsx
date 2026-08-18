import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE, pageHead } from "@/lib/seo";
import { PORTAL_USER } from "@/lib/auth/portal-identity";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () =>
    pageHead({
      title: `Sign in | ${SITE.name}`,
      description: `Sign in to the ${SITE.name} desk.`,
      path: "/login",
      noindex: true,
    }),
});

const PORTAL_EMAIL = PORTAL_USER.email;

function LoginPage() {
  const [email, setEmail] = useState<string>(PORTAL_EMAIL);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error("Enter your password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/portal-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || PORTAL_EMAIL,
          password,
        }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        throw new Error(data.error ?? "Sign-in failed");
      }
      toast.success("Signed in — opening desk.");
      // Hard nav so cookie is attached and session hooks reload
      window.location.href = "/portal";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-var(--grok-banner-h,0px))] place-items-center bg-bg px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <Card className="w-full max-w-md border-border bg-surface shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <Link
            to="/"
            className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/30"
          >
            {SITE.mark}
          </Link>
          <CardTitle className="text-xl">Desk sign-in</CardTitle>
          <CardDescription>
            Simple password sign-in for Heat Map, BenchAlert, FitScore, and CSV import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Portal password"
                required
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full border-0 bg-[#3d8ec4] text-base text-white hover:bg-[#4a9fd4]"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in to portal"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted">
            Demo desk: {PORTAL_EMAIL}. Production requires PORTAL_PASSWORD.
          </p>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Back to site</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
