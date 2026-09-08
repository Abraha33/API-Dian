import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CredentialGuard } from '../auth/credential.guard';
import type { FiscalRequest } from '../auth/fiscal-principal';
import { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { WebhookEndpointsService } from './webhook-endpoints.service';

@Controller('v1/webhook-endpoints')
@UseGuards(CredentialGuard)
export class WebhookEndpointsController {
  constructor(private readonly endpoints: WebhookEndpointsService) {}

  @Post()
  @HttpCode(201)
  create(@Req() request: FiscalRequest, @Body() dto: CreateWebhookEndpointDto) {
    const principal = requirePrincipal(request);
    return this.endpoints.create(principal, dto);
  }

  @Get()
  list(@Req() request: FiscalRequest) {
    const principal = requirePrincipal(request);
    return this.endpoints.list(principal);
  }

  @Get(':endpointId')
  get(
    @Req() request: FiscalRequest,
    @Param('endpointId', new ParseUUIDPipe({ version: '4' }))
    endpointId: string,
  ) {
    const principal = requirePrincipal(request);
    return this.endpoints.get(principal, endpointId);
  }

  @Patch(':endpointId/disable')
  disable(
    @Req() request: FiscalRequest,
    @Param('endpointId', new ParseUUIDPipe({ version: '4' }))
    endpointId: string,
  ) {
    const principal = requirePrincipal(request);
    return this.endpoints.disable(principal, endpointId);
  }
}

function requirePrincipal(request: FiscalRequest) {
  const principal = request.fiscalPrincipal;
  if (!principal) throw new UnauthorizedException('Invalid credential');
  return principal;
}
