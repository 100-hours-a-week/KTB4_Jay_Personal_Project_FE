import { useState } from 'react'
import { createPost, getDraft, saveDraft } from '../api/postApi'
import { validatePostForm } from '../utils/validation'

function PostCreatePage({ navigate, showMessage, requireLogin }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(event) {
    event.preventDefault()

    if (!requireLogin()) {
      return
    }

    const errorMessage = validatePostForm({ title, content })

    if (errorMessage) {
      showMessage(errorMessage, 'error')
      return
    }

    setIsSubmitting(true)

    try {
      await createPost({ title, content })
      setTitle('')
      setContent('')
      navigate('list', { page: 0 })
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
      await saveDraft({ title, content })
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
      showMessage('임시글을 불러왔습니다.', 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  return (
    <section id="post-create-section" className="section">
      <form onSubmit={handleCreate}>
        <h2>게시글 작성</h2>

        <label htmlFor="create-title-input">제목</label>
        <input
          id="create-title-input"
          type="text"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="create-content-input">내용</label>
        <textarea
          id="create-content-input"
          placeholder="나누고 싶은 이야기를 적어주세요"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        ></textarea>

        <div className="button-row">
          <button id="create-post-button" type="submit" disabled={isSubmitting}>
            게시하기
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
