/**
 * Adds a schema.org JSON-LD block to the page <head> (rendered at build time,
 * so search engines read it without running JavaScript).
 */
export function useJsonLd(data: Record<string, unknown>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        // Escape "<" so the JSON can never close the <script> tag early.
        innerHTML: JSON.stringify(data).replace(/</g, '\\u003c'),
      },
    ],
  })
}

/** Only real links belong in structured data — skip placeholders like "#". */
export const isRealUrl = (url?: string) => !!url && url !== '#' && !url.includes('example.com')
