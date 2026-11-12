# ENV-004 — Industrial Electrical Systems
## Master Content Specification · Versión editorial 1.0 · 11 noviembre 2026

**Estado:** propuesta editorial completa para revisión técnica; no implementada.
**Idioma fuente:** español. La localización EN queda pendiente y debe derivarse del texto aprobado.
**Producto:** Notebook (conocimiento permanente) + Experience Engine (decisiones y diagnóstico).
**Nivel:** iniciación → intermedio. **Público:** técnicos de mantenimiento, electricistas industriales y automatistas.
**Alcance:** circuitos industriales de baja tensión, mando 24 VDC, motores trifásicos, protección, interpretación de esquemas y diagnóstico seguro.
**Fuera de alcance:** trabajos en tensión como ejercicio, bypass de protecciones, procedimientos de intervención sobre instalaciones reales, alta tensión, diseño reglamentario certificado.

> **Nota de arquitectura:** los cinco bloques son itinerarios de lectura y práctica basados en entradas Notebook. No constituyen un tercer producto. Las diez EXP reutilizan estas entradas mediante identificadores. Los escenarios, valores y nombres de equipos son **datos didácticos simulados**, no especificaciones de un equipo comercial ni instrucciones para operar una instalación real. Antes de integrar, comparar estructura de etapas, IDs, opciones y campos con el contrato YAML vigente; aquí se propone un guion editorial de cinco momentos por EXP, sin afirmar que sea el esquema de Engine.

## 0. Objetivos y criterios de calidad

**Resultado esperado:** al finalizar, el alumno sabe identificar una arquitectura de alimentación, distinguir mando de potencia, seguir referencias de esquema, elegir una medición que discrimine hipótesis, interpretar su resultado, aislar una causa raíz y definir una verificación segura.

**Método común:** síntoma → hipótesis → evidencia → decisión → verificación. Las respuestas incorrectas tienen una razón técnica, no se penalizan por ser «menos prudentes»; la seguridad se integra como condición obligatoria de cualquier trabajo real. Ninguna EXP se resuelve cambiando piezas sin prueba.

**Normativa de referencia para revisión técnica:** IEC 60204-1 (equipamiento eléctrico de máquinas), IEC 60947 (aparamenta), IEC 60617 (símbolos), IEC 61010 (instrumentos), IEC 61557 (verificación), IEC 60364 / normativa local aplicable, EN 50110-1 (operación de instalaciones eléctricas). Comprobar edición y aplicación concreta antes de publicar; estas menciones no certifican conformidad.

**Seguridad transversal:** la desenergización, consignación/LOTO, comprobación de ausencia de tensión con procedimiento e instrumento adecuados, control de energía almacenada y autorización del personal son condiciones previas a inspección invasiva, continuidad, resistencia o aislamiento. Las lecturas energizadas mencionadas en escenarios son **registros ya obtenidos por personal autorizado** o simulaciones, nunca invitaciones a medir tensión en vivo. No se debe medir resistencia con un circuito energizado, ni aplicar un megóhmetro a electrónica conectada. No se puentean E-STOP, relés térmicos ni diferenciales para diagnosticar.

---

# PARTE I — NOTEBOOK: CINCO BLOQUES DE TEORÍA COMPLETA

## BLOQUE 01 — Fundamentos eléctricos y medición
**Notebook:** NB-EL-01 a NB-EL-05. **Meta:** interpretar magnitudes y seleccionar instrumentos con criterio.

### NB-EL-01 · Tensión, corriente, resistencia y circuito cerrado
La **tensión** es la diferencia de potencial entre dos puntos (V); se mide **entre** dos puntos. La **corriente** es el flujo de carga eléctrica (A); requiere un camino cerrado y se mide en serie o mediante una pinza compatible. La **resistencia** representa la oposición al paso de corriente (Ω). La ley de Ohm, para un elemento óhmico y condiciones definidas, es `U = R × I`. No describe por sí sola cargas no lineales ni el comportamiento transitorio de motores. Una bobina, un convertidor y un motor no deben tratarse como resistencias fijas.

En un circuito de mando 24 VDC, tener 24 V respecto a 0 V en un punto **no demuestra** que una carga esté alimentada: hay que considerar la referencia, el retorno y la tensión **entre sus dos bornes**. Un conductor de retorno interrumpido puede dejar una lectura aparentemente correcta en un borne y una carga sin funcionar. El multímetro de alta impedancia también puede mostrar tensiones fantasma por acoplamiento; una lectura aislada no confirma capacidad de suministro.

**Ejemplo resuelto:** una resistencia de 240 Ω conectada a 24 VDC ideales consume `I=24/240=0,10 A` y disipa `P=U×I=2,4 W`. En diseño real se comprueba potencia nominal, tolerancias, temperatura y protección.

**Comprobación:** ¿Qué mide un voltímetro conectado entre A1 y A2 de una bobina? A) Corriente de bobina; B) diferencia de potencial aplicada a la bobina; C) resistencia interna. **Correcta B.** A confunde magnitudes; C solo se determina con procedimiento de resistencia, circuito aislado.

### NB-EL-02 · AC, DC, frecuencia y valores eficaces
En **DC** la polaridad se mantiene en régimen normal; las fuentes industriales de 24 VDC alimentan PLC, sensores y bobinas adecuadas. En **AC** la polaridad alterna periódicamente; la red de 50 Hz completa 50 ciclos por segundo. Las tensiones de red indicadas habitualmente son valores eficaces (RMS), no valores de pico. En una onda senoidal ideal `U_pico = U_RMS × √2`; una red de 230 VAC tiene aproximadamente 325 V de pico respecto a la referencia correspondiente. Los instrumentos deben ser aptos para forma de onda, frecuencia, categoría de medida y entorno.

No se debe asumir que cualquier multímetro en modo AC mide correctamente señales distorsionadas o PWM. En un variador, la salida hacia el motor exige procedimientos e instrumentos específicos del fabricante; no extrapolar las mediciones de red.

**Comprobación:** una bobina rotulada `24 VDC` puede conectarse a `24 VAC` porque ambas cifras son 24. A) Sí; B) No, el tipo de tensión y la especificación importan. **Correcta B.**

### NB-EL-03 · Potencia, energía y cargas industriales
En DC ideal `P=U×I` (W). La energía consumida se expresa en Wh o kWh: `E=P×t` cuando la potencia es constante. En AC monofásica sinusoidal `P=U×I×cosφ`; en trifásica equilibrada sinusoidal `P=√3×U_LL×I_L×cosφ`. Estas expresiones no sustituyen un análisis de armónicos o desequilibrio. Un motor absorbe corriente de arranque superior a la nominal según tecnología y método de arranque. El valor de placa, la eficiencia, el factor de potencia, la carga y la protección condicionan el diagnóstico.

**Ejemplo resuelto:** una carga DC de 48 W a 24 V requiere idealmente 2 A. Una fuente de 2 A nominales podría ser insuficiente si hay picos de arranque, derating o cargas adicionales; el cálculo no autoriza su selección sin márgenes.

