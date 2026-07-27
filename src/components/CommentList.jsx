import CommentItem from './CommentItem'

function CommentList({ comments = [], onDelete, onUpdate }) {
  if (comments.length === 0) {
    return <div id="comment-list">No thread yet.</div>
  }

  return (
    <div id="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment.commentId}
          comment={comment}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default CommentList
