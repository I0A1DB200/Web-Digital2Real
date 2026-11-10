# Media source — EE-0029

La Experience contiene seis assets visuales aprobados. Cada original se conserva en `EE-0029_assets/` y tiene una copia exacta con nombre estable en `../assets/` para el empaquetado de la Experience.

Cada imagen es una recreación didáctica legible en móvil y sirve a la evidencia correspondiente. Las IP, el puerto BACnet/IP, la instancia 3001 y el nombre de objeto se fijan para este escenario; no deben presentarse como valores universales ni como capturas nativas de un fabricante.

1. **EVID-01 / Incidente BMS** — pantalla de descubrimiento BACnet/IP donde el controlador remoto no aparece, con contexto suficiente para mostrar que el BMS sigue operativo y que existe actividad local.
2. **EVID-02 / Direccionamiento** — vista de configuración del BMS y del controlador con IP, máscara y subredes diferenciadas; usar valores ilustrativos y evitar afirmar que son parámetros reales.
3. **EVID-03 / Subred y ruta** — diagrama de dos subredes IP, un router y la frontera de descubrimiento BACnet; debe separar ruta IP de distribución de broadcast.
4. **EVID-04 / Who-Is e I-Am** — captura de tráfico donde se vea una solicitud Who-Is y la ausencia de un I-Am remoto dentro del ámbito observado, sin concluir que el controlador esté apagado.
5. **EVID-05 / BBMD o Foreign Device** — configuración BACnet/IP que muestre el mecanismo de distribución entre subredes ausente o sin registrar, sin fijar una implementación universal.
6. **EVID-06 / Recuperación** — pantalla donde el BMS descubre el controlador y lee una propiedad conocida con calidad válida en lecturas repetidas.

La secuencia conserva la progresión de evidencia: incidente inicial, direccionamiento, frontera de subred, tráfico, configuración de descubrimiento y verificación funcional. Las imágenes no sustituyen el texto de diagnóstico; EVID-06 combina la evidencia de I-Am y ReadProperty/ComplexACK en una composición didáctica.
