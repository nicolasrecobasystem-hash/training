// ==========================================================
//  DATOS DE LA SEMANA — edita aquí para cambiar el contenido
// ==========================================================

// Días de la semana (0 = domingo). Cambia "grupo" para mover grupos musculares.
// rutina (opcional): nombre de la rutina de ese día cuando dos días comparten grupo
// (ej. viernes 'Pecho · Fuerza' y domingo 'Pecho · Volumen'). Sus ejercicios van en
// CALENTAMIENTOS / BLOQUES / INFO_GRUPO con ese nombre.
const DIAS = [
  { letra: 'D', nombre: 'Domingo',   grupo: 'Pecho', rutina: 'Pecho · Volumen' },
  { letra: 'L', nombre: 'Lunes',     grupo: 'Bíceps' },
  { letra: 'M', nombre: 'Martes',    grupo: 'Espalda', rutina: 'Espalda · Volumen' },
  { letra: 'M', nombre: 'Miércoles', grupo: 'Tríceps' },
  { letra: 'J', nombre: 'Jueves',    grupo: 'Hombro' },
  { letra: 'V', nombre: 'Viernes',   grupo: 'Pecho', rutina: 'Pecho · Fuerza' },
  { letra: 'S', nombre: 'Sábado',    grupo: 'Espalda', rutina: 'Espalda · Dominadas' }
];

// Información general de cada grupo (lo que se ve al pulsar un día).
// "ejercicios" se cuenta solo a partir de BLOQUES si no lo pones aquí.
const INFO_GRUPO = {
  Hombro: {
    duracion: '~50 min',
    material: 'Bandas, barra y anclas alta, media y baja',
    enfoque: 'Deltoides, postura y salud del hombro'
  },
  'Pecho · Fuerza': {
    duracion: '~55 min',
    material: 'Bandas, anclas media, alta y baja, y suelo',
    enfoque: 'Fuerza de pecho y tríceps'
  },
  'Espalda · Dominadas': {
    duracion: '~55 min',
    material: 'Barra, bandas, banda de ayuda y anclas media y alta',
    enfoque: 'Dominadas: sumar repeticiones completas'
  },
  'Pecho · Volumen': {
    duracion: '~50 min',
    material: 'Suelo, silla, bandas y anclas media, alta y baja',
    enfoque: 'Volumen de pecho: muchas repeticiones limpias'
  },
  'Bíceps': {
    duracion: '~50 min',
    material: 'Bandas, barra, banda de ayuda y anclas baja y alta',
    enfoque: 'Bíceps y antebrazo'
  },
  'Espalda · Volumen': {
    duracion: '~55 min',
    material: 'Barra, bandas, banda de ayuda y anclas media y alta',
    enfoque: 'Espalda con muchas repeticiones'
  },
  'Tríceps': {
    duracion: '~45 min',
    material: 'Suelo, silla, bandas y anclas alta y media',
    enfoque: 'Tríceps: sus tres cabezas'
  }
};