**Comprobación:** dos motores con igual potencia mecánica pueden tener corrientes diferentes. **Verdadero** por rendimiento, factor de potencia, tensión y diseño.

### NB-EL-04 · Multímetro, pinza y lectura de medidas
El voltímetro se conecta en paralelo; un amperímetro convencional requiere configuración en serie y protección apropiada, mientras que una pinza compatible permite medir corriente sin abrir el circuito. La medición de resistencia y continuidad se realiza con el circuito **aislado, sin tensión y verificado**; las ramas paralelas pueden alterar el resultado. El zumbador de continuidad solo confirma un umbral del instrumento: no garantiza que una conexión soporte corriente nominal. La medida de caída de tensión bajo carga puede revelar resistencia de contacto que no aparece en una prueba de continuidad.

Antes de confiar en una lectura se revisan modo AC/DC, rango, puntas, conectores, categoría CAT, estado del instrumento, referencia de medida y condiciones del circuito. Las mediciones energizadas solo pueden ejecutarlas profesionales autorizados con evaluación de riesgo y método aprobado. En estas prácticas el alumno interpreta **lecturas proporcionadas**.

**Ejemplo:** un conductor presenta 0,3 Ω con circuito aislado; sin conocer longitud, sección, contactos y exactitud del instrumento, el dato no prueba por sí solo un defecto.

**Comprobación:** ¿puede medirse continuidad con la fuente encendida? **No.** El modo ohmímetro inyecta su propia señal y una tensión externa puede dañar equipo o causar riesgo.

### NB-EL-05 · Calidad de la medida y diagnóstico diferencial
Una medida útil debe distinguir hipótesis. Registrar **qué puntos**, **en qué estado**, **con qué referencia** y **cuándo** evita conclusiones erróneas. Diferenciar medición en vacío y bajo carga, valores instantáneos y tendencias, tensión entre conductores y respecto a tierra. Los diagramas deben mostrar el punto de prueba. La resolución y la exactitud no son sinónimos. Una lectura de 24,0 V puede ser compatible con una caída intermitente no capturada; correlacionar con eventos y registros.

**Comprobación:** una fuente indica 24,1 V sin carga y 18,7 V durante el arranque. ¿Qué dato discrimina mejor el fallo? **La caída bajo carga**, siempre contrastando demanda, cableado y límites de la fuente.

**Resumen del bloque:** identificar magnitud, referencia, estado de carga y límites de la medida antes de diagnosticar.

## BLOQUE 02 — Distribución eléctrica y protecciones
**Notebook:** NB-EL-06 a NB-EL-10. **Meta:** seguir la energía desde la alimentación hasta la carga y comprender qué protege cada dispositivo.

### NB-EL-06 · Alimentación monofásica y trifásica
Una distribución trifásica dispone de tres conductores de fase; según sistema puede incluir neutro y conductor de protección PE. En una red típica europea 400/230 V, 400 V es tensión **entre fases** y 230 V entre fase y neutro, pero los valores concretos deben leerse en el esquema y la placa. **PE no es neutro** y no debe emplearse como retorno funcional. La continuidad y configuración de PE son cuestiones de seguridad que exigen verificación reglamentaria.

Un motor trifásico puede seguir girando con pérdida de fase en determinadas circunstancias, con par reducido, sobrecorriente y riesgo térmico. No debe darse por seguro que siempre se detendrá inmediatamente. La detección requiere protecciones adecuadas y análisis del circuito.

**Comprobación:** ¿400 V entre L1-L2 significa 400 V entre L1-N? **No.**

### NB-EL-07 · Fuentes industriales de 24 VDC
Una fuente convierte una entrada admisible (por ejemplo, 230 VAC) en una salida DC regulada. Se verifican tensión nominal, corriente máxima, curvas de sobrecarga, temperatura, derating, rizado, selectividad y distribución por ramas. Los bornes `+24V` y `0V` no equivalen automáticamente a `PE`. Algunos sistemas referencian 0 V a tierra por diseño; no debe suponerse sin documentación.

Las fuentes pueden limitar corriente, reducir tensión o desconectar ante sobrecarga. Una caída en un ramal también puede deberse a conductor, borne, fusible electrónico o retorno. El diagnóstico compara lectura de salida de fuente con lectura en la carga y condición de consumo.

**Comprobación:** si hay 24 V en la salida de fuente y 18 V en la carga, ¿es necesariamente defectuosa la fuente? **No;** revisar distribución y caída en conductores/terminales.

### NB-EL-08 · Fusibles, magnetotérmicos y protección de sobreintensidad
El fusible interrumpe al fundirse su elemento; el interruptor automático abre mediante mecanismos de disparo definidos. La selección depende de tensión, corriente, poder de corte, curva, energía pasante, sección de conductor, corriente de cortocircuito y coordinación. **Una protección disparada es un síntoma**, no la causa raíz. No sustituirla por un calibre superior para «evitar disparos». Antes de rearmar se evalúa por qué actuó y se verifica el estado de la instalación según procedimiento autorizado.

Distinguir **sobrecarga** (corriente excesiva sostenida) de **cortocircuito** (trayectoria de impedancia muy baja y corriente elevada). El tiempo de disparo y los registros pueden ayudar, pero no siempre identifican inequívocamente la causa.

**Comprobación:** aumentar de 2 A a 10 A un fusible que dispara repetidamente, sin revisar conductores ni carga, es una corrección válida. **Falso.**

### NB-EL-09 · Diferenciales, aislamiento y PE
Un dispositivo diferencial (RCD) compara las corrientes que atraviesan sus conductores activos y actúa si el desequilibrio supera sus condiciones de disparo. No sustituye por sí solo la protección de sobreintensidad salvo equipo combinado. Un fallo de aislamiento puede producir corriente de fuga, pero también hay fugas funcionales y transitorios; la interpretación depende del equipo, tipo de RCD y arquitectura. PE ofrece un camino de protección según el sistema de puesta a tierra; su ausencia no se compensa con un RCD.

Una prueba de aislamiento exige circuito desenergizado, electrónica sensible desconectada o protegida según fabricante, tensión de prueba apropiada y personal competente. En las EXP se entregan resultados de ensayos ya realizados por personal autorizado.

**Comprobación:** si dispara un diferencial, ¿es seguro concluir que existe cortocircuito fase-neutro? **No.**

### NB-EL-10 · Selectividad, separación y distribución
El cuadro debe permitir identificar alimentación principal, protecciones por rama, fuentes, distribución 24 V, borneros y cargas. La **selectividad** busca que ante una falta actúe el dispositivo adecuado sin cortar innecesariamente otros circuitos; no se presume sin estudio y datos de fabricante. La segregación entre potencia, mando, señales y comunicaciones reduce interferencias y facilita mantenimiento. Etiquetas, referencias y documentación actualizada son herramientas de diagnóstico, no decoración.

**Comprobación:** un fallo en un sensor corta todos los 24 V del cuadro. ¿Qué aspecto de diseño revisar? **Distribución y coordinación de protecciones**, sin inferir la solución exacta sin esquema.

