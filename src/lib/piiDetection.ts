/**
 * PII Detection & Masking
 * Detects and masks personally identifiable information before storage or logging.
 */

export interface PIIMatch {
  type: string;
  original: string;
  masked: string;
  start: number;
  end: number;
}

// ─── Pattern Definitions ───────────────────────────────────────────────────────

const PII_PATTERNS: Array<{
  type: string;
  pattern: RegExp;
  mask: (match: string) => string;
}> = [
  {
    type: "email",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    mask: (m) => m.replace(/^(.{2})(.*)(@.*)$/, (_, a, _b, c) => `${a}****${c}`),
  },
  {
    type: "phone",
    pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    mask: () => "***-***-****",
  },
  {
    type: "ssn",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    mask: () => "***-**-****",
  },
  {
    type: "credit_card",
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    mask: () => "**** **** **** ****",
  },
  {
    type: "government_id",
    pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
    mask: (m) => m.slice(0, 2) + "*".repeat(m.length - 2),
  },
  {
    type: "address",
    pattern: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b/gi,
    mask: () => "[ADDRESS REDACTED]",
  },
];

// ─── Detection ─────────────────────────────────────────────────────────────────

/** Detect all PII matches in a text string */
export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = [];

  for (const { type, pattern, mask } of PII_PATTERNS) {
    const freshPattern = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = freshPattern.exec(text)) !== null) {
      matches.push({
        type,
        original: match[0],
        masked: mask(match[0]),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort by position
  return matches.sort((a, b) => a.start - b.start);
}

// ─── Masking ───────────────────────────────────────────────────────────────────

/** Replace all PII in text with masked versions */
export function maskPII(text: string): { sanitized: string; detected: PIIMatch[] } {
  const detected = detectPII(text);

  if (detected.length === 0) {
    return { sanitized: text, detected: [] };
  }

  let sanitized = text;
  let offset = 0;

  for (const match of detected) {
    const start = match.start + offset;
    const end = match.end + offset;
    sanitized = sanitized.slice(0, start) + match.masked + sanitized.slice(end);
    offset += match.masked.length - match.original.length;
  }

  return { sanitized, detected };
}

/** Fast check: does the text contain any PII? */
export function hasPII(text: string): boolean {
  return PII_PATTERNS.some(({ pattern }) =>
    new RegExp(pattern.source, pattern.flags).test(text)
  );
}

/** Get a summary report for audit logging */
export function getPIIReport(text: string): { hasPII: boolean; types: string[] } {
  const matches = detectPII(text);
  const types = [...new Set(matches.map((m) => m.type))];
  return { hasPII: types.length > 0, types };
}
