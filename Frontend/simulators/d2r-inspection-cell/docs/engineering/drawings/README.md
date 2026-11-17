# 02 · Láminas de ingeniería · revisión B validada

D2R ha validado la revisión B para uso didáctico conceptual. Las láminas relacionan el recorrido mecánico, la secuencia del simulador, los tags del Watch y los servicios. Los datos físicos sin cerrar se indican como pendientes de definir, seleccionar o calcular; no se han inventado direcciones, modelos ni valores de dimensionamiento. La validación no libera diseños para fabricación, cableado o instalación.

| Plano | Contenido útil | Documento coordinado |
| --- | --- | --- |
| [M-02-001 · Layout y secuencia](M-02-001-layout-conceptual.svg) | Disposición, ruta de pieza, salidas A/B, referencias gráficas y fases/tiempos actuales de alimentación, inspección y clasificación. | 01 · Especificación funcional |
| [E-02-001 · Potencia e interfaces de E/S](E-02-001-arquitectura-electrica-conceptual.svg) | Ramas de alimentación, lista de las 7 DI y 4 DO con su función, bloque PLC, visión, HMI, gateway/DB y frontera Safety. | 03 · Componentes, hardware y mapa de E/S |
| [P-02-001 · Aire y actuadores](P-02-001-circuito-neumatico-conceptual.svg) | Suministro → filtro/regulador → aislamiento de servicio → colector; señales y fases de los dos actuadores. | 02 · Diseño mecánico, eléctrico y neumático |

## Interfaz que requiere decisión

En el simulador `DO_PusherValve` permanece en 1 durante `DISCHARGE` (empuje) y `PUSH_RETRACT` (retorno), aunque el movimiento gráfico cambia de sentido. Ese tag no define por sí solo el mando de una válvula real. Antes de elegir válvula o mapear salidas, hay que decidir cómo se ordenan avance y retorno y qué confirmaciones físicas se requieren. Las hojas registran la discrepancia; el HTML y sus tiempos no se modificaron.

## Datos base y pendientes

- **Supuestos del caso:** control 24 VDC y aire seco filtrado a 6 bar nominales. La presión no se midió; cargas y consumos no se calcularon.
- **Referencias gráficas:** coordenadas y recorridos del HTML. No son cotas de taller ni dimensiones verificadas.
- **Pendiente de hardware:** alimentación AC, CPU/módulos, dispositivos de campo, drive, cámara, actuadores, válvulas, bornes, protecciones y direcciones.
- **Pendiente de cálculo/validación:** cargas, fuerzas, carreras, caudal, estabilidad, tolerancias, cableado y pruebas físicas.
- **Safety:** su arquitectura y respuesta ante pérdida de energía/aire siguen sujetas a evaluación de riesgos; `SafetyReady` continúa siendo una señal simulada.

## Comprobación de estas láminas

Se renderizaron con Inkscape y se revisaron visualmente los textos y sus recuadros. Los tres SVG pasan el análisis XML y sus enlaces desde documentos 02 ES/EN existen. No se ejecutaron CAD, cálculos, pruebas de hardware ni validación Safety.

## English summary

D2R accepted Revision B for conceptual teaching use. The sheets connect the mechanical route, simulator sequence, Watch tags, and utilities. M-02-001 shows the layout, A/B routes, model references, and current phase times. E-02-001 maps the 7 DI and 4 DO tags and shows power branches, PLC, vision, HMI, gateway/database, and the unresolved Safety boundary. P-02-001 follows the air supply through filter/regulator, service isolation, manifold, and the two actuator interfaces.

**Open control-interface issue:** `DO_PusherValve` is 1 in both `DISCHARGE` and `PUSH_RETRACT`, while the animated actuator changes direction. That simulator tag alone does not specify real extend/retract valve commands. Resolve the command semantics and physical feedback before selecting a valve or mapping PLC outputs. No sequence or simulator timing was changed.

The case assumes 24 VDC controls and dry filtered air at nominal 6 bar; pressure, loads, and consumption have not been measured or calculated. Coordinates are render references, not verified dimensions. Hardware selection, addresses, calculations, physical tests, and risk-based Safety design remain open. The SVGs were rendered with Inkscape, inspected for text fit, parsed as XML, and their ES/EN links checked; no CAD or physical validation was performed.