// Calentamiento de cada grupo: hasta 3 ejercicios.
//  - dibujo: nombre de un dibujo de DIBUJOS (abajo)
//  - claves: indicaciones que salen junto al dibujo
//  - temporizador (opcional): series, descanso y preparación, más UNA de estas dos:
//      · opciones: [segundos...]  -> ejercicio por tiempo (cuenta atrás); porDefecto: la que sale marcada
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
//  - ritmo (opcional): se ve bajo la indicación (ej. '1 s arriba · 3 s abajo').
//  - agarre.titulo (opcional): título del panel (por defecto AGARRE; ej. 'MONTAJE').
//  - info (opcional): [[título, texto], ...] -> botón ⓘ (qué trabaja, cómo progresar...).
const CALENTAMIENTOS = {
  Hombro: [
    {
      nombre: 'Colgarte de la barra',
      indicacion: 'Brazos estirados, hombros relajados, cuerpo quieto.',
      dosis: '2 × 20–30 s',
      dibujo: 'colgado',
      ancla: 'barra',
      claves: [
        ['Agarre', 'Mangos paralelos, palmas enfrentadas.'],
        ['Brazos', 'Totalmente estirados. Aquí no se tira.'],
        ['Cuerpo', 'Vertical y quieto, piernas juntas. Respira normal.'],
        ['Subir y bajar', 'Con una silla firme. Nunca te sueltes de golpe.']
      ],
      agarre: {
        dibujo: 'agarreNeutro',
        puntos: [
          ['Dónde', 'Mangos paralelos, palmas enfrentadas: lo más cómodo para el hombro.'],
          ['Mango', 'Cruza la base de los dedos, no el centro de la palma.'],
          ['Cierre', 'Primero los dedos, luego el pulgar por encima. Aprieta firme.'],
          ['Manos secas', 'Sécate antes: el agarre es lo primero que falla.']
        ]
      },
      errores: [
        ['Balancearse', 'Si empiezas a oscilar, apoya un pie en la silla y vuelve a empezar.'],
        ['Doblar los codos', 'Brazos estirados de principio a fin.'],
        ['Soltarse de golpe', 'Castiga rodillas y hombros. Baja por la silla.'],
        ['Aguantar con dolor', 'Estirar se nota; un pinchazo en el hombro no. Si aparece, para.']
      ],
      info: [
        ['Para qué sirve', 'Descomprime la columna, estira dorsales y hombros, y fortalece el agarre para las dominadas.'],
        ['Cómo progresar', 'Cuando los 30 s salgan cómodos, pasa a 40 s. Más adelante, prueba el agarre ancho.']
      ],
      musica: {},
      temporizador: { series: 2, opciones: [20, 25, 30], descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Abre la banda hasta el pecho juntando los omóplatos.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15',
      dibujo: 'pullApart',
      anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Posición', 'Brazos al frente a la altura del pecho, codos casi rectos.'],
        ['Abrir', 'Hacia los lados hasta tocar el pecho, soltando el aire.'],
        ['Pausa', '1 s juntando los omóplatos.'],
        ['Volver', 'Controlando la banda: la vuelta también cuenta.']
      ],
      agarre: {
        dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Liviana: es calentamiento, no fuerza.'],
          ['Manos', 'Al ancho de los hombros, palmas hacia abajo.'],
          ['Dónde', 'Por el tubo de la banda; las asas, colgando.'],
          ['Si no llega', 'Si la banda no toca el pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Hombros bajos y brazos rectos en cruz. Si no puedes, banda más suave.'],
        ['Arquear la espalda', 'Abdomen firme: el tronco no se mueve, solo los brazos.'],
        ['Soltar de golpe', 'La vuelta también cuenta: controla la banda.'],
        ['Bajar los brazos', 'Mantén la banda a la altura del pecho toda la serie.']
      ],
      info: [
        ['Qué trabaja', 'Deltoides posterior y músculos entre los omóplatos. Prepara la postura para el press.'],
        ['Cómo progresar', 'Acerca un poco las manos o usa una banda algo más dura cuando las 15 salgan fáciles.']
      ],
      musica: {},
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dislocaciones con banda',
      indicacion: 'Arco completo con los brazos rectos: delante, arriba y detrás.',
      ritmo: '2 s ida · 2 s vuelta',
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
      info: [
        ['Para qué sirve', 'Movilidad del hombro, estira pecho y dorsal, y prepara la articulación para el press y las dominadas.'],
        ['Cómo progresar', 'Cada semana acerca un poco las manos, solo si el recorrido sigue saliendo suave y sin dolor.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    }
  ],
  // SÁBADO · Espalda con foco en dominadas · calentamiento
  'Espalda · Dominadas': [
    {
      nombre: 'Colgarte de la barra',
      indicacion: 'Mangos paralelos y brazos estirados: deja caer el peso, cuerpo quieto.',
      dosis: '2 × 20 s', dibujo: 'colgado', ancla: 'barra',
      claves: [
        ['Subir', 'Apoya el peso poco a poco desde la silla, sin dejarte caer.'],
        ['Brazos', 'Totalmente estirados, pies al aire.'],
        ['Cuerpo', 'Recto y quieto, piernas juntas. Relaja hombros y espalda.'],
        ['Bajar', 'Apoyando los pies en la silla.']
      ],
      agarre: {
        dibujo: 'agarreNeutro',
        puntos: [
          ['Silla', 'Firme, debajo de la barra, para subir y bajar.'],
          ['Mangos', 'Paralelos, palmas enfrentadas.'],
          ['Manos secas', 'Sécatelas: hoy el agarre trabaja mucho.']
        ]
      },
      errores: [
        ['Balancearse', 'Cuerpo vertical y quieto. Si oscilas, pie en la silla y vuelve a empezar.'],
        ['Doblar los codos', 'Aquí no se tira. Brazos estirados.'],
        ['Soltarse de golpe', 'Baja siempre por la silla.'],
        ['Aguantar con dolor', 'Estirar se nota; un pinchazo no.']
      ],
      info: [
        ['Para qué sirve', 'Prepara hombros, dorsales y agarre para las dominadas.'],
        ['Nota', 'Es calentamiento: no llegues al límite del agarre.']
      ],
      temporizador: { series: 2, opciones: [20, 25], descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dominadas escapulares',
      indicacion: 'Colgado con los codos rectos: baja los hombros y el cuerpo sube unos centímetros.',
      ritmo: 'Pausa 1 s arriba',
      dosis: '2 × 6', dibujo: 'dominadasEsc', ancla: 'barra',
      claves: [
        ['Pasivo', 'Hombros hacia las orejas y cabeza hundida entre los brazos.'],
        ['Activo', 'Baja los hombros y junta los omóplatos, sin doblar los codos.'],
        ['Pausa', '1 s arriba, con los codos rectos.'],
        ['Volver', 'Despacio al pasivo. Eso es 1 repetición.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalDominadas',
        puntos: [
          ['Subir', 'Con la silla, y agarra los mangos paralelos.'],
          ['Brazos', 'Cuélgate con los brazos totalmente estirados.'],
          ['Cuerpo', 'Piernas juntas y abdomen firme.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Solo se mueven hombros y omóplatos: si no, es media dominada.'],
        ['Balancearse', 'Si oscilas, para y vuelve a empezar.'],
        ['Movimiento corto', 'Recorrido completo arriba y abajo.'],
        ['Ir rápido', 'Pausa real de 1 s arriba.']
      ],
      info: [
        ['Para qué sirve', 'Enseña a arrancar la dominada con la espalda: es el primer tramo de cada repetición.'],
        ['Nota', 'Pocas y limpias: guarda fuerzas para el bloque principal.']
      ],
      temporizador: { series: 2, reps: 6, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Jalón ligero a una mano',
      indicacion: 'De rodillas bajo la barra: lleva el codo a las costillas con una banda liviana.',
      ritmo: '2 s volver',
      dosis: '1 × 15 c/brazo', dibujo: 'jalon', ancla: 'mosqueton',
      claves: [
        ['Inicio', 'De rodillas, brazo estirado hacia arriba con algo de tensión.'],
        ['Hombro', 'Bájalo antes de doblar el codo.'],
        ['Tirar', 'Codo a las costillas, como en una dominada; vuelve en 2 s.'],
        ['Cambio', 'Termina las 15 y cambia de brazo: eso es 1 serie.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalJalon',
        puntos: [
          ['Banda', 'Una liviana, enganchada al mosquetón central de la barra.'],
          ['Posición', 'Arrodíllate debajo, con la mano libre en la cadera.'],
          ['Brazo', 'Agarra la banda con el brazo estirado y algo de tensión.']
        ]
      },
      errores: [
        ['Echarse atrás', 'Tronco recto: el codo baja hasta las costillas, no tires con el cuerpo.'],
        ['Banda dura', 'Es activación: con banda liviana basta.'],
        ['Tirar con la mano', 'Piensa en el codo, no en la mano.'],
        ['Hombro a la oreja', 'Baja el hombro primero.']
      ],
      info: [
        ['Para qué sirve', 'Activa el dorsal con el mismo gesto de la dominada.'],
        ['Nota', 'Sin fatiga: al terminar deberías sentirte más fuerte, no cansado.']
      ],
      temporizador: { series: 1, reps: 15, lado: 'por brazo', descanso: 30, preparacion: 5 }
    }
  ],
  // DOMINGO · Pecho con foco en volumen · calentamiento
  'Pecho · Volumen': [
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Brazos al frente a la altura del pecho; abre hasta que la banda toque el pecho.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15', dibujo: 'pullApart', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Brazos al frente, codos casi rectos.'],
        ['Abrir', 'Hasta tocar el pecho, soltando el aire.'],
        ['Pausa', 'Aguanta 1 s juntando los omóplatos.'],
        ['Volver', 'Controlando la banda.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Liviana.'],
          ['Manos', 'Al ancho de los hombros, palmas hacia abajo.'],
          ['Si no llega', 'Si no llega al pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Brazos rectos en cruz y hombros bajos, codos sin doblar.'],
        ['Arquear la espalda', 'El tronco no se mueve.'],
        ['Soltar de golpe', 'Controla la vuelta.'],
        ['Bajar los brazos', 'Siempre a la altura del pecho.']
      ],
      info: [
        ['Por qué en día de pecho', 'Activa la espalda alta, que estabiliza los hombros en las flexiones.'],
        ['Nota', 'Hoy hay muchas repeticiones de empuje: este equilibrio importa.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Flexiones escapulares',
      indicacion: 'En plancha con los brazos rectos, junta y separa los omóplatos.',
      ritmo: 'Pausa 1 s en cada punto',
      dosis: '2 × 10', dibujo: 'flexEscap', anclaNota: 'Sin ancla: en el suelo',
      claves: [
        ['Inicio', 'Plancha alta, manos bajo los hombros.'],
        ['Juntar', 'Sin doblar los codos, junta los omóplatos.'],
        ['Empujar', 'Empuja el suelo hasta separarlos al máximo.'],
        ['Pausa', '1 s en cada punto.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalFlexEscap',
        puntos: [
          ['Manos', 'Plancha alta, manos bajo los hombros.'],
          ['Cuerpo', 'Recto de la cabeza a los talones.'],
          ['Mirada', 'Al suelo, un poco por delante.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Solo se mueven los omóplatos: si no, es una flexión corta.'],
        ['Hundir la cadera', 'Abdomen y glúteos apretados.'],
        ['Recorrido corto', 'Máximo en los dos sentidos.'],
        ['Ir rápido', 'Lento y con pausa.']
      ],
      info: [
        ['Para qué sirve', 'Activa el serrato para empujar con el hombro estable.'],
        ['Nota', 'Calentamiento: sin fatiga.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dislocaciones con banda',
      indicacion: 'Arco completo con los brazos rectos: delante, arriba y detrás de la cadera.',
      ritmo: '2 s ida · 2 s vuelta',
      dosis: '2 × 10', dibujo: 'dislocaciones', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Banda delante de los muslos, agarre muy ancho y brazos rectos.'],
        ['Brazos', 'Codos estirados todo el recorrido.'],
        ['Ida', 'Sube por delante y sigue hasta detrás de la cadera.'],
        ['Vuelta', 'Por el mismo arco: 1 repetición.']
      ],
      agarre: {
        dibujo: 'agarreDislocaciones',
        puntos: [
          ['Banda', 'La más liviana que tengas.'],
          ['Dónde', 'Por la parte recta, con las manos muy separadas.'],
          ['Dificultad', 'Más separadas = más fácil.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Brazos rectos en una V ancha; si no pasan, separa más las manos.'],
        ['Sacar las costillas', 'Abdomen firme arriba.'],
        ['Ir con rebote', 'Lento y continuo.'],
        ['Forzar el paso', 'Separa más las manos.']
      ],
      info: [
        ['Para qué sirve', 'Abre el pecho y los hombros antes de un día con mucho volumen.'],
        ['Cómo progresar', 'Acerca un poco las manos cada semana si sale suave.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    }
  ],
  // LUNES · Bíceps · calentamiento
  'Bíceps': [
    {
      nombre: 'Colgarte de la barra',
      indicacion: 'Mangos paralelos y brazos estirados: deja caer el peso, cuerpo quieto.',
      dosis: '2 × 20 s', dibujo: 'colgado', ancla: 'barra',
      claves: [
        ['Subir', 'Apoya el peso poco a poco desde la silla.'],
        ['Brazos', 'Estirados, pies al aire.'],
        ['Cuerpo', 'Recto y quieto, piernas juntas. Relaja los hombros.'],
        ['Bajar', 'Apoyando los pies en la silla.']
      ],
      agarre: {
        dibujo: 'agarreNeutro',
        puntos: [
          ['Silla', 'Firme, debajo de la barra.'],
          ['Mangos', 'Paralelos, palmas enfrentadas.'],
          ['Manos secas', 'Sécatelas antes de colgarte.']
        ]
      },
      errores: [
        ['Balancearse', 'Cuerpo vertical y quieto: si oscilas, apoya un pie y vuelve a empezar.'],
        ['Doblar los codos', 'Brazos estirados.'],
        ['Soltarse de golpe', 'Baja por la silla.'],
        ['Aguantar con dolor', 'Un pinchazo en el hombro: para.']
      ],
      info: [
        ['Para qué sirve', 'Descomprime y prepara hombros, codos y agarre.'],
        ['Nota', 'Es calentamiento: sin llegar al límite.']
      ],
      temporizador: { series: 2, opciones: [20, 25], descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Brazos al frente a la altura del pecho; abre hasta que la banda toque el pecho.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15', dibujo: 'pullApart', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Brazos al frente, codos casi rectos.'],
        ['Abrir', 'Hasta tocar el pecho.'],
        ['Pausa', 'Aguanta 1 s juntando los omóplatos.'],
        ['Volver', 'Controlando la banda.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Liviana.'],
          ['Manos', 'Al ancho de los hombros.'],
          ['Si no llega', 'Si no llega al pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Brazos rectos en cruz y hombros bajos, codos sin doblar.'],
        ['Arquear la espalda', 'El tronco no se mueve.'],
        ['Soltar de golpe', 'Controla la vuelta.'],
        ['Bajar los brazos', 'Siempre a la altura del pecho.']
      ],
      info: [
        ['Para qué sirve', 'Activa la espalda alta y pone los hombros en su sitio antes de los curls.'],
        ['Nota', 'Calentamiento: sin fatiga.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Curl ligero a una mano',
      indicacion: 'Pisa una banda liviana y sube suave hasta el hombro sin mover el codo.',
      ritmo: 'Suave y continuo',
      dosis: '1 × 15 c/brazo', dibujo: 'curlLigero', anclaNota: 'Sin ancla: pisas la banda',
      claves: [
        ['Inicio', 'Brazo estirado y codo pegado; la otra mano en la cadera.'],
        ['Subir', 'Suave hasta el hombro, sin mover el codo.'],
        ['Bajar', 'Sin soltar la tensión.'],
        ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalCurl',
        puntos: [
          ['Banda', 'La más liviana.'],
          ['Pie', 'Písala con el pie del mismo lado.'],
          ['Mano libre', 'En la cadera.']
        ]
      },
      errores: [
        ['Codo adelantado', 'Codo pegado al costado: solo se mueve el antebrazo.'],
        ['Banda dura', 'Es calentamiento: liviana.'],
        ['Ir rápido', 'Suave y continuo.'],
        ['Muñeca doblada', 'Muñeca recta, alineada con el antebrazo.']
      ],
      info: [
        ['Para qué sirve', 'Calienta el codo y el bíceps antes de las series pesadas.'],
        ['Nota', 'Deberías acabar sin sensación de cansancio.']
      ],
      temporizador: { series: 1, reps: 15, lado: 'por brazo', descanso: 30, preparacion: 5 }
    }
  ],
  // MARTES · Espalda con foco en volumen · calentamiento
  'Espalda · Volumen': [
    {
      nombre: 'Colgarte de la barra',
      indicacion: 'Mangos paralelos y brazos estirados: deja caer el peso, cuerpo quieto.',
      dosis: '2 × 20 s', dibujo: 'colgado', ancla: 'barra',
      claves: [
        ['Subir', 'Apoya el peso poco a poco desde la silla.'],
        ['Brazos', 'Estirados, pies al aire.'],
        ['Cuerpo', 'Recto y quieto, piernas juntas. Relaja los hombros.'],
        ['Bajar', 'Apoyando los pies en la silla.']
      ],
      agarre: {
        dibujo: 'agarreNeutro',
        puntos: [
          ['Silla', 'Firme, debajo de la barra.'],
          ['Mangos', 'Paralelos, palmas enfrentadas.'],
          ['Manos secas', 'Sécatelas antes de colgarte.']
        ]
      },
      errores: [
        ['Balancearse', 'Cuerpo vertical y quieto: si oscilas, apoya un pie y vuelve a empezar.'],
        ['Doblar los codos', 'Brazos estirados.'],
        ['Soltarse de golpe', 'Baja por la silla.'],
        ['Aguantar con dolor', 'Un pinchazo en el hombro: para.']
      ],
      info: [
        ['Para qué sirve', 'Descomprime y prepara hombros, codos y agarre.'],
        ['Nota', 'Es calentamiento: sin llegar al límite.']
      ],
      temporizador: { series: 2, opciones: [20, 25], descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dominadas escapulares',
      indicacion: 'Colgado con los codos rectos: baja los hombros y junta los omóplatos.',
      ritmo: 'Pausa 1 s arriba',
      dosis: '2 × 6', dibujo: 'dominadasEsc', ancla: 'barra',
      claves: [
        ['Pasivo', 'Hombros subidos hacia las orejas.'],
        ['Activo', 'Baja los hombros y junta los omóplatos, sin doblar los codos.'],
        ['Pausa', 'Aguanta 1 s arriba.'],
        ['Volver', 'Despacio al pasivo.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalDominadas',
        puntos: [
          ['Subir', 'Con la silla.'],
          ['Mangos', 'Paralelos.'],
          ['Brazos', 'Totalmente estirados.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Solo se mueven hombros y omóplatos: si no, es media dominada.'],
        ['Balancearse', 'Para y vuelve a empezar.'],
        ['Movimiento corto', 'Recorrido completo.'],
        ['Ir rápido', 'Pausa real arriba.']
      ],
      info: [
        ['Para qué sirve', 'Activa la espalda para las dominadas asistidas.'],
        ['Nota', 'Pocas y limpias.']
      ],
      temporizador: { series: 2, reps: 6, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Brazos al frente a la altura del pecho; abre hasta que la banda toque el pecho.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15', dibujo: 'pullApart', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Brazos al frente, codos casi rectos.'],
        ['Abrir', 'Hasta tocar el pecho.'],
        ['Pausa', 'Aguanta 1 s juntando los omóplatos.'],
        ['Volver', 'Controlando la banda.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Liviana.'],
          ['Manos', 'Al ancho de los hombros.'],
          ['Si no llega', 'Si no llega al pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Brazos rectos en cruz y hombros bajos, codos sin doblar.'],
        ['Arquear la espalda', 'El tronco no se mueve.'],
        ['Soltar de golpe', 'Controla la vuelta.'],
        ['Bajar los brazos', 'Siempre a la altura del pecho.']
      ],
      info: [
        ['Para qué sirve', 'Activa la espalda alta antes del volumen de remo y dominadas.'],
        ['Nota', 'Calentamiento: sin fatiga.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    }
  ],
  // MIÉRCOLES · Tríceps · calentamiento
  'Tríceps': [
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Brazos al frente a la altura del pecho; abre hasta que la banda toque el pecho.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15', dibujo: 'pullApart', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Brazos al frente, codos casi rectos.'],
        ['Abrir', 'Hasta tocar el pecho.'],
        ['Pausa', 'Aguanta 1 s juntando los omóplatos.'],
        ['Volver', 'Controlando la banda.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Liviana.'],
          ['Manos', 'Al ancho de los hombros.'],
          ['Si no llega', 'Si no llega al pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Brazos rectos en cruz y hombros bajos, codos sin doblar.'],
        ['Arquear la espalda', 'El tronco no se mueve.'],
        ['Soltar de golpe', 'Controla la vuelta.'],
        ['Bajar los brazos', 'Siempre a la altura del pecho.']
      ],
      info: [
        ['Para qué sirve', 'Equilibra los hombros antes de un día de empuje.'],
        ['Nota', 'Calentamiento: sin fatiga.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Dislocaciones con banda',
      indicacion: 'Arco completo con los brazos rectos: delante, arriba y detrás.',
      ritmo: '2 s ida · 2 s vuelta',
      dosis: '2 × 10', dibujo: 'dislocaciones', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Agarre muy ancho, brazos rectos delante de los muslos.'],
        ['Brazos', 'Codos estirados.'],
        ['Ida', 'Sube y sigue hasta detrás de la cadera.'],
        ['Vuelta', 'Por el mismo arco.']
      ],
      agarre: {
        dibujo: 'agarreDislocaciones',
        puntos: [
          ['Banda', 'La más liviana.'],
          ['Dónde', 'Por la parte recta, con las manos muy separadas.'],
          ['Dificultad', 'Más separadas = más fácil.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Brazos rectos en V ancha: si no pasan, separa las manos.'],
        ['Sacar las costillas', 'Abdomen firme.'],
        ['Ir con rebote', 'Lento.'],
        ['Forzar el paso', 'Separa las manos.']
      ],
      info: [
        ['Para qué sirve', 'Movilidad de hombro para las extensiones por encima de la cabeza.'],
        ['Cómo progresar', 'Acerca las manos poco a poco.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Flexiones escapulares',
      indicacion: 'En plancha con los brazos rectos, junta y separa los omóplatos.',
      ritmo: 'Pausa 1 s en cada punto',
      dosis: '2 × 10', dibujo: 'flexEscap', anclaNota: 'Sin ancla: en el suelo',
      claves: [
        ['Inicio', 'Plancha alta, manos bajo los hombros, cuerpo recto.'],
        ['Juntar', 'Junta los omóplatos con los brazos rectos.'],
        ['Empujar', 'Empuja el suelo hasta separarlos.'],
        ['Pausa', '1 s en cada punto.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalFlexEscap',
        puntos: [
          ['Posición', 'Plancha alta.'],
          ['Manos', 'Bajo los hombros.'],
          ['Cuerpo', 'Recto.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Solo se mueven los omóplatos.'],
        ['Hundir la cadera', 'Abdomen apretado.'],
        ['Recorrido corto', 'Máximo en los dos sentidos.'],
        ['Ir rápido', 'Con pausa.']
      ],
      info: [
        ['Para qué sirve', 'Hombro estable para las flexiones diamante.'],
        ['Nota', 'Sin fatiga.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    }
  ],
  // VIERNES · Pecho (fuerza) · calentamiento
  'Pecho · Fuerza': [
    {
      nombre: 'Pull-aparts con banda',
      indicacion: 'Brazos al frente a la altura del pecho; abre hasta que la banda toque el pecho.',
      ritmo: '1 s abrir · 2 s volver',
      dosis: '2 × 15', dibujo: 'pullApart', anclaNota: 'Sin ancla: la banda va en tus manos',
      claves: [
        ['Inicio', 'Brazos estirados al frente, a la altura del pecho, codos casi rectos.'],
        ['Abrir', 'Hacia los lados hasta tocar el pecho, soltando el aire.'],
        ['Final', 'Aguanta 1 s juntando los omóplatos.'],
        ['Volver', 'En 2 s, controlando la banda.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'agarreBanda',
        puntos: [
          ['Banda', 'Una liviana: es calentamiento, no fuerza.'],
          ['Manos', 'Al ancho de los hombros, palmas hacia abajo.'],
          ['Si no llega', 'Si la banda no llega al pecho, separa más las manos.']
        ]
      },
      errores: [
        ['Hombros a las orejas', 'Brazos rectos en cruz y hombros bajos. Si no, banda más suave.'],
        ['Arquear la espalda', 'Abdomen firme; el tronco no se mueve.'],
        ['Soltar de golpe', 'La vuelta también cuenta: controla la banda.'],
        ['Bajar los brazos', 'La banda siempre a la altura del pecho.']
      ],
      info: [
        ['Por qué en día de pecho', 'Activa la espalda alta, que estabiliza los hombros en flexiones y presses.'],
        ['Cómo progresar', 'Acerca un poco las manos cuando las 15 salgan fáciles.']
      ],
      temporizador: { series: 2, reps: 15, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Flexiones escapulares',
      indicacion: 'En plancha con los brazos rectos, junta y separa los omóplatos.',
      ritmo: 'Pausa 1 s en cada punto',
      dosis: '2 × 10', dibujo: 'flexEscap', anclaNota: 'Sin ancla: en el suelo',
      claves: [
        ['Inicio', 'Plancha alta, brazos rectos, cuerpo de la cabeza a los talones.'],
        ['Juntar', 'Sin doblar los codos, deja que el pecho baje juntando los omóplatos.'],
        ['Empujar', 'Empuja el suelo hasta separar los omóplatos al máximo.'],
        ['Pausa', '1 s en cada punto. Ida y vuelta es 1 repetición.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalFlexEscap',
        puntos: [
          ['Manos', 'Justo debajo de los hombros, en plancha alta.'],
          ['Cuerpo', 'Pies juntos, recto de la cabeza a los talones.'],
          ['Mirada', 'Al suelo, un poco por delante de las manos.']
        ]
      },
      errores: [
        ['Doblar los codos', 'Codos rectos: solo se mueven los omóplatos. Si no, es una flexión corta.'],
        ['Hundir la cadera', 'Abdomen y glúteos apretados todo el rato.'],
        ['Recorrido corto', 'Busca el máximo en los dos sentidos.'],
        ['Ir rápido', 'Lento y con pausa: es activación, no fuerza.']
      ],
      info: [
        ['Para qué sirve', 'Activa el serrato, que mantiene el omóplato pegado a las costillas al empujar.'],
        ['Cómo progresar', 'Añade 2 s de pausa en cada punto.']
      ],
      temporizador: { series: 2, reps: 10, descanso: 30, preparacion: 5 }
    },
    {
      nombre: 'Flexiones lentas',
      indicacion: 'Baja en 3 s con el cuerpo recto como una tabla.',
      ritmo: '3 s abajo · 1 s arriba',
      dosis: '1 × 8', dibujo: 'flexiones', anclaNota: 'Sin ancla: en el suelo',
      claves: [
        ['Arriba', 'Brazos estirados, manos bajo los hombros, cuerpo como una tabla.'],
        ['Bajar', 'En 3 s, con los codos a unos 45° del cuerpo.'],
        ['Abajo', 'El pecho casi toca el suelo, sin apoyarte.'],
        ['Subir', 'En 1 s soltando el aire, hasta estirar los brazos.']
      ],
      agarre: {
        titulo: 'MONTAJE', dibujo: 'bienMalFlexiones',
        puntos: [
          ['Manos', 'Un poco más abiertas que los hombros.'],
          ['Dedos', 'Hacia delante y la palma bien apoyada.'],
          ['Cuerpo', 'Pies juntos y abdomen apretado.']
        ]
      },
      errores: [
        ['Cadera hundida', 'Cuerpo recto de la cabeza a los talones: la zona lumbar sufre.'],
        ['Codos en cruz', 'Abiertos a 90° castigan el hombro. Llévalos a 45°.'],
        ['Media repetición', 'Recorrido completo, pecho casi al suelo.'],
        ['Cabeza caída', 'Cuello alineado con la espalda.']
      ],
      info: [
        ['Para qué sirve', 'Prepara la técnica y la articulación antes de cargar con la banda.'],
        ['Nota', 'No es una serie de fuerza: deja el esfuerzo para el bloque principal.']
      ],
      temporizador: { series: 1, reps: 8, descanso: 30, preparacion: 5 }
    }
  ]
};

// ==========================================================
//  BLOQUES DEL DÍA: el orden de la sesión ("Siguiente →" pasa al siguiente,
//  "← Anterior" vuelve). Cada bloque: titulo, nota (opcional) y ejercicios
//  (misma estructura que el calentamiento).
//  temporizador con repeticiones: reps (número o texto, ej. '8–12'), lado
//  (ej. 'por brazo') y descansos: [segundos...] para elegir el descanso
//  (el de "descanso" sale marcado por defecto).
// ==========================================================
const BLOQUES = {
  // SÁBADO · Espalda con foco en dominadas
  'Espalda · Dominadas': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Espalda · Dominadas'] },
    {
      titulo: 'Principal · Dominadas', nota: 'Descanso 2 min',
      ejercicios: [
        {
          nombre: 'Dominadas sueltas',
          indicacion: 'Una dominada completa por serie: barbilla sobre la barra y abajo con los brazos estirados.',
          dosis: '4 × 1', dibujo: 'dominada', ancla: 'barra',
          claves: [
            ['Abajo', 'Brazos totalmente estirados: cada repetición empieza aquí.'],
            ['Arranque', 'Cuélgate y baja los hombros.'],
            ['Subir', 'Codos hacia las costillas hasta pasar la barbilla.'],
            ['Bajar', 'Controlando, hasta estirar los brazos del todo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalBarbilla',
            puntos: [
              ['Silla', 'Debajo de la barra, y las manos secas.'],
              ['Mangos', 'Paralelos: es el agarre más fácil y cómodo.'],
              ['Descanso', '2 minutos completos entre series.']
            ]
          },
          errores: [
            ['Barbilla que no llega', 'No cuenta. Mejor 1 completa que 3 a medias.'],
            ['Patada o impulso', 'Sube sin balanceo: el impulso no construye fuerza.'],
            ['Media bajada', 'Abajo, brazos totalmente estirados.'],
            ['Descansar poco', 'Con 2 min recuperas y la siguiente sale limpia.']
          ],
          info: [
            ['Por qué sueltas', 'Practicar la repetición completa sin fatiga es lo que más rápido sube el número.'],
            ['Cómo progresar', 'Cada 2 semanas prueba cuántas seguidas sacas. Con 3, pasa a series de 2.']
          ],
          temporizador: { series: 4, reps: 1, descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        },
        {
          nombre: 'Dominadas asistidas',
          indicacion: 'Con la banda de ayuda bajo un pie: sube hasta pasar la barbilla y baja en 2 s.',
          ritmo: '1 s subir · 2 s bajar',
          dosis: '3 × 5–8', dibujo: 'dominadaAsistida', ancla: 'barra',
          claves: [
            ['Abajo', 'Brazos estirados y hombros bajos. Aquí la banda empuja más.'],
            ['Subir', 'Hasta pasar la barbilla; la banda ayuda en el tramo difícil.'],
            ['Bajar', 'En 2 s, con una pausa breve abajo.'],
            ['Salir', 'Vuelve a la silla y saca el pie con cuidado.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalAsistida',
            puntos: [
              ['Banda', 'Pásala por la barra y por dentro de sí misma: queda ahorcada y fija.'],
              ['Pie o rodilla', 'Desde la silla mete el pie (más ayuda) o la rodilla (menos).'],
              ['Mangos', 'Agarra los paralelos antes de soltar la silla.']
            ]
          },
          errores: [
            ['Balancearse', 'Subida vertical y controlada: si la banda te lanza, baja más despacio.'],
            ['Rebotar abajo', 'La banda devuelve fuerza: pausa breve abajo.'],
            ['Soltar la banda', 'Nunca saques el pie con la banda estirada: pega fuerte.'],
            ['Media repetición', 'Barbilla sobre la barra y brazos estirados abajo.']
          ],
          info: [
            ['Para qué sirve', 'Te deja hacer más repeticiones completas de las que harías solo.'],
            ['Cómo progresar', 'Con 3 × 8, pasa a una banda más fina o a la rodilla.']
          ],
          temporizador: { series: 3, reps: '5–8', descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        },
        {
          nombre: 'Dominadas negativas',
          indicacion: 'Empieza arriba desde la silla y baja en 5 s frenando todo el recorrido.',
          ritmo: 'Bajada en 5 s',
          dosis: '3 × 3', dibujo: 'negativa', ancla: 'barra',
          claves: [
            ['Arriba', 'Desde la silla, colócate con la barbilla sobre la barra.'],
            ['Bajar', 'Levanta los pies y baja en 5 s, cuéntalos en voz alta.'],
            ['Abajo', 'Brazos estirados; apoya los pies en la silla.'],
            ['Repetir', 'Vuelve arriba con la silla y repite.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalNegativa',
            puntos: [
              ['Silla', 'Debajo de la barra, a una altura que te deje llegar arriba.'],
              ['Mangos', 'Agarra los mangos paralelos.'],
              ['Contar', 'Cuenta los 5 segundos en voz alta.']
            ]
          },
          errores: [
            ['Caer de golpe', 'Bajada constante, sin tramos rápidos: caer castiga codos y hombros.'],
            ['Caer al final', 'El último tramo también se controla.'],
            ['Hacer muchas', 'Pocas y de calidad: son muy exigentes.'],
            ['Sin silla', 'Siempre silla para subir y para bajar.']
          ],
          info: [
            ['Para qué sirve', 'La bajada genera fuerza muy rápido: la vía clásica para pasar de 1 a varias.'],
            ['Cómo progresar', 'Alarga la bajada a 6–8 s cuando las 3 salgan controladas.']
          ],
          temporizador: { series: 3, reps: 3, descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Complementarios', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Jalón a una mano',
          indicacion: 'De rodillas bajo la barra: el codo baja hasta las costillas, como en la dominada.',
          ritmo: '1 s tirar · 2 s volver',
          dosis: '3 × 12–15 c/brazo', dibujo: 'jalon', ancla: 'mosqueton',
          claves: [
            ['Inicio', 'De rodillas, la banda en el mosquetón y el brazo estirado.'],
            ['Tirar', 'Baja el hombro y lleva el codo hacia las costillas.'],
            ['Pausa', 'Aprieta 1 s abajo y vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalJalon',
            puntos: [
              ['Banda', 'Engánchala al mosquetón central de la barra.'],
              ['Posición', 'Arrodíllate debajo, con la mano libre en la cadera.'],
              ['Dureza', 'Una banda con la que llegues justo a 12–15.']
            ]
          },
          errores: [
            ['Echarse atrás', 'Tronco recto: solo trabaja el brazo.'],
            ['Tirar con la mano', 'Piensa en llevar el codo al bolsillo.'],
            ['Girar el tronco', 'Los hombros siguen mirando al frente.'],
            ['Soltar arriba', 'Vuelve controlando la banda.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal ancho y bíceps, con el mismo gesto que la dominada.'],
            ['Cómo progresar', 'Banda más dura cuando las 15 salgan fáciles.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Remo a una mano',
          indicacion: 'Mirando a la pared: el codo va atrás pegado al costado hasta juntar el omóplato.',
          ritmo: 'Pausa 1 s atrás · 2 s volver',
          dosis: '3 × 12 c/brazo', dibujo: 'remo', ancla: 'media',
          claves: [
            ['Inicio', 'Brazo estirado hacia el ancla, pecho fuera y hombro bajo.'],
            ['Tirar', 'Codo atrás, pegado al cuerpo.'],
            ['Pausa', '1 s juntando el omóplato; vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalRemo',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla media, a la altura de la cintura.'],
              ['Pies', 'Adelanta el pie contrario al brazo que trabaja.'],
              ['Tensión', 'Retrocede hasta tener tensión con el brazo estirado.']
            ]
          },
          errores: [
            ['Echarse atrás', 'Tronco quieto. Si tiras con el cuerpo, acércate a la pared.'],
            ['Codo abierto', 'Pegado al costado, no en cruz.'],
            ['Girar el tronco', 'Los hombros siguen mirando a la pared.'],
            ['Sin pausa', 'Junta el omóplato 1 s atrás.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal, romboides y trapecio medio: espalda gruesa y postura.'],
            ['Cómo progresar', 'Retrocede un paso o usa una banda más dura.']
          ],
          temporizador: { series: 3, reps: 12, lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Pullover a una mano',
          indicacion: 'Mirando al ancla alta, algo inclinado: baja el brazo recto en arco hasta el muslo.',
          ritmo: 'Pausa 1 s abajo · 2 s volver',
          dosis: '3 × 12 c/brazo', dibujo: 'pullover', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo recto apuntando al ancla, hombro bajo.'],
            ['Bajar', 'En arco hasta el muslo, con el brazo recto o casi.'],
            ['Pausa', 'Aprieta el dorsal 1 s y vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPullover',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla alta.'],
              ['Postura', 'Retrocede e inclínate un poco hacia delante desde la cadera.'],
              ['Brazo', 'Mano libre en la cadera; el que trabaja, recto hacia el ancla.']
            ]
          },
          errores: [
            ['Doblar el codo', 'Brazo recto en arco: con el codo doblado se convierte en un remo.'],
            ['Encoger el hombro', 'Hombro bajo antes de empezar.'],
            ['Mover el tronco', 'La inclinación es fija; solo baja el brazo.'],
            ['Subir rápido', 'Controla la vuelta hasta arriba.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal ancho aislado, sin que ayude el bíceps.'],
            ['Cómo progresar', 'Retrocede un paso más o alarga la pausa abajo.']
          ],
          temporizador: { series: 3, reps: 12, lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final en la barra', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Colgarte al máximo',
          indicacion: 'El mismo colgado del calentamiento, pero ahora buscas tu máximo.',
          dosis: '2 series al máximo', dibujo: 'colgado', ancla: 'barra',
          claves: [
            ['Objetivo', 'Elige en el temporizador 30, 45 o 60 s.'],
            ['Aguantar', 'Cuerpo recto y quieto, brazos estirados.'],
            ['Si puedes', 'Al llegar al objetivo, sigue un poco más.'],
            ['Apunta', 'Tu mejor tiempo, para superarlo la próxima semana.']
          ],
          agarre: {
            dibujo: 'agarreNeutro',
            puntos: [
              ['Silla', 'Debajo de la barra, y manos secas.'],
              ['Mangos', 'Paralelos, palmas enfrentadas.'],
              ['Al abrirse', 'Cuando el agarre se abra, baja por la silla.']
            ]
          },
          errores: [
            ['Balancearse', 'Cuerpo vertical y quieto: si te balanceas para aguantar, la serie terminó.'],
            ['Soltarse de golpe', 'Baja siempre por la silla.'],
            ['Doblar los codos', 'Brazos estirados de principio a fin.'],
            ['Aguantar el aire', 'Respira normal.']
          ],
          info: [
            ['Para qué sirve', 'El agarre suele fallar antes que la espalda: entrenarlo sube tus dominadas.'],
            ['Cómo progresar', 'Cuando pases de 60 s, prueba el agarre ancho.']
          ],
          temporizador: { series: 2, opciones: [30, 45, 60], descanso: 60, preparacion: 5 }
        }
      ]
    }
  ],
  // DOMINGO · Pecho con foco en volumen
  'Pecho · Volumen': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Pecho · Volumen'] },
    {
      titulo: 'Principal · Volumen', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Flexiones clásicas',
          indicacion: 'Cuerpo como una tabla: baja en 2 s hasta casi tocar el suelo y sube en 1.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '4 × 15–20', dibujo: 'flexClasica', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Arriba', 'Brazos estirados, manos un poco más abiertas que los hombros.'],
            ['Bajar', 'En 2 s, pecho casi al suelo, codos a unos 45°.'],
            ['Subir', 'En 1 s soltando el aire.'],
            ['Parar', '2 repeticiones antes de que se rompa la técnica.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFlexiones',
            puntos: [
              ['Manos', 'Un poco más abiertas que los hombros.'],
              ['Cuerpo', 'Pies juntos, abdomen y glúteos apretados.'],
              ['Cuello', 'Alineado con la espalda.']
            ]
          },
          errores: [
            ['Cadera hundida', 'Cuerpo recto de la cabeza a los talones: si cae por la fatiga, la serie terminó.'],
            ['Codos en cruz', 'A 45°, no a 90°.'],
            ['Medias repeticiones', 'Con el cansancio se acortan: vigílalo.'],
            ['Descansar arriba', 'Ritmo constante dentro de la serie.']
          ],
          info: [
            ['Para qué sirve', 'Mucho volumen para el pecho con una técnica que ya dominas.'],
            ['Cómo progresar', 'Cuando salgan 4 × 20, añade una pausa de 1 s abajo.']
          ],
          temporizador: { series: 4, reps: '15–20', descanso: 60, descansos: [45, 60, 90], preparacion: 5 }
        },
        {
          nombre: 'Flexiones pies elevados',
          indicacion: 'Pies en una silla firme y manos en el suelo: baja hasta que la cara casi toque el suelo.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '3 × 12–15', dibujo: 'piesElevados', anclaNota: 'Sin ancla: suelo y silla',
          claves: [
            ['Arriba', 'Cuerpo inclinado hacia abajo, recto de los pies a la cabeza.'],
            ['Bajar', 'En 2 s, con los codos a 45°.'],
            ['Subir', 'En 1 s, sin doblar la cadera.'],
            ['Parar', 'Si la cadera cae, termina la serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPiesElevados',
            puntos: [
              ['Silla', 'Firme y contra la pared para que no se deslice.'],
              ['Pies', 'Apoya los empeines en la silla y las manos en el suelo.'],
              ['Manos', 'Algo más abiertas que los hombros.']
            ]
          },
          errores: [
            ['Cadera hundida', 'Cuerpo en línea de los pies a la cabeza: si no, la lumbar sufre.'],
            ['Silla que se mueve', 'Apóyala siempre contra la pared.'],
            ['Cabeza adelantada', 'Baja el pecho, no la cara.'],
            ['Codos en cruz', 'A 45° del cuerpo.']
          ],
          info: [
            ['Qué trabaja', 'Parte alta del pecho y hombros, con más carga que la flexión normal.'],
            ['Cómo progresar', 'Una silla más alta o una pausa abajo.']
          ],
          temporizador: { series: 3, reps: '12–15', descanso: 60, descansos: [45, 60, 90], preparacion: 5 }
        },
        {
          nombre: 'Flexiones abiertas',
          indicacion: 'Manos a 1,5 veces el ancho de los hombros: el pecho baja entre las manos.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '3 × 12–15', dibujo: 'flexAbiertas', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Arriba', 'Manos a una vez y media el ancho de los hombros.'],
            ['Bajar', 'Los dos codos a la vez, pecho entre las manos en 2 s.'],
            ['Subir', 'En 1 s soltando el aire.'],
            ['Codos', 'Alineados sobre las muñecas.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalAbiertas',
            puntos: [
              ['Manos', 'A una vez y media el ancho de los hombros.'],
              ['Dedos', 'Girados un poco hacia fuera.'],
              ['Cuerpo', 'Recto y apretado.']
            ]
          },
          errores: [
            ['Cadera alta', 'Cuerpo recto también con las manos abiertas: si no, se pierde el pecho.'],
            ['Manos demasiado abiertas', 'Si duele el hombro, ciérralas un poco.'],
            ['Recorrido corto', 'Pecho cerca del suelo.'],
            ['Rebote abajo', 'Controla el cambio de dirección.']
          ],
          info: [
            ['Qué trabaja', 'Más pectoral y menos tríceps que la flexión normal.'],
            ['Cómo progresar', 'Añade 1 s de pausa abajo cuando salgan 3 × 15.']
          ],
          temporizador: { series: 3, reps: '12–15', descanso: 60, descansos: [45, 60, 90], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Accesorios', nota: 'Descanso 45 s',
      ejercicios: [
        {
          nombre: 'Press de pecho a una mano',
          indicacion: 'De espaldas a la pared: empuja al frente a ritmo continuo, series largas.',
          ritmo: 'Continuo',
          dosis: '3 × 15–20 c/brazo', dibujo: 'pressPecho', ancla: 'media',
          claves: [
            ['Inicio', 'De espaldas al ancla media, mano en el pecho.'],
            ['Empujar', 'Al frente y vuelve a ritmo continuo, sin girar el tronco.'],
            ['Codo', 'A 45° del cuerpo en cada vuelta.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPressPecho',
            puntos: [
              ['Banda', 'Algo más suave que el viernes: hoy son más repeticiones.'],
              ['Pies', 'De espaldas al ancla media, pie contrario adelantado.'],
              ['Tensión', 'Avanza hasta tener tensión con la mano en el pecho.']
            ]
          },
          errores: [
            ['Arquear la espalda', 'Tronco firme, también cuando llega la fatiga.'],
            ['Girar el tronco', 'Empuja solo el brazo.'],
            ['Acortar al final', 'Recorrido completo hasta la última repetición.'],
            ['Dejarse llevar', 'Controla la vuelta.']
          ],
          info: [
            ['Qué trabaja', 'Pectoral medio con series largas: resistencia muscular.'],
            ['Cómo progresar', 'Cuando salgan 3 × 20, da un paso más lejos.']
          ],
          temporizador: { series: 3, reps: '15–20', lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        },
        {
          nombre: 'Apertura de abajo arriba',
          indicacion: 'De espaldas al ancla baja: sube el brazo en arco hasta delante de la cara.',
          ritmo: 'Pausa 1 s arriba · 2 s bajar',
          dosis: '3 × 15 c/brazo', dibujo: 'aperturaArriba', ancla: 'baja',
          claves: [
            ['Inicio', 'Brazo abajo y hacia fuera, codo algo flexionado, otra mano en la cadera.'],
            ['Subir', 'En arco hasta delante de la cara.'],
            ['Pausa', 'Aprieta 1 s arriba y baja en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalAperturaArriba',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla baja.'],
              ['Posición', 'De espaldas a la pared, un paso adelante.'],
              ['Brazo', 'Abajo y hacia fuera, codo ligeramente flexionado.']
            ]
          },
          errores: [
            ['Codo muy doblado', 'Hombro bajo y codo fijo: si se dobla, se convierte en un press.'],
            ['Subir de más', 'Hasta la altura de la cara, no por encima de la cabeza.'],
            ['Girar el tronco', 'El pecho mira al frente.'],
            ['Banda dura', 'Series largas: banda liviana o media.']
          ],
          info: [
            ['Qué trabaja', 'Parte alta del pecho, con un ángulo que no dan las flexiones.'],
            ['Cómo progresar', 'Da un paso más adelante o alarga la pausa arriba.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        },
        {
          nombre: 'Cruce a una mano',
          indicacion: 'De espaldas al ancla alta: baja el brazo en arco hasta la cadera contraria.',
          ritmo: 'Pausa 1 s abajo · 2 s volver',
          dosis: '3 × 15–20 c/brazo', dibujo: 'cruce', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo abierto a la altura del hombro, mano libre en la cadera.'],
            ['Codo', 'Ligeramente flexionado y fijo.'],
            ['Bajar', 'En arco hasta la cadera contraria; aprieta 1 s.'],
            ['Volver', 'En 2 s. Termina y cambia de brazo: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCruce',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla alta.'],
              ['Posición', 'De espaldas, un paso adelante e inclínate un poco.'],
              ['Mano libre', 'En la cadera.']
            ]
          },
          errores: [
            ['Encoger el hombro', 'Hombro bajo y codo fijo, sin doblarlo.'],
            ['Girar el tronco', 'Solo se mueve el brazo.'],
            ['Subir de golpe', 'Controla la vuelta.'],
            ['Sin pausa', 'La pausa abajo es clave.']
          ],
          info: [
            ['Qué trabaja', 'Parte baja del pectoral.'],
            ['Cómo progresar', 'Aléjate un paso más cuando salgan 3 × 20.']
          ],
          temporizador: { series: 3, reps: '15–20', lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Flexiones por tiempo',
          indicacion: 'Todas las flexiones limpias que puedas hasta la alarma.',
          ritmo: 'Rápido pero controlado',
          dosis: '2 × 40 s', dibujo: 'flexTiempo', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Preparación', 'Ponte en posición en los 5 s de preparación.'],
            ['Durante', 'Flexiones completas a ritmo constante.'],
            ['Si se rompe', 'Descansa arriba y sigue.'],
            ['Apunta', 'El número de cada serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFlexiones',
            puntos: [
              ['Tiempo', 'Elige 30, 40 o 45 s en el temporizador.'],
              ['Posición', 'Colócate arriba durante la preparación.'],
              ['Apuntar', 'Ten a mano algo para apuntar tus repeticiones.']
            ]
          },
          errores: [
            ['Cadera hundida', 'Aunque haya prisa, el cuerpo sigue recto: si no, esas no cuentan.'],
            ['Medias repeticiones', 'Solo cuentan las completas.'],
            ['Aguantar el aire', 'Respira en cada repetición.'],
            ['Rebotar abajo', 'Ritmo rápido, pero controlado.']
          ],
          info: [
            ['Para qué sirve', 'Remata el pecho con volumen y te da un número para medir tu progreso.'],
            ['Cómo progresar', 'Supera tu número de la semana anterior.']
          ],
          temporizador: { series: 2, opciones: [30, 40, 45], porDefecto: 40, descanso: 60, preparacion: 5 }
        }
      ]
    }
  ],
  // LUNES · Bíceps
  'Bíceps': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Bíceps'] },
    {
      titulo: 'Principal', nota: 'Descanso 60 s–2 min',
      ejercicios: [
        {
          nombre: 'Curl a una mano',
          indicacion: 'Pisa la banda y sube la mano hasta el hombro con el codo pegado al costado.',
          ritmo: '1 s arriba · 3 s abajo',
          dosis: '4 × 10–12 c/brazo', dibujo: 'curl', anclaNota: 'Sin ancla: pisas la banda',
          claves: [
            ['Inicio', 'Brazo estirado, palma hacia delante, codo pegado.'],
            ['Subir', 'En 1 s soltando el aire; pausa arriba.'],
            ['Bajar', 'En 3 s hasta estirar del todo.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCurl',
            puntos: [
              ['Pie', 'Pisa la banda con el pie del lado que trabaja.'],
              ['Banda', 'Una con la que llegues justo a 10–12.'],
              ['Postura', 'Mano libre en la cadera, rodillas algo flexionadas.']
            ]
          },
          errores: [
            ['Codo adelantado', 'El codo se queda pegado: si se adelanta, el cuerpo se echa atrás a ayudar.'],
            ['Media bajada', 'Estira el brazo del todo abajo.'],
            ['Balancear', 'Si necesitas impulso, banda más suave.'],
            ['Muñeca doblada', 'Muñeca recta.']
          ],
          info: [
            ['Qué trabaja', 'Bíceps braquial, sobre todo la cabeza larga.'],
            ['Cómo progresar', 'Separa más el pie o usa una banda más dura cuando salgan 4 × 12.']
          ],
          temporizador: { series: 4, reps: '10–12', lado: 'por brazo', descanso: 75, descansos: [60, 75, 90], preparacion: 5 }
        },
        {
          nombre: 'Curl martillo a una mano',
          indicacion: 'Como el curl, con la palma hacia el cuerpo: sube con el pulgar arriba.',
          ritmo: '3 s abajo',
          dosis: '3 × 10–12 c/brazo', dibujo: 'curlMartillo', anclaNota: 'Sin ancla: pisas la banda',
          claves: [
            ['Inicio', 'Palma mirando al cuerpo, como si sujetaras un martillo.'],
            ['Subir', 'Con el pulgar arriba hasta el hombro.'],
            ['Bajar', 'En 3 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCurl',
            puntos: [
              ['Pie', 'Pisa la banda con el pie del lado que trabaja.'],
              ['Agarre', 'Con la palma hacia dentro.'],
              ['Mano libre', 'En la cadera.']
            ]
          },
          errores: [
            ['Codo adelantado', 'Codo pegado: si se adelanta, el hombro hace el trabajo.'],
            ['Girar la muñeca', 'La palma se queda hacia dentro todo el recorrido.'],
            ['Ir rápido', '3 segundos de bajada.'],
            ['Encoger el hombro', 'Hombro bajo.']
          ],
          info: [
            ['Qué trabaja', 'Braquial y antebrazo: dan grosor al brazo.'],
            ['Cómo progresar', 'Banda más dura cuando salgan 3 × 12.']
          ],
          temporizador: { series: 3, reps: '10–12', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Dominadas supinas asistidas',
          indicacion: 'Barra central con las palmas hacia ti y la banda de ayuda bajo un pie.',
          ritmo: 'Bajar en 2–3 s',
          dosis: '3 × 5–8', dibujo: 'dominadaSupina', ancla: 'barra',
          claves: [
            ['Abajo', 'Brazos estirados y hombros bajos.'],
            ['Subir', 'Hasta pasar la barbilla: el bíceps trabaja mucho más.'],
            ['Bajar', 'En 2–3 s.'],
            ['Salir', 'A la silla y saca el pie con cuidado.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalAsistida',
            puntos: [
              ['Banda', 'Ahorcada en la barra, no en el mosquetón.'],
              ['Agarre', 'Barra central, palmas hacia ti, al ancho de los hombros.'],
              ['Pie o rodilla', 'Pie en la banda para más ayuda, rodilla para menos.']
            ]
          },
          errores: [
            ['Balancearse', 'Subida vertical: si la banda te lanza, baja más despacio.'],
            ['Media repetición', 'Barbilla arriba y brazos estirados abajo.'],
            ['Soltar la banda', 'Nunca con la banda estirada.'],
            ['Agarre muy estrecho', 'Al ancho de los hombros.']
          ],
          info: [
            ['Qué trabaja', 'Bíceps y dorsal a la vez. También suma para tus dominadas.'],
            ['Cómo progresar', 'Banda más fina cuando salgan 3 × 8.']
          ],
          temporizador: { series: 3, reps: '5–8', descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Accesorios', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Curl detrás del cuerpo',
          indicacion: 'De espaldas al ancla baja: dobla el codo hasta el hombro con el codo por detrás.',
          ritmo: 'Pausa 1 s arriba · 3 s abajo',
          dosis: '3 × 12–15 c/brazo', dibujo: 'curlDetras', ancla: 'baja',
          claves: [
            ['Inicio', 'Brazo estirado por detrás del cuerpo.'],
            ['Subir', 'La mano hacia el hombro sin adelantar el codo.'],
            ['Pausa', 'Aprieta 1 s arriba y baja en 3 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCurlDetras',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla baja.'],
              ['Posición', 'De espaldas a la pared, da un paso adelante.'],
              ['Brazo', 'Queda estirado por detrás del cuerpo.']
            ]
          },
          errores: [
            ['Codo hacia delante', 'El codo se queda detrás: si se adelanta, pierde el efecto.'],
            ['Inclinarse', 'Tronco recto, pecho fuera.'],
            ['Banda dura', 'Mejor media y con buen recorrido.'],
            ['Bajar de golpe', 'Controla la bajada.']
          ],
          info: [
            ['Qué trabaja', 'Bíceps en estiramiento: un estímulo que no da el curl normal.'],
            ['Cómo progresar', 'Otro paso adelante o banda más dura.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Curl alto a una mano',
          indicacion: 'De costado al ancla alta: dobla el codo hacia la cabeza, como enseñando el bíceps.',
          ritmo: 'Pausa 1 s arriba · 2 s volver',
          dosis: '3 × 12–15 c/brazo', dibujo: 'curlAlto', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo estirado hacia el ancla, a la altura del hombro.'],
            ['Doblar', 'Lleva la mano hacia la cabeza; el codo no se mueve.'],
            ['Pausa', 'Aprieta 1 s y vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCurlAlto',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla alta.'],
              ['Posición', 'De costado, aléjate hasta tener tensión.'],
              ['Brazo', 'A la altura del hombro, mano libre en la cadera.']
            ]
          },
          errores: [
            ['Codo que cae', 'El codo se queda alto y quieto: si cae, es un curl normal.'],
            ['Girar el tronco', 'De costado todo el rato.'],
            ['Hombro a la oreja', 'Hombro bajo.'],
            ['Estirar a medias', 'Brazo recto al volver.']
          ],
          info: [
            ['Qué trabaja', 'Bíceps en su posición más contraída, sobre todo la cabeza corta.'],
            ['Cómo progresar', 'Aléjate de la pared o alarga la pausa.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final', nota: 'Descanso 30 s',
      ejercicios: [
        {
          nombre: 'Isométrico de curl a 90°',
          indicacion: 'Sube hasta que el antebrazo quede horizontal y aguanta quieto.',
          ritmo: 'Quieto · respira normal',
          dosis: '2 × 30 s c/brazo', dibujo: 'isoCurl', anclaNota: 'Sin ancla: pisas la banda',
          claves: [
            ['Inicio', 'Pisa la banda con el brazo estirado, como en el curl.'],
            ['Subir', 'Hasta 90°: antebrazo horizontal.'],
            ['Aguantar', 'Quieto, sin moverte.'],
            ['Cambio', 'Al sonar la alarma, cambia de brazo: los dos son 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalIsoCurl',
            puntos: [
              ['Banda', 'Media o dura.'],
              ['Tiempo', 'Temporizador listo: elige 20, 30 o 40 s.'],
              ['Mano libre', 'En la cadera.']
            ]
          },
          errores: [
            ['Echarse atrás', 'Codo pegado y antebrazo horizontal, sin inclinarte para aguantar.'],
            ['Bajar poco a poco', 'La altura no cambia.'],
            ['Aguantar el aire', 'Respira normal.'],
            ['Codo adelantado', 'Pegado al costado.']
          ],
          info: [
            ['Para qué sirve', 'Remata el bíceps con tensión constante.'],
            ['Cómo progresar', 'Banda más dura o 40 s.']
          ],
          temporizador: { series: 2, opciones: [20, 30, 40], porDefecto: 30, lado: 'por brazo', descanso: 30, preparacion: 5 }
        }
      ]
    }
  ],
  // MARTES · Espalda con foco en volumen
  'Espalda · Volumen': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Espalda · Volumen'] },
    {
      titulo: 'Principal · Volumen', nota: 'Descanso 60–90 s',
      ejercicios: [
        {
          nombre: 'Dominadas asistidas',
          indicacion: 'Con más ayuda que el sábado: muchas repeticiones completas, barbilla sobre la barra.',
          ritmo: '2 s bajar',
          dosis: '4 × 8–10', dibujo: 'dominadaAsistida', ancla: 'barra',
          claves: [
            ['Abajo', 'Brazos estirados y hombros bajos, banda bajo el pie.'],
            ['Subir', 'Hasta pasar la barbilla en cada repetición.'],
            ['Bajar', 'En 2 s, con una pausa breve abajo.'],
            ['Salir', 'Desde la silla, sal de la banda con cuidado.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalAsistida',
            puntos: [
              ['Banda', 'Más gruesa que el sábado: hoy buscas repeticiones.'],
              ['Colocación', 'Ahorcada en la barra.'],
              ['Mangos', 'Paralelos.']
            ]
          },
          errores: [
            ['Balancearse', 'Subida vertical y controlada, sin rebote de la banda.'],
            ['Rebotar abajo', 'Pausa breve abajo.'],
            ['Soltar la banda', 'Nunca estirada.'],
            ['Media repetición', 'Recorrido completo.']
          ],
          info: [
            ['Por qué distinto al sábado', 'El sábado es fuerza; hoy, muchas repeticiones completas para sumar práctica.'],
            ['Cómo progresar', 'Con 4 × 10, pasa a una banda más fina.']
          ],
          temporizador: { series: 4, reps: '8–10', descanso: 90, descansos: [60, 90, 120], preparacion: 5 }
        },
        {
          nombre: 'Remo a una mano',
          indicacion: 'Mirando al ancla media: codo atrás pegado al costado, pausa 1 s.',
          ritmo: 'Pausa 1 s atrás · 2 s volver',
          dosis: '4 × 12–15 c/brazo', dibujo: 'remo', ancla: 'media',
          claves: [
            ['Inicio', 'Brazo estirado hacia el ancla, pecho fuera y hombro bajo.'],
            ['Tirar', 'Codo atrás, pegado al costado.'],
            ['Pausa', '1 s juntando el omóplato; vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalRemo',
            puntos: [
              ['Ancla', 'Banda en el ancla media.'],
              ['Pies', 'Pie contrario adelantado.'],
              ['Tensión', 'Retrocede hasta tener tensión.']
            ]
          },
          errores: [
            ['Echarse atrás', 'Tronco quieto: el codo va atrás, no el cuerpo.'],
            ['Codo abierto', 'Pegado al costado.'],
            ['Girar el tronco', 'Hombros hacia la pared.'],
            ['Sin pausa', 'Junta el omóplato 1 s.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal, romboides y trapecio medio.'],
            ['Cómo progresar', 'Retrocede o usa una banda más dura.']
          ],
          temporizador: { series: 4, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Jalón a una mano',
          indicacion: 'De rodillas bajo la barra: el codo baja hasta las costillas.',
          ritmo: '1 s tirar · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'jalon', ancla: 'mosqueton',
          claves: [
            ['Inicio', 'De rodillas, brazo estirado hacia el mosquetón.'],
            ['Tirar', 'Baja el hombro y lleva el codo a las costillas.'],
            ['Pausa', 'Aprieta 1 s y vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalJalon',
            puntos: [
              ['Banda', 'En el mosquetón central.'],
              ['Posición', 'De rodillas, mano libre en la cadera.'],
              ['Tensión', 'Con el brazo estirado.']
            ]
          },
          errores: [
            ['Echarse atrás', 'Tronco recto: trabaja el brazo.'],
            ['Tirar con la mano', 'Piensa en el codo.'],
            ['Girar el tronco', 'Hombros al frente.'],
            ['Soltar arriba', 'Controla la vuelta.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal con el gesto de la dominada.'],
            ['Cómo progresar', 'Banda más dura cuando los 3 × 15 sean fáciles.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Complementarios', nota: 'Descanso 45 s',
      ejercicios: [
        {
          nombre: 'Pullover a una mano',
          indicacion: 'Brazo recto apuntando al ancla alta: bájalo en arco hasta el muslo.',
          ritmo: 'Pausa 1 s abajo · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'pullover', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo recto hacia el ancla alta, algo inclinado.'],
            ['Bajar', 'Con el brazo recto, hasta el muslo.'],
            ['Pausa', 'Aprieta 1 s y vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPullover',
            puntos: [
              ['Ancla', 'Banda en el ancla alta.'],
              ['Postura', 'Algo inclinado hacia delante.'],
              ['Mano libre', 'En la cadera.']
            ]
          },
          errores: [
            ['Doblar el codo', 'Brazo recto en arco: con el codo doblado es un remo.'],
            ['Encoger el hombro', 'Hombro bajo.'],
            ['Mover el tronco', 'La inclinación es fija.'],
            ['Subir rápido', 'Controla la vuelta.']
          ],
          info: [
            ['Qué trabaja', 'Dorsal aislado.'],
            ['Cómo progresar', 'Retrocede un paso.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        },
        {
          nombre: 'Pájaro a una mano',
          indicacion: 'De costado al ancla media: abre el brazo casi recto hacia fuera y atrás.',
          ritmo: '1 s abrir · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'pajaros', ancla: 'media',
          claves: [
            ['Inicio', 'De costado, la mano lejana agarra la banda por delante.'],
            ['Brazo', 'Casi recto, hombro bajo.'],
            ['Abrir', 'Hacia fuera y atrás; vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de lado, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPajaros',
            puntos: [
              ['Ancla', 'Banda en el ancla media.'],
              ['Posición', 'De costado, agarra con la mano más alejada.'],
              ['Tensión', 'Con el brazo por delante.']
            ]
          },
          errores: [
            ['Doblar el codo', 'Brazo casi recto: con el codo doblado es un remo.'],
            ['Banda dura', 'Liviana y con recorrido.'],
            ['Girar el tronco', 'Quieto, de costado.'],
            ['Subir el hombro', 'Lejos de la oreja.']
          ],
          info: [
            ['Qué trabaja', 'Deltoide posterior y romboides.'],
            ['Cómo progresar', 'Aléjate un poco más.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        },
        {
          nombre: 'Face pull a una mano',
          indicacion: 'Tira hacia la cara con el codo alto hasta dejar la mano junto a la oreja.',
          ritmo: 'Pausa 1 s arriba',
          dosis: '3 × 15 c/brazo', dibujo: 'facePull', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo estirado hacia el ancla alta, pecho fuera.'],
            ['Hombro', 'Bajo antes de tirar.'],
            ['Tirar', 'Con el codo alto; pausa 1 s con la mano junto a la oreja.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFace',
            puntos: [
              ['Ancla', 'Banda en el ancla alta.'],
              ['Mano', 'Un asa, palma hacia abajo.'],
              ['Posición', 'Paso atrás; mano libre en la cadera.']
            ]
          },
          errores: [
            ['Codo bajo', 'Codo a la altura del hombro: si baja, es un remo.'],
            ['Girar el tronco', 'Hombros hacia la pared.'],
            ['Subir el hombro', 'Lejos de la oreja.'],
            ['Ir rápido', 'Pausa arriba.']
          ],
          info: [
            ['Qué trabaja', 'Deltoide posterior y rotadores. Postura.'],
            ['Cómo progresar', 'Paso atrás o banda más dura.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final en la barra', nota: 'Descanso 90 s',
      ejercicios: [
        {
          nombre: 'Negativa larga',
          indicacion: 'Desde arriba, baja en 10 s a velocidad constante. Una por serie.',
          ritmo: 'Bajada en 10 s',
          dosis: '2 × 1', dibujo: 'negativaLarga', ancla: 'barra',
          claves: [
            ['Arriba', 'Desde la silla, barbilla sobre la barra.'],
            ['Bajar', 'Durante 10 s sin parar, contando en voz alta.'],
            ['Abajo', 'Brazos estirados; a la silla.'],
            ['Una', 'Una sola repetición por serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalNegativa',
            puntos: [
              ['Silla', 'Debajo de la barra.'],
              ['Mangos', 'Paralelos.'],
              ['Contar', 'Cuenta en voz alta hasta 10.']
            ]
          },
          errores: [
            ['Caer de golpe', 'Velocidad igual en todo el recorrido, también en el último tramo.'],
            ['Frenar solo arriba', 'El tramo final también cuenta.'],
            ['Sin silla', 'Siempre silla.'],
            ['Aguantar el aire', 'Respira.']
          ],
          info: [
            ['Para qué sirve', 'Mucho tiempo bajo tensión en el gesto de la dominada.'],
            ['Cómo progresar', 'Apunta tu tiempo y súbelo hasta 15 s.']
          ],
          temporizador: { series: 2, reps: 1, descanso: 90, descansos: [60, 90, 120], preparacion: 5 }
        }
      ]
    }
  ],
  // MIÉRCOLES · Tríceps
  'Tríceps': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Tríceps'] },
    {
      titulo: 'Principal', nota: 'Descanso 60–90 s',
      ejercicios: [
        {
          nombre: 'Flexiones diamante',
          indicacion: 'Manos juntas bajo el pecho formando un rombo; baja con los codos pegados.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '4 × 8–15', dibujo: 'diamante', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Arriba', 'Pulgares e índices forman un rombo bajo el pecho.'],
            ['Bajar', 'En 2 s, llevando los codos hacia atrás.'],
            ['Subir', 'En 1 s hasta estirar los brazos.'],
            ['Si falla', 'Termina la serie con las rodillas apoyadas.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalDiamante',
            puntos: [
              ['Manos', 'Juntas bajo el pecho, formando un rombo.'],
              ['Pies', 'Algo separados para más estabilidad.'],
              ['Cuerpo', 'Recto y apretado.']
            ]
          },
          errores: [
            ['Codos hacia los lados', 'Codos cerca del cuerpo y hacia atrás: abiertos cargan muñeca y hombro.'],
            ['Cadera hundida', 'Cuerpo recto.'],
            ['Recorrido corto', 'Pecho cerca de las manos.'],
            ['Dolor de muñeca', 'Separa un poco las manos.']
          ],
          info: [
            ['Qué trabaja', 'Tríceps como músculo principal, con ayuda del pecho.'],
            ['Cómo progresar', 'Cuando salgan 4 × 15, pies en la silla.']
          ],
          temporizador: { series: 4, reps: '8–15', descanso: 90, descansos: [60, 90, 120], preparacion: 5 }
        },
        {
          nombre: 'Fondos en silla',
          indicacion: 'Manos en el borde de la silla por detrás: baja hasta 90° con los codos hacia atrás.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '3 × 10–15', dibujo: 'fondos', anclaNota: 'Sin ancla: con una silla',
          claves: [
            ['Arriba', 'Manos en el borde, brazos estirados.'],
            ['Bajar', 'En 2 s llevando los codos hacia atrás.'],
            ['Parar', 'En 90°: no más abajo.'],
            ['Subir', 'En 1 s hasta estirar los brazos.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFondos',
            puntos: [
              ['Silla', 'Firme y contra la pared.'],
              ['Manos', 'En el borde, dedos hacia delante.'],
              ['Piernas', 'Dobladas: más fácil. Estiradas: más difícil.']
            ]
          },
          errores: [
            ['Codos abiertos', 'Codos a 90° y hacia atrás, hombros bajos: si no, castiga el hombro.'],
            ['Bajar demasiado', 'Más de 90° carga el hombro.'],
            ['Alejarse de la silla', 'La espalda roza el borde.'],
            ['Silla suelta', 'Siempre contra la pared.']
          ],
          info: [
            ['Qué trabaja', 'Tríceps con el propio peso del cuerpo.'],
            ['Cómo progresar', 'Estira las piernas o pon los pies en otra silla.']
          ],
          temporizador: { series: 3, reps: '10–15', descanso: 90, descansos: [60, 90, 120], preparacion: 5 }
        },
        {
          nombre: 'Extensión sobre la cabeza',
          indicacion: 'Pisa la banda, codo al techo: estira el antebrazo hasta el brazo recto.',
          ritmo: '1 s estirar · 2 s volver',
          dosis: '3 × 12 c/brazo', dibujo: 'extCabeza', anclaNota: 'Sin ancla: pisas la banda',
          claves: [
            ['Inicio', 'Codo apuntando al techo, mano detrás de la cabeza.'],
            ['Codo', 'Apunta al techo y no se mueve.'],
            ['Estirar', 'Hasta el brazo recto; vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalExtCabeza',
            puntos: [
              ['Pie', 'Pisa la banda con el pie del lado que trabaja.'],
              ['Banda', 'Pásala por detrás y sube la mano detrás de la cabeza.'],
              ['Mano libre', 'Sujetando el codo si hace falta.']
            ]
          },
          errores: [
            ['Codo abierto', 'Codo fijo arriba: si se abre, baja hacia delante.'],
            ['Arquear la espalda', 'Costillas abajo.'],
            ['Rango corto', 'Mano bien detrás de la cabeza.'],
            ['Banda dura', 'Mejor media y con recorrido.']
          ],
          info: [
            ['Qué trabaja', 'Cabeza larga del tríceps, la más grande.'],
            ['Cómo progresar', 'Banda más dura cuando los 3 × 12 sean fáciles.']
          ],
          temporizador: { series: 3, reps: 12, lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Accesorios', nota: 'Descanso 45 s',
      ejercicios: [
        {
          nombre: 'Extensión hacia abajo',
          indicacion: 'Mirando al ancla alta, codo pegado: empuja hacia abajo hasta estirar el brazo.',
          ritmo: 'Pausa 1 s abajo · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'extAbajo', ancla: 'alta',
          claves: [
            ['Inicio', 'Codo pegado al costado, antebrazo horizontal.'],
            ['Empujar', 'Hacia abajo hasta estirar junto al muslo.'],
            ['Pausa', 'Aprieta 1 s y vuelve en 2 s, solo hasta la horizontal.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalExtAbajo',
            puntos: [
              ['Ancla', 'Banda en el ancla alta.'],
              ['Posición', 'Mirando a la pared, a un paso.'],
              ['Codo', 'Pegado al costado.']
            ]
          },
          errores: [
            ['Codo adelantado', 'Codo quieto junto al cuerpo: no se despega.'],
            ['Inclinarse encima', 'Tronco recto.'],
            ['Subir de más', 'Vuelve solo hasta la horizontal.'],
            ['Hombro a la oreja', 'Hombro bajo.']
          ],
          info: [
            ['Qué trabaja', 'Cabeza lateral del tríceps.'],
            ['Cómo progresar', 'Paso atrás o banda más dura.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        },
        {
          nombre: 'Patada de tríceps',
          indicacion: 'Inclinado hacia el ancla media: estira el antebrazo atrás hasta el brazo recto.',
          ritmo: 'Pausa 1 s estirado',
          dosis: '3 × 15 c/brazo', dibujo: 'patada', ancla: 'media',
          claves: [
            ['Inicio', 'Codo a la altura de la cadera, antebrazo colgando.'],
            ['Codo', 'Pegado a la cadera y fijo.'],
            ['Estirar', 'Atrás hasta el brazo recto; aguanta 1 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPatada',
            puntos: [
              ['Ancla', 'Banda en el ancla media.'],
              ['Postura', 'Inclínate hacia delante con la espalda recta.'],
              ['Mano libre', 'Apoyada en la rodilla.']
            ]
          },
          errores: [
            ['Codo que baja', 'Solo se mueve el antebrazo: si el codo baja, el brazo se balancea.'],
            ['Espalda redonda', 'Recta desde la cadera.'],
            ['Ir rápido', 'Pausa estirado.'],
            ['Codo bajo', 'A la altura de la cadera.']
          ],
          info: [
            ['Qué trabaja', 'Tríceps en su posición más contraída.'],
            ['Cómo progresar', 'Aléjate de la pared o alarga la pausa.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, descansos: [30, 45, 60], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final', nota: 'Descanso 45 s',
      ejercicios: [
        {
          nombre: 'Fondos isométricos',
          indicacion: 'En la silla, baja hasta 90° con los codos hacia atrás y quédate quieto.',
          ritmo: 'Quieto · respira normal',
          dosis: '2 × 20–30 s', dibujo: 'fondosIso', anclaNota: 'Sin ancla: con una silla',
          claves: [
            ['Arriba', 'Empieza con los brazos estirados.'],
            ['Bajar', 'Hasta 90°, con los codos hacia atrás.'],
            ['Aguantar', 'Quieto, respirando normal.'],
            ['Al terminar', 'Sube y siéntate.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFondos',
            puntos: [
              ['Silla', 'Contra la pared.'],
              ['Tiempo', 'Temporizador listo.'],
              ['Piernas', 'Dobladas.']
            ]
          },
          errores: [
            ['Codos abiertos', 'Codos atrás y hombros bajos, no hacia delante.'],
            ['Hundirse', 'La altura no cambia.'],
            ['Aguantar el aire', 'Respira.'],
            ['Hombros arriba', 'Bajos y atrás.']
          ],
          info: [
            ['Para qué sirve', 'Remata el tríceps con tensión constante.'],
            ['Cómo progresar', 'Llega a 40 s o estira las piernas.']
          ],
          temporizador: { series: 2, opciones: [20, 25, 30], descanso: 45, preparacion: 5 }
        }
      ]
    }
  ],
  // VIERNES · Pecho con foco en fuerza
  'Pecho · Fuerza': [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS['Pecho · Fuerza'] },
    {
      titulo: 'Principal · Fuerza', nota: 'Descanso 90 s–2 min',
      ejercicios: [
        {
          nombre: 'Flexiones con banda',
          indicacion: 'La banda por la espalda y bajo las manos: baja en 2 s y sube explosivo.',
          ritmo: '2 s abajo · explosivo arriba',
          dosis: '4 × 6–10', dibujo: 'flexBanda', anclaNota: 'Sin ancla: la banda va por tu espalda',
          claves: [
            ['Arriba', 'La banda por los omóplatos, sujeta bajo cada mano.'],
            ['Antes', 'Cuerpo recto y apretado antes de bajar.'],
            ['Bajar', 'En 2 s, hasta que el pecho casi toque el suelo.'],
            ['Subir', 'Explosivo hasta estirar los brazos: arriba es lo más duro.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFlexBanda',
            puntos: [
              ['Banda', 'Pásala por la espalda, a la altura de los omóplatos.'],
              ['Manos', 'Cada extremo bajo la palma, pegado al suelo.'],
              ['Dureza', 'Una banda con la que llegues a 6–10 repeticiones.']
            ]
          },
          errores: [
            ['Cadera hundida', 'Cuerpo en línea aunque la banda empuje. Si se hunde, banda más suave.'],
            ['Banda en el cuello', 'Siempre en los omóplatos, nunca en el cuello ni en la zona lumbar.'],
            ['Codos en cruz', 'A 45° del cuerpo, como en la flexión normal.'],
            ['Bloqueo a medias', 'Estira del todo arriba: ahí está la tensión máxima.']
          ],
          info: [
            ['Qué trabaja', 'Pectoral, tríceps y deltoides anterior, con más carga que una flexión normal.'],
            ['Cómo progresar', 'Cuando salgan 4 × 10, pasa a una banda más dura y vuelve a 6.']
          ],
          temporizador: { series: 4, reps: '6–10', descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        },
        {
          nombre: 'Flexiones arqueras',
          indicacion: 'Manos muy separadas: baja hacia una mano con el otro brazo recto.',
          ritmo: '2 s abajo · 1 s arriba',
          dosis: '3 × 4–6 c/lado', dibujo: 'arquera', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Inicio', 'Brazos estirados, manos casi al doble del ancho de los hombros.'],
            ['Bajar', 'Lleva el peso a una mano y baja doblando solo ese brazo.'],
            ['El otro', 'El brazo contrario sigue recto y apenas empuja.'],
            ['Subir', 'Hasta el centro; repite hacia el mismo lado o alterna.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalArquera',
            puntos: [
              ['Manos', 'Separadas casi el doble del ancho de los hombros.'],
              ['Dedos', 'Girados un poco hacia fuera.'],
              ['Pies', 'Algo separados para tener más equilibrio.']
            ]
          },
          errores: [
            ['Doblar los dos codos', 'El brazo contrario queda recto: si no, es una flexión abierta.'],
            ['Girar la cadera', 'El cuerpo baja plano, sin rotar.'],
            ['Recorrido corto', 'Pecho cerca de la mano que trabaja.'],
            ['Hombro al oído', 'Hombro del brazo que trabaja lejos de la oreja.']
          ],
          info: [
            ['Para qué sirve', 'Pone casi todo el peso sobre un brazo: el camino a la flexión a una mano.'],
            ['Cómo progresar', 'Con 3 × 6 por lado, apoya el brazo recto solo con la punta de los dedos.']
          ],
          temporizador: { series: 3, reps: '4–6', lado: 'por lado', descanso: 120, descansos: [90, 120, 150], preparacion: 5 }
        },
        {
          nombre: 'Press de pecho a una mano',
          indicacion: 'De espaldas a la pared: empuja al frente hasta estirar el brazo sin girar el tronco.',
          ritmo: '1 s empujar · 2 s volver',
          dosis: '3 × 8–12 c/brazo', dibujo: 'pressPecho', ancla: 'media',
          claves: [
            ['Inicio', 'Mano al pecho, codo atrás a unos 45° del cuerpo.'],
            ['Empujar', 'Al frente soltando el aire, hasta estirar el brazo.'],
            ['Volver', 'En 2 s, sin dejar que la banda te arrastre.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPressPecho',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla media, a la altura de la cintura.'],
              ['Pies', 'De espaldas a la pared, adelanta el pie contrario al brazo.'],
              ['Tensión', 'Avanza hasta tener tensión con la mano en el pecho.']
            ]
          },
          errores: [
            ['Arquear la espalda', 'Tronco firme. Adelanta más el pie y aprieta el abdomen.'],
            ['Girar el tronco', 'Los hombros miran al frente; empuja solo el brazo.'],
            ['Dejarse llevar', 'Si la banda te arrastra, acércate a la pared.'],
            ['Codo en cruz', 'A 45° del cuerpo, igual que en las flexiones.']
          ],
          info: [
            ['Qué trabaja', 'Pectoral medio y tríceps, más el abdomen para no rotar.'],
            ['Cómo progresar', 'Da un paso más lejos de la pared o usa una banda más dura.']
          ],
          temporizador: { series: 3, reps: '8–12', lado: 'por brazo', descanso: 90, descansos: [60, 90, 120], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Accesorios', nota: 'Descanso 60 s',
      ejercicios: [
        {
          nombre: 'Press inclinado a una mano',
          indicacion: 'De espaldas a la pared: empuja en diagonal hacia arriba, por encima de los ojos.',
          ritmo: '1 s empujar · 2 s volver',
          dosis: '3 × 10–12 c/brazo', dibujo: 'pressInclinado', ancla: 'baja',
          claves: [
            ['Inicio', 'Mano junto al pecho, codo por debajo de la mano.'],
            ['Antes', 'Aprieta el abdomen y mantén las costillas abajo.'],
            ['Empujar', 'En diagonal hacia arriba; vuelve en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalInclinado',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla baja, a media pantorrilla.'],
              ['Pies', 'De espaldas a la pared, adelanta el pie contrario al brazo.'],
              ['Mano', 'Junto al pecho, con el codo por debajo de la mano.']
            ]
          },
          errores: [
            ['Arquear la espalda', 'Tronco firme: la diagonal la hace el brazo. Si no, banda más suave.'],
            ['Empujar al frente', 'La trayectoria es diagonal hacia arriba, no horizontal.'],
            ['Girar el tronco', 'Solo se mueve el brazo que empuja.'],
            ['Hombro a la oreja', 'Hombro bajo durante todo el recorrido.']
          ],
          info: [
            ['Qué trabaja', 'Parte alta del pecho y deltoides anterior.'],
            ['Cómo progresar', 'Adelanta el pie delantero o usa una banda más dura.']
          ],
          temporizador: { series: 3, reps: '10–12', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Apertura a una mano',
          indicacion: 'De espaldas al ancla: cierra el brazo en arco hasta delante del pecho.',
          ritmo: 'Pausa 1 s en el centro · 2 s abrir',
          dosis: '3 × 12–15 c/brazo', dibujo: 'apertura', ancla: 'media',
          claves: [
            ['Inicio', 'Brazo abierto a la altura del pecho, codo algo flexionado.'],
            ['Cerrar', 'En arco, como si abrazaras un árbol con un brazo.'],
            ['Pausa', '1 s en el centro apretando el pecho; abre en 2 s.'],
            ['Cambio', 'Termina y cambia de brazo, sin descanso: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalApertura',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla media, a la altura de la cintura.'],
              ['Posición', 'De espaldas a la pared, un paso adelante, mano libre en la cadera.'],
              ['Brazo', 'Abierto a la altura del pecho, codo algo flexionado.']
            ]
          },
          errores: [
            ['Doblar el codo', 'Leve ángulo fijo: si se dobla mucho, se convierte en un press.'],
            ['Abrir demasiado', 'No pases el brazo por detrás de la línea de los hombros.'],
            ['Girar el tronco', 'El pecho sigue mirando al frente.'],
            ['Encoger el hombro', 'Hombro bajo durante todo el arco.']
          ],
          info: [
            ['Qué trabaja', 'Pectoral en estiramiento y contracción, sin cargar el tríceps.'],
            ['Cómo progresar', 'Da un paso más adelante o alarga la pausa a 2 s.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        },
        {
          nombre: 'Cruce a una mano',
          indicacion: 'De espaldas al ancla alta: baja el brazo en arco hasta la cadera contraria.',
          ritmo: 'Pausa 1 s abajo · 2 s volver',
          dosis: '3 × 12–15 c/brazo', dibujo: 'cruce', ancla: 'alta',
          claves: [
            ['Inicio', 'Brazo abierto a la altura del hombro, la otra mano en la cadera.'],
            ['Codo', 'Ligeramente flexionado y fijo.'],
            ['Bajar', 'En arco hasta la cadera contraria; aprieta 1 s.'],
            ['Volver', 'En 2 s. Termina y cambia de brazo: eso es 1 serie.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalCruce',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla alta, la de las asas.'],
              ['Posición', 'De espaldas a la pared, un paso adelante e inclínate un poco.'],
              ['Brazo', 'Un asa en la mano, brazo abierto a la altura del hombro.']
            ]
          },
          errores: [
            ['Encoger el hombro', 'Hombro bajo y codo fijo: si se dobla, empujas en vez de abrazar.'],
            ['Girar el tronco', 'El cuerpo quieto; solo se mueve el brazo en arco.'],
            ['Subir de golpe', 'Controla la vuelta: la banda tira hacia atrás.'],
            ['Sin pausa', 'La pausa abajo es donde más trabaja la parte baja del pecho.']
          ],
          info: [
            ['Qué trabaja', 'Parte baja del pectoral.'],
            ['Cómo progresar', 'Aléjate un paso más o alarga la pausa abajo.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [45, 60, 75], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final', nota: 'Descanso 45 s',
      ejercicios: [
        {
          nombre: 'Isométrica a media flexión',
          indicacion: 'Baja hasta la mitad de la flexión y quédate quieto el tiempo marcado.',
          ritmo: 'Quieto · respira normal',
          dosis: '2 × 20–30 s', dibujo: 'isoFlex', anclaNota: 'Sin ancla: en el suelo',
          claves: [
            ['Arriba', 'Cuerpo recto y brazos estirados.'],
            ['Bajar', 'Despacio, hasta la mitad de la flexión.'],
            ['Aguantar', 'Quieto, respirando con normalidad.'],
            ['Al terminar', 'Sube hasta arriba y apoya las rodillas.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalIso',
            puntos: [
              ['Manos', 'Plancha alta, manos un poco más abiertas que los hombros.'],
              ['Cuerpo', 'Abdomen y glúteos apretados.'],
              ['Temporizador', 'Tenlo listo antes de bajar.']
            ]
          },
          errores: [
            ['Codos en cruz', 'Codos a unos 45° del cuerpo: en cruz todo el peso va al hombro.'],
            ['Aguantar el aire', 'Respira normal; aguantarlo sube la tensión sin necesidad.'],
            ['Moverte', 'La altura se mantiene fija todo el tiempo.'],
            ['Cadera caída', 'Si la cadera cae, la serie terminó.']
          ],
          info: [
            ['Para qué sirve', 'Remata el pecho y los tríceps con tensión constante, sin impacto.'],
            ['Cómo progresar', 'Sube a 40 s o pon los pies en una silla.']
          ],
          temporizador: { series: 2, opciones: [20, 25, 30], descanso: 45, preparacion: 5 }
        }
      ]
    }
  ],
  Hombro: [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS.Hombro },
    {
      titulo: 'Principal', nota: 'Descanso 60–90 s',
      ejercicios: [
        {
          nombre: 'Press militar a una mano',
          indicacion: 'Pisa la banda y empuja con un brazo por encima de la cabeza sin arquear la espalda.',
          ritmo: '1 s arriba · 3 s abajo',
          dosis: '4 × 8–12 c/brazo', dibujo: 'pressMilitar', anclaNota: 'Sin ancla: pisas la banda con el pie del mismo lado',
          claves: [
            ['Inicio', 'Mano a la altura del hombro, palma delante, codo bajo la mano.'],
            ['Cuerpo', 'Abdomen y glúteos firmes; no te inclines hacia el otro lado.'],
            ['Subir', 'Empuja soltando el aire hasta estirar el brazo, sin bloquear de golpe.'],
            ['Bajar', 'En 3 s frenando la banda. Haz todas y cambia de brazo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPress',
            puntos: [
              ['Pie', 'Pisa la banda con el pie del lado que trabaja.'],
              ['Manos', 'Extremo en una mano, al hombro; la otra en la cintura.'],
              ['Dificultad', '¿Fácil? Menos banda suelta o banda más dura. ¿Difícil? Más banda suelta.'],
              ['Seguridad', 'Banda bien pisada, que no se escape.']
            ]
          },
          errores: [
            ['Arquear la espalda', 'Costillas abajo, mano encima del pie. Si pasa, banda más suave.'],
            ['Inclinarte hacia un lado', 'El tronco recto: solo se mueve el brazo que empuja.'],
            ['Hombro a la oreja', 'Empieza con el hombro bajo y relajado.'],
            ['Bajar de golpe', 'La bajada controlada también construye músculo.']
          ],
          info: [
            ['Qué trabaja', 'Deltoides anterior y medio, tríceps, y el abdomen para no inclinarte hacia un lado.'],
            ['Seguridad', 'La banda bien pisada, para que no se escape y te golpee.']
          ],
          temporizador: { series: 4, reps: '8–12', lado: 'por brazo', descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        },
        {
          nombre: 'Elevaciones laterales',
          indicacion: 'De costado a la pared; la banda cruza por delante del cuerpo.',
          ritmo: '1 s arriba · 3 s abajo',
          dosis: '3 × 12–15 c/brazo', dibujo: 'elevLateral', ancla: 'baja',
          claves: [
            ['Inicio', 'Brazo junto al cuerpo, codo ligeramente flexionado y fijo.'],
            ['Subir', 'Hacia el lado hasta la altura del hombro, soltando el aire.'],
            ['Bajar', 'En 3 segundos, sin impulso.'],
            ['Lados', 'Haz todas las reps y cambia de brazo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalLateral',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla baja, a media pantorrilla.'],
              ['Mano', 'De costado a la pared, agarra con la mano del lado contrario.'],
              ['Tensión', 'Aléjate hasta que la banda tenga tensión con el brazo abajo.']
            ]
          },
          errores: [
            ['Pasarse del hombro', 'Ni más ni menos que la altura del hombro. Baja la tensión y sube más lento.'],
            ['Balancear el tronco', 'Cuerpo quieto. Si necesitas impulso, la banda es demasiado dura.'],
            ['Subir el hombro', 'El hombro se queda bajo, lejos de la oreja.'],
            ['Codo muy doblado', 'Un leve ángulo fijo; si lo doblas más, pierde efecto.']
          ],
          info: [
            ['Qué trabaja', 'Deltoides medio: el que da anchura a los hombros.'],
            ['Cómo progresar', 'Aléjate un poco más de la pared para ganar tensión, o pasa a una banda más dura.']
          ],
          temporizador: { series: 3, reps: '12–15', lado: 'por brazo', descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        },
        {
          nombre: 'Elevación en Y a una mano',
          indicacion: 'Mirando a la pared, sube un brazo en diagonal hasta la línea de la Y.',
          ritmo: '1 s arriba · 1 s pausa · 3 s abajo',
          dosis: '3 × 12 c/brazo', dibujo: 'elevY', ancla: 'baja',
          claves: [
            ['Brazo', 'Estirado, pulgar hacia arriba y hombro bajo.'],
            ['Subir', 'En diagonal, a unos 30° de la vertical, soltando el aire.'],
            ['Pausa', 'Aguanta 1 s arriba.'],
            ['Bajar', 'En 3 s. Haz todas y cambia de brazo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalY',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla baja y agarra un extremo con una mano.'],
              ['Distancia', 'De frente a la pared, retrocede hasta que la banda tenga tensión.'],
              ['Pies', 'Al ancho de las caderas, rodillas ligeramente flexionadas.']
            ]
          },
          errores: [
            ['Hombro encogido', 'Hombro abajo, lejos de la oreja. Si no puedes, banda más suave.'],
            ['Girar el tronco', 'El pecho mira a la pared; costillas abajo y abdomen firme.'],
            ['Brazo muy cerrado', 'La Y es abierta, a unos 30° de la vertical.'],
            ['Doblar el codo', 'Brazo casi recto todo el recorrido.']
          ],
          info: [
            ['Qué trabaja', 'Trapecio inferior y deltoides: estabilizan el hombro al subir el brazo por encima de la cabeza.'],
            ['Cómo progresar', 'Retrocede un paso más o usa una banda más dura cuando las 12 salgan limpias.']
          ],
          temporizador: { series: 3, reps: 12, lado: 'por brazo', descanso: 60, descansos: [60, 75, 90], preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Posterior y estabilidad', nota: 'Descanso ~45 s',
      ejercicios: [
        {
          nombre: 'Face pull a una mano',
          indicacion: 'Tira hacia la cara con un brazo, codo alto, hasta dejar la mano junto a la oreja.',
          ritmo: '1 s tirar · 1 s pausa · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'facePull', ancla: 'alta',
          claves: [
            ['Antes', 'Pecho fuera y hombros bajos, de frente a la pared.'],
            ['Tirar', 'Hacia la cara con el codo alto y abierto.'],
            ['Pausa', '1 s con la mano junto a la oreja.'],
            ['Volver', 'En 2 s. Haz todas y cambia de brazo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalFace',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla alta, la de las asas, a la altura de la oreja.'],
              ['Mano', 'Un asa en una mano, palma hacia abajo.'],
              ['Tensión', 'Da un paso atrás hasta tener tensión con el brazo estirado.']
            ]
          },
          errores: [
            ['Codo bajo', 'Tirar hacia la tripa es un remo. Codo a la altura del hombro.'],
            ['Girar el tronco', 'El pecho sigue mirando a la pared; no rotes para ayudarte.'],
            ['Subir el hombro', 'Hombro lejos de la oreja en todo momento.'],
            ['Ir rápido', 'Sin pausa arriba, el deltoide posterior casi no trabaja.']
          ],
          info: [
            ['Qué trabaja', 'Deltoide posterior, trapecio medio y rotadores externos. Muy bueno para la postura.'],
            ['Cómo progresar', 'Da otro paso atrás o cambia a una banda más dura.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, preparacion: 5 }
        },
        {
          nombre: 'Pájaro a una mano',
          indicacion: 'Mirando a la pared, abre un brazo casi recto hacia el lado juntando el omóplato.',
          ritmo: '1 s abrir · 2 s volver',
          dosis: '3 × 15 c/brazo', dibujo: 'pajaros', ancla: 'media',
          claves: [
            ['Inicio', 'Brazo casi recto al frente, a la altura del pecho, hombro bajo.'],
            ['Abrir', 'Hacia el lado y un poco atrás, soltando el aire.'],
            ['Final', 'Omóplato hacia la columna; el tronco no gira.'],
            ['Volver', 'En 2 s. Haz todas y cambia de brazo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalPajaros',
            puntos: [
              ['Ancla', 'Engancha la banda al ancla media, a la altura de la cintura.'],
              ['Mano', 'Un extremo en una mano, palma hacia dentro.'],
              ['Tensión', 'Retrocede hasta tener tensión con el brazo al frente.']
            ]
          },
          errores: [
            ['Doblar el codo', 'Tirar con el codo hacia atrás lo convierte en un remo.'],
            ['Girar el tronco', 'Solo se mueve el brazo; el pecho mira a la pared.'],
            ['Subir el hombro', 'El hombro se queda lejos de la oreja.'],
            ['Banda demasiado dura', 'Aquí manda la técnica: mejor liviana y con buen recorrido.']
          ],
          info: [
            ['Qué trabaja', 'Deltoide posterior y romboides. Equilibra todo el trabajo de empuje de la semana.'],
            ['Cómo progresar', 'Retrocede un poco más cuando las 15 salgan limpias y controladas.']
          ],
          temporizador: { series: 3, reps: 15, lado: 'por brazo', descanso: 45, preparacion: 5 }
        },
        {
          nombre: 'Rotación externa',
          indicacion: 'Codo pegado al costado; gira el antebrazo hacia fuera como una puerta.',
          ritmo: 'lento · 2 s volver',
          dosis: '2 × 15 c/brazo', dibujo: 'rotacion', ancla: 'media',
          claves: [
            ['Codo', 'Pegado al cuerpo y doblado a 90°, antebrazo por delante.'],
            ['Girar', 'El antebrazo hacia fuera, despacio, sin mover el codo.'],
            ['Volver', 'En 2 segundos.'],
            ['Lados', 'Haz las 15 y cambia de lado.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalRotacion',
            puntos: [
              ['Banda', 'Muy liviana: es un músculo pequeño.'],
              ['Ancla', 'Engancha la banda al ancla media, a la altura de la cintura.'],
              ['Brazo', 'De costado; usa el brazo más alejado de la pared.'],
              ['Toalla', 'Enrollada entre el codo y el costado.']
            ]
          },
          errores: [
            ['Despegar el codo', 'Si se separa para ganar recorrido, banda más suave.'],
            ['Girar el tronco', 'El cuerpo quieto. Solo gira el antebrazo.'],
            ['Banda demasiado dura', 'Con banda dura trabajan otros músculos.'],
            ['Ir rápido', 'Lento y controlado, sobre todo en la vuelta.']
          ],
          info: [
            ['Qué trabaja', 'Manguito rotador (infraespinoso y redondo menor). Protege el hombro en press y dominadas.'],
            ['Seguridad', 'Nunca hasta el dolor. Es un ejercicio de salud: la técnica importa más que la tensión.']
          ],
          temporizador: { series: 2, reps: 15, lado: 'por brazo', descanso: 45, preparacion: 5 }
        }
      ]
    },
    {
      titulo: 'Final en la barra',
      ejercicios: [
        {
          nombre: 'Dominadas escapulares',
          indicacion: 'Colgado con brazos rectos, baja los hombros y junta los omóplatos.',
          ritmo: 'pausa 1 s arriba',
          dosis: '2 × 6–8', dibujo: 'dominadasEsc', ancla: 'barra',
          claves: [
            ['Posición', 'Colgado, brazos rectos, agarre paralelo.'],
            ['Movimiento', 'Baja los hombros, lejos de las orejas.'],
            ['Codos', 'No se doblan: el cuerpo sube unos centímetros.'],
            ['Pausa', '1 s arriba y baja despacio al colgado pasivo.']
          ],
          agarre: {
            titulo: 'MONTAJE', dibujo: 'bienMalDominadas',
            puntos: [
              ['Subir', 'Con la silla, y agarra los mangos paralelos.'],
              ['Colgarte', 'Con los brazos totalmente estirados.'],
              ['Cuerpo', 'Piernas juntas y abdomen firme para no balancearte.']
            ]
          },
          errores: [
            ['Doblar los codos', 'Eso es media dominada. Solo se mueven hombros y omóplatos.'],
            ['Balancearse', 'Si oscilas, para y vuelve a empezar.'],
            ['Movimiento corto', 'De hombros a las orejas a hombros abajo, completo.'],
            ['Soltarse de golpe', 'Baja siempre apoyando los pies en la silla.']
          ],
          info: [
            ['Para qué sirve', 'Enseña a arrancar la dominada con la espalda y no solo con los brazos. Clave para pasar de 1 a más.'],
            ['Cómo progresar', 'Cuando salgan 2 × 8 limpias, sube a 3 series o aguanta 3 s arriba.']
          ],
          temporizador: { series: 2, reps: '6–8', descanso: 60, descansos: [45, 60, 90], preparacion: 5 }
        }
      ]
    }
  ]
};

// Frases que dice la voz (ElevenLabs) al terminar cada serie. Se pueden cambiar o añadir.
// Cortas a propósito: se dicen mientras empieza el descanso.
const FRASES_SERIE = [
  'Estás en riesgo de vivir una vida tan cómoda que morirás sin conocer tu verdadero potencial.',
  'Hace falta una autodisciplina implacable para programar el sufrimiento, cada día.',
  'La negación es la máxima zona de confort.',
  'Las conversaciones más importantes son las que tienes contigo mismo.',
  'El dolor abre un pasadizo secreto en la mente: el que lleva a tu máximo rendimiento.',
  'No te detengas cuando estés cansado. Detente cuando hayas terminado.',
  'Todo el mundo fracasa alguna vez. Y la vida no tiene por qué ser justa.',
  'Reconoce lo que vas a hacer y visualiza cada obstáculo antes de que llegue.',
  'La victoria depende de sacar lo mejor de ti cuando te sientes de lo peor.',
  'La mayoría de las guerras se ganan o se pierden en la mente.',
  'Satisfecho es otra palabra para mediocre.',
  'Acepta volver a ser el estúpido de la clase. Es la única manera de ampliar tu mente.',
  'O mejoramos o empeoramos.',
  'Ir más allá de tus límites cuesta un jodido esfuerzo. La duda y el dolor te van a recibir.',
  'Ajústate, recalíbrate y sigue adelante para ser mejor.',
  'Vuélvete adicto al trabajo duro. Sin ética de trabajo, el talento no sirve de nada.',
  'Cuando corres hacia los problemas, se levanta la alfombra y sale tu oscuridad.',
  'Solo tú sabes lo poderoso que es este mensaje.',
  'Rodéate de gente que te diga lo que necesitas oír, no lo que quieres oír.',
  '¿Cuándo y dónde lo vas a volver a intentar?',
  'La vida es sufrimiento. Así es la naturaleza. Lucha.',
  'No controlas todo. Lo que haces con cada oportunidad decide cómo acaba tu historia.',
  'En cada fracaso hay algo que ganar. El próximo examen va a llegar.',
  'La responsabilidad personal da respeto propio, y el respeto propio siempre ilumina el camino.',
  'No hay más tiempo que perder. Las horas se evaporan como charcos en el desierto.',
  'Eres capaz de mucho más de lo que crees.',
  'Hace falta mucha fuerza para arriesgarlo todo en público por un sueño.',
  'Cuando estás determinado, todo lo que tienes delante se convierte en combustible.',
  'Los pequeños logros son la leña: las pequeñas chispas acaban quemando el bosque entero.',
  'El héroe eres tú.',
  'No dejes que el dolor de un pasado imperfecto frene la gloria de tu futuro.',
  'El nivel mundial empieza donde termina tu zona de confort.',
  'Donde vive tu mayor incomodidad, vive también tu mayor oportunidad.'
];

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
<circle cx="120" cy="100" r="22" fill="#F4F1EA"/><circle cx="112.08" cy="97.8" r="2.64" fill="#16181B"/><circle cx="127.92" cy="97.8" r="2.64" fill="#16181B"/>
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
<polygon points="114.06,242 120,229.2 125.94,242" fill="#F4F1EA"/><circle cx="120" cy="258" r="18" fill="#F4F1EA" stroke="#1F2227" stroke-width="3"/>
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
<circle cx="120" cy="92" r="22" fill="#F4F1EA"/><polygon points="140,86.5 150.36,93.1 140,98.16" fill="#F4F1EA"/>
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
<circle cx="70" cy="62" r="9" fill="#F4F1EA"/><circle cx="66.76" cy="61.1" r="1.3" fill="#16181B"/><circle cx="73.24" cy="61.1" r="1.3" fill="#16181B"/><circle cx="210" cy="62" r="9" fill="#F4F1EA"/><circle cx="206.76" cy="61.1" r="1.3" fill="#16181B"/><circle cx="213.24" cy="61.1" r="1.3" fill="#16181B"/>
<line x1="30" y1="136" x2="110" y2="136" stroke="#4A5059" stroke-width="2"/>
<line x1="170" y1="136" x2="250" y2="136" stroke="#4A5059" stroke-width="2"/>
</svg>`,

  pressMilitar: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="De frente, a una mano: pisas la banda con el pie del mismo lado y empujas con un brazo desde el hombro hasta estirarlo por encima de la cabeza; la otra mano en la cintura">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<line x1="126" y1="408" x2="158" y2="408" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/>
<line x1="142" y1="406" x2="156" y2="132" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="156;144;144;156" keyTimes="0;0.22;0.33;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="132;30;30;132" keyTimes="0;0.22;0.33;1" dur="4.5s" repeatCount="indefinite"/></line>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="120" y1="118" x2="120" y2="250"/><line x1="94" y1="130" x2="146" y2="130"/><line x1="102" y1="250" x2="138" y2="250"/><polyline points="104,250 100,330 98,402"/><polyline points="136,250 140,330 142,402"/></g>
<g stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
<polyline points="96,130 76,186 104,238"/>
<polyline points="144,130 158,176 156,132"><animate attributeName="points" values="144,130 158,176 156,132;144,130 146,80 144,30;144,130 146,80 144,30;144,130 158,176 156,132" keyTimes="0;0.22;0.33;1" dur="4.5s" repeatCount="indefinite"/></polyline>
</g>
<circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.08" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.92" cy="89.8" r="2.64" fill="#16181B"/>
<path d="M214 210 V130 M205 141 L214 130 L223 141" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<text x="214" y="228" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empuja</text><text x="46" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">mano en</text><text x="46" y="265" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la cintura</text><text x="190" y="400" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pisa la banda</text>
</svg>`,

  elevLateral: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="De frente, de costado a la pared: la banda sale del ancla baja, cruza por delante del cuerpo y el brazo lejano sube hacia el lado hasta la altura del hombro">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<line x1="16" y1="40" x2="16" y2="412" stroke="#4A5059" stroke-width="3"/>
<line x1="150" y1="130" x2="236" y2="130" stroke="#9EA3AA" stroke-width="1.5" stroke-dasharray="4 5"/>
<text x="196" y="120" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">altura del hombro</text>
<circle cx="22" cy="382" r="6" fill="#9EA3AA"/><text x="34" y="402" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla baja</text>
<line x1="22" y1="382" x2="142" y2="226" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="142;189;221;230;230;221;189;142;142" keyTimes="0;0.074;0.148;0.222;0.3;0.5;0.7;0.9;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="226;209;171;130;130;171;209;226;226" keyTimes="0;0.074;0.148;0.222;0.3;0.5;0.7;0.9;1" dur="4.5s" repeatCount="indefinite"/></line>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="110" y1="118" x2="110" y2="250"/><line x1="84" y1="130" x2="136" y2="130"/><line x1="92" y1="250" x2="128" y2="250"/><polyline points="94,250 90,330 88,402"/><polyline points="126,250 130,330 132,402"/></g>
<g stroke="#F4F1EA" stroke-width="12" stroke-linecap="round"><polyline points="86,130 80,186 78,232" stroke-linejoin="round"/>
<line x1="134" y1="130" x2="142" y2="226"><animate attributeName="x2" values="142;189;221;230;230;221;189;142;142" keyTimes="0;0.074;0.148;0.222;0.3;0.5;0.7;0.9;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="226;209;171;130;130;171;209;226;226" keyTimes="0;0.074;0.148;0.222;0.3;0.5;0.7;0.9;1" dur="4.5s" repeatCount="indefinite"/></line></g>
<circle cx="110" cy="92" r="22" fill="#F4F1EA"/><circle cx="102.08" cy="89.8" r="2.64" fill="#16181B"/><circle cx="117.92" cy="89.8" r="2.64" fill="#16181B"/>
</svg>`,

  elevY: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Vista por detrás, a una mano: con la banda enganchada al ancla baja, un brazo sube en diagonal hasta la línea de la Y y baja en 3 segundos; el otro brazo queda abajo">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<circle cx="120" cy="398" r="6" fill="#9EA3AA"/><text x="150" y="396" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla baja</text>
<line x1="120" y1="398" x2="148" y2="226" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="148;192;192;148" keyTimes="0;0.2;0.4;1" dur="5s" repeatCount="indefinite"/><animate attributeName="y2" values="226;47;47;226" keyTimes="0;0.2;0.4;1" dur="5s" repeatCount="indefinite"/></line>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="120" y1="118" x2="120" y2="250"/><line x1="94" y1="130" x2="146" y2="130"/><line x1="102" y1="250" x2="138" y2="250"/><polyline points="104,250 100,330 98,402"/><polyline points="136,250 140,330 142,402"/></g>
<g stroke="#F4F1EA" stroke-width="12" stroke-linecap="round">
<line x1="96" y1="130" x2="92" y2="226"/>
<line x1="144" y1="130" x2="148" y2="226"><animate attributeName="x2" values="148;192;192;148" keyTimes="0;0.2;0.4;1" dur="5s" repeatCount="indefinite"/><animate attributeName="y2" values="226;47;47;226" keyTimes="0;0.2;0.4;1" dur="5s" repeatCount="indefinite"/></line></g>
<line x1="120" y1="130" x2="48" y2="47" stroke="#9EA3AA" stroke-width="1.5" stroke-dasharray="4 5" opacity=".6"/>
<line x1="120" y1="130" x2="192" y2="47" stroke="#9EA3AA" stroke-width="1.5" stroke-dasharray="4 5" opacity=".6"/>
<circle cx="120" cy="92" r="22" fill="#F4F1EA"/>
<text x="214" y="46" text-anchor="middle" fill="#F2913D" font-family="Anton, Impact, sans-serif" font-size="30">Y</text>
<text x="120" y="20" text-anchor="11" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">vista por detrás</text>
</svg>`,

  facePull: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="De perfil mirando a la pared: con los brazos estirados hacia el ancla alta, tira hacia la cara con los codos altos hasta dejar las manos junto a las orejas">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<line x1="16" y1="40" x2="16" y2="412" stroke="#4A5059" stroke-width="3"/>
<circle cx="22" cy="112" r="6" fill="#9EA3AA"/><text x="28" y="98" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla alta</text>
<line x1="22" y1="112" x2="62" y2="120" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="62;174;174;62" keyTimes="0;0.25;0.5;1" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="120;96;96;120" keyTimes="0;0.25;0.5;1" dur="4s" repeatCount="indefinite"/></line>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="160" y1="112" x2="160" y2="398"/><polyline points="160,398 140,400"/></g>
<circle cx="160" cy="90" r="21" fill="#F4F1EA"/><polygon points="141,84.75 131.02,91.05 141,95.88" fill="#F4F1EA"/>
<polyline points="160,128 110,124 62,120" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="points" values="160,128 110,124 62,120;160,128 194,118 174,96;160,128 194,118 174,96;160,128 110,124 62,120" keyTimes="0;0.25;0.5;1" dur="4s" repeatCount="indefinite"/></polyline>
<text x="212" y="142" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">codo alto</text>
</svg>`,

  pajaros: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Vista desde arriba, a una mano: mirando a la pared con la banda en el ancla media, el brazo casi recto se abre hacia el lado y un poco atrás, y vuelve al frente en 2 segundos">
<line x1="14" y1="100" x2="226" y2="100" stroke="#4A5059" stroke-width="3"/>
<circle cx="120" cy="106" r="6" fill="#9EA3AA"/><text x="132" y="92" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media</text>
<line x1="120" y1="106" x2="140" y2="185" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="140;181;211;218;218;211;181;140;140" keyTimes="0;0.095;0.19;0.286;0.343;0.533;0.724;0.914;1" dur="3.5s" repeatCount="indefinite"/><animate attributeName="y2" values="185;191;221;262;262;221;191;185;185" keyTimes="0;0.095;0.19;0.286;0.343;0.533;0.724;0.914;1" dur="3.5s" repeatCount="indefinite"/></line>
<g stroke="#F4F1EA" stroke-width="12" stroke-linecap="round">
<line x1="150" y1="252" x2="140" y2="185"><animate attributeName="x2" values="140;181;211;218;218;211;181;140;140" keyTimes="0;0.095;0.19;0.286;0.343;0.533;0.724;0.914;1" dur="3.5s" repeatCount="indefinite"/><animate attributeName="y2" values="185;191;221;262;262;221;191;185;185" keyTimes="0;0.095;0.19;0.286;0.343;0.533;0.724;0.914;1" dur="3.5s" repeatCount="indefinite"/></line>
<line x1="88" y1="252" x2="152" y2="252" stroke-width="20"/></g>
<polygon points="114.06,242 120,229.2 125.94,242" fill="#F4F1EA"/><circle cx="120" cy="258" r="18" fill="#F4F1EA" stroke="#1F2227" stroke-width="3"/>
<text x="120" y="330" text-anchor="11" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">vista desde arriba</text>
</svg>`,

  rotacion: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Vista desde arriba, de costado a la pared: con el codo pegado al cuerpo y una toalla, el antebrazo gira hacia fuera como una puerta y vuelve en 2 segundos">
<line x1="14" y1="60" x2="14" y2="380" stroke="#4A5059" stroke-width="3"/>
<circle cx="20" cy="200" r="6" fill="#9EA3AA"/><text x="26" y="186" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media</text>
<line x1="20" y1="200" x2="116.5" y2="214.5" stroke="#F2913D" stroke-width="3"><animate attributeName="x2" values="116.5;139.2;166.0;192.8;215.5;215.5;215.5;192.8;166.0;139.2;116.5;116.5" keyTimes="0;0.083;0.167;0.25;0.333;0.444;0.556;0.667;0.778;0.889;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="214.5;199.3;194.0;199.3;214.5;214.5;214.5;199.3;194.0;199.3;214.5;214.5" keyTimes="0;0.083;0.167;0.25;0.333;0.444;0.556;0.667;0.778;0.889;1" dur="4.5s" repeatCount="indefinite"/></line>
<line x1="80" y1="264" x2="160" y2="264" stroke="#F4F1EA" stroke-width="20" stroke-linecap="round"/>
<rect x="160" y="270" width="12" height="16" rx="3" fill="#7FB2E5"/>
<g><animateTransform attributeName="transform" type="rotate" values="-45 166 264;-22.5 166 264;0 166 264;22.5 166 264;45 166 264;45 166 264;45 166 264;22.5 166 264;0 166 264;-22.5 166 264;-45 166 264;-45 166 264" keyTimes="0;0.083;0.167;0.25;0.333;0.444;0.556;0.667;0.778;0.889;1" dur="4.5s" repeatCount="indefinite"/>
<line x1="166" y1="264" x2="166" y2="194" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round"/><circle cx="166" cy="194" r="7" fill="#F2913D"/></g>
<polygon points="114.06,252 120,239.2 125.94,252" fill="#F4F1EA"/><circle cx="120" cy="268" r="18" fill="#F4F1EA" stroke="#1F2227" stroke-width="3"/>
<text x="176" y="304" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">codo pegado</text><text x="120" y="350" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">vista desde arriba</text>
</svg>`,

  dominadasEsc: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Colgado de la barra con los brazos rectos: los hombros bajan alejándose de las orejas y el cuerpo sube unos centímetros sin doblar los codos; pausa de 1 s arriba">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/>
<line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/>
<line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round">
<line x1="86" y1="30" x2="90" y2="126"><animate attributeName="y2" values="126;110;110;126" keyTimes="0;0.3;0.6;1" dur="3.5s" repeatCount="indefinite"/></line>
<line x1="154" y1="30" x2="150" y2="126"><animate attributeName="y2" values="126;110;110;126" keyTimes="0;0.3;0.6;1" dur="3.5s" repeatCount="indefinite"/></line></g>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -16;0 -16;0 0" keyTimes="0;0.3;0.6;1" dur="3.5s" repeatCount="indefinite"/>
<g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
<line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/>
<polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g>
<circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.08" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.92" cy="101.8" r="2.64" fill="#16181B"/></g>
<path d="M204 190 V130 M195 141 L204 130 L213 141" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<text x="204" y="208" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">el cuerpo</text><text x="204" y="223" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">sube</text>
</svg>`,

  bienMalPress: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="De perfil. Bien: espalda recta y manos encima de los pies. Mal: espalda baja arqueada y brazos hacia atrás"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ ESPALDA RECTA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ARQUEADA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="74" y1="134" x2="66" y2="16" stroke="#F2913D" stroke-width="2.5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="66" y1="50" x2="66" y2="130"/><polyline points="66,130 78,132"/><line x1="66" y1="56" x2="66" y2="16"/></g><circle cx="66" cy="40" r="9" fill="#F4F1EA"/><polygon points="73,37.75 78.42,40.45 73,42.52" fill="#F4F1EA"/><line x1="214" y1="134" x2="188" y2="18" stroke="#F2913D" stroke-width="2.5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M204 50 Q222 88 206 130"/><polyline points="206,130 218,132"/><line x1="203" y1="56" x2="188" y2="18"/></g><circle cx="200" cy="40" r="9" fill="#F4F1EA"/><polygon points="207,37.75 212.42,40.45 207,42.52" fill="#F4F1EA"/></svg>`,

  bienMalLateral: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: el brazo sube justo a la altura del hombro. Mal: pasarse del hombro con impulso"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ ALTURA DEL HOMBRO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ SE PASA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="60" y1="56" x2="118" y2="56" stroke="#9EA3AA" stroke-width="1" stroke-dasharray="3 4"/><line x1="200" y1="56" x2="258" y2="56" stroke="#9EA3AA" stroke-width="1" stroke-dasharray="3 4"/><line x1="22" y1="132" x2="108" y2="56" stroke="#F2913D" stroke-width="2.5"/><line x1="162" y1="132" x2="246" y2="22" stroke="#F2913D" stroke-width="2.5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="56" y1="50" x2="56" y2="106"/><polyline points="49,134 56,106 63,134"/><polyline points="46,56 66,56"/><line x1="46" y1="56" x2="42" y2="96"/><line x1="66" y1="56" x2="108" y2="56"/></g><circle cx="56" cy="40" r="9" fill="#F4F1EA"/><circle cx="52.76" cy="39.1" r="1.3" fill="#16181B"/><circle cx="59.24" cy="39.1" r="1.3" fill="#16181B"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="196" y1="50" x2="196" y2="106"/><polyline points="189,134 196,106 203,134"/><polyline points="186,56 206,56"/><line x1="186" y1="56" x2="182" y2="96"/><line x1="206" y1="56" x2="246" y2="22"/></g><circle cx="196" cy="40" r="9" fill="#F4F1EA"/><circle cx="192.76" cy="39.1" r="1.3" fill="#16181B"/><circle cx="199.24" cy="39.1" r="1.3" fill="#16181B"/></svg>`,

  bienMalY: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Por detrás, a una mano. Bien: brazo en la línea de la Y con el hombro bajo. Mal: hombro encogido hacia la oreja"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ HOMBRO BAJO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ENCOGIDO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/>
<line x1="70" y1="132" x2="108" y2="20" stroke="#F2913D" stroke-width="2"/><line x1="210" y1="132" x2="246" y2="22" stroke="#F2913D" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<line x1="70" y1="50" x2="70" y2="106"/><polyline points="63,134 70,106 77,134"/><polyline points="60,58 80,58"/><line x1="60" y1="58" x2="56" y2="98"/><line x1="80" y1="58" x2="108" y2="20"/>
<line x1="210" y1="50" x2="210" y2="106"/><polyline points="203,134 210,106 217,134"/><polyline points="200,58 210,54 222,44"/><line x1="200" y1="58" x2="196" y2="98"/><line x1="222" y1="44" x2="246" y2="22"/></g>
<circle cx="70" cy="42" r="9" fill="#F4F1EA"/><circle cx="210" cy="40" r="9" fill="#F4F1EA"/>
</svg>`,

  bienMalFace: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos a la altura de los hombros y manos a la cara. Mal: codos bajos tirando hacia la tripa, eso es un remo"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO ALTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO BAJO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="26" y1="30" x2="26" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="166" y1="30" x2="166" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="28" y1="46" x2="80" y2="38" stroke="#F2913D" stroke-width="2.5"/><line x1="168" y1="46" x2="216" y2="82" stroke="#F2913D" stroke-width="2.5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="84" y1="52" x2="84" y2="130"/><polyline points="84,130 74,132"/><polyline points="84,58 100,50 80,38"/><line x1="224" y1="52" x2="224" y2="130"/><polyline points="224,130 214,132"/><polyline points="224,58 232,76 216,82"/></g><circle cx="84" cy="40" r="9" fill="#F4F1EA"/><polygon points="77,37.75 71.58,40.45 77,42.52" fill="#F4F1EA"/><circle cx="224" cy="40" r="9" fill="#F4F1EA"/><polygon points="217,37.75 211.58,40.45 217,42.52" fill="#F4F1EA"/></svg>`,

  bienMalPajaros: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Vista desde arriba, a una mano. Bien: brazo casi recto que se abre como un ala. Mal: codo doblado tirando hacia atrás, se convierte en un remo"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ COMO UN ALA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO DOBLADO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/>
<line x1="24" y1="30" x2="116" y2="30" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="30" x2="256" y2="30" stroke="#4A5059" stroke-width="2"/>
<line x1="70" y1="32" x2="112" y2="96" stroke="#F2913D" stroke-width="2"/><line x1="210" y1="32" x2="242" y2="84" stroke="#F2913D" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="58,104 82,104 112,96"/><polyline points="198,108 238,108 242,84"/></g>
<polygon points="67.36,100 70,93.2 72.64,100" fill="#F4F1EA"/><circle cx="70" cy="106" r="8" fill="#F4F1EA"/><polygon points="207.36,102 210,95.2 212.64,102" fill="#F4F1EA"/><circle cx="210" cy="108" r="8" fill="#F4F1EA"/>
</svg>`,

  bienMalRotacion: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="De frente. Bien: codo pegado con la toalla y antebrazo girando hacia fuera. Mal: el codo se despega para ganar recorrido"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO PEGADO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO FUERA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="14" y1="30" x2="14" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="154" y1="30" x2="154" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="16" y1="82" x2="106" y2="82" stroke="#F2913D" stroke-width="2.5"/><line x1="156" y1="82" x2="252" y2="62" stroke="#F2913D" stroke-width="2.5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="60" y1="50" x2="60" y2="106"/><polyline points="53,134 60,106 67,134"/><polyline points="50,56 70,56"/><line x1="50" y1="56" x2="46" y2="96"/><polyline points="70,56 72,82 106,82"/></g><circle cx="60" cy="40" r="9" fill="#F4F1EA"/><circle cx="56.76" cy="39.1" r="1.3" fill="#16181B"/><circle cx="63.24" cy="39.1" r="1.3" fill="#16181B"/><rect x="73" y="68" width="7" height="12" rx="2" fill="#7FB2E5"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="200" y1="50" x2="200" y2="106"/><polyline points="193,134 200,106 207,134"/><polyline points="190,56 210,56"/><line x1="190" y1="56" x2="186" y2="96"/><polyline points="210,56 230,76 252,62"/></g><circle cx="200" cy="40" r="9" fill="#F4F1EA"/><circle cx="196.76" cy="39.1" r="1.3" fill="#16181B"/><circle cx="203.24" cy="39.1" r="1.3" fill="#16181B"/></svg>`,

  bienMalDominadas: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos rectos, solo se mueven hombros y omóplatos. Mal: codos doblados, eso es media dominada"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODOS RECTOS</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODOS DOBLADOS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="24" y1="136" x2="116" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="164" y1="136" x2="256" y2="136" stroke="#4A5059" stroke-width="2"/><line x1="36" y1="26" x2="104" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><line x1="176" y1="26" x2="244" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="58,26 60,62 80,62 82,26"/><line x1="70" y1="62" x2="70" y2="106"/><polyline points="63,130 70,106 77,130"/><polyline points="196,26 184,46 200,62 220,62 236,46 224,26"/><line x1="210" y1="62" x2="210" y2="106"/><polyline points="203,130 210,106 217,130"/></g><circle cx="70" cy="52" r="9" fill="#F4F1EA"/><circle cx="66.76" cy="51.1" r="1.3" fill="#16181B"/><circle cx="73.24" cy="51.1" r="1.3" fill="#16181B"/><circle cx="210" cy="44" r="9" fill="#F4F1EA"/><circle cx="206.76" cy="43.1" r="1.3" fill="#16181B"/><circle cx="213.24" cy="43.1" r="1.3" fill="#16181B"/></svg>`,

  flexiones: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión de perfil: desde brazos estirados y cuerpo recto como una tabla, baja en 3 segundos hasta que el pecho casi toca el suelo con los codos hacia atrás, y sube en 1 segundo">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round">
<polyline points="80,330 215,396" stroke-width="13"><animate attributeName="points" values="80,330 215,396;86,380 215,396;86,380 215,396;80,330 215,396;80,330 215,396" keyTimes="0;0.652;0.717;0.935;1" dur="4.6s" repeatCount="indefinite"/></polyline>
<polyline points="80,402 80,366 80,330" stroke-width="11"><animate attributeName="points" values="80,402 80,366 80,330;80,402 108,380 86,380;80,402 108,380 86,380;80,402 80,366 80,330;80,402 80,366 80,330" keyTimes="0;0.652;0.717;0.935;1" dur="4.6s" repeatCount="indefinite"/></polyline>
</g>
<g><animateTransform attributeName="transform" type="translate" values="0 0;5 48;5 48;0 0;0 0" keyTimes="0;0.652;0.717;0.935;1" dur="4.6s" repeatCount="indefinite"/>
<polygon points="44,318 35,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/></g>
<text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">cuerpo recto como una tabla</text>
<text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">3 s abajo · 1 s arriba</text>
<text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,

  bienMalFlexiones: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="De perfil. Bien: cuerpo recto de la cabeza a los talones. Mal: cadera hundida, la zona lumbar sufre"><text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ UNA TABLA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CADERA HUNDIDA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="120" x2="120" y2="120" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="120" x2="260" y2="120" stroke="#4A5059" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<line x1="40" y1="118" x2="40" y2="88"/><line x1="40" y1="88" x2="116" y2="116"/>
<line x1="180" y1="118" x2="180" y2="88"/><polyline points="180,88 216,110 256,116"/></g>
<line x1="40" y1="88" x2="116" y2="116" stroke="#7FB2E5" stroke-width="1.5" stroke-dasharray="3 4" opacity=".7"/>
<line x1="180" y1="88" x2="256" y2="116" stroke="#9EA3AA" stroke-width="1.5" stroke-dasharray="3 4" opacity=".7"/>
<polygon points="24,79 18,83 24,86" fill="#F4F1EA"/><circle cx="32" cy="80" r="9" fill="#F4F1EA"/>
<polygon points="164,79 158,83 164,86" fill="#F4F1EA"/><circle cx="172" cy="80" r="9" fill="#F4F1EA"/>
</svg>`,
  flexEscap: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión escapular de perfil: en plancha con los brazos rectos, el pecho baja unos centímetros juntando los omóplatos y luego empujas el suelo para separarlos, con pausa de 1 segundo en cada punto">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="80,330 215,396" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,330 215,396;80,340 215,396;80,340 215,396;80,320 215,396;80,320 215,396;80,330 215,396" keyTimes="0;0.2;0.4;0.62;0.84;1" dur="4.5s" repeatCount="indefinite"/></polyline><polyline points="80,402 80,330" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,402 80,330;80,402 80,340;80,402 80,340;80,402 80,320;80,402 80,320;80,402 80,330" keyTimes="0;0.2;0.4;0.62;0.84;1" dur="4.5s" repeatCount="indefinite"/></polyline><g><polygon points="44,318 34,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;0 10;0 10;0 -10;0 -10;0 0" keyTimes="0;0.2;0.4;0.62;0.84;1" dur="4.5s" repeatCount="indefinite"/></g><path d="M118 300 L118 326 M112.9 318.6 L118 326 L123.1 318.6" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M134 326 L134 300 M139.1 307.4 L134 300 L128.9 307.4" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codos rectos: solo se mueven</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">los omóplatos · pausa 1 s</text>
</svg>`,
  bienMalFlexEscap: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos rectos, solo se mueven los omóplatos. Mal: codos doblados, es una flexión corta">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODOS RECTOS</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODOS DOBLADOS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="120" x2="120" y2="120" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="120" x2="260" y2="120" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="40" y1="118" x2="40" y2="84"/><line x1="40" y1="84" x2="116" y2="116"/><polyline points="180,118 194,104 184,96"/><line x1="184" y1="96" x2="256" y2="116"/></g><polygon points="25,76 15,82 25,86" fill="#F4F1EA"/><circle cx="30" cy="76" r="8" fill="#F4F1EA"/><polygon points="167,88 157,94 167,98" fill="#F4F1EA"/><circle cx="172" cy="88" r="8" fill="#F4F1EA"/>
</svg>`,
  flexBanda: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión con banda de perfil: la banda pasa por la espalda a la altura de los omóplatos y la sujetas bajo cada mano; bajas en 2 segundos y subes de forma explosiva, más duro arriba">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="80,330 215,396" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,330 215,396;86,380 215,396;86,380 215,396;80,330 215,396;80,330 215,396" keyTimes="0;0.588;0.676;0.853;1" dur="3.4s" repeatCount="indefinite"/></polyline><polyline points="80,402 80,366 80,330" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,402 80,366 80,330;80,402 108,380 86,380;80,402 108,380 86,380;80,402 80,366 80,330;80,402 80,366 80,330" keyTimes="0;0.588;0.676;0.853;1" dur="3.4s" repeatCount="indefinite"/></polyline><line x1="70" y1="403" x2="98" y2="337" stroke="#F2913D" stroke-width="4" stroke-linecap="round"><animate attributeName="x2" values="98;102;102;98;98" keyTimes="0;0.588;0.676;0.853;1" dur="3.4s" repeatCount="indefinite"/><animate attributeName="y2" values="337;382;382;337;337" keyTimes="0;0.588;0.676;0.853;1" dur="3.4s" repeatCount="indefinite"/></line><g><polygon points="44,318 34,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;5 48;5 48;0 0;0 0" keyTimes="0;0.588;0.676;0.853;1" dur="3.4s" repeatCount="indefinite"/></g><text x="150" y="318" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">banda por la espalda</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">2 s abajo · explosivo arriba</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la banda frena la subida</text>
</svg>`,
  bienMalFlexBanda: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: cuerpo en línea aunque la banda empuje. Mal: la banda hunde la cadera">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ EN LÍNEA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CADERA HUNDIDA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="120" x2="120" y2="120" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="120" x2="260" y2="120" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="40" y1="118" x2="40" y2="88"/><line x1="40" y1="88" x2="116" y2="116"/><line x1="180" y1="118" x2="180" y2="88"/><polyline points="180,88 216,110 256,116"/></g><line x1="36" y1="119" x2="52" y2="93" stroke="#F2913D" stroke-width="2.5"/><line x1="176" y1="119" x2="192" y2="95" stroke="#F2913D" stroke-width="2.5"/><polygon points="27,80 17,86 27,90" fill="#F4F1EA"/><circle cx="32" cy="80" r="8" fill="#F4F1EA"/><polygon points="167,80 157,86 167,90" fill="#F4F1EA"/><circle cx="172" cy="80" r="8" fill="#F4F1EA"/>
</svg>`,
  arquera: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión arquera de frente: manos muy separadas; bajas hacia una mano doblando solo ese brazo mientras el otro queda recto, y subes al centro">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="28,402 62,368 96,334" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="28,402 62,368 96,334;28,402 30,364 56,380;28,402 30,364 56,380;28,402 62,368 96,334;28,402 62,368 96,334" keyTimes="0;0.5;0.575;0.825;1" dur="4s" repeatCount="indefinite"/></polyline><polyline points="144,334 178,368 212,402" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="144,334 178,368 212,402;104,380 158,391 212,402;104,380 158,391 212,402;144,334 178,368 212,402;144,334 178,368 212,402" keyTimes="0;0.5;0.575;0.825;1" dur="4s" repeatCount="indefinite"/></polyline><polyline points="96,334 144,334" stroke="#F4F1EA" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="96,334 144,334;56,380 104,380;56,380 104,380;96,334 144,334;96,334 144,334" keyTimes="0;0.5;0.575;0.825;1" dur="4s" repeatCount="indefinite"/></polyline><g><circle cx="120" cy="316" r="17" fill="#F4F1EA"/><circle cx="113.9" cy="314.3" r="2.04" fill="#16181B"/><circle cx="126.1" cy="314.3" r="2.04" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;-40 46;-40 46;0 0;0 0" keyTimes="0;0.5;0.575;0.825;1" dur="4s" repeatCount="indefinite"/></g><text x="46" y="300" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">baja aquí</text><text x="190" y="370" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">brazo recto</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">un brazo trabaja, el otro</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">queda recto y solo ayuda</text>
</svg>`,
  bienMalArquera: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: el brazo contrario queda recto. Mal: los dos codos doblados, es una flexión abierta">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ UN BRAZO RECTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ LOS DOS DOBLADOS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="14" y1="122" x2="130" y2="122" stroke="#4A5059" stroke-width="2"/><line x1="150" y1="122" x2="266" y2="122" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,120 22,96 40,102"/><line x1="40" y1="102" x2="64" y2="102" stroke-width="7"/><line x1="64" y1="102" x2="124" y2="120"/><polyline points="156,120 166,96 196,106"/><line x1="196" y1="106" x2="224" y2="106" stroke-width="7"/><polyline points="224,106 254,96 264,120"/></g><circle cx="52" cy="90" r="8" fill="#F4F1EA"/><circle cx="49.1" cy="89.2" r="0.96" fill="#16181B"/><circle cx="54.9" cy="89.2" r="0.96" fill="#16181B"/><circle cx="210" cy="94" r="8" fill="#F4F1EA"/><circle cx="207.1" cy="93.2" r="0.96" fill="#16181B"/><circle cx="212.9" cy="93.2" r="0.96" fill="#16181B"/>
</svg>`,
  pressPecho: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Press de pecho a una mano de perfil: de espaldas a la pared con la banda en el ancla media, empujas al frente hasta estirar el brazo sin girar el tronco y vuelves en 2 segundos">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="250" r="6" fill="#9EA3AA"/><text x="28" y="238" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media</text><line x1="18" y1="250" x2="140" y2="158" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="140;208;140;140" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/><animate attributeName="y2" values="158;150;158;158" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="116" y1="118" x2="112" y2="250" stroke-width="13"/><polyline points="112,250 94,328 82,402" stroke-width="13"/><polyline points="112,250 138,324 150,402" stroke-width="13"/><polyline points="116,136 104,190 122,232" stroke-width="12"/><polyline points="116,136 90,170 140,158" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="116,136 90,170 140,158;116,136 162,144 208,150;116,136 90,170 140,158;116,136 90,170 140,158" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/></polyline></g><polygon points="137,88 147,94 137,99" fill="#F4F1EA"/><circle cx="118" cy="92" r="22" fill="#F4F1EA"/><path d="M176 110 L214 110 M206.6 115.1 L214 110 L206.6 104.9" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="186" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empuja al frente</text>
</svg>`,
  pressInclinado: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Press inclinado a una mano de perfil: de espaldas a la pared con la banda en el ancla baja, empujas en diagonal hacia arriba hasta que la mano queda por encima de los ojos">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="368" r="6" fill="#9EA3AA"/><text x="28" y="356" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla baja</text><line x1="18" y1="368" x2="136" y2="160" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="136;192;136;136" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/><animate attributeName="y2" values="160;66;160;160" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="116" y1="118" x2="112" y2="250" stroke-width="13"/><polyline points="112,250 94,328 82,402" stroke-width="13"/><polyline points="112,250 138,324 150,402" stroke-width="13"/><polyline points="116,136 104,190 122,232" stroke-width="12"/><polyline points="116,136 100,186 136,160" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="116,136 100,186 136,160;116,136 156,104 192,66;116,136 100,186 136,160;116,136 100,186 136,160" keyTimes="0;0.286;0.857;1" dur="3.5s" repeatCount="indefinite"/></polyline></g><polygon points="137,88 147,94 137,99" fill="#F4F1EA"/><circle cx="118" cy="92" r="22" fill="#F4F1EA"/><path d="M170 150 L206 110 M204.8 118.9 L206 110 L197.3 112.1" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="186" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">en diagonal</text>
</svg>`,
  bienMalPressPecho: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: tronco firme y brazo al frente. Mal: arquear la espalda para empujar">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ TRONCO FIRME</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ESPALDA ARQUEADA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="38" x2="78" y2="90"/><polyline points="78,90 70,108 64,124"/><polyline points="78,90 90,108 96,124"/><line x1="80" y1="44" x2="120" y2="50"/></g><line x1="12" y1="80" x2="120" y2="50" stroke="#F2913D" stroke-width="2"/><polygon points="86,24 96,30 86,35" fill="#F4F1EA"/><circle cx="81" cy="28" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M220 38 Q208 64 218 90" fill="none"/><polyline points="218,90 210,108 204,124"/><polyline points="218,90 230,108 236,124"/><line x1="220" y1="44" x2="260" y2="50"/></g><line x1="152" y1="80" x2="260" y2="50" stroke="#F2913D" stroke-width="2"/><polygon points="226,24 236,30 226,35" fill="#F4F1EA"/><circle cx="221" cy="28" r="8" fill="#F4F1EA"/>
</svg>`,
  bienMalInclinado: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: tronco firme, la diagonal la hace el brazo. Mal: arquear la espalda para subir más">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ TRONCO FIRME</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ESPALDA ARQUEADA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="38" x2="78" y2="90"/><polyline points="78,90 70,108 64,124"/><polyline points="78,90 90,108 96,124"/><line x1="80" y1="44" x2="120" y2="26"/></g><line x1="12" y1="112" x2="120" y2="26" stroke="#F2913D" stroke-width="2"/><polygon points="86,24 96,30 86,35" fill="#F4F1EA"/><circle cx="81" cy="28" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M220 38 Q208 64 218 90" fill="none"/><polyline points="218,90 210,108 204,124"/><polyline points="218,90 230,108 236,124"/><line x1="220" y1="44" x2="260" y2="26"/></g><line x1="152" y1="112" x2="260" y2="26" stroke="#F2913D" stroke-width="2"/><polygon points="226,24 236,30 226,35" fill="#F4F1EA"/><circle cx="221" cy="28" r="8" fill="#F4F1EA"/>
</svg>`,
  apertura: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Apertura a una mano vista desde arriba: de espaldas al ancla media, el brazo abierto con el codo algo flexionado se cierra en arco hasta delante del centro del pecho, pausa 1 segundo y abre en 2">
<line x1="14" y1="372" x2="226" y2="372" stroke="#4A5059" stroke-width="3"/><circle cx="190" cy="366" r="6" fill="#9EA3AA"/><text x="190" y="392" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media detrás</text><path d="M226 238 Q214 178 126 172" stroke="#4A5059" stroke-width="2" stroke-dasharray="4 5"/><line x1="190" y1="366" x2="226" y2="238" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="226;200;126;126;200;226" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="238;180;178;178;180;238" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><polyline points="90,252 72,270 92,284" stroke-width="12"/><polyline points="150,252 190,240 226,238" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="150,252 190,240 226,238;150,252 182,214 200,180;150,252 156,204 126,178;150,252 156,204 126,178;150,252 182,214 200,180;150,252 190,240 226,238" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></polyline><line x1="88" y1="252" x2="152" y2="252" stroke-width="20"/></g><polygon points="114.06,242 120,229.2 125.94,242" fill="#F4F1EA"/><circle cx="120" cy="258" r="18" fill="#F4F1EA" stroke="#1F2227" stroke-width="3"/><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">VISTA DESDE ARRIBA</text><text x="120" y="120" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">cierra en arco, como si</text><text x="120" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">abrazaras un árbol · pausa 1 s</text>
</svg>`,
  bienMalApertura: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codo con un leve ángulo fijo, la mano dibuja un arco. Mal: codo muy doblado, se convierte en un press">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO FIJO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO DOBLADO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="44" y1="104" x2="96" y2="104" stroke-width="9"/><polyline points="94,104 118,84 122,52" stroke-width="5"/><line x1="184" y1="104" x2="236" y2="104" stroke-width="9"/><polyline points="234,104 252,98 226,74" stroke-width="5"/></g><path d="M128 100 Q126 60 92 48" stroke="#7FB2E5" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="70" cy="108" r="9" fill="#F4F1EA"/><circle cx="210" cy="108" r="9" fill="#F4F1EA"/><text x="70" y="132" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text><text x="210" y="132" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text>
</svg>`,
  cruce: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Cruce a una mano de frente: de espaldas al ancla alta, el brazo abierto a la altura del hombro baja en arco hasta cruzar delante de la cadera contraria, pausa 1 segundo abajo y vuelve en 2; la otra mano en la cadera">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><text x="176" y="54" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla alta detrás</text><circle cx="224" cy="70" r="5" fill="#9EA3AA"/><line x1="224" y1="70" x2="222" y2="126" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="222;190;110;110;190;222" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="126;214;236;236;214;126" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="120" y1="118" x2="120" y2="250" stroke-width="13"/><line x1="94" y1="130" x2="146" y2="130" stroke-width="13"/><line x1="102" y1="250" x2="138" y2="250" stroke-width="13"/><polyline points="104,250 98,330 92,404" stroke-width="13"/><polyline points="136,250 144,330 150,404" stroke-width="13"/><polyline points="96,130 76,186 100,232" stroke-width="12"/><polyline points="146,132 184,130 222,126" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,132 184,130 222,126;146,132 178,172 190,214;146,132 150,196 110,236;146,132 150,196 110,236;146,132 178,172 190,214;146,132 184,130 222,126" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></polyline></g><circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="89.8" r="2.64" fill="#16181B"/><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text><text x="46" y="300" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">baja en arco</text><text x="46" y="316" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">hasta la cadera</text><text x="46" y="332" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">contraria</text>
</svg>`,
  bienMalCruce: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: hombro bajo y codo fijo, la mano cruza abajo. Mal: hombro encogido y codo doblando: empujas en vez de abrazar">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ HOMBRO BAJO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ HOMBRO ENCOGIDO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="46" x2="70" y2="96"/><line x1="56" y1="52" x2="84" y2="52"/><polyline points="84,52 88,82 62,98"/><polyline points="62,96 60,126"/><polyline points="78,96 80,126"/><line x1="210" y1="46" x2="210" y2="96"/><line x1="196" y1="54" x2="226" y2="44"/><polyline points="226,44 236,70 206,80"/><polyline points="202,96 200,126"/><polyline points="218,96 220,126"/></g><circle cx="70" cy="34" r="9" fill="#F4F1EA"/><circle cx="66.8" cy="33.1" r="1.08" fill="#16181B"/><circle cx="73.2" cy="33.1" r="1.08" fill="#16181B"/><circle cx="210" cy="34" r="9" fill="#F4F1EA"/><circle cx="206.8" cy="33.1" r="1.08" fill="#16181B"/><circle cx="213.2" cy="33.1" r="1.08" fill="#16181B"/>
</svg>`,
  isoFlex: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Isométrica a media flexión de perfil: desde arriba con el cuerpo recto bajas hasta la mitad del recorrido y te quedas quieto el tiempo marcado, respirando normal">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="80,330 215,396" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,330 215,396;83,356 215,396;83,356 215,396;80,330 215,396" keyTimes="0;0.2;0.85;1" dur="6s" repeatCount="indefinite"/></polyline><polyline points="80,402 80,366 80,330" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,402 80,366 80,330;80,402 102,380 83,356;80,402 102,380 83,356;80,402 80,366 80,330" keyTimes="0;0.2;0.85;1" dur="6s" repeatCount="indefinite"/></polyline><g><polygon points="44,318 34,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;3 26;3 26;0 0" keyTimes="0;0.2;0.85;1" dur="6s" repeatCount="indefinite"/></g><line x1="120" y1="360" x2="200" y2="360" stroke="#F2913D" stroke-width="2" stroke-dasharray="5 5"/><text x="172" y="352" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">aguanta aquí</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">a mitad de camino, quieto</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">y respirando normal</text>
</svg>`,
  bienMalIso: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos a unos 45° del cuerpo. Mal: codos abiertos en cruz, todo el peso va al hombro">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODOS A 45°</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODOS EN CRUZ</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="50" x2="70" y2="124" stroke-width="7"/><line x1="54" y1="54" x2="86" y2="54" stroke-width="7"/><line x1="54" y1="54" x2="34" y2="80" stroke-width="5"/><line x1="86" y1="54" x2="106" y2="80" stroke-width="5"/><line x1="210" y1="50" x2="210" y2="124" stroke-width="7"/><line x1="194" y1="54" x2="226" y2="54" stroke-width="7"/><line x1="194" y1="54" x2="160" y2="54" stroke-width="5"/><line x1="226" y1="54" x2="260" y2="54" stroke-width="5"/></g><polygon points="65,36 70,26 75,36" fill="#F4F1EA"/><circle cx="70" cy="42" r="9" fill="#F4F1EA"/><polygon points="205,36 210,26 215,36" fill="#F4F1EA"/><circle cx="210" cy="42" r="9" fill="#F4F1EA"/><text x="70" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text><text x="210" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text>
</svg>`,
  dominada: `
<svg viewBox="0 -30 240 450" fill="none" role="img" aria-label="Dominada de frente con agarre paralelo: desde colgado con los brazos estirados, tira con los codos hacia las costillas hasta pasar la barbilla por encima de la barra y baja controlando">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><polyline points="86,30 88,78 90,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="86,30 88,78 90,126;86,30 56,52 90,30;86,30 56,52 90,30;86,30 88,78 90,126;86,30 88,78 90,126" keyTimes="0;0.333;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline><polyline points="154,30 152,78 150,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="154,30 152,78 150,126;154,30 184,52 150,30;154,30 184,52 150,30;154,30 152,78 150,126;154,30 152,78 150,126" keyTimes="0;0.333;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline><g><g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/><polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g><circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="101.8" r="2.64" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -96;0 -96;0 0;0 0" keyTimes="0;0.333;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></g><text x="206" y="-8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">barbilla</text><text x="206" y="8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">sobre la barra</text><text x="206" y="330" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">brazos</text><text x="206" y="346" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">estirados</text>
</svg>`,
  dominadaAsistida: `
<svg viewBox="0 -30 240 450" fill="none" role="img" aria-label="Dominada asistida de frente: la banda de ayuda cuelga de la barra y pasa bajo un pie; subes hasta pasar la barbilla y bajas en 2 segundos">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><polyline points="86,30 88,78 90,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="86,30 88,78 90,126;86,30 56,52 90,30;86,30 56,52 90,30;86,30 88,78 90,126;86,30 88,78 90,126" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><polyline points="154,30 152,78 150,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="154,30 152,78 150,126;154,30 184,52 150,30;154,30 184,52 150,30;154,30 152,78 150,126;154,30 152,78 150,126" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><g><g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/><polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g><circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="101.8" r="2.64" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -96;0 -96;0 0;0 0" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></g><polyline points="106,30 94,300 94,390 110,390 112,30" stroke="#F2913D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="106,30 94,300 94,390 110,390 112,30;106,30 94,210 94,294 110,294 112,30;106,30 94,210 94,294 110,294 112,30;106,30 94,300 94,390 110,390 112,30;106,30 94,300 94,390 110,390 112,30" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><text x="196" y="-8" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la banda</text><text x="196" y="8" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empuja abajo</text><text x="196" y="330" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pie en</text><text x="196" y="346" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la banda</text><text x="120" y="436" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">1 s subir · 2 s bajar</text>
</svg>`,
  negativa: `
<svg viewBox="0 -30 240 450" fill="none" role="img" aria-label="Dominada negativa de frente: empiezas arriba con la barbilla sobre la barra y bajas en 5 segundos frenando todo el recorrido hasta estirar los brazos">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><polyline points="86,30 56,52 90,30" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="86,30 56,52 90,30;86,30 56,52 90,30;86,30 88,78 90,126;86,30 88,78 90,126;86,30 56,52 90,30" keyTimes="0;0.1;0.8;0.9;1" dur="7s" repeatCount="indefinite"/></polyline><polyline points="154,30 184,52 150,30" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="154,30 184,52 150,30;154,30 184,52 150,30;154,30 152,78 150,126;154,30 152,78 150,126;154,30 184,52 150,30" keyTimes="0;0.1;0.8;0.9;1" dur="7s" repeatCount="indefinite"/></polyline><g><g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/><polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g><circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="101.8" r="2.64" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 -96;0 -96;0 0;0 0;0 -96" keyTimes="0;0.1;0.8;0.9;1" dur="7s" repeatCount="indefinite"/></g><path d="M212 110 L212 230 M206.9 222.6 L212 230 L217.1 222.6" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="206" y="-8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empieza</text><text x="206" y="8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">arriba</text><text x="206" y="250" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">baja en 5 s</text>
</svg>`,
  negativaLarga: `
<svg viewBox="0 -30 240 450" fill="none" role="img" aria-label="Dominada negativa de frente: empiezas arriba con la barbilla sobre la barra y bajas en 10 segundos frenando todo el recorrido hasta estirar los brazos">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><polyline points="86,30 56,52 90,30" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="86,30 56,52 90,30;86,30 56,52 90,30;86,30 88,78 90,126;86,30 88,78 90,126;86,30 56,52 90,30" keyTimes="0;0.06;0.89;0.95;1" dur="12s" repeatCount="indefinite"/></polyline><polyline points="154,30 184,52 150,30" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="154,30 184,52 150,30;154,30 184,52 150,30;154,30 152,78 150,126;154,30 152,78 150,126;154,30 184,52 150,30" keyTimes="0;0.06;0.89;0.95;1" dur="12s" repeatCount="indefinite"/></polyline><g><g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/><polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g><circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="101.8" r="2.64" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 -96;0 -96;0 0;0 0;0 -96" keyTimes="0;0.06;0.89;0.95;1" dur="12s" repeatCount="indefinite"/></g><path d="M212 110 L212 230 M206.9 222.6 L212 230 L217.1 222.6" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="206" y="-8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empieza</text><text x="206" y="8" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">arriba</text><text x="206" y="250" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">baja en 10 s</text>
</svg>`,
  bienMalBarbilla: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: barbilla por encima de la barra: repetición completa. Mal: la barbilla no llega: no cuenta">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ BARBILLA ARRIBA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ NO LLEGA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g transform="translate(0,12)"><line x1="24" y1="26" x2="116" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><line x1="164" y1="26" x2="256" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="58,26 46,40 62,36"/><polyline points="82,26 94,40 78,36"/><line x1="70" y1="34" x2="70" y2="84"/><polyline points="63,108 70,84 77,108"/><polyline points="198,26 184,46 202,50"/><polyline points="222,26 236,46 218,50"/><line x1="210" y1="48" x2="210" y2="98"/><polyline points="203,122 210,98 217,122"/></g><circle cx="70" cy="16" r="9" fill="#F4F1EA"/><circle cx="66.8" cy="15.1" r="1.08" fill="#16181B"/><circle cx="73.2" cy="15.1" r="1.08" fill="#16181B"/><circle cx="210" cy="40" r="9" fill="#F4F1EA"/><circle cx="206.8" cy="39.1" r="1.08" fill="#16181B"/><circle cx="213.2" cy="39.1" r="1.08" fill="#16181B"/><text x="250" y="58" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="9">no llega</text></g>
</svg>`,
  bienMalAsistida: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: subida vertical y controlada, sin balanceo. Mal: la banda te lanza y te balanceas: baja más despacio">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CONTROLADA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ BALANCEO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g transform="translate(0,12)"><line x1="24" y1="26" x2="116" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><line x1="164" y1="26" x2="256" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="58,26 56,58 82,58 84,26"/><line x1="70" y1="58" x2="70" y2="100"/><polyline points="64,124 70,100 76,124"/></g><polyline points="68,26 64,122 76,122 72,26" stroke="#F2913D" stroke-width="2"/><circle cx="70" cy="48" r="9" fill="#F4F1EA"/><circle cx="66.8" cy="47.1" r="1.08" fill="#16181B"/><circle cx="73.2" cy="47.1" r="1.08" fill="#16181B"/><g transform="rotate(-22 210 26)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="198,26 196,58 222,58 224,26"/><line x1="210" y1="58" x2="210" y2="100"/><polyline points="204,124 210,100 216,124"/></g><circle cx="210" cy="48" r="9" fill="#F4F1EA"/><circle cx="206.8" cy="47.1" r="1.08" fill="#16181B"/><circle cx="213.2" cy="47.1" r="1.08" fill="#16181B"/></g><path d="M232 80 q10 14 0 28 M242 76 q12 18 0 36" stroke="#F2913D" stroke-width="2" fill="none"/></g>
</svg>`,
  bienMalNegativa: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: bajada controlada y constante, sin tramos rápidos. Mal: caer de golpe castiga codos y hombros">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ BAJADA LENTA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CAER DE GOLPE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g transform="translate(0,12)"><line x1="24" y1="26" x2="116" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><line x1="164" y1="26" x2="256" y2="26" stroke="#9EA3AA" stroke-width="4" stroke-linecap="round"/><line x1="36" y1="36" x2="46" y2="36" stroke="#7FB2E5" stroke-width="2"/><line x1="36" y1="54" x2="46" y2="54" stroke="#7FB2E5" stroke-width="2"/><line x1="36" y1="72" x2="46" y2="72" stroke="#7FB2E5" stroke-width="2"/><line x1="36" y1="90" x2="46" y2="90" stroke="#7FB2E5" stroke-width="2"/><line x1="36" y1="108" x2="46" y2="108" stroke="#7FB2E5" stroke-width="2"/><line x1="36" y1="126" x2="46" y2="126" stroke="#7FB2E5" stroke-width="2"/><text x="41" y="140" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">5 s</text><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="62,26 56,48 66,62"/><polyline points="86,26 92,48 82,62"/><line x1="74" y1="56" x2="74" y2="98"/><polyline points="68,122 74,98 80,122"/></g><circle cx="74" cy="46" r="9" fill="#F4F1EA"/><circle cx="70.8" cy="45.1" r="1.08" fill="#16181B"/><circle cx="77.2" cy="45.1" r="1.08" fill="#16181B"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="198" y1="26" x2="200" y2="60"/><line x1="222" y1="26" x2="220" y2="60"/><line x1="210" y1="60" x2="210" y2="100"/><polyline points="204,124 210,100 216,124"/></g><circle cx="210" cy="52" r="9" fill="#F4F1EA"/><circle cx="206.8" cy="51.1" r="1.08" fill="#16181B"/><circle cx="213.2" cy="51.1" r="1.08" fill="#16181B"/><path d="M248 36 L248 100 M242.9 92.6 L248 100 L253.1 92.6" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="248" y="116" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="9">de golpe</text></g>
</svg>`,
  jalon: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Jalón a una mano de frente: de rodillas bajo la barra con la banda en el mosquetón central, bajas el hombro y llevas el codo hacia las costillas como en una dominada, y vuelves en 2 segundos; la otra mano en la cadera">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><circle cx="120" cy="42" r="7" stroke="#9EA3AA" stroke-width="3"/><text x="162" y="56" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">mosquetón</text><line x1="120" y1="48" x2="134" y2="96" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="134;146;146;134;134" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="96;212;212;96;96" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="120" y1="220" x2="120" y2="320" stroke-width="13"/><line x1="94" y1="226" x2="146" y2="226" stroke-width="13"/><line x1="102" y1="320" x2="138" y2="320" stroke-width="13"/><line x1="104" y1="320" x2="102" y2="398" stroke-width="13"/><line x1="136" y1="320" x2="138" y2="398" stroke-width="13"/><polyline points="96,226 76,272 102,312" stroke-width="12"/><polyline points="146,226 142,160 134,96" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,226 142,160 134,96;146,226 160,282 146,212;146,226 160,282 146,212;146,226 142,160 134,96;146,226 142,160 134,96" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><circle cx="120" cy="190" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="187.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="187.8" r="2.64" fill="#16181B"/><text x="188" y="300" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo a las</text><text x="188" y="316" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">costillas</text><text x="46" y="380" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">de rodillas</text>
</svg>`,
  bienMalJalon: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: tronco recto, el codo baja hasta las costillas. Mal: echarse hacia atrás para tirar con el cuerpo">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ TRONCO RECTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ECHARSE ATRÁS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="129" x2="120" y2="129" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="129" x2="260" y2="129" stroke="#4A5059" stroke-width="2"/><line x1="78" y1="22" x2="72" y2="30" stroke="#F2913D" stroke-width="2"/><line x1="226" y1="22" x2="212" y2="34" stroke="#F2913D" stroke-width="2"/><g transform="rotate(0 72 112)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="72" y1="112" x2="72" y2="62"/><polyline points="72,66 78,46 74,28"/></g><polygon points="78,46 88,52 78,57" fill="#F4F1EA"/><circle cx="73" cy="50" r="8" fill="#F4F1EA"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><line x1="72" y1="112" x2="68" y2="126"/><line x1="68" y1="126" x2="38" y2="126"/></g><g transform="rotate(-22 222 112)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="222" y1="112" x2="222" y2="62"/><polyline points="222,66 228,46 224,28"/></g><polygon points="228,46 238,52 228,57" fill="#F4F1EA"/><circle cx="223" cy="50" r="8" fill="#F4F1EA"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><line x1="222" y1="112" x2="218" y2="126"/><line x1="218" y1="126" x2="188" y2="126"/></g>
</svg>`,
  remo: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Remo a una mano de perfil: mirando a la pared con la banda en el ancla media, llevas el codo atrás pegado al costado hasta juntar el omóplato, pausa 1 segundo y vuelves en 2">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="250" r="6" fill="#9EA3AA"/><text x="28" y="238" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media</text><line x1="18" y1="250" x2="66" y2="192" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="66;120;120;66;66" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="192;206;206;192;192" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="124" y1="118" x2="128" y2="250" stroke-width="13"/><polyline points="128,250 106,326 96,402" stroke-width="13"/><polyline points="128,250 146,328 158,402" stroke-width="13"/><polyline points="124,136 136,190 120,232" stroke-width="12"/><polyline points="124,136 96,168 66,192" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="124,136 96,168 66,192;124,136 152,184 120,206;124,136 152,184 120,206;124,136 96,168 66,192;124,136 96,168 66,192" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><polygon points="103,92 93,98 103,102" fill="#F4F1EA"/><circle cx="122" cy="92" r="22" fill="#F4F1EA"/><path d="M170 150 L206 150 M198.6 155.1 L206 150 L198.6 144.9" stroke="#F2913D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="190" y="176" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo atrás</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalRemo: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: tronco quieto, el codo va atrás pegado al cuerpo. Mal: echarse hacia atrás para tirar: acércate a la pared">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ TRONCO QUIETO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ECHARSE ATRÁS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="40" x2="82" y2="92"/><polyline points="82,92 72,110 66,124"/><polyline points="82,92 92,110 98,124"/><polyline points="80,46 94,62 76,70"/></g><line x1="12" y1="84" x2="76" y2="70" stroke="#F2913D" stroke-width="2"/><polygon points="74,28 64,34 74,38" fill="#F4F1EA"/><circle cx="79" cy="28" r="8" fill="#F4F1EA"/><g transform="rotate(14 222 92)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="220" y1="40" x2="222" y2="92"/><polyline points="222,92 212,110 206,124"/><polyline points="222,92 232,110 238,124"/><polyline points="220,46 234,62 216,70"/></g><line x1="152" y1="84" x2="216" y2="70" stroke="#F2913D" stroke-width="2"/><polygon points="214,28 204,34 214,38" fill="#F4F1EA"/><circle cx="219" cy="28" r="8" fill="#F4F1EA"/></g>
</svg>`,
  pullover: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Pullover a una mano de perfil: mirando al ancla alta, algo inclinado hacia delante, bajas el brazo recto en arco hasta el muslo, aprietas el dorsal 1 segundo y vuelves en 2">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="110" r="6" fill="#9EA3AA"/><text x="28" y="98" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla alta</text><path d="M48 116 A96 96 0 0 0 137 232" stroke="#4A5059" stroke-width="2" stroke-dasharray="4 5"/><line x1="18" y1="110" x2="48" y2="116" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="48;67;137;137;67;48" keyTimes="0;0.111;0.222;0.444;0.778;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="116;196;232;232;196;116" keyTimes="0;0.111;0.222;0.444;0.778;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="142" y1="130" x2="160" y2="250" stroke-width="13"/><polyline points="160,250 142,326 130,402" stroke-width="13"/><polyline points="160,250 176,328 186,402" stroke-width="13"/><polyline points="144,142 170,188 158,226" stroke-width="12"/><polyline points="142,136 95,126 48,116" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="142,136 95,126 48,116;142,136 104,166 67,196;142,136 139,184 137,232;142,136 139,184 137,232;142,136 104,166 67,196;142,136 95,126 48,116" keyTimes="0;0.111;0.222;0.444;0.778;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><polygon points="115,100 105,106 115,110" fill="#F4F1EA"/><circle cx="134" cy="100" r="22" fill="#F4F1EA"/><text x="60" y="300" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">brazo recto</text><text x="60" y="316" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">hasta el muslo</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalPullover: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: brazo recto que baja en arco hasta el muslo. Mal: codo doblado: se convierte en un remo">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ BRAZO RECTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO DOBLADO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><path d="M30 40 A60 60 0 0 0 76 94" stroke="#7FB2E5" stroke-width="1.5" stroke-dasharray="3 4"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="40" x2="88" y2="92"/><polyline points="88,92 78,110 72,124"/><polyline points="88,92 96,110 102,124"/><line x1="80" y1="46" x2="76" y2="94"/></g><polygon points="72,28 62,34 72,38" fill="#F4F1EA"/><circle cx="77" cy="28" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="220" y1="40" x2="228" y2="92"/><polyline points="228,92 218,110 212,124"/><polyline points="228,92 236,110 242,124"/><polyline points="220,46 202,62 216,82"/></g><polygon points="212,28 202,34 212,38" fill="#F4F1EA"/><circle cx="217" cy="28" r="8" fill="#F4F1EA"/>
</svg>`,
  flexClasica: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión de perfil: desde brazos estirados y cuerpo recto como una tabla, baja en 2 segundos hasta que el pecho casi toca el suelo con los codos hacia atrás, y sube en 1 segundo">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round">
<polyline points="80,330 215,396" stroke-width="13"><animate attributeName="points" values="80,330 215,396;86,380 215,396;86,380 215,396;80,330 215,396;80,330 215,396" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline>
<polyline points="80,402 80,366 80,330" stroke-width="11"><animate attributeName="points" values="80,402 80,366 80,330;80,402 108,380 86,380;80,402 108,380 86,380;80,402 80,366 80,330;80,402 80,366 80,330" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline>
</g>
<g><animateTransform attributeName="transform" type="translate" values="0 0;5 48;5 48;0 0;0 0" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/>
<polygon points="44,318 35,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/></g>
<text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">cuerpo recto como una tabla</text>
<text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">2 s abajo · 1 s arriba</text>
<text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  flexTiempo: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión de perfil: desde brazos estirados y cuerpo recto como una tabla, repeticiones seguidas a ritmo constante hasta que el pecho casi toca el suelo con los codos hacia atrás, y sube en 1 segundo">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/>
<g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round">
<polyline points="80,330 215,396" stroke-width="13"><animate attributeName="points" values="80,330 215,396;86,380 215,396;86,380 215,396;80,330 215,396;80,330 215,396" keyTimes="0;0.45;0.5;0.95;1" dur="2.2s" repeatCount="indefinite"/></polyline>
<polyline points="80,402 80,366 80,330" stroke-width="11"><animate attributeName="points" values="80,402 80,366 80,330;80,402 108,380 86,380;80,402 108,380 86,380;80,402 80,366 80,330;80,402 80,366 80,330" keyTimes="0;0.45;0.5;0.95;1" dur="2.2s" repeatCount="indefinite"/></polyline>
</g>
<g><animateTransform attributeName="transform" type="translate" values="0 0;5 48;5 48;0 0;0 0" keyTimes="0;0.45;0.5;0.95;1" dur="2.2s" repeatCount="indefinite"/>
<polygon points="44,318 35,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/></g>
<text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">ritmo constante hasta la alarma</text>
<text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">todas las limpias que puedas</text>
<text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  piesElevados: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión con los pies en una silla, de perfil: el cuerpo queda inclinado hacia abajo; bajas en 2 segundos hasta que la cara casi toca el suelo y subes en 1">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><g stroke="#9EA3AA" stroke-width="5" stroke-linecap="round"><line x1="186" y1="354" x2="232" y2="354"/><line x1="190" y1="354" x2="190" y2="404"/><line x1="228" y1="354" x2="228" y2="404"/><line x1="228" y1="354" x2="228" y2="300"/></g><polyline points="80,330 210,346" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,330 210,346;86,382 210,346;86,382 210,346;80,330 210,346;80,330 210,346" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="80,402 80,366 80,330" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,402 80,366 80,330;80,402 106,384 86,382;80,402 106,384 86,382;80,402 80,366 80,330;80,402 80,366 80,330" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><g><polygon points="44,318 34,324 44,328" fill="#F4F1EA"/><circle cx="60" cy="318" r="19" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;6 50;6 50;0 0;0 0" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></g><text x="196" y="286" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">pies en la silla</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">cuerpo recto, sin doblar la cadera</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">2 s abajo · 1 s arriba</text>
</svg>`,
  bienMalPiesElevados: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: cuerpo en línea recta de los pies a la cabeza. Mal: cadera hundida: la lumbar sufre">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ EN LÍNEA</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CADERA HUNDIDA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="14" y1="122" x2="126" y2="122" stroke="#4A5059" stroke-width="2"/><line x1="154" y1="122" x2="266" y2="122" stroke="#4A5059" stroke-width="2"/><g stroke="#9EA3AA" stroke-width="3"><line x1="100" y1="96" x2="126" y2="96"/><line x1="104" y1="96" x2="104" y2="122"/><line x1="122" y1="96" x2="122" y2="122"/><line x1="240" y1="96" x2="266" y2="96"/><line x1="244" y1="96" x2="244" y2="122"/><line x1="262" y1="96" x2="262" y2="122"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="30" y1="120" x2="30" y2="86"/><line x1="30" y1="86" x2="114" y2="92"/><line x1="170" y1="120" x2="170" y2="86"/><polyline points="170,86 206,108 254,92"/></g><polygon points="17,78 7,84 17,88" fill="#F4F1EA"/><circle cx="22" cy="78" r="8" fill="#F4F1EA"/><polygon points="157,78 147,84 157,88" fill="#F4F1EA"/><circle cx="162" cy="78" r="8" fill="#F4F1EA"/>
</svg>`,
  flexAbiertas: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión abierta de frente: manos a una vez y media el ancho de los hombros; los dos codos se doblan a la vez y el pecho baja entre las manos en 2 segundos, y subes en 1">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="38,402 67,368 96,334" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="38,402 67,368 96,334;38,402 40,368 96,380;38,402 40,368 96,380;38,402 67,368 96,334;38,402 67,368 96,334" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="144,334 173,368 202,402" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="144,334 173,368 202,402;144,380 200,368 202,402;144,380 200,368 202,402;144,334 173,368 202,402;144,334 173,368 202,402" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="96,334 144,334" stroke="#F4F1EA" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="96,334 144,334;96,380 144,380;96,380 144,380;96,334 144,334;96,334 144,334" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><g><circle cx="120" cy="316" r="17" fill="#F4F1EA"/><circle cx="113.9" cy="314.3" r="2.04" fill="#16181B"/><circle cx="126.1" cy="314.3" r="2.04" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;0 46;0 46;0 0;0 0" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></g><text x="120" y="286" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">bajan los dos brazos</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">manos a 1,5 veces el ancho</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">de los hombros</text>
</svg>`,
  bienMalAbiertas: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: cuerpo recto también con las manos abiertas. Mal: cadera muy alta: se pierde el trabajo del pecho">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CUERPO RECTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CADERA ALTA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="120" x2="120" y2="120" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="120" x2="260" y2="120" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="40" y1="118" x2="40" y2="88"/><line x1="40" y1="88" x2="116" y2="116"/><line x1="180" y1="118" x2="180" y2="88"/><polyline points="180,88 218,64 256,116"/></g><polygon points="27,80 17,86 27,90" fill="#F4F1EA"/><circle cx="32" cy="80" r="8" fill="#F4F1EA"/><polygon points="167,80 157,86 167,90" fill="#F4F1EA"/><circle cx="172" cy="80" r="8" fill="#F4F1EA"/>
</svg>`,
  aperturaArriba: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Apertura de abajo arriba de frente: de espaldas al ancla baja, el brazo abajo y hacia fuera sube en arco hasta delante de la cara con el codo algo flexionado, pausa 1 segundo y baja en 2; la otra mano en la cadera">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><text x="176" y="368" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla baja detrás</text><circle cx="224" cy="380" r="5" fill="#9EA3AA"/><line x1="224" y1="380" x2="206" y2="284" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="206;214;142;142;214;206" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="284;196;98;98;196;284" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="120" y1="118" x2="120" y2="250" stroke-width="13"/><line x1="94" y1="130" x2="146" y2="130" stroke-width="13"/><line x1="102" y1="250" x2="138" y2="250" stroke-width="13"/><polyline points="104,250 98,330 92,404" stroke-width="13"/><polyline points="136,250 144,330 150,404" stroke-width="13"/><polyline points="96,130 76,186 100,232" stroke-width="12"/><polyline points="146,132 178,210 206,284" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,132 178,210 206,284;146,132 186,170 214,196;146,132 170,128 142,98;146,132 170,128 142,98;146,132 186,170 214,196;146,132 178,210 206,284" keyTimes="0;0.125;0.25;0.5;0.75;1" dur="4s" repeatCount="indefinite"/></polyline></g><circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="89.8" r="2.64" fill="#16181B"/><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text><text x="50" y="300" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">sube en arco</text><text x="50" y="316" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">hasta la cara</text><text x="50" y="332" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pausa 1 s</text>
</svg>`,
  bienMalAperturaArriba: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: hombro bajo y codo fijo, la mano dibuja un arco. Mal: hombro encogido y codo muy doblado: se convierte en un press">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ HOMBRO BAJO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO DOBLADO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="46" x2="70" y2="96"/><line x1="56" y1="52" x2="84" y2="52"/><polyline points="84,52 98,50 82,34"/><polyline points="62,96 60,126"/><polyline points="78,96 80,126"/><line x1="210" y1="46" x2="210" y2="96"/><line x1="196" y1="54" x2="226" y2="44"/><polyline points="226,44 236,62 222,34"/><polyline points="202,96 200,126"/><polyline points="218,96 220,126"/></g><path d="M102 104 Q112 70 88 36" stroke="#7FB2E5" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="70" cy="34" r="9" fill="#F4F1EA"/><circle cx="66.8" cy="33.1" r="1.08" fill="#16181B"/><circle cx="73.2" cy="33.1" r="1.08" fill="#16181B"/><circle cx="210" cy="34" r="9" fill="#F4F1EA"/><circle cx="206.8" cy="33.1" r="1.08" fill="#16181B"/><circle cx="213.2" cy="33.1" r="1.08" fill="#16181B"/>
</svg>`,
  curl: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Curl a una mano de frente: pisas la banda, brazo estirado y codo pegado al costado; subes la mano hasta el hombro sin mover el codo en 1 segundo y bajas en 3">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="126" y1="408" x2="158" y2="408" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/><line x1="142" y1="406" x2="152" y2="252" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="152;160;160;152" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="252;146;146;252" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,0)"><line x1="120" y1="118" x2="120" y2="250" stroke-width="13"/><line x1="94" y1="130" x2="146" y2="130" stroke-width="13"/><line x1="102" y1="250" x2="138" y2="250" stroke-width="13"/><polyline points="104,250 100,330 98,402" stroke-width="13"/><polyline points="136,250 140,330 142,402" stroke-width="13"/><polyline points="96,130 76,186 104,238" stroke-width="12"/><polyline points="146,132 150,192 152,252" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,132 150,192 152,252;146,132 150,192 160,146;146,132 150,192 160,146;146,132 150,192 152,252" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><g transform="translate(0,0)"><circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="89.8" r="2.64" fill="#16181B"/></g><text x="200" y="190" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo</text><text x="200" y="206" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pegado</text><text x="190" y="400" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pisa la banda</text><text x="46" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">1 s arriba</text><text x="46" y="265" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">3 s abajo</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text>
</svg>`,
  curlLigero: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Curl ligero a una mano de frente: pisas una banda liviana y subes suave hasta el hombro sin mover el codo, bajando sin soltar la tensión">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="126" y1="408" x2="158" y2="408" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/><line x1="142" y1="406" x2="152" y2="252" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="152;160;160;152" keyTimes="0;0.4;0.5;1" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="252;146;146;252" keyTimes="0;0.4;0.5;1" dur="3s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,0)"><line x1="120" y1="118" x2="120" y2="250" stroke-width="13"/><line x1="94" y1="130" x2="146" y2="130" stroke-width="13"/><line x1="102" y1="250" x2="138" y2="250" stroke-width="13"/><polyline points="104,250 100,330 98,402" stroke-width="13"/><polyline points="136,250 140,330 142,402" stroke-width="13"/><polyline points="96,130 76,186 104,238" stroke-width="12"/><polyline points="146,132 150,192 152,252" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,132 150,192 152,252;146,132 150,192 160,146;146,132 150,192 160,146;146,132 150,192 152,252" keyTimes="0;0.4;0.5;1" dur="3s" repeatCount="indefinite"/></polyline></g><g transform="translate(0,0)"><circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="89.8" r="2.64" fill="#16181B"/></g><text x="200" y="190" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo</text><text x="200" y="206" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pegado</text><text x="190" y="400" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pisa la banda</text><text x="46" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">suave y</text><text x="46" y="265" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">continuo</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text>
</svg>`,
  curlMartillo: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Curl martillo a una mano de frente: igual que el curl pero con la palma mirando hacia el cuerpo; subes con el pulgar arriba hasta el hombro y bajas en 3 segundos">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="126" y1="408" x2="158" y2="408" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/><line x1="142" y1="406" x2="152" y2="252" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="152;160;160;152" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="252;146;146;252" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,0)"><line x1="120" y1="118" x2="120" y2="250" stroke-width="13"/><line x1="94" y1="130" x2="146" y2="130" stroke-width="13"/><line x1="102" y1="250" x2="138" y2="250" stroke-width="13"/><polyline points="104,250 100,330 98,402" stroke-width="13"/><polyline points="136,250 140,330 142,402" stroke-width="13"/><polyline points="96,130 76,186 104,238" stroke-width="12"/><polyline points="146,132 150,192 152,252" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="146,132 150,192 152,252;146,132 150,192 160,146;146,132 150,192 160,146;146,132 150,192 152,252" keyTimes="0;0.222;0.333;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><g transform="translate(0,0)"><circle cx="120" cy="92" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="89.8" r="2.64" fill="#16181B"/></g><text x="200" y="190" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo</text><text x="200" y="206" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pegado</text><text x="190" y="400" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pisa la banda</text><text x="46" y="250" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">palma hacia</text><text x="46" y="265" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">dentro</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text>
</svg>`,
  bienMalCurl: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: el codo se queda pegado, trabaja solo el bíceps. Mal: el codo se adelanta y el cuerpo se echa atrás">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO PEGADO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO ADELANTE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="126" x2="120" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="126" x2="260" y2="126" stroke="#4A5059" stroke-width="2"/><g transform="rotate(0 70 92)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="40" x2="72" y2="92"/><line x1="70" y1="46" x2="72" y2="74"/><line x1="72" y1="74" x2="88" y2="60"/></g><polygon points="76,24 86,30 76,35" fill="#F4F1EA"/><circle cx="71" cy="28" r="8" fill="#F4F1EA"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><polyline points="72,92 62,110 56,124"/><polyline points="72,92 82,110 88,124"/></g><g transform="rotate(-12 210 92)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="210" y1="40" x2="212" y2="92"/><line x1="210" y1="46" x2="226" y2="68"/><line x1="226" y1="68" x2="228" y2="44"/></g><polygon points="216,24 226,30 216,35" fill="#F4F1EA"/><circle cx="211" cy="28" r="8" fill="#F4F1EA"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><polyline points="212,92 202,110 196,124"/><polyline points="212,92 222,110 228,124"/></g>
</svg>`,
  dominadaSupina: `
<svg viewBox="0 -30 240 450" fill="none" role="img" aria-label="Dominada supina asistida de frente, con las palmas hacia ti en la barra central: la banda de ayuda cuelga de la barra y pasa bajo un pie; subes hasta pasar la barbilla y bajas en 2 segundos">
<line x1="10" y1="412" x2="230" y2="412" stroke="#4A5059" stroke-width="2"/><line x1="20" y1="30" x2="220" y2="30" stroke="#9EA3AA" stroke-width="8" stroke-linecap="round"/><line x1="84" y1="30" x2="84" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><line x1="156" y1="30" x2="156" y2="14" stroke="#9EA3AA" stroke-width="7" stroke-linecap="round"/><polyline points="86,30 88,78 90,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="86,30 88,78 90,126;86,30 56,52 90,30;86,30 56,52 90,30;86,30 88,78 90,126;86,30 88,78 90,126" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><polyline points="154,30 152,78 150,126" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="154,30 152,78 150,126;154,30 184,52 150,30;154,30 184,52 150,30;154,30 152,78 150,126;154,30 152,78 150,126" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><g><g stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="126" x2="150" y2="126"/><line x1="120" y1="120" x2="120" y2="248"/><line x1="100" y1="248" x2="140" y2="248"/><polyline points="102,248 100,322 98,378"/><polyline points="138,248 140,322 142,378"/></g><circle cx="120" cy="104" r="22" fill="#F4F1EA"/><circle cx="112.1" cy="101.8" r="2.64" fill="#16181B"/><circle cx="127.9" cy="101.8" r="2.64" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;0 -96;0 -96;0 0;0 0" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></g><polyline points="106,30 94,300 94,390 110,390 112,30" stroke="#F2913D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="106,30 94,300 94,390 110,390 112,30;106,30 94,210 94,294 110,294 112,30;106,30 94,210 94,294 110,294 112,30;106,30 94,300 94,390 110,390 112,30;106,30 94,300 94,390 110,390 112,30" keyTimes="0;0.25;0.35;0.85;1" dur="4s" repeatCount="indefinite"/></polyline><text x="196" y="-8" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la banda</text><text x="196" y="8" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">empuja abajo</text><text x="196" y="330" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pie en</text><text x="196" y="346" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la banda</text><text x="120" y="436" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">palmas hacia ti</text>
</svg>`,
  curlDetras: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Curl detrás del cuerpo de perfil: de espaldas al ancla baja, el brazo estirado por detrás del cuerpo; doblas el codo hasta llevar la mano al hombro con el codo fijo detrás, pausa 1 segundo y bajas en 3">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="368" r="6" fill="#9EA3AA"/><text x="28" y="356" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla baja</text><line x1="18" y1="368" x2="90" y2="254" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="90;126;126;90" keyTimes="0;0.222;0.444;1" dur="5s" repeatCount="indefinite"/><animate attributeName="y2" values="254;150;150;254" keyTimes="0;0.222;0.444;1" dur="5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="116" y1="118" x2="112" y2="250" stroke-width="13"/><polyline points="112,250 94,328 82,402" stroke-width="13"/><polyline points="112,250 138,324 150,402" stroke-width="13"/><polyline points="116,136 124,190 110,232" stroke-width="12"/><polyline points="116,136 100,196 90,254" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="116,136 100,196 90,254;116,136 100,196 126,150;116,136 100,196 126,150;116,136 100,196 90,254" keyTimes="0;0.222;0.444;1" dur="5s" repeatCount="indefinite"/></polyline></g><polygon points="137,88 147,94 137,99" fill="#F4F1EA"/><circle cx="118" cy="92" r="22" fill="#F4F1EA"/><text x="60" y="160" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo atrás,</text><text x="60" y="176" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">fijo</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalCurlDetras: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: el codo se queda por detrás del cuerpo. Mal: el codo se va hacia delante y pierde el efecto">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO DETRÁS</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO ADELANTE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="112" x2="74" y2="50" stroke="#F2913D" stroke-width="2"/><line x1="152" y1="112" x2="232" y2="44" stroke="#F2913D" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="40" x2="72" y2="92"/><polyline points="72,92 62,110 56,124"/><polyline points="72,92 82,110 88,124"/><line x1="70" y1="46" x2="62" y2="74"/><line x1="62" y1="74" x2="74" y2="50"/></g><polygon points="76,24 86,30 76,35" fill="#F4F1EA"/><circle cx="71" cy="28" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="210" y1="40" x2="212" y2="92"/><polyline points="212,92 202,110 196,124"/><polyline points="212,92 222,110 228,124"/><line x1="210" y1="46" x2="224" y2="70"/><line x1="224" y1="70" x2="222" y2="44"/></g><polygon points="216,24 226,30 216,35" fill="#F4F1EA"/><circle cx="211" cy="28" r="8" fill="#F4F1EA"/>
</svg>`,
  curlAlto: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Curl alto a una mano de frente: de costado al ancla alta, el brazo estirado hacia ella a la altura del hombro; doblas el codo llevando la mano hacia la cabeza sin mover el codo, pausa 1 segundo y vuelves en 2">
<line x1="14" y1="20" x2="14" y2="412" stroke="#4A5059" stroke-width="3"/><line x1="14" y1="412" x2="232" y2="412" stroke="#4A5059" stroke-width="2"/><circle cx="14" cy="128" r="6" fill="#9EA3AA"/><text x="22" y="116" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla alta</text><line x1="14" y1="128" x2="48" y2="132" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="48;104;104;48" keyTimes="0;0.2;0.422;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="132;94;94;132" keyTimes="0;0.2;0.422;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="150" y1="118" x2="150" y2="250" stroke-width="13"/><line x1="124" y1="130" x2="176" y2="130" stroke-width="13"/><line x1="132" y1="250" x2="168" y2="250" stroke-width="13"/><polyline points="134,250 128,330 122,404" stroke-width="13"/><polyline points="166,250 172,330 178,404" stroke-width="13"/><polyline points="176,130 196,186 172,232" stroke-width="12"/><polyline points="128,130 88,130 48,132" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="128,130 88,130 48,132;128,130 88,130 104,94;128,130 88,130 104,94;128,130 88,130 48,132" keyTimes="0;0.2;0.422;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><circle cx="150" cy="92" r="22" fill="#F4F1EA"/><circle cx="142.1" cy="89.8" r="2.64" fill="#16181B"/><circle cx="157.9" cy="89.8" r="2.64" fill="#16181B"/><text x="88" y="176" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">el codo</text><text x="88" y="192" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">no se mueve</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text>
</svg>`,
  bienMalCurlAlto: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: el codo se queda alto y quieto. Mal: el codo cae y se convierte en un curl normal">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO ALTO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO CAE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="52" x2="56" y2="34" stroke="#F2913D" stroke-width="2"/><line x1="152" y1="52" x2="206" y2="46" stroke="#F2913D" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="44" x2="90" y2="94"/><line x1="78" y1="52" x2="102" y2="52"/><polyline points="83,94 81,124"/><polyline points="97,94 99,124"/><line x1="78" y1="52" x2="56" y2="52"/><line x1="56" y1="52" x2="66" y2="34"/></g><circle cx="90" cy="32" r="9" fill="#F4F1EA"/><circle cx="86.8" cy="31.1" r="1.08" fill="#16181B"/><circle cx="93.2" cy="31.1" r="1.08" fill="#16181B"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="230" y1="44" x2="230" y2="94"/><line x1="218" y1="52" x2="242" y2="52"/><polyline points="223,94 221,124"/><polyline points="237,94 239,124"/><line x1="218" y1="52" x2="200" y2="72"/><line x1="200" y1="72" x2="206" y2="46"/></g><circle cx="230" cy="32" r="9" fill="#F4F1EA"/><circle cx="226.8" cy="31.1" r="1.08" fill="#16181B"/><circle cx="233.2" cy="31.1" r="1.08" fill="#16181B"/>
</svg>`,
  isoCurl: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Isométrico de curl a 90 grados de perfil: pisas la banda, subes hasta que el antebrazo queda horizontal con el codo pegado al costado y aguantas quieto el tiempo marcado">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><line x1="120" y1="400" x2="152" y2="400" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/><line x1="140" y1="398" x2="120" y2="254" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="120;176;176;120" keyTimes="0;0.15;0.9;1" dur="7s" repeatCount="indefinite"/><animate attributeName="y2" values="254;196;196;254" keyTimes="0;0.15;0.9;1" dur="7s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="116" y1="118" x2="112" y2="250" stroke-width="13"/><polyline points="112,250 94,328 82,402" stroke-width="13"/><polyline points="112,250 138,324 150,402" stroke-width="13"/><polyline points="116,136 124,190 110,232" stroke-width="12"/><polyline points="116,136 118,196 120,254" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="116,136 118,196 120,254;116,136 118,196 176,196;116,136 118,196 176,196;116,136 118,196 120,254" keyTimes="0;0.15;0.9;1" dur="7s" repeatCount="indefinite"/></polyline></g><polygon points="137,88 147,94 137,99" fill="#F4F1EA"/><circle cx="118" cy="92" r="22" fill="#F4F1EA"/><path d="M140 196 A22 22 0 0 0 118 174" stroke="#F2913D" stroke-width="2"/><text x="150" y="172" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="13">90°</text><text x="196" y="240" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">aguanta</text><text x="196" y="256" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">quieto</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalIsoCurl: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codo pegado y antebrazo horizontal. Mal: echarse atrás para aguantar">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO PEGADO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ ECHARSE ATRÁS</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="126" x2="120" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="126" x2="260" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="40" x2="72" y2="92"/><line x1="70" y1="46" x2="72" y2="72"/><line x1="72" y1="72" x2="98" y2="72"/></g><polygon points="76,24 86,30 76,35" fill="#F4F1EA"/><circle cx="71" cy="28" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><polyline points="72,92 62,110 56,124"/><polyline points="72,92 82,110 88,124"/></g><g transform="rotate(-16 212 92)"><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="210" y1="40" x2="212" y2="92"/><line x1="210" y1="46" x2="212" y2="72"/><line x1="212" y1="72" x2="238" y2="72"/></g><polygon points="216,24 226,30 216,35" fill="#F4F1EA"/><circle cx="211" cy="28" r="8" fill="#F4F1EA"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round"><polyline points="212,92 202,110 196,124"/><polyline points="212,92 222,110 228,124"/></g>
</svg>`,
  diamante: `
<svg viewBox="0 200 240 220" fill="none" role="img" aria-label="Flexión diamante de frente: manos juntas bajo el pecho formando un rombo; bajas en 2 segundos con los codos pegados al cuerpo hacia atrás y subes en 1">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><polyline points="112,402 104,368 96,334" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="112,402 104,368 96,334;112,402 86,394 96,380;112,402 86,394 96,380;112,402 104,368 96,334;112,402 104,368 96,334" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="128,402 136,368 144,334" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="128,402 136,368 144,334;128,402 154,394 144,380;128,402 154,394 144,380;128,402 136,368 144,334;128,402 136,368 144,334" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="96,334 144,334" stroke="#F4F1EA" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="96,334 144,334;96,380 144,380;96,380 144,380;96,334 144,334;96,334 144,334" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><g><circle cx="120" cy="316" r="17" fill="#F4F1EA"/><circle cx="113.9" cy="314.3" r="2.04" fill="#16181B"/><circle cx="126.1" cy="314.3" r="2.04" fill="#16181B"/><animateTransform attributeName="transform" type="translate" values="0 0;0 46;0 46;0 0;0 0" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></g><polygon points="120,396 128,402 120,408 112,402" stroke="#F2913D" stroke-width="2"/><text x="190" y="330" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">manos juntas</text><text x="46" y="330" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">codos pegados</text><text x="120" y="222" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE FRENTE</text><text x="120" y="244" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">2 s abajo · 1 s arriba</text><text x="120" y="260" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codos hacia atrás</text>
</svg>`,
  bienMalDiamante: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos cerca del cuerpo, hacia atrás. Mal: codos hacia los lados: carga la muñeca y el hombro">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODOS PEGADOS</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODOS FUERA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="50" x2="70" y2="124" stroke-width="7"/><line x1="54" y1="54" x2="86" y2="54" stroke-width="7"/><line x1="54" y1="54" x2="58" y2="84" stroke-width="5"/><line x1="86" y1="54" x2="82" y2="84" stroke-width="5"/></g><polygon points="65,36 70,26 75,36" fill="#F4F1EA"/><circle cx="70" cy="42" r="9" fill="#F4F1EA"/><text x="70" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="210" y1="50" x2="210" y2="124" stroke-width="7"/><line x1="194" y1="54" x2="226" y2="54" stroke-width="7"/><line x1="194" y1="54" x2="164" y2="62" stroke-width="5"/><line x1="226" y1="54" x2="256" y2="62" stroke-width="5"/></g><polygon points="205,36 210,26 215,36" fill="#F4F1EA"/><circle cx="210" cy="42" r="9" fill="#F4F1EA"/><text x="210" y="136" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="9">desde arriba</text>
</svg>`,
  fondos: `
<svg viewBox="0 150 240 270" fill="none" role="img" aria-label="Fondos en silla de perfil: manos en el borde de la silla por detrás con los brazos estirados; bajas en 2 segundos hasta que los codos forman 90 grados apuntando hacia atrás y subes en 1">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><g stroke="#9EA3AA" stroke-width="5" stroke-linecap="round"><line x1="24" y1="334" x2="80" y2="334"/><line x1="28" y1="334" x2="28" y2="404"/><line x1="76" y1="334" x2="76" y2="404"/><line x1="24" y1="334" x2="24" y2="264"/></g><polyline points="96,254 100,330" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="96,254 100,330;98,300 102,376;98,300 102,376;96,254 100,330;96,254 100,330" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="100,330 160,330 166,402" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="100,330 160,330 166,402;102,376 160,352 166,402;102,376 160,352 166,402;100,330 160,330 166,402;100,330 160,330 166,402" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><polyline points="80,332 88,293 96,254" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,332 88,293 96,254;80,332 60,298 98,300;80,332 60,298 98,300;80,332 88,293 96,254;80,332 88,293 96,254" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></polyline><g><polygon points="117,222 127,228 117,233" fill="#F4F1EA"/><circle cx="100" cy="226" r="20" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;4 46;4 46;0 0;0 0" keyTimes="0;0.556;0.639;0.917;1" dur="3.6s" repeatCount="indefinite"/></g><text x="170" y="200" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codos a 90°,</text><text x="170" y="216" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">hacia atrás</text><text x="170" y="238" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">2 s abajo · 1 s arriba</text><text x="120" y="166" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  fondosIso: `
<svg viewBox="0 150 240 270" fill="none" role="img" aria-label="Fondos isométricos de perfil: desde arriba con los brazos estirados bajas hasta 90 grados con los codos hacia atrás y te quedas quieto el tiempo marcado">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><g stroke="#9EA3AA" stroke-width="5" stroke-linecap="round"><line x1="24" y1="334" x2="80" y2="334"/><line x1="28" y1="334" x2="28" y2="404"/><line x1="76" y1="334" x2="76" y2="404"/><line x1="24" y1="334" x2="24" y2="264"/></g><polyline points="96,254 100,330" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="96,254 100,330;98,300 102,376;98,300 102,376;96,254 100,330" keyTimes="0;0.15;0.88;1" dur="7s" repeatCount="indefinite"/></polyline><polyline points="100,330 160,330 166,402" stroke="#F4F1EA" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="100,330 160,330 166,402;102,376 160,352 166,402;102,376 160,352 166,402;100,330 160,330 166,402" keyTimes="0;0.15;0.88;1" dur="7s" repeatCount="indefinite"/></polyline><polyline points="80,332 88,293 96,254" stroke="#F4F1EA" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="80,332 88,293 96,254;80,332 60,298 98,300;80,332 60,298 98,300;80,332 88,293 96,254" keyTimes="0;0.15;0.88;1" dur="7s" repeatCount="indefinite"/></polyline><g><polygon points="117,222 127,228 117,233" fill="#F4F1EA"/><circle cx="100" cy="226" r="20" fill="#F4F1EA"/><animateTransform attributeName="transform" type="translate" values="0 0;4 46;4 46;0 0" keyTimes="0;0.15;0.88;1" dur="7s" repeatCount="indefinite"/></g><text x="170" y="200" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">baja a 90°</text><text x="170" y="216" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">y aguanta</text><text x="170" y="238" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">respira normal</text><text x="120" y="166" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalFondos: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codos a 90° y hacia atrás, hombros bajos. Mal: codos abiertos y hombros hacia delante: castiga el hombro">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODOS ATRÁS</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ HOMBROS DELANTE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="126" x2="130" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="126" x2="270" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#9EA3AA" stroke-width="3"><line x1="30" y1="84" x2="56" y2="84"/><line x1="34" y1="84" x2="34" y2="126"/><line x1="52" y1="84" x2="52" y2="126"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="54,84 40,64 64,62"/><line x1="64" y1="62" x2="64" y2="104"/><polyline points="64,104 100,100 104,126"/></g><polygon points="71,42 81,48 71,53" fill="#F4F1EA"/><circle cx="66" cy="46" r="8" fill="#F4F1EA"/><g stroke="#9EA3AA" stroke-width="3"><line x1="170" y1="84" x2="196" y2="84"/><line x1="174" y1="84" x2="174" y2="126"/><line x1="192" y1="84" x2="192" y2="126"/></g><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><polyline points="194,84 196,58 214,66"/><line x1="214" y1="66" x2="204" y2="104"/><polyline points="204,104 240,100 244,126"/></g><polygon points="227,46 237,52 227,57" fill="#F4F1EA"/><circle cx="222" cy="50" r="8" fill="#F4F1EA"/>
</svg>`,
  extCabeza: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Extensión sobre la cabeza de perfil: pisas la banda, que pasa por detrás del cuerpo; el codo apunta al techo y la mano está detrás de la cabeza; estiras el antebrazo hasta que el brazo queda recto sobre la cabeza y vuelves en 2 segundos">
<line x1="10" y1="404" x2="230" y2="404" stroke="#4A5059" stroke-width="2"/><line x1="86" y1="400" x2="112" y2="400" stroke="#F2913D" stroke-width="5" stroke-linecap="round"/><line x1="88" y1="398" x2="92" y2="94" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="92;126;126;92;92" keyTimes="0;0.25;0.35;0.9;1" dur="4s" repeatCount="indefinite"/><animate attributeName="y2" values="94;14;14;94;94" keyTimes="0;0.25;0.35;0.9;1" dur="4s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="116" y1="118" x2="114" y2="250" stroke-width="13"/><polyline points="114,250 104,328 98,402" stroke-width="13"/><polyline points="114,250 128,328 136,402" stroke-width="13"/><polyline points="116,136 124,190 110,232" stroke-width="12"/><polyline points="116,134 120,70 92,94" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="116,134 120,70 92,94;116,134 120,70 126,14;116,134 120,70 126,14;116,134 120,70 92,94;116,134 120,70 92,94" keyTimes="0;0.25;0.35;0.9;1" dur="4s" repeatCount="indefinite"/></polyline></g><polygon points="137,88 147,94 137,99" fill="#F4F1EA"/><circle cx="118" cy="92" r="22" fill="#F4F1EA"/><text x="186" y="80" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo arriba,</text><text x="186" y="96" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">no se mueve</text><text x="186" y="40" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">estira</text><text x="46" y="392" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">pisa la banda</text>
</svg>`,
  bienMalExtCabeza: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codo fijo arriba, solo se mueve el antebrazo. Mal: el codo se abre y baja hacia delante">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO AL TECHO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO ABIERTO</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="20" y1="126" x2="120" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="160" y1="126" x2="260" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="70" y1="44" x2="72" y2="94"/><polyline points="72,94 64,110 60,124"/><polyline points="72,94 80,110 84,124"/><line x1="70" y1="46" x2="72" y2="18"/><line x1="72" y1="18" x2="60" y2="30"/></g><polygon points="76,30 86,36 76,41" fill="#F4F1EA"/><circle cx="71" cy="34" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="210" y1="44" x2="212" y2="94"/><polyline points="212,94 204,110 200,124"/><polyline points="212,94 220,110 224,124"/><line x1="210" y1="46" x2="226" y2="28"/><line x1="226" y1="28" x2="216" y2="16"/></g><polygon points="216,30 226,36 216,41" fill="#F4F1EA"/><circle cx="211" cy="34" r="8" fill="#F4F1EA"/>
</svg>`,
  extAbajo: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Extensión hacia abajo de perfil: mirando al ancla alta, con el codo pegado al costado y el antebrazo horizontal, empujas hacia abajo hasta estirar el brazo junto al muslo, pausa 1 segundo y vuelves en 2">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="120" r="6" fill="#9EA3AA"/><text x="28" y="108" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla alta</text><line x1="18" y1="120" x2="84" y2="190" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="84;118;118;84;84" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="190;252;252;190;190" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="124" y1="118" x2="128" y2="250" stroke-width="13"/><polyline points="128,250 106,326 96,402" stroke-width="13"/><polyline points="128,250 146,328 158,402" stroke-width="13"/><polyline points="124,136 140,190 128,232" stroke-width="12"/><polyline points="124,136 126,194 84,190" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="124,136 126,194 84,190;124,136 126,194 118,252;124,136 126,194 118,252;124,136 126,194 84,190;124,136 126,194 84,190" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><polygon points="103,92 93,98 103,102" fill="#F4F1EA"/><circle cx="122" cy="92" r="22" fill="#F4F1EA"/><text x="190" y="196" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo</text><text x="190" y="212" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">pegado</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text>
</svg>`,
  bienMalExtAbajo: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: codo quieto junto al cuerpo. Mal: el codo se despega y se adelanta">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO PEGADO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO ADELANTE</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="12" y1="24" x2="12" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="24" x2="152" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="40" x2="82" y2="92"/><polyline points="82,92 72,110 66,124"/><polyline points="82,92 92,110 98,124"/><line x1="80" y1="46" x2="82" y2="72"/><line x1="82" y1="72" x2="76" y2="94"/></g><polygon points="74,28 64,34 74,38" fill="#F4F1EA"/><circle cx="79" cy="28" r="8" fill="#F4F1EA"/><line x1="12" y1="40" x2="76" y2="94" stroke="#F2913D" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="220" y1="40" x2="222" y2="92"/><polyline points="222,92 212,110 206,124"/><polyline points="222,92 232,110 238,124"/><line x1="220" y1="46" x2="206" y2="68"/><line x1="206" y1="68" x2="208" y2="92"/></g><polygon points="214,28 204,34 214,38" fill="#F4F1EA"/><circle cx="219" cy="28" r="8" fill="#F4F1EA"/><line x1="152" y1="40" x2="208" y2="92" stroke="#F2913D" stroke-width="2"/>
</svg>`,
  patada: `
<svg viewBox="0 0 240 420" fill="none" role="img" aria-label="Patada de tríceps de perfil: inclinado hacia el ancla media con la espalda recta, el codo a la altura de la cadera y el antebrazo colgando; estiras el antebrazo hacia atrás hasta dejar el brazo recto, pausa 1 segundo y vuelves">
<line x1="18" y1="20" x2="18" y2="404" stroke="#4A5059" stroke-width="3"/><line x1="18" y1="404" x2="232" y2="404" stroke="#4A5059" stroke-width="2"/><circle cx="18" cy="250" r="6" fill="#9EA3AA"/><text x="28" y="238" text-anchor="start" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="11">ancla media</text><line x1="18" y1="250" x2="128" y2="256" stroke="#F2913D" stroke-width="3" stroke-linecap="round"><animate attributeName="x2" values="128;166;166;128;128" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="256;246;246;256;256" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></line><g stroke="#F4F1EA" stroke-linecap="round" stroke-linejoin="round"><line x1="96" y1="166" x2="150" y2="244" stroke-width="13"/><polyline points="150,244 128,322 118,402" stroke-width="13"/><polyline points="150,244 172,322 180,402" stroke-width="13"/><polyline points="98,172 104,240 126,318" stroke-width="12"/><polyline points="98,170 132,208 128,256" stroke="#F4F1EA" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><animate attributeName="points" values="98,170 132,208 128,256;98,170 132,208 166,246;98,170 132,208 166,246;98,170 132,208 128,256;98,170 132,208 128,256" keyTimes="0;0.222;0.444;0.889;1" dur="4.5s" repeatCount="indefinite"/></polyline></g><polygon points="58,146 48,152 58,156" fill="#F4F1EA"/><circle cx="76" cy="146" r="21" fill="#F4F1EA"/><text x="184" y="182" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">codo en</text><text x="184" y="198" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">la cadera</text><text x="120" y="40" text-anchor="middle" fill="#9EA3AA" font-family="IBM Plex Mono, Consolas, monospace" font-size="11">DE PERFIL</text><text x="184" y="290" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Sans, Helvetica, sans-serif" font-size="12">estira atrás</text>
</svg>`,
  bienMalPatada: `
<svg viewBox="0 0 280 140" fill="none" role="img" aria-label="Bien: solo se mueve el antebrazo, el codo fijo. Mal: el codo baja y el brazo se balancea">
<text x="70" y="14" text-anchor="middle" fill="#7FB2E5" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✓ CODO FIJO</text><text x="210" y="14" text-anchor="middle" fill="#F2913D" font-family="IBM Plex Mono, Consolas, monospace" font-size="10" font-weight="600" letter-spacing="1">✕ CODO BAJA</text><line x1="140" y1="10" x2="140" y2="132" stroke="#2E3238" stroke-width="2"/><line x1="12" y1="126" x2="128" y2="126" stroke="#4A5059" stroke-width="2"/><line x1="152" y1="126" x2="268" y2="126" stroke="#4A5059" stroke-width="2"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="58" y1="58" x2="88" y2="94"/><polyline points="88,94 78,110 74,124"/><polyline points="88,94 100,110 104,124"/><line x1="60" y1="60" x2="78" y2="74"/><line x1="78" y1="74" x2="100" y2="84"/></g><polygon points="45,48 35,54 45,58" fill="#F4F1EA"/><circle cx="50" cy="48" r="8" fill="#F4F1EA"/><g stroke="#F4F1EA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="198" y1="58" x2="228" y2="94"/><polyline points="228,94 218,110 214,124"/><polyline points="228,94 240,110 244,124"/><line x1="200" y1="60" x2="208" y2="86"/><line x1="208" y1="86" x2="230" y2="100"/></g><polygon points="185,48 175,54 185,58" fill="#F4F1EA"/><circle cx="190" cy="48" r="8" fill="#F4F1EA"/>
</svg>`
};
