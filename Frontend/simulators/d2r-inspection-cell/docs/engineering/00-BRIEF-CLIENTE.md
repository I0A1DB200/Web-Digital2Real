# 00 · Brief del cliente y requisitos iniciales

**Versión:** 0.2 · base didáctica aprobada por D2R
**Caso:** D2R Inspection Cell · cliente ficticio
**Fuente para describir el simulador:** [prototipo funcional](../../D2R-3D-001_Prototipo_Funcional_v11.html)

> **Importante:** no existe un cliente real ni un brief firmado. D2R aprobó este caso ficticio y sus decisiones para uso didáctico. Los valores marcados como **supuesto didáctico** siguen sin ser datos medidos, una compra aprobada ni una especificación de una instalación real; deberán sustituirse si se reciben datos auténticos de cliente o emplazamiento.

## 1. Encargo didáctico

Una empresa ficticia de mecanizado quiere automatizar la inspección visual de una placa pequeña y clasificarla automáticamente. Una persona operadora carga piezas en un cargador, inicia la célula desde el HMI, recoge las piezas buenas y las rechazadas en dos contenedores y consulta el resultado de cada pieza en un registro electrónico.

La célula de aprendizaje es autónoma: la carga inicial y la retirada de contenedores son manuales. No se presupone una línea anterior o posterior, ni comunicación con MES/ERP. La persona de mantenimiento e ingeniería podrá observar señales y diagnosticar el ciclo.

El ejercicio recorrerá el ciclo de vida completo: requisitos, concepto mecánico y eléctrico, selección de hardware, arquitectura y programa PLC, Safety Engineering, HMI/visión y commissioning. El HTML actual permite estudiar y demostrar el proceso; no ejecuta una máquina física.

## 2. Pieza y alcance de inspección

### 2.1 Definición propuesta

| Dato | Base didáctica propuesta | Estado |
| --- | --- | --- |
| Producto | Placa de montaje mecanizada de aluminio | Supuesto didáctico; aleación y plano no definidos |
| Dimensiones nominales | 52 × 38 × 13,5 mm | Supuesto didáctico; no se han medido en una pieza real |
| Taladros | Cuatro pasantes periféricos Ø5,0 mm y uno central Ø8,8 mm | Supuesto didáctico; posiciones y tolerancias del plano siguen pendientes |
| Variantes | Una sola referencia de producto | Supuesto didáctico para la primera puesta en marcha |
| Inspección inicial | Confirmar que los cinco taladros están presentes y visualmente abiertos, sin obstrucción evidente | Alcance propuesto; no es una medición dimensional |
| Defectos incluidos | Taladro ausente o visiblemente obstruido | Supuesto didáctico para preparar muestras NOK |
| Defectos excluidos | Diámetro, posición, rosca, rebaba fina, acabado, grietas, material y cualquier defecto no visible desde la cámara | Fuera del primer alcance; se revisará con muestras reales |

Las cotas se eligieron para dar escala al ejercicio y son compatibles aproximadamente con la pieza gráfica del simulador. No se deducen como medidas reales del modelo 3D. El dibujo, tolerancias, orientación de presentación y muestras límite deberán aprobarse antes de seleccionar óptica o iluminación.

### 2.2 Decisión de inspección

Para el primer caso, la cámara debe devolver `OK` cuando se identifican los cinco taladros y `NOK` si falta o está visiblemente obstruido cualquiera de ellos. La célula no promete medir diámetros ni sustituir un calibre. Los criterios se limitarán a esta regla para que los resultados puedan explicarse y probarse con muestras conocidas.

## 3. Operación y objetivos de producción

### 3.1 Supuestos de operación

