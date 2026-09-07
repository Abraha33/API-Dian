# Mapa de dependencias de servicios

```mermaid
flowchart TD
    P[Plataforma pública: tenancy, auth, uso, webhooks] --> F[Motor fiscal común]
    F --> I[FEV / NC / ND]
    F --> D[Motor DEE]
    F --> S[Documento soporte]
    F --> N[Nómina]
    I --> R[Recepción y eventos]
    R --> A[RADIAN]
    I --> H[FEV-RIPS salud]
    I --> T[FEV transporte / RNDC]
    D --> V[Perfiles sectoriales DEE]
```

La capa PT es una dependencia de salida de cada familia habilitada; no es dueña del contrato público ni del estado interno. Salud y transporte añaden autoridades externas y por eso no pueden compartir ciegamente el mismo estado de “aceptado”.

