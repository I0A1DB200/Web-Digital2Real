# ENV-004 — Informe de implementación y QA

Fecha: 12 de noviembre de 2026 (Europe/Madrid).

Nota de historial: este informe documenta la fase de implementación y QA previa al commit. Después de su entrega, el usuario autorizó expresamente commit, push, merge y deploy. Esa autorización permite publicar este preview textual; no cambia las validaciones técnicas pendientes ni eleva las Experiences a approved/published. La confirmación «no se hizo commit/push/merge/deploy» al final corresponde al momento de entrega de este informe, antes de esa autorización.
Estado: IMPLEMENTADO como preview textual; AUTOMATED PASS. No aprobado para producción.

## Alcance, estado inspeccionado y autoridad

Repositorio `/workspace/Web-Digital2Real`, rama `work`, HEAD `bcc551d105e3ed4427d2c14c5ca2d2a13a285981`.
Estado inicial: únicamente `?? docs/standards/` (`evidence-driven-assets.md`), conservado sin cambios.
Clasificación: NOTEBOOK + EXPERIENCE; integración CONTENT y configuración ENV existente.
Objetivo: integrar ENV-004 completo sin modificar el Engine.

La petición del usuario autoriza ejecutar CODEX_PROMPT.md. El documento adjunto se trató como contrato de esta implementación, subordinado a la petición explícita de no hacer commit, push ni deploy y a la gobernanza del repositorio. El contenido editorial aportado es una propuesta pendiente de revisión, no evidencia de hardware ni aprobación técnica.

Se inspeccionaron AGENTS.md, Engineering Director Playbook, Engineering OS, Content Model, estándares de diseño, evidencias, assets y QA, contrato/validadores/packagers del Engine, Notebook/localización/visor/carrousel, ENV-001/002/003 y las Experiences completas EE-0030 y EE-0008. Se aplicaron cloud-environment-runtime y build-d2r-automation-labs para el entorno y la disciplina de evidencias.

## Implementación y patrones reutilizados

- Environment V2 con portada aprobada y diez coordenadas declarativas intactas.
- 25 entradas Notebook con el texto fuente completo: explicaciones, ejemplos, preguntas, opciones, respuestas y resúmenes de bloque. Modelo técnico EN y overlays ES existentes; IDs de sección permanentes.
- Cinco categorías existentes como agrupaciones y cinco secciones Theory como itinerarios de lectura, sin duplicar capítulos. Notebook conserva la SSOT.
- Diez paquetes Experience V2 en `technical_review`, validación `pending`, visual `planned`, sin imágenes ficticias ni paths de runtime rotos.
- ES/EN completos. Traducción EN nueva, pendiente de revisión técnica humana. Cada artículo contiene una advertencia visible de revisión pendiente.
- No se añadieron dependencias, framework, build system, producto nuevo ni CSS.

La UI actual no ofrece enlaces directos a artículos Notebook desde Theory ni desde las referencias de Experience. Los itinerarios indican categoría, orden, título e ID canónico y se recorren con la navegación existente de Engineering Notes. No se inventaron URLs ni se modificó el Engine para añadir navegación.

Adaptación fiel del esquema: D1–D5 → cinco stages; A/B/C → tres registros `public.decisions` por stage. Son 50 momentos editoriales y 150 opciones, equivalentes a 150 decisiones de esquema. Ninguna opción se eliminó ni cambió de corrección. Se amplió un distractor por momento en ambos idiomas para evitar que la respuesta correcta destacara por longitud. El texto original permanece como prefijo literal y en `decision-trace.json`. Cuando el original solo decía «Incorrecta», se añadió feedback razonado a partir de los datos del momento y sin ejecutar la opción.

Cada caso tiene seis evidencias de autoría: contexto inicial y cinco registros adquiridos. La proyección conserva cinco evidencias interactivas por caso; el contexto inicial sigue en Incident Brief. E1–E4 son familias narrativas conservadas en el manifiesto, divididas por adquisición cuando corresponde. Solo D5 completa el caso: reparación realizada no equivale a recuperación verificada.