- Un turno de 8 horas al día, 5 días por semana.
- Objetivo de capacidad: **5 piezas por minuto** en régimen estable, equivalente a un intervalo medio de 12 s entre piezas.
- El objetivo no incluye la carga manual del cargador, vaciado de contenedores, pausas planificadas ni resolución de atascos. El tiempo de ciclo real y la disponibilidad se medirán en una máquina construida; los tiempos del simulador no sirven para demostrar este objetivo.
- El operador carga hasta **7 piezas** en el cargador y coloca contenedores vacíos en A y B. La pila de siete es también el lote gráfico del simulador, no una limitación de producción aprobada.
- Capacidad propuesta de cada contenedor: **25 piezas**. El operador los vacía o cambia; no se presupone sensor de contenedor lleno en esta etapa.
- Una referencia de producto, alimentación manual por lote, descarga manual y sin enlace de control con otras máquinas.
- El HMI de operador estará en español. La documentación del proyecto se entregará en español e inglés.

El objetivo de 5 piezas/minuto es una meta inicial para analizar el presupuesto de ciclo, no una prestación ya alcanzada. Si el tiempo de visión, la mecánica o la manipulación no permiten sostenerla, se debe revisar el requisito con los resultados del piloto.

### 3.2 Flujo esperado

1. El operador confirma que la zona está despejada, carga piezas y coloca los contenedores A/B.
2. Selecciona `AUTO` para procesar de forma continua mientras haya producto, o `PIEZA` para solicitar una unidad con `START`.
3. El alimentador presenta una pieza en la cinta y esta llega a inspección.
4. La cinta se detiene para la adquisición. El PLC activa el trigger de cámara y espera una respuesta válida.
5. Una pieza `OK` se dirige a A; una pieza `NOK` se dirige a B.
6. El sistema confirma la salida, incrementa el contador correspondiente y genera un registro por pieza.
7. `FIN DE PIEZA` solicita detenerse una vez completada la pieza en curso. El rearme/reset se realiza con la máquina parada, según la interfaz finalmente aprobada.

Este flujo describe el caso que se diseñará. La secuencia y mandos que actualmente representa el HTML se enumeran por separado en la sección 8 para no confundir comportamiento simulado con requisito físico validado.

## 4. Requisitos preliminares y aceptación propuesta

Los criterios siguientes son una **base de revisión didáctica**, no aceptación firmada. “Piloto” significa una prueba controlada con muestras identificadas; no implica certificación ni capacidad estadística de producción.

