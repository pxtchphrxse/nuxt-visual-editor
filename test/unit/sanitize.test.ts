// @vitest-environment node
// The content policy is tested on jsdom, the DOM DOMPurify officially supports on the server.
import createDOMPurify, { type WindowLike } from 'dompurify'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import { createContentSanitizer, filterClasses, filterStyle } from '../../src/runtime/core/sanitize'
import { isValidVarValue } from '../../src/runtime/core/schema'
import { isSafeUrl } from '../../src/runtime/core/url'

const { window } = new JSDOM('')
const sanitize = createContentSanitizer(createDOMPurify(window as unknown as WindowLike))

const ALLOWED_ATTRS = new Set([
  'class',
  'style',
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'loading',
  'data-ve-id',
  'data-ve-v',
])

const FORBIDDEN_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'style',
  'form',
  'input',
  'button',
  'textarea',
  'base',
  'meta',
  'link',
  'template',
  'frame',
  'frameset',
  'video',
  'audio',
  'source',
  'noscript',
  'xmp',
  'plaintext',
  'dialog',
  'details',
  'marquee',
])

/** Structural safety problems in sanitized output, independent of exact serialization. */
function unsafeParts(html: string): string[] {
  const problems: string[] = []
  const doc = new JSDOM(`<body>${html}</body>`).window.document
  for (const el of doc.body.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase()
    if (FORBIDDEN_TAGS.has(tag)) problems.push(`<${tag}>`)
    for (const attr of el.attributes) {
      const bad =
        /^on/i.test(attr.name) ||
        !ALLOWED_ATTRS.has(attr.name) ||
        (attr.name === 'href' && !isSafeUrl(attr.value, 'link')) ||
        (attr.name === 'src' && !isSafeUrl(attr.value, 'image')) ||
        (attr.name === 'style' &&
          attr.value.split(';').some((decl) => {
            if (!decl.trim()) return false
            const [name, ...rest] = decl.split(':')
            return !isValidVarValue(name!.trim(), rest.join(':').trim())
          }))
      if (bad) problems.push(`${tag}[${attr.name}="${attr.value}"]`)
    }
  }
  return problems
}

// Payloads drawn from the OWASP XSS Filter Evasion Cheat Sheet, DOMPurify's documented bypass
// classes (mXSS, namespace confusion, DOM clobbering) and CSS injection techniques.
const XSS_CORPUS = [
  '<script>alert(1)</script>',
  '<SCRIPT SRC=http://xss.example/xss.js></SCRIPT>',
  '<img src=x onerror=alert(1)>',
  '<img src="javascript:alert(1)">',
  '<IMG SRC=JaVaScRiPt:alert(1)>',
  '<img src=`javascript:alert(1)`>',
  '<img """><script>alert(1)</script>">',
  '<img src=/ onerror="alert(String.fromCharCode(88,83,83))">',
  '<a href="javascript:alert(1)">x</a>',
  '<a href="jav&#x09;ascript:alert(1)">x</a>',
  '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">x</a>',
  '<a href="  javascript:alert(1)">x</a>',
  '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  '<a href="vbscript:msgbox(1)">x</a>',
  '<a href="//evil.example.com">x</a>',
  '<svg onload=alert(1)>',
  '<svg><script>alert(1)</script></svg>',
  '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
  '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)></style></mglyph></table></mtext></math>',
  '<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>',
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<object data="javascript:alert(1)"></object>',
  '<embed src="javascript:alert(1)">',
  '<body onload=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '<input autofocus onfocus=alert(1)>',
  '<button formaction="javascript:alert(1)">x</button>',
  '<video><source onerror="alert(1)"></video>',
  '<marquee onstart=alert(1)>',
  '<div style="background:url(javascript:alert(1))">x</div>',
  '<div style="width: expression(alert(1))">x</div>',
  '<div style="--bg: url(https://evil.example/track.png)">x</div>',
  '<div style="--bg:#fff;behavior:url(xss.htc)">x</div>',
  '<div style="--fs: 1rem; } body { display:none">x</div>',
  '<div style="--bg: #fff !important">x</div>',
  '<style>@import "https://evil.example/x.css"; body{display:none}</style>',
  '<link rel=stylesheet href="https://evil.example/x.css">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  '<base href="javascript:alert(1)//">',
  '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
  '<img id="__proto__" name="cookie" src="x.png">',
  '<form name="getElementById"><input name="body"></form>',
  '<a href="https://ok.example" target="_self" rel="opener">x</a>',
  '<p class="pad x"onmouseover=alert(1)>x</p>',
  '<section data-ve-id="<script>" data-ve-v="999" data-evil="1">x</section>',
  '<template><img src=x onerror=alert(1)></template>',
  '<xmp><img src=x onerror=alert(1)></xmp>',
  '<!--<img src=x onerror=alert(1)>-->',
  '<p>{{ constructor.constructor("alert(1)")() }}</p>',
]

