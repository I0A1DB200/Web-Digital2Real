# Media source — EE-0030

La Experience requiere siete assets visuales ilustrativos. Hasta que se entreguen y revisen, no se copian imágenes a `assets/` y el YAML conserva `representation: planned` con `assets: []`.

Cada imagen debe ser legible en móvil y servir a la evidencia correspondiente. Los endpoints, NodeIds, intervalos y valores pueden ser genéricos o simulados, pero no deben presentarse como una instalación real ni como una captura nativa de un fabricante.

1. **EVID-01 / Estado de sesión** — interfaz de cliente OPC UA donde la sesión aparece establecida y el endpoint es accesible, mientras el valor monitorizado permanece antiguo.
2. **EVID-02 / Estado de suscripción** — panel que muestre la suscripción existente y sus contadores o estado de publicación, separado de la sesión.
3. **EVID-03 / Monitored item** — configuración del objeto monitorizado con nodo, atributo de valor y estado de monitorización para comparar con lo esperado.
4. **EVID-04 / Muestreo y publicación** — vista de intervalos de muestreo/publicación y política de notificación que permita identificar la configuración que impide observar cambios.
5. **EVID-05 / Calidad** — DataValue donde valor y StatusCode se puedan leer juntos, sin convertir una calidad incierta o mala en dato válido.
6. **EVID-06 / Timestamps** — SourceTimestamp y ServerTimestamp visibles para distinguir un valor antiguo de un cambio actual.
7. **EVID-07 / Recuperación** — comparación del valor de origen del servidor con las notificaciones del cliente después de corregir la monitorización, mostrando calidad y timestamps coherentes.

La secuencia debe conservar la progresión de evidencia: sesión, suscripción, monitored item, temporización, calidad, timestamps y recuperación funcional. Las imágenes no deben sustituir el texto de diagnóstico ni inventar resultados.
