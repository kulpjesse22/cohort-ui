/**
 * Who may put Cohort in an iframe: itself, Kulpritt OS (production and its
 * Vercel alias), the UX portfolio that frames both Cohort and Laguna Seca,
 * and a local OS dev server on any port.
 */
export const FRAME_ANCESTORS = [
  "'self'",
  "https://os.kulpritt.com",
  "https://kulpritt-os.vercel.app",
  "https://ux.kulpritt.com",
  "http://127.0.0.1:*",
  "http://localhost:*",
].join(" ");

/**
 * The page policy. Scripts need the per-request nonce (Next attaches it to its
 * own inline RSC payload scripts); 'strict-dynamic' lets those load the
 * chunks. Styles stay 'unsafe-inline' because React renders `style={{…}}`
 * attributes, which nonces cannot cover. Everything else is same-origin only:
 * fonts are self-hosted by next/font and the voice preview plays a blob URL.
 */
export function contentSecurityPolicy(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "media-src 'self' blob:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    `frame-ancestors ${FRAME_ANCESTORS}`,
  ].join("; ");
}

/** For responses that are never documents: JSON, streams, images. */
export const API_CSP = `default-src 'none'; frame-ancestors ${FRAME_ANCESTORS}`;
