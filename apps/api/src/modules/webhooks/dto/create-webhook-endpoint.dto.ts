import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { WEBHOOK_EVENT_TYPES, type WebhookEventType } from '../webhook-events';

// HTTPS only, per docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md
// ("HTTPS solamente"). The http://127.0.0.1|localhost exception exists only
// so fault-injection tests can exercise real HTTP delivery attempts against
// a local test server without provisioning TLS certs; it is not reachable
// from outside this process and never applies to a real tenant endpoint.
const WEBHOOK_URL_PATTERN =
  /^(https:\/\/[^\s]+|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/[^\s]*)?)$/;

export class CreateWebhookEndpointDto {
  @IsString()
  @MaxLength(2048)
  @Matches(WEBHOOK_URL_PATTERN, {
    message:
      'url must be https:// (http://127.0.0.1|localhost only for local testing)',
  })
  url!: string;

  @IsString()
  @MinLength(16)
  @MaxLength(200)
  secret!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(WEBHOOK_EVENT_TYPES, { each: true })
  event_types?: WebhookEventType[];
}
