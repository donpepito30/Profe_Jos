-- Esquema para la Base de Datos D1 en Cloudflare (aulas-activas-dcd)
CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT,
  sublevel TEXT,
  dcd_evaluated TEXT NOT NULL,
  dcd_title TEXT,
  achievement_level TEXT NOT NULL,
  next_action TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
