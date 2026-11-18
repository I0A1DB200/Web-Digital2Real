# 02 · Diseño mecánico, eléctrico y neumático

**Versión:** 0.3 · concepto de diseño didáctico; validación física pendiente
**Estado:** concepto técnico pendiente de cierre · láminas M/E/P revisión B validadas por D2R para uso didáctico conceptual
**Objetivo:** convertir la secuencia funcional en un concepto coordinado de layout, mecanismos, interfaces eléctricas, neumática y verificaciones de diseño.

> Este documento define una base de ingeniería para el ejercicio, no un diseño liberado para fabricar. La geometría del HTML es una representación visual, no CAD con escala verificada, cálculo estructural, esquema eléctrico/neumático ni validación Safety.

## 1. Base de diseño y límites

| Entrada aprobada para el caso | Base didáctica | Qué falta para diseño físico |
| --- | --- | --- |
| Producto | Placa de aluminio, 52 × 38 × 13,5 mm, cuatro taladros pasantes periféricos Ø5,0 mm y uno central Ø8,8 mm. | Plano real, masa, aleación, posiciones/tolerancias de agujeros y muestras límite. Estas cotas no se midieron en el modelo 3D. |
| Inspección | Detectar taladros ausentes o visiblemente obstruidos; sin metrología. | Cámara, óptica, luz, campo de visión y validación con piezas representativas. |
| Manipulación | Cargador manual de hasta 7 piezas; contenedores A/B de 25 piezas. | Accesos, reposición, detección de magazine vacío, detección/gestión de bins llenos. |
| Producción | Meta de 5 piezas/min en régimen estable; un turno de 8 h, 5 días por semana. | Velocidad de cinta, separación de producto, tiempo de cámara y pruebas de capacidad en equipo. |
| Servicios | Control de 24 VDC y aire seco filtrado a 6 bar como valores de ejercicio. | Fuente AC de emplazamiento, cargas, corriente, presión/caudal en punto de uso y cálculos. |
| Entorno | Interior, 10–35 °C, sin lavado a presión. | Polvo, humedad, IP, vibración y condiciones reales del local. |
| Operación | `OK → A` por expulsor lateral; `NOK → B` al final de cinta. STOP termina la pieza activa. | Confirmación física de salidas y política de atascos/recuperación. |

Estas decisiones son supuestos didácticos aprobados para organizar el proyecto; no son datos de cliente ni condiciones de fabricación. Se mantienen separados el comportamiento visual del HTML, los requisitos funcionales validados y la ingeniería física pendiente.

### Alcance del documento

- Define distribución conceptual, interfaces mecánicas y cargas/datos necesarios para calcular cada conjunto.
- Define una arquitectura eléctrica y neumática de alto nivel; no selecciona modelos, números de parte, direcciones PLC ni protecciones finales.
- Conserva las señales y nombres de la especificación 01 como interfaz de referencia; el inventario y selección de E/S se concreta en el documento 03.
- Deja Safety como disciplina independiente, sujeta a evaluación de riesgos y validación competentes según el documento 04.
- No cambia la secuencia, los tiempos, las señales, los contadores, la clasificación, el HTML ni el modelo conceptual de Safety.

## 2. Disposición funcional de la célula

