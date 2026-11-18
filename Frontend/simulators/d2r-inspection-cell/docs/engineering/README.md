# Expediente de ingeniería · D2R Inspection Cell

Este expediente convierte la célula del simulador en un caso didáctico trazable, desde el brief hasta la puesta en marcha. El punto de partida es el [prototipo actual](../../D2R-3D-001_Prototipo_Funcional_v11.html); no representa todavía un proyecto de cliente aprobado ni una instalación física.

## Ruta de documentos

| Etapa | Documento | Estado |
| --- | --- | --- |
| 00 | Brief del cliente y requisitos iniciales ([ES](00-BRIEF-CLIENTE.md) · [EN](00-BRIEF-CLIENTE.en.md)) | Base didáctica aprobada por D2R · cliente real no aplica |
| 01 | Especificación funcional y criterios de aceptación ([ES](01-ESPECIFICACION-FUNCIONAL.md) · [EN](01-FUNCTIONAL-SPECIFICATION.en.md)) | Documento didáctico v0.3 aprobado por D2R · AUTO 7/7, PIEZA con dos órdenes START y FIN DE PIEZA (fases + intervalo) SIM aprobados · TC-016–019 con cobertura residual · máquina real no aplica |
| 02 | Diseño mecánico, eléctrico y neumático ([ES](02-DISENO-MECANICO-ELECTRICO-NEUMATICO.md) · [EN](02-MECHANICAL-ELECTRICAL-PNEUMATIC-DESIGN.en.md) · [láminas M/E/P](drawings/README.md)) | Concepto v0.3 · láminas M/E/P revisión B validadas para uso didáctico · dimensionamiento físico pendiente |
| 03 | Componentes, hardware y mapa de E/S ([ES](03-COMPONENTES-HARDWARE-IO.md) · [EN](03-COMPONENTS-HARDWARE-IO.en.md)) | Revisión 0.4 validada para uso didáctico · tags del Watch cotejados · canales físicos, hardware y direcciones pendientes |
| 04 | Safety Engineering ([ES](04-SAFETY-ENGINEERING.md) · [EN](04-SAFETY-ENGINEERING.en.md)) | Marco v0.3 validado para uso didáctico · evaluación de riesgos aprobada pendiente |
| 05 | Arquitectura PLC: OB, FC, FB, DB, UDT y tags ([ES](05-ARQUITECTURA-PLC.md) · [EN](05-PLC-ARCHITECTURE.en.md)) | Propuesta v0.3 validada para uso didáctico · TIA/PLC no implementados |
| 06 | Programación LAD/KOP y SCL, HMI y visión ([ES](06-PROGRAMACION-HMI-VISION.md) · [EN](06-PROGRAMMING-HMI-VISION.en.md)) | Guía v0.3 validada para uso didáctico · ejemplos no compilados; proyecto ejecutable pendiente |
| 07 | Gestión del proyecto, commissioning, FAT y SAT ([ES](07-PROYECTO-COMMISSIONING-FAT-SAT.md) · [EN](07-PROJECT-MANAGEMENT-COMMISSIONING-FAT-SAT.en.md)) | Plan v0.3 validado para uso didáctico · pruebas físicas FAT/SAT pendientes |

Safety se identifica desde el brief y se desarrolla antes de cerrar el diseño detallado y las pruebas de puesta en marcha. El orden del índice organiza el aprendizaje; no sustituye el orden profesional de evaluación de riesgos.

## Estado real del caso

- **Confirmado en el simulador:** secuencia didáctica, fases/tiempos del HTML, lote virtual 4 OK/3 NOK, rutas OK → A y NOK → B, nombres/tipos del Watch y mandos disponibles. La verificación de controles no equivale a completar todos los criterios SIM de la especificación.
- **Desarrollado como propuesta educativa:** requisitos funcionales, desglose del conjunto, mapa lógico de E/S, frontera Cognex/PLC, árbol de bloques, flujo HMI y plan de aceptación.
- **Todavía no definido por un cliente ni implementado:** dimensiones y masa de pieza, tolerancias de inspección, producción objetivo, marcas/modelos de hardware, protocolo Cognex, asignación TIA real, evaluación/diseño Safety, planos liberados y criterios físicos FAT/SAT.

Por ello, el expediente ya sirve como guía de aprendizaje y revisión, pero todavía no es un paquete de fabricación, un proyecto TIA cargable ni una especificación contractual cerrada.

## Convenciones

- **Confirmado en el simulador:** comportamiento o dato comprobable en el HTML y las pruebas actuales.
- **Propuesta didáctica:** requisito reconstruido para enseñar el diseño; no equivale a una petición real firmada.
- **Pendiente de definición:** dato que requiere una decisión del cliente o una ingeniería posterior.
- **Fuera de alcance actual:** hardware, software o validación física que aún no existe.

El estado y la trazabilidad se indican en cada ficha y en esta matriz; no se presupone que una aprobación documental implique pruebas de simulador o físicas. Los documentos 00–07 tienen lectura en español e inglés dentro del simulador. El Markdown es la fuente editable; el brief 00 también dispone de una presentación HTML bilingüe.

Se usan `REQ-###` para requisitos y `TC-###` para criterios/casos de prueba. Las señales conservan sus nombres del Watch como identificadores; no se ha adoptado una numeración paralela `TAG-###`. Los nombres de bloques de 05 son propuestas didácticas y no tienen IDs `PLC-###` ni existen en un proyecto TIA.

El estado no es uniforme: 00 es una base didáctica aprobada; 01 está aprobado como documento y sus criterios de operación SIM TC-005/006 están cerrados, con cobertura residual de TC-007 y TC-016–019; 02 y sus láminas B están validados solo como concepto didáctico; 03–07 están validados para uso didáctico y mantienen propuestas o decisiones abiertas en sus matrices. Aún no hay hardware seleccionado, DB/PLC reales, cámara Cognex conectada, evaluación de riesgos aprobada ni FAT/SAT ejecutados. `reader.html` presenta los Markdown 01–07; 00 abre su propia página HTML bilingüe.

## Pendiente antes de cerrar el expediente

- Cerrar la cobertura residual `TC-007` y `TC-016`–`TC-019` de 01. FIN DE PIEZA ya se comprobó en las siete fases y en `betweenCycles`; esa prueba no equivale a FAT ni a validación PLC.
- Cerrar 03 con selección de hardware, direcciones reales y una interfaz acordada para cámara/gateway, después de fijar requisitos suficientes.
- Completar 04 mediante evaluación de riesgos y validación competentes; nada de este expediente constituye diseño o certificación Safety.
- Desarrollar y comprobar el diseño físico: planos liberados, cálculos, proyecto TIA compilable, integración de cámara/datos y protocolos FAT/SAT. Las láminas y movimientos actuales son material didáctico, no fabricación ni comportamiento físico comprobado.

## Principios de trabajo

1. Empezar por lo que el simulador confirma y marcar las reconstrucciones como borrador.
2. No seleccionar una CPU, módulos, cámara Cognex, protocolo ni direcciones hasta tener requisitos suficientes.
3. Mantener la lógica, fases, temporizaciones, clasificación y modelo de Safety del simulador fuera de los cambios documentales.
4. Distinguir una simulación visual de una prueba con equipo real.
5. Revisar cada paquete antes de avanzar al siguiente.

El estado del simulador y sus comprobaciones actuales se resumen en el [informe ENGINE-001](../D2R-ENGINE-001-REPORT.md). Ese informe de QA no sustituye a los documentos de ingeniería de este expediente.
