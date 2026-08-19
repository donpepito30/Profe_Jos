# Arquitectura Cloudflare para "Profe Juan"

Este directorio contiene la arquitectura de referencia lista para desplegar en **Cloudflare Edge** utilizando **Cloudflare Workers**, **Durable Objects**, **D1** y bases compatibles para **Cloudflare Calls (RealtimeKit)**.

## ¿Por qué Cloudflare?

Para mantener una latencia ultra-baja (menor a 50ms) simulando un Walkie-Talkie en vivo (PTT), una arquitectura tradicional cliente-servidor (con cold starts) puede agregar mucha latencia al procesamiento de la voz interactiva para niños.

1. **Cloudflare RealtimeKit / Calls (WebRTC):** Cloudflare abstrae la gestión de servidores TURN y SFU. Cuando los niños usan el audio, Cloudflare Calls maneja los flujos de WebRTC garantizando que el canal esté abierto continuamente sin pérdida de paquetes (incluso en redes lentas de Ecuador).
2. **Durable Objects (WebSockets):** Mantiene el contexto de la sesión activa de Gemini para cada niño *en la memoria RAM del Edge*. No hace falta leer y escribir el historial en una base de datos en cada turno, lo que hace las respuestas casi instantáneas.
3. **Cloudflare D1 (SQLite en Edge):** Permite registrar las Destrezas con Criterios de Desempeño (DCD) asincrónicamente y sin bloquear el audio del estudiante.

## Despliegue

### 1. Preparar la Base de Datos D1 (opcional)
```bash
npx wrangler d1 create aulas-activas-dcd
```
*Copia el `database_id` que te devuelve y agrega el bloque `[[d1_databases]]` al `wrangler.toml`.*

### 2. Aplicar el Schema (si habilitaste D1)
```bash
npx wrangler d1 execute aulas-activas-dcd --file=./schema.sql
```

### 3. Agregar Clave de Gemini
```bash
npx wrangler secret put GEMINI_API_KEY
```

### 4. Desplegar
```bash
npx wrangler deploy
```

Con esto, el WebSocket expuesto en `/api/session/connect` utilizará memoria stateful y latencia ultra-baja en Sudamérica.
