======================================================================
BLUEPRINT LITERAL APROBADO
======================================================================

# EE-0009 — Experience Blueprint

## Photoelectric Sensor Misalignment

**Blueprint version:** 1.0  
**Experience status:** Approved for build validation  
**Experience class:** Practice  
**Difficulty:** Foundation  
**Estimated duration:** 10–15 minutes  
**Domain:** Sensors / Industrial I/O  
**Primary capability:** ICF-02 — Industrial I/O  
**Canonical competencies:** Resolver exclusivamente contra el catálogo gobernado del repositorio.

---

# 1. Purpose

EE-0009 entrena al usuario para diagnosticar una pérdida intermitente de detección en un sensor fotoeléctrico mediante un recorrido sistemático entre:

- observación física;
- documentación eléctrica;
- monitorización del PLC;
- información de la HMI;
- inspección mecánica;
- verificación de la recuperación.

La Experience no enseña a sustituir directamente un sensor.

Enseña a determinar si el síntoma corresponde realmente a:

- fallo interno del sensor;
- pérdida de alimentación;
- problema de cableado;
- fallo de entrada PLC;
- error de lógica;
- posición incorrecta del producto;
- desalineación mecánica.

Principio de ingeniería:

> Un dispositivo puede estar eléctricamente sano y, aun así, no cumplir su función dentro del proceso.

---

# 2. Learning objective

Al finalizar la Experience, el usuario debe ser capaz de:

1. Separar el síntoma reportado de la causa técnica.
2. Identificar el sensor correcto dentro de una estación con varios dispositivos.
3. Localizar la entrada PLC asociada mediante documentación eléctrica.
4. Monitorizar esa señal en una Watch Table.
5. Relacionar el estado físico de la entrada con el estado procesado por el programa.
6. Interpretar correctamente la información de la HMI.
7. Rechazar hipótesis no respaldadas por evidencias.
8. Identificar la desalineación mecánica como causa raíz.
9. Ejecutar una recuperación controlada.
10. Verificar la reparación mediante repetición estable del ciclo.

---

# 3. Industrial case

## 3.1 Environment

Línea automática de packaging que transporta cajas de cartón hacia una estación de etiquetado.

## 3.2 Station

Packaging Line 01 — Station ST03 — Infeed Conveyor.

## 3.3 Relevant equipment

- Conveyor de entrada.
- Cajas de cartón.
- Sensor fotoeléctrico B3.
- Soporte metálico regulable.
- Alimentación de 24 VDC.
- Conector y cableado de campo.
- Módulo de entradas digitales.
- PLC de estación.
- Proyecto de automatización representado mediante una interfaz tipo TIA Portal.
- HMI de estación.
- Esquema unifilar de sensores.

## 3.4 Operator report

> “Las cajas llegan a la entrada de la estación, pero algunas veces no se detectan y la cinta no continúa.”

## 3.5 Initial production state

- PLC: RUN.
- Modo: AUTO.
- Safety: Healthy.
- Emergency stops: Released.
- Drive: Ready.
- Conveyor: Stopped by sequence logic.
- Box present near the detection point.
- No communication fault.
- No electrical protection trip.
- HMI: box not detected at ST03.
- Sensor B3: alimentado.
- Entrada esperada: `Sensor_BoxDetected`.
- Dirección: `%I0.3`.

---

# 4. Root cause

El soporte regulable del sensor fotoeléctrico B3 se ha desplazado ligeramente por vibración sostenida.

El sensor continúa:

- alimentado;
- conectado;
- operativo;
- correctamente asignado al PLC;
- correctamente procesado por la lógica.

Sin embargo, el eje óptico ya no intersecta de forma estable la zona de detección de la caja.

El resultado es una detección intermitente o inexistente según la posición exacta del producto.

---

# 5. Hidden technical truth

La siguiente información es privada y no debe exponerse antes del momento correspondiente:

- El sensor no está averiado.
- La alimentación de 24 VDC es correcta.
- El cable y el conector están intactos.
- El canal de entrada PLC funciona.
- La dirección `%I0.3` es correcta.
- El tag `Sensor_BoxDetected` está correctamente mapeado.
- El DB refleja correctamente el estado de la entrada.
- La lógica de secuencia funciona.
- La HMI comunica el síntoma correctamente.
- La causa está en el montaje mecánico.
- Realinear y fijar el soporte restaura la detección.

---

# 6. Engineering hypotheses

| ID | Hypothesis | Initial plausibility | Final status |
|---|---|---:|---|
| H-01 | Fallo interno del sensor | Medium | Rejected |
| H-02 | Pérdida de 24 VDC | Medium | Rejected |
| H-03 | Cable o conector dañado | Medium | Rejected |
| H-04 | Canal de entrada PLC defectuoso | Low–Medium | Rejected |
| H-05 | Lógica PLC incorrecta | Low–Medium | Rejected |
| H-06 | Caja fuera de la zona prevista | Medium | Partially relevant |
| H-07 | Soporte del sensor desalineado | Medium | Confirmed root cause |

H-07 no debe resultar evidente durante la observación inicial.

---

# 7. Experience Information Model

La Experience sigue este flujo:

```text
Incident
→ Initial Observation
→ Assessment
→ Investigation
→ Evidence
→ Assessment
→ Investigation
→ Evidence
→ Root Cause
→ Recovery
→ Verification
→ Debrief
