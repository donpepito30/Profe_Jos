import { Env } from "./index";

const systemInstruction = \`Eres el "Profe Juan", un tutor de refuerzo escolar inteligente, cálido y empático para niños de Educación General Básica (EGB) en Ecuador.

TU OBJETIVO PRINCIPAL:
Guiar al estudiante mediante el método socrático para que aprenda matemáticas y lectura utilizando ÚNICAMENTE objetos físicos de su entorno cotidiano (frejoles, tapitas de botella, cubiertos, empaques y etiquetas de alimentos en la cocina).

REGLAS DE INTERACCIÓN Y VOZ:
1. BREVEDAD: Responde SIEMPRE en un máximo de 2 oraciones cortas. El niño te escuchará por audio; no digas párrafos largos.
2. ENFOQUE FÍSICO: Nunca pidas resolver cosas en la pantalla. Pide manipular objetos (ej. "Separa 6 frejoles en dos montones iguales").
3. TONO Y LENGUAJE: Usa un español ecuatoriano cálido, motivador y cercano. Utiliza expresiones respetuosas como "¡Excelente trabajo!", "Vamos a intentarlo juntos", y reconoce vocabulario local (ej. choclo, funda, chapa).
4. PEDAGOGÍA SOCRÁTICA: Si el niño se equivoca, no le des la respuesta correcta. Hazle una pregunta sencilla para que revise sus objetos en la mesa.\`;

export class TutorSession {
  state: DurableObjectState;
  env: Env;
  history: Array<{ role: string; parts: { text: string }[] }>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.history = [];
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    this.state.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      if (typeof message !== "string") {
        // If it's ArrayBuffer, in a full Cloudflare Realtime Calls context, this would be raw audio.
        // Cloudflare Calls handles WebRTC natively. Here we mock via WebSocket.
        return;
      }

      const payload = JSON.parse(message);

      if (payload.type === "audio_transcript") {
        const textMessage = payload.text;
        
        this.history.push({ role: "user", parts: [{ text: textMessage }] });

        // Call Gemini via REST API (since SDK isn't fully edge-optimized out of the box without fetch polyfills)
        const geminiResponse = await fetch(
          \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${this.env.GEMINI_API_KEY}\`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: this.history,
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
        const responseText = aiData.candidates[0].content.parts[0].text;
        const parsedResponse = JSON.parse(responseText);

        this.history.push({ role: "model", parts: [{ text: responseText }] });

        // Asynchronously save to D1 database for the teacher's dashboard
        this.env.DB.prepare(
          "INSERT INTO evaluations (dcd_evaluated, achievement_level, next_action) VALUES (?, ?, ?)"
        ).bind(
          parsedResponse.dcd_evaluated, 
          parsedResponse.achievement_level, 
          parsedResponse.next_action
        ).run().catch(console.error);

        // Send back to client
        ws.send(JSON.stringify({
          type: "tutor_response",
          data: parsedResponse
        }));
      }
    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({ error: "Edge processing failed" }));
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log("WebSocket closed");
  }
}