describe('content sanitizer', () => {
  it.each(XSS_CORPUS)('neutralises %s', (payload) => {
    const { html } = sanitize(payload)
    expect(unsafeParts(html)).toEqual([])
    // URL attributes are checked structurally by assertSafe (a relative "`javascript:`" path is inert).
    expect(html).not.toMatch(/\son\w+=|expression\(|url\(/i)
  })

  it('keeps valid v2 content untouched', () => {
    const html =
      '<section data-ve-id="a1" data-ve-v="2" class="pad bg" style="--pad-y: 2rem; --bg: #10b981;">' +
      '<h2 class="fs fw" style="--fs: 2.25rem; --fw: 700;">Title</h2>' +
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a></p>' +
      '<img class="img" src="https://cdn.example.com/a.png" alt="a"></section>'
    const result = sanitize(html)
    expect(result.html).toBe(html)
    expect(result.changes).toEqual([])
  })

  it('drops only the invalid declarations from style', () => {
    const { html, changes } = sanitize(
      '<p class="bg" style="--bg: #fff; color: red; --fs: nope">x</p>',
    )
    expect(html).toBe('<p class="bg" style="--bg: #fff;">x</p>')
    expect(changes).toEqual([
      { kind: 'style', name: 'color', tag: 'p' },
      { kind: 'style', name: '--fs', tag: 'p' },
    ])
  })

  it('removes a style attribute that ends up empty', () => {
    const { html, changes } = sanitize('<p style="position:fixed">x</p>')
    expect(html).toBe('<p>x</p>')
    expect(changes).toContainEqual({ kind: 'style', name: 'position', tag: 'p' })
    expect(changes).toContainEqual({ kind: 'attribute', name: 'style', tag: 'p' })
  })

  it('forces rel for new-tab links and strips rel otherwise', () => {
    expect(sanitize('<a href="/x" target="_blank">x</a>').html).toBe(
      '<a href="/x" target="_blank" rel="noopener noreferrer">x</a>',
    )
    expect(sanitize('<a href="/x" rel="opener">x</a>').html).toBe('<a href="/x">x</a>')
    expect(sanitize('<p rel="x">x</p>').html).toBe('<p>x</p>')
  })

  it('restricts attributes to their elements', () => {
    expect(
      sanitize('<p href="https://a.example" src="https://a.example/x.png" target="_blank">x</p>')
        .html,
    ).toBe('<p>x</p>')
    expect(sanitize('<div data-ve-id="a" data-ve-v="2">x</div>').html).toBe('<div>x</div>')
  })

  it('allows raster data URIs for images only', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo='
    expect(sanitize(`<img src="${png}">`).html).toBe(`<img src="${png}">`)
    expect(sanitize(`<a href="${png}">x</a>`).html).toBe('<a>x</a>')
  })

  it('reports removed elements and attributes', () => {
    const { changes } = sanitize('<p onclick="x()">a</p><script>x()</script>')
    expect(changes).toContainEqual({ kind: 'attribute', name: 'onclick', tag: 'p' })
    expect(changes).toContainEqual({ kind: 'element', name: 'script' })
  })

  it('can restrict classes to the vocabulary', () => {
    const { html, changes } = sanitize('<p class="pad my-class">x</p>', {
      allowCustomClasses: false,
    })
    expect(html).toBe('<p class="pad">x</p>')
    expect(changes).toContainEqual({ kind: 'class', name: 'my-class', tag: 'p' })
    expect(sanitize('<p class="my-class">x</p>').html).toBe('<p class="my-class">x</p>')
    expect(sanitize('<p class="my-class">x</p>', { allowCustomClasses: false }).html).toBe(
      '<p>x</p>',
    )
  })

  it('is idempotent', () => {
    for (const payload of XSS_CORPUS) {
      const once = sanitize(payload).html
      expect(sanitize(once).html).toBe(once)
    }
  })
})

describe('change reporting', () => {
  it('tolerates DOMPurify entries without an attribute object', () => {
    // DOMPurify types allow `attribute: null` for removals it cannot attribute to a node.
    const fake = {
      removed: [{ attribute: null, from: window.document.createElement('p') }],
      addHook() {},
      sanitize: () => '',
    }
    const run = createContentSanitizer(
      fake as unknown as Parameters<typeof createContentSanitizer>[0],
    )
    expect(run('x')).toEqual({ html: '', changes: [] })
  })
})

describe('filterStyle', () => {
  it('normalises kept declarations and lists dropped ones', () => {
    expect(filterStyle(' --pad-y : 1rem ;; --bg:#000; broken; : x ')).toEqual({
      style: '--pad-y: 1rem; --bg: #000;',
      dropped: ['broken', ': x'],
    })
  })
})

describe('filterClasses', () => {
  it('de-duplicates and rejects invalid identifiers', () => {
    expect(filterClasses('pad pad 1bad lg:px-8 w-1/2 max-w-[20rem] "x a<b', true)).toEqual({
      value: 'pad 1bad lg:px-8 w-1/2 max-w-[20rem]',
      dropped: ['"x', 'a<b'],
    })
  })
})
