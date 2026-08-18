import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WebSocketServer } from "ws";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `Eres el "Profe Juan", un tutor de refuerzo escolar inteligente, cálido y empático para niños de Educación General Básica (EGB) en Ecuador.

TU OBJETIVO PRINCIPAL:
Guiar al estudiante mediante el método socrático para que aprenda matemáticas y lectura utilizando ÚNICAMENTE objetos físicos de su entorno cotidiano (frejoles, tapitas de botella, cubiertos, empaques y etiquetas de alimentos en la cocina).

REGLAS DE INTERACCIÓN Y VOZ:
1. BREVEDAD: Responde SIEMPRE en un máximo de 2 oraciones cortas. El niño te escuchará por audio; no digas párrafos largos.
2. ENFOQUE FÍSICO: Nunca pidas resolver cosas en la pantalla. Pide manipular objetos (ej. "Separa 6 frejoles en dos montones iguales").
3. TONO Y LENGUAJE: Usa un español ecuatoriano cálido, motivador y cercano. Utiliza expresiones respetuosas como "¡Excelente trabajo!", "Vamos a intentarlo juntos", y reconoce vocabulario local (ej. choclo, funda, chapa).
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
  required: ["speech_text", "dcd_evaluated", "achievement_level", "next_action"]
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
        model: "gemini-2.5-flash",
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
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Realtime Client connected via WebSocket');
    
    // Create a stateful chat session mimicking a Durable Object's memory
    const chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
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