## Notebook: 25 correspondencias

| Bloque | Editorial fuente | ID canónico | Título ES |
|---|---|---|---|
| 01 | NB-EL-01 | article-009 | Tensión, corriente, resistencia y circuito cerrado |
| 01 | NB-EL-02 | article-010 | AC, DC, frecuencia y valores eficaces |
| 01 | NB-EL-03 | article-011 | Potencia, energía y cargas industriales |
| 01 | NB-EL-04 | article-012 | Multímetro, pinza y lectura de medidas |
| 01 | NB-EL-05 | article-013 | Calidad de la medida y diagnóstico diferencial |
| 02 | NB-EL-06 | article-014 | Alimentación monofásica y trifásica |
| 02 | NB-EL-07 | article-015 | Fuentes industriales de 24 VDC |
| 02 | NB-EL-08 | article-016 | Fusibles, magnetotérmicos y protección de sobreintensidad |
| 02 | NB-EL-09 | article-017 | Diferenciales, aislamiento y PE |
| 02 | NB-EL-10 | article-018 | Selectividad, separación y distribución |
| 03 | NB-EL-11 | article-019 | Mando frente a potencia |
| 03 | NB-EL-12 | article-020 | Contactores, bobinas y auxiliares |
| 03 | NB-EL-13 | article-021 | Pulsadores, auto-mantenimiento y enclavamientos |
| 03 | NB-EL-14 | article-022 | Motores trifásicos, placa y relé de sobrecarga |
| 03 | NB-EL-15 | article-023 | Relés, temporizadores y salidas PLC |
| 04 | NB-EL-16 | article-024 | Símbolos y convenciones |
| 04 | NB-EL-17 | article-025 | Designación y referencias cruzadas |
| 04 | NB-EL-18 | article-026 | Borneros, potenciales y numeración |
| 04 | NB-EL-19 | article-027 | Lectura de esquemas de mando |
| 04 | NB-EL-20 | article-028 | Trazabilidad y control de revisiones |
| 05 | NB-EL-21 | article-029 | Método de diagnóstico |
| 05 | NB-EL-22 | article-030 | Consignación y comprobación de ausencia de tensión |
| 05 | NB-EL-23 | article-031 | Diagnóstico por comparación y bajo carga |
| 05 | NB-EL-24 | article-032 | Aislamiento y fugas |
| 05 | NB-EL-25 | article-033 | Verificación, recurrencia y documentación |

Bloques: 01 Fundamentos eléctricos y medición; 02 Distribución eléctrica y protecciones; 03 Circuitos de mando y potencia; 04 Interpretación de esquemas y cableado; 05 Diagnóstico eléctrico y seguridad.
Slugs estables: `electrical-notes-01`…`electrical-notes-25`; no son nuevas rutas URL.

## Experiences: diez correspondencias

| Editorial fuente | Editorial D2R | ID técnico canónico | Stages / opciones | Locales | Imágenes |
|---|---|---|---|---|---|
| EXP-EL-01 | EE-0031 | EXP-ELECTRICAL-SUPPLY-031 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-02 | EE-0032 | EXP-ELECTRICAL-CONTACTOR-032 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-03 | EE-0033 | EXP-ELECTRICAL-OVERLOAD-033 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-04 | EE-0034 | EXP-ELECTRICAL-PHASE-034 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-05 | EE-0035 | EXP-ELECTRICAL-PROTECTION-035 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-06 | EE-0036 | EXP-ELECTRICAL-RETURN-036 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-07 | EE-0037 | EXP-ELECTRICAL-CONTACT-037 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-08 | EE-0038 | EXP-ELECTRICAL-ROTATION-038 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-09 | EE-0039 | EXP-ELECTRICAL-DROP-039 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |
| EXP-EL-10 | EE-0040 | EXP-ELECTRICAL-INSULATION-040 | 5 / 15 | ES/EN completos; revisión pendiente | 0 aportadas; 6–7 previstas |

