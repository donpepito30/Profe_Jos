import { TutorSession } from "./TutorSession";

export interface Env {
  TUTOR_SESSION: DurableObjectNamespace;
  DB: D1Database;
  GEMINI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint to request a WebRTC/WebSocket session
    // Cloudflare Realtime Calls usually rely on WebRTC, but we mock WebSockets for Durable Object state control
    if (url.pathname === "/api/session/connect") {
      // In a real WebRTC app, here we would call the Cloudflare Calls API to get a WebRTC session description.
      // But we will use WebSockets over Durable Objects to maintain ultra-low latency state.
      
      const sessionId = request.headers.get("cf-ray") || "default-session";
      const id = env.TUTOR_SESSION.idFromName(sessionId);
      const stub = env.TUTOR_SESSION.get(id);

      // Upgrade request to WebSocket, pass into Durable Object
      return stub.fetch(request);
    }

    // Example endpoint to retrieve DCD metrics from D1
    if (url.pathname === "/api/metrics") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 50"
      ).all();
      return Response.json({ success: true, results });
    }

    return new Response("Aulas Activas ÉPICO - API Edge (Cloudflare)", { status: 200 });
  }
};

// Export the Durable Object class so the Worker can use it
export { TutorSession };
