export function normalizeMarkdownContent(content) {
  return (content ?? '')
    .replace(/```(?=!\[|\[)/g, '```\n')
}
