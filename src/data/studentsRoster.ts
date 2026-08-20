import { SubjectType, SublevelType } from '../types';

export interface RosterStudent {
  idNumber: number | string;
  name: string;
  sublevel: SublevelType;
  gradeDetail: string;
  targetSubject: SubjectType | 'Todas';
  availableObjects: string;
  notes?: string;
}

export const INITIAL_STUDENT_ROSTER: RosterStudent[] = [
  {
    idNumber: 1,
    name: "Santi",
    sublevel: "Elemental (2°-4° EGB)",
    gradeDetail: "3° EGB",
    targetSubject: "Matemáticas",
    availableObjects: "Frejoles, tapitas de botella, cubiertos y cucharitas",
    notes: "Refuerzo en sumas, restas y noción de multiplicación."
  },
  {
    idNumber: 2,
    name: "Camila",
    sublevel: "Elemental (2°-4° EGB)",
    gradeDetail: "2° EGB",
    targetSubject: "Lengua y Literatura",
    availableObjects: "Empaques de galletas, fundas de leche y azúcar",
    notes: "Refuerzo en lectura de etiquetas y vocales."
  },
  {
    idNumber: 3,
    name: "Mateo",
    sublevel: "Media (5°-7° EGB)",
    gradeDetail: "5° EGB",
    targetSubject: "Matemáticas",
    availableObjects: "Frutas, verduras, tortillas y hojas de papel",
    notes: "Refuerzo en noción de fracciones y patrones."
  },
  {
    idNumber: 4,
    name: "Doménica",
    sublevel: "Preparatoria (1° EGB)",
    gradeDetail: "1° EGB",
    targetSubject: "Todas",
    availableObjects: "Juguetes pequeños, botones y lápices de colores",
    notes: "Comparación de cantidades: más que, menos que."
  },
  {
    idNumber: 5,
    name: "Erick",
    sublevel: "Elemental (2°-4° EGB)",
    gradeDetail: "4° EGB",
    targetSubject: "Ciencias Naturales",
    availableObjects: "Hojas de plantas, semillas de maíz y vasos de agua",
    notes: "Partes de la planta y estados de la materia."
  },
  {
    idNumber: 6,
    name: "Isabella",
    sublevel: "Superior (8°-10° EGB)",
    gradeDetail: "8° EGB",
    targetSubject: "Estudios Sociales",
    availableObjects: "Mapa del Ecuador, monedas y empaques de chocolate/banano",
    notes: "Regiones del Ecuador e interculturalidad."
  }
];
