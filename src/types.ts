export type SubjectType = 'Matemáticas' | 'Lengua y Literatura' | 'Ciencias Naturales' | 'Estudios Sociales';

export type SublevelType = 'Preparatoria (1° EGB)' | 'Elemental (2°-4° EGB)' | 'Media (5°-7° EGB)' | 'Superior (8°-10° EGB)';

export interface StudentProfile {
  name: string;
  sublevel: SublevelType;
  gradeDetail: string;
  targetSubject: SubjectType | 'Todas';
  availableObjects: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    dcd_evaluated?: string;
    dcd_title?: string;
    subject?: SubjectType;
    sublevel?: SublevelType;
    achievement_level?: 'A' | 'EP' | 'I';
    next_action?: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
    session_objective?: string;
    suggest_break?: boolean;
  };
}

export interface TutorResponse {
  speech_text: string;
  dcd_evaluated: string;
  dcd_title?: string;
  subject?: SubjectType;
  sublevel?: SublevelType;
  achievement_level: 'A' | 'EP' | 'I';
  next_action: 'CONTINUE' | 'REINFORCE' | 'NEXT_DCD';
  session_objective?: string;
  suggest_break?: boolean;
  audio_base64?: string;
  mime_type?: string;
}
