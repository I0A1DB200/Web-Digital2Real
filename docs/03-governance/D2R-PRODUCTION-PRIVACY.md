# Digital2Real · Registro de privacidad y preparación legal

**26 de noviembre de 2026 · Borrador interno de trabajo, sin vigencia contractual**

## Titular y fuentes

El titular ejerce como autónomo en España y usa Digital2Real como marca. Usar una única configuración custodiada con nombre completo, NIF, domicilio legal exigible, datos de inscripción si proceden, marca, dominio y contactos corporativos. El titular aporta y verifica valores, confirma domicilios y recibe asesoramiento sobre lo exigible. Publicar en el Aviso legal solo campos aprobados y obligatorios. Mantener el emisor fiscal versionado en facturación. La rama contiene únicamente referencias corporativas y propuestas, sin nuevos datos personales del titular. [LSSI-CE, arts. 10 y 22](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)

## Inventario de tratamientos

| Tratamiento | Estado y datos | Base propuesta y acceso | Retención o acción |
|---|---|---|---|
| Visita | Hosting estático y solicitudes al CDN Three.js en simuladores. Terceros pueden recibir IP, hora, navegador y referrer según configuración. | Evaluar operación y seguridad, encargo o relación independiente. Identificar logs reales, subencargados, transferencia y DPA. | Plazos de proveedor pendientes. Evitar telemetría adicional. |
| Idioma y progreso de práctica | Idioma, IDs de experiencias, bloques de teoría y estados de práctica en dispositivo. | Evaluar dispositivo y RGPD por finalidad. Lectura/escritura en origen del navegador. | Persistencia sin TTL explícito. Documentar reset y uso en dispositivo compartido. |
| Contacto y derechos | Correo corporativo previsto. Si un usuario lo usa, se procesan dirección, mensaje y metadatos por servicio de correo. | Atención de solicitud precontractual, contractual o interés legítimo según caso. Acceso del titular y soporte autorizado. | Definir borrado tras resolución y excepciones por reclamaciones. Verificar buzón y alias. |
| Cuenta y sesión | Previsto. ID externo, contacto verificado, sesión y atributos mínimos. | Contrato o medidas precontractuales, seguridad del servicio por finalidad. IdP y soporte autorizado. | Propuesta de expirar sesiones por inactividad y revocar al cierre. |
| Compra, soporte y facturación | Previsto. Referencias, pagos, impuestos, facturas y país cuando proceda. Checkout alojado. | Contrato para servicio, obligación legal para datos fiscales, interés legítimo evaluado para antifraude. | Calendario fiscal validado por asesoría. Conservar en acceso restringido y separar de la cuenta. |
| Evaluación y certificados | Previsto. Acciones, resultados, versión, identificador público y revocación. | Contrato de evaluación y gestión de reclamaciones. Aprobar finalidad/base para verificación pública. | Determinar ventana de impugnación, retención por resultado y minimalidad del verificador. |
| Telemetría facultativa, marketing o replay | Integración de aplicación no localizada en la revisión dirigida. | Evaluar consentimiento separado y revocable cuando aplique. Desactivado por defecto en diseño. | Minimizar, limitar plazo, documentar proveedores y borrado. |

Completar registro de actividades con categorías de interesados, destinatarios, encargado/subencargados, país, garantías de transferencia, plazos y medidas. Identificar tratamiento de menores, mercados objetivo y necesidad de evaluación de impacto antes de introducir perfilado o evaluación a escala. Verificar minimización por campo y separar el consentimiento opcional de la aceptación contractual. [RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/oj) · [LOPDGDD](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673)

## Almacenamiento en navegador

| Clave / recurso | Tecnología y finalidad | Caducidad y acción |
|---|---|---|
| `digital2real.experience-locale.v1` | localStorage, preferencia explícita ES/EN | Sin TTL. Conservar alcance, revisar exención y documentar. |
| `digital2real.environment-progress.v1`, `digital2real.environment-progress.v2` | localStorage, progreso de práctica en mismo dispositivo | Sin TTL. Evaluar si persistencia está solicitada y es estrictamente necesaria, documentar finalidad y permitir borrado. |
| `d2r-document-language` | localStorage del simulador y lector documental, preferencia de lectura | Sin TTL. Documentar alcance en el mismo origen. |
| Cookies, IndexedDB, píxeles, servicios externos | No se observaron escrituras explícitas de cookies ni IndexedDB en los módulos principales revisados. CDN de ambos simuladores y configuración de hosting requieren inspección de cabeceras reales. | Registrar responsables y tiempos de cada integración. La carga de un CDN por sí sola tampoco demuestra cookies. |

