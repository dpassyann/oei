// Minimal line-by-line diff used to visualize a member contribution's proposed patch against the
// current published body. Deliberately simple (per the plan: "pas besoin d'un vrai algorithme de
// diff sophistiqué — une lib légère si déjà dispo, sinon comparaison ligne à ligne basique") — no
// dependency was added, `package.json` has no diff library installed (checked before writing
// this). This is a classic LCS-based line diff, small enough to keep as a hand-rolled utility.
export type DiffLineType = 'unchanged' | 'added' | 'removed';

export interface DiffLine {
  readonly type: DiffLineType;
  readonly text: string;
}

/** Computes a line-level diff between `before` and `after` using longest-common-subsequence
 * backtracking, producing a readable before/after sequence (unchanged lines kept once, removed
 * lines from `before`, added lines from `after`, in a sensible reading order). */
export function diffLines(before: string, after: string): readonly DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of the LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: 'unchanged', text: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ type: 'removed', text: a[i] });
      i += 1;
    } else {
      result.push({ type: 'added', text: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    result.push({ type: 'removed', text: a[i] });
    i += 1;
  }
  while (j < m) {
    result.push({ type: 'added', text: b[j] });
    j += 1;
  }
  return result;
}
