export interface DCDItem {
  code: string;
  subject: 'Matemáticas' | 'Lengua y Literatura';
  sublevel: 'Preparatoria (1° EGB)' | 'Elemental (2°-4° EGB)' | 'Media (5°-7° EGB)';
  title: string;
  description: string;
  concreteActivityExample: string;
}

export const ECUADOR_CURRICULUM: DCDItem[] = [
  // --- MATEMÁTICAS ---
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

  // --- LENGUA Y LITERATURA ---
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
    title: 'Comprensión e inferencias en recetas y guías',
    description: 'Comprender instructivos cotidianos y recetas de cocina infiriendo significados de palabras desconocidas.',
    concreteActivityExample: 'Leer las instrucciones al reverso de un empaque de gelatina o sopa en sobre.'
  }
];
