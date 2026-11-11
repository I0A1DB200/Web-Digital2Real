# Media source — EE-0030

La Experience contiene siete assets visuales ilustrativos. Los originales recibidos se conservan en `EE-0030_OPCUA_7_evidencias_Codex/` y las copias runtime se sirven desde `../assets/EXP-OPCUA-DATA-030/`; el YAML usa `representation: available`.

Cada imagen debe ser legible en móvil y servir a la evidencia correspondiente. Los endpoints, NodeIds, intervalos y valores pueden ser genéricos o simulados, pero no deben presentarse como una instalación real ni como una captura nativa de un fabricante.

1. **EVID-01 / Estado de sesión** — interfaz de cliente OPC UA donde la sesión aparece establecida y el endpoint es accesible, mientras el valor monitorizado permanece antiguo.
2. **EVID-02 / Estado de suscripción** — panel que muestre la suscripción existente, `PublishingEnabled=true` y sus contadores o estado de publicación, separado de la sesión.
3. **EVID-03 / Monitored item** — configuración del objeto monitorizado con `NodeId`, atributo `Value` y `MonitoringMode=Sampling` para compararlo con el modo `Reporting` esperado.
4. **EVID-04 / Muestreo y publicación** — vista de intervalos solicitados y efectivos, con 250 ms de sampling, 1000 ms de publishing y queue size 10 como parámetros didácticos revisables por el servidor.
5. **EVID-05 / Calidad** — la captura muestra `StatusCode=Good` y la configuración del monitored item, pero no muestra el valor junto al estado. No debe presentarse como prueba visual completa de frescura; un valor antiguo puede conservar calidad `Good` y no debe asumirse que es `Bad` o `Uncertain`.
6. **EVID-06 / Timestamps** — `SourceTimestamp` y `ServerTimestamp` visibles para distinguir un valor antiguo de un cambio actual; no deben suponerse iguales.
7. **EVID-07 / Recuperación** — comparación del valor de origen del servidor con `DataChangeNotification` recibida mediante `Publish` después de aplicar `SetMonitoringMode=Reporting`, mostrando calidad y timestamps coherentes.

La secuencia debe conservar la progresión de evidencia: sesión, suscripción, monitored item, temporización, calidad, timestamps y recuperación funcional. Las imágenes no deben sustituir el texto de diagnóstico ni inventar resultados. Los valores de endpoint, NodeId e intervalos son de simulación y deben etiquetarse como tales. Las siete imágenes recibidas son recreaciones didácticas de una interfaz tipo UaExpert, no capturas de una instalación real ni trazas OPC UA capturadas.
