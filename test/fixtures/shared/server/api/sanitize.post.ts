export default defineEventHandler(async (event) => {
  const { html } = await readBody<{ html: string }>(event)
  return { html: sanitizeVisualContent(html) }
})
