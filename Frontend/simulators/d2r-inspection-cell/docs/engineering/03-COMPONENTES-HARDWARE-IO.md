# 03 · Componentes, hardware y mapa de E/S

**Versión:** 0.4 · tags cotejados con el prototipo
**Estado:** revisión D2R validada para uso didáctico · selección física y direcciones pendientes
**Objetivo:** traducir las funciones de la célula a una lista trazable de señales y equipos candidatos, sin confundir el Watch del simulador con una configuración PLC.

## 1. Alcance y fuente de verdad

Este documento distingue cuatro niveles:

| Nivel | Propietario previsto | Estado actual |
| --- | --- | --- |
| Animación y lógica didáctica | HTML del simulador | Implementado en software; los sensores y actuadores son proxies gráficos. |
| E/S de campo | PLC y dispositivos físicos | No implementadas ni cableadas. El HTML publica 7 tags DI y 4 DO en el Watch; no confirma canales físicos. |
| Inspección | Cámara Cognex como candidata | No hay cámara conectada ni handshake real. Cognex sigue siendo una posibilidad del caso. |
| HMI y trazabilidad | HMI más gateway/servicio de datos | HMI solo simulada. Gateway y base de datos externa propuestos, sin conexión. |

Los nombres `DI_`, `DO_` y `DB_` son identificadores del Watch del HTML. No asignan direcciones `%I`/`%Q`, no prueban que exista un DB de TIA y no describen señales medidas. El registro fuente del prototipo es `registry` para DI/DO/estados y `processRegistry` para valores numéricos.

La clasificación permanece como en el simulador: **OK → A** y **NOK → B**. La lista no altera fases, tiempos, contadores, señales ni Safety.

## 2. Tags DI/DO simulados

Los 7 tags DI y 4 DO del registro son BOOL lógicos del simulador. Sus valores se derivan de fases y órdenes internas; no confirman sensores, válvulas ni canales instalados. El nivel eléctrico, el dispositivo, el borne y la dirección física se definirán al seleccionar equipos y módulos.

### Tags DI · 7

| Tag | Función de campo que habría que resolver | Valor generado por el HTML | Decisión física pendiente |
| --- | --- | --- | --- |
| `DI_MagazinePart` | Detectar pieza en la salida del cargador; sensor de presencia candidato, sujeto a geometría y material. | BOOL: 1 mientras `FEED`; lo genera la fase, no un sensor. | Posición, tecnología final y diagnóstico; validar detección sobre aluminio. |
| `DI_InspectionPresent` | Confirmar pieza en la estación; fotocélula candidata, a validar con la superficie y el montaje. | BOOL: 1 durante `INSPECT`. | Modelo, soporte, repetibilidad, filtro y prevención de reflejos falsos. |
| `DI_RejectPosition` | Detectar la pieza detenida antes de clasificar. | BOOL: 1 en `SORT_STOP` y durante todo el empuje OK, incluso mientras la pieza se desplaza; es un proxy de fase, no una confirmación de presencia. | Definir punto de detección y cuándo debe liberarse; no copiar el proxy como comportamiento de sensor físico. |
| `DI_PusherRetracted` | Confirmar carro del expulsor en reposo. | BOOL: 1 salvo durante empuje y retorno; calculado por fase. | Sensor de fin de carrera y posición de montaje. |
| `DI_PusherExtended` | Confirmar expulsor extendido. | BOOL: 1 al final de extensión y en el primer tramo del retorno; calculado por fase. | Punto de actuación, histéresis y diagnóstico. |
| `DI_ExitA` | Detectar llegada de la pieza a la salida A. | BOOL: 1 durante toda la fase `PUSH_RETRACT` OK, mientras la pieza recorre la rampa; no espera a que llegue al extremo. | Ubicación, condición de llegada y criterio de conteo por evento. |
| `DI_ExitB` | Detectar llegada de la pieza a la salida B. | BOOL: 1 durante la fase `PUSH_RETRACT` NOK; el modelo coloca la pieza en B, pero el valor sigue derivado de la fase. | Ubicación, condición de llegada y criterio de conteo por evento. |

