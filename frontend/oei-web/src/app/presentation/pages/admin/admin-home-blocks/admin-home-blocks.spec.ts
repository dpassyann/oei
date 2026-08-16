import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminHomeBlocks } from './admin-home-blocks';
import { AdminHomeBlocksApplicationService } from '../../../../application/service/admin-home-blocks-application.service';
import { createHomeBlockConfig } from '../../../../domain/model/admin/admin-home-block';

describe('AdminHomeBlocks', () => {
  it('givenBlocks_whenCreated_thenRendersOneRowPerBlock', async () => {
    TestBed.configureTestingModule({
      imports: [AdminHomeBlocks],
      providers: [
        {
          provide: AdminHomeBlocksApplicationService,
          useValue: { list: () => of([createHomeBlockConfig({ id: 'block-hero', key: 'hero', label: 'Hero', order: 1 })]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminHomeBlocks);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
