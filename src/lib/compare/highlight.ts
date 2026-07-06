export type HighlightedSegment = { text: string; highlighted: boolean };

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits `text` into segments, marking any case-insensitive occurrence
 * of a term in `terms` as highlighted. Pure, no I/O — used to render
 * matched/missing skill mentions in the side-by-side comparison
 * (specs/005-comparison-export/contracts/actions.md).
 */
export function highlightMatches(
  text: string,
  terms: string[],
): HighlightedSegment[] {
  if (text.length === 0) return [];

  const cleanTerms = terms.map((term) => term.trim()).filter(Boolean);
  if (cleanTerms.length === 0) {
    return [{ text, highlighted: false }];
  }

  // Longest term first, so a shorter term nested inside a longer one
  // (e.g. "React" inside "React Native") doesn't fragment the match.
  const pattern = new RegExp(
    `(${cleanTerms
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join("|")})`,
    "gi",
  );

  const segments: HighlightedSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, index), highlighted: false });
    }
    segments.push({ text: match[0], highlighted: true });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false });
  }

  return segments;
}