**Resumen del bloque:** localizar origen de energía, ramal afectado, función de cada protección y condición de disparo.

## BLOQUE 03 — Circuitos de mando y potencia
**Notebook:** NB-EL-11 a NB-EL-15. **Meta:** explicar cómo una orden gobierna un actuador sin confundir el circuito de control con el de potencia.

### NB-EL-11 · Mando frente a potencia
El circuito de **potencia** transporta energía a la carga (motor, resistencia, etc.). El circuito de **mando** procesa condiciones y acciona elementos como bobinas de contactor o entradas de control. La presencia de tensión en potencia no demuestra que exista permiso de marcha. En un arrancador directo clásico, la orden de marcha energiza una bobina que cierra contactos principales; el contacto auxiliar puede mantener la orden, si el diseño lo permite.

**Comprobación:** el motor tiene tensión disponible aguas arriba del contactor y no gira. ¿Es suficiente para culpar al motor? **No;** hay que conocer estado del contactor y condiciones de mando.

### NB-EL-12 · Contactores, bobinas y auxiliares
Un contactor incorpora bobina (`A1/A2`), contactos principales y auxiliares. La bobina debe corresponder a su tensión, tipo AC/DC y régimen. Un contacto NO está abierto en el estado de referencia del dispositivo; uno NC está cerrado en ese estado, no necesariamente cuando toda la máquina está apagada. Los contactos se representan según norma y estado de referencia especificado. La designación típica de auxiliares puede incluir `13-14` (NO) y `21-22` (NC), pero se verifica en plano y fabricante.

**Comprobación:** si hay tensión nominal entre A1-A2 durante la orden y no conmuta, ¿se puede concluir que el pulsador de marcha está abierto? **No.** La tensión medida orienta hacia bobina, especificación, conexión o mecanismo, con validaciones posteriores.

### NB-EL-13 · Pulsadores, auto-mantenimiento y enclavamientos
Un mando clásico de marcha-paro incorpora STOP NC, START NO y un auxiliar NO de auto-mantenimiento en paralelo con START. Al soltar START, la bobina sigue energizada si las condiciones de permiso continúan. El enclavamiento eléctrico entre dos contactores de inversión evita órdenes simultáneas, pero para aplicaciones que lo requieren se complementa con enclavamiento mecánico y diseño de seguridad apropiado. **Un paro de emergencia no es simplemente un pulsador STOP del proceso**: su función se define mediante evaluación de riesgos y arquitectura de seguridad.

**Comprobación:** el motor solo gira mientras se mantiene START. Posibles causas: auxiliar de mantenimiento no cierra, cableado de mantenimiento interrumpido o lógica que no mantiene; no basta cambiar START.

### NB-EL-14 · Motores trifásicos, placa y relé de sobrecarga
La placa informa tensión, conexión, corriente nominal, frecuencia, potencia y otros datos. En arranque directo, el contactor gobierna potencia y un dispositivo de sobrecarga protege frente a condiciones térmicas dentro de su aplicación. El ajuste debe basarse en placa, esquema, método de arranque y documentación del fabricante. La corriente elevada puede venir de carga mecánica, fallo eléctrico, tensión anómala o conexión incorrecta; el relé disparado no demuestra por sí solo cuál.

**Comprobación:** si la corriente aumenta al atascarse un transportador, ¿qué hipótesis se prioriza? **Incremento de carga mecánica**, contrastado con datos eléctricos y mecánicos.

### NB-EL-15 · Relés, temporizadores y salidas PLC
Las salidas PLC pueden ser transistor o relé, con límites distintos; no todas pueden alimentar directamente cualquier bobina. Se consideran consumo, supresión de transitorios, polaridad, retorno, fusibles y aislamiento. Un relé intermedio puede separar la salida de control de la carga, pero añade puntos de fallo. Los temporizadores pueden ser eléctricos o lógicos; el diagnóstico debe distinguir la orden software del estado físico del elemento.

**Comprobación:** `Q0.0=TRUE` en Watch Table significa que KM1 necesariamente recibe 24 V. **Falso:** indica estado lógico de salida, no continuidad del cableado ni tensión efectiva en la bobina.

**Resumen del bloque:** seguir permiso, orden, salida, cableado, bobina, contactos y carga como eslabones diferentes.

## BLOQUE 04 — Interpretación de esquemas y cableado
**Notebook:** NB-EL-16 a NB-EL-20. **Meta:** localizar físicamente componentes y puntos de medida a partir de documentación.

### NB-EL-16 · Símbolos y convenciones
Los esquemas emplean símbolos normalizados y convenciones de estado de referencia. No se deduce una conexión real por la proximidad gráfica de dos símbolos: mandan identificadores de conexión, referencias, potenciales y numeración. Los planos deben incluir leyenda y versión. Los símbolos de interruptor, bobina, fusible, tierra, motor y contacto auxiliar deben dibujarse con semántica eléctrica correcta, no generarse libremente por estética.

**Comprobación:** un contacto KM1 dibujado en otra hoja, ¿puede pertenecer al mismo contactor? **Sí,** mediante designación y referencia cruzada.

### NB-EL-17 · Designación y referencias cruzadas
Una designación coherente (`-QF1`, `-F1`, `-KM1`, `-X1`, `-M1`) facilita localizar protecciones, contactores, borneros y motores. Las letras y números deben seguir la convención del proyecto; no hay que asumir universalidad absoluta de cada prefijo. Una referencia cruzada vincula bobina y contactos o continuidad entre páginas. Una revisión obsoleta puede conducir a buscar un borne inexistente.

**Comprobación:** el plano indica `-KM1:13-14` en hoja 4. ¿Qué se busca? **El contacto auxiliar identificado de KM1**, no otro dispositivo con número 13.

### NB-EL-18 · Borneros, potenciales y numeración
Un bornero (`-X1`) es un punto de conexión y posible desconexión de prueba según modelo. `X1:5` identifica un terminal; el número de hilo puede ser distinto. Los potenciales `+24V`, `0V`, `L1`, `N`, `PE` representan funciones distintas. En diagnosis se sigue origen → protección → borne → cable → carga → retorno. Un retorno abierto es tan relevante como una alimentación abierta.

**Comprobación:** hay 24 V en `X1:5` respecto a 0 V de cuadro, pero el sensor no funciona. ¿Qué falta verificar? **Tensión y retorno en bornes del sensor, condiciones de carga y estado del propio sensor.**

### NB-EL-19 · Lectura de esquemas de mando
Leer de la fuente de control hacia el retorno, identificando contactos en serie (condiciones simultáneas) y ramas en paralelo (caminos alternativos). Un contacto NC de protección abre cuando actúa su dispositivo; una rama de mantenimiento mantiene energía tras soltar START. En planos complejos se separan seguridad, permisos de proceso, orden PLC y potencia; una condición ausente puede bloquear la secuencia sin avería eléctrica.

**Comprobación:** si STOP NC está abierto, ¿puede START cerrar la bobina en un circuito clásico en serie? **No**, salvo caminos alternativos no mostrados, que deben investigarse.

