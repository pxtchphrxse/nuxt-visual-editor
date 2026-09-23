import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addClass,
  canHaveLink,
  customClasses,
  getLink,
  getText,
  getVar,
  instantiateComponent,
  isImage,
  isTextElement,
  newId,
  parseSections,
  readImageFile,
  readVars,
  removeClass,
  removeLink,
  serializeSection,
  setImageSrc,
  setLink,
  setText,
  setVar,
} from '../../src/runtime/core/document'

function el<T extends HTMLElement = HTMLElement>(html: string): T {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content.firstElementChild as T
}

afterEach(() => vi.unstubAllGlobals())

describe('newId', () => {
  it('uses randomUUID when available', () => {
    expect(newId()).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/)
  })

  it('falls back to getRandomValues in insecure contexts', () => {
    const real = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) })
    const id = newId()
    expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/)
    expect(id).not.toBe(newId())
  })
})

describe('style variables', () => {
  it('sets a var and adds its class; removing the last var removes class and attributes', () => {
    const p = el('<p>x</p>')
    expect(setVar(p, '--pad-y', '2rem')).toBe(true)
    expect(p.className).toBe('pad')
    expect(getVar(p, '--pad-y')).toBe('2rem')
    setVar(p, '--pad-x', '1rem')
    setVar(p, '--pad-y', null)
    expect(p.className).toBe('pad')
    setVar(p, '--pad-x', '')
    expect(p.hasAttribute('class')).toBe(false)
    expect(p.hasAttribute('style')).toBe(false)
  })

  it('rejects invalid values without touching the element', () => {
    const p = el('<p class="custom" style="--bg: #fff">x</p>')
    expect(setVar(p, '--bg', 'url(x)')).toBe(false)
    expect(getVar(p, '--bg')).toBe('#fff')
    expect(p.className).toBe('custom')
  })

  it('does not toggle classes for layout vars', () => {
    const d = el('<div class="grid">x</div>')
    setVar(d, '--cols', '3')
    expect(d.className).toBe('grid')
    setVar(d, '--cols', null)
    expect(d.className).toBe('grid')
  })

  it('reads every var, null when unset', () => {
    const vars = readVars(el('<p class="fs" style="--fs: 1rem">x</p>'))
    expect(vars['--fs']).toBe('1rem')
    expect(vars['--bg']).toBeNull()
    expect(Object.keys(vars).length).toBeGreaterThan(30)
  })
})

describe('classes', () => {
  it('lists, adds and removes custom classes only', () => {
    const p = el('<p class="pad hero">x</p>')
    expect(customClasses(p)).toEqual(['hero'])
    expect(addClass(p, 'tall')).toBe('ok')
    expect(addClass(p, 'tall')).toBe('exists')
    expect(addClass(p, 'pad')).toBe('reserved')
    expect(addClass(p, 'lg:px-8')).toBe('ok')
    expect(addClass(p, 'a"b')).toBe('invalid')
    expect(addClass(p, 'a<b')).toBe('invalid')
    expect(addClass(p, 'a b')).toBe('invalid')
    removeClass(p, 'pad')
    expect(p.classList.contains('pad')).toBe(true)
    removeClass(p, 'hero')
    removeClass(p, 'tall')
    removeClass(p, 'lg:px-8')
    expect(p.className).toBe('pad')
    const q = el('<p class="only">x</p>')
    removeClass(q, 'only')
    expect(q.hasAttribute('class')).toBe(false)
  })
})

describe('text', () => {
  it('detects text elements', () => {
    expect(isTextElement(el('<p>a<br>b</p>'))).toBe(true)
    expect(isTextElement(el('<p><a href="/">a<br>b</a></p>'))).toBe(true)
    expect(isTextElement(el('<p>a<!-- c --></p>'))).toBe(true)
    expect(isTextElement(el('<p><a href="/"><span>x</span></a></p>'))).toBe(false)
    expect(isTextElement(el('<p><strong>a</strong></p>'))).toBe(false)
    expect(isTextElement(el('<div>a</div>'))).toBe(false)
    expect(isTextElement(el('<a href="/">x<br>y</a>'))).toBe(true)
    expect(isTextElement(el('<a href="/"><span>y</span></a>'))).toBe(false)
  })

  it('round-trips text with line breaks, inside links too', () => {
    const p = el('<p>a<br>b</p>')
    expect(getText(p)).toBe('a\nb')
    setText(p, 'one\r\ntwo\n\nthree')
    expect(p.innerHTML).toBe('one<br>two<br><br>three')
    const linked = el('<h2><a href="/x">old</a></h2>')
    setText(linked, 'new\ntext')
    expect(linked.innerHTML).toBe('<a href="/x">new<br>text</a>')
    expect(getText(linked)).toBe('new\ntext')
    expect(getText(el('<p>a<!-- c --><span>ignored</span></p>'))).toBe('a')
  })

  it('never interprets text as markup', () => {
    const p = el('<p>x</p>')
    setText(p, '<img src=x onerror=alert(1)>')
    expect(p.querySelector('img')).toBeNull()
    expect(p.textContent).toBe('<img src=x onerror=alert(1)>')
  })
})

describe('links', () => {
  it('adds, updates and removes a wrapping link', () => {
    const p = el('<p>hello</p>')
    expect(canHaveLink(p)).toBe(true)
    expect(getLink(p)).toBeNull()
    expect(setLink(p, { href: 'https://example.com', newTab: true })).toBe(true)
    expect(p.innerHTML).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">hello</a>',
    )
    expect(getLink(p)).toEqual({ href: 'https://example.com', newTab: true })
    setLink(p, { href: ' /about ', newTab: false })
    expect(p.innerHTML).toBe('<a href="/about">hello</a>')
    removeLink(p)
    expect(p.innerHTML).toBe('hello')
    removeLink(p)
    expect(p.innerHTML).toBe('hello')
  })

  it('rejects unsafe URLs and non-linkable elements', () => {
    const p = el('<p>x</p>')
    expect(setLink(p, { href: 'javascript:alert(1)', newTab: false })).toBe(false)
    expect(p.innerHTML).toBe('x')
    expect(canHaveLink(el('<div>x</div>'))).toBe(false)
    expect(canHaveLink(el('<p><strong>x</strong></p>'))).toBe(false)
    const nested = el('<a href="/"><span>x</span></a>')
    expect(canHaveLink(nested.firstElementChild!)).toBe(false)
    expect(setLink(el('<div>x</div>'), { href: '/', newTab: false })).toBe(false)
    expect(getLink(el('<p><a>x</a></p>'))).toEqual({ href: '', newTab: false })
  })
})

describe('images', () => {
  it('sets only safe sources', () => {
    const img = el<HTMLImageElement>('<img src="/a.png">')
    expect(isImage(img)).toBe(true)
    expect(isImage(el('<p>x</p>'))).toBe(false)
    expect(setImageSrc(img, 'https://cdn.example.com/b.png')).toBe(true)
    expect(img.getAttribute('src')).toBe('https://cdn.example.com/b.png')
    expect(setImageSrc(img, 'data:image/svg+xml;base64,PHN2Zz4=')).toBe(false)
    expect(img.getAttribute('src')).toBe('https://cdn.example.com/b.png')
  })

  it('reads raster files and rejects other types', async () => {
    const png = new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' })
    await expect(readImageFile(png)).resolves.toMatch(/^data:image\/png;base64,/)
    const svg = new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' })
    await expect(readImageFile(svg)).rejects.toThrow('Unsupported image type "image/svg+xml"')
    await expect(readImageFile(new File(['x'], 'x'))).rejects.toThrow('"unknown"')
  })

  it('surfaces FileReader errors', async () => {
    class FailingReader extends EventTarget {
      error: DOMException | null = null
      result = null
      readAsDataURL() {
        queueMicrotask(() => this.dispatchEvent(new Event('error')))
      }
    }
    vi.stubGlobal('FileReader', FailingReader)
    const png = new File(['x'], 'a.png', { type: 'image/png' })
    await expect(readImageFile(png)).rejects.toThrow('Could not read file')
    class ErrReader extends FailingReader {
      override error = new DOMException('boom')
    }
    vi.stubGlobal('FileReader', ErrReader)
    await expect(readImageFile(png)).rejects.toThrow('boom')
  })
})

describe('sections', () => {
  it('keeps sections, assigns missing ids and wraps stray content', () => {
    const sections = parseSections(
      '<section data-ve-id="keep"><p>a</p></section>  <p>stray</p> text <section><p>b</p></section><!-- c -->',
    )
    expect(sections).toHaveLength(3)
    expect(sections[0]!.id).toBe('keep')
    expect(sections[0]!.html).toBe('<section data-ve-id="keep" data-ve-v="2"><p>a</p></section>')
    expect(sections[1]!.html).toMatch(
      /^<section data-ve-id="[\w-]+" data-ve-v="2">\s*<p>stray<\/p> text <\/section>$/,
    )
    expect(sections[2]!.id).not.toBe(sections[1]!.id)
    expect(parseSections('   ')).toEqual([])
  })

  it('instantiates components with fresh ids and resolved assets', () => {
    const tpl = '<section data-ve-id="fixed"><img src="{{assets}}/placeholder.jpg"></section>'
    const a = instantiateComponent(tpl, '/base/_visual-editor/')
    const b = instantiateComponent(tpl, '/base/_visual-editor')
    expect(a.id).not.toBe('fixed')
    expect(a.id).not.toBe(b.id)
    expect(a.html).toContain('src="/base/_visual-editor/placeholder.jpg"')
    expect(a.html).toContain(`data-ve-id="${a.id}"`)
    expect(() => instantiateComponent('<section></section><section></section>', '/')).toThrow(
      'exactly one',
    )
    expect(() => instantiateComponent('', '/')).toThrow('exactly one')
  })

  it('serializes without editor state', () => {
    const s = el(
      '<section data-ve-id="s" data-ve-selected=""><p data-ve-hovered="" data-ve-selected="">x</p></section>',
    )
    expect(serializeSection(s)).toBe('<section data-ve-id="s"><p>x</p></section>')
    expect(s.hasAttribute('data-ve-selected')).toBe(true)
  })
})
