import { useEffect, useState } from 'react'
import { getPostDetail, updatePost } from '../api/postApi'
import { validatePostForm } from '../utils/validation'

function PostEditPage({ navigate, showMessage, requireLogin, currentPostId }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadPost() {
      if (currentPostId === null) {
        showMessage('Amend할 commit이 없습니다.', 'error')
        navigate('list')
        return
      }

      try {
        const result = await getPostDetail(currentPostId)
        const post = result?.data ?? {}
        setTitle(post.title ?? '')
        setContent(post.content ?? '')
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
      showMessage('Amend할 commit이 없습니다.', 'error')
      return
    }

    const errorMessage = validatePostForm({ title, content })

    if (errorMessage) {
      showMessage(errorMessage, 'error')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePost(currentPostId, { title, content })
      navigate('detail', { postId: currentPostId })
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="post-edit-section" className="section">
      <form onSubmit={handleSubmit}>
        <h2>Amend Commit</h2>

        <label htmlFor="edit-title-input">commit.title</label>
        <input
          id="edit-title-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="edit-content-input">commit.body</label>
        <textarea
          id="edit-content-input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        ></textarea>

        <div className="button-row">
          <button id="update-post-button" type="submit" disabled={isSubmitting}>
            Deploy Patch
          </button>
          <button id="cancel-edit-button" type="button" onClick={() => navigate('detail')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default PostEditPage
