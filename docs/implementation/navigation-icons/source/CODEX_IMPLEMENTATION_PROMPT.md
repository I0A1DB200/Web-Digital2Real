# D2R — Contrato de implementación Codex: navegación por iconos

## Rol y objetivo
Actúa como implementador del repositorio Digital2Real. Integra los tres iconos aprobados de navegación en el header existente, conservando arquitectura, rutas, idiomas y comportamiento actual. El icono de Usuario/Mi cuenta está aprobado visualmente pero NO se publica ni se enlaza todavía.

**Clasificación**: arquitectura/UI de navegación (no contenido Notebook ni Experience). No alterar Experience Engine, YAML ni producto.

## Inspección obligatoria (antes de editar)
1. Inspecciona la rama, el estado de Git, los componentes del header y menú móvil, el enrutado, sistema de i18n ES/EN, design tokens y pipeline de assets. No asumas nombres de archivos, rutas ni framework.
2. Identifica el icono exacto `engineering-notebook.svg` ya aprobado por el usuario en una sesión anterior. Su ruta de referencia temporal era `/__codex_browser_temporary_files__/f00f5050-216f-4657-9c1c-0352e13f721b/engineering-notebook.svg`. **Esa ruta temporal puede no existir**. El archivo incluido `assets/engineering-notebook-REFERENCE-VERIFY.svg` es una referencia disponible, no se ha verificado que coincida con el SVG temporal aprobado. Si no es posible verificar equivalencia, no reemplaces el arte Notebook aprobado: conserva el original si está en el repo y documenta el bloqueo preciso.
3. Comprueba la visualización real y dimensiones de los assets; los PNG aprobados de Experience Lab, Acerca de y Usuario son imágenes fuente, no SVG vectoriales. No los conviertas automáticamente a un SVG embebiendo un PNG y llamándolo vectorial.

## Fuente de verdad de assets en este paquete
- `assets/engineering-notebook-REFERENCE-VERIFY.svg`: candidato de referencia; **verificar contra SVG aprobado antes de usar**.
- `assets/experience-lab-approved.png`: icono de célula industrial 3D con robot y transportador, versión visual aprobada.
- `assets/about-fingerprint-approved.png`: huella de alto detalle plana, sin marco ni relieve, blanco/gris y un trazo naranja, versión aprobada.
- `assets/user-account-approved-FUTURE.png`: icono de usuario y engranaje, **solo reserva futura**.
Los PNG podrían necesitar optimización, recorte transparente o variantes responsive. Preserva su aspecto y no introduzcas rediseños creativos. El archivo Experience Lab de origen tiene fondo negro integrado; evalúa si encaja en el header oscuro antes de decidir su tratamiento. No elimines píxeles oscuros internos de la máquina al crear transparencia.

## Alcance de implementación
1. En las rutas existentes, sustituye el texto visible de los enlaces de navegación `Notas de ingeniería`/`Engineering Notebook`, `Experience Lab` y `Acerca de`/`About` por su icono correspondiente. Conserva los textos accesibles traducidos (`aria-label`, `title` o equivalente) y el foco de teclado. Un tooltip localizado al pasar el ratón/en foco es deseable si ya existe un patrón accesible.
2. Preserva rutas y lógica de página activa. Mantén el subrayado/acento naranja y estados hover/focus/active sin hacer que los iconos cambien de forma o pierdan contraste.
3. Mantén selector ES/EN existente y navegación responsive; no añadas textos redundantes junto a los iconos en desktop si el objetivo es navegación icon-only. En móvil prioriza accesibilidad y legibilidad.
4. Igualar altura visual y área clicable: sugerencia, iconos visibles ~28–36 px cuando permita apreciar detalles, hit area >=44x44 px. Ajusta según pruebas visuales reales a 100% y en viewport móvil; no aplicar tamaño fijo ciegamente.
5. Integrar assets en la ubicación y convención ya existente del proyecto. Optimiza formatos/peso si procede sin degradar; no usar imágenes externas, CDN ni librerías nuevas si no son necesarias.
6. Icono Usuario: deja el archivo en una carpeta de assets reservados/documentada según convención existente, sin nueva ruta, botón, login, menús, flags ni placeholder visible. No añadas autenticación.

## Invariantes
- Mantener intactos contenidos de Notebook y Experience Engine, traducciones existentes, navegación por teclado, comportamiento de navegación, menú móvil y demás secciones de la web.
- Mantener todas las rutas existentes y el funcionamiento de selector ES/EN.
- No tocar infraestructura DNS, Namecheap, correos, hosting o despliegue externo.
- No sustituir por emojis, iconos genéricos ni diseños alternativos; usar exclusivamente assets aprobados o derivados técnicos fieles.
- No publicar ni modificar servicios externos automáticamente.

## Validación obligatoria
1. Ejecuta lint, tests y build existentes; registra comandos/resultados reales, sin inventar pruebas no ejecutadas.
2. Comprueba en navegador, si está disponible, desktop y móvil: proporciones y nitidez de los tres iconos, contraste en fondo oscuro, ausencia de bordes/fondos no deseados, alineación con ES/EN y estados active/hover/focus.
3. Verifica en ES y EN que los tres enlaces conservan su destino y nombre accesible. Comprueba teclado (Tab/Enter), lectores de pantalla mediante inspección de etiquetas, menú móvil y que Usuario NO aparece.
4. Comprueba que el icono de Experience Lab sigue siendo reconocible a escala final; no asumir que un PNG de alta resolución funciona bien a 24 px.
5. Incluir capturas solo si hay navegador funcional; si no, indicar expresamente el bloqueo.

## Fuera de alcance
- Rediseñar componentes o reestructurar rutas.
- Crear panel de usuario/autenticación o modificar producto, simuladores, YAML, Experiences, Notebook, Engine.
- Decidir un deployment, migrar DNS o enviar código a producción.

## Entrega y reporte
- Realizar cambios locales y mostrar diff, archivos creados/modificados, nueva ubicación de iconos, tamaños/formato final, pruebas ejecutadas y resultados, capturas si disponibles, riesgos y pendientes.
- Separar explícitamente `VALIDADO`, `NO VERIFICADO` y `BLOQUEADO`.
- Si falta el SVG Notebook aprobado, **no afirmes que has integrado el aprobado**; consigna qué archivo existe y solicita la ruta/archivo definitivo para reemplazarlo. No mezcles esa incertidumbre con el estado de los otros tres assets.
