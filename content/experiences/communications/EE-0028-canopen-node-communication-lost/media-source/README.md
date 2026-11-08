# Media source — EE-0028

Paquete visual integrado para `EXP-CANOPEN-NODE-028`. Cada original se conserva en `EE-0028_assets/` y tiene una copia exacta con nombre estable en `../assets/` para el empaquetado de la Experience.

| Evidencia | Asset original | Copia runtime | Dimensiones | SHA-256 |
| --- | --- | --- | --- | --- |
| `EVID-01-INCIDENT` / `ART-001` | `EVID-01_Incident.png` | `01-incident.png` | 1672 × 941 | `f7ff991cb883cc3fe6515499e89df21cdec7e3d050a6d170626e2296e94d07ae` |
| `EVID-02-PRODUCER-CONFIG` / `ART-002` | `EVID-02_Heartbeat_Producer_Disabled.png` | `02-producer-disabled.png` | 1671 × 941 | `5e484a9fad550fe7b2e046373a70ff3d050dd38fb69c149c5ea9a4508ec9f335` |
| `EVID-03-CONSUMER-CONFIG` / `ART-003` | `EVID-03_Heartbeat_Consumer.png` | `03-consumer-monitoring.png` | 1672 × 941 | `dfd92d2b5d760ce7d7f7344a34d7278f459f3e70e056aa4dc57ec86d6c0f8f1f` |
| `EVID-04-CAN-FRAMES` / `ART-004` | `EVID-04_CAN_Traffic.png` | `04-can-traffic.png` | 1672 × 941 | `79310c264c4c46819ed76a0374ff8a9f2506731be3979238d4ffe23e83e30ef7` |
| `EVID-05-NMT-STATE` / `ART-005` | `EVID-05_SDO_NMT.png` | `05-sdo-nmt.png` | 1671 × 941 | `1a70464870597c68e913fa484663dad7e374628d666870d22e7c936b07b59acf` |
| `EVID-06-RECOVERY` / `ART-006` | `EVID-06_Recovery.png` | `06-recovery.png` | 1671 × 941 | `6e1d72ec263b34854f5c037439d3eca24a1b739a097728fd6ca8eaa5a2ed47d8` |

Las seis imágenes son simulaciones didácticas aprobadas por el usuario, no capturas reales ni diagnósticos verificados del software CODESYS. Las interfaces de diagnóstico y trace están recreadas.

Salvedades del paquete suministrado:

- En `EVID-03`, el productor local `0x701` supone Node-ID 1, que no está establecido por el escenario.
- En `EVID-05`, el valor SDO es ilustrativo.
- En `EVID-06`, el PDO `0x183` corresponde convencionalmente al nodo 3, no al nodo 5; demuestra actividad PDO en el bus, no actualización del PDO del nodo 5.
- Los valores `0x1017`, `0x705` y los tiempos mostrados pertenecen a la simulación visual; no deben atribuirse a hardware real sin una fuente adicional.
