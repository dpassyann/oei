import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminMenusApplicationService } from '../../../../application/service/admin-menus-application.service';
import { MenuEntry, MenuZone } from '../../../../domain/model/admin/admin-menu-entry';
import { MenuEntryInput } from '../../../../domain/port/admin/admin-menus.port';
import { I18nService } from '../../../i18n/i18n.service';

interface MenuDraft {
  labelKey: string;
  route: string;
  zone: MenuZone;
}

function emptyDraft(): MenuDraft {
  return { labelKey: '', route: '/', zone: 'header' };
}

/**
 * Admin "menus" section (task brief §CMS "menus"): CRUD on site nav entries, split into a
 * `header`/`footer` table each, plus an add/edit form. Soft delete only (`active` toggle) — no
 * hard delete UI, consistent with `AdminInstitutions*`'s convention for sensitive-ish entities.
 * All validation and reordering logic lives in `AdminMenusApplicationService`, not here.
 */
@Component({
  selector: 'oei-admin-menus',
  imports: [FormsModule],
  templateUrl: './admin-menus.html',
  styleUrl: './admin-menus.scss',
})
export class AdminMenus {
  private readonly menusService = inject(AdminMenusApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly menusResource = rxResource({
    params: () => true,
    stream: () => this.menusService.list(),
  });

  protected readonly entries = computed(() => this.menusResource.value() ?? []);
  protected readonly headerEntries = computed(() => this.menusService.sortByZone(this.entries(), 'header'));
  protected readonly footerEntries = computed(() => this.menusService.sortByZone(this.entries(), 'footer'));

  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<MenuDraft>(emptyDraft());
  protected readonly labelKeyError = signal(false);
  protected readonly routeError = signal(false);
  protected readonly saving = signal(false);

  protected updateDraft(partial: Partial<MenuDraft>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  protected startCreate(zone: MenuZone): void {
    this.editingId.set('new');
    this.draft.set({ ...emptyDraft(), zone });
    this.labelKeyError.set(false);
    this.routeError.set(false);
  }

  protected startEdit(entry: MenuEntry): void {
    this.editingId.set(entry.id);
    this.draft.set({ labelKey: entry.labelKey, route: entry.route, zone: entry.zone });
    this.labelKeyError.set(false);
    this.routeError.set(false);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.draft.set(emptyDraft());
  }

  protected submit(): void {
    const input: MenuEntryInput = { ...this.draft(), labelKey: this.draft().labelKey.trim(), route: this.draft().route.trim() };
    const validation = this.menusService.validate(input);
    this.labelKeyError.set(validation.labelKeyError);
    this.routeError.set(validation.routeError);
    if (!validation.valid) {
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const call = id && id !== 'new' ? this.menusService.update(id, input) : this.menusService.create(input);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.menusResource.reload();
      },
      error: () => this.saving.set(false),
    });
  }

  protected toggleActive(entry: MenuEntry): void {
    this.menusService.setActive(entry, !entry.active).subscribe(() => this.menusResource.reload());
  }

  protected move(entry: MenuEntry, direction: 'up' | 'down'): void {
    this.menusService.move(this.entries(), entry, direction).subscribe(() => this.menusResource.reload());
  }
}
