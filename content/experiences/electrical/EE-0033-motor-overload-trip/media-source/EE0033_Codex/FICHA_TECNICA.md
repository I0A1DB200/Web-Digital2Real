# EE-0033 — Ficha técnica maestra (escenario didáctico)

**Producto:** Experience (diagnóstico industrial interactivo), no Notebook.
**Título:** El motor se detiene por sobrecarga.
**Síntoma:** la cinta arranca, aumenta la carga, F2 dispara y KM1 cae.
**Causa raíz simulada:** resistencia mecánica excesiva en rodillo R1.
**Potencia:** 400 VAC trifásica, Q1 → KM1 → F2 → M1, PE a carcasa del motor.
**Mando:** +24 VDC → F1 → F2 NC 95–96 → S0 NC 11–12 → (S1 NO 13–14 en paralelo con KM1 NO 13–14) → bobina KM1 A1/A2 → 0 VDC. La fuente PS1 puede aparecer en la vista física; el plano de mando empieza en +24 V por decisión editorial.
**M1 ficticio:** 1,5 kW, 400 V, 50 Hz, In 3,8 A (valores didácticos, no placa verificada).
**Corrientes simuladas:** normal 3,5 A, sobrecarga 5,6 A, ajuste F2 3,8 A. No atribuir tiempo fijo de disparo.
**Evidencias:** corriente elevada en L1; F2 disparado; 95–96 abierto (OL) bajo aislamiento; deterioro de rodillo R1.
**Decisión correcta:** no subir ajuste F2 ni rearmar repetidamente; consignar equipo, inspeccionar rodillo, corregir causa mecánica y validar con corriente normal.
**Seguridad:** medición de corriente solo por personal autorizado, con instrumento adecuado y procedimiento seguro; continuidad exclusivamente con circuito aislado, ausencia de tensión comprobada y sin caminos paralelos.
