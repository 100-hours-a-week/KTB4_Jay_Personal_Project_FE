import { useEffect, useRef, useState } from 'react'
import { uploadImage } from '../api/imageApi'

const CODE_LANGUAGES = ['java', 'python', 'javascript', 'typescript', 'html', 'css', 'sql', 'bash', 'text']

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function isSafeUrl(url) {
  return /^(https?:\/\/|mailto:|\/uploads\/)/i.test(url)
}

function renderInlineMarkdown(text) {
  const pattern = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g

  return escapeHtml(text).replace(pattern, (match, imageAlt, imageUrl, linkText, linkUrl, boldText, italicText) => {
    if (imageAlt !== undefined && isSafeUrl(imageUrl)) {
      return `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}">`
    }

    if (linkText !== undefined && isSafeUrl(linkUrl)) {
      return `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noreferrer">${escapeHtml(linkText)}</a>`
    }

    if (boldText !== undefined) {
      return `<strong>${escapeHtml(boldText)}</strong>`
    }

    if (italicText !== undefined) {
      return `<em>${escapeHtml(italicText)}</em>`
    }

    return escapeHtml(match)
  })
}

function markdownToHtml(markdown) {
  const lines = (markdown ?? '').split('\n')
  const htmlParts = []
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

      htmlParts.push(`
        <div class="markdown-code-card" contenteditable="false" data-language="${escapeHtml(language)}" data-code="${escapeHtml(codeLines.join('\n'))}">
          ${language ? `<div class="markdown-code-language">${escapeHtml(language)}</div>` : ''}
          <pre class="markdown-code-block"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>
        </div>
      `)
      index += 1
      continue
    }

    if (line.startsWith('>')) {
      const quoteLines = []

      while (index < lines.length && lines[index].startsWith('>')) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }

      htmlParts.push(`<blockquote>${renderInlineMarkdown(quoteLines.join('\n'))}</blockquote>`)
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

    htmlParts.push(`<p>${renderInlineMarkdown(paragraphLines.join('\n'))}</p>`)
  }

  return htmlParts.join('')
}

function getInlineMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const element = node
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'br') {
    return '\n'
  }

  if (tagName === 'img') {
    return `![${element.getAttribute('alt') || '이미지'}](${element.getAttribute('src') || ''})`
  }

  const childText = Array.from(element.childNodes).map(getInlineMarkdown).join('')

  if (tagName === 'strong' || tagName === 'b') {
    return `**${childText}**`
  }

  if (tagName === 'em' || tagName === 'i') {
    return `*${childText}*`
  }

  if (tagName === 'a') {
    return `[${childText}](${element.getAttribute('href') || ''})`
  }

  return childText
}

function editorHtmlToMarkdown(editor) {
  return Array.from(editor.childNodes)
    .map((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? ''
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return ''
      }

      const element = node

      if (element.classList.contains('markdown-code-card')) {
        const language = element.dataset.language ?? ''
        const code = element.dataset.code ?? element.querySelector('code')?.textContent ?? ''
        return `\`\`\`${language}\n${code}\n\`\`\``
      }

      if (element.tagName.toLowerCase() === 'blockquote') {
        return getInlineMarkdown(element).split('\n').map((line) => `> ${line}`).join('\n')
      }

      return getInlineMarkdown(element)
    })
    .filter((part) => part.trim() !== '')
    .join('\n\n')
}

function getCurrentRange(editor) {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (!editor.contains(range.commonAncestorContainer)) {
    return null
  }

  return range.cloneRange()
}

function getClipboardImageFile(event) {
  const items = Array.from(event.clipboardData?.items ?? [])
  const imageItem = items.find((item) => item.type.startsWith('image/'))

  if (!imageItem) {
    return null
  }

  const file = imageItem.getAsFile()

  if (!file) {
    return null
  }

  if (file.name && file.name.includes('.')) {
    return file
  }

  const extension = file.type.split('/')[1] || 'png'

  return new File([file], `clipboard-image.${extension}`, {
    type: file.type,
  })
}

