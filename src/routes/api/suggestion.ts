import { createFileRoute } from "@tanstack/react-router";
import {
  SUGGESTION_CATEGORIES,
  type SuggestionCategory,
  buildSuggestionMailto,
  suggestionOwnerEmail,
} from "@/lib/suggestion";

type Body = {
  category?: string;
  message?: string;
  pagePath?: string;
  pageTitle?: string;
  fromName?: string;
  fromEmail?: string;
};

/** In-process log for this instance (best-effort; mailto is the reliable path). */
const recent: Array<Record<string, unknown>> = [];

export const Route = createFileRoute("/api/suggestion")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body = {};
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const message = (body.message ?? "").trim();
        if (message.length < 5) {
          return Response.json(
            { error: "Please write a bit more (at least a few words)." },
            { status: 400 },
          );
        }
        if (message.length > 4000) {
          return Response.json(
            { error: "Message is too long (max 4000 characters)." },
            { status: 400 },
          );
        }
        const category = (
          SUGGESTION_CATEGORIES.includes(body.category as SuggestionCategory)
            ? body.category
            : "idea"
        ) as SuggestionCategory;

        const record = {
          id: `sug-${Date.now()}`,
          category,
          message,
          pagePath: body.pagePath ?? "/",
          pageTitle: body.pageTitle ?? "",
          fromName: body.fromName ?? null,
          fromEmail: body.fromEmail ?? null,
          createdAt: new Date().toISOString(),
        };
        recent.unshift(record);
        if (recent.length > 100) recent.length = 100;
        console.info("[suggestion]", JSON.stringify(record));

        const mailto = buildSuggestionMailto({
          category,
          message,
          pagePath: record.pagePath as string,
          pageTitle: record.pageTitle as string,
          fromName: record.fromName as string | null,
          fromEmail: record.fromEmail as string | null,
        });

        return Response.json({
          ok: true,
          id: record.id,
          mailto,
          ownerEmail: suggestionOwnerEmail(),
          note: `Suggestion recorded. Opening email to ${suggestionOwnerEmail()} so it reaches the product team.`,
        });
      },
    },
  },
});
