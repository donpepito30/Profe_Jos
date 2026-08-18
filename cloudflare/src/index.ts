export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  ASSETS: { fetch: typeof fetch };
}

const systemInstruction = `Eres el "Profe Juan", un tutor de refuerzo escolar inteligente, cálido y empático para niños de Educación General Básica (EGB) en Ecuador.
TU OBJETIVO PRINCIPAL:
Guiar al estudiante mediante el método socrático para que aprenda matemáticas y lectura utilizando ÚNICAMENTE objetos físicos de su entorno cotidiano (frejoles, tapitas de botella, cubiertos, empaques y etiquetas de alimentos en la cocina).
REGLAS DE INTERACCIÓN Y VOZ:
1. BREVEDAD: Responde SIEMPRE en un máximo de 2 oraciones cortas. El niño te escuchará por audio; no digas párrafos largos.
2. ENFOQUE FÍSICO: Nunca pidas resolver cosas en la pantalla. Pide manipular objetos (ej. "Separa 6 frejoles en dos montones iguales").
3. TONO Y LENGUAJE: Usa un español ecuatoriano cálido, motivador y cercano. Utiliza expresiones respetuosas como "¡Excelente trabajo!", "Vamos a intentarlo juntos", y reconoce vocabulario local (ej. choclo, funda, chapa).
4. PEDAGOGÍA SOCRÁTICA: Si el niño se equivoca, no le des la respuesta correcta. Hazle una pregunta sencilla para que revise sus objetos en la mesa.`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Rutas de API
    if (url.pathname.startsWith("/api/")) {
      
      // 1. RUTA DE WEBSOCKET (Walkie-Talkie con Gemini)
      if (url.pathname === "/api/session/connect") {
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected Upgrade: websocket", { status: 426 });
        }

        const [client, server] = Object.values(new WebSocketPair());
        server.accept();

        server.addEventListener("message", async (event) => {
          try {
            const message = event.data;
            if (typeof message !== "string") return;
            
            const payload = JSON.parse(message);
            if (payload.type === "audio_transcript") {
              const textMessage = payload.text;
              
              if (!env.GEMINI_API_KEY) {
                server.send(JSON.stringify({ error: "Falta la GEMINI_API_KEY en Cloudflare" }));
                return;
              }

              // Llamada a Gemini
              const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: textMessage }] }],
                    generationConfig: {
                      responseMimeType: "application/json",
                      responseSchema: {
                        type: "OBJECT",
                        properties: {
                          speech_text: { type: "STRING" },
                          dcd_evaluated: { type: "STRING" },
                          achievement_level: { type: "STRING", enum: ["A", "EP", "I"] },
                          next_action: { type: "STRING", enum: ["CONTINUE", "REINFORCE", "NEXT_DCD"] }
                        },
                        required: ["speech_text", "dcd_evaluated", "achievement_level", "next_action"]
                      }
                    }
                  })
                }
              );

              const aiData: any = await geminiResponse.json();
              
              if (aiData.error) {
                 server.send(JSON.stringify({ error: "Error de Gemini: " + aiData.error.message }));
                 return;
              }

              const responseText = aiData.candidates[0].content.parts[0].text;
              const parsedResponse = JSON.parse(responseText);

              // Guardar en la Base de Datos D1
              if (env.DB) {
                try {
                  await env.DB.prepare(
                    "INSERT INTO evaluations (dcd_evaluated, achievement_level, next_action) VALUES (?, ?, ?)"
                  ).bind(
                    parsedResponse.dcd_evaluated, 
                    parsedResponse.achievement_level, 
                    parsedResponse.next_action
                  ).run();
                } catch (dbErr) {
                  console.error("Error guardando en D1:", dbErr);
                }
              }

              // Enviar la respuesta de vuelta al Frontend
              server.send(JSON.stringify({
                type: "tutor_response",
                data: parsedResponse
              }));
            }
          } catch (err: any) {
            console.error(err);
            server.send(JSON.stringify({ error: "Error procesando el mensaje: " + err.message }));
          }
        });

        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }

      // 2. RUTA DE BASE DE DATOS (Historial para el profesor)
      if (url.pathname === "/api/metrics") {
        try {
          if (!env.DB) return Response.json({ error: "Falta configurar la Base de Datos (Variable DB) en Cloudflare" }, { status: 500 });
          
          const { results } = await env.DB.prepare(
            "SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 50"
          ).all();
          
          return Response.json({ success: true, results });
        } catch (e: any) {
          return Response.json({ error: "Error leyendo la BD: " + e.message }, { status: 500 });
        }
      }
      
      return new Response("API No encontrada", { status: 404 });
    }

    // Para cualquier otra ruta (la página web de React), servimos el archivo estático
    return env.ASSETS.fetch(request);
  }
};
