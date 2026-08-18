import { SITE } from "./seo";

/** Pilot suggestion categories. */

export type SuggestionCategory = "idea" | "issue" | "question" | "other";

export const SUGGESTION_CATEGORY_LABEL: Record<SuggestionCategory, string> = {
  idea: "Idea",
  issue: "Bug / issue",
  question: "Question",
  other: "Other",
};

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  "idea",
  "issue",
  "question",
  "other",
];

/** Where pilot suggestions are delivered (mailto + server log). */
export function suggestionOwnerEmail(): string {
  if (typeof process !== "undefined") {
    const env = process.env.SUGGESTION_TO?.trim();
    if (env) return env;
  }
  return SITE.email;
}

export function buildSuggestionMailto(input: {
  category: SuggestionCategory;
  message: string;
  pagePath: string;
  pageTitle: string;
  fromName?: string | null;
  fromEmail?: string | null;
}): string {
  const cat = SUGGESTION_CATEGORY_LABEL[input.category];
  const subject = encodeURIComponent(
    `[${SITE.name} suggestion] ${cat} · ${input.pagePath}`,
  );
  const body = encodeURIComponent(
    [
      `Category: ${cat}`,
      `Page: ${input.pagePath}`,
      `Title: ${input.pageTitle}`,
      input.fromName ? `From: ${input.fromName}` : null,
      input.fromEmail ? `Email: ${input.fromEmail}` : null,
      ``,
      input.message.trim(),
      ``,
      `— Sent from ${SITE.name} suggestion button`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
  );
  return `mailto:${suggestionOwnerEmail()}?subject=${subject}&body=${body}`;
}
