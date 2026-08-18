import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WebSocketServer } from "ws";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    speech_text: {
      type: Type.STRING,
      description: "Texto exacto que la voz del sistema le dirá al niño (máx. 2 oraciones)."
    },
    dcd_evaluated: {
      type: Type.STRING,
      description: "Código DCD de la malla curricular ecuatoriana (ej. M.2.1.25)"
    },
    dcd_title: {
      type: Type.STRING,
      description: "Título corto de la destreza (ej. Noción de multiplicación)"
    },
    subject: {
      type: Type.STRING,
      enum: ["Matemáticas", "Lengua y Literatura"]
    },
    sublevel: {
      type: Type.STRING,
      enum: ["Preparatoria (1° EGB)", "Elemental (2°-4° EGB)", "Media (5°-7° EGB)"]
    },
    achievement_level: {
      type: Type.STRING,
      enum: ["A", "EP", "I"],
      description: "A: Adquirido, EP: En Proceso, I: Inicio"
    },
    next_action: {
      type: Type.STRING,
      enum: ["CONTINUE", "REINFORCE", "NEXT_DCD"]
    }
  },
  required: ["speech_text", "dcd_evaluated", "dcd_title", "subject", "sublevel", "achievement_level", "next_action"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Existing HTTP API fallback
  app.post("/api/tutor", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required" });

      const formattedHistory = history?.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

      const chatSession = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
        history: formattedHistory
      });

      const response = await chatSession.sendMessage({ message });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Error in /api/tutor:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // Mock route for local development so /api/metrics doesn't fail
  app.get("/api/metrics", (req, res) => {
    // In local dev, we don't have D1 easily bound to the Express server,
    // so we return mock data so the dashboard doesn't crash.
    res.json({
      success: true,
      results: [
        {
          id: 1,
          dcd_evaluated: "M.2.1.1. (Desarrollo Local)",
          achievement_level: "A",
          next_action: "CONTINUE",
          created_at: new Date().toISOString()
        }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Attach WebSocket Server to simulate Cloudflare Durable Objects + WebRTC signaling/audio channel
  const wss = new WebSocketServer({ server, path: '/api/session/connect' });
  
  wss.on('connection', (ws) => {
    console.log('Realtime Client connected via WebSocket');
    
    // Create a stateful chat session mimicking a Durable Object's memory
    const chatSession = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        
        if (payload.type === 'audio_transcript') {
          // This represents the transcript of the audio sent from the client
          const response = await chatSession.sendMessage({ message: payload.text });
          const jsonResponse = JSON.parse(response.text || "{}");
          
          ws.send(JSON.stringify({
            type: 'tutor_response',
            data: jsonResponse
          }));
        }
      } catch (err) {
        console.error("WebSocket message error", err);
      }
    });

    ws.on('close', () => {
      console.log('Realtime Client disconnected');
    });
  });
}

startServer();
