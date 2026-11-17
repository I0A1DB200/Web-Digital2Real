# 01 · Especificación funcional

**Versión:** 0.3 · especificación didáctica aprobada por D2R
**Estado:** aprobación documental para el caso didáctico · varios criterios SIM siguen pendientes según §10 y §11; no es aprobación de máquina real
**Objetivo:** definir cómo debe operar el caso de la célula, qué interfaces intercambia y cómo se demostrará la aceptación, sin confundir el simulador con una máquina física.

> El caso de enseñanza usa supuestos ficticios aprobados por D2R para poder diseñar el ejercicio. No hay un cliente real, una especificación contractual, un PLC ejecutable ni hardware físico aceptado. Las duraciones y señales descritas como “simulador” son evidencia del modelo Three.js, no resultados de una máquina.

## 1. Base y trazabilidad

Esta especificación hereda el producto, el alcance de visión, el objetivo de 5 piezas/min, el cargador de hasta 7 piezas, los contenedores A/B de 25 piezas, la plataforma formativa Siemens S7-1200/TIA Portal, la cámara Cognex como hipótesis y el registro externo de 30 días del [documento 00](00-BRIEF-CLIENTE.md). Esos valores son **supuestos del caso didáctico**, no datos de un cliente real.

Los requisitos conservan sus identificadores `REQ-001` a `REQ-015` del brief. Esta especificación añade criterios verificables `TC-001` a `TC-019`. “SIM” significa observable en el HTML; “FAT” significa prueba controlada del equipo construido; “SAT” significa validación de integración en el emplazamiento. No se declara aprobado un criterio por el hecho de que exista una animación equivalente.

### Alcance de la función

- Incluye: alimentación individual, transporte, captura y decisión de inspección, clasificación automática `OK → A` / `NOK → B`, mandos de operación, diagnóstico, contadores y requisitos de trazabilidad.
- Excluye en esta etapa: selección de componentes y direcciones físicas, diseño de esquemas, programa TIA compilable, configuración Cognex, servicio de base de datos, dimensionamiento mecánico/neumático y validación de Safety.
- No se reintroduce la inyección artificial F01/F02. El panel Alarmas se conserva como interfaz; las futuras alarmas deben representar condiciones lógicas identificables.
- Esta revisión corrige el mando FIN DE PIEZA durante el intervalo entre ciclos. No altera fases, duraciones, señales, contadores, clasificación ni modelo conceptual de Safety.

## 2. Contexto funcional

| Actor o sistema | Función dentro del caso | Límite actual |
| --- | --- | --- |
| Operador | Carga el magazine, prepara contenedores A/B, selecciona modo, inicia/detiene y observa el HMI. | El simulador solo representa mandos; procedimiento físico y ergonomía pendientes. |
| Mantenimiento / commissioning | Observa estados, E/S, variables y alarmas; recupera el proceso mediante procedimiento aprobado. | PLC Watch muestra valores virtuales, no conexión online a CPU. |
| PLC de máquina (futuro) | Coordina alimentación, cinta, cámara, clasificación, contadores y registro por pieza. | En el caso se propone S7-1200/TIA; no existe proyecto ni CPU seleccionada. |
| Cámara Cognex (futura) | Recibe trigger y job; devuelve validez, clasificación y diagnóstico. | Marca propuesta; modelo, óptica, protocolo y handshake pendientes. |
| Servicio/gateway de trazabilidad | Guarda un registro por pieza en base externa con retención de 30 días. | No hay gateway, DB, servidor ni enlace de datos activo. |
| Funciones Safety | Reducen el riesgo de acuerdo con evaluación independiente. | Fuera de la lógica estándar de esta especificación; requiere evaluación y validación competentes. |

La célula se considera autónoma, con carga y descarga manual y una sola referencia. La propuesta es procesar en AUTO mientras haya piezas y capacidad de recepción; el comportamiento al vaciar el cargador o llenar un contenedor se deja como decisión funcional porque no se han definido sensores ni permisos de acceso.

## 3. Modos, mandos y prioridad

