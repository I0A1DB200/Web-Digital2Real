# D2R Cobot — integración de tarjeta independiente

Estado: IMPLEMENTED, AUTOMATED PASS, Browser QA de tarjeta PASS.
Repositorio /workspace/Web-Digital2Real; rama work. Sin commit, push o despliegue.
Clasificación: EXPERIENCE / CONTENT + ENGINE/UX de catálogo.
La petición «hazlo» autoriza la capacidad compartida de catálogo necesaria para mostrar la tarjeta independiente.

## Árbol real y propiedad

```text
Web-Digital2Real/                                           [existente]
├── content/experiences/robotics/                            [creado en esta tarea]
│   └── EE-0041-cobot-palletizing/                          [creado; nombre exigido por packager]
│       ├── experience.yaml                                [creado: SSOT V2, technical_review, catalog_card]
│       ├── brief.yaml                                     [creado: origen de requisitos, referencia al SSOT]
│       ├── README.md                                      [creado: alcance y límites]
│       ├── locales/                                       [creado]
│       │   ├── es.yaml                                    [creado: copy localizada]
│       │   └── en.yaml                                    [creado: copy localizada]
│       ├── media-source/README.md                         [creado: procedencia y semántica]
│       └── assets/README.md                               [creado: política de evidencia sin imagen]
├── Frontend/assets/images/                                [reutilizado]
│   └── d2r-cobot-palletizing-card.webp                      [creado en turno anterior; binario intacto]
├── Frontend/products/experience-engine/components/         [reutilizado]
│   ├── environmentNavigator.js                            [modificado: tarjetas independientes opt-in]
│   └── experienceLocale.js                                [modificado: lede ES/EN incluye Experience]
├── Frontend/products/experience-engine/tests/              [reutilizado]
│   └── experienceWorkspace.test.js                         [modificado: navegación/alt de tarjeta]
├── scripts/                                               [reutilizado]
│   ├── package-experience-engine.mjs                       [modificado: validación/copia/proyección de catalog_card]
│   └── tests/                                             [reutilizado]
│       ├── cobotRegistration.test.mjs                      [creado: contrato ES/EN, identidad y hash]
│       └── package-experience-engine.test.mjs               [modificado: 41 entradas preview, asset y gates]
├── docs/                                                  [reutilizado]
│   ├── 01-architecture/D2R-EXPERIENCE-ENGINE.md              [modificado: contrato opcional de tarjeta]
│   └── 06_Changelog.md                                     [modificado]
└── repository-tree-after.md                                [actualizado: este informe]
```

Los nombres anteriores de esta tarea ee-0041-cobot-palletizing se corrigieron a EE-0041-cobot-palletizing al ejecutar la validación completa del packager, que exige ese patrón. No existe una segunda copia.

## SSOT y datos derivados

experience.yaml public.catalog_card es la única autoridad editable de imagen/ratio/alt; título/resumen siguen los campos existentes con locales por ID. Se retiró access_card de brief.yaml para evitar autoridades paralelas. Tokens y CSS compartidos existentes intactos; se reutilizan los estilos environment-card, object-fit cover, posición centrada y relación 16:9. No hay condición de ID Cobot en el renderer ni modificación de Experience Player.

01_card_asset/d2r-cobot-palletizing-card.webp → Frontend/assets/images/d2r-cobot-palletizing-card.webp (fuente de imagen pública). El packager crea Frontend/generated/experience-engine/cards/EXP-UR-COBOT-001.webp como derivado reproducible, no una segunda fuente editable. WebP 1672×941; 141928 bytes; SHA256 origen y destino 37f3226f4904fd7a819893832338f0090c9470e805192b96a9feb69da737528e. La prueba compara también los bytes del derivado. PNG y emulador/PLC ZIP permanecen solo en el paquete de entrega.

## Navegación y publicación

Frontend/#experience-lab muestra la tarjeta tras generar preview. Activación nativa por botón → onOpenExperience(EXP-UR-COBOT-001) → Workspace existente → JSON ES/EN. No URL falsa de simulator ni nueva regla de acceso. La Experience tiene access free y technical_review; publish sigue exigiendo published + technical_validation pass. El test de modos confirma que publish la excluye. No se crearon ENV ni alteraron sus diez asociaciones. Experiencias existentes sin catalog_card no adquieren tarjeta nueva.

La tarjeta abre el caso textual inicial de interpretación de datos del prototipo, no el simulador 3D. La revisión técnica/editorial del caso y cualquier ampliación a programación interactiva siguen pendientes. No se presenta validación de una instalación física ni cinemática certificada.

## Validación ejecutada

