# Contrato Codex — EE-0033

## Objetivo
Integrar **EE-0033: El motor se detiene por sobrecarga** en el Experience Engine de Digital2Real, reutilizando sus contratos, navegación, traducciones y semántica de assets existentes. No crear un producto nuevo, ni un renderer especial.

## Inspección obligatoria ANTES de editar
1. Inspeccionar estructura actual de Experiences y entradas EE-0031/EE-0032, esquemas de datos, i18n ES/EN, rutas y tests.
2. Comprobar convenciones de IDs y nomenclatura; localizar el catálogo/registro canónico.
3. Verificar la correspondencia de cada imagen en `assets/` con la ficha y `QA_PENDIENTE.md`.
4. Clasificar cada modificación propuesta como CONTENT, ENGINE, INTENTIONAL REUSE, UNUSED o technical debt.
5. Identificar y comunicar cualquier conflicto entre assets y arquitectura antes de proponer hacks.

## Contenido funcional
- Escenario: cinta arranca, sobrecarga de rodillo R1, F2 dispara y KM1 cae.
- Datos didácticos: motor 1,5 kW / 400 VAC / 3,8 A; corriente 5,6 A en sobrecarga y 3,5 A tras reparación; ajuste F2 3,8 A.
- Evidencias y progresión: cuadro, esquema, pinza L1, inspección F2, OL 95–96 en condiciones seguras, rodillo R1.
- Decisiones del alumno deben diferenciar síntoma, protección y causa raíz. Penalizar aumentar F2 o rearmar reiteradamente.
- Bloquear continuidad si no se declara aislamiento, ausencia de tensión y aislamiento de caminos paralelos.
- No afirmar un tiempo de disparo concreto ni una certificación IEC de los dibujos.

## Invariantes
- Notebook es SSOT técnico permanente; Experience enseña decisiones y diagnóstico.
- No duplicar conocimiento canónico ni introducir excepciones de renderer para compensar imágenes.
- No modificar EE-0031/EE-0032 salvo ajustes imprescindibles y justificados de arquitectura.
- Mantener i18n, accesibilidad, responsive y enlaces actuales.
- Conservar los seis PNG originales sin regenerarlos silenciosamente.
- No inventar referencias Siemens, calibres, cableado o medidas.

## Alcance y restricciones
- Preparar integración en rama de trabajo y pruebas, pero **no publicar ni desplegar** mientras QA técnico humano siga pendiente.
- No commit/push/merge/deploy sin autorización explícita.
- Si hay contradicciones eléctricas en un asset, registrar incidencia y proponer corrección en contenido/fuente; no ocultarla con overlays o parches del Engine.

## Validación
- Validación de schema de Experience, asset paths y traducciones.
- Tests existentes y nuevos tests de progresión, decisiones erróneas, seguridad de continuidad y resultado de reparación.
- Inspección visual en desktop y móvil si hay navegador disponible; indicar claramente lo no ejecutado.
- Verificar que todas las rutas y referencias de imágenes funcionan y que la EE no altera experiencias anteriores.

## Informe final obligatorio
Resumen de archivos editados, clasificación CONTENT/ENGINE/etc., mapa de 6 assets, pruebas ejecutadas y resultados, riesgos técnicos pendientes, discrepancias visuales/eléctricas, y estado de publicación **BLOQUEADA por QA humano**.
