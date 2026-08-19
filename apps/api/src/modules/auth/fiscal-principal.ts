import type { FastifyRequest } from 'fastify';

export interface FiscalPrincipal {
  credentialId: string;
  tenantId: string;
}

export type FiscalRequest = FastifyRequest & {
  fiscalPrincipal?: FiscalPrincipal;
};