- Contrato V2 y empaquetado individual ES/EN: PASS.
- node scripts/package-notebook.mjs y node scripts/package-experience-engine.mjs --mode=preview: PASS.
- node --test scripts/tests/cobotRegistration.test.mjs scripts/tests/package-experience-engine.test.mjs Frontend/products/experience-engine/tests/experienceWorkspace.test.js: 48/48 PASS.
- Tras ajustar el lede ES/EN, suite de Workspace repetida: 37/37 PASS.
- node --check de los dos módulos modificados de lógica y git diff --check: PASS.
- Chromium real: tarjeta carga en ES/EN a 390×950 y 1440×950; dimensiones naturales 1672×941; alt presente; foco y apertura por Enter llegan al inicio de la Experience; cero pageerror. Inicio por puntero hasta primera decisión comprobado en ES/EN. Inspección visual de capturas móvil/escritorio: cobot/cinta/palé visibles, sin recorte clave.
- Capturas de revisión conservadas en /workspace/work/cobot-{es,en}-{390,1440}.png. Son intermedios locales, no adjuntos entregados.
- Browser QA aquí cubre tarjeta/apertura e inicio del caso; no declara corrida completa del alumno ni aprobación técnica del contenido.
- Descarga del navegador Playwright falló por 403 de red; se usó correctamente /usr/bin/chromium ya instalado. No bloqueo residual de QA de tarjeta.
- No lint/typecheck configurados mediante package.json; no se declaran ejecutados.

## Preservación

PLC nominal V1.9, movimientos del simulador 3D y Watch Table NO modificados. ZIP de referencia SHA256 cf92dc04c29f1e53b4bba69b07c5ee4046553c1470b11bcfefcd5cce1780cf93. Sin fuentes o ZIP de prototipo en el árbol público. Sin cambios de credenciales, pagos, reglas de entitlement, progreso, scoring del Engine o lógica de simulación. Los cambios de turnos anteriores se conservaron y completaron; estado inicial de este turno incluía asset, borrador, pruebas e informe sin commit.

## Integración autorizada en main — 2026-11-17

El usuario solicitó commit/push y después fusión en main y despliegue. Se integra origin/main 7e66b20 conservando la tarjeta D2R Inspection Cell y las imágenes EE-0032 incorporadas en paralelo. Único conflicto: changelog, resuelto conservando ambas entradas. Builds Notebook/Experience preview PASS; 51/51 tests PASS incluyendo simulatorCard; navegador ES/EN a 390 y 1440 px PASS sin pageerror. Este registro sustituye el estado anterior «sin commit/push/despliegue»; el resultado remoto del despliegue se confirma por GitHub Actions tras el push. El caso mantiene technical_review y no se afirma aprobación técnica del contenido.

## Corrección de navegación — 2026-11-17

Incidencia reportada: al abrir Cobot se veía D2R Inspection Cell. La identidad seleccionada era correcta, pero scrollWorkspaceToTop desplazaba la vista hacia el destacado de simulador del shell, situado antes del Workspace. Corrección en Frontend/app.js y ExperienceWorkspace: callback genérico onExperienceChange oculta ese destacado mientras carga/abre una Experience y lo restaura al regresar al catálogo; sin condiciones por ID ni modificación de fuentes, PLC o simuladores. Changelog y prueba de ciclo de vida actualizados. Build preview PASS; 42/42 tests relevantes PASS; Chromium ES/EN a 390/1440 verifica imagen, apertura por teclado, encabezado de Cobot, destacado Inspection oculto y restauración al volver al catálogo, sin errores JS. Commit/push y despliegue autorizados por la petición de corrección de la web ya desplegada y autorización previa de la sesión.

## Corrección definitiva de destino — HTML Cobot suministrado

El usuario aclara expresamente que la tarjeta debe abrir el HTML del ZIP, no el caso textual. Esa solicitud autoriza publicar el HTML original y prevalece sobre la restricción anterior del paquete de referencia.

Creado Frontend/simulators/cobot/index.html, única copia canónica de runtime estático, extraída de D2R_Cobot_Engineering_Experience_V3_6.zip dentro del ZIP adjunto actualizado. HTML idéntico al original: SHA256 e8abcef8e8197da333d1b90e944fb7337c9887c9fc5b00c28a258477d4b5e6d2; 193698 bytes. El title interno original conserva V3.4.2 Visual y el encabezado visible V3.6; no se alteraron. La dependencia CDN Three.js y las funciones/descargas embebidas se conservan como parte del HTML; ningún ZIP externo, CSS de referencia o QA.json se copió al árbol público.

experience.yaml public.catalog_card.target = simulators/cobot/index.html. El packager valida formato/ruta/existencia y emite href relativo. environmentNavigator usa enlace nativo cuando hay href; las demás tarjetas siguen abriendo Workspace. CSS existente adapta el enlace sin subrayado. Resúmenes ES/EN actualizados para describir el simulador; el idioma interno del HTML se conserva. Documentación de arquitectura, README y changelog actualizados.

Validación: build preview PASS; 49/49 tests de registro/empaquetado/Workspace PASS antes de añadir la regresión de enlace; suite Workspace con esa regresión añadida 39/39 PASS. Chromium real ES/EN, 390/1440: clic y Enter navegan a /simulators/cobot/index.html, título Cobot, canvas 3D presente, sin pageerror y vuelta al catálogo mediante historial. Inspección visual confirma célula 3D y Watch Table. No se modifica ciclo PLC, fuentes internas, posiciones, interpolación o lógica del simulador. Pendiente únicamente resultado de despliegue al registrar este informe.
