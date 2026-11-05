# EE-0027 — Esclavo EtherCAT no operativo

Borrador bilingüe del ENV-003 para diagnosticar un esclavo EtherCAT detectado pero fuera del estado OP por una incompatibilidad entre el PDO mapping esperado y el configurado.

La unidad separa enlace físico, estado AL, diagnóstico del maestro y configuración RxPDO/TxPDO antes de restaurar la asignación compatible y verificar datos cíclicos válidos.

La representación visual está disponible con seis assets aprobados, uno por evidencia, y una portada asociada a `ART-001`. Las copias de ejecución están en `assets/` y los originales suministrados se conservan en `media-source/EE-0027_assets/`.

Los seis PNG son ilustraciones generadas con estilo TwinCAT, no capturas reales de diagnóstico Beckhoff. El paquete advierte que algunos desgloses PDO y códigos o mensajes de diagnóstico no están verificados de forma independiente contra el ESI del EL7041 ni contra logs TwinCAT; la selección visual no certifica exactitud de fabricante.
