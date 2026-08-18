import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () =>
    pageHead({
      title: `Contact | ${SITE.name}`,
      description: `Contact ${SITE.name}. Email ${SITE.email} for construction, engineering, architecture, and accounting hiring.`,
      path: "/contact",
    }),
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Name, email, and message are required.");
      return;
    }
    const subject = encodeURIComponent(
      `${SITE.name} inquiry from ${name}${company ? ` (${company})` : ""}`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || "—"}\n\n${message}`,
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
    toast.success("Opening your email client…");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Contact</p>
          <h1 className="mt-2 font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Talk to the desk
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Hiring or exploring a move? Send a note — no ticket queue.
          </p>
          <p className="mt-3 max-w-xl text-sm font-medium leading-snug text-fg/90 sm:text-base">
            {SITE.hook}
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2">
          <Card className="border-border bg-surface">
            <CardHeader>
              <CardTitle className="text-base">Send a message</CardTitle>
              <CardDescription>
                We&apos;ll open your mail app so the note goes to the desk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company or firm"
                    autoComplete="organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What role or search are you working on?"
                    required
                    rows={5}
                    className="flex min-h-[7.5rem] w-full rounded-md border border-input bg-bg px-3 py-2 text-base text-fg shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  {sent ? "Open email again" : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-base">Direct lines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <a
                  href={`tel:${SITE.phoneE164}`}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-elevated/40 px-3 py-3 text-fg hover:border-primary/40"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex min-h-12 items-center gap-3 break-all rounded-lg border border-border bg-elevated/40 px-3 py-3 text-fg hover:border-primary/40"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  {SITE.email}
                </a>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-elevated/40 px-3 py-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p>{SITE.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-base">Typical response</CardTitle>
                <CardDescription className="leading-relaxed">
                  Most employer inquiries get a same-day reply on business days.
                  Candidate conversations are personalized — expect a real review of
                  your background before any shotgun outreach.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
