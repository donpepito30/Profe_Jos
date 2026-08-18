export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    dcd_evaluated?: string;
    achievement_level?: 'A' | 'EP' | 'I';
    next_action?: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
  };
}

export interface TutorResponse {
  speech_text: string;
  dcd_evaluated: string;
  achievement_level: 'A' | 'EP' | 'I';
  next_action: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
}
