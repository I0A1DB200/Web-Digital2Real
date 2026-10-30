# EE-0023 — Fallo de estación PROFIBUS

Experience bilingüe del ENV-003 para diagnosticar una estación PROFIBUS DP fuera del intercambio cíclico. El caso enseña a delimitar el alcance, comparar maestro/vecinos, confirmar una discrepancia de dirección y verificar la recuperación completa.

## Causa didáctica

La causa interna simulada es una dirección de estación que no coincide con la dirección configurada en el maestro PROFIBUS DP. El buffer identifica el síntoma y la estación afectada, pero no se presenta como prueba única de la causa: la confirmación llega al comparar diagnóstico, estado de vecinos y parámetros de la estación.

## Assets

Los siete PNG son originales para Digital2Real: dos fotografías sintéticas de armario/estación y cinco paneles simulados de diagnóstico online. Las interfaces toman referencias de TIA Portal, STEP 7, PRONETA y de la documentación Siemens aportada para la fase, pero no reproducen capturas de proveedor ni inventan códigos de evento.

Referencias técnicas aportadas:
- [SIMATIC S7-1500 Diagnose](https://cache.industry.siemens.com/dl/files/497/68011497/att_1027317/v3/68011497_S7-1500_Diagnose_DOKU_v20_en.pdf)
- [TIA Portal programming concepts](https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_eses_20/programming-concepts/guidelines-for-designing-a-plc-system)

Los textos de evento y sus códigos exactos dependen de CPU, interfaz DP y firmware. Por eso esta Experience usa categorías de diagnóstico y separa explícitamente evidencia, hipótesis y causa confirmada.
