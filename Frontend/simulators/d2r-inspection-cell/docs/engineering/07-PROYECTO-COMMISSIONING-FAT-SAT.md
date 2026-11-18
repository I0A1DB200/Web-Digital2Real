# 07 · Gestión del proyecto y commissioning

**Estado:** plan de trabajo didáctico v0.3 validado para uso didáctico · sin pruebas físicas ejecutadas
**Objetivo:** ordenar entregables, revisiones y pruebas desde el brief hasta la aceptación de una instalación real.

**Términos:** commissioning = puesta en marcha; FAT = prueba de aceptación en fábrica; SAT = prueba de aceptación en emplazamiento; URS = especificación de requisitos de usuario.

## Hitos y puertas de revisión

| Hito | Paquete de salida | Criterio para avanzar |
| --- | --- | --- |
| G0 · Inicio | Alcance, responsables, riesgos y preguntas de cliente. | Propietario de cada decisión identificado. |
| G1 · Requisitos | URS/brief, especificación funcional trazada e inicio de identificación de peligros. | Requisitos verificables, excepciones y responsables acordados; evaluación preliminar de riesgos iniciada. |
| G2 · Concepto y diseño | Distribución general (layout), mecánica, esquemas eléctricos/neumáticos, interfaces y restricciones Safety preliminares. | Revisión interdisciplinaria cerrada; los peligros y límites de acceso informan el diseño. |
| G3 · Hardware y Safety | Lista de materiales (BOM), direcciones, evaluación de riesgos, especificación de funciones y diseño Safety. | Selección y validación planificadas por responsables competentes antes de congelar el diseño. |
| G4 · Software | PLC, HMI, cámara, alarmas y documentación de versiones. | Compilación, simulación y pruebas de integración registradas. |
| G5 · FAT | Protocolo y resultados de aceptación en fábrica. | Desviaciones resueltas o aceptadas formalmente. |
| G6 · SAT | Instalación, interfaces de planta, pruebas de seguridad y proceso. | Pruebas en emplazamiento aprobadas por cliente/equipo. |
| G7 · Entrega | Planos conforme a obra (as-built), copias de seguridad, manuales, formación y repuestos. | Paquete final y responsables de operación aceptados. |

La identificación de peligros comienza en requisitos y concepto; el análisis y diseño Safety informan el diseño antes de congelarlo. El orden real puede variar por contrato y análisis de riesgos. Ninguna captura del simulador sustituye FAT, SAT ni validación de Safety.

## Preparación de commissioning

Antes de energizar, revisar liberación mecánica, planos, conexiones, identificación de cables, tierra, aire, red, versiones de software, copias de seguridad y permisos de trabajo. Después comprobar E/S con el equipo aislado y según procedimiento autorizado; probar actuadores por separado; verificar cámara y receta; integrar la secuencia; y medir los criterios de aceptación con instrumentos adecuados.

Definir de antemano criterios para: alimentación de una pieza, detención en inspección, asociación de resultado a pieza, ruta A/B, conteo, FIN DE PIEZA, RESET, recuperación de comunicación, alarmas, cambios de receta y comportamiento seguro. Para cada prueba, indicar condición inicial, pasos, esperado, medido, responsable y evidencia.

## Matriz inicial de FAT/SAT propuesta

| Caso | Criterio base (doc. 01) | Prueba | Tipo de evidencia |
| --- | --- | --- | --- |
| `TC-101` | `TC-001`, `TC-003`, `TC-005` | AUTO durante 100 ciclos físicos consecutivos, una pieza correctamente orientada por ciclo, sin pérdidas ni duplicados; conciliación de conteos y rutas A/B. | Registro PLC/HMI y observación del producto. |
| `TC-102` | `TC-005`, `TC-006`, `TC-007`, `TC-013`, `TC-016` | Operación HMI; PIEZA y FIN DE PIEZA; RESET HMI bloqueado en RUN y aceptado en READY sin rearranque; recuperación tras parada/alarma. | Protocolo aprobado y registro de estados. |
| `TC-103` | `TC-009`, `TC-013` | Pérdida y recuperación de comunicación con cámara. | Registros de comunicación, diagnóstico y asociación de pieza. |
| `TC-104` | `TC-002`, `TC-003` | Probar 100 NOK (50 ausencias y 50 obstrucciones) y 100 buenas; objetivo: rechazar las 100 NOK y aceptar al menos 98 buenas. Verificar rutas A/B. | Muestras identificadas con resultado de referencia conocido y registro de aceptación. |
| `TC-105` | `TC-014` | Validación de cada función Safety especificada. | Protocolo Safety, medidas e informe competente. |
| `TC-106` | `TC-004` | Capacidad objetivo: promedio de 5 piezas/min durante 30 min estables, según condiciones del requisito. | Registro de conteos, duración y paradas. |
| `TC-107` | `TC-008` | Registro único por pieza con los campos definidos en el requisito, correlación, persistencia y retención de 30 días comprobada según el sistema aprobado. | Evidencia del servicio de datos y comprobación de registros. |
| `TC-108` | `TC-010` | Compilación del proyecto TIA compatible y verificación online de E/S/diagnóstico. | Proyecto/versiones y registro de prueba online. |
| `TC-109` | `TC-011`, `TC-012` | Verificar 24 VDC, aire seco filtrado nominal de 6 bar y operación entre 10–35 °C en interior, sin condensación ni lavado a presión. | Medidas de tensión, presión y ambiente según protocolo. |
| `TC-110` | `TC-015` | Revisar paquete reproducible con versiones, condiciones, muestras, resultados, incidencias, responsables y aceptación. | Índice de entrega y registro controlado de aceptación. |