| ID | Requisito propuesto | Criterio de aceptación inicial | Estado / evidencia necesaria |
| --- | --- | --- | --- |
| REQ-001 | Procesar una placa por ciclo, con orientación repetible. | 100 ciclos consecutivos sin doble alimentación ni pérdida de la pieza; inspección visual de la orientación. | Supuesto didáctico; probar con alimentador físico y muestras reales. |
| REQ-002 | Detectar taladros ausentes o visiblemente obstruidos dentro del alcance definido. | Con 100 muestras NOK preparadas y etiquetadas (50 con taladro ausente y 50 con taladro obstruido), se rechazan las 100; con 100 muestras buenas, se aceptan al menos 98. | Meta de piloto didáctico; validar representatividad, falsos rechazos y falsos aceptados. No es garantía estadística de producción. |
| REQ-003 | Enrutar automáticamente cada resultado. | Todos los resultados OK confirmados llegan a A; todos los NOK confirmados llegan a B, sin cruce en la prueba de aceptación. | La ruta coincide con el simulador; el criterio físico requiere prueba de transferencia. |
| REQ-004 | Sostener el objetivo de producción propuesto. | Promedio de al menos 5 piezas/min durante 30 min de operación estable, excluyendo recargas y paradas planificadas; informar paradas y piezas. | Supuesto didáctico; medir en FAT/SAT, no inferirlo de la animación. |
| REQ-005 | Proporcionar modos AUTO y PIEZA. | AUTO continúa mientras exista demanda y no haya una orden válida de fin; PIEZA completa una unidad por START. | Requisito didáctico; validar con operador. |
| REQ-006 | FIN DE PIEZA termina el ciclo en curso y evita iniciar otro. | Si se solicita durante un ciclo, la unidad actual llega a una salida registrada y no comienza la siguiente. | SIM: clic en las siete fases y en el intervalo evita iniciar otra pieza; se conserva el intervalo de 0,9 s. Prueba física pendiente. |
| REQ-007 | Mostrar al operador estado, modo, resultado y contadores. | HMI muestra READY/RUN/FAULT, modo, estado del ciclo, OK, NOK y total; alarmas legibles. | Contenido base tomado del simulador; textos finales por revisar. |
| REQ-008 | Registrar cada pieza en un sistema externo de trazabilidad. | Una fila por pieza con ID de lote, número de pieza, fecha/hora, referencia, receta/job de cámara, resultado, código de resultado y destino; retención mínima de 30 días. | Supuesto didáctico. No existe DB/gateway conectado; campos, sincronización y método de escritura por definir en diseño. |
| REQ-009 | Intercambiar trigger y resultado con una cámara de visión. | La secuencia conceptual debe distinguir `Trigger`, `Ready`, `Busy`, `Complete`, `ResultValid`, `ResultOK`, `ResultCode` y reconocimiento (`Ack`); timeout o resultado inválido inhibe la clasificación normal y genera diagnóstico definido en diseño. | Necesidad propuesta; modelo, protocolo, handshake y respuesta ante fallo se concretarán con hardware seleccionado. |
| REQ-010 | Emplear una plataforma PLC común para el ejercicio. | Documentar programa y pruebas para Siemens TIA Portal y familia S7-1200; separar interfaz de HMI, visión y datos. | Supuesto didáctico de plataforma; CPU, firmware, HMI y licencias se elegirán en documento 03. |
| REQ-011 | Diseñar con alimentación de control de 24 VDC y aire comprimido. | Inventariar cargas y verificar tensión, corriente, presión y calidad del aire durante diseño y FAT. | Base provisional: control 24 VDC y aire seco filtrado a 6 bar; alimentación de potencia y consumo aún sin cálculo. |
| REQ-012 | Operar en interior, sin lavado a presión. | Piloto dentro de 10–35 °C, sin condensación ni exposición directa a intemperie. | Supuesto didáctico; grado IP, humedad, polvo y temperatura final requieren confirmar el emplazamiento. |
| REQ-013 | Permitir recuperar la operación después de una alarma. | La alarma identifica condición y estado; el operador corrige la causa y rearma de acuerdo con el procedimiento aprobado, sin perder registros ya confirmados. | Necesidad propuesta; las causas de proceso y la estrategia de recuperación se especificarán después. |
| REQ-014 | Definir Safety antes de congelar el diseño. | Evaluación de riesgos documentada para acceso, atrapamiento, expulsor, energía neumática, atascos y mantenimiento; medidas y validación establecidas por personas competentes. | Obligatorio como trabajo futuro. No se fija PLr/SIL ni se acepta `SafetyReady` como evidencia. |
| REQ-015 | Proporcionar documentación y puesta en marcha reproducibles. | FAT registra configuración, muestras, resultados, alarmas, recuperación y trazabilidad; SAT repite las pruebas de integración en el emplazamiento. | Esqueleto propuesto; responsables y formularios se definirán en documento 07. |

## 5. Interfaces de visión y trazabilidad

### 5.1 Intercambio con la cámara

El caso propone una cámara inteligente **Cognex**, sin fijar todavía modelo, lente, iluminación o protocolo. El PLC deberá solicitar una captura después de confirmar la presencia y posición de pieza. La interfaz conceptual deberá distinguir, como mínimo:

- PLC → cámara: selección de receta/job, trigger y número de pieza/lote si el equipo lo admite.
- Cámara → PLC: ready, busy, complete, resultado válido, resultado OK/NOK y código de resultado.
- PLC ↔ cámara: reconocimiento o limpieza del resultado anterior para evitar reutilizar una respuesta vieja.
- Diagnóstico: tiempo de espera, pérdida de comunicación, receta no disponible o respuesta inválida; la conducta de recuperación se diseña y prueba antes de la aceptación.

“Trigger” no queda fijado como una entrada eléctrica dedicada: podrá ser E/S discreta o una orden por red según el modelo seleccionado. Los nombres anteriores describen contenido de la interfaz, no tags asignados ni direcciones físicas. El mapa definitivo y los tipos se documentarán en los documentos de hardware y arquitectura PLC.

