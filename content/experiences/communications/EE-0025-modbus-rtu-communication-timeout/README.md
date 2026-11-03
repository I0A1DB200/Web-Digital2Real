# EE-0025 — Timeout de comunicación Modbus RTU

Experiencia bilingüe del ENV-003 para diagnosticar un timeout de comunicación serie causado por una discrepancia de paridad entre el cliente Modbus RTU y el servidor. El caso separa diagnóstico, parámetros, cableado, dirección y dispositivo antes de aplicar la corrección autorizada y verificar respuestas válidas repetidas.

La causa simulada del modelo sigue siendo `Even` en el cliente frente a `Odd` en el servidor. El ZIP recibido contiene seis imágenes originales y sustituye la colección de borradores anterior.

## Media de esta revisión

Los seis PNG originales se conservan en `media-source/EE-0025_assets/` con sus nombres recibidos y se copian sin conversión a los seis assets runtime `ART-001`…`ART-006`:

- `ART-001` — fotografía de instalación S7-1500;
- `ART-002` — buffer de diagnóstico de TIA Portal;
- `ART-003` — esquema RS-485;
- `ART-004` — configuración del cliente Modbus RTU;
- `ART-005` — configuración del servidor Modbus RTU;
- `ART-006` — traza de comunicación Modbus RTU.

Las capturas muestran valores que deben correlacionarse antes de cerrar la revisión técnica: cliente `19200 / Even`, servidor `9600 / Odd` y traza `38400 / None`. Por eso la experiencia permanece en `technical_review`; las imágenes no se presentan como una única captura coherente de una instalación validada.
