# EE-0030 — Datos OPC UA sin actualizar

Experience bilingüe de diagnóstico OPC UA para separar una sesión conectada de una suscripción o monitored item que no entrega cambios del proceso.

La representación visual está disponible con siete assets didácticos tipo UaExpert. Las imágenes se conservan como originales en `media-source/EE-0030_OPCUA_7_evidencias_Codex/` y se sirven desde `assets/EXP-OPCUA-DATA-030/`.

La causa raíz queda concretada para la simulación: el monitored item está en `MonitoringMode=Sampling` cuando debe estar en `Reporting`. La sesión, la suscripción y `PublishingEnabled` siguen activos; la recuperación usa `SetMonitoringMode=Reporting` y verifica `DataChangeNotification` mediante `Publish`. Los endpoints, NodeIds, intervalos y valores son parámetros didácticos propuestos, no datos de una instalación real.

La captura EVID-05 muestra `StatusCode=Good` y la configuración del monitored item, pero no muestra el valor junto al estado. Por tanto, se presenta como apoyo visual de calidad y configuración; la relación completa entre valor, calidad y timestamps se verifica con el texto diagnóstico y EVID-06.
