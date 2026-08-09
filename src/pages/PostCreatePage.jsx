import { useState } from 'react'
import { uploadImage } from '../api/imageApi'
import { createPost, getDraft, saveDraft } from '../api/postApi'
import MarkdownEditor from '../components/MarkdownEditor'
import { normalizeMarkdownContent } from '../utils/markdown'
import { validatePostForm } from '../utils/validation'

function getPostImageBody(thumbnailUrl) {
  return {
    thumbnailUrl,
    imageUrl: thumbnailUrl,
  }
}

function PostCreatePage({ navigate, showMessage, requireLogin }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(event) {
    event.preventDefault()

    if (!requireLogin()) {
      return
    }

    const normalizedContent = normalizeMarkdownContent(content)
    const errorMessage = validatePostForm({ title, content: normalizedContent })

    if (errorMessage) {
      showMessage(errorMessage, 'error')
      return
    }

    setIsSubmitting(true)

    try {
      await createPost({
        title,
        content: normalizedContent,
        ...getPostImageBody(thumbnailUrl),
      })
      setTitle('')
      setContent('')
      setThumbnailUrl('')
      showMessage('리뷰 요청 글을 등록했습니다.', 'success')
      navigate('list', { page: 0, keepMessage: true })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveDraft() {
    if (!requireLogin()) {
      return
    }

    if (title.trim() === '' && content.trim() === '') {
      showMessage('임시저장할 제목이나 내용을 입력해주세요.', 'error')
      return
    }

    try {
      await saveDraft({ title, content, ...getPostImageBody(thumbnailUrl) })
      showMessage('임시저장했습니다.', 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  async function handleLoadDraft() {
    if (!requireLogin()) {
      return
    }

    try {
      const result = await getDraft()
      const draft = result?.data

      if (!draft) {
        showMessage('저장된 임시글이 없습니다.', 'error')
        return
      }

      setTitle(draft.title ?? '')
      setContent(draft.content ?? '')
      setThumbnailUrl(
        draft.thumbnailUrl ??
        draft.thumbnailImageUrl ??
        draft.imageUrl ??
        draft.representativeImageUrl ??
        draft.mainImageUrl ??
        draft.coverImage ??
        draft.coverImageUrl ??
        draft.postImage ??
        '',
      )
      showMessage('임시글을 불러왔습니다.', 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  async function handleThumbnailChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploadingThumbnail(true)

    try {
      const result = await uploadImage(file)
      const imageUrl = result?.data?.imageUrl

      if (!imageUrl) {
        throw new Error('대표 이미지 URL 응답을 확인하지 못했습니다.')
      }

      setThumbnailUrl(imageUrl)
    } catch (error) {
      window.alert(error.message)
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  return (
    <section id="post-create-section" className="section">
      <form onSubmit={handleCreate}>
        <h2>무엇이든 적어보세요!</h2>

        <label htmlFor="create-title-input">제목</label>
        <input
          id="create-title-input"
          type="text"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="create-thumbnail-input">대표 이미지</label>
        <div className="post-thumbnail-field">
          <div className="post-thumbnail-preview">
            {thumbnailUrl ? <img src={thumbnailUrl} alt="" /> : <span>bamboo</span>}
          </div>
          <div className="post-thumbnail-actions">
            <label className="post-thumbnail-upload-button" htmlFor="create-thumbnail-input">
              {isUploadingThumbnail ? '업로드 중' : '이미지 선택'}
            </label>
            {thumbnailUrl && (
              <button type="button" onClick={() => setThumbnailUrl('')}>
                제거
              </button>
            )}
          </div>
          <input
            id="create-thumbnail-input"
            type="file"
            accept="image/*"
            disabled={isUploadingThumbnail}
            onChange={handleThumbnailChange}
          />
        </div>

        <label htmlFor="create-content-input">내용</label>
        <MarkdownEditor
          id="create-content-input"
          value={content}
          onChange={setContent}
        />

        <div className="button-row">
          <button id="create-post-button" type="submit" disabled={isSubmitting}>
            리뷰 요청하기
          </button>
          <button id="save-draft-button" type="button" onClick={handleSaveDraft}>
            임시저장
          </button>
          <button id="load-draft-button" type="button" onClick={handleLoadDraft}>
            임시글 불러오기
          </button>
          <button id="cancel-create-button" type="button" onClick={() => navigate('list')}>
            취소
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostCreatePage
