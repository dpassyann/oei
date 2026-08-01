import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { ContentApplicationService } from '../../../application/service/content-application.service';

describe('Home', () => {
  it('givenMockContent_whenNgOnInit_thenTitleIsPopulated', async () => {
    const fakeService = { getHomeContent: () => Promise.resolve({ title: 'Titre test', body: 'Corps test', isFallback: false }) };
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: ContentApplicationService, useValue: fakeService }],
    });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Titre test');
  });
});
