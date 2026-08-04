import { describe, expect, it } from 'vitest';
import { diffLines } from './content-diff';

describe('diffLines', () => {
  it('givenIdenticalText_whenDiffed_thenAllLinesUnchanged', () => {
    const result = diffLines('a\nb\nc', 'a\nb\nc');

    expect(result).toEqual([
      { type: 'unchanged', text: 'a' },
      { type: 'unchanged', text: 'b' },
      { type: 'unchanged', text: 'c' },
    ]);
  });

  it('givenOneLineChanged_whenDiffed_thenReportsRemovedThenAdded', () => {
    const result = diffLines('a\nb\nc', 'a\nB\nc');

    expect(result).toEqual([
      { type: 'unchanged', text: 'a' },
      { type: 'removed', text: 'b' },
      { type: 'added', text: 'B' },
      { type: 'unchanged', text: 'c' },
    ]);
  });

  it('givenLineAdded_whenDiffed_thenReportsAddedLine', () => {
    const result = diffLines('a\nc', 'a\nb\nc');

    expect(result).toEqual([
      { type: 'unchanged', text: 'a' },
      { type: 'added', text: 'b' },
      { type: 'unchanged', text: 'c' },
    ]);
  });

  it('givenLineRemoved_whenDiffed_thenReportsRemovedLine', () => {
    const result = diffLines('a\nb\nc', 'a\nc');

    expect(result).toEqual([
      { type: 'unchanged', text: 'a' },
      { type: 'removed', text: 'b' },
      { type: 'unchanged', text: 'c' },
    ]);
  });

  it('givenEmptyBefore_whenDiffed_thenAllLinesAdded', () => {
    expect(diffLines('', 'x')).toEqual([
      { type: 'removed', text: '' },
      { type: 'added', text: 'x' },
    ]);
  });
});