function MarkdownEditor({ id, value, onChange }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const savedRangeRef = useRef(null)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('java')
  const [codeText, setCodeText] = useState('')

  useEffect(() => {
    const editor = editorRef.current

    if (!editor || editor.dataset.markdownValue === value) {
      return
    }

    editor.innerHTML = markdownToHtml(value)
    editor.dataset.markdownValue = value
  }, [value])

  function syncMarkdown() {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    const nextValue = editorHtmlToMarkdown(editor)
    editor.dataset.markdownValue = nextValue
    onChange(nextValue)
  }

  function focusEditor() {
    editorRef.current?.focus()
  }

  function saveCurrentRange() {
    const editor = editorRef.current
    savedRangeRef.current = editor ? getCurrentRange(editor) : null
  }

  function restoreRange() {
    const selection = window.getSelection()
    const range = savedRangeRef.current

    if (!selection || !range) {
      focusEditor()
      return
    }

    selection.removeAllRanges()
    selection.addRange(range)
  }

  function runInlineCommand(command, valueToApply) {
    restoreRange()
    document.execCommand(command, false, valueToApply)
    syncMarkdown()
    focusEditor()
  }

  function applyLink() {
    const linkUrl = window.prompt('링크 URL을 입력해주세요.')

    if (!linkUrl) {
      return
    }

    runInlineCommand('createLink', linkUrl)
  }

  function insertHtmlBlock(html) {
    restoreRange()
    document.execCommand('insertHTML', false, html)
    syncMarkdown()
  }

  async function insertImageFile(file) {
    setIsUploadingImage(true)

    try {
      const result = await uploadImage(file)
      const imageUrl = result?.data?.imageUrl

      if (!imageUrl) {
        throw new Error('이미지 URL 응답을 확인하지 못했습니다.')
      }

      insertHtmlBlock(`<p><img src="${escapeHtml(imageUrl)}" alt="이미지"></p><p><br></p>`)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  function openCodeModal() {
    saveCurrentRange()
    setCodeText(window.getSelection()?.toString() ?? '')
    setIsCodeModalOpen(true)
  }

  function insertCodeBlock() {
    const trimmedCode = codeText.trim()

    if (trimmedCode === '') {
      window.alert('삽입할 코드를 입력해주세요.')
      return
    }

    insertHtmlBlock(`
      <div class="markdown-code-card" contenteditable="false" data-language="${escapeHtml(codeLanguage)}" data-code="${escapeHtml(trimmedCode)}">
        <div class="markdown-code-language">${escapeHtml(codeLanguage)}</div>
        <pre class="markdown-code-block"><code>${escapeHtml(trimmedCode)}</code></pre>
      </div>
      <p><br></p>
    `)
    setCodeText('')
    setCodeLanguage('java')
    setIsCodeModalOpen(false)
  }

  function openImageFilePicker() {
    saveCurrentRange()
    fileInputRef.current?.click()
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    await insertImageFile(file)
  }

  async function handlePaste(event) {
    const imageFile = getClipboardImageFile(event)

    if (!imageFile) {
      return
    }

    event.preventDefault()
    saveCurrentRange()
    await insertImageFile(imageFile)
  }

  return (
    <>
      <div className="blog-editor">
        <div className="markdown-toolbar" aria-label="본문 서식 도구" onMouseDown={saveCurrentRange}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="markdown-file-input"
            onChange={handleImageChange}
          />
          <button type="button" className="markdown-toolbar-button" onClick={openCodeModal}>코드</button>
          <button
            type="button"
            className="markdown-toolbar-button"
            disabled={isUploadingImage}
            onClick={openImageFilePicker}
          >
            {isUploadingImage ? '업로드' : '이미지'}
          </button>
          <button type="button" className="markdown-toolbar-button" onClick={() => runInlineCommand('bold')}>B</button>
          <button type="button" className="markdown-toolbar-button" onClick={() => runInlineCommand('italic')}>I</button>
          <button type="button" className="markdown-toolbar-button" onClick={applyLink}>링크</button>
        </div>

        <div
          id={id}
          ref={editorRef}
          className="markdown-rich-editor"
          contentEditable
          role="textbox"
          aria-label="내용"
          aria-multiline="true"
          data-placeholder="나누고 싶은 이야기를 적어주세요"
          onInput={syncMarkdown}
          onPaste={handlePaste}
          onKeyUp={saveCurrentRange}
          onMouseUp={saveCurrentRange}
          onFocus={saveCurrentRange}
        ></div>
      </div>

      {isCodeModalOpen && (
        <div className="markdown-modal-backdrop" role="presentation">
          <div className="markdown-modal" role="dialog" aria-modal="true" aria-labelledby="code-modal-title">
            <h3 id="code-modal-title">코드 삽입</h3>

            <label htmlFor="code-language-select">언어</label>
            <select
              id="code-language-select"
              value={codeLanguage}
              onChange={(event) => setCodeLanguage(event.target.value)}
            >
              {CODE_LANGUAGES.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            <label htmlFor="code-content-input">코드</label>
            <textarea
              id="code-content-input"
              value={codeText}
              onChange={(event) => setCodeText(event.target.value)}
              placeholder="코드를 붙여넣어주세요"
            ></textarea>

            <div className="markdown-modal-actions">
              <button type="button" onClick={insertCodeBlock}>삽입</button>
              <button type="button" onClick={() => setIsCodeModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MarkdownEditor