| Mando | Comportamiento requerido para el caso físico | Comportamiento observado en el simulador | Límite / decisión |
| --- | --- | --- | --- |
| `START` | Inicia solo desde estado preparado y con permisos de arranque satisfechos. AUTO continúa; PIEZA solicita una unidad. | Deshabilitado durante `running`; después de completar el lote de 7, una nueva orden reinicia el lote del simulador y comienza de nuevo. | Lista y evaluación de permisos físicos se definen en diseño. |
| `AUTO` | Procesa unidades sucesivas mientras exista producto y destino disponible. | Procesa el lote didáctico predefinido de siete resultados. | No representa magazine infinito ni reposición durante marcha. |
| `PIEZA` | Cada orden START solicita una pieza; otra pieza requiere una nueva orden. | Inicia una pieza y detiene la secuencia al terminarla. | El caso físico necesita política para órdenes repetidas y pieza pendiente. |
| `FIN DE PIEZA` / STOP | Solicita terminar la pieza activa y no iniciar otra. No es parada inmediata. | En fase activa, completa la pieza; en el intervalo, espera los 0,9 s originales y se detiene antes de alimentar la siguiente. | SIM verificado en §9/§11; no se afirma parada de emergencia. |
| `RESET HMI` | Solo disponible con máquina detenida; limpia el estado operativo según el procedimiento, sin rearranque. | Deshabilitado mientras `running`; a máquina detenida restablece el lote y contadores del modelo, y cierra el panel abierto. | Retención de contadores y tratamiento de alarmas reales requieren definición. No resetea Safety. |
| `PAUSA` del simulador | No se traslada como una función de máquina sin definir su comportamiento y evaluar riesgos. | Congela reloj lógico y movimiento mientras `paused`; el render continúa. Reanudar sigue desde el mismo estado. | Es control del entorno de demostración, no una función Safety ni una parada física. |
| `RESET SIM` | Sin equivalente como mando de máquina. | Reinicia escena, lote, contadores y estado desde cualquier fase. | Control de laboratorio únicamente. |
| Cambio AUTO/PIEZA | Solo permitido en estado detenido/preparado. | El botón se bloquea durante `running`. | Definir el tratamiento de modo solicitado durante un ciclo en la HMI real. |

El orden conceptual de control estándar es adquirir entradas, validar comunicaciones/permisos, aceptar mandos, actualizar la secuencia, calcular salidas y publicar diagnóstico. Este orden no implementa ni reemplaza las funciones Safety.

## 4. Secuencia normal de ciclo

### 4.1 Fases del prototipo

La tabla registra los valores presentes en el HTML. Las duraciones son segundos del reloj de simulación y no son consignas para el diseño físico.

| Paso | Duración simulada | Acción observada | E/S virtuales relevantes | Salida de fase |
| --- | ---: | --- | --- | --- |
| Preparado | — | Espera START; pieza inicial visible y lote armado. | Salidas de movimiento a 0. | READY. |
| `FEED` | 0,8 s | Empuja la pieza inferior desde el magazine; la animación desplaza la pila visual. | `DO_FeederValve` activo durante la primera parte; `DI_MagazinePart` derivado de la fase. | Una pieza sobre la cinta. |
| `TRAVEL_VISION` | 2,2 s | Cinta transporta la pieza a la cámara. | `DO_ConveyorRun=1`. | Posición de inspección. |
| `INSPECT` | 1,5 s | Cinta detenida; se mantiene el trigger lógico de cámara durante la fase. | `DO_ConveyorRun=0`, `DO_VisionTrigger=1`, `DI_InspectionPresent=1`, `VisionReady=1`. | Al terminar la fase, se asigna el resultado de la secuencia del lote. |
| `TRAVEL_SORT` | 1,9 s | Cinta transporta la pieza a clasificación. | `DO_ConveyorRun=1`; `InspectionDone` y `InspectionValid` simulados. | Llegada a clasificación. |
| `SORT_STOP` | 0,5 s | Pieza y cinta detenidas antes de desviar. | `DI_RejectPosition=1`; cinta parada. | Posición estable de transferencia. |
| `DISCHARGE` | 2,2 s | Si OK, el expulsor desplaza la pieza hacia A. Si NOK, la cinta la lleva hacia B. | OK: `DO_PusherValve=1`, cinta 0. NOK: `DO_ConveyorRun=1`, expulsor 0. | Pieza fuera de la posición de clasificación. |
| `PUSH_RETRACT` | 1,1 s | OK: retorna el expulsor y la pieza baja por A. NOK: finaliza avance a B. | OK: `DO_PusherValve=1`, `DI_ExitA=1` durante la fase de salida. NOK: `DI_ExitB=1` en la fase de salida. | Se incrementan índice y contador de resultado. |
| Entre piezas | 0,9 s | Espera gráfica antes de preparar la pieza siguiente. | El código usa estado de fase inactiva; `DB_SequenceStep=0`. | Siguiente FEED o parada solicitada. |