| Zona | Función | Concepto mecánico | Interfaces que se deben coordinar |
| --- | --- | --- | --- |
| Alimentador | Separar y presentar una pieza cada vez. | Magazine abierto de una pila; empujador inferior; la reposición es manual. | Envolvente/tolerancias de pieza, detección de pieza disponible, guiado y acceso para recarga. |
| Cinta de entrada | Trasladar la pieza a cámara y después a clasificación. | Banda guiada con plano de apoyo continuo y zonas de parada repetible. | Variador/accionamiento, soporte de sensores, posición de inspección y sincronización del trigger. |
| Inspección | Obtener imagen con pieza inmóvil. | Pórtico o soporte de cámara cenital con luz controlada. | Distancia de trabajo, campo de visión, repetibilidad, vibración, cableado y red de cámara. |
| Salida A | Retirar el resultado OK por contacto lateral. | Placa móvil, cilindro/eje de empuje y puente hacia rampa descendente. | Holguras, fuerza, carrera, confirmación A, contenedor y acceso de mantenimiento. |
| Salida B | Descargar NOK al final del transporte. | Tramo final con transferencia hacia contenedor B. | Detección de salida, capacidad, acumulación, cambio de bin y prevención de caída fuera de zona. |
| Armario | Alojar PLC, fuente y elementos de distribución seleccionados. | Referencia visual al lado del alimentador; posición final por decidir. | Acceso, disipación, radios de curvatura, EMC, seguridad de mantenimiento y tendido de campo. |

La propuesta no conecta la célula a otra línea. Operador carga y recoge contenedores manualmente. La frecuencia y condición de reposición, la protección frente a desbordamiento y la posibilidad de cambiar un contenedor con la célula en marcha quedan como decisiones del diseño detallado; no hay sensores de vacío/lleno definidos.

### Láminas conceptuales validadas

Las láminas revisadas vinculan layout y secuencia, tags del Watch, distribución de potencia y actuadores: [M-02-001 · layout y secuencia](drawings/M-02-001-layout-conceptual.svg), [E-02-001 · alimentación e interfaces de E/S](drawings/E-02-001-arquitectura-electrica-conceptual.svg) y [P-02-001 · circuito funcional y señales de actuador](drawings/P-02-001-circuito-neumatico-conceptual.svg). El [registro de láminas](drawings/README.md) contiene los datos aún pendientes. La revisión descubrió una interfaz por resolver: `DO_PusherValve` está activo tanto en `DISCHARGE` como en `PUSH_RETRACT`, por lo que el tag actual no especifica por sí solo cómo se mandan físicamente avance y retorno. No se modificó la secuencia ni Safety.

## 3. Concepto mecánico

### 3.1 Subconjuntos y criterios de diseño

| Subconjunto | Función de diseño | Criterios físicos a calcular o confirmar |
| --- | --- | --- |
| Magazine por gravedad | Retener una pila de hasta siete piezas y dejar accesible la pieza inferior. | Luz entre guías, tolerancias/variación, masa total, estabilidad, retención de la pila, carga manual, atascos y control de pieza agotada. |
| Empujador de alimentación | Extraer solo la pieza inferior y colocarla en el inicio de cinta. | Guiado lineal, apoyo posterior, rigidez, fuerza, carrera, velocidad, tope, desgaste y prevención de doble alimentación. |
| Cinta | Transportar y detener cada pieza en posiciones repetibles. | Longitud/ancho, velocidad y aceleración, tensión, guiado, accionamiento, soporte, fricción, ruido y capacidad de 5 piezas/min. |
| Estación de visión | Presentar la cara inspeccionada con pose estable. | Fijación rígida, campo de visión para la placa, distancia focal, profundidad de campo, luz, protección frente a reflejos y accesibilidad de ajuste. |
| Expulsor A | Contactar el canto de pieza OK, empujarla fuera del plano de cinta y permitir el retorno sin arrastre. | Trayectoria libre, superficie de contacto, rigidez, fuerza, guiado, carrera, topes, amortiguación, antiatasco y caída controlada. |
| Rampa/contendor A | Recibir y acumular OK sin rebote ni atasco. | Ángulo y material por ensayar, caída, fricción, guías, altura y estabilidad del bin de 25 piezas. |
| Salida B | Llevar y recoger NOK al final de la banda. | Transferencia terminal, altura, retención, distancia de frenado, acumulación y cambio de contenedor. |
| Soportes/armario | Mantener geometría y accesibilidad del conjunto. | Rigidez, nivelación, anclaje, vibración, acceso a cableado, puerta y mantenimiento. |

