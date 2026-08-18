import { useEffect, useId, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageCirclePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  SUGGESTION_CATEGORIES,
  SUGGESTION_CATEGORY_LABEL,
  type SuggestionCategory,
} from "@/lib/suggestion";
import { cn } from "@/lib/utils";

/**
 * Beacon-style floating pilot suggestion control — sitewide.
 * Sends idea/issue/question to the product owner via mailto + server log.
 */
export function SuggestionButton() {
  const titleId = useId();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SuggestionCategory>("idea");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneNote, setDoneNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openPanel() {
    setError(null);
    setDone(false);
    setDoneNote(null);
    setOpen(true);
  }

  async function submit() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          pagePath: pathname || "/",
          pageTitle: typeof document !== "undefined" ? document.title : "",
          fromName: user?.displayName ?? null,
          fromEmail: user?.primaryEmail ?? null,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        mailto?: string;
        note?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not send suggestion.");
        return;
      }
      setDone(true);
      setDoneNote(data.note ?? "Thanks — suggestion sent.");
      setMessage("");
      setCategory("idea");
      if (data.mailto) {
        // Open mail client so product owner actually receives it
        window.location.href = data.mailto;
      }
      toast.success("Suggestion ready — check your email app if it opened.");
    } catch {
      setError("Could not send suggestion — try again or refresh.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className={cn(
          "print:hidden fixed z-40 flex items-center gap-2 rounded-full",
          "bg-gradient-to-r from-[#3d8ec4] to-[#5b9fd4] text-white shadow-lg shadow-[#3d8ec4]/30",
          "hover:from-[#4a9fd4] hover:to-[#6bb0e0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d8ec4] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
          "px-4 py-3 text-sm font-bold",
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCirclePlus className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Suggestion</span>
        <span className="sm:hidden">Idea</span>
      </button>

      {open ? (
        <div
          className="print:hidden fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close suggestion form"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-surface p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Lightbulb className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 id={titleId} className="text-base font-bold text-fg">
                    Pilot suggestion
                  </h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Bug, idea, or question? Sends to the MG product team
                    {user?.displayName
                      ? ` — thanks, ${user.displayName.split(" ")[0]}`
                      : ""}
                    .
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted hover:bg-elevated"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-4 text-sm text-fg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div>
                    <p className="font-semibold">Got it — thank you!</p>
                    <p className="mt-1 text-xs text-muted">
                      {doneNote ||
                        "Suggestion is ready for the product owner via email."}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setDone(false);
                        setOpen(false);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-xs">What kind?</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {SUGGESTION_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition",
                          category === c
                            ? "border-primary bg-primary text-primary-fg"
                            : "border-border bg-bg text-fg hover:border-primary/40",
                        )}
                      >
                        {SUGGESTION_CATEGORY_LABEL[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="mg-suggestion-message" className="text-xs">
                    Your message
                  </Label>
                  <textarea
                    id="mg-suggestion-message"
                    className="mt-1 min-h-[120px] w-full rounded-xl border border-input bg-bg px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="What should we fix or add? Enough detail to reproduce a bug helps."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={4000}
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Page:{" "}
                    <code className="rounded bg-elevated px-1">{pathname || "/"}</code>
                    {" · "}
                    Attached automatically.
                  </p>
                </div>

                {error ? (
                  <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending || message.trim().length < 5}
                    onClick={() => void submit()}
                    className="gap-1.5 border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
                  >
                    {pending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MessageCirclePlus className="h-3.5 w-3.5" />
                    )}
                    Send suggestion
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
