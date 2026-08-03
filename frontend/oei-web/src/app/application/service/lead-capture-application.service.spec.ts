import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
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
    const submit = vi.fn().mockReturnValue(of(undefined));
    const service = createService({ submit });

    const result = await firstValueFrom(service.submitEmail('jane.doe@example.com'));

    expect(submit).toHaveBeenCalledWith('jane.doe@example.com');
    expect(result).toEqual({ success: true });
  });

  it('givenMalformedEmail_whenSubmitEmail_thenRejectsWithoutCallingPort', async () => {
    const submit = vi.fn().mockReturnValue(of(undefined));
    const service = createService({ submit });

    const result = await firstValueFrom(service.submitEmail('not-an-email'));

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false });
  });

  it('givenEmptyEmail_whenSubmitEmail_thenRejectsWithoutCallingPort', async () => {
    const submit = vi.fn().mockReturnValue(of(undefined));
    const service = createService({ submit });

    const result = await firstValueFrom(service.submitEmail('   '));

    expect(submit).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false });
  });

  it('givenPortRejects_whenSubmitEmail_thenReturnsFailure', async () => {
    const submit = vi.fn().mockReturnValue(throwError(() => new Error('network down')));
    const service = createService({ submit });

    const result = await firstValueFrom(service.submitEmail('jane.doe@example.com'));

    expect(result).toEqual({ success: false });
  });
});
