jest.mock('pg', () => ({ Pool: jest.fn() }));

import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

describe('DatabaseService pool error handling', () => {
  const PoolMock = Pool as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles idle pool errors without crashing the process', () => {
    const on = jest.fn();
    PoolMock.mockImplementation(() => ({ on, end: jest.fn() }));
    const config = {
      getOrThrow: jest.fn().mockReturnValue('postgresql://local/test'),
      get: jest.fn().mockReturnValue(5),
    } as unknown as ConfigService;

    new DatabaseService(config);

    expect(on).toHaveBeenCalledWith('error', expect.any(Function));
    const call = on.mock.calls[0] as [string, (error: Error) => void];
    const handler = call[1];
    expect(() =>
      handler(new Error('database connection dropped')),
    ).not.toThrow();
  });
});
