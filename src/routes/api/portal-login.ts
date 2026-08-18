import { createFileRoute } from "@tanstack/react-router";
import {
  PORTAL_COOKIE,
  PORTAL_USER,
  checkPortalPassword,
  createPortalToken,
} from "@/lib/auth/simple-portal";

export const Route = createFileRoute("/api/portal-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { email?: string; password?: string } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const email = (body.email ?? "").trim().toLowerCase();
        const password = body.password ?? "";
        if (email && email !== PORTAL_USER.email.toLowerCase()) {
          return Response.json(
            { error: `Unknown desk user. Use ${PORTAL_USER.email}` },
            { status: 401 },
          );
        }
        if (!checkPortalPassword(password)) {
          return Response.json({ error: "Invalid password" }, { status: 401 });
        }
        const token = createPortalToken();
        const secure = request.url.startsWith("https:");
        const cookie = [
          `${PORTAL_COOKIE}=${token}`,
          "Path=/",
          "HttpOnly",
          "SameSite=Lax",
          `Max-Age=${60 * 60 * 24 * 30}`,
          secure ? "Secure" : "",
        ]
          .filter(Boolean)
          .join("; ");

        return Response.json(
          {
            ok: true,
            user: {
              id: PORTAL_USER.id,
              name: PORTAL_USER.name,
              email: PORTAL_USER.email,
            },
          },
          {
            status: 200,
            headers: {
              "Set-Cookie": cookie,
              "Cache-Control": "no-store",
            },
          },
        );
      },
    },
  },
});