Los siete tiempos de fase suman 10,2 s de reloj simulado; el intervalo entre ciclos añade 0,9 s entre unidades no terminales. Este cálculo solo describe el modelo. No demuestra 5 piezas/min, porque las animaciones, el reloj de navegador y el equipo físico no son equivalentes.

### 4.2 Transiciones de máquina física que deben diseñarse

La máquina real debe confirmar alimentación, llegada a inspección, captura válida, salida de cada ruta y posición del expulsor con señales seleccionadas. Las transiciones no se deben copiar como temporizadores fijos de la escena. Para cada movimiento se definirá timeout, confirmación, reacción ante discrepancia y recuperación en el diseño funcional detallado, hardware y Safety.

## 5. Inspección, clasificación y contadores

### Inspección

El caso aprobado define una placa de aluminio con cinco taladros y una inspección inicial limitada a detectar taladros ausentes o visiblemente obstruidos. La Cognex es una hipótesis de producto, no una cámara seleccionada. La regla objetivo es:

- `OK`: los cinco taladros definidos se identifican como presentes y abiertos.
- `NOK`: falta o está visiblemente obstruido cualquiera de los cinco.
- No se mide diámetro, posición, rosca, acabado ni otros defectos fuera del brief 00.

En el HTML no se analiza una imagen: `workpieceBatch` contiene `OK, NOK, OK, NOK, OK, OK, NOK`, y el resultado se asigna al finalizar la fase `INSPECT`. Es una secuencia determinista para comprobar dos rutas, no el resultado de visión artificial.

### Clasificación y producción

- `OK → A`: la cinta permanece parada durante `DISCHARGE`; el expulsor empuja por contacto y retorna durante `PUSH_RETRACT`.
- `NOK → B`: el expulsor permanece retraído; la cinta desplaza la pieza a la salida B.
- Los contadores `OK`, `NOK` y `TOTAL` se actualizan tras la fase terminal de salida del modelo. En equipo físico, el conteo se asociará a una salida confirmada y a un ID de pieza.
- La meta aprobada de 5 piezas/min se comprobará con prueba estable de 30 min excluyendo recargas y paradas planificadas (REQ-004); no se deduce de la secuencia HTML.
- La inspección piloto será 100 NOK preparadas (50 con taladro ausente y 50 obstruido), todas rechazadas, y 100 buenas con al menos 98 aceptadas (REQ-002). Es un criterio de piloto didáctico, no garantía de capacidad estadística de producción.

## 6. Señales y valores del PLC Watch

Los nombres siguientes son la interfaz conceptual actual del HTML. Las señales `DI`, `DO` y lógicas se calculan desde la fase, el resultado y las transformaciones visuales; no proceden de sensores, válvulas, motor ni cámara conectados. No se asignan direcciones físicas.

### Booleanos