La fuerza de los cilindros, la sección de perfiles, el motor, la banda, rodamientos, válvulas y amortiguadores no se seleccionan en esta etapa: dependen de masa, fricción, ritmo, geometría final y evaluación de riesgos aún no disponibles.

### 3.2 Referencias confirmadas del modelo visual

Las referencias siguientes describen el HTML para interpretar la animación. No deben convertirse directamente a cotas de taller: el modelo no tiene escala CAD validada, tolerancias ni cálculos de carga.

| Referencia gráfica | Valor en el HTML | Lectura y limitación |
| --- | --- | --- |
| Grupo alimentador y eje | Grupo `x=-2.98`; eje local `x=-1.02` (mundial aproximado `x=-4`). | Referencia de ubicación respecto de cinta. |
| Pieza gráfica | `0.52 × 0.135 × 0.38`; cinco taladros simulados. | Coincide aproximadamente en proporción con el supuesto de placa, sin medirlo ni establecer tolerancias. |
| Magazine | Cuatro guías abiertas; paso vertical `0.135`; una pieza inferior y hasta seis superiores. | Descenso cinemático después de extraer la inferior; no hay simulación física de gravedad. |
| Carrera de empujador de alimentación | Gráfica `1.0`, pieza de `x=-4` a `x=-3`. | No representa carrera seleccionada de cilindro. |
| Cota de cinta | Cara superior `y=1.2925`; plataforma centro `y=1.13`, alto `0.215`; cinta centro `y=1.265`, alto `0.055`. | Alineación visual de cara inferior de pieza con cinta. |
| Rodillos y guías | Rodillos extremos centro `y=1.13`, radio `0.16`; guías alrededor de `y=1.31`. | Sin ejes, tensión, contención ni tolerancias físicas. |
| Cuerpo del cilindro A | Centro local `(0,1.385,2.20)`, largo `1.80`, radio `0.13`; eje Z. | Cuerpo y tapas fijos en grupo `sort`; boca en `z≈1.30`, trasera `z≈3.10`. |
| Placa expulsora A | Centro `(0,1.385,0.80)`, tamaño `0.59 × 0.16 × 0.075`. | Cara de contacto en reposo `z=0.7625`, fuera del borde de cinta `z=0.55`; canto inferior `y=1.305`. |
| Carrera expulsor A | `1.48` en el modelo. | El vástago acompaña a la corredera; no es dimensionamiento neumático. |
| Puente y rampa A | Puente a superficie `y=1.2925` hasta `z≈-0.7175`; rampa ancho `0.88`, final `z≈-2.25`, descenso `0.54`. | Trayectoria visual; caída, fricción, rebote y acumulación requieren ensayo/diseño. |

### 3.3 Cinemática representada, no dimensionamiento

- **Alimentación:** dentro de la fase `FEED` (0,8 s del simulador), el carro avanza entre 0 y 0,45 del tiempo normalizado, retorna entre 0,45 y 0,75, espera hasta 0,78 y anima el descenso de la pila hasta el final. La lengüeta sostiene la pila en avance y se retira antes del descenso. Una sola pieza inferior viaja a la cinta; las superiores no acompañan al empujador.
- **Expulsor OK:** el grupo `sort` está en `x=1.25`. En `SORT_STOP` la pieza queda centrada; en `DISCHARGE` la placa se aproxima y la desplaza por contacto; en `PUSH_RETRACT` la pieza bascula y sigue la rampa mientras retorna el vástago. NOK sigue la cinta a B con el expulsor retraído.
- Estas trayectorias no calculan fuerza, aire, gravedad, fricción, tiempo de parada, deformación ni riesgo. Se conservan como explicación de secuencia, no como resultado de ingeniería física.

## 4. Concepto eléctrico y de control

### 4.1 Arquitectura funcional

