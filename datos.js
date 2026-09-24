// ==========================================================
//  DATOS DE LA SEMANA — edita aquí para cambiar el contenido
// ==========================================================

// Días de la semana (0 = domingo). Cambia "grupo" para mover grupos musculares.
const DIAS = [
  { letra: 'D', nombre: 'Domingo',   grupo: 'Pecho' },
  { letra: 'L', nombre: 'Lunes',     grupo: 'Bíceps' },
  { letra: 'M', nombre: 'Martes',    grupo: 'Espalda' },
  { letra: 'M', nombre: 'Miércoles', grupo: 'Tríceps' },
  { letra: 'J', nombre: 'Jueves',    grupo: 'Hombro' },
  { letra: 'V', nombre: 'Viernes',   grupo: 'Pecho' },
  { letra: 'S', nombre: 'Sábado',    grupo: 'Espalda' }
];

// Información general de cada grupo (lo que se ve al pulsar un día).
const INFO_GRUPO = {
  // Ejemplo: Hombro: { duracion: '40 min', ejercicios: '7', material: 'Bandas y barra', enfoque: 'Salud del hombro' }
};

// Calentamiento de cada grupo: hasta 3 ejercicios.
//  - dibujo: nombre de un dibujo de DIBUJOS (abajo)
//  - claves: indicaciones que salen junto al dibujo
//  - temporizador (opcional): series, descanso y preparación, más UNA de estas dos:
//      · opciones: [segundos...]  -> ejercicio por tiempo (cuenta atrás)
//      · reps: número            -> ejercicio por repeticiones (botón "Serie hecha")
//  - agarre (opcional): { dibujo, puntos: [[título, texto], ...] } -> panel AGARRE
//  - errores (opcional): [[error, cómo corregirlo], ...] -> panel ERRORES COMUNES
//  - ancla (opcional): qué parte de tu pared usa -> se resalta en el panel TU PARED.
//      'barra' · 'mosqueton' · 'alta' (altura oreja) · 'media' (cintura) · 'baja' (pantorrilla)
//    anclaNota (opcional): texto si no usa ancla (ej.: la banda va en las manos).
//  - intensidad (opcional): 1 baja · 2 media · 3 alta. Si no se pone, la del bloque
//    (calentamiento = baja). También se cambia en ⚙ Configuración → Intensidad.
//    Al entrenar suena una canción de tu biblioteca con el mood elegido y esta intensidad.
//  - musica: formato antiguo; lo que haya aquí se pasa solo a la biblioteca de la web.
const CALENTAMIENTOS = {
  Hombro: [
    {
      nombre: 'Colgarte de la barra',
      indicacion: 'Brazos estirados, hombros relajados, cuerpo quieto.',
      dosis: '2 × 20–30 s',
      musica: {
        // 'Energía': ['https://www.youtube.com/watch?v=...'],
      },
      dibujo: 'colgado',
      ancla: 'barra',
      claves: [
        ['Agarre', 'Mangos paralelos, palmas enfrentadas.'],
        ['Brazos', 'Totalmente estirados. No tires hacia arriba.'],
        ['Cuerpo', 'Quieto, sin balancearte. Respira normal.'],
        ['Subir y bajar', 'Con una silla. Nunca te sueltes de golpe.']
      ],
      agarre: {
        dibujo: 'agarreNeutro',
        puntos: [
          ['Dónde', 'En los mangos paralelos, uno en cada mano.'],
          ['Palmas', 'Mirando hacia dentro, una frente a la otra. Muñecas rectas.'],
          ['Mango', 'Cruza la base de los dedos, no el centro de la palma.'],
          ['Cierre', 'Primero los dedos, luego el pulgar por encima. Aprieta firme.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Brazos estirados del todo: solo cuelgas, no tiras.'],
        ['Balancearte o patalear', 'Piernas juntas y abdomen algo firme.'],
        ['Aguantar la respiración', 'Respira lento durante toda la serie.'],
        ['Soltarte de golpe', 'Apoya los pies en la silla antes de soltar.']
      ],
      temporizador: { series: 2, opciones: [20, 25, 30], descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Abre la banda juntando las escápulas, brazos rectos.',
      dosis: '2 × 15',
      musica: {
        // 'Energía': ['https://www.youtube.com/watch?v=...'],
      },
      dibujo: 'pullApart',
      anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Posición', 'De pie, pies a la anchura de las caderas, rodillas suaves.'],
        ['Brazos', 'Al frente, a la altura del pecho, casi rectos.'],
        ['Abrir', 'Separa las manos hasta que la banda toque el pecho.'],
        ['Volver', 'Despacio, en unos 2 s, sin que la banda te lleve.']
      ],
      agarre: {
        dibujo: 'agarreBanda',
        puntos: [
          ['Dónde', 'Coge el tubo de la banda, no las asas: déjalas colgando.'],
          ['Palmas', 'Hacia abajo, muñecas rectas y firmes.'],
          ['Anchura', 'Manos a la anchura de los hombros.'],
          ['Dificultad', 'Más juntas = más tensión. Si no llegas a 15, sepáralas.']
        ]
      },
      errores: [
        ['Encoger los hombros', 'Hombros lejos de las orejas, cuello largo.'],
        ['Doblar los codos', 'Brazos casi rectos: trabaja la espalda alta.'],
        ['Arquear la espalda', 'Costillas abajo y abdomen firme.'],
        ['Volver de golpe', 'Controla la vuelta: la banda no manda.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dislocaciones con banda',
      indicacion: 'Arco completo con brazos rectos. Ritmo: 2 s ida · 2 s vuelta.',
      dosis: '2 × 10',
      dibujo: 'dislocaciones',
      anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Posición', 'De pie, banda delante de los muslos, palmas hacia atrás.'],
        ['Brazos', 'Codos estirados todo el tiempo y abdomen apretado.'],
        ['Recorrido', 'Por delante, encima de la cabeza, hasta la espalda baja.'],
        ['Vuelta', 'Por el mismo arco hasta delante. Ida y vuelta = 1 rep.']
      ],
      agarre: {
        dibujo: 'agarreDislocaciones',
        puntos: [
          ['Banda', 'La más liviana que tengas: buscas movilidad, no fuerza.'],
          ['Dónde', 'Por la parte recta de la banda, no por las asas.'],
          ['Anchura', 'Manos muy separadas: tensa pero sin esfuerzo.'],
          ['Dificultad', 'Más separadas = más fácil. Más juntas = más difícil.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Si no pasa con los brazos rectos, separa más las manos.'],
        ['Sacar las costillas', 'Al pasar por arriba no arquees la espalda baja.'],
        ['Ir con rebote', 'Lento y continuo: 2 s de ida y 2 s de vuelta.'],
        ['Forzar el paso', 'Si no pasa suave, separa más las manos. Nunca a tirones.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    }
  ]
};

// ==========================================================
//  BLOQUES DEL DÍA: el orden de la sesión ("Siguiente →" pasa al siguiente).
//  Cada bloque: titulo, nota (opcional, se ve junto al título) y ejercicios
//  (misma estructura que el calentamiento). Los que aún no tienen dibujo,
//  claves, agarre o errores salen como [Por definir].
//  temporizador con repeticiones: reps (número o texto, ej. '8–12'), lado
//  (ej. 'por brazo') y descansos: [segundos...] para elegir el descanso.
// ==========================================================
const BLOQUES = {
  Hombro: [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS.Hombro },
    {
      titulo: 'Principal', nota: 'Descanso 60–90 s',
      ejercicios: [
        {
          nombre: 'Press militar con banda', indicacion: 'Pisando la banda.', dosis: '4 × 8–12',
          anclaNota: 'Sin ancla: pisas la banda',
          temporizador: { series: 4, reps: '8–12', descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        },
        {
          nombre: 'Elevaciones laterales', indicacion: 'De costado al ancla baja, la banda cruza por delante del cuerpo.',
          dosis: '3 × 12–15 por brazo', ancla: 'baja',
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        },
        {
          nombre: 'Elevación en Y', indicacion: 'Desde el ancla baja.', dosis: '3 × 12', ancla: 'baja',
          temporizador: { series: 3, reps: 12, descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Posterior y estabilidad', nota: 'Descanso ~45 s',
      ejercicios: [
        {
          nombre: 'Face pull', indicacion: 'Desde el ancla alta.', dosis: '3 × 15', ancla: 'alta',
          temporizador: { series: 3, reps: 15, descanso: 45, preparacion: 5 }
        },
        {
          nombre: 'Pájaros', indicacion: 'Desde el ancla media.', dosis: '3 × 15', ancla: 'media',
          temporizador: { series: 3, reps: 15, descanso: 45, preparacion: 5 }
        },
        {
          nombre: 'Rotación externa', indicacion: 'Desde el ancla media.', dosis: '2 × 15 por brazo', ancla: 'media',
          temporizador: { series: 2, reps: 15, lado: 'por brazo', descanso: 45, preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final',
      ejercicios: [
        {
          nombre: 'Dominadas escapulares', indicacion: 'Colgado de la barra, solo se mueven las escápulas.',
          dosis: '2 × 6–8', ancla: 'barra',
          temporizador: { series: 2, reps: '6–8', descanso: 60, preparacion: 5 }
        }
      ]
    }
  ]
};

// Dibujos (SVG). Se pueden añadir más con otro nombre.
const DIBUJOS = {
  colgado: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Figura colgada de la barra con los brazos estirados y los pies sin tocar el suelo">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/>
<line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/>
<line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
<line x1="86" y1="30" x2="88" y2="132"/><line x1="154" y1="30" x2="152" y2="132"/>
<line x1="88" y1="132" x2="152" y2="132"/><line x1="120" y1="126" x2="120" y2="248"/>
<line x1="100" y1="248" x2="140" y2="248"/>
<polyline points="102,248 100,322 98,380"/><polyline points="138,248 140,322 142,380"/>
</g>
<circle cx="120" cy="100" r="22" fill="#F4F1EA"/>
<line x1="98" y1="392" x2="98" y2="406" stroke="#F2913D" stroke-width="2" stroke-dasharray="3 3"/>
<line x1="142" y1="392" x2="142" y2="406" stroke="#F2913D" stroke-width="2" stroke-dasharray="3 3"/>
</svg>`,

  // Detalle del agarre: palma de frente (dónde va el mango) + animación de la mano cerrándose
  agarreNeutro: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Palma de la mano con el mango cruzando la base de los dedos; al lado, animación de los dedos y el pulgar cerrándose alrededor del mango">
<line x1="22" y1="62" x2="138" y2="62" stroke="#9EA3AA" stroke-width="12" stroke-linecap="round"/>
<g fill="#F4F1EA">
<rect x="53" y="18" width="12" height="50" rx="6"/><rect x="67" y="10" width="12" height="58" rx="6"/>
<rect x="81" y="13" width="12" height="55" rx="6"/><rect x="95" y="24" width="12" height="44" rx="6"/>
<rect x="51.5" y="56" width="13" height="42" rx="6.5" transform="rotate(-40 58 96)"/>
<rect x="52" y="58" width="56" height="52" rx="16"/><rect x="62" y="104" width="36" height="18" rx="6"/>
</g>
<line x1="46" y1="62" x2="114" y2="62" stroke="#F2913D" stroke-width="3" stroke-dasharray="5 4"/>
<text x="80" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" letter-spacing="1">MANGO EN LA BASE</text>
<line x1="170" y1="12" x2="170" y2="126" stroke="#2E3238" stroke-width="2"/>
<circle cx="225" cy="62" r="24" stroke="#2E3238" stroke-width="10"/>
<circle cx="225" cy="62" r="15" fill="#9EA3AA"/>
<path d="M225 38 A24 24 0 1 1 206.6 77.4" pathLength="100" stroke="#F4F1EA" stroke-width="10" stroke-linecap="round" stroke-dasharray="100 102" stroke-dashoffset="101">
<animate attributeName="stroke-dashoffset" values="101;0;0;101" keyTimes="0;0.35;0.85;1" dur="3s" repeatCount="indefinite"/>
</path>
<path d="M202.4 70.2 A24 24 0 0 1 211.2 42.3" pathLength="100" stroke="#F2913D" stroke-width="8" stroke-linecap="round" stroke-dasharray="100 102" stroke-dashoffset="101">
<animate attributeName="stroke-dashoffset" values="101;101;0;0;101" keyTimes="0;0.4;0.6;0.85;1" dur="3s" repeatCount="indefinite"/>
</path>
<text x="225" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" letter-spacing="1">CIERRA LA MANO</text>
</svg>`,
  // Pull-aparts vistos desde arriba: los brazos se abren de delante a los lados (animado)
  pullApart: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Vista desde arriba: brazos rectos al frente con la banda entre las manos; se abren hacia los lados hasta que la banda toca el pecho y vuelven despacio">
<path d="M120 124 V106 M113 113 L120 106 L127 113" stroke="#9EA3AA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<text x="120" y="144" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11" letter-spacing="1">FRENTE</text>
<path d="M95 182 A68 68 0 0 0 22 242" stroke="#4A5059" stroke-width="2" stroke-dasharray="4 5"/>
<path d="M145 182 A68 68 0 0 1 218 242" stroke="#4A5059" stroke-width="2" stroke-dasharray="4 5"/>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round">
<line x1="90" y1="252" x2="95" y2="182"><animate attributeName="x2" values="95;61.3;35;22;22;35;61.3;95" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/></line>
<line x1="150" y1="252" x2="145" y2="182"><animate attributeName="x2" values="145;178.7;205;218;218;205;178.7;145" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/></line>
<line x1="88" y1="252" x2="152" y2="252" stroke-width="20"/>
</g>
<circle cx="120" cy="258" r="18" fill="#F4F1EA" stroke="#1F2227" stroke-width="3"/>
<line x1="95" y1="182" x2="145" y2="182" stroke="#F2913D" stroke-width="7" stroke-linecap="round"><animate attributeName="x1" values="95;61.3;35;22;22;35;61.3;95" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="y1" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="x2" values="145;178.7;205;218;218;205;178.7;145" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="stroke-width" values="7;6;5;4;4;5;6;7" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/></line>
<circle cx="95" cy="182" r="9" fill="#F4F1EA"><animate attributeName="cx" values="95;61.3;35;22;22;35;61.3;95" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/></circle>
<circle cx="145" cy="182" r="9" fill="#F4F1EA"><animate attributeName="cx" values="145;178.7;205;218;218;205;178.7;145" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="182;188.4;210;242;242;210;188.4;182" keyTimes="0;0.13;0.27;0.4;0.6;0.73;0.87;1" dur="3s" repeatCount="indefinite"/></circle>
<text x="120" y="316" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11" letter-spacing="1">VISTA DESDE ARRIBA</text>
</svg>`,

  // Agarre de la banda: palmas abajo, manos a la anchura de los hombros, asas colgando
  agarreBanda: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Dos puños con las palmas hacia abajo sujetando el tubo de la banda a la anchura de los hombros; las asas cuelgan en los extremos">
<text x="140" y="18" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" letter-spacing="1">ANCHO DE HOMBROS</text>
<path d="M72 32 H208 M78 27 L72 32 L78 37 M202 27 L208 32 L202 37" stroke="#9EA3AA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M26 104 V70 H254 V104" stroke="#F2913D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="16" y="104" width="20" height="12" rx="4" stroke="#F2913D" stroke-width="4"/>
<rect x="244" y="104" width="20" height="12" rx="4" stroke="#F2913D" stroke-width="4"/>
<g fill="#F4F1EA">
<rect x="60" y="84" width="24" height="24" rx="6"/><rect x="196" y="84" width="24" height="24" rx="6"/>
<rect x="52" y="54" width="40" height="34" rx="10"/><rect x="188" y="54" width="40" height="34" rx="10"/>
</g>
<g stroke="#9EA3AA" stroke-width="2" stroke-linecap="round">
<line x1="62" y1="60" x2="62" y2="70"/><line x1="72" y1="60" x2="72" y2="70"/><line x1="82" y1="60" x2="82" y2="70"/>
<line x1="198" y1="60" x2="198" y2="70"/><line x1="208" y1="60" x2="208" y2="70"/><line x1="218" y1="60" x2="218" y2="70"/>
</g>
<text x="140" y="98" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" letter-spacing="1">PALMAS ABAJO</text>
<text x="140" y="134" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" letter-spacing="1">MÁS JUNTAS = MÁS DIFÍCIL</text>
</svg>`,
  // Dislocaciones de perfil: los brazos rectos giran delante → arriba → detrás y vuelven (animado, 2 s + 2 s)
  dislocaciones: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Figura de perfil: los brazos rectos con la banda suben por delante, pasan por encima de la cabeza hasta detrás de la cadera y vuelven por el mismo camino">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<circle cx="120" cy="130" r="112" stroke="#F2913D" stroke-width="2" stroke-dasharray="5 6" opacity=".55"/>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
<line x1="120" y1="118" x2="120" y2="250"/>
<polyline points="120,250 118,330 116,398 136,398"/>
</g>
<circle cx="120" cy="92" r="22" fill="#F4F1EA"/>
<g>
<animateTransform attributeName="transform" type="rotate" values="-20 120 130;-180 120 130;-340 120 130;-180 120 130;-20 120 130" keyTimes="0;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/>
<line x1="120" y1="130" x2="120" y2="236" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round"/>
<circle cx="120" cy="242" r="9" fill="#F2913D"/>
</g>
<text x="200" y="262" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">1 · delante</text>
<text x="120" y="12" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">2 · arriba</text>
<text x="40" y="262" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">3 · detrás</text>
</svg>`,

  // Arriba del todo: bien (V ancha, brazos rectos) frente a mal (manos juntas, codos doblados)
  agarreDislocaciones: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Arriba del todo. Bien: brazos rectos en V ancha con la banda tensa. Mal: manos juntas y codos doblados">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ BIEN · V ANCHA</text>
<text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ MAL · JUNTAS</text>
<line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/>
<line x1="38" y1="31" x2="102" y2="31" stroke="#F2913D" stroke-width="3"/>
<g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<polyline points="38,31 70,76 102,31"/>
<line x1="70" y1="76" x2="70" y2="112"/><polyline points="63,134 70,112 77,134"/>
<polyline points="203,34 190,58 210,76 230,58 217,34"/>
<line x1="210" y1="76" x2="210" y2="112"/><polyline points="203,134 210,112 217,134"/>
</g>
<line x1="203" y1="34" x2="217" y2="34" stroke="#F2913D" stroke-width="3"/>
<circle cx="70" cy="62" r="9" fill="#F4F1EA"/><circle cx="210" cy="62" r="9" fill="#F4F1EA"/>
<line x1="30" y1="136" x2="110" y2="136" stroke="#4A5059" stroke-width="2"/>
<line x1="170" y1="136" x2="250" y2="136" stroke="#4A5059" stroke-width="2"/>
</svg>`
};
