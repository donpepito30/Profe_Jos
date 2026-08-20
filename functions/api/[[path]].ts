const systemInstruction = `Eres el "Profe Juan", un tutor de refuerzo escolar inteligente, cálido y empático para niños de Educación General Básica (EGB) de la Malla Curricular Oficial de Ecuador (Ministerio de Educación).

TU OBJETIVO PRINCIPAL:
Guiar al estudiante mediante el método socrático para que aprenda matemáticas y lectura utilizando ÚNICAMENTE objetos físicos de su entorno cotidiano (frejoles, tapitas de botella, cubiertos, empaques y etiquetas de alimentos en la cocina).

MALLA CURRICULAR OFICIAL ECUADOR (DCDs REFERENCIALES QUE DEBES EVALUAR):
1. MATEMÁTICAS:
   - M.1.4.14: Comparar cantidades con "más que", "menos que", "igual que" (Preparatoria 1° EGB).
   - M.2.1.1: Representación de conjuntos con objetos concretos (Elemental 2°-4° EGB).
   - M.2.1.12: Conteo y descomposición de números naturales con objetos del entorno (Elemental 2°-4° EGB).
   - M.2.1.21: Suma y resta con objetos concretos (Elemental 2°-4° EGB).
   - M.2.1.25: Noción de multiplicación como grupos iguales de objetos (Elemental 2°-4° EGB).
   - M.2.2.6: Medida de masa y peso con objetos del entorno / sopesado (Elemental 2°-4° EGB).
   - M.3.1.1: Patrones y sucesiones numéricas concretas (Media 5°-7° EGB).
   - M.3.1.33: Noción de fracciones dividiendo un objeto/alimento entero (Media 5°-7° EGB).

2. LENGUA Y LITERATURA:
   - LL.1.1.1: Expresión oral clara de necesidades y descripciones (Preparatoria 1° EGB).
   - LL.2.1.1: Reconocer intención comunicativa en textos cotidianos/etiquetas (Elemental 2°-4° EGB).
   - LL.2.2.1: Expresión oral espontánea sobre procesos cotidianos (Elemental 2°-4° EGB).
   - LL.2.3.1: Lectura de empaques, etiquetas y fechas de vencimiento (Elemental 2°-4° EGB).
   - LL.3.3.2: Comprensión de recetas e instructivos de empaques (Media 5°-7° EGB).

REGLAS DE INTERACCIÓN Y VOZ:
1. BREVEDAD ABSOLUTA: Responde SIEMPRE en un máximo de 2 oraciones cortas. El niño te escuchará por audio; no uses párrafos ni listas.
2. ENFOQUE EN OBJETOS FÍSICOS: Nunca pidas resolver cosas en la pantalla. Pide manipular objetos de la casa (ej. "Separa 6 frejoles en dos montones iguales" o "Busca las letras grandes en la funda de sal").
3. TONO Y LENGUAJE ECUATORIANO: Usa un español ecuatoriano cálido, motivador y cercano. Utiliza expresiones respetuosas como "¡Excelente trabajo!", "Vamos a intentarlo juntos", y reconoce vocabulario local (ej. choclo, funda, chapa, granos).
4. PEDAGOGÍA SOCRÁTICA: Si el niño se equivoca, no le des la respuesta correcta. Hazle una pregunta sencilla para que revise sus objetos en la mesa.`;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 8;

const normalizeHistory = (history?: any[]) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.trim() }]
    }));
};

export async function onRequest(context: { request: Request; env: any }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const cleanPath = url.pathname.replace(/\/+$/, "") || "/";

  const corsHeaders = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const makeJsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Handle /api/tutor
  if (cleanPath === "/api/tutor") {
    if (request.method === "GET") {
      return makeJsonResponse({ status: "ok", message: "API de Profe Juan lista para peticiones POST" });
    }

    if (request.method !== "POST") {
      return makeJsonResponse({ error: "Método HTTP no permitido. Use POST." }, 405);
    }

    try {
      const body: any = await request.json();
      const textMessage = typeof body.message === "string" ? body.message.trim() : "";

      if (!textMessage || textMessage.length > MAX_MESSAGE_LENGTH) {
        return makeJsonResponse({ error: "El mensaje debe tener entre 1 y 2000 caracteres." }, 400);
      }

      const apiKey = env.GEMINI_API_KEY || env.GEMIN || env.GEMINI;
      if (!apiKey) {
        return makeJsonResponse({ error: "Falta configurar GEMINI_API_KEY en las variables de Cloudflare" }, 500);
      }

      const formattedHistory = Array.isArray(body.history) 
        ? body.history.slice(-MAX_HISTORY_MESSAGES).filter((msg: any) =>
            msg && typeof msg.content === "string" && msg.content.length <= MAX_MESSAGE_LENGTH
          ).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content.trim() }]
          }))
        : [];
      formattedHistory.push({ role: "user", parts: [{ text: textMessage }] });

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: formattedHistory,
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  speech_text: { type: "STRING" },
                  dcd_evaluated: { type: "STRING" },
                  dcd_title: { type: "STRING" },
                  subject: { type: "STRING", enum: ["Matemáticas", "Lengua y Literatura"] },
                  sublevel: { type: "STRING", enum: ["Preparatoria (1° EGB)", "Elemental (2°-4° EGB)", "Media (5°-7° EGB)"] },
                  achievement_level: { type: "STRING", enum: ["A", "EP", "I"] },
                  next_action: { type: "STRING", enum: ["CONTINUE", "REINFORCE", "NEXT_DCD"] }
                },
                required: ["speech_text", "dcd_evaluated", "dcd_title", "subject", "sublevel", "achievement_level", "next_action"]
              }
            }
          })
        }
      );

      const aiData: any = await geminiResponse.json();
      if (!geminiResponse.ok || aiData.error) {
        return makeJsonResponse({ error: "No se pudo obtener una respuesta del tutor." }, 502);
      }

      const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof responseText !== "string") {
        return makeJsonResponse({ error: "La respuesta del tutor no tiene un formato válido." }, 502);
      }

      const parsedResponse = JSON.parse(responseText);

      if (env.DB) {
        try {
          await env.DB.prepare(
            "INSERT INTO evaluations (subject, sublevel, dcd_evaluated, dcd_title, achievement_level, next_action) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(
            parsedResponse.subject || "Matemáticas",
            parsedResponse.sublevel || "Elemental (2°-4° EGB)",
            parsedResponse.dcd_evaluated,
            parsedResponse.dcd_title || "Evaluación DCD",
            parsedResponse.achievement_level,
            parsedResponse.next_action
          ).run();
        } catch (dbErr) {
          console.error("Error guardando en D1:", dbErr);
        }
      }

      return makeJsonResponse(parsedResponse);
    } catch (e: any) {
      return makeJsonResponse({ error: e.message }, 500);
    }
  }

  // Handle /api/metrics
  if (cleanPath === "/api/metrics") {
    try {
      if (!env.DB) return makeJsonResponse({ error: "Falta configurar la Base de Datos (Variable DB) en Cloudflare" }, 500);
      
      const { results } = await env.DB.prepare(
        "SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 50"
      ).all();
      
      return makeJsonResponse({ success: true, results });
    } catch (e: any) {
      return makeJsonResponse({ error: "Error leyendo la BD D1: " + e.message }, 500);
    }
  }

  return makeJsonResponse({ error: "API No encontrada" }, 404);
}
