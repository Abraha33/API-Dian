# API-DIAN — Definición definitiva de producto V1

**Estado:** FROZEN / baseline de producto  
**Fecha:** 2026-08-19  
**Autoridad:** este documento define qué producto se construye en V1.  

> Si una decisión técnica, implementación existente o documento anterior contradice este baseline de producto, primero se debe revisar la contradicción contra este documento antes de continuar construyendo.

---

## 1. Producto en una frase

**API-DIAN es un servicio fiscal backend para software comercial colombiano que convierte operaciones de venta de un POS en documentos fiscales electrónicos, controla su ciclo de vida y entrega al sistema comercial un resultado simple, confiable y trazable, utilizando inicialmente un único Proveedor Tecnológico habilitado como capa regulada frente a la DIAN.**

No es un ERP, un sistema contable ni inicialmente una API pública para terceros.

---

## 2. Problema que resuelve

Un POS no debería tener que implementar por sí mismo la complejidad técnica, operativa y regulatoria del ecosistema fiscal colombiano.

Conceptualmente, el POS debe poder expresar:

```text
"Esta operación comercial debe convertirse en este documento fiscal"
```

API-DIAN asume la responsabilidad de gestionar el proceso fiscal, su estado, evidencia, ambigüedades y recuperación posterior.

El producto no se limita a "enviar una factura". Su valor está en hacer **predecible, seguro y manejable** el proceso fiscal para el software comercial.

---

## 3. Cliente y consumidor inicial

### Cliente comercial inicial

Comercios colombianos que utilizan nuestro POS de venta rápida.

### Consumidor técnico inicial

Nuestro propio POS.

### Expansión futura posible

Solo después de probar demanda, operación y capacidad real:

- otros POS;
- ERP;
- e-commerce;
- casas de software;
- desarrolladores.

V1 **no nace como API pública para desarrolladores**.

---

## 4. Qué compra realmente el comercio

El comercio compra la capacidad de completar de forma confiable este flujo:

```text
vender
→ generar el documento fiscal correcto
→ conocer su estado
→ corregir cuando corresponda
→ recuperar soportes
→ continuar operando ante fallos externos
```

Durante la primera etapa, el producto comercial se vende conceptualmente como:

```text
POS + capacidad fiscal
```

La API podrá convertirse más adelante en producto independiente si existe demanda real.

---

## 5. Alcance funcional V1

V1 cubre únicamente el núcleo fiscal necesario para operar desde nuestro POS:

1. Factura Electrónica de Venta — FEV.
2. Nota Crédito.
3. Nota Débito.
4. Documento Equivalente Electrónico POS — DEE POS.
5. Nota de ajuste del DEE POS.
6. Contingencias indispensables aplicables al alcance anterior.
7. Consulta del estado de una operación fiscal.
8. Recuperación del XML validado cuando corresponda.
9. Recuperación de representación gráfica/PDF disponible.
10. Historial y trazabilidad de cada operación.
11. Protección frente a emisiones duplicadas.
12. Operación multiempresa.

Este es el alcance funcional de producto V1.

---

## 6. Flujo conceptual

```text
Venta
  ↓
POS solicita operación fiscal
  ↓
API-DIAN recibe y valida
  ↓
API-DIAN identifica y controla la operación
  ↓
API-DIAN gestiona el procesamiento fiscal
  ↓
Proveedor Tecnológico habilitado
  ↓
DIAN
  ↓
API-DIAN determina o reconcilia el resultado
  ↓
POS consulta/recibe estado
  ↓
XML / PDF / evidencia disponibles
```

La complejidad del proveedor y de DIAN no debe propagarse innecesariamente al POS.

---

## 7. Invariante de producto más importante

Ante una pérdida de comunicación después de una posible emisión:

```text
DESCONOCIDO != FALLÓ
DESCONOCIDO != NO SE ENVIÓ
DESCONOCIDO != REEMITIR
```

Una operación cuyo resultado remoto sea incierto debe tratarse como incertidumbre real y reconciliarse antes de autorizar un nuevo intento que pueda duplicar el documento.

Esta regla pertenece al producto, no solamente a la arquitectura.

---

## 8. Estados conceptuales que necesita el POS

El POS no debe depender de códigos internos particulares de un proveedor.

Estados conceptuales mínimos:

```text
RECIBIDO
PROCESANDO
ACEPTADO
RECHAZADO
DESCONOCIDO
RECONCILIANDO
REQUIERE_ATENCION
```

Los nombres exactos del contrato técnico podrán definirse en la fase de arquitectura/API, pero **la incertidumbre debe existir como estado explícito**.

---

## 9. Límite de responsabilidades

### API-DIAN

Será responsable de:

- recibir la operación del POS;
- autenticar y autorizar;
- identificar correctamente la empresa;
- normalizar y validar lo que corresponda;
- controlar idempotencia y duplicados;
- conservar estado y trazabilidad;
- gestionar la interacción con el PT;
- preservar evidencia relevante;
- resolver/reconciliar resultados ambiguos cuando sea posible;
- ofrecer un contrato estable al POS;
- permitir recuperación posterior de estado y soportes.

### Proveedor Tecnológico habilitado

V1 delega inicialmente al PT la capa regulada que convenga delegar, incluyendo la interacción fiscal especializada con DIAN y, preferiblemente, firma/custodia del certificado cuando el modelo técnico y contractual elegido lo permita.

Modelo V1:

```text
POS propio
   ↓
API-DIAN
   ↓
1 PT habilitado
   ↓
DIAN
```

No necesitamos convertirnos en Proveedor Tecnológico para lanzar V1.

---

## 10. Política de proveedor V1

V1 utiliza **exactamente un PT**.

No se construyen inicialmente:

- selección automática entre proveedores;
- failover multi-PT;
- dos adapters productivos simultáneos;
- conexión directa DIAN.

La identidad del producto no depende de HKA, DATAICO, Facture/ESTELA u otro proveedor concreto.

La selección del PT es un **gate posterior de implementación**, basado en evidencia técnica, contractual y de sandbox real.

---

## 11. Fuera de V1

Queda explícitamente fuera:

- nómina electrónica;
- documento soporte;
- recepción/eventos no necesarios para el núcleo inicial;
- RADIAN completo;
- salud/RIPS;
- transporte/RNDC;
- otros verticales fiscales no incluidos;
- ERP;
- contabilidad;
- inventario como responsabilidad de API-DIAN;
- CRM;
- API pública para terceros;
- SDK públicos;
- webhooks públicos;
- segundo PT;
- failover multi-PT;
- conexión directa DIAN;
- convertirnos inicialmente en PT;
- custodia propia de certificados cuando pueda delegarse de forma segura;
- generador propio de PDF si el PT lo suministra adecuadamente;
- forks o ramas de código por cliente.

Toda ampliación futura deberá justificar explícitamente por qué entra al producto.

---

## 12. Multiempresa desde el inicio

El producto debe soportar múltiples comercios independientes desde su diseño:

```text
API-DIAN
 ├── Empresa A
 ├── Empresa B
 ├── Empresa C
 └── ...
```

Esto exige aislamiento correcto, pero no implica construir una plataforma empresarial sobredimensionada.

---

## 13. Configuración por empresa

Cada comercio tendrá su información/configuración fiscal correspondiente sin crear versiones diferentes del software.

Principio:

```text
una plataforma
+ configuración por empresa
!=
un código distinto por empresa
```

No habrá forks específicos por cliente.

---

## 14. El producto debe asumir fallos

La definición de producto parte de que ocurrirán:

- timeouts;
- caídas de red;
- respuestas tardías;
- indisponibilidad del PT;
- indisponibilidad DIAN;
- cortes de conexión;
- reinicios;
- respuestas ambiguas;
- errores temporales;
- necesidad de reconciliación.

Una venta fiscal no puede depender de que todos los componentes funcionen perfectamente durante el mismo instante.

La arquitectura posterior deberá cumplir esta propiedad del producto.

---

## 15. Evidencia y trazabilidad

Para cada operación fiscal el sistema debe permitir reconstruir, de forma apropiada:

- quién/qué sistema la solicitó;
- qué operación se solicitó;
- cuándo ocurrió;
- qué procesamiento tuvo;
- qué resultado informó el proveedor;
- cuál terminó siendo su estado;
- qué documento/soportes resultaron;
- si hubo nuevos intentos;
- por qué se realizaron acciones posteriores.

No se trata de almacenar datos ilimitadamente, sino de conservar evidencia suficiente para operación, diagnóstico y cumplimiento.

---

## 16. Principios de seguridad

V1 debe diseñarse alrededor de:

- mínimo privilegio;
- aislamiento entre empresas;
- secretos fuera del código;
- cifrado en tránsito;
- credenciales revocables/rotables;
- trazabilidad de operaciones sensibles;
- mínima exposición de datos;
- mínima superficie de ataque.

No se añadirá complejidad de seguridad ceremonial que no reduzca un riesgo real.

---

## 17. Restricción operativa fundamental

Inicialmente una sola persona debe poder construir, mantener y operar el producto.

