# Catálogo maestro de servicios fiscales

> Estado: **CERRADO PARA DISEÑO DE ARQUITECTURA**  
> Corte regulatorio: 2026-09-07  
> Regla: antes de implementar cada familia se debe volver a comprobar la norma y el anexo técnico vigente.

## 1. Alcance del catálogo

El producto final es una plataforma fiscal pública multitenant. El catálogo separa:

- **documentos fiscales** que se generan o reciben;
- **capacidades de plataforma** necesarias para operarlos de forma segura;
- **verticales sectoriales** que agregan datos y flujos externos al núcleo DIAN.

La [Resolución Única 227 de 2025](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0227_2025.htm) es la referencia consolidada. Para anexos y material operativo se conserva el [micrositio del Sistema de Facturación Electrónica](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/). Las resoluciones y anexos específicos prevalecen cuando resulten más recientes.

## 2. Matriz maestra

Escalas: dificultad técnica/regulatoria y riesgo: B=baja, M=media, A=alta. Volumen es relativo al cliente objetivo. Coste operacional no incluye el precio del Proveedor Tecnológico (PT).

| ID | Servicio | Qué es / usuario típico | Obligación y flujo oficial | API pública potencial | Dependencias | Tec./Reg. | Volumen / valor | Coste / riesgo | Release |
|---|---|---|---|---|---|---|---|---|---|
| FEV | Factura electrónica de venta | Soporte electrónico de ventas; POS, ERP, SaaS y comercios | Obligados facturan con validación previa; generar, firmar, transmitir, validar y entregar | `POST /v1/documents` (`invoice`), consulta y artefactos | organización, resolución, adquirente, impuestos, PT | M/A | Muy alto / muy alto | M/A | **V1** |
| NC | Nota crédito | Corrige/disminuye o referencia una FEV; mismo público | Se transmite como documento relacionado conforme a anexo vigente | `document_type=credit_note` | FEV aceptada/referencia válida | M/A | Medio / muy alto | M/A | **V1** |
| ND | Nota débito | Ajusta/aumenta valores de una FEV; ERP/contabilidad | Documento relacionado transmitido y validado | `document_type=debit_note` | FEV/referencia válida | M/A | Bajo-medio / alto | M/A | **V1** |
| CONT | Contingencias FEV | Conserva operación cuando falla facturador o DIAN; todo emisor | Papel/talonario u otros procedimientos solo en supuestos y plazos normativos; posterior transmisión cuando corresponda | creación con `contingency` y posterior regularización | numeración, causa, fechas, PT | A/A | Bajo / crítico | M/A | **V1** mínimo regulatorio |
| DEE-POS | Documento equivalente electrónico POS | Tiquete POS electrónico; comercios y POS | Quien opte por documento equivalente debe generar/transmitir para validación según régimen aplicable | `document_type=pos_equivalent` | motor DEE, CUDE, PT | M/A | Muy alto / alto | M/A | **V1.1** |
| DEE-ADJ | Nota de ajuste DEE | Corrige o anula un DEE; emisores DEE | Generación/transmisión; no reutiliza número y no ajusta otra nota de ajuste | `document_type=equivalent_adjustment` | DEE original | M/A | Bajo-medio / alto | M/A | **V1.1** |
| DSNO | Documento soporte en adquisiciones a no obligados | Comprador soporta costo/deducción/IVA; ERP/compras | Documento con numeración autorizada, CUDS, firma y transmisión | `document_type=support_document` | proveedor, numeración, certificado/PT | M/A | Medio / alto | M/A | **V1.1** |
| DSNO-ADJ | Nota de ajuste del documento soporte | Corrige DSNO; ERP/compras | Generación y transmisión conforme al anexo del DSNO | `document_type=support_adjustment` | DSNO original | M/A | Bajo / alto | M/A | **V1.1** |
| RECV | Recepción y validación técnica | Ingesta XML/AttachedDocument y verificación; ERP/contabilidad | Verifica firma, estructura, identidad y estado; no sustituye validación DIAN | `POST /v1/received-documents`, consultas | correo/canal de entrada, DIAN/PT | M/M | Alto / alto | M/M | **V1.2** |
| EVT | Eventos de recepción de FEV | Acuse, recibo de bienes/servicios, aceptación/reclamo; adquirentes | Eventos vinculados a factura y reglas de oportunidad | `POST /v1/events` | documento recibido, actor autorizado | A/A | Medio / muy alto | M/A | **V1.2** |
| RAD | RADIAN / título valor | Registro y trazabilidad de FEV como título valor; factoring | Eventos y participantes del registro RADIAN | `/v2/radian/events`, consultas | FEV + eventos + habilitación RADIAN | A/A | Nicho / alto | A/A | **V2** |
| PAY | Documento soporte de pago de nómina electrónica | Soporta costos/deducciones laborales; empleadores y nómina | Generación y transmisión por empleador según Resolución 13/2021 y vigentes | `/v2/payroll-documents` | empleados, devengados/deducciones, certificado/PT | A/A | Mensual / alto | A/A | **V2** |
| PAY-ADJ | Nota de ajuste de nómina | Corrige/reemplaza nómina reportada | Documento relacionado según anexo de nómina | `/v2/payroll-adjustments` | nómina original | A/A | Bajo / alto | A/A | **V2** |
| DEE-VERT | Otros 11 perfiles DEE | Servicios públicos, transporte, extractos, aéreo, juegos, peajes, bolsas, espectáculos y cine | Cada perfil tiene requisitos comunes y específicos del anexo DEE | `document_type=equivalent`, `profile` | motor DEE + perfil | A/A | Variable / sectorial | M-A/A | **Futuro por vertical** |
| HEALTH | FEV en salud + RIPS/CUV | IPS/proveedores, ERP y pagadores de salud | FEV DIAN más campos salud; RIPS se valida en mecanismo de MinSalud y produce CUV | `/v2/health/claims` como orquestación, no mezclar con FEV base | FEV, RIPS, MinSalud, pagador | A/A | Alto / muy alto | A/A | **V2 vertical** |
| HEALTH-ADJ | Ajustes, glosas y soportes de cobro salud | IPS y pagadores | Ajustes de FEV/RIPS y soportes conforme a reglas sanitarias | recursos de claim, ajustes y evidencias | HEALTH, pagador, reglas sanitarias | A/A | Alto / alto | A/A | **V2.x** |
| TRANS | FEV de transporte + RNDC | Empresas de transporte de carga/generadores | XML de factura se articula con RNDC; no es un nuevo tipo DIAN autónomo | adaptador `/v2/transport/operations` | FEV, RNDC, manifiesto/remesas | A/A | Medio / alto | A/A | **Futuro vertical** |
| PLATFORM | Firma, XML, PDF, estado, almacenamiento, consulta, reportes y webhooks | Capacidades transversales para integradores | Deben preservar exactitud, evidencia y control de acceso; algunas responsabilidades pueden residir en PT | `/v1/documents`, `/artifacts`, `/webhooks`, `/usage` | todas las familias | M/A | Igual al total / esencial | M/A | **V1 transversal** |

## 3. Perfiles del documento equivalente electrónico

El calendario oficial enumera doce perfiles ya implementados: tiquete POS; servicios públicos domiciliarios; tiquete de transporte de pasajeros; extracto; tiquete aéreo; juegos de suerte y azar no localizados; juegos localizados; peajes; liquidación de operaciones de bolsa de valores; operaciones de bolsa agropecuaria/commodities; espectáculos públicos; y cine. Fuente: [calendario DIAN](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/calendario-de-implementacion/).

No se implementan doce módulos aislados. Se diseña un motor DEE común y perfiles versionados. Solo POS entra temprano por demanda general; los demás se activan con cliente y evidencia de mercado.

## 4. Capacidades transversales incluidas desde V1

| Capacidad | Alcance V1 |
|---|---|
| Validación y normalización | Esquema, reglas semánticas, totales, referencias y perfil fiscal versionado |
| XML | Generación canónica o delegación explícita al PT; conservar XML final validado |
| Firma | Preferencia V1: custodia y firma en PT; el núcleo registra certificado/binding y evidencia |
| Envío/validación | Adaptador de un PT; resultado normalizado y respuesta cruda protegida |
| Estado/reconciliación | Estado canónico propio, `UNKNOWN`, consulta remota y reconciliación |
| Representación gráfica | PDF generado por PT o renderer versionado; nunca fuente de verdad |
| Almacenamiento | Metadatos en PostgreSQL; artefactos privados, cifrados e inmutables en object storage |
| Webhooks | Eventos firmados, reintentos, historial y dead-letter operacional |
| Consultas/reportes | Filtros tenant-safe, paginación cursor y exportaciones asíncronas |
| Medición | Uso aceptado/rechazado por documento, endpoint, organización, app y ambiente |

## 5. Fuentes oficiales principales

- DIAN, [Sistema de Facturación Electrónica](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/).
- DIAN, [Resolución 165 de 2023 y notas de vigencia](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0165_2023.htm).
- DIAN, [Resolución Única 227 de 2025](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0227_2025.htm).
- DIAN, [Factura electrónica](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/factura-electronica/).
- DIAN, [Documento equivalente electrónico](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/documento-equivalente-electronico/).
- DIAN, [Documento soporte a no obligados](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/documento-soporte-adquisiciones-no-obligados/).
- DIAN, [Nómina electrónica: marco normativo](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/marco-normativo-soporte-de-pago-de-nomina-electronica/).
- DIAN, [RADIAN](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/radian/) y [marco normativo](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/marco-normativo-radian/).
- MinSalud, [Resolución 948 de 2026](https://www.minsalud.gov.co/sites/rid/Lists/BibliotecaDigital/RIDE/DE/DIJ/resolucion-0948-de-2026.pdf) y anexos técnicos vigentes.
- MinTransporte, [Guía XML de factura electrónica de transporte](https://plc.mintransporte.gov.co/Portals/0/Manuales/GUIA%20XML_FacturaElectronica%20V8.pdf?ver=2023-06-06-160325-677).

## 6. Cierre del catálogo

El catálogo está cerrado para escoger arquitectura, no congelado para siempre. Una nueva resolución produce un cambio versionado de regla/perfil; no obliga a rediseñar tenancy, API, pipeline ni almacenamiento.