### NB-EL-20 · Trazabilidad y control de revisiones
Un diagnóstico reproducible cita plano, revisión, equipo, terminales, estado de máquina, medidas y conclusión. Nunca modificar físicamente un cable solo porque «el plano lo dice» sin verificar identificación real y procedimiento. Tras una reparación autorizada, actualizar documentación, marcados y registro de intervención. La misma nomenclatura debe emplearse en Notebook, evidencias, Experience y esquemas.

**Comprobación:** ¿qué pesa más para diagnosticar una discrepancia: un esquema sin revisión o una identificación física verificada y documentada? **La evidencia trazable y la investigación de la discrepancia**; no improvisar modificaciones.

**Resumen del bloque:** cada símbolo debe corresponder a un componente, cada conductor a un potencial y cada conclusión a una evidencia identificable.

## BLOQUE 05 — Diagnóstico eléctrico y seguridad
**Notebook:** NB-EL-21 a NB-EL-25. **Meta:** construir una secuencia de pruebas discriminante y verificar reparación sin comprometer seguridad.

### NB-EL-21 · Método de diagnóstico
1) delimitar síntoma y condición de aparición; 2) identificar función afectada y plano vigente; 3) generar hipótesis mutuamente discriminables; 4) revisar alarmas, registros y mediciones existentes; 5) elegir la siguiente comprobación con mayor poder diagnóstico; 6) aislar causa; 7) corregir bajo procedimiento autorizado; 8) verificar función y protecciones; 9) documentar. Evitar el sesgo de confirmar la primera hipótesis y el cambio de componentes por descarte.

**Comprobación:** tres sensores fallan a la vez. ¿Qué se investiga antes de reemplazarlos individualmente? **Elementos comunes:** fuente, protección, retorno, módulo, cable compartido.

### NB-EL-22 · Consignación y comprobación de ausencia de tensión
Antes de abrir o intervenir un circuito real se aplica el procedimiento de aislamiento y consignación correspondiente, se identifican todas las fuentes (incluidos UPS, condensadores y retornos), se bloquea el restablecimiento, se verifica ausencia de tensión con método e instrumento apropiados y se controla energía residual. La secuencia concreta la define el procedimiento de la instalación y personal cualificado. Una HMI en STOP o un PLC en STOP **no** equivale a aislamiento eléctrico.

**Comprobación:** pulsar STOP permite medir continuidad de una bobina. **Falso:** STOP de proceso no garantiza ausencia de tensión.

### NB-EL-23 · Diagnóstico por comparación y bajo carga
Comparar un ramal sano con uno defectuoso puede identificar diferencias de tensión, corriente, estado de protección o señales. La caída de tensión es proporcional a corriente y resistencia en condiciones apropiadas (`ΔU≈I×R`); un borne deteriorado puede presentar tensión normal sin carga y caída importante al circular corriente. Una termografía o un punto caliente aporta indicios, no sustituye medidas y análisis.

**Comprobación:** 24 V en vacío y 17 V con carga en el extremo de cable. ¿Qué hipótesis gana fuerza? **Resistencia serie excesiva o fuente incapaz de sostener demanda**, diferenciable midiendo origen y extremo en el mismo estado.

### NB-EL-24 · Aislamiento y fugas
Un defecto de aislamiento es una vía no deseada de corriente entre conductores o hacia partes conductoras. Los síntomas incluyen disparos diferenciales, alarmas de aislamiento o comportamiento intermitente por humedad. La resistencia de aislamiento se mide con equipos y tensiones de prueba adecuados **solo en instalación aislada y preparada**, desconectando electrónica sensible según fabricante. Una lectura aislada debe interpretarse frente a norma aplicable, tensión, temperatura, topología y límites del equipo.

**Comprobación:** aplicar 500 VDC de megóhmetro directamente a la salida de un PLC para localizar una fuga es válido. **Falso.**

### NB-EL-25 · Verificación, recurrencia y documentación
Una corrección se considera verificada cuando se demuestra que la función se ha restablecido, el síntoma no reaparece en condiciones representativas, los dispositivos de protección conservan su función y los registros son coherentes. Una sustitución que «hace arrancar» sin explicar el mecanismo puede dejar el riesgo latente. Documentar causa, evidencia antes/después, intervención autorizada, pruebas y límites de la verificación.

**Comprobación:** después de apretar un borne se recupera el motor; ¿basta con cerrar incidencia? **No:** documentar y verificar conexiones, funcionamiento y causas de aflojamiento según procedimiento.

**Resumen del bloque:** seguridad, evidencia y verificación son partes del razonamiento, no anexos administrativos.

---

# PARTE II — EXPERIENCES: CONTRATO EDITORIAL COMÚN

## Estructura editorial por Experience

Cada EXP contiene: **identidad y dificultad; escenario y síntomas; circuito base; causa raíz; cinco momentos de decisión (D1–D5) con tres respuestas A/B/C, correcta y feedback individual; evidencias E1–E4; resolución; verificación; conceptos Notebook; límites de seguridad.** Esto son **50 decisiones y 150 respuestas redactadas** en total. La adaptación al número de etapas/decisiones que soporte el Experience Engine actual se hace **después** de inspeccionar su contrato; no se modifica el Engine para acomodar este documento.

**Reglas de feedback:** una opción incorrecta no provoca acciones reales; explica qué hipótesis confunde y devuelve al punto de decisión. Los datos entregados en cada momento se mantienen constantes. Una opción correcta justifica por qué la evidencia descarta alternativas. No mostrar la causa raíz antes de que el alumno la deduzca.

**Kit de evidencias común:** esquema de potencia y mando con referencia de revisión; vista de cuadro/bornes; tabla de medidas/registro de eventos; resultado de prueba final. Son **especificaciones textuales de assets**, no fotografías ni mediciones reales. En la publicación no se utilizarán dibujos eléctricos generados sin comprobación contra un netlist técnico.

---

## EXP-EL-01 · 24 VDC Supply Voltage Collapse
**Título ES:** La alimentación de 24 V cae al arrancar. **Dificultad:** básica. **Notebook:** 01, 04, 07, 21, 23.

**Escenario:** una cinta se detiene al intentar activar dos electroválvulas. El PLC permanece energizado, pero un módulo de E/S remoto reinicia. Fuente `-PS1` nominal 24 VDC / 5 A; dos ramas: PLC (1,2 A) y actuadores (carga habitual 2,0 A, pico documentado 5,5 A). La fuente registra limitación de corriente cuando ambas válvulas se activan simultáneamente. Valores de simulación: 24,2 V sin actuación; 17,8 V durante el pico en bornes de PS1; recuperación a 24,1 V al cesar la orden.

**Causa raíz:** demanda transitoria simultánea superior a la capacidad dinámica especificada de PS1; la fuente entra en limitación. No confundir con un cable defectuoso porque la caída aparece **también en los bornes de PS1**.

