// Presentation only. Entry/section identities, structure, code and engineering data
// belong to notebook.js. Keys are permanent section IDs, not display positions.
export const translations = {
  "article-001": {
    title: "Mostrar la velocidad de un transportador sin encoder",
    kicker: "Problema — Solución",
    excerpt: "Estima la velocidad del transportador con un sensor fotoeléctrico existente y lógica PLC, sin añadir un encoder.",
    coverAlt: "Transportador que utiliza un sensor fotoeléctrico y lógica PLC para estimar la velocidad de los paquetes sin encoder.",
    categories: ["Automatización industrial"],
    tags: ["Transportador", "Estimación de velocidad", "Sensor fotoeléctrico"],
    technologies: ["PLC", "Sensor fotoeléctrico"],
    sections: {
      s01: "Un encoder es el instrumento adecuado cuando un transportador necesita realimentación precisa del movimiento, posicionamiento o control en lazo cerrado. Sin embargo, muchas máquinas solo necesitan una velocidad estimada para supervisión, diagnóstico o cálculos de producción. En ese caso más limitado, un sensor fotoeléctrico que ya detecta los paquetes puede aportar información suficiente.",
      s02: "El reto",
      s03: "Añadir un encoder afecta a más aspectos que la lista de materiales. Puede requerir adaptación mecánica, cableado, una entrada PLC adecuada, actualización de planos y tiempo de puesta en marcha. También añade otro dispositivo que mantener. Ese trabajo resulta difícil de justificar cuando se necesita una indicación aproximada del proceso y no una realimentación precisa del movimiento.",
      s04: "La solución",
      s05: "Utiliza la longitud conocida del paquete como distancia medida. Inicia un temporizador del PLC cuando el borde delantero llegue al sensor y detenlo cuando salga el borde trasero. Dividir la longitud del paquete entre el tiempo de paso proporciona una estimación de la velocidad del transportador. La lógica necesita una detección clara de flancos y protección frente a tiempos de medición nulos o inválidos.",
      s06: { title: "Secuencia de medición", items: ["Detectar el borde delantero del paquete e iniciar la medición de tiempo.", "Detectar el borde trasero y detener la medición.", "Validar el intervalo medido.", "Dividir la longitud conocida del paquete entre el tiempo de paso.", "Poner el resultado a disposición de la supervisión o el diagnóstico."] },
      s08: "Nota de ingeniería",
      s09: { title: "Conoce los límites de la medición", content: "Este método mide la velocidad media mientras un paquete atraviesa el sensor. La precisión depende de una longitud y orientación uniformes del paquete, una detección fiable de flancos, el tiempo de respuesta del sensor y el tiempo de ciclo del PLC. Los productos también deben permanecer separados. Si el transportador acelera durante la medición, el resultado es la media del intervalo, no un valor instantáneo." },
      s10: { title: "Utiliza un encoder cuando la precisión determine el control del proceso", content: "El posicionamiento, la sincronización, las mediciones relacionadas con la seguridad y una realimentación fiable en lazo cerrado siguen requiriendo un encoder o sensor de movimiento adecuado." },
      s11: "Ideas clave",
      s12: ["Reutiliza una señal existente cuando el proceso solo necesite una estimación.", "Valida la geometría del paquete y las condiciones de temporización.", "Indica claramente que el resultado es una velocidad estimada.", "Elige un encoder cuando la precisión forme parte del control."],
      s13: "Conclusión",
      s14: "La mejor arquitectura de medición no es automáticamente la más sofisticada. Cuando una velocidad aproximada satisface el requisito real, una longitud de paquete conocida, un sensor fotoeléctrico y una lógica PLC compacta pueden aportar información útil sin hardware innecesario. La precisión debe responder a las necesidades del proceso, no a la costumbre."
    }
  },
  "article-002": {
    title: "De 500 segmentos a un bloque de función reutilizable",
    kicker: "Problema — Solución",
    excerpt: "Sustituye los segmentos PLC duplicados por datos estructurados y lógica de control reutilizable que crece mediante configuración.",
    coverAlt: "Comparación entre cientos de segmentos PLC duplicados y un bloque de función de control de motor reutilizable aplicado a un array de dispositivos.",
    categories: ["Arquitectura de software PLC"],
    tags: ["Lógica reutilizable", "Bloques de función", "Arrays", "Escalabilidad"],
    technologies: ["PLC", "Datos estructurados", "Bloques de función"],
    sections: {
      s01: "Un proyecto PLC se vuelve frágil cuando se copia lógica similar para cada motor, válvula o transportador. Duplicar un segmento parece inofensivo. Cientos de ellos crean versiones independientes del mismo comportamiento: cada corrección exige buscar por todo el proyecto y cada cambio de puesta en marcha amenaza la coherencia.",
      s02: "El reto",
      s03: "Los segmentos copiados divergen con el tiempo. Un motor recibe un retardo de alarma corregido mientras otro conserva el valor antiguo. Los enclavamientos, diagnósticos y nombres dejan de ser coherentes. Hay que repetir las pruebas porque segmentos aparentemente equivalentes pueden comportarse de forma distinta. El programa crece por duplicación en lugar de hacerlo mediante una arquitectura controlada.",
      s04: "La solución",
      s05: "Separa los datos del dispositivo de su comportamiento. Guarda los comandos, la realimentación, el estado, las alarmas y los parámetros de cada motor en una instancia estructurada. Después aplica un bloque de función reutilizable mediante una interfaz coherente. Esa interfaz se convierte en un contrato: cada instancia recibe los mismos comandos, expone los mismos estados e informa de fallos con la misma estructura de diagnóstico. Un array o colección contiene las instancias de los dispositivos; la configuración define sus diferencias.",
      s07: "La sintaxis es ilustrativa. La idea arquitectónica es que cada motor conserve datos y estado independientes mientras comparte un comportamiento de control probado. Añadir un dispositivo consiste en añadir y configurar una instancia, no en clonar otro segmento.",
      s08: "Nota de ingeniería",
      s09: { title: "La reutilización requiere un comportamiento visible", content: "Un bloque reutilizable no debe convertirse en una caja negra. Utiliza nombres legibles, interfaces explícitas, control de versiones, simulación y salidas de diagnóstico. Valida el impacto en el tiempo de ciclo al procesar arrays grandes. Mantén fuera del modelo genérico los equipos realmente singulares y las funciones de seguridad cuando su comportamiento no encaje con claridad." },
      s10: { title: "Escala mediante configuración", content: "Una corrección realizada en un componente validado puede desplegarse de forma coherente en sus instancias. La puesta en marcha se centra entonces en los parámetros y las condiciones de campo, en lugar de revisar cientos de segmentos casi idénticos." },
      s11: "Ideas clave",
      s12: ["Encapsula el comportamiento repetido en componentes reutilizables.", "Mantén el estado del dispositivo en instancias estructuradas.", "Configura las diferencias en lugar de copiar lógica.", "Expón comandos, realimentación y diagnósticos coherentes.", "Conserva lógica explícita para equipos realmente singulares."],
      s13: "Conclusión",
      s14: "Un programa PLC escalable crece añadiendo instancias de dispositivos bien definidas, no multiplicando segmentos. Los datos estructurados y el comportamiento reutilizable hacen que las correcciones sean coherentes, las pruebas repetibles y los diagnósticos predecibles. La complejidad debe estar dentro de componentes cuidadosamente diseñados, no repartida entre cientos de copias."
    }
  },
  "article-003": {
    title: "¿Qué es IO-Link?", kicker: "Comunicación industrial",
    excerpt: "Los sensores modernos pueden proporcionar mucho más que una señal ON/OFF.",
    coverAlt: "Maestro IO-Link conectado a sensores y actuadores industriales inteligentes.",
    categories: ["Comunicación industrial"],
    sections: {
      s01: "Los sensores modernos pueden proporcionar mucho más que una señal ON/OFF.",
      s02: "IO-Link es un protocolo de comunicación punto a punto normalizado, definido por IEC 61131-9. Permite que sensores y actuadores inteligentes intercambien datos de proceso, diagnósticos y parámetros con un PLC a través de un maestro IO-Link.",
      s03: "A diferencia de un bus de campo, IO-Link puede utilizar cableado estándar de sensores de tres hilos. La instalación sigue siendo similar a la de un sensor digital convencional, pero proporciona información adicional, como el estado del dispositivo, la calidad de la señal y datos de configuración.",
      s04: "¿Por qué utilizar IO-Link?",
      s05: ["Sustitución más rápida de dispositivos mediante la restauración automática de parámetros.", "Diagnóstico remoto y mayor visibilidad para mantenimiento.", "Cableado estándar de sensores sin complejidad adicional de red.", "Menos tiempo de puesta en marcha y diagnóstico de averías."],
      s06: "Arquitectura",
      s07: "PLC\n  |\nPROFINET\n  |\nMaestro IO-Link\n  |-- Sensor fotoeléctrico\n  |-- Sensor de presión\n  |-- Lector RFID\n  `-- Isla de válvulas",
      s08: { title: "IO-Link no es un bus de campo", content: "El PLC se comunica con el maestro IO-Link mediante una red industrial como PROFINET, EtherNet/IP o EtherCAT. El maestro gestiona una conexión punto a punto independiente con cada dispositivo IO-Link." }
    }
  },
  "article-004": {
    title: "Diseño PLC basado en UDT", kicker: "Nota de ingeniería #004",
    excerpt: "Los tipos definidos por el usuario proporcionan un modelo de datos estructurado para los elementos de la máquina y facilitan la comprensión, reutilización, mantenimiento y ampliación del software PLC.",
    coverAlt: "Arquitectura de software PLC basada en UDT que muestra datos de máquina estructurados, bloques de función y elementos físicos de la máquina.",
    categories: ["Arquitectura de software PLC"],
    sections: {
      s01: "A medida que crecen las aplicaciones PLC, gestionar cientos de variables individuales resulta cada vez más difícil.",
      s02: "Los tipos definidos por el usuario (UDT) resuelven este problema al definir estructuras de datos coherentes para los elementos físicos de una máquina.",
      s03: "En lugar de tratar cada señal como una variable aislada, los comandos relacionados, la información de estado y los parámetros pueden representarse como un único objeto de ingeniería.",
      s04: "De señales a objetos",
      s05: "Considera un transportador. Una implementación plana podría contener variables independientes como Conveyor_Start, Conveyor_Stop, Conveyor_Running, Conveyor_Fault, Conveyor_SpeedSetpoint y Conveyor_ActualSpeed.",
      s06: "Estas variables describen el mismo objeto físico, pero su relación solo se expresa mediante el nombre. Un UDT hace explícita esa relación.",
      s08: "Modelo de datos",
      s09: "La máquina puede representarse entonces mediante objetos estructurados:",
      s11: "El modelo de datos del PLC refleja ahora la arquitectura física de la máquina.",
      s12: "Esto facilita la navegación por el software, porque los ingenieros pueden razonar sobre elementos de la máquina en lugar de buscar entre variables sin relación explícita.",
      s13: "UDT y bloques de función",
      s14: "Los UDT definen la estructura de datos. Los bloques de función definen el comportamiento. Mantener separadas estas responsabilidades permite crear una arquitectura sólida.",
      s15: "UDT → Qué datos representan al equipo.",
      s16: "FB → Cómo se comporta el equipo.",
      s17: "Por ejemplo, FB_Conveyor puede trabajar con una interfaz UDT_Conveyor mientras se reutiliza la misma estructura para varios transportadores.",
      s18: "El objetivo no es crear abstracción por sí misma, sino establecer un contrato de software predecible para cada elemento de la máquina. Es un patrón de ingeniería escalable, no la única arquitectura PLC válida.",
      s19: "Arquitectura del sistema",
      s20: "                 OB1\n                  |\n       +----------+----------+\n       |          |          |\n     FC_IO    FB_Conveyor  FB_Pusher\n                  |\n              UDT_System\n                  |\n            Máquina física",
      s21: ["OB1 coordina la ejecución.", "FC_IO aísla el mapeo de las E/S físicas.", "Los bloques de función encapsulan el comportamiento del equipo.", "Los UDT proporcionan el modelo de datos estructurado que conecta la arquitectura del software con la máquina."],
      s22: "Por qué escala",
      s23: "Los datos estructurados aportan varias ventajas de ingeniería:",
      s24: ["Interfaces coherentes", "Navegación más sencilla", "Menor ambigüedad en los nombres", "Bloques de función reutilizables", "Diagnósticos predecibles", "Ampliación más sencilla de los módulos de máquina", "Responsabilidad más clara sobre los datos de proceso"],
      s25: "Al añadir otro transportador o empujador, la arquitectura puede reutilizar el tipo y el comportamiento existentes en lugar de crear otra colección de variables sin relación explícita.",
      s26: "Nota de ingeniería",
      s27: { title: "La estructura de hoy permite la escalabilidad de mañana", content: "Un UDT no es simplemente una forma cómoda de agrupar tags del PLC. Forma parte de la arquitectura del software. Un buen modelo de datos describe la máquina de una manera comprensible tanto para el PLC como para el ingeniero. Cuando el modelo de datos refleja el sistema físico, el software resulta más fácil de diagnosticar, ampliar y mantener." }
    }
  },
  "article-005": {
    title: "Comprender el lazo de corriente industrial de 4–20 mA", kicker: "Nota de ingeniería #005",
    excerpt: "El lazo de corriente de 4–20 mA proporciona una interfaz fiable entre la instrumentación de campo y el sistema de control. Comprender toda la cadena de medición es esencial para la puesta en marcha y el diagnóstico de señales analógicas.",
    coverAlt: "Lazo industrial de 4–20 mA con un transmisor de presión de dos hilos conectado a un módulo de entradas analógicas de una estación S7-1500 y una HMI que muestra el valor de ingeniería.",
    categories: ["Automatización industrial"],
    sections: {
      s01: "El lazo de corriente de 4–20 mA es uno de los métodos más consolidados para transmitir mediciones analógicas de proceso en automatización industrial.",
      s02: "Los transmisores de presión, temperatura, caudal y nivel lo utilizan habitualmente para comunicar una variable de proceso medida a un PLC o DCS. La señal en sí es sencilla. El reto de ingeniería consiste en comprender toda la cadena de medición.",
      s03: "La cadena de medición",
      s04: "Un valor de proceso pasa por varias representaciones antes de llegar al operador.",
      s05: "PROCESO FÍSICO\n      ↓\nTRANSMISOR\n      ↓\n4–20 mA\n      ↓\nENTRADA ANALÓGICA\n      ↓\nVALOR BRUTO DEL PLC\n      ↓\nESCALADO\n      ↓\nVALOR DE INGENIERÍA",
      s06: "Estos valores están relacionados, pero no son lo mismo. Un valor de presión en bar no se transmite directamente por el cable.",
      s07: "El transmisor convierte la medición física en corriente. La entrada analógica convierte esa corriente en un valor numérico disponible para el PLC. Después, el PLC puede escalar ese valor a unidades de ingeniería.",
      s08: "¿Por qué 4–20 mA?",
      s09: ["4 mA representa el valor mínimo calibrado.", "20 mA representa el valor máximo calibrado.", "12 mA corresponde aproximadamente al punto medio de un rango lineal."],
      s10: "Utilizar 4 mA en lugar de 0 mA proporciona un cero vivo. Una medición mínima válida sigue siendo eléctricamente distinguible de una condición anómala en la que desaparece la corriente del lazo. Una lectura próxima a 0 mA indica una condición anómala que requiere diagnóstico; no identifica por sí sola un fallo concreto.",
      s11: "Ejemplo de transmisor de presión",
      s12: "Considera un transmisor de presión configurado para un rango calibrado de 0–20 bar.",
      s14: "El transmisor mide presión. El lazo transporta corriente. La entrada analógica mide esa señal eléctrica. El PLC convierte el valor bruto resultante en el valor de ingeniería utilizado por la aplicación.",
      s15: "Lazo eléctrico",
      s16: "Un lazo habitual con transmisor de dos hilos puede representarse conceptualmente así:",
      s17: "+24 VDC\n   │\n   ▼\nTRANSMISOR DE 2 HILOS\n   │\n   │ 4–20 mA\n   ▼\nCANAL DE ENTRADA ANALÓGICA\n   │\n   ▼\n0 VDC",
      s18: "La señal de 4–20 mA termina en el módulo de entradas analógicas, no directamente en la CPU del PLC. En una estación local S7-1500, el módulo puede estar instalado junto a la CPU como parte de la misma estación.",
      s19: "El módulo analógico realiza la conversión de entrada y pone el valor de proceso resultante a disposición del controlador. La disposición exacta de los bornes depende del módulo, del transmisor y de la configuración del lazo seleccionados.",
      s20: "Diagnóstico de la cadena de medición",
      s21: "Cuando una medición analógica es incorrecta, diagnostica la cadena desde la señal física hacia el software.",
      s22: ["Verifica la alimentación del transmisor.", "Verifica la continuidad del lazo.", "Mide la corriente real del lazo.", "Comprueba la configuración y el rango de medición del transmisor.", "Verifica la configuración de la entrada analógica.", "Inspecciona el valor bruto del PLC.", "Verifica el escalado.", "Compara el valor final de ingeniería con el proceso real."],
      s23: "Corriente del lazo incorrecta\n→ Investiga el transmisor, el cableado, la alimentación o la medición del proceso.\n\nCorriente del lazo correcta + valor bruto del PLC incorrecto\n→ Investiga el hardware o la configuración de la entrada analógica.\n\nValor bruto del PLC correcto + valor de ingeniería incorrecto\n→ Investiga el escalado o el software del PLC.",
      s24: "Nota de ingeniería",
      s25: { title: "Mide el lazo antes de cambiar el software", content: "Un lazo de 4–20 mA no es solo una señal. Es una cadena de medición que conecta el proceso físico con el sistema de automatización. Durante el diagnóstico, identifica el primer punto en el que la medición deja de representar correctamente la realidad." }
    }
  },
  "article-006": {
    title: "Construir arquitecturas PLC escalables", kicker: "Nota de ingeniería #006",
    excerpt: "Un proyecto PLC mantenible se organiza por responsabilidades, no por orden de ejecución. Separa E/S, coordinación, comportamiento de equipos y modelos de datos para que el software crezca sin volverse más difícil de mantener.",
    coverAlt: "Representación técnica de TIA Portal de una arquitectura PLC escalable, organizada en mapeo de E/S, coordinación de proceso, bloques de función de equipos, DB de instancia y datos UDT estructurados.",
    categories: ["Arquitectura de software PLC"],
    sections: {
      s01: "Un programa PLC puede funcionar correctamente y aun así estar mal diseñado. La diferencia suele hacerse visible durante la puesta en marcha, el diagnóstico, las modificaciones o el crecimiento del proyecto.",
      s02: "Una arquitectura PLC escalable asigna una responsabilidad clara a cada parte del proyecto. El objetivo no es crear más bloques, sino facilitar la comprensión, el diagnóstico, la reutilización y la ampliación del sistema.",
      s03: "El problema de diseñar por orden de ejecución",
      s04: "Los programas PLC se ejecutan en un orden definido. Eso no significa que la arquitectura del software deba diseñarse únicamente en torno a ese orden.",
      s05: "OB1\n |\n +-- Segmento 1\n +-- Segmento 2\n +-- Segmento 3\n +-- Segmento 4\n ...\n +-- Segmento 500",
      s06: "Esto puede ejecutarse correctamente, pero el orden de ejecución no explica las responsabilidades. Cuando aumenta la complejidad, los ingenieros necesitan respuestas predecibles sobre el mapeo de E/S, las secuencias, el estado de los equipos, las alarmas y la responsabilidad sobre los datos.",
      s07: "Organizar por responsabilidades",
      s09: "Estos nombres son ejemplos, no convenciones obligatorias de Siemens. El principio arquitectónico es separar las responsabilidades.",
      s10: "OB1 — Coordinación de la ejecución",
      s11: "OB1 es el punto de entrada cíclico de la aplicación PLC. En una arquitectura mantenible, puede mostrar la estructura de ejecución sin convertirse en el lugar donde se implementa todo el comportamiento de la máquina.",
      s12: "Mantener OB1 ligero es un patrón útil, no una regla absoluta que prohíba toda lógica. Un técnico que lo abra debería comprender rápidamente las principales capas de software y su orden de llamada.",
      s13: "Mapeo de E/S",
      s14: "Las E/S físicas representan el hardware, mientras que la lógica de máquina representa el comportamiento. Separarlas reduce el acoplamiento entre la lógica de aplicación y las direcciones físicas.",
      s15: "Entrada física\n%I0.0\n\nRepresentación en la aplicación\nConveyor_1.Sts.SensorPE",
      s16: "La lógica del equipo puede trabajar con SensorPE en lugar de depender repetidamente de %I0.0. La capa de mapeo establece un límite explícito, aclara la navegación y permite localizar mejor los cambios de hardware.",
      s17: "Capa de coordinación",
      s18: "Cada bloque de equipo conoce su comportamiento, pero no necesariamente es responsable de toda la secuencia de producción. Una capa de coordinación puede gestionar los modos de máquina, el estado de secuencia, el flujo de producción, los permisos de alto nivel y las interacciones entre equipos.",
      s19: "Por ejemplo, FB_MachineCtrl puede coordinar FB_Conveyor, FB_Pusher y FB_Weighing sin implementar el comportamiento interno de cada dispositivo. Así se evita que un gran bloque acumule todas las responsabilidades.",
      s20: "Módulos de equipo",
      s21: "El equipo físico suele proporcionar un límite útil para el software. Un bloque de función reutilizable puede encapsular el comportamiento de un transportador, empujador, válvula, bomba, estación de pesaje o interfaz de robot.",
      s22: "FB_Conveyor\n     │\n     ├── Comandos\n     ├── Estado\n     ├── Enclavamientos\n     ├── Estado interno\n     └── Diagnósticos",
      s23: "Varios transportadores pueden reutilizar el mismo comportamiento y mantener datos de instancia independientes. Es un patrón escalable, no una exigencia de que cada objeto físico tenga su propio FB.",
      s24: "Responsabilidad sobre los datos",
      s25: "La arquitectura no se limita a los bloques de programa. Los datos también necesitan un responsable claro. Los DB de instancia contienen datos de instancia asociados a los FB. Los UDT definen tipos de datos coherentes e interfaces estructuradas; no contienen comportamiento.",
      s26: "Los DB globales siguen siendo adecuados para la información realmente compartida por la aplicación. La pregunta de ingeniería no es qué forma de almacenamiento es siempre mejor, sino quién es responsable del dato y qué función lo necesita.",
      s27: "El software debe reflejar la máquina",
      s28: "MÁQUINA                         SOFTWARE\n │                               │\n ├── Conveyor_1                  ├── FB_Conveyor / DB_Conveyor_1\n ├── Conveyor_2                  ├── FB_Conveyor / DB_Conveyor_2\n ├── Pusher_1                    ├── FB_Pusher   / DB_Pusher_1\n └── Weighing_1                  └── FB_Weighing / DB_Weighing_1",
      s29: "Esta correspondencia reduce la interpretación necesaria durante el diagnóstico. Cuando falla Conveyor_2, el ingeniero dispone de un lugar predecible donde investigar su comportamiento y sus datos.",
      s30: "Escalabilidad",
      s31: "La escalabilidad significa que añadir funcionalidad no provoca un crecimiento incontrolado de la complejidad del software. Una arquitectura escalable hace que los cambios habituales sean locales.",
      s32: ["Añadir otro transportador supone principalmente añadir otra instancia de transportador.", "Cambiar el comportamiento del transportador afecta principalmente a la implementación de su equipo.", "Cambiar una dirección de E/S afecta principalmente a la capa de mapeo.", "Cambiar el comportamiento de la secuencia afecta principalmente a la lógica de coordinación."],
      s33: "Estos límites reducen los efectos secundarios no deseados y conectan el comportamiento reutilizable presentado en la Nota de ingeniería #002 con el modelo de datos estructurado de la Nota de ingeniería #004.",
      s34: "Nota de ingeniería",
      s35: { title: "Las responsabilidades claras crean sistemas mantenibles", content: "Una buena arquitectura PLC no consiste en crear más bloques. Cuando el mapeo de E/S, la coordinación, el comportamiento del equipo y la responsabilidad sobre los datos tienen límites predecibles, el proyecto resulta más fácil de comprender, diagnosticar y ampliar. La arquitectura funciona cuando otro ingeniero puede determinar rápidamente dónde corresponde hacer un cambio." }
    }
  },
  "article-007": {
    title: "Bloques de función frente a funciones", kicker: "Nota de ingeniería #007",
    excerpt: "Tanto las FC como los FB pueden ejecutar lógica PLC, pero resuelven problemas arquitectónicos distintos. La diferencia clave es si la responsabilidad necesita un estado propio de cada instancia que persista entre ciclos del PLC.",
    coverAlt: "Comparación de arquitectura de software PLC entre una función sin estado de instancia y un bloque de función con datos de instancia persistentes.",
    categories: ["Arquitectura de software PLC"],
    sections: {
      s01: "Tanto las funciones como los bloques de función pueden ejecutar lógica PLC. La diferencia arquitectónica no es simplemente que la lógica sea sencilla o compleja. La pregunta esencial es si la responsabilidad necesita un estado propio de cada instancia que persista entre ciclos del PLC.",
      s02: "Elegir entre una FC y un FB según la responsabilidad aclara la propiedad del software y permite que los equipos repetidos se comporten de forma independiente sin duplicar su implementación.",
      s03: "Función — Operación sin estado de instancia FB",
      s04: "Una función encaja de forma natural con una operación que no necesita su propio estado de instancia FB. Recibe información, realiza una tarea definida y devuelve o escribe un resultado sin un bloque de datos de instancia asociado.",
      s05: ["Escalado y conversión de unidades.", "Cálculos matemáticos.", "Mapeo de E/S.", "Transformaciones y comparaciones de datos.", "Operaciones auxiliares reutilizables."],
      s06: "ENTRADAS\n   │\n   ▼\n  FC\n   │\n   ▼\nSALIDAS",
      s07: "La misma FC puede llamarse repetidamente con datos distintos. Puede leer o modificar información persistente recibida mediante su interfaz o almacenada en otro lugar, pero esa persistencia no pertenece a la propia función como estado de instancia FB.",
      s08: "Bloque de función — Comportamiento con estado de instancia",
      s09: "Un bloque de función encaja de forma natural cuando una responsabilidad representa un comportamiento que debe recordar su propia condición entre ciclos. Los transportadores, bombas, válvulas, ejes y otros módulos de equipo suelen necesitar estado, temporizadores, enclavamientos y diagnósticos independientes.",
      s10: "                 FB_Conveyor\n        ┌─────────────────────────┐\nCmd ───►│                         │───► Estado\nI/O ───►│ Comportamiento de equipo│───► Salidas\n        │                         │\n        │ Estado interno          │\n        │ Temporizadores          │\n        │ Enclavamientos          │\n        │ Diagnósticos            │\n        └────────────┬────────────┘\n                     │\n                     ▼\n              DB_Conveyor_1\n              DB de instancia",
      s11: "El DB de instancia almacena los datos de esa instancia FB entre ciclos del PLC. Esto permite que una implementación compartida represente varios equipos mientras cada instancia conserva un estado operativo independiente.",
      s12: "Mismo comportamiento, distintas instancias",
      s13: "FB_Conveyor\n   │\n   ├── DB_Conveyor_1 → En marcha\n   ├── DB_Conveyor_2 → Parado\n   └── DB_Conveyor_3 → En fallo",
      s14: "Los tres transportadores reutilizan el mismo comportamiento, pero sus comandos, estados, temporizadores y condiciones de diagnóstico siguen siendo independientes. Se reutiliza la implementación; el estado pertenece a cada instancia.",
      s15: "Estado de instancia",
      s16: "El estado de instancia es la información que pertenece a una instancia concreta de un bloque de función y se conserva entre llamadas. Describe su situación actual o lo que recuerda de ciclos anteriores.",
      s17: ["Estado y modo de funcionamiento actuales.", "Comandos enclavados y condiciones anteriores de las señales.", "Progreso de temporizadores y secuencias.", "Estado de enclavamientos, fallos y diagnósticos.", "Configuración específica de instancia cuando corresponde al equipo."],
      s18: "Las variables estáticas forman parte de los datos de instancia FB y pueden conservar esta información entre llamadas. Sin embargo, no todo valor persistente pertenece a un DB de instancia: los datos realmente compartidos o bajo responsabilidad externa deben permanecer con su responsable arquitectónico adecuado.",
      s19: "Guía de decisión",
      s20: "¿La responsabilidad necesita\nestado propio de instancia?\n        │\n   ┌────┴────┐\n   │         │\n  NO        SÍ\n   │         │\n   ▼         ▼\n  FC         FB",
      s21: "Es un criterio práctico, no una regla absoluta. Una operación sin estado de instancia propio suele apuntar a una FC. Un comportamiento reutilizable que debe conservar el estado de cada instancia suele apuntar a un FB. El tamaño del bloque, por sí solo, no es un criterio de selección sólido.",
      s22: "Criterios de decisión incorrectos",
      s23: ["Utilizar una FC porque la lógica es corta.", "Utilizar un FB porque la lógica es compleja.", "Utilizar un FB para cada dispositivo físico.", "Utilizar una FC siempre que se puedan calcular las salidas."],
      s24: "Estos atajos confunden el tamaño de la implementación con la responsabilidad arquitectónica. Una decisión mejor considera la responsabilidad sobre los datos, el ciclo de vida, la persistencia, la reutilización y la necesidad de que coexistan varias instancias independientes.",
      s25: "Ejemplo — Escalado",
      s26: "Valor bruto\n    │\n    ▼\n FC_Scale\n    │\n    ▼\nValor de ingeniería",
      s27: "El escalado transforma un valor de entrada a unidades de ingeniería según unos límites proporcionados. Cuando la operación no necesita conservar un historial propio de instancia, una FC es una candidata natural.",
      s28: "Ejemplo — Transportador",
      s29: ["Recordar si el transportador está arrancando, en marcha, deteniéndose o en fallo.", "Mantener temporización e historial de flancos independientes.", "Evaluar enclavamientos y diagnósticos específicos de instancia.", "Exponer comandos y estado mediante una interfaz de equipo coherente."],
      s30: "Un comportamiento de transportador con estas responsabilidades es un candidato natural a FB. Varios transportadores pueden utilizar el mismo bloque mientras sus DB de instancia conservan estados separados.",
      s31: "Nota de ingeniería",
      s32: { title: "Elige los bloques por su responsabilidad, no por su tamaño", content: "Utiliza una FC cuando la responsabilidad sea una operación sin estado de instancia FB propio. Utiliza un FB cuando sea un comportamiento reutilizable que deba recordar un estado independiente por instancia. Esta distinción mantiene explícitas la persistencia, la responsabilidad sobre los datos y la reutilización a medida que crece la aplicación PLC." }
    }
  },
  "article-008": {
    title: "DB global frente a DB de instancia", kicker: "ARQUITECTURA DE SOFTWARE PLC",
    excerpt: "Asignar la responsabilidad sobre los datos según su función, no por comodidad.",
    coverAlt: "Puesto de ingeniería industrial oscuro que muestra una arquitectura PLC Siemens con datos globales compartidos y varias instancias de bloques de función con datos de instancia independientes.",
    categories: ["Arquitectura de software PLC"],
    sections: {
      s01: "En un proyecto PLC Siemens, tanto los DB globales como los DB de instancia almacenan datos. Sin embargo, representan dos decisiones arquitectónicas muy diferentes.",
      s02: "La pregunta importante no es:", s03: "«¿Dónde puedo guardar esta variable?»", s04: "Es:", s05: "«¿Quién es responsable de este dato?»",
      s06: "Esta distinción cobra cada vez más importancia a medida que crece un proyecto PLC.",
      s07: "DB global",
      s08: "Un bloque de datos global existe independientemente de una instancia concreta de bloque de función. Es adecuado para datos que realmente pertenecen a un contexto más amplio del sistema, como información de producción, recetas, estado de línea o configuración del sistema.",
      s10: "Varias partes del programa pueden necesitar legítimamente acceder a esta información. El DB representa datos compartidos del sistema.",
      s11: "DB de instancia",
      s12: "Un DB de instancia pertenece a una instancia FB concreta. Así, el mismo bloque de función puede reutilizarse para varias instancias de equipos mientras cada una mantiene su propio estado.",
      s14: "Cada transportador ejecuta el mismo comportamiento, pero cada instancia mantiene sus propios datos.",
      s15: "Entre los datos de instancia habituales pueden estar:",
      s16: ["Running", "Fault", "SpeedFeedback", "Timers", "InternalState", "Diagnostics"],
      s17: "Estos valores pertenecen al objeto transportador, no a toda la aplicación PLC.",
      s18: "La diferencia arquitectónica",
      s19: "DB GLOBAL\n     │\n     └── Información compartida del sistema\n              │\n      ┌───────┼───────┐\n      ▼       ▼       ▼\n     FB_A    FB_B    FB_C\n\n\nDATOS DE INSTANCIA\n\n FB_Conveyor\n      │\n ┌────┼────┐\n ▼    ▼    ▼\nC01  C02  C03\n │    │    │\nDB01 DB02 DB03",
      s20: "Un DB global establece una responsabilidad compartida sobre los datos. Los datos de instancia establecen una responsabilidad local asociada a una instancia FB. Esta distinción afecta al acoplamiento, la reutilización, el diagnóstico y la mantenibilidad.",
      s21: "Un error habitual",
      s22: "Un proyecto puede empezar almacenando el estado del equipo en grandes DB globales porque resulta fácil acceder a los datos.",
      s24: "Técnicamente, esto puede funcionar.",
      s25: "Sin embargo, desde el punto de vista arquitectónico, puede exponer el estado interno del equipo al resto de la aplicación y hacer que lógica no relacionada dependa de detalles de implementación. Cuando crece la máquina, esas dependencias se vuelven más difíciles de comprender y modificar con seguridad.",
      s26: "Un criterio de decisión mejor",
      s27: "Utiliza un DB de instancia o datos de instancia FB cuando la información pertenezca al estado interno o al comportamiento de una instancia de equipo.",
      s28: "Utiliza un DB global cuando la información pertenezca realmente al conjunto de la aplicación y necesite una responsabilidad compartida.",
      s29: "El objetivo no es eliminar los DB globales, sino asignar un responsable claro a cada dato.",
      s30: { title: "La responsabilidad sobre los datos forma parte de la arquitectura PLC.", content: "Almacena los datos según la responsabilidad a la que pertenecen, no en el DB al que resulte más fácil acceder." }
    }
  }
};

