# EE-0037 — Ficha técnica maestra previa a generación
Clasificación EXPERIENCE / CONTENT. Estado: borrador técnico; aprobación humana pendiente.

SSOT: experience.yaml y locales ES/EN existentes; docs/implementation/ENV-004/source-editorial-es.md, EXP-EL-07. Identificador EXP-ELECTRICAL-CONTACT-037, ENV-004, hotspot 7. Título: El contacto instalado no corresponde al esquema / Installed contact does not match the schematic.

## Datos establecidos
PARO de proceso S3, pulsador momentáneo; NO 13–14 abierto en reposo/cerrado pulsado; NC 21–22 requerido en serie por plano. Tras mantenimiento se cableó NO en vez de NC. KM3 con START y auto-mantenimiento. No es parada de emergencia ni se modifica seguridad. Permiso inverso no equivale a arranque automático al pulsar PARO.
Tensión, corriente, potencia, protecciones, modelo/fabricante instalado, PLC, E/S, sensores y comunicaciones: no especificados. No se añaden valores ni instrumentos. Uc y retorno Uc son potenciales abstractos, no PE.
Referencia visual: pulsadores industriales de 22 mm rojo plano no luminoso y verde START; bloque combinado 1NO+1NC genérico coherente, no atribución de un modelo comercial instalado. Siemens 3SU1150-0AB20-1FA0 y módulo 3SU1400-1AA10-1FA0 sirven únicamente como referencia documental de tipología; no como as-built ni referencia de compra. Fuente oficial consultada: https://simplicityhub.siemens.com/my/en/products/sirius-act-pushbutton-22-mm-round-metal-shiny-red-pushbutton-flat-momentary-contact-prod0000102539 y catálogo LV10 https://cache.industry.siemens.com/dl/files/643/109750643/att_973623/v1/LV10_102018_Chap07_EN_web_201902041301176730.pdf . El detalle de pares viene del caso canónico; no se afirma inspección de un plano de bornas del fabricante ni validación normativa.

## Conexiones: extracto funcional ilustrativo del plano previsto
N1: Uc — S3:21
N2: S3:22 — START:13 — KM3(aux):13
N3: START:14 — KM3(aux):14 — KM3:A1
N4: KM3:A2 — retorno Uc
START y auxiliar KM3 son NO en paralelo, ambos aguas abajo de S3 NC. A1/A2 y auxiliar13/14 son convenciones de la representación ilustrativa; no identificación verificada de aparato real. Potencia, protección y distribución aguas arriba quedan fuera del extracto, sin asumir su ausencia. Nunca derivar un puente alrededor de S3.
Instalación defectuosa: sustituye S3:21/22 por S3:13/14, conserva el resto. Reparación autorizada: devuelve esos dos conductores al par21/22 y deja13/14 libre. Sin puentes. Trabajo aislado con ausencia de tensión verificada conforme al procedimiento existente; no se inventan pasos LOTO/EPI.

## Modelo lógico acotado
KM3_siguiente = S3_NC_cerrado AND (START_pulsado OR KM3_anterior).
Al soltar START mantiene; al pulsar STOP cae; al soltar STOP permanece parado. Solo nuevo START permite marcha. El NO defectuoso afecta al permiso, no sustituye START.
Secuencia ilustrativa de verificación, no medición real: reposo(0); pulsar START(1); soltar START(1); pulsar STOP(0); soltar STOP(0). Confirmar STOP/START y mantenimiento; una foto de reparación no prueba recuperación.

## Plan y revelación
ART001 foto contexto frontal sin cableado posterior: portada.
ART002 SVG determinista de conexiones previstas, PNG: antes D1. No montaje real ni causa revelada.
ART003 foto espécimen de referencia SIN cablear, 13/14 NO y21/22 NC: después D1. No indica conexionado instalado.
ART004 gráfico determinista de estados NO13/14 abierto/cerrado y permiso0/1: después D2. No instrumento ni tensión medida.
ART005 foto posterior dos conductores SOLO13/14,21/22 vacíos: después D3, confirmación aislada.
ART006 edición local de ART005, dos conductores SOLO21/22,13/14 vacíos: después D4. Corrección, no prueba de recuperación.
ART007 secuencia funcional determinista derivada del modelo: después D5, registro didáctico simulado.

## Control
Cada foto requiere inspección antes de continuar; primera como referencia. Máximo tres correcciones razonables por defecto; fallo crítico persistente se oculta. SVG se contrasta con conexiones y lógica. Sin cambios de decisiones, feedback, evaluación, Engine, Frontend ni otras Experiences. Disponibilidad multimedia no equivale a validación técnica. No commit/push/merge/deploy autorizados para esta producción.
