# Digital2Real · Despliegue, monitorización y recuperación

**26 de noviembre de 2026 · Plan operativo propuesto**

## DNS, correo y hosting

La URL de la demostración se conserva bajo `/Web-Digital2Real/`. En producción se propone `d2rautomation.com` como canónico y redirección HTTPS única desde el nombre secundario si el proveedor admite la topología con DNS externo. Verificar compatibilidad del apex con Namecheap, certificado, CAA y comportamiento en IPv4/IPv6. Un subdominio con CNAME puede servir como opción escalonada si no hay soporte de apex sin migración de DNS.

Namecheap BasicDNS y Private Email, buzón `hello` y alias `support` proceden del encargo. La resolución externa y el panel no quedaron verificados en esta sesión. Antes de cualquier cambio autorizado guardar una exportación de la zona, comprobar NS, A/AAAA, CNAME, CAA, MX, SPF único, DKIM por selector registrado, DMARC y DNSSEC. Mantener los nameservers y registros de correo. Evitar añadir un segundo SPF y verificar entrega y autenticación después de cualquier cambio futuro. Configurar MFA y recuperación del registrador, bloqueo de transferencia, aviso de expiración y renovación. [Documentación de Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/)

GitHub Pages sirve demostraciones estáticas y la ruta actual. La política del servicio excluye alojamiento gratuito destinado principalmente a negocio en línea, comercio o SaaS comercial. Alojamiento de producción requiere proveedor aprobado, TLS gestionado, configuración de cabeceras, entorno restringido y proxy/API. [Límites de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## Entornos y CI/CD

| Entorno | Datos | Automatización |
|---|---|---|
| Development | Archivos públicos y fixtures sintéticas. `.env.example` define la configuración opcional del demo. | Builds locales, pruebas de contratos, navegador y lanzamiento con `python -m uvicorn Backend.main:app` desde raíz si FastAPI y Uvicorn están instalados. |
| Staging | Cuentas ficticias, secretos propios, configuración y datos sintéticos. Checkout de prueba tras aprobación. | Artefacto inmutable en subdominio protegido por identidad, revisión de proveedor, verificación de permisos, restauración y rollback ensayados. |
| Production | Datos reales segregados, accesos y backups propios. | Promoción del artefacto validado, aprobación por entorno, identidad de workload y credenciales de mínimo privilegio. |

Variables futuras para el contrato de despliegue, pendientes de arquitectura: `APP_ORIGIN`, `DATABASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `SESSION_SECRET`, identidad del bucket, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, destino de observabilidad. Los secretos de staging y producción se emiten en su gestor y rotan por entorno. El frontend solo recibe valores públicos. Ramas protegidas, revisión de código y sin credenciales persistentes en runners. Usar OIDC donde exista soporte y registrar responsable, uso, creación y próxima rotación.

El workflow actual prueba contratos antes de preparar el artefacto Pages y concede escritura únicamente al deploy. La configuración Pages debe estar preestablecida en GitHub Actions. Cambiarla requiere revisión del titular si está en modo rama. El PR ejecuta el build de solo lectura y bloquea el job si fallan los tests. Confirmar que el check se exige en la regla de main. Siguientes candidatos: pin de Actions por SHA verificado con actualizaciones revisadas, Dependabot para Actions y futuros manifiestos, escaneo de secretos y alertas, CodeQL o equivalente según lenguajes, inventario/SBOM de CDN y backend, SCA a partir de dependencias reproducibles, manifiesto por clasificación y aprobación de promoción de producción. Retener un artefacto previo y sus metadatos de commit, fecha, hashes, migración y configuración, con recuperación verificable.

Migración propuesta: congelar catálogo público, inventariar contenido y enlaces, empaquetar por entorno, validar rutas relativas en staging y ejecutar una promoción con aprobación. Medir errores y latencia tras el corte, conservar origen anterior mientras se verifica y revertir artefacto o destino dentro de la ventana acordada. En base de datos preferir migraciones compatibles y roll-forward ante cambios con escritura. Documentar recuperación por clase de cambio y evitar restaurar indiscriminadamente sobre datos nuevos.

## Cabeceras HTTP

El workflow empaqueta archivos; la verificación de cabeceras en vivo quedó bloqueada. Las políticas siguientes se aplican en el CDN/proxy futuro, con comprobación HTTP de rutas, errores, redirecciones y recursos:

| Control | Política y prueba previa |
|---|---|
| CSP | Iniciar con `Content-Security-Policy-Report-Only` y reportes acotados. Allowlist de script y módulos, `object-src 'none'`, `base-uri 'none'` cuando sea compatible. Inventariar JS/CSS embebido, CSS dinámico, SVG, WebGL, CDN, vídeo, `data:`/blob por caso. Pasar a hashes/nonces o archivos propios y luego a enforcement. Evitar exponer datos sensibles en reportes. |
| Framing | Padres aprobados por ruta. Shell protegido con `frame-ancestors 'none'` si compatibilidad validada; iframes del simulador/lector necesitan `'self'` u origen separado autorizado. `frame-src` acotado. X-Frame-Options como compatibilidad donde proceda. |
| HTTPS | HSTS tras validar TLS, redirects, subdominios y recuperación. Empezar con max-age breve antes de considerar includeSubDomains o preload. |
| Tipo, referrer, permisos | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` o más estricta por ruta, `Permissions-Policy` con denegación de cámara, micro y ubicación cuando no se usen, permitir fullscreen solo donde proceda. |
| Aislamiento | Evaluar COOP, CORP y COEP por recurso. Validar OAuth/Checkout popup, módulos CDN e iframes antes de activarlos. Migrar simuladores a origen aislado antes de darles acceso a una aplicación con sesiones reales. |
| Caché | Inmutabilidad para públicos versionados, revalidación del HTML e índices. `Cache-Control: private, no-store` para proyecciones privadas, identidad y cobros. Confirmar que errores y redirecciones autorizados tampoco llegan a cachés compartidas. |

## Monitorización

Definir un canal interno y un responsable principal y alterno. Propuesta inicial, sujeta a carga medida: sonda HTTPS de shell/catálogo/API readiness cada 5 minutos, expiración TLS y dominio con 30 días de margen, alarma por 5xx > 2 % en 10 minutos con mínimo de volumen, p95 sostenido por encima del SLO que se mida, errores de autenticación y autorización por anomalía, cola de webhooks > 10 minutos, fallos de conciliación o restauración y aumento de tráfico o coste. Evitar incluir PII, credenciales, URLs firmadas, respuestas correctas o payloads completos en logs; limitar acceso y retención de trazas. Verificar reglas ejecutando alertas de prueba y documentar quién recibe y responde.

## Backups, restauración y validez

| Activo | Propuesta inicial | Validación |
|---|---|---|
| PostgreSQL y facturación | Copia automática cifrada, acceso separado, PITR si el objetivo lo requiere y retención aprobada. | Restaurar a un entorno aislado y verificar restricciones, recuentos, entitlements, datos contables y alcance de cifrado. |
| Buckets y contenido | Versionado, protección contra borrado, copias de medios e inventario por hash. | Comparar manifiesto, probar acceso autorizado y revisar permisos tras restauración. |
| Aplicación y configuración | Retener build reproducible y artefacto de despliegue, IaC versionada, referencias a secretos en gestor. | Probar promoción/rollback de versión y rotación. Los secretos de emergencia se custodian por separado. |
| IdP y pagos | Revisar exportación/restauración del proveedor, credenciales y conciliación por referencias. | Reaplicar supresiones, reconciliar entitlements con cobros, expiración de sesiones y registro de revocaciones. |

Objetivos propuestos para piloto, RPO ≤ 24 h y RTO ≤ 8 h. Confirmar que continuidad de cobros y evaluación admite esos límites. Elegir PITR si la pérdida máxima es inaceptable. Realizar un ensayo antes del lanzamiento y trimestralmente. Custodiar copias offline o en cuenta separada según riesgo, probar borrado y retención, y registrar fecha, responsables y tiempos reales.

## Incidentes

1. Confirmar alerta y clasificar alcance. Abrir registro con hora, responsable, impacto, datos afectados y evidencias con acceso restringido.
2. Contener con medios aprobados. Detener publicación, invalidar tokens, suspender rutas o aislar un proveedor según situación. Conservar evidencia y comunicar al titular.
3. Cuando exista credencial afectada, revocar/rotar en origen, revisar uso, reconstruir permisos y verificar propagación. Retirar copias controladas tras preservar evidencia.
4. Si hay brecha de datos, evaluar riesgo, alcance, encargados y afectación. Notificar a la autoridad, cuando proceda, dentro de 72 horas desde conocimiento, y a interesados si existe alto riesgo según RGPD. Registrar también incidentes sin notificación. [RGPD, arts. 33–34](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
5. Recuperar desde versiones verificadas, reconciliar cobros y accesos, ejecutar smoke tests y comprobar alertas. Cerrar con análisis causal, acciones con responsables y verificación de eficacia.