// ENV-004 presentation; technical model and permanent section IDs remain canonical.
Object.assign(translations, {
  "article-009": {
    "title": "Tensión, corriente, resistencia y circuito cerrado",
    "kicker": "Sistemas eléctricos · Bloque 01 · Revisión técnica pendiente",
    "excerpt": "La tensión es la diferencia de potencial entre dos puntos (V); se mide entre dos puntos.",
    "categories": [
      "Fundamentos eléctricos y medición"
    ],
    "sections": {
      "s01": "La tensión es la diferencia de potencial entre dos puntos (V); se mide entre dos puntos. La corriente es el flujo de carga eléctrica (A); requiere un camino cerrado y se mide en serie o mediante una pinza compatible. La resistencia representa la oposición al paso de corriente (Ω). La ley de Ohm, para un elemento óhmico y condiciones definidas, es U = R × I. No describe por sí sola cargas no lineales ni el comportamiento transitorio de motores. Una bobina, un convertidor y un motor no deben tratarse como resistencias fijas.",
      "s02": "En un circuito de mando 24 VDC, tener 24 V respecto a 0 V en un punto no demuestra que una carga esté alimentada: hay que considerar la referencia, el retorno y la tensión entre sus dos bornes. Un conductor de retorno interrumpido puede dejar una lectura aparentemente correcta en un borne y una carga sin funcionar. El multímetro de alta impedancia también puede mostrar tensiones fantasma por acoplamiento; una lectura aislada no confirma capacidad de suministro.",
      "s03": "Ejemplo resuelto: una resistencia de 240 Ω conectada a 24 VDC ideales consume I=24/240=0,10 A y disipa P=U×I=2,4 W. En diseño real se comprueba potencia nominal, tolerancias, temperatura y protección.",
      "s04": "Comprobación: ¿Qué mide un voltímetro conectado entre A1 y A2 de una bobina? A) Corriente de bobina; B) diferencia de potencial aplicada a la bobina; C) resistencia interna. Correcta B. A confunde magnitudes; C solo se determina con procedimiento de resistencia, circuito aislado.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-010": {
    "title": "AC, DC, frecuencia y valores eficaces",
    "kicker": "Sistemas eléctricos · Bloque 01 · Revisión técnica pendiente",
    "excerpt": "En DC la polaridad se mantiene en régimen normal; las fuentes industriales de 24 VDC alimentan PLC, sensores y bobinas adecuadas.",
    "categories": [
      "Fundamentos eléctricos y medición"
    ],
    "sections": {
      "s01": "En DC la polaridad se mantiene en régimen normal; las fuentes industriales de 24 VDC alimentan PLC, sensores y bobinas adecuadas. En AC la polaridad alterna periódicamente; la red de 50 Hz completa 50 ciclos por segundo. Las tensiones de red indicadas habitualmente son valores eficaces (RMS), no valores de pico. En una onda senoidal ideal U_pico = U_RMS × √2; una red de 230 VAC tiene aproximadamente 325 V de pico respecto a la referencia correspondiente. Los instrumentos deben ser aptos para forma de onda, frecuencia, categoría de medida y entorno.",
      "s02": "No se debe asumir que cualquier multímetro en modo AC mide correctamente señales distorsionadas o PWM. En un variador, la salida hacia el motor exige procedimientos e instrumentos específicos del fabricante; no extrapolar las mediciones de red.",
      "s03": "Comprobación: una bobina rotulada 24 VDC puede conectarse a 24 VAC porque ambas cifras son 24. A) Sí; B) No, el tipo de tensión y la especificación importan. Correcta B.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-011": {
    "title": "Potencia, energía y cargas industriales",
    "kicker": "Sistemas eléctricos · Bloque 01 · Revisión técnica pendiente",
    "excerpt": "En DC ideal P=U×I (W).",
    "categories": [
      "Fundamentos eléctricos y medición"
    ],
    "sections": {
      "s01": "En DC ideal P=U×I (W). La energía consumida se expresa en Wh o kWh: E=P×t cuando la potencia es constante. En AC monofásica sinusoidal P=U×I×cosφ; en trifásica equilibrada sinusoidal P=√3×U_LL×I_L×cosφ. Estas expresiones no sustituyen un análisis de armónicos o desequilibrio. Un motor absorbe corriente de arranque superior a la nominal según tecnología y método de arranque. El valor de placa, la eficiencia, el factor de potencia, la carga y la protección condicionan el diagnóstico.",
      "s02": "Ejemplo resuelto: una carga DC de 48 W a 24 V requiere idealmente 2 A. Una fuente de 2 A nominales podría ser insuficiente si hay picos de arranque, derating o cargas adicionales; el cálculo no autoriza su selección sin márgenes.",
      "s03": "Comprobación: dos motores con igual potencia mecánica pueden tener corrientes diferentes. Verdadero por rendimiento, factor de potencia, tensión y diseño.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-012": {
    "title": "Multímetro, pinza y lectura de medidas",
    "kicker": "Sistemas eléctricos · Bloque 01 · Revisión técnica pendiente",
    "excerpt": "El voltímetro se conecta en paralelo; un amperímetro convencional requiere configuración en serie y protección apropiada, mientras que una pinza compatible permite medir corriente sin abrir el circuito.",
    "categories": [
      "Fundamentos eléctricos y medición"
    ],
    "sections": {
      "s01": "El voltímetro se conecta en paralelo; un amperímetro convencional requiere configuración en serie y protección apropiada, mientras que una pinza compatible permite medir corriente sin abrir el circuito. La medición de resistencia y continuidad se realiza con el circuito aislado, sin tensión y verificado; las ramas paralelas pueden alterar el resultado. El zumbador de continuidad solo confirma un umbral del instrumento: no garantiza que una conexión soporte corriente nominal. La medida de caída de tensión bajo carga puede revelar resistencia de contacto que no aparece en una prueba de continuidad.",
      "s02": "Antes de confiar en una lectura se revisan modo AC/DC, rango, puntas, conectores, categoría CAT, estado del instrumento, referencia de medida y condiciones del circuito. Las mediciones energizadas solo pueden ejecutarlas profesionales autorizados con evaluación de riesgo y método aprobado. En estas prácticas el alumno interpreta lecturas proporcionadas.",
      "s03": "Ejemplo: un conductor presenta 0,3 Ω con circuito aislado; sin conocer longitud, sección, contactos y exactitud del instrumento, el dato no prueba por sí solo un defecto.",
      "s04": "Comprobación: ¿puede medirse continuidad con la fuente encendida? No. El modo ohmímetro inyecta su propia señal y una tensión externa puede dañar equipo o causar riesgo.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-013": {
    "title": "Calidad de la medida y diagnóstico diferencial",
    "kicker": "Sistemas eléctricos · Bloque 01 · Revisión técnica pendiente",
    "excerpt": "Una medida útil debe distinguir hipótesis.",
    "categories": [
      "Fundamentos eléctricos y medición"
    ],
    "sections": {
      "s01": "Una medida útil debe distinguir hipótesis. Registrar qué puntos, en qué estado, con qué referencia y cuándo evita conclusiones erróneas. Diferenciar medición en vacío y bajo carga, valores instantáneos y tendencias, tensión entre conductores y respecto a tierra. Los diagramas deben mostrar el punto de prueba. La resolución y la exactitud no son sinónimos. Una lectura de 24,0 V puede ser compatible con una caída intermitente no capturada; correlacionar con eventos y registros.",
      "s02": "Comprobación: una fuente indica 24,1 V sin carga y 18,7 V durante el arranque. ¿Qué dato discrimina mejor el fallo? La caída bajo carga, siempre contrastando demanda, cableado y límites de la fuente.",
      "s03": "Resumen del bloque: identificar magnitud, referencia, estado de carga y límites de la medida antes de diagnosticar.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-014": {
    "title": "Alimentación monofásica y trifásica",
    "kicker": "Sistemas eléctricos · Bloque 02 · Revisión técnica pendiente",
    "excerpt": "Una distribución trifásica dispone de tres conductores de fase; según sistema puede incluir neutro y conductor de protección PE.",
    "categories": [
      "Distribución eléctrica y protecciones"
    ],
    "sections": {
      "s01": "Una distribución trifásica dispone de tres conductores de fase; según sistema puede incluir neutro y conductor de protección PE. En una red típica europea 400/230 V, 400 V es tensión entre fases y 230 V entre fase y neutro, pero los valores concretos deben leerse en el esquema y la placa. PE no es neutro y no debe emplearse como retorno funcional. La continuidad y configuración de PE son cuestiones de seguridad que exigen verificación reglamentaria.",
      "s02": "Un motor trifásico puede seguir girando con pérdida de fase en determinadas circunstancias, con par reducido, sobrecorriente y riesgo térmico. No debe darse por seguro que siempre se detendrá inmediatamente. La detección requiere protecciones adecuadas y análisis del circuito.",
      "s03": "Comprobación: ¿400 V entre L1-L2 significa 400 V entre L1-N? No.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-015": {
    "title": "Fuentes industriales de 24 VDC",
    "kicker": "Sistemas eléctricos · Bloque 02 · Revisión técnica pendiente",
    "excerpt": "Una fuente convierte una entrada admisible (por ejemplo, 230 VAC) en una salida DC regulada.",
    "categories": [
      "Distribución eléctrica y protecciones"
    ],
    "sections": {
      "s01": "Una fuente convierte una entrada admisible (por ejemplo, 230 VAC) en una salida DC regulada. Se verifican tensión nominal, corriente máxima, curvas de sobrecarga, temperatura, derating, rizado, selectividad y distribución por ramas. Los bornes +24V y 0V no equivalen automáticamente a PE. Algunos sistemas referencian 0 V a tierra por diseño; no debe suponerse sin documentación.",
      "s02": "Las fuentes pueden limitar corriente, reducir tensión o desconectar ante sobrecarga. Una caída en un ramal también puede deberse a conductor, borne, fusible electrónico o retorno. El diagnóstico compara lectura de salida de fuente con lectura en la carga y condición de consumo.",
      "s03": "Comprobación: si hay 24 V en la salida de fuente y 18 V en la carga, ¿es necesariamente defectuosa la fuente? No; revisar distribución y caída en conductores/terminales.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-016": {
    "title": "Fusibles, magnetotérmicos y protección de sobreintensidad",
    "kicker": "Sistemas eléctricos · Bloque 02 · Revisión técnica pendiente",
    "excerpt": "El fusible interrumpe al fundirse su elemento; el interruptor automático abre mediante mecanismos de disparo definidos.",
    "categories": [
      "Distribución eléctrica y protecciones"
    ],
    "sections": {
      "s01": "El fusible interrumpe al fundirse su elemento; el interruptor automático abre mediante mecanismos de disparo definidos. La selección depende de tensión, corriente, poder de corte, curva, energía pasante, sección de conductor, corriente de cortocircuito y coordinación. Una protección disparada es un síntoma, no la causa raíz. No sustituirla por un calibre superior para «evitar disparos». Antes de rearmar se evalúa por qué actuó y se verifica el estado de la instalación según procedimiento autorizado.",
      "s02": "Distinguir sobrecarga (corriente excesiva sostenida) de cortocircuito (trayectoria de impedancia muy baja y corriente elevada). El tiempo de disparo y los registros pueden ayudar, pero no siempre identifican inequívocamente la causa.",
      "s03": "Comprobación: aumentar de 2 A a 10 A un fusible que dispara repetidamente, sin revisar conductores ni carga, es una corrección válida. Falso.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-017": {
    "title": "Diferenciales, aislamiento y PE",
    "kicker": "Sistemas eléctricos · Bloque 02 · Revisión técnica pendiente",
    "excerpt": "Un dispositivo diferencial (RCD) compara las corrientes que atraviesan sus conductores activos y actúa si el desequilibrio supera sus condiciones de disparo.",
    "categories": [
      "Distribución eléctrica y protecciones"
    ],
    "sections": {
      "s01": "Un dispositivo diferencial (RCD) compara las corrientes que atraviesan sus conductores activos y actúa si el desequilibrio supera sus condiciones de disparo. No sustituye por sí solo la protección de sobreintensidad salvo equipo combinado. Un fallo de aislamiento puede producir corriente de fuga, pero también hay fugas funcionales y transitorios; la interpretación depende del equipo, tipo de RCD y arquitectura. PE ofrece un camino de protección según el sistema de puesta a tierra; su ausencia no se compensa con un RCD.",
      "s02": "Una prueba de aislamiento exige circuito desenergizado, electrónica sensible desconectada o protegida según fabricante, tensión de prueba apropiada y personal competente. En las EXP se entregan resultados de ensayos ya realizados por personal autorizado.",
      "s03": "Comprobación: si dispara un diferencial, ¿es seguro concluir que existe cortocircuito fase-neutro? No.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-018": {
    "title": "Selectividad, separación y distribución",
    "kicker": "Sistemas eléctricos · Bloque 02 · Revisión técnica pendiente",
    "excerpt": "El cuadro debe permitir identificar alimentación principal, protecciones por rama, fuentes, distribución 24 V, borneros y cargas.",
    "categories": [
      "Distribución eléctrica y protecciones"
    ],
    "sections": {
      "s01": "El cuadro debe permitir identificar alimentación principal, protecciones por rama, fuentes, distribución 24 V, borneros y cargas. La selectividad busca que ante una falta actúe el dispositivo adecuado sin cortar innecesariamente otros circuitos; no se presume sin estudio y datos de fabricante. La segregación entre potencia, mando, señales y comunicaciones reduce interferencias y facilita mantenimiento. Etiquetas, referencias y documentación actualizada son herramientas de diagnóstico, no decoración.",
      "s02": "Comprobación: un fallo en un sensor corta todos los 24 V del cuadro. ¿Qué aspecto de diseño revisar? Distribución y coordinación de protecciones, sin inferir la solución exacta sin esquema.",
      "s03": "Resumen del bloque: localizar origen de energía, ramal afectado, función de cada protección y condición de disparo.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-019": {
    "title": "Mando frente a potencia",
    "kicker": "Sistemas eléctricos · Bloque 03 · Revisión técnica pendiente",
    "excerpt": "El circuito de potencia transporta energía a la carga (motor, resistencia, etc.).",
    "categories": [
      "Circuitos de mando y potencia"
    ],
    "sections": {
      "s01": "El circuito de potencia transporta energía a la carga (motor, resistencia, etc.). El circuito de mando procesa condiciones y acciona elementos como bobinas de contactor o entradas de control. La presencia de tensión en potencia no demuestra que exista permiso de marcha. En un arrancador directo clásico, la orden de marcha energiza una bobina que cierra contactos principales; el contacto auxiliar puede mantener la orden, si el diseño lo permite.",
      "s02": "Comprobación: el motor tiene tensión disponible aguas arriba del contactor y no gira. ¿Es suficiente para culpar al motor? No; hay que conocer estado del contactor y condiciones de mando.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-020": {
    "title": "Contactores, bobinas y auxiliares",
    "kicker": "Sistemas eléctricos · Bloque 03 · Revisión técnica pendiente",
    "excerpt": "Un contactor incorpora bobina (A1/A2), contactos principales y auxiliares.",
    "categories": [
      "Circuitos de mando y potencia"
    ],
    "sections": {
      "s01": "Un contactor incorpora bobina (A1/A2), contactos principales y auxiliares. La bobina debe corresponder a su tensión, tipo AC/DC y régimen. Un contacto NO está abierto en el estado de referencia del dispositivo; uno NC está cerrado en ese estado, no necesariamente cuando toda la máquina está apagada. Los contactos se representan según norma y estado de referencia especificado. La designación típica de auxiliares puede incluir 13-14 (NO) y 21-22 (NC), pero se verifica en plano y fabricante.",
      "s02": "Comprobación: si hay tensión nominal entre A1-A2 durante la orden y no conmuta, ¿se puede concluir que el pulsador de marcha está abierto? No. La tensión medida orienta hacia bobina, especificación, conexión o mecanismo, con validaciones posteriores.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-021": {
    "title": "Pulsadores, auto-mantenimiento y enclavamientos",
    "kicker": "Sistemas eléctricos · Bloque 03 · Revisión técnica pendiente",
    "excerpt": "Un mando clásico de marcha-paro incorpora STOP NC, START NO y un auxiliar NO de auto-mantenimiento en paralelo con START.",
    "categories": [
      "Circuitos de mando y potencia"
    ],
    "sections": {
      "s01": "Un mando clásico de marcha-paro incorpora STOP NC, START NO y un auxiliar NO de auto-mantenimiento en paralelo con START. Al soltar START, la bobina sigue energizada si las condiciones de permiso continúan. El enclavamiento eléctrico entre dos contactores de inversión evita órdenes simultáneas, pero para aplicaciones que lo requieren se complementa con enclavamiento mecánico y diseño de seguridad apropiado. Un paro de emergencia no es simplemente un pulsador STOP del proceso: su función se define mediante evaluación de riesgos y arquitectura de seguridad.",
      "s02": "Comprobación: el motor solo gira mientras se mantiene START. Posibles causas: auxiliar de mantenimiento no cierra, cableado de mantenimiento interrumpido o lógica que no mantiene; no basta cambiar START.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-022": {
    "title": "Motores trifásicos, placa y relé de sobrecarga",
    "kicker": "Sistemas eléctricos · Bloque 03 · Revisión técnica pendiente",
    "excerpt": "La placa informa tensión, conexión, corriente nominal, frecuencia, potencia y otros datos.",
    "categories": [
      "Circuitos de mando y potencia"
    ],
    "sections": {
      "s01": "La placa informa tensión, conexión, corriente nominal, frecuencia, potencia y otros datos. En arranque directo, el contactor gobierna potencia y un dispositivo de sobrecarga protege frente a condiciones térmicas dentro de su aplicación. El ajuste debe basarse en placa, esquema, método de arranque y documentación del fabricante. La corriente elevada puede venir de carga mecánica, fallo eléctrico, tensión anómala o conexión incorrecta; el relé disparado no demuestra por sí solo cuál.",
      "s02": "Comprobación: si la corriente aumenta al atascarse un transportador, ¿qué hipótesis se prioriza? Incremento de carga mecánica, contrastado con datos eléctricos y mecánicos.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-023": {
    "title": "Relés, temporizadores y salidas PLC",
    "kicker": "Sistemas eléctricos · Bloque 03 · Revisión técnica pendiente",
    "excerpt": "Las salidas PLC pueden ser transistor o relé, con límites distintos; no todas pueden alimentar directamente cualquier bobina.",
    "categories": [
      "Circuitos de mando y potencia"
    ],
    "sections": {
      "s01": "Las salidas PLC pueden ser transistor o relé, con límites distintos; no todas pueden alimentar directamente cualquier bobina. Se consideran consumo, supresión de transitorios, polaridad, retorno, fusibles y aislamiento. Un relé intermedio puede separar la salida de control de la carga, pero añade puntos de fallo. Los temporizadores pueden ser eléctricos o lógicos; el diagnóstico debe distinguir la orden software del estado físico del elemento.",
      "s02": "Comprobación: Q0.0=TRUE en Watch Table significa que KM1 necesariamente recibe 24 V. Falso: indica estado lógico de salida, no continuidad del cableado ni tensión efectiva en la bobina.",
      "s03": "Resumen del bloque: seguir permiso, orden, salida, cableado, bobina, contactos y carga como eslabones diferentes.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-024": {
    "title": "Símbolos y convenciones",
    "kicker": "Sistemas eléctricos · Bloque 04 · Revisión técnica pendiente",
    "excerpt": "Los esquemas emplean símbolos normalizados y convenciones de estado de referencia.",
    "categories": [
      "Interpretación de esquemas y cableado"
    ],
    "sections": {
      "s01": "Los esquemas emplean símbolos normalizados y convenciones de estado de referencia. No se deduce una conexión real por la proximidad gráfica de dos símbolos: mandan identificadores de conexión, referencias, potenciales y numeración. Los planos deben incluir leyenda y versión. Los símbolos de interruptor, bobina, fusible, tierra, motor y contacto auxiliar deben dibujarse con semántica eléctrica correcta, no generarse libremente por estética.",
      "s02": "Comprobación: un contacto KM1 dibujado en otra hoja, ¿puede pertenecer al mismo contactor? Sí, mediante designación y referencia cruzada.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-025": {
    "title": "Designación y referencias cruzadas",
    "kicker": "Sistemas eléctricos · Bloque 04 · Revisión técnica pendiente",
    "excerpt": "Una designación coherente (-QF1, -F1, -KM1, -X1, -M1) facilita localizar protecciones, contactores, borneros y motores.",
    "categories": [
      "Interpretación de esquemas y cableado"
    ],
    "sections": {
      "s01": "Una designación coherente (-QF1, -F1, -KM1, -X1, -M1) facilita localizar protecciones, contactores, borneros y motores. Las letras y números deben seguir la convención del proyecto; no hay que asumir universalidad absoluta de cada prefijo. Una referencia cruzada vincula bobina y contactos o continuidad entre páginas. Una revisión obsoleta puede conducir a buscar un borne inexistente.",
      "s02": "Comprobación: el plano indica -KM1:13-14 en hoja 4. ¿Qué se busca? El contacto auxiliar identificado de KM1, no otro dispositivo con número 13.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-026": {
    "title": "Borneros, potenciales y numeración",
    "kicker": "Sistemas eléctricos · Bloque 04 · Revisión técnica pendiente",
    "excerpt": "Un bornero (-X1) es un punto de conexión y posible desconexión de prueba según modelo.",
    "categories": [
      "Interpretación de esquemas y cableado"
    ],
    "sections": {
      "s01": "Un bornero (-X1) es un punto de conexión y posible desconexión de prueba según modelo. X1:5 identifica un terminal; el número de hilo puede ser distinto. Los potenciales +24V, 0V, L1, N, PE representan funciones distintas. En diagnosis se sigue origen → protección → borne → cable → carga → retorno. Un retorno abierto es tan relevante como una alimentación abierta.",
      "s02": "Comprobación: hay 24 V en X1:5 respecto a 0 V de cuadro, pero el sensor no funciona. ¿Qué falta verificar? Tensión y retorno en bornes del sensor, condiciones de carga y estado del propio sensor.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-027": {
    "title": "Lectura de esquemas de mando",
    "kicker": "Sistemas eléctricos · Bloque 04 · Revisión técnica pendiente",
    "excerpt": "Leer de la fuente de control hacia el retorno, identificando contactos en serie (condiciones simultáneas) y ramas en paralelo (caminos alternativos).",
    "categories": [
      "Interpretación de esquemas y cableado"
    ],
    "sections": {
      "s01": "Leer de la fuente de control hacia el retorno, identificando contactos en serie (condiciones simultáneas) y ramas en paralelo (caminos alternativos). Un contacto NC de protección abre cuando actúa su dispositivo; una rama de mantenimiento mantiene energía tras soltar START. En planos complejos se separan seguridad, permisos de proceso, orden PLC y potencia; una condición ausente puede bloquear la secuencia sin avería eléctrica.",
      "s02": "Comprobación: si STOP NC está abierto, ¿puede START cerrar la bobina en un circuito clásico en serie? No, salvo caminos alternativos no mostrados, que deben investigarse.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-028": {
    "title": "Trazabilidad y control de revisiones",
    "kicker": "Sistemas eléctricos · Bloque 04 · Revisión técnica pendiente",
    "excerpt": "Un diagnóstico reproducible cita plano, revisión, equipo, terminales, estado de máquina, medidas y conclusión.",
    "categories": [
      "Interpretación de esquemas y cableado"
    ],
    "sections": {
      "s01": "Un diagnóstico reproducible cita plano, revisión, equipo, terminales, estado de máquina, medidas y conclusión. Nunca modificar físicamente un cable solo porque «el plano lo dice» sin verificar identificación real y procedimiento. Tras una reparación autorizada, actualizar documentación, marcados y registro de intervención. La misma nomenclatura debe emplearse en Notebook, evidencias, Experience y esquemas.",
      "s02": "Comprobación: ¿qué pesa más para diagnosticar una discrepancia: un esquema sin revisión o una identificación física verificada y documentada? La evidencia trazable y la investigación de la discrepancia; no improvisar modificaciones.",
      "s03": "Resumen del bloque: cada símbolo debe corresponder a un componente, cada conductor a un potencial y cada conclusión a una evidencia identificable.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-029": {
    "title": "Método de diagnóstico",
    "kicker": "Sistemas eléctricos · Bloque 05 · Revisión técnica pendiente",
    "excerpt": "1) delimitar síntoma y condición de aparición; 2) identificar función afectada y plano vigente; 3) generar hipótesis mutuamente discriminables; 4) revisar alarmas, registros y mediciones existentes; 5) elegir la siguiente comprobación con mayor poder diagnóstico; 6) aislar causa; 7) corregir bajo procedimiento autorizado; 8) verificar función y protecciones; 9) documentar.",
    "categories": [
      "Diagnóstico eléctrico y seguridad"
    ],
    "sections": {
      "s01": "1) delimitar síntoma y condición de aparición; 2) identificar función afectada y plano vigente; 3) generar hipótesis mutuamente discriminables; 4) revisar alarmas, registros y mediciones existentes; 5) elegir la siguiente comprobación con mayor poder diagnóstico; 6) aislar causa; 7) corregir bajo procedimiento autorizado; 8) verificar función y protecciones; 9) documentar. Evitar el sesgo de confirmar la primera hipótesis y el cambio de componentes por descarte.",
      "s02": "Comprobación: tres sensores fallan a la vez. ¿Qué se investiga antes de reemplazarlos individualmente? Elementos comunes: fuente, protección, retorno, módulo, cable compartido.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-030": {
    "title": "Consignación y comprobación de ausencia de tensión",
    "kicker": "Sistemas eléctricos · Bloque 05 · Revisión técnica pendiente",
    "excerpt": "Antes de abrir o intervenir un circuito real se aplica el procedimiento de aislamiento y consignación correspondiente, se identifican todas las fuentes (incluidos UPS, condensadores y retornos), se bloquea el restablecimiento, se verifica ausencia de tensión con método e instrumento apropiados y se controla energía residual.",
    "categories": [
      "Diagnóstico eléctrico y seguridad"
    ],
    "sections": {
      "s01": "Antes de abrir o intervenir un circuito real se aplica el procedimiento de aislamiento y consignación correspondiente, se identifican todas las fuentes (incluidos UPS, condensadores y retornos), se bloquea el restablecimiento, se verifica ausencia de tensión con método e instrumento apropiados y se controla energía residual. La secuencia concreta la define el procedimiento de la instalación y personal cualificado. Una HMI en STOP o un PLC en STOP no equivale a aislamiento eléctrico.",
      "s02": "Comprobación: pulsar STOP permite medir continuidad de una bobina. Falso: STOP de proceso no garantiza ausencia de tensión.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-031": {
    "title": "Diagnóstico por comparación y bajo carga",
    "kicker": "Sistemas eléctricos · Bloque 05 · Revisión técnica pendiente",
    "excerpt": "Comparar un ramal sano con uno defectuoso puede identificar diferencias de tensión, corriente, estado de protección o señales.",
    "categories": [
      "Diagnóstico eléctrico y seguridad"
    ],
    "sections": {
      "s01": "Comparar un ramal sano con uno defectuoso puede identificar diferencias de tensión, corriente, estado de protección o señales. La caída de tensión es proporcional a corriente y resistencia en condiciones apropiadas (ΔU≈I×R); un borne deteriorado puede presentar tensión normal sin carga y caída importante al circular corriente. Una termografía o un punto caliente aporta indicios, no sustituye medidas y análisis.",
      "s02": "Comprobación: 24 V en vacío y 17 V con carga en el extremo de cable. ¿Qué hipótesis gana fuerza? Resistencia serie excesiva o fuente incapaz de sostener demanda, diferenciable midiendo origen y extremo en el mismo estado.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-032": {
    "title": "Aislamiento y fugas",
    "kicker": "Sistemas eléctricos · Bloque 05 · Revisión técnica pendiente",
    "excerpt": "Un defecto de aislamiento es una vía no deseada de corriente entre conductores o hacia partes conductoras.",
    "categories": [
      "Diagnóstico eléctrico y seguridad"
    ],
    "sections": {
      "s01": "Un defecto de aislamiento es una vía no deseada de corriente entre conductores o hacia partes conductoras. Los síntomas incluyen disparos diferenciales, alarmas de aislamiento o comportamiento intermitente por humedad. La resistencia de aislamiento se mide con equipos y tensiones de prueba adecuados solo en instalación aislada y preparada, desconectando electrónica sensible según fabricante. Una lectura aislada debe interpretarse frente a norma aplicable, tensión, temperatura, topología y límites del equipo.",
      "s02": "Comprobación: aplicar 500 VDC de megóhmetro directamente a la salida de un PLC para localizar una fuga es válido. Falso.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  },
  "article-033": {
    "title": "Verificación, recurrencia y documentación",
    "kicker": "Sistemas eléctricos · Bloque 05 · Revisión técnica pendiente",
    "excerpt": "Una corrección se considera verificada cuando se demuestra que la función se ha restablecido, el síntoma no reaparece en condiciones representativas, los dispositivos de protección conservan su función y los registros son coherentes.",
    "categories": [
      "Diagnóstico eléctrico y seguridad"
    ],
    "sections": {
      "s01": "Una corrección se considera verificada cuando se demuestra que la función se ha restablecido, el síntoma no reaparece en condiciones representativas, los dispositivos de protección conservan su función y los registros son coherentes. Una sustitución que «hace arrancar» sin explicar el mecanismo puede dejar el riesgo latente. Documentar causa, evidencia antes/después, intervención autorizada, pruebas y límites de la verificación.",
      "s02": "Comprobación: después de apretar un borne se recupera el motor; ¿basta con cerrar incidencia? No: documentar y verificar conexiones, funcionamiento y causas de aflojamiento según procedimiento.",
      "s03": "Resumen del bloque: seguridad, evidencia y verificación son partes del razonamiento, no anexos administrativos.",
      "s-review": {
        "title": "Preview textual · revisión técnica pendiente",
        "content": "Contenido educativo en revisión técnica y editorial. La traducción inglesa requiere revisión técnica humana. Interpreta registros aportados o simulados; este material no autoriza trabajos sobre una instalación real."
      }
    }
  }
});
