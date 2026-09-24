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
// "ejercicios" se cuenta solo a partir de BLOQUES si no lo pones aquí.
const INFO_GRUPO = {
  Hombro: {
    duracion: '~50 min',
    material: 'Bandas, barra y anclas alta, media y baja',
    enfoque: 'Deltoides, postura y salud del hombro'
  }
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
  // VIERNES (Pecho) · calentamiento: los ejercicios 1 y 2 están por definir (null = hueco)
  Pecho: [
    null,
    null,
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
  Pecho: [
    { titulo: 'Calentamiento', ejercicios: CALENTAMIENTOS.Pecho }
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
</svg>`
};
