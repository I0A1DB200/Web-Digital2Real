# EE-0026 — Dato incorrecto en registros Modbus TCP

Experiencia bilingüe del ENV-003. El PLC recibe respuestas Modbus TCP normales, pero muestra un valor REAL32 incorrecto porque el bloque intercambia las palabras alta y baja.

La unidad separa transporte, mapa de registros, orden de palabra y conversión antes de validar cinco lecturas contra la referencia `25.0 bar`.

## Media de esta revisión

Las cinco imágenes originales se conservan en `media-source/EE-0026_assets/` con los nombres recibidos y se copian sin conversión a los cinco assets runtime `ART-001`…`ART-005`:

- `ART-001` — fotografía Siemens S7-1500 para el contexto de instalación;
- `ART-002` — TIA Portal con `Pressure = 2.36E-41`, estado inicial de la avería;
- `ART-003` — Wireshark con respuesta Modbus TCP FC03 válida;
- `ART-004` — ModScan64 con los registros `40001` y `40002`;
- `ART-005` — TIA Portal con `Pressure = 25.0`, verificación de recuperación.

La experiencia permanece en `technical_review` hasta completar la revisión técnica y el hotspot del ENV-003.
