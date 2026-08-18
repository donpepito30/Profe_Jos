CREATE TABLE evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dcd_evaluated TEXT NOT NULL,
  achievement_level TEXT NOT NULL,
  next_action TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 