import { createFileRoute } from "@tanstack/react-router";
import { PORTAL_COOKIE, verifyPortalToken } from "@/lib/auth/simple-portal";

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

export const Route = createFileRoute("/api/portal-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = readCookie(request, PORTAL_COOKIE);
        const session = verifyPortalToken(token);
        if (!session) {
          return Response.json({ user: null }, { status: 200 });
        }
        return Response.json({
          user: {
            id: session.id,
            name: session.name,
            email: session.email,
          },
        });
      },
      POST: async ({ request }) => {
        // logout
        let action = "logout";
        try {
          const body = (await request.json()) as { action?: string };
          action = body.action ?? "logout";
        } catch {
          /* empty body = logout */
        }
        if (action !== "logout") {
          return Response.json({ error: "Unknown action" }, { status: 400 });
        }
        const secure = request.url.startsWith("https:");
        const cookie = [
          `${PORTAL_COOKIE}=`,
          "Path=/",
          "HttpOnly",
          "SameSite=Lax",
          "Max-Age=0",
          secure ? "Secure" : "",
        ]
          .filter(Boolean)
          .join("; ");
        return Response.json(
          { ok: true },
          { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
