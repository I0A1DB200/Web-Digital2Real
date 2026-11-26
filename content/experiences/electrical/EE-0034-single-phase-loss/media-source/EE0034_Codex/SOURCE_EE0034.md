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