Inspeccionar tráfico, almacenamiento y cabeceras en producción y en los iframes, con contexto limpio y tras cada elección. Para almacenamiento opcional sujeto a consentimiento, bloquear carga hasta aceptación, ofrecer aceptar y rechazar al mismo nivel, granularidad y retirada accesible, limpiar lo controlable y conservar evidencia por versión/finalidad. Si toda persistencia queda justificada como exenta, publicar información proporcional sin diálogo de consentimiento innecesario. [Guía AEPD](https://www.aepd.es/guias/guia-cookies.pdf)

## Derechos y comunicación de incidentes

Recibir acceso, rectificación, supresión, oposición, limitación, portabilidad y retirada en un canal confirmado. Verificar identidad de forma proporcional, registrar fecha y alcance, exportar datos del interesado en formato estructurado cuando proceda y coordinar con encargados. Responder en un mes conforme al RGPD, con ampliación motivada y comunicada dentro del primer mes si aplica. Registrar motivos de retención legal, anonimizar elementos que puedan conservarse y retirar procesamientos facultativos. Aislar backups hasta expiración y reaplicar supresiones al restaurar. Preparar reclamaciones ante la AEPD y evaluación de notificación de brechas cuando proceda. [Derechos AEPD](https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos) · [RGPD, arts. 12–22 y 33–34](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

## Borradores de documentos ES/EN

Cada fila define el alcance y el borrador de sustancia. Los textos públicos requieren revisión y traducción jurídica concordante. Para publicación futura, almacenar una sola entrada por documento/idioma/versión con hash, fecha de vigencia, estado y aprobador fuera del frontend hasta aprobación. El router central almacenará rutas exactas y permitirá entrada directa, recarga, historial y cambio ES/EN, con título y foco de página. El footer generará los enlaces solo para documentos vigentes y aprobados. En esta rama el contacto usa `mailto:`.

| Ruta | Borrador ES | Working draft EN |
|---|---|---|
| `#legal` | Digital2Real es la marca de [titular aprobado]. El servicio se presta desde [domicilio aprobado]. Identificación y contacto [campos exigibles]. Revisar propiedad intelectual y condiciones de uso. | Digital2Real is the trading name of [approved operator]. The service is operated from [approved address]. Provide required registration and contact details, intellectual property and terms. |
| `#privacy` | [Titular] tratará los datos indicados en el registro por finalidades, con destinatarios, transferencias y plazos pendientes de confirmación. Puede ejercer sus derechos por [canal aprobado]. | [Controller] processes the data described in the register for documented purposes. Confirm recipients, transfers, retention and the channel for exercising rights. |
| `#cookies` | Se guardan preferencias de idioma y progreso de práctica en el dispositivo. Informar de duración, actores, borrado y controles que se confirmen. | Language preferences and practice progress are stored on the device. Disclose confirmed durations, parties, deletion and applicable controls. |
| `#terms` | El servicio incluye contenidos de automatización y práctica digital. Definir licencia de uso personal, alcance, compatibilidad, soporte y procedimiento de reclamación respetando derechos imperativos. | The service offers industrial automation content and digital practice. Define the personal licence, scope, compatibility, support and complaint process subject to mandatory rights. |
| `#billing` | Suscripción semestral a [precio total y moneda], con [renovación, cancelación, reembolsos y desistimiento aprobados]. Confirmar por soporte duradero el contrato y las opciones elegidas. | Six-month subscription at [total price and currency], with [approved renewal, cancellation, refund and withdrawal terms]. Confirm the contract and selections on a durable medium. |
| `#security` | Comunicar incidencias al [canal aprobado]. Indicar datos mínimos para responder y alcance autorizado de pruebas cuando exista política. | Report security issues through [approved channel]. Explain minimal reporting details and any authorized testing scope. |
| `#contact` | Contacto general `hello@d2rautomation.com`. Confirmar `support@d2rautomation.com` para servicio y reclamaciones. | General contact `hello@d2rautomation.com`. Verify `support@d2rautomation.com` for service and complaints. |

## Contratación, fiscalidad y lanzamiento

- Antes de cobrar mostrar características, duración, precio total con impuestos, renovación, cancelación, desistimiento, soporte y remedios de conformidad. Orden de pago inequívoca, registro de versión y aceptación, confirmación en soporte duradero. Conservar consentimiento previo expreso para ejecución y reconocimiento de pérdida del derecho solo para la excepción aplicable. Distinguir servicio en curso de suministro de contenido digital. Revisar funcionalidad de desistimiento online, accesibilidad, renovaciones y reclamaciones según canal y mercados. [TRLGDCU, arts. 97–108 y 114 y ss.](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555) · [LSSI-CE, arts. 27 y 28](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)
- Asesoría debe clasificar actividad y prestación según automatización y participación humana, verificar IVA, reglas de localización, evidencia de país, B2B/B2C e inversión del sujeto pasivo cuando corresponda, OSS y tratamiento extracomunitario. Configurar impuesto y moneda por SKU, comprador y territorio. No aplicar exención por formación sin fundamento específico. Definir series de facturas y rectificativas, distinguir factura de justificante de pasarela y conservar datos contables por finalidad. [AEAT · IVA y comercio electrónico](https://sede.agenciatributaria.gob.es/Sede/iva/iva-comercio-electronico.html) · [Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696)
- Revisar SIF y facturación electrónica B2B por separado; confirmar ámbito, excepciones y régimen territorial. El RDL 43/2026 remite el plazo de adaptación SIF al previsto en la disposición final cuarta, apartado 1.b del RD 238/2026. Validar su cómputo y vigencia con asesoría en la decisión de proveedor. [RDL 43/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-24701)
- Bloqueos del titular antes del lanzamiento: identidad legal y contactos, servicio y mercados, fiscalidad y emisor, condiciones comerciales, encargado y transferencias, plazos de retención, revisión jurídica ES/EN y aprobación de documentos con fecha de vigencia.


## Controles locales verificados

La API de laboratorio sirve la versión efectiva ES/EN de documentos sintéticos
y registra la versión aceptada una vez por usuario. La exportación está limitada
al sujeto autorizado. El cierre local bloquea el token existente para ese sujeto
y elimina marcadores de práctica. Conserva referencias contables y aceptaciones
para que se decida su retención legal. Antes de habilitar derechos reales se debe
integrar el IdP, validar la supresión o disociación transversal, cancelar la
renovación en el proveedor y aplicar la caducidad de copias. Los documentos
contractuales de producción siguen sujetos a aprobación.