### 5.2 Registro electrónico externo

El caso requiere un registro electrónico por pieza con **retención mínima propuesta de 30 días**. La base puede ser un servicio SQL externo accesible a través de un gateway/servicio de planta; el PLC no se considera cliente SQL directo. El transporte, servidor, formato, sincronización horaria, política ante desconexión y responsable de administrar la base quedan abiertos para el diseño de integración. No se almacenan imágenes en la propuesta inicial.

El registro mínimo propuesto es: `batch_id`, `piece_index`, `timestamp`, `product_id`, `vision_job`, `inspection_result`, `result_code`, `destination` y `machine_state`. Cada ID debe permitir relacionar la respuesta de la cámara, el contador del PLC y la salida física. Una escritura fallida debe generar un estado/diagnóstico verificable y una política acordada; no se debe marcar un registro como guardado si no se confirmó su persistencia.

## 6. Plataforma, servicios y entorno asumidos

| Área | Decisión base del caso | Lo que todavía no significa |
| --- | --- | --- |
| PLC | Siemens S7-1200, programado en TIA Portal | No hay CPU, versión, módulos ni proyecto real seleccionados. |
| HMI | Panel Siemens para operación local, interfaz en español | No hay tamaño/modelo, número de pantallas ni compra aprobada. |
| Visión | Smart camera Cognex, una receta inicial para la placa | No hay cámara/lente/luz seleccionadas ni inspección implementada. |
| Control eléctrico | Circuitos de control de 24 VDC | No hay esquema, cálculo de consumo, protección ni asignación de bornes. |
| Neumática | Aire seco filtrado; 6 bar como presión nominal didáctica | No hay cálculo de caudal, cilindro, válvulas ni dimensionamiento. |
| Suministro de potencia | Red industrial del emplazamiento por confirmar | No se fija tensión/fases/potencia de entrada sin conocer motores y normativa local. |
| Datos | Servicio de base de datos externo con gateway de integración | No se elige fabricante, motor, red, API ni servidor. |
| Ambiente | Interior, 10–35 °C, sin lavado a presión | No se declara clasificación IP ni compatibilidad ambiental industrial. |

Las decisiones de esta tabla dan un punto de partida compartido. La selección y dimensionamiento se justifican después, a partir del plano de pieza, análisis de ciclo, cálculo de cargas y revisión de Safety.

## 7. Safety y límites de responsabilidad

El proyecto deberá evaluar, como mínimo, acceso a cinta y alimentador, movimiento del expulsor, posibles puntos de atrapamiento, energía neumática almacenada, recuperación de atascos y tareas de limpieza/mantenimiento. La evaluación determinará medidas, distancias, arquitectura, nivel requerido y validación conforme a la normativa aplicable al emplazamiento.

Este brief no elige un nivel PLr/SIL, no declara conformidad, no convierte resguardos gráficos en resguardos certificados y no aprueba una solución Safety. `SafetyReady` en el simulador es una señal conceptual fija; no representa un circuito de seguridad. Ningún valor de este caso didáctico sustituye una evaluación realizada por personas competentes.

## 8. Hechos del simulador y límites de evidencia

El HTML actual sirve para observar un modelo gráfico y su lógica simulada. Concretamente:

- La demostración presenta un lote fijo de siete resultados: `OK, NOK, OK, NOK, OK, OK, NOK` (cuatro OK y tres NOK). Es una secuencia de prueba de rutas, no una tasa esperada de defectos.
- La ruta representada es `OK → A` por expulsor lateral y `NOK → B` al final de la cinta.
- `AUTO` recorre el lote; `PIEZA` permite solicitar una unidad con START; `FIN DE PIEZA` termina la pieza en curso antes de detenerse.
- La cámara no captura ni analiza imágenes. El resultado procede de la secuencia didáctica programada.
- La geometría, dimensiones, trayectorias y tiempos del HTML son visualización/temporización del modelo. No son tolerancias, capacidad, fuerza, respuesta ni rendimiento físico medido.
- PLC Watch contiene señales conceptuales; no hay direcciones I/Q, CPU, DB físicos ni conexión a PLC.
- No existe cámara Cognex conectada, servicio externo de datos, DB persistente, receta real ni trazabilidad activa.
- La interfaz incluye estados de operación, diagnóstico y permiso Safety conceptual; ninguno constituye una validación de máquina.

