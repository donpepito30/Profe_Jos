import { SubjectType, SublevelType } from '../types';

export interface DCDItem {
  code: string;
  subject: SubjectType;
  sublevel: SublevelType;
  title: string;
  description: string;
  concreteActivityExample: string;
}

export const ECUADOR_CURRICULUM: DCDItem[] = [
  // ================= MATEMÁTICAS =================
  {
    code: 'M.1.4.14',
    subject: 'Matemáticas',
    sublevel: 'Preparatoria (1° EGB)',
    title: 'Comparación de cantidades',
    description: 'Comparar cantidades de objetos de su entorno con las nociones "más que", "menos que", "igual que".',
    concreteActivityExample: 'Comparar un puñado de frejoles con un puñado de tapitas en la mesa.'
  },
  {
    code: 'M.2.1.1',
    subject: 'Matemáticas',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Representación de conjuntos',
    description: 'Representar gráficamente conjuntos y relacionar sus elementos con objetos concretos del entorno.',
    concreteActivityExample: 'Agrupar 5 cucharas y 5 tenedores en conjuntos separados.'
  },
  {
    code: 'M.2.1.12',
    subject: 'Matemáticas',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Conteo y descomposición de números',
    description: 'Representar, escribir y leer números naturales mediante material concreto (granos, unidades, decenas).',
    concreteActivityExample: 'Formar decenas atando atados de 10 fideos o agrupando 10 granos.'
  },
  {
    code: 'M.2.1.21',
    subject: 'Matemáticas',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Suma y resta con objetos concretos',
    description: 'Realizar adiciones y sustracciones con números manipulando objetos del entorno cotidiano.',
    concreteActivityExample: 'Añadir 4 tapitas a un plato que ya tiene 3 tapitas y contar el total.'
  },
  {
    code: 'M.2.1.25',
    subject: 'Matemáticas',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Noción de multiplicación',
    description: 'Relacionar la multiplicación con patrones de sumas repetidas o grupos iguales de objetos.',
    concreteActivityExample: 'Hacer 3 montoncitos con 4 frejoles cada uno para entender 3 x 4.'
  },
  {
    code: 'M.2.2.6',
    subject: 'Matemáticas',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Medida de masa con unidades no convencionales',
    description: 'Comparar el peso y masa de objetos cotidianos utilizando balanzas caseras o sopesado directo.',
    concreteActivityExample: 'Sopesar una papa vs una cebolla en cada mano para determinar cuál pesa más.'
  },
  {
    code: 'M.3.1.1',
    subject: 'Matemáticas',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Patrones y sucesiones',
    description: 'Generar sucesiones con sumas y multiplicaciones a partir de objetos y secuencias cotidianas.',
    concreteActivityExample: 'Crear una secuencia de cubiertos: 1 tenedor, 2 cucharas, 3 tenedores, 4 cucharas.'
  },
  {
    code: 'M.3.1.33',
    subject: 'Matemáticas',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Noción de fracciones',
    description: 'Identificar fracciones como partes iguales de un objeto concreto entero (frutas, panes, papel).',
    concreteActivityExample: 'Dividir un guineo o tortilla en 4 partes iguales y tomar 2 partes (2/4).'
  },
  {
code: 'M.4.1.1',
    subject: 'Matemáticas',
    sublevel: 'Superior (8°-10° EGB)',
    title: 'Números enteros y contexto real',
    description: 'Reconocer números enteros (positivos y negativos) en situaciones reales como temperaturas o gastos.',
    concreteActivityExample: 'Usar monedas para representar ganancias (+) y deudas (-).'
  },

  // ================= LENGUA Y LITERATURA =================
  {
    code: 'LL.1.1.1',
    subject: 'Lengua y Literatura',
    sublevel: 'Preparatoria (1° EGB)',
    title: 'Expresión oral clara',
    description: 'Expresar necesidades e ideas en lenguaje oral acentuando la pronunciación y vocabulario básico.',
    concreteActivityExample: 'Nombrar 3 objetos de la cocina describiendo su forma y color.'
  },
  {
    code: 'LL.2.1.1',
    subject: 'Lengua y Literatura',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Comprensión de textos cotidianos',
    description: 'Reconocer la intención comunicativa de textos de uso cotidiano (etiquetas de alimentos, recetas, empaques).',
    concreteActivityExample: 'Leer la etiqueta de una funda de leche o fideos e identificar la marca y el producto.'
  },
  {
    code: 'LL.2.2.1',
    subject: 'Lengua y Literatura',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Expresión oral espontánea',
    description: 'Compartir de manera organizada sus ideas al explicar la manipulación de objetos.',
    concreteActivityExample: 'Explicar los pasos que siguió para ordenar las tapas de las ollas de mayor a menor.'
  },
  {
    code: 'LL.2.3.1',
    subject: 'Lengua y Literatura',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Lectura de empaques y etiquetas',
    description: 'Construir el significado de textos mediante relaciones de causa-efecto u objeto-atributo en etiquetas.',
    concreteActivityExample: 'Buscar la fecha de vencimiento o ingrediente principal en una funda de sal o azúcar.'
  },
  {
    code: 'LL.3.3.2',
    subject: 'Lengua y Literatura',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Comprensión e inferencias en recetas',
    description: 'Comprender instructivos cotidianos y recetas de cocina infiriendo significados de palabras desconocidas.',
    concreteActivityExample: 'Leer las instrucciones al reverso de un empaque de gelatina o sopa en sobre.'
  },
  {
    code: 'LL.4.3.1',
    subject: 'Lengua y Literatura',
    sublevel: 'Superior (8°-10° EGB)',
    title: 'Lectura crítica de noticias e instructivos',
    description: 'Evaluar el contenido de textos informativos e instructivos de productos del hogar.',
    concreteActivityExample: 'Comparar las advertencias y pasos en dos empaques de productos de limpieza.'
  },

  // ================= CIENCIAS NATURALES =================
  {
    code: 'CN.1.1.1',
    subject: 'Ciencias Naturales',
    sublevel: 'Preparatoria (1° EGB)',
    title: 'Exploración de los sentidos',
    description: 'Reconocer los órganos de los sentidos y sus funciones explorando frutas, especias u objetos cotidianos.',
    concreteActivityExample: 'Tapar los ojos al niño y pedirle identificar una naranja, un limón o canela por el olor/tacto.'
  },
  {
    code: 'CN.2.1.1',
    subject: 'Ciencias Naturales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Observación y clasificación de plantas',
    description: 'Observar las etapas de las plantas y clasificar semillas/hojas recolectadas en el hogar.',
    concreteActivityExample: 'Comparar hojas frescas vs secas o semillas de maíz vs frejoles.'
  },
  {
    code: 'CN.2.1.4',
    subject: 'Ciencias Naturales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Estados físicos de la materia',
    description: 'Observar y describir los estados de la materia (sólido, líquido, gaseoso) en alimentos y objetos cotidianos.',
    concreteActivityExample: 'Observar agua líquida, un cubo de hielo (sólido) y el vapor de una taza de té caliente.'
  },
  {
    code: 'CN.2.2.2',
    subject: 'Ciencias Naturales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Alimentación saludable y origen de alimentos',
    description: 'Clasificar los alimentos diarios por su origen (animal, vegetal, mineral) y función nutricional.',
    concreteActivityExample: 'Separar alimentos de la cocina en tres platos: origen vegetal, animal y mineral (sal/agua).'
  },
  {
    code: 'CN.3.1.1',
    subject: 'Ciencias Naturales',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Estructura de las semillas y germinación',
    description: 'Investigar la germinación y partes de las plantas mediante experimentos sencillos con semillas de la casa.',
    concreteActivityExample: 'Abrir un frejol remojado por la mitad para observar el embrión y cotiledón.'
  },
  {
    code: 'CN.3.3.1',
    subject: 'Ciencias Naturales',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Fuerzas y movimiento en objetos cotidianos',
    description: 'Experimentar la relación entre fuerza, masa y fricción empujando objetos sobre distintas superficies.',
    concreteActivityExample: 'Rodar una tapa de frasco sobre la mesa lisa versus sobre una toalla rugosa.'
  },
  {
    code: 'CN.4.1.3',
    subject: 'Ciencias Naturales',
    sublevel: 'Superior (8°-10° EGB)',
    title: 'Materia orgánica e inorgánica',
    description: 'Diferenciar residuos orgánicos e inorgánicos para promover el reciclaje en el hogar.',
    concreteActivityExample: 'Clasificar la basura de la cocina en cáscaras (orgánico) y plásticos/latas (inorgánico).'
  },

  // ================= ESTUDIOS SOCIALES =================
  {
    code: 'CS.1.1.1',
    subject: 'Estudios Sociales',
    sublevel: 'Preparatoria (1° EGB)',
    title: 'Mi historia personal y hogar',
    description: 'Reconocer su identidad, familia e historia personal explorando rincones y objetos del hogar.',
    concreteActivityExample: 'Buscar 2 objetos antiguos de la casa que pertenezcan a los abuelos o padres.'
  },
  {
    code: 'CS.2.1.1',
    subject: 'Estudios Sociales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'La familia y el entorno comunitario',
    description: 'Identificar la estructura de su familia y los roles/tareas compartidas en el hogar.',
    concreteActivityExample: 'Representar a cada miembro de la familia usando tapitas de distintos tamaños.'
  },
  {
    code: 'CS.2.2.1',
    subject: 'Estudios Sociales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Símbolos patrios y diversidad del Ecuador',
    description: 'Reconocer los colores de la bandera nacional y productos típicos de las regiones ecuatorianas.',
    concreteActivityExample: 'Agrupar alimentos típicos según su región origen (verde/plátano de la Costa, choclo de la Sierra).'
  },
  {
    code: 'CS.2.3.1',
    subject: 'Estudios Sociales',
    sublevel: 'Elemental (2°-4° EGB)',
    title: 'Ubicación espacial y croquis casero',
    description: 'Representar la ubicación de lugares del hogar y puntos cardinales usando maquetas sencillas.',
    concreteActivityExample: 'Armar con cajas de fósforos un croquis del camino de la cama a la cocina.'
  },
  {
    code: 'CS.3.1.1',
    subject: 'Estudios Sociales',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Geografía y Regiones del Ecuador',
    description: 'Caracterizar la Costa, Sierra, Amazonía y Galápagos asociando productos agrícolas y climas.',
    concreteActivityExample: 'Colocar en un plato productos representativos: cacao (Costa), papa (Sierra), yuca (Amazonía).'
  },
  {
    code: 'CS.3.2.1',
    subject: 'Estudios Sociales',
    sublevel: 'Media (5°-7° EGB)',
    title: 'Actividades económicas e historia agrícola',
    description: 'Analizar la producción agrícola del Ecuador (banano, cacao, flores) y su impacto en la economía.',
    concreteActivityExample: 'Examinar empaques de chocolate o harina para rastrear dónde fueron cultivados en Ecuador.'
  },
  {
    code: 'CS.4.2.1',
    subject: 'Estudios Sociales',
    sublevel: 'Superior (8°-10° EGB)',
    title: 'Interculturalidad y plurinacionalidad',
    description: 'Comprender la diversidad étnica y cultural del Ecuador valorando sus costumbres y saberes.',
    concreteActivityExample: 'Investigar palabras del Kichwa usadas en la vida cotidiana (ej. achachay, guagua, chapa).'
  }
];
