# EE-0036 — Entrega de assets
Clasificación: CONTENT. Paquete de revisión, no aprobado para publicación técnica.
Assets 01–06 aprobados visualmente por el usuario; 07 incluido como última versión generada, sin aprobación visual explícita. Selección de 01 y 02 por comparación visual de las versiones disponibles.

## QA pendiente
- 01: verificar referencias, potencia de Y3 (inconsistencia con 4.8 W de los primeros planos), LED Q0.3 y terminales físicos.
- 02: corregir retorno A2 pasando por X2:8, sin derivación directa; verificar alimentación específica DQ, asignación de salidas y protección inductiva. No publicar el esquema actual como plano válido. Q0.1→X2:5, Q0.2→X2:6, Q0.3→X2:7→A1; A2→X2:8→0 V.
- 03: recreación de TIA Portal, no captura real. Valores auxiliares ilustrativos; Q0.3 TRUE no prueba tensión física. No forzar salidas.
- 04: lecturas simuladas 24/24/0 V; comprobar contacto metálico de puntas y referencia 0 V de PS1.
- 05: OL simulado; comprobar contacto negro, aislamiento del conductor, ausencia de tensión y correspondencia de bornas.
- 06: inspección consignada; verificar trazabilidad del conductor cortado entre X2:8 y 0 V.
- 07: 24 V simulados entre A1/A2; verificar contacto metálico, modo VDC y conmutación funcional.

## Integración
Codex debe inspeccionar el YAML y las convenciones del repositorio antes de integrar. No cambiar Engine ni revelar causa raíz antes del paso correspondiente. Mantener SSOT y semántica de evidencias. Validar rutas, carga, orden, ES/EN y QA técnico; informar cambios, pruebas y bloqueos. No publicar hasta resolver los bloqueos técnicos.