Cuando este documento dice “criterio del simulador”, solo significa que el comportamiento visible puede observarse en la demostración. No demuestra cumplimiento de una prueba física.

## 9. Fuera del alcance de este primer brief

- Fabricar una máquina o liberar dibujos para construcción.
- Determinar tolerancias finales sin plano del producto ni acuerdo de calidad.
- Prometer que 5 piezas/minuto, la tasa de detección o la disponibilidad ya se han alcanzado.
- Seleccionar modelos de PLC, HMI, cámara, lente, iluminación, motor, válvulas o protecciones.
- Asignar direcciones de E/S, declarar tags existentes en TIA o conectar una DB.
- Escribir/validar el programa PLC, implementar comunicaciones o desarrollar una aplicación de trazabilidad.
- Definir, certificar o validar funciones de Safety a partir del simulador.

## 10. Decisiones aprobadas para el caso didáctico

D2R aprobó las once decisiones siguientes como base común para desarrollar el ejercicio. La aprobación cierra la revisión didáctica del brief; no transforma las hipótesis en requisitos de un cliente real ni en datos para fabricar. Si se aportan datos auténticos, se revisarán antes del diseño físico:

| Ref. | Base didáctica aprobada | Estado / límite |
| --- | --- | --- |
| D-00-01 | Placa de aluminio 52 × 38 × 13,5 mm; cinco taladros como se describe en §2. | Aprobada como geometría didáctica; plano real pendiente si se aporta. |
| D-00-02 | Visión limita la primera versión a detectar taladro ausente/obstruido; sin metrología. | Aprobada como alcance; validar con muestras reales antes de producción. |
| D-00-03 | Meta inicial 5 piezas/minuto y un turno de 8 h, 5 días/semana. | Aprobada como objetivo de ejercicio; rendimiento real pendiente de FAT/SAT. |
| D-00-04 | Cargador manual de hasta 7; contenedores A/B de 25. | Aprobada como supuesto de manejo; sensores y procedimientos pendientes. |
| D-00-05 | Prueba de visión: 100 buenas con ≥98 aceptadas y 100 NOK con 100 rechazadas. | Aprobada como criterio piloto; no demuestra capacidad estadística de producción. |
| D-00-06 | Cognex como hipótesis de familia; protocolo/modelo pendientes. | Aprobada como hipótesis educativa; modelo no seleccionado. |
| D-00-07 | Registro por pieza, retención 30 días, sin guardar imágenes. | Aprobada como necesidad didáctica; servicio y política de datos pendientes. |
| D-00-08 | Gateway hacia DB externa; servicio externo no especificado. | Aprobada como separación conceptual; tecnología de integración pendiente. |
| D-00-09 | Siemens S7-1200/TIA Portal como plataforma de enseñanza. | Aprobada para el ejercicio; CPU y versiones pendientes de documento 03. |
| D-00-10 | Control 24 VDC, aire a 6 bar; interior 10–35 °C, no washdown. | Aprobada como condición provisional didáctica; emplazamiento real pendiente. |
| D-00-11 | Evaluación de riesgos antes de cerrar diseño; sin PLr/SIL prefijado. | Aprobada como puerta obligatoria; no asigna PLr/SIL ni certifica una solución. |

## 11. Cierre y puerta de revisión

**Estado del brief:** base didáctica aprobada por D2R; no es una especificación contractual ni física.
**Aprobación de cliente real:** no aplica; el cliente es ficticio.
**Revisión didáctica D2R:** aprobada para desarrollar el ejercicio; validación con cliente/emplazamiento real no aplica todavía.
**Siguiente documento:** [02 · Diseño mecánico, eléctrico y neumático](reader.html?doc=02&embedded=1&lang=es). El documento 01 fue aprobado como especificación didáctica; sus criterios de simulador pendientes se indican allí.
