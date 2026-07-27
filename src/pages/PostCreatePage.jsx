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
      showMessage('Stash할 commit title이나 body를 입력하세요.', 'error')
      return
    }

    try {
      await saveDraft({ title, content })
      showMessage('Stash에 저장했습니다.', 'success')
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
        showMessage('저장된 Stash가 없습니다.', 'error')
        return
      }

      setTitle(draft.title ?? '')
      setContent(draft.content ?? '')
      showMessage('Stash를 불러왔습니다.', 'success')
    } catch (error) {
      showMessage(error.message, 'error')
    }
  }

  return (
    <section id="post-create-section" className="section">
      <form onSubmit={handleCreate}>
        <h2>New Commit</h2>

        <label htmlFor="create-title-input">commit.title</label>
        <input
          id="create-title-input"
          type="text"
          placeholder="commit title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="create-content-input">commit.body</label>
        <textarea
          id="create-content-input"
          placeholder="write your anonymous log"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        ></textarea>

        <div className="button-row">
          <button id="create-post-button" type="submit" disabled={isSubmitting}>
            Deploy
          </button>
          <button id="save-draft-button" type="button" onClick={handleSaveDraft}>
            Stash
          </button>
          <button id="load-draft-button" type="button" onClick={handleLoadDraft}>
            Load Stash
          </button>
          <button id="cancel-create-button" type="button" onClick={() => navigate('list')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostCreatePage
