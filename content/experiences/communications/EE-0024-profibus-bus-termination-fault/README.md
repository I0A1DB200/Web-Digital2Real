# EE-0024 — Fallo de terminación del bus PROFIBUS

Experience bilingüe del ENV-003 para diagnosticar una degradación física causada por una terminación incorrecta en un extremo de un segmento PROFIBUS DP. El caso separa el síntoma del buffer, la localización por topología, la inspección de conectores y la verificación repetida de estabilidad.

La causa simulada es una terminación de extremo desactivada. PROFIBUS requiere terminación activa en los dos extremos del segmento; no se prescribe una terminación intermedia ni cambios en el maestro. El buffer incorpora como evidencia los eventos `16#39CB / 16#38CB` de fallo o retorno de estación DP y `16#35A1` de acceso a I/O descentralizada. La interpretación exacta depende de la CPU, la interfaz y el firmware; los códigos delimitan el síntoma y no sustituyen la inspección física.
