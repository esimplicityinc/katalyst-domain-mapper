import Elysia from "elysia";

export const healthRoute = new Elysia().get("/health", () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

export function createReadyRoute(healthCheck: () => boolean) {
  return new Elysia().get("/ready", ({ set }) => {
    const healthy = healthCheck();
    if (!healthy) {
      set.status = 503;
      return { status: "unavailable", database: false };
    }
    return { status: "ready", database: true };
  });
}
