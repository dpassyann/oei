import { LeadCaptureMockAdapter } from './lead-capture-mock.adapter';

describe('LeadCaptureMockAdapter', () => {
  it('givenEmail_whenSubmit_thenResolvesSuccessfullyAndLogsToConsole', async () => {
    const adapter = new LeadCaptureMockAdapter();
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await expect(adapter.submit('jane.doe@example.com')).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('jane.doe@example.com'));
  });
});