**D1 · ¿Qué dato solicitar primero?** A) Reinicios del módulo correlacionados con la activación y tendencia de tensión en PS1. **Correcta:** vincula síntoma con suministro. B) Versión de firmware PLC. **Incorrecta:** no discrimina fallo de tensión. C) Cambiar módulo remoto. **Incorrecta:** sustituye sin prueba.

**D2 · ¿Qué significa 24,2 V en reposo?** A) Fuente definitivamente sana. **Incorrecta:** no demuestra respuesta bajo carga. B) Tensión correcta solo para ese estado; falta observar arranque. **Correcta.** C) Cortocircuito permanente. **Incorrecta:** no hay evidencia.

**D3 · La fuente cae a 17,8 V en sus propios bornes. ¿Qué hipótesis priorizas?** A) Únicamente cable entre fuente y módulo. **Incorrecta:** no explica caída en origen. B) Fuente en limitación o defecto interno; contrastar demanda y especificación. **Correcta.** C) Fallo del sensor de velocidad. **Incorrecta:** no explica la alimentación.

**D4 · El registro indica pico de 5,5 A más 1,2 A del PLC. ¿Qué conclusión?** A) La suma supera 5 A nominales; revisar capacidad transitoria y simultaneidad. **Correcta:** los 6,7 A simulados justifican investigar límite. B) Toda fuente de 5 A soporta 10 A indefinidamente. **Incorrecta.** C) El PLC consume cero durante arranque. **Incorrecta.**

**D5 · ¿Qué verificación cierra el caso?** A) Reiniciar PLC una vez. **Incorrecta.** B) Sustituir la fuente por cualquiera de 24 V. **Incorrecta:** exige dimensionado, protecciones y aprobación. C) Tras solución de ingeniería aprobada, registrar tensión en PS1 durante el peor arranque y ausencia de reinicios. **Correcta.**

**Evidencias:** E1 esquema PS1→F1 PLC / F2 actuadores; E2 log de reinicios sincronizados; E3 curva PS1 24,2→17,8 V y pico 6,7 A; E4 curva post-corrección dentro de límites del diseño. **Resolución:** redistribuir/limitar simultaneidad o dimensionar fuente y protección según fabricante; no fijar modelo sin cálculo. **Verificación:** peor caso repetido, registro estable, protecciones conservadas. **Seguridad:** registros simulados; no probar sobrecarga intencionada en cuadro real.

## EXP-EL-02 · Contactor Does Not Energize
**ES:** El contactor no se activa. **Dificultad:** básica. **Notebook:** 04, 11–13, 19, 21.

**Escenario:** al pulsar START, `-KM1` no cierra. Circuito de mando 24 VDC: `+24V → -S0 STOP NC → -F2 contacto NC de protección → -S1 START NO → -KM1:A1 → A2:0V`, con auxiliar de mantenimiento KM1 NO. Registros de personal autorizado: +24 V en entrada de S0; +24 V en salida de S0; +24 V en salida de F2; **0 V en salida de S1 mientras START está pulsado**; retorno A2 verificado. Contacto S1 presenta apertura mecánica interna.

**Causa raíz:** contacto de marcha `-S1` no cierra pese a accionamiento mecánico. No confundir con bobina defectuosa: no recibe tensión nominal.

**D1:** A) Examinar secuencia de permisos en esquema y valores por tramo. **Correcta:** permite localizar interrupción. B) Cambiar KM1. **Incorrecta:** no se ha probado alimentación de bobina. C) Cambiar motor. **Incorrecta:** no explica mando.

**D2:** A) STOP está abierto porque se llama STOP. **Incorrecta:** NC cerrado en reposo. B) +24 V antes y después de S0 indica continuidad funcional en ese estado. **Correcta.** C) La fuente está a 0 V. **Incorrecta.**

**D3:** A) F2 ha disparado necesariamente. **Incorrecta:** hay +24 V aguas abajo. B) El retorno es la única causa posible. **Incorrecta:** ya se verificó. C) La interrupción está entre salida de F2 y salida de S1, con START pulsado. **Correcta.**

**D4:** A) Confirmar con ensayo aislado y documentación el fallo de cierre de S1. **Correcta.** B) Puentear S1 para dejar producción funcionando. **Incorrecta:** no es reparación aceptable. C) Cambiar calibre de F2. **Incorrecta.**

**D5:** A) Basta que la bobina haga ruido. **Incorrecta.** B) Tras sustitución autorizada de S1, verificar marcha, paro, auto-mantenimiento y protección. **Correcta.** C) Desactivar STOP para evitar recurrencia. **Incorrecta.**

**Evidencias:** E1 esquema de mando completo; E2 tabla de potenciales en S0/F2/S1; E3 ficha de ensayo aislado de S1; E4 prueba de arranque/paro y mantenimiento. **Resolución:** sustituir S1 por componente equivalente aprobado y corregir documentación. **Seguridad:** no puentear STOP ni protección.

## EXP-EL-03 · Motor Overload Trip
**ES:** El motor dispara por sobrecarga. **Dificultad:** intermedia. **Notebook:** 03, 08, 14, 21, 25.

**Escenario:** motor `-M1` de cinta, placa 400 V / 3,2 A nominal, relé de sobrecarga ajustado y documentado a 3,2 A. Tras aumentar producción, las corrientes de línea registradas son 4,5/4,4/4,6 A y el relé dispara con retardo. Tensiones entre fases equilibradas, sin pérdida de fase. Registro mecánico: rodillo de retorno presenta resistencia anómala; al desacoplar y comprobar según procedimiento, la resistencia mecánica supera la referencia histórica.

**Causa raíz:** sobrecarga mecánica por rodillo deteriorado; protección térmica actúa correctamente.

**D1:** A) Subir ajuste del relé hasta que no dispare. **Incorrecta:** elimina margen sin justificar. B) Correlacionar corrientes, placa y carga mecánica. **Correcta.** C) Cambiar PLC. **Incorrecta.**

**D2:** A) 4,5 A frente a 3,2 A demuestra corriente superior a nominal. **Correcta.** B) Es normal porque el motor gira. **Incorrecta.** C) Demuestra cortocircuito franco. **Incorrecta.**

**D3:** A) La pérdida de fase está confirmada. **Incorrecta:** tres corrientes similares y tensiones equilibradas no la apoyan. B) La alimentación es necesariamente incorrecta. **Incorrecta.** C) Priorizar sobrecarga mecánica o condición de motor; solicitar evidencia mecánica. **Correcta.**

**D4:** A) El rodillo con resistencia anómala explica el incremento de carga, sujeto a confirmación tras reparación. **Correcta.** B) El relé está mal por disparar. **Incorrecta.** C) Se puede anular el relé. **Incorrecta.**

**D5:** A) Solo borrar alarma. **Incorrecta.** B) Tras reparar rodillo, verificar corrientes dentro de límites y protección operativa. **Correcta.** C) Reducir velocidad sin investigar. **Incorrecta:** puede ocultar problema.

**Evidencias:** E1 placa M1 y esquema de arranque; E2 trend I_L1/I_L2/I_L3 y disparo; E3 registro de rodillo; E4 corrientes tras reparación y prueba de protección según procedimiento. **Resolución:** reparación mecánica y confirmación de ajuste correcto, sin aumentar protección para compensar carga.