```text
Red AC del emplazamiento (tensión y fases por confirmar)
   ├─> protección y distribución de potencia (dimensionar)
   └─> fuente 24 VDC (cargas y margen por calcular)
         ├─> PLC propuesto Siemens S7-1200 / HMI local
         ├─> sensores discretos y válvulas por interfaz seleccionada
         └─> cámara Cognex (Trigger/handshake por E/S o Ethernet, interfaz por definir)

PLC ──> interfaz de accionamiento de cinta (tipo/modelo por seleccionar)
PLC ──> válvula de alimentador y válvula de expulsor (selección pendiente)
Cámara ──> resultado/diagnóstico ──> PLC ──> gateway/servicio de DB externo
Safety ──> funciones independientes definidas por evaluación de riesgos
```

La arquitectura refleja fronteras de función de REQ-008/009/010; no afirma que estos equipos estén conectados. La aplicación PLC no se plantea como cliente SQL directo: el enlace a trazabilidad usa un gateway/servicio externo por definir. El protocolo de cámara y de datos no se fija antes de elegir modelos en el documento 03.

### 4.2 Reglas para el diseño eléctrico

- El supuesto de control es 24 VDC. Tensión/fases de entrada, corriente disponible y potencia de accionamiento se confirmarán en el emplazamiento y con cálculos de carga.
- Mantener señales de campo, potencia de motor, comunicaciones y circuitos Safety identificados y segregados según equipos y normativa aplicable.
- Calcular fuente, protecciones, cortocircuito, caída de tensión, cableado, bornes, puesta a tierra, EMC, disipación del armario y reserva térmica; no asignar tamaños sin datos de placa.
- Diseñar desconexión, aislamiento, identificación y acceso para servicio; circuitos Safety y sus límites se definen en documento 04, no por el Watch ni por `SafetyReady`.
- Mantener una sola lista maestra de tags. `DI_*`, `DO_*`, `Vision*` y `DB_*` de los documentos 01/03 son nombres conceptuales, no direcciones físicas ni un esquema aprobado.
- Definir si `DO_VisionTrigger` será salida discreta o comando de red. El handshake mínimo funcional está en 00/01; tipos, diagnóstico, red, bornes y memoria se cierran con el modelo de cámara.

### 4.3 Armario y cableado

La ubicación gráfica del armario junto al alimentador se conserva como referencia visual. El layout real debe verificar apertura de puerta, disipación, exposición a vibración/polvo, espacio de reserva, entrada de cables, radios de curvatura, longitud de cables a cámara/motor/válvulas y acceso de mantenimiento. El diagrama de potencia, control, red, bornes y lista de cables se generan tras confirmar equipos y layout.

## 5. Concepto neumático

La base de ejercicio usa aire seco filtrado a 6 bar nominales; no hay punto de suministro medido. Los consumidores gráficos son el actuador del alimentador y el expulsor lateral A. La presión disponible bajo demanda, calidad, caudal, ciclo, caída de presión y consumo deben verificarse con datos de componente.

| Circuito funcional | Función | Datos requeridos para dimensionar | Estado actual |
| --- | --- | --- | --- |
| Alimentador | Avanzar/retraer el empujador inferior y liberar la pieza. | Fuerza de avance/retorno, carrera, velocidad, masa apilada, rozamiento, rigidez, ciclos y confirmaciones. | Solo cinemática gráfica; modelo no seleccionado. |
| Expulsor A | Empujar pieza OK fuera de cinta y retornar. | Fuerza de contacto, carrera, carga lateral, guiado, velocidad, amortiguación, ciclos/min y detección extremo. | Carrera gráfica `1.48`; no equivale a una selección física. |
| Preparación/aislamiento | Filtrar/reglar y aislar el suministro para mantenimiento según diseño. | Caudal simultáneo, presión mínima, calidad requerida y estrategia de descarga de energía. | Elementos y estado final por definir con hardware y evaluación de riesgos. |

El esquema de aire deberá mostrar alimentación, preparación, aislamiento, válvulas, escapes, actuadores, puertos, sensores y referencias. El estado al perder energía o presión no se decide en este documento: depende de análisis de riesgos, gravedad de cargas y validación de Safety. No se asigna posición de válvula ni estado seguro por inferencia visual.