### Tags DO · 4

| Tag | Función de campo prevista | Valor generado por el HTML | Decisión física pendiente |
| --- | --- | --- | --- |
| `DO_ConveyorRun` | Petición de marcha a la interfaz del accionamiento; no alimenta directamente un motor. | BOOL: 1 en transporte y en el avance NOK hacia B. | Drive, interfaz eléctrica/red, permisos y realimentación. |
| `DO_FeederValve` | Orden lógica del actuador del alimentador. | BOOL: 1 durante `FEED` mientras `q < 0.85`; abarca avance, retorno y parte del descenso gráfico. | **Interfaz abierta:** no representa órdenes físicas separadas de avance/retorno. Definir válvula, salidas y secuencia antes de seleccionar hardware. |
| `DO_PusherValve` | Orden lógica del expulsor lateral A. | BOOL: 1 durante `DISCHARGE` y `PUSH_RETRACT` OK. | **Interfaz abierta:** un solo BOOL no diferencia avance y retorno. Acordar semántica y número de salidas antes de elegir válvula o asignar canal. |
| `DO_VisionTrigger` | Solicitud de captura a la cámara. | BOOL: 1 durante `INSPECT`; no dispara equipo físico. | Trigger discreto o comando de red, polaridad y confirmación. |

Para los dos finales del cilindro pueden evaluarse sensores magnéticos si el actuador seleccionado admite imán en el émbolo. Las detecciones de pieza pueden requerir fotocélulas, pero se deben validar con muestras y geometría reales. Las DI del modelo representan fases, no sensores montados. La lista física deberá convertir cada función en dispositivo, ubicación, señal eléctrica, canal, borne, filtro/diagnóstico y prueba de aceptación.

## 3. Estados lógicos de inspección y Safety

Estos BOOL del Watch no están incluidos en las 7 DI/4 DO y no deben sumarse a módulos como si ya fueran bornes.

| Tag | Comportamiento exacto del modelo | Tratamiento en una integración futura |
| --- | --- | --- |
| `VisionReady` | Constante `true`. | Estado de cámara real por definir; no es una confirmación física actual. |
| `InspectionDone` | `true` desde la fase posterior a `INSPECT`. | Estado de protocolo futuro; definir pulso/nivel, reset y asociación a pieza. |
| `InspectionValid` | Igual que `InspectionDone`: `true` desde la fase posterior a `INSPECT`. | No hay comprobación de validez independiente en el prototipo; definirla con el handshake seleccionado. |
| `VisionOK` | Resultado del lote fijo, asignado por la simulación al completar la inspección. | Resultado de visión que el PLC deberá validar y asociar a la pieza. No representa todos los defectos ni una Cognex conectada. |
| `SafetyReady` | Constante `true` y señalada como virtual en el Watch. | No se cablea ni se usa como función Safety. La arquitectura Safety se mantiene separada y requiere su evaluación propia. |

En el HTML, `InspectionDone` e `InspectionValid` permanecen a 1 desde la fase 3 hasta el final de la pieza; no existe handshake externo, confirmación `ACK` ni código de error Cognex. El comportamiento de resultado inválido o cámara sin respuesta queda pendiente de definición en el proyecto de PLC.

## 4. Valores numéricos del Watch

Son monitorización derivada del estado gráfico, no canales de E/S. El prefijo `DB_` conserva el nombre didáctico, pero aún no define el bloque ni el tipo de dato de un DB de TIA.