## EXP-EL-04 · Single Phase Loss
**ES:** Falta una fase en el motor. **Dificultad:** intermedia. **Notebook:** 06, 08, 14, 18, 21.

**Escenario:** el motor `-M2` no arranca de forma fiable; hay zumbido y protección actúa. Registro autorizado con contactor cerrado en condición de prueba controlada: tensiones entre fases **aguas arriba** de `-KM2`: 400/401/399 V; **aguas abajo**: L1-L2 400 V, L2-L3 0 V, L1-L3 400 V (datos didácticos idealizados, medidos con referencia y estado definidos). Inspección aislada identifica un polo de KM2 abierto por fallo de contacto en L3; se contrasta con continuidad/estado mecánico según fabricante.

**Causa raíz:** polo L3 de KM2 no conduce, provocando pérdida de fase en el circuito de potencia. **Advertencia:** en motores conectados y con tensiones inducidas/retroalimentadas, las lecturas reales pueden diferir; el caso emplea modelo aislado idealizado y se basa en inspección de polo y comparación bajo procedimiento autorizado, no en el patrón de tensión como prueba única.

**D1:** A) Revisar distribución trifásica antes y después de protección y contactor. **Correcta.** B) Cambiar sentido de giro. **Incorrecta.** C) Desactivar relé térmico. **Incorrecta.**

**D2:** A) Alimentación trifásica aguas arriba es aproximadamente equilibrada. **Correcta.** B) L1 está necesariamente ausente. **Incorrecta.** C) Hay 230 V entre cada par de fases. **Incorrecta.**

**D3:** A) La anomalía se localiza aguas abajo de KM2 o en la medida/carga; investigar cada polo. **Correcta.** B) El transformador de cabecera está probado defectuoso. **Incorrecta.** C) No importa la diferencia antes/después. **Incorrecta.**

**D4:** A) Cambiar fusibles sin revisar. **Incorrecta.** B) El ensayo aislado confirma polo L3 abierto de KM2. **Correcta.** C) El PLC ha invertido dos fases. **Incorrecta.**

**D5:** A) Rearmar y producir. **Incorrecta.** B) Cambiar motor directamente. **Incorrecta.** C) Sustitución autorizada KM2, revisión de causa de daño y comprobación trifásica/arranque/protección. **Correcta.**

**Evidencias:** E1 esquema trifásico L1/L2/L3, KM2 y M2; E2 tabla comparativa antes/después; E3 registro de inspección aislada de polo L3; E4 verificación post-reparación. **Resolución:** contactor conforme a diseño, investigar desgaste/terminales y coordinación.

## EXP-EL-05 · Auxiliary Circuit Protection Trip
**ES:** Dispara la protección del circuito auxiliar. **Dificultad:** intermedia. **Notebook:** 07–10, 18, 21, 24.

**Escenario:** el fusible electrónico `-F24.2` de un ramal 24 VDC desconecta al ordenar la electroválvula `-Y2`; otros ramales siguen activos. Fuente PS1 mantiene 24,1 V; registro de F24.2 muestra corriente de fallo muy elevada y desconexión. Inspección aislada revela aislamiento dañado en cable de Y2, con contacto conductor +24 V–0 V dentro de una canaleta; bobina Y2 separada y comprobada sin anomalía.

**Causa raíz:** cortocircuito en cable de Y2, aguas abajo de protección F24.2; la protección cumple su función.

**D1:** A) Identificar exactamente qué protección y qué rama desconecta. **Correcta.** B) Cambiar fuente principal. **Incorrecta.** C) Aumentar límite de F24.2. **Incorrecta.**

**D2:** A) Todos los 24 V del cuadro han fallado. **Incorrecta:** otras ramas funcionan. B) El defecto está asociado al ramal Y2 o a su carga. **Correcta.** C) El PLC está en STOP. **Incorrecta.**

**D3:** A) F24.2 es necesariamente defectuoso. **Incorrecta.** B) La válvula está bloqueada mecánicamente. **Incorrecta:** no explica corriente de cortocircuito. C) Buscar defecto de aislamiento o carga en corto mediante procedimiento aislado. **Correcta.**

**D4:** A) Cable con +24 V y 0 V en contacto confirma la causa; no se puentea F24.2. **Correcta.** B) Rearmar repetidamente hasta estabilizar. **Incorrecta.** C) Sustituir por fusible de mayor calibre. **Incorrecta.**

**D5:** A) Solo borrar evento. **Incorrecta.** B) Reparar cableado según especificación, inspeccionar ruta y verificar disparo selectivo/función. **Correcta.** C) Dejar Y2 desconectada sin documentar. **Incorrecta.**

**Evidencias:** E1 distribución de 24 V con F24.1/F24.2; E2 log de protección; E3 inspección de cable aislado; E4 pruebas de ramal y función tras reparación. **Resolución:** sustituir tramo y corregir protección mecánica de cable.

## EXP-EL-06 · Open Return Conductor
**ES:** Un conductor interrumpido impide activar la válvula. **Dificultad:** básica-intermedia. **Notebook:** 01, 04, 18, 20, 21.

**Escenario:** salida PLC `Q0.3` activa, pero electroválvula `-Y3` no conmuta. Cableado: `Q0.3 → X2:7 → Y3:A1`; `Y3:A2 → X2:8 → 0V`. Registro de prueba: salida Q0.3 24 V respecto a 0 V del cuadro, A1 24 V respecto a 0 V del cuadro, A2 24 V respecto a 0 V del cuadro por retorno abierto y acoplamiento a través de la bobina; **A1-A2 = 0 V** bajo orden. Con instalación aislada, continuidad entre X2:8 y retorno 0 V abierta.

**Causa raíz:** retorno 0 V interrumpido entre X2:8 y barra de 0 V. El PLC ordena, pero no hay circuito cerrado.

**D1:** A) Comprobar tensión efectiva entre bornes de Y3 y retorno. **Correcta.** B) Cambiar programa PLC. **Incorrecta.** C) Sustituir Y3 sin medida. **Incorrecta.**

**D2:** A) Q0.3=TRUE confirma alimentación completa de Y3. **Incorrecta.** B) Q0.3=TRUE solo confirma estado lógico; hace falta comprobar camino eléctrico. **Correcta.** C) El sensor de posición es causa obligada. **Incorrecta.**

**D3:** A) A1=24 V y A2=24 V respecto a 0 V de cuadro, con 0 V entre A1-A2, apunta a retorno abierto u otro fallo de referencia. **Correcta.** B) La bobina recibe 24 V. **Incorrecta.** C) La fuente entrega 48 V. **Incorrecta.**

**D4:** A) Cambiar salida PLC. **Incorrecta.** B) El ensayo aislado abierto entre X2:8 y barra 0 V localiza el retorno interrumpido. **Correcta.** C) Puentear a PE como retorno. **Incorrecta y peligroso.**

