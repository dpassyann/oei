import { TestBed } from '@angular/core/testing';
import { StyledQr } from './styled-qr';

describe('StyledQr', () => {
  it('givenValue_whenCreated_thenRendersCanvasAndDefaultShieldLogo', async () => {
    TestBed.configureTestingModule({ imports: [StyledQr] });
    const fixture = TestBed.createComponent(StyledQr);
    fixture.componentRef.setInput('value', 'https://oei.example/card/demo-jane-dupont');
    fixture.componentRef.setInput('size', 180);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const canvas = compiled.querySelector<HTMLCanvasElement>('.oei-styled-qr__canvas');
    expect(canvas).not.toBeNull();
    expect(compiled.querySelector('.oei-styled-qr__logo-shield')).not.toBeNull();
    expect(compiled.querySelector('.oei-styled-qr__logo-photo')).toBeNull();
  });

  it('givenPhotoUrl_whenCreated_thenRendersPhotoInsteadOfShield', async () => {
    TestBed.configureTestingModule({ imports: [StyledQr] });
    const fixture = TestBed.createComponent(StyledQr);
    fixture.componentRef.setInput('value', 'https://oei.example/card/demo-jane-dupont');
    fixture.componentRef.setInput('photoUrl', '/assets/mock/demo-jane-dupont.jpg');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const photo = compiled.querySelector<HTMLImageElement>('.oei-styled-qr__logo-photo');
    expect(photo?.getAttribute('src')).toBe('/assets/mock/demo-jane-dupont.jpg');
    expect(compiled.querySelector('.oei-styled-qr__logo-shield')).toBeNull();
  });
});
