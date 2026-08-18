import { TutorSession } from "./TutorSession";

export interface Env {
  TUTOR_SESSION: DurableObjectNamespace;
  DB: D1Database;
  GEMINI_API_KEY: string;
}

// Permisos CORS para que el frontend (Pages) pueda comunicarse con el backend (Worker)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Responder a las peticiones preflight (CORS) del navegador
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

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
      try {
        if (!env.DB) {
          return Response.json({ error: "Base de datos D1 no conectada (Falta el Binding 'DB')" }, { status: 500, headers: corsHeaders });
        }
        
        const { results } = await env.DB.prepare(
          "SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 50"
        ).all();
        
        return Response.json(
          { success: true, results },
          { headers: corsHeaders }
        );
      } catch (e: any) {
        return Response.json({ error: "Error leyendo la base de datos D1: " + e.message }, { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Aulas Activas ÉPICO - API Edge (Cloudflare)", { status: 200, headers: corsHeaders });
  }
};

// Export the Durable Object class so the Worker can use it
export { TutorSession };
