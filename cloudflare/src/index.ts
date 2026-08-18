import { TutorSession } from "./TutorSession";

export interface Env {
  TUTOR_SESSION: DurableObjectNamespace;
  DB: D1Database;
  GEMINI_API_KEY: string;
  ASSETS: { fetch: typeof fetch };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Rutas de API
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/session/connect") {
        const sessionId = request.headers.get("cf-ray") || "default-session";
        if (!env.TUTOR_SESSION) return new Response("Error: Falta Binding TUTOR_SESSION", { status: 500 });
        const id = env.TUTOR_SESSION.idFromName(sessionId);
        const stub = env.TUTOR_SESSION.get(id);
        return stub.fetch(request);
      }

      if (url.pathname === "/api/metrics") {
        try {
          if (!env.DB) return Response.json({ error: "Falta Binding DB" }, { status: 500 });
          const { results } = await env.DB.prepare(
            "SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 50"
          ).all();
          return Response.json({ success: true, results });
        } catch (e: any) {
          return Response.json({ error: "Error BD: " + e.message }, { status: 500 });
        }
      }
      return new Response("API No encontrada", { status: 404 });
    }

    // Para cualquier otra ruta (como la página web de React), le decimos a Cloudflare Pages que sirva el archivo estático
    return env.ASSETS.fetch(request);
  }
};

export { TutorSession };
