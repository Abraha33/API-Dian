# Roadmap de producto fiscal

## V1 — API fiscal pública comercial

- cuentas tenant, organizaciones fiscales, aplicaciones y ambientes;
- API keys por aplicación, scopes, rotación y revocación;
- FEV, nota crédito y nota débito;
- contingencia mínima necesaria para el ciclo FEV;
- validación, estado, reconciliación, XML/PDF/evidencia;
- idempotencia, cuotas, medición, auditoría, sandbox y webhooks;
- un adaptador PT validado.

Salida: un POS/ERP/SaaS ajeno puede completar el ciclo fiscal sin depender de nuestro POS.

## V1.1 — comercio ampliado

- DEE POS y nota de ajuste;
- documento soporte a no obligados y nota de ajuste;
- motor de perfiles/reglas versionado.

## V1.2 — lado comprador

- recepción segura de documentos;
- validación técnica y consulta;
- eventos del adquirente;
- exportaciones/reportes asíncronos.

## V2 — dominios complejos

- nómina electrónica y ajustes como módulo separado;
- RADIAN y eventos de título valor;
- primer vertical FEV-RIPS salud solo con piloto.

## Futuro/opcional

- transporte/RNDC;
- restantes perfiles DEE por vertical;
- segundo PT, OAuth/mTLS empresarial, sharding y multi-región solo por evidencia.

## Gates por release

Cada release requiere: norma/anexo vigente, contrato y sandbox PT, suite de conformidad, carga, restore, seguridad, runbooks, coste medido y piloto controlado. El roadmap no autoriza producción por sí solo.

