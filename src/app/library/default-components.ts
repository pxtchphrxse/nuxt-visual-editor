// Built-in component library (v2 vocabulary). `{{assets}}` resolves to the module's assets URL.
import type { ComponentDefinition } from '../context'

export const DEFAULT_COMPONENTS: ComponentDefinition[] = [
  {
    name: 'Support center',
    category: 'headers',
    preview: '{{assets}}/previews/support-center-simple.png',
    html:
      '<section class="pad" style="--pad-y: 5rem; --pad-x: 1.5rem;"><div class="wrap stack" style="--max: 48rem; --gap: 1rem;">' +
      '<p class="fs fw fg" style="--fs: 1rem; --fw: 500; --fg: #dc2626;">Get the help you need</p>' +
      '<h2 class="fs fw" style="--fs: 2.25rem; --fs-sm: 3.75rem; --fw: 700;">Support center</h2>' +
      '<p class="fs fg" style="--fs: 1.125rem; --fg: #4b5563;">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</p>' +
      '</div></section>',
  },
  {
    name: '1 image with text',
    category: 'features',
    preview: '{{assets}}/previews/1-image-with-text.png',
    html:
      '<section class="pad" style="--pad-y: 5rem; --pad-x: 1.5rem;"><div class="wrap grid" style="--cols: 1; --cols-lg: 2; --gap: 2rem;">' +
      '<img class="img" style="--h: 20rem;" src="{{assets}}/placeholder_image.jpg" alt="">' +
      '<div class="stack" style="--gap: 1rem; --justify: center;"><h2 class="fs fw" style="--fs: 1.875rem; --fw: 700;">A feature worth a headline</h2>' +
      '<p class="fs fg" style="--fs: 1.125rem; --fg: #4b5563;">Describe the feature in a sentence or two.</p></div>' +
      '</div></section>',
  },
  {
    name: 'Testimonial',
    category: 'testimonials',
    preview: '{{assets}}/previews/testimonials-colorful.png',
    html:
      '<section class="pad bg" style="--pad-y: 5rem; --pad-x: 1.5rem; --bg: #10b981;"><div class="wrap stack" style="--max: 42rem; --gap: 1.5rem;">' +
      '<blockquote class="fs fw fg" style="--fs: 1.5rem; --fw: 500; --fg: #ffffff;">“This editor saved our marketing team hours every week.”</blockquote>' +
      '<p class="fg" style="--fg: #ecfdf5;">Alex Doe, Head of Marketing</p>' +
      '</div></section>',
  },
]

export const DEFAULT_CATEGORIES = ['headers', 'features', 'testimonials']