**D5:** A) Tras reparación autorizada del conductor, verificar tensión A1-A2 bajo orden y actuación Y3. **Correcta.** B) Usar PE de retorno permanente. **Incorrecta.** C) Cerrar incidencia por Q0.3=TRUE. **Incorrecta.**

**Evidencias:** E1 esquema con X2:7/X2:8; E2 Watch Q0.3; E3 tabla de tensiones entre puntos y continuidad aislada; E4 actuación correcta. **Resolución:** reparación y trazabilidad del retorno, no modificación de lógica.

## EXP-EL-07 · Incorrect NO/NC Contact
**ES:** El contacto instalado no corresponde al esquema. **Dificultad:** intermedia. **Notebook:** 12, 13, 16–20.

**Escenario:** tras mantenimiento, la orden de marcha de `-KM3` solo se habilita cuando se pulsa físicamente el pulsador de PARO `-S3`. El plano aprobado exige contacto NC en serie con el mando; en el conjunto de contactos instalado se ha cableado accidentalmente el par NO `13-14` en lugar del NC `21-22`. Registro de estados: en reposo 13-14 abierto, al pulsar cerrado; el mando interpreta permiso inverso.

**Causa raíz:** conexión a contacto NO en una función que requiere NC según diseño. **Importante:** no confundir STOP de proceso con función de parada de emergencia de seguridad; el escenario no modifica un circuito de seguridad.

**D1:** A) Revisar correspondencia entre estado físico, plano y terminales. **Correcta.** B) Invertir bits en PLC inmediatamente. **Incorrecta.** C) Cambiar motor. **Incorrecta.**

**D2:** A) `13-14` es NO en el componente documentado. **Correcta.** B) Todos los contactos 13-14 son NC. **Incorrecta.** C) NO/NC depende del color del cable. **Incorrecta.**

**D3:** A) Que el permiso aparezca al pulsar S3 concuerda con uso accidental de NO. **Correcta.** B) Es prueba de pérdida de fase. **Incorrecta.** C) El contactor está soldado. **Incorrecta.**

**D4:** A) Dejar el comportamiento y cambiar el texto HMI. **Incorrecta.** B) Verificar aislado que se usaron 13-14 en lugar de 21-22 y restituir plano. **Correcta.** C) Puentear S3. **Incorrecta.**

**D5:** A) Tras corrección autorizada, comprobar STOP y START en reposo/accionamiento y auto-mantenimiento. **Correcta.** B) Solo arrancar una vez. **Incorrecta.** C) Eliminar el contacto de paro. **Incorrecta.**

**Evidencias:** E1 esquema S3 NC 21-22; E2 fotografía técnica o dibujo de bloque de contactos con terminales; E3 tabla de estados; E4 secuencia de mando validada. **Resolución:** restaurar cableado según plano, registrar desviación de mantenimiento.

## EXP-EL-08 · Incorrect Motor Rotation
**ES:** El motor gira en sentido contrario. **Dificultad:** intermedia. **Notebook:** 06, 14, 16–18, 25.

**Escenario:** tras sustituir un motor trifásico `-M4` en un transportador, gira en sentido contrario al previsto. El motor es de arranque directo sin variador. El esquema de bornes aprobado documenta `L1→U1, L2→V1, L3→W1`; la inspección aislada del cableado encuentra `L1→V1, L2→U1, L3→W1`. La secuencia de fases aplicada al motor está invertida respecto al montaje validado.

**Causa raíz:** intercambio de dos fases en terminales del motor durante la sustitución. **La corrección real solo se ejecuta con consignación, personal competente y verificación de riesgos mecánicos;** no se propone una maniobra en tensión.

**D1:** A) Confirmar tipo de accionamiento y documentación de conexiones. **Correcta.** B) Cambiar sentido de giro del PLC sin verificar circuito. **Incorrecta.** C) Desactivar protección térmica. **Incorrecta.**

**D2:** A) En arranque directo trifásico, intercambiar dos fases puede invertir sentido de giro. **Correcta.** B) El neutro determina siempre el giro. **Incorrecta.** C) El giro solo depende del PLC. **Incorrecta.**

**D3:** A) El motor debe estar averiado internamente. **Incorrecta.** B) El esquema y la conexión real muestran permuta L1/L2. **Correcta.** C) La frecuencia es necesariamente 60 Hz. **Incorrecta.**

**D4:** A) Reconfigurar los terminales según plano y procedimiento autorizado tras aislamiento. **Correcta.** B) Cambiar fases con el motor energizado. **Incorrecta y peligroso.** C) Invertir tierra PE. **Incorrecta y peligroso.**

**D5:** A) Basta comprobar giro en vacío sin protecciones. **Incorrecta.** B) Verificar sentido, carga, resguardos, enclavamientos y documentación en prueba autorizada. **Correcta.** C) Mantener giro inverso porque el motor funciona. **Incorrecta.**

**Evidencias:** E1 esquema de bornes U1/V1/W1; E2 registro de dirección observada; E3 tabla conexión aprobada vs real; E4 verificación de sentido tras corrección. **Resolución:** restituir secuencia conforme al diseño.

## EXP-EL-09 · Excessive Voltage Drop at Terminal
**ES:** Caída de tensión por conexión defectuosa. **Dificultad:** intermedia. **Notebook:** 01, 04, 07, 18, 23.

**Escenario:** actuador 24 VDC `-Y4` funciona en vacío pero falla al accionar. Fuente PS2 mantiene 24,1 V durante orden. En Y4 se registran 23,9 V sin carga y 16,9 V bajo carga de 1,4 A. La diferencia aparece principalmente en un terminal `-X4:12`; registro técnico autorizado muestra caída de 6,8 V a través de esa conexión bajo carga. Con el circuito aislado, la inspección identifica borne con apriete fuera de especificación y daño térmico.

**Causa raíz:** resistencia de contacto elevada en X4:12; a 1,4 A, una caída de 6,8 V corresponde a resistencia equivalente aproximada de 4,9 Ω en ese estado. No se presume resistencia constante con temperatura.

**D1:** A) Comparar tensión de fuente y carga en el mismo estado de funcionamiento. **Correcta.** B) Medir solo en vacío. **Incorrecta.** C) Cambiar PLC. **Incorrecta.**

**D2:** A) PS2=24,1 V y Y4=16,9 V bajo carga indican caída en distribución. **Correcta.** B) La fuente cae a 16,9 V. **Incorrecta.** C) Y4 recibe 24,1 V. **Incorrecta.**

**D3:** A) 6,8 V a través de X4:12 bajo carga es anómalo para una conexión prevista de baja resistencia. **Correcta.** B) Es la caída normal de cualquier borne. **Incorrecta.** C) Prueba error de programa. **Incorrecta.**

**D4:** A) Eliminar fusible para reducir resistencia. **Incorrecta.** B) Inspección aislada confirma deterioro de terminal; reparar según especificación. **Correcta.** C) Subir salida de fuente a 31 V para compensar. **Incorrecta y arriesgado.**

**D5:** A) Verificar caída de tensión bajo carga tras reparar y revisar calentamiento y estado del borne. **Correcta.** B) Cerrar caso al ver 24 V en vacío. **Incorrecta.** C) Sustituir Y4 sin prueba. **Incorrecta.**