Por tanto, V1 no debe requerir sin evidencia fuerte:

- Kubernetes;
- decenas de microservicios;
- múltiples brokers;
- administración manual frecuente;
- equipos 24/7;
- infraestructura difícil de restaurar;
- componentes añadidos solo por sofisticación técnica.

La complejidad se incorpora cuando resuelve un problema demostrado.

---

## 18. Modelo comercial inicial

Modelo conceptual inicial:

```text
Comercio
   ↓ paga
POS + servicio fiscal
```

El precio exacto y estructura definitiva de planes no forman parte de este baseline y deben validarse comercialmente antes del lanzamiento.

Una API externa independiente será una expansión posterior, no una obligación de V1.

---

## 19. Propuesta de valor

API-DIAN no pretende diferenciarse únicamente porque "genera facturas electrónicas".

La propuesta de valor es ofrecer una capa fiscal para software comercial que sea:

```text
simple
predecible
segura
trazable
resistente a duplicados
resistente a fallos
multiempresa
fácil de integrar
fácil de operar
```

---

## 20. Criterio de terminación de V1

V1 estará funcionalmente terminada cuando sea posible demostrar, desde nuestro POS y con un PT real, el ciclo fiscal previsto para los documentos incluidos y cuando las pruebas controladas demuestren que las operaciones no desaparecen ni se duplican ante los principales fallos previsibles.

Además, debe ser posible recuperar posteriormente el estado y los soportes correspondientes.

La existencia de endpoints o una respuesta HTTP exitosa por sí sola **no** significa que V1 esté terminada.

---

## 21. Evolución posterior posible

```text
V1
POS propio + API fiscal + 1 PT
        ↓
V1.x
más comercios + mejor operación + automatización
        ↓
V2 potencial
API para terceros
        ↓
SDK / webhooks / portal desarrolladores
        ↓
otros documentos fiscales
        ↓
segundo PT si existe justificación real
```

Nada de las etapas inferiores se construye anticipadamente sin evidencia.

---

## 22. Nombre y comunicación

Nombre interno del proyecto: **API-DIAN**.

Descripción técnica recomendada:

> Servicio fiscal para software comercial colombiano.

No se debe presentar comercialmente como "API oficial DIAN" ni insinuar que el producto pertenece o está avalado directamente por la DIAN.

---

## 23. Decisiones congeladas de V1

No reabrir durante V1 salvo evidencia nueva fuerte:

1. mercado inicial: comercios colombianos;
2. consumidor técnico inicial: nuestro POS;
3. V1 no es API pública;
4. V1 usa un Proveedor Tecnológico habilitado;
5. exactamente un PT inicialmente;
6. no seremos PT inicialmente;
7. no habrá integración directa con DIAN en V1;
8. producto multiempresa;
9. no habrá forks por cliente;
10. la incertidumbre es un estado real;
11. un resultado desconocido nunca autoriza por sí mismo una reemisión;
12. el producto debe poder ser operado inicialmente por una sola persona.

---

## 24. Orden oficial de trabajo desde este baseline

A partir de la congelación de este documento, el proceso oficial es:

```text
1. PRODUCT-DEFINITION-V1-FINAL.md        ← congelado
        ↓
2. SYSTEM-ARCHITECTURE-V1.md             ← siguiente fase
        ↓
3. BUILD-PLAN-V1.md
        ↓
4. Backlog: fases → épicas → historias → tareas
        ↓
5. Dependencias y Definition of Done
        ↓
6. Plan de construcción diario
        ↓
7. Implementación de código
```

No se debe continuar agregando implementación hasta completar esta secuencia de planificación, salvo correcciones urgentes que protejan datos o el repositorio.

---

## 25. Tratamiento del código ya existente

El repositorio contiene implementación adelantada realizada antes de formalizar este orden de trabajo.

**No se elimina automáticamente.**

Pero tampoco se considera autoridad sobre el producto.

Cuando lleguemos a la fase de arquitectura y posterior descomposición del build, cada pieza existente se clasificará como:

```text
CONSERVAR
ADAPTAR
REHACER
ELIMINAR
```

La decisión se tomará comparando el código con este baseline de producto y con la arquitectura que se congele posteriormente.

---

## 26. Próximo entregable

El siguiente entregable formal es:

```text
SYSTEM-ARCHITECTURE-V1.md
```

Debe derivarse de este producto, no al revés.

Después se generará la descomposición completa necesaria para avanzar diariamente en unidades pequeñas, verificables y con criterio de terminado claro.

---

## Regla final

**Primero se define qué se construye. Después se diseña cómo. Luego se divide en piezas. Solo entonces se construye.**
