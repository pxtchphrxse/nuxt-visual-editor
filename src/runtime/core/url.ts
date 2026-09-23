export type UrlKind = 'link' | 'image'

const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const IMAGE_DATA = /^data:image\/(?:png|jpeg|gif|webp);base64,[\d+/a-z]+=*$/i
// Browsers ignore ASCII whitespace/control characters inside a scheme ("java\tscript:"), so
// they are stripped before the scheme is read.
// oxlint-disable-next-line no-control-regex
const IGNORED = /[\u0000- \u007F-\u009F]/g

/**
 * Allow-list check for URLs written into saved content.
 * Links: http(s), mailto, tel and scheme-less relative URLs.
 * Images: https, relative URLs and base64 png/jpeg/gif/webp data URIs (never SVG).
 */
export function isSafeUrl(raw: string, kind: UrlKind): boolean {
  const value = raw.trim()
  if (!value) return false
  const compact = value.replace(IGNORED, '')
  const scheme = compact.match(/^([a-z][\d+.a-z-]*):/i)?.[1]?.toLowerCase()

  if (!scheme) {
    // Protocol-relative URLs inherit the page scheme and can point anywhere; require an explicit one.
    return !compact.startsWith('//')
  }
  if (kind === 'image') {
    return scheme === 'https' || IMAGE_DATA.test(value)
  }
  return LINK_SCHEMES.has(`${scheme}:`)
}
