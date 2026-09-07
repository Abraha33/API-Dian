# API DIAN — Baseline de cobertura funcional frente a Factus

> Estado: **REQUISITO CANÓNICO DE PRODUCTO**
> Fecha de revisión: 2026-09-07
> Referencia externa: https://www.factus.com.co/ y https://developers.factus.com.co/
> Regla: Factus se usa únicamente como benchmark público de cobertura funcional. Nuestra API mantiene contrato, modelo de datos, arquitectura y proveedor tecnológico propios y neutrales.

## Decisión de producto

El producto completo **API DIAN** debe cubrir, como mínimo, todas las familias de servicios y capacidades fiscales que Factus muestra públicamente en su sitio/API a la fecha de revisión, además de los servicios adicionales ya incluidos en nuestro catálogo maestro.

Esto **no significa copiar la API, endpoints, contratos, precios ni arquitectura de Factus**, ni usar Factus como PT. Significa que su cobertura pública sirve como referencia mínima comercial para verificar que nuestro catálogo no omita capacidades relevantes.

## Recepción y envío

Sí, el producto incluye ambos lados del ciclo:

1. **Envío / emisión**: recibir desde POS/ERP/SaaS la información del documento, construir/normalizar el documento fiscal, transmitirlo mediante el adaptador PT, obtener/normalizar la respuesta DIAN, conservar estado y artefactos y permitir consulta/reconciliación.
2. **Recepción**: recibir/cargar documentos electrónicos de proveedores, consultar/validar documentos recibidos y manejar eventos del adquirente.
3. **Entrega al adquirente**: el producto completo debe poder entregar o disparar la entrega de XML/PDF/representación gráfica al destinatario, incluyendo canal de correo cuando corresponda. La implementación debe permanecer desacoplada del PT.

## Matriz de equivalencia mínima

| Capacidad pública observada en Factus | Cobertura en API DIAN | Estado/roadmap actual |
|---|---|---|
| Factura electrónica de venta | Sí | V1 |
| Nota crédito | Sí | V1 |
| Nota débito | Sí, incluso aunque no sea resaltada en la portada de Factus | V1 |
| Transmisión/validación ante DIAN | Sí | V1 transversal |
| Consulta de estado | Sí | V1 |
| PDF / representación gráfica | Sí | V1 transversal |
| XML / AttachedDocument / evidencias | Sí | V1 transversal |
| Envío por correo al adquirente | Sí, como capacidad de producto completa | Plataforma transversal; implementación desacoplada |
| Documento soporte | Sí | V1.1 |
| Nota de ajuste a documento soporte | Sí | V1.1 |
| Recepción de documentos | Sí | V1.2 |
| Eventos del adquirente / recepción | Sí | V1.2 |
| Consulta de XML de documentos emitidos y recibidos | Sí | Plataforma + recepción; debe soportar consulta oficial cuando el mecanismo aplicable lo permita |
| Nómina electrónica | Sí | V2 |
| Nota de ajuste a nómina | Sí | V2 |
| Facturación electrónica sector salud | Sí | V2 vertical salud |
| Factura de mandato / operación tipo mandato | Sí, se incorpora explícitamente al catálogo comercial | Expansión comercial; release a ubicar sin rediseñar arquitectura |
| Factura de transporte / operación tipo transporte | Sí | Vertical transporte / roadmap futuro |
| RADIAN | Sí | V2 |
| Rangos de numeración | Sí | Configuración fiscal transversal |
| Empresas / organizaciones | Sí | Núcleo multitenant |
| Sandbox | Sí | V1 |
| Autenticación API | Sí | V1 |
| Reportes/consulta/monitorización documental | Sí | Plataforma transversal |
| Webhooks / notificaciones máquina-a-máquina | Sí | V1 |

## Capacidades adicionales propias

Nuestra API no se limita a igualar Factus. El catálogo ya contempla además, entre otros:

- DEE POS y nota de ajuste;
- los doce perfiles de documento equivalente electrónico mediante un motor común versionado;
- contingencias;
- idempotencia y prevención de duplicados;
- estado `UNKNOWN` y reconciliación segura (`UNKNOWN != REEMITIR`);
- cuotas, medición y auditoría por tenant/organización/aplicación/ambiente;
- aislamiento multitenant;
- contrato público estable y versionado, independiente del PT;
- RADIAN;
- integración de salud FEV-RIPS/CUV;
- transporte/RNDC;
- almacenamiento y trazabilidad de evidencias.

## Regla de alcance

La frase **“el producto incluye todo lo que muestra Factus”** se interpreta como alcance del **producto completo**, no como obligación de introducir todas esas capacidades en V1.

La secuencia de releases sigue siendo la autoridad de `docs/service-catalog/RELEASE-ROADMAP.md`. Las capacidades nuevas que encajan en el modelo existente deben agregarse sin reabrir la arquitectura base; solo requieren definición de contrato, reglas, pruebas y asignación de release antes de implementarse.

## Fuentes de benchmark

- Factus, sitio principal: https://www.factus.com.co/
- Factus API, documentación: https://developers.factus.com.co/

Para requisitos legales y regulatorios, **Factus no es fuente normativa**. Siempre prevalecen DIAN, MinSalud, MinTransporte y demás autoridades aplicables, según `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`.
