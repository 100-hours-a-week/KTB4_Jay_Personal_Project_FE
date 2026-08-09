function isSafeUrl(url) {
  return /^(https?:\/\/|mailto:|\/uploads\/)/i.test(url)
}

function renderInlineMarkdown(text) {
  const parts = []
  const pattern = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1] !== undefined) {
      const imageUrl = match[2]
      parts.push(
        isSafeUrl(imageUrl)
          ? <img key={`image-${match.index}`} src={imageUrl} alt={match[1]} />
          : match[0],
      )
    } else if (match[3] !== undefined) {
      const linkUrl = match[4]
      parts.push(
        isSafeUrl(linkUrl)
          ? (
            <a key={`link-${match.index}`} href={linkUrl} target="_blank" rel="noreferrer">
              {match[3]}
            </a>
          )
          : match[0],
      )
    } else if (match[5] !== undefined) {
      parts.push(<strong key={`bold-${match.index}`}>{match[5]}</strong>)
    } else if (match[6] !== undefined) {
      parts.push(<em key={`italic-${match.index}`}>{match[6]}</em>)
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function parseMarkdownBlocks(markdown) {
  const lines = markdown.split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const codeLines = []
      index += 1

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      blocks.push({ type: 'code', language, content: codeLines.join('\n') })

      if (index < lines.length) {
        const trailingContent = lines[index].slice(3).trim()

        if (trailingContent !== '') {
          lines.splice(index + 1, 0, trailingContent)
        }
      }

      index += 1
      continue
    }

    if (line.startsWith('>')) {
      const quoteLines = []

      while (index < lines.length && lines[index].startsWith('>')) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }

      blocks.push({ type: 'quote', content: quoteLines.join('\n') })
      continue
    }

    const paragraphLines = []

    while (
      index < lines.length
      && lines[index].trim() !== ''
      && !lines[index].startsWith('```')
      && !lines[index].startsWith('>')
    ) {
      paragraphLines.push(lines[index])
      index += 1
    }

    blocks.push({ type: 'paragraph', content: paragraphLines.join('\n') })
  }

  return blocks
}

function MarkdownContent({ content }) {
  const blocks = parseMarkdownBlocks(content ?? '')

  return (
    <div className="markdown-content">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <div key={`code-${index}`} className="markdown-code-card">
              {block.language && <div className="markdown-code-language">{block.language}</div>}
              <pre className="markdown-code-block">
                <code>{block.content}</code>
              </pre>
            </div>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={`quote-${index}`}>
              {renderInlineMarkdown(block.content)}
            </blockquote>
          )
        }

        return (
          <p key={`paragraph-${index}`}>
            {renderInlineMarkdown(block.content)}
          </p>
        )
      })}
    </div>
  )
}

export default MarkdownContent
