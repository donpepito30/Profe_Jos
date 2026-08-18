export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    dcd_evaluated?: string;
    dcd_title?: string;
    subject?: 'Matemáticas' | 'Lengua y Literatura';
    sublevel?: 'Preparatoria (1° EGB)' | 'Elemental (2°-4° EGB)' | 'Media (5°-7° EGB)';
    achievement_level?: 'A' | 'EP' | 'I';
    next_action?: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
  };
}

export interface TutorResponse {
  speech_text: string;
  dcd_evaluated: string;
  dcd_title?: string;
  subject?: 'Matemáticas' | 'Lengua y Literatura';
  sublevel?: 'Preparatoria (1° EGB)' | 'Elemental (2°-4° EGB)' | 'Media (5°-7° EGB)';
  achievement_level: 'A' | 'EP' | 'I';
  next_action: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
}
