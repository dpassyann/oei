import { TestBed } from '@angular/core/testing';
import { RuntimeConfig } from './runtime-config';

describe('RuntimeConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    (globalThis as any).fetch = undefined;
  });

  it('givenNoConfigEndpoint_whenLoad_thenDefaultsToMock', async () => {
    (globalThis as any).fetch = () => Promise.reject(new Error('network down'));
    const config = TestBed.inject(RuntimeConfig);
    await config.load();
    expect(config.dataSource()).toBe('mock');
    expect(config.isMock()).toBe(true);
  });

  it('givenConfigEndpointReturnsApi_whenLoad_thenSwitchesToApi', async () => {
    (globalThis as any).fetch = () =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ dataSource: 'api', apiBaseUrl: '/api/v1' }),
      });
    const config = TestBed.inject(RuntimeConfig);
    await config.load();
    expect(config.dataSource()).toBe('api');
    expect(config.apiBaseUrl()).toBe('/api/v1');
  });

  it('givenManualOverride_whenLoadRunsAfter_thenOverrideWins', async () => {
    const config = TestBed.inject(RuntimeConfig);
    config.setDataSource('api');
    (globalThis as any).fetch = () =>
      Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ dataSource: 'mock', apiBaseUrl: '/api/v1' }),
      });
    await config.load();
    expect(config.dataSource()).toBe('api');
  });
});