| Tag | Tipo Watch | Valor/fórmula actual | Unidad visible y límite |
| --- | --- | --- | --- |
| `DB_SequenceStep` | INT | `0` detenido o entre piezas; durante fase activa: índice de fase × 10 + 10. | Código didáctico, no enum de PLC. |
| `DB_PieceIndex` | INT | Índice del lote + 1 mientras `running`; 0 detenido antes de iniciar. | En un intervalo puede identificar el siguiente índice lógico. |
| `DB_CountOK` | DINT | Contador acumulado de rutas OK completadas. | Piezas del lote virtual. |
| `DB_CountNOK` | DINT | Contador acumulado de rutas NOK completadas. | Piezas del lote virtual. |
| `DB_CountTotal` | DINT | `DB_CountOK + DB_CountNOK`. | Total contabilizado en la simulación. |
| `DB_BeltSpeed` | REAL | `0.10` si `DO_ConveyorRun` vale 1; en otro caso `0`. | m/s mostrado; valor fijo didáctico, no medido. |
| `DB_PieceX` | REAL | Si la pieza es visible: limitar `(piece.x + 3) × 800 / 7.15` a 0…800; si no, 0. | mm mostrados; conversión de coordenada gráfica no calibrada. |
| `DB_PusherPos` | REAL | Limitar `abs(arm.z) / 1.48 × 200` a 0…200. | mm mostrados; escala normalizada, no carrera física calibrada. |
| `DB_StageElapsed` | TIME | 0 sin fase activa; durante una fase, `elapsed × 1000`. | Watch presenta ms; reloj del navegador, no tiempo de PLC medido. |

Conservar nombres, tipos y unidades visibles existentes. Antes de mapear a TIA, decidir resolución, rangos, precisión, escalado, retención y tratamiento de desbordamiento; en particular, no interpretar `DB_PieceX` ni `DB_PusherPos` como cotas reales.

## 5. Arquitectura propuesta de Cognex y datos externos

La siguiente separación es una arquitectura didáctica futura, no una conexión existente:

| Datos | Propietario | Función | Estado |
| --- | --- | --- | --- |
| Job/receta y parámetros de inspección | Cámara | Configuración de visión del dispositivo. | Modelo, contenido y gestión de versiones pendientes. |
| DB de intercambio PLC-cámara | PLC | Trigger, identificación de pieza, estados, resultado, diagnóstico y confirmación según protocolo. | Estructura y transporte pendientes. |
| Registro electrónico externo | Gateway/servicio de datos | Trazabilidad de pieza, resultado y eventos aceptados. | Tecnología, contrato, red, retención y responsable pendientes. |
| Presentación al operador | HMI | Estado, resultado, alarmas y acciones autorizadas. | Solo panel HTML simulado; plataforma y usuarios pendientes. |

Flujo objetivo a definir: el PLC solicita captura de la pieza detenida; la cámara procesa y publica estado/resultado; el PLC acepta una respuesta válida una sola vez y la asocia al índice o identificador de pieza; el gateway registra el resultado confirmado y la HMI presenta el estado. No elegir todavía nombres de campos, protocolo, DB Cognex o tecnología de base de datos.

No asumir conexión SQL directa del PLC. `DO_VisionTrigger`, `VisionReady`, `InspectionDone`, `InspectionValid` y `VisionOK` del prototipo son señales lógicas simplificadas; `Busy`, `ACK`, errores, número de pieza y datos de trazabilidad aún no existen en el HTML. El contrato y la recuperación ante pérdida de comunicación se cerrarán al seleccionar equipo y desarrollar el documento 06.

## 6. Inventario de señales y lista de materiales de trabajo

El registro del HTML contiene **7 tags DI y 4 tags DO**. Las señales lógicas adicionales de cámara y Safety no forman parte de ese conteo. Estas cifras describen el Watch del simulador, no el número de bornes ni el tamaño de los módulos.

No se fija aquí una reserva de canales ni una capacidad instalada. Antes de dimensionar E/S físicas se deben resolver las interfaces de cámara y accionamiento, las órdenes necesarias para las válvulas, el mantenimiento y las ampliaciones. Después se redondeará al tamaño de módulo disponible y se documentará cualquier reserva como una decisión explícita del proyecto.