**Evidencias:** E1 esquema PS2-X4-Y4; E2 tabla sin carga/con carga; E3 caída localizada X4:12 y acta de inspección; E4 registro de tensión estable tras reparación. **Resolución:** reparar conexión y revisar causa de deterioro.

## EXP-EL-10 · Insulation Fault to Protective Earth
**ES:** Defecto de aislamiento a masa. **Dificultad:** intermedia. **Notebook:** 09, 22, 24, 25.

**Escenario:** al activarse la resistencia calefactora `-EH1` de una máquina, actúa el diferencial `-RCD1`. No hay evidencia de sobrecorriente en la protección magnetotérmica asociada. Se observa humedad en la caja de conexiones. Tras consignación, desconexión de electrónica y preparación por personal autorizado, un ensayo de aislamiento apropiado registra resistencia anormalmente baja entre el circuito de EH1 y su envolvente conectada a PE, en comparación con límites aplicables al conjunto. La prueba se documenta sin publicar tensión ni umbral universales, pues dependen de equipo y norma.

**Causa raíz:** degradación de aislamiento en EH1 favorecida por humedad, con fuga a partes conectadas a PE. El diferencial actúa; no se anula para mantener producción.

**D1:** A) Diferenciar disparo diferencial de disparo por sobrecorriente. **Correcta.** B) Aumentar corriente nominal del magnetotérmico. **Incorrecta.** C) Puente de RCD1. **Incorrecta y peligroso.**

**D2:** A) El diferencial mide únicamente sobrecarga térmica. **Incorrecta.** B) El disparo es compatible con corriente residual; requiere localizar su origen. **Correcta.** C) Demuestra fallo PLC. **Incorrecta.**

**D3:** A) Correlación con EH1 y humedad prioriza circuito calefactor y aislamiento. **Correcta.** B) Es seguro que el neutro está desconectado. **Incorrecta.** C) Cambiar motor de cinta. **Incorrecta.**

**D4:** A) Medir aislamiento con EH1 energizada. **Incorrecta y peligroso.** B) Interpretar ensayo de aislamiento ya realizado en circuito aislado y preparado, conforme a especificación. **Correcta.** C) Desconectar PE para impedir fuga. **Incorrecta y peligroso.**

**D5:** A) Tras reparación autorizada y secado/recambio apropiado, repetir verificaciones eléctricas y función de protección. **Correcta.** B) Rearmar diferencial indefinidamente. **Incorrecta.** C) Mantener PE desconectado. **Incorrecta.**

**Evidencias:** E1 esquema RCD1/EH1/PE; E2 eventos correlacionados con orden EH1; E3 acta de inspección y aislamiento aislado, con criterios específicos de fabricante; E4 resultado de verificación final y protección operativa. **Resolución:** localizar y corregir componente/conexión afectado, controlar entrada de humedad, verificar con protocolo autorizado.

---

# PARTE III — MAPA DE ASSETS Y GOBERNANZA

## 1. Matriz de recursos visuales

| Asset | Uso | Requisito de exactitud |
|---|---|---|
| EL-DIAG-01 | Circuito 24 VDC, ramas PS1 y protecciones | Potenciales y retorno completos |
| EL-DIAG-02 | Mando STOP/START, KM1, mantenimiento | Contactos y estados de referencia correctos |
| EL-DIAG-03 | Potencia trifásica, KM, relé y motor | Tres fases, placa y referencias coherentes |
| EL-DIAG-04 | Distribución con RCD, PE y calefactor | Diferenciar N y PE; ubicación correcta de RCD |
| EL-DIAG-05 | Borneros X2/X4 y trazabilidad | Numeración consistente entre vistas |
| EL-METER-01 | Multímetro: tensión entre bornes | Puntas y modo de medida correctos |
| EL-METER-02 | Tabla de caída de tensión bajo carga | Mismo estado de carga y referencia |
| EL-TRACE-01 | Corrientes de motor y sobrecarga | Escalas, tiempos y valores coherentes |
| EL-TRACE-02 | Caída PS1 bajo pico | 24,2→17,8 V y evento alineados |
| EL-REPORT-01 | Informe de aislamiento | No inventar umbrales universales |

Las EXP especifican E1–E4 como evidencias narrativas (40 asignaciones); pueden reutilizar assets canónicos cuando la misma topología y dato sean válidos. **No** se duplica el conocimiento técnico en cada Experience; las referencias NB-EL son SSOT.

## 2. Criterios de validación de contenido

- [ ] Cada dato de una EXP coincide entre escenario, opción, feedback, evidencia y resolución.
- [ ] La opción correcta se deduce de la información disponible **en ese momento**.
- [ ] No hay medidas eléctricas inseguras presentadas como acciones del alumno.
- [ ] No hay bypass de protecciones como solución, ni rearmes repetidos.
- [ ] Cada circuito tiene origen, retorno, protecciones y estados de referencia.
- [ ] Símbolos, designaciones y números de terminales son consistentes.
- [ ] La medición de tensión indica puntos, referencia, carga y momento.
- [ ] Los resultados de aislamiento se interpretan según norma/fabricante aplicable.
- [ ] Se distinguen síntomas, hipótesis, evidencia, causa y verificación.
- [ ] Las traducciones EN preservan magnitudes, terminales y causa raíz.
- [ ] El Experience Engine y su contrato no se alteran para adaptar contenido.
- [ ] Se comparan los ejemplos con una EXP vigente antes de serializar YAML.

## 3. Entregables de implementación posteriores (no ejecutados)

1. Revisión técnica por ingeniería eléctrica: esquemas/netlists, protección y límites de cada caso.
2. Revisión de UX y formato real de experiencias existentes (número de etapas, decisiones, campos de localización y evidencias).
3. Generación de Notebook SSOT a partir de NB-EL-01…25, con metadatos y referencias.
4. Serialización de diez EXP al contrato actual, con opciones y feedback completos.
5. Producción de esquemas originales verificados y assets de lectura; imágenes realistas solo para contexto, no para conexiones sin validar.
6. QA editorial, técnico, bilingüe, de accesibilidad y regresión. No commit/push/deploy sin autorización.

## 4. Riesgos abiertos

- **Topología real y hardware:** no se han fijado referencias comerciales; se evita inventar curvas de protección, bornes o tensiones de prueba.
- **Engine:** cinco momentos y tres opciones por momento son **guion editorial**; podrían requerir adaptación al formato vigente, sin alterar la intención.
- **EXP-04:** lecturas entre fases aguas abajo de un polo abierto dependen de la conexión real; el patrón idealizado es auxiliar y la causa se confirma por ensayo aislado.
- **EXP-10:** el criterio de resistencia de aislamiento debe fijarse al elegir equipo, tensión de ensayo y norma.
- **Seguridad:** el material enseña a interpretar datos y planificar diagnóstico; no autoriza intervención sobre instalaciones energizadas.

**Fin de la especificación textual ENV-004 v1.0.**
