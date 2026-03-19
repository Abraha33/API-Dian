# FACTURA SAAS API - ROADMAP COMPLETO

## FASE 0: FUNDACION (Semana 1-2)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T0.1.1 | GitHub repo setup | GitHub Actions | 1h | Alta |
| T0.1.2 | Next.js 15 App Router | TypeScript 5.4 | 2h | Alta |
| T0.1.3 | Supabase + Vercel | Supabase Pro | 2h | Alta |
| T0.1.4 | Dependencias core | Zod, bcryptjs, axios | 1h | Alta |
| T0.1.5 | Health check /ping | Vercel Edge | 1h | Alta |
| T0.2.1 | Zod schemas API | Zod 3.23 | 3h | Alta |
| T0.2.2 | SQL + RLS policies | PostgreSQL 16 | 4h | Alta |
| T0.2.3 | Queue pgmq | PGMQ 0.3.2 | 2h | Alta |
| T0.2.4 | Arquitectura carpetas | TypeScript | 1h | Alta |
| T0.2.5 | CI GitHub Actions | Node 20 | 2h | Media |

## FASE 1: MVP FUNCIONAL (Mes 1-3)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T1.1.1 | Supabase Auth | JWT + PKCE | 3h | Alta |
| T1.1.2 | Middleware tenant | Next.js middleware | 3h | Alta |
| T1.1.3 | Companies CRUD | PostgreSQL RLS | 4h | Alta |
| T1.1.4 | Customers CRUD | Zod validation | 3h | Alta |
| T1.1.5 | Tenant isolation test | Vitest | 2h | Alta |
| T1.2.1 | Tabla invoices + RLS | PG enums | 3h | Alta |
| T1.2.2 | POST /invoices draft | Zod pipeline | 4h | Alta |
| T1.2.3 | GET /invoices lista | PostgREST | 3h | Alta |
| T1.2.4 | GET /invoices/id | JSONB selects | 2h | Alta |
| T1.2.5 | Idempotency key | Unique constraint | 2h | Alta |
| T1.3.1 | Flujo POST queued | PGMQ.send() | 4h | Alta |
| T1.3.2 | Edge Function processor | Deno 2.0 | 5h | Alta |
| T1.3.3 | Estados completos | PG enum | 2h | Alta |
| T1.3.4 | PATCH status manual | Admin endpoint | 2h | Media |
| T1.3.5 | pgmq metrics | Supabase Dashboard | 2h | Baja |
| T1.4.1 | Provider interface | TypeScript abstract | 2h | Alta |
| T1.4.2 | Factus sandbox | Axios 1.7 + DIAN XML | 6h | Alta |
| T1.4.3 | Queue processor real | Edge Functions | 4h | Alta |
| T1.4.4 | Webhook Factus | HMAC-SHA256 | 4h | Alta |
| T1.4.5 | E2E 10 facturas | Playwright 1.45 | 3h | Alta |

## FASE 2: ESTABILIDAD (Mes 4-5)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T2.1.1 | invoice_logs JSONB | PG JSONB + BRIN | 3h | Alta |
| T2.1.2 | API middleware logs | pino 9.2 | 3h | Alta |
| T2.1.3 | Provider logging | JSON schemas | 2h | Alta |
| T2.1.4 | GET /logs endpoint | Paginacion | 2h | Alta |
| T2.1.5 | Smart retry 3x | Exponential backoff | 3h | Alta |
| T2.2.1 | api_keys table | bcryptjs + scrypt | 2h | Alta |
| T2.2.2 | CRUD API keys | TTL + audit | 3h | Alta |
| T2.2.3 | Dual auth JWT + Key | RBAC middleware | 4h | Alta |
| T2.2.4 | Rate limiting | Upstash Redis | 2h | Alta |
| T2.2.5 | Customers completo | Zod + RLS | 4h | Alta |

## FASE 3: DIFERENCIACION (Mes 6-8)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T3.1.1 | Provider factory | IoC container | 4h | Media |
| T3.1.2 | Segundo proveedor | Alegra API v2 | 6h | Media |
| T3.1.3 | Circuit breaker | Auto-failover | 3h | Media |

## FASE 4: SAAS MONETIZABLE (Mes 9-12)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T4.1.1 | Billing tables | PostgreSQL views | 4h | Media |
| T4.1.2 | Stripe webhooks | Stripe SDK | 6h | Media |
| T4.1.3 | Usage quotas | Materialized views | 4h | Media |
| T4.1.4 | Email notifs | Resend + MJML | 4h | Media |
| T4.1.5 | Swagger UI | OpenAPI 3.1 | 3h | Media |

## FASE 5: HIPERESCALAMIENTO OPCIONAL (Mes 13-15)
| Ticket | Tarea | Tech | Horas | Prioridad |
|--------|-------|------|-------|-----------|
| T5.1.1 | Redis Enterprise | Render Redis + ioredis | 2h | Baja |
| T5.1.2 | BullMQ Pro | BullMQ Premium | 6h | Baja |
| T5.1.3 | Dual write migration | Feature flags | 6h | Baja |
| T5.1.4 | BullMQ production | QUEUE_ADAPTER flag | 2h | Baja |
| T5.1.5 | BullBoard dashboard | BullMQ UI | 3h | Baja |
| T5.2.1 | Sentry Enterprise | Sentry Pro | 3h | Baja |
| T5.2.2 | Datadog APM | Datadog RUM | 4h | Baja |
| T5.2.3 | Log draining | ClickHouse | 3h | Baja |

## TECH STACK COMPLETO
| Fase | Core | Database | Queue | Auth | Monitoring |
|------|------|----------|-------|------|------------|
| 0-2 | Next.js 15, Vercel | Supabase PG 16 | PGMQ 0.3 | Supabase JWT | GitHub Actions |
| 3-4 | Stripe SDK, Resend | PG JSONB views | PGMQ + DLQ | API Keys RBAC | Vercel Analytics |
| 5 | BullMQ, Hono Edge | PG + Redis | BullMQ Pro | JWT+SAML | Sentry + Datadog |

## TIMELINE
- MVP VENDIBLE: Sprint 1.4 - Mes 2
- SAAS PROFESIONAL: Sprint 4.1 - Mes 9
- ENTERPRISE READY: Sprint 5.2 - Mes 14
