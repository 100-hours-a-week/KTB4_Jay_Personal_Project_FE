import { useEffect, useState } from 'react'
import { uploadImage } from '../api/imageApi'
import { getPostDetail, updatePost } from '../api/postApi'
import MarkdownEditor from '../components/MarkdownEditor'
import { normalizeMarkdownContent } from '../utils/markdown'
import { validatePostForm } from '../utils/validation'

function getPostImageBody(thumbnailUrl) {
  return {
    thumbnailUrl,
    imageUrl: thumbnailUrl,
  }
}

function PostEditPage({ navigate, showMessage, requireLogin, currentPostId }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadPost() {
      if (currentPostId === null) {
        showMessage('수정할 게시글이 없습니다.', 'error')
        navigate('list')
        return
      }

      try {
        const result = await getPostDetail(currentPostId)
        const post = result?.data ?? {}
        setTitle(post.title ?? '')
        setContent(post.content ?? '')
        setThumbnailUrl(
          post.thumbnailUrl ??
          post.thumbnailImageUrl ??
          post.imageUrl ??
          post.representativeImageUrl ??
          post.mainImageUrl ??
          post.coverImage ??
          post.coverImageUrl ??
          post.postImage ??
          '',
        )
      } catch (error) {
        showMessage(error.message, 'error')
      }
    }

    loadPost()
  }, [currentPostId, navigate, showMessage])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!requireLogin()) {
      return
    }

    if (currentPostId === null) {
      showMessage('수정할 게시글이 없습니다.', 'error')
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
      await updatePost(currentPostId, {
        title,
        content: normalizedContent,
        ...getPostImageBody(thumbnailUrl),
      })
      showMessage('게시글을 수정했습니다.', 'success')
      navigate('detail', { postId: currentPostId, keepMessage: true })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
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
    <section id="post-edit-section" className="section">
      <form onSubmit={handleSubmit}>
        <h2>게시글 수정</h2>

        <label htmlFor="edit-title-input">제목</label>
        <input
          id="edit-title-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="edit-thumbnail-input">대표 이미지</label>
        <div className="post-thumbnail-field">
          <div className="post-thumbnail-preview">
            {thumbnailUrl ? <img src={thumbnailUrl} alt="" /> : <span>bamboo</span>}
          </div>
          <div className="post-thumbnail-actions">
            <label className="post-thumbnail-upload-button" htmlFor="edit-thumbnail-input">
              {isUploadingThumbnail ? '업로드 중' : '이미지 선택'}
            </label>
            {thumbnailUrl && (
              <button type="button" onClick={() => setThumbnailUrl('')}>
                제거
              </button>
            )}
          </div>
          <input
            id="edit-thumbnail-input"
            type="file"
            accept="image/*"
            disabled={isUploadingThumbnail}
            onChange={handleThumbnailChange}
          />
        </div>

        <label htmlFor="edit-content-input">내용</label>
        <MarkdownEditor
          id="edit-content-input"
          value={content}
          onChange={setContent}
        />

        <div className="button-row">
          <button id="update-post-button" type="submit" disabled={isSubmitting}>
            수정하기
          </button>
          <button id="cancel-edit-button" type="button" onClick={() => navigate('detail')}>
            취소
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostEditPage
