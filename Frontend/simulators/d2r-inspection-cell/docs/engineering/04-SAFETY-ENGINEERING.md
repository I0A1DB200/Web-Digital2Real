# 04 · Safety Engineering

**Estado:** marco de trabajo v0.3 validado para uso didáctico · evaluación de riesgos aprobada pendiente
**Objetivo:** establecer el proceso necesario para definir, implementar y validar las funciones de seguridad de una máquina real.

> La señal `SafetyReady` del simulador es una indicación lógica constante. No es una entrada de un relé o PLC Safety, no demuestra una función de seguridad y no debe usarse para dimensionar ni validar el sistema. Los paneles transparentes del modelo 3D son representación gráfica: no se han evaluado como resguardos ni pueden recibir crédito en una evaluación de riesgos.

## Principio de diseño

Safety empieza con el uso previsto, los límites de la máquina y la identificación de peligros; no con copiar un bit del simulador. Una persona competente debe evaluar riesgos con la normativa aplicable a la jurisdicción, al tipo de máquina y al diseño. La necesidad de PLr/SIL, arquitectura, componentes y pruebas se deriva de ese análisis.

## Trabajo necesario

1. Definir modos de operación, accesos, tareas de limpieza/desatasco, mantenimiento y condiciones previsibles de fallo.
2. Identificar peligros mecánicos, eléctricos, neumáticos y de proceso; estimar y reducir el riesgo según el método aplicable.
3. Especificar cada función de seguridad: evento iniciador, zona, reacción requerida, tiempo/distancia de parada, rearme y diagnóstico.
4. Seleccionar resguardos, enclavamientos, paradas de emergencia y elementos de control solo después de establecer los requisitos.
5. Separar el control estándar de las funciones de seguridad y definir las interfaces entre ellos.
6. Verificar el diseño y validar cada función con un protocolo trazable; registrar medidas, fallos, cambios y aprobación responsable.

ISO 12100, ISO 13849-1, IEC 62061 y las normas de tipo C que correspondan son referencias para revisar con el equipo de Safety. Citar una norma no acredita conformidad ni certifica este simulador.

## Temas por evaluar para este caso

Acceso al cargador y a zonas de pellizco; acceso a cinta, rodillos, expulsor y rampas; intervención ante atasco; energías residuales y pérdida de aire; protección de cámara/iluminación; y recuperación tras parada. Son temas de evaluación, no una lista cerrada de peligros ni una solución seleccionada.

| Entregable | Evidencia requerida | Estado |
| --- | --- | --- |
| Evaluación de riesgos | Límites, peligros, estimación, medidas y riesgo residual. | Pendiente |
| Especificación de funciones | Requisitos, zonas, estado seguro, rearme y tiempos medidos. | Pendiente |
| Diseño Safety | Arquitectura, componentes, cálculos y documentación eléctrica. | Pendiente |
| Validación | Protocolo, resultados medidos, desviaciones y aprobación. | Pendiente |

**Trazabilidad:** `REQ-014` del brief 00; interfaces con los documentos 01–03.

**Límite didáctico:** el HTML mantiene su modelo conceptual existente; esta ficha no modifica ni amplía su Safety.

## Registro inicial de peligros para revisión

Este registro organiza preguntas para el taller de riesgos. No es una evaluación completa, no asigna nivel de riesgo y no prescribe una arquitectura. Cada fila debe revisarse con tareas reales, probabilidad/exposición y medidas existentes.

| ID | Zona/tarea que investigar | Peligro posible | Daño a considerar | Medida/función a estudiar | Valoración |
| --- | --- | --- | --- | --- | --- |
| `HZ-001` | Reponer piezas / liberar atasco en cargador. | Atrapamiento o aplastamiento por empujador y guías. | Lesión en dedos/mano. | Acceso, retención, aislación de energía, resguardo/enclavamiento si procede. | Pendiente de evaluación competente. |
| `HZ-002` | Operación, limpieza o retirada de objeto sobre cinta. | Arrastre/atrapamiento en banda, rodillos o transmisión. | Lesión en mano/brazo. | Geometría, acceso, resguardo y respuesta de parada. | Pendiente de evaluación competente. |
| `HZ-003` | Intervención cerca del expulsor y rampa. | Golpe, pellizco o proyección/caída de pieza. | Lesión por mecanismo o pieza móvil. | Separación, contención y acceso seguro. | Pendiente de evaluación competente. |
| `HZ-004` | Rearme después de parada, fallo o pérdida de energía. | Arranque inesperado al restaurar permiso o señal. | Exposición a movimiento no esperado. | Lógica de rearme y arranque separado; confirmar en análisis. | Pendiente de evaluación competente. |
| `HZ-005` | Mantenimiento de cilindros, válvulas y mangueras. | Energía neumática almacenada o movimiento residual. | Movimiento inesperado/proyección. | Aislamiento, descarga y comprobación de energía cero. | Pendiente de evaluación competente. |
| `HZ-006` | Ajuste de cámara/iluminación. | Riesgo óptico o eléctrico según fuente seleccionada. | Exposición o contacto eléctrico. | Evaluar la fuente y sus condiciones de servicio. | Pendiente de evaluación competente. |

El estado pendiente no significa riesgo bajo. La persona evaluadora debe registrar límites de máquina, uso previsto y uso indebido razonablemente previsible, personas expuestas, severidad, exposición, posibilidad de evitar el daño, medidas, riesgo residual y referencia normativa aplicable.

## Definición de funciones de seguridad

Para cada función resultante del análisis, completar una especificación con:

- Identificador, peligro, zona y modos de operación afectados.
- Evento iniciador y dispositivos que lo detectan.
- Estado seguro por elemento final (motor, válvula, freno, descarga de aire), decidido por análisis; no asumir que quitar energía siempre basta.
- Tiempo/distancia de respuesta requerido y método/condición de medición.
- PLr o SIL requerido y justificación normativa, cuando aplique.
- Arquitectura, componentes certificados, diagnósticos, fallos comunes y cálculo de fiabilidad.
- Regla de rearme manual, ubicación, visibilidad de zona y condición para permitir un nuevo START.
- Criterio de prueba, periodicidad, registro y responsable de aprobación.

Los mandos normales `FIN DE PIEZA`, RESET HMI, PAUSA del simulador y RESET SIM no son sustitutos de parada de emergencia ni de una función Safety. El rearme de Safety no debería iniciar ciclo automáticamente.

## Plantilla de validación (por función)

| Campo | Registrar durante validación |
| --- | --- |
| Función / versión | ID, esquema, software y configuración instalados. |
| Precondiciones | Modo, carga, presión/tensión, puertas y condición inicial. |
| Método | Instrumento, conexión, secuencia y limitación de medición. |
| Resultado | Tiempo/distancia medidos, reacción de cada elemento y diagnóstico. |
| Fallos introducidos | Circuito/canal afectado según procedimiento aprobado y evaluación de riesgo. |
| Resultado de prueba | PASS/FAIL, desviación, repetición y evidencia. |
| Aprobación | Persona competente, referencia del registro de aprobación y evidencia controlada. |

La validación física requiere un plan seguro de puesta en marcha. Ningún paso de prueba Safety se considera realizado por observar una animación.