Los casos `TC-101`…`TC-110` son paquetes de ejecución vinculados a los criterios maestros del documento 01; no los reemplazan ni se han ejecutado. Las muestras y tasas de aceptación de visión son objetivos de piloto didáctico, no una garantía estadística de producción. Los procedimientos seguros y resultados deben definirse para el equipo real. El lote virtual de 4 OK/3 NOK no demuestra capacidad ni calidad de producción.

## Registro de incidencias y cierre

Registrar cada desviación con ID, versión, síntoma, condición de reproducción, impacto, responsable, corrección, repetición de prueba y estado. Mantener configuración aprobada y copias de seguridad identificables. La entrega incluye planos conforme a obra, lista de software/hardware, manual, formación, repuestos y registro de cambios.

**Trazabilidad:** matriz `REQ` → `TC` → evidencia → desviación/cierre.<br>
**Pendiente:** cronograma, responsables, criterios contractuales, versiones, muestras, instrumentos y formato de aceptación.

## Responsabilidades del equipo

| Rol | Responsable de | Evidencia de entrega |
| --- | --- | --- |
| Cliente / dueño de proceso | URS, producto, cadencia, criterios OK/NOK, interfaces y aceptación. | Requisitos aprobados y actas de revisión. |
| Responsable de proyecto | Alcance, hitos, riesgos, cambios, coste, dependencias y decisiones abiertas. | Plan, registro RAID (riesgos, supuestos, incidencias y dependencias), decisiones y minutas. |
| Ingeniería mecánica | Distribución general, CAD, cargas, accesos, fabricación y documentación conforme a obra. | Planos liberados, lista de materiales mecánica y revisiones. |
| Ingeniería eléctrica | Armario, alimentación, esquemas, protección, cableado y red. | Esquemas aprobados, lista de cables y registros de inspección. |
| PLC/HMI | Arquitectura, tags, programa, alarmas, versiones y pruebas. | Copia de seguridad/proyecto versionado, lista de tags y protocolo FAT. |
| Integración de visión | Óptica/luz, job, muestras, interfaz, límites y trazas de resultados. | Informe de capacidad acordado, job respaldado y mapa de datos. |
| Responsable Safety | Evaluación, especificación, arquitectura, cálculo y validación. | Expediente de Safety firmado por responsable competente. |
| Calidad / puesta en marcha | Muestras, inspección, trazabilidad, desviaciones y aceptación. | Protocolos firmados y registro de no conformidades. |

Una misma persona puede asumir roles en un proyecto pequeño; las aprobaciones de Safety y cliente siguen requiriendo la competencia y autoridad correspondientes.

## Actividades por fase de commissioning

### 1. Revisión documental y precomisionado

- Confirmar número de serie, versión de software/firmware, planos y configuración conforme al diseño aprobado.
- Revisar montaje, fijaciones, guardas, etiquetado, tierra, continuidad, protecciones, presión y calidad de aire.
- Comprobar que las pruebas pendientes, permisos, calibraciones y equipos de medida están identificados.
- Preparar copia de seguridad inicial de PLC, HMI, cámara y variador antes de cambiar parámetros.

### 2. Prueba eléctrica de E/S

Con el área controlada y siguiendo procedimientos aprobados, comprobar tag ↔ borne ↔ dispositivo, tensión/polaridad, estado normal, transición, diagnóstico de pérdida de canal y reacción de programa. Ejecutar salidas solo cuando la zona esté preparada y el movimiento esté autorizado. Registrar cada canal, no inferir un estado a partir del LED del HMI solamente.

### 3. Movimiento individual e integración

Probar drive, alimentador y expulsor por separado con límites de riesgo acordados; verificar sentido, velocidad, carrera, presión, amortiguación y feedback. Luego integrar alimentación → visión → clasificación; probar pieza real, variación de pieza y contenedor; confirmar que una respuesta de cámara pertenece al ID de pieza correcto.

### 4. FAT

1. Acordar versión del sistema, copias de seguridad, muestra, instrumentos, protocolo y responsables.
2. Ejecutar pruebas nominales y límite contra cada requisito trazado.
3. Verificar alarmas, pérdida de comunicación, recuperación, reset, modo pieza y parada operacional.
4. Repetir fallos corregidos y adjuntar evidencia identificada por versión.
5. Registrar desviaciones; aceptar, rechazar o aplazar cada una con responsable y referencia al registro controlado.

### 5. SAT y entrega

Verificar servicios y conexiones del emplazamiento; repetir pruebas relevantes después del transporte/instalación; validar interfaces de planta, formatos de producto, condiciones ambientales y funciones Safety en el emplazamiento. Cerrar la lista de pendientes (punch list) antes de firmar aceptación. Entregar planos conforme a obra, copias de seguridad probadas, listas de repuestos, formación y contactos de soporte.

## Registro de prueba trazable

| Campo | Ejemplo de qué documentar |
| --- | --- |
| ID / requisito | `TC-104` / `REQ-003`; versión de documento. |
| Equipo / configuración | Número de serie, CPU/firmware, programa, receta/job Cognex. |
| Precondiciones | Pieza/revisión, modo, velocidad, presión, contenedor y estado inicial. |
| Pasos | Orden exacto, entradas provocadas y condiciones ambientales relevantes. |
| Esperado | Criterio con unidad y tolerancia aprobado antes de la prueba. |
| Observado | Valor medido, instrumento/calibración, tag/log y comportamiento. |
| Resultado | PASS/FAIL/BLOCKED; desviación y evaluación de impacto. |
| Aprobaciones | Ejecutor, testigo, cliente y referencia del registro de aprobación. |

No sustituir “4 OK / 3 NOK” del lote virtual por criterio de calidad de producción. Para validar visión se necesitan muestras representativas etiquetadas, verdad de referencia y acuerdo de falsos aceptados/rechazados.
