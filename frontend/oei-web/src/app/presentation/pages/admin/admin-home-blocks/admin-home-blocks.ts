import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminHomeBlocksApplicationService } from '../../../../application/service/admin-home-blocks-application.service';
import { HomeBlockConfig } from '../../../../domain/model/admin/admin-home-block';
import { I18nService } from '../../../i18n/i18n.service';

/**
 * Admin "blocs-home" section (task brief §CMS "blocs-home"): activate/deactivate, reorder
 * (move up/down) and rename the blocks shown on the public home page. Purely a back-office
 * rehearsal — never touches `HomeSectionsApplicationService`/`Home`, so nothing here changes what
 * `/` actually renders (see `AdminHomeBlocksMockAdapter`'s doc comment).
 */
@Component({
  selector: 'oei-admin-home-blocks',
  imports: [FormsModule],
  templateUrl: './admin-home-blocks.html',
  styleUrl: './admin-home-blocks.scss',
})
export class AdminHomeBlocks {
  private readonly blocksService = inject(AdminHomeBlocksApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly blocksResource = rxResource({
    params: () => true,
    stream: () => this.blocksService.list(),
  });

  protected readonly blocks = computed(() => this.blocksResource.value() ?? []);

  protected readonly editingId = signal<string | null>(null);
  protected readonly labelDraft = signal('');
  protected readonly labelError = signal(false);

  protected startEdit(block: HomeBlockConfig): void {
    this.editingId.set(block.id);
    this.labelDraft.set(block.label);
    this.labelError.set(false);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveLabel(block: HomeBlockConfig): void {
    const label = this.labelDraft().trim();
    if (!label) {
      this.labelError.set(true);
      return;
    }
    this.blocksService.update(block.id, { label, active: block.active }).subscribe(() => {
      this.editingId.set(null);
      this.blocksResource.reload();
    });
  }

  protected toggleActive(block: HomeBlockConfig): void {
    this.blocksService.toggleActive(block).subscribe(() => this.blocksResource.reload());
  }

  protected move(block: HomeBlockConfig, direction: 'up' | 'down'): void {
    this.blocksService.move(this.blocks(), block, direction).subscribe(() => this.blocksResource.reload());
  }
}