| Grupo | Tag | Significado de pantalla | Fuente del valor en el simulador |
| --- | --- | --- | --- |
| DI | `DI_MagazinePart` | Pieza disponible en salida del cargador. | 1 durante `FEED`; estado derivado de fase. |
| DI | `DI_InspectionPresent` | Pieza en la estación de inspección. | 1 durante `INSPECT`. |
| DI | `DI_RejectPosition` | Pieza en la posición de clasificación. | 1 en `SORT_STOP` y en `DISCHARGE` OK. |
| DI | `DI_PusherRetracted` | Expulsor retraído. | 0 mientras empuja o retorna; calculado por fase. |
| DI | `DI_PusherExtended` | Expulsor extendido. | Ventana final de `DISCHARGE` OK y ventana inicial del retorno; no es un fin de carrera conectado. |
| DI | `DI_ExitA` | Salida A confirmada. | 1 durante la fase terminal OK. |
| DI | `DI_ExitB` | Salida B confirmada. | 1 durante la fase terminal NOK. |
| DO | `DO_ConveyorRun` | Orden virtual de cinta. | 1 en `TRAVEL_VISION`, `TRAVEL_SORT` y avance NOK a B. |
| DO | `DO_FeederValve` | Orden virtual del alimentador. | 1 durante la ventana inicial de `FEED` (hasta q < 0,85). |
| DO | `DO_PusherValve` | Orden virtual del expulsor. | 1 durante empuje OK y retorno OK. |
| DO | `DO_VisionTrigger` | Orden lógica de captura. | 1 durante toda la fase `INSPECT`, no un pulso de cámara real. |
| DB lógico | `VisionReady` | Cámara disponible. | Constante 1 en el modelo. |
| DB lógico | `InspectionDone` | Captura terminada. | 1 desde `TRAVEL_SORT` hasta completar la pieza. |
| DB lógico | `InspectionValid` | Resultado válido. | Igual que `InspectionDone` en el modelo; no valida calidad de comunicación. |
| DB lógico | `VisionOK` | Resultado de inspección OK. | Resultado del lote retenido desde la captura; no analiza píxeles. |
| DB lógico | `SafetyReady` | Permiso Safety conceptual. | Constante 1; no representa un sistema de seguridad. |

### Tipos numéricos

| Tag | Tipo | Unidad presentada | Cálculo o significado actual | Limitación |
| --- | --- | --- | --- | --- |
| `DB_SequenceStep` | INT | código de etapa | 0 sin fase activa; FEED=10, TRAVEL_VISION=20 … PUSH_RETRACT=70. | Código didáctico, no enum PLC aprobado. |
| `DB_PieceIndex` | INT | índice de pieza | `partIndex + (running ? 1 : 0)`. | En el intervalo puede indicar la siguiente pieza aunque aún no haya empezado. |
| `DB_CountOK` | DINT | piezas | Contador acumulado OK del lote. | Se reinicia con RESET HMI/SIM. |
| `DB_CountNOK` | DINT | piezas | Contador acumulado NOK del lote. | Se reinicia con RESET HMI/SIM. |
| `DB_CountTotal` | DINT | piezas | `DB_CountOK + DB_CountNOK`. | Total confirmado en el modelo, no trazabilidad persistente. |
| `DB_BeltSpeed` | REAL | m/s | 0 o 0,10 según `DO_ConveyorRun`. | Valor representativo, no velocidad medida. |
| `DB_PieceX` | REAL | mm | Escala ilustrativa de coordenada visual a 0…800 mm, limitada al tramo. | No está calibrada ni corresponde a una regla lineal real. |
| `DB_PusherPos` | REAL | mm | `abs(arm.position.z)/1,48 × 200`, limitado a 0…200. | Escala nominal de Watch, no carrera medida; conservar sin reinterpretar. |
| `DB_StageElapsed` | TIME | ms | Tiempo virtual de fase multiplicado por 1000. | Reloj del navegador/modelo, no reloj de CPU. |

Los nombres, tipos, unidades y escalados actuales se conservan como la interfaz del simulador. Si se crea un PLC real, la semántica y representación numérica se confirmarán en documentos 03 y 05 antes de asignar direcciones.

## 7. Interfaz de cámara y base externa

### Cámara

REQ-009 requiere trigger, disponibilidad, busy, fin, resultado válido, resultado y reconocimiento. El protocolo puede ser E/S discreta o Ethernet según cámara/modelo; job, timeout, número de reintentos y recuperación están pendientes de seleccionar con la Cognex real.

En caso de timeout, comunicación perdida, job incorrecto o resultado inválido, el comportamiento funcional propuesto es mantener la pieza en inspección, impedir usarla para una ruta normal e inhibir la siguiente alimentación hasta una acción de recuperación aprobada. Este comportamiento es una **propuesta de ingeniería pendiente**, no está implementado ni probado en el simulador y no define ninguna reacción Safety.

### Registro electrónico

REQ-008 exige una fila por pieza con `batch_id`, `piece_index`, `timestamp`, `product_id`, `vision_job`, `inspection_result`, `result_code`, `destination` y `machine_state`, retenida por al menos 30 días. Cada registro debe poder correlacionarse con el resultado, el contador y la salida física. La imagen no se almacena en la base inicial propuesta.

El gateway y la base externa son componentes futuros; el PLC no se considera cliente SQL directo. Deben definirse el protocolo de escritura, confirmación de persistencia, sincronización horaria, cola local, política si la red cae, duplicados, reintentos y comportamiento cuando el servicio no está disponible. Ninguna política concreta de buffer/parada se inventa en esta versión.

## 8. Alarmas, recuperación y límites de Safety

El HMI deberá exponer alarmas con identificador, causa, estado asociado, instante, acción requerida y condición de rearme. Para el diseño real se deberán especificar las condiciones de arranque no satisfechas, falta de confirmación, timeout de movimiento, comunicación/resultado de cámara, estado inválido y fallo de registro cuando sean aplicables. Son categorías a diseñar; esta especificación no las añade al programa actual ni afirma que se hayan producido.

En el HTML, el panel Alarmas muestra el evento/texto actual; no es un historial persistente ni diagnóstico de un equipo físico. Las señales virtuales son determinadas por el ciclo. No existe inyección F01/F02 ni cámara/gateway para generar fallos reales. No se ha verificado una secuencia física de reset/rearme.

`SafetyReady` permanece como señal conceptual del simulador. El caso físico requiere análisis de riesgos y funciones independientes de la lógica estándar; este documento no selecciona PLr/SIL, arquitectura, categoría de parada, resguardo ni validación. Las acciones de STOP ordinario, RESET HMI, pausa del navegador y RESET SIM no deben interpretarse como funciones Safety.

## 9. Criterios de aceptación y trazabilidad

Los criterios registran el estado de la evidencia disponible. Los casos SIM comprueban solo la presentación y lógica del HTML; no validan PLC ni máquina física. Las pruebas FAT/SAT se realizarán después de tener diseño, hardware y procedimiento aprobados.

| Caso | Requisito(s) | Criterio de aceptación | Nivel de evidencia | Estado actual |
| --- | --- | --- | --- | --- |
| `TC-001` Alimentación | REQ-001 | 100 ciclos físicos consecutivos con una sola pieza orientada correctamente por ciclo y sin pérdida/duplicado. | FAT / SIM solo para animación | Pendiente; no prueba física. |
| `TC-002` Visión piloto | REQ-002 | 100 NOK (50 ausencia, 50 obstrucción) rechazadas; ≥98 de 100 buenas aceptadas. | FAT con muestras identificadas | Pendiente; sin cámara real. |
| `TC-003` Clasificación | REQ-003 | Cada resultado OK confirmado llega a A; cada NOK confirmado llega a B; sin rutas cruzadas. | SIM / FAT / SAT | SIM PASS: AUTO registró 4 rutas A y 3 rutas B, sin cruce. Transferencia física FAT/SAT pendiente. |
| `TC-004` Capacidad | REQ-004 | ≥5 piezas/min en promedio durante 30 min estables, excluyendo recargas y paradas planificadas. | FAT / SAT con registro de conteos | Pendiente; el tiempo de simulación no lo acredita. |
| `TC-005` AUTO y PIEZA | REQ-005 | AUTO procesa unidades sucesivas mientras hay producto/destino; una orden PIEZA procesa exactamente una y requiere otra orden para continuar. | SIM para lote; FAT para ciclo real | SIM PASS: AUTO 7/7, 4 OK/3 NOK y rutas A/B correctas. PIEZA completó una unidad con el primer START, esperó detenido y avanzó exactamente una unidad con el segundo START. FAT pendiente. |
| `TC-006` FIN DE PIEZA | REQ-006 | Solicitar en cada fase finaliza la pieza en curso y no inicia la siguiente; si se solicita en el intervalo, no arranca la próxima. | SIM / FAT | SIM PASS: HMI FIN DE PIEZA se pulsó en las siete fases y durante `betweenCycles`; cada caso completó exactamente una pieza. FAT físico pendiente. |
| `TC-007` HMI | REQ-007 | HMI presenta estado, modo, ciclo, contadores y alarmas legibles; STOP muestra fin de pieza. | SIM / FAT con operador | Pendiente de revisión de contenido final. |
| `TC-008` Trazabilidad | REQ-008 | Una fila persistente y única por pieza con todos los campos; retención comprobada a 30 días. | FAT / prueba de sistema de datos | Pendiente; no hay servicio externo. |
| `TC-009` Handshake cámara | REQ-009 | Trigger, Ready/Busy/Complete/Valid/Result/Ack se asocian a la pieza correcta; timeout/resultado inválido no se enruta normalmente. | FAT | Pendiente; no hay Cognex conectada. |
| `TC-010` Plataforma PLC | REQ-010 | Proyecto de TIA compatible con CPU aprobada compila; E/S/diagnóstico se verifican online. | Revisión de proyecto / FAT | Pendiente; CPU no seleccionada. |
| `TC-011` Servicios | REQ-011 | Se verifican 24 VDC y aire seco filtrado nominal de 6 bar en condiciones de carga. | Diseño / FAT | Pendiente; no hay dimensionamiento. |
| `TC-012` Ambiente | REQ-012 | Operación piloto en 10–35 °C, interior, sin condensación ni lavado a presión. | SAT / registro ambiental | Pendiente; sitio no definido. |
| `TC-013` Alarmas y recuperación | REQ-013 | Para cada causa aprobada, alarma identifica causa; recuperación no pierde registros confirmados ni reinicia sin autorización. | FAT / SAT | Pendiente; causas/procedimientos no implementados. |
| `TC-014` Safety | REQ-014 | Evaluación de riesgos, medidas y validación documentadas por personal competente antes de liberar diseño. | Safety review independiente | Pendiente; `SafetyReady` no es evidencia. |
| `TC-015` FAT/SAT | REQ-015 | Protocolos registran versión, condiciones, muestras, resultados, incidencias, responsables y aceptación. | Revisión documental y pruebas | Pendiente; plantillas se desarrollan en documento 07. |
| `TC-016` RESET HMI | REQ-007 / REQ-013 | En RUN el RESET HMI está inhabilitado; detenido restablece el estado previsto, no provoca START ni abre diagnóstico. | SIM / FAT | Subprueba UI PASS: bloqueo en RUN y cierre del panel detenido. Falta comprobar el restablecimiento desde un estado detenido no inicial. |
| `TC-017` PAUSA simulador | Criterio de QA | Al pausar, fase, tiempo y piezas se congelan; al reanudar continúan desde el mismo punto. | SIM únicamente | Subprueba UI PASS: tiempo e índice congelados durante la pausa y reanudación aceptada. Falta medir avance posterior desde el mismo punto. |
| `TC-018` RESET SIM | Criterio de QA | Desde cualquier fase reinicia escena/lote/contadores al estado inicial; es solo control de laboratorio. | SIM únicamente | Subprueba UI PASS: reset durante marcha deja la secuencia detenida. Falta comprobarlo tras procesar piezas y durante otras fases/actuadores. |
| `TC-019` PLC Watch | REQ-007 / interfaz del modelo | Nombres, BOOL/INT/DINT/REAL/TIME, unidades, escalados y origen derivado corresponden al inventario de §6. | Inspección de fuente/SIM; futura verificación online | Subprueba UI PASS: registro visible, cantidades/tipos, formato REAL, filtros y selección/enfoque de sensor. Falta el cotejo completo de nombres/unidades/escalados con el inventario y toda prueba online; no hay direcciones físicas. |

## 10. Decisiones funcionales pendientes

| ID | Decisión necesaria antes de congelar la función | Propuesta / propietario |
| --- | --- | --- |
| `D-01-01` | Permisos exactos de START y rearme. | Enumerarlos con proceso, mantenimiento y Safety; no inferirlos de la señal `SafetyReady`. |
| `D-01-02` | Respuesta a magazine vacío y reposición manual. | Definir sensor/indicación, estado de máquina y permiso de acceso; no asumir recarga en marcha. |
| `D-01-03` | Contenedor A/B lleno, cambio de contenedor y prevención de desbordamiento. | Definir sensor o confirmación del operador, capacidad y comportamiento de parada. |
| `D-01-04` | Semántica STOP si se pulsa entre piezas. | SIM cerrado: no comienza otra pieza; se conserva la espera de 0,9 s. Confirmar esta semántica al diseñar la lógica del PLC. |
| `D-01-05` | Handshake, timeout y recuperación de Cognex. | Cerrar con el modelo/protocolo, muestras, responsable de receta y respuesta a resultado inválido. |
| `D-01-06` | Gateway/DB no disponible o confirmación perdida. | Decidir cola, reintento, bloqueo, continuidad y eliminación de duplicados sin perder trazabilidad. |
| `D-01-07` | Significado de reset de contadores y retención entre lotes. | Separar contadores de HMI, trazabilidad persistente y contadores reiniciables. |
| `D-01-08` | Clases, prioridad, historial y reconocimiento de alarmas. | Definir matriz de alarmas reales con causas y condiciones verificables. |
| `D-01-09` | Sensorización y transiciones de cada fase física. | Elegir sensores/confirmaciones y timeouts; los tiempos del HTML no son especificación. |
| `D-01-10` | Presupuesto de ciclo y disponibilidad del piloto. | Verificar 5 piezas/min con tiempos reales de cámara, mecánica, descarga, recarga y cambio de contenedores. |

## 11. Discrepancias y riesgos observados en el simulador

- **STOP durante `betweenCycles` — corregido en SIM:** antes, al terminar los 0,9 s podía empezar otra pieza pese a la solicitud. Ahora se conserva íntegro el intervalo y, al finalizar, la secuencia se detiene antes de alimentar la siguiente. Playwright comprobó el caso con clic real; no se alteraron fases ni duraciones.
- **Índice en intervalo:** `DB_PieceIndex` se calcula como `partIndex + 1` cuando `running` sigue activo; durante la espera puede mostrar el índice de la próxima pieza antes de que empiece FEED. Se debe confirmar si ese tag significa “pieza activa” o “siguiente pieza”.
- **Alarmas:** el panel presenta el último texto/evento del prototipo y no un registro de alarmas industriales con marca de tiempo, reconocimiento o persistencia.
- **Tiempos y sensores:** las fases avanzan por reloj del modelo; E/S y confirmaciones se derivan de la fase. No se verifican timeout físicos, rebote, cableado ni respuesta de actuadores.
- **Resultado:** la secuencia fija del lote no depende de una imagen, receta, calidad óptica ni transferencia Cognex.

La incidencia SIM de `STOP` queda cerrada para el comportamiento ensayado en el HTML: `TC-006` pasa en las siete fases y durante el intervalo. El ciclo no sustituye FAT, validación PLC ni una comprobación de Safety.

## 12. Estado del documento y siguiente puerta

**Resultado de esta etapa:** especificación funcional didáctica trazable validada por D2R; aceptación de máquina real no aplica.
**Ejecución de pruebas:** la ejecución integrada completó 76 comprobaciones hasta AUTO y se interrumpió antes de acabar PIEZA. Después, la batería UI terminó 55 comprobaciones, incluidos los tres tamaños y el chequeo final de errores JavaScript; una ejecución PIEZA separada completó dos órdenes START y no registró errores JavaScript. AUTO, rutas y FIN DE PIEZA en siete fases y el intervalo pasaron en la ejecución integrada. Esto cierra la comprobación SIM de TC-005 y TC-006, pero deja la corrida integrada registrada como interrumpida.
**Evidencia seleccionada:** [resumen por ejecución y criterios](../../tests/evidence/functional-acceptance/controls-01.json).
**Aprobación de máquina real:** no aplica; no existe cliente real ni equipo construido.
**Siguiente puerta:** cerrar la cobertura residual de `TC-016` a `TC-019` y la revisión final de HMI indicada en `TC-007`. La aceptación física sigue pendiente.
