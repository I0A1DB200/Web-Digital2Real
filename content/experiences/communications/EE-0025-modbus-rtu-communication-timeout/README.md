# EE-0025 — Timeout de comunicación Modbus RTU

Experiencia bilingüe del ENV-003 para diagnosticar un timeout de comunicación serie causado por una discrepancia de paridad entre el cliente Modbus RTU y el servidor. El caso separa diagnóstico, parámetros, cableado, dirección y dispositivo antes de aplicar la corrección autorizada y verificar respuestas válidas repetidas.

La causa simulada sigue siendo `Even` en el cliente frente a `Odd` en el servidor. Los valores de baud rate, bits, parada, dirección y timeout pertenecen al modelo técnico de la experiencia; el paquete de media entregado en esta revisión contiene plantillas con campos `TO BE VERIFIED` y no debe tratarse como captura final de proveedor.

## Media de esta revisión

El ZIP recibido para EE-0025 contiene seis SVG de revisión. Se conservan sin modificación en `media-source/EE-0025_assets/` junto con su README de procedencia y se entregan como seis PNG rasterizados en `assets/` para el runtime:

- `ART-001` — contexto de instalación;
- `ART-002` — síntoma de diagnóstico del PLC;
- `ART-003` — topología conceptual RS-485;
- `ART-004` — plantilla de parámetros del cliente;
- `ART-005` — plantilla de parámetros del servidor;
- `ART-006` — checklist de verificación de recuperación.

Esta sustitución elimina los siete PNG anteriores. La experiencia permanece en `technical_review` hasta validar la topología, los valores serie y la procedencia de las capturas definitivas.
