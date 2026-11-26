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