Estado de todas: `technical_review / pending`; jugables en preview textual, excluidas de publish.
ICF-06 figura como capacidad `planned`, sin competencias aprobadas. Los IDs `COMP-EL-CIRCUIT-TRACEABILITY`, `COMP-EL-EVIDENCE-INTERPRETATION` y `COMP-EL-VERIFIED-RECOVERY` son asociaciones provisionales de autoría, documentadas como pendientes; no crean competencias aprobadas ni certificación. No se modificó la definición de ICF-06.

## Diez hotspots

| Punto | Zona ES | x % | y % | Destino resuelto | Estado |
|---|---|---:|---:|---|---|
| H01 | Fuente 24 VDC | 65.2 | 30.5 | EE-0031 → EXP-ELECTRICAL-SUPPLY-031 | Activo en preview; no publicado |
| H02 | Contactor KM1 | 28.3 | 57.3 | EE-0032 → EXP-ELECTRICAL-CONTACTOR-032 | Activo en preview; no publicado |
| H03 | Motor trifásico | 87.7 | 66.3 | EE-0033 → EXP-ELECTRICAL-OVERLOAD-033 | Activo en preview; no publicado |
| H04 | Entrada L1/L2/L3 | 26.8 | 19.7 | EE-0034 → EXP-ELECTRICAL-PHASE-034 | Activo en preview; no publicado |
| H05 | Magnetotérmicos | 40.4 | 31.0 | EE-0035 → EXP-ELECTRICAL-PROTECTION-035 | Activo en preview; no publicado |
| H06 | Borneros X1 | 39.0 | 81.7 | EE-0036 → EXP-ELECTRICAL-RETURN-036 | Activo en preview; no publicado |
| H07 | Relés K1/K2 | 55.5 | 56.4 | EE-0037 → EXP-ELECTRICAL-CONTACT-037 | Activo en preview; no publicado |
| H08 | Conexión del motor | 93.4 | 56.0 | EE-0038 → EXP-ELECTRICAL-ROTATION-038 | Activo en preview; no publicado |
| H09 | Borneros 24 VDC | 65.0 | 80.3 | EE-0039 → EXP-ELECTRICAL-DROP-039 | Activo en preview; no publicado |
| H10 | PE y puesta a tierra | 27.1 | 81.8 | EE-0040 → EXP-ELECTRICAL-INSULATION-040 | Activo en preview; no publicado |

El esquema vigente admite destino y coordenadas. Las etiquetas accesibles usan el título localizado de la Experience, como los otros Environments. Las etiquetas físicas ES/EN aportadas se conservan en `mapping.json`. No se desplazó ningún punto.

## Portada y binarios

Único binario nuevo de producto: `content/environments/ENV-004-industrial-electrical-systems/media/ENV-004-industrial-electrical-systems.png`.
Copia exacta del original aprobado, 1672 × 941, sin alteración de bytes ni píxeles. No se modificaron binarios existentes. La ilustración no prueba cableado, medidas ni condiciones eléctricas. Review Only se inspeccionó como comparación y no se incorporó a producción.

SHA-256 idéntico de original y copia:

```text
9ac44c68d8ea1a77b74fc73209df595c98d6c262ec8400aeda2a8962ea97dd75
```

## Manifiestos y assets pendientes

