import { TestBed } from '@angular/core/testing';
import { LeadCaptureApplicationService } from './lead-capture-application.service';
import { LEAD_CAPTURE_PORT, LeadCapturePort } from '../../domain/port/lead-capture.port';

describe('LeadCaptureApplicationService', () => {
  function createService(port: LeadCapturePort): LeadCaptureApplicationService {
    TestBed.configureTestingModule({
      providers: [{ provide: LEAD_CAPTURE_PORT, useValue: port }],
    });
    return TestBed.inject(LeadCaptureApplicationService);
  }

  it('givenValidEmail_whenSubmitEmail_thenCallsPortAndReturnsSuccess', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const service = createService({ submit });

    const result = await service.submitEmail('jane.doe@example.com');

    expect(submit).toHaveBeenCalledWith('jane.doe@example.com');
    expect(result).toEqual({ success: true });
  });

  it('givenMalformedEmail_whenSubmitEmail_thenRejectsWithoutCallingPort', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const service = createService({ submit });

    const result = await service.submitEmail('not-an-email');

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false });
  });

  it('givenEmptyEmail_whenSubmitEmail_thenRejectsWithoutCallingPort', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const service = createService({ submit });

    const result = await service.submitEmail('   ');

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false });
  });

  it('givenPortRejects_whenSubmitEmail_thenReturnsFailure', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('network down'));
    const service = createService({ submit });

    const result = await service.submitEmail('jane.doe@example.com');

    expect(result).toEqual({ success: false });
  });
});