## 6. Interfaces entre disciplinas

| Interfaz | Información que debe quedar acordada | Entrega verificable |
| --- | --- | --- |
| Pieza ↔ alimentador | Plano/variación de pieza, masa, orientación, fricción y tolerancias. | Envolvente y condiciones de alimentación revisadas por proceso/mecánica. |
| Cinta ↔ estación de cámara | Pose, parada repetible, vibración, ventana de imagen y espacio de luz. | Plano de estación y requerimientos mecánicos/ópticos coordinados. |
| PLC ↔ accionamiento | Tipo de mando, estado, velocidad, diagnóstico y respuesta a fallo. | Interfaz de control y hoja de datos confirmadas; no una salida PLC directa al motor. |
| PLC ↔ Cognex | Trigger, ready/busy/done/valid/result/ack, job y timeout. | Tabla de interfaz versionada con propietario y protocolo seleccionados. |
| PLC ↔ gateway/DB | Identidad de pieza, registro de resultado/salida, persistencia y desconexión. | Contrato de datos y política de fallo aprobados antes de integración. |
| PLC estándar ↔ Safety | Límites de control y señales de estado necesarias. | Matriz de interfaz derivada de Safety review; sin lógica Safety duplicada en PLC estándar. |
| Electricidad ↔ neumática | Bobinas, tensión, corriente, conectores, presión, escapes y sensores. | Bornes, cables, válvulas y esquema neumático coordinados. |
| Mecánica ↔ mantenimiento | Ajuste de sensores/cámara, recarga, cambio de bins y retirada de atasco. | Revisión de acceso y tareas documentadas antes de liberar layout. |

## 7. Paquete de diseño que debe producirse

1. Layout general 2D/3D con envolventes, zonas de operación, armario, cámara, magazine y contenedores.
2. Planos de conjunto/detalle, lista de materiales mecánicos, tolerancias, acabado y criterios de montaje.
3. Cálculo del alimentador, cilindros, accionamiento/cinta, soportes, estabilidad y transferencia a rampa con datos de entrada y supuestos trazables.
4. Esquemas eléctricos de potencia y control, distribución 24 VDC, cálculo de cargas/protecciones, cableado, bornes y lista de cables.
5. Esquema neumático con lista de componentes, cálculo de consumo y estados revisados con Safety.
6. Plano de soporte de visión con campo de visión/óptica/luz cuando se conozca la cámara, y accesibilidad de ajuste.
7. Matriz de interfaces, lista de señales sincronizada con documento 03, lista de decisiones y registro de revisión de diseño.

Estos son entregables futuros; este documento no contiene cálculos, planos liberados ni una BOM de compra.

## 8. Revisión de diseño y criterios de verificación

