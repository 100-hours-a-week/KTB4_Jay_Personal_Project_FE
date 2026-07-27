import { useState } from 'react'
import { formatDate } from '../utils/format'

function CommentItem({ comment, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.content ?? '')

  function handleSubmit(event) {
    event.preventDefault()
    onUpdate(comment.commentId, editValue)
    setIsEditing(false)
  }

  return (
    <div
      className={`comment-item${comment.deleted ? ' deleted' : ''}`}
      data-comment-id={comment.commentId}
    >
      <div className="comment-meta">
        {comment.authorNickname ?? 'anonymous'} · {formatDate(comment.createdAt)}
      </div>
      <p>{comment.content}</p>

      {isEditing ? (
        <form className="comment-edit-form" onSubmit={handleSubmit}>
          <input
            className="comment-edit-input"
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="comment-button-row">
          <button className="secondary" type="button" onClick={() => setIsEditing(true)}>
            Amend
          </button>
          <button className="danger" type="button" onClick={() => onDelete(comment.commentId)}>
            Drop
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentItem
