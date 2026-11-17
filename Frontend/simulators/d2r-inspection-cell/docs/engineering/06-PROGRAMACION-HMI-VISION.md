# 06 · Programación, HMI y enlace de visión

**Estado:** guía didáctica v0.3 validada para uso didáctico · sin proyecto ejecutable
**Objetivo:** explicar cómo pasar de la arquitectura PLC a lógica verificable y a una interfaz clara para operador y diagnóstico.

## Elección de lenguaje

- **LAD/KOP:** redes de permisos y condiciones discretas fáciles de revisar online con mantenimiento.
- **SCL:** transformaciones de estructuras, gestión de recetas/datos y cálculos que se lean mejor como texto estructurado.
- La secuencia puede combinar ambos lenguajes. La norma del equipo y la mantenibilidad pesan más que reescribir todo en un único estilo.

El trabajo de programación debe partir de interfaces aprobadas y pruebas unitarias de bloques. Cada transición de secuencia necesita condición de entrada, acción, condición de salida, tiempo máximo si aplica y respuesta ante fallo. No usar los tiempos acelerados del simulador como valores de máquina.

## Interfaz con la cámara

La tabla siguiente es una conversación conceptual, no un handshake implementado. El orden, flancos, retención, timeout y recuperación se acuerdan con el modelo de cámara elegido.

| Etapa | PLC | Cámara | Evidencia esperada |
| --- | --- | --- | --- |
| Preparación | Valida pieza presente, receta y permiso de proceso. | Informa lista y receta cargada. | Valores coherentes para una misma pieza. |
| Disparo | Emite `Trigger` y un ID de ciclo si el protocolo lo admite. | Acepta el disparo e inicia captura. | Acknowledgement o transición observable. |
| Resultado | Espera captura completa y resultado válido. | Devuelve OK/NOK, validez y diagnóstico acordado. | Resultado asociado al ID de pieza correcto. |
| Cierre | Registra/consume el resultado una sola vez y libera el intercambio. | Vuelve a `Ready` según su interfaz. | Sin resultado antiguo ni duplicado. |

La simulación presenta `DO_VisionTrigger`, `VisionReady`, `InspectionDone`, `InspectionValid` y `VisionOK`; el resultado proviene del lote interno. No hay comunicación electrónica con una cámara.

## HMI y Watch

El HMI de máquina debe priorizar modo, estado, START, FIN DE PIEZA, RESET permitido, alarma y producción. Confirmaciones, permisos de usuario, navegación y detalle de alarmas se acuerdan en la especificación. La pausa del simulador congela el reloj gráfico; una máquina real requiere una definición de parada operacional específica y análisis de riesgo.

PLC Watch es una herramienta de observación/puesta en marcha, no la HMI de producción. Mantener los nombres y tipos existentes del prototipo como referencia: BOOL, INT, DINT, REAL y TIME. Antes de exportar una tabla real se validan dirección, unidad, rango, calidad y retención.

## Verificación del software

Planificar casos para cada bloque, transición, rechazo, pérdida de handshake, señal ausente, timeout, reinicio y recuperación. Registrar precondiciones, estímulo, resultado esperado, valor observado y evidencia. Los fallos deben proceder de una condición lógica comprobable; no se deben inyectar averías para dar por válida una alarma.

**Artefacto de salida:** fuente PLC versionada, lista de tags HMI/visión y matriz de pruebas aprobada.<br>
**Trazabilidad:** `REQ-001`…`REQ-010`, `REQ-013`…`REQ-015`; bloques propuestos en el documento 05.

## Ejemplos de organización de código

Las tablas describen redes/conceptos para enseñar revisión de código; no son lógica cargable ni un cambio al simulador.

| Red LAD/KOP propuesta | Condición | Resultado | Qué revisar online |
| --- | --- | --- | --- |
| N01 · aceptar START | Flanco de `StartReq` AND estado `Ready` AND modo válido. | Pulso interno `StartAccepted`. | START rechazado debe tener causa visible; evitar mantener el bit y rearrancar. |
| N02 · aceptar RESET | `ResetReq` AND condición de parada acordada. | Reinicio de estado de proceso no Safety. | RESET no rearma Safety ni evita un rearranque inesperado. |
| N03 · solicitud de fin | Flanco de `StopAfterPartReq` durante RUN. | Retener `StopPending` y bloquear siguiente pieza al concluir. | La pieza activa termina; no desenergizar salidas de forma arbitraria. |
| N04 · mando de transporte | Estado de secuencia solicita marcha AND permisos estándar válidos. | Orden a interfaz de variador/contactor. | Feedback, fallo, interbloqueos y modo de accionamiento. |

### Esquema SCL didáctico (no compilado)

```text
// Esquema de estados para discusión; no copiar a TIA sin completar interfaces.
CASE Cell.State OF
  READY:
    IF Cmd.StartAccepted THEN
      Cell.State := FEED;
    END_IF;
  FEED:
    IF Feeder.PartPresented THEN
      Cell.State := TRAVEL_TO_VISION;
    END_IF;
  INSPECT:
    IF Vision.ResultAccepted THEN
      Cell.ResultForCurrentPart := Vision.Result;
      Cell.State := TRAVEL_TO_SORT;
    END_IF;
  SORT:
    IF Cell.ResultForCurrentPart = RESULT_OK THEN
      Cell.State := DISCHARGE_A;
    ELSE
      Cell.State := DISCHARGE_B;
    END_IF;
END_CASE;
```

`READY`, `FEED` y demás identificadores serían constantes/ENUM definidos en el proyecto. El fragmento omite estados, timeout, salidas, errores, persistencia y tratamiento de cambios de modo; no debe compilarse ni usarse como programa de máquina.

## Ciclo de datos con cámara Cognex

Este protocolo es un punto de partida para revisar con el manual exacto del lector. No se ha seleccionado Cognex, no se sabe si el trigger será por entrada física o Ethernet y no se ha elegido el protocolo.

1. El PLC confirma pieza presente y asigna un identificador de ciclo único.
2. El PLC solicita `Trigger` y conserva la petición hasta la aceptación definida por la cámara.
3. La cámara informa `Busy` mientras captura/procesa y después `Done`.
4. El PLC valida `Valid`, `JobId`, `SequenceId`, diagnóstico y frescura del dato.
5. El PLC copia el resultado aceptado a estado de pieza; resultado vacío, inválido o atrasado no clasifica.
6. PLC/cámara limpian la petición y confirmación según el handshake acordado; ambos regresan a un estado conocido.

| Situación | Respuesta de proceso que debe especificarse | Registro mínimo |
| --- | --- | --- |
| `Ready` no llega | Mantener pieza detenida; generar alarma tras tiempo máximo aprobado. | Trigger, elapsed, estado y diagnóstico cámara. |
| `Done` no llega | No inventar OK/NOK; bloquear clasificación y permitir recuperación autorizada. | ID de pieza, job, estado handshake. |
| Resultado inválido o de ID anterior | No consumir el resultado; limpiar/reintentar según procedimiento. | Dato bruto, validez, ID recibido. |
| Error de cámara/job no disponible | Llevar proceso al estado definido por la evaluación de riesgos y la especificación funcional. | Código Cognex, job activo, reconocimiento. |

No se fija aquí timeout, número de reintentos ni ruta automática alternativa; dependen de producción, calidad y análisis de riesgos.

## Alarmas y diagnóstico funcional

La alarma solo se activa con una condición lógica verificable. Propuesta de estructura: código, texto, origen, condición activa, instante, reconocimiento, recuperación y variable asociada.

| Condición candidata | Evidencia que la justifica | Acción/recuperación por acordar |
| --- | --- | --- |
| Timeout de movimiento | Orden activa y feedback de posición/movimiento no llega antes del límite validado. | Inspección, liberación controlada y reset autorizado. |
| Falta de pieza | Sensor no confirma cargador/cinta pese a condición de suministro esperada. | Revisar cargador, sensor y pieza atrapada. |
| Visión sin confirmación | Trigger aceptado pero `Done` ausente o intercambio no válido. | Diagnosticar comunicación/job; no inventar resultado. |
| Estado contradictorio | Sensores de extremos simultáneos o combinación imposible según diseño. | Detener proceso según secuencia aprobada y corregir causa. |

Las cuatro filas son ejemplos de ingeniería que requieren límites y respuestas acordadas; no añaden averías al simulador ni afirman que existan sensores reales.

## Mapa de pantallas HMI propuesto

| Pantalla | Para quién | Información/acciones principales | Fuera de la pantalla normal |
| --- | --- | --- | --- |
| Operación | Operador | Estado, modo, START, FIN DE PIEZA, RESET permitido, OK/NOK/total, alarma activa. | Forzado de salidas y parámetros de seguridad. |
| Alarmas | Operador/mantenimiento | Texto, causa, fecha/hora si disponible, estado/ack, guía de recuperación. | Reconocer no debe borrar una condición activa. |
| Diagnóstico E/S | Puesta en marcha | Estado físico, calidad de canal, equipo y tag asociado. | Valores virtuales presentados como físicos. |
| Visión | Calidad/ajuste autorizado | Job, listo/ocupado, captura, resultado, score y diagnóstico disponibles. | Cambiar receta sin permiso/registro. |
| Mantenimiento | Personal autorizado | Horas/ciclos, pruebas de actuador y cambio de sensores. | Mandos manuales sin permisos, área segura y procedimiento. |

La pausa visible en el simulador es un control del reloj de animación. La HMI de una máquina no debe reutilizarla sin definir proceso, categoría de parada y requisitos de riesgo.

## Tabla de validación de software

| Caso | Estímulo | Esperado | Evidencia |
| --- | --- | --- | --- |
| `TC-201` | START válido y START repetido durante RUN. | Se acepta el primero; el repetido se rechaza con causa visible y no queda en cola. | Watch de comando/estado y registro de rechazo. |
| `TC-202` | STOP durante cada fase activa y durante `betweenCycles`. | En fase activa, termina la pieza y se detiene. En `betweenCycles`, impide iniciar la siguiente pieza. | Historial de estado y contador. |
| `TC-203` | Cámara no lista / sin Done / resultado inválido. | Sin clasificación con dato inválido; alarma causal. | Paquete de intercambio y alarma. |
| `TC-204` | RESET HMI con máquina en RUN y en READY. | En RUN se rechaza y no cambia el estado. En READY restablece el estado de proceso sin rearranque ni rearme Safety. | Registro de solicitudes aceptadas/rechazadas y estado anterior/posterior. |
| `TC-205` | Pérdida y recuperación de señal de sensor/actuador en prueba controlada de PLC/hardware. | Recuperación definida, sin movimiento inesperado ni conteo duplicado. | Diagnóstico y repetición registrada; no usar inyección F01/F02 en el simulador. |

Esta matriz es propuesta para el PLC futuro. Las pruebas del HTML no equivalen a validación de bloques PLC. El comportamiento SIM de `TC-202` se comprobó con clics reales en las siete fases y durante `betweenCycles`: completa como máximo la pieza activa e impide iniciar la siguiente. La prueba del PLC futuro sigue pendiente.