| ID / trazabilidad | Revisión / criterio | Evidencia necesaria | Estado |
| --- | --- | --- | --- |
| `DVT-02-01` · REQ-001 | La pieza y sus tolerancias se congelan antes de diseñar guías, empujadores y receta de visión. | Plano aprobado y muestras límite identificadas. | Pendiente; las dimensiones actuales son didácticas. |
| `DVT-02-02` · REQ-001 | Alimentador retiene la pila y libera una pieza inferior sin duplicación ni atasco. | Revisión de tolerancias + prueba de alimentación con variaciones de pieza. | Pendiente; no hay conjunto físico. |
| `DVT-02-03` · REQ-002 | Cinta repite posición de captura y mantiene pieza estable para la imagen. | Prueba de pose/vibración/iluminación con producto y cámara seleccionados. | Pendiente; el HTML solo detiene la animación en INSPECT. |
| `DVT-02-04` · REQ-003 | Transferencias A y B no producen colisión, caída fuera del contenedor o atasco. | Análisis de trayectoria, prototipo y ensayo de los dos resultados. | Pendiente; la rampa es una trayectoria gráfica. |
| `DVT-02-05` · REQ-004 | El conjunto puede sostener 5 piezas/min bajo condiciones REQ-004. | Cálculo de ciclo con datos reales y prueba estable de 30 min. | Pendiente; no se infiere de la duración del modelo. |
| `DVT-02-06` · REQ-011 | Alimentación eléctrica, corriente, protecciones y cables satisfacen carga y ambiente. | Cálculo eléctrico, planos revisados y verificación de instalación. | Pendiente; faltan equipos y placa de cargas. |
| `DVT-02-07` · REQ-011 | Suministro neumático cumple 6 bar nominal en uso y caudal/ciclo calculados. | Medición en punto de uso y cálculo/ensayo de consumo. | Pendiente; 6 bar es supuesto, no medición. |
| `DVT-02-08` · REQ-002 / REQ-009 | Soporte óptico permite campo de visión y repetibilidad para los defectos REQ-002. | Estudio de óptica/luz y prueba con las muestras de aceptación. | Pendiente; cámara y óptica no seleccionadas. |
| `DVT-02-09` · REQ-012 / REQ-014 | Layout, mantenibilidad y tareas de acceso están revisadas. | Revisión multidisciplinar y acciones cerradas. | Pendiente; no sustituye evaluación Safety. |
| `DVT-02-10` · REQ-008 / REQ-009 / REQ-010 / REQ-014 | Límites y señales entre estándar, cámara, datos y Safety son coherentes con 01/03/04/05. | Matriz de interfaz controlada por revisión. | Pendiente; ingeniería distribuida en documentos posteriores. |

No se ejecutaron pruebas físicas ni cálculos mecánicos, eléctricos o neumáticos al redactar este paquete. Las capturas del simulador solo evidencian presentación visual y trayectorias modeladas.

## 9. Decisiones todavía abiertas

| ID | Decisión | Dependencia |
| --- | --- | --- |
| `D-02-01` | Plano final, masa y variación dimensional de placa; confirmar si la geometría didáctica coincide con producto real. | Cliente/proceso/calidad. |
| `D-02-02` | Carga en magazine, sensor de vacío, permiso de recarga y tratamiento de atasco. | Proceso, mecánica, I/O y Safety. |
| `D-02-03` | Detectar bin lleno y permitir su sustitución sin riesgo de desbordamiento. | Operación, layout y hardware. |
| `D-02-04` | Velocidad, ancho, longitud y accionamiento de cinta para cumplir 5 piezas/min y parada de cámara. | Producto, ciclo y selección de motor/drive. |
| `D-02-05` | Fuerza, carrera y amortiguación físicas de ambos cilindros. | Datos de carga, guiado, presión/caudal y riesgo. |
| `D-02-06` | Modelo de cámara, óptica, distancia de trabajo, iluminación y soporte. | Pruebas con muestras reales y documento 03. |
| `D-02-07` | Alimentación AC del armario, potencia/corriente, ambiente, EMC e IP. | Emplazamiento, placas de equipo y normativa aplicable. |
| `D-02-08` | Arquitectura de red/gateway hacia DB, protocolo y comportamiento offline. | IT/OT, integración y documento 03. |
| `D-02-09` | Requisitos y límites de funciones Safety; estado ante pérdida de energía/aire. | Evaluación de riesgos y documento 04. |

## 10. Estado y siguiente puerta

**Resultado:** concepto mecánico, eléctrico y neumático documentado; láminas M/E/P revisión B validadas por D2R para uso didáctico. No hay diseño físico liberado.
**Evidencia ejecutada en esta edición:** revisión documental del HTML y de los documentos 00/01; no se corrieron pruebas ni cálculos físicos.
**Aprobación de fabricación:** no aplica; el caso sigue siendo didáctico.
**Siguiente documento tras revisar este:** [03 · Componentes, hardware y mapa de E/S](03-COMPONENTES-HARDWARE-IO.md), donde se convertirán las interfaces en candidatos de equipo y una lista de señales sin direcciones reales hasta seleccionar CPU/módulos.