| Partida | Qué determina la selección | Estado del caso |
| --- | --- | --- |
| CPU PLC y versión TIA | Ciclo, memoria, comunicaciones, diagnóstico, ciclo de vida y estándares de planta. | S7-1200 solo candidato didáctico del esquema; modelo y versión sin seleccionar. |
| E/S estándar | Dispositivos confirmados, nivel eléctrico, tipo de salida, aislamiento y reserva acordada. | 7 tags DI y 4 tags DO lógicos en el HTML; canales, módulos, direcciones y reserva física pendientes. |
| E/S/CPU Safety | Resultados de evaluación de riesgos y requisitos de Safety. | Sin dimensionar; no inferir desde `SafetyReady`. |
| Fuente y armario | Tensiones de planta, corrientes de carga, ambiente, IP, temperatura y disipación. | 24 VDC es supuesto didáctico; red y cargas no calculadas. |
| Motor, cinta y drive | Carga, velocidad, ciclo, frenado, régimen y estrategia de mando. | Sin dispositivo físico ni placa de cargas. |
| Cilindros, válvulas y sensores | Fuerza, carrera, ciclo, presión, caudal, puertos y confirmación requerida. | Geometría de pantalla solamente; el mando de retorno del expulsor sigue abierto. |
| Cámara, lente e iluminación | Defectos, piezas límite, campo de visión, exposición, interfaz y soporte. | Cognex es candidata de marca; no hay modelo, job ni conexión. |
| HMI y red | Pantallas, roles, idiomas, alarmas, mantenimiento, protocolos y ciberseguridad. | HMI web simulada; equipo y red industriales pendientes. |
| Gateway y base de datos | Propietario, contrato, identificador de pieza, retención, disponibilidad y red IT/OT. | Bloque conceptual; no hay servicio conectado. |

Esta tabla es una BOM de trabajo, no una lista de compra. No se asigna SKU sin datos del producto, proceso, instalación y requisitos de planta.

## 7. Direccionamiento y selección física

Este documento no asigna direcciones ni propone un mapa de canales. Las direcciones se obtendrán de la configuración de dispositivo una vez elegidos CPU, módulos, topología e interfaces de campo. El mapa controlado deberá relacionar cada tag con el dispositivo físico, tipo y nivel eléctrico, canal, borne, dirección y prueba de aceptación. No mapear `SafetyReady` a una E/S estándar ni usarla para representar un circuito Safety.

## 8. Datos requeridos antes de seleccionar modelos

1. Congelar pieza, material, masa, variación y criterios de aceptación de visión.
2. Confirmar ritmo, ciclo, tareas de operación, reposición, rechazo y mantenimiento.
3. Obtener tensión/fases de planta, corrientes disponibles, ambiente, IP, temperatura y longitudes de cable.
4. Cerrar la evaluación de riesgos y los requisitos de Safety antes de seleccionar controladores o E/S Safety.
5. Resolver sentidos de avance/retorno del expulsor y el interfaz del drive.
6. Elegir interfaz Cognex y definir propietario de job, handshake, resultado, diagnóstico y asociación a pieza.
7. Definir red IT/OT, gateway, esquema de datos, retención y disponibilidad de la base externa.
8. Seleccionar CPU y módulos; luego emitir lista de canales/direcciones TIA y BOM controlada.

## 9. Revisión y siguiente puerta

**Artefacto de esta etapa:** inventario del Watch de 7 tags DI, 4 tags DO, 5 estados lógicos y 9 valores numéricos, más una BOM de trabajo con datos de selección pendientes. No se ha emitido una lista de bornes, direcciones ni módulos físicos.
**Cotejo ejecutado:** lectura del `registry`, `processRegistry`, `refreshIO()` y `processValues()` del HTML; conteo de tags y fórmulas comparados con este documento. No se ejecutó PLC, TIA Portal, cámara, gateway ni base de datos.
**Pendiente de D2R:** validar que este mapa describe correctamente el caso didáctico.
**Siguiente documento:** 04 · Safety Engineering, antes de cerrar cualquier hardware o dirección Safety.
