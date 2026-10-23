# EE-0015 — Rechazos por ventana de distancia incorrecta

Estado: `technical_review` / `pass_with_warnings`.

Esta Experience implementa el caso de una cinta de embalaje con un SICK DT50-2 sobre la línea, un S7-1200 y un expulsor neumático. La lectura de distancia de 214 mm es plausible, pero la ventana aplicada de 280–320 mm deja la medida fuera de rango: Q1 queda OFF, la entrada `Sensor_Q1` queda FALSE y la lógica de calidad ordena el rechazo. La corrección aprobada usa 180–250 mm; después se comprueban la señal, la clasificación, la actuación, la persistencia y una corrida representativa.

La interrupción nocturna solo aporta contexto temporal. El contenido no afirma que haya borrado parámetros. La distancia sensor–caja tampoco se presenta como altura de caja: si el diseño necesita altura, se calcula a partir de una referencia sensor–cinta documentada menos la distancia medida. El contador HMI solo se pone a cero después de una verificación representativa y un reset manual.

## Contenido y flujo

- Seis etapas: incidente, investigación de la actuación y de la ventana, correlación PLC, corrección y verificación.
- Seis decisiones diagnósticas, cuatro opciones por punto, con un único camino correcto y feedback específico para cada reintento.
- La primera condición anómala aparece al comparar 214 mm con 280–320 mm; la medida, el PLC y el expulsor se tratan como fronteras separadas.
- La verificación final exige muestras aceptadas y rechazadas, correlación Q1–PLC, acción física, lectura de vuelta y persistencia en un reinicio aprobado.

## Assets aprobados

Los seis PNG del encargo se copiaron sin modificar a `assets/` y se mantienen además en `media/` como referencia editorial. La tabla conserva los hashes recibidos en el manifiesto.

| ID | Archivo | SHA-256 |
|---|---|---|
| ART-001 | `ART-001-hmi-reject-count.png` | `c114205013049a5e71981740ec643332b3270b8651d1d22a6ef2195008a96c97` |
| ART-002 | `ART-002-pneumatic-diverter-rejection.png` | `80a1fe8550f81a96affec077c7072ed61a22a403967ed858aa248edbae5729f9` |
| ART-004 | `ART-004-sopas-window-fault.png` | `0f4843e257d9f37e2844815474a02269ebd639000c313f130d76180de783efc7` |
| ART-005 | `ART-005-tia-plc-q1-false.png` | `cc7cb00bf17afab6056f2aada204cc0769bd5115482907f9ec50da9ac893b147` |
| ART-006 | `ART-006-sopas-window-corrected.png` | `d5f3a3ec81023576495aba26c0cabc65089304bfa9e285ef746387885b0bb60e` |
| ART-007 | `ART-007-recovery-hmi-zero.png` | `d9d874a25f66ceb84e5346ae6d6f83fd6ccd94c38006869883be9aeae24bf47b` |

## Revisión técnica pendiente

El repositorio no contiene una fuente exacta del modelo DT50-2 que confirme la variante, la polaridad configurada y el procedimiento preciso de guardado/lectura de vuelta en SOPAS ET. La documentación oficial de SICK no estuvo disponible en este entorno. Por eso la experiencia queda en `technical_review` y el runtime de preview usa `pass_with_warnings`; antes de producción hay que contrastar esos puntos con la ficha y el procedimiento del dispositivo instalado.

Clasificación de cambio: **CONTENT**. No se ha cambiado el motor, el renderer, el Notebook ni ningún PNG aprobado.
