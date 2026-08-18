import { createFileRoute } from "@tanstack/react-router";

/**
 * Minimal public health check for uptime monitors.
 * Do not expose auth mode, DB details, or stack traces here.
 */
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const body = {
          ok: true,
          status: "healthy",
          service: "mg-recruiting-source",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        };
        return Response.json(body, {
          status: 200,
          headers: {
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