| Experience | Manifiesto | Faltante previsto |
|---|---|---|
| EE-0031 | `content/experiences/electrical/EE-0031-24vdc-supply-voltage-collapse/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0032 | `content/experiences/electrical/EE-0032-contactor-does-not-energize/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0033 | `content/experiences/electrical/EE-0033-motor-overload-trip/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0034 | `content/experiences/electrical/EE-0034-single-phase-loss/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0035 | `content/experiences/electrical/EE-0035-auxiliary-circuit-protection-trip/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0036 | `content/experiences/electrical/EE-0036-open-return-conductor/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0037 | `content/experiences/electrical/EE-0037-incorrect-no-nc-contact/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0038 | `content/experiences/electrical/EE-0038-incorrect-motor-rotation/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0039 | `content/experiences/electrical/EE-0039-excessive-voltage-drop-at-terminal/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |
| EE-0040 | `content/experiences/electrical/EE-0040-insulation-fault-to-protective-earth/media-source/evidence-manifest.yaml` | 6 previstos + 1 opcional |

Cada manifiesto conserva E1–E4 con propósito, valores esperados, adquisición, seguridad y validación. Propone siete slots: contexto, circuito, registro, comparación, inspección, verificación y síntesis opcional. La selección final puede ser de seis. Sus paths son especificaciones, nunca `src` de runtime. Faltan aproximadamente **60–70 imágenes aprobadas**; no se confunden las 40 familias narrativas con 40 archivos. Se aportaron 0 imágenes de evidencia y se generaron 0. Las capturas de QA son capturas del producto, no evidencia eléctrica.

## QA técnico, semántico y bilingüe

Se preservan caída en origen PS1 frente a caída en distribución PS2/X4:12; sobrecarga mecánica frente a pérdida de fase; PE frente a neutro/retorno; y NO/NC según el componente documentado. Se conservan terminales, cantidades, fórmulas y lógica de corrección. Las pruebas comprueban paridad de números/magnitudes de todas las secciones y las 150 opciones fuente, permitiendo separador decimal y orden gramatical EN.

Se revisaron los datos disponibles D1–D5: el escenario inicial no muestra la inspección final de defecto físico. Las opciones incorrectas tienen feedback y no desbloquean evidencias. Solo la verificación final registra completado. Las lecturas energizadas son simulaciones o registros ya obtenidos por personal autorizado. No se autoriza resistencia en tensión, megóhmetro sobre electrónica conectada, bypass de protecciones ni PE como retorno.

EXP-04 conserva la reserva sobre lecturas idealizadas: motores conectados, inducción y retroalimentación pueden alterar el patrón real; la confirmación procede del ensayo aislado del polo L3. EXP-10 conserva la ausencia de tensión/umbral universal de aislamiento: deben fijarlos equipo, fabricante y norma antes de aprobar producción. No se inventaron secuencias LOTO, EPI, tiempos, curvas ni límites normativos.

## Validaciones ejecutadas

| Comando / comprobación | Resultado |
|---|---|
| `node --test scripts/tests/env004Content.test.mjs` | 24 PASS, 0 FAIL |
| `node --test` | 545 PASS, 0 FAIL |
| `node scripts/package-notebook.mjs` | PASS; genera Frontend/generated/notebooks/ |
| `node scripts/package-experience-engine.mjs --mode=publish` | PASS del filtro local; excluye las diez nuevas Experiences y ENV-004. No despliega. |
| `node scripts/package-experience-engine.mjs --mode=preview` | PASS; 40 Experiences totales y 4 Environments |
| Auditoría de artefactos ES/EN | 20 paquetes nuevos; 25 Notes por idioma; 5 itinerarios; 10 hotspots; sin filtración de campos privados ni paths de media ausentes |
| `node --check` de Notebook y prueba focal | PASS |
| `git diff --check` | PASS |

El repositorio no define comandos separados de lint/typecheck ni usa build de framework: no se atribuye PASS a herramientas inexistentes. Se ejecutaron sus packagers canónicos.

La primera suite compartida dio 540 PASS / 4 FAIL por expectativas antiguas de 8 Notes, 30 Experiences y 3 Environments. Clasificación **E — INVALID / OUTDATED TEST EXPECTATION**. Se ampliaron tres archivos de test al catálogo nuevo, conservando las verificaciones anteriores. La asimetría inicial de longitud de opciones nuevas se corrigió en contenido. No se modificaron Experiences ajenas para hacer pasar tests.

Los logs de ejecución, JSON de auditoría y capturas están en `qa/`. Se normalizaron espacios al final de línea en el snapshot editorial y en el log inicial de fallos; mapping.json distingue el SHA del original del SHA del snapshot normalizado. La suite final tiene 545 pruebas porque incorpora 24 pruebas focales, incluida paridad técnica ES/EN.

## Browser QA

Chromium real con Playwright y `/usr/bin/chromium`; preview local en 127.0.0.1:8765.

- 40 recorridos completos: 10 casos × ES/EN × escritorio 1440×1100 y móvil 390×844. Cinco reintentos representativos por recorrido, debrief, idioma durante la sesión y persistencia de completados tras recarga. Las pruebas focales ejercitan además las 200 selecciones incorrectas (100 por idioma) y recorridos limpios.
- Seis mapas y seis itinerarios Theory: ES/EN a 1440×1100, 1280×900 y 390×844; diez puntos por mapa, ratio, alineación, hit-testing, Enter, Escape y retorno de foco.
- 100 aperturas de artículo: 25 × ES/EN × escritorio/móvil, texto y comprobaciones estáticas, cambio de idioma, cierre y foco. Advertencia visible de revisión verificada de nuevo tras incorporarla.
- **0 errores de consola y 0 fallos de red** en los recorridos.

Capturas: `qa/map-1440-es.png`, `qa/map-390-es.png`, `qa/notebook-1440-es.png`, `qa/notebook-390-es.png`, debriefs de EE-0031/0034/0040 y `qa/map-320.png`.

### Observaciones abiertas: no declarar aprobación final de producción

1. **A 320 px, H03/H08 se solapan aproximadamente 1,49 px.** No hay colisión circular a 390, 1280 ni 1440 px. Se preservan las coordenadas aprobadas. **Revisión solicitada:** examinar `qa/map-320.png` y decidir un ajuste aprobado del mapa o un tratamiento responsive compartido en un contrato posterior. No se movieron puntos ni se parcheó el renderer.
2. Pulsar el selector global de idioma cierra el popover abierto, aunque conserva el Environment. Reproducido también en ENV-001 y ENV-003. Clasificación: deuda previa de UX compartida / ENGINE; no regresión de ENV-004. Stages, reintentos y sección Theory sí conservan la sesión en los recorridos comprobados. No se modificó el Engine.
3. El marcador móvil mide aproximadamente 22,39 px por el estilo compartido. Se verificó teclado/toque/hit-testing; no se declara una auditoría integral WCAG ni aprobación de accesibilidad del producto completo.

## Archivos y exclusiones

Listas completas en `files-changed.txt` y `files-created.txt`.
Modificados: dos módulos Notebook, Changelog y tres archivos de pruebas de catálogo/localización.
Creados: Environment y portada, diez paquetes Experience, manifiestos, snapshots editoriales ES/EN, trazabilidad, prueba focal e informe/QA.
Artefactos ignorados generados localmente: `Frontend/generated/notebooks/` y `Frontend/generated/experience-engine/`; no editados a mano.

Engine, renderer, CSS, workflows y rutas: **sin cambios funcionales**. El único cambio bajo Frontend/products/experience-engine es un test de catálogo, no código del Engine. Experiences anteriores de producción y binarios existentes: **sin cambios**. Trabajo previo docs/standards/: **preservado**.

## Pendiente para producción

Entregar 6–7 imágenes por caso según manifiesto; validar topología, terminales, valores, estado y momento; revisar esquemas/netlists y las reservas de EXP-04/10; revisar técnicamente ES/EN y aprobar asociaciones ICF-06; resolver la revisión visual a 320 px. Después registrar solo assets aprobados y repetir QA de media/revelación y recuperación. Ningún contenido fue elevado a approved/published.

**Confirmación: no se hizo commit, push, merge ni deploy.** No se enviaron mensajes a terceros. El modo publish se usó exclusivamente para comprobar el filtro local. Se entrega una implementación textual revisable con reservas explícitas, no una validación de una instalación eléctrica.

Limitación de entrega: la ruta `/codex/browser/projectless/0002-files-mentioned-by-the-user-uploaded-file-pointe/output` indicada por la conversación no existe en este ejecutor y no se puede crear por permisos del sistema. El informe y las evidencias quedan guardados en el repositorio; la implementación no depende de esa ruta.
