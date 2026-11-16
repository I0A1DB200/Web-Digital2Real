# CONTRATO CODEX — Integración de 5 assets EE-0032

## Objetivo
Integrar exactamente cinco imágenes didácticas aprobadas visualmente en la Engineering Experience existente **EE-0032 — El contactor KM1 no se activa**, respetando la arquitectura D2R. No crear una Experience nueva ni reescribir el diagnóstico por conveniencia del renderer.

## Clasificación previa
- Tipo de trabajo: **Experience / integración de contenido**.
- Clasificar cada hallazgo como ENGINE, CONTENT, INTENTIONAL REUSE, UNUSED o deuda técnica antes de cambiar archivos.
- Notebook es SSOT técnico; Experience enseña razonamiento diagnóstico; Codex ejecuta, no decide producto.

## Inspección obligatoria (antes de editar)
1. Inspeccionar estructura del repositorio, instrucciones AGENTS.md, esquema de YAML/JSON, assets, rutas, manifest, componentes de visualización y tests.
2. Localizar EE-0032 por identificador y título; confirmar si pertenece a ENV-004 y cuál es su flujo real de decisiones. No inventar rutas ni IDs.
3. Revisar los Notebook pertinentes, especialmente circuito de mando, automantenimiento, S1, KM1 y seguridad eléctrica.
4. Comparar el flujo de EE-0032 con la función prevista de cada imagen. Identificar dónde una imagen revelaría prematuramente la causa raíz.
5. Leer `README.md` y `QA_PENDIENTE.md`.

## Inventario cerrado
- `assets/01_disposicion_cuadro.png` — localización física de componentes.
- `assets/02_esquema_multifilar.png` — esquema de potencia y mando; contacto KM1 NO paralelo a S1 NO.
- `assets/03_tension_S1_14.png` — comparación 0.0 VDC en S1:14 sin pulsar / pulsado.
- `assets/04_continuidad_S1.png` — OL en S1:13–14 sin pulsar / pulsado, con equipo aislado.
- `assets/05_tension_bobina_KM1.png` — KM1:A1–A2, 0.0 VDC antes / 24.2 VDC después de reparación.
- **No existe Asset 06 aprobado: NO integrarlo ni generar sustituto.**

## Contrato de integración
1. Reutilizar el mecanismo existente de assets/experiencias, nombres y rutas convencionales. Evitar duplicación de archivos si ya existen assets equivalentes.
2. Insertar cada asset solo cuando la decisión o etapa de diagnóstico lo justifique. 01–02 como contexto, 03 como observación, 04 como confirmación del contacto (si la experiencia ya alcanzó ese punto), 05 solo en etapa de comprobación/resolución.
3. No mostrar Asset 04 ni el panel de reparación del 05 antes de que la secuencia pedagógica permita revelar la causa. Si el Engine no puede restringir visibilidad de la imagen compuesta, registrar bloqueo y proponer solución arquitectónica; no aplicar hacks de render.
4. Mantener invariantes: navegación, decisiones, evaluación, reset, estado, accesibilidad, traducciones ES/EN y funcionamiento de otras Experiences. No añadir TIA Portal ni PLC: circuito cableado.
5. No inventar referencias Siemens, códigos de evento, conexiones ni valores de medida fuera de lo representado. Los valores son simulados.
6. **No alterar los PNG originales sin aprobación expresa.** La inconsistencia de etiquetas A1/A2 en el Asset 05 debe reportarse como bloqueo de publicación técnica, no ignorarse.
7. Mantener los assets originales con hashes trazables y no modificar Notebook SSOT salvo autorización expresa.

## Fuera de alcance
No rediseñar el Engine, no crear nuevos assets, no introducir nuevas Experiences, no publicar contenido no verificado, no cambiar el escenario o causa raíz, no modificar servicios externos.

## Validación
- Ejecutar validaciones del repositorio: esquema, integridad de referencias, rutas y carga de imágenes, tests unitarios/integración y build.
- Comprobar visualmente, si hay navegador disponible, el orden y la revelación de cada imagen en escritorio/móvil. Si no hay navegador, declarar la limitación.
- Revisar que no se filtra solución antes de tiempo y que no hay assets huérfanos o duplicados.
- Contrastar etiquetas, valores y diagramas con QA_PENDIENTE.md; separar aprobación visual de validación eléctrica.

## Informe final obligatorio
1. Rama/commit base y estado inicial.
2. Archivos inspeccionados y archivos modificados.
3. Mapa de asset → etapa/decisión exacta.
4. Clasificación de hallazgos (ENGINE/CONTENT/INTENTIONAL REUSE/UNUSED/deuda).
5. Resultados de comandos/tests/build y comprobación visual (o limitaciones).
6. Bloqueos técnicos de publicación, en particular Asset 05 y validación del esquema.
7. Diff/resumen y cambios propuestos para aprobación.

**No hacer commit, push, merge ni deploy sin autorización del usuario.** Si faltan requisitos o hay bloqueo, detenerse y reportar; no improvisar.
