import { useState } from 'react'
import { formatDate } from '../utils/format'

function CommentItem({ comment, currentUserId, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.content ?? '')
  const isOwner = Number(comment.authorId) === Number(currentUserId)

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
        {comment.authorNickname ?? '익명'} · {formatDate(comment.createdAt)}
      </div>
      <p>{comment.content}</p>

      {isOwner && isEditing ? (
        <form className="comment-edit-form" onSubmit={handleSubmit}>
          <input
            className="comment-edit-input"
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
          />
          <button type="submit">저장</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            취소
          </button>
        </form>
      ) : isOwner ? (
        <div className="comment-button-row">
          <button className="secondary" type="button" onClick={() => setIsEditing(true)}>
            수정
          </button>
          <button className="danger" type="button" onClick={() => onDelete(comment.commentId)}>
            삭제
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default CommentItem
