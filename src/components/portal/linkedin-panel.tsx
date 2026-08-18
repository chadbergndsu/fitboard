import { useState } from "react";
import { Linkedin, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
// toast used for lead add / draft
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useLinkedInStore,
  type LinkedInStatus,
} from "@/lib/linkedin-store";
import { useRosterStore } from "@/lib/roster-store";
import { buildLinkedInDraft } from "@/lib/agent-engine";
import { computeFitScore } from "@/lib/fitscore";
import { jobReqs } from "@/lib/data";
import { SITE } from "@/lib/seo";

const STATUSES: LinkedInStatus[] = [
  "queued",
  "to-message",
  "messaged",
  "replied",
  "passed",
];

export function LinkedInPanel() {
  const { leads, addLead, updateLead, removeLead, clearLeads } =
    useLinkedInStore();
  const candidates = useRosterStore((s) => s.candidates);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Minneapolis, MN");
  const [profileUrl, setProfileUrl] = useState("");
  const [notes, setNotes] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    addLead({
      name: name.trim(),
      title: title.trim(),
      company: company.trim() || undefined,
      location: location.trim() || undefined,
      profileUrl: profileUrl.trim(),
      notes: notes.trim(),
    });
    setName("");
    setTitle("");
    setCompany("");
    setProfileUrl("");
    setNotes("");
    toast.success("Lead added to LinkedIn queue");
  }

  function importFromRoster() {
    let n = 0;
    for (const c of candidates.slice(0, 20)) {
      addLead({
        name: c.name,
        title: c.title,
        location: c.location,
        profileUrl: "",
        notes: `From roster · ${c.industry} · ${c.yearsExperience}y`,
        candidateId: c.id,
        status: "queued",
      });
      n++;
    }
    toast.success(`Queued ${n} people from roster (add LinkedIn URLs as you go)`);
  }

  const openJob = jobReqs.find((j) => j.status === "open") ?? jobReqs[0];

  return (
    <div className="space-y-4">
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Linkedin className="h-4 w-4 text-primary" />
            LinkedIn assist
          </CardTitle>
          <CardDescription>
            Manual LinkedIn workflow (no scrape, no banned automation). Paste
            profile links, track status, generate drafts, open LinkedIn yourself.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onAdd}>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="li-name">Name</Label>
              <Input
                id="li-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Candidate name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="li-title">Title</Label>
              <Input
                id="li-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior PM"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="li-co">Company</Label>
              <Input
                id="li-co"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Current company"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="li-loc">Location</Label>
              <Input
                id="li-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="li-url">LinkedIn profile URL</Label>
              <Input
                id="li-url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/…"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="li-notes">Notes</Label>
              <Input
                id="li-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How you found them, mutuals, etc."
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
              <Button type="submit" className="border-0 bg-[#3d8ec4] text-white">
                <Plus className="mr-1.5 h-4 w-4" />
                Add lead
              </Button>
              <Button type="button" variant="outline" onClick={importFromRoster}>
                Queue from roster
              </Button>
              {leads.length > 0 ? (
                <Button type="button" variant="ghost" onClick={() => clearLeads()}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Clear all
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {leads.length === 0 ? (
        <p className="text-sm text-muted">
          No LinkedIn leads yet. Add a profile URL or queue people from your Excel
          import.
        </p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="border-border bg-surface">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted">
                      {[lead.title, lead.company, lead.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) =>
                      updateLead(lead.id, {
                        status: e.target.value as LinkedInStatus,
                      })
                    }
                    className="h-9 rounded-md border border-input bg-bg px-2 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {lead.profileUrl ? (
                  <a
                    href={lead.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Open LinkedIn
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-warning">
                    Add a LinkedIn URL when you find their profile.
                  </p>
                )}
                {lead.notes ? (
                  <p className="text-xs text-muted">{lead.notes}</p>
                ) : null}
                {lead.draftMessage ? (
                  <pre className="whitespace-pre-wrap rounded border border-border bg-bg p-3 font-sans text-xs leading-relaxed">
                    {lead.draftMessage}
                  </pre>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const cand = candidates.find((c) => c.id === lead.candidateId);
                      if (cand && openJob) {
                        const fit = computeFitScore(cand, openJob);
                        const draft = buildLinkedInDraft(cand, openJob, fit);
                        updateLead(lead.id, { draftMessage: draft });
                        toast.success("Draft generated");
                      } else {
                        const draft = [
                          `Hi ${lead.name.split(" ")[0] ?? lead.name} — ${SITE.recruiterName} with ${SITE.name} (Twin Cities).`,
                          ``,
                          `I place construction / engineering / architecture / accounting talent across MSP.`,
                          lead.title
                            ? `Your ${lead.title} background looks relevant for a search I'm running.`
                            : `Your background looks relevant for a search I'm running.`,
                          ``,
                          `Open to a quick chat?`,
                          `— ${SITE.recruiterName} · ${SITE.phone}`,
                        ].join("\n");
                        updateLead(lead.id, { draftMessage: draft });
                        toast.success("Generic draft generated");
                      }
                    }}
                  >
                    Generate draft
                  </Button>
                  {lead.draftMessage ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await navigator.clipboard.writeText(lead.draftMessage!);
                        toast.success("Copied");
                      }}
                    >
                      Copy message
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLead(lead.id)}
                  >
                    Remove
                  </Button>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Updated {new Date(lead.updatedAt).toLocaleString()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
