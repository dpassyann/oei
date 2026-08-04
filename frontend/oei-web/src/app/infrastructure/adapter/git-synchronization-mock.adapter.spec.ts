import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { GitSynchronizationMockAdapter, resetGitSynchronizationFixtures, SYNCED_FILES } from './git-synchronization-mock.adapter';
import { parseAndValidateFrontMatter } from '../../domain/model/cms/front-matter';

describe('GitSynchronizationMockAdapter', () => {
  let adapter: GitSynchronizationMockAdapter;

  beforeEach(() => {
    resetGitSynchronizationFixtures();
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(GitSynchronizationMockAdapter);
  });

  it('givenDemoHistory_whenListed_thenReturnsAtLeastOneSuccessfulRun', async () => {
    const runs = await firstValueFrom(adapter.list());

    expect(runs.some((run) => run.status === 'SUCCESS')).toBe(true);
  });

  it('givenTriggered_whenCalled_thenAppendsANewSuccessfulRunIdempotently', async () => {
    const before = await firstValueFrom(adapter.list());
    await firstValueFrom(adapter.trigger());
    const after = await firstValueFrom(adapter.list());

    expect(after.length).toBe(before.length + 1);
    expect(after.at(-1)?.status).toBe('SUCCESS');
  });

  it('givenKnownId_whenGetById_thenReturnsIt', async () => {
    const synchronization = await firstValueFrom(adapter.getById('sync-1'));

    expect(synchronization.id).toBe('sync-1');
  });

  it('givenUnknownId_whenGetById_thenErrors', async () => {
    await expect(firstValueFrom(adapter.getById('unknown'))).rejects.toThrow();
  });

  it('givenSyncedFiles_whenListed_thenEachHasParsableFrontMatter', async () => {
    const files = await firstValueFrom(adapter.listSyncedFiles());

    expect(files.length).toBe(SYNCED_FILES.length);
    for (const file of files) {
      const parsed = parseAndValidateFrontMatter(file.rawContent);
      expect(parsed.valid).toBe(true);
    }
  });
});
